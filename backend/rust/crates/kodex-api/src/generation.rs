use axum::{
    Router,
    routing::post,
    Json,
    http::StatusCode,
};

use kodex_core::types::{ExerciseInput, QuizGenerateInput, LLMMessage, LLMRole};

pub fn routes() -> Router {
    Router::new()
        .route("/api/exercise", post(generate_exercise))
        .route("/api/quiz/generate", post(generate_quiz))
}

fn get_exercise_content(topic: &str, lang: &str) -> (String, String, String) {
    match topic.to_lowercase().as_str() {
        "variables" => ("Declare a variable with your name as a string, then print it.".to_string(), format!("// Declare your variable here\nlet name = \"Your Name\";\nconsole.log(name);"), "Use `let variableName = value;` syntax.".to_string()),
        "functions" => ("Write a function that takes two numbers and returns their sum.".to_string(), format!("function add(a, b) {{\n  // Your code here\n}}\nconsole.log(add(2, 3)); // should print 5"), "Use the `return` keyword to send back a value.".to_string()),
        "loops" => ("Write a for loop that prints numbers 1 through 10.".to_string(), format!("// Write your loop here\nfor (let i = 1; i <= 10; i++) {{\n  console.log(i);\n}}"), "A for loop has: initializer, condition, increment.".to_string()),
        "arrays" => ("Write a function that takes an array of numbers and returns their sum.".to_string(), format!("function sumArray(arr) {{\n  // Your code here\n}}\nconsole.log(sumArray([1, 2, 3, 4])); // should print 10"), "Use a loop to accumulate values, or use the reduce method.".to_string()),
        "strings" => ("Write a function to reverse a string.".to_string(), "function reverseString(str) {\n  // Your code here\n}\nconsole.log(reverseString(\"hello\")); // should print \"olleh\"".to_string(), "Use `.split()`, `.reverse()`, and `.join()`.".to_string()),
        "conditionals" => ("Write a function that tells whether a number is even or odd.".to_string(), "function evenOrOdd(n) {\n  // Your code here\n}\nconsole.log(evenOrOdd(4)); // should print \"even\"\nconsole.log(evenOrOdd(7)); // should print \"odd\"".to_string(), "Use the modulo operator `%` to check divisibility by 2.".to_string()),
        "objects" => ("Create an object with `name`, `age`, and `email` properties, then print the name.".to_string(), "const user = {\n  // Your code here\n};\nconsole.log(user.name);".to_string(), "Object properties are key-value pairs separated by commas.".to_string()),
        "classes" => ("Create a class with a constructor and a method.".to_string(), "class MyClass {\n  constructor(value) {\n    this.value = value;\n  }\n  // Add a method here\n}\nconst obj = new MyClass(\"hello\");".to_string(), "Methods are functions defined inside the class body.".to_string()),
        "error_handling" => ("Write a try/catch block to handle errors gracefully.".to_string(), "try {\n  // Risky code here\n} catch (e) {\n  console.log(\"Caught:\", e.message);\n}".to_string(), "The catch block receives the error object with a `message` property.".to_string()),
        _ => (format!("Write code related to \"{}\" in {}.", topic, lang), format!("// Practice: {}\n// Write your code here\n", topic), format!("Review the {} concept and try implementing it step by step.", topic)),
    }
}

fn static_exercise(topic: &str, lang: &str, _level: &str) -> serde_json::Value {
    let (desc, starter, hint) = get_exercise_content(topic, lang);
    serde_json::json!({"title": format!("Practice: {}", topic), "description": desc, "starterCode": starter, "solution": "", "hint": hint, "test": "true"})
}

pub async fn generate_exercise(
    Json(input): Json<ExerciseInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let topic = input.topic.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());
    let level = input.level.clone().unwrap_or_else(|| "beginner".to_string());

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: "You are an exercise generator. Return ONLY a JSON object with fields: title, description, starterCode, hint, and test (boolean).".into() },
        LLMMessage { role: LLMRole::User, content: format!("Create a {} level programming exercise for topic '{}' in {}. Return ONLY JSON. Do not wrap in markdown.", level, topic, lang) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(response) => {
            let cleaned = response.trim()
                .strip_prefix("```json").unwrap_or(&response)
                .strip_prefix("```").unwrap_or(&response)
                .strip_suffix("```").unwrap_or(&response)
                .trim();
            if let Ok(exercise) = serde_json::from_str::<serde_json::Value>(cleaned) {
                return Ok(Json(serde_json::json!({"exercise": exercise, "source": "ai"})));
            }
            Ok(Json(serde_json::json!({"exercise": static_exercise(&topic, &lang, &level), "source": "fallback"})))
        }
        Err(_) => Ok(Json(serde_json::json!({"exercise": static_exercise(&topic, &lang, &level), "source": "static"}))),
    }
}

