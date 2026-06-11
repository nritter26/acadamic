use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, OnceLock};
use std::time::Instant;

use axum::{
    extract::Request,
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use tokio::sync::Mutex;

use kodex_core::config::{RATE_MAX, RATE_WINDOW_MS};
use kodex_core::error::ApiError;

static GLOBAL_RATE_LIMITER: OnceLock<Arc<RateLimiter>> = OnceLock::new();

/// Initialize the global rate limiter (called at server startup).
pub fn init_rate_limiter(limiter: Arc<RateLimiter>) {
    let _ = GLOBAL_RATE_LIMITER.set(limiter);
}

fn get_rate_limiter() -> &'static Arc<RateLimiter> {
    GLOBAL_RATE_LIMITER.get().expect("RateLimiter not initialized")
}

#[derive(Debug, Clone)]
struct RateEntry {
    count: u32,
    window_start: Instant,
}

/// In-memory per-IP rate limiter.
///
/// Tracks request counts per IP address within a sliding window.
/// Returns 429 Too Many Requests when the limit is exceeded.
pub struct RateLimiter {
    clients: Arc<Mutex<HashMap<SocketAddr, RateEntry>>>,
    max_requests: u32,
    window_ms: u64,
}

impl RateLimiter {
    pub fn new() -> Self {
        Self {
            clients: Arc::new(Mutex::new(HashMap::new())),
            max_requests: RATE_MAX,
            window_ms: RATE_WINDOW_MS,
        }
    }

    pub async fn check_rate(&self, addr: SocketAddr) -> Result<(), Response> {
        let mut clients = self.clients.lock().await;
        let now = Instant::now();

        let entry = clients.entry(addr).or_insert(RateEntry {
            count: 0,
            window_start: now,
        });

        // Reset window if expired
        if now.duration_since(entry.window_start).as_millis() as u64 >= self.window_ms {
            entry.count = 0;
            entry.window_start = now;
        }

        entry.count += 1;

        if entry.count > self.max_requests {
            return Err((
                axum::http::StatusCode::TOO_MANY_REQUESTS,
                Json(ApiError::new(429, "Rate limit exceeded. Try again later.")),
            )
                .into_response());
        }

        Ok(())
    }

    /// Get current rate limit stats (for health endpoint)
    pub async fn get_stats(&self) -> RateLimitStats {
        let clients = self.clients.lock().await;
        RateLimitStats {
            active_ips: clients.len() as u32,
            max_per_window: self.max_requests,
            window_ms: self.window_ms,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct RateLimitStats {
    pub active_ips: u32,
    pub max_per_window: u32,
    pub window_ms: u64,
}

/// Paths that bypass rate limiting.
const SKIP_PATHS: &[&str] = &["/api/health", "/api/auth/", "/api/rate-limit/stats"];

/// Axum middleware for rate limiting based on peer IP.
pub async fn rate_limit_middleware(
    req: Request,
    next: Next,
) -> Result<Response, Response> {
    let path = req.uri().path();
    if SKIP_PATHS.iter().any(|p| path == *p || path.starts_with(p)) {
        return Ok(next.run(req).await);
    }

    let addr = req
        .extensions()
        .get::<axum::extract::ConnectInfo<SocketAddr>>()
        .map(|c| c.0)
        .unwrap_or_else(|| "127.0.0.1:0".parse().unwrap());

    get_rate_limiter().check_rate(addr).await?;
    Ok(next.run(req).await)
}
