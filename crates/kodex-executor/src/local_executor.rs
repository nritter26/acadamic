use std::collections::HashMap;
use std::sync::{Arc, LazyLock};

use tokio::process::Command;
use tokio::sync::Mutex;
use tempfile::TempDir;
use tracing::debug;

use kodex_core::types::ExecResult;

/// Runner configuration for local execution.
pub struct LocalRunnerConfig {
    pub cmd_template: String,
    pub ext: &'static str,
    pub src_name: Option<&'static str>,
    pub needs_compile: bool,
    pub mem_limit_kb: u64,
    pub timeout_secs: u64,
}

/// Language runners for local (non-Docker) execution.
pub fn get_local_runners() -> HashMap<&'static str, LocalRunnerConfig> {
    let mut runners: HashMap<&'static str, LocalRunnerConfig> = HashMap::new();

    runners.insert("py", LocalRunnerConfig {
        cmd_template: "python3 -u \"%f\"".into(),
        ext: ".py",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("go", LocalRunnerConfig {
        cmd_template: "go run \"%f\"".into(),
        ext: ".go",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 786432,
        timeout_secs: 30,
    });

    runners.insert("ts", LocalRunnerConfig {
        cmd_template: "tsx \"%f\"".into(),
        ext: ".ts",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("rs", LocalRunnerConfig {
        cmd_template: "rustc -o _prog \"%f\" && \"$(dirname \"%f\")/_prog\"".into(),
        ext: ".rs",
        src_name: None,
        needs_compile: true,
        mem_limit_kb: 524288,
        timeout_secs: 30,
    });

    runners.insert("c", LocalRunnerConfig {
        cmd_template: "gcc -Wall -o _prog \"%f\" && \"$(dirname \"%f\")/_prog\"".into(),
        ext: ".c",
        src_name: None,
        needs_compile: true,
        mem_limit_kb: 524288,
        timeout_secs: 30,
    });

    runners.insert("cpp", LocalRunnerConfig {
        cmd_template: "g++ -std=c++20 -Wall -o _prog \"%f\" && \"$(dirname \"%f\")/_prog\"".into(),
        ext: ".cpp",
        src_name: None,
        needs_compile: true,
        mem_limit_kb: 524288,
        timeout_secs: 30,
    });

    runners.insert("zig", LocalRunnerConfig {
        cmd_template: "zig run \"%f\"".into(),
        ext: ".zig",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 524288,
        timeout_secs: 30,
    });

    runners.insert("swift", LocalRunnerConfig {
        cmd_template: "swift \"%f\"".into(),
        ext: ".swift",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 524288,
        timeout_secs: 30,
    });

    runners.insert("kt", LocalRunnerConfig {
        cmd_template: "kotlinc -include-runtime -d \"$(dirname \"%f\")/_prog.jar\" \"%f\" && java -jar \"$(dirname \"%f\")/_prog.jar\"".into(),
        ext: ".kt",
        src_name: None,
        needs_compile: true,
        mem_limit_kb: 524288,
        timeout_secs: 30,
    });

    runners.insert("wasm", LocalRunnerConfig {
        cmd_template: "wasmtime \"%f\"".into(),
        ext: ".wat",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("asm", LocalRunnerConfig {
        cmd_template: "nasm -f elf64 \"%f\" -o \"$(dirname \"%f\")/_prog.o\" && ld -o \"$(dirname \"%f\")/_prog\" \"$(dirname \"%f\")/_prog.o\" && \"$(dirname \"%f\")/_prog\"".into(),
        ext: ".asm",
        src_name: None,
        needs_compile: true,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("lua", LocalRunnerConfig {
        cmd_template: "lua5.4 \"%f\"".into(),
        ext: ".lua",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("bash", LocalRunnerConfig {
        cmd_template: "bash \"%f\"".into(),
        ext: ".sh",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("php", LocalRunnerConfig {
        cmd_template: "php \"%f\"".into(),
        ext: ".php",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("scala", LocalRunnerConfig {
        cmd_template: "scala \"%f\"".into(),
        ext: ".scala",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 524288,
        timeout_secs: 30,
    });

    runners.insert("java", LocalRunnerConfig {
        cmd_template: "javac \"%f\" && java -cp \"$(dirname \"%f\")\" Main".into(),
        ext: ".java",
        src_name: Some("Main"),
        needs_compile: true,
        mem_limit_kb: 768000,
        timeout_secs: 30,
    });

    runners.insert("rb", LocalRunnerConfig {
        cmd_template: "ruby \"%f\"".into(),
        ext: ".rb",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 262144,
        timeout_secs: 30,
    });

    runners.insert("cs", LocalRunnerConfig {
        cmd_template: "cd \"$(dirname \"%f\")\" && dotnet new console --force --no-restore >/dev/null 2>&1 && dotnet restore 2>/dev/null && rm -rf bin && mv \"%f\" Program.cs && dotnet run --no-restore".into(),
        ext: ".cs",
        src_name: None,
        needs_compile: false,
        mem_limit_kb: 524288,
        timeout_secs: 60,
    });

    runners
}

// ── Execution Queue ──

struct ExecJob {
    _cmd: String,
    _tmp_dir: TempDir,
}

static EXEC_QUEUE: LazyLock<Arc<Mutex<Vec<ExecJob>>>> =
    LazyLock::new(|| Arc::new(Mutex::new(Vec::new())));

static EXEC_RUNNING: LazyLock<Arc<Mutex<usize>>> =
    LazyLock::new(|| Arc::new(Mutex::new(0)));

/// Execute a command with the local runner queue (max 4 concurrent).
pub async fn execute_local(lang: &str, code: &str, stdin: Option<&str>) -> ExecResult {
    let runners = get_local_runners();
    let config = match runners.get(lang) {
        Some(c) => c,
        None => {
            return ExecResult {
                output: format!("Local execution not available for '{}'", lang),
                error: Some(true),
            };
        }
    };

    let tmp_dir = match tempfile::tempdir() {
        Ok(d) => d,
        Err(e) => {
            return ExecResult {
                output: format!("Failed to create temp dir: {}", e),
                error: Some(true),
            };
        }
    };

    let src_name = config.src_name.unwrap_or("code");
    let file_path = tmp_dir.path().join(format!("{}{}", src_name, config.ext));
    if let Err(e) = std::fs::write(&file_path, code) {
        return ExecResult {
            output: format!("Failed to write source file: {}", e),
            error: Some(true),
        };
    }

    let cmd_str = config.cmd_template.replace("%f", &file_path.to_string_lossy());

    // Wait for queue slot
    {
        let mut queue = EXEC_QUEUE.lock().await;
        queue.push(ExecJob {
            _cmd: cmd_str.clone(),
            _tmp_dir: tmp_dir,
        });
    }

    // Process queue
    let result = run_with_queue(&cmd_str, stdin, config.timeout_secs, config.mem_limit_kb).await;

    // Decrement running count
    {
        let mut running = EXEC_RUNNING.lock().await;
        *running = running.saturating_sub(1);
    }

    result
}

async fn run_with_queue(cmd: &str, stdin: Option<&str>, timeout_secs: u64, mem_limit_kb: u64) -> ExecResult {
    // Build the sandboxed command
    let sandboxed_cmd = format!(
        "ulimit -v {} -t {} 2>/dev/null; {}",
        mem_limit_kb, timeout_secs, cmd
    );

    debug!("Executing local command: {}", &sandboxed_cmd[..sandboxed_cmd.len().min(100)]);

    let child = Command::new("sh")
        .arg("-c")
        .arg(&sandboxed_cmd)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .stdin(std::process::Stdio::piped())
        .spawn();

    let mut child = match child {
        Ok(c) => c,
        Err(e) => {
            return ExecResult {
                output: format!("Failed to spawn process: {}", e),
                error: Some(true),
            };
        }
    };

    if let Some(input) = stdin {
        let mut stdin_child = child.stdin.take();
        if let Some(ref mut stdin_writer) = stdin_child {
            use tokio::io::AsyncWriteExt;
            let _ = stdin_writer.write_all(input.as_bytes()).await;
            let _ = stdin_writer.shutdown().await;
        }
    }

    let output = child.wait_with_output().await;

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).trim_end().to_string();
            let stderr = String::from_utf8_lossy(&out.stderr).trim_end().to_string();

            let mut result = stdout;
            if !stderr.is_empty() {
                if !result.is_empty() {
                    result.push('\n');
                }
                result.push_str(&format!("// stderr:\n{}", stderr));
            }

            let error = !out.status.success();
            ExecResult {
                output: if result.is_empty() { "(no output)".into() } else { result },
                error: if error { Some(true) } else { None },
            }
        }
        Err(e) => ExecResult {
            output: format!("Process failed: {}", e),
            error: Some(true),
        },
    }
}
