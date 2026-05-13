let currentLang = 'js';
let currentPhase = '';
let currentTopic = '';
let currentLevel = 'all';



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
    if (btn) btn.classList.add('active-topic');

    const expEl = document.getElementById('explanation');
    expEl.innerHTML = `<h3 style="margin:0; color:#fff">${topic}</h3><p style="color:#94a3b8; font-size:11px; margin-bottom:10px;">${phase}</p>${item.exp}`;
    expEl.classList.remove('fade-in');
    void expEl.offsetWidth;
    expEl.classList.add('fade-in');
    
    document.getElementById('editor').value = item.code;
    updateHighlight();
    document.getElementById('output').innerText = "// Ready to practice: " + topic + " — click the cheatsheet button for reference";
}

function filterTopics(query) {
    const q = query ? query.toLowerCase().trim() : '';
    document.querySelectorAll('.item-btn').forEach(btn => {
        const matchesSearch = !q || btn.textContent.toLowerCase().includes(q);
        const matchesLevel = currentLevel === 'all' || (btn.dataset.level || 'beginner') === currentLevel;
        btn.style.display = matchesSearch && matchesLevel ? '' : 'none';
    });
    const container = document.getElementById('topic-list');
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (!el.classList.contains('phase-label')) continue;
        let hasVisible = false;
        for (let j = i + 1; j < children.length; j++) {
            if (children[j].classList.contains('phase-label')) break;
            if (children[j].style.display !== 'none') { hasVisible = true; break; }
        }
        el.style.display = hasVisible ? '' : 'none';
    }
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
    document.getElementById('cheatsheetOverlay').classList.toggle('open');
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

