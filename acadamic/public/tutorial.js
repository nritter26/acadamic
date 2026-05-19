// ── Multi-Language Tutorial System ──

const TUTORIAL_LANGS = ['js', 'py', 'go', 'rs', 'c', 'cpp', 'cs', 'kt', 'swift', 'ts', 'zig'];
let tutorialLang = 'js';

function generateTutorialSteps(lang) {
    var data = courseData[lang];
    if (!data) return [];
    var steps = [];
    var phases = Object.keys(data);
    for (var p = 0; p < phases.length; p++) {
        var phase = phases[p];
        var topics = Object.keys(data[phase]);
        for (var t = 0; t < topics.length; t++) {
            var topic = topics[t];
            steps.push({
                phase: phase,
                topic: topic,
                task: 'Read about <strong>"' + topic + '"</strong> in the explanation above, then click <strong>Run</strong> to see the example code in action. Try modifying it to see how it works!',
                quizAfter: false
            });
        }
        if (quizData && quizData[lang] && steps.length > 0) {
            steps[steps.length - 1].quizAfter = true;
        }
    }
    return steps;
}

function getStorageKey(lang) {
    return 'tutorial_progress_' + (lang || 'js');
}

var _tutorialStepsCache = {};

function getTutorialSteps(lang) {
    if (!_tutorialStepsCache[lang]) {
        _tutorialStepsCache[lang] = generateTutorialSteps(lang);
    }
    return _tutorialStepsCache[lang];
}

function invalidateTutorialCache(lang) {
    delete _tutorialStepsCache[lang];
}

class TutorialManager {
    constructor(lang) {
        this.lang = lang || 'js';
        this.state = this.loadState();
        this.steps = getTutorialSteps(this.lang);
        this.stuckTimer = null;
        this.stuckLevel = 0;
        this.lastInteraction = Date.now();
        this.runCount = 0;
        this.errorCount = 0;
        this.quizPassedSteps = new Set();
        this.setupStuckDetection();
    }

    loadState() {
        try {
            var saved = localStorage.getItem(getStorageKey(this.lang));
            if (saved) {
                var parsed = JSON.parse(saved);
                if (parsed && typeof parsed.currentStep === 'number') return parsed;
            }
        } catch (e) {}
        return { currentStep: 0, completedSteps: [], quizScores: {}, stepAttempts: {}, startedAt: null };
    }

    saveState() {
        try {
            localStorage.setItem(getStorageKey(this.lang), JSON.stringify(this.state));
        } catch (e) {}
    }

    getTotalSteps() {
        return this.steps.length;
    }

    getCurrentStep() {
        return this.steps[this.state.currentStep] || null;
    }

    getCurrentStepIndex() {
        return this.state.currentStep;
    }

    getCompletedCount() {
        return this.state.completedSteps.length;
    }

    isStepCompleted(index) {
        return this.state.completedSteps.includes(index);
    }

    isQuizCheckpoint(index) {
        return this.steps[index] && this.steps[index].quizAfter;
    }

    markRun(hasError) {
        this.runCount++;
        if (hasError) this.errorCount++;
        this.lastInteraction = Date.now();
        this.stuckLevel = 0;
        this.clearStuckTimer();
        this.setupStuckDetection();
        this.saveState();
    }

    markStepComplete(index) {
        if (!this.state.completedSteps.includes(index)) {
            this.state.completedSteps.push(index);
            this.state.currentStep = Math.max(this.state.currentStep, index + 1);
            this.runCount = 0;
            this.errorCount = 0;
            this.stuckLevel = 0;
            this.clearStuckTimer();
            this.saveState();
        }
    }

    advance() {
        var nextIdx = this.state.currentStep + 1;
        if (nextIdx < this.steps.length) {
            this.state.currentStep = nextIdx;
            this.runCount = 0;
            this.errorCount = 0;
            this.stuckLevel = 0;
            this.lastInteraction = Date.now();
            this.clearStuckTimer();
            this.setupStuckDetection();
            this.saveState();
            return true;
        }
        return false;
    }

