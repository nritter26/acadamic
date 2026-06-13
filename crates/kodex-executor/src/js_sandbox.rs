use std::time::Instant;

use boa_engine::{Context, Source};
use tracing::debug;

use kodex_core::types::ExecResult;

/// Execute JavaScript code in a sandboxed boa_engine context with a mock console.
pub fn execute_js(code: &str) -> ExecResult {
    if code.trim().is_empty() {
        return ExecResult {
            output: "No code provided".into(),
            error: Some(true),
        };
    }

    let start = Instant::now();
    let mut context = Context::default();

    // Inject a pre-built JavaScript console implementation using pure JS eval
    let setup_js = r#"
    (function() {
        const _outputs = [];
        const _counts = {};
        const _timers = {};
        
        const mockConsole = {
            log: (...args) => _outputs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            info: (...args) => _outputs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            debug: (...args) => _outputs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            warn: (...args) => _outputs.push('WARN: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args) => _outputs.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            assert: (cond, ...args) => { if (!cond) _outputs.push('Assertion failed: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); },
            trace: () => _outputs.push('console.trace()'),
            dir: (obj) => _outputs.push(JSON.stringify(obj, null, 2)),
            table: (data) => {
                if (Array.isArray(data)) {
                    _outputs.push(data.map((item, i) => `${i}: ${JSON.stringify(item)}`).join('\n'));
                } else {
                    _outputs.push(JSON.stringify(data, null, 2));
                }
            },
            count: (label) => { if (label === undefined) label = 'default'; _counts[label] = (_counts[label] || 0) + 1; _outputs.push(label + ': ' + _counts[label]); },
            countReset: (label) => { if (label === undefined) label = 'default'; delete _counts[label]; },
            time: (label) => { if (label === undefined) label = 'default'; _timers[label] = Date.now(); },
            timeEnd: (label) => {
                if (label === undefined) label = 'default';
                const s = _timers[label];
                if (s !== undefined) { _outputs.push(label + ': ' + (Date.now() - s) + 'ms'); delete _timers[label]; }
            },
            clear: () => _outputs.length = 0,
            group: () => {},
            groupEnd: () => {},
        };
        
        // Inject into global scope
        globalThis.console = mockConsole;
        globalThis.__getOutput = () => _outputs.join('\n');
        
        // Write setTimeout/setInterval stubs
        globalThis.setTimeout = (fn, ms, ...args) => { try { fn(...args); } catch(e) {} return 0; };
        globalThis.clearTimeout = () => {};
        globalThis.setInterval = () => 0;
        globalThis.clearInterval = () => {};
    })();
    "#;

    // Evaluate the setup script
    if let Err(e) = context.eval(Source::from_bytes(setup_js.as_bytes())) {
        return ExecResult {
            output: format!("Failed to initialize sandbox: {}", e),
            error: Some(true),
        };
    }

    // Execute user code
    let source = Source::from_bytes(code.as_bytes());
    match context.eval(source) {
        Ok(_val) => {
            // Capture output
            let capture_js = "if (typeof __getOutput === 'function') __getOutput(); else '';";                let output = match context.eval(Source::from_bytes(capture_js.as_bytes())) {
                    Ok(out_val) => {
                        // Convert JsValue to string using debug format
                        format!("{:#?}", out_val)
                    }
                Err(_) => String::new(),
            };

            let elapsed = start.elapsed();
            debug!("JS execution completed in {:?}", elapsed);

            let result = if output.is_empty() || output == "\"\"".to_string() { "(no output)".into() } else { output };
            ExecResult {
                output: result,
                error: None,
            }
        }
        Err(e) => {
            ExecResult {
                output: format!("**JavaScript Error:** {}", e),
                error: Some(true),
            }
        }
    }
}

/// Pre-parse JavaScript to check for syntax errors before execution.
pub fn check_js_syntax(code: &str) -> Option<String> {
    let mut context = Context::default();
    match context.eval(Source::from_bytes(code.as_bytes())) {
        Ok(_) => None,
        Err(e) => {
            let msg = e.to_string();
            Some(format!(
                "// ╔══════════════════════════════════════╗\n\
                 // ║  SYNTAX ERROR                        ║\n\
                 // ╚══════════════════════════════════════╝\n\n\
                 **Syntax Error:** {}\n\
                 - Check for missing brackets, quotes, or commas",
                msg
            ))
        }
    }
}
