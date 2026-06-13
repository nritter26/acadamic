use axum::{
    Router,
    routing::post,
    Json,
    http::StatusCode,
};

use kodex_core::types::{ExplainTopicInput, StartExerciseInput, AttemptExerciseInput, LLMMessage, LLMRole};

pub fn routes() -> Router {
    Router::new()
        .route("/api/tutor/explain-topic", post(explain_topic))
        .route("/api/tutor/start-exercise", post(start_exercise))
        .route("/api/tutor/attempt-exercise", post(attempt_exercise))
}

fn static_explain(topic: &str, lang: &str) -> String {
    format!(
        "**{}**\n\nThis is a key concept in {}. Here's what you need to know:\n\n\
         **What is {}?**\nIt's a fundamental programming concept that helps you write better code.\n\n\
         **Why is it useful?**\nUnderstanding {} will help you solve problems more effectively.\n\n\
         **Try it yourself:**\nOpen the code editor and experiment with examples.\n\n\
         **Need more help?**\nAsk me specific questions about {} and I'll dive deeper.",
        topic, lang, topic, topic, topic
    )
}

pub async fn explain_topic(
    Json(input): Json<ExplainTopicInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let topic = input.topic.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());
    let use_ai = input.use_ai.unwrap_or(true);

    if !use_ai {
        return Ok(Json(serde_json::json!({"explanation": static_explain(&topic, &lang), "source": "static"})));
    }

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: crate::config().system_prompt.clone() },
        LLMMessage { role: LLMRole::User, content: format!("Explain the topic '{}' in {} in a clear, structured way. Include examples and key concepts.", topic, lang) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(explanation) => Ok(Json(serde_json::json!({"explanation": explanation, "source": "ai", "topic": topic, "lang": lang}))),
        Err(_) => Ok(Json(serde_json::json!({"explanation": static_explain(&topic, &lang), "source": "fallback"}))),
    }
}

fn static_exercise(topic: &str, lang: &str, _level: &str) -> serde_json::Value {
    serde_json::json!({
        "title": format!("Practice: {}", topic),
        "description": format!("Write code related to \"{}\" in {}. Try implementing the concept you just learned.", topic, lang),
        "starterCode": format!("// Practice: {}\n// Write your code here\n", topic),
        "solution": "", "hint": format!("Review the {} section in the curriculum.", topic), "test": "true"
    })
}

pub async fn start_exercise(
    Json(input): Json<StartExerciseInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let topic = input.topic.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());
    let level = input.level.clone().unwrap_or_else(|| "beginner".to_string());

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: crate::config().system_prompt.clone() },
        LLMMessage { role: LLMRole::User, content: format!("Create a {} level programming exercise for topic '{}' in {}. Return ONLY a JSON object with fields: title, description, starterCode, hint, and test (boolean). Do not wrap in markdown.", level, topic, lang) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(response) => {
            let cleaned = response.trim()
                .strip_prefix("```json").unwrap_or(&response)
                .strip_prefix("```").unwrap_or(&response)
                .strip_suffix("```").unwrap_or(&response)
                .trim();
            if let Ok(exercise) = serde_json::from_str::<serde_json::Value>(cleaned) {
                return Ok(Json(serde_json::json!({"exercise": exercise, "sessionState": "exercising", "source": "ai"})));
            }
            Ok(Json(serde_json::json!({"exercise": serde_json::json!({"title": format!("Practice: {}", topic), "description": response, "starterCode": "", "solution": "", "hint": "", "test": true}), "sessionState": "exercising", "source": "ai"})))
        }
        Err(_) => {
            let exercise = static_exercise(&topic, &lang, &level);
            Ok(Json(serde_json::json!({"exercise": exercise, "sessionState": "exercising", "source": "static"})))
        }
    }
}

pub async fn attempt_exercise(
    Json(input): Json<AttemptExerciseInput>,
) -> Json<serde_json::Value> {
    let code = input.code.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());
    let topic = input.topic.clone();

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: crate::config().system_prompt.clone() },
        LLMMessage { role: LLMRole::User, content: format!("Review this {} code for the topic '{}':\n\n```{}\n```\n\nProvide feedback as JSON: {{ \"review\": \"...\", \"score\": 0-10, \"issues\": [{{\"line\": N, \"message\": \"...\", \"severity\": \"error|warning|style\"}}], \"passed\": true/false }}. Do not wrap in markdown.", lang, topic, code) },
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
    let has_errors;
    if lang == "js" || lang == "ts" {
        let open_braces = code.matches('{').count();
        let close_braces = code.matches('}').count();
        has_errors = open_braces != close_braces;
        if has_errors {
            issues.push(serde_json::json!({"line": 0, "message": "Unbalanced curly braces", "severity": "error"}));
        }
        if code.contains("==") && !code.contains("===") {
            issues.push(serde_json::json!({"line": 0, "message": "Use `===` instead of `==` for strict equality", "severity": "warning"}));
        }
        if code.contains("var ") {
            issues.push(serde_json::json!({"line": 0, "message": "Use `let` or `const` instead of `var`", "severity": "style"}));
        }
    } else {
        has_errors = false;
    }
    let score = if has_errors { 3.0 } else if issues.is_empty() { 9.0 } else { 7.0 };
    let review = if has_errors {
        format!("Found some issues in your code. Check the {} error(s) above.", issues.len())
    } else if issues.is_empty() {
        "Your code looks good! Clean and well-structured.".to_string()
    } else {
        "Your code works, but here are some suggestions to improve it:".to_string()
    };

    Json(serde_json::json!({
        "review": review, "score": score, "issues": issues,
        "attempts": 1, "passed": !has_errors, "source": "static"
    }))
}
