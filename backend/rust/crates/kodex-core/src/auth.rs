use crate::types::AuthPayload;

pub fn generate_token(payload: &AuthPayload, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    use jsonwebtoken::{encode, Header, EncodingKey};

    let claims = serde_json::json!({
        "user_id": payload.user_id,
        "email": payload.email,
        "name": payload.name,
        "exp": jsonwebtoken::get_current_timestamp() + 7 * 24 * 3600,
    });

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

pub fn verify_token(token: &str, secret: &str) -> Result<AuthPayload, jsonwebtoken::errors::Error> {
    use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};

    let token_data = decode::<serde_json::Value>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )?;

    let claims = &token_data.claims;
    Ok(AuthPayload {
        user_id: claims["user_id"].as_str().unwrap_or_default().to_string(),
        email: claims["email"].as_str().unwrap_or_default().to_string(),
        name: claims["name"].as_str().map(|s| s.to_string()),
        exp: claims["exp"].as_u64(),
    })
}
