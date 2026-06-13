use std::path::{Path, PathBuf};
use kodex_core::error::AppError;
use kodex_core::types::HistoryEntry;
use tokio::fs;
use tokio::io::AsyncReadExt;

const MAX_HISTORY: usize = 50;

/// Manages per-learner conversation history stored as JSON files.
pub struct ConversationStore {
    data_dir: PathBuf,
}

impl ConversationStore {
    /// Create a new store. Data directory must exist.
    pub fn new(data_dir: &Path) -> Self {
        Self {
            data_dir: data_dir.to_path_buf(),
        }
    }

    /// Get the file path for a learner's conversation history.
    fn learner_path(&self, learner_id: &str) -> PathBuf {
        self.data_dir.join("conversations").join(format!("{}.json", learner_id))
    }

    /// Load conversation history for a learner.
    pub async fn get_history(&self, learner_id: &str) -> Result<Vec<HistoryEntry>, AppError> {
        let path = self.learner_path(learner_id);
        if !path.exists() {
            return Ok(Vec::new());
        }
        
        let mut file = fs::File::open(&path).await
            .map_err(|e| AppError::Internal(format!("Failed to open conversation {}: {}", learner_id, e)))?;
        let mut contents = String::new();
        file.read_to_string(&mut contents).await
            .map_err(|e| AppError::Internal(format!("Failed to read conversation {}: {}", learner_id, e)))?;
        
        if contents.trim().is_empty() {
            return Ok(Vec::new());
        }
        
        serde_json::from_str(&contents)
            .map_err(|e| AppError::Internal(format!("Failed to parse conversation {}: {}", learner_id, e)))
    }

    /// Append a message to a learner's conversation history.
    pub async fn append(&self, learner_id: &str, role: &str, text: &str) -> Result<(), AppError> {
        let mut history = self.get_history(learner_id).await?;
        
        history.push(HistoryEntry {
            role: role.to_string(),
            text: text.to_string(),
            content: None,
        });
        
        // Keep only the last MAX_HISTORY entries
        if history.len() > MAX_HISTORY {
            history = history.split_off(history.len() - MAX_HISTORY);
        }
        
        // Ensure the conversations directory exists
        let conv_dir = self.data_dir.join("conversations");
        fs::create_dir_all(&conv_dir).await
            .map_err(|e| AppError::Internal(format!("Failed to create conversations dir: {}", e)))?;
        
        let path = self.learner_path(learner_id);
        let json = serde_json::to_string_pretty(&history)
            .map_err(|e| AppError::Internal(format!("Failed to serialize conversation: {}", e)))?;
        
        fs::write(&path, &json).await
            .map_err(|e| AppError::Internal(format!("Failed to write conversation {}: {}", learner_id, e)))?;
        
        tracing::debug!("Appended message to conversation {}", learner_id);
        Ok(())
    }

    /// Clear conversation history for a learner.
    pub async fn clear(&self, learner_id: &str) -> Result<(), AppError> {
        let path = self.learner_path(learner_id);
        if path.exists() {
            fs::remove_file(&path).await
                .map_err(|e| AppError::Internal(format!("Failed to clear conversation {}: {}", learner_id, e)))?;
        }
        Ok(())
    }
}
