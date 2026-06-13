use std::collections::HashMap;
use std::time::Duration;

use bollard::container::*;
use bollard::exec::{CreateExecOptions, StartExecResults};
use bollard::models::HostConfig;
use bollard::Docker;
use futures_util::StreamExt;
use tempfile::TempDir;
use tokio::time::timeout;
use tracing::info;

use kodex_core::error::AppError;
use kodex_core::types::ExecResult;

/// Configuration for a Docker-based language runner
pub struct DockerRunnerConfig {
    pub image: &'static str,
    pub ext: &'static str,
    pub compile_cmd: Option<&'static str>,
    pub run_cmd: &'static str,
    pub needs_compile: bool,
    pub memory_limit: Option<&'static str>,
}

/// Get Docker runner configurations for supported languages
pub fn get_docker_runners() -> HashMap<&'static str, DockerRunnerConfig> {
    let mut runners: HashMap<&'static str, DockerRunnerConfig> = HashMap::new();

    runners.insert("py", DockerRunnerConfig { image: "python:3.12-slim", ext: ".py", compile_cmd: None, run_cmd: "python3 -u /code/main.py", needs_compile: false, memory_limit: Some("256m") });
    runners.insert("js", DockerRunnerConfig { image: "node:20-slim", ext: ".js", compile_cmd: None, run_cmd: "node /code/main.js", needs_compile: false, memory_limit: Some("256m") });
    runners.insert("ts", DockerRunnerConfig { image: "node:20-slim", ext: ".ts", compile_cmd: None, run_cmd: "npx tsx /code/main.ts", needs_compile: false, memory_limit: Some("256m") });
    runners.insert("go", DockerRunnerConfig { image: "golang:1.23-alpine", ext: ".go", compile_cmd: None, run_cmd: "go run /code/main.go", needs_compile: false, memory_limit: Some("512m") });
    runners.insert("rs", DockerRunnerConfig { image: "rust:1.78-slim-bookworm", ext: ".rs", compile_cmd: Some("rustc /code/main.rs -o /code/main"), run_cmd: "/code/main", needs_compile: true, memory_limit: Some("512m") });
    runners.insert("c", DockerRunnerConfig { image: "gcc:14-bookworm", ext: ".c", compile_cmd: Some("gcc /code/main.c -o /code/main"), run_cmd: "/code/main", needs_compile: true, memory_limit: Some("256m") });
    runners.insert("cpp", DockerRunnerConfig { image: "gcc:14-bookworm", ext: ".cpp", compile_cmd: Some("g++ /code/main.cpp -o /code/main"), run_cmd: "/code/main", needs_compile: true, memory_limit: Some("256m") });
    runners.insert("java", DockerRunnerConfig { image: "openjdk:23-slim-bookworm", ext: ".java", compile_cmd: Some("javac /code/Main.java -d /code"), run_cmd: "java -cp /code Main", needs_compile: true, memory_limit: Some("512m") });
    runners.insert("rb", DockerRunnerConfig { image: "ruby:3.3-slim", ext: ".rb", compile_cmd: None, run_cmd: "ruby /code/main.rb", needs_compile: false, memory_limit: Some("256m") });
    runners.insert("php", DockerRunnerConfig { image: "php:8.3-cli", ext: ".php", compile_cmd: None, run_cmd: "php /code/main.php", needs_compile: false, memory_limit: Some("256m") });
    runners.insert("bash", DockerRunnerConfig { image: "bash:5", ext: ".sh", compile_cmd: None, run_cmd: "bash /code/main.sh", needs_compile: false, memory_limit: Some("128m") });
    runners.insert("lua", DockerRunnerConfig { image: "lua:5.4", ext: ".lua", compile_cmd: None, run_cmd: "lua /code/main.lua", needs_compile: false, memory_limit: Some("128m") });
    runners.insert("swift", DockerRunnerConfig { image: "swift:6.0", ext: ".swift", compile_cmd: None, run_cmd: "swift /code/main.swift", needs_compile: false, memory_limit: Some("512m") });
    runners.insert("kt", DockerRunnerConfig { image: "kotlin:latest", ext: ".kt", compile_cmd: Some("kotlinc /code/main.kt -include-runtime -d /code/main.jar"), run_cmd: "java -jar /code/main.jar", needs_compile: true, memory_limit: Some("512m") });
    runners
}

/// Check if Docker is available
pub fn is_docker_available() -> bool {
    Docker::connect_with_local_defaults().is_ok()
}

