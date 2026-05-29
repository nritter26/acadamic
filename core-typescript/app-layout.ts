// @ts-nocheck

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

setMode = function(lang) {
    const sidebar = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger-btn');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
    }
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

const runBtn = document.querySelector('.run-btn[onclick="runCode()"]');
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
    if (lang === 'styling') { document.getElementById('level-bar').style.display = 'none'; initStylingVisualize(); updateAISuggestions(); return; }
    if (lang === 'dblab') { document.getElementById('level-bar').style.display = 'none'; initDbLab(); updateAISuggestions(); return; }
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
                ['asm','ASM'],['wasm','Wasm'],['zig','Zig'],['pg','SQL'],['dk','Docker'],['git','Git'],
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
        // If curriculum data is already loaded but this language isn't in it, don't retry
        if (_curriculumData) {
            document.getElementById('topic-list').innerHTML = '';
            document.getElementById('explanation').innerHTML = '<div style="color:#64748b;font-size:13px;padding:20px;text-align:center;">Curriculum not available for ' + (LANG_NAMES[lang] || lang) + '</div>';
            document.getElementById('editor').value = '// ' + (LANG_NAMES[lang] || lang) + ' — no curriculum data';
            document.getElementById('output').innerText = '// Curriculum not loaded';
            document.getElementById('app').className = lang + '-mode';
            document.getElementById('header-title').innerText = LANG_NAMES[lang] || lang;
            document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
            const navBtn = document.getElementById('nav-' + lang);
            if (navBtn) navBtn.classList.add('active');
            return;
        }
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
    document.getElementById('header-title').textContent = lang.toUpperCase();
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
    } else if (lang === 'htmlcss') {
        if (engineBar) renderHtmlcssBar();
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
    setTimeout(triggerGTranslate, 50);
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
        nums.push('<span style="display:block">' + i + '</span>');
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

function initSidebarResize() {
    const handle = document.getElementById('sidebar-resize-handle');
    const sidebar = document.getElementById('nav-menu');
    if (!handle || !sidebar) return;
    const saved = localStorage.getItem('sidebarWidth');
    if (saved) { sidebar.style.width = saved; }
    let startX, startW;
    function onMouseMove(e) {
        const w = Math.min(120, Math.max(40, startW + e.clientX - startX));
        sidebar.style.width = w + 'px';
    }
    function onMouseUp() {
        handle.classList.remove('active');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        localStorage.setItem('sidebarWidth', sidebar.style.width);
    }
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX;
        startW = sidebar.offsetWidth;
        handle.classList.add('active');
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}
initSidebarResize();

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

// ── GTranslate: ensure code elements are protected and initial content is translatable ──
(function gtranslateInit() {
    var ed = document.getElementById('editor');
    var out = document.getElementById('output');
    if (ed) ed.classList.add('notranslate');
    if (out) out.classList.add('notranslate');
    setTimeout(triggerGTranslate, 500);
})();
