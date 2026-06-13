use std::pin::Pin;

use async_trait::async_trait;
use futures_util::{Stream, stream};
use kodex_core::config::{AiProvider as ProviderKind, ProviderConfig};
use kodex_core::error::AppError;
use kodex_core::types::{LLMMessage, LLMRole};

pub struct KeywordProvider;

pub fn create() -> Box<dyn super::super::provider::AiProvider> {
    Box::new(KeywordProvider)
}

fn match_keywords(message: &str) -> Option<String> {
    let lower = message.trim().to_lowercase();

    if lower.starts_with("hi") || lower.starts_with("hello") || lower.starts_with("hey") {
        return Some("Hey there! I'm your coding buddy. What are you working on?".to_string());
    }
    if lower.contains("thank") || lower.contains("thanks") || lower.contains("thx") {
        return Some("You're welcome! Keep up the great work!".to_string());
    }
    if lower.contains("error") || lower.contains("bug") || lower.contains("fix") || lower.contains("broken") {
        return Some("I'd be happy to help debug! Could you share the error message and the relevant code?\n\nIn the meantime, here are some debugging tips:\n1. Read the error message carefully — it usually points to the exact problem\n2. Check line numbers mentioned in the error\n3. Add console.log() or print statements to check variable values\n4. Try isolating the problematic section".to_string());
    }
    if lower.contains("variable") || lower.contains("let ") || lower.contains("const ") {
        return Some("**Variables** are containers for storing data values. In most languages:\n\n• Use descriptive names like `userCount` instead of `x`\n• Choose the right declaration keyword (`let`/`const` in JS, `var` in Go, etc.)\n• Think about scope — where can this variable be accessed?\n\nWant me to show you an example?".to_string());
    }
    if lower.contains("function") || lower.contains("method") || lower.contains("def ") || lower.contains("fn ") {
        return Some("**Functions** are reusable blocks of code. Key concepts:\n\n• They take inputs (parameters) and return outputs\n• Good functions do ONE thing well\n• Name them with verbs like `calculateTotal` or `getUserName`\n\nWould you like to see a function example?".to_string());
    }
    if lower.contains("loop") || lower.contains("for ") || lower.contains("while ") {
        return Some("**Loops** let you repeat code. Key concepts:\n\n• `for` loops: when you know how many times\n• `while` loops: when you have a condition to check\n• Be careful of infinite loops! Always make sure the condition will eventually be false\n\nNeed a loop example?".to_string());
    }
    if lower.contains("array") || lower.contains("list") || lower.contains("vector") {
        return Some("**Arrays/Lists** hold ordered collections of items:\n\n• Access items by index (usually starting at 0)\n• Common operations: add, remove, find, filter, transform\n• Arrays can hold mixed types in some languages\n\nWant to see array operations?".to_string());
    }
    if lower.contains("type") || lower.contains("interface") || lower.contains("struct") {
        return Some("**Types** define what kind of data a value can hold:\n\n• Static types catch errors at compile time\n• Types include: numbers, strings, booleans, and complex types\n• Good type systems balance safety with flexibility\n\nInterested in type examples?".to_string());
    }

    None
}

#[async_trait]
impl super::super::provider::AiProvider for KeywordProvider {
    fn kind(&self) -> ProviderKind {
        ProviderKind::Keyword
    }

    async fn chat(
        &self,
        messages: Vec<LLMMessage>,
        _config: &ProviderConfig,
    ) -> Result<String, AppError> {
        let last_user_msg = messages
            .iter()
            .rev()
            .find(|m| matches!(m.role, LLMRole::User))
            .map(|m| m.content.as_str())
            .unwrap_or("");

        match match_keywords(last_user_msg) {
            Some(response) => Ok(response),
            None => Ok("I'm here to help you learn programming! Ask me about specific topics, paste your code if something's broken, or tell me what you're trying to build.".to_string()),
        }
    }

    async fn chat_stream(
        &self,
        messages: Vec<LLMMessage>,
        config: &ProviderConfig,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<String, AppError>> + Send>>, AppError> {
        let response = self.chat(messages, config).await?;
        let stream = stream::once(async { Ok(response) });
        Ok(Box::pin(stream))
    }
}
