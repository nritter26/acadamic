use std::fmt;
use serde::Serialize;

use axum::response::{IntoResponse, Response};
use axum::Json;

#[derive(Debug, Clone, Serialize)]
pub struct ApiError {
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

impl ApiError {
    pub fn new(status: u16, message: impl Into<String>) -> Self {
        Self {
            error: message.into(),
            code: match status {
                400 => Some("BAD_REQUEST".into()),
                401 => Some("UNAUTHORIZED".into()),
                403 => Some("FORBIDDEN".into()),
                404 => Some("NOT_FOUND".into()),
                409 => Some("CONFLICT".into()),
                429 => Some("TOO_MANY_REQUESTS".into()),
                _ => Some("INTERNAL_ERROR".into()),
            },
            details: None,
        }
    }

    pub fn with_code(mut self, code: &str) -> Self {
        self.code = Some(code.into());
        self
    }

    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = Some(details);
        self
    }
}

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("{0}")]
    BadRequest(String),
    #[error("{0}")]
    Unauthorized(String),
    #[error("{0}")]
    NotFound(String),
    #[error("{0}")]
    Conflict(String),
    #[error("{0}")]
    TooManyRequests(String),
    #[error("Internal error: {0}")]
    Internal(String),
    #[error("Validation error: {0}")]
    Validation(String),
}

impl AppError {
    pub fn status_code(&self) -> u16 {
        match self {
            Self::BadRequest(_) => 400,
            Self::Validation(_) => 400,
            Self::Unauthorized(_) => 401,
            Self::NotFound(_) => 404,
            Self::Conflict(_) => 409,
            Self::TooManyRequests(_) => 429,
            Self::Internal(_) => 500,
        }
    }

    pub fn to_api_error(&self) -> ApiError {
        let mut err = ApiError::new(self.status_code(), self.to_string());
        if let Self::Validation(msg) = self {
            err.code = Some("VALIDATION_ERROR".into());
            err.error = msg.clone();
        }
        err
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.error)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let api_error = self.to_api_error();
        let status = axum::http::StatusCode::from_u16(self.status_code())
            .unwrap_or(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        (status, Json(api_error)).into_response()
    }
}
