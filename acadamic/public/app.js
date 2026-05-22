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
    const safeTopic = escapeHtml(topic);
    const safePhase = escapeHtml(phase);
    expEl.innerHTML = `<h3 style="margin:0; color:#fff">${safeTopic}</h3><p style="color:#94a3b8; font-size:11px; margin-bottom:10px;">${safePhase} <span style="font-size:9px;color:#64748b;margin-left:8px;">${depth.icon} ${depth.label}</span></p>${item.exp}`;
    if (item.prereq) {
        const parts = item.prereq.split('::');
        if (parts.length === 2) {
            const [prereqPhase, prereqTopic] = parts;
            const prereqData = langData[prereqPhase] && langData[prereqPhase][prereqTopic];
            if (prereqData) {
                const safePP = escapeHtml(prereqPhase).replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const safePT = escapeHtml(prereqTopic).replace(/'/g, "\\'").replace(/"/g, '&quot;');
                expEl.innerHTML = `<div class="prereq-banner">📚 Prerequisite: <a href="#" onclick="loadTopic('${safePP}', '${safePT}'); return false;">${escapeHtml(prereqTopic)}</a></div>` + expEl.innerHTML;
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
    updateAIContext();
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
        { id: 'all', label: 'Game Development' },
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
    if (searchInput) searchInput.value = '';
    
    const appEl = document.getElementById('app');
    const platformBar = document.getElementById('platform-bar');

    if (engine === 'all') {
        currentLang = 'gamedev';
        appEl.className = 'gamedev-mode';
        if (platformBar) platformBar.style.display = 'none';
        renderTopicList('gamedev');
        updateAISuggestions();
        loadLangIntro('gamedev');
    } else {
        currentLang = engine;
        appEl.className = engine + '-mode';
        if (platformBar) platformBar.style.display = 'none';
        if (!courseData[engine]) {
            loadLangData(engine, function () {
                renderTopicList(engine);
                updateAISuggestions();
                loadLangIntro(engine);
            });
        } else {
            renderTopicList(engine);
            updateAISuggestions();
            loadLangIntro(engine);
        }
    }
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
    if (currentLang === 'mobile') {
        renderTopicList('mobile');
        var data = courseData['mobile'];
        if (data) {
            var phases = Object.keys(data);
            if (phases.length > 0) {
                var phase = phases[0];
                var topics = Object.keys(data[phase]);
                if (topics.length > 0) loadTopic(phase, topics[0]);
            }
        }
        var searchInput = document.getElementById('topic-search');
        filterTopics(searchInput ? searchInput.value : '');
    } else {
        loadLangIntro(platform);
        var searchInput = document.getElementById('topic-search');
        filterTopics(searchInput ? searchInput.value : '');
    }
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

function resolveBackendUrl() {
    const override = localStorage.getItem('kodex_backend_url');
    if (override) return override.replace(/\/$/, '');

    const { protocol, hostname, port, origin } = window.location;
    const staticDevPorts = new Set(['5500', '5501', '5502', '5173', '5174']);
    const isLocalStaticServer = (hostname === 'localhost' || hostname === '127.0.0.1') && staticDevPorts.has(port);
    if (isLocalStaticServer) {
        return `${protocol}//${hostname}:3000`;
    }

    return origin;
}

const BACKEND_URL = resolveBackendUrl();

// Generate persistent learner ID
const LEARNER_ID = (function() {
    let id = localStorage.getItem('kodex_learner_id');
    if (!id) {
        id = 'learner_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        localStorage.setItem('kodex_learner_id', id);
    }
    return id;
})();

const runBtn = document.querySelector('.run-btn');

let dueReviewCount = 0;

function checkDueReviews() {
    fetch(BACKEND_URL + '/api/learner/reviews')
        .then(r => r.json())
        .then(d => {
            if (d.due && d.due.length > 0) {
                dueReviewCount = d.due.length;
                updateReviewBadge();
            } else {
                dueReviewCount = 0;
                updateReviewBadge();
            }
        })
        .catch(() => { dueReviewCount = 0; updateReviewBadge(); });
}

function updateReviewBadge() {
    const toggle = document.getElementById('aiToggle');
    if (!toggle) return;
    const existing = document.getElementById('review-badge');
    if (existing) existing.remove();
    if (dueReviewCount > 0) {
        const badge = document.createElement('span');
        badge.id = 'review-badge';
        badge.textContent = ' ' + dueReviewCount;
        badge.style.cssText = 'background:#ef4444;color:#fff;border-radius:8px;padding:0 5px;font-size:8px;font-weight:800;margin-left:2px;';
        toggle.appendChild(badge);
    }
}

async function readChatStream(response) {
    if (!response.ok || !response.body) {
        throw new Error('Stream not available');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;
            try {
                const parsed = JSON.parse(data);
                if (parsed.content !== undefined) {
                    fullText += parsed.content;
                }
            } catch {}
        }
    }

    return fullText;
}

function triggerAutoDebug(errorText, code) {
    if (!errorText || !code) return;
    const out = document.getElementById('output');
    const existingDebug = document.getElementById('ai-auto-debug-btn');
    if (existingDebug) existingDebug.remove();
    const btn = document.createElement('button');
    btn.id = 'ai-auto-debug-btn';
    btn.type = 'button';
    btn.textContent = '🔧 Auto-Debug';
    btn.style.cssText = 'display:block;margin-top:4px;margin-bottom:4px;background:#8b5cf6;color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:9px;font-weight:800;cursor:pointer;';
    btn.onclick = async function() {
        btn.textContent = '🔍 Analyzing...';
        btn.disabled = true;
        const aiPanel = document.getElementById('aiPanel');
        if (aiPanel && !aiPanel.classList.contains('open')) toggleAI();
        addAIMessage('', 'typing');
        try {
            const response = await fetch(BACKEND_URL + '/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Debug this error and suggest a fix. Error: ${errorText.slice(0, 300)}`,
                    lang: currentLang,
                    topic: convSubject || currentTopic,
                    code: code.slice(0, 2000),
                    hasError: true,
                    output: errorText.slice(0, 500),
                    history: []
                })
            });
            const reply = await readChatStream(response);
            removeTypingIndicator();
            if (reply) {
                addAIMessage(reply, 'bot');
            } else {
                const errorQ = `I got this error and need help fixing it:\n\`\`\`\n${errorText.slice(0, 300)}\n\`\`\`\n\nMy code:\n\`\`\`\n${code.slice(0, 800)}\n\`\`\`\n\nWhat went wrong and how do I fix it?`;
                askAI(errorQ);
            }
        } catch {
            removeTypingIndicator();
            const errorQ = `I got this error and need help fixing it. Error: ${errorText.split('\n')[0]}`;
            askAI(errorQ);
        } finally {
            btn.textContent = '🔧 Auto-Debug';
            btn.disabled = false;
        }
    };
    if (out && out.parentNode) {
        out.parentNode.appendChild(btn);
    }
}

function applyAIFix() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    const lastBot = [...conversationHistory].reverse().find(m => m.role === 'bot');
    if (!lastBot || !lastBot.text) return;
    const codeMatch = lastBot.text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (codeMatch) {
        editor.value = codeMatch[1];
        updateHighlight();
        runCode();
    }
}

// Periodically check for due reviews
setInterval(checkDueReviews, 60000);
setTimeout(checkDueReviews, 3000);

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

let lastErrorOutput = '';

function addErrorExplainButton(out, errorText) {
    lastErrorOutput = errorText;
    const btnId = 'ai-explain-error-btn';
    if (document.getElementById(btnId)) return;
    const btn = document.createElement('button');
    btn.id = btnId;
    btn.textContent = '💡 Explain Error';
    btn.style.cssText = 'display:block;margin-top:6px;background:#0ea5e9;color:#000;border:none;border-radius:6px;padding:6px 12px;font-size:10px;font-weight:800;cursor:pointer;';
    btn.onclick = function() {
        const editor = document.getElementById('editor');
        const code = editor ? editor.value : '';
        const aiPanel = document.getElementById('aiPanel');
        if (!aiPanel.classList.contains('open')) toggleAI();
        addAIMessage('', 'typing');
        setTimeout(() => {
            removeTypingIndicator();
            const errorQ = `I got this error: ${errorText.split('\n')[0]}\n\nMy code:\n\`\`\`\n${code.slice(0, 500)}\n\`\`\`\n\nWhat went wrong and how do I fix it?`;
            askAI(errorQ);
        }, 200);
    };
    out.parentNode.appendChild(btn);
}

function appendAutoReview(outEl, code, lang) {
    const result = localCodeReview(code, lang);
    if (result.issues.length === 0) {
        clearAnnotations();
        return;
    }
    updateAnnotations(result.issues);
    let summary = '\n\n// ── Auto Review ──\n';
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;
    const styles = result.issues.filter(i => i.severity === 'style').length;
    if (errors) summary += `// ⛔ ${errors} error(s)`;
    if (warnings) summary += `${errors ? ',' : '// ⚠'} ${warnings} warning(s)`;
    if (styles) summary += `${errors || warnings ? ',' : '// ℹ'} ${styles} style issue(s)`;
    summary += ` | Score: ${result.score}/10`;
    outEl.innerText += summary;
}

var _tutorialLastRunHadError = false;

