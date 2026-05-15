let currentLang = 'js';
let currentPhase = '';
let currentTopic = '';
let currentLevel = 'all';
let currentCompletionFilter = 'all';
let collapsedPhases = new Set();



function loadTopic(phase, topic) {
    currentPhase = phase;
    currentTopic = topic;
    hideCompletions();
    const langData = courseData[currentLang];
    if (!langData || !langData[phase] || !langData[phase][topic]) {
        document.getElementById('output').innerText = "// Topic not found: " + topic;
        return;
    }
    const item = langData[phase][topic];
    document.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active-topic'));
    const btnId = 'btn-' + topic.replace(/\s/g, '').replace(/[&,]/g, '');
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.add('active-topic');
        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const expEl = document.getElementById('explanation');
    const depth = getTopicDepth(item.exp);
    expEl.innerHTML = `<h3 style="margin:0; color:#fff">${topic}</h3><p style="color:#94a3b8; font-size:11px; margin-bottom:10px;">${phase} <span style="font-size:9px;color:#64748b;margin-left:8px;">${depth.icon} ${depth.label}</span></p>${item.exp}`;
    expEl.classList.remove('fade-in');
    void expEl.offsetWidth;
    expEl.classList.add('fade-in');
    
    document.getElementById('editor').value = item.code;
    updateHighlight();
    document.getElementById('output').innerText = "// Ready to practice: " + topic + " — click the cheatsheet button for reference";
    setTimeout(suggestNextTopic, 100);
}

let filterDebounceTimer;
function debounceFilterTopics(query) {
    clearTimeout(filterDebounceTimer);
    filterDebounceTimer = setTimeout(() => filterTopics(query), 200);
}

function renderLevelBar() {
    const levelBarEl = document.getElementById('level-bar');
    const levels = [
        { id: 'all', label: 'All' },
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'expert', label: 'Expert' },
    ];
    let html = '';
    for (const l of levels) {
        const active = l.id === currentLevel ? ' active' : '';
        html += `<button class="level-btn${active}" onclick="setLevel('${l.id}')">${l.label}</button>`;
    }
    html += `<span style="flex:1"></span>`;
    html += `<button class="level-btn${currentCompletionFilter === 'all' ? ' active' : ''}" onclick="setCompletionFilter('all')">All</button>`;
    html += `<button class="level-btn${currentCompletionFilter === 'uncompleted' ? ' active' : ''}" onclick="setCompletionFilter('uncompleted')">Todo</button>`;
    html += `<button class="level-btn${currentCompletionFilter === 'completed' ? ' active' : ''}" onclick="setCompletionFilter('completed')">Done</button>`;
    levelBarEl.innerHTML = html;
    levelBarEl.style.display = 'flex';
}

function setLevel(level) {
    currentLevel = level;
    renderLevelBar();
    const searchInput = document.getElementById('topic-search');
    filterTopics(searchInput ? searchInput.value : '');
}

function toggleCheatsheet() {
    const overlay = document.getElementById('cheatsheetOverlay');
    const wasOpen = overlay.classList.contains('open');
    overlay.classList.toggle('open');
    if (wasOpen) setTimeout(() => document.getElementById('editor').focus(), 50);
}

function loadCheatsheet() {
    if (currentLang === 'challenge') {
        const challenges = challengeData[challengeLang] || [];
        const ch = challenges[challengeIdx];
        if (ch && ch.solution) {
            document.getElementById('editor').value = ch.solution;
            updateHighlight();
            document.getElementById('output').innerText = '// Answer revealed for: ' + ch.title;
            return;
        }
    }

    const langData = courseData[currentLang];
    if (!langData || Object.keys(langData).length === 0) {
        document.getElementById('output').innerText = "// Cheatsheet unavailable for " + currentLang.toUpperCase();
        return;
    }

    let html = '';
    let idx = 0;
    for (const phase of Object.keys(langData)) {
        const topics = langData[phase];
        const isActivePhase = phase === currentPhase;
        html += `<div class="cs-section">`;
        html += `<div class="cs-section-title">${phase}</div>`;
        for (const name of Object.keys(topics)) {
            const t = topics[name];
            const isActive = name === currentTopic && isActivePhase;
            const codeHtml = t.code
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
                .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await|new|this|typeof|throw|try|catch|switch|case|break|continue|true|false|null|undefined)\b/g, '<span class="keyword">$1</span>');
            html += `<div class="cs-topic${isActive ? ' cs-active' : ''}">`;
            html += `<div class="cs-topic-title">${name}</div>`;
            html += `<div class="cs-desc">${t.exp}</div>`;
            html += `<div class="cs-code">${codeHtml}</div>`;
            html += `</div>`;
            idx++;
        }
        html += `</div>`;
    }

    document.getElementById('cheatsheetTitle').textContent = `${currentLang.toUpperCase()} Cheatsheet (${idx} topics)`;
    document.getElementById('cheatsheetBody').innerHTML = html;
    toggleCheatsheet();
}

const BACKEND_URL = window.location.origin;

const runBtn = document.querySelector('.run-btn');

function setRunLoading(loading) {
    if (!runBtn) return;
    runBtn.disabled = loading;
    if (loading) {
        runBtn.textContent = 'Running';
    } else {
        runBtn.textContent = currentLang === 'challenge' ? 'Test ▶' : 'Run ▶';
    }
    runBtn.classList.toggle('loading', loading);
}

function getLogicalPreview(code, lang) {
    function skipStr(s, i) {
        const q = s[i]; i++;
        while (i < s.length && !(s[i] === q && s[i-1] !== '\\')) i++;
        return i;
    }

    function extractCallArgs(line, prefix) {
        const idx = line.indexOf(prefix);
        if (idx === -1) return null;
        const parenPos = idx + prefix.length - 1;
        if (line[parenPos] !== '(') return null;
        let depth = 1, i = parenPos + 1;
        while (i < line.length && depth > 0) {
            if (line[i] === '(') depth++;
            else if (line[i] === ')') depth--;
            else if (line[i] === '"' || line[i] === "'" || line[i] === '`') i = skipStr(line, i);
            i++;
        }
        return depth === 0 ? line.substring(parenPos + 1, i - 1) : null;
    }

    function pullStrings(text) {
        const res = [];
        const re = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
        let m;
        while ((m = re.exec(text)) !== null) {
            let s = (m[1] || m[2] || m[3] || '');
            s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\(.)/g, '$1');
            if (s) res.push(s);
        }
        if (res.length === 0) {
            const numMatch = text.trim().match(/^(\d+\.?\d*)$/);
            if (numMatch) res.push(numMatch[1]);
        }
        return res;
    }

    let clean = code.replace(/\/\*[\s\S]*?\*\//g, '');
    if (lang === 'py' || lang === 'pg' || lang === 'dk' || lang === 'git') {
        clean = clean.replace(/#[^\n]*/g, '');
    } else {
        clean = clean.replace(/\/\/[^\n]*/g, '');
    }

    const langPrefixes = {
        py: ['print('],
        js: ['console.log(', 'console.error(', 'console.warn('],
        ts: ['console.log(', 'console.error(', 'console.warn('],
        go: ['fmt.Print(', 'fmt.Println(', 'fmt.Printf('],
        rs: ['println!(', 'print!('],
        c: ['printf(', 'puts('],
        cpp: ['printf(', 'puts('],
        cs: ['Console.WriteLine(', 'Console.Write('],
        kt: ['println(', 'print('],
        swift: ['print('],
        zig: ['print(', 'std.debug.print('],
    };

    const output = [];

    for (const raw of clean.split('\n')) {
        const line = raw.trim();
        if (!line) continue;

        if (lang === 'cpp') {
            const ci = line.includes('cout') ? line.indexOf('cout') : line.indexOf('std::cout');
            if (ci !== -1) {
                const parts = line.slice(ci).split(/<<|;/);
                const strs = [];
                for (const p of parts) {
                    strs.push(...pullStrings(p));
                }
                const joined = strs.join('');
                if (joined) output.push(joined);
                continue;
            }
        }

        const prefixes = langPrefixes[lang] || [];
        for (const prefix of prefixes) {
            const args = extractCallArgs(line, prefix);
            if (args === null) continue;
            const strings = pullStrings(args);
            if (strings.length > 0) {
                output.push(lang === 'py' ? strings.join(' ') : strings.join(''));
            }
            break;
        }
    }

    return output.length > 0 ? output.join('\n') : null;
}

function runCode() {
    const out = document.getElementById('output');
    const code = document.getElementById('editor').value;
    if (!code.trim()) { out.innerText = "// No code to run"; return; }
    setRunLoading(true);
    out.innerText = "// Running...";

    if (currentLang === 'js') {
        try {
            const log = console.log;
            let localOut = "";
            console.log = (m) => localOut += "> " + (typeof m === 'object' ? JSON.stringify(m) : m) + "\n";
            eval(code);
            console.log = log;
            out.innerText = localOut || "(no output)";
        } catch(e) {
            out.innerText = "Error: " + e.message;
        }
        setRunLoading(false);
        return;
    }

    fetch(BACKEND_URL + '/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: currentLang, code })
    })
    .then(r => r.json())
    .then(d => { out.innerText = d.output; setRunLoading(false); })
    .catch(e => {
        setRunLoading(false);
        const preview = getLogicalPreview(code, currentLang);
        if (preview) {
            out.innerText = preview;
            return;
        }
        const hints = {
            py: 'python3 filename.py', go: 'go run program.go', rs: 'rustc program.rs && ./program',
            ts: 'npx ts-node program.ts', c: 'gcc -Wall -o program program.c && ./program',
            cpp: 'g++ -std=c++20 -Wall -o program program.cpp && ./program',
            cs: 'dotnet run', kt: 'kotlinc program.kt -include-runtime -d program.jar && java -jar program.jar',
            swift: 'swift program.swift', zig: 'zig build-exe program.zig && ./program',
            pg: 'psql -f query.sql', dk: 'docker build -t myapp . && docker run myapp',
            mongodb: 'mongosh < script.js', gamedev: 'Run in your game engine IDE',
            git: 'Run git commands in terminal'
        };
        if (window.location.protocol === 'file:') {
            out.innerText = "// Start the server first:\n//   node server.js\n// Then open http://localhost:3000";
        } else {
            const hint = hints[currentLang];
            const lines = code.split('\n');
            const codeBlock = lines.slice(0, 25).map(l => '// ' + l).join('\n');
            const more = lines.length > 25 ? '\n// ... (' + (lines.length - 25) + ' more lines)' : '';
            out.innerText = (hint
                ? `// Backend unavailable — run locally:\n//   ${hint}\n//\n${codeBlock}${more}`
                : `// Backend unavailable for ${currentLang.toUpperCase()}\n// Use the curriculum examples to learn the syntax`);
        }
    });
}

let conversationHistory = [];
const MAX_HISTORY = 50;

const CHAT_STORAGE_KEY = 'dogeslab_chat';

function saveChatHistory() {
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversationHistory.slice(-20))); } catch {}
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                conversationHistory = parsed.slice(-20);
                const el = document.getElementById('aiMessages');
                if (el) {
                    el.innerHTML = '';
                    for (const msg of conversationHistory) {
                        addAIMessage(msg.text, msg.role, true);
                    }
                }
            }
        }
    } catch {}
}

function clearChatHistory() {
    conversationHistory = [];
    try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch {}
    const el = document.getElementById('aiMessages');
    if (el) {
        el.innerHTML = `<div class="ai-msg bot"><div class="label">AI</div>Hi! I'm your coding assistant. Ask me anything about programming, or pick a suggestion below.</div>`;
    }
    updateAISuggestions();
}

function toggleAI() {
    const panel = document.getElementById('aiPanel');
    const wasOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    document.getElementById('aiToggle').classList.toggle('open');
    if (!wasOpen) loadChatHistory();
    if (wasOpen) setTimeout(() => document.getElementById('editor').focus(), 50);
}