    goBack() {
        if (this.state.currentStep > 0) {
            this.state.currentStep--;
            this.runCount = 0;
            this.errorCount = 0;
            this.stuckLevel = 0;
            this.lastInteraction = Date.now();
            this.clearStuckTimer();
            this.setupStuckDetection();
            this.saveState();
            return true;
        }
        return false;
    }

    isComplete() {
        return this.state.completedSteps.length >= this.steps.length;
    }

    isOnLastStep() {
        return this.state.currentStep >= this.steps.length - 1;
    }

    reset() {
        this.state = { currentStep: 0, completedSteps: [], quizScores: {}, stepAttempts: {}, startedAt: null };
        this.runCount = 0;
        this.errorCount = 0;
        this.stuckLevel = 0;
        this.lastInteraction = Date.now();
        this.clearStuckTimer();
        this.saveState();
    }

    setupStuckDetection() {
        if (this.stuckTimer) return;
        this.stuckTimer = setInterval(function () {
            if (document.getElementById('tutorial-quiz-overlay')?.classList.contains('open')) return;
            var idleTime = (Date.now() - this.lastInteraction) / 1000;
            var stuckBtn = document.getElementById('tutorial-stuck-btn');
            if (!stuckBtn) return;

            if (idleTime > 45 && this.hasInteracted()) {
                stuckBtn.classList.add('visible');
                if (idleTime > 60 && this.stuckLevel < 1) {
                    this.stuckLevel = 1;
                    stuckBtn.textContent = 'Stuck? Get a hint';
                    stuckBtn.classList.add('pulse');
                }
                if (idleTime > 90 && this.stuckLevel < 2) {
                    this.stuckLevel = 2;
                    stuckBtn.textContent = 'Stuck? Need a nudge?';
                    stuckBtn.classList.add('glow');
                }
                if (idleTime > 120 && this.stuckLevel < 3) {
                    this.stuckLevel = 3;
                    this.showStuckPanel();
                }
            }

            if (this.errorCount >= 3 && this.stuckLevel < 2) {
                this.stuckLevel = 2;
                stuckBtn.textContent = 'Seeing errors? Get help';
                stuckBtn.classList.add('visible', 'pulse');
                this.showStuckPanel();
            }
        }.bind(this), 5000);
    }

    clearStuckTimer() {
        if (this.stuckTimer) {
            clearInterval(this.stuckTimer);
            this.stuckTimer = null;
        }
    }

    hasInteracted() {
        return this.runCount > 0;
    }

