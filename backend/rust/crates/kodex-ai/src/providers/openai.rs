use std::pin::Pin;

use async_trait::async_trait;
use futures_util::{Stream, StreamExt};
use kodex_core::config::{AiProvider as ProviderKind, ProviderConfig};
use kodex_core::error::AppError;
use kodex_core::types::{LLMMessage, LLMRole};
use reqwest::Client;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

pub struct OpenAIProvider;

impl OpenAIProvider {
    pub fn new() -> Self {
        Self
    }
}

pub fn create() -> Box<dyn super::super::provider::AiProvider> {
    Box::new(OpenAIProvider)
}

#[async_trait]
impl super::super::provider::AiProvider for OpenAIProvider {
    fn kind(&self) -> ProviderKind {
        ProviderKind::OpenAI
    }

    async fn chat(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<String, AppError> {
        if config.api_key.is_empty() {
            return Err(AppError::Internal("OpenAI API key not configured".into()));
        }

        let client = Client::new();
        let url = format!("{}/chat/completions", config.endpoint.trim_end_matches('/'));

        let body = serde_json::json!({
            "model": config.model,
            "messages": messages.iter().map(|m| serde_json::json!({
                "role": match m.role {
                    LLMRole::System => "system",
                    LLMRole::User => "user",
                    LLMRole::Assistant => "assistant",
                },
                "content": m.content,
            })).collect::<Vec<_>>(),
            "max_tokens": config.max_tokens,
        });

        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", config.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("OpenAI request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let body_text = response.text().await.unwrap_or_default();
            return Err(AppError::Internal(format!(
                "OpenAI returned {}: {}",
                status, body_text
            )));
        }

        let parsed: serde_json::Value = response
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("Failed to parse OpenAI response: {}", e)))?;

        let content = parsed["choices"][0]["message"]["content"]
            .as_str()
            .ok_or_else(|| AppError::Internal("OpenAI response missing content".into()))?
            .to_string();

        Ok(content)
    }

    async fn chat_stream(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String, AppError>> + Send>>, AppError> {
        if config.api_key.is_empty() {
            return Err(AppError::Internal("OpenAI API key not configured".into()));
        }

        let client = Client::new();
        let url = format!("{}/chat/completions", config.endpoint.trim_end_matches('/'));

        let body = serde_json::json!({
            "model": config.model,
            "messages": messages.iter().map(|m| serde_json::json!({
                "role": match m.role {
                    LLMRole::System => "system",
                    LLMRole::User => "user",
                    LLMRole::Assistant => "assistant",
                },
                "content": m.content,
            })).collect::<Vec<_>>(),
            "max_tokens": config.max_tokens,
            "stream": true,
        });

        let response = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", config.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("OpenAI request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let body_text = response.text().await.unwrap_or_default();
            return Err(AppError::Internal(format!(
                "OpenAI returned {}: {}",
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
                                if data.trim() == "[DONE]" {
                                    return;
                                }

                                match serde_json::from_str::<serde_json::Value>(data) {
                                    Ok(parsed) => {
                                        if let Some(content) =
                                            parsed["choices"][0]["delta"]["content"].as_str()
                                        {
                                            if tx.send(Ok(content.to_string())).await.is_err() {
                                                return;
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        tracing::warn!("Failed to parse SSE data: {}", e);
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
