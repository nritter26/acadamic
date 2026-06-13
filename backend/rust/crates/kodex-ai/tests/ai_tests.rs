use kodex_ai::provider::AiProvider;
use kodex_ai::strategies::{StrategyPipeline, TutorStrategy};
use kodex_core::types::{TutorContext, LLMMessage};
use kodex_core::config::ProviderConfig;
use kodex_core::error::AppError;

// Simple mock provider for testing
struct MockProvider;

#[async_trait::async_trait]
impl AiProvider for MockProvider {
    fn kind(&self) -> kodex_core::config::AiProvider {
        kodex_core::config::AiProvider::Keyword
    }

    async fn chat_stream(
        &self,
        _messages: Vec<LLMMessage>,
        _config: &ProviderConfig,
    ) -> Result<std::pin::Pin<Box<dyn futures_util::Stream<Item = Result<String, AppError>> + Send>>, AppError> {
        let stream = futures_util::stream::once(async { Ok("mock response".to_string()) });
        Ok(Box::pin(stream))
    }

    async fn chat(
        &self,
        _messages: Vec<LLMMessage>,
        _config: &ProviderConfig,
    ) -> Result<String, AppError> {
        Ok("mock response".to_string())
    }
}

#[tokio::test]
async fn test_greeting_strategy() {
    let strategy = kodex_ai::strategies::greeting::GreetingStrategy;

    let context = TutorContext {
        message: "Hello!".to_string(),
        q: "Hello!".to_string(),
        lang: None, topic: None, phase: None,
        code: None, output: None, has_error: None,
        history: None, learner_id: None,
        lid: "test".to_string(),
        provider_config: None,
    };

    assert!(strategy.can_handle(&context).await);
    let response = strategy.handle(&context).await.unwrap();
    assert!(response.contains("Hey there"));
}

#[tokio::test]
async fn test_error_help_strategy() {
    let strategy = kodex_ai::strategies::error_help::ErrorHelpStrategy;

    let context = TutorContext {
        message: "I have an error in my code".to_string(),
        q: "I have an error".to_string(),
        lang: None, topic: None, phase: None,
        code: Some("let x = 1".to_string()),
        output: Some("SyntaxError".to_string()),
        has_error: Some(true),
        history: None, learner_id: None,
        lid: "test".to_string(),
        provider_config: None,
    };

    assert!(strategy.can_handle(&context).await);
    let response = strategy.handle(&context).await.unwrap();
    assert!(response.contains("debug"));
}

#[tokio::test]
async fn test_keyword_match_strategy() {
    let strategy = kodex_ai::strategies::keyword_match::KeywordMatchStrategy;

    let contexts = vec![
        ("Thanks for your help!", true),
        ("What is a variable?", true),
        ("Tell me about functions", true),
        ("How do loops work?", true),
        ("What is an array?", true),
        ("qwerty random text", false),
    ];

    for (msg, should_match) in contexts {
        let context = TutorContext {
            message: msg.to_string(),
            q: msg.to_string(),
            lang: None, topic: None, phase: None,
            code: None, output: None, has_error: None,
            history: None, learner_id: None,
            lid: "test".to_string(),
            provider_config: None,
        };
        assert_eq!(strategy.can_handle(&context).await, should_match, "Failed for: {}", msg);
    }
}

#[tokio::test]
async fn test_socratic_strategy() {
    let strategy = kodex_ai::strategies::socratic::SocraticStrategy;

    let context_with_code = TutorContext {
        message: "I can't figure out why my loop doesn't work".to_string(),
        q: "loop question".to_string(),
        code: Some("for i in range(10):".to_string()),
        lang: Some("py".to_string()), topic: None, phase: None,
        output: None, has_error: None, history: None, learner_id: None,
        lid: "test".to_string(), provider_config: None,
    };
    assert!(strategy.can_handle(&context_with_code).await);

    let context_no_code = TutorContext {
        message: "how do I write a function".to_string(),
        q: "function question".to_string(),
        code: None, lang: None, topic: None, phase: None,
        output: None, has_error: None, history: None, learner_id: None,
        lid: "test".to_string(), provider_config: None,
    };
    assert!(!strategy.can_handle(&context_no_code).await);

    let response = strategy.handle(&context_with_code).await.unwrap();
    assert!(response.contains("Great question"));
    assert!(response.contains("guide you"));
}

#[tokio::test]
async fn test_strategy_pipeline() {
    let _mock = MockProvider;
    let _system_prompt = "You are a test tutor.".to_string();
    let _provider_config = ProviderConfig {
        api_key: "".to_string(),
        model: "test".to_string(),
        endpoint: "http://localhost".to_string(),
        max_tokens: 100,
    };

    let strategies: Vec<Box<dyn TutorStrategy>> = vec![
        Box::new(kodex_ai::strategies::greeting::GreetingStrategy),
        Box::new(kodex_ai::strategies::keyword_match::KeywordMatchStrategy),
    ];

    let pipeline = StrategyPipeline::new(strategies);

    // Should match greeting strategy (higher priority)
    let context = TutorContext {
        message: "Hello!".to_string(),
        q: "Hello!".to_string(),
        lang: None, topic: None, phase: None,
        code: None, output: None, has_error: None,
        history: None, learner_id: None,
        lid: "test".to_string(),
        provider_config: None,
    };

    let response = pipeline.execute(&context).await.unwrap();
    assert!(response.contains("Hey there"));
}
