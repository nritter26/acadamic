// @ts-nocheck
let dueReviewCount = 0;
function checkDueReviews() {
    fetch(BACKEND_URL + '/api/learner/reviews')
        .then(r => r.json())
        .then(d => {
        if (d.due && d.due.length > 0) {
            dueReviewCount = d.due.length;
            updateReviewBadge();
        }
        else {
            dueReviewCount = 0;
            updateReviewBadge();
        }
    })
        .catch(() => { dueReviewCount = 0; updateReviewBadge(); });
}
function updateReviewBadge() {
    const toggle = document.getElementById('aiToggle');
    if (!toggle)
        return;
    const existing = document.getElementById('review-badge');
    if (existing)
        existing.remove();
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
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: '))
                continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]')
                continue;
            try {
                const parsed = JSON.parse(data);
                if (parsed.content !== undefined) {
                    fullText += parsed.content;
                }
            }
            catch { }
        }
    }
    return fullText;
}
function triggerAutoDebug(errorText, code) {
    if (!errorText || !code)
        return;
    const out = document.getElementById('output');
    const existingDebug = document.getElementById('ai-auto-debug-btn');
    if (existingDebug)
        existingDebug.remove();
    const btn = document.createElement('button');
    btn.id = 'ai-auto-debug-btn';
    btn.type = 'button';
    btn.textContent = '🔧 Auto-Debug';
    btn.style.cssText = 'display:block;margin-top:4px;margin-bottom:4px;background:#8b5cf6;color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:9px;font-weight:800;cursor:pointer;';
    btn.onclick = async function () {
        btn.textContent = '🔍 Analyzing...';
        btn.disabled = true;
        const aiPanel = document.getElementById('aiPanel');
        if (aiPanel && !aiPanel.classList.contains('open'))
            toggleAI();
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
            }
            else {
                const errorQ = `I got this error and need help fixing it:\n\`\`\`\n${errorText.slice(0, 300)}\n\`\`\`\n\nMy code:\n\`\`\`\n${code.slice(0, 800)}\n\`\`\`\n\nWhat went wrong and how do I fix it?`;
                askAI(errorQ);
            }
        }
        catch {
            removeTypingIndicator();
            const errorQ = `I got this error and need help fixing it. Error: ${errorText.split('\n')[0]}`;
            askAI(errorQ);
        }
        finally {
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
    if (!editor)
        return;
    const lastBot = [...conversationHistory].reverse().find(m => m.role === 'bot');
    if (!lastBot || !lastBot.text)
        return;
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
    if (!runBtn)
        return;
    runBtn.disabled = loading;
    if (loading) {
        runBtn.textContent = 'Running';
    }
    else {
        runBtn.textContent = currentLang === 'challenge' ? 'Test ▶' : 'Run ▶';
    }
    runBtn.classList.toggle('loading', loading);
}
function getLogicalPreview(code, lang) {
    function skipStr(s, i) {
        const q = s[i];
        i++;
        while (i < s.length && !(s[i] === q && s[i - 1] !== '\\'))
            i++;
        return i;
    }
    function extractCallArgs(line, prefix) {
        const idx = line.indexOf(prefix);
        if (idx === -1)
            return null;
        const parenPos = idx + prefix.length - 1;
        if (line[parenPos] !== '(')
            return null;
        let depth = 1, i = parenPos + 1;
        while (i < line.length && depth > 0) {
            if (line[i] === '(')
                depth++;
            else if (line[i] === ')')
                depth--;
            else if (line[i] === '"' || line[i] === "'" || line[i] === '`')
                i = skipStr(line, i);
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
            if (s)
                res.push(s);
        }
        if (res.length === 0) {
            const numMatch = text.trim().match(/^(\d+\.?\d*)$/);
            if (numMatch)
                res.push(numMatch[1]);
        }
        return res;
    }
    let clean = code.replace(/\/\*[\s\S]*?\*\//g, '');
    if (lang === 'py' || lang === 'pg' || lang === 'dk' || lang === 'git') {
        clean = clean.replace(/#[^\n]*/g, '');
    }
    else {
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
        wasm: ['print('],
        asm: ['print('],
        scala: ['println(', 'print('],
        lua: ['print('],
    };
    const output = [];
    for (const raw of clean.split('\n')) {
        const line = raw.trim();
        if (!line)
            continue;
        if (lang === 'cpp') {
            const ci = line.includes('cout') ? line.indexOf('cout') : line.indexOf('std::cout');
            if (ci !== -1) {
                const parts = line.slice(ci).split(/<<|;/);
                const strs = [];
                for (const p of parts) {
                    strs.push(...pullStrings(p));
                }
                const joined = strs.join('');
                if (joined)
                    output.push(joined);
                continue;
            }
        }
        const prefixes = langPrefixes[lang] || [];
        for (const prefix of prefixes) {
            const args = extractCallArgs(line, prefix);
            if (args === null)
                continue;
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
    if (document.getElementById(btnId))
        return;
    const btn = document.createElement('button');
    btn.id = btnId;
    btn.textContent = '💡 Explain Error';
    btn.style.cssText = 'display:block;margin-top:6px;background:#0ea5e9;color:#000;border:none;border-radius:6px;padding:6px 12px;font-size:10px;font-weight:800;cursor:pointer;';
    btn.onclick = function () {
        const editor = document.getElementById('editor');
        const code = editor ? editor.value : '';
        const aiPanel = document.getElementById('aiPanel');
        if (!aiPanel.classList.contains('open'))
            toggleAI();
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
    if (errors)
        summary += `// ⛔ ${errors} error(s)`;
    if (warnings)
        summary += `${errors ? ',' : '// ⚠'} ${warnings} warning(s)`;
    if (styles)
        summary += `${errors || warnings ? ',' : '// ℹ'} ${styles} style issue(s)`;
    summary += ` | Score: ${result.score}/10`;
    outEl.innerText += summary;
}
var _tutorialLastRunHadError = false;
function runCode() {
    const out = document.getElementById('output');
    const code = document.getElementById('editor').value;
    const existingBtn = document.getElementById('ai-explain-error-btn');
    if (existingBtn)
        existingBtn.remove();
    _tutorialLastRunHadError = false;
    if (!code.trim()) {
        out.innerText = "// No code to run";
        return;
    }
    if (currentLang === 'git') {
        out.innerText = processGitCommand(code);
        return;
    }
    if (currentLang === 'styling') {
        processStylingCommand(code);
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
        }
        catch (e) {
            console.log = savedLog;
            const errMsg = "Error: " + e.message;
            out.innerText = errMsg;
            _tutorialLastRunHadError = true;
            addErrorExplainButton(out, errMsg);
            triggerAutoDebug(errMsg, code);
            appendAutoReview(out, code, currentLang);
        }
        setRunLoading(false);
        if (typeof tutorialRunHook === 'function')
            tutorialRunHook();
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
        if (typeof tutorialRunHook === 'function')
            tutorialRunHook();
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
            swift: 'swift program.swift', zig: 'zig build-exe program.zig && ./program', wasm: 'wasmtime program.wat', asm: 'nasm -f elf64 program.asm && ld -o program program.o',
            java: 'javac Main.java && java Main', rb: 'ruby program.rb',
            sqlite: 'SQLite is built-in, just click Run!',
            pg: 'psql -f query.sql', mysql: 'mysql < query.sql',
            dk: 'docker build -t myapp . && docker run myapp',
            mongodb: 'mongosh < script.js', gamedev: 'Run in your game engine IDE',
            lua: 'lua prog.lua',
            git: 'Run git commands in terminal'
        };
        if (window.location.protocol === 'file:') {
            out.innerText = "// Start the server first:\n//   npx tsx server.ts\n// Then open http://localhost:3000";
        }
        else {
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
