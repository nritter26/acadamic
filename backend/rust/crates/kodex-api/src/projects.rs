use axum::{
    Router,
    routing::get,
    extract::Path,
    Json,
    http::StatusCode,
    http::HeaderMap,
};
use uuid::Uuid;

use kodex_sql::models::ProjectDb;
use kodex_core::types::{CreateProjectInput, UpdateProjectInput};

pub fn routes() -> Router {
    Router::new()
        .route("/api/projects", get(list_projects).post(create_project))
        .route("/api/projects/{id}", get(get_project).put(update_project).delete(delete_project))
}

fn get_user_id(headers: &HeaderMap) -> Result<String, (StatusCode, Json<serde_json::Value>)> {
    let config = crate::config();
    let token = crate::extract_bearer_token(headers)
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Missing Authorization header" }))))?;
    let payload = kodex_core::auth::verify_token(&token, &config.jwt_secret)
        .map_err(|_| (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Invalid or expired token" }))))?;
    Ok(payload.user_id)
}

pub async fn list_projects(
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let user_id = get_user_id(&headers)?;
    let db = ProjectDb::new(crate::db().projects.clone());
    let projects = db.list_projects(&user_id).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;
    Ok(Json(serde_json::to_value(&projects).unwrap_or_default()))
}

pub async fn get_project(
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let user_id = get_user_id(&headers)?;
    let db = ProjectDb::new(crate::db().projects.clone());
    let project = db.get_project(&id, &user_id).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;
    match project {
        Some(p) => {
            let files: serde_json::Value = serde_json::from_str(&p.files).unwrap_or(serde_json::json!({}));
            let mut result = serde_json::to_value(&p).unwrap_or_default();
            if let Some(obj) = result.as_object_mut() { obj.insert("files".to_string(), files); }
            Ok(Json(result))
        }
        None => Err((StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Project not found" })))),
    }
}

pub async fn create_project(
    headers: HeaderMap,
    Json(input): Json<CreateProjectInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let user_id = get_user_id(&headers)?;
    let db = ProjectDb::new(crate::db().projects.clone());
    let id = Uuid::new_v4().to_string();
    let language = input.language.as_deref().unwrap_or("js");
    let description = input.description.as_deref().unwrap_or("");
    db.create_project(&id, &user_id, &input.name, language, description).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;
    Ok(Json(serde_json::json!({ "id": id, "name": input.name, "language": language, "description": description })))
}

pub async fn update_project(
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(input): Json<UpdateProjectInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let user_id = get_user_id(&headers)?;
    let db = ProjectDb::new(crate::db().projects.clone());

    let existing = db.get_project(&id, &user_id).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;
    if existing.is_none() {
        return Err((StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Project not found" }))));
    }

    let mut fields: Vec<(String, String)> = Vec::new();
    if let Some(name) = &input.name { fields.push(("name".to_string(), name.clone())); }
    if let Some(language) = &input.language { fields.push(("language".to_string(), language.clone())); }
    if let Some(description) = &input.description { fields.push(("description".to_string(), description.clone())); }
    if let Some(files) = &input.files { fields.push(("files".to_string(), serde_json::to_string(files).unwrap_or_default())); }

    if !fields.is_empty() {
        db.update_project(&id, &user_id, &fields).await.map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
        })?;
    }

    let project = db.get_project(&id, &user_id).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;

    match project {
        Some(p) => {
            let mut result = serde_json::to_value(&p).unwrap_or_default();
            if let Some(obj) = result.as_object_mut() {
                obj.insert("files".to_string(), serde_json::from_str(&p.files).unwrap_or(serde_json::json!({})));
            }
            Ok(Json(result))
        }
        None => Err((StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Project not found" })))),
    }
}

pub async fn delete_project(
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let user_id = get_user_id(&headers)?;
    let db = ProjectDb::new(crate::db().projects.clone());
    let deleted = db.delete_project(&id, &user_id).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;
    if deleted { Ok(Json(serde_json::json!({ "ok": true }))) }
    else { Err((StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Project not found" })))) }
}
