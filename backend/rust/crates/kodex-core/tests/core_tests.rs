use std::sync::Mutex;
use std::sync::LazyLock;

use axum::response::IntoResponse;
use kodex_core::auth::{generate_token, verify_token};
use kodex_core::config::AiProvider;
use kodex_core::config::AppConfig;
use kodex_core::error::AppError;
use kodex_core::types::*;

static ENV_LOCK: LazyLock<Mutex<()>> = LazyLock::new(|| Mutex::new(()));

fn save_and_clear(keys: &[&str]) -> Vec<(String, Option<String>)> {
    keys.iter()
        .map(|k| {
            let orig = std::env::var(k).ok();
            std::env::remove_var(k);
            (k.to_string(), orig)
        })
        .collect()
}

fn restore(prev: Vec<(String, Option<String>)>) {
    for (k, v) in prev {
        match v {
            Some(val) => std::env::set_var(&k, val),
            None => std::env::remove_var(&k),
        }
    }
}

// ── AiProvider ──

#[test]
fn test_ai_provider_from_str() {
    assert_eq!(
        "openai".parse::<AiProvider>().unwrap(),
        AiProvider::OpenAI
    );
    assert_eq!(
        "anthropic".parse::<AiProvider>().unwrap(),
        AiProvider::Anthropic
    );
    assert_eq!(
        "gemini".parse::<AiProvider>().unwrap(),
        AiProvider::Gemini
    );
    assert_eq!(
        "local".parse::<AiProvider>().unwrap(),
        AiProvider::Local
    );
    assert_eq!(
        "keyword".parse::<AiProvider>().unwrap(),
        AiProvider::Keyword
    );
    assert_eq!(
        "hybrid".parse::<AiProvider>().unwrap(),
        AiProvider::Hybrid
    );
    assert!("invalid".parse::<AiProvider>().is_err());
}

#[test]
fn test_ai_provider_case_insensitive() {
    assert_eq!(
        "OpenAI".parse::<AiProvider>().unwrap(),
        AiProvider::OpenAI
    );
    assert_eq!(
        "ANTHROPIC".parse::<AiProvider>().unwrap(),
        AiProvider::Anthropic
    );
    assert_eq!(
        "HyBRiD".parse::<AiProvider>().unwrap(),
        AiProvider::Hybrid
    );
    assert_eq!(
        "KEYWORD".parse::<AiProvider>().unwrap(),
        AiProvider::Keyword
    );
}

#[test]
fn test_ai_provider_empty_string() {
    let result = "".parse::<AiProvider>();
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Unknown"));
}

#[test]
fn test_ai_provider_whitespace() {
    let result = " openai".parse::<AiProvider>();
    assert!(result.is_err());
    let result = "openai ".parse::<AiProvider>();
    assert!(result.is_err());
}

// ── LLMRole Display ──

#[test]
fn test_llm_role_display() {
    assert_eq!(LLMRole::System.to_string(), "system");
    assert_eq!(LLMRole::User.to_string(), "user");
    assert_eq!(LLMRole::Assistant.to_string(), "assistant");
}

#[test]
fn test_llm_role_debug() {
    let role = LLMRole::System;
    assert_eq!(format!("{role:?}"), "System");
}

// ── LLMMessage Serde ──