    showStuckPanel() {
        var existing = document.getElementById('tutorial-stuck-panel');
        if (existing) return;

        var step = this.getCurrentStep();
        if (!step) return;

        var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[this.lang]) || this.lang;
        var panel = document.createElement('div');
        panel.id = 'tutorial-stuck-panel';
        panel.innerHTML = ''
            + '<div class="tutorial-stuck-header">'
            + '<span>Need a hand?</span>'
            + '<button onclick="this.parentElement.parentElement.remove()">\u2715</button>'
            + '</div>'
            + '<div class="tutorial-stuck-body">'
            + '<div class="tutorial-stuck-tip"><strong>Working on:</strong> ' + step.topic + '</div>'
            + '<div class="tutorial-stuck-tip"><strong>Your task:</strong> ' + step.task + '</div>'
            + '<div class="tutorial-stuck-actions">'
            + '<button onclick="tutorialManager.clearStuckTimer(); document.getElementById(\'tutorial-stuck-btn\').classList.remove(\'visible\',\'pulse\',\'glow\'); this.closest(\'#tutorial-stuck-panel\').remove(); openCheatsheet()">\uD83D\uDCD6 Open Cheatsheet</button>'
            + '<button onclick="tutorialManager.clearStuckTimer(); document.getElementById(\'tutorial-stuck-btn\').classList.remove(\'visible\',\'pulse\',\'glow\'); this.closest(\'#tutorial-stuck-panel\').remove(); toggleAI(); setTimeout(function() { askAI(\'I\\\'m doing a tutorial step on ' + step.topic + ' in ' + langName + '. My task is: ' + step.task.replace(/<[^>]*>/g, '') + '. Can you help me?\'); }, 300)">\uD83E\uDD16 Ask Devin</button>'
            + '<button onclick="tutorialManager.clearStuckTimer(); document.getElementById(\'tutorial-stuck-btn\').classList.remove(\'visible\',\'pulse\',\'glow\'); this.closest(\'#tutorial-stuck-panel\').remove(); tutorialManager.resetCurrentCode()">\uD83D\uDD04 Reset code to original</button>'
            + '</div>'
            + '</div>';
        var nav = document.getElementById('tutorial-nav');
        if (nav) nav.appendChild(panel);
    }

    resetCurrentCode() {
        var step = this.getCurrentStep();
        if (!step) return;
        var langData = courseData[this.lang];
        if (!langData || !langData[step.phase] || !langData[step.phase][step.topic]) return;
        var item = langData[step.phase][step.topic];
        document.getElementById('editor').value = item.code || '';
        if (typeof updateHighlight === 'function') updateHighlight();
        document.getElementById('output').innerText = '// Code has been reset to the original example';
        this.runCount = 0;
        this.errorCount = 0;
    }

    getQuizQuestions(count) {
        var quizPool = quizData && quizData[this.lang] ? quizData[this.lang] : [];
        if (quizPool.length === 0) return [];
        var stepIdx = this.state.currentStep;
        var currentStep = this.steps[stepIdx];
        if (!currentStep) return [];

        var coveredPhases = [];
        for (var i = 0; i <= stepIdx; i++) {
            var s = this.steps[i];
            if (s && !coveredPhases.includes(s.phase)) coveredPhases.push(s.phase);
        }

        var phaseKeywords = coveredPhases.join(' ').toLowerCase();
        var relevant = quizPool.filter(function (q) {
            var text = q.q.toLowerCase() + ' ' + q.opts.join(' ').toLowerCase();
            return phaseKeywords.split(' ').some(function (kw) { return text.includes(kw); });
        });

        if (relevant.length < count) {
            var shuffled = [...quizPool].sort(function () { return Math.random() - 0.5; });
            return shuffled.slice(0, count);
        }

        var shuffled = [...relevant].sort(function () { return Math.random() - 0.5; });
        return shuffled.slice(0, count);
    }

    saveQuizScore(questions, answers) {
        var correct = 0;
        questions.forEach(function (q, i) {
            if (answers[i] === q.ans) correct++;
        });
        var key = 'chk_' + this.state.currentStep;
        this.state.quizScores[key] = { correct: correct, total: questions.length, answers: answers };
        this.saveState();
        return { correct: correct, total: questions.length };
    }
}

var tutorialManager = null;

function openCheatsheet() {
    var overlay = document.getElementById('cheatsheetOverlay');
    if (overlay && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
        return;
    }
    var lang = tutorialManager ? tutorialManager.lang : 'js';
    var csData = cheatsheets && (cheatsheets[lang] || cheatsheets.js);
    if (csData && Object.keys(csData).length > 0) {
        var html = '';
        var idx = 0;
        var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[lang]) || lang;
        for (var section of Object.keys(csData)) {
            var snippets = csData[section];
            html += '<div class="cs-section">';
            html += '<div class="cs-section-title">' + section + '</div>';
            for (var code of snippets) {
                var safe = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html += '<div class="cs-code">' + safe + '</div>';
                idx++;
            }
            html += '</div>';
        }
        var titleEl = document.getElementById('cheatsheetTitle');
        if (titleEl) titleEl.textContent = langName.toUpperCase() + ' Cheatsheet (' + idx + ' snippets)';
        var bodyEl = document.getElementById('cheatsheetBody');
        if (bodyEl) bodyEl.innerHTML = html;
        if (overlay) overlay.classList.add('open');
    }
}

