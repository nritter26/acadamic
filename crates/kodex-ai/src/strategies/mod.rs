pub mod llm;
pub mod keyword_match;
pub mod semantic_search;
pub mod error_help;
pub mod follow_up;
pub mod greeting;
pub mod socratic;

use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::TutorContext;

#[async_trait]
pub trait TutorStrategy: Send + Sync {
    fn name(&self) -> &'static str;
    fn priority(&self) -> u32;
    async fn can_handle(&self, context: &TutorContext) -> bool;
    async fn handle(&self, context: &TutorContext) -> Result<String, AppError>;
}

pub struct StrategyPipeline {
    strategies: Vec<Box<dyn TutorStrategy>>,
}

impl StrategyPipeline {
    pub fn new(strategies: Vec<Box<dyn TutorStrategy>>) -> Self {
        let mut s = strategies;
        s.sort_by_key(|st| st.priority());
        Self { strategies: s }
    }

    pub async fn execute(&self, context: &TutorContext) -> Result<String, AppError> {
        for strategy in &self.strategies {
            if strategy.can_handle(context).await {
                tracing::debug!("Strategy '{}' handling request", strategy.name());
                return strategy.handle(context).await;
            }
        }
        Ok("I'm not sure how to help with that. Could you try asking in a different way?".to_string())
    }
}
