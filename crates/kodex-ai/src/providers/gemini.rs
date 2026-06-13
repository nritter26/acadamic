use std::pin::Pin;

use async_trait::async_trait;
use futures_util::{Stream, StreamExt};
use kodex_core::config::{AiProvider as ProviderKind, ProviderConfig};
use kodex_core::error::AppError;
use kodex_core::types::{LLMMessage, LLMRole};
use reqwest::Client;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

pub struct GeminiProvider;

impl GeminiProvider {
    pub fn new() -> Self {
        Self
    }
}

pub fn create() -> Box<dyn super::super::provider::AiProvider> {
    Box::new(GeminiProvider)
}

#[async_trait]
impl super::super::provider::AiProvider for GeminiProvider {
    fn kind(&self) -> ProviderKind {
        ProviderKind::Gemini
    }

    async fn chat(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<String, AppError> {
        if config.api_key.is_empty() {
            return Err(AppError::Internal("Gemini API key not configured".into()));
        }

        let client = Client::new();
        let base_url = config.endpoint.trim_end_matches('/');
        let url = format!(
            "{}/models/{}:generateContent?key={}",
            base_url, config.model, config.api_key
        );

        let (system_instruction, contents) = build_gemini_payload(&messages);

        let mut body = serde_json::json!({
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": config.max_tokens,
            },
        });

        if let Some(si) = system_instruction {
            body["systemInstruction"] = serde_json::json!({
                "parts": [{"text": si}]
            });
        }

        let response = client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Gemini request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let body_text = response.text().await.unwrap_or_default();
            return Err(AppError::Internal(format!(
                "Gemini returned {}: {}",
                status, body_text
            )));
        }

        let parsed: serde_json::Value = response
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("Failed to parse Gemini response: {}", e)))?;

        let content = parsed["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .ok_or_else(|| AppError::Internal("Gemini response missing content".into()))?
            .to_string();

        Ok(content)
    }

    async fn chat_stream(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String, AppError>> + Send>>, AppError> {
        if config.api_key.is_empty() {
            return Err(AppError::Internal("Gemini API key not configured".into()));
        }

        let client = Client::new();
        let base_url = config.endpoint.trim_end_matches('/');
        let url = format!(
            "{}/models/{}:streamGenerateContent?alt=sse&key={}",
            base_url, config.model, config.api_key
        );

        let (system_instruction, contents) = build_gemini_payload(&messages);

        let mut body = serde_json::json!({
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": config.max_tokens,
            },
        });

        if let Some(si) = system_instruction {
            body["systemInstruction"] = serde_json::json!({
                "parts": [{"text": si}]
            });
        }

        let response = client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Gemini request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let body_text = response.text().await.unwrap_or_default();
            return Err(AppError::Internal(format!(
                "Gemini returned {}: {}",
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
                                if data.trim().is_empty() {
                                    continue;
                                }

                                match serde_json::from_str::<serde_json::Value>(data) {
                                    Ok(parsed) => {
                                        let candidates = &parsed["candidates"];
                                        if candidates.as_array().map_or(true, |c| c.is_empty()) {
                                            return;
                                        }

                                        if let Some(content) =
                                            parsed["candidates"][0]["content"]["parts"][0]["text"]
                                                .as_str()
                                        {
                                            if tx.send(Ok(content.to_string())).await.is_err() {
                                                return;
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        tracing::warn!("Failed to parse Gemini SSE data: {}", e);
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

fn build_gemini_payload(messages: &[LLMMessage]) -> (Option<String>, Vec<serde_json::Value>) {
    let mut system_instruction = None;
    let mut contents = Vec::new();

    for msg in messages {
        match msg.role {
            LLMRole::System => {
                system_instruction = Some(msg.content.clone());
            }
            LLMRole::User => {
                contents.push(serde_json::json!({
                    "role": "user",
                    "parts": [{"text": msg.content}]
                }));
            }
            LLMRole::Assistant => {
                contents.push(serde_json::json!({
                    "role": "model",
                    "parts": [{"text": msg.content}]
                }));
            }
        }
    }

    (system_instruction, contents)
}
