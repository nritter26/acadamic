require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { exec, spawn } = require('child_process');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const os = require('os');

const { askLLM } = require('./ai/provider');
const { getCurriculumContext, getTopicContext, search: semanticSearch } = require('./ai/embeddings');
const learner = require('./ai/learner');
const { review: codeReview } = require('./ai/reviewer');
const { generateExercise } = require('./ai/exercises');
const database = require('./sql/database');

const LANG_NAMES = {
    js: 'javascript', ts: 'typescript', py: 'python', go: 'go',
    rs: 'rust', c: 'c', cpp: 'c++', cs: 'c#', kt: 'kotlin',
    swift: 'swift', zig: 'zig', dk: 'docker', pg: 'postgresql',
    mongodb: 'mongodb', git: 'git', gamedev: 'gamedev',
    mysql: 'mysql', sqlite: 'sqlite', firebase: 'firebase',
    aws: 'aws', azure: 'azure', gcp: 'gcp', cloud: 'cloud',
};

function detectLanguage(query) {
    const words = query.toLowerCase().split(/\s+/);
    for (const word of words) {
        for (const [code, name] of Object.entries(LANG_NAMES)) {
            if (word === name || word === code) return code;
        }
        if (word === 'sql') return 'pg';
    }
    return null;
}

function extractSubject(text) {
    if (!text) return '';
    const m = text.match(/\*\*([A-Z][a-z+#]+)\*\*/);
    if (m) return m[1];
    return '';
}

function resolveFollowUp(q, history) {
    if (!history || history.length < 2) return q;

    const trimmed = q.trim().toLowerCase();
    const pronounPattern = /^(what|how|why|where|when|which|can|could|would|will|do|does|did|is|are)\s+(is|are|was|were|does|do|did|can|could|about|the|a|an|it|this|that|they|these|those|its|their)\b/i;
    const pronounWords = /\b(it|this|that|they|them|these|those|its|their)\b/i;

    if (!pronounPattern.test(trimmed) && !pronounWords.test(trimmed)) return q;

    const lastBot = [...history].reverse().find(m => m.role === 'bot');
    if (!lastBot || !lastBot.text) return q;

    const subject = extractSubject(lastBot.text);
    if (!subject) return q;

    return `${subject} ${q}`;
}

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(__dirname));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PROGRESS_FILE)) fs.writeFileSync(PROGRESS_FILE, '{}');

const dbStatus = database.initAll();
console.log('[DB] SQLite:', dbStatus.sqlite.available ? 'ready' : 'FAILED');
console.log('[DB] PostgreSQL:', dbStatus.pg.available ? 'ready' : dbStatus.pg.reason || 'not configured');
console.log('[DB] MySQL:', dbStatus.mysql.available ? 'ready' : dbStatus.mysql.reason || 'not configured');

// Rate limiting
const rateLimitStore = new Map();
const RATE_WINDOW = 60000;
const RATE_MAX = 30;

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!rateLimitStore.has(ip)) rateLimitStore.set(ip, []);
    const timestamps = rateLimitStore.get(ip).filter(t => now - t < RATE_WINDOW);
    if (timestamps.length >= RATE_MAX) {
        return res.status(429).json({ error: 'Too many requests. Try again shortly.' });
    }
    timestamps.push(now);
    rateLimitStore.set(ip, timestamps);
    next();
}

app.use('/api/', rateLimit);

// ── Compiler Health Check ──
const COMPILERS = {
    py:  ['python3', '--version'],
    go:  ['go', 'version'],
    rs:  ['rustc', '--version'],
    c:   ['gcc', '--version'],
    cpp: ['g++', '--version'],
    cs:  ['dotnet', '--version'],
    kt:  ['kotlinc', '-version'],
    swift: ['swift', '--version'],
    zig: ['zig', 'version'],
    ts:  ['tsx', '--version'],
};

const compilerCache = new Map();
let lastCompilerCheck = 0;
const COMPILER_CACHE_TTL = 30000;

function checkCompilers() {
    const now = Date.now();
    if (now - lastCompilerCheck < COMPILER_CACHE_TTL && compilerCache.size > 0) {
        return Promise.resolve(Object.fromEntries(compilerCache));
    }
    const extPath = `${process.env.PATH}:${path.join(os.homedir(), '.local/bin')}:${path.join(os.homedir(), '.cargo/bin')}`;
    const checks = Object.entries(COMPILERS).map(([lang, [cmd, flag]]) => {
        return new Promise(resolve => {
            exec(`${cmd} ${flag}`, { timeout: 5000, env: { ...process.env, PATH: extPath } }, (err, stdout) => {
                const ok = !err;
                const version = ok ? (stdout || '').split('\n')[0].trim() : null;
                compilerCache.set(lang, { available: ok, version });
                resolve([lang, { available: ok, version }]);
            });
        });
    });
    return Promise.all(checks).then(results => {
        lastCompilerCheck = Date.now();
        return Object.fromEntries(results);
    });
}

