use axum::{
    Router,
    routing::get,
    Json,
};
use std::collections::HashMap;

pub fn routes() -> Router {
    Router::new()
        .route("/api/progress", get(get_progress).post(save_progress))
}

pub async fn get_progress() -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let progress_path = crate::config().data_dir.join("progress.json");
    match std::fs::read_to_string(&progress_path) {
        Ok(content) => {
            let data: serde_json::Value = serde_json::from_str(&content).unwrap_or(serde_json::json!({}));
            Ok(Json(data))
        }
        Err(_) => Ok(Json(serde_json::json!({}))),
    }
}

pub async fn save_progress(
    Json(body): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let lang = body.get("lang").and_then(|v| v.as_str()).ok_or_else(|| {
        (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "lang required" })))
    })?;
    let topic = body.get("topic").and_then(|v| v.as_str()).ok_or_else(|| {
        (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "topic required" })))
    })?;
    let completed = body.get("completed").and_then(|v| v.as_bool()).unwrap_or(true);

    let progress_path = crate::config().data_dir.join("progress.json");
    let mut data: HashMap<String, HashMap<String, bool>> = match std::fs::read_to_string(&progress_path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => HashMap::new(),
    };

    data.entry(lang.to_string()).or_default().insert(topic.to_string(), completed);

    let json_str = serde_json::to_string_pretty(&data).map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Serialize error: {}", e) })))
    })?;
    std::fs::write(&progress_path, &json_str).map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Write error: {}", e) })))
    })?;

    Ok(Json(serde_json::json!({ "ok": true })))
}
