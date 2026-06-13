use axum::{routing::post, Json, Router};

use kodex_core::types::ExecuteInput;

pub fn routes() -> Router {
    Router::new().route("/api/execute", post(execute_code))
}

pub async fn execute_code(
    Json(input): Json<ExecuteInput>,
) -> Json<serde_json::Value> {
    let lang = &input.lang;
    let code = &input.code;
    let stdin = input.stdin.as_deref();

    if lang == "sqlite" {
        if let Ok(conn) = crate::db().curriculum.get() {
            let result = kodex_sql::models::execute_raw_sqlite(&conn, code);
            let output = result.unwrap_or_else(|e| format!("Error: {}", e));
            return Json(serde_json::json!({ "output": output }));
        }
        return Json(serde_json::json!({ "output": "Database not available", "error": true }));
    }

    // Try Docker first (isolated), fall back to local execution
    let result = if kodex_executor::docker_executor::is_docker_available() {
        let runners = kodex_executor::docker_executor::get_docker_runners();
        if let Some(config) = runners.get(lang.as_str()) {
            match kodex_executor::docker_executor::execute_in_docker(code, config, stdin, 30).await
            {
                Ok(r) => r,
                Err(e) => {
                    tracing::warn!(
                        "Docker execution failed for {}: {}. Falling back to local.",
                        lang,
                        e
                    );
                    run_local(lang, code, stdin).await
                }
            }
        } else {
            run_local(lang, code, stdin).await
        }
    } else {
        run_local(lang, code, stdin).await
    };

    Json(serde_json::to_value(&result).unwrap_or_default())
}

async fn run_local(
    lang: &str,
    code: &str,
    stdin: Option<&str>,
) -> kodex_core::types::ExecResult {
    if lang == "js" {
        kodex_executor::js_sandbox::execute_js(code)
    } else {
        kodex_executor::local_executor::execute_local(lang, code, stdin).await
    }
}
