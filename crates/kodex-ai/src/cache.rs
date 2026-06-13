use std::num::NonZeroUsize;
use std::time::{Duration, Instant};
use lru::LruCache;
use std::sync::Mutex;
use kodex_core::config::AiProvider;

const DEFAULT_CACHE_SIZE: usize = 256;
const DEFAULT_CACHE_TTL: Duration = Duration::from_secs(300); // 5 minutes

struct CacheEntry {
    response: String,
    expires_at: Instant,
}

/// Thread-safe LRU cache for LLM responses.
pub struct LLMCache {
    cache: Mutex<LruCache<u64, CacheEntry>>,
    ttl: Duration,
}

impl LLMCache {
    /// Create a new cache with default size (256) and TTL (5 min).
    pub fn new() -> Self {
        Self::with_config(DEFAULT_CACHE_SIZE, DEFAULT_CACHE_TTL)
    }

    /// Create a cache with custom size and TTL.
    pub fn with_config(size: usize, ttl: Duration) -> Self {
        let non_zero = NonZeroUsize::new(size).unwrap_or(NonZeroUsize::new(256).unwrap());
        Self {
            cache: Mutex::new(LruCache::new(non_zero)),
            ttl,
        }
    }

    /// Generate a cache key from provider, model, and messages.
    fn make_key(provider: &AiProvider, model: &str, messages_json: &str) -> u64 {
        use std::hash::Hasher;
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        hasher.write(format!("{:?}:{}:{}", provider, model, messages_json).as_bytes());
        hasher.finish()
    }

    /// Get a cached response if available and not expired.
    pub fn get(&self, provider: &AiProvider, model: &str, messages_json: &str) -> Option<String> {
        let key = Self::make_key(provider, model, messages_json);
        let mut cache = self.cache.lock().unwrap();
        
        if let Some(entry) = cache.get(&key) {
            if Instant::now() < entry.expires_at {
                tracing::debug!("LLM cache hit for provider {:?}", provider);
                return Some(entry.response.clone());
            }
            // Expired — remove it
            cache.pop(&key);
        }
        None
    }

    /// Store a response in the cache.
    pub fn set(&self, provider: &AiProvider, model: &str, messages_json: &str, response: String) {
        let key = Self::make_key(provider, model, messages_json);
        let mut cache = self.cache.lock().unwrap();
        
        cache.put(key, CacheEntry {
            response,
            expires_at: Instant::now() + self.ttl,
        });
        
        tracing::debug!("LLM cache set for provider {:?} (size: {})", provider, cache.len());
    }

    /// Check if the request should be cached (skip cache for requests with code snippets).
    pub fn should_cache(messages_json: &str) -> bool {
        // Don't cache requests that contain code (likely unique)
        !messages_json.contains("```") && !messages_json.contains("\\n    ") 
    }

    /// Clear the entire cache.
    pub fn clear(&self) {
        let mut cache = self.cache.lock().unwrap();
        cache.clear();
        tracing::debug!("LLM cache cleared");
    }

    /// Get the current number of cached entries.
    pub fn len(&self) -> usize {
        let cache = self.cache.lock().unwrap();
        cache.len()
    }
}

impl Default for LLMCache {
    fn default() -> Self {
        Self::new()
    }
}
