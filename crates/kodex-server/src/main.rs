use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    Router,
    routing::{get, post},
    response::Json,
    middleware,
    http::Method,
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
use rate_limiter::{RateLimiter, rate_limit_middleware, init_rate_limiter};

mod ollama;
use ollama::{detect_ollama, OllamaProbe};

#[derive(Clone)]
pub struct ServerState {
    pub config: AppConfig,
    pub db: &'static DbManager,
    pub rate_limiter: Arc<RateLimiter>,
    pub ollama_endpoint: Option<Arc<OllamaProbe>>,
    pub ws_manager: Arc<kodex_websocket::WsManager>,
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

    // Initialize kodex-api globals (config, db, ai)
    kodex_api::init_globals(config.clone(), db).await;

    // Initialize WebSocket global manager
    kodex_websocket::init_ws_manager();

    // Auto-detect Ollama (non-blocking, 4s timeout)
    let ollama_endpoint = tokio::select! {
        result = detect_ollama(&config.local.endpoint) => result,
        _ = tokio::time::sleep(std::time::Duration::from_secs(4)) => {
            tracing::warn!("Ollama detection timed out, proceeding without it");
            None
        }
    };

    let rate_limiter = Arc::new(RateLimiter::new());
    init_rate_limiter(rate_limiter.clone());

    // Get WebSocket manager from global
    let ws_manager = kodex_websocket::ws_manager().clone();

    let server_state = ServerState {
        config: config.clone(),
        db,
        rate_limiter: rate_limiter.clone(),
        ollama_endpoint: ollama_endpoint.clone(),
        ws_manager: ws_manager.clone(),
    };

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers(Any);

    let host = config.host.clone();
    let port = config.port;

    // Build the main router with all routes and middleware
    let app = Router::new()
        // ═══════════════════════════════════════
        // System Endpoints (stateful, no auth needed)
        // ═══════════════════════════════════════
        .route("/api/health", get(health_check))
        .route("/api/ollama/status", get(ollama_status))
        .route("/api/tutor/status", get(tutor_status))
        .route("/api/rate-limit/stats", get(rate_limit_stats))
        .route("/api/metrics", get(metrics_handler))
        .route("/api/ws/stats", get(ws_stats))
        .route("/api/openapi.json", get(openapi_handler))
        .route("/api/docs", get(swagger_ui_handler))

        // ═══════════════════════════════════════
        // Auth Routes
        // ═══════════════════════════════════════
        .route("/api/auth/register", post(kodex_api::auth::register))
        .route("/api/auth/login", post(kodex_api::auth::login))
        .route("/api/auth/me", get(kodex_api::auth::me))

        // ═══════════════════════════════════════
        // Execute Routes
        // ═══════════════════════════════════════
        .route("/api/execute", post(kodex_api::execute::execute_code))

        // ═══════════════════════════════════════
        // Chat Routes
        // ═══════════════════════════════════════
        .route("/api/chat", post(kodex_api::chat::chat_handler))

        // ═══════════════════════════════════════
        // Progress Routes
        // ═══════════════════════════════════════
        .route("/api/progress", get(kodex_api::progress::get_progress).post(kodex_api::progress::save_progress))

        // ═══════════════════════════════════════
        // Tutor Routes
        // ═══════════════════════════════════════
        .route("/api/tutor/explain-topic", post(kodex_api::tutor::explain_topic))
        .route("/api/tutor/start-exercise", post(kodex_api::tutor::start_exercise))
        .route("/api/tutor/attempt-exercise", post(kodex_api::tutor::attempt_exercise))

        // ═══════════════════════════════════════
        // Learner Routes
        // ═══════════════════════════════════════
        .route("/api/learner/track", post(kodex_api::learner::track_event))
        .route("/api/learner/state", get(kodex_api::learner::learner_state))
        .route("/api/learner/reviews", get(kodex_api::learner::learner_reviews))
        .route("/api/learner/recommend", get(kodex_api::learner::learner_recommend))
        .route("/api/learner/path", get(kodex_api::learner::learner_path))

        // ═══════════════════════════════════════
        // Content Routes
        // ═══════════════════════════════════════
        .route("/api/courses", get(kodex_api::content::list_courses))
        .route("/api/content", get(kodex_api::content::list_content_files))
        .route("/api/content/projects", get(kodex_api::content::list_all_projects))
        .route("/api/content/projects/{id}", get(kodex_api::content::get_project_content))
        .route("/api/content/{lang}", get(kodex_api::content::get_content).put(kodex_api::content::update_content).delete(kodex_api::content::delete_content))
        .route("/api/content/{lang}/{phase}", get(kodex_api::content::get_phase))

