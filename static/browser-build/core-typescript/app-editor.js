// @ts-nocheck
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
    if (!word || word.length < 2) {
        hideCompletions();
        return;
    }
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
    if (matches.length === 0) {
        hideCompletions();
        return;
    }
    if (!compState) {
        const popup = document.createElement('div');
        popup.id = 'completionPopup';
        popup.style.cssText = 'position:fixed;background:#0f172a;border:1px solid #334155;border-radius:6px;padding:4px 0;max-height:180px;overflow-y:auto;display:none;z-index:1000;font-size:11px;font-family:Consolas,monospace;min-width:120px;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
        document.body.appendChild(popup);
        compState = { popup, idx: 0 };
    }
    const popup = compState.popup;
    const coords = getCaretCoords(textarea);
    popup.innerHTML = matches.map((item, i) => `<div class="comp-item" data-idx="${i}" style="padding:4px 10px;cursor:pointer;color:${i === 0 ? '#fff' : '#94a3b8'};background:${i === 0 ? 'var(--accent)' : 'transparent'};">${item}</div>`).join('');
    popup.style.display = 'block';
    popup.style.left = Math.min(coords.x, window.innerWidth - 220) + 'px';
    popup.style.top = Math.min(coords.y + 22, window.innerHeight - 200) + 'px';
    compState.idx = 0;
    popup.querySelectorAll('.comp-item').forEach(el => {
        el.addEventListener('mousedown', function (e) {
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
    if (!compState || compState.popup.style.display === 'none')
        return;
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
                if (data[lang][topic])
                    completedTopics.add(lang + ':' + topic);
        updateTopicDisplay();
    })
        .catch(() => { });
}
function toggleProgress(topic) {
    const key = currentLang + ':' + topic;
    const completed = !completedTopics.has(key);
    completed ? completedTopics.add(key) : completedTopics.delete(key);
    fetch(BACKEND_URL + '/api/progress', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: currentLang, topic, completed })
    }).catch(() => { });
    const toast = document.createElement('div');
    toast.textContent = completed ? '★ Completed!' : '☆ Unmarked';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--accent);color:#000;padding:10px 18px;border-radius:10px;font-size:12px;font-weight:800;z-index:999;animation:fadeIn 0.2s ease;box-shadow:0 4px 16px rgba(0,0,0,0.4);pointer-events:none;';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 1200);
    updateTopicDisplay();
}
function getTopicList() {
    const langData = courseData[currentLang];
    if (!langData)
        return [];
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
    if (idx === -1)
        return;
    const next = idx + dir;
    if (next < 0 || next >= list.length)
        return;
    loadTopic(list[next].phase, list[next].topic);
}
function updateProgressBar() {
    const langData = courseData[currentLang];
    if (!langData)
        return;
    const allTopics = getTopicList();
    if (allTopics.length === 0)
        return;
    let completed = 0;
    for (const t of allTopics) {
        if (completedTopics.has(currentLang + ':' + t.topic))
            completed++;
    }
    const pct = Math.round((completed / allTopics.length) * 100);
    let bar = document.getElementById('progressBar');
    if (!bar) {
        const label = document.querySelector('.col:first-child label');
        if (!label)
            return;
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
        if (star)
            star.onclick = function (e) {
                e.stopPropagation();
                const parent = this.closest('.item-btn');
                if (parent)
                    toggleProgress(parent.dataset.topic);
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
    if (len < 200)
        return { label: 'quick', icon: '⚡' };
    if (len < 500)
        return { label: 'standard', icon: '●' };
    return { label: 'in-depth', icon: '◉' };
}
// ── COLLAPSIBLE PHASES ──
function togglePhase(phaseKey, phaseName) {
    const header = document.querySelector(`.phase-header[data-phase="${phaseKey}"]`);
    if (!header)
        return;
    const isCollapsed = collapsedPhases.has(phaseKey);
    if (isCollapsed) {
        collapsedPhases.delete(phaseKey);
        header.classList.remove('collapsed');
        header.querySelector('.phase-toggle').textContent = '▼';
    }
    else {
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
        if (!key)
            return;
        collapsedPhases.add(key);
        h.classList.add('collapsed');
        const toggle = h.querySelector('.phase-toggle');
        if (toggle)
            toggle.textContent = '▶';
    });
    document.querySelectorAll('.item-btn[data-phase]').forEach(b => { b.classList.add('phase-collapsed'); });
}
function expandAllPhases() {
    document.querySelectorAll('.phase-header').forEach(h => {
        const key = h.dataset.phase;
        if (!key)
            return;
        collapsedPhases.delete(key);
        h.classList.remove('collapsed');
        const toggle = h.querySelector('.phase-toggle');
        if (toggle)
            toggle.textContent = '▼';
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
            }
            else {
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
        const topicName = btn.dataset.topic || btn.textContent.replace(/^[★☆]\s*/, '').trim();
        const visibleText = btn.textContent.toLowerCase();
        let matchesSearch = !q;
        if (q) {
            matchesSearch = topicName.toLowerCase().includes(q) || visibleText.includes(q);
            if (!matchesSearch && langData) {
                for (const phase in langData) {
                    for (const topic in langData[phase]) {
                        if (topic === topicName) {
                            const exp = (langData[phase][topic].exp || '').toLowerCase();
                            if (exp.includes(q))
                                matchesSearch = true;
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
        if (show)
            visible++;
    });
    const container = document.getElementById('topic-list');
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (!el.classList.contains('phase-header'))
            continue;
        const phaseKey = el.dataset.phase;
        let hasVisible = false;
        for (let j = i + 1; j < children.length; j++) {
            if (children[j].classList.contains('phase-header'))
                break;
            if (children[j].style.display !== 'none') {
                hasVisible = true;
                break;
            }
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
        if (currentLevel !== 'all')
            countEl.textContent += ' (' + currentLevel + ')';
        if (currentCompletionFilter !== 'all')
            countEl.textContent += ' (' + currentCompletionFilter + ')';
        countEl.style.display = visible === 0 ? '' : '';
        countEl.style.opacity = '0';
        requestAnimationFrame(function () { countEl.style.opacity = '1'; });
    }
    else if (countEl) {
        countEl.style.display = 'none';
    }
    let emptyEl = document.getElementById('emptyState');
    if (visible === 0) {
        let reason = '';
        if (q)
            reason = ' matching "' + query + '"';
        else if (currentLevel !== 'all')
            reason = ' at ' + currentLevel + ' level';
        else if (currentCompletionFilter !== 'all')
            reason = ' that are ' + currentCompletionFilter;
        const msg = '✨ No topics' + reason;
        if (!emptyEl) {
            emptyEl = document.createElement('div');
            emptyEl.id = 'emptyState';
            emptyEl.style.cssText = 'color:#64748b;font-size:11px;padding:30px 10px;text-align:center;line-height:1.6;';
            container.appendChild(emptyEl);
        }
        emptyEl.textContent = msg;
        emptyEl.style.display = '';
    }
    else if (emptyEl) {
        emptyEl.style.display = 'none';
    }
    if (q || currentLevel !== 'all' || currentCompletionFilter !== 'all') {
        const listEl = document.getElementById('topic-list');
        if (listEl)
            listEl.scrollTop = 0;
    }
    document.querySelectorAll('.item-btn .topic-name').forEach(el => {
        el.innerHTML = el.textContent;
    });
    if (q) {
        const visSelector = '.item-btn:not([style*="display: none"]) .topic-name';
        document.querySelectorAll(visSelector).forEach(el => {
            const text = el.textContent;
            const idx = text.toLowerCase().indexOf(q);
            if (idx === -1)
                return;
            const before = text.slice(0, idx);
            const match = text.slice(idx, idx + q.length);
            const after = text.slice(idx + q.length);
            el.innerHTML = `${before}<mark style="background:rgba(247,223,30,0.25);color:#f7df1e;border-radius:2px;font-weight:700;">${match}</mark>${after}`;
        });
    }
}
// ── PROGRESS NUDGE ──
function suggestNextTopic() {
    if (currentCompletionFilter === 'completed')
        return;
    const langData = courseData[currentLang];
    if (!langData)
        return;
    const topics = getTopicList();
    const idx = getCurrentTopicIndex();
    if (idx === -1)
        return;
    for (let i = idx + 1; i < topics.length; i++) {
        const key = currentLang + ':' + topics[i].topic;
        if (!completedTopics.has(key)) {
            const nudgeEl = document.getElementById('topicNudge');
            if (nudgeEl)
                nudgeEl.remove();
            const nudge = document.createElement('div');
            nudge.id = 'topicNudge';
            nudge.style.cssText = 'font-size:10px;color:#94a3b8;padding:6px 10px;margin-top:6px;background:#1e293b;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:6px;border:1px solid #334155;';
            nudge.innerHTML = '<span style="color:var(--accent);">→</span> Next: <strong>' + topics[i].topic + '</strong>';
            nudge.onclick = function () { loadTopic(topics[i].phase, topics[i].topic); };
            const output = document.getElementById('output');
            if (output && output.parentNode) {
                output.parentNode.appendChild(nudge);
            }
            return;
        }
    }
    const existing = document.getElementById('topicNudge');
    if (existing)
        existing.remove();
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
    if (hlOverlay)
        return;
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-wrapper';
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);
    hlOverlay = document.createElement('pre');
    hlOverlay.className = 'editor-highlight';
    hlOverlay.innerHTML = '<code></code>';
    wrapper.insertBefore(hlOverlay, textarea);
    textarea.addEventListener('input', updateHighlight);
    textarea.addEventListener('scroll', function () {
        hlOverlay.scrollTop = this.scrollTop;
        hlOverlay.scrollLeft = this.scrollLeft;
        hideCompletions();
    });
    hlEditor = textarea;
    textarea.addEventListener('input', function () {
        if (autoSyntaxEnabled) {
            scheduleAutoSyntax();
        }
        else if (currentAnnotations.length > 0) {
            clearAnnotations();
        }
    });
    updateHighlight();
}
function updateHighlight() {
    if (!hlOverlay)
        return;
    const code = hlEditor ? hlEditor.value : document.getElementById('editor').value;
    let html = highlightEditorCode(code, currentLang);
    if (currentAnnotations.length > 0) {
        const lines = html.split('\n');
        for (const ann of currentAnnotations) {
            const idx = ann.line - 1;
            if (idx >= 0 && idx < lines.length) {
                const msg = (ann.message || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                lines[idx] = `<span class="annotation-${ann.severity}" title="${msg}">${lines[idx]}</span>`;
                const errChar = getErrorChar(ann.message);
                if (errChar) {
                    lines[idx] = highlightCharInLine(lines[idx], errChar);
                }
            }
        }
        html = lines.join('\n');
    }
    const codeEl = hlOverlay.querySelector('code') || hlOverlay.firstChild;
    if (codeEl && codeEl.innerHTML !== html) {
        codeEl.innerHTML = html;
    }
    if (hlEditor) {
        hlOverlay.scrollTop = hlEditor.scrollTop;
        hlOverlay.scrollLeft = hlEditor.scrollLeft;
    }
}
function getErrorChar(message) {
    if (!message)
        return null;
    const m = message.match(/\((\d+)\s+open,\s*(\d+)\s+close\)/);
    if (!m)
        return null;
    const opens = parseInt(m[1]);
    const closes = parseInt(m[2]);
    const lower = message.toLowerCase();
    if (opens > closes) {
        if (lower.includes('parenthes'))
            return '(';
        if (lower.includes('curly') || lower.includes('brace'))
            return '{';
        if (lower.includes('bracket'))
            return '[';
    }
    else {
        if (lower.includes('parenthes'))
            return ')';
        if (lower.includes('curly') || lower.includes('brace'))
            return '}';
        if (lower.includes('bracket'))
            return ']';
    }
    return null;
}
function highlightCharInLine(html, char) {
    let result = '';
    let inTag = false;
    let found = false;
    for (let i = 0; i < html.length; i++) {
        const c = html[i];
        if (c === '<') {
            inTag = true;
            result += c;
        }
        else if (c === '>') {
            inTag = false;
            result += c;
        }
        else if (!inTag && !found && c === char) {
            result += '<span class="hl-error-char">' + c + '</span>';
            found = true;
        }
        else {
            result += c;
        }
    }
    return result;
}
function highlightEditorCode(code, lang) {
    const kws = LANG_KEYWORDS[lang] || LANG_KEYWORDS.js;
    const ghostPairs = {
        '(': ')',
        '{': '}',
        '[': ']',
        '<': '>'
    };
    const tokens = [];
    let i = 0;
    while (i < code.length) {
        const rest = code.slice(i);
        const newl = rest.match(/^\n/);
        if (newl) {
            tokens.push('\n');
            i++;
            continue;
        }
        const wsp = rest.match(/^[ \t]+/);
        if (wsp) {
            tokens.push(escapeHtml(wsp[0]));
            i += wsp[0].length;
            continue;
        }
        const bCm = rest.match(/^\/\*[\s\S]*?\*\//);
        if (bCm) {
            tokens.push('<span class="hl-comment">' + escapeHtml(bCm[0]) + '</span>');
            i += bCm[0].length;
            continue;
        }
        const sCm = rest.match(/^\/\/[^\n]*/);
        if (sCm) {
            tokens.push('<span class="hl-comment">' + escapeHtml(sCm[0]) + '</span>');
            i += sCm[0].length;
            continue;
        }
        const hCm = rest.match(/^#[^\n]*/);
        if (hCm && ['py', 'rs', 'sh', 'bash', 'php'].includes(lang)) {
            tokens.push('<span class="hl-comment">' + escapeHtml(hCm[0]) + '</span>');
            i += hCm[0].length;
            continue;
        }
        const sqlCm = rest.match(/^--[^\n]*/);
        if (sqlCm && ['pg', 'mysql', 'sqlite'].includes(lang)) {
            tokens.push('<span class="hl-comment">' + escapeHtml(sqlCm[0]) + '</span>');
            i += sqlCm[0].length;
            continue;
        }
        const str = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
        if (str) {
            tokens.push('<span class="hl-string">' + escapeHtml(str[0]) + '</span>');
            i += str[0].length;
            continue;
        }
        const num = rest.match(/^\b(0x[0-9a-fA-F]+|\d+\.?\d*)\b/);
        if (num) {
            tokens.push('<span class="hl-number">' + escapeHtml(num[0]) + '</span>');
            i += num[0].length;
            continue;
        }
        const word = rest.match(/^([a-zA-Z_$][\w$]*)/);
        if (word) {
            if (kws.some(k => k.toLowerCase() === word[1].toLowerCase())) {
                tokens.push('<span class="hl-keyword">' + escapeHtml(word[1]) + '</span>');
            }
            else {
                tokens.push(escapeHtml(word[1]));
            }
            i += word[1].length;
            continue;
        }
        const opener = code[i];
        const closer = ghostPairs[opener];
        if (closer && code[i + 1] === closer) {
            tokens.push(escapeHtml(opener) + '<span class="hl-pair-ghost">' + escapeHtml(closer) + '</span>');
            i += 2;
            continue;
        }
        tokens.push(escapeHtml(opener));
        i++;
    }
    return tokens.join('');
}
// ── Compiler Pipeline ──