function runCode() {
    const out = document.getElementById('output');
    const code = document.getElementById('editor').value;
    const existingBtn = document.getElementById('ai-explain-error-btn');
    if (existingBtn) existingBtn.remove();
    _tutorialLastRunHadError = false;
    if (!code.trim()) { out.innerText = "// No code to run"; return; }
    if (currentLang === 'git') {
        out.innerText = processGitCommand(code);
        return;
    }
    setRunLoading(true);
    out.innerText = "// Running...";

    if (currentLang === 'js') {
        let localOut = "";
        const savedLog = console.log;
        try {
            console.log = (m) => localOut += "> " + (typeof m === 'object' ? JSON.stringify(m) : m) + "\n";
            eval(code);
            console.log = savedLog;
            out.innerText = localOut || "(no output)";
            appendAutoReview(out, code, currentLang);
        } catch(e) {
            console.log = savedLog;
            const errMsg = "Error: " + e.message;
            out.innerText = errMsg;
            _tutorialLastRunHadError = true;
            addErrorExplainButton(out, errMsg);
            triggerAutoDebug(errMsg, code);
            appendAutoReview(out, code, currentLang);
        }
        setRunLoading(false);
        if (typeof tutorialRunHook === 'function') tutorialRunHook();
        return;
    }

    fetch(BACKEND_URL + '/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: currentLang, code })
    })
    .then(r => r.json())
    .then(d => {
        out.innerText = d.output;
        _tutorialLastRunHadError = !!(d.error || d.output.includes('Error:') || d.output.includes('FAIL'));
        setRunLoading(false);
        if (typeof tutorialRunHook === 'function') tutorialRunHook();
        if (d.error || d.output.includes('Error:') || d.output.includes('FAIL')) {
            addErrorExplainButton(out, d.output);
            triggerAutoDebug(d.output, code);
        }
        appendAutoReview(out, code, currentLang);
    })
    .catch(e => {
        setRunLoading(false);
        _tutorialLastRunHadError = true;
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
            out.innerText = "// Start the server first:\n//   npx tsx server.ts\n// Then open http://localhost:3000";
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

const TOPIC_KEYWORDS_CLIENT = {
    variable: ['variable', 'variables', 'declare', 'declaration', 'let', 'const', 'var', 'assignment', 'mutable', 'immutable', 'scope'],
    function: ['function', 'functions', 'func', 'method', 'methods', 'def', 'fn', 'return', 'lambda', 'arrow', 'callback', 'callbacks'],
    string: ['string', 'strings', 'str', 'template literal', 'template literals', 'concatenation', 'char', 'text', 'substring'],
    number: ['number', 'numbers', 'int', 'float', 'integer', 'numeric', 'arithmetic', 'math', 'random'],
    boolean: ['boolean', 'booleans', 'bool', 'true', 'false', 'truthy', 'falsy', 'logical', 'comparison', 'condition', 'conditional'],
    array: ['array', 'arrays', 'list', 'lists', 'vector', 'slice', 'splice', 'push', 'pop', 'map', 'filter', 'reduce', 'foreach', 'forEach'],
    object: ['object', 'objects', 'dictionary', 'map', 'hash', 'property', 'key value', 'json', 'record', 'struct', 'prototype'],
    class: ['class', 'classes', 'constructor', 'extend', 'extends', 'inherit', 'inheritance', 'prototype', 'oop'],
    promise: ['promise', 'promises', 'async', 'await', 'then', 'catch', 'future', 'defer', 'callback', 'callbacks'],
    loop: ['loop', 'loops', 'for loop', 'while loop', 'iterate', 'iteration', 'foreach'],
    type: ['type', 'types', 'interface', 'interfaces', 'generic', 'generics', 'enum', 'typedef', 'type annotation', 'static typing', 'typeof'],
    null: ['null', 'undefined', 'nil', 'none', 'option', 'maybe', 'optional'],
    error_handling: ['error handling', 'try catch', 'throw', 'throws', 'except', 'exception', 'exceptions', 'panic', 'result', 'unwrap'],
    io: ['input', 'output', 'file', 'files', 'console', 'print', 'log', 'read', 'write', 'stdin', 'stdout'],
    comment: ['comment', 'comments', 'docstring', 'documentation', 'jsdoc'],
    operator: ['operator', 'operators', 'arithmetic', 'comparison', 'assignment', 'bitwise'],
    recursion: ['recursion', 'recursive', 'stack overflow', 'base case', 'tail call'],
    closure: ['closure', 'closures', 'lexical scope', 'scope chain', 'capture', 'inner function'],
    generics: ['generic', 'generics', 'template', 'templates', 'type parameter', 'type parameters', 'trait bound'],
    pointer: ['pointer', 'pointers', 'reference', 'references', 'memory address', 'dereference', 'borrow', 'borrowing'],
    pattern_match: ['pattern matching', 'match', 'switch', 'destructure', 'destructuring', 'deconstruct'],
    concurrency: ['concurrency', 'concurrent', 'parallel', 'parallelism', 'thread', 'threads', 'goroutine', 'goroutines', 'channel', 'channels'],
    testing: ['testing', 'test', 'tests', 'assert', 'assertion', 'unit test', 'unit tests', 'mock', 'mocks', 'tdd'],
    module: ['module', 'modules', 'import', 'export', 'require', 'package', 'packages', 'namespace', 'crate', 'npm'],
};

function detectTopicInQuery(q) {
    const lower = q.toLowerCase().trim();
    const words = lower.split(/\s+/);

    // Direct single-word or two-word topic query — "variables", "closures", "error handling"
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS_CLIENT)) {
        const phrase = words.join(' ');
        if (keywords.some(kw => kw === phrase || kw === lower || (kw.includes(' ') && phrase.includes(kw)))) {
            return topic;
        }
        if (words.length <= 4 && keywords.some(kw => words.includes(kw))) {
            return topic;
        }
    }

    // Phrase with topic indicator: "what is X", "explain X", "tell me about X", "what about X"
    const hasIndicator = /^(what|how|why|explain|define|tell|describe|show)\b/i.test(lower) || /\b(what about|tell me about|how about|explain|difference between)\b/i.test(lower);
    if (hasIndicator) {
        for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS_CLIENT)) {
            if (keywords.some(kw => kw.length > 2 && lower.includes(kw))) {
                return topic;
            }
        }
    }

    return null;
}

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
    if (!wasOpen) {
        loadChatHistory();
        setTimeout(() => document.getElementById('aiInput').focus(), 100);
        updateAIContext();
        // Proactive due review reminder
        if (dueReviewCount > 0 && conversationHistory.length === 0) {
            setTimeout(() => {
                const msg = `📅 **You have ${dueReviewCount} topic${dueReviewCount > 1 ? 's' : ''} due for review!**\n\nSpaced repetition helps you retain what you've learned. Would you like to:\n\n1️⃣ **Review now** — I'll quiz you on each topic\n2️⃣ **Later** — dismiss this reminder\n\nWhat would you like to do?`;
                addAIMessage(msg, 'bot');
                const el = document.getElementById('aiSuggestions');
                if (el) {
                    el.innerHTML = `<button onclick="startReviewSession()">✅ Review Now</button><button onclick="dismissReviewReminder()">⏰ Later</button>`;
                }
            }, 500);
        }
    }
    if (wasOpen) setTimeout(() => document.getElementById('editor').focus(), 50);
}

function startReviewSession() {
    addAIMessage('Let me review the topics I need to revisit.', 'user');
    addAIMessage('', 'typing');
    fetch(BACKEND_URL + '/api/learner/reviews')
        .then(r => r.json())
        .then(d => {
            removeTypingIndicator();
            if (!d.due || d.due.length === 0) {
                addAIMessage('No topics due for review right now. Great job staying on top of things! 🎉', 'bot');
                return;
            }
            let reply = 'Great, let\'s review! I\'ll quiz you on each topic. Answer and I\'ll tell you if you\'re right.\n\n';
            for (const item of d.due.slice(0, 5)) {
                const parts = item.key.split(':');
                const topicName = parts.slice(2).join(':') || parts[1] || 'unknown';
                reply += `📖 **${topicName}** — last reviewed ${item.lastReviewed ? new Date(item.lastReviewed).toLocaleDateString() : 'never'}\n`;
            }
            reply += '\nSay **"start"** when you\'re ready to begin!';
            addAIMessage(reply, 'bot');
            const el = document.getElementById('aiSuggestions');
            if (el) {
                el.innerHTML = `<button onclick="askAI('Start the review')">🚀 Start Review</button><button onclick="dismissReviewReminder()">⏰ Dismiss</button>`;
            }
        })
        .catch(() => {
            removeTypingIndicator();
            addAIMessage("Couldn't fetch reviews. Make sure the backend is running.", 'bot');
        });
}

function dismissReviewReminder() {
    dueReviewCount = 0;
    updateReviewBadge();
    const el = document.getElementById('aiSuggestions');
    if (el) el.innerHTML = '';
}

