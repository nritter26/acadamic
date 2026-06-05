"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = executeCode;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const vm_1 = __importDefault(require("vm"));
const database = __importStar(require("../sql/database"));
const docker_executor_1 = require("./docker-executor");
const middleware_1 = require("../middleware");
const EXEC_QUEUE = [];
let EXEC_RUNNING = 0;
const EXEC_MAX_CONCURRENT = 4;
function processNextExec() {
    while (EXEC_RUNNING < EXEC_MAX_CONCURRENT && EXEC_QUEUE.length > 0) {
        const job = EXEC_QUEUE.shift();
        EXEC_RUNNING++;
        if (job.stdin !== undefined) {
            const child = (0, child_process_1.spawn)('sh', ['-c', job.cmd], job.opts);
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (d) => stdout += d.toString());
            child.stderr.on('data', (d) => stderr += d.toString());
            child.on('close', (code) => {
                EXEC_RUNNING--;
                job.resolve({ stdout, stderr });
                processNextExec();
            });
            child.on('error', (e) => {
                EXEC_RUNNING--;
                job.reject(e);
                processNextExec();
            });
            if (job.stdin) {
                child.stdin.write(job.stdin);
                child.stdin.end();
            }
        }
        else {
            (0, child_process_1.exec)(job.cmd, job.opts, (err, stdout, stderr) => {
                EXEC_RUNNING--;
                if (err)
                    job.reject(err);
                else
                    job.resolve({ stdout: String(stdout), stderr: String(stderr) });
                processNextExec();
            });
        }
    }
}
function execQueue(cmd, opts, stdin) {
    return new Promise((resolve, reject) => {
        EXEC_QUEUE.push({ cmd, opts, resolve, reject, stdin });
        processNextExec();
    });
}
function execWithStdin(cmd, opts, stdin) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)('sh', ['-c', cmd], opts);
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => stdout += d.toString());
        child.stderr.on('data', (d) => stderr += d.toString());
        child.on('close', code => resolve({ stdout, stderr, code }));
        child.on('error', reject);
        if (stdin) {
            child.stdin.write(stdin);
            child.stdin.end();
        }
    });
}
// ── JavaScript Sandbox Execution ──
function analyzeJSError(code, e) {
    const msg = e.message || '';
    let explanation = '';
    let fix = '';
    if (msg.includes('Unexpected token')) {
        const token = msg.match(/'([^']+)'/)?.[1] || 'something';
        explanation = `**Syntax Error: Unexpected token \`${token}\`**`;
        if (token === '}')
            explanation += '\n- You have an extra closing brace `}`';
        else if (token === ')')
            explanation += '\n- You have an extra closing parenthesis `)`';
        else
            explanation += `\n- Check for missing operators, quotes, or commas near \`${token}\``;
    }
    else if (msg.includes('is not defined')) {
        const name = msg.match(/'([^']+)'/)?.[1] || 'something';
        explanation = `**ReferenceError: \`${name}\` is not defined**`;
        fix = `- Declare it first: \`let ${name} = value;\`\n- Check for typos`;
    }
    else if (msg.includes('is not a function')) {
        explanation = `**TypeError: Value is not a function**`;
        fix = '- Check if the value is actually a function';
    }
    else if (msg.includes('Cannot read property') || msg.includes('Cannot read properties')) {
        explanation = `**TypeError: Cannot read property of undefined/null**`;
        fix = '- Use optional chaining: `obj?.prop`\n- Check initialization';
    }
    else {
        explanation = `**Error: ${msg}**`;
        fix = '- Check for typos, missing brackets, or incorrect syntax';
    }
    return `// ╔══════════════════════════════════════╗\n// ║  ERROR ANALYSIS                         ║\n// ╚══════════════════════════════════════╝\n\n${explanation}\n\n**How to fix:**\n${fix}`;
}
function analyzeRuntimeError(code, e) {
    const msg = e.message || '';
    let explanation = '';
    let fix = '';
    if (msg.includes('not a function')) {
        explanation = `**Runtime Error: Value is not a function**`;
        fix = '- Check if the variable holds a function or a different type';
    }
    else if (msg.includes('Cannot read property') || msg.includes('Cannot read properties')) {
        explanation = `**Runtime Error: Accessing property on undefined/null**`;
        fix = '- Use optional chaining: `obj?.prop`\n- Initialize variables before using them';
    }
    else if (msg.includes('is not iterable')) {
        explanation = `**Runtime Error: Value is not iterable**`;
        fix = '- Check if the value is actually an array';
    }
    else if (msg.includes('timeout')) {
        explanation = `**Runtime Error: Execution timed out**`;
        fix = '- Check for infinite loops';
    }
    else {
        explanation = `**Runtime Error:** ${msg}`;
        fix = '- Review the logic of your code';
    }
    return `// ╔══════════════════════════════════════╗\n// ║  RUNTIME ERROR ANALYSIS                 ║\n// ╚══════════════════════════════════════╝\n\n${explanation}\n\n**How to fix:**\n${fix}`;
}
function parseErrorPosition(msg) {
    const m = msg.match(/line (\d+)/i);
    return { line: m ? parseInt(m[1]) : 0 };
}
function getCodeLine(code, line) {
    if (line <= 0)
        return '';
    const lines = code.split('\n');
    if (line - 1 < lines.length) {
        const start = Math.max(0, line - 3);
        const end = Math.min(lines.length, line + 1);
        let result = '';
        for (let i = start; i < end; i++) {
            result += `${i === line - 1 ? '>>> ' : '    '}${i + 1}: ${lines[i]}\n`;
        }
        return result.trim();
    }
    return '';
}
// ── Java Home Resolution ──
let javaBin = null;
function detectJavaBin() {
    if (javaBin)
        return javaBin;
    try {
        const javacPath = (0, child_process_1.execSync)('readlink -f $(which javac)', { timeout: 5000, stdio: 'pipe' }).toString().trim();
        const jdkHome = path_1.default.dirname(path_1.default.dirname(javacPath));
        const candidate = path_1.default.join(jdkHome, 'bin', 'java');
        if (fs_1.default.existsSync(candidate)) {
            javaBin = candidate;
            return javaBin;
        }
    }
    catch { /* fall through */ }
    javaBin = 'java';
    return javaBin;
}
function resolveJavaCmd(workDir) {
    const java = detectJavaBin();
    const javac = 'javac';
    return `${javac} "${path_1.default.join(workDir, 'Main.java')}" && ${java} -cp "${workDir}" Main`;
}
// ── Runners config ──
const RUNNERS = {
    py: { cmd: 'python3 -u "%f"', ext: '.py' },
    go: { cmd: 'go run "%f"', ext: '.go' },
    ts: { cmd: 'tsx "%f"', ext: '.ts' },
    rs: { cmd: 'rustc -o _prog "%f" && ./_prog', ext: '.rs' },
    c: { cmd: 'gcc -Wall -o _prog "%f" && ./_prog', ext: '.c' },
    cpp: { cmd: 'g++ -std=c++20 -Wall -o _prog "%f" && ./_prog', ext: '.cpp' },
    cs: { cmd: 'cd "$(dirname "%f")" && dotnet new console --force --no-restore >/dev/null 2>&1 && dotnet restore 2>/dev/null && rm -rf bin && mv "%f" Program.cs && dotnet run --no-restore', ext: '.cs' },
    kt: { cmd: 'kotlinc -include-runtime -d _prog.jar "%f" && java -jar _prog.jar', ext: '.kt' },
    swift: { cmd: 'swift "%f"', ext: '.swift' },
    wasm: { cmd: 'wasmtime "%f"', ext: '.wat' },
    asm: { cmd: 'nasm -f elf64 "%f" -o _prog.o && ld -o _prog _prog.o && ./_prog', ext: '.asm' },
    zig: { cmd: 'zig run "%f"', ext: '.zig' },
    lua: { cmd: 'lua5.4 "%f"', ext: '.lua' },
    bash: { cmd: 'bash "%f"', ext: '.sh' },
    php: { cmd: 'php "%f"', ext: '.php' },
    scala: { cmd: 'scala "%f"', ext: '.scala' },
    java: { cmd: 'javac "Main.java" && java -cp . Main', ext: '.java', src: 'Main' },
    rb: { cmd: 'ruby "%f"', ext: '.rb' },
    html: { cmd: 'cat "%f"', ext: '.html' },
    css: { cmd: 'cat "%f"', ext: '.css' },
};
// ── Execute ──
async function executeCode(lang, code, stdin, onChunk) {
    if (!code)
        return { output: 'No code provided', error: true };
    // JavaScript sandbox
    if (lang === 'js') {
        try {
            new vm_1.default.Script(code);
        }
        catch (e) {
            return { output: analyzeJSError(code, e), error: true };
        }
        try {
            let output = '';
            const formatArg = (a) => typeof a === 'object' ? JSON.stringify(a) : String(a);
            const consoleCounts = {};
            const consoleTimers = {};
            const sandbox = {
                console: {
                    log: (...args) => { output += args.map(formatArg).join(' ') + '\n'; },
                    info: (...args) => { output += args.map(formatArg).join(' ') + '\n'; },
                    debug: (...args) => { output += args.map(formatArg).join(' ') + '\n'; },
                    warn: (...args) => { output += 'WARN: ' + args.map(formatArg).join(' ') + '\n'; },
                    error: (...args) => { output += 'ERROR: ' + args.map(formatArg).join(' ') + '\n'; },
                    assert: (condition, ...args) => { if (!condition)
                        output += 'Assertion failed: ' + args.map(formatArg).join(' ') + '\n'; },
                    trace: () => { output += 'console.trace()\n'; },
                    dir: (obj) => { output += JSON.stringify(obj, null, 2) + '\n'; },
                    table: (data) => {
                        if (Array.isArray(data)) {
                            const rows = data.map((item, i) => `${i}: ${JSON.stringify(item)}`);
                            output += rows.join('\n') + '\n';
                        }
                        else {
                            output += JSON.stringify(data, null, 2) + '\n';
                        }
                    },
                    count: (label = 'default') => {
                        consoleCounts[label] = (consoleCounts[label] || 0) + 1;
                        output += `${label}: ${consoleCounts[label]}\n`;
                    },
                    countReset: (label = 'default') => { delete consoleCounts[label]; },
                    time: (label = 'default') => { consoleTimers[label] = Date.now(); },
                    timeEnd: (label = 'default') => {
                        const start = consoleTimers[label];
                        if (start !== undefined) {
                            output += `${label}: ${Date.now() - start}ms\n`;
                            delete consoleTimers[label];
                        }
                    },
                    timeLog: (label = 'default') => {
                        const start = consoleTimers[label];
                        if (start !== undefined)
                            output += `${label}: ${Date.now() - start}ms\n`;
                    },
                    group: () => { },
                    groupEnd: () => { },
                    clear: () => { output = ''; },
                },
            };
            vm_1.default.runInNewContext(code, sandbox, { timeout: 5000 });
            return { output: output || '(no output)' };
        }
        catch (e) {
            return { output: analyzeRuntimeError(code, e), error: true };
        }
    }
    // SQL
    if (lang === 'sqlite')
        return database.executeSQLite(code);
    if (lang === 'pg')
        return database.executePG(code);
    if (lang === 'mysql')
        return database.executeMySQL(code);
    // Try Docker sandbox first if available
    if ((0, docker_executor_1.isDockerAvailable)() && (0, docker_executor_1.getSupportedDockerLangs)().includes(lang)) {
        middleware_1.logger.debug({ lang }, 'Executing via Docker sandbox');
        const dockerResult = await (0, docker_executor_1.dockerExecute)(lang, code, stdin, onChunk);
        if (!dockerResult.error || dockerResult.dockerAvailable !== false) {
            return dockerResult;
        }
    }
    // Fallback: external compiler execution
    const runner = RUNNERS[lang];
    if (!runner) {
        return { output: `// ${lang.toUpperCase()} execution not available on this server`, error: true };
    }
    const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'exec-'));
    const srcName = runner.src || 'code';
    const tmpFile = path_1.default.join(tmpDir, srcName + runner.ext);
    fs_1.default.writeFileSync(tmpFile, code);
    let cmd = runner.cmd.replaceAll('%f', tmpFile);
    const env = {
        ...process.env,
        PATH: `${process.env.PATH}:${path_1.default.join(os_1.default.homedir(), '.local/bin')}:${path_1.default.join(os_1.default.homedir(), '.cargo/bin')}`,
    };
    if (lang === 'zig') {
        const zigCacheDir = path_1.default.join(tmpDir, '.zig-cache');
        env.HOME = tmpDir;
        env.XDG_CACHE_HOME = path_1.default.join(tmpDir, '.cache');
        env.ZIG_GLOBAL_CACHE_DIR = zigCacheDir;
        env.ZIG_LOCAL_CACHE_DIR = zigCacheDir;
    }
    if (!process.env.DOTNET_ROOT) {
        env.DOTNET_ROOT = path_1.default.join(os_1.default.homedir(), '.local/dotnet');
    }
    if (lang === 'java') {
        cmd = resolveJavaCmd(tmpDir);
    }
    const compiledLangs = new Set(['rs', 'c', 'cpp', 'scala', 'java', 'kt', 'zig', 'swift', 'asm', 'cs']);
    const goLimit = 786432;
    const memLimit = lang === 'go' ? goLimit : compiledLangs.has(lang) ? 524288 : 262144;
    const sandboxedCmd = lang === 'cs'
        ? `ulimit -t 60 2>/dev/null; ${cmd}`
        : `ulimit -v ${memLimit} -t 30 2>/dev/null; ${cmd}`;
    const execOpts = { timeout: 30000, cwd: tmpDir, env };
    try {
        const result = await execQueue(sandboxedCmd, { ...execOpts, maxBuffer: 1024 * 1024 }, stdin);
        fs_1.default.rm(tmpDir, { recursive: true, force: true }, () => { });
        const stdoutClean = (result.stdout || '').trimEnd();
        const stderrClean = (result.stderr || '').trimEnd();
        let output = stdoutClean;
        if (stderrClean) {
            output += (output ? '\n' : '') + '// stderr:\n' + stderrClean;
        }
        return { output: output || '(no output)' };
    }
    catch (err) {
        fs_1.default.rm(tmpDir, { recursive: true, force: true }, () => { });
        return { output: 'Process failed: ' + err.message.slice(0, 200), error: true };
    }
}
//# sourceMappingURL=executor.js.map