fn static_quiz(topic: &str, _lang: &str, count: u32) -> Vec<serde_json::Value> {
    let mut questions = Vec::new();
    match topic.to_lowercase().as_str() {
        "variables" => {
            questions.push(serde_json::json!({"question": "What keyword is used to declare a block-scoped variable in JavaScript?","options": ["let","var","int","string"],"correctIndex": 0,"explanation": "`let` declares a block-scoped variable. `var` is function-scoped."}));
            questions.push(serde_json::json!({"question": "Which of the following is NOT a valid variable name?","options": ["myVariable","_count","2ndPlace","$price"],"correctIndex": 2,"explanation": "Variable names can't start with a number."}));
        }
        "functions" => {
            questions.push(serde_json::json!({"question": "What does a function return if it has no return statement?","options": ["null","undefined","0","false"],"correctIndex": 1,"explanation": "Functions without a return statement return `undefined` by default."}));
            questions.push(serde_json::json!({"question": "Which is the correct way to define a function?","options": ["function myFunc() {}","def myFunc():","func myFunc() {}","fn myFunc() {}"],"correctIndex": 0,"explanation": "In JavaScript, functions are defined with `function myFunc() {}`."}));
        }
        "arrays" => {
            questions.push(serde_json::json!({"question": "What is the index of the first element in an array?","options": ["0","1","-1","It depends on the language"],"correctIndex": 0,"explanation": "Arrays are zero-indexed in most programming languages."}));
            questions.push(serde_json::json!({"question": "Which method adds an element to the end of an array?","options": ["push()","pop()","shift()","unshift()"],"correctIndex": 0,"explanation": "`push()` adds one or more elements to the end of an array."}));
        }
        _ => {
            questions.push(serde_json::json!({"question": format!("What is the best way to learn {}?", topic),"options": ["Practice with small examples","Read documentation only","Watch videos only","Skip it and learn something else"],"correctIndex": 0,"explanation": "Hands-on practice is the most effective way to learn programming concepts."}));
            questions.push(serde_json::json!({"question": format!("Which of these is related to {}?", topic),"options": [format!("Understanding {} syntax", topic),"File system operations","Network protocols","Database design"],"correctIndex": 0,"explanation": format!("{} is a programming concept with specific syntax and patterns.", topic)}));
        }
    }
    while (questions.len() as u32) < count.min(6) {
        questions.push(serde_json::json!({"question": format!("What is a common pattern used with {}?", topic),"options": ["Using it correctly","Avoiding it entirely","Only using it on Tuesdays","Asking Stack Overflow"],"correctIndex": 0,"explanation": "Following established patterns leads to cleaner, more maintainable code."}));
    }
    questions.truncate(count as usize);
    questions
}

pub async fn generate_quiz(
    Json(input): Json<QuizGenerateInput>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let topic = input.topic.clone();
    let lang = input.lang.clone().unwrap_or_else(|| "js".to_string());
    let count = input.count.unwrap_or(3).min(10) as u32;

    let provider = crate::ai_provider();
    let provider_config = crate::config().openai.clone();
    let messages = vec![
        LLMMessage { role: LLMRole::System, content: "You are a quiz generator. Return ONLY a JSON array of question objects. Do not wrap in markdown.".into() },
        LLMMessage { role: LLMRole::User, content: format!("Create {} multiple choice questions about '{}' in {}. Each question has fields: question (string), options (string array), correctIndex (int), explanation (string). Return ONLY JSON array.", count, topic, lang) },
    ];

    match provider.chat(messages, &provider_config).await {
        Ok(response) => {
            let cleaned = response.trim()
                .strip_prefix("```json").unwrap_or(&response)
                .strip_prefix("```").unwrap_or(&response)
                .strip_suffix("```").unwrap_or(&response)
                .trim();
            if let Ok(questions) = serde_json::from_str::<Vec<serde_json::Value>>(cleaned) {
                return Ok(Json(serde_json::json!({"questions": questions, "source": "ai"})));
            }
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(cleaned) {
                if let Some(questions) = val["questions"].as_array() {
                    return Ok(Json(serde_json::json!({"questions": questions, "source": "ai"})));
                }
            }
            let questions = static_quiz(&topic, &lang, count);
            Ok(Json(serde_json::json!({"questions": questions, "source": "fallback"})))
        }
        Err(_) => {
            let questions = static_quiz(&topic, &lang, count);
            Ok(Json(serde_json::json!({"questions": questions, "source": "static"})))
        }
    }
}
