use std::sync::Arc;
use std::time::Instant;

use reqwest::Client;
use tokio::sync::RwLock;
use tracing::{info, warn};

/// Cached Ollama status that refreshes periodically.
pub struct OllamaProbe {
    endpoint: String,
    cached_status: RwLock<CachedStatus>,
    refresh_interval: std::time::Duration,
}

#[derive(Debug, Clone)]
struct CachedStatus {
    status: String,
    last_checked: Instant,
}

impl OllamaProbe {
    pub fn new(endpoint: String) -> Arc<Self> {
        let probe = Arc::new(Self {
            endpoint,
            cached_status: RwLock::new(CachedStatus {
                status: "unknown".to_string(),
                last_checked: Instant::now(),
            }),
            refresh_interval: std::time::Duration::from_secs(10),
        });

        // Start background refresh task
        let p = probe.clone();
        tokio::spawn(async move {
            p.refresh_loop().await;
        });

        probe
    }

    async fn refresh_loop(&self) {
        loop {
            let status = self.probe_once().await;
            let mut cached = self.cached_status.write().await;
            cached.status = status;
            cached.last_checked = Instant::now();
            tokio::time::sleep(self.refresh_interval).await;
        }
    }

    async fn probe_once(&self) -> String {
        let client = match Client::builder()
            .timeout(std::time::Duration::from_secs(3))
            .build()
        {
            Ok(c) => c,
            Err(_) => return "unknown".to_string(),
        };

        let status_url = format!(
            "{}/api/tags",
            self.endpoint.trim_end_matches("/v1")
        );

        match client.get(&status_url).send().await {
            Ok(resp) if resp.status().is_success() => "available".to_string(),
            Ok(_) => "unhealthy".to_string(),
            Err(_) => "unreachable".to_string(),
        }
    }

    pub async fn get_cached_status(&self) -> String {
        self.cached_status.read().await.status.clone()
    }
}

/// Auto-detect whether Ollama is available at the configured endpoint.
/// Returns `Some(OllamaProbe)` if reachable, `None` if not.
pub async fn detect_ollama(endpoint: &str) -> Option<Arc<OllamaProbe>> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
        .ok()?;

    let status_url = format!("{}/api/tags", endpoint.trim_end_matches("/v1"));

    match client.get(&status_url).send().await {
        Ok(resp) if resp.status().is_success() => {
            info!("Ollama detected at {}", endpoint);
            Some(OllamaProbe::new(endpoint.to_string()))
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
