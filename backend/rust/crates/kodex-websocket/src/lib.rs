use std::sync::Arc;
use std::collections::HashMap;
use std::sync::OnceLock;

use axum::{
    Router,
    routing::get,
    extract::ws::{WebSocket, WebSocketUpgrade, Message},
    response::IntoResponse,
};
use tokio::sync::RwLock;
use tracing::{info, warn};
use kodex_core::types::TutorContext;

#[derive(Debug, Clone)]
pub struct WsClient {
    pub id: String,
    pub user_id: Option<String>,
    pub subscribed_project: Option<String>,
}

#[derive(Clone)]
pub struct WsManager {
    clients: Arc<RwLock<HashMap<String, WsClient>>>,
    connection_count: Arc<RwLock<usize>>,
    authenticated_count: Arc<RwLock<usize>>,
}

static GLOBAL_WS_MANAGER: OnceLock<Arc<WsManager>> = OnceLock::new();

pub fn init_ws_manager() {
    let _ = GLOBAL_WS_MANAGER.set(Arc::new(WsManager::new()));
}

pub fn ws_manager() -> &'static Arc<WsManager> {
    GLOBAL_WS_MANAGER.get().expect("WsManager not initialized")
}

impl WsManager {
    pub fn new() -> Self {
        Self {
            clients: Arc::new(RwLock::new(HashMap::new())),
            connection_count: Arc::new(RwLock::new(0)),
            authenticated_count: Arc::new(RwLock::new(0)),
        }
    }

    pub fn new_arc() -> Arc<Self> {
        Arc::new(Self::new())
    }

    pub async fn add_client(&self, id: String, user_id: Option<String>) {
        let mut clients = self.clients.write().await;
        let mut count = self.connection_count.write().await;
        clients.insert(id.clone(), WsClient { id, user_id: user_id.clone(), subscribed_project: None });
        *count += 1;
        if user_id.is_some() {
            let mut auth = self.authenticated_count.write().await;
            *auth += 1;
        }
    }

    pub async fn remove_client(&self, id: &str) {
        let mut clients = self.clients.write().await;
        let mut count = self.connection_count.write().await;
        if let Some(client) = clients.remove(id) {
            *count = count.saturating_sub(1);
            if client.user_id.is_some() {
                let mut auth = self.authenticated_count.write().await;
                *auth = auth.saturating_sub(1);
            }
        }
    }

    pub async fn get_stats(&self) -> serde_json::Value {
        let count = *self.connection_count.read().await;
        let auth = *self.authenticated_count.read().await;
        serde_json::json!({ "connected": count, "authenticated": auth })
    }
}

pub fn ws_handler_route() -> Router {
    Router::new().route("/ws", get(ws_handler))
}

pub async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    let manager = ws_manager();
    let addr = fast_random_id();
    let client_id = format!("{:x}", addr);
    info!("WebSocket connected: {}", client_id);

    manager.add_client(client_id.clone(), None).await;

    let welcome = serde_json::json!({"type": "connected", "clientId": client_id, "authenticated": false});
    if socket.send(Message::Text(welcome.to_string().into())).await.is_err() {
        manager.remove_client(&client_id).await;
        return;
    }

    while let Some(msg) = socket.recv().await {
        match msg {
            Ok(Message::Text(text)) => {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(text.as_str()) {
                    let msg_type = parsed["type"].as_str().unwrap_or("unknown").to_string();
                    match msg_type.as_str() {
                        "ping" => { let _ = socket.send(Message::Text(serde_json::json!({"type": "pong"}).to_string().into())).await; }
                        "chat" => {
                            let text = parsed["message"].as_str().unwrap_or("").to_string();
                            let context = TutorContext {
                                message: text.clone(),
                                q: text.clone(),
                                lang: parsed["lang"].as_str().map(|s| s.to_string()),
                                topic: parsed["topic"].as_str().map(|s| s.to_string()),
                                phase: None,
                                code: parsed["code"].as_str().map(|s| s.to_string()),
                                output: None,
                                has_error: None,
                                history: None,
                                learner_id: None,
                                lid: "anonymous".to_string(),
                                provider_config: None,
                            };
                            match kodex_api::strategy_pipeline().execute(&context).await {
                                Ok(response) => {
                                    let msg = serde_json::json!({"type": "chat:chunk", "content": response}).to_string();
                                    let _ = socket.send(Message::Text(msg.into())).await;
                                    let _ = socket.send(Message::Text(serde_json::json!({"type": "chat:done"}).to_string().into())).await;
                                }
                                Err(e) => {
                                    let err = serde_json::json!({"type": "error", "message": e.to_string()}).to_string();
                                    let _ = socket.send(Message::Text(err.into())).await;
                                }
                            }
                        }
                        "execute" => {
                            let _ = socket.send(Message::Text(serde_json::json!({"type": "execute:error", "message": "Code execution via WebSocket is not available. Use POST /api/execute instead."}).to_string().into())).await;
                        }
                        "subscribe:project" => {
                            if let Some(project_id) = parsed["projectId"].as_str() {
                                info!("Client {} subscribed to project {}", client_id, project_id);
                                let _ = socket.send(Message::Text(serde_json::json!({"type": "subscribed", "projectId": project_id}).to_string().into())).await;
                            }
                        }
                        _ => {
                            let _ = socket.send(Message::Text(serde_json::json!({"type": "error", "message": format!("Unknown message type: {}", msg_type)}).to_string().into())).await;
                        }
                    }
                }
            }
            Ok(Message::Close(_)) => break,
            Err(e) => { warn!("WebSocket error for {}: {}", client_id, e); break; }
            _ => {}
        }
    }

    manager.remove_client(&client_id).await;
    info!("WebSocket disconnected: {}", client_id);
}

fn fast_random_id() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().subsec_nanos() as u64;
    (nanos ^ std::process::id() as u64) ^ 0xDEAD_BEEF
}
