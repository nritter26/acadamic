use std::pin::Pin;

use async_trait::async_trait;
use futures_util::{Stream, StreamExt};
use kodex_core::config::{AiProvider as ProviderKind, ProviderConfig};
use kodex_core::error::AppError;
use kodex_core::types::{LLMMessage, LLMRole};
use reqwest::Client;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

pub struct AnthropicProvider;

impl AnthropicProvider {
    pub fn new() -> Self {
        Self
    }
}

pub fn create() -> Box<dyn super::super::provider::AiProvider> {
    Box::new(AnthropicProvider)
}

#[async_trait]
impl super::super::provider::AiProvider for AnthropicProvider {
    fn kind(&self) -> ProviderKind {
        ProviderKind::Anthropic
    }

    async fn chat(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<String, AppError> {
        if config.api_key.is_empty() {
            return Err(AppError::Internal("Anthropic API key not configured".into()));
        }

        let client = Client::new();
        let url = format!("{}/messages", config.endpoint.trim_end_matches('/'));

        let (system_prompt, api_messages): (Option<String>, Vec<serde_json::Value>) = {
            let mut system = None;
            let mut msgs = Vec::new();
            for m in messages {
                match m.role {
                    LLMRole::System => system = Some(m.content),
                    LLMRole::User => msgs.push(serde_json::json!({
                        "role": "user",
                        "content": m.content,
                    })),
                    LLMRole::Assistant => msgs.push(serde_json::json!({
                        "role": "assistant",
                        "content": m.content,
                    })),
                }
            }
            (system, msgs)
        };

        let mut body = serde_json::json!({
            "model": config.model,
            "messages": api_messages,
            "max_tokens": config.max_tokens,
        });

        if let Some(system) = system_prompt {
            body["system"] = serde_json::Value::String(system);
        }

        let response = client
            .post(&url)
            .header("x-api-key", &config.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Anthropic request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let body_text = response.text().await.unwrap_or_default();
            tracing::warn!("Anthropic returned {}: {}", status, body_text);
            return Err(AppError::Internal(format!(
                "Anthropic returned {}: {}",
                status, body_text
            )));
        }

        let parsed: serde_json::Value = response
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("Failed to parse Anthropic response: {}", e)))?;

        let content = parsed["content"][0]["text"]
            .as_str()
            .ok_or_else(|| AppError::Internal("Anthropic response missing content".into()))?
            .to_string();

        Ok(content)
    }

    async fn chat_stream(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String, AppError>> + Send>>, AppError> {
        if config.api_key.is_empty() {
            return Err(AppError::Internal("Anthropic API key not configured".into()));
        }

        let client = Client::new();
        let url = format!("{}/messages", config.endpoint.trim_end_matches('/'));

        let (system_prompt, api_messages): (Option<String>, Vec<serde_json::Value>) = {
            let mut system = None;
            let mut msgs = Vec::new();
            for m in messages {
                match m.role {
                    LLMRole::System => system = Some(m.content),
                    LLMRole::User => msgs.push(serde_json::json!({
                        "role": "user",
                        "content": m.content,
                    })),
                    LLMRole::Assistant => msgs.push(serde_json::json!({
                        "role": "assistant",
                        "content": m.content,
                    })),
                }
            }
            (system, msgs)
        };

        let mut body = serde_json::json!({
            "model": config.model,
            "messages": api_messages,
            "max_tokens": config.max_tokens,
            "stream": true,
        });

        if let Some(system) = system_prompt {
            body["system"] = serde_json::Value::String(system);
        }

        let response = client
            .post(&url)
            .header("x-api-key", &config.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Anthropic request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let body_text = response.text().await.unwrap_or_default();
            tracing::warn!("Anthropic returned {}: {}", status, body_text);
            return Err(AppError::Internal(format!(
                "Anthropic returned {}: {}",
                status, body_text
            )));
        }

        let (tx, rx) = mpsc::channel::<Result<String, AppError>>(32);

        tokio::spawn(async move {
            let mut byte_stream = response.bytes_stream();
            let mut buffer = String::new();

            while let Some(chunk_result) = byte_stream.next().await {
                match chunk_result {
                    Ok(bytes) => {
                        buffer.push_str(&String::from_utf8_lossy(&bytes));

                        while let Some(line_end) = buffer.find('\n') {
                            let line = buffer[..line_end].trim().to_string();
                            buffer = buffer[line_end + 1..].to_string();

                            if line.is_empty() {
                                continue;
                            }

                            if let Some(data) = line.strip_prefix("data: ") {
                                match serde_json::from_str::<serde_json::Value>(data) {
                                    Ok(parsed) => {
                                        match parsed["type"].as_str() {
                                            Some("content_block_delta") => {
                                                if let Some(text) =
                                                    parsed["delta"]["text"].as_str()
                                                {
                                                    if tx.send(Ok(text.to_string())).await.is_err()
                                                    {
                                                        return;
                                                    }
                                                }
                                            }
                                            Some("message_stop") => return,
                                            _ => {}
                                        }
                                    }
                                    Err(e) => {
                                        tracing::warn!(
                                            "Failed to parse Anthropic SSE data: {}",
                                            e
                                        );
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        let _ = tx
                            .send(Err(AppError::Internal(format!("Stream error: {}", e))))
                            .await;
                        return;
                    }
                }
            }
        });

        Ok(Box::pin(ReceiverStream::new(rx)))
    }
}