        // ═══════════════════════════════════════
        // Project Routes
        // ═══════════════════════════════════════
        .route("/api/projects", get(kodex_api::projects::list_projects).post(kodex_api::projects::create_project))
        .route("/api/projects/{id}", get(kodex_api::projects::get_project).put(kodex_api::projects::update_project).delete(kodex_api::projects::delete_project))

        // ═══════════════════════════════════════
        // Tool Routes (analyze, review, explain, proxy, benchmark, ollama)
        // ═══════════════════════════════════════
        .route("/api/analyze", post(kodex_api::tools::analyze_code))
        .route("/api/review", post(kodex_api::tools::review_code))
        .route("/api/explain", post(kodex_api::tools::explain_code))
        .route("/api/proxy", post(kodex_api::tools::proxy_request))
        .route("/api/benchmark", get(kodex_api::tools::benchmark))
        .route("/api/ollama/models", get(kodex_api::tools::ollama_models))

        // ═══════════════════════════════════════
        // Generation Routes (exercise, quiz)
        // ═══════════════════════════════════════
        .route("/api/exercise", post(kodex_api::generation::generate_exercise))
        .route("/api/quiz/generate", post(kodex_api::generation::generate_quiz))

        // ═══════════════════════════════════════
        // WebSocket Route
        // ═══════════════════════════════════════
        .route("/ws", get(kodex_websocket::ws_handler))

