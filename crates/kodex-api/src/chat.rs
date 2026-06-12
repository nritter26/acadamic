use axum::{
    Router,
    routing::post,
    Json,
    response::sse::{Event, Sse},
    http::StatusCode,
};
use std::convert::Infallible;
use tokio_stream::StreamExt;

use kodex_core::types::ChatInput;

pub fn routes() -> Router {
    Router::new()
        .route("/api/chat", post(chat_handler))
}

pub async fn chat_handler(
    Json(input): Json<ChatInput>,
) -> Result<Sse<impl tokio_stream::Stream<Item = Result<Event, Infallible>>>, (StatusCode, Json<serde_json::Value>)> {
    if input.message.trim().is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Message is required" })),
        ));
    }

    let context = kodex_core::types::TutorContext {
        message: input.message.clone(),
        q: input.message.clone(),
        lang: input.lang.clone(),
        topic: input.topic.clone(),
        phase: input.phase.clone(),
        code: input.code.clone(),
        output: input.output.clone(),
        has_error: input.has_error,
        history: input.history.clone(),
        learner_id: input.learner_id.clone(),
        lid: input.learner_id.clone().unwrap_or_else(|| "anonymous".to_string()),
        provider_config: None,
    };

    let pipeline = crate::strategy_pipeline();
    let response = pipeline.execute(&context).await.unwrap_or_else(|e| format!("Error: {}", e));

    if let Some(learner_id) = &input.learner_id {
        let store = crate::conversation_store();
        let _ = store.append(learner_id, "user", &input.message).await;
        let _ = store.append(learner_id, "assistant", &response).await;
    }

    let text_event = Event::default().data(response);
    let done_event = Event::default().data("[DONE]");
    let stream = tokio_stream::once(Ok::<_, Infallible>(text_event))
        .chain(tokio_stream::once(Ok::<_, Infallible>(done_event)));

    Ok(Sse::new(stream))
}