function addAIMessage(text, role, skipSave) {
    const el = document.getElementById('aiMessages');
    const div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    if (role === 'bot') {
        let displayText = text;
        if (text && text.includes('**')) {
            displayText = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        }
        displayText = displayText.replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, '<pre class="ai-code-block"><code>$2</code></pre>');
        displayText = displayText.replace(/\`([^`]+)\`/g, '<code>$1</code>');
        displayText = displayText.replace(/\n/g, '<br>');
        div.innerHTML = `<div class="label">AI</div>${displayText}`;
    } else if (role === 'user') {
        div.textContent = text;
    }
    if (role === 'typing') {
        div.id = 'aiTyping';
        div.innerHTML = '<div class="label">AI</div><span class="typing-dots">● ● ●</span>';
    }
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    if (role !== 'typing' && !skipSave) {
        conversationHistory.push({ role, text });
        if (conversationHistory.length > MAX_HISTORY) {
            conversationHistory.shift();
        }
        saveChatHistory();
    }
}

function removeTypingIndicator() {
    const typing = document.getElementById('aiTyping');
    if (typing) typing.remove();
}

// ── Code Review UI ──
function reviewCode() {
    const editor = document.getElementById('editor');
    const code = editor ? editor.value : '';
    if (!code.trim()) {
        document.getElementById('output').innerText = "// No code to review — write some code in the editor first!";
        return;
    }

    const aiPanel = document.getElementById('aiPanel');
    if (!aiPanel.classList.contains('open')) toggleAI();

    addAIMessage('Review my code', 'user');
    addAIMessage('', 'typing');

    fetch(BACKEND_URL + '/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, lang: currentLang, topic: currentTopic })
    })
    .then(r => r.json())
    .then(d => {
        removeTypingIndicator();
        let reply = '';
        if (d.source === 'llm') {
            reply = d.review;
        } else {
            if (d.review) reply = d.review;
            if (d.score) reply += `\n\n**Score:** ${d.score}/10`;
        }
        addAIMessage(reply, 'bot');
    })
    .catch(() => {
        removeTypingIndicator();
        addAIMessage("Couldn't reach the review server. Make sure the backend is running (node server.js).", 'bot');
    });
}

const aiTutorResponses = [
    {
        keywords: ['variable', 'declare', 'let', 'const', 'var'],
        response: "Variables store data in memory so you can reuse and manipulate values.\n\n**Syntax by language:**\n- **JS:** `let name = value;` (mutable), `const name = value;` (immutable)\n- **Python:** `name = value` (no keyword needed)\n- **Go:** `var name type = value` or `name := value` (type inference)\n- **Kotlin:** `var name = value` (mutable), `val name = value` (read-only)\n\n**Try this to experiment:**\n1. Declare a variable with your name\n2. Declare another with your age\n3. Print both using console.log / print()\n\n**Why this matters:** Variables are the foundation of all programs — every app stores and manipulates data.\n\n**Try to avoid:**\n- Using `var` in JS (function-scoped, causes bugs) — prefer `let`/`const`\n- Forgetting keywords creates globals: `x = 5` without `let`/`const`/`var` creates a global\n- Using `const` for values that need to change later"
    },
    {
        keywords: ['function', 'method', 'def', 'func', '=>'],
        response: "Functions are reusable blocks of code that perform a specific task. They help you avoid repetition and organize logic.\n\n**Syntax by language:**\n- **JS:** `function name(params) { ... }` or `const name = (params) => { ... }`\n- **Python:** `def name(params):`\n- **Go:** `func name(params) returnType { ... }`\n- **Rust:** `fn name(params) -> returnType { ... }`\n\n**Hands-on exercise:**\n```\nWrite a function that takes two numbers and returns their sum.\nThen call it and log the result.\n```\n\n**Design principle:** Each function should do ONE thing well. If a function does multiple things, split it up.\n\n**Common pitfalls:**\n- Missing `return` → function returns `undefined` (JS) / `None` (Python)\n- Calling without `()`: `myFunc` vs `myFunc()` — first one is the function itself, not a call\n- Mutating input parameters directly creates side effects"
    },
    {
        keywords: ['class', 'object', 'oop', 'inherit', 'extends', 'prototype', 'struct'],
        response: "Object-Oriented Programming organizes code around objects that contain both data (properties) and behavior (methods).\n\n**Key concepts:**\n- **Encapsulation:** bundle data + methods, hide internal details\n- **Inheritance:** a class can extend another, reusing behavior\n- **Polymorphism:** same method name, different implementations\n- **Composition:** building objects from other objects (prefer this over inheritance)\n\n**Language differences:**\n- **JS/Python/Kotlin/C#:** traditional `class` syntax\n- **Go:** no classes — uses structs + methods (composition-focused)\n- **Rust/Zig:** structs with traits/protocols for shared behavior\n\n**Try this:**\n1. Create a simple class (e.g., `Car` with `brand` and `year`)\n2. Add a method (e.g., `honk()`)\n3. Create an instance and call the method\n\n**Golden rule:** Favor composition over inheritance. Instead of `Dog extends Animal`, give Dog an `energy` property and a `tired()` method."
    },
    {
        keywords: ['array', 'list', 'collection', 'vector', 'slice', 'map', 'set', 'dictionary', 'hash'],
        response: "Collections let you store and manipulate groups of values.\n\n**Common collection types:**\n- **Array/Slice/List:** ordered sequence of values\n- **Map/Dict/Hash:** key-value pairs for fast lookups\n- **Set:** unique values (no duplicates)\n\n**Language specifics:**\n- **JS:** `[]`, `new Map()`, `new Set()`\n- **Python:** `[]`, `list()`, `{}`, `dict()`, `set()`\n- **Go:** `[]T`, `map[K]V`\n- **Rust:** `Vec<T>`, `HashMap<K, V>`, `HashSet<T>`\n\n**Exercise:**\n1. Create an array of 5 numbers\n2. Write a loop to double each number\n3. Store the results in a new array\n\n**Watch out for:**\n- Off-by-one: `arr[arr.length]` is always out of bounds — indices go 0 to length-1\n- Using `delete arr[i]` in JS leaves a hole — use `.splice()` instead\n- Arrays are 0-indexed in virtually all languages"
    },
    {
        keywords: ['loop', 'for', 'while', 'iterate', 'foreach', 'for...of', 'for...in', 'range'],
        response: "Loops let you repeat code — essential for processing collections, waiting for conditions, and automating repetitive tasks.\n\n**Types of loops:**\n- **`for` loop:** when you know how many iterations (`for (let i=0; i<5; i++)`)\n- **`while` loop:** when you don't know the count (`while (condition)`)\n- **`for...of` / `foreach`:** iterating over collections (cleaner)\n- **`map` / `filter` / `reduce`:** functional iteration (JS/Python)\n\n**Control flow:**\n- `break` — exit the loop immediately\n- `continue` — skip to the next iteration\n\n**Try this:**\n```\nWrite a loop that prints numbers 1 to 10, but skips 5 and stops at 8.\n```\n\n**Most common bugs:**\n- **Infinite loop:** forgetting to increment your counter: `for (let i=0; i<10;)`\n- **Off-by-one:** using `<=` when you mean `<` (or vice versa)\n- **Modifying an array while iterating:** skips elements or causes unexpected behavior"
    },
    {
        keywords: ['error', 'exception', 'try', 'catch', 'panic', 'throw', 'result', 'option'],
        response: "Error handling is how programs deal with unexpected situations. Different languages take very different approaches!\n\n**Approaches by language:**\n- **JS/Python/C#/Kotlin:** `try { risky() } catch (e) { handle(e) }`\n- **Go:** functions return errors: `result, err := doSomething()` — check `err != nil`\n- **Rust:** `Result<T, E>` and `Option<T>` — pattern match or use `?`\n- **Zig:** error union types — `catch` handles, `try` propagates\n\n**Best practices:**\n- Catch specific error types, not generic `Exception` — you might hide bugs\n- Always clean up resources (files, connections) in `finally`\n- Log errors WITH context (what were you doing, what inputs)\n- Don't silently swallow errors — at minimum log them\n\n**Exercise:**\n1. Write a function that divides two numbers\n2. Add error handling for division by zero\n3. Test both valid and invalid inputs"
    },
    {
        keywords: ['async', 'await', 'promise', 'future', 'coroutine', 'callback', 'goroutine', 'thread'],
        response: "Async programming lets your code handle time-consuming operations (network requests, file I/O, timers) without blocking.\n\n**How each language handles it:**\n- **JS:** `async function` + `await promise` — single-threaded, event loop\n- **Python:** `async def` + `await` — asyncio event loop\n- **C#:** `async Task` + `await` — built into the runtime\n- **Go:** `go func()` starts a goroutine, `chan` for communication\n- **Kotlin:** `suspend fun` + coroutines\n\n**Mental model:** Think of async code like ordering coffee: instead of waiting at the counter (blocking), you get a buzzer (promise) and do other things until it buzzes (resolved).\n\n**Common mistakes:**\n- Forgetting `await` — you get a Promise object instead of the value\n- Not handling rejections — unhandled promise rejections crash Node.js\n- Callback hell — use Promises (.then chain) or async/await\n- Passing async function where sync is expected without handling the promise"
    },
    {
        keywords: ['type', 'string', 'int', 'bool', 'float', 'null', 'undefined', 'void', 'any', 'generic'],
        response: "Types describe what kind of data a value is — this determines what you can do with it.\n\n**Static vs Dynamic typing:**\n- **Static (TS, Go, Rust, C#, Java):** types checked at compile time, catch errors early\n- **Dynamic (JS, Python):** types checked at runtime, more flexible but error-prone\n\n**Type annotations are your friends!** Even in dynamic languages, using clear type names helps readability.\n\n**Language oddities to know:**\n- **JS:** `typeof null === 'object'` — it's a longstanding bug!\n- **JS:** `'5' + 3 = '53'` (string concat wins), but `'5' - 3 = 2` (coercion)\n- **Python:** everything is an object, even functions and classes\n- **Go:** zero values — `int` defaults to `0`, `string` to `\"\"`, `bool` to `false`\n\n**Try this:**\n1. Declare a variable with a specific type annotation (if your language supports it)\n2. Try assigning a different type — see what error you get\n3. Experiment with type conversion/coercion"
    },
    {
        keywords: ['git', 'commit', 'push', 'pull', 'branch', 'merge', 'rebase'],
        response: "Git is the industry-standard version control system. It tracks changes to your code over time.\n\n**Essential workflow:**\n1. `git add .` — stage your changes\n2. `git commit -m \"message\"` — save a snapshot\n3. `git push` — upload to remote\n\n**Branching strategy:**\n- `main` — production-ready code\n- `feature/xyz` — work on new features\n- `bugfix/xyz` — fix bugs\n- Never commit directly to main! Use pull requests.\n\n**For learning, try this:**\n1. `git init` in a project folder\n2. Make some changes, commit them\n3. Create a branch: `git checkout -b my-experiment`\n4. Make more commits, then merge back\n\n**Pro tips to avoid disaster:**\n- Use `--force-with-lease` instead of `--force` on shared branches\n- Always pull before pushing: `git pull --rebase`\n- Commit early and often with clear messages\n- Use `.gitignore` to keep secrets and build artifacts out of the repo"
    },
    {
        keywords: ['sql', 'select', 'join', 'table', 'database', 'query', 'where', 'insert', 'update', 'delete', 'index'],
        response: "SQL is the language of relational databases. It's declarative — you say WHAT you want, not HOW to get it.\n\n**Core operations (CRUD):**\n- `SELECT columns FROM table WHERE condition` — retrieve data\n- `INSERT INTO table (cols) VALUES (vals)` — add data\n- `UPDATE table SET col=val WHERE condition` — modify data\n- `DELETE FROM table WHERE condition` — remove data\n\n**JOINs combine tables:**\n- `INNER JOIN` — only matching rows from both tables\n- `LEFT JOIN` — all rows from left table, NULLs where right doesn't match\n- `RIGHT JOIN` — opposite of LEFT\n- `FULL JOIN` — all rows from both tables\n\n**Most common errors:**\n- **Missing WHERE in UPDATE/DELETE** — modifies/deletes ALL rows!\n- **N+1 query problem:** looping queries instead of using JOIN\n- **Not using parameterized queries** — leads to SQL injection\n- **Missing indexes** on frequently queried columns = slow queries\n\n**Try the Schema Designer (click 'Schema' below the editor)** to build tables visually!"
    },
    {
        keywords: ['debug', 'bug', 'fix', 'issue', 'wrong', 'not working', 'broken', 'error'],
        response: "Debugging is a systematic process. Here's a methodical approach:\n\n**1. READ the error message**\nIt tells you WHAT went wrong and WHERE (line number). Don't skip this step!\n\n**2. REPRODUCE**\nCan you make the bug happen consistently? If not, find the exact conditions.\n\n**3. ISOLATE**\nComment out code until the bug disappears. The last thing you removed is likely the culprit.\n\n**4. INSPECT**\nUse `console.log()` (JS), `print()` (Python), `fmt.Println()` (Go), or a debugger to check values at each step.\n\n**5. HYPOTHESIZE**\nForm a theory: \"If X is wrong, then Y should happen.\" Test it.\n\n**6. FIX**\nMake the smallest possible change. Don't rewrite everything.\n\n**7. VERIFY**\nDoes the fix actually solve it? Does it break anything else?\n\n**Remember:** Every bug is a learning opportunity! The error message is trying to help you."
    },
    {
        keywords: ['help', 'how', 'what is', 'explain', 'understand', 'confused', 'beginner', 'start', 'learn'],
        response: "I'm here to help you learn! Here's my advice for effective learning:\n\n**The 4-step practice method:**\n1. **Read** the topic explanation in the curriculum\n2. **Type** the code example yourself (don't copy-paste — muscle memory matters!)\n3. **Modify** it — change values, add features, break it intentionally\n4. **Build** something small with the concept\n\n**Active recall technique:** After reading a topic, close it and try to explain it in your own words. If you can't, review and try again.\n\n**I can help with:**\n- Explaining a specific topic (ask \"Explain [topic]\")\n- Debugging your code (share what you've tried)\n- Showing examples (\"Show me an example of X\")\n- Best practices (\"What's the best way to do X?\")\n\n**What are you working on right now?** Tell me the topic and I'll give you a clear explanation."
    },
    {
        keywords: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack', 'alloc', 'borrow', 'ownership'],
        response: "Memory management is essential in systems languages (C, C++, Rust, Zig). Here's the conceptual foundation:\n\n**Stack vs Heap:**\n- **Stack:** Fast, small, automatic. Local variables go here. LIFO order (last in, first out).\n- **Heap:** Slower, flexible, manual. Dynamic allocations go here. You must free/delete.\n\n**Key concepts by language:**\n- **C:** `malloc()`/`free()` — completely manual, error-prone\n- **C++:** `new`/`delete`, smart pointers (`unique_ptr`, `shared_ptr`)\n- **Rust:** Ownership system — compiler enforces memory safety at compile time. NO garbage collector!\n- **Zig:** Manual but safe — explicit allocators, no hidden allocations\n\n**Classic memory bugs:**\n- **Memory leak:** forgetting to free → program uses more and more RAM\n- **Dangling pointer:** using memory after freeing → crashes or security holes\n- **Buffer overflow:** writing past array bounds → corrupts adjacent memory\n- **Double free:** freeing the same memory twice → crash\n\n**Rust's ownership rules (simplified):**\n1. Each value has ONE owner\n2. When the owner goes out of scope, the value is dropped\n3. You can either borrow (&) or move, but not both in certain ways"
    },
    {
        keywords: ['closure', 'scope', 'hoist', 'temporal dead zone', 'tdz', 'lexical'],
        response: "Scope determines WHERE variables are accessible in your code. Closures are a powerful consequence of how scope works.\n\n**Types of scope:**\n- **Global:** accessible everywhere (avoid polluting this)\n- **Function scope:** inside a function (`var` in JS, `function` declarations)\n- **Block scope:** inside `{}` (`let`, `const` in JS)\n\n**What's a closure?**\nA closure is a function that \"remembers\" the variables from where it was defined, even after that outer function has finished running.\n\n```js\nfunction makeCounter() {\n  let count = 0;\n  return function() { return ++count; };\n}\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2  <-- count is still accessible!\n```\n\n**Common closure bug (the loop problem):**\n```js\nfor (var i = 0; i < 5; i++) {\n  setTimeout(() => console.log(i), 100); // prints 5,5,5,5,5\n}\n```\n**Fix:** use `let` instead of `var` (creates a new binding per iteration).\n\n**Hoisting:** `var` declarations are hoisted (moved to top) and initialized as `undefined`. `let`/`const` are hoisted but NOT initialized (Temporal Dead Zone — accessing them before the declaration throws an error)."
    },
    {
        keywords: ['syntax', 'semicolon', 'bracket', 'parenthesis', 'brace', 'colon'],
        response: "Syntax errors mean the computer can't understand your code — you've broken the grammar rules of the language. This is NORMAL and happens to every programmer, every day.\n\n**Quick debugging checklist:**\n1. Are all `(`, `{`, `[` properly closed with `)`, `}`, `]`?\n2. Are strings quoted correctly? `\"...\"`, `'...'`, or backticks must match\n3. Are statements terminated? (JS/C#/C++ need `;`, Python uses newlines)\n4. Are variable/function names spelled identically everywhere?\n5. Are you missing a comma between array/object items?\n6. Did you use a reserved keyword as a variable name?\n\n**The error message is your friend!** It tells you:\n- **The line number** where it got confused (or slightly after)\n- **What it expected** vs what it found\n- **The specific character** that doesn't belong\n\n**Pro tip:** When you get a syntax error, look at the LINE BEFORE the error. The parser often doesn't realize something's wrong until the next line."
    },
    {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greeting', 'sup'],
        response: "Hey there! Welcome to Doge's Lab! 🎉\n\nI'm your AI programming tutor. Here's what I can do for you:\n- **Explain concepts** from the curriculum (just ask!)\n- **Debug your code** (tell me what's not working)\n- **Show examples** with runnable code\n- **Guide your learning** with exercises and challenges\n\n**To get started:**\n1. Pick a language from the top bar\n2. Click a topic on the left\n3. Read the explanation and try the code\n4. Modify the code and click \"Run\"\n5. Ask me anything if you get stuck!\n\n**What language are you learning today?**"
    },
    {
        keywords: ['string', 'concatenat', 'interpolat', 'template', 'char', 'substring', 'slice', 'split', 'trim'],
        response: "Strings are sequences of characters. They're one of the most common data types in any program.\n\n**Common string operations:**\n- **Length:** `str.length` (JS), `len(str)` (Python), `strlen(s)` (C)\n- **Substring:** `str.slice(0, 5)`, `str.substring(0, 5)` — first 5 chars\n- **Split:** `str.split(',')` → array of strings\n- **Join:** `arr.join(',')` → string\n- **Case:** `str.toUpperCase()`, `str.toLowerCase()`\n- **Trim whitespace:** `str.trim()`\n\n**String interpolation (build strings with variables):**\n- **JS:** `` `Hello, ${name}!` `` (template literals)\n- **Python:** `f\"Hello, {name}!\"` (f-strings)\n- **C#:** `$\"Hello, {name}!\"` (string interpolation)\n- **Go:** `fmt.Sprintf(\"Hello, %s!\", name)`\n\n**Important:** Strings are IMMUTABLE in virtually all languages. Methods like `.toUpperCase()` return a NEW string — the original stays the same.\n\n**Common gotchas:**\n- Off-by-one in substring: `\"hello\".slice(1, 3)` is `\"el\"` (end index is exclusive)\n- Using `==` vs `.equals()` in some languages for comparison\n- Forgetting to trim user input: `\"  input  \".trim()`"
    },
    {
        keywords: ['test', 'testing', 'unit test', 'assert', 'jest', 'mocha', 'pytest', 'testing library'],
        response: "Testing is how you verify your code works correctly. Good tests give you confidence to refactor and add features.\n\n**Testing levels:**\n- **Unit tests:** test individual functions/classes in isolation\n- **Integration tests:** test how components work together\n- **End-to-end tests:** test the full system from user perspective\n\n**The AAA pattern:**\n1. **Arrange** — set up test data and conditions\n2. **Act** — call the function/method you're testing\n3. **Assert** — check the result is what you expected\n\n```js\n// Example (Jest)\ntest('adds 1 + 2 to equal 3', () => {\n  expect(add(1, 2)).toBe(3);\n});\n```\n\n**Why test?**\n- Catches regressions (stuff you broke by accident)\n- Documents how your code should behave\n- Forces you to write testable (modular) code\n- Saves time in the long run\n\n**Getting started:** Write a test BEFORE you fix a bug — this is called \"red-green testing\" (test fails first, then you make it pass)."
    },
    {
        keywords: ['recursion', 'recursive', 'base case', 'stack overflow', 'tail call'],
        response: "Recursion is when a function calls itself. It's an elegant way to solve problems that have a repetitive structure (trees, fractals, divide-and-conquer).\n\n**Every recursive function needs two parts:**\n1. **Base case** — when to STOP (without this, infinite recursion!)\n2. **Recursive case** — call itself with a simpler version of the problem\n\n```js\n// Factorial: n! = n * (n-1) * ... * 1\nfunction factorial(n) {\n  if (n <= 1) return 1;       // base case\n  return n * factorial(n - 1); // recursive case\n}\n```\n\n**When to use recursion vs loops:**\n- **Recursion:** tree traversal, parsing, divide-and-conquer algorithms\n- **Loops:** simple iteration, performance-critical code\n\n**Watch out for:**\n- **Stack overflow:** too many recursive calls exhausts the call stack\n- **Missing base case:** infinite recursion = crash\n- **Tail recursion optimization:** some languages optimize this (not JS/Python)\n\n**Exercise:** Write a recursive function that computes the nth Fibonacci number. Then compare it with a loop-based version."
    }
];

