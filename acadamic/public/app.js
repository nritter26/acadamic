// Import from langConfig for consistency
let currentLang = 'js';
let currentPhase = '';
let currentTopic = '';
let currentLevel = 'all';
let currentCompletionFilter = 'all';
let currentEngineFilter = 'all';
let currentMobilePlatform = 'all';
let collapsedPhases = new Set();

// LANG_NAMES defined here for browser use (langConfig.js loaded separately for Node.js exports)
var LANG_NAMES = {
    js: 'javascript', ts: 'typescript', py: 'python', go: 'go', java: 'java',
    rs: 'rust', c: 'c', cpp: 'c++', cs: 'c#', kt: 'kotlin',
    swift: 'swift', zig: 'zig', dk: 'docker', pg: 'postgresql', mobile: 'mobile', backend: 'backend',
    mongodb: 'mongodb', git: 'git', gamedev: 'gamedev',
    mysql: 'mysql', sqlite: 'sqlite', firebase: 'firebase',
    cloud: 'cloud', aws: 'aws', azure: 'azure', gcp: 'gcp',
    react: 'react', vue: 'vue', angular: 'angular', node: 'nodejs',
    express: 'express', next: 'nextjs', svelte: 'svelte', tailwind: 'tailwindcss',
    redis: 'redis', nuxt: 'nuxt', sveltekit: 'sveltekit', remix: 'remix',
    vite: 'vite', webpack: 'webpack', graphql: 'graphql', prisma: 'prisma',
    rnative: 'reactnative', flutter: 'flutter', cypress: 'cypress',
    playwright: 'playwright', k8s: 'kubernetes', terraform: 'terraform',
    bootstrap: 'bootstrap', django: 'django', flask: 'flask',
    fastapi: 'fastapi', spring: 'spring',
};
var NAME_TO_LANG = {};
for (const [code, name] of Object.entries(LANG_NAMES)) {
    NAME_TO_LANG[name] = code;
}

function normalizeCourseData() {
    for (const lang of Object.keys(courseData)) {
        const langData = courseData[lang];
        if (!langData || typeof langData !== 'object') continue;
        for (const phase of Object.keys(langData)) {
            const phaseData = langData[phase];
            if (!phaseData || typeof phaseData !== 'object') continue;
            for (const topic of Object.keys(phaseData)) {
                const item = phaseData[topic];
                if (Array.isArray(item)) {
                    phaseData[topic] = {
                        exp: item[0],
                        code: item[1],
                        ...(item.length > 2 && { prereq: item[2] }),
                    };
                }
            }
        }
    }
}
normalizeCourseData();

const LANG_TO_FILE = {
    rs: 'rust',
};
const LOADING_LANGS = new Set();

function loadLangData(lang, callback) {
    if (courseData[lang]) {
        if (callback) callback();
        return true;
    }
    if (LOADING_LANGS.has(lang)) {
        return false;
    }
    LOADING_LANGS.add(lang);
    const filename = (LANG_TO_FILE[lang] || lang) + '.json';
    fetch('content/' + filename)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
            courseData[lang] = data;
            LOADING_LANGS.delete(lang);
            normalizeCourseData();
            if (callback) callback();
        })
        .catch(function (err) {
            LOADING_LANGS.delete(lang);
            console.error('Failed to load data for', lang + ':', err);
            if (callback) callback();
        });
    return false;
}

function detectLanguageInQuery(q) {
    const words = q.toLowerCase().split(/\s+/);
    for (const word of words) {
        for (const [code, name] of Object.entries(LANG_NAMES)) {
            if (word === name || word === code) return code;
        }
        if (word === 'sql') return 'pg';
    }
    return null;
}

function getLanguageIntro(langCode) {
    const data = courseData[langCode];
    if (!data) return null;
    // Pick the first topic from the first phase
    const phases = Object.keys(data);
    if (!phases.length) return null;
    const firstPhase = phases[0];
    const topics = Object.keys(data[firstPhase]);
    if (!topics.length) return null;
    const topic = topics[0];
    const item = data[firstPhase][topic];
    const displayName = LANG_NAMES[langCode] || langCode.toUpperCase();
    return {
        topic,
        phase: firstPhase,
        exp: item.exp || '',
        code: item.code || '',
        displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    };
}



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
    if (item.prereq) {
        const parts = item.prereq.split('::');
        if (parts.length === 2) {
            const [prereqPhase, prereqTopic] = parts;
            const prereqData = langData[prereqPhase] && langData[prereqPhase][prereqTopic];
            if (prereqData) {
                expEl.innerHTML = `<div class="prereq-banner">📚 Prerequisite: <a href="#" onclick="loadTopic('${prereqPhase.replace(/'/g, "\\'")}', '${prereqTopic.replace(/'/g, "\\'")}'); return false;">${prereqTopic}</a></div>` + expEl.innerHTML;
            }
        }
    }
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

function renderEngineBar() {
    const engineBarEl = document.getElementById('engine-bar');
    const engines = [
        { id: 'all', label: 'All Engines' },
        { id: 'godot', label: 'Godot' },
        { id: 'unity', label: 'Unity' },
        { id: 'unreal', label: 'Unreal' },
    ];
    let html = '';
    for (const e of engines) {
        const active = e.id === currentEngineFilter ? ' active' : '';
        html += `<button class="engine-btn${active}" onclick="setEngineFilter('${e.id}')">${e.label}</button>`;
    }
    engineBarEl.innerHTML = html;
    engineBarEl.style.display = 'flex';
}

function setEngineFilter(engine) {
    currentEngineFilter = engine;
    renderEngineBar();
    const searchInput = document.getElementById('topic-search');
    filterTopics(searchInput ? searchInput.value : '');
}

function renderPlatformBar() {
    const bar = document.getElementById('platform-bar');
    const platforms = [
        { id: 'android', label: 'Android' },
        { id: 'ios', label: 'iOS' },
    ];
    let html = '';
    for (const p of platforms) {
        const active = p.id === currentMobilePlatform ? ' active' : '';
        html += `<button class="platform-btn${active}" data-platform="${p.id}" onclick="setPlatform('${p.id}')">${p.label}</button>`;
    }
    bar.innerHTML = html;
    bar.style.display = 'flex';
}

function setPlatform(platform) {
    currentMobilePlatform = platform;
    renderPlatformBar();
    loadLangIntro(platform);
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

    const csData = cheatsheets && cheatsheets[currentLang];
    if (csData && Object.keys(csData).length > 0) {
        let html = '';
        let idx = 0;
        for (const section of Object.keys(csData)) {
            const snippets = csData[section];
            html += `<div class="cs-section">`;
            html += `<div class="cs-section-title">${section}</div>`;
            for (const code of snippets) {
                const codeHtml = code
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
                    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await|new|this|typeof|throw|try|catch|switch|case|break|continue|true|false|null|undefined)\b/g, '<span class="keyword">$1</span>');
                html += `<div class="cs-code">${codeHtml}</div>`;
                idx++;
            }
            html += `</div>`;
        }
        document.getElementById('cheatsheetTitle').textContent = `${currentLang.toUpperCase()} Cheatsheet (${idx} snippets)`;
        document.getElementById('cheatsheetBody').innerHTML = html;
        toggleCheatsheet();
        return;
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
            html += `<div class="cs-code">${codeHtml}</div>`;
            idx++;
        }
        html += `</div>`;
    }

    document.getElementById('cheatsheetTitle').textContent = `${currentLang.toUpperCase()} Cheatsheet (${idx} snippets)`;
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
    if (currentLang === 'git') {
        out.innerText = processGitCommand(code);
        return;
    }
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
            sqlite: 'SQLite is built-in, just click Run!',
            pg: 'psql -f query.sql', mysql: 'mysql < query.sql',
            dk: 'docker build -t myapp . && docker run myapp',
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

let lastCodeRun = '';
let lastCodeOutput = '';
let convSubject = '';
let convLang = '';

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
        el.innerHTML = `<div class="ai-msg bot"><div class="label">Devin</div>Hi! I'm your coding assistant. Ask me anything about programming, or pick a suggestion below.</div>`;
    }
    updateAISuggestions();
}

function toggleAI() {
    const panel = document.getElementById('aiPanel');
    const wasOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    document.getElementById('aiToggle').classList.toggle('open');
    if (!wasOpen) { loadChatHistory(); setTimeout(() => document.getElementById('aiInput').focus(), 100); }
    if (wasOpen) setTimeout(() => document.getElementById('editor').focus(), 50);
}

