use std::env;

#[derive(Debug, Clone)]
pub struct ProviderConfig {
    pub api_key: String,
    pub model: String,
    pub endpoint: String,
    pub max_tokens: u32,
}

#[derive(Debug, Clone, PartialEq)]
pub enum AiProvider {
    Keyword,
    OpenAI,
    Anthropic,
    Gemini,
    Local,
    Hybrid,
}

impl std::str::FromStr for AiProvider {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "keyword" => Ok(Self::Keyword),
            "openai" => Ok(Self::OpenAI),
            "anthropic" => Ok(Self::Anthropic),
            "gemini" => Ok(Self::Gemini),
            "local" => Ok(Self::Local),
            "hybrid" => Ok(Self::Hybrid),
            _ => Err(format!("Unknown AI provider: {}", s)),
        }
    }
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub port: u16,
    pub jwt_secret: String,
    pub log_level: String,
    pub ai_provider: AiProvider,
    pub openai: ProviderConfig,
    pub anthropic: ProviderConfig,
    pub gemini: ProviderConfig,
    pub local: ProviderConfig,
    pub system_prompt: String,
    pub pg_connection_string: Option<String>,
    pub mysql_connection_string: Option<String>,
    pub stale_topic_days: u32,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let ai_provider: AiProvider = env::var("AI_PROVIDER")
            .unwrap_or_else(|_| "hybrid".into())
            .parse()
            .unwrap_or(AiProvider::Hybrid);

        let max_tokens: u32 = env::var("AI_MAX_TOKENS")
            .unwrap_or_else(|_| "1024".into())
            .parse()
            .unwrap_or(1024);

        Self {
            port: env::var("PORT")
                .unwrap_or_else(|_| "3000".into())
                .parse()
                .unwrap_or(3000),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "kodex-dev-secret-change-in-production".into()),
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".into()),
            ai_provider,
            openai: ProviderConfig {
                api_key: env::var("OPENAI_API_KEY").unwrap_or_default(),
                model: env::var("OPENAI_MODEL")
                    .unwrap_or_else(|_| "gpt-4o-mini".into()),
                endpoint: env::var("OPENAI_ENDPOINT")
                    .unwrap_or_else(|_| "https://api.openai.com/v1".into()),
                max_tokens,
            },
            anthropic: ProviderConfig {
                api_key: env::var("ANTHROPIC_API_KEY").unwrap_or_default(),
                model: env::var("ANTHROPIC_MODEL")
                    .unwrap_or_else(|_| "claude-3-haiku-20240307".into()),
                endpoint: env::var("ANTHROPIC_ENDPOINT")
                    .unwrap_or_else(|_| "https://api.anthropic.com/v1".into()),
                max_tokens,
            },
            gemini: ProviderConfig {
                api_key: env::var("GEMINI_API_KEY").unwrap_or_default(),
                model: env::var("GEMINI_MODEL")
                    .unwrap_or_else(|_| "gemini-2.0-flash".into()),
                endpoint: env::var("GEMINI_ENDPOINT")
                    .unwrap_or_else(|_| "https://generativelanguage.googleapis.com/v1beta".into()),
                max_tokens,
            },
            local: ProviderConfig {
                api_key: String::new(),
                model: env::var("LOCAL_LLM_MODEL")
                    .unwrap_or_else(|_| "llama3.2".into()),
                endpoint: env::var("LOCAL_LLM_ENDPOINT")
                    .unwrap_or_else(|_| "http://localhost:11434/v1".into()),
                max_tokens,
            },
            system_prompt: env::var("AI_SYSTEM_PROMPT").unwrap_or_else(|_|
                "You are an expert programming tutor helping a student learn. Your role is to:\n\
                1. Explain programming concepts clearly with examples\n\
                2. Guide students to discover answers themselves (Socratic method)\n\
                3. Debug code when asked — explain what's wrong and why\n\
                4. Suggest practice exercises appropriate to their level\n\
                5. Be encouraging and patient — mistakes are learning opportunities\n\n\
                Keep explanations concise but thorough. Include code examples when relevant.\n\
                The user is working through an interactive programming curriculum.".into()
            ),
            pg_connection_string: env::var("PG_CONNECTION_STRING").ok(),
            mysql_connection_string: env::var("MYSQL_CONNECTION_STRING").ok(),
            stale_topic_days: env::var("STALE_TOPIC_DAYS")
                .unwrap_or_else(|_| "90".into())
                .parse()
                .unwrap_or(90),
        }
    }
}

pub const RATE_WINDOW_MS: u64 = 60_000;
pub const RATE_MAX: u32 = 30;
pub const REVIEW_INTERVALS: &[u32] = &[1, 3, 7, 14, 30];
pub const MAX_CONCURRENT_EXEC: usize = 4;
pub const EXEC_TIMEOUT_MS: u64 = 30_000;
pub const SESSION_TTL_MS: u64 = 3_600_000;
pub const LLM_CACHE_TTL_MS: u64 = 300_000;
pub const COMPILER_CACHE_TTL_MS: u64 = 30_000;
