use std::pin::Pin;

use async_trait::async_trait;
use futures_util::Stream;
use kodex_core::config::{AiProvider as ProviderKind, ProviderConfig};
use kodex_core::error::AppError;
use kodex_core::types::LLMMessage;

#[async_trait]
pub trait AiProvider: Send + Sync {
    fn kind(&self) -> ProviderKind;

    async fn chat_stream(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String, AppError>> + Send>>, AppError>;

    async fn chat(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<String, AppError>;
}

pub fn create_provider(provider: &ProviderKind) -> Box<dyn AiProvider> {
    match provider {
        ProviderKind::OpenAI => Box::new(crate::providers::openai::OpenAIProvider),
        ProviderKind::Anthropic => Box::new(crate::providers::anthropic::AnthropicProvider),
        ProviderKind::Gemini => Box::new(crate::providers::gemini::GeminiProvider),
        ProviderKind::Local => Box::new(crate::providers::local::LocalProvider),
        ProviderKind::Keyword => Box::new(crate::providers::keyword::KeywordProvider),
        ProviderKind::Hybrid => Box::new(crate::providers::openai::OpenAIProvider),
    }
}
