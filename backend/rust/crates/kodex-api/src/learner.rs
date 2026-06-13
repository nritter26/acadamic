use axum::{Router, routing::{get, post}, Json, http::StatusCode};
use chrono::{Utc, NaiveDateTime, Duration};
use kodex_core::types::{
    LearnerTrackInput, LearnerProfile, TopicEntry, ReviewEntry,
    LearningPathStep, LearningProgress, WeakArea,
};

pub fn routes() -> Router {
    Router::new()
        .route("/api/learner/track", post(track_event))
        .route("/api/learner/state", get(learner_state))
        .route("/api/learner/reviews", get(learner_reviews))
        .route("/api/learner/recommend", get(learner_recommend))
        .route("/api/learner/path", get(learner_path))
}

async fn load_learner(learner_id: &str) -> Result<LearnerProfile, (StatusCode, Json<serde_json::Value>)> {
    let path = crate::config().data_dir.join("learners").join(format!("{}.json", learner_id));
    if !path.exists() {
        return Ok(LearnerProfile {
            learner_id: learner_id.to_string(),
            email: None,
            name: None,
            created_at: Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
            updated_at: Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
            topics: Vec::new(),
            conversations: 0,
        });
    }
    let contents = tokio::fs::read_to_string(&path).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": format!("Failed to read learner: {}", e)}))))?;
    serde_json::from_str(&contents)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": format!("Failed to parse learner: {}", e)}))))
}

async fn save_learner(profile: &LearnerProfile) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    let dir = crate::config().data_dir.join("learners");
    tokio::fs::create_dir_all(&dir).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": format!("Failed to create learners dir: {}", e)}))))?;
    let path = dir.join(format!("{}.json", profile.learner_id));
    let json = serde_json::to_string_pretty(profile)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": format!("Failed to serialize learner: {}", e)}))))?;
    tokio::fs::write(&path, &json).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": format!("Failed to write learner: {}", e)}))))?;
    Ok(())
}

pub async fn track_event(
    Json(input): Json<LearnerTrackInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let learner_id = input.learner_id.as_deref().unwrap_or("anonymous");
    let event = input.event.as_str();
    let lang = input.lang.as_deref().unwrap_or("js");
    let topic = input.topic.as_deref().unwrap_or("unknown");

    let mut profile = load_learner(learner_id).await?;
    profile.updated_at = Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();

    match event {
        "complete-topic" => {
            if let Some(entry) = profile.topics.iter_mut().find(|t| t.topic == topic && t.lang == lang) {
                entry.completed = true;
                entry.mastery = 1.0;
                entry.last_reviewed = Some(Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string());
                if entry.interval_days == 0 {
                    entry.interval_days = 1;
                } else {
                    entry.interval_days = (entry.interval_days as f64 * 2.0).min(30.0) as u32;
                }
                let next = Utc::now() + Duration::days(entry.interval_days as i64);
                entry.next_review = Some(next.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string());
            } else {
                let next = Utc::now() + Duration::days(1);
                profile.topics.push(TopicEntry {
                    topic: topic.to_string(),
                    phase: input.phase.as_deref().unwrap_or("").to_string(),
                    lang: lang.to_string(),
                    mastery: 1.0,
                    attempts: 1,
                    correct: 1,
                    last_reviewed: Some(Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()),
                    next_review: Some(next.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()),
                    interval_days: 1,
                    completed: true,
                });
            }
        }
        "attempt" => {
            let data = input.data.as_ref();
            let correct = data.and_then(|d| d.correct).unwrap_or(0);
            let total = data.and_then(|d| d.total).unwrap_or(1);

            if let Some(entry) = profile.topics.iter_mut().find(|t| t.topic == topic && t.lang == lang) {
                entry.attempts += 1;
                entry.correct += correct as u32;
                entry.mastery = entry.correct as f64 / entry.attempts as f64;
                entry.last_reviewed = Some(Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string());

                let quality = if correct == total { 5 } else if correct as f64 / total as f64 >= 0.8 { 3 } else { 1 };
                match quality {
                    5 => { entry.interval_days = (entry.interval_days as f64 * 2.0).min(30.0) as u32; }
                    3 => { entry.interval_days = (entry.interval_days as f64 * 1.5).min(30.0) as u32; }
                    _ => { entry.interval_days = 1; }
                }
                let next = Utc::now() + Duration::days(entry.interval_days as i64);
                entry.next_review = Some(next.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string());
            } else {
                profile.topics.push(TopicEntry {
                    topic: topic.to_string(),
                    phase: input.phase.as_deref().unwrap_or("").to_string(),
                    lang: lang.to_string(),
                    mastery: correct as f64 / total as f64,
                    attempts: 1,
                    correct: correct as u32,
                    last_reviewed: Some(Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()),
                    next_review: None,
                    interval_days: 1,
                    completed: false,
                });
            }
        }
        _ => {}
    }

    profile.conversations += 1;
    save_learner(&profile).await?;

    Ok(Json(serde_json::json!({"status": "tracked", "event": event, "learner_id": learner_id})))
}