let aiCodeId = 0;
function formatAIText(text) {
    let displayText = text;
    if (text && text.includes('**')) {
        displayText = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    }
    displayText = displayText.replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (match, lang, code) => {
        const id = 'ai-code-' + (++aiCodeId);
        const safeCode = code.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        setTimeout(() => {
            const btn = document.getElementById(id);
            if (btn) btn.dataset.code = safeCode;
        }, 0);
        return `<div class="ai-code-wrapper"><pre class="ai-code-block"><code>${code}</code></pre><button class="ai-run-code" id="${id}">Run</button></div>`;
    });
    displayText = displayText.replace(/\`([^`]+)\`/g, '<code>$1</code>');
    displayText = displayText.replace(/\n/g, '<br>');
    return displayText;
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.ai-run-code');
    if (btn && btn.dataset.code !== undefined) {
        runCodeFromAI(btn.dataset.code);
    }
});

function addAIMessage(text, role, skipSave) {
    const el = document.getElementById('aiMessages');
    const div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    if (role === 'bot') {
        div.innerHTML = `<div class="label">Devin</div>${formatAIText(text)}`;
    } else if (role === 'user') {
        div.textContent = text;
    }
    if (role === 'typing') {
        div.id = 'aiTyping';
        div.innerHTML = '<div class="label">Devin</div><span class="typing-dots">● ● ●</span>';
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

// ── Streaming Bot Message ──
let streamingMsgEl = null;
let streamingFullText = '';

function createStreamingBotMessage() {
    removeTypingIndicator();
    const el = document.getElementById('aiMessages');
    const div = document.createElement('div');
    div.className = 'ai-msg bot streaming';
    div.innerHTML = '<div class="label">Devin</div><span class="streaming-content"></span><span class="streaming-cursor">▊</span>';
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    streamingMsgEl = div;
    streamingFullText = '';
    return div;
}

function updateStreamingContent(text) {
    streamingFullText = text;
    if (!streamingMsgEl) return;
    const content = streamingMsgEl.querySelector('.streaming-content');
    if (content) {
        content.innerHTML = formatAIText(text);
    }
    const el = document.getElementById('aiMessages');
    el.scrollTop = el.scrollHeight;
}

function finalizeStreamingBotMessage(text) {
    if (!streamingMsgEl) return;
    streamingMsgEl.classList.remove('streaming');
    const cursor = streamingMsgEl.querySelector('.streaming-cursor');
    if (cursor) cursor.remove();
    const content = streamingMsgEl.querySelector('.streaming-content');
    if (content) {
        content.innerHTML = formatAIText(text);
    }
    streamingFullText = text;
    conversationHistory.push({ role: 'bot', text });
    if (conversationHistory.length > MAX_HISTORY) conversationHistory.shift();
    saveChatHistory();
    streamingMsgEl = null;
    updateAISuggestions();
}

function runCodeFromAI(code) {
    const editor = document.getElementById('editor');
    if (editor) {
        editor.value = code;
        updateHighlight();
        runCode();
    }
}

function isErrorQuery(q) {
    return /why|error|fix|bug|wrong|not working|issue|debug/.test(q);
}

const PRONOUN_PATTERN = /^(what|how|why|where|when|who|which|can|could|would|will|do|does|did|is|are|was|were)\s+(is|are|was|were|does|do|did|can|could|would|will|about|the|a|an|it|this|that|they|these|those|its|their|them)\b/i;
const PRONOUN_WORDS = /\b(it|this|that|they|them|these|those|its|their)\b/i;

function extractSubject(text) {
    if (!text) return '';
    const langMatch = text.match(/\*\*([A-Z][a-z+#]+)\*\*/);
    if (langMatch) {
        const name = langMatch[1].toLowerCase();
        for (const [, display] of Object.entries(LANG_NAMES)) {
            if (name === display) return langMatch[1];
        }
    }
    const topicMatch = text.match(/\*\*([^*]+)\*\*/);
    if (topicMatch) return topicMatch[1];
    return currentTopic || '';
}

function resolveFollowUp(q) {
    if (!convSubject) return q;
    const trimmed = q.trim();
    if (PRONOUN_PATTERN.test(trimmed) || PRONOUN_WORDS.test(trimmed)) {
        return `${convSubject} ${trimmed}`;
    }
    return q;
}

function extractConversationSubject(response) {
    if (!response) return;
    const subj = extractSubject(response);
    if (subj) {
        convSubject = subj;
        const code = detectLanguageInQuery(subj.toLowerCase()) || '';
        if (code) convLang = code;
    }
}

// ── Code Review UI ──
function explainCode() {
    const editor = document.getElementById('editor');
    const code = editor ? editor.value : '';
    if (!code.trim()) {
        document.getElementById('output').innerText = "// No code to explain — write some code in the editor first!";
        return;
    }

    const aiPanel = document.getElementById('aiPanel');
    if (!aiPanel.classList.contains('open')) toggleAI();

    addAIMessage('Explain this code', 'user');
    addAIMessage('', 'typing');

    fetch(BACKEND_URL + '/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, lang: currentLang, topic: currentTopic })
    })
    .then(r => r.json())
    .then(d => {
        removeTypingIndicator();
        addAIMessage(d.explanation || "Couldn't generate an explanation.", 'bot');
    })
    .catch(() => {
        removeTypingIndicator();
        addAIMessage("Couldn't reach the explain server. Make sure the backend is running (node server.js).", 'bot');
    })
    .catch(() => {});
}

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

function copyCode() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    navigator.clipboard.writeText(editor.value).then(() => {
        const btn = document.getElementById('copy-btn');
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
    }).catch(() => {
        editor.select();
        document.execCommand('copy');
    });
}

const aiTutorResponses = typeof window !== 'undefined' && window.aiTutorResponses ? window.aiTutorResponses : [];

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

const SYNONYM_MAP = {
    variable: ['variable', 'declare', 'let', 'const', 'var', 'declaration', 'assign'],
    function: ['function', 'method', 'def', 'func', '=>', 'arrow', 'lambda', 'call'],
    class: ['class', 'object', 'oop', 'inherit', 'extends', 'prototype', 'struct', 'constructor'],
    array: ['array', 'list', 'collection', 'vector', 'slice', 'element', 'index'],
    loop: ['loop', 'for', 'while', 'iterate', 'foreach', 'iteration', 'repeat'],
    string: ['string', 'char', 'text', 'concatenat', 'interpolat', 'template'],
    async: ['async', 'await', 'promise', 'callback', 'future', 'coroutine', 'goroutine'],
    error: ['error', 'exception', 'try', 'catch', 'panic', 'throw', 'debug', 'bug'],
    type: ['type', 'int', 'bool', 'float', 'string', 'null', 'undefined', 'void'],
    pointer: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack', 'borrow', 'ownership'],
    closure: ['closure', 'scope', 'hoist', 'lexical', 'temporal dead zone', 'tdz'],
    recursion: ['recursion', 'recursive', 'base case', 'stack overflow', 'tail call'],
    testing: ['test', 'testing', 'assert', 'jest', 'mocha', 'pytest'],
    sql: ['sql', 'select', 'join', 'table', 'database', 'query', 'where', 'insert', 'index'],
    git: ['git', 'commit', 'push', 'pull', 'branch', 'merge', 'rebase', 'clone'],
};

function expandSynonyms(word) {
    for (const [, syns] of Object.entries(SYNONYM_MAP)) {
        if (syns.includes(word) || syns.some(s => s.includes(word))) {
            return syns;
        }
    }
    return [word];
}

function getLocalAIResponse(input) {
    const q = input.toLowerCase().trim();
    if (!q || q.length < 3) return null;

    const words = q.split(/\s+/).filter(w => w.length > 2);
    const meta = ['help', 'hello', 'hi', 'hey', 'thanks'];
    if (meta.includes(q) || words.length === 0) return null;

    // ── Cross-language detection ──
    const askedLang = detectLanguageInQuery(q);
    const searchLang = askedLang || currentLang;
    const langData = courseData[searchLang];
    if (!langData) return null;

    // If asking about a different language, give a language intro
    if (askedLang && askedLang !== currentLang) {
        const intro = getLanguageIntro(askedLang);
        if (intro) {
            return `**${intro.displayName}** is a programming language you can study here!<br><br>${intro.exp || ''}<br><br>` +
                `**Example code:**<br><pre style="background:#000;color:#a5f3fc;padding:12px;border-radius:6px;font-size:11px;line-height:1.5;overflow-x:auto;margin:0;">${(intro.code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre><br>` +
                `Want to switch to **${intro.displayName}**? Click the language selector at the top!<br><br>` +
                `I can also tell you about specific topics in ${intro.displayName} — just ask!`;
        }
    }

    // ── Curriculum search (in the detected or current language) ──
    const expandedWords = new Set();
    for (const w of words) {
        for (const syn of expandSynonyms(w)) {
            expandedWords.add(syn);
        }
    }
    const allWords = [...expandedWords];

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
            let topicMatches = 0;

            for (const word of allWords) {
                if (topicLow.includes(word)) { score += 3; matchedWords++; topicMatches++; }
                if (expLow.includes(word)) { score += 1; matchedWords++; }
            }

            if (searchText.includes(q)) score += 10;
            if (matchedWords > 0) score = score * (1 + matchedWords / (allWords.length || 1));
            if (topicMatches > 0) score *= 1.3;
            if (phase === currentPhase && searchLang === currentLang) score *= 1.2;

            if (score > bestScore) {
                bestScore = score;
                best = { phase, topic, code: item.code, exp: item.exp, lang: searchLang };
            }
        }
    }

    if (best && bestScore >= 1.5) {
        const langLabel = best.lang !== currentLang ? ` (${LANG_NAMES[best.lang] || best.lang.toUpperCase()})` : '';
        return `I found this in the curriculum that might help:<br><br><b>${best.topic}</b>${langLabel} — ${best.phase}<br><br>${best.exp || ''}<br><br><pre style="background:#000;color:#a5f3fc;padding:12px;border-radius:6px;font-size:11px;line-height:1.5;overflow-x:auto;margin:0;">${best.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre><br><b>Try this:</b> paste the code into the editor, modify it, and click Run to experiment!`;
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

async function askAI(q) {
    streamingFullText = '';
    const enrichedQ = resolveFollowUp(q);
    addAIMessage(q, 'user');

    const editor = document.getElementById('editor');
    const currentCode = editor ? editor.value : '';
    const output = document.getElementById('output');
    const outputText = output ? output.innerText : '';
    const hasError = outputText.includes('Error:') || outputText.includes('ERROR') || outputText.includes('SyntaxError') || outputText.includes('ReferenceError') || outputText.includes('TypeError') || outputText.includes('FAIL');

    const setConvSubject = (reply) => {
        if (reply) setTimeout(() => extractConversationSubject(reply), 0);
    };

    // ── 1. Error-aware early return ──
    if (hasError && currentTopic && isErrorQuery(q)) {
        const errorTip = getErrorTutorTip(currentTopic, outputText);
        if (errorTip) {
            addAIMessage('', 'typing');
            await sleep(300);
            removeTypingIndicator();
            addAIMessage(errorTip, 'bot');
            setConvSubject(errorTip);
            return;
        }
    }

    // ── 2. Code analysis for error-related questions ──
    if (hasError || isErrorQuery(q)) {
        let errorReply = '';
        const analysis = analyzeUserCodeClient(currentCode, currentLang);
        if (analysis && analysis.length > 0) {
            errorReply = "I looked at your code and found some issues:\n\n" +
                analysis.map((h, i) => `${i + 1}. ${h}`).join('\n') + '\n\n';
        }
        if (outputText && /Error|ReferenceError|TypeError|SyntaxError/.test(outputText)) {
            errorReply += `**Your code produced this output:**\n\`\`\`\n${outputText}\n\`\`\`\n\n`;
        }
        if (currentCode && currentTopic) {
            errorReply += `Since you're working on **${currentTopic}**, here's a hint:\n`;
            errorReply += `- Look at the example in the curriculum and compare it with your code line by line\n`;
            errorReply += `- Try simplifying: comment out parts until it works, then add them back one at a time\n`;
            errorReply += `- Check the most common mistake for this topic and see if it applies to you\n\n`;
        }
        if (errorReply) {
            errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step.";
            addAIMessage('', 'typing');
            await sleep(200);
            removeTypingIndicator();
            addAIMessage(errorReply, 'bot');
            setConvSubject(errorReply);
            return;
        }
    }

    // ── 3. Local curriculum search (instant, no network) ──
    const localReply = getLocalAIResponse(enrichedQ);
    if (localReply) {
        addAIMessage('', 'typing');
        await sleep(200);
        removeTypingIndicator();
        addAIMessage(localReply, 'bot');
        setConvSubject(localReply);
        return;
    }

    // ── 4. Stream from backend ──
    createStreamingBotMessage();
    try {
        const response = await fetch(BACKEND_URL + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: enrichedQ,
                lang: convLang || currentLang,
                topic: convSubject || currentTopic,
                phase: currentPhase,
                code: currentCode,
                output: outputText,
                hasError: hasError,
                history: conversationHistory.slice(-8)
            })
        });

        if (!response.ok || !response.body) {
            throw new Error('Stream not available');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                    const data = trimmed.slice(6);
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.error) {
                            finalizeStreamingBotMessage("Sorry, I encountered an error. Please try again.");
                            return;
                        }
                        if (parsed.content !== undefined) {
                            updateStreamingContent(streamingFullText + parsed.content);
                        }
                    } catch {}
                }
            }
        }
        extractConversationSubject(streamingFullText);
        finalizeStreamingBotMessage(streamingFullText);
    } catch (e) {
        // ── 5. Fallback to local keyword responses ──
        if (streamingMsgEl) {
            streamingMsgEl.remove();
            streamingMsgEl = null;
        }
        const fallbackReply = getAIResponse(enrichedQ);
        addAIMessage('', 'typing');
        await sleep(200);
        removeTypingIndicator();
        addAIMessage(fallbackReply, 'bot');
        setConvSubject(fallbackReply);
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function sendAI() {
    const input = document.getElementById('aiInput');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    askAI(q).catch(() => {});
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
    const convLen = conversationHistory.length;

    if (hasError) {
        if (outputText.includes('SyntaxError') || outputText.includes('Unexpected token')) {
            return ["What is a syntax error?", "How to fix missing brackets", "Check my punctuation", "Common syntax mistakes"];
        }
        if (outputText.includes('ReferenceError') || outputText.includes('is not defined')) {
            return ["What is a ReferenceError?", "How to declare variables", "Variable scope explained", "Check variable spelling"];
        }
        if (outputText.includes('TypeError') || outputText.includes('is not a function') || outputText.includes('Cannot read property')) {
            return ["What is a TypeError?", "Check variable types", "Debug undefined values", "How to use console.log"];
        }
        if (outputText.includes('FAIL') || outputText.includes('Challenge')) {
            return ["Hint for this challenge", "Explain the concept", "Show me a similar example", "Debug my logic"];
        }
        if (currentTopic) {
            const topicLC = currentTopic.toLowerCase();
            return [`Explain this ${topicLC} error`, `Help me fix ${topicLC}`, `How does ${topicLC} work?`, "Common debugging tips"];
        }
        return ["Why did I get this error?", "How do I fix my code?", "Explain what went wrong", "Debugging tips"];
    }

    if (convLen >= 4) {
        const lastBot = [...conversationHistory].reverse().find(m => m.role === 'bot');
        if (lastBot && lastBot.text) {
            const bt = lastBot.text.toLowerCase();
            if (bt.includes('try this') || bt.includes('practice') || bt.includes('exercise')) {
                return ["I tried it, now what?", "Explain the concept more", "Show me a variation", "What's next after this?"];
            }
            if (bt.includes('would you like') || bt.includes('tell me more')) {
                return ["Yes, tell me more", "Give me an example", "Explain it simply", "Compare with other languages"];
            }
        }
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

    if (streamingFullText) {
        const text = streamingFullText.toLowerCase();
        const followUps = [];
        if (text.includes('variable') || text.includes('declare')) followUps.push('Show me a variable example');
        if (text.includes('function') || text.includes('method')) followUps.push('Give me a function exercise');
        if (text.includes('loop') || text.includes('for ') || text.includes('while')) followUps.push('Show me a loop example');
        if (text.includes('class') || text.includes('object')) followUps.push('Practice: build a class');
        if (text.includes('array') || text.includes('list')) followUps.push('Practice with arrays');
        if (text.includes('error') || text.includes('debug')) followUps.push('How do I debug this?', 'Common mistakes');
        if (followUps.length > 0) {
            followUps.push('Tell me more', 'Give me an example');
            const buttons = followUps.slice(0, 4).map(s =>
                `<button onclick="askAI('${s.replace(/'/g, "\\'")}')">${s}</button>`
            );
            if (currentTopic && currentLang && currentLang !== 'compiler' && currentLang !== 'challenge') {
                buttons.push(`<button onclick="generateExercise()" style="background:#0ea5e9;color:#000;">✨ Exercise</button>`);
            }
            el.innerHTML = buttons.join('');
            return;
        }
    }

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

// Schema Designer lives in public/schema.js


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
// ── QUIZ MODE ──
let quizLang = 'js';
let quizAnswers = {};
let quizScore = { correct: 0, total: 0 };
let quizLevel = 'all';
let quizRoundQuestions = [];
let quizRoundDone = false;
let quizRoundNum = 1;
let quizLevelCleared = {};

function initQuiz() {
    currentLang = 'quiz';
    document.getElementById('app').className = 'quiz-mode';
    document.getElementById('header-title').innerText = 'QUIZ';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-quiz').classList.add('active');
    quizLevel = 'all';
    startQuizRound();
    renderQuiz();
}

function getQuizPool() {
    const questions = quizData[quizLang] || [];
    if (quizLevel === 'all') return questions;
    return questions.filter(q => q.level === quizLevel);
}

function startQuizRound() {
    const pool = getQuizPool();
    const unanswered = pool.filter((q, i) => {
        const globalIdx = quizData[quizLang].indexOf(q);
        return quizAnswers[globalIdx] === undefined;
    });
    const shuffled = [...unanswered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    quizRoundQuestions = selected.map(q => quizData[quizLang].indexOf(q));
    quizRoundDone = false;
}

function renderQuiz() {
    const questions = quizData[quizLang] || [];
    const list = document.getElementById('topic-list');
    
    let html = '<div class="quiz-lang-bar">';
    for (const l of ['js','ts','py','go','java','cs','kt','rs','swift','git','pg','backend','c','cpp','zig']) {
        const names = { js:'JS', ts:'TS', py:'Python', go:'Go', java:'Java', cs:'C#', kt:'Kotlin', rs:'Rust', swift:'Swift', git:'Git', pg:'SQL', backend:'Backend', c:'C', cpp:'C++', zig:'Zig' };
        const active = l === quizLang ? 'active' : '';
        html += '<button class="quiz-lang-btn ' + active + '" onclick="switchQuizLang(\'' + l + '\')">' + names[l] + '</button>';
    }
    html += '</div>';
    
    html += '<div style="font-size:9px;color:#64748b;margin-bottom:8px;"><a href="#" onclick="setMode(\'js\');return false;" style="color:var(--accent);text-decoration:none;">← Back to topics</a></div>';
    
    // Level cleared banners
    for (const level of ['beginner', 'intermediate', 'expert']) {
        const key = quizLang + ':' + level;
        if (quizLevelCleared[key]) {
            html += '<div class="quiz-level-cleared">🏆 ' + level.charAt(0).toUpperCase() + level.slice(1) + ' Cleared! (' + quizLevelCleared[key].correct + '/' + quizLevelCleared[key].total + ')</div>';
        }
    }
    
    // Progress
    const doneTotal = Object.keys(quizAnswers).length;
    const answeredCount = quizRoundQuestions.filter(idx => quizAnswers[idx] !== undefined).length;
    const pct = quizRoundQuestions.length > 0 ? (answeredCount / quizRoundQuestions.length * 100) : 0;
    html += '<div class="quiz-round-progress"><span>🔥 Round ' + quizRoundNum + ' · ' + answeredCount + '/' + quizRoundQuestions.length + ' answered</span><div class="quiz-progress-track"><div class="quiz-progress-bar" style="width:' + pct + '%"></div></div></div>';
    html += '<div class="quiz-score"><span>Score: <strong>' + quizScore.correct + '/' + quizScore.total + '</strong></span><span>Total: <strong>' + doneTotal + '/' + questions.length + '</strong></span><button class="quiz-reset" onclick="resetQuiz()">Reset</button></div>';
    
    // Round complete banner
    if (quizRoundDone) {
        const roundCorrect = quizRoundQuestions.filter(idx => quizAnswers[idx] === questions[idx].ans).length;
        html += '<div class="quiz-round-banner"><span class="quiz-round-pass">🎯 Round ' + quizRoundNum + ' Complete! ' + roundCorrect + '/' + quizRoundQuestions.length + ' correct</span><button class="quiz-next-btn" onclick="nextQuizRound()">Next Round ▶</button></div>';
    }
    
    // Questions
    quizRoundQuestions.forEach((globalIdx, i) => {
        const q = questions[globalIdx];
        if (!q) return;
        const sel = quizAnswers[globalIdx];
        let cls = '';
        if (sel !== undefined) {
            cls = sel === q.ans ? 'correct' : 'wrong';
        }
        html += '<div class="quiz-card fade-in"><div class="q-num">Round ' + quizRoundNum + ' · Q' + (i+1) + '/' + quizRoundQuestions.length + '<span class="quiz-round-meta" data-level="' + q.level + '">' + q.level + '</span></div><div class="q-text">' + q.q + '</div>';
        q.opts.forEach((o, j) => {
            let oc = 'quiz-opt';
            if (sel !== undefined) {
                if (j === q.ans) oc += ' correct';
                if (j === sel && j !== q.ans) oc += ' wrong';
            } else if (j === sel) oc += ' selected';
            html += '<button class="' + oc + '" onclick="answerQuiz(' + i + ', ' + j + ')">' + String.fromCharCode(65+j) + '. ' + o + '</button>';
        });
        if (sel !== undefined && sel !== q.ans) {
            html += '<div class="quiz-explain">' + (q.explain || 'Correct answer: <strong>' + q.opts[q.ans] + '</strong>') + '</div>';
        }
        html += '</div>';
    });
    
    // Empty state
    if (quizRoundQuestions.length === 0) {
        html += '<div style="color:#64748b;font-size:11px;padding:30px 10px;text-align:center;">';
        if (doneTotal >= questions.length) {
            html += '🎉 All questions completed for ' + (quizLevel === 'all' ? 'this language' : quizLevel) + '! Try a different level or language.';
        } else {
            html += 'No questions match the selected level. Try a different difficulty.';
        }
        html += '</div>';
    }
    
    list.innerHTML = html;
    document.getElementById('explanation').innerHTML = '<div style="color:#64748b;font-size:11px;padding:10px;">Answer 10 questions per round. Pick a difficulty level to filter. Clear all questions at a level to earn the 🏆 badge!</div>';
    document.getElementById('editor').value = '';
    updateHighlight();
    document.getElementById('output').innerText = '// Quiz Mode Active';
    
    renderQuizLevelBar();
}

function renderQuizLevelBar() {
    const levelBarEl = document.getElementById('level-bar');
    if (!levelBarEl) return;
    const questions = quizData[quizLang] || [];
    const counts = {};
    for (const level of ['beginner', 'intermediate', 'expert']) {
        counts[level] = questions.filter(q => q.level === level).length;
    }
    let html = '<button class="level-btn' + (quizLevel === 'all' ? ' active' : '') + '" onclick="setQuizLevel(\'all\')">All (' + questions.length + ')</button>';
    for (const level of ['beginner', 'intermediate', 'expert']) {
        const active = quizLevel === level ? ' active' : '';
        const key = quizLang + ':' + level;
        const cleared = quizLevelCleared[key] ? ' ✅' : '';
        html += '<button class="level-btn' + active + '" onclick="setQuizLevel(\'' + level + '\')">' + level.charAt(0).toUpperCase() + level.slice(1) + ' (' + counts[level] + ')' + cleared + '</button>';
    }
    levelBarEl.innerHTML = html;
    levelBarEl.style.display = 'flex';
}

function answerQuiz(qIdx, optIdx) {
    const questions = quizData[quizLang] || [];
    if (quizRoundDone) return;
    if (qIdx >= quizRoundQuestions.length) return;
    const globalIdx = quizRoundQuestions[qIdx];
    if (quizAnswers[globalIdx] !== undefined) return;
    quizAnswers[globalIdx] = optIdx;
    quizScore.total++;
    if (optIdx === questions[globalIdx].ans) quizScore.correct++;
    
    const answeredInRound = quizRoundQuestions.filter(idx => quizAnswers[idx] !== undefined).length;
    if (answeredInRound >= quizRoundQuestions.length) {
        quizRoundDone = true;
        checkQuizLevelCleared();
    }
    renderQuiz();
    setTimeout(() => {
        const explain = document.querySelector('.quiz-explain');
        if (explain) explain.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 50);
}

function checkQuizLevelCleared() {
    const questions = quizData[quizLang] || [];
    for (const level of ['beginner', 'intermediate', 'expert']) {
        const key = quizLang + ':' + level;
        if (quizLevelCleared[key]) continue;
        const levelQIdxs = [];
        questions.forEach((q, i) => {
            if (q.level === level) levelQIdxs.push(i);
        });
        const allAnswered = levelQIdxs.length > 0 && levelQIdxs.every(idx => quizAnswers[idx] !== undefined);
        if (allAnswered) {
            const correct = levelQIdxs.filter(idx => quizAnswers[idx] === questions[idx].ans).length;
            quizLevelCleared[key] = { total: levelQIdxs.length, correct };
        }
    }
}

function nextQuizRound() {
    quizRoundNum++;
    startQuizRound();
    renderQuiz();
}

function setQuizLevel(level) {
    quizLevel = level;
    quizRoundNum = 1;
    startQuizRound();
    renderQuiz();
}

function switchQuizLang(lang) {
    quizLang = lang;
    quizAnswers = {};
    quizScore = { correct: 0, total: 0 };
    quizLevel = 'all';
    quizRoundNum = 1;
    quizLevelCleared = {};
    startQuizRound();
    renderQuiz();
}

function resetQuiz() {
    quizAnswers = {};
    quizScore = { correct: 0, total: 0 };
    quizLevel = 'all';
    quizRoundNum = 1;
    quizLevelCleared = {};
    startQuizRound();
    renderQuiz();
}

// ── CHALLENGE HELPERS ──
let hintLevel = 0;
let challengeSearchQuery = '';

function loadChallengeProgress() {
    try { return JSON.parse(localStorage.getItem('challenge_progress')) || {}; } catch { return {}; }
}

function saveChallengeSolved(lang, idx) {
    const prog = loadChallengeProgress();
    prog[lang + '_' + idx] = true;
    localStorage.setItem('challenge_progress', JSON.stringify(prog));
}

function isChallengeSolved(lang, idx) {
    return !!loadChallengeProgress()[lang + '_' + idx];
}

function computeDiff(a, b) {
    const linesA = a.split('\n');
    const linesB = b.split('\n');
    const result = [];
    const maxLen = Math.max(linesA.length, linesB.length);
    for (let i = 0; i < maxLen; i++) {
        if (i >= linesA.length) {
            result.push({ status: 'added', lineA: null, lineB: i, text: linesB[i] });
        } else if (i >= linesB.length) {
            result.push({ status: 'removed', lineA: i, lineB: null, text: linesA[i] });
        } else if (linesA[i] !== linesB[i]) {
            result.push({ status: 'removed', lineA: i, lineB: null, text: linesA[i] });
            result.push({ status: 'added', lineA: null, lineB: i, text: linesB[i] });
        }
    }
    return result;
}

function formatDiff(diff) {
    let html = '<div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:4px;">Changes:</div>';
    for (const d of diff) {
        if (d.status === 'same') continue;
        const cls = d.status === 'added' ? 'diff-added' : 'diff-removed';
        const prefix = d.status === 'added' ? '+ ' : '- ';
        const num = d.status === 'added' ? d.lineB + 1 : d.lineA + 1;
        html += `<div class="diff-line ${cls}"><span class="diff-line-num">${num}</span>${prefix}${escapeHtml(d.text)}</div>`;
    }
    return html || '<div style="color:#64748b;font-size:10px;">No differences found</div>';
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    // Show Schema and Compiler buttons only in non-challenge modes
    const schemaBtn = document.getElementById('schema-btn');
    if (schemaBtn) schemaBtn.style.display = 'none';

    const progress = loadChallengeProgress();
    const allChallenges = challengeData[challengeLang] || [];
    const countAll = allChallenges.length;
    const countBeginner = allChallenges.filter(c => c.level === 'beginner').length;
    const countIntermediate = allChallenges.filter(c => c.level === 'intermediate').length;
    const countExpert = allChallenges.filter(c => c.level === 'expert').length;
    const solvedAll = Object.keys(progress).filter(k => k.startsWith(challengeLang + '_')).length;
    const solvedBeginner = allChallenges.filter((c, i) => c.level === 'beginner' && isChallengeSolved(challengeLang, i)).length;
    const solvedIntermediate = allChallenges.filter((c, i) => c.level === 'intermediate' && isChallengeSolved(challengeLang, i)).length;
    const solvedExpert = allChallenges.filter((c, i) => c.level === 'expert' && isChallengeSolved(challengeLang, i)).length;
    
    // Render level filter for challenges with progress counts
    const levelBarEl = document.getElementById('level-bar');
    if (levelBarEl) {
        let levelHtml = `<button class="level-btn active" data-level="all" onclick="setChallengeLevel('all')">All <span class="challenge-progress-badge">${solvedAll}/${countAll}</span></button>`;
        levelHtml += `<button class="level-btn" data-level="beginner" onclick="setChallengeLevel('beginner')">Beginner <span class="challenge-progress-badge">${solvedBeginner}/${countBeginner}</span></button>`;
        levelHtml += `<button class="level-btn" data-level="intermediate" onclick="setChallengeLevel('intermediate')">Intermediate <span class="challenge-progress-badge">${solvedIntermediate}/${countIntermediate}</span></button>`;
        levelHtml += `<button class="level-btn" data-level="expert" onclick="setChallengeLevel('expert')">Expert <span class="challenge-progress-badge">${solvedExpert}/${countExpert}</span></button>`;
        levelBarEl.innerHTML = levelHtml;
        levelBarEl.style.display = 'flex';
    }
    
    // Inject challenge toolbar buttons
    let controls = document.getElementById('challenge-controls');
    if (!controls) {
        const btnRow = document.querySelector('.run-btn')?.parentElement;
        if (btnRow) {
            controls = document.createElement('div');
            controls.id = 'challenge-controls';
            controls.className = 'challenge-btn-row';
            controls.innerHTML = `<button class="challenge-btn hint-active" id="challenge-hint-btn" onclick="showHint()">Hint (0/3)</button><button class="challenge-btn" onclick="resetChallenge()">↺ Reset</button>`;
            btnRow.after(controls);
        }
    } else {
        controls.style.display = 'flex';
    }
    
    renderChallengeList();
    loadChallenge(0);
}

function setChallengeLevel(level) {
    currentLevel = level;
    
    // Update active button styling
    const levelButtons = document.querySelectorAll('#level-bar .level-btn');
    levelButtons.forEach(btn => {
        if (btn.dataset.level === level) {
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
    const progress = loadChallengeProgress();
    const totalSolved = Object.keys(progress).filter(k => k.startsWith(challengeLang + '_')).length;
    const totalAll = challenges.length;

    let html = `<div class="challenge-lang-bar">`;
    for (const l of ['js','py','go','java','ts','rs','swift','backend']) {
        const names = { js:'JS', py:'Python', go:'Go', java:'Java', ts:'TS', rs:'Rust', swift:'Swift', backend:'Backend' };
        const active = l === challengeLang ? 'active' : '';
        const solved = Object.keys(progress).filter(k => k.startsWith(l + '_')).length;
        const total = (challengeData[l] || []).length;
        html += `<button class="challenge-lang-btn ${active}" onclick="switchChallengeLang('${l}')">${names[l]} <span class="challenge-progress-badge">${solved}/${total}</span></button>`;
    }
    html += `</div>`;
    html += `<input class="challenge-search-input" type="text" placeholder="Search challenges..." id="challenge-search" oninput="filterChallengeList(this.value)">`;
    html += `<div style="font-size:9px;color:#64748b;margin-bottom:8px;"><a href="#" onclick="setMode('js');return false;" style="color:var(--accent);text-decoration:none;">← Back to topics</a></div>`;
    
    let filteredChallenges = [];
    challenges.forEach((ch, i) => {
        if (currentLevel !== 'all' && ch.level !== currentLevel) return;
        if (challengeSearchQuery && !ch.title.toLowerCase().includes(challengeSearchQuery)) return;
        filteredChallenges.push({...ch, idx: i, solved: isChallengeSolved(challengeLang, i)});
    });

    if (filteredChallenges.length === 0) {
        html += `<div style="color:#64748b;font-size:10px;padding:12px;text-align:center;">No challenges match your search</div>`;
    } else {
        html += `<div class="challenge-search-count">${filteredChallenges.length} of ${challenges.length} challenges</div>`;
        filteredChallenges.forEach((ch) => {
            const active = ch.idx === challengeIdx ? 'active' : '';
            const solved = ch.solved ? 'solved' : '';
            html += `<div class="challenge-card ${active} ${solved}" onclick="loadChallenge(${ch.idx})">
                <div><span class="ch-title">${ch.title}</span><span class="ch-level ${ch.level}">${ch.level}</span></div>
                <div class="ch-desc">${ch.desc}</div>
            </div>`;
        });
    }
    list.innerHTML = html;
}

function filterChallengeList(query) {
    challengeSearchQuery = query.toLowerCase().trim();
    renderChallengeList();
}

function loadChallenge(idx) {
    const challenges = challengeData[challengeLang] || [];
    if (idx < 0 || idx >= challenges.length) return;
    challengeIdx = idx;
    hintLevel = 0;
    const ch = challenges[idx];
    const solved = isChallengeSolved(challengeLang, idx);
    document.getElementById('editor').value = ch.bug;
    updateHighlight();
    document.getElementById('output').innerText = '// Challenge: ' + ch.title + '\n// Edit the code and click "Run" to test your fix';
    document.getElementById('explanation').innerHTML = `<h3 style="margin:0;color:#fff">${ch.title}${solved ? ' <span style="color:#10b981;font-size:11px;">✓ Solved</span>' : ''}</h3>
        <p style="color:#f59e0b;font-size:10px;font-weight:800;text-transform:uppercase;">${ch.level}</p>
        <p style="color:#94a3b8;font-size:11px;margin:8px 0;">${ch.desc}</p>
        <hr style="border:none;border-top:1px solid #334155;margin:10px 0;">
        <p style="color:#64748b;font-size:10px;">Edit the code in the editor, then click Run to test your solution against the challenge.</p>`;
    const hintBtn = document.getElementById('challenge-hint-btn');
    if (hintBtn) { hintBtn.textContent = 'Hint (0/3)'; hintBtn.disabled = false; hintBtn.className = 'challenge-btn'; }
    renderChallengeList();
}

function switchChallengeLang(lang) {
    if (!challengeData[lang] || challengeData[lang].length === 0) return;
    challengeLang = lang;
    challengeIdx = 0;
    loadChallenge(0);
}

function resetChallenge() {
    const challenges = challengeData[challengeLang] || [];
    const ch = challenges[challengeIdx];
    if (!ch) return;
    document.getElementById('editor').value = ch.bug;
    updateHighlight();
    document.getElementById('output').innerText = '// Reset to original code';
}

function showHint() {
    const challenges = challengeData[challengeLang] || [];
    const ch = challenges[challengeIdx];
    if (!ch) return;
    const btn = document.getElementById('challenge-hint-btn');
    const out = document.getElementById('output');

    if (!ch._diff) ch._diff = computeDiff(ch.bug, ch.solution);

    hintLevel++;
    if (hintLevel > 3) hintLevel = 3;

    let html = '<div class="hint-box">';

    if (hintLevel === 1) {
        const changedLines = ch._diff.filter(d => d.status !== 'same');
        const lineNums = changedLines.map(d => d.status === 'added' ? d.lineB + 1 : d.lineA + 1)
            .filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
        html += '<div class="hint-label">💡 Hint 1/3 — Conceptual</div>';
        html += `<p>Focus on the core issue. The challenge says: <em>"${ch.desc}"</em></p>`;
        if (lineNums.length > 0) {
            html += `<p>Look carefully at line${lineNums.length > 1 ? 's' : ''} <strong>${lineNums.join(', ')}</strong> — that${lineNums.length > 1 ? "'s where the changes need to happen" : "'s where the fix goes"}.</p>`;
        }
        if (btn) btn.textContent = 'Hint (1/3)';
    } else if (hintLevel === 2) {
        html += '<div class="hint-label">🔍 Hint 2/3 — Line-Level</div>';
        html += '<p>Here\'s what needs to change (before → after):</p>';
        html += formatDiff(ch._diff);
        if (btn) btn.textContent = 'Hint (2/3)';
    } else {
        html += '<div class="hint-label">👁️ Hint 3/3 — Solution Revealed</div>';
        html += '<p>The full solution has been loaded into the editor.</p>';
        html += formatDiff(ch._diff);
        html += '</div>';
        document.getElementById('editor').value = ch.solution;
        updateHighlight();
        if (btn) { btn.textContent = 'Solved'; btn.disabled = true; btn.className = 'challenge-btn primary'; }
        out.innerHTML = html;
        return;
    }

    html += '</div>';
    out.innerHTML = html;
    if (btn) btn.className = 'challenge-btn hint-active';
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

function refreshChallengeProgress() {
    const progress = loadChallengeProgress();
    const allChallenges = challengeData[challengeLang] || [];
    const solvedAll = Object.keys(progress).filter(k => k.startsWith(challengeLang + '_')).length;
    const solvedBeginner = allChallenges.filter((c, i) => c.level === 'beginner' && isChallengeSolved(challengeLang, i)).length;
    const solvedIntermediate = allChallenges.filter((c, i) => c.level === 'intermediate' && isChallengeSolved(challengeLang, i)).length;
    const solvedExpert = allChallenges.filter((c, i) => c.level === 'expert' && isChallengeSolved(challengeLang, i)).length;
    const totalAll = allChallenges.length;
    const totalBeginner = allChallenges.filter(c => c.level === 'beginner').length;
    const totalIntermediate = allChallenges.filter(c => c.level === 'intermediate').length;
    const totalExpert = allChallenges.filter(c => c.level === 'expert').length;

    // Update level bar badges
    const levelBarEl = document.getElementById('level-bar');
    if (levelBarEl) {
        const btns = levelBarEl.querySelectorAll('.level-btn');
        const levels = ['all', 'beginner', 'intermediate', 'expert'];
        const solvedCounts = [solvedAll, solvedBeginner, solvedIntermediate, solvedExpert];
        const totalCounts = [totalAll, totalBeginner, totalIntermediate, totalExpert];
        btns.forEach((btn, i) => {
            if (i < levels.length) {
                const label = levels[i] === 'all' ? 'All' : levels[i].charAt(0).toUpperCase() + levels[i].slice(1);
                const active = btn.dataset.level === currentLevel ? ' active' : '';
                btn.outerHTML = `<button class="level-btn${active}" data-level="${levels[i]}" onclick="setChallengeLevel('${levels[i]}')">${label} <span class="challenge-progress-badge">${solvedCounts[i]}/${totalCounts[i]}</span></button>`;
            }
        });
    }

    // Update language bar badges
    const langBar = document.querySelector('.challenge-lang-bar');
    if (langBar) {
        const btns = langBar.querySelectorAll('.challenge-lang-btn');
        for (const btn of btns) {
            for (const l of ['js','py','go','java','ts','rs','swift']) {
                const names = { js:'JS', py:'Python', go:'Go', java:'Java', ts:'TS', rs:'Rust', swift:'Swift' };
                if (btn.textContent.includes(names[l]) || btn.textContent.includes(l.toUpperCase())) {
                    const solved = Object.keys(progress).filter(k => k.startsWith(l + '_')).length;
                    const total = (challengeData[l] || []).length;
                    const span = btn.querySelector('.challenge-progress-badge');
                    if (span) span.textContent = solved + '/' + total;
                    break;
                }
            }
        }
    }
}

function nextChallenge() {
    const challenges = challengeData[challengeLang] || [];
    const start = challengeIdx;
    let next = (start + 1) % challenges.length;
    while (next !== start) {
        if (!isChallengeSolved(challengeLang, next)) {
            loadChallenge(next);
            return;
        }
        next = (next + 1) % challenges.length;
    }
    document.getElementById('output').innerHTML = '<div style="color:#10b981;font-size:12px;font-weight:700;">🎉 All challenges solved in this language!</div>';
}

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
            let html = '';
            if (captured) html += '<pre style="font-size:10px;color:#94a3b8;margin:0 0 8px 0;">' + escapeHtml(captured) + '</pre>';

            const testPassed = eval(ch.test);
            if (testPassed) {
                saveChallengeSolved(challengeLang, challengeIdx);
                html += `<div class="challenge-result pass">✓ PASS: Challenge solved!</div>`;
                html += `<button class="challenge-next-btn" onclick="nextChallenge()">Next Challenge →</button>`;
                refreshChallengeProgress();
                renderChallengeList();
                loadChallenge(challengeIdx);
            } else {
                html += `<div class="challenge-result fail">✗ FAIL: Solution doesn't pass the test.</div>`;
                html += `<div class="test-detail"><strong>Test:</strong> <code>${escapeHtml(ch.test)}</code></div>`;
                try {
                    const actualVal = eval(code + '\n' + ch.test);
                    html += `<div class="test-detail"><strong>Expected:</strong> <span class="expected">true</span></div>`;
                    html += `<div class="test-detail"><strong>Got:</strong> <span class="actual">${escapeHtml(JSON.stringify(actualVal))}</span></div>`;
                } catch {}
                if (ch._diff === undefined) ch._diff = computeDiff(ch.bug, ch.solution);
                html += '<div style="margin-top:6px;">' + formatDiff(ch._diff) + '</div>';
                html += `<button class="challenge-btn" style="margin-top:8px;" onclick="showHint()">💡 Get a Hint</button>`;
                out.innerHTML = html;
                setRunLoading(false);
                return;
            }
            out.innerHTML = html;
        } catch(e) {
            out.innerHTML = `<div class="challenge-result fail">Error: ${escapeHtml(e.message)}</div>`;
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

    if (key === 'Tab') {
        if (compState && compState.popup.style.display !== 'none') {
            e.preventDefault();
            compSelect();
            return;
        }
        e.preventDefault();
        const spaces = '    ';
        this.value = text.substring(0, start) + spaces + text.substring(end);
        this.selectionStart = start + spaces.length;
        this.selectionEnd = start + spaces.length;
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
        const pctContainer = document.createElement('div');
        pctContainer.id = 'progressBarContainer';
        pctContainer.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
        pctContainer.innerHTML =
            '<div id="progressBar" style="flex:1;height:4px;background:#1e293b;border-radius:2px;overflow:hidden;">' +
            '<div style="height:100%;width:0%;background:var(--accent);border-radius:2px;transition:width 0.4s ease;"></div></div>' +
            '<span id="progressText" style="font-size:9px;color:#64748b;font-weight:800;white-space:nowrap;">0%</span>';
        label.after(pctContainer);
        bar = document.getElementById('progressBar');
    }
    const fill = bar.querySelector('div');
    fill.style.width = pct + '%';
    document.getElementById('progressText').textContent = completed + '/' + allTopics.length + ' (' + pct + '%)';
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

        let matchesEngine = true;
        if (currentEngineFilter !== 'all') {
            const enginePhaseMap = { godot: 'GodotEngine', unity: 'UnityEngine', unreal: 'UnrealEngine' };
            matchesEngine = (btn.dataset.phase || '') === enginePhaseMap[currentEngineFilter];
        }

        let matchesPlatform = true;
        if (currentMobilePlatform !== 'all') {
            const prefix = currentMobilePlatform === 'android' ? 'Android:' : 'iOS:';
            matchesPlatform = (btn.dataset.phase || '').startsWith(prefix);
        }

        const show = matchesSearch && matchesLevel && matchesCompletion && matchesEngine && matchesPlatform;
        btn.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    const container = document.getElementById('topic-list');
    const children = container.children;

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

    let countEl = document.getElementById('searchCount');
    if (visible < total) {
        if (!countEl) {
            countEl = document.createElement('div');
            countEl.id = 'searchCount';
            countEl.style.cssText = 'font-size:9px;color:#64748b;margin-bottom:6px;font-weight:700;transition:opacity 0.2s ease;';
            document.getElementById('topic-search').after(countEl);
        }
        countEl.textContent = visible + ' of ' + total + ' topics';
        if (currentLevel !== 'all') countEl.textContent += ' (' + currentLevel + ')';
        if (currentCompletionFilter !== 'all') countEl.textContent += ' (' + currentCompletionFilter + ')';
        countEl.style.display = visible === 0 ? '' : '';
        countEl.style.opacity = '0';
        requestAnimationFrame(function () { countEl.style.opacity = '1'; });
    } else if (countEl) {
        countEl.style.display = 'none';
    }

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

    if (q || currentLevel !== 'all' || currentCompletionFilter !== 'all') {
        const listEl = document.getElementById('topic-list');
        if (listEl) listEl.scrollTop = 0;
    }

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

// ── API Client (Thunderclient-style) ──
const API_STORAGE_KEY = 'dogeslab_api_headers';

function initAPI() {
    currentLang = 'api';
    document.getElementById('app').className = 'api-mode';
    document.getElementById('header-title').innerHTML = 'API';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-api');
    if (navBtn) navBtn.classList.add('active');

    // Hide irrelevant UI elements
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('editor').style.display = 'none';
    document.getElementById('output').style.display = 'none';
    document.getElementById('level-bar').style.display = 'none';
    document.getElementById('topic-list').innerHTML = '';
    document.getElementById('explanation').innerHTML = '<div style="color:#64748b;font-size:11px;padding:10px;">Send HTTP requests to test REST APIs. Enter a URL, add headers/body, and click Send.</div>';

    // Reset UI
    document.getElementById('apiResBody').textContent = 'Send a request to see the response';
    document.getElementById('apiResStatus').textContent = '—';
    document.getElementById('apiResStatus').className = 'api-res-status';
    document.getElementById('apiResMeta').textContent = '';
    document.getElementById('apiResHeaders').style.display = 'none';
    apiSwitchTab('headers');
    loadSavedHeaders();
}

function loadSavedHeaders() {
    try {
        const saved = localStorage.getItem(API_STORAGE_KEY);
        if (saved) {
            const headers = JSON.parse(saved);
            if (Array.isArray(headers) && headers.length > 0) {
                document.getElementById('apiHeadersList').innerHTML = '';
                headers.forEach(h => apiRenderHeader(h.key, h.value));
                return;
            }
        }
    } catch {}
    // Default: one empty row
    apiAddHeader();
}

function saveHeaders() {
    try {
        const rows = document.querySelectorAll('#apiHeadersList .api-header-row');
        const headers = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                headers.push({ key: inputs[0].value, value: inputs[1].value });
            }
        });
        localStorage.setItem(API_STORAGE_KEY, JSON.stringify(headers));
    } catch {}
}

function apiRenderHeader(key, value) {
    const list = document.getElementById('apiHeadersList');
    const row = document.createElement('div');
    row.className = 'api-header-row';
    row.innerHTML = `<input type="text" class="api-header-key" placeholder="Header name" value="${key || ''}" oninput="saveHeaders()">
        <input type="text" class="api-header-val" placeholder="Value" value="${value || ''}" oninput="saveHeaders()">
        <button class="api-header-del" onclick="apiRemoveHeader(this)">✕</button>`;
    list.appendChild(row);
}

function apiAddHeader() {
    apiRenderHeader('', '');
}

function apiRemoveHeader(btn) {
    const row = btn.closest('.api-header-row');
    if (row) row.remove();
    saveHeaders();
    const remaining = document.querySelectorAll('#apiHeadersList .api-header-row');
    if (remaining.length === 0) apiAddHeader();
}

function apiSwitchTab(tab) {
    document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.api-tab-content').forEach(c => c.style.display = 'none');
    document.getElementById('apiTab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    document.getElementById('apiContent' + tab.charAt(0).toUpperCase() + tab.slice(1)).style.display = 'flex';
}

function apiUpdateBodyType() {
    const type = document.getElementById('apiBodyType').value;
    const el = document.getElementById('apiBody');
    if (type === 'json') {
        el.placeholder = '{"key": "value"}';
        try { const parsed = JSON.parse(el.value); el.value = JSON.stringify(parsed, null, 2); } catch {}
    } else if (type === 'form') {
        el.placeholder = 'key1=value1&key2=value2';
    } else {
        el.placeholder = 'Raw text body...';
    }
}

function apiUpdateAuth() {
    const type = document.getElementById('apiAuthType').value;
    document.getElementById('apiAuthToken').style.display = type === 'bearer' ? 'block' : 'none';
    document.getElementById('apiAuthBasic').style.display = type === 'basic' ? 'flex' : 'none';
}

async function sendAPIRequest() {
    const method = document.getElementById('apiMethod').value;
    const url = document.getElementById('apiUrl').value.trim();
    if (!url) { document.getElementById('apiResBody').textContent = 'Please enter a URL'; return; }

    const btn = document.querySelector('.api-send-btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    document.getElementById('apiResBody').textContent = 'Sending request...';
    document.getElementById('apiResStatus').textContent = '—';
    document.getElementById('apiResStatus').className = 'api-res-status';
    document.getElementById('apiResMeta').textContent = '';
    document.getElementById('apiResHeaders').style.display = 'none';

    // Collect headers
    const headers = {};
    document.querySelectorAll('#apiHeadersList .api-header-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 2) {
            const k = inputs[0].value.trim();
            const v = inputs[1].value.trim();
            if (k) headers[k] = v;
        }
    });

    // Auth
    const authType = document.getElementById('apiAuthType').value;
    if (authType === 'bearer') {
        const token = document.getElementById('apiAuthToken').value.trim();
        if (token) headers['Authorization'] = 'Bearer ' + token;
    } else if (authType === 'basic') {
        const user = document.getElementById('apiAuthUser').value.trim();
        const pass = document.getElementById('apiAuthPass').value.trim();
        if (user || pass) {
            headers['Authorization'] = 'Basic ' + btoa(user + ':' + pass);
        }
    }

    // Body
    let body = document.getElementById('apiBody').value.trim();
    const bodyType = document.getElementById('apiBodyType').value;
    if (body && ['GET', 'HEAD'].includes(method.toUpperCase())) {
        document.getElementById('apiResBody').textContent = method + ' requests cannot have a body';
        btn.disabled = false; btn.textContent = 'Send';
        return;
    }
    if (body && bodyType === 'json' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        try { JSON.parse(body); } catch {
            document.getElementById('apiResBody').textContent = 'Invalid JSON body';
            btn.disabled = false; btn.textContent = 'Send';
            return;
        }
    }
    if (body && bodyType === 'form' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (!body) body = undefined;

    try {
        const response = await fetch(BACKEND_URL + '/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method, url, headers, body })
        });
        const data = await response.json();

        if (data.error) {
            document.getElementById('apiResBody').textContent = 'Error: ' + data.error;
            document.getElementById('apiResStatus').textContent = 'ERR';
            document.getElementById('apiResStatus').className = 'api-res-status status-error';
            return;
        }

        // Status badge
        const statusEl = document.getElementById('apiResStatus');
        const code = data.status;
        statusEl.textContent = code + ' ' + (data.statusText || '');
        if (code >= 200 && code < 300) statusEl.className = 'api-res-status status-2xx';
        else if (code >= 300 && code < 400) statusEl.className = 'api-res-status status-3xx';
        else if (code >= 400 && code < 500) statusEl.className = 'api-res-status status-4xx';
        else if (code >= 500) statusEl.className = 'api-res-status status-5xx';
        else statusEl.className = 'api-res-status status-error';

        // Meta
        document.getElementById('apiResMeta').textContent = data.time + 'ms · ' + formatSize(data.size);

        // Headers
        const headersContent = document.getElementById('apiResHeadersContent');
        if (data.headers && Object.keys(data.headers).length > 0) {
            document.getElementById('apiResHeaders').style.display = 'block';
            headersContent.textContent = Object.entries(data.headers)
                .map(([k, v]) => k + ': ' + v).join('\n');
        } else {
            document.getElementById('apiResHeaders').style.display = 'none';
        }

        // Body
        const bodyEl = document.getElementById('apiResBody');
        const displayBody = data.displayBody || data.body || '(empty response)';
        bodyEl.textContent = displayBody;

    } catch (e) {
        document.getElementById('apiResBody').textContent = 'Request failed: ' + e.message;
        document.getElementById('apiResStatus').textContent = 'ERR';
        document.getElementById('apiResStatus').className = 'api-res-status status-error';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send';
    }
}

function apiToggleHeaders() {
    const content = document.getElementById('apiResHeadersContent');
    const toggle = document.querySelector('.api-res-headers-toggle');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▲ Response Headers';
    } else {
        content.style.display = 'none';
        toggle.textContent = '▼ Response Headers';
    }
}

function apiCopyResponse() {
    const body = document.getElementById('apiResBody').textContent;
    navigator.clipboard.writeText(body).catch(() => {});
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

setMode = function(lang) {
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('editor').style.display = 'block';
    document.getElementById('output').style.display = 'block';
    document.getElementById('compiler-output').style.display = 'none';
    document.getElementById('compiler-buttons').style.display = 'none';

    document.querySelectorAll('.header-extra-tabs .game-nav-btn').forEach(b => b.classList.remove('active'));

    roadmapRendered = false;
    const roadmapBtn = document.getElementById('roadmap-btn');
    if (roadmapBtn) {
        roadmapBtn.style.display = '';
        roadmapBtn.title = 'View ' + (LANG_NAMES[lang] || lang) + ' Roadmap';
    }

    if (lang !== 'challenge') {
        const schemaBtn = document.getElementById('schema-btn');
        if (schemaBtn) schemaBtn.style.display = '';
        const controls = document.getElementById('challenge-controls');
        if (controls) controls.style.display = 'none';
    }

    const runBtn = document.querySelector('.run-btn');
    document.getElementById('cheatsheet-btn').textContent = lang === 'challenge' ? 'Reveal Answer' : 'Cheatsheet';
    if (runBtn) runBtn.textContent = lang === 'challenge' ? 'Test ▶' : 'Run ▶';
    if (lang === 'quiz') { document.getElementById('level-bar').style.display = 'flex'; initQuiz(); updateAISuggestions(); return; }
    if (lang === 'challenge') { initChallenge(); updateAISuggestions(); return; }
    if (lang === 'game') { document.getElementById('level-bar').style.display = 'none'; initGame(); updateAISuggestions(); return; }
    if (lang === 'oop') { document.getElementById('level-bar').style.display = 'none'; initOOPSession(); updateAISuggestions(); return; }
    if (lang === 'db') { document.getElementById('level-bar').style.display = 'none'; initDatabase(); updateAISuggestions(); return; }
    if (lang === 'techstack') { document.getElementById('level-bar').style.display = 'none'; initTechStack(); updateAISuggestions(); return; }
    if (lang === 'git') { document.getElementById('level-bar').style.display = 'none'; initGitVisualize(); updateAISuggestions(); return; }
    if (lang === 'api') { initAPI(); updateAISuggestions(); return; }
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

    if (!courseData[lang]) {
        document.getElementById('topic-list').innerHTML =
            '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div><div class="skeleton-line med"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div>';
        document.getElementById('explanation').innerHTML =
            '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line med"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div>';
        document.getElementById('editor').value = '// Loading...';
        document.getElementById('output').innerText = '// Loading curriculum data...';
        document.getElementById('app').className = lang + '-mode';
        document.getElementById('header-title').innerText = lang.toUpperCase();
        document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
        const navBtn = document.getElementById('nav-' + lang);
        if (navBtn) navBtn.classList.add('active');
        loadLangData(lang, function () { setMode(lang); });
        return;
    }

    currentLevel = 'all';
    currentCompletionFilter = 'all';
    currentEngineFilter = 'all';
    currentLang = lang;
    const appEl = document.getElementById('app');
    appEl.className = lang + '-mode';
    // Hide workspace by default for JS mode, remove for others
    if (lang === 'js' || lang === 'java') {
        appEl.classList.add('hide-workspace');
        appEl.classList.remove('workspace-open');
    } else {
        appEl.classList.remove('hide-workspace', 'workspace-open');
    }
    const levelBar = document.getElementById('level-bar');

    const langData = courseData[lang] || {};
    const phases = Object.keys(langData);
    const totalPhases = phases.length;

    const progressTotal = Object.values(langData).reduce((sum, topics) => sum + Object.keys(topics).length, 0);
    const progressDone = Object.values(langData).reduce((sum, topics) => {
        return sum + Object.keys(topics).filter(t => completedTopics.has(currentLang + ':' + t)).length;
    }, 0);
    const pct = progressTotal > 0 ? Math.round(progressDone / progressTotal * 100) : 0;
    document.getElementById('header-title').innerHTML = lang.toUpperCase() + (pct > 0 ? ` <span style="font-size:10px;opacity:0.6;">${pct}%</span>` : '');
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + lang);
    if (navBtn) navBtn.classList.add('active');

    // Auto-assign difficulty based on phase position
    const third = Math.max(1, Math.ceil(totalPhases / 3));
    const phaseLevels = {};
    phases.forEach((phase, i) => {
        if (i < third) phaseLevels[phase] = 'beginner';
        else if (i < third * 2) phaseLevels[phase] = 'intermediate';
        else phaseLevels[phase] = 'expert';
    });

    if (levelBar) renderLevelBar();

    const engineBar = document.getElementById('engine-bar');
    if (lang === 'gamedev') {
        if (engineBar) renderEngineBar();
    } else if (engineBar) {
        engineBar.style.display = 'none';
    }

    if (lang === 'mobile') {
        currentMobilePlatform = 'android';
        const platformBar = document.getElementById('platform-bar');
        if (platformBar) renderPlatformBar();
    } else {
        const platformBar = document.getElementById('platform-bar');
        if (platformBar) platformBar.style.display = 'none';
    }

    // Build topic list with collapsible phases, counts, badges
    let html = '';
    const langDisplay = LANG_NAMES[lang] || lang;
    const aboutTarget = lang === 'mobile' ? 'currentMobilePlatform' : `'${lang}'`;
    if (lang === 'backend') {
        html += `<div class="phase-header" onclick="setMode('api')" style="cursor:pointer;color:#f97316;border-color:#f97316;">
            <span class="phase-toggle">▶</span>
            <span class="phase-label-text" style="font-style:italic;color:#f97316;">API Client</span>
        </div>`;
    }
    html += `<div class="phase-header" onclick="loadLangIntro(${aboutTarget})" style="cursor:pointer;">
        <span class="phase-toggle">▼</span>
        <span class="phase-label-text" style="font-style:italic;">About ${langDisplay}</span>
    </div>`;
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
            html += `<button class="item-btn topic-btn-enter${collapsedClass}" style="animation-delay:${delay}ms" data-level="${level}" data-phase="${phaseKey}" id="btn-${topic.replace(/\s/g, '').replace(/[&,]/g, '')}" onclick="loadTopic('${phase.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')"><span class="diff-badge ${level}"></span><span class="topic-name">${topic}</span></button>`;
            idx++;
        }
    }
    document.getElementById('topic-list').innerHTML = html;
    const searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.value = '';

    updateTopicDisplay();

    updateAISuggestions();
    loadLangIntro(lang === 'mobile' ? currentMobilePlatform : lang);
};

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

initHighlighting();
initLineNumbers();
loadProgress();

function toggleNav() {
    const menu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger-btn');
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const editor = document.getElementById('editor');
        if (editor && document.activeElement === editor) {
            e.preventDefault();
            runCode();
        }
    }
    if (e.key === 'Escape') {
        const aiPanel = document.getElementById('aiPanel');
        if (aiPanel && aiPanel.classList.contains('open')) {
            toggleAI();
            return;
        }
        const menu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger-btn');
        if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            hamburger.classList.remove('open');
        }
    }
});

