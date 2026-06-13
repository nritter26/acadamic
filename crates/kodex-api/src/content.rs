use axum::{
    Router,
    routing::get,
    extract::Path,
    Json,
};

pub fn routes() -> Router {
    Router::new()
        .route("/api/courses", get(list_courses))
        .route("/api/content", get(list_content_files))
        .route("/api/content/projects", get(list_all_projects))
        .route("/api/content/projects/{id}", get(get_project_content))
        .route("/api/content/{lang}", get(get_content).put(update_content).delete(delete_content))
        .route("/api/content/{lang}/{phase}", get(get_phase))
}

fn content_dir() -> std::path::PathBuf {
    crate::config().data_dir.join("..").join("content")
}

pub async fn list_content_files() -> Json<serde_json::Value> {
    let dir = content_dir();
    let files: Vec<String> = match std::fs::read_dir(&dir) {
        Ok(entries) => entries.filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map(|ext| ext == "json").unwrap_or(false))
            .map(|e| e.path().file_stem().unwrap_or_default().to_string_lossy().to_string())
            .collect(),
        Err(_) => vec![],
    };
    Json(serde_json::json!({ "files": files, "count": files.len() }))
}

pub async fn list_courses() -> Json<serde_json::Value> {
    let dir = content_dir();
    let courses: Vec<String> = match std::fs::read_dir(&dir) {
        Ok(entries) => entries.filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map(|ext| ext == "json").unwrap_or(false))
            .map(|e| e.path().file_stem().unwrap_or_default().to_string_lossy().to_string())
            .collect(),
        Err(_) => vec![],
    };
    Json(serde_json::json!(courses))
}

pub async fn get_content(
    Path(lang): Path<String>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let file_path = content_dir().join(format!("{}.json", lang));
    match std::fs::read_to_string(&file_path) {
        Ok(content) => {
            let data: serde_json::Value = serde_json::from_str(&content).unwrap_or(serde_json::json!({}));
            let phases = data.as_object().map(|o| o.len()).unwrap_or(0);
            let topic_count = data.as_object()
                .map(|o| o.values().filter_map(|v| v.as_object()).map(|p| p.len()).sum::<usize>())
                .unwrap_or(0);
            Ok(Json(serde_json::json!({ "lang": lang, "phases": phases, "topics": topic_count, "data": data })))
        }
        Err(_) => Err((axum::http::StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": format!("Content file '{}' not found", lang) })))),
    }
}

pub async fn get_phase(
    Path((lang, phase)): Path<(String, String)>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let file_path = content_dir().join(format!("{}.json", lang));
    let content = std::fs::read_to_string(&file_path).map_err(|_| {
        (axum::http::StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": format!("Content file '{}' not found", lang) })))
    })?;
    let data: serde_json::Value = serde_json::from_str(&content).unwrap_or(serde_json::json!({}));
    let phase_data = data.get(&phase).ok_or_else(|| {
        (axum::http::StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": format!("Phase '{}' not found", phase) })))
    })?;
    let topics = phase_data.as_object().map(|o| o.len()).unwrap_or(0);
    Ok(Json(serde_json::json!({ "lang": lang, "phase": phase, "topics": topics, "data": phase_data })))
}

pub async fn update_content(
    Path(lang): Path<String>,
    Json(body): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let file_path = content_dir().join(format!("{}.json", lang));
    let data = body.get("data").ok_or_else(|| {
        (axum::http::StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "data field required" })))
    })?;

    if file_path.exists() {
        std::fs::copy(&file_path, file_path.with_extension("json.bak")).ok();
    }
    let json_str = serde_json::to_string_pretty(data).map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Serialize error: {}", e) })))
    })?;
    std::fs::write(&file_path, &json_str).map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Write error: {}", e) })))
    })?;

    let phases = data.as_object().map(|o| o.len()).unwrap_or(0);
    let topic_count = data.as_object()
        .map(|o| o.values().filter_map(|v| v.as_object()).map(|p| p.len()).sum::<usize>())
        .unwrap_or(0);
    Ok(Json(serde_json::json!({ "ok": true, "lang": lang, "phases": phases, "topics": topic_count })))
}

pub async fn delete_content(
    Path(lang): Path<String>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let file_path = content_dir().join(format!("{}.json", lang));
    if file_path.exists() {
        std::fs::copy(&file_path, file_path.with_extension("json.bak")).ok();
        std::fs::remove_file(&file_path).map_err(|e| {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Delete error: {}", e) })))
        })?;
    }
    Ok(Json(serde_json::json!({ "ok": true, "lang": lang })))
}

pub async fn list_all_projects() -> Json<serde_json::Value> {
    let projects_dir = content_dir().join("projects");
    let projects: Vec<serde_json::Value> = match std::fs::read_dir(&projects_dir) {
        Ok(entries) => entries.filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map(|ext| ext == "json").unwrap_or(false))
            .filter_map(|e| std::fs::read_to_string(e.path()).ok())
            .filter_map(|c| serde_json::from_str(&c).ok())
            .collect(),
        Err(_) => vec![],
    };
    Json(serde_json::json!(projects))
}

pub async fn get_project_content(
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let file_path = content_dir().join("projects").join(format!("{}.json", id));
    match std::fs::read_to_string(&file_path) {
        Ok(content) => {
            let data: serde_json::Value = serde_json::from_str(&content).unwrap_or(serde_json::json!({}));
            Ok(Json(data))
        }
        Err(_) => Err((axum::http::StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": format!("Project '{}' not found", id) })))),
    }
}
