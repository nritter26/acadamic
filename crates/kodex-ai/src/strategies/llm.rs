use std::sync::Arc;
use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::{TutorContext, LLMMessage, LLMRole};
use kodex_core::config::ProviderConfig;
use crate::provider::AiProvider;
use super::TutorStrategy;

pub struct LLMStrategy {
    provider: Arc<Box<dyn AiProvider>>,
    system_prompt: String,
    provider_config: ProviderConfig,
}

impl LLMStrategy {
    pub fn new(
        provider: Box<dyn AiProvider>,
        system_prompt: String,
        provider_config: ProviderConfig,
    ) -> Self {
        Self {
            provider: Arc::new(provider),
            system_prompt,
            provider_config,
        }
    }
}

#[async_trait]
impl TutorStrategy for LLMStrategy {
    fn name(&self) -> &'static str { "llm" }
    fn priority(&self) -> u32 { 700 }

    async fn can_handle(&self, _context: &TutorContext) -> bool {
        true
    }

    async fn handle(&self, context: &TutorContext) -> Result<String, AppError> {
        let mut messages = Vec::new();

        messages.push(LLMMessage {
            role: LLMRole::System,
            content: self.system_prompt.clone(),
        });

        if let Some(history) = &context.history {
            for entry in history.iter().rev().take(10) {
                messages.push(LLMMessage {
                    role: match entry.role.as_str() {
                        "user" => LLMRole::User,
                        "assistant" => LLMRole::Assistant,
                        _ => LLMRole::User,
                    },
                    content: entry.text.clone(),
                });
            }
        }

        let context_info = build_context_string(context);
        if !context_info.is_empty() {
            messages.push(LLMMessage {
                role: LLMRole::System,
                content: context_info,
            });
        }

        messages.push(LLMMessage {
            role: LLMRole::User,
            content: context.message.clone(),
        });

        let provider_config = if let Some(override_config) = &context.provider_config {
            ProviderConfig {
                api_key: override_config.api_key.clone().unwrap_or_else(|| self.provider_config.api_key.clone()),
                model: override_config.model.clone().unwrap_or_else(|| self.provider_config.model.clone()),
                endpoint: override_config.endpoint.clone().unwrap_or_else(|| self.provider_config.endpoint.clone()),
                max_tokens: self.provider_config.max_tokens,
            }
        } else {
            self.provider_config.clone()
        };

        self.provider.chat(messages, &provider_config).await
    }
}

fn build_context_string(context: &TutorContext) -> String {
    let mut parts = Vec::new();
    if let Some(lang) = &context.lang {
        parts.push(format!("The learner is studying: {}", lang));
    }
    if let Some(phase) = &context.phase {
        parts.push(format!("Current phase: {}", phase));
    }
    if let Some(topic) = &context.topic {
        parts.push(format!("Current topic: {}", topic));
    }
    if let Some(code) = &context.code {
        if !code.is_empty() {
            parts.push(format!("The learner's code:\n```\n{}\n```", code));
        }
    }
    if let Some(output) = &context.output {
        if !output.is_empty() {
            parts.push(format!("Code output:\n```\n{}\n```", output));
        }
    }
    parts.join("\n")
}