function initTutorial(lang) {
    tutorialLang = lang || 'js';

    if (!courseData[tutorialLang]) {
        var loadingLang = tutorialLang;
        var list = document.getElementById('topic-list');
        if (list) list.innerHTML = '<div class="loading-placeholder">Loading ' + (LANG_NAMES[tutorialLang] || tutorialLang) + ' curriculum...</div>';
        loadLangData(tutorialLang, function () {
            if (tutorialLang !== loadingLang) return;
            invalidateTutorialCache(tutorialLang);
            initTutorial(tutorialLang);
        });
        return;
    }

    if (!tutorialManager || tutorialManager.lang !== tutorialLang) {
        tutorialManager = new TutorialManager(tutorialLang);
    }

    var hasProgress = tutorialManager.getCompletedCount() > 0;
    if (hasProgress) {
        showResumePrompt();
    } else {
        startTutorial();
    }
}

function showResumePrompt() {
    var overlay = document.getElementById('tutorial-resume-overlay');
    if (!overlay) return;
    var completed = tutorialManager.getCompletedCount();
    var total = tutorialManager.getTotalSteps();
    var step = tutorialManager.getCurrentStep();
    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialLang]) || tutorialLang;

    var statsEl = document.getElementById('tutorial-resume-stats');
    if (statsEl) statsEl.textContent = completed + '/' + total + ' steps completed';

    var nameEl = document.getElementById('tutorial-resume-name');
    if (nameEl) nameEl.textContent = step ? 'You were on: ' + step.topic + ' (' + langName + ')' : '';

    overlay.classList.add('open');
}

function startTutorial() {
    document.getElementById('tutorial-resume-overlay')?.classList.remove('open');
    document.getElementById('tutorial-quiz-overlay')?.classList.remove('open');

    tutorialManager.runCount = 0;
    tutorialManager.errorCount = 0;
    tutorialManager.lastInteraction = Date.now();

    if (!tutorialManager.state.startedAt) {
        tutorialManager.state.startedAt = Date.now();
        tutorialManager.saveState();
    }

    renderTutorial();
    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialLang]) || tutorialLang;
}

function renderTutorial() {
    currentLang = tutorialLang;
    document.getElementById('app').className = 'tutorial-mode';
    var titleEl = document.getElementById('header-title');
    if (titleEl) {
        var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialLang]) || tutorialLang;
        titleEl.innerText = 'TUTORIAL — ' + langName.toUpperCase();
    }

    document.querySelectorAll('.selector button').forEach(function (b) { b.classList.remove('active'); });

    document.getElementById('engine-bar').style.display = 'none';
    document.getElementById('platform-bar').style.display = 'none';
    document.getElementById('level-bar').style.display = 'none';

    document.getElementById('schema-btn').style.display = 'none';
    document.getElementById('cheatsheet-btn').style.display = 'none';

    var roadmapBtn = document.getElementById('roadmap-btn');
    if (roadmapBtn) roadmapBtn.style.display = 'none';
    var searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.style.display = 'none';

    renderTutorialLangBar();
    renderTutorialSidebar();
    loadTutorialStep(tutorialManager.getCurrentStepIndex());
}

function renderTutorialLangBar() {
    var list = document.getElementById('topic-list');
    if (!list) return;
    var html = '<div class="tutorial-lang-bar">';
    for (var i = 0; i < TUTORIAL_LANGS.length; i++) {
        var code = TUTORIAL_LANGS[i];
        var name = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[code]) || code;
        var active = code === tutorialLang ? ' active' : '';
        html += '<button class="tutorial-lang-btn' + active + '" onclick="switchTutorialLang(\'' + code + '\')">' + name + '</button>';
    }
    html += '</div>';
    list.innerHTML = html;
}

var _savedProgress = {};