app.get('/api/health', async (req, res) => {
    const compilers = await checkCompilers();
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        node: process.version,
        compilers,
        database: database.getStatus(),
        rateLimit: { window: '60s', max: RATE_MAX },
        endpoints: ['/api/progress', '/api/execute', '/api/analyze', '/api/chat', '/api/health', '/api/benchmark', '/api/courses', '/api/proxy']
    });
});

// ── Progress API ──
app.get('/api/progress', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        res.json(data);
    } catch { res.json({}); }
});

app.post('/api/progress', (req, res) => {
    try {
        const { lang, topic, completed } = req.body;
        const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        if (!data[lang]) data[lang] = {};
        data[lang][topic] = completed;
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
        res.json({ ok: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ── Execution Queue (process pool) ──
const EXEC_QUEUE = [];
let EXEC_RUNNING = 0;
const EXEC_MAX_CONCURRENT = 4;

function execQueue(cmd, opts) {
    return new Promise((resolve, reject) => {
        EXEC_QUEUE.push({ cmd, opts, resolve, reject });
        processNextExec();
    });
}

function processNextExec() {
    while (EXEC_RUNNING < EXEC_MAX_CONCURRENT && EXEC_QUEUE.length > 0) {
        const job = EXEC_QUEUE.shift();
        EXEC_RUNNING++;
        exec(job.cmd, job.opts, (err, stdout, stderr) => {
            EXEC_RUNNING--;
            if (err) job.reject(err);
            else job.resolve({ stdout, stderr });
            processNextExec();
        });
    }
}

// ── Execute with stdin support ──
function execWithStdin(cmd, opts, stdin) {
    return new Promise((resolve, reject) => {
        const child = spawn('sh', ['-c', cmd], opts);
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', d => stdout += d.toString());
        child.stderr.on('data', d => stderr += d.toString());
        child.on('close', code => {
            resolve({ stdout, stderr, code });
        });
        child.on('error', reject);
        if (stdin) {
            child.stdin.write(stdin);
            child.stdin.end();
        }
    });
}

// ── Execute Code API ──
app.post('/api/execute', async (req, res) => {
    const { lang, code, stdin } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    if (lang === 'js') {
        try { new vm.Script(code); } catch (e) {
            return res.json({ output: analyzeJSError(code, e), error: true });
        }
        try {
            let output = '';
            const sandbox = { console: { log: (...args) => {
                output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
            }, error: (...args) => {
                output += 'ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
            }, warn: (...args) => {
                output += 'WARN: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
            } } };
            vm.runInNewContext(code, sandbox, { timeout: 5000 });
            return res.json({ output: output || '(no output)' });
        } catch (e) {
            return res.json({ output: analyzeRuntimeError(code, e), error: true });
        }
    }

    // ── SQL Execution ──
    if (lang === 'sqlite') {
        return res.json(database.executeSQLite(code));
    }
    if (lang === 'pg') {
        const result = await database.executePG(code);
        return res.json(result);
    }
    if (lang === 'mysql') {
        const result = await database.executeMySQL(code);
        return res.json(result);
    }

    const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const prog = `_prog_${token}`;

    const runners = {
        py:  { cmd: 'python3 -u "%f"', ext: '.py' },
        go:  { cmd: 'go run "%f"', ext: '.go' },
        ts:  { cmd: 'tsx "%f"', ext: '.ts' },
        rs:  { cmd: `rustc -o ${prog} "%f" && ./${prog}`, ext: '.rs' },
        c:   { cmd: `gcc -Wall -o ${prog} "%f" && ./${prog}`, ext: '.c' },
        cpp: { cmd: `g++ -std=c++20 -Wall -o ${prog} "%f" && ./${prog}`, ext: '.cpp' },
        cs:  { cmd: 'dotnet script "%f"', ext: '.csx' },
        kt:  { cmd: `kotlinc -include-runtime -d ${prog}.jar "%f" && java -jar ${prog}.jar`, ext: '.kt' },
        swift: { cmd: 'swift "%f"', ext: '.swift' },
        zig: { cmd: 'zig run "%f"', ext: '.zig' },
    };

    const runner = runners[lang];
    if (!runner) {
        return res.json({ output: `// ${lang.toUpperCase()} execution not available on this server\n` + getCompileHint(lang) });
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-'));
    const tmpFile = path.join(tmpDir, 'code' + runner.ext);
    fs.writeFileSync(tmpFile, code);

    const cmd = runner.cmd.replace('%f', tmpFile);

    const env = { ...process.env, PATH: `${process.env.PATH}:${path.join(os.homedir(), '.local/bin')}:${path.join(os.homedir(), '.cargo/bin')}`, DOTNET_ROOT: path.join(os.homedir(), '.local/dotnet') };

    const sandboxedCmd = `ulimit -v 262144 -t 30 2>/dev/null; ${cmd}`;

    const execOpts = { timeout: 30000, cwd: tmpDir, env };

    const execPromise = stdin
        ? execWithStdin(sandboxedCmd, execOpts, stdin)
        : execQueue(sandboxedCmd, { ...execOpts, maxBuffer: 1024 * 1024, shell: true });

    execPromise
        .then(({ stdout, stderr }) => {
            fs.rm(tmpDir, { recursive: true, force: true }, () => {});
            const stdoutClean = (stdout || '').trimEnd();
            const stderrClean = (stderr || '').trimEnd();
            let output = stdoutClean;
            if (stderrClean) {
                output += (output ? '\n' : '') + '// stderr:\n' + stderrClean;
            }
            return res.json({ output: output || '(no output)' });
        })
        .catch(err => {
            fs.rm(tmpDir, { recursive: true, force: true }, () => {});
            return res.json({ output: 'Process failed: ' + err.message.slice(0, 200), error: true });
        });
});

function getCompileHint(lang) {
    const hints = {
        c: '// gcc -Wall -o program program.c && ./program',
        cpp: '// g++ -std=c++20 -Wall -o program program.cpp && ./program',
        cs: '// dotnet run or csc program.cs && mono program.exe',
        go: '// go run program.go',
        rust: '// rustc program.rs && ./program',
        zig: '// zig build-exe program.zig && ./program',
        swift: '// swift program.swift',
        kt: '// kotlinc program.kt -include-runtime -d program.jar && java -jar program.jar',
        ts: '// tsc program.ts && node program.js',
        rs: '// rustc program.rs && ./program',
        dk: '// docker build -t myapp . && docker run myapp',
        git: '// git commands run in your terminal directly',
        sqlite: '// SQLite execution is built-in. Click Run!',
        pg: '// PostgreSQL: set PG_CONNECTION_STRING in .env or use psql -f query.sql',
        mysql: '// MySQL: set MYSQL_CONNECTION_STRING in .env or use mysql < query.sql',
        mongodb: '// mongosh < script.js or paste into mongosh',
        gamedev: '// Use your game engine IDE to run this code',
        quiz: '// Quiz questions are interactive in the UI',
        challenge: '// Challenges run in the JavaScript sandbox above'
    };
    return hints[lang] || `// Check your ${lang.toUpperCase()} documentation for execution instructions.`;
}

function analyzeJSError(code, e) {
    const msg = e.message || '';
    const pos = parseErrorPosition(msg);
    let explanation = '';
    let fix = '';

    if (msg.includes('Unexpected token')) {
        const token = msg.match(/'([^']+)'/)?.[1] || 'something';
        explanation = `**Syntax Error: Unexpected token \`${token}\`**\nThe parser found \`${token}\` in an unexpected place. This usually means:`;
        if (token === '}') explanation += '\n- You have an extra closing brace `}` without a matching opening brace\n- Check that all `{`, `(`, `[` are properly closed';
        else if (token === ')') explanation += '\n- You have an extra closing parenthesis `)` without a matching opening one\n- Check function calls and expressions for balanced parentheses';
        else if (token === ';') explanation += '\n- You placed a semicolon where it doesn\'t belong (e.g., after a function declaration or inside a condition)';
        else explanation += `\n- Check for missing operators, quotes, or commas near \`${token}\``;
    } else if (msg.includes('is not defined')) {
        const name = msg.match(/'([^']+)'/)?.[1] || 'something';
        explanation = `**ReferenceError: \`${name}\` is not defined**\nYou're trying to use \`${name}\` but it hasn't been declared yet.`;
        fix = `- Declare it first: \`let ${name} = value;\` or \`const ${name} = value;\`\n- Check for typos in the variable name\n- Make sure the variable is in scope (defined in the same or outer block)`;
    } else if (msg.includes('is not a function')) {
        const name = msg.match(/'([^']+)'/)?.[1] || 'something';
        explanation = `**TypeError: \`${name}\` is not a function**\nYou're trying to call \`${name}\` as a function, but it's something else (undefined, number, object, etc.).`;
        fix = `- Check if \`${name}\` is actually a function (defined with \`function\` or \`=>\`)\n- Make sure the variable name is spelled correctly\n- Verify the function exists in the current scope`;
    } else if (msg.includes('Cannot read property') || msg.includes('Cannot read properties')) {
        explanation = `**TypeError: Cannot read property of undefined/null**\nYou're accessing a property on a value that is \`undefined\` or \`null\`.`;
        fix = '- Use optional chaining: `obj?.prop`\n- Check if the variable was initialized properly\n- Add a guard: `if (obj) { obj.prop }`';
    } else if (msg.includes('Unexpected identifier')) {
        explanation = `**Syntax Error: Unexpected identifier**\nThe parser found an unexpected word. Common causes:`;
        fix = '- Missing comma between array/object items\n- Missing operator (like `+`, `=`, etc.)\n- Using reserved words as variable names\n- Missing parentheses around function calls';
    } else if (msg.includes('Illegal return statement')) {
        explanation = `**Syntax Error: Return outside function**\nYou used \`return\` outside of a function body.`;
        fix = '- Wrap your code in a function: `function myFunc() { ... }`\n- Remove the `return` statement if you just want to output a value';
    } else if (msg.includes('Missing') && msg.includes('parenthesis')) {
        explanation = `**Syntax Error: Missing parenthesis**\nYou're missing a closing \`)\` or opening \`(\` parenthesis.`;
        fix = '- Check that every `(` has a matching `)`\n- Look for function calls and expressions that may be imbalanced';
    } else {
        explanation = `**Error: ${msg}**\nAn error occurred while running your code.`;
        fix = '- Check the code for typos, missing brackets, or incorrect syntax\n- Review the error message and look at the line indicated\n- Try simplifying your code to isolate the issue';
    }

    return `// ╔══════════════════════════════════════╗\n// ║  ERROR ANALYSIS                         ║\n// ╚══════════════════════════════════════╝\n\n${explanation}\n\n**How to fix:**\n${fix}\n\n**Code with issue (line ${pos.line}):**\n${getCodeLine(code, pos.line)}`;
}

function analyzeRuntimeError(code, e) {
    const msg = e.message || '';
    let explanation = '';
    let fix = '';

    if (msg.includes('not a function')) {
        explanation = `**Runtime Error: \`${msg.match(/'([^']+)'/)?.[1] || 'value'}\` is not a function**\nYou're trying to call something that isn't a function.`;
        fix = '- Check if the variable holds a function or a different type\n- Log the value with `console.log(typeof variableName)` to see what it is\n- Make sure the function name is spelled correctly';
    } else if (msg.includes('Cannot read property') || msg.includes('Cannot read properties')) {
        explanation = `**Runtime Error: Accessing property on undefined/null**\nA value was \`undefined\` or \`null\` when you tried to access its property.`;
        fix = '- Use optional chaining: `obj?.prop`\n- Initialize variables before using them\n- Check if the data you expect is actually there with `console.log()`\n- Add default values: `obj?.prop ?? defaultValue`';
    } else if (msg.includes('is not iterable')) {
        explanation = `**Runtime Error: Value is not iterable**\nYou used \`for...of\` or spread \`...\` on a value that can't be iterated.\nOnly arrays, strings, Maps, Sets, and other iterables work.`;
        fix = '- Check if the value is actually an array (use `Array.isArray()` to verify)\n- Make sure the variable contains the expected data type';
    } else if (msg.includes('Cannot set property') || msg.includes('read only')) {
        explanation = `**Runtime Error: Trying to modify a constant/read-only value**\nYou're trying to reassign a \`const\` variable or modify a read-only property.`;
        fix = '- Use `let` instead of `const` if you need to reassign\n- Check if the object/property is read-only (frozen)';
    } else if (msg.includes('Division by zero')) {
        explanation = `**Runtime Warning: Division by zero**\nJavaScript returns \`Infinity\` when dividing by zero, which is probably not what you want.`;
        fix = '- Add a check: `if (b !== 0) { result = a / b; }`\n- Or use a default: `b === 0 ? null : a / b`';
    } else if (msg.includes('timeout')) {
        explanation = `**Runtime Error: Execution timed out**\nYour code took more than 5 seconds to run. This is usually caused by an infinite loop.`;
        fix = '- Check for infinite loops (for/while without a termination condition)\n- Make sure your loop counter is being incremented\n- Add a counter limit in development';
    } else {
        explanation = `**Runtime Error:** ${msg}`;
        fix = '- Check the logic of your code\n- Add `console.log()` statements to debug intermediate values\n- Review the line number in the error to find the issue';
    }

    return `// ╔══════════════════════════════════════╗\n// ║  RUNTIME ERROR ANALYSIS                 ║\n// ╚══════════════════════════════════════╝\n\n${explanation}\n\n**How to fix:**\n${fix}`;
}

function parseErrorPosition(msg) {
    const m = msg.match(/line (\d+)/i);
    return { line: m ? parseInt(m[1]) : 0 };
}

function getCodeLine(code, line) {
    if (line <= 0) return '';
    const lines = code.split('\n');
    if (line - 1 < lines.length) {
        const start = Math.max(0, line - 3);
        const end = Math.min(lines.length, line + 1);
        let result = '';
        for (let i = start; i < end; i++) {
            const marker = i === line - 1 ? '>>> ' : '    ';
            result += `${marker}${i + 1}: ${lines[i]}\n`;
        }
        return result.trim();
    }
    return '';
}

// ── Code Analysis API ──
const COMMON_PATTERNS = {
    '==': `You used \`==\` (loose equality). Prefer \`===\` (strict equality) to avoid type coercion bugs.\n   Example: "5" == 5 is true, but "5" === 5 is false.`,
    'var ': `Using \`var\` is outdated. Use \`let\` (mutable) or \`const\` (immutable) for block-scoped variables.\n   var is function-scoped and can cause subtle bugs in loops and closures.`,
    'console.log': '✓ Good use of console.log for debugging! Remember to remove or comment out debug logs in production.',
};

app.post('/api/analyze', (req, res) => {
    const { code, lang } = req.body;
    if (!code) return res.json({ hints: [] });

    const hints = [];
    if (lang === 'js') {
        for (const [pattern, hint] of Object.entries(COMMON_PATTERNS)) {
            if (code.includes(pattern)) {
                hints.push(hint);
            }
        }
        if (code.includes('function') && !code.includes('return')) {
            hints.push('Your function doesn\'t use \`return\`. If it should return a value, add a \`return\` statement.');
        }
        if ((code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length) {
            hints.push('Unbalanced parentheses! Make sure every \`(\` has a matching \`)\`.');
        }
        if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) {
            hints.push('Unbalanced curly braces! Make sure every \`{\` has a matching \`}\`.');
        }
        if ((code.match(/\[/g) || []).length !== (code.match(/\]/g) || []).length) {
            hints.push('Unbalanced square brackets! Make sure every \`[\` has a matching \`]\`.');
        }
    }
    res.json({ hints });
});

// ── AI Chat API (Enhanced, Learning-Focused) ──

function analyzeUserCode(code, lang) {
    if (!code || !lang) return null;
    const hints = [];
    const lines = code.split('\n');

    if (lang === 'js') {
        const unclosedBraces = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
        const unclosedParens = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        if (unclosedBraces > 0) hints.push('You have {unclosed curly braces}. Add `' + '}'.repeat(unclosedBraces) + '` at the end.');
        if (unclosedBraces < 0) hints.push('You have ' + Math.abs(unclosedBraces) + ' too many closing braces `}`.');
        if (unclosedParens > 0) hints.push('You have {unclosed parentheses}. Add `' + ')'.repeat(unclosedParens) + '`.');
        if (unclosedParens < 0) hints.push('You have extra closing parentheses.');
        if (!code.includes('return') && (code.includes('function') || code.includes('=>'))) {
            hints.push('Your function has no `return` statement. It will return `undefined`.');
        }
        if (code.includes('==')) hints.push('Consider using `===` (strict equality) instead of `==` to avoid type coercion.');
        if (code.includes('var ')) hints.push('Use `let` or `const` instead of `var` for block scoping.');
    } else if (lang === 'py') {
        const leadingSpaces = lines.filter(l => l.trim() && l.startsWith(' '));
        if (leadingSpaces.length > 0) {
            const spaces = leadingSpaces[0].search(/\S/);
            const mixed = leadingSpaces.some(l => l.includes('\t'));
            if (mixed) hints.push('Mixing tabs and spaces in indentation causes errors. Stick to 4 spaces.');
        }
    }
    return hints.length > 0 ? hints : null;
}

const aiResponses = require('./public/ai-responses');


function buildLLMMessages(message, lang, topic, phase, code, output, hasError, history) {
    const messages = [];
    const context = [];

    if (topic) {
        const topicCtx = getTopicContext(topic, lang);
        if (topicCtx) context.push(topicCtx);
    }

    if (code) {
        const analysis = analyzeUserCode(code, lang);
        if (analysis && analysis.length > 0) {
            context.push(`The user has written this code:\n\`\`\`\n${code}\n\`\`\`\n\nCode analysis findings:\n${analysis.map((h, i) => `${i + 1}. ${h}`).join('\n')}`);
        } else {
            context.push(`The user has written this code:\n\`\`\`\n${code}\n\`\`\``);
        }
    }

    if (hasError && output) {
        context.push(`The code produced this output/error:\n\`\`\`\n${output.replace(/<[^>]*>/g, '').trim()}\n\`\`\``);
    }

    if (!topic) {
        const curriculumCtx = getCurriculumContext(message, lang);
        if (curriculumCtx) context.push(curriculumCtx);
    }

    if (context.length > 0) {
        messages.push({ role: 'user', content: `Context:\n${context.join('\n\n')}\n\nUser question: ${message}` });
    } else if (history && history.length > 0) {
        for (const msg of history.slice(-10)) {
            messages.push({ role: msg.role === 'bot' ? 'assistant' : 'user', content: msg.text || msg.content || '' });
        }
        messages.push({ role: 'user', content: message });
    } else {
        messages.push({ role: 'user', content: message });
    }

    return messages;
}

// ── Explain Code API ──
app.post('/api/explain', async (req, res) => {
    const { code, lang, topic } = req.body;
    if (!code) return res.json({ explanation: "No code provided to explain." });

    if (process.env.AI_PROVIDER && process.env.AI_PROVIDER !== 'keyword') {
        const context = topic ? `The user is studying ${topic} in ${lang || 'programming'}.` : `The user is programming in ${lang || 'a language'}.`;
        const messages = [
            { role: 'user', content: `${context}\n\nPlease explain the following code step by step. Describe what each line does, identify the programming concepts used, and suggest any improvements:\n\n\`\`\`\n${code}\n\`\`\`` }
        ];
        const llmReply = await askLLM(messages);
        if (llmReply) return res.json({ explanation: llmReply, source: 'llm' });
    }

    const reviewResult = await codeReview(code, lang || 'js', topic);

    const lines = code.split('\n');
    let explanation = '';

    const hasLLM = reviewResult.source === 'llm';
    if (hasLLM) {
        explanation = reviewResult.review;
    } else {
        explanation = `**Code Overview:**\n`;
        explanation += `- **${lines.length} lines** of ${(lang || 'code').toUpperCase()}\n`;
        if (code.includes('function') || code.includes('=>')) explanation += "- Defines one or more **functions**\n";
        if (code.includes('for(') || code.includes('for (')) explanation += "- Contains a **for loop**\n";
        if (code.includes('while(') || code.includes('while (')) explanation += "- Contains a **while loop**\n";
        if (code.includes('if(') || code.includes('if (')) explanation += "- Contains **conditional logic** (if statements)\n";
        if (code.includes('class ')) explanation += "- Defines a **class**\n";
        if (code.includes('return ')) explanation += "- Uses **return statements**\n";
        if (code.includes('const ') || code.includes('let ') || code.includes('var ')) explanation += "- Declares **variables**\n";
        if (code.includes('.')) explanation += "- Calls **methods** or accesses **properties**\n";

        if (reviewResult.issues && reviewResult.issues.length > 0) {
            explanation += "\n\n**Potential Issues:**\n";
            explanation += reviewResult.issues.map((h, i) => `${i + 1}. ${h.message}`).join('\n');
        }

        if (reviewResult.score) {
            explanation += `\n\n**Code Score:** ${reviewResult.score}/10`;
        }

        explanation += "\n\n**Suggestion:** Try modifying the code in the editor and running it to see how changes affect the output!";
    }

    res.json({ explanation, source: reviewResult.source || 'static', issues: reviewResult.issues, score: reviewResult.score });
});

// ── AI Code Review API ──
app.post('/api/review', async (req, res) => {
    const { code, lang, topic, learnerId } = req.body;
    if (!code) return res.json({ review: 'No code provided.', issues: [], score: 0 });

    const result = await codeReview(code, lang, topic);

    if (learnerId && result.issues) {
        const errorCount = result.issues.filter(i => i.severity === 'error' || i.severity === 'warning').length;
        if (errorCount > 0) {
            await learner.trackError(learnerId, lang || 'js', topic || 'general');
        }
        await learner.trackAttempt(learnerId, lang || 'js', topic || 'general');
    }

    res.json(result);
});

// ── AI Exercise Generator API ──
app.post('/api/exercise', async (req, res) => {
    const { topic, lang, level } = req.body;
    if (!topic) return res.status(400).json({ error: 'No topic provided' });

    const exercise = await generateExercise(topic, lang || 'js', level || 'beginner');
    res.json(exercise);
});

// ── Learner State API ──
function getLearnerId(req) {
    return req.body?.learnerId || req.query?.learnerId || req.ip || 'default';
}

app.post('/api/learner/track', async (req, res) => {
    const learnerId = getLearnerId(req);
    const { event, lang, topic, phase, data } = req.body;

    try {
        switch (event) {
            case 'complete-topic':
                await learner.trackTopicCompletion(learnerId, lang, topic, phase);
                break;
            case 'error':
                await learner.trackError(learnerId, lang, topic);
                break;
            case 'attempt':
                await learner.trackAttempt(learnerId, lang, topic);
                break;
            case 'quiz':
                await learner.trackQuiz(learnerId, data?.correct, data?.total);
                break;
            case 'challenge':
                await learner.trackChallenge(learnerId, data?.solved);
                break;
            case 'ai-interaction':
                await learner.trackAIInteraction(learnerId);
                break;
            default:
                return res.status(400).json({ error: 'Unknown event type' });
        }
        res.json({ ok: true });
    } catch (e) {
        console.error('learner track error:', e.message);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

app.get('/api/learner/state', async (req, res) => {
    const learnerId = getLearnerId(req);
    const lang = req.query.lang;
    try {
        const learnerState = await learner.getLearner(learnerId);
        const mastery = lang ? await learner.getConceptMastery(learnerId, lang) : null;
        res.json({ learner: learnerState, mastery });
    } catch (e) {
        console.error('learner state error:', e.message);
        res.status(500).json({ error: 'Failed to get learner state' });
    }
});

app.get('/api/learner/reviews', async (req, res) => {
    const learnerId = getLearnerId(req);
    try {
        const due = await learner.getDueReviews(learnerId);
        res.json({ due });
    } catch (e) {
        console.error('learner reviews error:', e.message);
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});

app.get('/api/learner/recommend', async (req, res) => {
    const learnerId = getLearnerId(req);
    const lang = req.query.lang;
    try {
        const availablePhases = req.query.topics ? JSON.parse(req.query.topics) : {};
        const recommendation = await learner.getNextRecommendedTopic(learnerId, lang, availablePhases);
        res.json({ recommendation });
    } catch {
        res.json({ recommendation: null });
    }
});

// ── Enhanced Chat with Semantic Search ──
app.post('/api/chat', async (req, res) => {
    const { message, lang, topic, phase, code, output, hasError, history, learnerId } = req.body;
    if (!message) return res.json({ reply: "Ask me something about programming!" });
    const q = resolveFollowUp(message, history).toLowerCase().trim();

    const lid = learnerId || req.ip || 'default';
    try { await learner.trackAIInteraction(lid); } catch {};

    const sseSend = (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    };
    const sseDone = () => {
        res.write('data: [DONE]\n\n');
        res.end();
    };

    try {
        // ── 1. Try LLM first if configured ──
        if (process.env.AI_PROVIDER && process.env.AI_PROVIDER !== 'keyword') {
            const llmMessages = buildLLMMessages(message, lang, topic, phase, code, output, hasError, history);
            let full = '';
            let gotChunk = false;
            await askLLM(llmMessages, (chunk) => {
                gotChunk = true;
                full += chunk;
                sseSend(chunk);
            });
            if (gotChunk) {
                if (topic && lang) await learner.trackAttempt(lid, lang, topic);
                return sseDone();
            }
        }

        // ── 2. Code-aware, error-aware help ──
        if (hasError || /error|bug|fix|wrong|not working|issue/.test(q)) {
            let errorReply = '';
            if (code) {
                const analysis = analyzeUserCode(code, lang);
                if (analysis && analysis.length > 0) {
                    errorReply = "I looked at your code and found some issues:\n\n" +
                        analysis.map((h, i) => `${i + 1}. ${h}`).join('\n') + '\n\n';
                }
            }
            if (output && /Error|ReferenceError|TypeError|SyntaxError|FAIL/.test(output)) {
                const cleanOutput = output.replace(/<[^>]*>/g, '').trim();
                errorReply += `**Your code produced this output:**\n\`\`\`\n${cleanOutput}\n\`\`\`\n\n`;
            }
            if (code && topic) {
                errorReply += `Since you're working on **${topic}**, here's a hint:\n`;
                errorReply += `- Look at the example in the curriculum and compare it with your code line by line\n`;
                errorReply += `- Try simplifying: comment out parts until it works, then add them back one at a time\n`;
                errorReply += `- Check the most common mistake for this topic and see if it applies to you\n\n`;
            }
            if (!errorReply) {
                errorReply = "Let's debug this systematically:\n\n**1. What did you expect?**\n**2. What actually happened?**\n**3. What have you tried?**\n\nShare your code and the error message, and I'll help!";
            } else {
                errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step.";
            }
            if (topic && lang) await learner.trackError(lid, lang, topic);
            return streamReply(res, errorReply);
        }

        // ── 3. Follow-up detection ──
        if (history && history.length >= 2) {
            const lastBotMsg = history.filter(h => h.role === 'bot').pop();
            if (lastBotMsg && /yes|ok|sure|tell me more|example|show me/.test(q)) {
                const followUps = {
                    'variable': "Let's practice! Try this in the editor:\n```\n// Declare a variable 'name' with your name as a string\n// Declare a variable 'age' with your age as a number\n// Print both using console.log()\n```\nThen click Run and tell me what you see!",
                    'function': "Here's a simple exercise: Write a function called `add` that takes two parameters and returns their sum. Then call it and log the result.\n\n**Hint:** `function add(a, b) { ... }`",
                    'loop': "Practice: Write a loop that prints the numbers 1 through 10. Then modify it to only print even numbers.\n\n**Hint for evens:** Use `if (i % 2 === 0)` to check if a number is even.",
                    'array': "Try this: Create an array of your 3 favorite foods. Write a loop that prints \"I like [food]\" for each one.",
                    'class': "Exercise: Create a `Person` class with `name` and `age` properties. Add a `greet()` method that says \"Hi, I'm [name]!\". Create an instance and call greet()."
                };
                for (const [key, reply] of Object.entries(followUps)) {
                    if (lastBotMsg.text && lastBotMsg.text.toLowerCase().includes(key)) {
                        return streamReply(res, reply);
                    }
                }
            }
            if (q.includes('thank')) {
                return streamReply(res, "You're welcome! The best way to learn is by doing. Keep experimenting, keep breaking things, and keep asking questions. What would you like to explore next?");
            }
        }

        // ── 4. Try semantic curriculum search ──
        const searchLang = detectLanguage(message) || lang;
        const semanticResults = await semanticSearch(q, searchLang, 1);
        if (semanticResults.length > 0 && semanticResults[0].score > 0.15) {
            const best = semanticResults[0];
            let reply = `I found relevant content in the curriculum related to your question.\n\n**${best.topic}** (${best.lang.toUpperCase()} - ${best.phase})\n\n`;
            reply += best.exp.slice(0, 500) + '...\n\n';
            if (best.code) {
                reply += `**Example code:**\n\`\`\`\n${best.code}\n\`\`\`\n\n`;
            }
            reply += `Would you like me to explain more about **${best.topic}** or help you practice it?`;
            return streamReply(res, reply);
        }

        // ── 5. Context-aware topic matching ──
        if (topic && /what|how|explain|tell me|\?/.test(q)) {
            for (const entry of aiResponses) {
                if (entry.keywords.some(k => topic.toLowerCase().includes(k))) {
                    let reply = entry.response;
                    reply += `\n\n**You're currently studying:** ${topic} (${phase || ''})`;
                    reply += `\nTry the code example in the editor, modify it, and click Run to see what happens!`;
                    return streamReply(res, reply);
                }
            }
        }

        // ── 6. Standard keyword matching ──
        for (const entry of aiResponses) {
            if (entry.keywords.some(k => q.includes(k))) {
                return streamReply(res, entry.response);
            }
        }

        // ── 7. Secondary keyword matching ──
        for (const entry of aiResponses) {
            const combined = entry.keywords.join(' ');
            if (combined.includes(q.replace(/[^a-z\s]/g, '').trim())) {
                return streamReply(res, entry.response);
            }
        }

        // ── 8. Greeting / thanks ──
        if (q.includes('thank')) {
            return streamReply(res, "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step! What would you like to learn next?");
        }

        if (/hello|hi |^hey$|good/.test(q)) {
            const langInfo = lang ? `I see you're studying **${lang.toUpperCase()}**. ` : '';
            return streamReply(res, `Hello! ${langInfo}Ask me anything about the topic you're working on, or pick a suggestion below to get started!`);
        }

        // ── 9. Socratic / generic fallback ──
        if (topic) {
            return streamReply(res, `Great question about **${topic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far in the editor? Tell me your thought process and I'll help guide you to the right solution!`);
        }

        const fallbacks = [
            "That's an interesting question! To help you best, could you tell me:\n1. What language are you working with?\n2. What topic are you studying?\n3. What have you tried so far?",
            "I want to make sure I help you effectively. Could you tell me more about what you're working on? For example: \"Explain functions\" or \"Help me debug my loop\".",
            "Let me help you learn! Try asking me about a specific topic you're studying, or tell me what you're trying to build. I can explain concepts, debug code, and suggest practice exercises."
        ];
        return streamReply(res, fallbacks[Math.floor(Math.random() * fallbacks.length)]);

    } catch (e) {
        sseSend("Sorry, I encountered an error processing your request. Please try again.");
        sseDone();
    }
});

// ── API Proxy (Thunderclient-style) ──
const FORBIDDEN_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]', '169.254.169.254', 'metadata.google.internal', '100.100.100.200'];
const FORBIDDEN_PATTERNS = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^127\./, /^0\./];

function isValidProxyUrl(urlStr) {
    try {
        const parsed = new URL(urlStr);
        if (!['http:', 'https:'].includes(parsed.protocol)) return false;
        const host = parsed.hostname.toLowerCase();
        if (FORBIDDEN_HOSTS.some(fh => host === fh || host.endsWith('.' + fh))) return false;
        if (FORBIDDEN_PATTERNS.some(p => p.test(host))) return false;
        return true;
    } catch { return false; }
}

app.post('/api/proxy', async (req, res) => {
    const { method = 'GET', url, headers: reqHeaders = {}, body } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });
    if (!isValidProxyUrl(url)) return res.status(400).json({ error: 'Invalid or forbidden URL' });

    const maxSize = 2 * 1024 * 1024;
    const timeout = 15000;

    try {
        const parsedUrl = new URL(url);
        const lib = parsedUrl.protocol === 'https:' ? https : http;
        const start = Date.now();

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: method.toUpperCase(),
            headers: { ...reqHeaders },
            timeout,
        };

        const result = await new Promise((resolve, reject) => {
            const proxyReq = lib.request(options, (proxyRes) => {
                const chunks = [];
                let totalSize = 0;
                proxyRes.on('data', (chunk) => {
                    totalSize += chunk.length;
                    if (totalSize > maxSize) {
                        proxyRes.destroy();
                        reject(new Error('Response too large (>2MB)'));
                        return;
                    }
                    chunks.push(chunk);
                });
                proxyRes.on('end', () => {
                    const responseTime = Date.now() - start;
                    const raw = Buffer.concat(chunks).toString('utf-8');
                    const responseHeaders = {};
                    for (const [k, v] of Object.entries(proxyRes.headers)) {
                        responseHeaders[k] = Array.isArray(v) ? v.join(', ') : v;
                    }
                    resolve({
                        status: proxyRes.statusCode,
                        statusText: proxyRes.statusMessage,
                        headers: responseHeaders,
                        body: raw,
                        time: responseTime,
                        size: totalSize,
                    });
                });
            });

            proxyReq.on('error', (e) => reject(new Error(e.message)));
            proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Request timed out')); });

            if (body && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
                proxyReq.write(body);
            }
            proxyReq.end();
        });

        // Try pretty-printing JSON for display
        let displayBody = result.body;
        try {
            const parsed = JSON.parse(result.body);
            displayBody = JSON.stringify(parsed, null, 2);
        } catch {}

        res.json({ ...result, displayBody });
    } catch (e) {
        res.json({ error: e.message, status: 0, body: '', time: 0, size: 0 });
    }
});

// ── Benchmark API ──
app.get('/api/benchmark', (req, res) => {
    const { n = 10000 } = req.query;
    const count = parseInt(n);
    const start = process.hrtime.bigint();
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum += i * i;
    }
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    res.json({
        backend: 'Node.js',
        version: process.version,
        iterations: count,
        result: sum,
        timeMs: Math.round(ms * 100) / 100,
        opsPerSec: Math.round(count / (ms / 1000))
    });
});

// ── Get available courses ──
app.get('/api/courses', (req, res) => {
    try {
        const CONTENT_DIR = path.join(__dirname, 'content');
        const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
        const courses = files.map(f => f.replace('.json', ''));
        res.json(courses);
    } catch (e) {
        res.json({ error: e.message });
    }
});

// ── Start ──
app.listen(PORT, () => {
    console.log(`Doge's Lab running at http://localhost:${PORT}`);
});
