use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
};

pub async fn auth_middleware(
    req: Request,
    next: Next,
) -> Result<Response, axum::response::Response> {
    let path = req.uri().path();

    // Skip auth for health endpoint and auth routes
    if path == "/api/health" || path.starts_with("/api/auth/") {
        return Ok(next.run(req).await);
    }

    // Extract Bearer token
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|s| s.to_string());

    // TODO: Implement proper JWT validation
    // For now, pass through with a placeholder user_id in extensions
    if let Some(_token) = auth_header {
        // validate and set user_id
    }

    Ok(next.run(req).await)
}