function getAIResponse(input) {
    const q = input.toLowerCase().trim();
    if (!q) return "Ask me something about programming!";

    for (const entry of aiTutorResponses) {
        if (entry.keywords.some(k => q.includes(k))) {
            let reply = entry.response;
            if (currentLang && !q.includes('language') && !q.includes(currentLang)) {
                reply += `\n\n**You're studying:** ${currentLang.toUpperCase()}`;
                reply += `\nTry the code example in the editor, modify it, and click Run to see what happens!`;
            }
            return reply;
        }
    }

    for (const entry of aiTutorResponses) {
        const combined = entry.keywords.join(' ');
        if (combined.includes(q.replace(/[^a-z\s]/g, '').trim())) {
            return entry.response;
        }
    }

    if (q.includes('thank') || q.includes('thanks')) {
        return "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step! What would you like to learn next?";
    }

    if (q.includes('hello') || q.includes('hi ') || q === 'hey' || q.includes('good')) {
        const langInfo = currentLang ? `I see you're studying **${currentLang.toUpperCase()}**. ` : '';
        return `Hello! ${langInfo}Ask me anything about the topic you're working on, or pick a suggestion below to get started!`;
    }

    if (currentTopic) {
        return `Great question about **${currentTopic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far in the editor? Tell me your thought process and I'll help guide you to the right solution!`;
    }

    const fallbacks = [
        "That's an interesting question! To help you best, could you tell me:\n1. What language are you working with?\n2. What topic are you studying?\n3. What have you tried so far?",
        "I want to make sure I help you effectively. Could you tell me more about what you're working on? For example: \"Explain functions\" or \"Help me debug my loop\".",
        "Let me help you learn! Try asking me about a specific topic you're studying, or tell me what you're trying to build. I can explain concepts, debug code, and suggest practice exercises."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function getLocalAIResponse(input) {
    const q = input.toLowerCase().trim();
    if (!q || q.length < 3) return null;
    const langData = courseData[currentLang];
    if (!langData) return null;

    const words = q.split(/\s+/).filter(w => w.length > 2);
    const meta = ['help', 'hello', 'hi', 'hey', 'thanks'];
    if (meta.includes(q) || words.length === 0) return null;

    let best = null;
    let bestScore = 0;

    for (const phase in langData) {
        for (const topic in langData[phase]) {
            const item = langData[phase][topic];
            const topicLow = topic.toLowerCase();
            const expLow = (item.exp || '').toLowerCase();
            const searchText = topicLow + ' ' + expLow;

            let score = 0;
            let matchedWords = 0;

            for (const word of words) {
                if (topicLow.includes(word)) { score += 3; matchedWords++; }
                if (expLow.includes(word)) score += 1;
            }

            if (searchText.includes(q)) score += 10;
            if (matchedWords > 0) score = score * (1 + matchedWords / words.length);
            if (phase === currentPhase) score *= 1.2;

            if (score > bestScore) {
                bestScore = score;
                best = { phase, topic, code: item.code, exp: item.exp };
            }
        }
    }

    if (best && bestScore >= 2) {
        return `I found this in the curriculum that might help:<br><br><b>${best.topic}</b> — ${best.phase}<br><br>${best.exp || ''}<br><br><pre style="background:#000;color:#a5f3fc;padding:12px;border-radius:6px;font-size:11px;line-height:1.5;overflow-x:auto;margin:0;">${best.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre><br><b>Try this:</b> paste the code into the editor, modify it, and click Run to experiment!`;
    }
    return null;
}

function getErrorTutorTip(topic, output) {
    const tips = {
        "variables": "Getting an error with variables? Common issues:\n- Did you declare it with `let`/`const`/`var` (JS) or just `name = value` (Python)?\n- Check the spelling — `myVariable` vs `myvariable` are different!\n- Make sure you declared it before trying to use it (variables aren't hoisted with `let`/`const`)\n\n**Try:** Declare a simple variable and log it. Once that works, add complexity step by step.",
        "functions": "Functions can be tricky! Check these:\n- Do you have the `function` keyword (JS) or `def` (Python)?\n- Did you use `return` to send back a value? Without it, the function returns `undefined`.\n- Did you call it with parentheses? `myFunc` is the function itself, `myFunc()` calls it.\n\n**Try:** Write the simplest possible function that returns a fixed value, then gradually add parameters.",
        "loops": "Loop errors usually come from:\n- **Infinite loop:** is your counter actually changing? `for (let i=0; i<10; i++)` — don't forget the `i++`!\n- **Off-by-one:** using `<=` when you need `<` (or vice versa)\n- **Wrong array index:** arrays start at 0, so `arr[arr.length]` is out of bounds\n\n**Try:** Write a loop that just prints the numbers 0-4. Once that works, add your logic.",
        "arrays": "Array issues are often:\n- **Out of bounds:** `arr[arr.length]` doesn't exist — last index is `arr.length - 1`\n- **Using `delete`:** `delete arr[i]` leaves a hole — use `.splice()` instead\n- **Confusing indexOf:** returns `-1` when not found, which is truthy!\n\n**Try:** Create an array of 3 items, log each item in a loop, then try adding/removing items.",
        "strings": "String gotchas:\n- **Immutability:** `str.toUpperCase()` returns a NEW string — the original stays the same\n- **Concatenation vs addition:** `'5' + 3 = '53'`, not 8! Use `Number()` to convert\n- **Off-by-one:** `str.slice(1, 3)` gives characters at index 1 and 2 (end is exclusive)\n\n**Try:** Create a string variable and try different methods on it to see what each returns.",
        "classes": "Class errors are usually:\n- **Missing `new`:** `const obj = MyClass()` vs `const obj = new MyClass()`\n- **`this` context:** inside callbacks, `this` might not be what you expect — use arrow functions\n- **Forgetting `constructor`:** the constructor runs when you create a new instance\n\n**Try:** Create the simplest possible class with one property and one method, then build up.",
    };

    for (const [key, tip] of Object.entries(tips)) {
        if (topic.toLowerCase().includes(key)) {
            return "I see you're getting an error. Don't worry, this is totally normal! Let's work through it together.\n\n" + tip + "\n\n**Still stuck?** Share what you expected to happen vs what actually happened and I'll help more!";
        }
    }

    return "I noticed your code has an error. That's okay — debugging is how we learn!\n\n**Quick check:**\n1. Look at the error message — what line does it point to?\n2. Compare your code with the example in the curriculum\n3. Simplify: comment things out until it works, then add back one piece at a time\n\n**Can you tell me:** what did you expect to happen, and what actually happened?";
}

function analyzeUserCodeClient(code, lang) {
    if (!code || !lang) return null;
    const hints = [];

    if (lang === 'js') {
        const unclosedBraces = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
        const unclosedParens = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        if (unclosedBraces > 0) hints.push('You have unclosed curly braces. Add `' + '}'.repeat(unclosedBraces) + '` at the end.');
        if (unclosedBraces < 0) hints.push('You have ' + Math.abs(unclosedBraces) + ' too many closing braces `}`.');
        if (unclosedParens > 0) hints.push('You have unclosed parentheses. Add `' + ')'.repeat(unclosedParens) + '`.');
        if (unclosedParens < 0) hints.push('You have extra closing parentheses.');
        if (!code.includes('return') && (code.includes('function') || code.includes('=>'))) {
            hints.push('Your function has no `return` statement. It will return `undefined`.');
        }
        if (code.includes('==')) hints.push('Consider using `===` (strict equality) instead of `==` to avoid type coercion.');
        if (code.includes('var ')) hints.push('Use `let` or `const` instead of `var` for block scoping.');
    }
    return hints.length > 0 ? hints : null;
}

function askAI(q) {
    addAIMessage(q, 'user');
    addAIMessage('', 'typing');

    const editor = document.getElementById('editor');
    const currentCode = editor ? editor.value : '';
    const output = document.getElementById('output');
    const hasError = output && (output.innerText.includes('Error:') || output.innerText.includes('ERROR') || output.innerText.includes('SyntaxError') || output.innerText.includes('ReferenceError') || output.innerText.includes('FAIL'));
    const lastOutput = output ? output.innerText : '';

    if (hasError && currentTopic && (q.includes('why') || q.includes('error') || q.includes('fix') || q.includes('bug') || q.includes('wrong') || q.includes('not working') || q.length < 10)) {
        const errorTip = getErrorTutorTip(currentTopic, lastOutput);
        if (errorTip) {
            setTimeout(() => { removeTypingIndicator(); addAIMessage(errorTip, 'bot'); }, 200);
            return;
        }
    }

    if (hasError || q.includes('error') || q.includes('bug') || q.includes('fix') || q.includes('wrong') || q.includes('not working') || q.includes('issue')) {
        let errorReply = '';
        const analysis = analyzeUserCodeClient(currentCode, currentLang);
        if (analysis && analysis.length > 0) {
            errorReply = "I looked at your code and found some issues:\n\n" +
                analysis.map((h, i) => `${i + 1}. ${h}`).join('\n') + '\n\n';
        }
        if (lastOutput && (lastOutput.includes('Error:') || lastOutput.includes('ReferenceError') || lastOutput.includes('TypeError') || lastOutput.includes('SyntaxError'))) {
            errorReply += `**Your code produced this output:**\n\`\`\`\n${lastOutput}\n\`\`\`\n\n`;
        }
        if (currentCode && currentTopic) {
            errorReply += `Since you're working on **${currentTopic}**, here's a hint:\n`;
            errorReply += `- Look at the example in the curriculum and compare it with your code line by line\n`;
            errorReply += `- Try simplifying: comment out parts until it works, then add them back one at a time\n`;
            errorReply += `- Check the most common mistake for this topic and see if it applies to you\n\n`;
        }
        if (errorReply) {
            errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step.";
            setTimeout(() => { removeTypingIndicator(); addAIMessage(errorReply, 'bot'); }, 200);
            return;
        }
    }

    const localReply = getLocalAIResponse(q);
    if (localReply) {
        setTimeout(() => { removeTypingIndicator(); addAIMessage(localReply, 'bot'); }, 200);
        return;
    }
    fetch(BACKEND_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: q,
            lang: currentLang,
            topic: currentTopic,
            phase: currentPhase,
            code: currentCode,
            output: lastOutput,
            hasError: hasError,
            history: conversationHistory.slice(-6)
        })
    })
    .then(r => r.json())
    .then(d => { removeTypingIndicator(); addAIMessage(d.reply || getAIResponse(q), 'bot'); })
    .catch(() => { removeTypingIndicator(); setTimeout(() => addAIMessage(getAIResponse(q), 'bot'), 300); });
}

function sendAI() {
    const input = document.getElementById('aiInput');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    askAI(q);
}

const suggestionSets = {
    js: ["Explain closures with an example", "How does async/await work?", "Common array methods guide", "What is 'this' keyword?", "Practice: write a function"],
    ts: ["Types vs interfaces explained", "What are generics?", "Utility types guide", "Enum best practices", "Practice: type a function"],
    py: ["List comprehensions explained", "How do decorators work?", "Why __init__?", "args and kwargs guide", "Practice: write a class"],
    go: ["Goroutines vs threads", "What are interfaces?", "When to use defer", "Error handling in Go", "Practice: write a struct"],
    zig: ["What is comptime?", "Memory allocators guide", "Error union types", "Zig vs C comparison", "Practice: zig basics"],
    pg: ["JOIN types explained", "Window functions guide", "Index strategies", "CTE vs subquery", "Practice: write a query"],
    dk: ["Docker vs VM explained", "Multi-stage builds", "Volume vs bind mount", "Docker Compose networks", "Practice: write a Dockerfile"],
    cs: ["LINQ queries explained", "Async/await in C#", "Record vs class", "What is .NET?", "Practice: write a class"],
    git: ["How to undo a commit", "Merge vs rebase", "How to fix a merge conflict", "What is HEAD?", "Practice: git workflow"],
    kt: ["Null safety explained", "Data classes guide", "Extension functions", "Coroutines basics", "Practice: write a class"],
    rs: ["Ownership explained simply", "Borrowing rules guide", "Traits vs generics", "Lifetimes explained", "Practice: write a struct"],
    swift: ["Optionals explained", "Protocols vs classes", "ARC memory guide", "Closures capture rules", "Practice: write a struct"],
    cloud: ["What is cloud computing?", "IaaS vs PaaS vs SaaS", "Serverless explained", "Containers vs VMs", "Practice: deploy something"],
    mongodb: ["Documents vs tables", "CRUD in MongoDB", "Aggregation pipeline", "Indexes in MongoDB", "Practice: write a query"],
    oop: ["What is inheritance?", "Polymorphism explained", "Encapsulation guide", "Abstract vs interface", "Composition vs inheritance"]
};

function getDynamicSuggestions() {
    const output = document.getElementById('output');
    const outputText = output ? output.innerText : '';
    const hasError = outputText.includes('Error:') || outputText.includes('FAIL') || outputText.includes('SyntaxError') || outputText.includes('ReferenceError') || outputText.includes('TypeError');

    if (hasError) {
        if (outputText.includes('SyntaxError') || outputText.includes('Unexpected token')) {
            return ["What is a syntax error?", "How to fix missing brackets", "Check my punctuation", "Common syntax mistakes"];
        }
        if (outputText.includes('ReferenceError') || outputText.includes('is not defined')) {
            return ["What is a ReferenceError?", "How to declare variables", "Variable scope explained", "Check variable spelling"];
        }
        if (outputText.includes('TypeError') || outputText.includes('is not a function') || outputText.includes('Cannot read property')) {
            return ["What is a TypeError?", "Check variable types", "How to use console.log", "Debug undefined values"];
        }
        if (outputText.includes('FAIL') || outputText.includes('Challenge')) {
            return ["Hint for this challenge", "Explain the concept", "Show me a similar example", "Debug my logic"];
        }
        if (currentTopic) {
            return ["Why did I get this error?", "Help me debug my code", `Explain ${currentTopic}`, "How do I fix common mistakes?"];
        }
        return ["Why did I get this error?", "How do I fix my code?", "Explain what went wrong", "Debugging tips"];
    }
    if (currentTopic) {
        const topHints = {
            "Variables": ["How do I declare a variable?", "Variable naming rules", "What is scope?", "Practice: declare and print"],
            "Functions": ["How do I write a function?", "What is a return statement?", "Function parameters", "Practice: write a function"],
            "Loops": ["For vs while which to use?", "How to break a loop", "Nested loops explained", "Practice: loop exercise"],
            "Arrays": ["Common array methods", "How to loop over an array", "Adding and removing items", "Practice: array exercise"],
            "Objects": ["How to create an object", "Accessing properties", "Object methods", "Practice: build an object"],
            "Strings": ["String methods guide", "String interpolation", "How to concatenate", "Practice: string exercise"],
            "Classes": ["How to create a class?", "constructor method", "this keyword explained", "Practice: write a class"],
            "Inheritance": ["extends keyword", "super() call", "Override methods", "When to use inheritance"],
            "Error Handling": ["try/catch syntax", "Throwing errors", "Error types", "Practice: handle an error"],
            "Async/Await": ["Promise syntax guide", "async function basics", "await keyword", "Practice: fetch data"],
            "Pointers": ["What is a pointer?", "Stack vs heap", "Memory management", "Practice: pointer basics"],
            "Recursion": ["Base case explained", "Recursion vs loops", "Stack overflow risk", "Practice: recursion"],
            "Testing": ["How to write tests", "What is TDD?", "Jest for beginners", "Practice: test a function"],
            "SQL": ["SELECT vs INSERT", "JOIN types explained", "WHERE clause filter", "Practice: write a query"],
            "Git": ["How to commit", "Branching explained", "Merge vs rebase", "Practice: git workflow"],
        };
        for (const [key, hints] of Object.entries(topHints)) {
            if (currentTopic.toLowerCase().includes(key.toLowerCase())) return hints;
        }
        return [`Explain ${currentTopic}`, `Practice: ${currentTopic.toLowerCase()} exercise`, "Show me an example", "Common mistakes"];
    }
    if (outputText.includes('PASS') || outputText.includes('Challenge solved')) {
        return ["What should I learn next?", "Explain the concept behind this", "Show me a harder challenge", "Practice more exercises"];
    }
    return null;
}

// ── AI Exercise Generation ──
function generateExercise() {
    const topic = currentTopic || 'programming basics';
    const lang = currentLang || 'js';
    const aiPanel = document.getElementById('aiPanel');
    if (!aiPanel.classList.contains('open')) toggleAI();

    addAIMessage(`Generate an exercise for ${topic}`, 'user');
    addAIMessage('', 'typing');

    fetch(BACKEND_URL + '/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lang, level: 'beginner' })
    })
    .then(r => r.json())
    .then(d => {
        removeTypingIndicator();
        let reply = `<div class="exercise-card"><div class="exercise-title">${d.title || 'Exercise'}</div>`;
        reply += `<div class="exercise-desc">${d.description || 'No description'}</div>`;
        if (d.starterCode) {
            reply += `<pre class="ai-code-block"><code>${d.starterCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        }
        if (d.hint) {
            reply += `<div class="exercise-hint">💡 ${d.hint}</div>`;
        }
        reply += `<button class="exercise-btn" onclick="document.getElementById('editor').value = '${(d.starterCode || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'; updateHighlight();">Load into Editor</button>`;
        reply += `</div>`;
        addAIMessage(reply, 'bot');
    })
    .catch(() => {
        removeTypingIndicator();
        addAIMessage("Couldn't generate an exercise. Make sure the backend is running.", 'bot');
    });
}

function updateAISuggestions() {
    const el = document.getElementById('aiSuggestions');
    const dynamic = getDynamicSuggestions();
    const suggestions = dynamic || suggestionSets[currentLang] || suggestionSets.js;
    const hasExercise = currentTopic && currentLang && currentLang !== 'compiler' && currentLang !== 'challenge' && currentLang !== 'quiz';
    const buttons = suggestions.map(s => `<button onclick="askAI('${s.replace(/'/g, "\\'")}')">${s}</button>`);
    if (hasExercise && !suggestions.some(s => s.toLowerCase().includes('exercise'))) {
        buttons.push(`<button onclick="generateExercise()" style="background:#0ea5e9;color:#000;">✨ Exercise</button>`);
    }
    el.innerHTML = buttons.join('');
}

const oopPhases = {
    js: ["Objects & Classes"],
    ts: ["Classes & OOP"],
    py: ["Classes"],
    go: ["Structs & Composition", "Interfaces"],
    zig: ["Structures"],
    cs: ["Structures & OOP"],
    kt: ["Classes & OOP"],
    rs: ["Traits & Generics"],
    swift: ["Structs & Classes", "Protocols & Extensions"]
};

const oopLangList = [
    { id: 'js', label: 'JavaScript' },
    { id: 'ts', label: 'TypeScript' },
    { id: 'py', label: 'Python' },
    { id: 'go', label: 'Go' },
    { id: 'cs', label: 'C#' },
    { id: 'kt', label: 'Kotlin' },
    { id: 'rs', label: 'Rust' },
    { id: 'swift', label: 'Swift' },
    { id: 'zig', label: 'Zig' }
];

let oopSelectedLang = 'js';

function initOOPSession() {
    document.getElementById('app').className = 'oop-mode';
    document.getElementById('header-title').innerText = 'OOP LAB';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));

    const langData = courseData[oopSelectedLang] || {};
    const phases = oopPhases[oopSelectedLang] || [];
    let html = `<div style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid #334155;padding-bottom:10px;">`;
    for (const l of oopLangList) {
        const active = l.id === oopSelectedLang ? 'active' : '';
        html += `<button class="oop-lang-btn ${active}" style="background:${l.id === oopSelectedLang ? 'var(--accent)' : '#1e293b'};color:${l.id === oopSelectedLang ? '#000' : '#94a3b8'};border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:10px;font-weight:800;" onclick="switchOOPLang('${l.id}')">${l.label}</button>`;
    }
    html += `</div>`;
    html += `<div style="font-size:9px;color:#64748b;margin-bottom:8px;"><a href="#" onclick="setMode('js');return false;" style="color:var(--accent);text-decoration:none;">← Back to topics</a></div>`;
    let idx = 0;
    for (const phase of phases) {
        if (langData[phase]) {
            html += `<span class="phase-label">${phase}</span>`;
            for (const topic in langData[phase]) {
                const delay = idx * 20;
                html += `<button class="item-btn topic-btn-enter" style="animation-delay:${delay}ms" id="btn-${topic.replace(/\s/g, '').replace(/[&,]/g, '')}" onclick="loadTopic('${phase.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')">${topic}</button>`;
                idx++;
            }
        }
    }
    document.getElementById('topic-list').innerHTML = html || '<div style="color:#64748b;font-size:11px;padding:10px;">No OOP topics for this language</div>';

    if (idx > 0) {
        const firstPhase = phases[0];
        const firstTopic = Object.keys(langData[firstPhase] || {})[0];
        if (firstTopic) loadTopic(firstPhase, firstTopic);
    }
}

