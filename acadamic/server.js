const express = require('express');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

app.use(express.json());
app.use(express.static(__dirname));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PROGRESS_FILE)) fs.writeFileSync(PROGRESS_FILE, '{}');

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

// ── Execute Code API ──
app.post('/api/execute', (req, res) => {
    const { lang, code } = req.body;
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

    const runners = {
        py:  { cmd: 'python3 -u "%f"', ext: '.py' },
        go:  { cmd: 'go run "%f"', ext: '.go' },
        ts:  { cmd: 'tsx "%f"', ext: '.ts' },
        rs:  { cmd: 'rustc -o _prog "%f" && ./_prog', ext: '.rs' },
        c:   { cmd: 'gcc -Wall -o _prog "%f" && ./_prog', ext: '.c' },
        cpp: { cmd: 'g++ -std=c++20 -Wall -o _prog "%f" && ./_prog', ext: '.cpp' },
        cs:  { cmd: 'dotnet script "%f"', ext: '.csx' },
        kt:  { cmd: 'kotlinc -include-runtime -d _prog.jar "%f" && java -jar _prog.jar', ext: '.kt' },
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

    exec(cmd, { timeout: 120000, cwd: tmpDir, env }, (err, stdout, stderr) => {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
        if (err) console.error('exec err:', err.message);
        const combined = (stdout || '') + (stderr || '');
        const out = combined.trim() || (err ? 'Process failed' : '(no output)');
        return res.json({ output: out.replace(/\n+$/, '') });
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
        pg: '// psql -f query.sql or run directly in psql shell',
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

// ── AI Chat API (Enhanced) ──
const aiResponses = [
    { keywords: ['variable', 'declare', 'let', 'const', 'var'], response: "Variables store data values. Use `let`/`const` in JS, `var`/`val` in Kotlin, `:=` in Go, or just `name = value` in Python. Pick the right scope for your use case.\n\n**Common mistakes:**\n- Using `var` instead of `let`/`const` (JS) — causes scope bugs\n- Forgetting `let`/`const`/`var` makes a global variable (JS)\n- Using `const` for values that need to change — use `let` with `const` for constants only" },
    { keywords: ['function', 'method', 'def', 'func'], response: "Functions are reusable blocks. `function name(){}` in JS, `def name():` in Python, `func name(){}` in Go, `fun name(){}` in Kotlin. Keep them short and focused on one task.\n\n**Common mistakes:**\n- Missing `return` statement — function returns `undefined`\n- Forgetting parentheses when calling: `myFunc` vs `myFunc()`\n- Mutating input parameters directly — creates side effects" },
    { keywords: ['class', 'object', 'oop', 'inherit', 'extends', 'prototype'], response: "OOP organizes code around objects. Classes define blueprints: JS/Python/Kotlin/C# use `class`, Go uses structs+methods, Zig uses structs with no inheritance. Favor composition over inheritance.\n\n**Key concepts:**\n- Encapsulation: keep internal state private\n- Polymorphism: same interface, different behavior\n- Composition: has-a vs is-a relationships" },
    { keywords: ['array', 'list', 'collection', 'map', 'set'], response: "Collections hold multiple values. Arrays are fixed-size. Lists/Slices grow dynamically. Maps store key-value pairs. Choose the right collection for your access pattern.\n\n**Common mistakes:**\n- Off-by-one errors: `arr[arr.length]` is out of bounds\n- Using `delete arr[i]` (leaves hole) instead of `splice()`\n- Forgetting arrays are 0-indexed" },
    { keywords: ['loop', 'for', 'while', 'iterate', 'foreach'], response: "Loops repeat code. `for` is universal. `while` runs while a condition is true. `forEach`/`map` provide functional iteration. Use `break` to exit early, `continue` to skip.\n\n**Common mistakes:**\n- Infinite loops: forgetting to increment counter\n- Off-by-one: using `<=` instead of `<`\n- Modifying an array while iterating over it" },
    { keywords: ['error', 'exception', 'try', 'catch', 'panic', 'throw'], response: "Error handling: JS/Python/C# use try/catch. Go returns errors as values. Zig uses error unions. Rust uses Result. Handle errors explicitly and early — don't swallow exceptions.\n\n**Best practices:**\n- Catch specific error types, not generic `Exception`\n- Always clean up resources in `finally`\n- Log errors with context, not just the message" },
    { keywords: ['async', 'await', 'promise', 'future', 'coroutine', 'callback'], response: "Async code runs without blocking. JS: Promises + async/await. Python: asyncio. C#: Task + async/await. Go: goroutines + channels. Kotlin: coroutines + suspend.\n\n**Common mistakes:**\n- Forgetting `await` inside `async` function\n- Not handling promise rejections with `.catch()`\n- Callback hell — use Promises or async/await\n- Passing async function directly where sync is expected" },
    { keywords: ['type', 'string', 'int', 'bool', 'float', 'null', 'undefined'], response: "Types define data. Statically-typed languages catch errors at compile time. Dynamically-typed languages are flexible. Type annotations improve readability.\n\n**Common mistakes:**\n- Confusing `null` vs `undefined` (JS)\n- String vs number coercion: `'5' + 3 = '53'` not 8\n- `typeof null === 'object'` — a longstanding JS bug" },
    { keywords: ['git', 'commit', 'push', 'pull', 'branch', 'merge', 'rebase'], response: "Git tracks changes. `git add` stages, `git commit` saves, `git push` uploads. Branches isolate work. Merge combines branches. Pull fetches + merges remote changes.\n\n**Common mistakes:**\n- Committing to main instead of a feature branch\n- Merge conflicts from not pulling before pushing\n- Using `--force` push on shared branches (use `--force-with-lease`)\n- Forgetting to add `.gitignore` before committing" },
    { keywords: ['sql', 'select', 'join', 'table', 'database', 'query', 'where'], response: "SQL manages relational data. SELECT retrieves, INSERT adds, UPDATE modifies, DELETE removes. JOINs combine tables. Indexes speed up queries. Design schemas before coding.\n\n**Common mistakes:**\n- Forgetting WHERE in UPDATE/DELETE — affects ALL rows\n- N+1 query problem — use JOIN instead of looping\n- Not using parameterized queries — SQL injection vulnerability\n- Missing indexes on frequently queried columns" },
    { keywords: ['debug', 'bug', 'fix', 'issue', 'wrong', 'not working', 'broken'], response: "Debugging is the art of finding what's wrong. Systematic approach:\n\n1. **Read the error message** — it tells you what and where\n2. **Reproduce** — can you make it happen consistently?\n3. **Isolate** — comment out code until the bug disappears\n4. **Inspect** — use `console.log()` or a debugger to check values\n5. **Fix** — make the smallest change possible\n6. **Verify** — does the fix actually work?\n\n**Tools:** built-in debugger, `console.log()`, breakpoints, watch variables" },
    { keywords: ['help', 'how', 'what is', 'explain', 'understand', 'confused'], response: "Happy to help you understand! Let me break it down:\n\n**To learn effectively:**\n1. Read the code example in the curriculum\n2. Type it out yourself (don't copy-paste)\n3. Modify it slightly and see what changes\n4. Break it intentionally to understand error messages\n5. Build small projects to practice\n\nWhat specific concept are you working on? Tell me the topic and I'll explain it clearly." },
    { keywords: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack'], response: "Memory management is crucial in low-level languages (C, C++, Rust, Zig).\n\n- **Stack:** fast, limited size, automatic cleanup (local variables)\n- **Heap:** flexible, manual management, larger (dynamic allocation)\n- **Pointer:** stores a memory address\n\n**Common mistakes:**\n- Memory leaks: forgetting to `free()`/`delete`\n- Dangling pointers: using memory after freeing\n- Buffer overflows: writing past array bounds\n- Double free: freeing the same memory twice" },
    { keywords: ['closure', 'scope', 'hoist', 'temporal dead zone', 'tdz'], response: "Scope determines where variables are accessible.\n\n- **Global scope:** accessible everywhere\n- **Function scope:** only inside the function (var, function)\n- **Block scope:** only inside the block `{}` (let, const)\n- **Closure:** a function that remembers its outer variables even after the outer function returns\n\n**Common mistakes:**\n- Hoisting confusion: `var` is hoisted (initialized as undefined), `let`/`const` are hoisted but not initialized (TDZ)\n- Closure loop bug: using `var i` in a loop with async callbacks captures the same `i`" },
    { keywords: ['syntax', 'error', 'semicolon', 'bracket', 'parenthesis', 'brace'], response: "Syntax errors mean the compiler/parser can't understand your code. This is the most common beginner issue!\n\n**Quick checklist:**\n- Are all `(`, `{`, `[` properly closed with `)`, `}`, `]`?\n- Are strings quoted with matching quotes? `\"...\"` or `'...'` or `\\`...\\``\n- Are all statements terminated? (JS/C#/C++/Java: semicolons; Python: newlines)\n- Are variable names spelled the same everywhere?\n- Did you forget a comma between array/object items?\n\n**Tip:** Read the error message carefully — it tells you the line number and what it expected vs what it found." },
    { keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'], response: "Hello! I'm your programming assistant. I can help you with:\n- Understanding code examples\n- Debugging errors\n- Explaining programming concepts\n- Best practices and common mistakes\n\nWhat language are you learning today? Ask me anything about the curriculum!" },
    { keywords: ['string', 'concatenat', 'interpolat', 'template', 'char', 'substring'], response: "Strings are sequences of characters.\n\n**Common operations:**\n- Concatenation: `'a' + 'b'` or `\\`...\\`` with interpolation\n- Length: `str.length` (JS), `len(str)` (Python), `strlen(s)` (C)\n- Substring: `str.slice(0, 5)`, `str.substring(0, 5)`\n- Case: `str.toUpperCase()`, `str.toLowerCase()`\n\n**Common mistakes:**\n- Strings are immutable in most languages — methods return NEW strings\n- Off-by-one in substring/slice end index\n- Using `==` vs `.equals()` for string comparison in some languages" }
];

app.post('/api/chat', (req, res) => {
    const { message, lang } = req.body;
    if (!message) return res.json({ reply: "Ask me something about programming!" });
    const q = message.toLowerCase();

    for (const entry of aiResponses) {
        if (entry.keywords.some(k => q.includes(k))) {
            return res.json({ reply: `${entry.response}` });
        }
    }

    if (q.startsWith('fix ') || q.startsWith('debug ') || q.includes(' not working')) {
        return res.json({ reply: `I see you need help debugging! Try this:\n\n1. **Read the error** — what does it say exactly?\n2. **Isolate the problem** — comment out parts until it works\n3. **Check the console** — use \`console.log()\` to inspect values step by step\n4. **Simplify** — can you reproduce the issue with fewer lines?\n\nIf you share the code and error, I can give more specific help!` });
    }

    if (q.includes('thank')) {
        return res.json({ reply: "You're welcome! Keep coding and learning. 🚀 Remember: every expert was once a beginner. What would you like to learn next?" });
    }

    const greeting = `Great question about **${(lang || 'programming').toUpperCase()}**! `;
    const suggestions = [
        "Try exploring the curriculum for code examples.",
        "Type 'help' to see what I can assist with.",
        "Common topics I can help with: variables, functions, loops, classes, arrays, error handling, async code."
    ];
    res.json({ reply: greeting + suggestions[Math.floor(Math.random() * suggestions.length)] });
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
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js') && f !== 'courseData.js' && f !== 'app.js' && f !== 'challenges.js' && f !== 'style.css' && f !== 'quiz.js');
        const courses = files.map(f => f.replace('.js', ''));
        res.json(courses);
    } catch (e) {
        res.json({ error: e.message });
    }
});

// ── Start ──
app.listen(PORT, () => {
    console.log(`Doge's Lab running at http://localhost:${PORT}`);
});