function runCode() {
    const out = document.getElementById('output');
    const code = document.getElementById('editor').value;
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
        return;
    }

    fetch(BACKEND_URL + '/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: currentLang, code })
    })
    .then(r => r.json())
    .then(d => { out.innerText = d.output; })
    .catch(e => {
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

function toggleAI() {
    document.getElementById('aiPanel').classList.toggle('open');
    document.getElementById('aiToggle').classList.toggle('open');
}

const aiResponses = {
    "variable": "Variables store data values. Use `let` (mutable) or `const` (immutable) in JS, `var` in Go, or just `name = value` in Python. Each language has its own convention.",
    "function": "Functions are reusable blocks of code. Define with `function name(){}` in JS, `def name():` in Python, `func name(){}` in Go, or `fn name(){}` in Zig.",
    "loop": "Loops repeat code. `for` is universal. JS/Python/Go all have `for`; C# adds `foreach`; Python has `while`. Use `break` to exit, `continue` to skip iteration.",
    "array": "Arrays hold ordered collections. JS: `[]`, Python: `list`, Go: `[]type`, Rust: `Vec`, Zig: `[]T`. Indexing starts at 0.",
    "class": "Classes are blueprints for objects. JS/C#/Python/TS use `class`. Go uses structs+methods. Zig uses structs with no inheritance.",
    "error": "Error handling differs: JS/Python use try/catch, Go returns errors as values, Rust uses Result/Option, Zig uses error unions.",
    "git": "Git tracks changes. Basic flow: `git add` → `git commit` → `git push`. Use branches (`git branch`) to isolate work, `git merge` to combine.",
    "async": "Async code runs without blocking. JS: async/await + Promises. Python: async/await + asyncio. C#: async/await + Task. Go: goroutines + channels.",
    "type": "Types define data kinds. TS/C#/Go/Zig are statically typed. JS/Python are dynamically typed. Static types catch errors at compile time.",
    "string": "Strings are text data. Use quotes: `'text'` or `\"text\"` in most langs. Template literals (`\\`text ${var}\\``) in JS. f-strings (`f\"{var}\"`) in Python.",
    "default": "Here's a general tip: The best way to learn programming is to write code every day. Practice the topics in the curriculum, experiment in the editor, and don't be afraid to break things!"
};

function getAIResponse(input) {
    const q = input.toLowerCase();
    for (const key of Object.keys(aiResponses)) {
        if (q.includes(key)) return aiResponses[key];
    }
    if (q.includes("how") || q.includes("what") || q.includes("why")) {
        return `Good question about **${currentLang.toUpperCase()}**! Try exploring the curriculum topics on the left for detailed explanations with code examples.`;
    }
    if (q.includes("help") || q.includes("hello") || q.includes("hi")) {
        return `Hello! I'm your AI assistant for **${currentLang.toUpperCase()}**. Ask me about variables, functions, loops, classes, or pick a suggestion below.`;
    }
    return aiResponses.default;
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
        return `<b>${best.topic}</b> — ${best.phase}<br><br>${best.exp || ''}<br><br><pre style="background:#000;color:#a5f3fc;padding:12px;border-radius:6px;font-size:11px;line-height:1.5;overflow-x:auto;margin:0;">${best.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
    }
    return null;
}

const suggestionSets = {
    js: ["What is a closure?", "Explain async/await", "Array methods", "Promise syntax", "this keyword"],
    ts: ["Types vs interfaces", "What are generics?", "Utility types", "Enum usage", "Type guards"],
    py: ["List comprehensions", "What are decorators?", "Why __init__?", "args and kwargs", "pip basics"],
    go: ["Goroutines vs threads", "What are interfaces?", "Defer usage", "Error handling", "Slice vs array"],
    zig: ["What is comptime?", "Memory allocators", "Error union types", "Zig vs C", "Build system"],
    pg: ["JOIN types", "Window functions", "Index strategies", "CTE vs subquery", "ACID explained"],
    dk: ["Docker vs VM", "Multi-stage builds", "Volume vs bind", "Compose networks", "Health checks"],
    cs: ["LINQ queries", "Async/await in C#", "Record vs class", "What is .NET?", "Extension methods"],
    git: ["Undo last commit", "Merge vs rebase", "Fix merge conflict", "What is HEAD?", "Git stash"],
    kt: ["Null safety explained", "Data classes", "Extension functions", "Coroutines basics", "Scope functions"],
    rs: ["Ownership explained", "Borrowing rules", "Traits vs generics", "Lifetimes", "Pattern matching"],
    swift: ["Optionals explained", "Protocols vs classes", "ARC memory management", "Closures capture", "Property wrappers"],
    oop: ["What is inheritance?", "Polymorphism explained", "Encapsulation", "Abstract vs interface", "Composition vs inheritance"]
};

function updateAISuggestions() {
    const el = document.getElementById('aiSuggestions');
    const suggestions = suggestionSets[currentLang] || suggestionSets.js;
    el.innerHTML = suggestions.map(s => `<button onclick="askAI('${s}')">${s}</button>`).join('');
}

function addAIMessage(text, role) {
    const el = document.getElementById('aiMessages');
    const div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    if (role === 'bot') {
        div.innerHTML = `<div class="label">AI</div>${text}`;
    } else {
        div.textContent = text;
    }
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
}

function askAI(q) {
    addAIMessage(q, 'user');
    const localReply = getLocalAIResponse(q);
    if (localReply) {
        setTimeout(() => addAIMessage(localReply, 'bot'), 200);
        return;
    }
    fetch(BACKEND_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, lang: currentLang })
    })
    .then(r => r.json())
    .then(d => addAIMessage(d.reply || getAIResponse(q), 'bot'))
    .catch(() => setTimeout(() => addAIMessage(getAIResponse(q), 'bot'), 300));
}

function sendAI() {
    const input = document.getElementById('aiInput');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    askAI(q);
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
        schemaAddTable();
        schemaAddTable();
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
            if (c.fk && c.fk.table === id) c.fk = null;
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

function schemaRender() {
    if (schemaAbortController) schemaAbortController.abort();
    schemaAbortController = new AbortController();
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
    defs.innerHTML = '<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f59e0b"/></marker>';
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
            const isFKTarget = schemaTables.some(t => t.cols.some(c => c.fk && c.fk.table === table.id && c.fk.col === col.name));
            html += `<div class="st-row ${isFKTarget ? 'fk-highlight' : ''}" data-table-id="${table.id}" data-col-idx="${i}">
                <span class="st-pk schema-fk-handle" title="${col.fk ? `FK→${col.fk.table}.${col.fk.col}` : 'Drag to link FK'}">${pkBadge || (fkBadge ? 'FK' : '')}</span>
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
}

let schemaFKDragSource = null;

function schemaDrawRelationLines() {
    const svg = document.getElementById('schemaLineLayer');
    if (!svg) return;
    const oldGroup = svg.querySelector('g');
    if (oldGroup) oldGroup.remove();
    const canvas = document.getElementById('schemaCanvas');
    const canvasRect = canvas.getBoundingClientRect();
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.pointerEvents = 'none';

    for (const table of schemaTables) {
        for (const col of table.cols) {
            if (!col.fk) continue;
            const targetTable = schemaTables.find(t => t.id === col.fk.table);
            if (!targetTable) continue;
            const srcEl = canvas.querySelector(`[data-table-id="${table.id}"]`);
            const tgtEl = canvas.querySelector(`[data-table-id="${targetTable.id}"]`);
            if (!srcEl || !tgtEl) continue;
            const sr = srcEl.getBoundingClientRect();
            const tr = tgtEl.getBoundingClientRect();
            const x1 = sr.right - canvasRect.left;
            const y1 = sr.top + sr.height / 2 - canvasRect.top;
            const x2 = tr.left - canvasRect.left;
            const y2 = tr.top + tr.height / 2 - canvasRect.top;
            const midX = (x1 + x2) / 2;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`);
            path.setAttribute('stroke', '#f59e0b');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-dasharray', '6,3');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            group.appendChild(path);
        }
    }
    svg.appendChild(group);
}

document.addEventListener('mousedown', function(e) {
    const handle = e.target.closest('.schema-fk-handle');
    if (!handle) return;
    if (!document.getElementById('schemaDesigner').classList.contains('open')) return;
    e.preventDefault();
    e.stopPropagation();
    const row = handle.closest('[data-table-id]');
    if (!row) return;
    const tableId = parseInt(row.dataset.tableId);
    const colIdx = parseInt(row.dataset.colIdx);
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const col = table.cols[colIdx];
    if (!col) return;

    if (col.fk) {
        col.fk = null;
        schemaRender();
        return;
    }

    const canvas = document.getElementById('schemaCanvas');
    const svg = document.getElementById('schemaLineLayer');
    const cr = canvas.getBoundingClientRect();
    const hr = handle.getBoundingClientRect();
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', '#f59e0b');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,3');
    svg.appendChild(line);

    const startX = hr.left + hr.width / 2 - cr.left;
    const startY = hr.top + hr.height / 2 - cr.top;
    schemaFKDragSource = { tableId, colIdx, line, startX, startY };

    const onMove = function(ev) {
        if (!schemaFKDragSource) return;
        const r = canvas.getBoundingClientRect();
        schemaFKDragSource.line.setAttribute('x1', schemaFKDragSource.startX);
        schemaFKDragSource.line.setAttribute('y1', schemaFKDragSource.startY);
        schemaFKDragSource.line.setAttribute('x2', ev.clientX - r.left);
        schemaFKDragSource.line.setAttribute('y2', ev.clientY - r.top);
    };

    const onUp = function(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (!schemaFKDragSource) return;
        if (schemaFKDragSource.line.parentNode) {
            schemaFKDragSource.line.parentNode.removeChild(schemaFKDragSource.line);
        }
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const targetRow = target ? target.closest('[data-table-id]') : null;
        if (targetRow) {
            const tTableId = parseInt(targetRow.dataset.tableId);
            const tColIdx = parseInt(targetRow.dataset.colIdx);
            if (tTableId !== undefined && tColIdx !== undefined && tTableId !== schemaFKDragSource.tableId) {
                const tTable = schemaTables.find(t => t.id === tTableId);
                if (tTable && tTable.cols[tColIdx]) {
                    const sourceCol = schemaTables.find(t => t.id === schemaFKDragSource.tableId).cols[schemaFKDragSource.colIdx];
                    sourceCol.fk = { table: tTable.name, col: tTable.cols[tColIdx].name };
                }
            }
        }
        schemaFKDragSource = null;
        schemaRender();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
});

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
                constraints.push(`    FOREIGN KEY (${c.name}) REFERENCES ${c.fk.table}(${c.fk.col})`);
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
        const names = { js:'JS', py:'Python', go:'Go', ts:'TS' };
        const active = l === challengeLang ? 'active' : '';
        html += `<button class="challenge-lang-btn ${active}" onclick="switchChallengeLang('${l}')">${names[l]}</button>`;
    }
    html += `</div>`;
    
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
        testChallenge();
        return;
    }
    origRunCode();
};

function testChallenge() {
    const challenges = challengeData[challengeLang] || [];
    const ch = challenges[challengeIdx];
    if (!ch) { document.getElementById('output').innerText = '// No challenge selected'; return; }
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
    updateTopicDisplay();
}

function updateTopicDisplay() {
    document.querySelectorAll('.item-btn').forEach(btn => {
        const raw = btn.getAttribute('data-topic') || btn.textContent.replace(/^[★☆]\s*/, '').trim();
        btn.setAttribute('data-topic', raw);
        const isDone = completedTopics.has(currentLang + ':' + raw);
        btn.innerHTML = `<span class="topic-star" data-topic="${raw.replace(/"/g, '&quot;')}">${isDone ? '★' : '☆'}</span> ${raw}`;
        btn.classList.toggle('topic-done', isDone);
        const star = btn.querySelector('.topic-star');
        if (star) star.onclick = function(e) { e.stopPropagation(); toggleProgress(raw); };
    });
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

setMode = function(lang) {
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('editor').style.display = 'block';
    document.getElementById('cheatsheet-btn').textContent = lang === 'challenge' ? 'Reveal Answer' : 'Cheatsheet';
    if (lang === 'quiz') { document.getElementById('level-bar').style.display = 'none'; initQuiz(); updateAISuggestions(); return; }
    if (lang === 'challenge') { initChallenge(); updateAISuggestions(); return; }
    if (lang === 'oop') { document.getElementById('level-bar').style.display = 'none'; initOOPSession(); updateAISuggestions(); return; }

    currentLevel = 'all';
    currentLang = lang;
    document.getElementById('app').className = lang + '-mode';
    document.getElementById('level-bar').style.display = 'none';
    document.getElementById('header-title').innerText = lang.toUpperCase();
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + lang);
    if (navBtn) navBtn.classList.add('active');

    const langData = courseData[lang] || {};
    let html = '';
    let idx = 0;
    for (const phase in langData) {
        html += `<span class="phase-label">${phase}</span>`;
        for (const topic in langData[phase]) {
            const delay = idx * 20;
            const level = langData[phase][topic].level || 'beginner';
            html += `<button class="item-btn topic-btn-enter" style="animation-delay:${delay}ms" data-level="${level}" id="btn-${topic.replace(/\s/g, '').replace(/[&,]/g, '')}" onclick="loadTopic('${phase.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')">${topic}</button>`;
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
loadProgress();

fetch(BACKEND_URL + '/api/execute', { method:'POST', headers:{'Content-Type':'application/json'}, body:'{"lang":"js","code":"1"}' })
    .catch(() => {
        const out = document.getElementById('output');
        if (window.location.protocol === 'file:') {
            out.innerText = "// Open this via localhost:3000\n//   cd " + window.location.pathname.split('/').slice(0,-1).join('/') + "\n//   node server.js\n// Then refresh this page";
        } else {
            out.innerText = "// Backend not running. Start with:\n//   node server.js";
        }
    });

setMode('js');
