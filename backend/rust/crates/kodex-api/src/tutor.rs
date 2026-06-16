use std::collections::HashMap;
use std::convert::Infallible;

use axum::{
    extract::Query,
    Json,
    response::sse::{Event, Sse},
    http::StatusCode,
};
use tokio_stream::StreamExt;

use kodex_core::types::{ExplainTopicInput, StartExerciseInput, AttemptExerciseInput, LLMMessage, LLMRole};

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

fn extract_explanation(topic_data: &serde_json::Value) -> String {
    match topic_data {
        serde_json::Value::Object(_) => {
            topic_data.get("exp")
                .or_else(|| topic_data.get("explanation"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        }
        serde_json::Value::Array(arr) => {
            arr.first()
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        }
        serde_json::Value::String(s) => s.clone(),
        _ => String::new(),
    }
}

fn lookup_topic_in_curriculum(lang: &str, topic: &str) -> Option<(String, String)> {
    let content_dir = crate::config().content_dir.clone();
    let file_path = content_dir.join(format!("{}.json", lang));
    let data = std::fs::read_to_string(&file_path).ok()?;
    let curriculum: serde_json::Value = serde_json::from_str(&data).ok()?;
    let lower_topic = topic.to_lowercase();
    if let Some(obj) = curriculum.as_object() {
        for (_phase_name, phase_data) in obj {
            if let Some(topics) = phase_data.as_object() {
                for (topic_name, topic_data) in topics {
                    if topic_name.to_lowercase() == lower_topic {
                        let exp = extract_explanation(topic_data);
                        return Some((topic_name.clone(), exp));
                    }
                }
            }
        }
    }
    None
}

fn format_curriculum_content(topic: &str, content: &str) -> String {
    // Split on likely HTML tags to provide a clean markdown-style explanation
    let cleaned = content
        .replace("<p>", "\n\n")
        .replace("</p>", "")
        .replace("<code>", "`")
        .replace("</code>", "`")
        .replace("<strong>", "**")
        .replace("</strong>", "**")
        .replace("<em>", "_")
        .replace("</em>", "_")
        .replace("<br>", "\n")
        .replace("<br/>", "\n")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&");
    format!(
        "**{}**\n\n{}",
        topic,
        cleaned.trim()
    )
}

async fn build_explanation(input: &ExplainTopicInput) -> (String, String, String) {
    let topic = input.topic.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());
    let use_ai = input.use_ai.unwrap_or(true);

    // Try language-specific curriculum file first (exact match)
    if let Some((matched_name, exp)) = lookup_topic_in_curriculum(&lang, &topic) {
        let explanation = format_curriculum_content(&matched_name, &exp);
        return (explanation, matched_name, "curriculum".to_string());
    }

    // Fall back to cross-language embedding search
    let engine = crate::embedding_engine();
    if let Some(content) = engine.get_content(&topic) {
        let explanation = format_curriculum_content(&topic, content);
        return (explanation, topic, "curriculum".to_string());
    }

    let results = engine.search(&topic, 1);
    if let Some((matched_topic, _score)) = results.first() {
        if let Some(content) = engine.get_content(matched_topic) {
            let explanation = if matched_topic.to_lowercase() == topic.to_lowercase() {
                format_curriculum_content(&topic, content)
            } else {
                format!(
                    "I found content about **{}** which is closely related to '{}':\n\n{}",
                    matched_topic,
                    topic,
                    format_curriculum_content(matched_topic, content)
                )
            };
            return (explanation, matched_topic.clone(), "curriculum".to_string());
        }
    }

    if !use_ai {
        return (static_explain(&topic, &lang), topic, "static".to_string());
    }

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: crate::config().system_prompt.clone() },
        LLMMessage { role: LLMRole::User, content: format!("Explain the topic '{}' in {} in a clear, structured way. Include examples and key concepts.", topic, lang) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(explanation) => (explanation, topic, "ai".to_string()),
        Err(_) => (static_explain(&topic, &lang), topic, "fallback".to_string()),
    }
}

pub async fn explain_topic(
    Json(input): Json<ExplainTopicInput>,
) -> Result<Sse<impl tokio_stream::Stream<Item = Result<Event, Infallible>>>, (StatusCode, Json<serde_json::Value>)> {
    let topic = input.topic.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());

    let (explanation, _matched_topic, _source) = build_explanation(&input).await;

    let content_event = Event::default()
        .data(serde_json::json!({"content": explanation, "topic": topic, "lang": lang}).to_string());
    let done_event = Event::default().data("[DONE]");
    let stream = tokio_stream::once(Ok::<_, Infallible>(content_event))
        .chain(tokio_stream::once(Ok::<_, Infallible>(done_event)));

    Ok(Sse::new(stream))
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

#[derive(serde::Deserialize)]
pub struct TutorRecommendParams {
    pub learner_id: Option<String>,
    pub lang: Option<String>,
}

pub async fn tutor_recommend(
    Query(params): Query<TutorRecommendParams>,
) -> Json<serde_json::Value> {
    let learner_id = params.learner_id.unwrap_or_else(|| "default".to_string());
    let lang = params.lang.unwrap_or_else(|| "js".to_string());

    let learner_path = crate::config().data_dir.join("learners").join(format!("{}.json", learner_id));
    let completed_topics: std::collections::HashSet<String> = if let Ok(data) = std::fs::read_to_string(&learner_path) {
        if let Ok(profile) = serde_json::from_str::<serde_json::Value>(&data) {
            profile.get("topics")
                .and_then(|t| t.as_array())
                .map(|arr| arr.iter()
                    .filter_map(|t| t.get("topic").and_then(|v| v.as_str().map(String::from)))
                    .collect())
                .unwrap_or_default()
        } else {
            std::collections::HashSet::new()
        }
    } else {
        std::collections::HashSet::new()
    };

    let content_dir = crate::config().content_dir.clone();
    let file_path = content_dir.join(format!("{}.json", lang));

    let recommendation = (|| -> Option<serde_json::Value> {
        let data = std::fs::read_to_string(&file_path).ok()?;
        let curriculum: HashMap<String, serde_json::Value> = serde_json::from_str(&data).ok()?;
        for (phase_name, phase_data) in &curriculum {
            if let Some(topics) = phase_data.as_object() {
                for topic_name in topics.keys() {
                    if !completed_topics.contains(topic_name) {
                        return Some(serde_json::json!({
                            "topic": topic_name,
                            "phase": phase_name,
                            "reason": "next-incomplete"
                        }));
                    }
                }
            }
        }
        None
    })();

    Json(serde_json::json!({
        "recommendation": recommendation.unwrap_or(serde_json::json!({"topic": null, "reason": "all-complete"}))
    }))
}
