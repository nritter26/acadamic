use std::collections::{HashMap, HashSet};
use std::path::Path;

use kodex_core::error::AppError;

/// A TF-IDF vectorizer and search engine for curriculum content.
#[derive(Clone)]
pub struct EmbeddingEngine {
    /// Maps normalized topic name to its TF-IDF vector
    topic_vectors: Vec<(String, Vec<f64>)>,
    /// The vocabulary (all unique terms across all documents)
    vocabulary: Vec<String>,
    /// Number of documents
    doc_count: usize,
}

/// Simple tokenizer: lowercase, split on non-alphanumeric, filter short words
pub fn tokenize(text: &str) -> Vec<String> {
    text.to_lowercase()
        .split(|c: char| !c.is_alphanumeric() && c != '\'')
        .filter(|s| s.len() > 2)
        .map(|s| s.to_string())
        .collect()
}

/// Get term frequency for a document
fn term_frequency(tokens: &[String]) -> HashMap<String, f64> {
    let mut tf = HashMap::new();
    let len = tokens.len() as f64;
    for token in tokens {
        *tf.entry(token.clone()).or_insert(0.0) += 1.0;
    }
    for count in tf.values_mut() {
        *count /= len;
    }
    tf
}

/// Extract text content from a curriculum topic value (which can be string, array, or object)
fn extract_text(value: &serde_json::Value) -> String {
    match value {
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Array(arr) => {
            arr.iter().map(extract_text).collect::<Vec<_>>().join(" ")
        }
        serde_json::Value::Object(obj) => {
            obj.values().map(extract_text).collect::<Vec<_>>().join(" ")
        }
        _ => String::new(),
    }
}

/// Default topics used when no content files are available
fn get_default_topics() -> Vec<(String, String)> {
    vec![
        ("variables".into(), "Variables store data values. let and const declare variables. Variable names should be descriptive. Use camelCase naming convention.".into()),
        ("functions".into(), "Functions are reusable blocks of code. They take parameters and return values. function keyword defines a function. Arrow functions use => syntax.".into()),
        ("loops".into(), "Loops repeat code. for loops iterate with a counter. while loops repeat while a condition is true. Avoid infinite loops.".into()),
        ("arrays".into(), "Arrays store ordered collections. Index starts at 0. push adds to end. pop removes from end. map creates a new array. filter selects elements.".into()),
        ("strings".into(), "Strings store text. Concatenate with +. Template literals use backticks. split divides a string. join combines array elements.".into()),
        ("conditionals".into(), "if else makes decisions. else if for multiple conditions. switch for many values. Ternary operator ? : for simple conditions.".into()),
        ("objects".into(), "Objects store key-value pairs. Properties can be any type. Methods are functions on objects. Access with dot notation or brackets.".into()),
        ("classes".into(), "Classes are blueprints for objects. constructor initializes properties. Methods defined on prototype. extends for inheritance.".into()),
        ("error_handling".into(), "try catch handles runtime errors. throw creates errors. finally runs regardless. Error object has message and stack properties.".into()),
    ]
}

impl EmbeddingEngine {
    /// Build the embedding engine from curriculum content files.
    /// content_dir should point to the `content/` directory with curriculum JSON files.
    pub fn new() -> Self {
        Self {
            topic_vectors: Vec::new(),
            vocabulary: Vec::new(),
            doc_count: 0,
        }
    }

    /// Build the index from curriculum JSON files in content_dir.
    /// Each JSON file has structure: { "Phase Name": { "Topic Name": { ... } } }
    /// Extract topic names and their descriptions as documents.
    pub async fn build_from_content(&mut self, content_dir: &Path) -> Result<(), AppError> {
        use tokio::fs;
        use tokio::io::AsyncReadExt;

        let mut all_docs: Vec<(String, String)> = Vec::new();

        let mut dir = fs::read_dir(content_dir)
            .await
            .map_err(|e| AppError::Internal(format!("Cannot read content dir: {}", e)))?;

        let mut entries = Vec::new();
        while let Ok(Some(entry)) = dir.next_entry().await {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "json") {
                entries.push(path);
            }
        }