function switchTutorialLang(lang) {
    if (lang === tutorialLang) return;

    if (tutorialManager) {
        _savedProgress[tutorialLang] = tutorialManager.state;
    }

    tutorialLang = lang;

    if (!courseData[lang]) {
        var loadingLang = lang;
        renderTutorialLangBar();
        var list = document.getElementById('topic-list');
        if (list) {
            list.innerHTML += '<div class="loading-placeholder">Loading curriculum for ' + (LANG_NAMES[lang] || lang) + '...</div>';
        }
        loadLangData(lang, function () {
            if (tutorialLang !== loadingLang) return;
            invalidateTutorialCache(lang);
            finishSwitchTutorialLang(lang);
        });
        return;
    }

    finishSwitchTutorialLang(lang);
}

function finishSwitchTutorialLang(lang) {
    var saved = _savedProgress[lang];
    if (saved) {
        tutorialManager = new TutorialManager(lang);
        tutorialManager.state = saved;
        tutorialManager.steps = getTutorialSteps(lang);
        tutorialManager.saveState();
    } else {
        tutorialManager = new TutorialManager(lang);
    }

    if (!tutorialManager.state.startedAt) {
        tutorialManager.state.startedAt = Date.now();
        tutorialManager.saveState();
    }

    var titleEl = document.getElementById('header-title');
    if (titleEl) {
        var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[lang]) || lang;
        titleEl.innerText = 'TUTORIAL — ' + langName.toUpperCase();
    }

    renderTutorialLangBar();
    renderTutorialSidebar();
    loadTutorialStep(tutorialManager.getCurrentStepIndex());
    var lName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[lang]) || lang;
}

function renderTutorialSidebar() {
    var topicList = document.getElementById('topic-list');
    if (!topicList) return;

    var langBar = topicList.querySelector('.tutorial-lang-bar');
    var steps = tutorialManager.steps;
    var currentIdx = tutorialManager.getCurrentStepIndex();
    var completedSteps = tutorialManager.state.completedSteps;

    var html = langBar ? langBar.outerHTML : '';

    var currentChapter = '';
    for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        if (s.phase !== currentChapter) {
            currentChapter = s.phase;
            html += '<div class="tutorial-chapter-label">' + s.phase + '</div>';
        }

        var isCompleted = completedSteps.includes(i);
        var isCurrent = i === currentIdx;
        var isFuture = i > currentIdx && !isCompleted;
        var fill = isCompleted ? '\u2705' : (isCurrent ? '\u25B6' : '  ');

        var cls = 'tutorial-step-btn';
        if (isCompleted) cls += ' completed';
        if (isCurrent) cls += ' current';
        if (isFuture) cls += ' future';

        html += '<button class="' + cls + '" onclick="' + (isFuture ? '' : 'goToTutorialStep(' + i + ')') + '" ' + (isFuture ? 'disabled' : '') + '>'
            + '<span class="tutorial-step-icon">' + fill + '</span>'
            + '<span class="tutorial-step-name">' + s.topic + '</span>'
            + '</button>';
    }

    topicList.innerHTML = html;

    var currentBtn = topicList.querySelector('.tutorial-step-btn.current');
    if (currentBtn) {
        setTimeout(function () { currentBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 100);
    }
}

function goToTutorialStep(idx) {
    if (idx < 0 || idx >= tutorialManager.steps.length) return;
    var completed = tutorialManager.state.completedSteps;
    if (!completed.includes(idx) && idx > tutorialManager.getCurrentStepIndex()) return;
    tutorialManager.state.currentStep = idx;
    tutorialManager.runCount = 0;
    tutorialManager.errorCount = 0;
    tutorialManager.lastInteraction = Date.now();
    tutorialManager.saveState();
    renderTutorialSidebar();
    loadTutorialStep(idx);
}

