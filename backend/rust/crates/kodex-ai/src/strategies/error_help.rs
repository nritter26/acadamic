use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::TutorContext;
use super::TutorStrategy;

pub struct ErrorHelpStrategy;

#[async_trait]
impl TutorStrategy for ErrorHelpStrategy {
    fn name(&self) -> &'static str { "error_help" }
    fn priority(&self) -> u32 { 200 }

    async fn can_handle(&self, context: &TutorContext) -> bool {
        if context.has_error.unwrap_or(false) {
            return true;
        }
        let msg = context.message.to_lowercase();
        msg.contains("error") || msg.contains("bug") || msg.contains("fix")
            || msg.contains("broken") || msg.contains("not working")
            || msg.contains("doesn't work") || msg.contains("does not work")
            || msg.contains("crash") || msg.contains("fail")
            || msg.contains("exception") || msg.contains("wrong")
    }

    async fn handle(&self, context: &TutorContext) -> Result<String, AppError> {
        let has_code = context.code.as_deref().map(|c| !c.is_empty()).unwrap_or(false);
        let has_output = context.output.as_deref().map(|o| !o.is_empty()).unwrap_or(false);

        let mut response = String::from("Let me help you debug this! ");
        if has_code {
            response.push_str("I can see your code. ");
        }
        if has_output {
            response.push_str(&format!("The output shows: ```\n{}\n``` ", context.output.as_deref().unwrap_or("")));
        }
        response.push_str("\n\n**Debugging tips:**\n\
            1. Read the error message carefully — it tells you what went wrong and where\n\
            2. Check line numbers mentioned in the error\n\
            3. Add print/log statements to see variable values at different points\n\
            4. Try isolating the problem — comment out sections until the error disappears\n\
            5. Check for common issues: typos, missing imports, wrong types\n\n\
            Could you share the exact error message and the relevant code?");
        Ok(response)
    }
}
