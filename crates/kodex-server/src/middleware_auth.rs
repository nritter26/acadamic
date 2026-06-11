use axum::{
    extract::Request,
    middleware::Next,
    response::{Response, IntoResponse},
    Json,
};
use kodex_core::auth::verify_token;
use kodex_core::error::ApiError;

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

    // Skip auth for health endpoint and auth routes
    if path == "/api/health"
        || path.starts_with("/api/auth/")
        || path.starts_with("/api/openapi.json")
        || path == "/api/docs"
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

    // Secret is stored in app state — need to extract from extensions
    // or use a global. For now, use the default secret.
    // In production, the secret should be injected via app state.
    let secret = "kodex-dev-secret-change-in-production";

    match verify_token(&token, secret) {
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