document.addEventListener('click', function(e) {
    const menu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger-btn');
    if (menu.classList.contains('open') && !menu.contains(e.target) && !hamburger.contains(e.target)) {
        menu.classList.remove('open');
        hamburger.classList.remove('open');
    }
});

// ── WORKSPACE TOGGLE ──
function toggleWorkspace() {
    const appEl = document.getElementById('app');
    const btn = document.getElementById('ws-toggle-btn');
    if (appEl.classList.contains('workspace-open')) {
        appEl.classList.remove('workspace-open');
        appEl.classList.add('hide-workspace');
        if (btn) btn.textContent = 'Editor ▸';
        const rv = document.getElementById('roadmap-view');
        if (rv) rv.style.display = 'none';
        document.getElementById('topic-list').style.display = 'block';
    } else {
        appEl.classList.remove('hide-workspace');
        appEl.classList.add('workspace-open');
        if (btn) btn.textContent = 'Editor ▾';
    }
}

// ── ROADMAP VIEW ──
let roadmapRendered = false;

function toggleRoadmapView() {
    const overlay = document.getElementById('roadmapOverlay');
    const btn = document.getElementById('roadmap-btn');
    const wasOpen = overlay.classList.contains('open');

    overlay.classList.toggle('open');
    if (btn) btn.classList.toggle('active', !wasOpen);

    if (!wasOpen && !roadmapRendered) {
        const body = document.getElementById('roadmapBody');
        renderRoadmap(body);
    }
}