let aiCodeId = 0;
function highlightAICode(code, lang) {
    const kw = {
        js: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','this','class','extends','import','export','default','from','async','await','yield','try','catch','finally','throw','typeof','instanceof','in','of','true','false','null','undefined','NaN','delete','void'],
        ts: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','this','class','extends','implements','interface','type','enum','import','export','default','from','async','await','yield','try','catch','finally','throw','typeof','instanceof','in','of','true','false','null','undefined','readonly','public','private','protected','static','abstract'],
        py: ['def','return','if','elif','else','for','while','in','not','and','or','is','None','True','False','class','import','from','as','try','except','finally','raise','with','async','await','yield','lambda','pass','break','continue','global','nonlocal','self','super'],
        go: ['func','return','if','else','for','range','switch','case','break','continue','go','defer','select','chan','map','struct','interface','type','package','import','var','const','nil','true','false','make','new','append','len','cap'],
        rs: ['fn','let','mut','if','else','for','while','loop','match','return','pub','struct','enum','impl','trait','use','mod','as','in','ref','self','super','Some','None','Ok','Err','true','false','let','const','static','unsafe','async','await','move','where'],
        cs: ['public','private','protected','internal','static','void','int','string','bool','float','double','var','class','struct','enum','interface','namespace','using','return','if','else','for','foreach','while','do','switch','case','break','continue','new','this','base','virtual','override','abstract','sealed','readonly','const','async','await','try','catch','finally','throw','get','set','value'],
        swift: ['func','var','let','if','else','for','in','while','switch','case','break','continue','return','class','struct','enum','protocol','extension','import','guard','defer','throw','throws','rethrows','catch','async','await','actor','nonisolated','mutating','self','super','nil','true','false'],
    }[lang] || ['const','let','var','function','return','if','else','for','while','class','import','export','true','false','null','undefined','new','this','try','catch'];
    const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const lines = escaped.split('\n');
    return lines.map(line => {
        const tokens = [];
        let i = 0;
        while (i < line.length) {
            const rest = line.slice(i);
            const sCm = rest.match(/^\/\/.*/);
            if (sCm) { tokens.push('<span class="syn-comment">' + sCm[0] + '</span>'); i += sCm[0].length; continue; }
            const bCm = rest.match(/^\/\*[\s\S]*?\*\//);
            if (bCm) { tokens.push('<span class="syn-comment">' + bCm[0] + '</span>'); i += bCm[0].length; continue; }
            const str = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
            if (str) { tokens.push('<span class="syn-string">' + str[1] + '</span>'); i += str[1].length; continue; }
            const num = rest.match(/^\b(\d+\.?\d*|0x[0-9a-fA-F]+)\b/);
            if (num) { tokens.push('<span class="syn-number">' + num[1] + '</span>'); i += num[1].length; continue; }
            const word = rest.match(/^([a-zA-Z_$][\w$]*)/);
            if (word) {
                if (kw.includes(word[1])) tokens.push('<span class="syn-keyword">' + word[1] + '</span>');
                else tokens.push(word[1]);
                i += word[1].length;
                continue;
            }
            tokens.push(line[i]);
            i++;
        }
        return tokens.join('');
    }).join('\n');
}

function escapeAIHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeAIAttr(text) {
    return escapeAIHtml(text)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeAIHref(url) {
    const decoded = String(url).replace(/&amp;/g, '&').trim();
    if (/^(https?:|mailto:|#)/i.test(decoded)) return escapeAIAttr(decoded);
    return '';
}

function formatAIText(text) {
    if (!text) return '';
    // 1. Extract and protect code blocks
    const codeBlocks = [];
    const noCode = text.replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (match, lang, code) => {
        const idx = codeBlocks.length;
        const safeCode = escapeAIAttr(code);
        const highlighted = highlightAICode(code, lang);
        codeBlocks.push({ lang, code, safeCode, highlighted });
        return `\x00CODEBLOCK${idx}\x00`;
    });
    // 2. Process block-level markdown (headings, horizontal rules, blockquotes, lists)
    const lines = noCode.split('\n');
    let result = '';
    let inList = false;
    let listStack = []; // tracks list types at each nesting level
    let listLevel = 0;
    for (let li = 0; li < lines.length; li++) {
        let line = lines[li];
        const trimmed = line.trim();
        const indent = line.length - line.trimStart().length;
        const listMatch = trimmed.match(/^(\s*[-*+]\s)(.*)$/);
        const orderedMatch = trimmed.match(/^(\s*\d+\.\s)(.*)$/);
        // check if line is a code block placeholder
        const cbPlaceholder = line.match(/^\x00CODEBLOCK(\d+)\x00$/);
        if (cbPlaceholder) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack = []; }
            const cb = codeBlocks[parseInt(cbPlaceholder[1])];
            result += `<div class="ai-code-wrapper"><pre class="ai-code-block"><code>${cb.highlighted}</code></pre><button class="ai-run-code" id="ai-code-${++aiCodeId}" data-code="${cb.safeCode}">Run</button></div>`;
            continue;
        }
        // heading
        const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (hMatch) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack = []; }
            const level = hMatch[1].length;
            result += `<h${level} style="font-size:${14 - level}px;color:#f1f5f9;margin:8px 0 4px;font-weight:800;">${inlineFormat(hMatch[2], codeBlocks, false)}</h${level}>`;
            continue;
        }
        // horizontal rule
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack = []; }
            result += '<hr style="border:none;border-top:1px solid #334155;margin:10px 0;">';
            continue;
        }
        // blockquote
        if (trimmed.startsWith('> ')) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack = []; }
            const content = inlineFormat(trimmed.replace(/^>\s?/, ''), codeBlocks, false);
            result += `<blockquote style="border-left:3px solid var(--accent);margin:6px 0;padding:4px 10px;color:#94a3b8;font-size:11px;">${content}</blockquote>`;
            continue;
        }
        // list item
        const isListItem = listMatch || orderedMatch;
        if (isListItem) {
            const prefix = listMatch ? listMatch[1] : orderedMatch[1];
            const content = listMatch ? listMatch[2] : orderedMatch[2];
            const tag = listMatch ? 'ul' : 'ol';
            if (!inList) { result += `<${tag} style="margin:4px 0;padding-left:20px;">`; inList = true; listStack = [tag]; }
            const formatted = inlineFormat(content, codeBlocks, true);
            result += `<li style="font-size:11px;color:#cbd5e1;margin:2px 0;">${formatted}</li>`;
            // peek ahead for nested content
            continue;
        }
        // empty line in list resets
        if (inList && trimmed === '') {
            result += '</li></ul>'.repeat(listStack.length);
            inList = false;
            listStack = [];
            continue;
        }
        // table
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack = []; }
            // check if next line is a separator row
            const nextLine = lines[li + 1];
            const isSep = nextLine && /^\|[\s:-]+\|/.test(nextLine.trim());
            if (isSep) {
                // find all headers
                const headers = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
                const hHtml = headers.map(h => `<th style="padding:4px 8px;text-align:left;color:#f1f5f9;font-size:10px;font-weight:800;border-bottom:2px solid #334155;">${inlineFormat(h, codeBlocks, false)}</th>`).join('');
                result += `<table style="width:100%;border-collapse:collapse;margin:6px 0;font-size:10px;"><thead><tr>${hHtml}</tr></thead><tbody>`;
                li++; // skip separator
                // read body rows
                while (li + 1 < lines.length) {
                    const rowLine = lines[li + 1].trim();
                    if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break;
                    li++;
                    const cells = rowLine.split('|').filter(c => c.trim()).map(c => c.trim());
                    const rHtml = cells.map(c => `<td style="padding:4px 8px;color:#94a3b8;font-size:10px;border-bottom:1px solid #1e293b;">${inlineFormat(c, codeBlocks, false)}</td>`).join('');
                    result += `<tr>${rHtml}</tr>`;
                }
                result += '</tbody></table>';
                continue;
            }
            // single row table (not preceded by separator)
            const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
            const rHtml = cells.map(c => `<td style="padding:3px 6px;font-size:10px;">${inlineFormat(c, codeBlocks, false)}</td>`).join('');
            result += `<table style="width:100%;border-collapse:collapse;margin:4px 0;"><tr>${rHtml}</tr></table>`;
            continue;
        }
        // default paragraph
        if (inList) { result += '</li></ul>'.repeat(listStack.length); inList = false; listStack = []; }
        if (trimmed !== '') {
            result += `<p style="margin:4px 0;">${inlineFormat(trimmed, codeBlocks, false)}</p>`;
        }
    }
    if (inList) { result += '</li></ul>'.repeat(listStack.length); }
    return result;
}

