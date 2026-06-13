use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::TutorContext;
use crate::embeddings::EmbeddingEngine;
use super::TutorStrategy;

pub struct SemanticSearchStrategy {
    engine: Option<EmbeddingEngine>,
}

impl SemanticSearchStrategy {
    pub fn new(engine: Option<EmbeddingEngine>) -> Self {
        Self { engine }
    }
}

#[async_trait]
impl TutorStrategy for SemanticSearchStrategy {
    fn name(&self) -> &'static str { "semantic_search" }
    fn priority(&self) -> u32 { 500 }

    async fn can_handle(&self, _context: &TutorContext) -> bool {
        self.engine.is_some()
    }

    async fn handle(&self, context: &TutorContext) -> Result<String, AppError> {
        let engine = match &self.engine {
            Some(e) => e,
            None => return Ok("Semantic search is not available right now.".to_string()),
        };

        let query = if let Some(topic) = &context.topic {
            format!("{} {}", topic, context.message)
        } else {
            context.message.clone()
        };

        let results = engine.search(&query, 3);

        if results.is_empty() {
            return Ok(format!(
                "I couldn't find specific curriculum content matching your question about **{}**. \
                Let me try a different approach to help you out.",
                context.topic.as_deref().unwrap_or("this topic")
            ));
        }

        let topics: Vec<String> = results.iter()
            .map(|(name, score)| format!("- **{}** (relevance: {:.2})", name, score))
            .collect();

        Ok(format!(
            "I found relevant content in our curriculum:\n\n{}\n\nWould you like me to explain any of these topics in detail?",
            topics.join("\n")
        ))
    }
}