function loadTutorialStep(idx) {
    var step = tutorialManager.steps[idx];
    if (!step) return;

    var langData = courseData[tutorialLang];
    if (!langData || !langData[step.phase] || !langData[step.phase][step.topic]) {
        document.getElementById('explanation').innerHTML = '<div class="loading-placeholder">Loading topic data...</div>';
        document.getElementById('editor').value = '';
        document.getElementById('output').innerText = '// Loading...';
        return;
    }

    loadTopic(step.phase, step.topic);

    var expEl = document.getElementById('explanation');
    var taskBox = document.createElement('div');
    taskBox.className = 'tutorial-task-box';
    taskBox.innerHTML = '<div class="tutorial-task-header">Your Task</div><div class="tutorial-task-body">' + step.task + '</div>';
    expEl.appendChild(taskBox);

    var output = document.getElementById('output');
    output.innerText = '// Click Run to start — try the task above!';

    renderTutorialNav(idx);
    renderTutorialProgress();
    updateContinueButton(false);
}

function renderTutorialNav(idx) {
    var nav = document.getElementById('tutorial-nav');
    if (!nav) return;
    var step = tutorialManager.steps[idx];
    var total = tutorialManager.getTotalSteps();
    var completed = tutorialManager.isStepCompleted(idx);

    nav.innerHTML = ''
        + '<div class="tutorial-nav-inner">'
        + '<button class="tutorial-nav-btn" onclick="tutorialGoBack()"' + (idx === 0 ? ' disabled' : '') + '>\u2190 Back</button>'
        + '<div class="tutorial-step-info">Step ' + (idx + 1) + ' of ' + total + '<span class="tutorial-step-name-nav"> ' + step.topic + '</span></div>'
        + '<button class="tutorial-nav-btn tutorial-continue-btn" id="tutorial-continue-btn" onclick="tutorialContinue()"' + (!completed ? ' disabled' : '') + '>Continue \u2192</button>'
        + '<button class="tutorial-stuck-btn" id="tutorial-stuck-btn" onclick="tutorialManager.showStuckPanel()" title="Need help?">?</button>'
        + '</div>';

    if (completed) updateContinueButton(true);
}

function renderTutorialProgress() {
    var el = document.getElementById('tutorial-progress');
    if (!el) return;
    var completed = tutorialManager.getCompletedCount();
    var total = tutorialManager.getTotalSteps();
    var pct = Math.round((completed / total) * 100);
    el.innerHTML = ''
        + '<div class="tutorial-progress-bar-track"><div class="tutorial-progress-bar-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="tutorial-progress-text">' + completed + '/' + total + ' lessons</div>';
}

function updateContinueButton(enabled) {
    var btn = document.getElementById('tutorial-continue-btn');
    if (!btn) return;
    btn.disabled = !enabled;
    if (enabled) {
        btn.classList.add('ready');
    } else {
        btn.classList.remove('ready');
    }
}

function tutorialGoBack() {
    tutorialManager.goBack();
    renderTutorialSidebar();
    loadTutorialStep(tutorialManager.getCurrentStepIndex());
}

function tutorialContinue() {
    var currentIdx = tutorialManager.getCurrentStepIndex();
    var currentStep = tutorialManager.steps[currentIdx];

    if (tutorialManager.isOnLastStep() && tutorialManager.isComplete()) {
        showTutorialComplete();
        return;
    }

    if (currentStep && currentStep.quizAfter) {
        tutorialManager.markStepComplete(currentIdx);
        renderTutorialSidebar();
        showQuizCheckpoint();
        return;
    }

    tutorialManager.markStepComplete(currentIdx);
    renderTutorialSidebar();

    if (tutorialManager.isComplete()) {
        showTutorialComplete();
        return;
    }

    loadTutorialStep(tutorialManager.getCurrentStepIndex());
}

function showQuizCheckpoint() {
    var overlay = document.getElementById('tutorial-quiz-overlay');
    if (!overlay) return;

    var questions = tutorialManager.getQuizQuestions(5);
    if (questions.length === 0) {
        doTutorialAdvance();
        return;
    }

    overlay._questions = questions;
    overlay._answers = {};
    overlay._currentQ = 0;

    overlay.classList.add('open');
    renderQuizQuestion(overlay, questions, 0, {});
}

function getQuizBody() {
    var overlay = document.getElementById('tutorial-quiz-overlay');
    return overlay ? overlay.querySelector('.tutorial-quiz-body') : null;
}