function inlineFormat(text, codeBlocks) {
    let t = escapeAIHtml(text);
    // inline code
    t = t.replace(/\`([^`]+)\`/g, '<code style="background:#1e293b;color:#a5f3fc;padding:1px 4px;border-radius:3px;font-size:10px;">$1</code>');
    // bold
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#a5f3fc;">$1</strong>');
    // italic
    t = t.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em style="color:#cbd5e1;">$1</em>');
    // links
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
        const href = safeAIHref(url);
        if (!href) return label;
        return `<a href="${href}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">${label}</a>`;
    });
    // inline code block placeholders (shouldn't be here but just in case)
    t = t.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, idx) => {
        const cb = codeBlocks[parseInt(idx)];
        if (cb) return `<div class="ai-code-wrapper"><pre class="ai-code-block"><code>${cb.highlighted}</code></pre><button class="ai-run-code" id="ai-code-${++aiCodeId}" data-code="${cb.safeCode}">Run</button></div>`;
        return '';
    });
    return t;
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.ai-run-code');
    if (btn && btn.dataset.code !== undefined) {
        runCodeFromAI(btn.dataset.code);
    }
});

let aiFeedbackId = 0;

function addAIMessage(text, role, skipSave) {
    const el = document.getElementById('aiMessages');
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-msg-wrapper';
    const div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    if (role === 'bot') {
        const fid = 'fb-' + (++aiFeedbackId);
        const formatted = formatAIText(text);
        const escaped = text.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/"/g, '&quot;').replace(/\n/g, '\\n');
        div.innerHTML = `<div class="label">Devin</div>${formatted}<div class="ai-feedback" id="${fid}"><button onclick="rateAIResponse(this,1,'${fid}')" title="Helpful">👍</button><button onclick="rateAIResponse(this,-1,'${fid}')" title="Not helpful">👎</button></div>`;
        const copyBtn = document.createElement('button');
        copyBtn.className = 'ai-copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1500);
            }).catch(() => {});
        };
        wrapper.appendChild(copyBtn);
    } else if (role === 'user') {
        div.textContent = text;
        const editBtn = document.createElement('button');
        editBtn.className = 'ai-edit-btn';
        editBtn.textContent = '✎';
        editBtn.title = 'Edit and resend';
        editBtn.onclick = function() {
            const input = document.getElementById('aiInput');
            input.value = text;
            autoGrowAIInput(input);
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        };
        wrapper.appendChild(editBtn);
    }
    wrapper.appendChild(div);
    if (role === 'typing') {
        div.id = 'aiTyping';
        div.innerHTML = '<div class="label">Devin</div><span class="typing-dots">● ● ●</span>';
    }
    if (role === 'typing') {
        el.appendChild(div);
    } else {
        el.appendChild(wrapper);
    }
    el.scrollTop = el.scrollHeight;
    if (role !== 'typing' && !skipSave) {
        conversationHistory.push({ role, text });
        if (conversationHistory.length > MAX_HISTORY) {
            conversationHistory.shift();
        }
        saveChatHistory();
    }
}

function rateAIResponse(btn, dir, fid) {
    const container = document.getElementById(fid);
    if (!container) return;
    const buttons = container.querySelectorAll('button');
    const prevDir = container.dataset.rating ? parseInt(container.dataset.rating) : 0;
    if (prevDir === dir) {
        container.dataset.rating = '0';
        buttons.forEach(b => b.classList.remove('voted', 'voted-down'));
    } else {
        container.dataset.rating = String(dir);
        buttons[0].classList.toggle('voted', dir === 1);
        buttons[1].classList.toggle('voted-down', dir === -1);
        buttons[0].classList.toggle('voted-down', false);
        buttons[1].classList.toggle('voted', false);
    }
}

function removeTypingIndicator() {
    const typing = document.getElementById('aiTyping');
    if (typing) typing.remove();
}

// ── Streaming Bot Message ──
let streamingMsgEl = null;
let streamingFullText = '';
let streamAbortController = null;
let isBackendReachable = true;

function stopAIStream() {
    if (streamAbortController) {
        streamAbortController.abort();
        streamAbortController = null;
    }
    document.getElementById('aiStopBtn').style.display = 'none';
    if (streamingMsgEl) {
        const content = streamingMsgEl.querySelector('.streaming-content');
        if (content) {
            const existing = content.innerHTML;
            content.innerHTML = existing + '<span class="streaming-cancelled"> [cancelled]</span>';
        }
        const cursor = streamingMsgEl.querySelector('.streaming-cursor');
        if (cursor) cursor.remove();
        streamingMsgEl.classList.remove('streaming');
        streamingMsgEl = null;
    }
}

function updateAIContext() {
    const el = document.getElementById('aiContext');
    if (!el) return;
    const parts = [];
    if (currentLang && currentLang !== 'challenge' && currentLang !== 'compiler' && currentLang !== 'quiz') {
        parts.push(currentLang.toUpperCase());
    }
    if (currentTopic && currentTopic.length < 20) {
        parts.push(currentTopic);
    }
    el.textContent = parts.length > 0 ? parts.join(' · ') : '';
}

function setOfflineBadge(online) {
    isBackendReachable = online;
    const badge = document.getElementById('aiOfflineBadge');
    const statusLine = document.getElementById('aiStatusLine');
    if (!badge) return;
    if (online) {
        badge.style.display = '';
        badge.style.color = '#4ade80';
        badge.textContent = '✅ Local AI Active · 🔍 Code check ready';
    } else {
        badge.style.display = '';
        badge.style.color = '#fbbf24';
        badge.textContent = '⚠ Server offline — code check only';
    }
}

function exportChatHistory() {
    if (!conversationHistory.length) return;
    let md = `# Devin Chat Export\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
    for (const msg of conversationHistory) {
        const role = msg.role === 'user' ? '**You**' : '**Devin**';
        md += `${role}:\n${msg.text}\n\n---\n\n`;
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devin-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

function createStreamingBotMessage() {
    removeTypingIndicator();
    const el = document.getElementById('aiMessages');
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-msg-wrapper';
    const div = document.createElement('div');
    div.className = 'ai-msg bot streaming';
    div.innerHTML = '<div class="label">Devin</div><span class="streaming-content"></span><span class="streaming-cursor">▊</span>';
    wrapper.appendChild(div);
    el.appendChild(wrapper);
    el.scrollTop = el.scrollHeight;
    streamingMsgEl = div;
    streamingMsgEl._wrapper = wrapper;
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
    const fid = 'fb-' + (++aiFeedbackId);
    const fb = document.createElement('div');
    fb.className = 'ai-feedback';
    fb.id = fid;
    fb.innerHTML = `<button onclick="rateAIResponse(this,1,'${fid}')" title="Helpful">👍</button><button onclick="rateAIResponse(this,-1,'${fid}')" title="Not helpful">👎</button>`;
    streamingMsgEl.appendChild(fb);
    const escaped = text.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/"/g, '&quot;').replace(/\n/g, '\\n');
    const wrapper = streamingMsgEl._wrapper;
    if (wrapper) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'ai-copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1500);
            }).catch(() => {});
        };
        wrapper.appendChild(copyBtn);
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
    const boldMatches = text.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
        for (const bm of boldMatches) {
            const candidate = bm.slice(2, -2);
            if (detectTopicInQuery(candidate)) return candidate;
        }
    }
    return currentTopic || '';
}

function resolveFollowUp(q) {
    if (!convSubject) return q;
    const trimmed = q.trim();
    const lowerTrimmed = trimmed.toLowerCase();
    const newTopic = detectTopicInQuery(trimmed);
    const convSubjectLower = convSubject.toLowerCase();
    if (newTopic) {
        if (!convSubjectLower.startsWith(newTopic)) return q;
    }
    let result = q;
    if (PRONOUN_PATTERN.test(trimmed) || PRONOUN_WORDS.test(trimmed)) {
        result = `${convSubject} ${trimmed}`;
    }
    if (convLang) {
        const langDisplay = LANG_NAMES[convLang];
        if (langDisplay && !lowerTrimmed.includes(langDisplay.toLowerCase()) && !result.toLowerCase().includes(langDisplay.toLowerCase())) {
            const display = langDisplay.charAt(0).toUpperCase() + langDisplay.slice(1);
            result = `in ${display}, ${result.toLowerCase()}`;
        }
    }
    return result;
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
        const result = localCodeExplain(code, currentLang, currentTopic);
        addAIMessage(result.explanation || 'No explanation could be generated.', 'bot');
    });
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
        const result = localCodeReview(code, currentLang);
        addAIMessage(result.review || 'No review could be generated.', 'bot');
    });
}