function switchOOPLang(lang) {
    oopSelectedLang = lang;
    initOOPSession();
}

// Schema Designer
let schemaTables = [];
let schemaNextId = 1;

const schemaTypes = ['INT', 'SERIAL', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'DECIMAL', 'UUID', 'JSONB', 'FLOAT'];

function toggleSchemaDesigner() {
    const el = document.getElementById('schemaDesigner');
    el.classList.toggle('open');
    const editor = document.getElementById('editor');
    editor.style.display = el.classList.contains('open') ? 'none' : 'block';
    if (el.classList.contains('open') && schemaTables.length === 0) {
        if (!schemaLoad()) {
            schemaAddTable();
            schemaAddTable();
        } else {
            schemaRender();
        }
    }
}

function schemaAddTable() {
    const id = schemaNextId++;
    schemaTables.push({
        id, name: `table_${id}`, x: 10 + (schemaTables.length * 20) % 200,
        y: 10 + Math.floor(schemaTables.length / 3) * 40,
        cols: [
            { name: 'id', type: 'SERIAL', pk: true, fk: null },
            { name: 'name', type: 'VARCHAR(255)', pk: false, fk: null }
        ]
    });
    schemaRender();
}

function schemaRemoveTable(id) {
    schemaTables = schemaTables.filter(t => t.id !== id);
    schemaTables.forEach(t => {
        t.cols.forEach(c => {
            if (c.fk && c.fk.tableId === id) c.fk = null;
        });
    });
    schemaRender();
}

function schemaAddCol(tableId) {
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    table.cols.push({ name: 'col', type: 'TEXT', pk: false, fk: null });
    schemaRender();
}

function schemaRemoveCol(tableId, colIdx) {
    const table = schemaTables.find(t => t.id === tableId);
    if (!table || table.cols.length <= 1) return;
    table.cols.splice(colIdx, 1);
    schemaRender();
}

let schemaAbortController = null;

const SCHEMA_STORAGE_KEY = 'dogeslab_schema';

function schemaSave() {
    try { localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schemaTables)); } catch {}
}

function schemaLoad() {
    try {
        const saved = localStorage.getItem(SCHEMA_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                schemaTables = parsed;
                const maxId = parsed.reduce((m, t) => Math.max(m, t.id || 0), 0);
                schemaNextId = maxId + 1;
                return true;
            }
        }
    } catch {}
    return false;
}

function schemaRender() {
    if (schemaAbortController) schemaAbortController.abort();
    schemaAbortController = new AbortController();
    schemaSave();
    const signal = schemaAbortController.signal;

    const canvas = document.getElementById('schemaCanvas');
    canvas.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.overflow = 'visible';
    svg.id = 'schemaLineLayer';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = '<marker id="fkArrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#f59e0b"/></marker><marker id="fkCircle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><circle cx="4" cy="4" r="3" fill="none" stroke="#f59e0b" stroke-width="1.5"/></marker>';
    svg.appendChild(defs);
    canvas.appendChild(svg);

    for (const table of schemaTables) {
        const el = document.createElement('div');
        el.className = 'schema-table';
        el.style.left = table.x + 'px';
        el.style.top = table.y + 'px';
        el.dataset.tableId = table.id;

        let html = `<div class="st-header">
            <input value="${table.name}" onchange="schemaRenameTable(${table.id}, this.value)" spellcheck="false">
            <button class="st-del" onclick="schemaRemoveTable(${table.id})">✕</button>
        </div><div class="st-body">`;

        table.cols.forEach((col, i) => {
            const pkBadge = col.pk ? 'PK' : '';
            const fkBadge = col.fk ? 'FK' : '';
            const isFKTarget = schemaTables.some(t => t.cols.some(c => c.fk && c.fk.tableId === table.id && c.fk.colIdx === i));
            const hasFK = !!col.fk;
            const fkLabel = col.fk ? (() => { const t = schemaTables.find(x => x.id === col.fk.tableId); return t && t.cols[col.fk.colIdx] ? `FK→${t.name}.${t.cols[col.fk.colIdx].name}` : 'FK'; })() : '';
            const rowClasses = ['st-row'];
            if (isFKTarget) rowClasses.push('fk-highlight');
            if (hasFK) rowClasses.push('has-fk');
            const handleContent = col.pk ? 'PK' : (col.fk ? 'FK' : '~>');
            const handleTitle = col.fk ? (fkLabel ? `FK → ${fkLabel} (click to remove)` : 'FK (click to remove)') : (col.pk ? 'Drag to link this PK as FK target' : 'Drag to another column to create FK');
            html += `<div class="${rowClasses.join(' ')}" data-table-id="${table.id}" data-col-idx="${i}">
                <span class="st-pk schema-fk-handle" title="${handleTitle}">${handleContent}</span>
                <input value="${col.name}" onchange="schemaUpdateCol(${table.id}, ${i}, 'name', this.value)" spellcheck="false" placeholder="col">
                <select onchange="schemaUpdateCol(${table.id}, ${i}, 'type', this.value)">
                    ${schemaTypes.map(t => `<option ${t === col.type ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
                <input type="checkbox" ${col.pk ? 'checked' : ''} onchange="schemaTogglePK(${table.id}, ${i})" title="Primary Key">
                <button class="st-del-col" onclick="schemaRemoveCol(${table.id}, ${i})">✕</button>
            </div>`;
        });

        html += `</div><div class="st-add-row">
            <input placeholder="col name" id="newCol-${table.id}" onkeydown="if(event.key==='Enter')schemaAddCol(${table.id})">
            <button onclick="schemaAddCol(${table.id})">+</button>
        </div>`;

        el.innerHTML = html;

        let isDragging = false, startX, startY, origX, origY;
        el.addEventListener('mousedown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
            isDragging = true;
            const rect = el.getBoundingClientRect();
            const parentRect = canvas.getBoundingClientRect();
            startX = e.clientX; startY = e.clientY;
            origX = table.x; origY = table.y;
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            table.x = origX + (e.clientX - startX);
            table.y = origY + (e.clientY - startY);
            el.style.left = table.x + 'px';
            el.style.top = table.y + 'px';
            schemaDrawRelationLines();
        }, { signal });
        document.addEventListener('mouseup', () => { isDragging = false; }, { signal });

        canvas.appendChild(el);
    }
    schemaDrawRelationLines();

    if (linkingState) {
        const srcRow = canvas.querySelector(`.st-row[data-table-id="${linkingState.tableId}"][data-col-idx="${linkingState.colIdx}"]`);
        if (srcRow) {
            srcRow.classList.add('linking-source');
            const h = srcRow.querySelector('.schema-fk-handle');
            if (h) h.classList.add('linking');
        }
        document.querySelectorAll('.st-row').forEach(r => {
            const tid = parseInt(r.dataset.tableId);
            if (!isNaN(tid) && tid !== linkingState.tableId) r.classList.add('linking-valid-target');
        });
    }

    if (schemaActiveTab === 'erd') schemaRenderERD();
}

let schemaFKDragSource = null;
let schemaActiveTab = 'design';
let linkingState = null;

function linkClear() {
    if (linkingState) {
        linkingState = null;
        document.querySelectorAll('.st-row.linking-source, .st-row.linking-valid-target, .schema-fk-handle.linking, .erd-row.erd-linking-source, .erd-row.erd-linking-valid-target')
            .forEach(r => r.classList.remove('linking-source', 'linking-valid-target', 'linking', 'erd-linking-source', 'erd-linking-valid-target'));
        document.body.style.cursor = '';
    }
}

function linkStart(tableId, colIdx) {
    linkClear();
    linkingState = { tableId, colIdx };
    document.body.style.cursor = 'crosshair';
    if (schemaActiveTab === 'erd') schemaRenderERD();
    else schemaRender();
}

function linkEnd(targetTableId, targetColIdx) {
    if (!linkingState) return;
    if (targetTableId === linkingState.tableId) { linkClear(); return; }
    const srcTable = schemaTables.find(t => t.id === linkingState.tableId);
    const srcCol = srcTable?.cols[linkingState.colIdx];
    const tgtTable = schemaTables.find(t => t.id === targetTableId);
    const tgtCol = tgtTable?.cols[targetColIdx];
    if (srcCol && tgtCol) {
        srcCol.fk = { tableId: targetTableId, colIdx: targetColIdx };
    }
    linkClear();
    schemaRender();
    if (schemaActiveTab === 'erd') schemaRenderERD();
}

function schemaDrawRelationLines() {
    const svg = document.getElementById('schemaLineLayer');
    if (!svg) return;
    const oldGroup = svg.querySelector('g');
    if (oldGroup) oldGroup.remove();
    const canvas = document.getElementById('schemaCanvas');
    if (canvas.offsetParent === null) return;
    const canvasRect = canvas.getBoundingClientRect();
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.pointerEvents = 'none';

    for (const table of schemaTables) {
        for (const col of table.cols) {
            if (!col.fk) continue;
            const targetTable = schemaTables.find(t => t.id === col.fk.tableId);
            if (!targetTable) continue;
            const targetCol = targetTable.cols[col.fk.colIdx];
            if (!targetCol) continue;
            const srcEl = canvas.querySelector(`[data-table-id="${table.id}"]`);
            const tgtEl = canvas.querySelector(`[data-table-id="${targetTable.id}"]`);
            if (!srcEl || !tgtEl) continue;
            const sr = srcEl.getBoundingClientRect();
            const tr = tgtEl.getBoundingClientRect();
            const srcRows = srcEl.querySelectorAll('.st-row');
            const tgtRows = tgtEl.querySelectorAll('.st-row');
            const srcRow = srcRows[table.cols.indexOf(col)];
            const tgtRow = tgtRows[col.fk.colIdx];
            let y1 = sr.top + sr.height / 2 - canvasRect.top;
            let x1 = sr.right - canvasRect.left;
            if (srcRow) {
                const srRect = srcRow.getBoundingClientRect();
                y1 = srRect.top + srRect.height / 2 - canvasRect.top;
                x1 = srRect.right - canvasRect.left;
            }
            let y2 = tr.top + tr.height / 2 - canvasRect.top;
            let x2 = tr.left - canvasRect.left;
            if (tgtRow) {
                const trRect = tgtRow.getBoundingClientRect();
                y2 = trRect.top + trRect.height / 2 - canvasRect.top;
                x2 = trRect.left - canvasRect.left;
            }
            const dx = Math.abs(x2 - x1);
            const midX = (x1 + x2) / 2;
            const offset = Math.max(40, dx * 0.4);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`);
            path.setAttribute('stroke', '#f59e0b');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-start', 'url(#fkCircle)');
            path.setAttribute('marker-end', 'url(#fkArrow)');
            group.appendChild(path);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x1 + 6);
            label.setAttribute('y', y1 + 3);
            label.setAttribute('fill', '#f59e0b');
            label.setAttribute('font-size', '8');
            label.setAttribute('font-weight', 'bold');
            label.textContent = '*';
            group.appendChild(label);

            const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label2.setAttribute('x', x2 - 6);
            label2.setAttribute('y', y2 + 3);
            label2.setAttribute('fill', '#10b981');
            label2.setAttribute('font-size', '8');
            label2.setAttribute('font-weight', 'bold');
            label2.setAttribute('text-anchor', 'end');
            label2.textContent = '1';
            group.appendChild(label2);
        }
    }
    svg.appendChild(group);
}

function handleDesignHandleClick(e) {
    const handle = e.target.closest('.schema-fk-handle');
    if (!handle) return;
    if (!document.getElementById('schemaDesigner').classList.contains('open')) return;
    e.preventDefault();
    e.stopPropagation();
    const row = handle.closest('[data-col-idx]');
    if (!row) return;
    const tableId = parseInt(row.dataset.tableId);
    const colIdx = parseInt(row.dataset.colIdx);
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const col = table.cols[colIdx];
    if (!col) return;

    if (linkingState) {
        const tColIdx = parseInt(row.dataset.colIdx);
        linkEnd(tableId, tColIdx);
        return;
    }

    if (col.fk) { col.fk = null; schemaRender(); return; }

    const canvas = document.getElementById('schemaCanvas');
    const svg = document.getElementById('schemaLineLayer');
    const cr = canvas.getBoundingClientRect();
    const hr = handle.getBoundingClientRect();
    const mx = e.clientX, my = e.clientY;
    let isDragging = false;
    let line = null;

    const onMove = function(ev) {
        if (!isDragging && (Math.abs(ev.clientX - mx) > 4 || Math.abs(ev.clientY - my) > 4)) {
            isDragging = true;
            line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('stroke', '#f59e0b');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '5,3');
            svg.appendChild(line);
            schemaFKDragSource = {
                tableId, colIdx, line,
                startX: hr.left + hr.width / 2 - cr.left,
                startY: hr.top + hr.height / 2 - cr.top
            };
        }
        if (isDragging && schemaFKDragSource) {
            const r = canvas.getBoundingClientRect();
            schemaFKDragSource.line.setAttribute('x1', schemaFKDragSource.startX);
            schemaFKDragSource.line.setAttribute('y1', schemaFKDragSource.startY);
            schemaFKDragSource.line.setAttribute('x2', ev.clientX - r.left);
            schemaFKDragSource.line.setAttribute('y2', ev.clientY - r.top);
        }
    };

    const onMoveTarget = function(ev) {
        document.querySelectorAll('.st-row.fk-drag-target').forEach(r => r.classList.remove('fk-drag-target'));
        if (!isDragging || !schemaFKDragSource) return;
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const tr = el ? el.closest('[data-col-idx]') : null;
        if (tr) {
            const tid = parseInt(tr.dataset.tableId);
            if (tid !== schemaFKDragSource.tableId) tr.classList.add('fk-drag-target');
        }
    };

    const onUp = function(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mousemove', onMoveTarget);
        document.removeEventListener('mouseup', onUp);
        document.querySelectorAll('.st-row.fk-drag-target').forEach(r => r.classList.remove('fk-drag-target'));
        if (isDragging && schemaFKDragSource) {
            if (schemaFKDragSource.line.parentNode) schemaFKDragSource.line.parentNode.removeChild(schemaFKDragSource.line);
            const target = document.elementFromPoint(ev.clientX, ev.clientY);
            const targetRow = target ? target.closest('[data-col-idx]') : null;
            if (targetRow) {
                const tTableId = parseInt(targetRow.dataset.tableId);
                const tColIdx = parseInt(targetRow.dataset.colIdx);
                if (!isNaN(tTableId) && !isNaN(tColIdx) && tTableId !== schemaFKDragSource.tableId) {
                    const tTable = schemaTables.find(t => t.id === tTableId);
                    if (tTable && tTable.cols[tColIdx]) {
                        const sourceCol = schemaTables.find(t => t.id === schemaFKDragSource.tableId).cols[schemaFKDragSource.colIdx];
                        sourceCol.fk = { tableId: tTable.id, colIdx: tColIdx };
                    }
                }
            }
            schemaFKDragSource = null;
            schemaRender();
            if (schemaActiveTab === 'erd') schemaRenderERD();
        } else if (!isDragging) {
            linkStart(tableId, colIdx);
        }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousemove', onMoveTarget);
    document.addEventListener('mouseup', onUp);
}

document.addEventListener('mousedown', handleDesignHandleClick);
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && linkingState) { linkClear(); schemaRender(); if (schemaActiveTab === 'erd') schemaRenderERD(); }
});

function schemaSwitchTab(tab) {
    schemaActiveTab = tab;
    linkClear();
    document.getElementById('schemaTabDesign').classList.toggle('active', tab === 'design');
    document.getElementById('schemaTabErd').classList.toggle('active', tab === 'erd');
    document.getElementById('schemaCanvas').style.display = tab === 'design' ? 'block' : 'none';
    document.getElementById('erdCanvas').style.display = tab === 'erd' ? 'block' : 'none';
    document.getElementById('schemaAddTableBtn').style.display = tab === 'design' ? '' : 'none';
    if (tab === 'erd') schemaRenderERD();
}