        for path in &entries {
            let mut contents = String::new();
            let mut file = fs::File::open(path)
                .await
                .map_err(|e| AppError::Internal(format!("Cannot open {:?}: {}", path, e)))?;
            file.read_to_string(&mut contents)
                .await
                .map_err(|e| AppError::Internal(format!("Cannot read {:?}: {}", path, e)))?;

            if let Ok(data) = serde_json::from_str::<serde_json::Value>(&contents) {
                if let Some(obj) = data.as_object() {
                    for (_phase_name, phase_data) in obj {
                        if let Some(topics) = phase_data.as_object() {
                            for (topic_name, topic_data) in topics {
                                let text = extract_text(topic_data);
                                all_docs.push((format!("{}::{}", _phase_name, topic_name), text));
                            }
                        }
                    }
                }
            }
        }

        if all_docs.is_empty() {
            all_docs = get_default_topics();
        }

        self.build(all_docs);
        Ok(())
    }

    /// Build index from pre-collected documents
    fn build(&mut self, docs: Vec<(String, String)>) {
        self.doc_count = docs.len();
        if self.doc_count == 0 {
            return;
        }

        let mut vocab_set = HashSet::new();
        let mut doc_vectors: Vec<(String, HashMap<String, f64>)> = Vec::new();

        for (name, text) in &docs {
            let tokens = tokenize(text);
            let tf = term_frequency(&tokens);
            for token in tf.keys() {
                vocab_set.insert(token.clone());
            }
            doc_vectors.push((name.clone(), tf));
        }

        for (name, _) in &docs {
            for token in tokenize(name) {
                vocab_set.insert(token);
            }
        }

        self.vocabulary = vocab_set.into_iter().collect();
        self.vocabulary.sort();

        let vocab_size = self.vocabulary.len();
        if vocab_size == 0 {
            return;
        }

        for (name, tf) in &doc_vectors {
            let mut vector = vec![0.0_f64; vocab_size];
            for (i, term) in self.vocabulary.iter().enumerate() {
                let df = docs
                    .iter()
                    .filter(|(_, text)| text.to_lowercase().contains(term))
                    .count()
                    .max(1);

                let idf = (self.doc_count as f64 / df as f64).ln() + 1.0;
                let term_freq = tf.get(term).copied().unwrap_or(0.0);
                vector[i] = term_freq * idf;
            }
            let magnitude: f64 = vector.iter().map(|x| x * x).sum::<f64>().sqrt();
            if magnitude > 0.0 {
                for v in &mut vector {
                    *v /= magnitude;
                }
            }
            self.topic_vectors.push((name.clone(), vector));
        }
    }

    /// Search for the top-k most relevant topics for a query
    pub fn search(&self, query: &str, k: usize) -> Vec<(String, f64)> {
        if self.vocabulary.is_empty() || self.topic_vectors.is_empty() {
            return Vec::new();
        }

        let query_tokens = tokenize(query);
        let query_tf = term_frequency(&query_tokens);

        let mut query_vector = vec![0.0_f64; self.vocabulary.len()];
        for (i, term) in self.vocabulary.iter().enumerate() {
            let df = self
                .topic_vectors
                .iter()
                .filter(|(name, _)| name.to_lowercase().contains(term))
                .count()
                .max(1);
            let idf = (self.doc_count as f64 / df as f64).ln() + 1.0;
            query_vector[i] = query_tf.get(term).copied().unwrap_or(0.0) * idf;
        }
        let q_mag: f64 = query_vector.iter().map(|x| x * x).sum::<f64>().sqrt();
        if q_mag > 0.0 {
            for v in &mut query_vector {
                *v /= q_mag;
            }
        }

        let mut scores: Vec<(String, f64)> = self
            .topic_vectors
            .iter()
            .map(|(name, vec)| {
                let dot: f64 = vec.iter().zip(query_vector.iter()).map(|(a, b)| a * b).sum();
                (name.clone(), dot)
            })
            .collect();

        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        scores.truncate(k);
        scores.into_iter().filter(|(_, score)| *score > 0.01).collect()
    }
}

impl Default for EmbeddingEngine {
    fn default() -> Self {
        Self::new()
    }
}
