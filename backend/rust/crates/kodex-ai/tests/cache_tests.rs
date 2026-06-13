use std::time::Duration;
use kodex_ai::cache::LLMCache;
use kodex_core::config::AiProvider;

#[test]
fn test_cache_set_and_get() {
    let cache = LLMCache::with_config(10, Duration::from_secs(60));
    assert_eq!(cache.len(), 0);
    cache.set(&AiProvider::Keyword, "test-model", "[{\"role\":\"user\"}]", "hello".to_string());
    assert_eq!(cache.len(), 1);
    let result = cache.get(&AiProvider::Keyword, "test-model", "[{\"role\":\"user\"}]");
    assert_eq!(result, Some("hello".to_string()));
}

#[test]
fn test_cache_miss() {
    let cache = LLMCache::with_config(10, Duration::from_secs(60));
    let result = cache.get(&AiProvider::OpenAI, "gpt-4", "[{\"role\":\"user\"}]");
    assert_eq!(result, None);
}

#[test]
fn test_cache_expiry() {
    let cache = LLMCache::with_config(10, Duration::from_millis(10));
    cache.set(&AiProvider::Keyword, "m", "[{}]", "data".to_string());
    assert_eq!(cache.len(), 1);
    std::thread::sleep(Duration::from_millis(50));
    let result = cache.get(&AiProvider::Keyword, "m", "[{}]");
    assert_eq!(result, None, "entry should have expired");
    assert_eq!(cache.len(), 0, "expired entry should be removed");
}

#[test]
fn test_cache_clear() {
    let cache = LLMCache::with_config(10, Duration::from_secs(60));
    cache.set(&AiProvider::Keyword, "m", "[{}]", "a".to_string());
    cache.set(&AiProvider::OpenAI, "m", "[{}]", "b".to_string());
    assert_eq!(cache.len(), 2);
    cache.clear();
    assert_eq!(cache.len(), 0);
}

#[test]
fn test_cache_lru_eviction() {
    let cache = LLMCache::with_config(2, Duration::from_secs(60));
    cache.set(&AiProvider::Keyword, "m", "[1]", "a".to_string());
    cache.set(&AiProvider::Keyword, "m", "[2]", "b".to_string());
    cache.set(&AiProvider::Keyword, "m", "[3]", "c".to_string());
    assert_eq!(cache.len(), 2);
    assert!(cache.get(&AiProvider::Keyword, "m", "[1]").is_none(), "oldest should be evicted");
    assert!(cache.get(&AiProvider::Keyword, "m", "[3]").is_some());
}

#[test]
fn test_should_cache_without_code() {
    assert!(LLMCache::should_cache("{\"role\":\"user\",\"content\":\"hello\"}"));
}

#[test]
fn test_should_cache_with_code_block() {
    assert!(!LLMCache::should_cache("{\"role\":\"user\",\"content\":\"```rust\\nfn main() {}\"}}"));
}

#[test]
fn test_cache_different_providers() {
    let cache = LLMCache::with_config(10, Duration::from_secs(60));
    cache.set(&AiProvider::OpenAI, "gpt-4", "[{}]", "openai-response".to_string());
    cache.set(&AiProvider::Anthropic, "claude-3", "[{}]", "anthropic-response".to_string());
    let r1 = cache.get(&AiProvider::OpenAI, "gpt-4", "[{}]");
    let r2 = cache.get(&AiProvider::Anthropic, "claude-3", "[{}]");
    assert_eq!(r1, Some("openai-response".to_string()));
    assert_eq!(r2, Some("anthropic-response".to_string()));
}

#[test]
fn test_cache_different_models() {
    let cache = LLMCache::with_config(10, Duration::from_secs(60));
    cache.set(&AiProvider::OpenAI, "gpt-4", "[{}]", "gpt4".to_string());
    cache.set(&AiProvider::OpenAI, "gpt-3.5", "[{}]", "gpt35".to_string());
    assert_eq!(cache.get(&AiProvider::OpenAI, "gpt-4", "[{}]"), Some("gpt4".to_string()));
    assert_eq!(cache.get(&AiProvider::OpenAI, "gpt-3.5", "[{}]"), Some("gpt35".to_string()));
}

#[test]
fn test_cache_len() {
    let cache = LLMCache::new();
    assert_eq!(cache.len(), 0);
    cache.set(&AiProvider::Keyword, "m", "[1]", "a".to_string());
    assert_eq!(cache.len(), 1);
    cache.set(&AiProvider::Keyword, "m", "[2]", "b".to_string());
    assert_eq!(cache.len(), 2);
}