function checkCode() {
    const editor = document.getElementById('editor');
    const output = document.getElementById('output');
    const code = editor ? editor.value : '';
    if (!code.trim()) {
        output.innerText = "// No code to check — write some code in the editor first!";
        return;
    }

    const result = localCodeReview(code, currentLang);
    updateAnnotations(result.issues);
    const score = result.score;
    let color = '#22c55e';
    if (score < 5) color = '#ef4444';
    else if (score < 7) color = '#f59e0b';

    let text = `// ╔══════════════════════════════════════╗\n`;
    text += `// ║  CODE REVIEW                          ║\n`;
    text += `// ╚══════════════════════════════════════╝\n\n`;
    text += `Score: ${score}/10\n\n`;

    if (result.issues.length === 0) {
        text += `✓ No issues found. Great code!\n`;
    } else {
        const bySev = { error: [], warning: [], style: [], info: [] };
        for (const issue of result.issues) {
            (bySev[issue.severity] || bySev.info).push(issue);
        }
        for (const sev of ['error', 'warning', 'style', 'info']) {
            for (const issue of bySev[sev]) {
                const line = issue.line ? `(line ${issue.line})` : '';
                text += `[${sev.toUpperCase()}] ${line} ${issue.message}\n`;
            }
        }
    }

    text += `\n// ── Overview ──\n`;
    const lines = code.split('\n');
    text += `${lines.length} lines · `;
    if (/\b(function|=>|def\s+\w+|func\s+\w+)\s*\(/.test(code)) text += `has functions · `;
    if (/\bclass\s+/.test(code)) text += `has classes · `;
    text += `score ${score}/10\n\n`;
    text += `// Lines with issues have colored markers in the editor`;

    output.innerText = text;
    output.style.borderLeft = `3px solid ${color}`;
}

let autoSyntaxEnabled = false;
let autoSyntaxTimer = null;

function toggleAutoSyntax() {
    autoSyntaxEnabled = !autoSyntaxEnabled;
    const btn = document.getElementById('auto-syntax-btn');
    if (!btn) return;
    btn.classList.toggle('active', autoSyntaxEnabled);
    if (autoSyntaxEnabled) {
        runAutoSyntax();
    } else {
        clearAnnotations();
    }
}

function runAutoSyntax() {
    if (!autoSyntaxEnabled) return;
    const editor = document.getElementById('editor');
    const code = editor ? editor.value : '';
    if (code.trim()) {
        const result = localCodeReview(code, currentLang);
        updateAnnotations(result.issues.filter(i => i.severity === 'error' || i.severity === 'warning'));
    }
}

function scheduleAutoSyntax() {
    if (!autoSyntaxEnabled) return;
    clearTimeout(autoSyntaxTimer);
    autoSyntaxTimer = setTimeout(runAutoSyntax, 500);
}

function jumpToLine(line) {
    const editor = document.getElementById('editor');
    if (!editor) return;
    const lines = editor.value.split('\n');
    let pos = 0;
    for (let i = 0; i < Math.min(line - 1, lines.length); i++) {
        pos += lines[i].length + 1;
    }
    editor.focus();
    editor.setSelectionRange(pos, pos);
    editor.scrollTop = (line - 1) * 20;
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

function getErrorTutorTip(topic, output) {
    const normalizedTopic = topic ? topic.toLowerCase() : '';

    for (const pattern of ERROR_PATTERNS) {
        if (pattern.re.test(output || '')) {
            return `I see you got a **${pattern.title}**! Don't worry, this is totally normal. Let's fix it together.\n\n${pattern.tip}\n\n**Still stuck?** Share what you expected to happen vs what actually happened and I'll help more!`;
        }
    }

    const tips = {
        "variables": "Getting an error with variables? Common issues:\n- Did you declare it with `let`/`const`/`var` (JS) or just `name = value` (Python)?\n- Check the spelling — `myVariable` vs `myvariable` are different!\n- Make sure you declared it before trying to use it (variables aren't hoisted with `let`/`const`)\n\n**Try:** Declare a simple variable and log it. Once that works, add complexity step by step.",
        "functions": "Functions can be tricky! Check these:\n- Do you have the `function` keyword (JS) or `def` (Python)?\n- Did you use `return` to send back a value? Without it, the function returns `undefined`.\n- Did you call it with parentheses? `myFunc` is the function itself, `myFunc()` calls it.\n\n**Try:** Write the simplest possible function that returns a fixed value, then gradually add parameters.",
        "loops": "Loop errors usually come from:\n- **Infinite loop:** is your counter actually changing? `for (let i=0; i<10; i++)` — don't forget the `i++`!\n- **Off-by-one:** using `<=` when you need `<` (or vice versa)\n- **Wrong array index:** arrays start at 0, so `arr[arr.length]` is out of bounds\n\n**Try:** Write a loop that just prints the numbers 0-4. Once that works, add your logic.",
        "arrays": "Array issues are often:\n- **Out of bounds:** `arr[arr.length]` doesn't exist — last index is `arr.length - 1`\n- **Using `delete`:** `delete arr[i]` leaves a hole — use `.splice()` instead\n- **Confusing indexOf:** returns `-1` when not found, which is truthy!\n\n**Try:** Create an array of 3 items, log each item in a loop, then try adding/removing items.",
        "strings": "String gotchas:\n- **Immutability:** `str.toUpperCase()` returns a NEW string — the original stays the same\n- **Concatenation vs addition:** `'5' + 3 = '53'`, not 8! Use `Number()` to convert\n- **Off-by-one:** `str.slice(1, 3)` gives characters at index 1 and 2 (end is exclusive)\n\n**Try:** Create a string variable and try different methods on it to see what each returns.",
        "classes": "Class errors are usually:\n- **Missing `new`:** `const obj = MyClass()` vs `const obj = new MyClass()`\n- **`this` context:** inside callbacks, `this` might not be what you expect — use arrow functions\n- **Forgetting `constructor`:** the constructor runs when you create a new instance\n\n**Try:** Create the simplest possible class with one property and one method, then build up.",
    };

    for (const [key, tip] of Object.entries(tips)) {
        if (normalizedTopic.includes(key)) {
            return "I see you're getting an error. Don't worry, this is totally normal! Let's work through it together.\n\n" + tip + "\n\n**Still stuck?** Share what you expected to happen vs what actually happened and I'll help more!";
        }
    }

    return "I noticed your code has an error. That's okay — debugging is how we learn!\n\n**Quick check:**\n1. Look at the error message — what line does it point to?\n2. Compare your code with the example in the curriculum\n3. Simplify: comment things out until it works, then add back one piece at a time\n\n**Can you tell me:** what did you expect to happen, and what actually happened?";
}

async function askAI(q) {
    streamingFullText = '';
    const enrichedQ = resolveFollowUp(q);
    const detectedLang = detectLanguageInQuery(q.toLowerCase());
    if (detectedLang) convLang = detectedLang;
    const detectedTopic = detectTopicInQuery(q);
    if (detectedTopic) {
        const TOPIC_CURRICULUM_NAMES = {
            variable: 'var let const', function: 'Function Declarations',
            string: 'String Methods', number: 'Math & Number',
            boolean: 'Truthy & Falsy', array: 'Array Methods',
            object: 'Objects', class: 'Classes', promise: 'Promises',
            loop: 'for Loops', type: 'Primitive Types',
            null: 'null vs undefined', error_handling: 'Error Handling',
            io: 'Console Debugging', comment: 'Syntax & Comments',
            operator: 'Arithmetic Operators', recursion: 'Iterators & Generators',
            closure: 'Closures', generics: 'Spread & Rest',
            pointer: 'Reference Types', pattern_match: 'Destructuring',
            concurrency: 'Async/Await', testing: 'Console Debugging',
            module: 'ES Modules',
        };
        const topicName = TOPIC_CURRICULUM_NAMES[detectedTopic] ||
            (detectedTopic.charAt(0).toUpperCase() + detectedTopic.slice(1).replace(/_/g, ' '));
        convSubject = topicName;
    }
    addAIMessage(q, 'user');

    const editor = document.getElementById('editor');
    const currentCode = editor ? editor.value : '';
    const output = document.getElementById('output');
    const outputText = output ? output.innerText : '';
    const hasError = outputText.includes('Error:') || outputText.includes('ERROR') || outputText.includes('SyntaxError') || outputText.includes('ReferenceError') || outputText.includes('TypeError') || outputText.includes('FAIL');

    const setConvSubject = (reply) => {
        if (reply) setTimeout(() => extractConversationSubject(reply), 0);
    };

    // ── Exercise tutoring: detect if user loaded an exercise and ran it ──
    const isExerciseMode = currentTopic && lastCodeRun && lastCodeOutput &&
        (q.includes('my code') || q.includes('i tried') || q.includes('not working') || q.includes('help me'));

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
    streamAbortController = new AbortController();
    document.getElementById('aiStopBtn').style.display = '';
    setOfflineBadge(true);
    try {
        const response = await fetch(BACKEND_URL + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: streamAbortController.signal,
            body: JSON.stringify({
                message: enrichedQ,
                lang: convLang || currentLang,
                topic: convSubject || currentTopic,
                phase: currentPhase,
                code: currentCode,
                output: outputText,
                hasError: hasError,
                history: conversationHistory.slice(-8),
                learnerId: LEARNER_ID
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
        document.getElementById('aiStopBtn').style.display = 'none';
        streamAbortController = null;
        extractConversationSubject(streamingFullText);
        finalizeStreamingBotMessage(streamingFullText);
    } catch (e) {
        document.getElementById('aiStopBtn').style.display = 'none';
        streamAbortController = null;
        if (e.name === 'AbortError') {
            if (streamingMsgEl) {
                streamingMsgEl.remove();
                streamingMsgEl = null;
            }
            return;
        }
        setOfflineBadge(false);
        // ── 5. Fallback to local keyword responses ──
        if (streamingMsgEl) {
            streamingMsgEl.remove();
            streamingMsgEl = null;
        }
        const fallbackReply = getAIResponse(enrichedQ, conversationHistory);
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

function autoGrowAIInput(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function sendAI() {
    const input = document.getElementById('aiInput');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    autoGrowAIInput(input);
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
    oop: ["What is inheritance?", "Polymorphism explained", "Encapsulation guide", "Abstract vs interface", "Composition vs inheritance"],
    gamedev: ["ECS explained simply", "Game loop patterns", "Physics for beginners", "Optimization tips"],
    godot: ["GDscript basics", "Scene system explained", "Signals vs groups", "Practice: build a scene"],
    unity: ["MonoBehaviour lifecycle", "Prefab system guide", "Unity Physics tips", "Practice: build a prefab"],
    unreal: ["Blueprint vs C++", "Chaos physics guide", "UMG UI basics", "Practice: build a widget"],
    mobile: ["Touch input handling", "Mobile optimization", "Battery life tips", "Store submission guide"],
    react: ["What is JSX?", "useState vs useReducer", "Props vs state", "Practice: build a component"],
    vue: ["Reactivity explained", "Composition API guide", "Vue Router basics", "Practice: build a component"],
    node: ["What is Node.js?", "Express basics", "File system guide", "Practice: build a server"],
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
            "DOM": ["What is the DOM?", "Query selectors guide", "Event listeners explained", "Practice: manipulate the DOM"],
            "Events": ["Event types explained", "Event delegation", "Event propagation (bubbling)", "Practice: handle a click"],
            "Promises": ["What is a Promise?", "Promise chaining", "Promise.all explained", "Practice: use a Promise"],
            "Modules": ["Import vs require", "Named vs default exports", "Module bundlers explained", "Practice: create a module"],
            "JSON": ["JSON.parse vs stringify", "Working with JSON data", "Fetching JSON from APIs", "Practice: parse JSON"],
            "Fetch": ["How to use fetch()", "GET vs POST requests", "Handling responses", "Practice: call an API"],
            "Closures": ["What is a closure?", "Lexical scope explained", "Practical closure examples", "Practice: write a closure"],
            "Prototypes": ["Prototype chain explained", "Proto vs prototype", "ES6 classes are syntactic sugar", "Practice: prototype method"],
            "this": ["How 'this' works", "Arrow functions vs this", "Call, apply, bind", "Practice: control 'this'"],
            "Map": ["Map vs Object", "Map methods guide", "Set data structure", "Practice: use Map and Set"],
            "Generators": ["What is a generator?", "Yield keyword explained", "Generator use cases", "Practice: write a generator"],
            "Regex": ["Common regex patterns", "Test vs exec", "Groups and capture", "Practice: regex exercise"],
            "Web APIs": ["LocalStorage guide", "Geolocation API", "Canvas basics", "Practice: use a Web API"],
            "Strict Mode": ["What is strict mode?", "Benefits of strict mode", "Common strict mode errors", "Practice: use strict"],
            "Template Literals": ["String interpolation", "Multi-line strings", "Tagged templates", "Practice: template literals"],
            "Destructuring": ["Array destructuring", "Object destructuring", "Nested destructuring", "Practice: destructure data"],
            "Spread": ["Spread operator guide", "Rest parameters", "Spread vs concat", "Practice: use spread"],
            "Ternary": ["Ternary operator syntax", "When to use ternary", "Nested ternaries", "Practice: use ternary"],
            "Nullish": ["Nullish coalescing ??", "Optional chaining ?.", "Logical OR vs ??", "Practice: use ?. and ??"],
            "Truthy": ["Truthy and falsy values", "Equality comparisons", "Type coercion explained", "Practice: check truthiness"],
            "Scope": ["Global vs local scope", "Block scope with let/const", "Hoisting explained", "Practice: scope exercise"],
            "Hoisting": ["What is hoisting?", "Var vs let hoisting", "Function declarations hoisted", "Practice: hoisting quiz"],
            "IIFE": ["What is an IIFE?", "Module pattern with IIFE", "Private variables", "Practice: write an IIFE"],
            "Memoization": ["What is memoization?", "Caching function results", "Performance optimization", "Practice: memoize a function"],
            "Debounce": ["What is debouncing?", "Debounce vs throttle", "Real-world use cases", "Practice: debounce input"],
        };
        const topicLC = currentTopic.toLowerCase();
        for (const [key, hints] of Object.entries(topHints)) {
            if (topicLC.includes(key.toLowerCase())) return hints;
        }
        return [`Explain ${currentTopic}`, `Practice: ${currentTopic.toLowerCase()} exercise`, "Show me an example", "Common mistakes"];
    }

    if (outputText.includes('PASS') || outputText.includes('Challenge solved')) {
        return ["What should I learn next?", "Explain the concept behind this", "Show me a harder challenge", "Practice more exercises"];
    }
    return null;
}

// ── Learning Path ──
function showLearningPath() {
    const lang = currentLang || 'js';
    const aiPanel = document.getElementById('aiPanel');
    if (!aiPanel.classList.contains('open')) toggleAI();

    addAIMessage('Show me my learning path', 'user');
    addAIMessage('', 'typing');

    fetch(BACKEND_URL + '/api/learner/path?lang=' + lang, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(r => r.json())
    .then(d => {
        removeTypingIndicator();
        if (d.error) {
            addAIMessage("Couldn't generate your learning path. Make sure the backend is running.", 'bot');
            return;
        }
        let reply = `<div class="path-card" style="background:#1e293b;border-radius:10px;padding:12px;margin:8px 0;">`;
        reply += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:11px;font-weight:800;color:var(--accent);">📚 Your Learning Path</span>
            <span style="font-size:10px;color:#94a3b8;">${d.progress.completed}/${d.progress.total} (${d.progress.percent}%)</span>
        </div>`;
        const pct = d.progress.percent;
        reply += `<div style="height:4px;background:#0f172a;border-radius:2px;margin-bottom:10px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:2px;transition:width 0.5s;"></div>
        </div>`;
        if (d.nextSteps && d.nextSteps.length > 0) {
            reply += `<div style="font-size:9px;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Next Steps</div>`;
            for (const step of d.nextSteps) {
                const icon = step.status === 'completed' ? '✅' : step.status === 'ready' ? '→' : '🔒';
                const color = step.status === 'completed' ? '#10b981' : step.status === 'ready' ? 'var(--accent)' : '#64748b';
                const reason = step.reason === 'review-due' ? ' (review due)' : step.reason === 'weak-concept' ? ' (needs practice)' : '';
                reply += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:10px;color:${color};">
                    <span>${icon}</span>
                    <span>${step.topic}${reason}</span>
                </div>`;
            }
        }
        if (d.weakAreas && d.weakAreas.length > 0) {
            reply += `<div style="font-size:9px;color:#ef4444;text-transform:uppercase;margin:8px 0 4px;">Weak Areas</div>`;
            for (const w of d.weakAreas) {
                reply += `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:10px;color:#fbbf24;">
                    <span>⚠</span>
                    <span>${w.topic} (${w.mastery}%)</span>
                </div>`;
            }
        }
        reply += `</div>`;
        addAIMessage(reply, 'bot');
    })
    .catch(() => {
        removeTypingIndicator();
        addAIMessage("Couldn't fetch your learning path. Make sure the backend is running.", 'bot');
    });
}

// ── AI Quiz Generation ──
function generateQuiz() {
    const topic = currentTopic || 'programming basics';
    const lang = currentLang || 'js';
    const aiPanel = document.getElementById('aiPanel');
    if (!aiPanel.classList.contains('open')) toggleAI();

    addAIMessage(`Generate a quiz for ${topic}`, 'user');
    addAIMessage('', 'typing');

    fetch(BACKEND_URL + '/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lang, count: 3, level: 'beginner' })
    })
    .then(r => r.json())
    .then(d => {
        removeTypingIndicator();
        if (!d.questions || d.questions.length === 0) {
            addAIMessage("Couldn't generate a quiz right now. Try asking about a specific topic!", 'bot');
            return;
        }
        let reply = '<div class="quiz-card" style="background:#1e293b;border-radius:10px;padding:12px;margin:8px 0;">';
        reply += `<div style="font-size:9px;color:#64748b;text-transform:uppercase;margin-bottom:8px;">📝 Quiz: ${topic}</div>`;
        for (let qi = 0; qi < d.questions.length; qi++) {
            const q = d.questions[qi];
            const qid = 'ai-quiz-' + qi;
            reply += `<div style="margin-bottom:12px;font-size:11px;"><strong>${qi + 1}. ${q.question}</strong><br>`;
            for (let oi = 0; oi < q.options.length; oi++) {
                const optId = `${qid}-opt-${oi}`;
                reply += `<label style="display:block;padding:4px 8px;margin:2px 0;border-radius:4px;cursor:pointer;background:#0f172a;font-size:10px;" onclick="document.querySelectorAll('#${qid} label').forEach(l=>l.style.background='#0f172a'); this.style.background='#334155'; window['${qid}_selected']=${oi};" id="${optId}">
                    <input type="radio" name="${qid}" style="display:none;"> ${q.options[oi]}
                </label>`;
            }
            reply += `<button style="margin-top:4px;background:#0ea5e9;color:#000;border:none;border-radius:4px;padding:2px 8px;font-size:9px;font-weight:800;cursor:pointer;" onclick="checkQuizAnswer(${qi}, ${q.correctIndex}, '${qid}', '${q.explanation.replace(/'/g, "\\'")}')">Check</button>`;
            reply += `<span id="${qid}-result" style="margin-left:6px;font-size:10px;"></span>`;
            reply += `</div>`;
        }
        reply += `</div>`;
        reply += `<div style="font-size:9px;color:#64748b;margin-top:4px;">${d.source === 'static' ? '⚡ Static quiz' : '✨ AI-generated'}</div>`;
        addAIMessage(reply, 'bot');
    })
    .catch(() => {
        removeTypingIndicator();
        addAIMessage("Couldn't generate a quiz. Make sure the backend is running.", 'bot');
    });
}

function checkQuizAnswer(qi, correctIdx, qid, explanation) {
    const selected = window[qid + '_selected'];
    const result = document.getElementById(qid + '-result');
    if (result === null || result === void 0 ? void 0 : result) {
        if (selected === correctIdx) {
            result.innerHTML = '✅ Correct!';
            result.style.color = '#10b981';
        } else {
            result.innerHTML = '❌ Try again. ' + (explanation || '');
            result.style.color = '#ef4444';
        }
    }
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
        const result = localGenerateExercise(topic, lang, 'beginner');
        let reply = `<div class="exercise-card"><div class="exercise-title">${result.title || 'Exercise'}</div>`;
        reply += `<div class="exercise-desc">${result.description || 'No description'}</div>`;
        if (result.starterCode) {
            reply += `<pre class="ai-code-block"><code>${result.starterCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        }
        if (result.hint) {
            reply += `<div class="exercise-hint">💡 ${result.hint}</div>`;
        }
        reply += `<button class="exercise-btn" onclick="document.getElementById('editor').value = '${(result.starterCode || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'; updateHighlight();">Load into Editor</button>`;
        reply += `</div>`;
        addAIMessage(reply, 'bot');
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
    const hasAI = currentLang && currentLang !== 'compiler' && currentLang !== 'challenge' && currentLang !== 'quiz';
    const buttons = suggestions.map(s => `<button onclick="askAI('${s.replace(/'/g, "\\'")}')">${s}</button>`);
    if (hasAI) {
        const hasExercise = currentTopic && !suggestions.some(s => s.toLowerCase().includes('exercise'));
        if (hasExercise) buttons.push(`<button onclick="generateExercise()" style="background:#0ea5e9;color:#000;">✨ Exercise</button>`);
        if (currentTopic) buttons.push(`<button onclick="generateQuiz()" style="background:#f59e0b;color:#000;">📝 Quiz</button>`);
        buttons.push(`<button onclick="showLearningPath()" style="background:#8b5cf6;color:#000;">📚 Path</button>`);
    }
    buttons.push(`<button class="ai-dismiss-btn" onclick="document.getElementById('aiSuggestions').innerHTML=''" title="Dismiss suggestions">✕</button>`);
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
        const savedLog = console.log;
        let captured = '';
        try {
            console.log = (m) => captured += "> " + (typeof m === 'object' ? JSON.stringify(m) : m) + "\n";
            eval(code);
            console.log = savedLog;
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
            console.log = savedLog;
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

        let matchesPlatform = true;
        if (currentMobilePlatform !== 'all') {
            const prefix = currentMobilePlatform === 'android' ? 'Android:' : 'iOS:';
            const phase = btn.dataset.phase || '';
            matchesPlatform = phase === '' || phase.startsWith(prefix) || (!phase.startsWith('Android:') && !phase.startsWith('iOS:'));
        }

        const show = matchesSearch && matchesLevel && matchesCompletion && matchesPlatform;
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
let currentAnnotations = [];

function updateAnnotations(issues) {
    currentAnnotations = issues || [];
    updateHighlight();
}

function clearAnnotations() {
    currentAnnotations = [];
    updateHighlight();
}

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
        hideCompletions();
    });
    hlEditor = textarea;
    textarea.addEventListener('input', function() {
        if (autoSyntaxEnabled) {
            scheduleAutoSyntax();
        } else if (currentAnnotations.length > 0) {
            clearAnnotations();
        }
    });
    updateHighlight();
}

function updateHighlight() {
    if (!hlOverlay) return;
    const code = hlEditor ? hlEditor.value : document.getElementById('editor').value;
    let html = highlightEditorCode(code, currentLang);
    if (currentAnnotations.length > 0) {
        const lines = html.split('\n');
        for (const ann of currentAnnotations) {
            const idx = ann.line - 1;
            if (idx >= 0 && idx < lines.length) {
                lines[idx] = `<span class="annotation-${ann.severity}" title="${(ann.message || '').replace(/"/g, '&quot;')}">${lines[idx]}</span>`;
            }
        }
        html = lines.join('\n');
    }
    hlOverlay.firstChild.innerHTML = html;
    if (hlEditor) {
        hlOverlay.scrollTop = hlEditor.scrollTop;
        hlOverlay.scrollLeft = hlEditor.scrollLeft;
    }
}

function highlightEditorCode(code, lang) {
    const kws = LANG_KEYWORDS[lang] || LANG_KEYWORDS.js;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokens = [];
    let i = 0;
    while (i < escaped.length) {
        const rest = escaped.slice(i);
        const newl = rest.match(/^\n/);
        if (newl) { tokens.push('\n'); i++; continue; }
        const wsp = rest.match(/^[ \t]+/);
        if (wsp) { tokens.push(wsp[0]); i += wsp[0].length; continue; }
        const bCm = rest.match(/^\/\*[\s\S]*?\*\//);
        if (bCm) { tokens.push('<span class="hl-comment">' + bCm[0] + '</span>'); i += bCm[0].length; continue; }
        const sCm = rest.match(/^\/\/[^\n]*/);
        if (sCm) { tokens.push('<span class="hl-comment">' + sCm[0] + '</span>'); i += sCm[0].length; continue; }
        const hCm = rest.match(/^#[^\n]*/);
        if (hCm && ['py','rs','sh','bash'].includes(lang)) { tokens.push('<span class="hl-comment">' + hCm[0] + '</span>'); i += hCm[0].length; continue; }
        const sqlCm = rest.match(/^--[^\n]*/);
        if (sqlCm && ['pg','mysql','sqlite'].includes(lang)) { tokens.push('<span class="hl-comment">' + sqlCm[0] + '</span>'); i += sqlCm[0].length; continue; }
        const str = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
        if (str) { tokens.push('<span class="hl-string">' + str[0] + '</span>'); i += str[0].length; continue; }
        const num = rest.match(/^\b(0x[0-9a-fA-F]+|\d+\.?\d*)\b/);
        if (num) { tokens.push('<span class="hl-number">' + num[0] + '</span>'); i += num[0].length; continue; }
        const word = rest.match(/^([a-zA-Z_$][\w$]*)/);
        if (word) {
            if (kws.some(k => k.toLowerCase() === word[1].toLowerCase())) {
                tokens.push('<span class="hl-keyword">' + word[1] + '</span>');
            } else {
                tokens.push(word[1]);
            }
            i += word[1].length;
            continue;
        }
        tokens.push(escaped[i]);
        i++;
    }
    return tokens.join('');
}

// ── Compiler Pipeline ──
function compilerRunPipeline(stage) {
    const editor = document.getElementById('editor');
    const code = editor ? editor.value : '';
    const lang = currentLang === 'compiler' ? (window._pipelineLang || 'js') : currentLang;
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

let _prevModeForApi = null;

setMode = function(lang) {
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('editor').style.display = 'block';
    document.getElementById('output').style.display = 'block';
    document.getElementById('compiler-output').style.display = 'none';
    document.getElementById('compiler-buttons').style.display = 'none';
    document.getElementById('tutorial-nav').style.display = 'none';
    document.getElementById('tutorial-progress').style.display = 'none';
    document.getElementById('tutorial-quiz-overlay')?.classList.remove('open');
    document.getElementById('tutorial-resume-overlay')?.classList.remove('open');
    document.getElementById('cheatsheet-btn').style.display = '';
    document.getElementById('schema-btn').style.display = '';
    const stuckPanel = document.getElementById('tutorial-stuck-panel');
    if (stuckPanel) stuckPanel.remove();
    if (typeof tutorialManager !== 'undefined' && tutorialManager) tutorialManager.clearStuckTimer();

    document.querySelectorAll('.header-extra-tabs .game-nav-btn').forEach(b => b.classList.remove('active'));

    roadmapRendered = false;
    const roadmapBtn = document.getElementById('roadmap-btn');
    if (roadmapBtn) {
        roadmapBtn.style.display = '';
        roadmapBtn.title = 'View ' + (LANG_NAMES[lang] || lang) + ' Roadmap';
        roadmapBtn.style.display = (lang === 'js' || lang === 'ts' || lang === 'go' || lang === 'cpp' || lang === 'swift') ? '' : 'none';
        roadmapBtn.title = lang === 'ts' ? 'View TypeScript Roadmap' : lang === 'go' ? 'View Go Roadmap' : lang === 'cpp' ? 'View C++ Roadmap' : lang === 'swift' ? 'View Swift Roadmap' : 'View JavaScript Roadmap';
    }
    const searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.style.display = '';

    if (lang === 'tutorial') {
        document.getElementById('level-bar').style.display = 'none';
        document.getElementById('tutorial-nav').style.display = 'flex';
        document.getElementById('tutorial-progress').style.display = 'flex';
        const tutorialNavBtn = document.getElementById('nav-tutorial');
        if (tutorialNavBtn) tutorialNavBtn.classList.add('active');
        const apiBtn = document.getElementById('api-toggle-btn');
        if (apiBtn) apiBtn.style.display = 'none';
        initTutorial();
        updateAISuggestions();
        return;
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
    const apiBtn = document.getElementById('api-toggle-btn');
    if (apiBtn) apiBtn.style.display = 'none';
    if (lang === 'quiz') { document.getElementById('level-bar').style.display = 'flex'; initQuiz(); updateAISuggestions(); return; }
    if (lang === 'challenge') { initChallenge(); updateAISuggestions(); return; }
    if (lang === 'game') { document.getElementById('level-bar').style.display = 'none'; initGame(); updateAISuggestions(); return; }
    if (lang === 'oop') { document.getElementById('level-bar').style.display = 'none'; initOOPSession(); updateAISuggestions(); return; }
    if (lang === 'db') { document.getElementById('level-bar').style.display = 'none'; initDatabase(); updateAISuggestions(); return; }
    if (lang === 'techstack') { document.getElementById('level-bar').style.display = 'none'; initTechStack(); updateAISuggestions(); return; }
    if (lang === 'git') { document.getElementById('level-bar').style.display = 'none'; initGitVisualize(); updateAISuggestions(); return; }
    if (lang === 'schema') { document.getElementById('level-bar').style.display = 'none'; initSchemaTutorial(); return; }
    if (lang === 'api') { initAPI(); updateAISuggestions(); 
        const apiBtn = document.getElementById('api-toggle-btn');
        if (apiBtn) { apiBtn.style.display = ''; apiBtn.textContent = 'API ▾'; }
        const backBtn = document.getElementById('api-back-btn');
        if (backBtn) backBtn.style.display = '';
        return; 
    }
    let prefixHtml = '';
    if (lang === 'compiler') {
        document.getElementById('level-bar').style.display = 'none';
        document.getElementById('output').style.display = 'none';
        document.getElementById('compiler-output').style.display = 'block';
        document.getElementById('compiler-buttons').style.display = 'flex';
        document.getElementById('schemaDesigner').classList.remove('open');
        document.getElementById('editor').style.display = 'block';
        currentLang = 'compiler';
        window._pipelineLang = 'js';
        document.getElementById('app').className = 'compiler-mode';
        document.getElementById('header-title').innerText = 'COMPILER';
        document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
        const navBtn = document.getElementById('nav-compiler');
        if (navBtn) navBtn.classList.add('active');
        const cb = document.getElementById('compiler-buttons');
        if (cb && !cb.querySelector('.pipeline-lang-picker')) {
            const langs = [
                ['js','JS'],['py','Python'],['go','Go'],['rs','Rust'],['ts','TypeScript'],
                ['c','C'],['cpp','C++'],['cs','C#'],['kt','Kotlin'],['swift','Swift'],
                ['zig','Zig'],['pg','SQL'],['dk','Docker'],['git','Git'],
                ['mongodb','MongoDB'],['gamedev','GameDev']
            ];
            const opts = langs.map(([v,l]) => `<option value="${v}"${v==='js'?' selected':''}>${l}</option>`).join('');
            cb.insertAdjacentHTML('afterbegin', `<select class="pipeline-lang-picker" onchange="window._pipelineLang=this.value">${opts}</select>`);
        }
        const langData = courseData.compiler || {};
        let html = '';
        for (const phase in langData) {
            const topics = Object.keys(langData[phase]);
            html += `<div class="phase-header" data-phase="${phase}" onclick="togglePhase('${phase}','${phase}')"><span class="phase-toggle">▼</span><span class="phase-label-text">${phase}</span><span class="phase-count">${topics.length}</span></div>`;
            for (const topic in langData[phase]) {
                html += `<button class="item-btn" data-phase="${phase}" id="btn-${topic.replace(/\s/g, '')}" onclick="loadTopic('${phase}', '${topic}')"><span class="topic-name">${topic}</span></button>`;
            }
        }
    document.getElementById('topic-list').innerHTML = (prefixHtml || '') + html;
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
    currentTopic = null;
    currentPhase = null;
    document.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active-topic'));
    document.getElementById('explanation').innerHTML = '<div style="color:#64748b;font-size:13px;padding:20px;text-align:center;">' + (LANG_NAMES[lang] || lang) + ' — select a topic to begin</div>';
    document.getElementById('editor').value = '// ' + (LANG_NAMES[lang] || lang) + ' — select a topic below';
    updateHighlight();
    document.getElementById('output').innerText = '// Ready to learn ' + (LANG_NAMES[lang] || lang);
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
    prefixHtml = '';
    if (lang === 'backend') {
        prefixHtml = `<div class="phase-header" onclick="setMode('api')" style="cursor:pointer;color:#f97316;border-color:#f97316;">
            <span class="phase-toggle">▶</span>
            <span class="phase-label-text" style="font-style:italic;color:#f97316;">API Client</span>
        </div>`;
    }
    renderTopicList(lang, prefixHtml);

    // Show API toggle button only in backend mode
    if (apiBtn) {
        apiBtn.style.display = lang === 'backend' ? '' : 'none';
        if (lang === 'backend') apiBtn.textContent = 'API ▸';
    }
    const backBtn = document.getElementById('api-back-btn');
    if (backBtn) backBtn.style.display = 'none';

    updateAISuggestions();
    updateAIContext();
    loadLangIntro(lang === 'mobile' ? currentMobilePlatform : lang);
};

function renderTopicList(lang, prefixHtml) {
    const langData = courseData[lang] || {};
    const phases = Object.keys(langData);
    const totalPhases = phases.length;
    const third = Math.max(1, Math.ceil(totalPhases / 3));
    const phaseLevels = {};
    phases.forEach((phase, i) => {
        if (i < third) phaseLevels[phase] = 'beginner';
        else if (i < third * 2) phaseLevels[phase] = 'intermediate';
        else phaseLevels[phase] = 'expert';
    });
    let html = '';
    const langDisplay = LANG_NAMES[lang] || lang;
    html += `<div class="phase-header" onclick="loadLangIntro('${lang}')" style="cursor:pointer;">
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
    const isOpen = menu.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const editor = document.getElementById('editor');
        if (editor && document.activeElement === editor) {
            e.preventDefault();
            runCode();
        }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const panel = document.getElementById('aiPanel');
        if (panel) {
            const wasOpen = panel.classList.contains('open');
            toggleAI();
            if (!wasOpen) updateAIContext();
        }
    }
    if (e.key === 'Escape') {
        const aiPanel = document.getElementById('aiPanel');
        if (aiPanel && aiPanel.classList.contains('open') && !document.activeElement?.id?.startsWith('ai')) {
            if (streamAbortController) {
                stopAIStream();
                return;
            }
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

// ── API CLIENT TOGGLE ──
function toggleAPIClient() {
    const btn = document.getElementById('api-toggle-btn');
    if (currentLang === 'api') {
        const prev = _prevModeForApi || 'backend';
        _prevModeForApi = null;
        setMode(prev);
        if (btn) btn.textContent = 'API ▸';
    } else {
        _prevModeForApi = currentLang;
        setMode('api');
    }
}

// ── ROADMAP VIEW ──

function toggleRoadmapView() {
    const overlay = document.getElementById('roadmapOverlay');
    const btn = document.getElementById('roadmap-btn');
    const wasOpen = overlay.classList.contains('open');

    overlay.classList.toggle('open');
    if (btn) btn.classList.toggle('active', !wasOpen);

    if (!wasOpen) {
        const body = document.getElementById('roadmapBody');
        const title = document.getElementById('roadmap-title');
        const langName = LANG_NAMES[currentLang] || currentLang;
        if (title) title.textContent = langName.charAt(0).toUpperCase() + langName.slice(1) + ' Roadmap';
        roadmapRendered = false;
        renderRoadmap(body, currentLang);
    }
}

function renderRoadmap(container, lang) {
    const langData = courseData[lang];
    if (!langData) return;

    const langName = lang === 'ts' ? 'TypeScript' : lang === 'go' ? 'Go' : lang === 'cpp' ? 'C++' : lang === 'swift' ? 'Swift' : 'JavaScript';
    const titleEl = document.getElementById('roadmapTitle');
    if (titleEl) titleEl.textContent = langName + ' Roadmap';

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
    cicd: {
        name: 'CI/CD',
        what: 'CI/CD (Continuous Integration/Continuous Delivery) is an automated software delivery method that bridges development and operations. Continuous Integration automatically builds and tests every code change, catching bugs early. Continuous Delivery/Deployment extends this by automatically deploying code to production-like environments or directly to users.',
        usedFor: 'Automating build, test, and deployment pipelines, ensuring code quality through automated checks, enabling rapid and reliable software releases, reducing manual deployment errors, and providing fast feedback to developers on every commit.',
        creator: 'The concepts of CI and CD were formalized by Martin Fowler and Kent Beck (Extreme Programming, late 1990s). Continuous Integration was first practiced in the 1990s. Modern CI/CD was popularized by tools like Jenkins (2005), Travis CI (2011), GitHub Actions (2018), and GitLab CI/CD with its built-in Auto DevOps capabilities.',
        code: '# .gitlab-ci.yml example\nstages:\n  - test\n  - build\n  - deploy\n\nunit-tests:\n  stage: test\n  script:\n    - npm install\n    - npm test\n\nbuild-app:\n  stage: build\n  script:\n    - npm run build\n  artifacts:\n    paths:\n      - dist/\n\ndeploy-prod:\n  stage: deploy\n  script:\n    - npm run deploy\n  only:\n    - main'
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
    },
    godot: {
        name: 'Godot Engine',
        what: 'Godot is a free, open-source game engine that provides a comprehensive set of common tools for game development. It features a unique scene-node architecture, a dedicated scripting language (GDScript) that is easy to learn, full C# support, and a visual editor that runs on any platform.',
        usedFor: 'Creating 2D and 3D games, game prototypes, interactive applications, educational software, and simulations. Godot excels at 2D with its dedicated 2D engine, pixel-perfect rendering, and powerful animation tools.',
        creator: 'Juan Linietsky and Ariel Manzur (Reduz and PunkPanda). First released as open-source in 2014 after being developed privately for several years. Now maintained by the Godot Foundation and a large community of contributors.',
        code: 'extends Node\n\n# Called when the node enters the scene tree for the first time.\nfunc _ready():\n    print("Hello, Godot!")\n    print("Welcome to open-source game development!")\n\n# Called every frame.\nfunc _process(delta):\n    # Put your game logic here\n    pass'
    },
    unity: {
        name: 'Unity Engine',
        what: 'Unity is one of the world\'s most popular real-time 3D development platforms. It provides a complete ecosystem for creating games, simulations, and interactive experiences with a component-based architecture, a robust editor, and extensive asset store integration.',
        usedFor: 'Game development (2D, 3D, VR, AR), architectural visualization, film and animation, automotive design, training simulations, and interactive installations across 25+ platforms.',
        creator: 'Unity Technologies, founded by David Helgason, Nicholas Francis, and Joachim Ante in Copenhagen. First released in 2005 for Mac OS X, it has grown into a multi-billion dollar platform used by millions of developers worldwide.',
        code: 'using UnityEngine;\n\npublic class HelloUnity : MonoBehaviour\n{\n    void Start()\n    {\n        Debug.Log("Hello, Unity!");\n        Debug.Log("Welcome to real-time 3D development!");\n    }\n\n    void Update()\n    {\n        // Game logic runs here each frame\n    }\n}'
    },
    unreal: {
        name: 'Unreal Engine',
        what: 'Unreal Engine is a cutting-edge game engine developed by Epic Games, known for its high-fidelity graphics, robust toolset, and industry-leading rendering capabilities. It features Blueprint visual scripting alongside full C++ support, making it accessible to both artists and engineers.',
        usedFor: 'AAA game development, architectural visualization, film and broadcast production, virtual production (used in The Mandalorian), automotive design, simulation, and digital twin applications.',
        creator: 'Epic Games, founded by Tim Sweeney. Originally developed as a first-person shooter engine for the 1998 game Unreal. The first publicly available version (UE2) released in 2002, with UE5 launching in 2022 featuring Nanite and Lumen.',
        code: '#include "CoreMinimal.h"\n#include "GameFramework/Actor.h"\n#include "HelloUnreal.generated.h"\n\nUCLASS()\nclass AHelloUnreal : public AActor\n{\n    GENERATED_BODY()\n\nprotected:\n    virtual void BeginPlay() override\n    {\n        Super::BeginPlay();\n        UE_LOG(LogTemp, Warning, TEXT("Hello, Unreal!"));\n        UE_LOG(LogTemp, Warning, TEXT("Welcome to cutting-edge game development!"));\n    }\n};'
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

// Startup health check for status badge
(function checkBackend() {
    fetch(BACKEND_URL + '/api/health', { signal: AbortSignal.timeout(5000) })
        .then(r => { if (r.ok) setOfflineBadge(true); else setOfflineBadge(false); })
        .catch(() => setOfflineBadge(false));
})();

// Fetch tutor status
(function fetchTutorStatus() {
    var el = document.getElementById('tutorStatus');
    if (!el) return;
    fetch(BACKEND_URL + '/api/tutor/status', { signal: AbortSignal.timeout(5000) })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.mode === 'hybrid') {
                el.textContent = '🧠 Hybrid ' + (data.modelLoaded ? '✓' : '');
                el.title = 'Hybrid tutor: keyword cascade + ' + data.model + ' LLM' + (data.modelLoaded ? ' (loaded)' : ' (lazy load)');
                el.style.color = data.modelLoaded ? '#22c55e' : '#f97316';
            } else if (data.mode === 'keyword') {
                el.textContent = '🔑 Keyword';
                el.title = 'Keyword-based tutor (no AI model)';
                el.style.color = '#64748b';
            } else {
                el.textContent = '🤖 ' + data.mode;
                el.title = 'AI Provider: ' + data.mode;
                el.style.color = '#0ea5e9';
            }
        })
        .catch(function() {
            el.textContent = '';
        });
})();
