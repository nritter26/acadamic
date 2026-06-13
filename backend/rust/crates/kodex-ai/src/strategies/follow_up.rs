use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::TutorContext;
use super::TutorStrategy;

pub struct FollowUpStrategy;

#[async_trait]
impl TutorStrategy for FollowUpStrategy {
    fn name(&self) -> &'static str { "follow_up" }
    fn priority(&self) -> u32 { 300 }

    async fn can_handle(&self, context: &TutorContext) -> bool {
        context.history.as_ref().map_or(false, |h| h.len() >= 2)
    }

    async fn handle(&self, context: &TutorContext) -> Result<String, AppError> {
        Ok(format!(
            "I see we were discussing **{}**. Let me help you go deeper into that.\n\n\
            What specific aspect would you like to explore further?",
            context.topic.as_deref().unwrap_or("programming")
        ))
    }
}
