use axum::{
    Router,
    routing::{post, get},
    Json,
    http::HeaderMap,
};
use uuid::Uuid;

use kodex_core::types::{AuthPayload, RegisterInput, LoginInput};
use kodex_core::auth::generate_token;
use kodex_sql::models::AuthDb;

pub fn routes() -> Router {
    Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/me", get(me))
}

pub async fn register(
    Json(input): Json<RegisterInput>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let db = AuthDb::new(crate::db().auth.clone());
    let config = crate::config();

    if db.email_exists(&input.email).await.map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })? {
        return Err((
            axum::http::StatusCode::CONFLICT,
            Json(serde_json::json!({ "error": "Email already registered", "code": "EMAIL_EXISTS" })),
        ));
    }

    let id = Uuid::new_v4().to_string();
    let password_hash = bcrypt::hash(&input.password, 10).map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Hashing error: {}", e) })))
    })?;
    let name = input.name.unwrap_or_default();

    db.create_user(&id, &input.email, &password_hash, &name).await.map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;

    let payload = AuthPayload {
        user_id: id.clone(),
        email: input.email.clone(),
        name: Some(name.clone()),
        exp: None,
    };
    let token = generate_token(&payload, &config.jwt_secret)
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Token error: {}", e) }))))?;

    Ok(Json(serde_json::json!({
        "token": token,
        "user": { "id": id, "email": input.email, "name": name }
    })))
}

pub async fn login(
    Json(input): Json<LoginInput>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let db = AuthDb::new(crate::db().auth.clone());
    let config = crate::config();

    let user = db.get_user_by_email(&input.email).await.map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;

    match user {
        Some(u) => {
            let valid = bcrypt::verify(&input.password, &u.password_hash)
                .map_err(|_| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Verification error" }))))?;
            if !valid {
                return Err((
                    axum::http::StatusCode::UNAUTHORIZED,
                    Json(serde_json::json!({ "error": "Invalid email or password", "code": "INVALID_CREDENTIALS" })),
                ));
            }

            let payload = AuthPayload {
                user_id: u.id.clone(),
                email: u.email.clone(),
                name: Some(u.name.clone()),
                exp: None,
            };
            let token = generate_token(&payload, &config.jwt_secret)
                .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("Token error: {}", e) }))))?;

            Ok(Json(serde_json::json!({
                "token": token,
                "user": { "id": u.id, "email": u.email, "name": u.name }
            })))
        }
        None => Err((
            axum::http::StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "Invalid email or password", "code": "INVALID_CREDENTIALS" })),
        )),
    }
}

pub async fn me(
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    let config = crate::config();
    let token = crate::extract_bearer_token(&headers)
        .ok_or_else(|| (axum::http::StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Missing Authorization header" }))))?;

    let payload = kodex_core::auth::verify_token(&token, &config.jwt_secret)
        .map_err(|_| (axum::http::StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Invalid or expired token" }))))?;

    let db = AuthDb::new(crate::db().auth.clone());
    let user = db.get_user_by_id(&payload.user_id).await.map_err(|e| {
        (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e })))
    })?;

    match user {
        Some(u) => Ok(Json(serde_json::to_value(&u).unwrap_or_default())),
        None => Err((axum::http::StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "User not found" })))),
    }
}
