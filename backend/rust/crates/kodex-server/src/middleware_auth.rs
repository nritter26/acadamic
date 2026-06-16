use axum::{
    extract::Request,
    middleware::Next,
    response::{Response, IntoResponse},
    Json,
};
use std::sync::OnceLock;

use kodex_core::auth::verify_token;
use kodex_core::error::ApiError;

static JWT_SECRET: OnceLock<String> = OnceLock::new();

/// Initialize the JWT secret globally (called at server startup).
pub fn init_jwt_secret(secret: String) {
    let _ = JWT_SECRET.set(secret);
}

fn get_jwt_secret() -> &'static str {
    JWT_SECRET.get().map(|s| s.as_str()).unwrap_or("kodex-dev-secret-change-in-production")
}

/// JWT authentication middleware.
///
/// Skips auth for `/api/health` and `/api/auth/*` endpoints.
/// Extracts Bearer token from Authorization header, validates it,
/// and injects the `AuthPayload` into request extensions.
pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, Response> {
    let path = req.uri().path();

    // Skip auth for system/health endpoints, auth routes, WebSocket,
    // and all public GET content/learning routes
    if path == "/api/health"
        || path.starts_with("/api/auth/")
        || path.starts_with("/api/openapi.json")
        || path == "/api/docs"
        || path == "/ws"
        || path == "/api/ollama/status"
        || path == "/api/tutor/status"
        || path == "/api/metrics"
        || path == "/api/ws/stats"
        || path == "/api/rate-limit/stats"
        // Public content, learning & execution routes (no auth needed)
        || path == "/api/courses"
        || path.starts_with("/api/content/")
        || path == "/api/content"
        || path == "/api/progress"
        || path == "/api/benchmark"
        || path == "/api/ollama/models"
        || path == "/api/tutor/recommend"
        || path.starts_with("/api/learner/")
        || path == "/api/execute"
        // Public AI/tutor routes (no auth needed for dev)
        || path == "/api/tutor/explain-topic"
        || path == "/api/tutor/start-exercise"
        || path == "/api/tutor/attempt-exercise"
        || path == "/api/chat"
        || path == "/api/explain"
        || path == "/api/exercise"
        || path == "/api/quiz/generate"
    {
        return Ok(next.run(req).await);
    }

    // Extract Bearer token
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|s| s.to_string());

    let token = match auth_header {
        Some(t) => t,
        None => {
            return Err((
                axum::http::StatusCode::UNAUTHORIZED,
                Json(ApiError::new(401, "Missing Authorization header")),
            )
                .into_response());
        }
    };

    match verify_token(&token, get_jwt_secret()) {
        Ok(payload) => {
            // Inject AuthPayload into request extensions for downstream handlers
            req.extensions_mut().insert(payload);
            Ok(next.run(req).await)
        }
        Err(_) => Err((
            axum::http::StatusCode::UNAUTHORIZED,
            Json(ApiError::new(401, "Invalid or expired token")),
        )
            .into_response()),
    }
}