function schemaAutoLayout() {
    if (schemaTables.length === 0) return;
    const padding = 30;
    const tableW = 220;
    const gapX = 60;
    const gapY = 60;
    const cols = Math.max(1, Math.ceil(Math.sqrt(schemaTables.length)));
    schemaTables.forEach((table, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        table.x = padding + c * (tableW + gapX);
        table.y = padding + r * (gapY + 120);
    });
    schemaRender();
    if (schemaActiveTab === 'erd') schemaRenderERD();
}

function erdHandleRowClick(e) {
    const row = e.target.closest('.erd-row');
    if (!row) return;
    const tableEl = row.closest('.erd-table');
    if (!tableEl) return;
    const tableId = parseInt(tableEl.dataset.tableId);
    if (isNaN(tableId)) return;
    const colIdx = parseInt(row.dataset.colIdx);
    if (isNaN(colIdx)) return;
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const col = table.cols[colIdx];
    if (!col) return;

    if (linkingState) {
        linkEnd(tableId, colIdx);
        return;
    }

    if (col.fk) { col.fk = null; schemaRenderERD(); schemaRender(); return; }

    linkStart(tableId, colIdx);
}

function schemaRenderERD() {
    const canvas = document.getElementById('erdCanvas');
    canvas.innerHTML = '';
    if (schemaTables.length === 0) {
        canvas.innerHTML = '<div style="color:#64748b; padding:40px; text-align:center; font-size:13px;">No tables defined. Switch to Design tab to create a schema.</div>';
        return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.overflow = 'visible';
    svg.id = 'erdLineLayer';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = '<marker id="erdArrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#f59e0b"/></marker><marker id="erdCircle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><circle cx="4" cy="4" r="3" fill="none" stroke="#f59e0b" stroke-width="1.5"/></marker>';
    svg.appendChild(defs);
    canvas.appendChild(svg);

    schemaTables.forEach((table) => {
        const el = document.createElement('div');
        el.className = 'erd-table';
        el.style.left = table.x + 'px';
        el.style.top = table.y + 'px';
        el.dataset.tableId = table.id;

        const body = table.cols.map((c, i) => {
            const isPK = c.pk;
            const isFK = !!c.fk;
            const tag = isPK ? '<span class="erd-pk">PK</span>' : (isFK ? '<span class="erd-fk">FK</span>' : '<span class="erd-pk"></span>');
            const cls = ['erd-row'];
            if (c.fk) cls.push('erd-has-fk');
            return `<div class="${cls.join(' ')}" data-col-idx="${i}">${tag}<span class="erd-name">${c.name}</span><span class="erd-type">${c.type}</span></div>`;
        }).join('');

        el.innerHTML = `<div class="erd-header"><span class="erd-icon">▦</span>${table.name}</div><div class="erd-body">${body}</div>`;

        let isDragging = false, startX, startY, origX, origY;
        el.addEventListener('mousedown', function(e) {
            if (e.target.closest('.erd-row')) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            origX = table.x; origY = table.y;
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            table.x = origX + (e.clientX - startX);
            table.y = origY + (e.clientY - startY);
            el.style.left = table.x + 'px';
            el.style.top = table.y + 'px';
            schemaDrawERDLines();
        }, { signal: schemaAbortController.signal });
        document.addEventListener('mouseup', function() { isDragging = false; }, { signal: schemaAbortController.signal });

        canvas.appendChild(el);
    });

    canvas.addEventListener('click', erdHandleRowClick);

    if (linkingState) {
        const srcRow = canvas.querySelector(`.erd-row[data-col-idx="${linkingState.colIdx}"]`);
        if (srcRow) {
            const parentTable = srcRow.closest('.erd-table');
            if (parentTable && parseInt(parentTable.dataset.tableId) === linkingState.tableId) {
                srcRow.classList.add('erd-linking-source');
            }
        }
        canvas.querySelectorAll('.erd-row').forEach(r => {
            const parent = r.closest('.erd-table');
            if (parent && parseInt(parent.dataset.tableId) !== linkingState.tableId) {
                r.classList.add('erd-linking-valid-target');
            }
        });
    }

    setTimeout(() => schemaDrawERDLines(), 50);
}

function schemaDrawERDLines() {
    const erdSvg = document.getElementById('erdLineLayer');
    if (!erdSvg) return;
    const oldGroup = erdSvg.querySelector('g');
    if (oldGroup) oldGroup.remove();
    const canvas = document.getElementById('erdCanvas');
    const cr = canvas.getBoundingClientRect();
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.pointerEvents = 'none';

    for (const table of schemaTables) {
        for (const col of table.cols) {
            if (!col.fk) continue;
            const targetTable = schemaTables.find(t => t.id === col.fk.tableId);
            if (!targetTable) continue;
            const srcEl = canvas.querySelector(`.erd-table[data-table-id="${table.id}"]`);
            const tgtEl = canvas.querySelector(`.erd-table[data-table-id="${targetTable.id}"]`);
            if (!srcEl || !tgtEl) continue;
            const sr = srcEl.getBoundingClientRect();
            const tr = tgtEl.getBoundingClientRect();
            const srcRows = srcEl.querySelectorAll('.erd-row');
            const tgtRows = tgtEl.querySelectorAll('.erd-row');
            const srcRow = srcRows[table.cols.indexOf(col)];
            const tgtRow = tgtRows[col.fk.colIdx];
            let y1 = sr.top + sr.height / 2 - cr.top;
            let x1 = sr.right - cr.left;
            if (srcRow) { const r2 = srcRow.getBoundingClientRect(); y1 = r2.top + r2.height / 2 - cr.top; x1 = r2.right - cr.left; }
            let y2 = tr.top + tr.height / 2 - cr.top;
            let x2 = tr.left - cr.left;
            if (tgtRow) { const r2 = tgtRow.getBoundingClientRect(); y2 = r2.top + r2.height / 2 - cr.top; x2 = r2.left - cr.left; }
            const dx = Math.abs(x2 - x1);
            const offset = Math.max(40, dx * 0.4);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`);
            path.setAttribute('stroke', '#f59e0b');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-dasharray', '6,3');
            path.setAttribute('marker-start', 'url(#erdCircle)');
            path.setAttribute('marker-end', 'url(#erdArrow)');
            group.appendChild(path);

            const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            lbl.setAttribute('x', x1 + 6); lbl.setAttribute('y', y1 - 4);
            lbl.setAttribute('fill', '#f59e0b'); lbl.setAttribute('font-size', '9');
            lbl.setAttribute('font-weight', 'bold'); lbl.textContent = '*';
            group.appendChild(lbl);

            const lbl2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            lbl2.setAttribute('x', x2 - 6); lbl2.setAttribute('y', y2 - 4);
            lbl2.setAttribute('fill', '#10b981'); lbl2.setAttribute('font-size', '9');
            lbl2.setAttribute('font-weight', 'bold'); lbl2.setAttribute('text-anchor', 'end');
            lbl2.textContent = '1';
            group.appendChild(lbl2);
        }
    }
    erdSvg.appendChild(group);
}

function schemaRenameTable(id, name) {
    const table = schemaTables.find(t => t.id === id);
    if (table) table.name = name.replace(/[^a-zA-Z0-9_]/g, '_');
}

function schemaUpdateCol(tableId, colIdx, field, value) {
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    if (field === 'name') value = value.replace(/[^a-zA-Z0-9_]/g, '_');
    table.cols[colIdx][field] = value;
}

function schemaTogglePK(tableId, colIdx) {
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    table.cols[colIdx].pk = !table.cols[colIdx].pk;
}

function schemaClearAll() {
    if (schemaTables.length === 0) return;
    if (!confirm('Clear all tables?')) return;
    schemaTables = [];
    schemaRender();
    document.getElementById('schemaSQLOutput').textContent = '-- Schema cleared';
}

function schemaGenerateSQL() {
    if (schemaTables.length === 0) {
        document.getElementById('schemaSQLOutput').textContent = '-- No tables defined';
        return;
    }
    let sql = "-- Schema generated by Doge's Lab Schema Designer\n";
    let constraints = [];

    for (const table of schemaTables) {
        const pkCols = table.cols.filter(c => c.pk).map(c => c.name);
        sql += `\nCREATE TABLE ${table.name} (\n`;
        sql += table.cols.map(c => {
            let line = `    ${c.name} ${c.type}`;
            if (c.pk && pkCols.length === 1) line += ' PRIMARY KEY';
            if (c.fk) {
                const t = schemaTables.find(x => x.id === c.fk.tableId);
                const tc = t ? t.cols[c.fk.colIdx] : null;
                if (t && tc) {
                    constraints.push(`    FOREIGN KEY (${c.name}) REFERENCES ${t.name}(${tc.name})`);
                }
            }
            return line;
        }).join(',\n');
        if (pkCols.length > 1) {
            constraints.push(`    PRIMARY KEY (${pkCols.join(', ')})`);
        }
        if (constraints.length) {
            sql += ',\n' + constraints.join(',\n');
        }
        sql += '\n);\n';
        constraints = [];
    }
    document.getElementById('schemaSQLOutput').textContent = sql;
}

function runBenchmark() {
    const out = document.getElementById('output');
    out.innerText = "// Running benchmark...\n";

    Promise.all([
        fetch(BACKEND_URL + '/api/benchmark?n=500000').then(r => r.json()),
        // If Go backend is running on 8080, test it too
        fetch('http://localhost:8080/api/benchmark?n=500000').then(r => r.json()).catch(() => null)
    ])
    .then(([nodeResult, goResult]) => {
        let text = "═══ BENCHMARK RESULTS ═══\n";
        text += `Iterations: 500,000\n\n`;

        text += `── Node.js (${nodeResult.version}) ──\n`;
        text += `  Time: ${nodeResult.timeMs}ms\n`;
        text += `  Ops/sec: ${nodeResult.opsPerSec.toLocaleString()}\n\n`;

        if (goResult) {
            const ratio = (goResult.timeMs / nodeResult.timeMs).toFixed(2);
            const faster = goResult.timeMs < nodeResult.timeMs ? 'Go' : 'Node.js';
            text += `── Go (${goResult.version}) ──\n`;
            text += `  Time: ${goResult.timeMs}ms\n`;
            text += `  Ops/sec: ${goResult.opsPerSec.toLocaleString()}\n`;
            text += `\n── Comparison ──\n`;
            text += `  ${faster} is ${Math.abs(ratio)}x faster\n`;
        } else {
            text += `── Go Backend ──\n`;
            text += `  Not running (start with: cd backend-go && go run main.go)\n`;
        }

        text += `\n═══════════════════════════`;
        out.innerText = text;
    })
    .catch(e => {
        out.innerText = "// Benchmark error: " + e.message;
    });
}

// ── QUIZ MODE ──
let quizLang = 'js';
let quizAnswers = {};
let quizScore = { correct: 0, total: 0 };

function initQuiz() {
    currentLang = 'quiz';
    document.getElementById('app').className = 'quiz-mode';
    document.getElementById('header-title').innerText = 'QUIZ';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-quiz').classList.add('active');
    renderQuiz();
}

function renderQuiz() {
    const questions = quizData[quizLang] || [];
    const list = document.getElementById('topic-list');
    let html = `<div class="quiz-lang-bar">`;
    for (const l of ['js','ts','py','go','cs','kt','rs','swift','git','pg']) {
        const names = { js:'JS', ts:'TS', py:'Python', go:'Go', cs:'C#', kt:'Kotlin', rs:'Rust', swift:'Swift', git:'Git', pg:'SQL' };
        const active = l === quizLang ? 'active' : '';
        html += `<button class="quiz-lang-btn ${active}" onclick="switchQuizLang('${l}')">${names[l]}</button>`;
    }
    html += `</div>`;
    html += `<div style="font-size:9px;color:#64748b;margin-bottom:8px;"><a href="#" onclick="setMode('js');return false;" style="color:var(--accent);text-decoration:none;">← Back to topics</a></div>`;
    const done = Object.keys(quizAnswers).length;
    html += `<div class="quiz-score"><span>Score: <strong>${quizScore.correct}/${quizScore.total}</strong></span><span>Progress: <strong>${done}/${questions.length}</strong></span><button class="quiz-reset" onclick="resetQuiz()">Reset</button></div>`;
    questions.forEach((q, i) => {
        const sel = quizAnswers[i];
        let cls = '';
        if (sel !== undefined) {
            cls = sel === q.ans ? 'correct' : 'wrong';
        }
        html += `<div class="quiz-card fade-in"><div class="q-num">Q${i+1}/${questions.length}</div><div class="q-text">${q.q}</div>`;
        q.opts.forEach((o, j) => {
            let oc = 'quiz-opt';
            if (sel !== undefined) {
                if (j === q.ans) oc += ' correct';
                if (j === sel && j !== q.ans) oc += ' wrong';
            } else if (j === sel) oc += ' selected';
            html += `<button class="${oc}" onclick="answerQuiz(${i}, ${j})">${String.fromCharCode(65+j)}. ${o}</button>`;
        });
        html += `</div>`;
    });
    list.innerHTML = html;
    document.getElementById('explanation').innerHTML = '<div style="color:#64748b;font-size:11px;padding:10px;">Select answers to test your knowledge. Green = correct, Red = wrong.</div>';
    document.getElementById('editor').value = '';
    updateHighlight();
    document.getElementById('output').innerText = '// Quiz Mode Active';
}

function switchQuizLang(lang) {
    quizLang = lang;
    quizAnswers = {};
    quizScore = { correct: 0, total: 0 };
    renderQuiz();
}

function answerQuiz(qIdx, optIdx) {
    const questions = quizData[quizLang] || [];
    if (qIdx >= questions.length) return;
    if (quizAnswers[qIdx] !== undefined) return;
    quizAnswers[qIdx] = optIdx;
    quizScore.total++;
    if (optIdx === questions[qIdx].ans) quizScore.correct++;
    renderQuiz();
}

function resetQuiz() {
    quizAnswers = {};
    quizScore = { correct: 0, total: 0 };
    renderQuiz();
}

// ── CHALLENGE MODE ──
let challengeLang = 'js';
let challengeIdx = 0;

function initChallenge() {
    currentLang = 'challenge';
    currentLevel = 'all';
    document.getElementById('app').className = 'challenge-mode';
    document.getElementById('header-title').innerText = 'CODE CHALLENGES';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-challenge').classList.add('active');
    
    // Render level filter for challenges
    const levelBarEl = document.getElementById('level-bar');
    if (levelBarEl) {
        let levelHtml = '<button class="level-btn active" onclick="setChallengeLevel(\'all\')">All</button>';
        ['beginner', 'intermediate', 'expert'].forEach(level => {
            levelHtml += `<button class="level-btn" onclick="setChallengeLevel('${level}')">${level}</button>`;
        });
        levelBarEl.innerHTML = levelHtml;
        levelBarEl.style.display = 'flex';
    }
    
    renderChallengeList();
    loadChallenge(0);
}

function setChallengeLevel(level) {
    currentLevel = level;
    
    // Update active button styling
    const levelButtons = document.querySelectorAll('#level-bar .level-btn');
    levelButtons.forEach(btn => {
        const btnLevel = btn.textContent.toLowerCase();
        if (btnLevel === level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderChallengeList();
}

function renderChallengeList() {
    const challenges = challengeData[challengeLang] || [];
    const list = document.getElementById('topic-list');
    let html = `<div class="challenge-lang-bar">`;
    for (const l of ['js','py','go','ts','rs','swift']) {
        const names = { js:'JS', py:'Python', go:'Go', ts:'TS', rs:'Rust', swift:'Swift' };
        const active = l === challengeLang ? 'active' : '';
        html += `<button class="challenge-lang-btn ${active}" onclick="switchChallengeLang('${l}')">${names[l]}</button>`;
    }
    html += `</div>`;
    html += `<div style="font-size:9px;color:#64748b;margin-bottom:8px;"><a href="#" onclick="setMode('js');return false;" style="color:var(--accent);text-decoration:none;">← Back to topics</a></div>`;
    
    let filteredChallenges = [];
    challenges.forEach((ch, i) => {
        if (currentLevel === 'all' || ch.level === currentLevel) {
            filteredChallenges.push({...ch, idx: i});
        }
    });
    
    filteredChallenges.forEach((ch) => {
        const active = ch.idx === challengeIdx ? 'active' : '';
        html += `<div class="challenge-card ${active}" onclick="loadChallenge(${ch.idx})">
            <div><span class="ch-title">${ch.title}</span><span class="ch-level ${ch.level}">${ch.level}</span></div>
            <div class="ch-desc">${ch.desc}</div>
        </div>`;
    });
    list.innerHTML = html;
}

function loadChallenge(idx) {
    const challenges = challengeData[challengeLang] || [];
    if (idx < 0 || idx >= challenges.length) return;
    challengeIdx = idx;
    const ch = challenges[idx];
    document.getElementById('editor').value = ch.bug;
    updateHighlight();
    document.getElementById('output').innerText = '// Challenge: ' + ch.title + '\n// Edit the code and click "Run" to test your fix';
    document.getElementById('explanation').innerHTML = `<h3 style="margin:0;color:#fff">${ch.title}</h3>
        <p style="color:#f59e0b;font-size:10px;font-weight:800;text-transform:uppercase;">${ch.level}</p>
        <p style="color:#94a3b8;font-size:11px;margin:8px 0;">${ch.desc}</p>
        <hr style="border:none;border-top:1px solid #334155;margin:10px 0;">
        <p style="color:#64748b;font-size:10px;">Edit the code in the editor, then click Run to test your solution against the challenge.</p>`;
    renderChallengeList();
}

function switchChallengeLang(lang) {
    if (!challengeData[lang] || challengeData[lang].length === 0) return;
    challengeLang = lang;
    challengeIdx = 0;
    loadChallenge(0);
}

// Override runCode in challenge mode to test against challenge
const origRunCode = runCode;
runCode = function() {
    if (currentLang === 'challenge') {
        setRunLoading(true);
        testChallenge();
        return;
    }
    origRunCode();
};

function testChallenge() {
    const challenges = challengeData[challengeLang] || [];
    const ch = challenges[challengeIdx];
    if (!ch) { setRunLoading(false); document.getElementById('output').innerText = '// No challenge selected'; return; }
    const code = document.getElementById('editor').value;
    const out = document.getElementById('output');

    if (challengeLang === 'js') {
        try {
            const log = console.log;
            let captured = '';
            console.log = (m) => captured += "> " + (typeof m === 'object' ? JSON.stringify(m) : m) + "\n";
            eval(code);
            console.log = log;
            const testPassed = eval(ch.test);
            if (testPassed) {
                out.innerHTML = captured + `<div class="challenge-result pass">PASS: Challenge solved!</div>`;
            } else {
                out.innerHTML = captured + `<div class="challenge-result fail">FAIL: Solution doesn't pass the test. Try again.</div>`;
            }
        } catch(e) {
            out.innerHTML = `<div class="challenge-result fail">Error: ${e.message}</div>`;
        }
    } else {
        out.innerText = "// Challenge preview mode for " + challengeLang.toUpperCase() + "\n// Check the solution logic manually";
    }
    setRunLoading(false);
}

// ── EDITOR AUTO-CLOSE & SMART INDENT ──

document.getElementById('editor').addEventListener('keydown', function(e) {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const text = this.value;
    const key = e.key;

    const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '`': '`' };
    const openers = Object.keys(pairs);
    const closers = Object.values(pairs);

    if (openers.includes(key)) {
        e.preventDefault();
        const close = pairs[key];
        if (start !== end) {
            const sel = text.substring(start, end);
            this.value = text.substring(0, start) + key + sel + close + text.substring(end);
            this.selectionStart = start + 1;
            this.selectionEnd = start + sel.length + 1;
        } else {
            const next = text[start];
            if (['"', "'", '`'].includes(key) && next && /\w/.test(next)) {
                this.value = text.substring(0, start) + key + text.substring(start);
                this.selectionStart = start + 1;
                this.selectionEnd = start + 1;
            } else {
                this.value = text.substring(0, start) + key + close + text.substring(start);
                this.selectionStart = start + 1;
                this.selectionEnd = start + 1;
            }
        }
        return;
    }

    if (closers.includes(key) && start === end && text[start] === key) {
        e.preventDefault();
        this.selectionStart = start + 1;
        this.selectionEnd = start + 1;
        return;
    }

    if (key === 'Backspace' && start === end && start > 0) {
        const prev = text[start - 1];
        const next = text[start];
        if (pairs[prev] && next === pairs[prev]) {
            e.preventDefault();
            this.value = text.substring(0, start - 1) + text.substring(start + 1);
            this.selectionStart = start - 1;
            this.selectionEnd = start - 1;
            return;
        }
        if (compState && compState.popup.style.display !== 'none') hideCompletions();
        return;
    }

    if (key === 'Enter') {
        if (compState && compState.popup.style.display !== 'none') {
            e.preventDefault();
            compSelect();
            return;
        }
        const beforeLine = text.substring(0, start).split('\n').pop();
        const indent = beforeLine.match(/^\s*/)[0];
        const lineAfter = text.substring(start).split('\n')[0];
        if (/^\s*\{?\s*$/.test(beforeLine) && /^\s*\}?\s*$/.test(lineAfter)) {
            if (beforeLine.includes('{') || beforeLine.includes('(') || beforeLine.includes('[')) {
                e.preventDefault();
                this.value = text.substring(0, start) + '\n' + indent + '  \n' + indent + text.substring(start);
                this.selectionStart = start + 1 + indent.length + 2;
                this.selectionEnd = start + 1 + indent.length + 2;
                return;
            }
        }
        return; // normal Enter -> newline
    }

    if (key === 'Tab' && compState && compState.popup.style.display !== 'none') {
        e.preventDefault();
        compSelect();
        return;
    }

    if ((key === 'ArrowDown' || key === 'ArrowUp') && compState && compState.popup.style.display !== 'none') {
        e.preventDefault();
        const items = compState.popup.querySelectorAll('.comp-item');
        if (items.length === 0) return;
        items[compState.idx].classList.remove('comp-selected');
        items[compState.idx].style.color = '#94a3b8';
        items[compState.idx].style.background = 'transparent';
        if (key === 'ArrowDown') compState.idx = (compState.idx + 1) % items.length;
        else compState.idx = (compState.idx - 1 + items.length) % items.length;
        items[compState.idx].classList.add('comp-selected');
        items[compState.idx].style.color = '#fff';
        items[compState.idx].style.background = 'var(--accent)';
        items[compState.idx].scrollIntoView({ block: 'nearest' });
        return;
    }

    if (key === 'Escape' && compState && compState.popup.style.display !== 'none') {
        hideCompletions();
        return;
    }
});