#[test]
fn test_llm_message_serde() {
    let msg = LLMMessage {
        role: LLMRole::User,
        content: "Hello".to_string(),
    };
    let json = serde_json::to_string(&msg).unwrap();
    assert_eq!(json, r#"{"role":"user","content":"Hello"}"#);

    let deserialized: LLMMessage = serde_json::from_str(&json).unwrap();
    assert_eq!(deserialized.content, "Hello");
    assert!(matches!(deserialized.role, LLMRole::User));
}

#[test]
fn test_llm_message_serde_roundtrip() {
    let msgs = vec![
        LLMMessage {
            role: LLMRole::System,
            content: "system prompt".into(),
        },
        LLMMessage {
            role: LLMRole::User,
            content: "user message".into(),
        },
        LLMMessage {
            role: LLMRole::Assistant,
            content: "assistant reply".into(),
        },
    ];
    for msg in &msgs {
        let json = serde_json::to_string(msg).unwrap();
        let back: LLMMessage = serde_json::from_str(&json).unwrap();
        assert_eq!(back.content, msg.content);
        assert!(matches!(
            (&back.role, &msg.role),
            (LLMRole::System, LLMRole::System)
                | (LLMRole::User, LLMRole::User)
                | (LLMRole::Assistant, LLMRole::Assistant)
        ));
    }
}

#[test]
fn test_llm_message_special_chars() {
    let msg = LLMMessage {
        role: LLMRole::User,
        content: "line1\nline2\ttab\u{0000}null".into(),
    };
    let json = serde_json::to_string(&msg).unwrap();
    let back: LLMMessage = serde_json::from_str(&json).unwrap();
    assert_eq!(back.content, msg.content);
}

#[test]
fn test_llm_message_very_long() {
    let content = "A".repeat(100_000);
    let msg = LLMMessage {
        role: LLMRole::User,
        content,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let back: LLMMessage = serde_json::from_str(&json).unwrap();
    assert_eq!(back.content.len(), 100_000);
}

// ── AuthPayload Serde ──

#[test]
fn test_auth_payload_serde_roundtrip_with_all_fields() {
    let payload = AuthPayload {
        user_id: "user-42".into(),
        email: "alice@example.com".into(),
        name: Some("Alice".into()),
        exp: Some(9999999999),
    };
    let json = serde_json::to_string(&payload).unwrap();
    let back: AuthPayload = serde_json::from_str(&json).unwrap();
    assert_eq!(back.user_id, "user-42");
    assert_eq!(back.email, "alice@example.com");
    assert_eq!(back.name, Some("Alice".into()));
    assert_eq!(back.exp, Some(9999999999));
}

#[test]
fn test_auth_payload_serde_optional_fields_none() {
    let payload = AuthPayload {
        user_id: "anon".into(),
        email: "anon@test.com".into(),
        name: None,
        exp: None,
    };
    let json = serde_json::to_string(&payload).unwrap();
    let back: AuthPayload = serde_json::from_str(&json).unwrap();
    assert_eq!(back.name, None);
    assert_eq!(back.exp, None);
}

#[test]
fn test_auth_payload_serde_empty_strings() {
    let payload = AuthPayload {
        user_id: "".into(),
        email: "".into(),
        name: Some("".into()),
        exp: Some(0),
    };
    let json = serde_json::to_string(&payload).unwrap();
    let back: AuthPayload = serde_json::from_str(&json).unwrap();
    assert_eq!(back.user_id, "");
    assert_eq!(back.email, "");
    assert_eq!(back.name, Some("".into()));
    assert_eq!(back.exp, Some(0));
}

#[test]
fn test_auth_payload_serde_unicode() {
    let payload = AuthPayload {
        user_id: "用户123".into(),
        email: "üsér@exämple.com".into(),
        name: Some("👩‍💻 У́сер".into()),
        exp: None,
    };
    let json = serde_json::to_string(&payload).unwrap();
    let back: AuthPayload = serde_json::from_str(&json).unwrap();
    assert_eq!(back.user_id, "用户123");
    assert_eq!(back.email, "üsér@exämple.com");
    assert_eq!(back.name, Some("👩‍💻 У́сер".into()));
}

// ── JWT Token ──

#[test]
fn test_generate_and_verify_token() {
    let payload = AuthPayload {
        user_id: "test-user".into(),
        email: "user@test.com".into(),
        name: Some("Test User".into()),
        exp: None,
    };
    let secret = "test-secret-key-for-jwt";
    let token = generate_token(&payload, secret).unwrap();
    assert!(!token.is_empty());

    let verified = verify_token(&token, secret).unwrap();
    assert_eq!(verified.user_id, "test-user");
    assert_eq!(verified.email, "user@test.com");
    assert_eq!(verified.name, Some("Test User".into()));
    assert!(verified.exp.is_some(), "exp should be set by generate_token");
    assert!(verified.exp.unwrap() > 1700000000);
}

#[test]
fn test_generate_token_minimal_payload() {
    let payload = AuthPayload {
        user_id: "".into(),
        email: "".into(),
        name: None,
        exp: None,
    };
    let token = generate_token(&payload, "secret").unwrap();
    let verified = verify_token(&token, "secret").unwrap();
    assert_eq!(verified.user_id, "");
    assert_eq!(verified.email, "");
    assert_eq!(verified.name, None);
}

#[test]
fn test_verify_token_wrong_secret() {
    let payload = AuthPayload {
        user_id: "u1".into(),
        email: "e@e.com".into(),
        name: None,
        exp: None,
    };
    let token = generate_token(&payload, "correct-secret").unwrap();
    let result = verify_token(&token, "wrong-secret");
    assert!(result.is_err());
}

#[test]
fn test_verify_token_malformed() {
    assert!(verify_token("not.a.jwt", "secret").is_err());
    assert!(verify_token("", "secret").is_err());
    assert!(verify_token("a.b.c.d.e", "secret").is_err());
    assert!(verify_token("!!!", "secret").is_err());
}

#[test]
fn test_verify_token_expired() {
    use jsonwebtoken::{encode, EncodingKey, Header};

    let expired_claims = serde_json::json!({
        "user_id": "u1",
        "email": "e@e.com",
        "exp": 1000000000,
    });

    let token = encode(
        &Header::default(),
        &expired_claims,
        &EncodingKey::from_secret("secret".as_bytes()),
    )
    .unwrap();

    let result = verify_token(&token, "secret");
    assert!(result.is_err());
}

#[test]
fn test_verify_token_tampered() {
    let payload = AuthPayload {
        user_id: "u1".into(),
        email: "e@e.com".into(),
        name: None,
        exp: None,
    };
    let token = generate_token(&payload, "secret").unwrap();
    // Tamper with the payload part of the JWT
    let parts: Vec<&str> = token.split('.').collect();
    assert_eq!(parts.len(), 3);
    let tampered = format!("{}.{}.{}", parts[0], "aW52YWxpZHBheWxvYWQ", parts[2]);
    let result = verify_token(&tampered, "secret");
    assert!(result.is_err());
}

// ── AppConfig from_env ──

#[test]
fn test_app_config_defaults() {
    let _lock = ENV_LOCK.lock().unwrap();
    let saved = save_and_clear(&[
        "HOST",
        "PORT",
        "DATA_DIR",
        "JWT_SECRET",
        "LOG_LEVEL",
        "AI_PROVIDER",
        "AI_MAX_TOKENS",
        "OPENAI_API_KEY",
        "OPENAI_MODEL",
        "OPENAI_ENDPOINT",
        "ANTHROPIC_API_KEY",
        "ANTHROPIC_MODEL",
        "ANTHROPIC_ENDPOINT",
        "GEMINI_API_KEY",
        "GEMINI_MODEL",
        "GEMINI_ENDPOINT",
        "LOCAL_LLM_MODEL",
        "LOCAL_LLM_ENDPOINT",
        "AI_SYSTEM_PROMPT",
        "PG_CONNECTION_STRING",
        "MYSQL_CONNECTION_STRING",
        "STALE_TOPIC_DAYS",
    ]);

    let cfg = AppConfig::from_env();
    assert_eq!(cfg.host, "127.0.0.1");
    assert_eq!(cfg.port, 3000);
    assert_eq!(cfg.jwt_secret, "kodex-dev-secret-change-in-production");
    assert_eq!(cfg.log_level, "info");
    assert!(matches!(cfg.ai_provider, AiProvider::Hybrid));
    assert_eq!(cfg.openai.model, "gpt-4o-mini");
    assert_eq!(cfg.openai.endpoint, "https://api.openai.com/v1");
    assert_eq!(cfg.openai.max_tokens, 1024);
    assert_eq!(cfg.anthropic.model, "claude-3-haiku-20240307");
    assert_eq!(cfg.gemini.model, "gemini-2.0-flash");
    assert_eq!(cfg.local.model, "llama3.2");
    assert_eq!(cfg.local.endpoint, "http://localhost:11434/v1");
    assert_eq!(cfg.pg_connection_string, None);
    assert_eq!(cfg.mysql_connection_string, None);
    assert_eq!(cfg.stale_topic_days, 90);
    assert_eq!(cfg.openai.api_key, "");
    assert_eq!(cfg.anthropic.api_key, "");
    assert_eq!(cfg.gemini.api_key, "");

    restore(saved);
}

#[test]
fn test_app_config_custom_values() {
    let _lock = ENV_LOCK.lock().unwrap();
    let saved = save_and_clear(&[
        "HOST",
        "PORT",
        "DATA_DIR",
        "JWT_SECRET",
        "LOG_LEVEL",
        "AI_PROVIDER",
        "AI_MAX_TOKENS",
        "OPENAI_API_KEY",
        "OPENAI_MODEL",
        "OPENAI_ENDPOINT",
        "ANTHROPIC_API_KEY",
        "ANTHROPIC_MODEL",
        "GEMINI_API_KEY",
        "LOCAL_LLM_MODEL",
        "PG_CONNECTION_STRING",
        "MYSQL_CONNECTION_STRING",
        "STALE_TOPIC_DAYS",
    ]);

    std::env::set_var("HOST", "0.0.0.0");
    std::env::set_var("PORT", "8080");
    std::env::set_var("DATA_DIR", "/custom/data");
    std::env::set_var("JWT_SECRET", "custom-secret");
    std::env::set_var("LOG_LEVEL", "debug");
    std::env::set_var("AI_PROVIDER", "openai");
    std::env::set_var("AI_MAX_TOKENS", "2048");
    std::env::set_var("OPENAI_API_KEY", "sk-abc123");
    std::env::set_var("OPENAI_MODEL", "gpt-4");
    std::env::set_var("OPENAI_ENDPOINT", "https://custom.openai.com/v1");
    std::env::set_var("ANTHROPIC_API_KEY", "sk-ant-xyz");
    std::env::set_var("ANTHROPIC_MODEL", "claude-3-opus-20240229");
    std::env::set_var("GEMINI_API_KEY", "gemini-key");
    std::env::set_var("LOCAL_LLM_MODEL", "codellama");
    std::env::set_var("PG_CONNECTION_STRING", "postgres://user:pass@localhost/db");
    std::env::set_var("MYSQL_CONNECTION_STRING", "mysql://user:pass@localhost/db");
    std::env::set_var("STALE_TOPIC_DAYS", "30");

    let cfg = AppConfig::from_env();
    assert_eq!(cfg.host, "0.0.0.0");
    assert_eq!(cfg.port, 8080);
    assert_eq!(cfg.data_dir, std::path::PathBuf::from("/custom/data"));
    assert_eq!(cfg.jwt_secret, "custom-secret");
    assert_eq!(cfg.log_level, "debug");
    assert!(matches!(cfg.ai_provider, AiProvider::OpenAI));
    assert_eq!(cfg.openai.max_tokens, 2048);
    assert_eq!(cfg.anthropic.max_tokens, 2048);
    assert_eq!(cfg.gemini.max_tokens, 2048);
    assert_eq!(cfg.local.max_tokens, 2048);
    assert_eq!(cfg.openai.api_key, "sk-abc123");
    assert_eq!(cfg.openai.model, "gpt-4");
    assert_eq!(cfg.openai.endpoint, "https://custom.openai.com/v1");
    assert_eq!(cfg.anthropic.api_key, "sk-ant-xyz");
    assert_eq!(cfg.anthropic.model, "claude-3-opus-20240229");
    assert_eq!(cfg.gemini.api_key, "gemini-key");
    assert_eq!(cfg.local.model, "codellama");
    assert_eq!(
        cfg.pg_connection_string,
        Some("postgres://user:pass@localhost/db".into())
    );
    assert_eq!(
        cfg.mysql_connection_string,
        Some("mysql://user:pass@localhost/db".into())
    );
    assert_eq!(cfg.stale_topic_days, 30);

    restore(saved);
}

#[test]
fn test_app_config_invalid_port_fallback() {
    let _lock = ENV_LOCK.lock().unwrap();
    let saved = save_and_clear(&["PORT", "AI_PROVIDER", "STALE_TOPIC_DAYS"]);

    std::env::set_var("PORT", "not-a-number");
    std::env::set_var("AI_PROVIDER", "unknown-provider");
    std::env::set_var("STALE_TOPIC_DAYS", "invalid");

    let cfg = AppConfig::from_env();
    assert_eq!(cfg.port, 3000);
    assert!(matches!(cfg.ai_provider, AiProvider::Hybrid));
    assert_eq!(cfg.stale_topic_days, 90);

    restore(saved);
}

// ── AppError ──

#[test]
fn test_app_error_status_code() {
    assert_eq!(AppError::BadRequest("".into()).status_code(), 400);
    assert_eq!(AppError::Validation("".into()).status_code(), 400);
    assert_eq!(AppError::Unauthorized("".into()).status_code(), 401);
    assert_eq!(AppError::NotFound("".into()).status_code(), 404);
    assert_eq!(AppError::Conflict("".into()).status_code(), 409);
    assert_eq!(AppError::TooManyRequests("".into()).status_code(), 429);
    assert_eq!(AppError::Internal("".into()).status_code(), 500);
}

#[test]
fn test_app_error_display() {
    assert_eq!(
        AppError::BadRequest("invalid input".into()).to_string(),
        "invalid input"
    );
    assert_eq!(
        AppError::Internal("db failure".into()).to_string(),
        "Internal error: db failure"
    );
    assert_eq!(
        AppError::Validation("missing field".into()).to_string(),
        "Validation error: missing field"
    );
}

#[test]
fn test_app_error_to_api_error() {
    let err = AppError::BadRequest("bad stuff".into());
    let api = err.to_api_error();
    assert_eq!(api.error, "bad stuff");
    assert_eq!(api.code, Some("BAD_REQUEST".into()));
    assert!(api.details.is_none());

    let err = AppError::Validation("required".into());
    let api = err.to_api_error();
    assert_eq!(api.code, Some("VALIDATION_ERROR".into()));
    assert_eq!(api.error, "required");

    let err = AppError::Internal("oops".into());
    let api = err.to_api_error();
    assert_eq!(api.code, Some("INTERNAL_ERROR".into()));
    assert_eq!(api.error, "Internal error: oops");

    let err = AppError::Unauthorized("login needed".into());
    let api = err.to_api_error();
    assert_eq!(api.code, Some("UNAUTHORIZED".into()));
}

#[test]
fn test_app_error_into_response_status() {
    let err = AppError::NotFound("missing".into());
    let resp = err.into_response();
    assert_eq!(resp.status(), 404);

    let err = AppError::TooManyRequests("slow down".into());
    let resp = err.into_response();
    assert_eq!(resp.status(), 429);

    let err = AppError::Conflict("exists".into());
    let resp = err.into_response();
    assert_eq!(resp.status(), 409);

    let err = AppError::Internal("crash".into());
    let resp = err.into_response();
    assert_eq!(resp.status(), 500);
}

// ── ApiError ──

#[test]
fn test_api_error_new() {
    use kodex_core::error::ApiError;

    let err = ApiError::new(400, "bad request");
    assert_eq!(err.error, "bad request");
    assert_eq!(err.code, Some("BAD_REQUEST".into()));
    assert!(err.details.is_none());

    let err = ApiError::new(999, "unknown");
    assert_eq!(err.code, Some("INTERNAL_ERROR".into()));
}

#[test]
fn test_api_error_with_code_and_details() {
    use kodex_core::error::ApiError;

    let err = ApiError::new(400, "base")
        .with_code("CUSTOM_CODE")
        .with_details(serde_json::json!({"field": "name"}));
    assert_eq!(err.code, Some("CUSTOM_CODE".into()));
    assert_eq!(
        err.details,
        Some(serde_json::json!({"field": "name"}))
    );
}

#[test]
fn test_api_error_display() {
    use kodex_core::error::ApiError;

    let err = ApiError::new(404, "not found");
    assert_eq!(format!("{err}"), "not found");
}

// ── Input Types Serde Round-Trip ──

#[test]
fn test_chat_input_serde_roundtrip() {
    let input = ChatInput {
        message: "hello".into(),
        lang: Some("rust".into()),
        topic: None,
        phase: Some("basics".into()),
        code: None,
        output: None,
        has_error: Some(false),
        history: None,
        learner_id: Some("learner-1".into()),
        provider: Some("openai".into()),
        model: Some("gpt-4".into()),
        api_key: None,
        endpoint: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ChatInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.message, "hello");
    assert_eq!(back.lang, Some("rust".into()));
    assert_eq!(back.phase, Some("basics".into()));
    assert_eq!(back.has_error, Some(false));
    assert_eq!(back.learner_id, Some("learner-1".into()));
    assert_eq!(back.provider, Some("openai".into()));
    assert_eq!(back.model, Some("gpt-4".into()));
    assert!(back.topic.is_none());
    assert!(back.api_key.is_none());
}

#[test]
fn test_chat_input_empty_message() {
    let input = ChatInput {
        message: "".into(),
        lang: None,
        topic: None,
        phase: None,
        code: None,
        output: None,
        has_error: None,
        history: None,
        learner_id: None,
        provider: None,
        model: None,
        api_key: None,
        endpoint: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ChatInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.message, "");
    assert!(back.lang.is_none());
}

#[test]
fn test_chat_input_very_long_message() {
    let long_msg = "x".repeat(50_000);
    let input = ChatInput {
        message: long_msg.clone(),
        lang: None,
        topic: None,
        phase: None,
        code: None,
        output: None,
        has_error: None,
        history: None,
        learner_id: None,
        provider: None,
        model: None,
        api_key: None,
        endpoint: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ChatInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.message.len(), 50_000);
    assert_eq!(back.message, long_msg);
}

#[test]
fn test_chat_input_special_chars() {
    let input = ChatInput {
        message: "hello\nworld\t\"quoted\"\\slash\u{0000}null".into(),
        lang: Some("c++".into()),
        topic: Some("safety\u{0000}issue".into()),
        phase: None,
        code: Some("int main() { return 0; }".into()),
        output: None,
        has_error: None,
        history: None,
        learner_id: None,
        provider: None,
        model: None,
        api_key: Some("key-with\nnewline".into()),
        endpoint: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ChatInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.message, "hello\nworld\t\"quoted\"\\slash\u{0000}null");
    assert_eq!(back.lang, Some("c++".into()));
    assert_eq!(back.code, Some("int main() { return 0; }".into()));
    assert_eq!(back.api_key, Some("key-with\nnewline".into()));
}

#[test]
fn test_chat_input_unicode() {
    let input = ChatInput {
        message: "こんにちは世界 🌍".into(),
        lang: Some("日本語".into()),
        topic: Some("Программирование".into()),
        phase: None,
        code: Some("println!(\"Hello\") // מעולה".into()),
        output: None,
        has_error: None,
        history: None,
        learner_id: None,
        provider: None,
        model: None,
        api_key: None,
        endpoint: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ChatInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.message, "こんにちは世界 🌍");
    assert_eq!(back.lang, Some("日本語".into()));
    assert_eq!(back.topic, Some("Программирование".into()));
}

#[test]
fn test_execute_input_serde_roundtrip() {
    let input = ExecuteInput {
        lang: "python".into(),
        code: "print('hello')".into(),
        stdin: Some("input data".into()),
        server_mode: Some(true),
        http_tests: Some(vec![HttpTest {
            method: "GET".into(),
            path: "/api/health".into(),
            headers: Some(std::collections::HashMap::from([(
                "Authorization".into(),
                "Bearer tok".into(),
            )])),
            body: Some(serde_json::json!({"key": "val"})),
            expected_status: 200,
            expected_body_substring: Some("ok".into()),
            expected_body_shape: Some(vec!["status".into()]),
        }]),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ExecuteInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.lang, "python");
    assert_eq!(back.code, "print('hello')");
    assert_eq!(back.stdin, Some("input data".into()));
    assert_eq!(back.server_mode, Some(true));
    let tests = back.http_tests.unwrap();
    assert_eq!(tests.len(), 1);
    assert_eq!(tests[0].method, "GET");
    assert_eq!(tests[0].expected_status, 200);
}

#[test]
fn test_execute_input_empty_code() {
    let input = ExecuteInput {
        lang: "javascript".into(),
        code: "".into(),
        stdin: None,
        server_mode: None,
        http_tests: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ExecuteInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.code, "");
    assert!(back.stdin.is_none());
    assert!(back.http_tests.is_none());
}

#[test]
fn test_register_input_serde_roundtrip() {
    let input = RegisterInput {
        email: "user@test.com".into(),
        password: "securePass123!".into(),
        name: Some("New User".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: RegisterInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "user@test.com");
    assert_eq!(back.password, "securePass123!");
    assert_eq!(back.name, Some("New User".into()));
}

#[test]
fn test_register_input_without_name() {
    let input = RegisterInput {
        email: "no-name@test.com".into(),
        password: "pwd".into(),
        name: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: RegisterInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "no-name@test.com");
    assert!(back.name.is_none());
}

#[test]
fn test_register_input_empty_fields() {
    let input = RegisterInput {
        email: "".into(),
        password: "".into(),
        name: Some("".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: RegisterInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "");
    assert_eq!(back.password, "");
    assert_eq!(back.name, Some("".into()));
}

#[test]
fn test_login_input_serde_roundtrip() {
    let input = LoginInput {
        email: "login@test.com".into(),
        password: "mypassword".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: LoginInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "login@test.com");
    assert_eq!(back.password, "mypassword");
}

#[test]
fn test_explain_input_serde() {
    let input = ExplainInput {
        code: "fn main() {}".into(),
        lang: Some("rust".into()),
        topic: Some("syntax".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ExplainInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.code, "fn main() {}");
}

#[test]
fn test_review_input_serde() {
    let input = ReviewInput {
        code: "bad code".into(),
        lang: None,
        topic: None,
        learner_id: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ReviewInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.code, "bad code");
}

#[test]
fn test_exercise_input_serde() {
    let input = ExerciseInput {
        topic: "loops".into(),
        lang: Some("python".into()),
        level: Some("easy".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ExerciseInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.topic, "loops");
}

#[test]
fn test_quiz_generate_input_serde() {
    let input = QuizGenerateInput {
        topic: "rust borrow checker".into(),
        lang: Some("rust".into()),
        count: Some(5),
        level: Some("hard".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: QuizGenerateInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.topic, "rust borrow checker");
    assert_eq!(back.count, Some(5));
}

#[test]
fn test_quiz_generate_input_zero_count() {
    let input = QuizGenerateInput {
        topic: "math".into(),
        lang: None,
        count: Some(0),
        level: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: QuizGenerateInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.count, Some(0));
}

#[test]
fn test_learner_track_input_serde() {
    let input = LearnerTrackInput {
        event: "exercise_complete".into(),
        lang: Some("rust".into()),
        topic: Some("ownership".into()),
        phase: Some("core".into()),
        data: Some(TrackData {
            correct: Some(3),
            total: Some(5),
            solved: Some(true),
        }),
        learner_id: Some("l-1".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: LearnerTrackInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.event, "exercise_complete");
    assert_eq!(back.data.as_ref().unwrap().correct, Some(3));
    assert_eq!(back.data.as_ref().unwrap().solved, Some(true));
}

// ── HealthResponse / DatabaseStatus Serialization ──

#[test]
fn test_health_response_serialization() {
    let health = HealthResponse {
        status: "ok".into(),
        version: "1.0.0".into(),
        db: DatabaseStatus {
            sqlite: DbInitStatus {
                available: true,
                reason: None,
                error: None,
            },
            pg: DbInitStatus {
                available: false,
                reason: Some("not configured".into()),
                error: None,
            },
            mysql: DbInitStatus {
                available: false,
                reason: None,
                error: Some("connection refused".into()),
            },
        },
        ollama: Some("running".into()),
        config_ok: true,
    };
    let json = serde_json::to_string(&health).unwrap();
    let v: serde_json::Value = serde_json::from_str(&json).unwrap();
    assert_eq!(v["status"], "ok");
    assert_eq!(v["version"], "1.0.0");
    assert_eq!(v["config_ok"], true);
    assert_eq!(v["ollama"], "running");
    assert_eq!(v["db"]["sqlite"]["available"], true);
    assert_eq!(v["db"]["pg"]["available"], false);
    assert_eq!(v["db"]["pg"]["reason"], "not configured");
    assert_eq!(v["db"]["mysql"]["error"], "connection refused");
}

#[test]
fn test_health_response_ollama_absent() {
    let health = HealthResponse {
        status: "degraded".into(),
        version: "0.9.0".into(),
        db: DatabaseStatus {
            sqlite: DbInitStatus {
                available: true,
                reason: None,
                error: None,
            },
            pg: DbInitStatus {
                available: false,
                reason: None,
                error: None,
            },
            mysql: DbInitStatus {
                available: false,
                reason: None,
                error: None,
            },
        },
        ollama: None,
        config_ok: false,
    };
    let json = serde_json::to_string(&health).unwrap();
    let v: serde_json::Value = serde_json::from_str(&json).unwrap();
    assert_eq!(v["status"], "degraded");
    assert!(!v.get("ollama").is_some());
}

#[test]
fn test_database_status_serde_roundtrip() {
    let status = DatabaseStatus {
        sqlite: DbInitStatus {
            available: true,
            reason: Some("connected".into()),
            error: None,
        },
        pg: DbInitStatus {
            available: false,
            reason: None,
            error: Some("connection failed".into()),
        },
        mysql: DbInitStatus {
            available: false,
            reason: None,
            error: None,
        },
    };
    let json = serde_json::to_string(&status).unwrap();
    let back: DatabaseStatus = serde_json::from_str(&json).unwrap();
    assert!(back.sqlite.available);
    assert_eq!(back.sqlite.reason, Some("connected".into()));
    assert!(back.sqlite.error.is_none());
    assert!(!back.pg.available);
    assert_eq!(back.pg.error, Some("connection failed".into()));
    assert!(!back.mysql.available);
}

#[test]
fn test_db_init_status_all_none() {
    let status = DbInitStatus {
        available: true,
        reason: None,
        error: None,
    };
    let json = serde_json::to_string(&status).unwrap();
    let back: DbInitStatus = serde_json::from_str(&json).unwrap();
    assert!(back.available);
    assert!(back.reason.is_none());
    assert!(back.error.is_none());
}

// ── Boundary Tests ──

#[test]
fn test_exec_result_serde() {
    let r = ExecResult {
        output: "hello".into(),
        error: Some(false),
    };
    let json = serde_json::to_string(&r).unwrap();
    let back: ExecResult = serde_json::from_str(&json).unwrap();
    assert_eq!(back.output, "hello");
    assert_eq!(back.error, Some(false));
}

#[test]
fn test_exec_result_no_error() {
    let r = ExecResult {
        output: "".into(),
        error: None,
    };
    let json = serde_json::to_string(&r).unwrap();
    let back: ExecResult = serde_json::from_str(&json).unwrap();
    assert!(back.error.is_none());
}

#[test]
fn test_server_exec_result_serde() {
    let r = ServerExecResult {
        output: "server started".into(),
        error: None,
        server_results: None,
        all_passed: Some(true),
    };
    let json = serde_json::to_string(&r).unwrap();
    let back: ServerExecResult = serde_json::from_str(&json).unwrap();
    assert_eq!(back.all_passed, Some(true));
}

#[test]
fn test_stream_chunk_serde() {
    let chunk = StreamChunk {
        content: Some("partial data".into()),
        error: None,
    };
    let json = serde_json::to_string(&chunk).unwrap();
    let back: StreamChunk = serde_json::from_str(&json).unwrap();
    assert_eq!(back.content, Some("partial data".into()));
    assert!(back.error.is_none());
}

#[test]
fn test_stream_chunk_error() {
    let chunk = StreamChunk {
        content: None,
        error: Some("something broke".into()),
    };
    let json = serde_json::to_string(&chunk).unwrap();
    let back: StreamChunk = serde_json::from_str(&json).unwrap();
    assert!(back.content.is_none());
    assert_eq!(back.error, Some("something broke".into()));
}

#[test]
fn test_stream_chunk_both_none() {
    let chunk = StreamChunk {
        content: None,
        error: None,
    };
    let json = serde_json::to_string(&chunk).unwrap();
    let back: StreamChunk = serde_json::from_str(&json).unwrap();
    assert!(back.content.is_none());
    assert!(back.error.is_none());
}

#[test]
fn test_runner_config_serde() {
    let cfg = RunnerConfig {
        cmd: "python3".into(),
        ext: "py".into(),
        src: Some("print(1)".into()),
    };
    let json = serde_json::to_string(&cfg).unwrap();
    let back: RunnerConfig = serde_json::from_str(&json).unwrap();
    assert_eq!(back.cmd, "python3");
    assert_eq!(back.ext, "py");
    assert_eq!(back.src, Some("print(1)".into()));
}

#[test]
fn test_docker_runner_config_serde() {
    let cfg = DockerRunnerConfig {
        image: "python:3.12".into(),
        ext: "py".into(),
        src: None,
        compile_cmd: Some("gcc -o /app/prog /app/src.c".into()),
        run_cmd: "/app/prog".into(),
        needs_compile: true,
        memory_limit: Some("512m".into()),
    };
    let json = serde_json::to_string(&cfg).unwrap();
    let back: DockerRunnerConfig = serde_json::from_str(&json).unwrap();
    assert_eq!(back.image, "python:3.12");
    assert_eq!(back.run_cmd, "/app/prog");
    assert!(back.needs_compile);
    assert_eq!(back.memory_limit, Some("512m".into()));
}

#[test]
fn test_compiler_entry_serde() {
    let entry = CompilerEntry {
        available: true,
        version: Some("1.75.0".into()),
    };
    let json = serde_json::to_string(&entry).unwrap();
    let back: CompilerEntry = serde_json::from_str(&json).unwrap();
    assert!(back.available);
    assert_eq!(back.version, Some("1.75.0".into()));
}

#[test]
fn test_compiler_entry_not_available() {
    let entry = CompilerEntry {
        available: false,
        version: None,
    };
    let json = serde_json::to_string(&entry).unwrap();
    // version serializes as null (no skip_serializing_if)
    let back: CompilerEntry = serde_json::from_str(&json).unwrap();
    assert!(!back.available);
    assert!(back.version.is_none());
}

#[test]
fn test_quiz_question_serde() {
    let q = QuizQuestion {
        question: "What is Rust?".into(),
        options: vec!["A language".into(), "A game".into()],
        correct_index: 0,
        explanation: "Rust is a systems programming language".into(),
    };
    let json = serde_json::to_string(&q).unwrap();
    let back: QuizQuestion = serde_json::from_str(&json).unwrap();
    assert_eq!(back.correct_index, 0);
    assert_eq!(back.options.len(), 2);
}

#[test]
fn test_quiz_question_empty_options() {
    let q = QuizQuestion {
        question: "Q?".into(),
        options: vec![],
        correct_index: -1,
        explanation: "".into(),
    };
    let json = serde_json::to_string(&q).unwrap();
    let back: QuizQuestion = serde_json::from_str(&json).unwrap();
    assert!(back.options.is_empty());
    assert_eq!(back.correct_index, -1);
}

#[test]
fn test_learning_path_response_serde() {
    let resp = LearningPathResponse {
        lang: "rust".into(),
        progress: LearningProgress {
            completed: 5,
            total: 10,
            percent: 50,
        },
        next_steps: vec![LearningPathStep {
            phase: "basics".into(),
            topic: "variables".into(),
            reason: "fundamental".into(),
            status: "pending".into(),
        }],
        weak_areas: vec![WeakArea {
            topic: "borrowing".into(),
            mastery: 0.3,
        }],
    };
    let json = serde_json::to_string(&resp).unwrap();
    let back: LearningPathResponse = serde_json::from_str(&json).unwrap();
    assert_eq!(back.progress.percent, 50);
    assert_eq!(back.next_steps.len(), 1);
    assert_eq!(back.weak_areas[0].mastery, 0.3);
}

#[test]
fn test_proxy_input_serde() {
    let input = ProxyInput {
        method: Some("POST".into()),
        url: "https://api.example.com/data".into(),
        headers: Some(std::collections::HashMap::from([(
            "Content-Type".into(),
            "application/json".into(),
        )])),
        body: Some(r#"{"key":"value"}"#.into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ProxyInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.method, Some("POST".into()));
    assert_eq!(back.url, "https://api.example.com/data");
    assert_eq!(back.body, Some(r#"{"key":"value"}"#.into()));
}

#[test]
fn test_proxy_input_minimal() {
    let input = ProxyInput {
        method: None,
        url: "https://example.com".into(),
        headers: None,
        body: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ProxyInput = serde_json::from_str(&json).unwrap();
    assert!(back.method.is_none());
    assert_eq!(back.url, "https://example.com");
}

#[test]
fn test_create_project_input_serde() {
    let input = CreateProjectInput {
        name: "my-project".into(),
        language: Some("rust".into()),
        description: Some("A test project".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: CreateProjectInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.name, "my-project");
    assert_eq!(back.language, Some("rust".into()));
}

#[test]
fn test_update_project_input_serde() {
    let input = UpdateProjectInput {
        name: Some("renamed".into()),
        language: None,
        description: None,
        files: Some(std::collections::HashMap::from([(
            "main.rs".into(),
            "fn main() {}".into(),
        )])),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: UpdateProjectInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.name, Some("renamed".into()));
    let files = back.files.unwrap();
    assert_eq!(files.get("main.rs").unwrap(), "fn main() {}");
}

#[test]
fn test_update_content_input_serde() {
    let input = UpdateContentInput {
        data: std::collections::HashMap::from([
            (
                "title".into(),
                serde_json::json!("Hello"),
            ),
            (
                "count".into(),
                serde_json::json!(42),
            ),
        ]),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: UpdateContentInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.data.get("title").unwrap(), "Hello");
    assert_eq!(back.data.get("count").unwrap(), 42);
}

#[test]
fn test_provider_override_serde() {
    let po = ProviderOverride {
        provider: Some("openai".into()),
        model: Some("gpt-4".into()),
        api_key: Some("sk-...".into()),
        endpoint: None,
    };
    let json = serde_json::to_string(&po).unwrap();
    let back: ProviderOverride = serde_json::from_str(&json).unwrap();
    assert_eq!(back.provider, Some("openai".into()));
    assert!(back.endpoint.is_none());
}

#[test]
fn test_provider_override_all_none() {
    let po = ProviderOverride {
        provider: None,
        model: None,
        api_key: None,
        endpoint: None,
    };
    let json = serde_json::to_string(&po).unwrap();
    // Should serialize as empty object
    assert_eq!(json, "{}");
    let back: ProviderOverride = serde_json::from_str(&json).unwrap();
    assert!(back.provider.is_none());
}

#[test]
fn test_history_entry_serde() {
    let entry = HistoryEntry {
        role: "user".into(),
        text: "hello".into(),
        content: Some("extra".into()),
    };
    let json = serde_json::to_string(&entry).unwrap();
    let back: HistoryEntry = serde_json::from_str(&json).unwrap();
    assert_eq!(back.role, "user");
    assert_eq!(back.content, Some("extra".into()));
}

#[test]
fn test_history_entry_no_content() {
    let entry = HistoryEntry {
        role: "assistant".into(),
        text: "reply".into(),
        content: None,
    };
    let json = serde_json::to_string(&entry).unwrap();
    let back: HistoryEntry = serde_json::from_str(&json).unwrap();
    assert!(back.content.is_none());
}

#[test]
fn test_rate_limit_info_serialization() {
    let info = RateLimitInfo {
        window: "60s".into(),
        max: 30,
    };
    let json = serde_json::to_string(&info).unwrap();
    let v: serde_json::Value = serde_json::from_str(&json).unwrap();
    assert_eq!(v["window"], "60s");
    assert_eq!(v["max"], 30);
}

#[test]
fn test_ws_stats_serde() {
    let stats = WSStats {
        connected: 5,
        authenticated: 3,
    };
    let json = serde_json::to_string(&stats).unwrap();
    let back: WSStats = serde_json::from_str(&json).unwrap();
    assert_eq!(back.connected, 5);
    assert_eq!(back.authenticated, 3);
}

#[test]
fn test_progress_entry_serde() {
    let entry = ProgressEntry {
        lang: "python".into(),
        topic: "functions".into(),
        completed: Some(true),
    };
    let json = serde_json::to_string(&entry).unwrap();
    let back: ProgressEntry = serde_json::from_str(&json).unwrap();
    assert_eq!(back.completed, Some(true));
}

#[test]
fn test_progress_entry_no_completed() {
    let entry = ProgressEntry {
        lang: "rust".into(),
        topic: "traits".into(),
        completed: None,
    };
    let json = serde_json::to_string(&entry).unwrap();
    assert!(!json.contains("completed"));
    let back: ProgressEntry = serde_json::from_str(&json).unwrap();
    assert!(back.completed.is_none());
}

#[test]
fn test_tutor_inputs_serde() {
    let explain = ExplainTopicInput {
        topic: "closures".into(),
        lang: Some("rust".into()),
        phase: Some("advanced".into()),
        learner_id: Some("l-1".into()),
        code: Some("|| x + 1".into()),
        include_checkin: Some(false),
        use_ai: Some(true),
    };
    let json = serde_json::to_string(&explain).unwrap();
    let back: ExplainTopicInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.topic, "closures");

    let start = StartExerciseInput {
        topic: "loops".into(),
        lang: Some("python".into()),
        level: Some("easy".into()),
        learner_id: None,
    };
    let json = serde_json::to_string(&start).unwrap();
    let back: StartExerciseInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.topic, "loops");

    let attempt = AttemptExerciseInput {
        topic: "loops".into(),
        lang: Some("python".into()),
        code: "for i in range(10): print(i)".into(),
        learner_id: None,
    };
    let json = serde_json::to_string(&attempt).unwrap();
    let back: AttemptExerciseInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.code, "for i in range(10): print(i)");
}

#[test]
fn test_analyze_input_serde() {
    let input = AnalyzeInput {
        code: Some("fn main() {}".into()),
        lang: Some("rust".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: AnalyzeInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.code, Some("fn main() {}".into()));
}

#[test]
fn test_analyze_input_none() {
    let input = AnalyzeInput {
        code: None,
        lang: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    // Fields serialize as null (no skip_serializing_if)
    let back: AnalyzeInput = serde_json::from_str(&json).unwrap();
    assert!(back.code.is_none());
    assert!(back.lang.is_none());
}

#[test]
fn test_learner_profile_serde() {
    let profile = LearnerProfile {
        learner_id: "l-1".into(),
        email: Some("learner@test.com".into()),
        name: Some("Alice".into()),
        created_at: "2024-01-01T00:00:00Z".into(),
        updated_at: "2024-06-01T00:00:00Z".into(),
        topics: vec![TopicEntry {
            topic: "variables".into(),
            phase: "basics".into(),
            lang: "rust".into(),
            mastery: 0.85,
            attempts: 10,
            correct: 8,
            last_reviewed: Some("2024-05-01".into()),
            next_review: Some("2024-06-01".into()),
            interval_days: 30,
            completed: true,
        }],
        conversations: 42,
    };
    let json = serde_json::to_string(&profile).unwrap();
    let back: LearnerProfile = serde_json::from_str(&json).unwrap();
    assert_eq!(back.learner_id, "l-1");
    assert_eq!(back.topics.len(), 1);
    assert_eq!(back.topics[0].mastery, 0.85);
    assert_eq!(back.conversations, 42);
}

#[test]
fn test_review_entry_serde() {
    let entry = ReviewEntry {
        topic: "borrowing".into(),
        phase: "core".into(),
        lang: "rust".into(),
        mastery: 0.6,
        due_date: "2024-06-15".into(),
    };
    let json = serde_json::to_string(&entry).unwrap();
    let back: ReviewEntry = serde_json::from_str(&json).unwrap();
    assert_eq!(back.mastery, 0.6);
    assert_eq!(back.due_date, "2024-06-15");
}

// ── Additional Boundary: Very Large Nested Structures ──

#[test]
fn test_http_test_large_headers() {
    let mut headers = std::collections::HashMap::new();
    for i in 0..100 {
        headers.insert(format!("X-Header-{i}"), format!("value_{i}"));
    }
    let test = HttpTest {
        method: "POST".into(),
        path: "/test".into(),
        headers: Some(headers),
        body: Some(serde_json::json!({"data": "x".repeat(1000)})),
        expected_status: 200,
        expected_body_substring: None,
        expected_body_shape: None,
    };
    let json = serde_json::to_string(&test).unwrap();
    let back: HttpTest = serde_json::from_str(&json).unwrap();
    assert_eq!(back.headers.as_ref().unwrap().len(), 100);
}

#[test]
fn test_http_test_result_serde() {
    let result = HttpTestResult {
        method: "GET".into(),
        path: "/".into(),
        status: 200,
        expected_status: 200,
        body_match: true,
        shape_match: true,
        passed: true,
        error: None,
    };
    let json = serde_json::to_string(&result).unwrap();
    let back: HttpTestResult = serde_json::from_str(&json).unwrap();
    assert!(back.passed);
    assert!(back.error.is_none());
}

// ── Serde JSON Value Field Tests ──

#[test]
fn test_http_test_various_body_types() {
    // null body
    let test = HttpTest {
        method: "GET".into(),
        path: "/".into(),
        headers: None,
        body: None,
        expected_status: 200,
        expected_body_substring: None,
        expected_body_shape: None,
    };
    let json = serde_json::to_string(&test).unwrap();
    assert!(!json.contains("body"));
    let back: HttpTest = serde_json::from_str(&json).unwrap();
    assert!(back.body.is_none());

    // number body
    let test = HttpTest {
        method: "POST".into(),
        path: "/".into(),
        headers: None,
        body: Some(serde_json::json!(42)),
        expected_status: 201,
        expected_body_substring: None,
        expected_body_shape: None,
    };
    let json = serde_json::to_string(&test).unwrap();
    let back: HttpTest = serde_json::from_str(&json).unwrap();
    assert_eq!(back.body, Some(serde_json::json!(42)));

    // array body
    let test = HttpTest {
        method: "POST".into(),
        path: "/".into(),
        headers: None,
        body: Some(serde_json::json!([1, 2, 3])),
        expected_status: 200,
        expected_body_substring: None,
        expected_body_shape: None,
    };
    let json = serde_json::to_string(&test).unwrap();
    let back: HttpTest = serde_json::from_str(&json).unwrap();
    assert_eq!(back.body, Some(serde_json::json!([1, 2, 3])));
}

// ── Constants ──

#[test]
fn test_constants() {
    assert_eq!(kodex_core::config::RATE_WINDOW_MS, 60_000);
    assert_eq!(kodex_core::config::RATE_MAX, 30);
    assert_eq!(kodex_core::config::REVIEW_INTERVALS, &[1, 3, 7, 14, 30]);
    assert_eq!(kodex_core::config::MAX_CONCURRENT_EXEC, 4);
    assert_eq!(kodex_core::config::EXEC_TIMEOUT_MS, 30_000);
    assert_eq!(kodex_core::config::SESSION_TTL_MS, 3_600_000);
    assert_eq!(kodex_core::config::LLM_CACHE_TTL_MS, 300_000);
    assert_eq!(kodex_core::config::COMPILER_CACHE_TTL_MS, 30_000);
}

// ── TutorContext (manual Debug/Clone, no serde) ──

#[test]
fn test_tutor_context_construction() {
    let ctx = TutorContext {
        message: "help".into(),
        q: "what is a variable?".into(),
        lang: Some("rust".into()),
        topic: Some("basics".into()),
        phase: None,
        code: Some("let x = 1;".into()),
        output: None,
        has_error: Some(false),
        history: None,
        learner_id: None,
        lid: "session-1".into(),
        provider_config: None,
    };
    assert_eq!(ctx.message, "help");
    assert_eq!(ctx.q, "what is a variable?");
    assert_eq!(ctx.code, Some("let x = 1;".into()));
}

#[test]
fn test_tutor_context_debug() {
    let ctx = TutorContext {
        message: "test".into(),
        q: "q".into(),
        lang: None,
        topic: None,
        phase: None,
        code: None,
        output: None,
        has_error: None,
        history: None,
        learner_id: None,
        lid: "lid".into(),
        provider_config: None,
    };
    let debug = format!("{ctx:?}");
    assert!(debug.contains("lid"));
}

#[test]
fn test_ai_response_entry_serde() {
    let entry = AiResponseEntry {
        keywords: vec!["rust".into(), "ownership".into()],
        response: "Rust's ownership system...".into(),
    };
    let json = serde_json::to_string(&entry).unwrap();
    let back: AiResponseEntry = serde_json::from_str(&json).unwrap();
    assert_eq!(back.keywords.len(), 2);
    assert_eq!(back.keywords[0], "rust");
    assert!(back.response.contains("ownership"));
}
