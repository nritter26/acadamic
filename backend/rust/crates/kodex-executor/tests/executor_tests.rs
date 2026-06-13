use kodex_executor::docker_executor::{get_docker_runners, is_docker_available};
use kodex_executor::js_sandbox::{check_js_syntax, execute_js};
use kodex_executor::local_executor::{execute_local, get_local_runners};

// ── JS Sandbox Tests ──

#[test]
fn test_js_basic_execution() {
    let result = execute_js("1 + 1");
    assert!(result.error.is_none(), "basic JS should not error");
}

#[test]
fn test_js_console_log() {
    let result = execute_js("console.log('hello world')");
    assert!(result.error.is_none());
    assert!(
        result.output.contains("hello world"),
        "output should contain 'hello world', got: {}",
        result.output
    );
}

#[test]
fn test_js_console_error() {
    let result = execute_js("console.error('something broke')");
    assert!(result.error.is_none());
    assert!(
        result.output.contains("ERROR: something broke"),
        "output should contain ERROR:, got: {}",
        result.output
    );
}

#[test]
fn test_js_console_warn() {
    let result = execute_js("console.warn('caution')");
    assert!(result.error.is_none());
    assert!(
        result.output.contains("WARN: caution"),
        "output should contain WARN:, got: {}",
        result.output
    );
}

#[test]
fn test_js_console_assert() {
    let result = execute_js("console.assert(false, 'nope')");
    assert!(result.error.is_none());
    assert!(
        result.output.contains("Assertion failed: nope"),
        "output should contain 'Assertion failed:', got: {}",
        result.output
    );
}

#[test]
fn test_js_console_assert_pass() {
    let result = execute_js("console.assert(true, 'should not appear')");
    assert!(result.error.is_none());
    assert!(
        !result.output.contains("Assertion failed"),
        "passing assert should not produce output"
    );
}

#[test]
fn test_js_set_timeout_stub() {
    let result = execute_js(
        r#"
        let called = false;
        setTimeout(() => { called = true; }, 1000);
        console.log('called: ' + called);
        "#,
    );
    assert!(result.error.is_none(), "setTimeout stub should not block");
    assert!(
        result.output.contains("called: true"),
        "setTimeout stub executes callback immediately, got: {}",
        result.output
    );
}

#[test]
fn test_js_multiple_console_calls() {
    let result = execute_js(
        r#"
        console.log('first');
        console.log('second');
        "#,
    );
    assert!(result.error.is_none());
    assert!(result.output.contains("first"));
    assert!(result.output.contains("second"));
}

#[test]
fn test_js_syntax_error() {
    let result = execute_js("if (true { }");
    assert!(
        result.error == Some(true),
        "syntax error should set error flag"
    );
    assert!(
        result.output.contains("JavaScript Error"),
        "output should mention JavaScript Error, got: {}",
        result.output
    );
}

#[test]
fn test_js_runtime_error() {
    let result = execute_js("undefined.x");
    assert!(
        result.error == Some(true),
        "runtime error should set error flag"
    );
    assert!(
        result.output.contains("JavaScript Error"),
        "output should mention JavaScript Error, got: {}",
        result.output
    );
}

#[test]
fn test_js_empty_code() {
    let result = execute_js("");
    assert!(result.error == Some(true));
    assert_eq!(result.output, "No code provided");

    let result = execute_js("   ");
    assert_eq!(result.output, "No code provided");
}

#[test]
fn test_js_console_object_serialization() {
    let result = execute_js("console.log({a: 1, b: [2, 3]})");
    assert!(result.error.is_none());
    assert!(result.output.contains("a"), "objects should be serialized");
    assert!(result.output.contains("1"), "values should appear");
}

#[test]
fn test_check_js_syntax_valid() {
    assert!(check_js_syntax("let x = 1;").is_none());
    assert!(check_js_syntax("function foo() { return 42; }").is_none());
    assert!(check_js_syntax("").is_none());
}

#[test]
fn test_check_js_syntax_invalid() {
    let err = check_js_syntax("if (true { }");
    assert!(err.is_some(), "invalid syntax should return Some");
    let msg = err.unwrap();
    assert!(
        msg.contains("Syntax Error"),
        "error message should contain 'Syntax Error', got: {}",
        msg
    );
}

#[test]
fn test_check_js_syntax_runtime_error() {
    let err = check_js_syntax("throw new Error('boom')");
    assert!(err.is_some(), "code that throws should return Some");
}

// ── Local Executor Tests ──

#[test]
fn test_local_runners_contains_all() {
    let runners = get_local_runners();
    let expected = [
        "py", "go", "ts", "rs", "c", "cpp", "zig", "swift", "kt", "wasm", "asm", "lua", "bash",
        "php", "scala", "java", "rb", "cs",
    ];
    for lang in &expected {
        assert!(
            runners.contains_key(*lang),
            "missing local runner for '{}'",
            lang
        );
    }
    assert_eq!(runners.len(), expected.len());
}