document.getElementById('editor').addEventListener('keyup', function(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Control', 'Shift', 'Alt', 'Meta', 'Escape'].includes(e.key)) return;
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Backspace') return;
    setTimeout(() => triggerCompletions(this), 0);
});

document.getElementById('editor').addEventListener('blur', function() {
    setTimeout(hideCompletions, 200);
});

// ── AUTO-COMPLETE ──

const LANG_KEYWORDS = {
    js: ['let', 'const', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'null', 'undefined', 'true', 'false', 'console.log', 'console.error', 'Array', 'Object', 'Promise', 'Map', 'Set', 'Number', 'String', 'Boolean', 'Symbol', 'Date', 'RegExp', 'JSON', 'Math', 'parseInt', 'parseFloat', 'setTimeout', 'setInterval', 'addEventListener', 'querySelector', 'document', 'window'],
    ts: ['let', 'const', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'interface', 'type', 'enum', 'class', 'extends', 'implements', 'abstract', 'private', 'protected', 'public', 'readonly', 'static', 'as', 'is', 'keyof', 'typeof', 'Record', 'Partial', 'Required', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'async', 'await', 'import', 'export', 'from', 'null', 'undefined', 'true', 'false', 'string', 'number', 'boolean', 'any', 'void', 'never', 'unknown'],
    py: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'try', 'except', 'finally', 'raise', 'import', 'from', 'as', 'class', 'with', 'open', 'pass', 'None', 'True', 'False', 'in', 'not', 'and', 'or', 'is', 'lambda', 'yield', 'async', 'await', 'self', 'print', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'reduce', 'any', 'all', 'sum', 'min', 'max', 'abs', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'super', 'property', 'staticmethod', 'classmethod'],
    go: ['func', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'go', 'defer', 'select', 'chan', 'map', 'struct', 'interface', 'type', 'package', 'import', 'var', 'const', 'nil', 'true', 'false', 'make', 'new', 'append', 'len', 'cap', 'error', 'string', 'int', 'bool', 'float64', 'float32', 'byte', 'rune', 'int64', 'int32', 'uint', 'uint64', 'slice', 'Println', 'Printf', 'Sprintf', 'Fprintf'],
    rs: ['fn', 'let', 'mut', 'const', 'if', 'else', 'for', 'while', 'loop', 'match', 'return', 'struct', 'enum', 'trait', 'impl', 'type', 'pub', 'use', 'mod', 'crate', 'self', 'super', 'where', 'as', 'in', 'ref', 'move', 'async', 'await', 'unsafe', 'Some', 'None', 'Ok', 'Err', 'Result', 'Option', 'true', 'false', 'String', 'Vec', 'println!', 'format!', 'print!', 'vec!', 'match', 'if let', 'while let', 'Box', 'Rc', 'Arc', 'Cell', 'RefCell', 'HashMap', 'HashSet', 'Iterator', 'Clone', 'Copy', 'Debug', 'Display', 'PartialEq', 'Eq', 'PartialOrd', 'Ord'],
    zig: ['fn', 'var', 'const', 'if', 'else', 'for', 'while', 'switch', 'return', 'struct', 'enum', 'union', 'comptime', 'pub', 'usingnamespace', 'test', 'defer', 'errdefer', 'try', 'catch', 'null', 'undefined', 'true', 'false', 'allocator', 'std', 'print', 'ArrayList', 'HashMap', 'AutoHashMap', 'StringHashMap', 'Arraylist', 'Allocator', 'arena', 'page_allocator', 'heap', 'fmt', 'log', 'debug', 'panic'],
    c: ['int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned', 'signed', 'struct', 'union', 'enum', 'typedef', 'const', 'static', 'extern', 'volatile', 'register', 'auto', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'goto', 'sizeof', 'NULL', 'printf', 'scanf', 'malloc', 'calloc', 'realloc', 'free', 'FILE', 'fopen', 'fclose', 'fread', 'fwrite', 'fprintf', 'fscanf', 'fgets', 'fputs', 'fgetc', 'fputc', 'feof', 'ferror', '#include', '#define', '#ifdef', '#ifndef', '#endif', '#pragma', 'main'],
    cpp: ['int', 'char', 'float', 'double', 'void', 'bool', 'long', 'short', 'unsigned', 'signed', 'struct', 'class', 'enum', 'typedef', 'const', 'static', 'extern', 'virtual', 'override', 'final', 'private', 'protected', 'public', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'new', 'delete', 'this', 'namespace', 'using', 'template', 'typename', '#include', '#define', '#ifdef', '#ifndef', '#endif', 'auto', 'nullptr', 'true', 'false', 'std', 'cout', 'cin', 'vector', 'string', 'map', 'set', 'shared_ptr', 'unique_ptr', 'make_shared', 'make_unique', 'pair', 'tuple', 'array', 'list', 'forward_list', 'deque', 'unordered_map', 'unordered_set', 'stack', 'queue', 'priority_queue', 'fstream', 'ifstream', 'ofstream', 'stringstream'],
    cs: ['class', 'struct', 'interface', 'enum', 'record', 'namespace', 'using', 'public', 'private', 'protected', 'internal', 'static', 'readonly', 'virtual', 'override', 'abstract', 'sealed', 'async', 'await', 'var', 'int', 'string', 'bool', 'float', 'double', 'void', 'char', 'object', 'null', 'true', 'false', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'base', 'is', 'as', 'typeof', 'sizeof', 'nameof', 'get', 'set', 'value', 'yield', 'Console.WriteLine', 'Console.Write', 'Console.ReadLine', 'Console.ReadKey', 'Console.Clear', 'var', 'List', 'Dictionary', 'HashSet', 'IEnumerable', 'IQueryable', 'Task', 'async', 'await', 'HttpClient', 'JsonSerializer', 'StringBuilder', 'Regex', 'DateTime', 'TimeSpan', 'Guid', 'Path', 'File', 'Directory', 'StreamReader', 'StreamWriter'],
    kt: ['fun', 'val', 'var', 'if', 'else', 'when', 'for', 'while', 'do', 'return', 'class', 'data', 'object', 'companion', 'interface', 'enum', 'sealed', 'open', 'abstract', 'override', 'private', 'protected', 'public', 'internal', 'inline', 'suspend', 'import', 'package', 'null', 'true', 'false', 'this', 'super', 'is', 'as', 'in', 'out', 'reified', 'crossinline', 'noinline', 'vararg', 'by', 'delegate', 'get', 'set', 'init', 'constructor', 'Unit', 'Any', 'Nothing', 'String', 'Int', 'Boolean', 'List', 'Map', 'Set', 'MutableList', 'arrayOf', 'listOf', 'mapOf', 'setOf', 'mutableListOf', 'println', 'print', 'readLine', 'filter', 'map', 'forEach', 'flatMap', 'groupBy', 'sortedBy', 'distinct', 'reduce', 'fold', 'let', 'apply', 'run', 'with', 'also', 'takeIf', 'takeUnless', 'repeat', 'require', 'check', 'error'],
    swift: ['var', 'let', 'func', 'return', 'if', 'else', 'guard', 'for', 'while', 'repeat', 'switch', 'case', 'default', 'break', 'continue', 'fallthrough', 'class', 'struct', 'enum', 'protocol', 'extension', 'init', 'deinit', 'subscript', 'mutating', 'nonmutating', 'static', 'class', 'override', 'convenience', 'required', 'public', 'private', 'internal', 'fileprivate', 'open', 'import', 'nil', 'true', 'false', 'self', 'super', 'in', 'is', 'as', 'try', 'catch', 'throw', 'throws', 'rethrows', 'async', 'await', 'actor', 'nonisolated', 'isolated', 'String', 'Int', 'Double', 'Bool', 'Array', 'Dictionary', 'Set', 'Optional', 'print', 'debugPrint', 'map', 'filter', 'reduce', 'compactMap', 'flatMap', 'forEach', 'sorted', 'first', 'last', 'count', 'isEmpty', 'append', 'remove', 'insert', 'contains'],
    pg: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'EXISTS', 'ANY', 'ALL', 'SOME', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'TRUE', 'FALSE', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'GREATEST', 'LEAST', 'NOW', 'CURRENT_DATE', 'EXTRACT', 'DATE_TRUNC', 'TO_CHAR', 'TO_DATE', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'OVER', 'PARTITION', 'WINDOW', 'WITH', 'RECURSIVE', 'RETURNING', 'SERIAL', 'BIGSERIAL', 'VARCHAR', 'TEXT', 'INTEGER', 'BIGINT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSONB', 'UUID', 'DECIMAL', 'FLOAT', 'ENUM', 'ARRAY', 'NUMERIC'],
    dk: ['FROM', 'RUN', 'CMD', 'ENTRYPOINT', 'WORKDIR', 'COPY', 'ADD', 'ENV', 'ARG', 'EXPOSE', 'VOLUME', 'LABEL', 'MAINTAINER', 'USER', 'SHELL', 'HEALTHCHECK', 'ONBUILD', 'STOPSIGNAL', 'docker', 'build', 'run', 'exec', 'ps', 'images', 'pull', 'push', 'login', 'logout', 'tag', 'rm', 'rmi', 'logs', 'inspect', 'network', 'volume', 'compose', 'docker-compose', 'up', 'down', 'start', 'stop', 'restart', 'kill', 'pause', 'unpause', 'commit', 'save', 'load', 'export', 'import', 'cp', 'diff', 'events', 'port', 'top', 'version', 'info', 'system', 'prune', 'container', 'image', 'service', 'stack', 'swarm', 'secret', 'config', 'node', 'plugin', 'trust'],
    git: ['git', 'init', 'clone', 'add', 'commit', 'push', 'pull', 'fetch', 'merge', 'rebase', 'branch', 'checkout', 'switch', 'restore', 'stash', 'log', 'diff', 'status', 'reset', 'revert', 'cherry-pick', 'tag', 'remote', 'config', 'help', 'rm', 'mv', 'clean', 'gc', 'fsck', 'bisect', 'blame', 'grep', 'show', 'shortlog', 'describe', 'archive', 'bundle', 'worktree', 'submodule', 'notes', 'reflog', 'format-patch', 'am', 'apply', 'range-diff', 'sparse-checkout', 'main', 'master', 'origin', 'HEAD', '--force', '--hard', '--soft', '--mixed', '--amend', '--no-ff', '--abort', '--continue', '--skip', '--all', '--oneline', '--graph', '--decorate', '--author', '--since', '--until', '--grep'],
    mongodb: ['db', 'use', 'show', 'createCollection', 'insertOne', 'insertMany', 'find', 'findOne', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'aggregate', 'countDocuments', 'estimatedDocumentCount', 'distinct', 'sort', 'limit', 'skip', 'project', 'lookup', 'group', 'match', 'project', 'unwind', 'addFields', 'bucket', 'replaceRoot', 'out', 'merge', 'collStats', 'indexStats', 'createIndex', 'dropIndex', 'getIndexes', 'drop', 'renameCollection', 'bulkWrite', 'watch', 'mapReduce', 'cloneCollection', 'copyTo', 'convertToCapped', 'ObjectId', 'ISODate', 'NumberInt', 'NumberLong', 'NumberDecimal', 'Timestamp', 'RegExp', 'MinKey', 'MaxKey', 'null', 'true', 'false', '$match', '$group', '$sort', '$project', '$lookup', '$unwind', '$addFields', '$bucket', '$replaceRoot', '$out', '$merge', '$count', '$limit', '$skip', '$sample'],
    gamedev: ['Vector2', 'Vector3', 'Transform', 'Quaternion', 'Matrix4x4', 'GameObject', 'Component', 'MonoBehaviour', 'Start', 'Update', 'FixedUpdate', 'LateUpdate', 'Awake', 'OnEnable', 'OnDisable', 'OnDestroy', 'Instantiate', 'Destroy', 'Find', 'GetComponent', 'AddComponent', 'transform', 'position', 'rotation', 'scale', 'Translate', 'Rotate', 'LookAt', 'Input', 'GetKey', 'GetKeyDown', 'GetKeyUp', 'GetAxis', 'GetButton', 'GetButtonDown', 'Rigidbody', 'Collider', 'Collision', 'Trigger', 'Raycast', 'Physics', 'OverlapSphere', 'SceneManager', 'LoadScene', 'Application', 'Quit', 'OpenURL', 'Time', 'deltaTime', 'time', 'timeScale', 'Mathf', 'Random', 'Range', 'Lerp', 'SmoothDamp', 'Color', 'Material', 'Mesh', 'Renderer', 'Animation', 'Animator', 'AudioSource', 'AudioClip', 'Play', 'Stop', 'ParticleSystem', 'Camera', 'Screen', 'Cursor', 'ScreenToWorldPoint', 'WorldToScreenPoint', 'Debug', 'Log', 'DrawRay', 'DrawLine', 'Gizmos', 'Physics2D', 'Collider2D', 'Rigidbody2D'],
};

