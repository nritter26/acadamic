use axum::{
    Router,
    routing::{get, post},
    extract::Query,
    Json,
};

use kodex_core::types::{AnalyzeInput, ExplainInput, ReviewInput, ProxyInput, LLMMessage, LLMRole};

pub fn routes() -> Router {
    Router::new()
        .route("/api/analyze", post(analyze_code))
        .route("/api/review", post(review_code))
        .route("/api/explain", post(explain_code))
        .route("/api/proxy", post(proxy_request))
        .route("/api/benchmark", get(benchmark))
        .route("/api/ollama/models", get(ollama_models))
}

fn static_analyze_hints(code: &str, lang: &str) -> Vec<String> {
    let mut hints: Vec<String> = Vec::new();
    if lang == "js" || lang == "ts" {
        if code.contains("==") && !code.contains("===") {
            hints.push("Use `===` (strict equality) instead of `==` to avoid type coercion bugs.".to_string());
        }
        if code.contains("var ") {
            hints.push("Using `var` is outdated. Use `let` (mutable) or `const` (immutable) for block-scoped variables.".to_string());
        }
    }
    if lang == "js" {
        if code.contains("console.log") {
            hints.push("Good use of console.log for debugging! Remember to remove or comment out debug logs in production.".to_string());
        }
        let paren_diff = code.matches('(').count() as i32 - code.matches(')').count() as i32;
        if paren_diff != 0 {
            hints.push(format!("Unbalanced parentheses! Make sure every `(` has a matching `)`. Diff: {}", paren_diff));
        }
        let brace_diff = code.matches('{').count() as i32 - code.matches('}').count() as i32;
        if brace_diff != 0 {
            hints.push(format!("Unbalanced curly braces! Make sure every `{{` has a matching `}}`. Diff: {}", brace_diff));
        }
    } else if lang == "ts" {
        if code.contains("any") {
            hints.push("Avoid `any` when possible. Prefer `unknown`, unions, or a concrete interface.".to_string());
        }
    } else if lang == "py" {
        if code.contains('\t') {
            hints.push("Mixing tabs and spaces in indentation causes hard-to-debug errors. Stick to 4 spaces.".to_string());
        }
        if code.contains("except:") {
            hints.push("Avoid bare `except:` blocks. Catch a specific exception when you know what can fail.".to_string());
        }
    }
    hints
}

pub async fn analyze_code(
    Json(input): Json<AnalyzeInput>,
) -> Json<serde_json::Value> {
    let code = input.code.as_deref().unwrap_or("").to_string();
    let lang = input.lang.as_deref().unwrap_or("js").to_string();

    if code.trim().is_empty() {
        return Json(serde_json::json!({"hints": [], "source": "static"}));
    }

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: "You are a code analysis tool. Analyze the given code and provide improvement hints. Return ONLY a JSON array of hint strings.".into() },
        LLMMessage { role: LLMRole::User, content: format!("Analyze this {} code:\n```\n{}\n```\nReturn JSON array of hint strings only.", lang, code) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(response) => {
            let cleaned = response.trim()
                .strip_prefix("```json").unwrap_or(&response)
                .strip_prefix("```").unwrap_or(&response)
                .strip_suffix("```").unwrap_or(&response)
                .trim();
            if let Ok(hints) = serde_json::from_str::<Vec<String>>(cleaned) {
                return Json(serde_json::json!({"hints": hints, "source": "ai"}));
            }
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(cleaned) {
                if let Some(hints) = val["hints"].as_array() {
                    return Json(serde_json::json!({"hints": hints, "source": "ai"}));
                }
            }
        }
        Err(_) => {}
    }

    let hints = static_analyze_hints(&code, &lang);
    Json(serde_json::json!({"hints": hints, "source": "static"}))
}