/// Execute user code in a Docker container
pub async fn execute_in_docker(
    code: &str,
    config: &DockerRunnerConfig,
    _stdin: Option<&str>,
    timeout_secs: u64,
) -> Result<ExecResult, AppError> {
    let docker = Docker::connect_with_local_defaults()
        .map_err(|e| AppError::Internal(format!("Docker connection failed: {}", e)))?;

    ensure_image(&docker, config.image).await?;

    let tmp_dir = TempDir::new().map_err(|e| AppError::Internal(format!("Failed to create temp dir: {}", e)))?;
    let main_path = tmp_dir.path().join(format!("main{}", config.ext));
    std::fs::write(&main_path, code)
        .map_err(|e| AppError::Internal(format!("Failed to write code file: {}", e)))?;

    let host_path = tmp_dir.path().to_str().unwrap_or("/tmp").replace('\\', "/");
    let container_name = format!("kodex-exec-{}", uuid::Uuid::new_v4());

    #[allow(deprecated)]
    let create_config = Config {
        image: Some(config.image),
        cmd: Some(vec!["sleep", "30"]),
        working_dir: Some("/code"),
        host_config: Some(HostConfig {
            memory: config.memory_limit.map(parse_memory),
            auto_remove: Some(true),
            network_mode: Some("none".to_string()),
            readonly_rootfs: Some(true),
            binds: Some(vec![format!("{}:/code:ro", host_path)]),
            ..Default::default()
        }),
        env: Some(vec!["DEBIAN_FRONTEND=noninteractive"]),
        ..Default::default()
    };

    #[allow(deprecated)]
    let container = docker
        .create_container(
            Some(CreateContainerOptions { name: container_name.clone(), platform: None }),
            create_config,
        )
        .await
        .map_err(|e| AppError::Internal(format!("Failed to create container: {}", e)))?;

    docker
        .start_container(&container.id, None::<StartContainerOptions<String>>)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to start container: {}", e)))?;

    let exec_cmd = if config.needs_compile {
        if let Some(compile) = config.compile_cmd {
            format!("{} && {} 2>&1", compile, config.run_cmd)
        } else {
            format!("{} 2>&1", config.run_cmd)
        }
    } else {
        format!("{} 2>&1", config.run_cmd)
    };

    let exec = docker
        .create_exec(
            &container.id,
            CreateExecOptions {
                attach_stdout: Some(true),
                attach_stderr: Some(true),
                cmd: Some(vec!["/bin/sh", "-c", &exec_cmd]),
                ..Default::default()
            },
        )
        .await
        .map_err(|e| AppError::Internal(format!("Failed to create exec: {}", e)))?;

    let exec_result = docker
        .start_exec(&exec.id, None)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to start exec: {}", e)))?;

    let mut output = String::new();

    if let StartExecResults::Attached { output: mut stream, .. } = exec_result {
        let timed = timeout(Duration::from_secs(timeout_secs), async {
            while let Some(chunk) = stream.next().await {
                match chunk {
                    Ok(LogOutput::StdOut { message }) | Ok(LogOutput::StdErr { message }) => {
                        output.push_str(&String::from_utf8_lossy(&message));
                    }
                    Ok(_) => {}
                    Err(e) => {
                        output.push_str(&format!("\n[Docker stream error: {}]", e));
                        break;
                    }
                }
            }
        });

        if timed.await.is_err() {
            output.push_str("\n[Execution timed out]");
        }
    }

    let _ = docker.stop_container(&container.id, None::<bollard::query_parameters::StopContainerOptions>).await;

    Ok(ExecResult {
        output: if output.is_empty() { "[No output]".to_string() } else { output },
        error: None,
    })
}

/// Ensure a Docker image is available locally; pull if necessary
async fn ensure_image(docker: &Docker, image: &str) -> Result<(), AppError> {
    let images = docker
        .list_images(None::<bollard::image::ListImagesOptions<String>>)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to list images: {}", e)))?;

    let image_tag = image.split(':').next().unwrap_or(image);
    let exists = images.iter().any(|img| {
        img.repo_tags.iter().any(|tag| tag == image || tag.starts_with(&format!("{}:", image_tag)))
    });

    if exists {
        return Ok(());
    }

    info!("Pulling Docker image: {}", image);

    #[allow(deprecated)]
    let mut stream = docker.create_image(
        Some(bollard::image::CreateImageOptions { from_image: image, ..Default::default() }),
        None,
        None,
    );

    while let Some(result) = stream.next().await {
        if let Err(e) = result {
            return Err(AppError::Internal(format!("Failed to pull image {}: {}", image, e)));
        }
    }

    Ok(())
}

fn parse_memory(s: &str) -> i64 {
    if let Some(num_str) = s.strip_suffix('m') {
        if let Ok(mb) = num_str.parse::<i64>() {
            return mb * 1024 * 1024;
        }
    }
    if let Some(num_str) = s.strip_suffix('g') {
        if let Ok(gb) = num_str.parse::<i64>() {
            return gb * 1024 * 1024 * 1024;
        }
    }
    s.parse::<i64>().unwrap_or(256 * 1024 * 1024)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_memory_megabytes() {
        assert_eq!(parse_memory("256m"), 256 * 1024 * 1024);
        assert_eq!(parse_memory("512m"), 512 * 1024 * 1024);
        assert_eq!(parse_memory("128m"), 128 * 1024 * 1024);
        assert_eq!(parse_memory("1m"), 1 * 1024 * 1024);
    }

    #[test]
    fn test_parse_memory_gigabytes() {
        assert_eq!(parse_memory("1g"), 1024 * 1024 * 1024);
        assert_eq!(parse_memory("2g"), 2 * 1024 * 1024 * 1024);
    }

    #[test]
    fn test_parse_memory_plain_number() {
        let bytes = parse_memory("1048576");
        assert_eq!(bytes, 1048576);
    }

    #[test]
    fn test_parse_memory_invalid_fallback() {
        let bytes = parse_memory("invalid");
        assert_eq!(bytes, 256 * 1024 * 1024);
    }

    #[test]
    fn test_parse_memory_case_sensitive() {
        // Lowercase is required; uppercase should fall back to default
        assert_eq!(parse_memory("256M"), 256 * 1024 * 1024);
        assert_eq!(parse_memory("1G"), 256 * 1024 * 1024);
    }
}