let compState = null;

function getCaretCoords(textarea) {
    const pos = textarea.selectionStart;
    const text = textarea.value;
    const before = text.substring(0, pos);
    const lines = before.split('\n');
    const line = lines.length - 1;
    const col = lines[lines.length - 1].length;
    const rect = textarea.getBoundingClientRect();
    const style = getComputedStyle(textarea);
    const padLeft = parseFloat(style.paddingLeft);
    const padTop = parseFloat(style.paddingTop);
    const charW = 8.2;
    const lineH = 20.5;
    return {
        x: rect.left + padLeft + col * charW - textarea.scrollLeft,
        y: rect.top + padTop + line * lineH - textarea.scrollTop
    };
}

function getCurrentWord(textarea) {
    const pos = textarea.selectionStart;
    const text = textarea.value;
    const before = text.substring(0, pos);
    const after = text.substring(pos);
    const matchBefore = before.match(/[a-zA-Z_$][a-zA-Z0-9_$]*$/);
    const word = matchBefore ? matchBefore[0] : '';
    const start = matchBefore ? pos - word.length : pos;
    const afterMatch = after.match(/^[a-zA-Z0-9_$]*/);
    const end = pos + (afterMatch ? afterMatch[0].length : 0);
    return { word, start, end };
}

function triggerCompletions(textarea) {
    const { word, start, end } = getCurrentWord(textarea);
    if (!word || word.length < 2) { hideCompletions(); return; }

    const p = word.toLowerCase();
    const keywords = LANG_KEYWORDS[currentLang] || LANG_KEYWORDS.js;
    let matches = keywords.filter(kw => kw.toLowerCase().startsWith(p) && kw !== word);

    const data = courseData[currentLang];
    if (data) {
        const seen = new Set([...keywords.map(k => k.toLowerCase()), ...matches.map(m => m.toLowerCase())]);
        for (const phase in data) {
            for (const topic in data[phase]) {
                const words = topic.split(/[\s,;&()]+/);
                for (const w of words) {
                    const wl = w.toLowerCase();
                    if (w.length > 1 && wl.startsWith(p) && !seen.has(wl)) {
                        seen.add(wl);
                        matches.push(w);
                    }
                }
            }
        }
    }

    const editorWords = [...new Set((textarea.value.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || []))];
    for (const w of editorWords) {
        if (w !== word && w.toLowerCase().startsWith(p) && !matches.includes(w)) {
            matches.push(w);
        }
    }

    matches = matches.sort().slice(0, 15);
    if (matches.length === 0) { hideCompletions(); return; }

    if (!compState) {
        const popup = document.createElement('div');
        popup.id = 'completionPopup';
        popup.style.cssText = 'position:fixed;background:#0f172a;border:1px solid #334155;border-radius:6px;padding:4px 0;max-height:180px;overflow-y:auto;display:none;z-index:1000;font-size:11px;font-family:Consolas,monospace;min-width:120px;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
        document.body.appendChild(popup);
        compState = { popup, idx: 0 };
    }

    const popup = compState.popup;
    const coords = getCaretCoords(textarea);
    popup.innerHTML = matches.map((item, i) =>
        `<div class="comp-item" data-idx="${i}" style="padding:4px 10px;cursor:pointer;color:${i === 0 ? '#fff' : '#94a3b8'};background:${i === 0 ? 'var(--accent)' : 'transparent'};">${item}</div>`
    ).join('');
    popup.style.display = 'block';
    popup.style.left = Math.min(coords.x, window.innerWidth - 220) + 'px';
    popup.style.top = Math.min(coords.y + 22, window.innerHeight - 200) + 'px';
    compState.idx = 0;

    popup.querySelectorAll('.comp-item').forEach(el => {
        el.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const val = this.textContent;
            insertCompletion(val);
        });
    });
}

function insertCompletion(val) {
    const textarea = document.getElementById('editor');
    const { word, start, end } = getCurrentWord(textarea);
    textarea.value = textarea.value.substring(0, start) + val + textarea.value.substring(end);
    textarea.selectionStart = start + val.length;
    textarea.selectionEnd = start + val.length;
    textarea.focus();
    hideCompletions();
}

function compSelect() {
    if (!compState || compState.popup.style.display === 'none') return;
    const items = compState.popup.querySelectorAll('.comp-item');
    const selected = items[compState.idx];
    if (selected) {
        insertCompletion(selected.textContent);
    }
}

function hideCompletions() {
    if (compState && compState.popup) {
        compState.popup.style.display = 'none';
    }
}

// ── PROGRESS TRACKING ──
let completedTopics = new Set();

function loadProgress() {
    fetch(BACKEND_URL + '/api/progress')
        .then(r => r.json())
        .then(data => {
            completedTopics = new Set();
            for (const lang in data)
                for (const topic in data[lang])
                    if (data[lang][topic]) completedTopics.add(lang + ':' + topic);
            updateTopicDisplay();
        })
        .catch(() => {});
}

function toggleProgress(topic) {
    const key = currentLang + ':' + topic;
    const completed = !completedTopics.has(key);
    completed ? completedTopics.add(key) : completedTopics.delete(key);
    fetch(BACKEND_URL + '/api/progress', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: currentLang, topic, completed })
    }).catch(() => {});

    const toast = document.createElement('div');
    toast.textContent = completed ? '★ Completed!' : '☆ Unmarked';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--accent);color:#000;padding:10px 18px;border-radius:10px;font-size:12px;font-weight:800;z-index:999;animation:fadeIn 0.2s ease;box-shadow:0 4px 16px rgba(0,0,0,0.4);pointer-events:none;';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 1200);

    updateTopicDisplay();
}

function updateTopicDisplay() {
    document.querySelectorAll('.item-btn').forEach(btn => {
        const raw = btn.getAttribute('data-topic') || btn.textContent.replace(/^[★☆]\s*/, '').replace(/^[BIE]\s+/, '').trim();
        btn.setAttribute('data-topic', raw);
        const isDone = completedTopics.has(currentLang + ':' + raw);
        const level = btn.dataset.level || 'beginner';
        const diffBadge = `<span class="diff-badge ${level}">${level[0].toUpperCase()}</span>`;
        btn.innerHTML = `<span class="topic-star" data-topic="${raw.replace(/"/g, '&quot;')}">${isDone ? '★' : '☆'}</span> ${diffBadge}<span class="topic-name">${raw}</span>`;
        btn.classList.toggle('topic-done', isDone);
        const star = btn.querySelector('.topic-star');
        if (star) star.onclick = function(e) {
            e.stopPropagation();
            const parent = this.closest('.item-btn');
            if (parent) toggleProgress(parent.dataset.topic);
        };
    });
    updateProgressBar();
}

// ── SYNTAX HIGHLIGHTING ──
let hlEditor = null;
let hlOverlay = null;

function initHighlighting() {
    const textarea = document.getElementById('editor');
    if (hlOverlay) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-wrapper';
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);
    hlOverlay = document.createElement('pre');
    hlOverlay.className = 'editor-highlight';
    hlOverlay.innerHTML = '<code></code>';
    wrapper.insertBefore(hlOverlay, textarea);
    textarea.addEventListener('input', updateHighlight);
    textarea.addEventListener('scroll', function() {
        hlOverlay.scrollTop = this.scrollTop;
        hlOverlay.scrollLeft = this.scrollLeft;
    });
    hlEditor = textarea;
    updateHighlight();
}

function updateHighlight() {
    if (!hlOverlay) return;
    const code = hlEditor ? hlEditor.value : document.getElementById('editor').value;
    hlOverlay.firstChild.innerHTML = highlightCode(code, currentLang);
    if (hlEditor) {
        hlOverlay.scrollTop = hlEditor.scrollTop;
        hlOverlay.scrollLeft = hlEditor.scrollLeft;
    }
}

function highlightCode(code, lang) {
    let h = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    h = h.replace(/(\/\/.*)/g, '<span class="hl-comment">$1</span>');
    h = h.replace(/(#.*)/g, '<span class="hl-comment">$1</span>');
    h = h.replace(/(--.*)/g, '<span class="hl-comment">$1</span>');
    h = h.replace(/\/\*[\s\S]*?\*\//g, '<span class="hl-comment">$&</span>');
    h = h.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, '<span class="hl-string">$&</span>');
    h = h.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>');
    const kws = LANG_KEYWORDS[lang] || LANG_KEYWORDS.js;
    const sorted = [...kws].sort((a, b) => b.length - a.length);
    const escaped = sorted.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (escaped) h = h.replace(new RegExp('\\b(' + escaped + ')\\b', 'gi'), '<span class="hl-keyword">$1</span>');
    return h;
}

// ── Compiler Pipeline ──
function compilerRunPipeline(stage) {
    const editor = document.getElementById('editor');
    const code = editor ? editor.value : '';
    const lang = currentLang === 'compiler' ? 'js' : currentLang;
    const result = COMPILER.runPipeline(code, lang);
    const content = document.getElementById('cp-pipeline-content');

    const tabs = document.querySelectorAll('.cp-tab');
    tabs.forEach(t => t.classList.remove('active'));

    if (stage === -1) {
        tabs.forEach(t => t.classList.add('active'));
        let html = '<div class="cp-pipeline-stage"><div class="cp-stage-label">Source</div><div class="cp-source-code">';
        html += COMPILER.highlightCode(code, lang) + '</div></div>';
        html += '<div class="cp-pipeline-stage"><div class="cp-stage-label">Tokens</div>' + result.html.tokens + '</div>';
        html += '<div class="cp-pipeline-stage"><div class="cp-stage-label">AST</div>' + result.html.ast + '</div>';
        html += '<div class="cp-pipeline-stage"><div class="cp-stage-label">Statistics</div>' + result.html.stats + '</div>';
        content.innerHTML = html;
        return;
    }

    const tab = document.querySelector(`.cp-tab[data-stage="${stage}"]`);
    if (tab) tab.classList.add('active');

    switch (stage) {
        case 0:
            content.innerHTML = '<div class="cp-pipeline-stage"><div class="cp-stage-label">Source Code</div><div class="cp-source-code">' + COMPILER.highlightCode(code, lang) + '</div></div>';
            break;
        case 1:
            content.innerHTML = '<div class="cp-pipeline-stage"><div class="cp-stage-label">Tokens</div>' + result.html.tokens + '</div>';
            break;
        case 2:
            content.innerHTML = '<div class="cp-pipeline-stage"><div class="cp-stage-label">AST</div>' + result.html.ast + '</div>';
            break;
        case 3:
            content.innerHTML = '<div class="cp-pipeline-stage"><div class="cp-stage-label">Statistics</div>' + result.html.stats + '</div>';
            break;
    }
}

document.addEventListener('click', function(e) {
    const tab = e.target.closest('.cp-tab');
    if (tab) {
        const stage = parseInt(tab.dataset.stage);
        compilerRunPipeline(stage);
    }
});

setMode = function(lang) {
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('editor').style.display = 'block';
    document.getElementById('output').style.display = 'block';
    document.getElementById('compiler-output').style.display = 'none';
    document.getElementById('compiler-buttons').style.display = 'none';
    const runBtn = document.querySelector('.run-btn');
    document.getElementById('cheatsheet-btn').textContent = lang === 'challenge' ? 'Reveal Answer' : 'Cheatsheet';
    if (runBtn) runBtn.textContent = lang === 'challenge' ? 'Test ▶' : 'Run ▶';
    if (lang === 'quiz') { document.getElementById('level-bar').style.display = 'none'; initQuiz(); updateAISuggestions(); return; }
    if (lang === 'challenge') { initChallenge(); updateAISuggestions(); return; }
    if (lang === 'game') { document.getElementById('level-bar').style.display = 'none'; initGame(); updateAISuggestions(); return; }
    if (lang === 'oop') { document.getElementById('level-bar').style.display = 'none'; initOOPSession(); updateAISuggestions(); return; }
    if (lang === 'db') { document.getElementById('level-bar').style.display = 'none'; initDatabase(); updateAISuggestions(); return; }
    if (lang === 'compiler') {
        document.getElementById('level-bar').style.display = 'none';
        document.getElementById('output').style.display = 'none';
        document.getElementById('compiler-output').style.display = 'block';
        document.getElementById('compiler-buttons').style.display = 'flex';
        document.getElementById('schemaDesigner').classList.remove('open');
        document.getElementById('editor').style.display = 'block';
        currentLang = 'compiler';
        document.getElementById('app').className = 'compiler-mode';
        document.getElementById('header-title').innerText = 'COMPILER';
        document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
        const navBtn = document.getElementById('nav-compiler');
        if (navBtn) navBtn.classList.add('active');
        const langData = courseData.compiler || {};
        let html = '';
        for (const phase in langData) {
            const topics = Object.keys(langData[phase]);
            html += `<div class="phase-header" data-phase="${phase}" onclick="togglePhase('${phase}','${phase}')"><span class="phase-toggle">▼</span><span class="phase-label-text">${phase}</span><span class="phase-count">${topics.length}</span></div>`;
            for (const topic in langData[phase]) {
                html += `<button class="item-btn" data-phase="${phase}" id="btn-${topic.replace(/\s/g, '')}" onclick="loadTopic('${phase}', '${topic}')"><span class="topic-name">${topic}</span></button>`;
            }
        }
        document.getElementById('topic-list').innerHTML = html;
        document.getElementById('cheatsheet-btn').textContent = 'Cheatsheet';
        if (runBtn) runBtn.textContent = 'Run ▶';
        updateAISuggestions();
        if (Object.keys(langData).length > 0) {
            const firstPhase = Object.keys(langData)[0];
            const firstTopic = Object.keys(langData[firstPhase])[0];
            loadTopic(firstPhase, firstTopic);
        }
        return;
    }

    currentLevel = 'all';
    currentCompletionFilter = 'all';
    currentLang = lang;
    document.getElementById('app').className = lang + '-mode';
    const levelBar = document.getElementById('level-bar');
    document.getElementById('header-title').innerText = lang.toUpperCase();
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + lang);
    if (navBtn) navBtn.classList.add('active');

    const langData = courseData[lang] || {};
    const phases = Object.keys(langData);
    const totalPhases = phases.length;

    // Auto-assign difficulty based on phase position
    const third = Math.max(1, Math.ceil(totalPhases / 3));
    const phaseLevels = {};
    phases.forEach((phase, i) => {
        if (i < third) phaseLevels[phase] = 'beginner';
        else if (i < third * 2) phaseLevels[phase] = 'intermediate';
        else phaseLevels[phase] = 'expert';
    });

    if (levelBar) renderLevelBar();

    // Build topic list with collapsible phases, counts, badges
    let html = '';
    let idx = 0;
    for (const phase in langData) {
        const topics = Object.keys(langData[phase]);
        const count = topics.length;
        const phaseKey = phase.replace(/\s/g, '');
        const isCollapsed = collapsedPhases.has(phaseKey);
        let phaseDone = 0;
        for (const t of topics) {
            if (completedTopics.has(currentLang + ':' + t)) phaseDone++;
        }

        html += `<div class="phase-header ${isCollapsed ? 'collapsed' : ''}" data-phase="${phaseKey}" onclick="togglePhase('${phaseKey}','${phase.replace(/'/g, "\\'")}')">
            <span class="phase-toggle">${isCollapsed ? '▶' : '▼'}</span>
            <span class="phase-label-text">${phase}</span>
            <span class="phase-count">${phaseDone}/${count}</span>
        </div>`;

        const collapsedClass = isCollapsed ? ' phase-collapsed' : '';
        for (const topic in langData[phase]) {
            const delay = idx * 20;
            const level = phaseLevels[phase];
            const badges = getAutoTags(phase, topic).slice(0, 2).join(' ');
            html += `<button class="item-btn topic-btn-enter${collapsedClass}" style="animation-delay:${delay}ms" data-level="${level}" data-phase="${phaseKey}" id="btn-${topic.replace(/\s/g, '').replace(/[&,]/g, '')}" onclick="loadTopic('${phase.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')"><span class="diff-badge ${level}">${level[0].toUpperCase()}</span><span class="topic-name">${topic}</span></button>`;
            idx++;
        }
    }
    document.getElementById('topic-list').innerHTML = html;
    const searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.value = '';

    updateTopicDisplay();

    if (Object.keys(langData).length > 0) {
        const firstPhase = Object.keys(langData)[0];
        const firstTopic = Object.keys(langData[firstPhase])[0];
        loadTopic(firstPhase, firstTopic);
    }
    updateAISuggestions();
};

initHighlighting();
initLineNumbers();
loadProgress();

fetch(BACKEND_URL + '/api/execute', { method:'POST', headers:{'Content-Type':'application/json'}, body:'{"lang":"js","code":"1"}' })
    .catch(() => {
        const out = document.getElementById('output');
        const editor = document.getElementById('editor');
        const preview = editor ? getLogicalPreview(editor.value, currentLang) : null;
        if (preview) {
            out.innerText = preview;
        } else if (window.location.protocol === 'file:') {
            out.innerText = "// Open this via localhost:3000\n//   cd " + window.location.pathname.split('/').slice(0,-1).join('/') + "\n//   node server.js\n// Then refresh this page";
        } else {
            out.innerText = "// Backend not running. Start with:\n//   node server.js";
        }
    });

const origRunCodeForSuggestions = runCode;
runCode = function() {
    origRunCodeForSuggestions();
    setTimeout(() => {
        updateAISuggestions();
        const out = document.getElementById('output');
        if (out && (out.innerText.includes('Error:') || out.innerText.includes('ERROR') || out.innerText.includes('FAIL') || out.innerText.includes('SyntaxError') || out.innerText.includes('ReferenceError') || out.innerText.includes('TypeError'))) {
            const aiPanel = document.getElementById('aiPanel');
            if (aiPanel && !aiPanel.classList.contains('open')) {
                toggleAI();
            }
            const aiInput = document.getElementById('aiInput');
            if (aiInput && !aiInput.value.trim()) {
                aiInput.placeholder = 'I see an error — want help debugging? Type your question...';
            }
        }
    }, 800);
};

function explainCode() {
    const editor = document.getElementById('editor');
    const code = editor ? editor.value : '';
    if (!code.trim()) {
        document.getElementById('output').innerText = "// No code to explain — write some code in the editor first!";
        return;
    }

    const aiPanel = document.getElementById('aiPanel');
    if (!aiPanel.classList.contains('open')) toggleAI();

    const q = `Explain this code step by step:\n\n\`\`\`\n${code}\n\`\`\``;
    askAI(q);
}

// ── KEYBOARD SHORTCUTS ──
document.addEventListener('keydown', function(e) {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA';

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('output').innerText = '// Output cleared';
        return;
    }

    if (e.key === '/' && !inInput) {
        e.preventDefault();
        document.getElementById('topic-search').focus();
        return;
    }

    if (e.key === 'Escape') {
        const shortcuts = document.getElementById('shortcutsOverlay');
        if (shortcuts) { shortcuts.remove(); e.preventDefault(); return; }
        const aiPanel = document.getElementById('aiPanel');
        if (aiPanel.classList.contains('open')) { toggleAI(); e.preventDefault(); return; }
        const cheatsheet = document.getElementById('cheatsheetOverlay');
        if (cheatsheet.classList.contains('open')) { toggleCheatsheet(); e.preventDefault(); return; }
        return;
    }

    if (e.key === '?' && !inInput) {
        e.preventDefault();
        showShortcuts();
        return;
    }

    if ((e.key === 'n' || e.key === 'N') && !inInput) {
        e.preventDefault();
        navTopic(1);
        return;
    }

    if ((e.key === 'p' || e.key === 'P') && !inInput) {
        e.preventDefault();
        navTopic(-1);
        return;
    }
});