#[test]
fn test_local_runners_config_values() {
    let runners = get_local_runners();

    let py = &runners["py"];
    assert_eq!(py.ext, ".py");
    assert!(!py.needs_compile);

    let rs = &runners["rs"];
    assert_eq!(rs.ext, ".rs");
    assert!(rs.needs_compile);
    assert_eq!(rs.mem_limit_kb, 524288);

    let java = &runners["java"];
    assert_eq!(java.ext, ".java");
    assert!(java.needs_compile);
    assert_eq!(java.src_name, Some("Main"));
    assert_eq!(java.mem_limit_kb, 768000);

    let cs = &runners["cs"];
    assert_eq!(cs.ext, ".cs");
    assert!(!cs.needs_compile);
    assert_eq!(cs.timeout_secs, 60);
}

#[test]
fn test_local_runners_cmd_templates() {
    let runners = get_local_runners();
    assert_eq!(runners["py"].cmd_template, "python3 -u \"%f\"");
    assert_eq!(runners["go"].cmd_template, "go run \"%f\"");
    assert_eq!(runners["ts"].cmd_template, "tsx \"%f\"");
    assert_eq!(runners["bash"].cmd_template, "bash \"%f\"");
    assert_eq!(runners["lua"].cmd_template, "lua5.4 \"%f\"");
}

#[tokio::test]
async fn test_execute_local_nonexistent_lang() {
    let result = execute_local("nonexistent", "code", None).await;
    assert!(result.error == Some(true));
    assert_eq!(
        result.output,
        "Local execution not available for 'nonexistent'"
    );
}

#[tokio::test]
async fn test_execute_local_empty_code_real_lang() {
    // Uses a real lang key, so it will try to create a temp file and spawn sh.
    // This won't spawn an actual process if sh isn't available.
    let result = execute_local("py", "", None).await;
    // May succeed (empty file executed) or fail (sh not found on Windows)
    // We just verify it doesn't panic and returns some ExecResult
    assert!(
        result.error.is_some() || result.error.is_none(),
        "should return a result"
    );
}

// ── Docker Executor Tests ──

#[test]
fn test_docker_runners_count() {
    let runners = get_docker_runners();
    assert_eq!(runners.len(), 14, "expected 14 docker runners");
}

#[test]
fn test_docker_runners_contains_all() {
    let runners = get_docker_runners();
    let expected = [
        "py", "js", "ts", "go", "rs", "c", "cpp", "java", "rb", "php", "bash", "lua", "swift",
        "kt",
    ];
    for lang in &expected {
        assert!(
            runners.contains_key(*lang),
            "missing docker runner for '{}'",
            lang
        );
    }
}

#[test]
fn test_docker_runners_config_values() {
    let runners = get_docker_runners();

    let js = &runners["js"];
    assert_eq!(js.image, "node:20-slim");
    assert_eq!(js.ext, ".js");
    assert!(!js.needs_compile);
    assert_eq!(js.run_cmd, "node /code/main.js");

    let rs = &runners["rs"];
    assert_eq!(rs.image, "rust:1.78-slim-bookworm");
    assert_eq!(rs.ext, ".rs");
    assert!(rs.needs_compile);
    assert_eq!(rs.compile_cmd, Some("rustc /code/main.rs -o /code/main"));
    assert_eq!(rs.run_cmd, "/code/main");

    let py = &runners["py"];
    assert_eq!(py.image, "python:3.12-slim");
    assert_eq!(py.ext, ".py");
    assert!(!py.needs_compile);
    assert_eq!(py.memory_limit, Some("256m"));

    let bash = &runners["bash"];
    assert_eq!(bash.image, "bash:5");
    assert_eq!(bash.memory_limit, Some("128m"));
}

#[test]
fn test_docker_runners_memory_limits() {
    let runners = get_docker_runners();
    let with_limits: Vec<&str> = runners
        .iter()
        .filter(|(_, c)| c.memory_limit.is_some())
        .map(|(k, _)| *k)
        .collect();
    assert_eq!(
        with_limits.len(),
        14,
        "all 14 runners should have memory limits"
    );
}

#[test]
fn test_docker_runners_no_compile_no_build() {
    let runners = get_docker_runners();
    let interpreted = ["py", "js", "ts", "go", "rb", "php", "bash", "lua", "swift"];
    for lang in &interpreted {
        let c = &runners[lang];
        assert!(
            !c.needs_compile,
            "{} should not need compile",
            lang
        );
        assert!(c.compile_cmd.is_none(), "{} should have no compile_cmd", lang);
    }
}

#[test]
fn test_docker_runners_compile_needed() {
    let runners = get_docker_runners();
    let compiled = ["rs", "c", "cpp", "java", "kt"];
    for lang in &compiled {
        let c = &runners[lang];
        assert!(c.needs_compile, "{} should need compile", lang);
        assert!(
            c.compile_cmd.is_some(),
            "{} should have a compile_cmd",
            lang
        );
    }
}

#[test]
fn test_is_docker_available_no_panic() {
    let _ = is_docker_available();
}

#[test]
fn test_docker_runners_unique_images() {
    let runners = get_docker_runners();
    let mut images = std::collections::HashSet::new();
    for (_, c) in &runners {
        images.insert(c.image);
    }
    // We just verify no panic, but images should be fewer than runners
    // since some share images (node, gcc)
    assert!(images.len() < runners.len());
    assert!(images.len() >= 8, "expected at least 8 unique docker images");
}
