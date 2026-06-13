use async_trait::async_trait;
use kodex_core::error::AppError;
use kodex_core::types::TutorContext;
use super::TutorStrategy;

pub struct KeywordMatchStrategy;

impl KeywordMatchStrategy {
    fn match_keywords(&self, message: &str) -> Option<String> {
        let lower = message.trim().to_lowercase();

        if lower.contains("thank") || lower.contains("thanks") || lower.contains("thx") {
            return Some("You're welcome! Keep up the great work! 😊".to_string());
        }
        if lower.contains("variable") || lower.contains("let ") || lower.contains("const ") {
            return Some("**Variables** are containers for storing data values.\n\n• Use descriptive names like `userCount` instead of `x`\n• `let` for mutable variables, `const` for constants\n• Think about scope — where can this variable be accessed?\n\nWant me to show you an example?".to_string());
        }
        if lower.contains("function") || lower.contains("method") || lower.contains("def ") || lower.contains("fn ") {
            return Some("**Functions** are reusable blocks of code.\n\n• They take inputs (parameters) and return outputs\n• Good functions do ONE thing well\n• Name them with verbs like `calculateTotal`\n\nWould you like to see a function example?".to_string());
        }
        if lower.contains("loop") || lower.contains("for ") || lower.contains("while ") {
            return Some("**Loops** let you repeat code.\n\n• `for` loops: when you know how many times\n• `while` loops: when you have a condition\n• Be careful of infinite loops!\n\nNeed a loop example?".to_string());
        }
        if lower.contains("array") || lower.contains("list") || lower.contains("vector") {
            return Some("**Arrays/Lists** hold ordered collections.\n\n• Access by index (starting at 0)\n• Common operations: add, remove, find, filter\n• Arrays can hold mixed types in some languages\n\nWant to see array operations?".to_string());
        }
        if lower.contains("object") || lower.contains("struct") || lower.contains("dictionary") {
            return Some("**Objects/Structs** group related data together.\n\n• Key-value pairs for organized data\n• Access with dot notation or brackets\n• Great for modeling real-world things\n\nInterested in object examples?".to_string());
        }
        if lower.contains("class") || lower.contains("inheritance") || lower.contains("oop") || lower.contains("object-oriented") {
            return Some("**Object-Oriented Programming** organizes code around objects.\n\n• Classes are blueprints for objects\n• Encapsulation: keep data and methods together\n• Inheritance: reuse code from parent classes\n• Polymorphism: same interface, different implementations\n\nWant to dive into OOP?".to_string());
        }
        if lower.contains("type") || lower.contains("interface") || lower.contains("generic") {
            return Some("**Types** define what kind of data a value can hold.\n\n• Static types catch errors at compile time\n• Type inference lets the compiler figure it out\n• Generics let you write reusable, type-safe code\n\nInterested in type examples?".to_string());
        }
        if lower.contains("recursion") || lower.contains("recursive") {
            return Some("**Recursion** is when a function calls itself.\n\n• Every recursive function needs a base case (to stop)\n• And a recursive case (to call itself)\n• Think of it like Russian nesting dolls\n\nWant a recursion example?".to_string());
        }
        if lower.contains("sort") || lower.contains("search") || lower.contains("algorithm") {
            return Some("**Algorithms** are step-by-step problem-solving procedures.\n\n• Sorting: bubble, quick, merge sort\n• Searching: linear, binary search\n• Choose the right algorithm for your data size\n\nWant to learn a specific algorithm?".to_string());
        }

        None
    }
}

#[async_trait]
impl TutorStrategy for KeywordMatchStrategy {
    fn name(&self) -> &'static str { "keyword_match" }
    fn priority(&self) -> u32 { 400 }

    async fn can_handle(&self, context: &TutorContext) -> bool {
        self.match_keywords(&context.message).is_some()
    }

    async fn handle(&self, context: &TutorContext) -> Result<String, AppError> {
        Ok(self.match_keywords(&context.message).unwrap_or_default())
    }
}
