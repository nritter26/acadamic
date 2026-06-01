// @ts-nocheck

import { conversationHistory, MAX_HISTORY, CHAT_STORAGE_KEY, saveChatHistory, loadChatHistory, addToHistory, clearHistory } from './chat-history';
import { TOPIC_KEYWORDS_CLIENT, detectTopicInQuery } from './topic-detector';
import { aiCodeId, streamAbortController, streamingMsgEl, streamingFullText, setStreamAbortController, setStreamingMsgEl, setStreamingFullText, highlightAICode, escapeAIHtml, escapeAIAttr, safeAIHref, formatAIText, autoGrowAIInput, removeTypingIndicator, stopAIStream } from './chat-ui';
import { suggestionSets, getDynamicSuggestions, updateAISuggestions } from './suggestions';

let lastCodeRun = '';
let lastCodeOutput = '';
let convSubject = '';
let convLang = '';

let aiFeedbackId = 0;
let isBackendReachable = true;

function toggleAI() {
    const panel = document.getElementById('aiPanel');
    const wasOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    document.getElementById('aiToggle').classList.toggle('open');
    if (!wasOpen) {
        if (DEVIN_MAINTENANCE) {
            showMaintenanceMessage();
            return;
        }
        const history = loadChatHistory();
        if (history.length > 0) {
            const el = document.getElementById('aiMessages');
            if (el) {
                el.innerHTML = '';
                for (const msg of history) {
                    addAIMessage(msg.text, msg.role, true);
                }
            }
        }
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
    setTimeout(triggerGTranslate, 50);
}

function showMaintenanceMessage() {
    const el = document.getElementById('aiMessages');
    if (el) {
        el.innerHTML = `<div class="ai-maintenance">🚧 Devin is currently under maintenance.<br><br>Please check back later.</div>`;
    }
    const suggestions = document.getElementById('aiSuggestions');
    if (suggestions) suggestions.innerHTML = '';
    const input = document.getElementById('aiInput');
    if (input) {
        input.placeholder = 'Devin is under maintenance...';
        input.disabled = true;
    }
    const sendBtn = document.querySelector('.ai-input-row button:last-child');
    if (sendBtn) sendBtn.disabled = true;
    const stopBtn = document.getElementById('aiStopBtn');
    if (stopBtn) stopBtn.style.display = 'none';
    const badge = document.getElementById('aiOfflineBadge');
    if (badge) {
        badge.style.display = '';
        badge.style.color = '#fbbf24';
        badge.textContent = '🚧 Under Maintenance';
    }
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

function clearChatHistory() {
    clearHistory();
    if (DEVIN_MAINTENANCE) {
        showMaintenanceMessage();
        return;
    }
    const el = document.getElementById('aiMessages');
    if (el) {
        el.innerHTML = `<div class="ai-msg bot"><div class="label">Devin</div>Hi! I'm your coding assistant. Ask me anything about programming, or pick a suggestion below.</div>`;
    }
    updateAISuggestions(currentLang, currentTopic, streamingFullText);
    setTimeout(triggerGTranslate, 50);
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.ai-run-code');
    if (btn && btn.dataset.code !== undefined) {
        runCodeFromAI(btn.dataset.code);
    }
});

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
        saveChatHistory(conversationHistory);
    }
    setTimeout(triggerGTranslate, 50);
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
    saveChatHistory(conversationHistory);
    streamingMsgEl = null;
    updateAISuggestions(currentLang, currentTopic, streamingFullText);
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

function sendAI() {
    if (DEVIN_MAINTENANCE) return;
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
