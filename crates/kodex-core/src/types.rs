use serde::{Deserialize, Serialize};

// ── Code Execution ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecResult {
    pub output: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerExecResult {
    pub output: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_results: Option<Vec<HttpTestResult>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub all_passed: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChunk {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpTest {
    pub method: String,
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub headers: Option<std::collections::HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<serde_json::Value>,
    pub expected_status: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_body_substring: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_body_shape: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpTestResult {
    pub method: String,
    pub path: String,
    pub status: i32,
    pub expected_status: i32,
    pub body_match: bool,
    pub shape_match: bool,
    pub passed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

// ── Runner Configuration ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunnerConfig {
    pub cmd: String,
    pub ext: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub src: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DockerRunnerConfig {
    pub image: String,
    pub ext: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub src: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub compile_cmd: Option<String>,
    pub run_cmd: String,
    pub needs_compile: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memory_limit: Option<String>,
}

// ── Compiler / Database Status ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompilerEntry {
    pub available: bool,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseStatus {
    pub sqlite: DbInitStatus,
    pub pg: DbInitStatus,
    pub mysql: DbInitStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbInitStatus {
    pub available: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

// ── AI / LLM ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMMessage {
    pub role: LLMRole,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LLMRole {
    System,
    User,
    Assistant,
}

impl std::fmt::Display for LLMRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::System => write!(f, "system"),
            Self::User => write!(f, "user"),
            Self::Assistant => write!(f, "assistant"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiResponseEntry {
    pub keywords: Vec<String>,
    pub response: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderOverride {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub endpoint: Option<String>,
}

// ── Quiz ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizQuestion {
    pub question: String,
    pub options: Vec<String>,
    pub correct_index: i32,
    pub explanation: String,
}

// ── Learner ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningPathStep {
    pub phase: String,
    pub topic: String,
    pub reason: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningPathResponse {
    pub lang: String,
    pub progress: LearningProgress,
    pub next_steps: Vec<LearningPathStep>,
    pub weak_areas: Vec<WeakArea>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningProgress {
    pub completed: i32,
    pub total: i32,
    pub percent: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeakArea {
    pub topic: String,
    pub mastery: f64,
}

// ── Health ──

#[derive(Debug, Clone, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub db: DatabaseStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ollama: Option<String>,
    pub config_ok: bool,
}

// ── Rate Limit ──

#[derive(Debug, Clone, Serialize)]
pub struct RateLimitInfo {
    pub window: String,
    pub max: u32,
}

// ── WebSocket ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WSStats {
    pub connected: usize,
    pub authenticated: usize,
}

// ── Auth Payload ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthPayload {
    pub user_id: String,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exp: Option<u64>,
}

// ── Progress ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressEntry {
    pub lang: String,
    pub topic: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed: Option<bool>,
}

// ── Tutor Context ──

#[derive(Debug, Clone)]
pub struct TutorContext {
    pub message: String,
    pub q: String,
    pub lang: Option<String>,
    pub topic: Option<String>,
    pub phase: Option<String>,
    pub code: Option<String>,
    pub output: Option<String>,
    pub has_error: Option<bool>,
    pub history: Option<Vec<HistoryEntry>>,
    pub learner_id: Option<String>,
    pub lid: String,
    pub provider_config: Option<ProviderOverride>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub role: String,
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
}

// ── Chat ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatInput {
    pub message: String,
    pub lang: Option<String>,
    pub topic: Option<String>,
    pub phase: Option<String>,
    pub code: Option<String>,
    pub output: Option<String>,
    pub has_error: Option<bool>,
    pub history: Option<Vec<HistoryEntry>>,
    pub learner_id: Option<String>,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub api_key: Option<String>,
    pub endpoint: Option<String>,
}

// ── Execute Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecuteInput {
    pub lang: String,
    pub code: String,
    pub stdin: Option<String>,
    pub server_mode: Option<bool>,
    pub http_tests: Option<Vec<HttpTest>>,
}

// ── Explain Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExplainInput {
    pub code: String,
    pub lang: Option<String>,
    pub topic: Option<String>,
}

// ── Review Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewInput {
    pub code: String,
    pub lang: Option<String>,
    pub topic: Option<String>,
    pub learner_id: Option<String>,
}

// ── Exercise Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExerciseInput {
    pub topic: String,
    pub lang: Option<String>,
    pub level: Option<String>,
}

// ── Quiz Generate Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizGenerateInput {
    pub topic: String,
    pub lang: Option<String>,
    pub count: Option<i32>,
    pub level: Option<String>,
}

// ── Learner Track Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearnerTrackInput {
    pub event: String,
    pub lang: Option<String>,
    pub topic: Option<String>,
    pub phase: Option<String>,
    pub data: Option<TrackData>,
    pub learner_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackData {
    pub correct: Option<i32>,
    pub total: Option<i32>,
    pub solved: Option<bool>,
}

// ── Auth Inputs ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegisterInput {
    pub email: String,
    pub password: String,
    pub name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginInput {
    pub email: String,
    pub password: String,
}

// ── Project Inputs ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub language: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateProjectInput {
    pub name: Option<String>,
    pub language: Option<String>,
    pub description: Option<String>,
    pub files: Option<std::collections::HashMap<String, String>>,
}

// ── Content Update ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateContentInput {
    pub data: std::collections::HashMap<String, serde_json::Value>,
}

// ── Proxy Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyInput {
    pub method: Option<String>,
    pub url: String,
    pub headers: Option<std::collections::HashMap<String, String>>,
    pub body: Option<String>,
}

// ── Tutor Inputs ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExplainTopicInput {
    pub topic: String,
    pub lang: Option<String>,
    pub phase: Option<String>,
    pub learner_id: Option<String>,
    pub code: Option<String>,
    pub include_checkin: Option<bool>,
    pub use_ai: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartExerciseInput {
    pub topic: String,
    pub lang: Option<String>,
    pub level: Option<String>,
    pub learner_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttemptExerciseInput {
    pub topic: String,
    pub lang: Option<String>,
    pub code: String,
    pub learner_id: Option<String>,
}

// ── Analyze Input ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzeInput {
    pub code: Option<String>,
    pub lang: Option<String>,
}