function renderQuizQuestion(overlay, questions, idx, answers) {
    var q = questions[idx];
    if (!q) return finalizeQuiz(overlay, questions, answers);

    var total = questions.length;
    var progressDots = '';
    for (var i = 0; i < total; i++) {
        var cls = 'quiz-dot';
        if (i < idx) cls += ' done';
        if (i === idx) cls += ' active';
        var label = i < idx ? '\u2713' : (i + 1);
        progressDots += '<span class="' + cls + '">' + label + '</span>';
    }

    var body = getQuizBody();
    if (!body) return;
    body.innerHTML = ''
        + '<div class="tutorial-quiz-content">'
        + '<div class="tutorial-quiz-header">Chapter Checkpoint<span class="tutorial-quiz-subtitle"> Pass ' + Math.ceil(total * 0.6) + '/' + total + ' to continue</span></div>'
        + '<div class="tutorial-quiz-progress">' + progressDots + '</div>'
        + '<div class="tutorial-quiz-question">'
        + '<div class="tutorial-q-num">Question ' + (idx + 1) + ' of ' + total + '</div>'
        + '<div class="tutorial-q-text">' + q.q + '</div>'
        + '<div class="tutorial-q-opts">';
    for (var oi = 0; oi < q.opts.length; oi++) {
        body.innerHTML += '<button class="tutorial-q-opt" onclick="answerTutorialQuiz(' + oi + ')">' + String.fromCharCode(65 + oi) + '. ' + q.opts[oi] + '</button>';
    }
    body.innerHTML += '</div></div></div>';

    overlay._questions = questions;
    overlay._answers = answers;
    overlay._currentQ = idx;
}

function answerTutorialQuiz(optIdx) {
    var overlay = document.getElementById('tutorial-quiz-overlay');
    if (!overlay) return;
    var questions = overlay._questions;
    var answers = overlay._answers;
    var idx = overlay._currentQ;

    answers[idx] = optIdx;
    var isCorrect = optIdx === questions[idx].ans;

    var optBtns = overlay.querySelectorAll('.tutorial-q-opt');
    optBtns.forEach(function (btn, i) {
        btn.disabled = true;
        if (i === questions[idx].ans) btn.classList.add('correct');
        if (i === optIdx && !isCorrect) btn.classList.add('wrong');
    });

    var explanation = document.createElement('div');
    explanation.className = 'tutorial-quiz-feedback ' + (isCorrect ? 'correct' : 'wrong');
    explanation.innerHTML = isCorrect
        ? '\u2705 Correct!'
        : '\u274C Not quite. The answer was: <strong>' + questions[idx].opts[questions[idx].ans] + '</strong>';

    var questionDiv = overlay.querySelector('.tutorial-quiz-question');
    questionDiv.appendChild(explanation);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'tutorial-quiz-next-btn';
    nextBtn.textContent = idx + 1 < questions.length ? 'Next Question \u2192' : 'See Results';
    nextBtn.onclick = function () {
        renderQuizQuestion(overlay, questions, idx + 1, answers);
    };
    questionDiv.appendChild(nextBtn);
}

function finalizeQuiz(overlay, questions, answers) {
    var result = tutorialManager.saveQuizScore(questions, answers);
    var passed = result.correct >= Math.ceil(result.total * 0.6);

    var dotsHtml = '';
    for (var i = 0; i < questions.length; i++) {
        var cls = 'quiz-dot done ' + (answers[i] === questions[i].ans ? 'correct' : 'wrong');
        var label = answers[i] === questions[i].ans ? '\u2713' : '\u2717';
        dotsHtml += '<span class="' + cls + '">' + label + '</span>';
    }

    var body = getQuizBody();
    if (!body) return;
    body.innerHTML = ''
        + '<div class="tutorial-quiz-content">'
        + '<div class="tutorial-quiz-header">' + (passed ? 'Nice work! \uD83C\uDF89' : 'Almost there! \uD83D\uDCAA') + '</div>'
        + '<div class="tutorial-quiz-result ' + (passed ? 'pass' : 'fail') + '">'
        + '<div class="tutorial-quiz-score">' + result.correct + '/' + result.total + '</div>'
        + '<div class="tutorial-quiz-score-label">' + (passed ? "You've got the basics down!" : "Review the chapter topics and try again.") + '</div>'
        + '</div>'
        + '<div class="tutorial-quiz-progress">' + dotsHtml + '</div>'
        + (!passed
            ? '<button class="tutorial-quiz-retry-btn" onclick="retryQuiz()">Retry Quiz</button>'
            : '<button class="tutorial-quiz-continue-btn" onclick="closeQuizAndAdvance()">Continue \u2192</button>')
        + '</div>';
}

