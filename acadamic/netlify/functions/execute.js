const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const COMPILERS = {
    py: { cmd: 'python3 -u "%f"', ext: '.py' },
    go: { cmd: 'go run "%f"', ext: '.go' },
    rs: { cmd: 'rustc -o _prog "%f" && ./_prog', ext: '.rs' },
    c: { cmd: 'gcc -Wall -o _prog "%f" && ./_prog', ext: '.c' },
    cpp: { cmd: 'g++ -std=c++20 -Wall -o _prog "%f" && ./_prog', ext: '.cpp' },
    zig: { cmd: 'zig run "%f"', ext: '.zig' },
    ts: { cmd: 'tsx "%f"', ext: '.ts' },
};

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { lang, code } = body;
    if (!code) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No code provided' }) };
    }

    if (lang === 'js') {
        try {
            const vm = require('vm');
            let output = '';
            const sandbox = {
                console: {
                    log: (...args) => { output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
                    error: (...args) => { output += 'ERROR: ' + args.join(' ') + '\n'; },
                    warn: (...args) => { output += 'WARN: ' + args.join(' ') + '\n'; },
                }
            };
            vm.runInNewContext(code, sandbox, { timeout: 5000 });
            return { statusCode: 200, body: JSON.stringify({ output: output || '(no output)' }) };
        } catch (e) {
            return { statusCode: 200, body: JSON.stringify({ output: 'Error: ' + e.message, error: true }) };
        }
    }

    const runner = COMPILERS[lang];
    if (!runner) {
        return { statusCode: 200, body: JSON.stringify({ output: `// ${lang.toUpperCase()} execution not available in serverless mode` }) };
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nflx-'));
    const tmpFile = path.join(tmpDir, 'code' + runner.ext);
    fs.writeFileSync(tmpFile, code);

    const cmd = runner.cmd.replace('%f', tmpFile);
    const env = { ...process.env, PATH: `${process.env.PATH}:/tmp/.local/bin:/tmp/.cargo/bin` };

    try {
        const stdout = execSync(cmd, { timeout: 25000, cwd: tmpDir, env, maxBuffer: 1024 * 512, shell: true });
        const out = stdout.toString().trim() || '(no output)';
        fs.rmSync(tmpDir, { recursive: true, force: true });
        return { statusCode: 200, body: JSON.stringify({ output: out }) };
    } catch (e) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        const stderr = e.stderr ? e.stderr.toString() : '';
        const output = stderr.trim() || 'Process failed: ' + e.message.slice(0, 200);
        return { statusCode: 200, body: JSON.stringify({ output, error: true }) };
    }
};
