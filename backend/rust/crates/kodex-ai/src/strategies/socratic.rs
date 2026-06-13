use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::TutorContext;
use super::TutorStrategy;

pub struct SocraticStrategy;

#[async_trait]
impl TutorStrategy for SocraticStrategy {
    fn name(&self) -> &'static str { "socratic" }
    fn priority(&self) -> u32 { 600 }

    async fn can_handle(&self, context: &TutorContext) -> bool {
        let msg = context.message.to_lowercase();
        let has_code = context.code.as_deref().map(|c| !c.is_empty()).unwrap_or(false);

        (msg.starts_with("how") || msg.starts_with("why") || msg.contains("how do")
            || msg.contains("can't figure out") || msg.contains("stuck")
            || msg.contains("help me understand") || msg.contains("explain why"))
            && has_code
    }

    async fn handle(&self, context: &TutorContext) -> Result<String, AppError> {
        let topic = context.topic.as_deref().unwrap_or("this problem");

        Ok(format!(
            "Great question about **{}**! Let me guide you to the answer with some questions:\n\n\
            1. What do you expect this code to do?\n\
            2. What is actually happening instead?\n\
            3. Can you break down the problem into smaller steps?\n\
            4. What have you already tried?\n\n\
            Take a moment to think about each question. Sometimes the answer becomes clear \
            when you look at the problem from a different angle. What are your thoughts?",
            topic
        ))
    }
}