        // ═══════════════════════════════════════
        // Middleware stack (applied bottom-up)
        // ═══════════════════════════════════════
        .layer(middleware::from_fn_with_state(
            server_state.clone(),
            rate_limit_middleware,
        ))
        .layer(middleware::from_fn_with_state(
            server_state.clone(),
            auth_middleware,
        ))
        .layer(middleware::from_fn(request_logger))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(server_state);

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

// ── System Handlers ──

async fn health_check(
    axum::extract::State(state): axum::extract::State<ServerState>,
) -> Result<Json<HealthResponse>, AppError> {
    let db_status = state.db.get_status();

    let ollama_status = match &state.ollama_endpoint {
        Some(probe) => Some(probe.get_cached_status().await),
        None => None,
    };

    let _ws_stats = state.ws_manager.get_stats().await;

    Ok(Json(HealthResponse {
        status: "ok".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        db: DatabaseStatus::from(db_status),
        ollama: ollama_status,
        config_ok: true,
    }))
}

async fn ollama_status(
    axum::extract::State(state): axum::extract::State<ServerState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let status = match &state.ollama_endpoint {
        Some(probe) => probe.get_cached_status().await,
        None => "not_configured".to_string(),
    };

    Ok(Json(serde_json::json!({
        "status": status,
    })))
}

async fn tutor_status(
    axum::extract::State(state): axum::extract::State<ServerState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let active_provider = &state.config.ai_provider;
    let active_model = match active_provider {
        kodex_core::config::AiProvider::Local => &state.config.local.model,
        kodex_core::config::AiProvider::OpenAI => &state.config.openai.model,
        kodex_core::config::AiProvider::Anthropic => &state.config.anthropic.model,
        kodex_core::config::AiProvider::Gemini => &state.config.gemini.model,
        _ => "gte-small",
    };

    let ollama_status = match &state.ollama_endpoint {
        Some(probe) => probe.get_cached_status().await,
        None => "not_configured".to_string(),
    };

    Ok(Json(serde_json::json!({
        "mode": format!("{:?}", active_provider).to_lowercase(),
        "model": active_model,
        "keywordReady": true,
        "ollama": { "available": ollama_status == "available" },
    })))
}

async fn rate_limit_stats(
    axum::extract::State(state): axum::extract::State<ServerState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let stats = state.rate_limiter.get_stats().await;
    Ok(Json(serde_json::json!(stats)))
}

async fn ws_stats(
    axum::extract::State(state): axum::extract::State<ServerState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let stats = state.ws_manager.get_stats().await;
    Ok(Json(stats))
}

async fn metrics_handler(
    axum::extract::State(state): axum::extract::State<ServerState>,
) -> Result<axum::response::Response, AppError> {
    let db_status = state.db.get_status();
    let ws_stats = state.ws_manager.get_stats().await;
    let rate_info = serde_json::json!({
        "window": "60s",
        "max": 30,
    });

    let lines = format!(
        "# HELP kodex_requests_total Total HTTP requests\n\
         # TYPE kodex_requests_total counter\n\
         kodex_requests_total 0\n\n\
         # HELP kodex_db_sqlite SQLite database available\n\
         # TYPE kodex_db_sqlite gauge\n\
         kodex_db_sqlite {}\n\n\
         # HELP kodex_ws_connections WebSocket connection count\n\
         # TYPE kodex_ws_connections gauge\n\
         kodex_ws_connections {}\n\n\
         # HELP kodex_rate_limit_max Max requests per window\n\
         # TYPE kodex_rate_limit_max gauge\n\
         kodex_rate_limit_max {}\n",
        if db_status.sqlite.available { 1 } else { 0 },
        ws_stats["connected"].as_u64().unwrap_or(0),
        rate_info["max"].as_u64().unwrap_or(30),
    );

    Ok(axum::response::Response::builder()
        .header("Content-Type", "text/plain; charset=utf-8")
        .body(axum::body::Body::from(lines))
        .unwrap())
}

async fn openapi_handler() -> Result<Json<serde_json::Value>, AppError> {
    let spec = serde_json::json!({
        "openapi": "3.0.3",
        "info": {
            "title": "Kodex's Lab API",
            "version": env!("CARGO_PKG_VERSION"),
            "description": "Interactive multi-language programming textbook API — code execution, AI tutor, learner profiles, projects, and more."
        },
        "servers": [{ "url": "", "description": "Same origin" }],
        "paths": {
            "/api/health": {
                "get": { "summary": "Health check", "tags": ["System"], "responses": { "200": { "description": "Server health status" } } }
            },
            "/api/ollama/status": {
                "get": { "summary": "Ollama availability", "tags": ["System"], "responses": { "200": { "description": "Ollama detection status" } } }
            },
            "/api/tutor/status": {
                "get": { "summary": "AI tutor status", "tags": ["AI"], "responses": { "200": { "description": "Current AI provider and model info" } } }
            },
            "/api/metrics": {
                "get": { "summary": "Prometheus metrics", "tags": ["System"], "responses": { "200": { "description": "Prometheus-formatted metrics" } } }
            },
            "/api/ws/stats": {
                "get": { "summary": "WebSocket connection stats", "tags": ["System"], "responses": { "200": { "description": "WebSocket connection counts" } } }
            },
            "/api/execute": {
                "post": { "summary": "Execute code", "tags": ["Execution"], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": {
                    "lang": { "type": "string", "description": "py, js, ts, go, rs, c, cpp, cs, kt, swift, zig, sqlite" },
                    "code": { "type": "string" },
                    "stdin": { "type": "string" }
                }, "required": ["lang", "code"] } } } }, "responses": { "200": { "description": "Execution output" } } }
            },
            "/api/chat": {
                "post": { "summary": "AI tutor chat (SSE streaming)", "tags": ["AI"], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": {
                    "message": { "type": "string" },
                    "lang": { "type": "string" },
                    "topic": { "type": "string" }
                }, "required": ["message"] } } } }, "responses": { "200": { "description": "SSE stream of tutor response" } } }
            },
            "/api/auth/register": {
                "post": { "summary": "Register new user", "tags": ["Auth"], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": {
                    "email": { "type": "string", "format": "email" },
                    "password": { "type": "string", "minLength": 6 },
                    "name": { "type": "string" }
                }, "required": ["email", "password"] } } } }, "responses": { "201": { "description": "User created with JWT token" } } }
            },
            "/api/auth/login": {
                "post": { "summary": "Login", "tags": ["Auth"], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": {
                    "email": { "type": "string", "format": "email" },
                    "password": { "type": "string" }
                }, "required": ["email", "password"] } } } }, "responses": { "200": { "description": "JWT token and user info" } } }
            },
            "/api/progress": {
                "get": { "summary": "Get all progress", "tags": ["Progress"], "responses": { "200": { "description": "Topic completion progress" } } },
                "post": { "summary": "Save progress", "tags": ["Progress"], "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": {
                    "lang": { "type": "string" },
                    "topic": { "type": "string" },
                    "completed": { "type": "boolean" }
                }, "required": ["lang", "topic"] } } } }, "responses": { "200": { "description": "Progress saved" } } }
            }
        },
        "components": {
            "securitySchemes": {
                "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
            }
        }
    });

    Ok(Json(spec))
}

async fn swagger_ui_handler() -> Result<axum::response::Html<String>, AppError> {
    let html = r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Kodex's Lab API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' });
  </script>
</body>
</html>"#.to_string();

    Ok(axum::response::Html(html))
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
