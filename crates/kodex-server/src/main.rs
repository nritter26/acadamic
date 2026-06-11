use std::net::SocketAddr;

use axum::{
    Router,
    routing::get,
    response::Json,
};
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use tracing::info;

use kodex_core::config::AppConfig;
use kodex_core::error::AppError;
use kodex_core::types::{HealthResponse, DatabaseStatus};
use kodex_sql::connection::DbManager;

mod middleware_auth;

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub db: &'static DbManager,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let config = AppConfig::from_env();
    let data_dir = &config.data_dir;

    let db = Box::leak(Box::new(DbManager::new(data_dir)?));

    info!("Server starting on {}:{}", config.host, config.port);

    let state = AppState {
        config,
        db,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health_check))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state);

    let addr: SocketAddr = format!("{}:{}", state.config.host, state.config.port).parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn health_check(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Result<Json<HealthResponse>, AppError> {
    let db_status = state.db.get_status();
    Ok(Json(HealthResponse {
        status: "ok".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        db: DatabaseStatus {
            sqlite: kodex_core::types::DbInitStatus {
                available: db_status.sqlite.available,
                reason: db_status.sqlite.reason,
                error: db_status.sqlite.error,
            },
            pg: kodex_core::types::DbInitStatus {
                available: db_status.pg.available,
                reason: db_status.pg.reason,
                error: db_status.pg.error,
            },
            mysql: kodex_core::types::DbInitStatus {
                available: db_status.mysql.available,
                reason: db_status.mysql.reason,
                error: db_status.mysql.error,
            },
        },
        ollama: None,
        config_ok: true,
    }))
}

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
