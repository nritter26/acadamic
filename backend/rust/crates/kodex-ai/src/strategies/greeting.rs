use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::TutorContext;
use super::TutorStrategy;

pub struct GreetingStrategy;

#[async_trait]
impl TutorStrategy for GreetingStrategy {
    fn name(&self) -> &'static str { "greeting" }
    fn priority(&self) -> u32 { 100 }

    async fn can_handle(&self, context: &TutorContext) -> bool {
        let lower = context.message.trim().to_lowercase();
        lower.starts_with("hi") || lower.starts_with("hello") || lower.starts_with("hey")
            || lower.starts_with("good morning") || lower.starts_with("good evening")
            || lower.starts_with("good afternoon") || lower == "yo" || lower == "sup"
            || lower == "what's up" || lower == "howdy"
    }

    async fn handle(&self, context: &TutorContext) -> Result<String, AppError> {
        let lang_hint = context.lang.as_deref().unwrap_or("programming");
        let topic_hint = context.topic.as_deref().unwrap_or("coding");
        Ok(format!(
            "Hey there! 👋 Ready to learn some {}? I can help you with {} or anything else {} related. What would you like to work on?",
            lang_hint, topic_hint, lang_hint
        ))
    }
}