pub async fn learner_state(
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let learner_id = params.get("learner_id").map(|s| s.as_str()).unwrap_or("anonymous");
    let profile = load_learner(learner_id).await?;

    let total = profile.topics.len();
    let completed = profile.topics.iter().filter(|t| t.completed).count();
    let avg_mastery: f64 = if total > 0 { profile.topics.iter().map(|t| t.mastery).sum::<f64>() / total as f64 } else { 0.0 };
    let due_reviews = count_due_reviews(&profile);

    Ok(Json(serde_json::json!({
        "learner_id": profile.learner_id,
        "total_topics": total,
        "completed_topics": completed,
        "avg_mastery": (avg_mastery * 100.0).round() / 100.0,
        "due_reviews": due_reviews,
        "conversations": profile.conversations,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    })))
}

fn count_due_reviews(profile: &LearnerProfile) -> usize {
    let now = Utc::now();
    profile.topics.iter().filter(|t| {
        if let Some(ref next) = t.next_review {
            if let Ok(dt) = NaiveDateTime::parse_from_str(next, "%Y-%m-%dT%H:%M:%S%.3fZ") {
                let review_time = dt.and_utc();
                return review_time <= now;
            }
        }
        false
    }).count()
}

pub async fn learner_reviews(
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let learner_id = params.get("learner_id").map(|s| s.as_str()).unwrap_or("anonymous");
    let profile = load_learner(learner_id).await?;
    let now = Utc::now();

    let due: Vec<ReviewEntry> = profile.topics.iter()
        .filter(|t| {
            if let Some(ref next) = t.next_review {
                if let Ok(dt) = NaiveDateTime::parse_from_str(next, "%Y-%m-%dT%H:%M:%S%.3fZ") {
                    return dt.and_utc() <= now;
                }
            }
            false
        })
        .map(|t| ReviewEntry {
            topic: t.topic.clone(),
            phase: t.phase.clone(),
            lang: t.lang.clone(),
            mastery: t.mastery,
            due_date: t.next_review.clone().unwrap_or_default(),
        })
        .collect();

    Ok(Json(serde_json::json!({"reviews": due, "count": due.len()})))
}

pub async fn learner_recommend(
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let learner_id = params.get("learner_id").map(|s| s.as_str()).unwrap_or("anonymous");
    let lang = params.get("lang").map(|s| s.as_str()).unwrap_or("js");
    let profile = load_learner(learner_id).await?;

    let lang_topics: Vec<&TopicEntry> = profile.topics.iter().filter(|t| t.lang == lang).collect();

    let recommendation = if let Some(weakest) = lang_topics.iter().min_by(|a, b| a.mastery.partial_cmp(&b.mastery).unwrap_or(std::cmp::Ordering::Equal)) {
        serde_json::json!({
            "topic": weakest.topic,
            "phase": weakest.phase,
            "reason": format!("Weakest area with {:.0}% mastery", weakest.mastery * 100.0),
            "mastery": weakest.mastery,
        })
    } else {
        serde_json::json!({
            "topic": "Getting Started",
            "phase": "Basics",
            "reason": "No topics tracked yet. Start with the basics.",
            "mastery": 0.0,
        })
    };

    Ok(Json(serde_json::json!({"recommendation": recommendation})))
}

pub async fn learner_path(
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let learner_id = params.get("learner_id").map(|s| s.as_str()).unwrap_or("anonymous");
    let lang = params.get("lang").map(|s| s.as_str()).unwrap_or("js");
    let profile = load_learner(learner_id).await?;

    let lang_topics: Vec<&TopicEntry> = profile.topics.iter().filter(|t| t.lang == lang).collect();
    let total = lang_topics.len();
    let completed = lang_topics.iter().filter(|t| t.completed).count();
    let percent = if total > 0 { (completed * 100 / total) as i32 } else { 0 };

    let weak_areas: Vec<WeakArea> = lang_topics.iter()
        .filter(|t| t.mastery < 0.7)
        .map(|t| WeakArea {
            topic: t.topic.clone(),
            mastery: (t.mastery * 100.0).round() / 100.0,
        })
        .collect();

    let next_steps: Vec<LearningPathStep> = lang_topics.iter()
        .filter(|t| !t.completed)
        .take(3)
        .map(|t| LearningPathStep {
            phase: t.phase.clone(),
            topic: t.topic.clone(),
            reason: format!("{:.0}% mastered, needs review", t.mastery * 100.0),
            status: "pending".to_string(),
        })
        .collect();

    Ok(Json(serde_json::json!({
        "lang": lang,
        "progress": LearningProgress { completed: completed as i32, total: total as i32, percent },
        "next_steps": next_steps,
        "weak_areas": weak_areas,
    })))
}