function showShortcuts() {
    let overlay = document.getElementById('shortcutsOverlay');
    if (overlay) { overlay.remove(); return; }
    overlay = document.createElement('div');
    overlay.id = 'shortcutsOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(4px);z-index:300;display:flex;justify-content:center;align-items:center;';
    overlay.onclick = function(e) { if (e.target === this) this.remove(); };
    overlay.innerHTML =
        '<div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:25px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:fadeIn 0.2s ease;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">' +
        '<span style="font-size:13px;font-weight:900;color:#f1f5f9;letter-spacing:1px;">⌨ SHORTCUTS</span>' +
        '<button onclick="document.getElementById(\'shortcutsOverlay\').remove()" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;">✕</button></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        '<div style="color:#64748b;font-size:11px;"><kbd style="background:#1e293b;color:#f1f5f9;padding:3px 8px;border-radius:4px;font-size:10px;">Ctrl+Enter</kbd></div><div style="color:#94a3b8;font-size:11px;">Run code</div>' +
        '<div style="color:#64748b;font-size:11px;"><kbd style="background:#1e293b;color:#f1f5f9;padding:3px 8px;border-radius:4px;font-size:10px;">/</kbd></div><div style="color:#94a3b8;font-size:11px;">Search topics</div>' +
        '<div style="color:#64748b;font-size:11px;"><kbd style="background:#1e293b;color:#f1f5f9;padding:3px 8px;border-radius:4px;font-size:10px;">n</kbd> / <kbd style="background:#1e293b;color:#f1f5f9;padding:3px 8px;border-radius:4px;font-size:10px;">p</kbd></div><div style="color:#94a3b8;font-size:11px;">Next / Previous topic</div>' +
        '<div style="color:#64748b;font-size:11px;"><kbd style="background:#1e293b;color:#f1f5f9;padding:3px 8px;border-radius:4px;font-size:10px;">Esc</kbd></div><div style="color:#94a3b8;font-size:11px;">Close panels</div>' +
        '<div style="color:#64748b;font-size:11px;"><kbd style="background:#1e293b;color:#f1f5f9;padding:3px 8px;border-radius:4px;font-size:10px;">?</kbd></div><div style="color:#94a3b8;font-size:11px;">Show this menu</div>' +
        '<div style="color:#64748b;font-size:11px;"><kbd style="background:#1e293b;color:#f1f5f9;padding:3px 8px;border-radius:4px;font-size:10px;">Ctrl+K</kbd></div><div style="color:#94a3b8;font-size:11px;">Clear output</div>' +
        '</div></div>';
    document.body.appendChild(overlay);
}

// ── TOPIC NAVIGATION ──
function getTopicList() {
    const langData = courseData[currentLang];
    if (!langData) return [];
    const topics = [];
    for (const phase in langData) {
        for (const topic in langData[phase]) {
            topics.push({ phase, topic });
        }
    }
    return topics;
}

function getCurrentTopicIndex() {
    const list = getTopicList();
    return list.findIndex(t => t.topic === currentTopic && t.phase === currentPhase);
}

function navTopic(dir) {
    const list = getTopicList();
    const idx = getCurrentTopicIndex();
    if (idx === -1) return;
    const next = idx + dir;
    if (next < 0 || next >= list.length) return;
    loadTopic(list[next].phase, list[next].topic);
}

// ── PROGRESS BAR ──
function updateProgressBar() {
    const langData = courseData[currentLang];
    if (!langData) return;
    const allTopics = getTopicList();
    if (allTopics.length === 0) return;
    let completed = 0;
    for (const t of allTopics) {
        if (completedTopics.has(currentLang + ':' + t.topic)) completed++;
    }
    const pct = Math.round((completed / allTopics.length) * 100);
    let bar = document.getElementById('progressBar');
    if (!bar) {
        const label = document.querySelector('.col:first-child label');
        if (!label) return;
        const container = document.createElement('div');
        container.id = 'progressBarContainer';
        container.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
        container.innerHTML =
            '<div id="progressBar" style="flex:1;height:4px;background:#1e293b;border-radius:2px;overflow:hidden;">' +
            '<div style="height:100%;width:0%;background:var(--accent);border-radius:2px;transition:width 0.4s ease;"></div></div>' +
            '<span id="progressText" style="font-size:9px;color:#64748b;font-weight:800;white-space:nowrap;">0%</span>';
        label.after(container);
        bar = document.getElementById('progressBar');
    }
    const fill = bar.querySelector('div');
    fill.style.width = pct + '%';
    document.getElementById('progressText').textContent = completed + '/' + allTopics.length + ' (' + pct + '%)';
}

// ── DIFFICULTY / AUTO-TAGS / DEPTH ──
function getAutoTags(phase, topic) {
    const tags = new Set();
    const phaseWords = phase.toLowerCase().split(/[\s,&;:()]+/).filter(w => w.length > 2);
    const topicWords = topic.toLowerCase().split(/[\s,&;:()]+/).filter(w => w.length > 2);
    phaseWords.forEach(w => tags.add(w));
    topicWords.forEach(w => tags.add(w));
    return [...tags];
}

function getTopicDepth(exp) {
    const len = (exp || '').length;
    if (len < 200) return { label: 'quick', icon: '⚡' };
    if (len < 500) return { label: 'standard', icon: '●' };
    return { label: 'in-depth', icon: '◉' };
}

// ── COLLAPSIBLE PHASES ──
function togglePhase(phaseKey, phaseName) {
    const header = document.querySelector(`.phase-header[data-phase="${phaseKey}"]`);
    if (!header) return;
    const isCollapsed = collapsedPhases.has(phaseKey);
    if (isCollapsed) {
        collapsedPhases.delete(phaseKey);
        header.classList.remove('collapsed');
        header.querySelector('.phase-toggle').textContent = '▼';
    } else {
        collapsedPhases.add(phaseKey);
        header.classList.add('collapsed');
        header.querySelector('.phase-toggle').textContent = '▶';
    }
    const items = document.querySelectorAll(`.item-btn[data-phase="${phaseKey}"]`);
    items.forEach(btn => {
        btn.classList.toggle('phase-collapsed', collapsedPhases.has(phaseKey));
    });
}

// ── COLLAPSE / EXPAND ALL ──
function collapseAllPhases() {
    document.querySelectorAll('.phase-header').forEach(h => {
        const key = h.dataset.phase;
        if (!key) return;
        collapsedPhases.add(key);
        h.classList.add('collapsed');
        const toggle = h.querySelector('.phase-toggle');
        if (toggle) toggle.textContent = '▶';
    });
    document.querySelectorAll('.item-btn[data-phase]').forEach(b => { b.classList.add('phase-collapsed'); });
}

function expandAllPhases() {
    document.querySelectorAll('.phase-header').forEach(h => {
        const key = h.dataset.phase;
        if (!key) return;
        collapsedPhases.delete(key);
        h.classList.remove('collapsed');
        const toggle = h.querySelector('.phase-toggle');
        if (toggle) toggle.textContent = '▼';
    });
    document.querySelectorAll('.item-btn[data-phase]').forEach(b => { b.classList.remove('phase-collapsed'); });
}

// ── COMPLETION FILTER ──
function setCompletionFilter(filter) {
    currentCompletionFilter = filter;
    const levelBar = document.getElementById('level-bar');
    if (levelBar) {
        levelBar.querySelectorAll('.level-btn').forEach(btn => {
            if (btn.textContent.toLowerCase() === filter || (filter === 'uncompleted' && btn.textContent === 'Todo') || (filter === 'completed' && btn.textContent === 'Done') || (filter === 'all' && btn.textContent === 'All')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    const searchInput = document.getElementById('topic-search');
    filterTopics(searchInput ? searchInput.value : '');
}

// ── SEARCH EXPLANATIONS + EMPTY STATE + COMPLETION FILTER ──
function filterTopics(query) {
    const q = query ? query.toLowerCase().trim() : '';
    let visible = 0;
    let total = 0;
    const langData = courseData[currentLang];

    document.querySelectorAll('.item-btn').forEach(btn => {
        total++;
        const topicName = btn.textContent.replace(/^[★☆]\s*/, '').trim();

        let matchesSearch = !q;
        if (q) {
            matchesSearch = topicName.toLowerCase().includes(q);
            if (!matchesSearch && langData) {
                for (const phase in langData) {
                    for (const topic in langData[phase]) {
                        if (topic === topicName) {
                            const exp = (langData[phase][topic].exp || '').toLowerCase();
                            if (exp.includes(q)) matchesSearch = true;
                            break;
                        }
                    }
                }
            }
        }

        const matchesLevel = currentLevel === 'all' || (btn.dataset.level || 'beginner') === currentLevel;

        let matchesCompletion = true;
        if (currentCompletionFilter !== 'all') {
            const isDone = completedTopics.has(currentLang + ':' + topicName);
            matchesCompletion = currentCompletionFilter === 'completed' ? isDone : !isDone;
        }

        const show = matchesSearch && matchesLevel && matchesCompletion;
        btn.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    const container = document.getElementById('topic-list');
    const children = container.children;

    // Handle phase headers visibility (for non-collapsible phases that still have phase-label class)
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (!el.classList.contains('phase-header')) continue;
        const phaseKey = el.dataset.phase;
        let hasVisible = false;
        for (let j = i + 1; j < children.length; j++) {
            if (children[j].classList.contains('phase-header')) break;
            if (children[j].style.display !== 'none') { hasVisible = true; break; }
        }
        el.style.display = hasVisible ? '' : 'none';
    }

    // Search count
    let countEl = document.getElementById('searchCount');
    if (visible < total) {
        if (!countEl) {
            countEl = document.createElement('div');
            countEl.id = 'searchCount';
            countEl.style.cssText = 'font-size:9px;color:#64748b;margin-bottom:6px;font-weight:700;';
            document.getElementById('topic-search').after(countEl);
        }
        countEl.textContent = visible + ' of ' + total + ' topics';
        if (currentLevel !== 'all') countEl.textContent += ' (' + currentLevel + ')';
        if (currentCompletionFilter !== 'all') countEl.textContent += ' (' + currentCompletionFilter + ')';
        countEl.style.display = visible === 0 ? '' : '';
    } else if (countEl) {
        countEl.style.display = 'none';
    }

    // Empty state
    let emptyEl = document.getElementById('emptyState');
    if (visible === 0) {
        let reason = '';
        if (q) reason = ' matching "' + query + '"';
        else if (currentLevel !== 'all') reason = ' at ' + currentLevel + ' level';
        else if (currentCompletionFilter !== 'all') reason = ' that are ' + currentCompletionFilter;
        const msg = '✨ No topics' + reason;
        if (!emptyEl) {
            emptyEl = document.createElement('div');
            emptyEl.id = 'emptyState';
            emptyEl.style.cssText = 'color:#64748b;font-size:11px;padding:30px 10px;text-align:center;line-height:1.6;';
            container.appendChild(emptyEl);
        }
        emptyEl.textContent = msg;
        emptyEl.style.display = '';
    } else if (emptyEl) {
        emptyEl.style.display = 'none';
    }

    // Scroll topic list to top if filtering is active
    if (q || currentLevel !== 'all' || currentCompletionFilter !== 'all') {
        const listEl = document.getElementById('topic-list');
        if (listEl) listEl.scrollTop = 0;
    }

    // Highlight matching text in topic names
    document.querySelectorAll('.item-btn .topic-name').forEach(el => {
        el.innerHTML = el.textContent;
    });
    if (q) {
        const visSelector = '.item-btn:not([style*="display: none"]) .topic-name';
        document.querySelectorAll(visSelector).forEach(el => {
            const text = el.textContent;
            const idx = text.toLowerCase().indexOf(q);
            if (idx === -1) return;
            const before = text.slice(0, idx);
            const match = text.slice(idx, idx + q.length);
            const after = text.slice(idx + q.length);
            el.innerHTML = `${before}<mark style="background:rgba(247,223,30,0.25);color:#f7df1e;border-radius:2px;font-weight:700;">${match}</mark>${after}`;
        });
    }
}

// ── PROGRESS NUDGE ──
function suggestNextTopic() {
    if (currentCompletionFilter === 'completed') return;
    const langData = courseData[currentLang];
    if (!langData) return;
    const topics = getTopicList();
    const idx = getCurrentTopicIndex();
    if (idx === -1) return;

    // Find next uncompleted topic
    for (let i = idx + 1; i < topics.length; i++) {
        const key = currentLang + ':' + topics[i].topic;
        if (!completedTopics.has(key)) {
            const nudgeEl = document.getElementById('topicNudge');
            if (nudgeEl) nudgeEl.remove();

            const nudge = document.createElement('div');
            nudge.id = 'topicNudge';
            nudge.style.cssText = 'font-size:10px;color:#94a3b8;padding:6px 10px;margin-top:6px;background:#1e293b;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:6px;border:1px solid #334155;';
            nudge.innerHTML = '<span style="color:var(--accent);">→</span> Next: <strong>' + topics[i].topic + '</strong>';
            nudge.onclick = function() { loadTopic(topics[i].phase, topics[i].topic); };
            const output = document.getElementById('output');
            if (output && output.parentNode) {
                output.parentNode.appendChild(nudge);
            }
            return;
        }
    }

    // All done
    const existing = document.getElementById('topicNudge');
    if (existing) existing.remove();
    const nudge = document.createElement('div');
    nudge.id = 'topicNudge';
    nudge.style.cssText = 'font-size:10px;color:#10b981;padding:6px 10px;margin-top:6px;background:rgba(16,185,129,0.1);border-radius:6px;display:flex;align-items:center;gap:6px;border:1px solid rgba(16,185,129,0.3);';
    nudge.innerHTML = '✓ All topics completed! Try the Code Lab or Quiz.';
    const output = document.getElementById('output');
    if (output && output.parentNode) {
        output.parentNode.appendChild(nudge);
    }
}

// ── EDITOR LINE NUMBERS ──
let lineNumbersEl = null;

function initLineNumbers() {
    const wrapper = document.querySelector('.editor-wrapper');
    if (!wrapper) return;
    if (wrapper.querySelector('.editor-lines')) return;

    lineNumbersEl = document.createElement('div');
    lineNumbersEl.className = 'editor-lines';
    lineNumbersEl.style.cssText = 'position:absolute;top:0;left:0;width:36px;height:100%;padding:15px 4px;font-family:Consolas,monospace;font-size:13px;line-height:1.6;color:#475569;overflow:hidden;text-align:right;z-index:3;pointer-events:none;box-sizing:border-box;user-select:none;';
    wrapper.insertBefore(lineNumbersEl, wrapper.firstChild);

    const textarea = document.getElementById('editor');
    textarea.addEventListener('input', updateLineNumbers);
    textarea.addEventListener('scroll', syncLineNumbersScroll);
    textarea.addEventListener('keydown', updateLineNumbers);
    updateLineNumbers();

    // Adjust editor padding for line numbers
    textarea.style.paddingLeft = '50px';
    const hl = wrapper.querySelector('.editor-highlight');
    if (hl) hl.style.paddingLeft = '50px';
}

function updateLineNumbers() {
    if (!lineNumbersEl) return;
    const textarea = document.getElementById('editor');
    const lines = textarea.value.split('\n').length;
    const nums = [];
    for (let i = 1; i <= lines; i++) {
        nums.push('<span>' + i + '</span>');
    }
    lineNumbersEl.innerHTML = nums.join('\n');
}

function syncLineNumbersScroll() {
    if (!lineNumbersEl) return;
    const textarea = document.getElementById('editor');
    lineNumbersEl.scrollTop = textarea.scrollTop;
}

setMode('js');
