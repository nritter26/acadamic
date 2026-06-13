pub mod auth;
pub mod chat;
pub mod content;
pub mod execute;
pub mod generation;
pub mod learner;
pub mod progress;
pub mod projects;
pub mod tools;
pub mod tutor;

use std::sync::OnceLock;
use kodex_core::config::AppConfig;
use kodex_sql::connection::DbManager;
use kodex_ai::provider::AiProvider;
use kodex_ai::strategies::{StrategyPipeline, TutorStrategy};
use kodex_ai::conversation::ConversationStore;
use kodex_ai::cache::LLMCache;
use kodex_ai::embeddings::EmbeddingEngine;

/// Global application config, initialized at server startup.
static GLOBAL_CONFIG: OnceLock<AppConfig> = OnceLock::new();
/// Global database manager, initialized at server startup.
static GLOBAL_DB: OnceLock<&'static DbManager> = OnceLock::new();
static GLOBAL_AI_PROVIDER: OnceLock<Box<dyn AiProvider + Send + Sync>> = OnceLock::new();
static GLOBAL_STRATEGY_PIPELINE: OnceLock<StrategyPipeline> = OnceLock::new();
static GLOBAL_CONVERSATION_STORE: OnceLock<ConversationStore> = OnceLock::new();
static GLOBAL_LLM_CACHE: OnceLock<LLMCache> = OnceLock::new();
static GLOBAL_EMBEDDING_ENGINE: OnceLock<EmbeddingEngine> = OnceLock::new();

/// Initialize globals (called once at server startup).
pub async fn init_globals(cfg: AppConfig, db: &'static DbManager) {
    let _ = GLOBAL_CONFIG.set(cfg);
    let _ = GLOBAL_DB.set(db);

    let app_config = config();

    // Initialize AI provider
    let provider = kodex_ai::provider::create_provider(&app_config.ai_provider);
    let _ = GLOBAL_AI_PROVIDER.set(provider);

    // Initialize conversation store
    let conv_store = ConversationStore::new(&app_config.data_dir);
    let _ = GLOBAL_CONVERSATION_STORE.set(conv_store);

    // Initialize cache
    let cache = LLMCache::new();
    let _ = GLOBAL_LLM_CACHE.set(cache);

    // Initialize embedding engine
    let content_path = &app_config.content_dir;
    let mut engine = EmbeddingEngine::new();
    let _ = engine.build_from_content(&content_path).await;
    let _ = GLOBAL_EMBEDDING_ENGINE.set(engine);

    // Build strategy pipeline
    let system_prompt = app_config.system_prompt.clone();
    let provider_config = app_config.openai.clone();
    let llm_provider = kodex_ai::provider::create_provider(&app_config.ai_provider);

    let strategies: Vec<Box<dyn TutorStrategy>> = vec![
        Box::new(kodex_ai::strategies::greeting::GreetingStrategy),
        Box::new(kodex_ai::strategies::error_help::ErrorHelpStrategy),
        Box::new(kodex_ai::strategies::follow_up::FollowUpStrategy),
        Box::new(kodex_ai::strategies::keyword_match::KeywordMatchStrategy),
        Box::new(kodex_ai::strategies::semantic_search::SemanticSearchStrategy::new(
            GLOBAL_EMBEDDING_ENGINE.get().cloned(),
        )),
        Box::new(kodex_ai::strategies::socratic::SocraticStrategy),
        Box::new(kodex_ai::strategies::llm::LLMStrategy::new(
            llm_provider,
            system_prompt,
            provider_config,
        )),
    ];
    let pipeline = StrategyPipeline::new(strategies);
    let _ = GLOBAL_STRATEGY_PIPELINE.set(pipeline);
}

/// Get a reference to the global config.
pub fn config() -> &'static AppConfig {
    GLOBAL_CONFIG.get().expect("AppConfig not initialized")
}

/// Get a reference to the global DB manager.
pub fn db() -> &'static DbManager {
    *GLOBAL_DB.get().expect("DbManager not initialized")
}

pub fn ai_provider() -> &'static (dyn AiProvider + Send + Sync) {
    GLOBAL_AI_PROVIDER.get().expect("AiProvider not initialized").as_ref()
}

pub fn strategy_pipeline() -> &'static StrategyPipeline {
    GLOBAL_STRATEGY_PIPELINE.get().expect("StrategyPipeline not initialized")
}

pub fn conversation_store() -> &'static ConversationStore {
    GLOBAL_CONVERSATION_STORE.get().expect("ConversationStore not initialized")
}

pub fn llm_cache() -> &'static LLMCache {
    GLOBAL_LLM_CACHE.get().expect("LLMCache not initialized")
}

/// Extract Bearer token from Authorization header.
pub fn extract_bearer_token(headers: &axum::http::HeaderMap) -> Option<String> {
    headers
        .get("Authorization")?
        .to_str()
        .ok()?
        .strip_prefix("Bearer ")
        .map(|s| s.to_string())
}
