use std::pin::Pin;

use async_trait::async_trait;
use futures_util::Stream;
use futures_util::StreamExt;
use reqwest::Client;
use serde::Deserialize;
use serde::Serialize;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tracing::warn;

use kodex_core::config::AiProvider as ProviderKind;
use kodex_core::config::ProviderConfig;
use kodex_core::error::AppError;
use kodex_core::types::LLMMessage;

use crate::provider::AiProvider;

pub struct LocalProvider;

pub fn create() -> Box<dyn AiProvider> {
    Box::new(LocalProvider)
}

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<Message>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: MessageContent,
}

#[derive(Deserialize)]
struct MessageContent {
    content: String,
}

#[derive(Deserialize)]
struct StreamChunk {
    choices: Vec<StreamChoice>,
}

#[derive(Deserialize)]
struct StreamChoice {
    delta: Delta,
}

#[derive(Deserialize)]
struct Delta {
    #[serde(default)]
    content: Option<String>,
}

#[derive(Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Deserialize)]
struct OllamaModel {
    name: String,
}

#[async_trait]
impl AiProvider for LocalProvider {
    fn kind(&self) -> ProviderKind {
        ProviderKind::Local
    }

    async fn chat(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<String, AppError> {
        let endpoint = config.endpoint.trim_end_matches('/').to_string();
        let url = format!("{}/chat/completions", endpoint);

        let body = ChatRequest {
            model: config.model.clone(),
            messages: messages
                .into_iter()
                .map(|m| Message {
                    role: m.role.to_string(),
                    content: m.content,
                })
                .collect(),
            stream: None,
            max_tokens: Some(config.max_tokens),
        };

        let client = Client::new();

        let resp = client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                warn!("Local LLM connection refused: {}", e);
                AppError::Internal(format!("Local LLM not available at {}", endpoint))
            })?;

        if !resp.status().is_success() {
            let status = resp.status();
            warn!("Local LLM error: {}", status);
            return Err(AppError::Internal(format!("Local LLM error: {}", status)));
        }

        let data: ChatResponse = resp.json().await.map_err(|e| {
            warn!("Failed to parse Local LLM response: {}", e);
            AppError::Internal("Failed to parse Local LLM response".into())
        })?;

        data.choices
            .into_iter()
            .next()
            .map(|c| c.message.content)
            .ok_or_else(|| AppError::Internal("No choices in Local LLM response".into()))
    }

    async fn chat_stream(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String, AppError>> + Send>>, AppError> {
        let endpoint = config.endpoint.trim_end_matches('/').to_string();
        let url = format!("{}/chat/completions", endpoint);

        let body = ChatRequest {
            model: config.model.clone(),
            messages: messages
                .into_iter()
                .map(|m| Message {
                    role: m.role.to_string(),
                    content: m.content,
                })
                .collect(),
            stream: Some(true),
            max_tokens: Some(config.max_tokens),
        };

        let client = Client::new();

        let response = client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                warn!("Local LLM connection refused: {}", e);
                AppError::Internal(format!("Local LLM not available at {}", endpoint))
            })?;

        if !response.status().is_success() {
            let status = response.status();
            warn!("Local LLM error: {}", status);
            return Err(AppError::Internal(format!("Local LLM error: {}", status)));
        }

        let (tx, rx) = mpsc::channel::<Result<String, AppError>>(32);

        tokio::spawn(async move {
            let mut stream = response.bytes_stream();

            while let Some(chunk_result) = stream.next().await {
                let chunk = match chunk_result {
                    Ok(c) => c,
                    Err(e) => {
                        warn!("Local LLM stream read error: {}", e);
                        let _ = tx.send(Err(AppError::Internal(format!(
                            "Local LLM stream error: {}",
                            e
                        ))))
                        .await;
                        return;
                    }
                };

                let chunk_str = String::from_utf8_lossy(&chunk);
                for line in chunk_str.lines() {
                    let line = line.trim();
                    if line.is_empty() {
                        continue;
                    }
                    if !line.starts_with("data: ") {
                        continue;
                    }
                    let data = &line["data: ".len()..];
                    if data == "[DONE]" {
                        return;
                    }

                    match serde_json::from_str::<StreamChunk>(data) {
                        Ok(parsed) => {
                            if let Some(delta) = parsed.choices.into_iter().next() {
                                if let Some(content) = delta.delta.content {
                                    if !content.is_empty() {
                                        let _ = tx.send(Ok(content)).await;
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            warn!("Failed to parse SSE chunk: {}", e);
                        }
                    }
                }
            }
        });

        Ok(Box::pin(ReceiverStream::new(rx)))
    }
}

pub async fn list_models(endpoint: &str) -> Result<Vec<String>, AppError> {
    let endpoint = endpoint.trim_end_matches('/').to_string();
    let ollama_endpoint = if endpoint.ends_with("/v1") {
        endpoint[..endpoint.len() - 3].to_string()
    } else {
        endpoint.clone()
    };
    let url = format!("{}/api/tags", ollama_endpoint);

    let client = Client::new();
    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| {
            warn!("Failed to connect to Ollama: {}", e);
            AppError::Internal(format!("Local LLM not available at {}", endpoint))
        })?;

    if !resp.status().is_success() {
        let status = resp.status();
        warn!("Ollama models error: {}", status);
        return Err(AppError::Internal(format!("Local LLM error: {}", status)));
    }

    let data: OllamaTagsResponse = resp.json().await.map_err(|e| {
        warn!("Failed to parse Ollama tags response: {}", e);
        AppError::Internal("Failed to parse Ollama tags".into())
    })?;

    let models = data
        .models
        .into_iter()
        .map(|m| {
            m.name
                .strip_suffix(":latest")
                .unwrap_or(&m.name)
                .to_string()
        })
        .collect();

    Ok(models)
}