pub async fn review_code(
    Json(input): Json<ReviewInput>,
) -> Json<serde_json::Value> {
    let code = input.code.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: "You are a code reviewer. Review the given code and provide feedback as JSON.".into() },
        LLMMessage { role: LLMRole::User, content: format!("Review this {} code:\n```\n{}\n```\nReturn JSON with fields: review (string), score (0-10), issues (array of {{line, message, severity, category}}).", lang, code) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(response) => {
            let cleaned = response.trim()
                .strip_prefix("```json").unwrap_or(&response)
                .strip_prefix("```").unwrap_or(&response)
                .strip_suffix("```").unwrap_or(&response)
                .trim();
            if let Ok(result) = serde_json::from_str::<serde_json::Value>(cleaned) {
                return Json(result);
            }
        }
        Err(_) => {}
    }

    let mut issues: Vec<serde_json::Value> = Vec::new();
    let open_braces = code.matches('{').count();
    let close_braces = code.matches('}').count();
    if open_braces != close_braces {
        issues.push(serde_json::json!({"line": 0, "message": format!("Unbalanced braces: {} opening vs {} closing", open_braces, close_braces), "severity": "error", "category": "syntax"}));
    }
    let open_parens = code.matches('(').count();
    let close_parens = code.matches(')').count();
    if open_parens != close_parens {
        issues.push(serde_json::json!({"line": 0, "message": format!("Unbalanced parentheses: {} opening vs {} closing", open_parens, close_parens), "severity": "error", "category": "syntax"}));
    }
    if lang == "js" {
        if code.contains("==") && !code.contains("===") {
            issues.push(serde_json::json!({"line": 0, "message": "Use `===` instead of `==` to avoid type coercion", "severity": "style", "category": "style"}));
        }
        if code.contains("var ") {
            issues.push(serde_json::json!({"line": 0, "message": "Use `let` or `const` instead of `var` for block scoping", "severity": "style", "category": "style"}));
        }
        if code.contains("eval(") {
            issues.push(serde_json::json!({"line": 0, "message": "Avoid `eval()` — it executes arbitrary code and is a security risk", "severity": "error", "category": "syntax"}));
        }
    }
    let score = if !issues.is_empty() {
        let penalty: f64 = issues.iter().map(|i| match i["severity"].as_str() {
            Some("error") => 2.0, Some("warning") => 1.0, _ => 0.5,
        }).sum();
        (10.0 - penalty).max(1.0)
    } else { 10.0 };
    let lines = code.lines().count();
    let review = format!(
        "**Code Review — {}**\n\n**Overview:** {} lines, {} issue(s) found.\n\n{}",
        lang.to_uppercase(), lines, issues.len(),
        if issues.is_empty() { "Your code looks good! No issues found.".to_string() } else { "Some issues were found. Review them above.".to_string() }
    );
    Json(serde_json::json!({ "review": review, "issues": issues, "score": score, "source": "static" }))
}

pub async fn explain_code(
    Json(input): Json<ExplainInput>,
) -> Json<serde_json::Value> {
    let code = input.code.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "code".to_string());

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: "You are a code explanation tool. Explain the given code in simple terms.".into() },
        LLMMessage { role: LLMRole::User, content: format!("Explain this {} code:\n```\n{}\n```\nProvide a clear, structured explanation with line-by-line breakdown.", lang, code) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(response) => {
            return Json(serde_json::json!({"explanation": response, "source": "ai"}));
        }
        Err(_) => {}
    }

    let mut explanation = format!("**Code Explanation — {}**\n\n", lang.to_uppercase());
    let lines = code.lines().count();
    let has_functions = code.contains("function") || code.contains("=>") || code.contains("def ") || code.contains("fn ");
    let has_loops = code.contains("for ") || code.contains("while ");
    let has_conditionals = code.contains("if ") || code.contains("else");
    explanation.push_str(&format!("This code is **{} lines** long.", lines));
    if has_functions { explanation.push_str(" It defines one or more **functions**."); }
    if has_loops { explanation.push_str(" Uses **loops** for iteration."); }
    if has_conditionals { explanation.push_str(" Uses **conditionals** for decision making."); }
    explanation.push_str("\n\n**Line-by-line breakdown:**");
    for (i, line) in code.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') { continue; }
        let desc = if trimmed.starts_with("function") || trimmed.starts_with("def ") || trimmed.starts_with("fn ") { "Function definition" }
        else if trimmed.starts_with("if ") || trimmed.starts_with("else") || trimmed.starts_with("elif") { "Conditional branch" }
        else if trimmed.starts_with("for ") || trimmed.starts_with("while ") { "Loop" }
        else if trimmed.starts_with("return ") { "Returns a value" }
        else if trimmed.starts_with("const ") || trimmed.starts_with("let ") || trimmed.starts_with("var ") { "Variable declaration" }
        else if trimmed.starts_with("import ") || trimmed.starts_with("require") { "Import statement" }
        else if trimmed.starts_with("console.log") || trimmed.starts_with("print(") { "Output" }
        else { "Statement" };
        explanation.push_str(&format!("\n• **Line {}:** {} — `{}`", i + 1, desc, trim_length(trimmed, 50)));
    }
    explanation.push_str("\n\n**Try this:** Modify values in the editor, then test to see how the output changes!");
    Json(serde_json::json!({ "explanation": explanation, "source": "static" }))
}

