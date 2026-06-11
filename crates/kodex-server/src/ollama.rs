use reqwest::Client;
use tracing::{info, warn};

/// Auto-detect whether Ollama is available at the configured endpoint.
/// Returns `Some(endpoint)` if reachable, `None` if not.
pub async fn detect_ollama(endpoint: &str) -> Option<String> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
        .ok()?;

    let status_url = format!("{}/api/tags", endpoint.trim_end_matches("/v1"));

    match client.get(&status_url).send().await {
        Ok(resp) if resp.status().is_success() => {
            info!("Ollama detected at {}", endpoint);
            Some(endpoint.to_string())
        }
        Ok(resp) => {
            warn!("Ollama at {} returned status {}", endpoint, resp.status());
            None
        }
        Err(e) => {
            warn!("Ollama not reachable at {}: {}", endpoint, e);
            None
        }
    }
}

/// Check if Ollama is available (for health endpoint).
pub async fn check_ollama_status(endpoint: &str) -> String {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(2))
        .build()
        .ok();

    match client {
        Some(c) => {
            let status_url = format!("{}/api/tags", endpoint.trim_end_matches("/v1"));
            match c.get(&status_url).send().await {
                Ok(resp) if resp.status().is_success() => "available".to_string(),
                Ok(_) => "unhealthy".to_string(),
                Err(_) => "unreachable".to_string(),
            }
        }
        None => "unknown".to_string(),
    }
}
