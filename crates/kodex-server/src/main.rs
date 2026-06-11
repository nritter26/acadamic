use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    Router,
    routing::get,
    response::Json,
    middleware,
};
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use tracing::info;

use kodex_core::config::AppConfig;
use kodex_core::error::AppError;
use kodex_core::types::{HealthResponse, DatabaseStatus};

use kodex_sql::connection::DbManager;

mod middleware_auth;
use middleware_auth::{auth_middleware, init_jwt_secret};

mod rate_limiter;
use rate_limiter::{RateLimiter, RateLimitStats, rate_limit_middleware};

mod ollama;
use ollama::{detect_ollama, OllamaProbe};

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub db: &'static DbManager,
    pub rate_limiter: Arc<RateLimiter>,
    pub ollama_endpoint: Option<Arc<OllamaProbe>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let config = AppConfig::from_env();
    let data_dir = config.data_dir.clone();

    let db = Box::leak(Box::new(DbManager::new(&data_dir)?));

    info!("Server starting on {}:{}", config.host, config.port);

    // Initialize global JWT secret
    init_jwt_secret(config.jwt_secret.clone());

    // Auto-detect Ollama (non-blocking, 4s timeout)
    let ollama_endpoint = tokio::select! {
        result = detect_ollama(&config.local.endpoint) => result,
        _ = tokio::time::sleep(std::time::Duration::from_secs(4)) => {
            tracing::warn!("Ollama detection timed out, proceeding without it");
            None
        }
    };

    let rate_limiter = Arc::new(RateLimiter::new());

    let state = AppState {
        config,
        db,
        rate_limiter: rate_limiter.clone(),
        ollama_endpoint,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let host = state.config.host.clone();
    let port = state.config.port;

    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/ollama/status", get(ollama_status))
        .route("/api/rate-limit/stats", get(rate_limit_stats))
        .layer(middleware::from_fn(rate_limit_middleware))
        .layer(middleware::from_fn(auth_middleware))
        .layer(middleware::from_fn(request_logger))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state);

    let addr: SocketAddr = format!("{}:{}", host, port).parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;

    info!("Listening on {}", addr);

    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

// ── Middleware ──

async fn request_logger(
    req: axum::extract::Request,
    next: middleware::Next,
) -> Result<axum::response::Response, axum::response::Response> {
    let start = std::time::Instant::now();
    let method = req.method().clone();
    let uri = req.uri().to_string();
    let response = next.run(req).await;
    let duration = start.elapsed();
    let status = response.status();
    tracing::info!("{} {} -> {} ({:?})", method, uri, status, duration);
    Ok(response)
}

// ── Handlers ──

async fn health_check(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Result<Json<HealthResponse>, AppError> {
    let db_status = state.db.get_status();

    let ollama_status = match &state.ollama_endpoint {
        Some(probe) => Some(probe.get_cached_status().await),
        None => None,
    };

    Ok(Json(HealthResponse {
        status: "ok".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        db: DatabaseStatus::from(db_status),
        ollama: ollama_status,
        config_ok: true,
    }))
}

async fn ollama_status(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let status = match &state.ollama_endpoint {
        Some(probe) => probe.get_cached_status().await,
        None => "not_configured".to_string(),
    };

    Ok(Json(serde_json::json!({
        "status": status,
    })))
}

async fn rate_limit_stats(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Result<Json<RateLimitStats>, AppError> {
    let stats = state.rate_limiter.get_stats().await;
    Ok(Json(stats))
}

// ── Shutdown ──

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