function renderRoadmap(container) {
    const langData = courseData[currentLang];
    if (!langData) { roadmapRendered = false; return; }

    const langName = LANG_NAMES[currentLang] || currentLang;
    const phases = Object.keys(langData);
    const nodeW = 180, nodeH = 36, gap = 30;

    // First pass: compute overall bounding box
    let maxRowWidth = 0;
    let totalH = 50;
    for (const phase of phases) {
        const topics = Object.keys(langData[phase]);
        if (topics.length === 0) continue;
        const rowW = topics.length * (nodeW + gap) - gap;
        if (rowW > maxRowWidth) maxRowWidth = rowW;
        totalH += 60;
    }
    totalH += 20;

    const padding = 20;
    const svgW = maxRowWidth + padding * 2 + 15;
    const svgH = totalH;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}">`;
    svg += `<style>.rn { cursor:pointer; } .rn:hover { opacity:0.8; } .rn rect { rx:6; ry:6; } .rn text { font-size:11px; font-weight:600; fill:#fff; text-anchor:middle; dominant-baseline:central; pointer-events:none; }</style>`;

    svg += `<text x="${svgW/2}" y="20" text-anchor="middle" fill="#f1f5f9" font-size="16" font-weight="800">${langName} Roadmap</text>`;

    let y = 50;
    for (let pi = 0; pi < phases.length; pi++) {
        const phase = phases[pi];
        const topics = Object.keys(langData[phase]);
        if (topics.length === 0) continue;

        const third = Math.ceil(phases.length / 3);
        let color;
        if (pi < third) color = '#38761d';
        else if (pi < third * 2) color = '#9900ff';
        else color = '#000000';

        svg += `<text x="15" y="${y + nodeH/2 + 4}" fill="#64748b" font-size="9" font-weight="800" text-anchor="start" dominant-baseline:central">${phase.toUpperCase()}</text>`;

        const rowW = topics.length * (nodeW + gap) - gap;
        const startX = Math.max(15 + 10, (svgW - rowW) / 2);

        let x = startX;
        for (let ti = 0; ti < topics.length; ti++) {
            const topic = topics[ti];
            const displayName = topic.length > 18 ? topic.slice(0, 16) + '..' : topic;
            const escapedPhase = phase.replace(/'/g, "\\'");
            const escapedTopic = topic.replace(/'/g, "\\'");

            svg += `<g class="rn" onclick="loadTopic('${escapedPhase}','${escapedTopic}'); document.getElementById('roadmapOverlay').classList.remove('open'); document.getElementById('roadmap-btn').classList.remove('active');">
                <rect x="${x}" y="${y}" width="180" height="${nodeH}" fill="${color}" opacity="0.9"/>
                <text x="${x + 90}" y="${y + nodeH/2}">${displayName}</text>
            </g>`;

            if (ti < topics.length - 1) {
                svg += `<line x1="${x + 180}" y1="${y + nodeH/2}" x2="${x + 180 + 30}" y2="${y + nodeH/2}" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)"/>`;
            }
            x += 210;
        }

        if (pi < phases.length - 1) {
            const midX = svgW / 2;
            svg += `<line x1="${midX}" y1="${y + nodeH + 5}" x2="${midX}" y2="${y + nodeH + 25}" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4"/>`;
        }

        y += 60;
    }

    svg += `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#334155"/></marker></defs>`;
    svg += '</svg>';
    container.innerHTML = svg;
    roadmapRendered = true;
}

// ── LANGUAGE INTRO ──

const langIntro = {
    js: {
        name: 'JavaScript',
        what: 'JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications.',
        usedFor: 'Building interactive web pages, web and mobile applications, server-side applications (Node.js), browser extensions, game development, and automation scripts.',
        creator: 'Brendan Eich at Netscape Communications Corporation. Created in just 10 days in May 1995, it was originally called Mocha, then LiveScript, and finally JavaScript.',
        code: '// JavaScript — the language of the web\nconsole.log("Hello, World!");\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("JavaScript"));'
    },
    ts: {
        name: 'TypeScript',
        what: 'TypeScript is a strongly typed programming language that builds on JavaScript by adding static type definitions. It compiles to plain JavaScript and provides better tooling, error checking, and code maintainability at scale.',
        usedFor: 'Large-scale web applications, enterprise software, Angular applications, and any project where type safety and better developer tooling are valuable.',
        creator: 'Anders Hejlsberg at Microsoft. First released in October 2012, after two years of internal development at Microsoft.',
        code: '// TypeScript — JavaScript with types\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconst message: string = greet("TypeScript");\nconsole.log(message);'
    },
    py: {
        name: 'Python',
        what: 'Python is a high-level, interpreted programming language known for its readable syntax and comprehensive standard library. It emphasizes code readability and simplicity, making it one of the most beginner-friendly languages.',
        usedFor: 'Web development, data science, machine learning, artificial intelligence, scientific computing, automation, scripting, backend services, and education.',
        creator: 'Guido van Rossum. First released in 1991 as a successor to the ABC language. The name Python comes from Monty Python\'s Flying Circus.',
        code: '# Python — readable and powerful\nprint("Hello, World!")\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Python"))'
    },
    go: {
        name: 'Go',
        what: 'Go (also called Golang) is a statically typed, compiled programming language designed for simplicity, efficiency, and concurrent programming. It features built-in concurrency primitives and fast compilation.',
        usedFor: 'Cloud services, microservices, CLI tools, DevOps tooling, web servers, networking applications, and concurrent systems requiring high performance.',
        creator: 'Robert Griesemer, Rob Pike, and Ken Thompson at Google. First announced in November 2009. Inspired by C, but with memory safety, garbage collection, and structural typing.',
        code: '// Go — simple and fast\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go!")\n}\n\nfunc greet(name string) string {\n    return fmt.Sprintf("Hello, %s!", name)\n}'
    },
    rs: {
        name: 'Rust',
        what: 'Rust is a systems programming language focused on safety, speed, and concurrency. It guarantees memory safety without a garbage collector through its ownership system and borrow checker.',
        usedFor: 'Systems programming, embedded devices, WebAssembly, CLI tools, game engines, operating systems, networking, and performance-critical applications.',
        creator: 'Graydon Hoare at Mozilla Research. First released in 2010 as a personal project, then sponsored by Mozilla. Now governed by the Rust Foundation.',
        code: '// Rust — safe and fast\nfn main() {\n    println!("Hello, Rust!");\n}\n\nfn greet(name: &str) -> String {\n    format!("Hello, {}!", name)\n}'
    },
    c: {
        name: 'C',
        what: 'C is a general-purpose, procedural programming language that gives developers low-level access to memory and system resources. It is one of the most influential languages in computing history.',
        usedFor: 'Operating systems, embedded systems, firmware, hardware drivers, compilers, game engines, and performance-critical applications where direct hardware control is needed.',
        creator: 'Dennis Ritchie at Bell Labs. Created between 1969 and 1973 for use with the Unix operating system. C remains one of the most widely used languages.',
        code: '// C — the foundation of modern computing\n#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}\n\nvoid greet(char* name) {\n    printf("Hello, %s!\\n", name);\n}'
    },
    cpp: {
        name: 'C++',
        what: 'C++ is a cross-platform language that extends C with object-oriented, generic, and functional features. It provides high-level abstractions with low-level control over system resources.',
        usedFor: 'Game development, GUI applications, real-time systems, high-frequency trading, embedded systems, browser engines, and performance-critical software.',
        creator: 'Bjarne Stroustrup at Bell Labs. First developed in 1979 as "C with Classes". The name C++ was coined in 1983, with the ++ operator implying an increment to C.',
        code: '// C++ — object-oriented and powerful\n#include <iostream>\n#include <string>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}\n\nstd::string greet(std::string name) {\n    return "Hello, " + name + "!";\n}'
    },
    cs: {
        name: 'C#',
        what: 'C# (pronounced "C sharp") is a modern, object-oriented programming language designed for the .NET platform. It combines the power of C++ with the simplicity of Visual Basic.',
        usedFor: 'Windows applications, web applications (ASP.NET), game development (Unity), mobile apps (Xamarin), cloud services, and enterprise software.',
        creator: 'Anders Hejlsberg at Microsoft. First released in 2000 as part of the .NET initiative. C# has evolved significantly with features like async/await, LINQ, and pattern matching.',
        code: '// C# — elegant and modern\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, C#!");\n    }\n    \n    static string Greet(string name) {\n        return $"Hello, {name}!";\n    }\n}'
    },
    kt: {
        name: 'Kotlin',
        what: 'Kotlin is a modern, statically typed programming language that runs on the Java Virtual Machine. It is fully interoperable with Java while offering more concise syntax and null safety.',
        usedFor: 'Android app development, server-side applications, web development (Kotlin/JS), multiplatform mobile apps, and replacing Java in existing projects.',
        creator: 'JetBrains (the company behind IntelliJ IDEA). First released in 2011, with the first stable version in 2016. Google announced first-class support for Kotlin on Android in 2017.',
        code: '// Kotlin — concise and safe\nfun main() {\n    println("Hello, Kotlin!")\n}\n\nfun greet(name: String): String {\n    return "Hello, $name!"\n}'
    },
    swift: {
        name: 'Swift',
        what: 'Swift is a powerful and intuitive programming language for Apple platforms. It is designed to be safe, fast, and expressive, with modern language features and a clean syntax.',
        usedFor: 'iOS, macOS, watchOS, and tvOS app development. Swift is also used for server-side development and system programming on Apple platforms.',
        creator: 'Chris Lattner at Apple. First announced in 2014 at WWDC, with the goal of replacing Objective-C as the primary language for Apple development.',
        code: '// Swift — powerful and intuitive\nimport Foundation\n\nprint("Hello, Swift!")\n\nfunc greet(name: String) -> String {\n    return "Hello, \\(name)!"\n}'
    },
    zig: {
        name: 'Zig',
        what: 'Zig is a general-purpose programming language designed for robustness, optimality, and clarity. It provides low-level control like C but with modern features like comptime (compile-time execution).',
        usedFor: 'Systems programming, embedded development, building cross-platform libraries, and as a C compiler replacement. Zig is often used for performance-critical and low-level software.',
        creator: 'Andrew Kelley. First released in 2016 as a response to the complexity and shortcomings of existing systems programming languages.',
        code: '// Zig — robust and optimal\nconst std = @import("std");\n\npub fn main() void {\n    std.debug.print("Hello, Zig!\\n", .{});\n}\n\nfn greet(name: []const u8) []const u8 {\n    return std.fmt.comptimePrint("Hello, {s}!", .{name});\n}'
    },
    pg: {
        name: 'PostgreSQL',
        what: 'PostgreSQL is a powerful, open-source object-relational database system known for reliability, feature robustness, and performance. It supports advanced data types and concurrent access.',
        usedFor: 'Primary database for web applications, data warehousing, geospatial applications (PostGIS), financial systems, and any application requiring ACID compliance and complex queries.',
        creator: 'Michael Stonebraker at the University of California, Berkeley. Started as the POSTGRES project in 1986. PostgreSQL (Post-Ingres SQL) has been actively developed for over 35 years.',
        code: '-- PostgreSQL — the most advanced open-source database\nCREATE TABLE users (\n    id SERIAL PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE NOT NULL\n);\n\nINSERT INTO users (name, email)\nVALUES (\'Alice\', \'alice@example.com\');\n\nSELECT * FROM users WHERE name = \'Alice\';'
    },
    mongodb: {
        name: 'MongoDB',
        what: 'MongoDB is a source-available, NoSQL document database that stores data in flexible, JSON-like documents. It is designed for scalability, high performance, and ease of development.',
        usedFor: 'Applications requiring flexible schema, rapid prototyping, real-time analytics, content management, IoT data storage, and large-scale data processing.',
        creator: 'Dwight Merriman, Eliot Horowitz, and Kevin Ryan at MongoDB Inc. (originally 10gen). First released in 2009 as a solution for scalability challenges with traditional databases.',
        code: '// MongoDB — flexible document database\n// Insert a document\ndb.users.insertOne({\n    name: "Alice",\n    email: "alice@example.com",\n    roles: ["admin", "editor"]\n})\n\n// Query documents\ndb.users.find({ name: "Alice" })'
    },
    git: {
        name: 'Git',
        what: 'Git is a distributed version control system that tracks changes in source code during software development. It enables multiple developers to work on the same project simultaneously.',
        usedFor: 'Source code management, collaboration, version control, continuous integration, code review workflows, and maintaining project history across distributed teams.',
        creator: 'Linus Torvalds in 2005, originally created to manage Linux kernel development. Git was designed for speed, data integrity, and support for distributed, non-linear workflows.',
        code: '# Git — version control for everything\n# Initialize a repository\ngit init\n\n# Add and commit changes\ngit add .\ngit commit -m "Initial commit"\n\n# Create and switch branches\ngit checkout -b feature-branch\n\n# Push to remote\ngit push origin main'
    },
    mysql: {
        name: 'MySQL',
        what: 'MySQL is an open-source relational database management system known for its reliability, performance, and ease of use. It uses SQL for querying and managing data.',
        usedFor: 'Web applications (especially with LAMP stack), e-commerce platforms, content management systems, data warehousing, and as a general-purpose database for small to large applications.',
        creator: 'Michael Widenius and David Axmark at MySQL AB. First released in 1995. Now owned by Oracle Corporation, but remains open-source under the GPL license.',
        code: '-- MySQL — reliable and fast\nCREATE TABLE users (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE NOT NULL\n);\n\nINSERT INTO users (name, email)\nVALUES (\'Alice\', \'alice@example.com\');\n\nSELECT * FROM users WHERE name = \'Alice\';'
    },
    sqlite: {
        name: 'SQLite',
        what: 'SQLite is a self-contained, serverless, zero-configuration SQL database engine. It is the most widely deployed database engine in the world, embedded in countless applications.',
        usedFor: 'Mobile apps, embedded systems, IoT devices, desktop applications, browser storage, prototyping, and testing. SQLite is built into Android, iOS, and most major browsers.',
        creator: 'D. Richard Hipp. First released in August 2000. The design philosophy was simplicity: a database that requires no setup, no server, and stores data in a single file.',
        code: '-- SQLite — serverless and self-contained\nCREATE TABLE users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    email TEXT UNIQUE NOT NULL\n);\n\nINSERT INTO users (name, email)\nVALUES (\'Alice\', \'alice@example.com\');\n\nSELECT * FROM users WHERE name = \'Alice\';'
    },
    firebase: {
        name: 'Firebase',
        what: 'Firebase is a platform developed by Google for creating mobile and web applications. It provides a suite of cloud-based tools including real-time database, authentication, hosting, and analytics.',
        usedFor: 'Building full-stack apps without managing servers, real-time features (chat, notifications), user authentication, cloud storage, push notifications, and app analytics.',
        creator: 'Andrew Lee and James Tamplin at Firebase Inc. (originally Envolve). Founded in 2011, acquired by Google in 2014. Firebase has grown into Google\'s primary app development platform.',
        code: '// Firebase — backend made simple\nimport { initializeApp } from \'firebase/app\';\nimport { getFirestore } from \'firebase/firestore\';\n\nconst app = initializeApp({\n    apiKey: "YOUR_API_KEY",\n    projectId: "YOUR_PROJECT"\n});\n\nconst db = getFirestore(app);\n\n// Real-time data sync\n// No server code needed'
    },
    cloud: {
        name: 'Cloud Computing',
        what: 'Cloud computing is the on-demand delivery of computing services over the internet, including servers, storage, databases, networking, software, and analytics. It enables flexible resources and economies of scale.',
        usedFor: 'Hosting applications, storing and analyzing data, running virtual machines, deploying machine learning models, content delivery, and building scalable infrastructure without physical hardware.',
        creator: 'The concept evolved from early time-sharing systems (1960s), with modern cloud pioneered by Amazon Web Services (2006), followed by Google Cloud and Microsoft Azure.',
        code: '# Cloud Computing — infrastructure on demand\n# Deploy a server with AWS CLI\naws ec2 run-instances \\\n    --image-id ami-0abcdef1234567890 \\\n    --instance-type t2.micro \\\n    --key-name MyKeyPair \\\n    --security-groups my-sg\n\n# Scale with load balancer\necho "Your infrastructure is ready"'
    },
    aws: {
        name: 'AWS',
        what: 'Amazon Web Services (AWS) is the world\'s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally.',
        usedFor: 'Cloud computing, storage (S3), compute (EC2), databases (RDS, DynamoDB), AI/ML services, serverless computing (Lambda), content delivery (CloudFront), and enterprise infrastructure.',
        creator: 'Amazon.com. AWS launched in 2006, initially offering S3 (storage) and SQS (queuing). It pioneered the modern cloud computing market and remains the market leader.',
        code: '# AWS — cloud leader\n# List S3 buckets\naws s3 ls\n\n# Deploy a Lambda function\naws lambda create-function \\\n    --function-name my-function \\\n    --runtime nodejs18.x \\\n    --handler index.handler \\\n    --role arn:aws:iam::account-id:role/lambda-role\n\n# Launch an EC2 instance\naws ec2 run-instances --image-id ami-xxx'
    },
    azure: {
        name: 'Azure',
        what: 'Microsoft Azure is a cloud computing platform offering infrastructure, platform, and software as a service. It integrates deeply with Microsoft\'s enterprise ecosystem including Active Directory and Visual Studio.',
        usedFor: 'Cloud hosting, Windows-based applications, enterprise identity management, hybrid cloud solutions, AI and machine learning services, and IoT applications.',
        creator: 'Microsoft. Announced in October 2008 as "Windows Azure", later renamed to Microsoft Azure in 2014. Azure has grown to be the second-largest cloud platform after AWS.',
        code: '# Azure — Microsoft\'s cloud platform\n# Create a resource group\naz group create \\\n    --name myResourceGroup \\\n    --location eastus\n\n# Deploy a VM\naz vm create \\\n    --resource-group myResourceGroup \\\n    --name myVM \\\n    --image UbuntuLTS\n\n# List resources\naz resource list'
    },
    java: {
        name: 'Java',
        what: 'Java is a versatile, object-oriented programming language designed for platform independence through the "write once, run anywhere" principle. It runs on the Java Virtual Machine (JVM), making it compatible across all platforms that support the JVM, from mainframes to smartphones.',
        usedFor: 'Enterprise applications, Android app development, web applications (Spring Boot), big data processing (Apache Hadoop, Spark), cloud microservices, embedded systems, and scientific computing.',
        creator: 'James Gosling at Sun Microsystems. First released in 1995 as part of the Sun\'s Java platform. Originally called Oak, it was renamed to Java after Java coffee. Oracle Corporation acquired Sun Microsystems in 2010 and now maintains Java.',
        code: '// Java — write once, run anywhere\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n\n    public static String greet(String name) {\n        return "Hello, " + name + "!";\n    }\n}'
    },
    backend: {
        name: 'Backend',
        what: 'Backend development refers to the server-side aspect of web development, focusing on creating and managing server logic, databases, and APIs. It involves handling user authentication, authorization, processing requests, and ensuring system performance and scalability.',
        usedFor: 'Building and maintaining server-side components of web and mobile applications, RESTful APIs, microservices, database management, authentication systems, cloud infrastructure, and real-time services.',
        creator: 'Backend development has evolved alongside the World Wide Web since Tim Berners-Lee invented the first web server in 1990. The field grew from simple CGI scripts to modern architectures including microservices, serverless computing, and event-driven systems.',
        code: '// Backend — the engine behind the web\n// Example: Node.js Express API\nconst express = require(\'express\');\nconst app = express();\n\napp.get(\'/api/hello\', (req, res) => {\n    res.json({ message: "Hello from the backend!" });\n});\n\napp.listen(3000, () => {\n    console.log(\'Server running on port 3000\');\n});'
    },
    android: {
        name: 'Android',
        what: 'Android is a mobile operating system based on a modified version of the Linux kernel and other open-source software, designed primarily for touchscreen mobile devices. Developed by Google, it powers billions of devices worldwide and offers deep customization, a vast app ecosystem, and strong integration with Google services.',
        usedFor: 'Building native Android apps using Kotlin or Java, developing for phones, tablets, Wear OS, Android TV, and Android Auto. Android apps are distributed via Google Play and other app stores.',
        creator: 'Android was founded by Andy Rubin, Rich Miner, Nick Sears, and Chris White in 2003. It was acquired by Google in 2005 and the first commercial device (HTC Dream) launched in 2008. Google has led its development ever since.',
        code: '// Android — built with Kotlin\nfun main() {\n    println("Hello, Android!")\n}\n\n// Android apps use:\n// - Kotlin/Java for logic\n// - Jetpack Compose or XML for UI\n// - Android Studio as IDE'
    },
    ios: {
        name: 'iOS',
        what: 'iOS is a mobile operating system created by Apple Inc. exclusively for its hardware, powering iPhone, iPad, and iPod Touch. Known for its smooth performance, strong security, privacy focus, and seamless ecosystem integration, iOS is the second most popular mobile OS worldwide.',
        usedFor: 'Building native iOS apps using Swift or Objective-C, developing for iPhone, iPad, Apple Watch, and Apple TV. iOS apps are distributed exclusively through the Apple App Store with strict review guidelines.',
        creator: 'iOS was created by Apple Inc. under the leadership of Steve Jobs. First released in 2007 alongside the original iPhone. It was derived from macOS and has undergone major redesigns with iOS 7 (flat design) and subsequent versions.',
        code: '// iOS — built with Swift\nimport Foundation\nprint("Hello, iOS!")\n\n// iOS apps use:\n// - Swift/Objective-C for logic\n// - SwiftUI or UIKit for UI\n// - Xcode as IDE'
    },
    gcp: {
        name: 'Google Cloud',
        what: 'Google Cloud Platform (GCP) is a suite of cloud computing services that runs on the same infrastructure Google uses internally for its own products like Search, Gmail, and YouTube.',
        usedFor: 'Cloud computing, data analytics (BigQuery), machine learning (AI Platform), container orchestration (GKE), serverless computing (Cloud Functions), and scalable application hosting.',
        creator: 'Google. Launched in 2008 with App Engine. GCP leverages Google\'s massive infrastructure and expertise in data processing, machine learning, and containerized applications.',
        code: '# GCP — data and AI at scale\n# List Compute Engine instances\ngcloud compute instances list\n\n# Deploy a Cloud Function\ngcloud functions deploy my-function \\\n    --runtime nodejs18 \\\n    --trigger-http\n\n# Query BigQuery\ngcloud bigquery query \\\n    --sql "SELECT name FROM mydataset.users LIMIT 10"'
    }
};

function loadLangIntro(lang) {
    const intro = langIntro[lang];
    if (!intro) {
        const langData = courseData[lang];
        if (langData) {
            const phases = Object.keys(langData);
            if (phases.length > 0) {
                const firstPhase = phases[0];
                const topics = Object.keys(langData[firstPhase]);
                if (topics.length > 0) {
                    loadTopic(firstPhase, topics[0]);
                    return;
                }
            }
        }
        return;
    }

    const color = 'var(--accent)';

    document.getElementById('explanation').innerHTML = `
        <div class="techstack-intro" onclick="loadFirstPlatformTopic('${lang}')" style="cursor:pointer;">
            <div class="techstack-intro-header">
                <img class="techstack-intro-logo" src="public/logos/${lang}.svg"
                     alt="${intro.name}"
                     onerror="this.style.display='none'">
                <h2>${intro.name}</h2>
            </div>
            <div class="techstack-intro-section">
                <h3>What is it?</h3>
                <p>${intro.what}</p>
            </div>
            <div class="techstack-intro-section">
                <h3>What is it used for?</h3>
                <p>${intro.usedFor}</p>
            </div>
            <div class="techstack-intro-section">
                <h3>Who created it?</h3>
                <p>${intro.creator}</p>
            </div>
            <p style="color:var(--accent);font-size:10px;margin-top:12px;opacity:0.7;">Click to start learning →</p>
        </div>
    `;

    document.getElementById('editor').value = intro.code;
    updateHighlight();
    document.getElementById('output').innerText = '// ' + intro.name + ' — explore the topics below to start learning';
}

function loadFirstPlatformTopic(lang) {
    const data = courseData['mobile'];
    if (!data) return;
    const prefix = lang === 'android' ? 'Android:' : 'iOS:';
    for (const phase of Object.keys(data)) {
        if (!phase.startsWith(prefix)) continue;
        const topics = Object.keys(data[phase]);
        if (topics.length > 0) {
            loadTopic(phase, topics[0]);
            return;
        }
    }
}

setMode('js');