fn trim_length(s: &str, max: usize) -> String {
    if s.len() > max { format!("{}...", &s[..max]) } else { s.to_string() }
}

pub async fn proxy_request(
    Json(input): Json<ProxyInput>,
) -> Json<serde_json::Value> {
    let url = &input.url;
    let method = input.method.as_deref().unwrap_or("GET");

    if url.contains("localhost") || url.contains("127.0.0.1") || url.contains("169.254") || url.contains("0.0.0.0") {
        return Json(serde_json::json!({"error": "Forbidden URL","status": 0,"body": "","time": 0,"size": 0}));
    }

    match reqwest::Client::builder().timeout(std::time::Duration::from_secs(15)).build() {
        Ok(client) => {
            let start = std::time::Instant::now();
            let req = match method.to_uppercase().as_str() {
                "GET" => client.get(url),
                "POST" => { let mut r = client.post(url); if let Some(body) = &input.body { r = r.body(body.clone()); } r }
                "PUT" => { let mut r = client.put(url); if let Some(body) = &input.body { r = r.body(body.clone()); } r }
                "DELETE" => client.delete(url),
                _ => client.get(url),
            };

            match req.send().await {
                Ok(resp) => {
                    let status = resp.status().as_u16();
                    let headers: serde_json::Value = serde_json::to_value(
                        resp.headers().iter().map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string())).collect::<Vec<_>>()
                    ).unwrap_or_default();
                    let elapsed = start.elapsed();
                    match resp.text().await {
                        Ok(body) => {
                            let display_body = serde_json::from_str::<serde_json::Value>(&body)
                                .map(|v| serde_json::to_string_pretty(&v).unwrap_or(body.clone())).unwrap_or(body.clone());
                            Json(serde_json::json!({"status": status,"headers": headers,"body": body,"displayBody": display_body,"time": elapsed.as_millis(),"size": body.len()}))
                        }
                        Err(e) => Json(serde_json::json!({"error": e.to_string(),"status": status,"body": "","time": elapsed.as_millis(),"size": 0})),
                    }
                }
                Err(e) => Json(serde_json::json!({"error": e.to_string(),"status": 0,"body": "","time": 0,"size": 0})),
            }
        }
        Err(e) => Json(serde_json::json!({"error": e.to_string(),"status": 0,"body": "","time": 0,"size": 0})),
    }
}

pub async fn benchmark(
    Query(query): Query<std::collections::HashMap<String, String>>,
) -> Json<serde_json::Value> {
    let n: u64 = query.get("n").and_then(|v| v.parse().ok()).unwrap_or(10000);
    let start = std::time::Instant::now();
    let mut sum: u64 = 0;
    for i in 0..n { sum += i * i; }
    let elapsed = start.elapsed();
    let ms = elapsed.as_secs_f64() * 1000.0;
    let ops_per_sec = if ms > 0.0 { (n as f64 / (ms / 1000.0)) as u64 } else { 0 };
    Json(serde_json::json!({"backend": "Rust (Axum)","version": env!("CARGO_PKG_VERSION"),"iterations": n,"result": sum,"timeMs": (ms * 100.0).round() / 100.0,"opsPerSec": ops_per_sec}))
}

pub async fn ollama_models() -> Json<serde_json::Value> {
    let endpoint = crate::config().local.endpoint.clone();
    match kodex_ai::providers::local::list_models(&endpoint).await {
        Ok(models) => Json(serde_json::json!({"models": models})),
        Err(_) => Json(serde_json::json!({"models": []})),
    }
}