function retryQuiz() {
    var overlay = document.getElementById('tutorial-quiz-overlay');
    if (!overlay) return;
    var questions = overlay._questions;
    overlay._answers = {};
    overlay._currentQ = 0;
    renderQuizQuestion(overlay, questions, 0, {});
}

function closeQuizAndAdvance() {
    document.getElementById('tutorial-quiz-overlay')?.classList.remove('open');
    doTutorialAdvance();
}

function doTutorialAdvance() {
    renderTutorialSidebar();

    if (tutorialManager.isComplete()) {
        showTutorialComplete();
        return;
    }

    loadTutorialStep(tutorialManager.getCurrentStepIndex());
}

function showTutorialComplete() {
    var expEl = document.getElementById('explanation');
    var completed = tutorialManager.getCompletedCount();
    var total = tutorialManager.getTotalSteps();
    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialLang]) || tutorialLang;

    var quizKeys = Object.keys(tutorialManager.state.quizScores);
    var totalQuizCorrect = 0;
    var totalQuizQuestions = 0;
    for (var k = 0; k < quizKeys.length; k++) {
        var score = tutorialManager.state.quizScores[quizKeys[k]];
        if (score) {
            totalQuizCorrect += score.correct;
            totalQuizQuestions += score.total;
        }
    }

    expEl.innerHTML = ''
        + '<div class="tutorial-complete">'
        + '<div class="tutorial-complete-icon">\uD83C\uDFC6</div>'
        + '<h2>Tutorial Complete!</h2>'
        + '<p>You\'ve finished the ' + langName + ' tutorial \u2014 great work!</p>'
        + '<div class="tutorial-complete-stats">'
        + '<div class="tutorial-complete-stat"><span class="stat-value">' + completed + '/' + total + '</span><span class="stat-label">Lessons</span></div>'
        + '<div class="tutorial-complete-stat"><span class="stat-value">' + totalQuizCorrect + '/' + totalQuizQuestions + '</span><span class="stat-label">Quiz Correct</span></div>'
        + '</div>'
        + '<p class="tutorial-complete-tip">Ready to go deeper? Try the <strong>Code Lab</strong> for challenges, or explore another language from the language bar!</p>'
        + '<button class="tutorial-complete-btn" onclick="tutorialManager.reset(); renderTutorial();">Start Again</button>'
        + '</div>';

    document.getElementById('editor').value = '// Congratulations on completing the ' + langName + ' tutorial!\n';
    document.getElementById('output').innerText = '// \uD83C\uDF89 Tutorial complete!';
    document.getElementById('tutorial-nav').style.display = 'none';
}

function tutorialRunHook() {
    if (!tutorialManager) return;
    var output = document.getElementById('output');
    var hasError = output && (
        output.innerText.includes('Error:') ||
        output.innerText.includes('SyntaxError') ||
        output.innerText.includes('ReferenceError') ||
        output.innerText.includes('TypeError')
    );
    tutorialManager.markRun(hasError);

    var currentIdx = tutorialManager.getCurrentStepIndex();
    if (!hasError && tutorialManager.runCount > 0 && !tutorialManager.isStepCompleted(currentIdx)) {
        updateContinueButton(true);
    }
    if (hasError) {
    }

