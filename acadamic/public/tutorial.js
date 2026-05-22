// ── Multi-Language Tutorial System ──

const TUTORIAL_LANGS = ['js', 'py', 'go', 'rs', 'c', 'cpp', 'cs', 'kt', 'swift', 'ts', 'zig', 'pg', 'mysql', 'sqlite'];
let tutorialLang = 'js';
let _tutorialStarterCode = '';
let _tutorialWalkStep = -1;
let _tutorialFeedbackEl = null;
let _tutorialLearnerId = (typeof LEARNER_ID !== 'undefined') ? LEARNER_ID : (localStorage.getItem('kodex_learner_id') || (function () { var id = 'tutorial_' + Date.now().toString(36); localStorage.setItem('kodex_learner_id', id); return id; })());
let _tutorialBackendUrl = (typeof BACKEND_URL !== 'undefined') ? BACKEND_URL : '';
var _tutorialLastExercise = null;
var _tutorialTaskState = [false, false, false];
var _tutorialAutoRan = false;
var _tutorialExplanationOpen = false;
var _tutorialQuickQShown = false;
var _tutorialEditorListener = null;
var _tutorialDebounceTimer = null;

var _tutorialHintLevels = [0, 0, 0];

var _tutorialHints = {
    0: [
        'Click the <strong>Run \u25B6</strong> button above to execute the starter code.',
        'Look at the <strong>output panel</strong> below the editor \u2014 it shows what the code produces.',
        'The output is the result of running the code. Try the next task to modify it!'
    ],
    1: [
        'Find a <strong>value, name, or condition</strong> in the code and change it.',
        'Try changing a <strong>number, string, or variable name</strong>, then click Run \u25B6.',
        'Small changes can have big effects \u2014 experiment and observe the difference!'
    ],
    2: [
        'Make a <strong>meaningful modification</strong> to the code\u2019s behavior.',
        'Try <strong>adding a new statement</strong>, changing a loop counter, or adding a condition.',
        'What else could this code do? <strong>Extend it</strong> with something new!'
    ]
};

function tutorialEscapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function tutorialStripHtml(value) {
    return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function tutorialAnnotateLine(line, message, severity) {
    if (typeof updateAnnotations === 'function') {
        updateAnnotations([{ line: line, message: message || '', severity: severity || 'info' }]);
    }
}

function tutorialClearAnnotations() {
    if (typeof clearAnnotations === 'function') clearAnnotations();
}

function tutorialWalkCode() {
    var editor = document.getElementById('editor');
    if (!editor) return;
    var lines = editor.value.split('\n');
    var filtered = [];
    for (var i = 0; i < lines.length; i++) {
        var trimmed = lines[i].trim();
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('--')) {
            filtered.push({ index: i, text: lines[i] });
        }
    }
    if (filtered.length === 0) {
        tutorialAnnotateLine(1, 'No significant code lines to walk through', 'info');
        return;
    }
    _tutorialWalkStep = (_tutorialWalkStep + 1) % filtered.length;
    var step = filtered[_tutorialWalkStep];
    tutorialClearAnnotations();
    tutorialAnnotateLine(step.index + 1, 'Line ' + (step.index + 1) + ' of ' + lines.length + ': ' + step.text.trim(), 'info');
    var output = document.getElementById('output');
    if (output) {
        output.innerText = '// Walking through line ' + (step.index + 1) + ' of ' + lines.length + '\n// "' + step.text.trim() + '"\n// Click again for next line \u2192';
    }
    editor.focus();
    var pos = 0;
    for (var j = 0; j < step.index; j++) {
        pos += lines[j].length + 1;
    }
    editor.setSelectionRange(pos, pos + lines[step.index].length);
    editor.scrollTop = Math.max(0, (step.index - 2)) * 20;
}

function tutorialExplainCurrent() {
    if (typeof explainCode === 'function') explainCode();
}

function tutorialShowExpectedOutput() {
    var editor = document.getElementById('editor');
    var output = document.getElementById('output');
    if (!editor) return;
    var preview = typeof getLogicalPreview === 'function' ? getLogicalPreview(editor.value, tutorialLang) : null;
    if (preview) {
        output.innerText = '// Expected output preview:\n' + preview;
    } else {
        output.innerText = '// No expected output preview available for this code.\n// Click Run to see what happens!';
    }
}

function tutorialShowDiff() {
    var editor = document.getElementById('editor');
    var output = document.getElementById('output');
    if (!editor || !_tutorialStarterCode) {
        if (output) output.innerText = '// No starter code to compare against.';
        return;
    }
    var current = editor.value;
    if (current === _tutorialStarterCode) {
        output.innerText = '// No changes yet \u2014 edit the code and run it to see your changes highlighted!';
        return;
    }
    if (typeof computeDiff === 'function') {
        var diff = computeDiff(_tutorialStarterCode, current);
        var hasChanges = false;
        var html = '<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">Changes from starter code:</div>';
        html += '<div style="max-height:200px;overflow-y:auto;background:#0f172a;border-radius:6px;padding:8px;">';
        for (var d = 0; d < diff.length; d++) {
            var entry = diff[d];
            if (entry.status === 'same') continue;
            hasChanges = true;
            var cls = entry.status === 'added' ? 'diff-added' : 'diff-removed';
            var prefix = entry.status === 'added' ? '+' : '-';
            var num = entry.status === 'added' ? entry.lineB + 1 : entry.lineA + 1;
            html += '<div class="diff-line ' + cls + '"><span class="diff-line-num" style="width:24px;display:inline-block;">' + num + '</span>' + prefix + ' ' + tutorialEscapeHtml(entry.text) + '</div>';
        }
        html += '</div>';
        output.innerHTML = hasChanges ? html : '<div style="color:#64748b;font-size:10px;">No meaningful differences detected.</div>';
    }
}

function tutorialShowFeedback(message, type) {
    var nav = document.getElementById('tutorial-nav');
    if (!nav) return;
    if (_tutorialFeedbackEl && _tutorialFeedbackEl.parentNode) _tutorialFeedbackEl.remove();
    _tutorialFeedbackEl = document.createElement('div');
    _tutorialFeedbackEl.className = 'tutorial-feedback tutorial-feedback-' + (type || 'info');
    _tutorialFeedbackEl.innerHTML = message;
    nav.parentNode.insertBefore(_tutorialFeedbackEl, nav.nextSibling);
}

function tutorialClearFeedback() {
    if (_tutorialFeedbackEl && _tutorialFeedbackEl.parentNode) {
        _tutorialFeedbackEl.remove();
        _tutorialFeedbackEl = null;
    }
}

function _tutorialTrackEvent(event, data) {
    var url = _tutorialBackendUrl + '/api/learner/track';
    var body = { event: event, learnerId: _tutorialLearnerId };
    if (data) Object.assign(body, data);
    try {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).catch(function () {});
    } catch (e) {}
}

function _tutorialSyncProgress(lang, topic, completed) {
    try {
        fetch(_tutorialBackendUrl + '/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lang: lang, topic: topic, completed: completed })
        }).catch(function () {});
    } catch (e) {}
}

var _tutorialPathShowing = false;

function tutorialInitKeys() {
    document.addEventListener('keydown', _tutorialKeyHandler);
}

function tutorialDestroyKeys() {
    document.removeEventListener('keydown', _tutorialKeyHandler);
}

function _tutorialKeyHandler(e) {
    var app = document.getElementById('app');
    if (!app || !app.classList.contains('tutorial-mode')) return;
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape' && document.activeElement.id !== 'editor') return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') return;
    }
    var isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl && e.key === 'ArrowRight') {
        e.preventDefault();
        var continueBtn = document.getElementById('tutorial-continue-btn');
        if (continueBtn && !continueBtn.disabled) tutorialContinue();
        return;
    }
    if (isCtrl && e.key === 'ArrowLeft') {
        e.preventDefault();
        tutorialGoBack();
        return;
    }
    if (e.key === '?' && !isCtrl) {
        e.preventDefault();
        if (tutorialManager) tutorialManager.showStuckPanel();
        return;
    }
    if (e.key === 'Escape' && !isCtrl) {
        var quizOverlay = document.getElementById('tutorial-quiz-overlay');
        if (quizOverlay && quizOverlay.classList.contains('open')) {
            quizOverlay.classList.remove('open');
            return;
        }
        var resumeOverlay = document.getElementById('tutorial-resume-overlay');
        if (resumeOverlay && resumeOverlay.classList.contains('open')) {
            resumeOverlay.classList.remove('open');
            return;
        }
        tutorialClearAnnotations();
        var stuckBtn = document.getElementById('tutorial-stuck-btn');
        if (stuckBtn) stuckBtn.classList.remove('visible', 'pulse', 'glow');
    }
    if (isCtrl && (e.key === 'Enter' || e.key === 'Shift')) {
        if (e.shiftKey) {
            e.preventDefault();
            var btn = document.getElementById('tutorial-continue-btn');
            if (btn && !btn.disabled) tutorialContinue();
        }
    }
}

function tutorialToggleLearningPath() {
    var content = document.getElementById('tutorial-path-content');
    if (!content) return;
    _tutorialPathShowing = !_tutorialPathShowing;
    var arrow = document.querySelector('.tutorial-path-arrow');
    if (arrow) arrow.textContent = _tutorialPathShowing ? '\u25B2' : '\u25BC';
    if (!_tutorialPathShowing) {
        content.style.display = 'none';
        return;
    }
    content.style.display = 'block';
    content.innerHTML = '<div style="padding:8px;font-size:9px;color:#64748b;">Loading your learning path...</div>';
    fetch(_tutorialBackendUrl + '/api/learner/path?lang=' + tutorialLang)
        .then(function (r) { return r.json(); })
        .then(function (d) {
            if (d.error || !d.progress) {
                content.innerHTML = '<div style="padding:8px;font-size:9px;color:#64748b;">Learning path unavailable</div>';
                return;
            }
            var pct = d.progress.percent;
            var html = '<div style="padding:8px;">'
                + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
                + '<span style="font-size:9px;font-weight:800;color:' + (d.weakAreas && d.weakAreas.length > 0 ? '#f59e0b' : 'var(--accent)') + ';">\uD83D\uDCC8 Progress</span>'
                + '<span style="font-size:8px;color:#94a3b8;">' + d.progress.completed + '/' + d.progress.total + '</span>'
                + '</div>'
                + '<div style="height:3px;background:#1e293b;border-radius:2px;margin-bottom:8px;overflow:hidden;">'
                + '<div style="height:100%;width:' + pct + '%;background:var(--accent);border-radius:2px;transition:width 0.5s;"></div>'
                + '</div>';
            if (d.weakAreas && d.weakAreas.length > 0) {
                html += '<div style="font-size:8px;color:#ef4444;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Needs review</div>';
                for (var w = 0; w < d.weakAreas.length; w++) {
                    html += '<div style="font-size:8px;color:#fbbf24;padding:2px 0;">\u26A0 ' + tutorialEscapeHtml(d.weakAreas[w].topic) + ' (' + d.weakAreas[w].mastery + '%)</div>';
                }
            }
            html += '</div>';
            content.innerHTML = html;
        })
        .catch(function () {
            content.innerHTML = '<div style="padding:8px;font-size:9px;color:#64748b;">Could not load path</div>';
        });
}

function tutorialFindChallenge(topic, lang) {
    if (typeof challengeData === 'undefined' || !challengeData) return null;
    var challenges = challengeData[lang || tutorialLang];
    if (!challenges) return null;
    var lower = (topic || '').toLowerCase();
    var words = lower.split(/[\s,-]+/).filter(function (w) { return w.length > 2; });
    var best = null, bestScore = 0;
    for (var i = 0; i < challenges.length; i++) {
        var c = challenges[i];
        var title = (c.title || '').toLowerCase();
        var desc = (c.desc || '').toLowerCase();
        var score = 0;
        for (var w = 0; w < words.length; w++) {
            if (title.indexOf(words[w]) !== -1) score += 2;
            if (desc.indexOf(words[w]) !== -1) score += 1;
        }
        if (lower.indexOf('variable') !== -1 && title.indexOf('variable') !== -1) score += 3;
        if (score > bestScore) { bestScore = score; best = { challenge: c, index: i }; }
    }
    return best && bestScore >= 2 ? best : null;
}

function tutorialLoadChallenge() {
    if (!tutorialManager) return;
    var step = tutorialManager.getCurrentStep();
    if (!step) return;
    var match = tutorialFindChallenge(step.topic, tutorialManager.lang);
    if (!match) {
        var output = document.getElementById('output');
        if (output) output.innerText = '// No related challenge found for this topic.';
        return;
    }
    if (typeof setMode === 'function') {
        setMode('challenge');
    }
}

function tutorialLoadExercise() {
    if (!_tutorialLastExercise) return;
    var editor = document.getElementById('editor');
    if (!editor) return;
    editor.value = _tutorialLastExercise.starterCode || '';
    if (typeof updateHighlight === 'function') updateHighlight();
    var output = document.getElementById('output');
    if (output) output.innerText = '// Exercise loaded! Click Run to test your solution\n// Hint: ' + (_tutorialLastExercise.hint || '');
    var hintBar = document.getElementById('tutorial-hint-bar');
    if (hintBar) {
        hintBar.className = 'tutorial-hint-bar visible';
        var hint = _tutorialLastExercise.hint || '';
        var sol = _tutorialLastExercise.solution || '';
        hintBar.innerHTML = ''
            + '<div style="font-size:9px;color:#7dd3fc;line-height:1.6;"><strong>Hint:</strong> ' + tutorialEscapeHtml(hint) + '</div>'
            + (sol ? '<button class="tutorial-feedback-btn" style="margin-top:4px;" onclick="tutorialShowSolution()">\uD83D\uDD11 Show solution</button>' : '');
    }
}

function tutorialShowSolution() {
    if (!_tutorialLastExercise || !_tutorialLastExercise.solution) return;
    var editor = document.getElementById('editor');
    if (!editor) return;
    editor.value = _tutorialLastExercise.solution;
    if (typeof updateHighlight === 'function') updateHighlight();
    var output = document.getElementById('output');
    if (output) output.innerText = '// Solution loaded \u2014 run it to see the expected output, then try to recreate it from memory!';
}

function tutorialCodePreview(code) {
    var lines = String(code || '').split('\n').filter(function (line) { return line.trim(); });
    var firstLine = lines[0] || '';
    return firstLine.length > 74 ? firstLine.slice(0, 71) + '...' : firstLine;
}

function getTutorialStepTask(step, item) {
    var topic = step.topic;
    var code = (item && item.code) || '';
    var escapedTopic = tutorialEscapeHtml(topic);
    var lowerTopic = topic.toLowerCase();
    var lowerCode = code.toLowerCase();

    var task2Hint = '';
    var task3Text = '';
    var task3Hint = '';

    // --- SQL pattern detection ---
    var isSql = (tutorialLang === 'pg' || tutorialLang === 'mysql' || tutorialLang === 'sqlite');
    var hasSelect = /\bSELECT\b/i.test(code);
    var hasJoin = /\b(JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|LATERAL)\b/i.test(code);
    var hasSubquery = /\(\s*SELECT\b/i.test(code);
    var hasDDL = /\b(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+INDEX|CREATE\s+VIEW|CREATE\s+TYPE|TRUNCATE)\b/i.test(code);
    var hasDML = /\b(INSERT\s+INTO|UPDATE\s+.*SET|DELETE\s+FROM|MERGE\s+INTO)\b/i.test(code);
    var hasAggregate = /\b(GROUP\s+BY|HAVING|COUNT\(|SUM\(|AVG\(|MIN\(|MAX\()\b/i.test(code);
    var hasOrderBy = /\bORDER\s+BY\b/i.test(code);
    var hasWhere = /\bWHERE\b/i.test(code);
    var hasWindow = /\b(OVER\s*\(|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE)\b/i.test(code);
    var hasCTE = /\bWITH\b/i.test(code) && /\bAS\s*\(/i.test(code);
    var hasSetOp = /\b(UNION|INTERSECT|EXCEPT)\b/i.test(code);
    var hasLimit = /\b(LIMIT|OFFSET|FETCH\s+FIRST|TOP)\b/i.test(code);
    var hasGroupBy = /\bGROUP\s+BY\b/i.test(code);

    // --- General programming pattern detection ---
    var hasLoop = /\b(for|while|do)\s*\(/.test(code) || /\b(for|while|do)\b/.test(lowerCode);
    var hasFunction = /\bfunction\s+\w+\s*\(/.test(code) || /\b(def\s+\w+|func\s+\w+|fn\s+\w+)\b/.test(code);
    var hasConditional = /\b(if|else|switch|case|elif)\b/.test(code);
    var hasVariable = /\b(let|var|const|int|float|string|bool)\s+\w+\s*=/.test(code) || /^\s*\w+\s*=\s*/.test(code);
    var hasConsole = /\bconsole\.log\b/.test(code) || /\bprint\b/.test(code) || /\bprintln\b/.test(code) || /\bfmt\.Print/.test(code);
    var hasClass = /\bclass\s+\w+/.test(code);
    var hasArray = /\[.*\]/.test(code) && /\.(push|pop|map|filter|reduce|length|sort|forEach|join)/.test(code);
    var hasStringOp = /\.(toUpperCase|toLowerCase|trim|replace|split|substring|slice|charAt|length)/.test(code);
    var hasAsync = /\b(async|await|\.then\(|\.catch\()/.test(code);
    var hasReturn = /\breturn\b/.test(code);
    var hasParam = /function\s+\w+\s*\([^)]*\w+[^)]*\)/.test(code) || /def\s+\w+\s*\([^)]*\w+[^)]*\)/.test(code);
    var hasEvent = /\b(addEventListener|onclick|onSubmit|onChange|\.on\()/.test(code);
    if (hasEvent) {
        task3Text = 'Change the event handler to do something different.';
        task3Hint = 'Look for the event listener and modify what happens when the event fires.';
    } else if (hasLoop && hasConditional) {
        task3Text = 'Change the loop or if-condition and predict the output.';
        task3Hint = 'Try modifying the condition inside the loop to see how it changes the flow.';
    } else if (hasLoop && hasArray) {
        task3Text = 'Add a new item to the array and re-run.';
        task3Hint = 'Push a new element into the array and observe how the loop output changes.';
    } else if (hasLoop) {
        task3Text = 'Change how many times the loop runs.';
        task3Hint = 'Modify the loop counter or condition to change the iteration count.';
    } else if (hasFunction && hasReturn) {
        task3Text = 'Change the return value or add a parameter.';
        task3Hint = 'Try returning a different value or adding a parameter to the function.';
    } else if (hasFunction && hasParam) {
        task3Text = 'Call with different arguments and observe.';
        task3Hint = 'Pass different values to the function and watch how the output changes.';
    } else if (hasFunction) {
        task3Text = 'Add a second function or modify this one.';
        task3Hint = 'Write a new function that uses or extends the existing one.';
    } else if (hasClass) {
        task3Text = 'Add a property or method to the class.';
        task3Hint = 'Try adding a new property in the constructor or a new method.';
    } else if (hasConditional) {
        task3Text = 'Change a condition to use a different comparison.';
        task3Hint = 'Switch > to <, or === to !==, and see what changes.';
    } else if (hasVariable && hasConsole) {
        task3Text = 'Change the variable value and re-run.';
        task3Hint = 'Modify the variable assignment, then run to see the new output.';
    } else if (hasVariable) {
        task3Text = 'Change the variable and add a print statement.';
        task3Hint = 'Update the variable\'s value and add console.log() to see it.';
    } else if (hasStringOp) {
        task3Text = 'Try a different string method.';
        task3Hint = 'Replace the method with another (e.g., toUpperCase -> toLowerCase).';
    } else if (hasAsync) {
        task3Text = 'Modify what happens after the await.';
        task3Hint = 'Add a console.log or transform the data after the async operation.';
    } else if (hasArray) {
        task3Text = 'Add an element or try a different array method.';
        task3Hint = 'Use push, pop, map, or filter to modify the array.';
    } else if (hasConsole) {
        task3Text = 'Change the printed message or add more output.';
        task3Hint = 'Modify the string inside console.log or add another print statement.';
    } else {
        var kwPatterns = {
            variable: { text: 'Change the variable name and value.', hint: 'Try a different variable name and a new value, then print it.' },
            function: { text: 'Modify the function or create a new one.', hint: 'Change what the function does, or write a second function that calls it.' },
            loop: { text: 'Change the loop count or behavior.', hint: 'Modify how many times the loop runs or what it does inside.' },
            array: { text: 'Add more items or try array methods.', hint: 'Push new elements or try .map, .filter, .reduce.' },
            string: { text: 'Modify the string or try a different operation.', hint: 'Change the string value or try a different string method.' },
            class: { text: 'Add another method or create a subclass.', hint: 'Extend the class with a new method or create a child class.' },
            object: { text: 'Add a new property and access it.', hint: 'Assign a new key-value pair and log it to the console.' },
            'hello world': { text: 'Change the greeting message!', hint: 'Personalize the message to say something different.' },
            print: { text: 'Change what is printed or add more.', hint: 'Modify the print statement or add another one.' },
            'data type': { text: 'Try a different data type.', hint: 'Change the type (string -> number, int -> float) and observe.' },
            operator: { text: 'Change the operator and see the result.', hint: 'Swap +, -, *, /, % and see how the output changes.' },
            comparison: { text: 'Try different comparison operators.', hint: 'Use >, <, >=, <=, ===, !== and compare.' },
            boolean: { text: 'Flip the boolean value.', hint: 'Change true to false (or vice versa) and re-run.' },
            input: { text: 'Change the input value.', hint: 'Modify the input data and see how the output differs.' },
            output: { text: 'Modify the output format.', hint: 'Change how the result is formatted or displayed.' },
            math: { text: 'Change the numbers and predict the result.', hint: 'Modify the numeric values and mentally calculate the new output.' },
            null: { text: 'Try a different value (0, null, "").', hint: 'Assign different falsy values and compare behavior.' }
        };
        task3Text = null;
        for (var kw in kwPatterns) {
            if (lowerTopic.includes(kw) || lowerCode.includes(kw)) {
                task3Text = kwPatterns[kw].text;
                task3Hint = kwPatterns[kw].hint;
                break;
            }
        }
        if (!task3Text) {
            var topics = topic.split(/[\s,-]+/);
            for (var t = 0; t < topics.length; t++) {
                if (kwPatterns[topics[t].toLowerCase()]) {
                    task3Text = kwPatterns[topics[t].toLowerCase()].text;
                    task3Hint = kwPatterns[topics[t].toLowerCase()].hint;
                    break;
                }
            }
        }
        if (!task3Text) {
            task3Text = 'Change one value, name, or condition and run again.';
            task3Hint = 'Pick any number, string, or operator and modify it slightly.';
        }
    }

    if (hasConsole || lowerCode.indexOf('console.log') !== -1 || lowerCode.indexOf('print') !== -1) {
        task2Hint = 'Look at the output panel to see what the code prints.';
    } else if (hasVariable) {
        task2Hint = 'The code declares variables — check the console for their values.';
    } else if (hasFunction) {
        task2Hint = 'The code defines a function — running it will execute the function body.';
    } else {
        task2Hint = 'See what output appears in the panel below.';
    }

    var html = ''
        + '<button class="tutorial-task-item" onclick="tutorialTaskClick(0)" data-idx="0">'
        + '<span class="tutorial-task-icon">1</span>'
        + '<span class="tutorial-task-text"><strong>Run</strong> the starter code and see what it does<div class="tutorial-task-hint">Click to execute the code</div></span>'
        + '</button>'
        + '<button class="tutorial-task-item" onclick="tutorialTaskClick(1)" data-idx="1">'
        + '<span class="tutorial-task-icon">2</span>'
        + '<span class="tutorial-task-text"><strong>Change</strong> ' + tutorialEscapeHtml(task3Text.toLowerCase().replace(/^(change|modify|try|add|flip|call|swap|pick)\s+/i, '')) + '<div class="tutorial-task-hint">' + tutorialEscapeHtml(task2Hint || 'Edit the code in the editor') + '</div></span>'
        + '</button>'
        + '<button class="tutorial-task-item" onclick="tutorialTaskClick(2)" data-idx="2">'
        + '<span class="tutorial-task-icon">3</span>'
        + '<span class="tutorial-task-text"><strong>Experiment:</strong> ' + tutorialEscapeHtml(task3Text) + '<div class="tutorial-task-hint">' + tutorialEscapeHtml(task3Hint) + '</div></span>'
        + '</button>';

    return html;
}

function tutorialGetAnnotatableLines(code) {
    var lines = code.split('\n');
    var targets = [];
    for (var i = 0; i < lines.length; i++) {
        var t = lines[i].trim();
        if (!t || t.startsWith('//') || t.startsWith('#') || t.startsWith('/*') || t.startsWith('*')) continue;
        if (/\b(let|var|const|int|float|string|bool)\s+\w+\s*=/.test(t)) targets.push(i);
        else if (/\b(if|else if|elif)\b/.test(t)) targets.push(i);
        else if (/\b(for|while|do)\b/.test(t)) targets.push(i);
        else if (/\bfunction\s+\w+\s*\(/.test(t) || /\b(def|func|fn)\s+\w+\s*\(/.test(t)) targets.push(i);
        else if (/\breturn\b/.test(t)) targets.push(i);
        else if (/\bclass\s+\w+/.test(t)) targets.push(i);
        else if (/\bconsole\.log|print\(|println!?/.test(t)) targets.push(i);
        else if (/=\s*['"`]/.test(t)) targets.push(i);
        else if (/\bswitch\s*\(/.test(t)) targets.push(i);
        else if (/\btry\b/.test(t)) targets.push(i);
    }
    return targets;
}

function tutorialAnnotateTargetLines(code) {
    if (typeof updateAnnotations !== 'function') return;
    var targets = tutorialGetAnnotatableLines(code);
    if (targets.length === 0) {
        var ed = document.getElementById('editor');
        if (ed && ed.value.length > 0) {
            updateAnnotations([{ line: 1, message: 'Try editing any line of code', severity: 'info' }]);
        }
        return;
    }
    var annotateCount = Math.min(3, targets.length);
    var startIdx = Math.floor(Math.random() * Math.max(1, targets.length - annotateCount + 1));
    var anns = [];
    for (var i = startIdx; i < startIdx + annotateCount && i < targets.length; i++) {
        anns.push({ line: targets[i] + 1, message: 'Try changing this line', severity: 'info' });
    }
    updateAnnotations(anns);
}

function tutorialTaskClick(idx) {
    if (_tutorialTaskState[idx]) return;
    var items = document.querySelectorAll('.tutorial-task-item');
    items.forEach(function (i) { i.classList.remove('active'); });
    if (items[idx]) items[idx].classList.add('active');
    _tutorialHintLevels[idx] = 0;

    if (idx === 0) {
        var runBtn = document.querySelector('.tutorial-interact-btn.run');
        if (runBtn) {
            runBtn.style.transition = 'box-shadow 0.15s';
            runBtn.style.boxShadow = '0 0 0 2px var(--accent)';
            setTimeout(function () { runBtn.style.boxShadow = ''; }, 1500);
        }
        tutorialClearAnnotations();
        runCode();
    } else if (idx === 1) {
        var ed = document.getElementById('editor');
        if (ed) {
            ed.focus();
            var code = ed.value;
            var lines = code.split('\n');
            var targets = tutorialGetAnnotatableLines(code);
            if (targets.length > 0) {
                var midTarget = targets[Math.floor(targets.length / 2)];
                var pos = 0;
                for (var li = 0; li < midTarget; li++) { pos += lines[li].length + 1; }
                var endPos = pos + lines[midTarget].length;
                ed.setSelectionRange(pos, endPos);
                ed.scrollTop = Math.max(0, (midTarget - 2)) * 20;
            } else {
                var mid = Math.floor(code.length / 3);
                var end = Math.min(code.length, mid + Math.floor(code.length / 4));
                ed.setSelectionRange(mid, end);
            }
            tutorialAnnotateTargetLines(code);
        } else {
            tutorialClearAnnotations();
        }
        tutorialShowFeedback('<strong>\u270F\uFE0F Edit the code</strong> \u2014 change a value, name, or condition. Then click <strong>Run</strong> \u25B6.', 'info');
        var runBtn2 = document.querySelector('.tutorial-interact-btn.run');
        if (runBtn2) {
            runBtn2.style.transition = 'box-shadow 0.15s';
            runBtn2.style.boxShadow = '0 0 0 2px #22c55e';
            setTimeout(function () { runBtn2.style.boxShadow = ''; }, 2000);
        }
    } else if (idx === 2) {
        var ed2 = document.getElementById('editor');
        if (ed2) {
            ed2.focus();
            ed2.setSelectionRange(ed2.value.length, ed2.value.length);
        }
        tutorialClearAnnotations();
        tutorialShowFeedback('<strong>\U0001F52C Experiment time!</strong> Make a meaningful change \u2014 try something you haven\u2019t tried yet.', 'info');
        var expBtn = document.querySelector('.tutorial-interact-btn.run');
        if (expBtn) {
            expBtn.style.transition = 'box-shadow 0.15s';
            expBtn.style.boxShadow = '0 0 0 2px #8b5cf6';
            setTimeout(function () { expBtn.style.boxShadow = ''; }, 2500);
        }
    }

    tutorialShowHintForTask(idx);
}

function tutorialShowHintForTask(idx) {
    var hintBar = document.getElementById('tutorial-hint-bar');
    if (!hintBar) return;
    var level = _tutorialHintLevels[idx];
    var hints = _tutorialHints[idx];
    if (!hints || level >= hints.length) return;

    hintBar.className = 'tutorial-hint-bar visible';
    var hintText = hints[level];
    var hasMore = level + 1 < hints.length;
    hintBar.innerHTML = ''
        + '<div style="display:flex;align-items:flex-start;gap:8px;">'
        + '<span style="flex-shrink:0;font-size:12px;\uD83D\uDCA1"></span>'
        + '<div style="flex:1;font-size:10px;line-height:1.5;color:#7dd3fc;">' + hintText + '</div>'
        + (hasMore ? '<button class="tutorial-feedback-btn" onclick="tutorialNextHint(' + idx + ')" style="flex-shrink:0;">More help \u2192</button>' : '')
        + '</div>';
}

function tutorialNextHint(idx) {
    _tutorialHintLevels[idx]++;
    tutorialShowHintForTask(idx);
}

function tutorialUpdateTask(idx) {
    if (_tutorialTaskState[idx]) return;
    _tutorialTaskState[idx] = true;
    var items = document.querySelectorAll('.tutorial-task-item');
    if (items[idx]) {
        items[idx].classList.remove('active');
        items[idx].classList.add('done');
    }

    if (typeof showToast === 'function') {
        var msgs = ['Task 1 done!', 'Nice edit!', 'Awesome experiment!'];
        showToast(msgs[idx] || 'Task complete!', 'success');
    }

    var allDone = _tutorialTaskState.every(function (s) { return s; });
    if (allDone) {
        var taskHeader = document.querySelector('.tutorial-task-header');
        if (taskHeader) {
            taskHeader.innerHTML = 'Your task \u2714\uFE0F <span style="color:#10b981;font-size:10px;">All done!</span>';
        }
        if (typeof showToast === 'function') showToast('All tasks complete! Great work!', 'success');
        if (typeof createConfetti === 'function') createConfetti(15);
        var contBtn = document.getElementById('tutorial-continue-btn');
        if (contBtn) {
            updateContinueButton(true);
            contBtn.style.transition = 'box-shadow 0.3s';
            contBtn.style.boxShadow = '0 0 12px rgba(249,115,22,0.5)';
            setTimeout(function () { if (contBtn) contBtn.style.boxShadow = ''; }, 3000);
        }
        var hintBar = document.getElementById('tutorial-hint-bar');
        if (hintBar) {
            hintBar.className = 'tutorial-hint-bar visible';
            hintBar.innerHTML = '<span style="color:#22c55e;font-weight:700;">\u2714\uFE0F All tasks done! Click Continue \u2192 to move on.</span>';
        }
    }
}

function tutorialResetTaskState() {
    _tutorialTaskState = [false, false, false];
    _tutorialQuickQShown = false;
}

function getTutorialAskPrompt() {
    if (!tutorialManager) return 'Help me with this tutorial step.';
    var step = tutorialManager.getCurrentStep();
    if (!step) return 'Help me with this tutorial step.';
    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialManager.lang]) || tutorialManager.lang;
    var code = document.getElementById('editor')?.value || '';
    var prompt = 'I am learning ' + langName + ' with Devin. The tutorial topic is "' + step.topic + '" in the "' + step.phase + '" chapter. ';
    prompt += 'Explain the idea, point out what I should notice in this code, and give me one small experiment to try.';
    if (code.trim()) prompt += '\n\nCurrent code:\n' + code;
    return prompt;
}

function tutorialAskDevin() {
    if (typeof toggleAI === 'function') toggleAI();
    setTimeout(function () {
        if (typeof askAI === 'function') askAI(getTutorialAskPrompt());
    }, 300);
    setTimeout(function () {
        if (typeof updateAISuggestions === 'function') updateAISuggestions();
    }, 100);
}

function clearTutorialWorkspace(lang) {
    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[lang]) || lang;
    var exp = document.getElementById('explanation');
    var editor = document.getElementById('editor');
    var output = document.getElementById('output');
    if (exp) {
        exp.innerHTML = '<div class="loading-placeholder">Loading ' + tutorialEscapeHtml(langName) + ' tutorial...</div>';
    }
    if (editor) editor.value = '// Loading ' + langName + ' tutorial...';
    if (output) output.innerText = '// Switching tutorial language...';
    var nav = document.getElementById('tutorial-nav');
    if (nav) nav.innerHTML = '';
    var stuckPanel = document.getElementById('tutorial-stuck-panel');
    if (stuckPanel) stuckPanel.remove();
    tutorialDestroyKeys();
    tutorialClearAnnotations();
    tutorialClearFeedback();
    _tutorialStarterCode = '';
    _tutorialWalkStep = -1;
}

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
                task: 'Run the starter code, inspect the output, then make one small edit and run it again.',
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

        var step = this.getCurrentStep();
        if (step) {
            _tutorialTrackEvent('attempt', { lang: this.lang, topic: step.topic, phase: step.phase });
            if (hasError) {
                _tutorialTrackEvent('error', { lang: this.lang, topic: step.topic, phase: step.phase });
            }
        }
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

            var step = this.steps[index];
            if (step) {
                _tutorialTrackEvent('complete-topic', { lang: this.lang, topic: step.topic, phase: step.phase });
                _tutorialSyncProgress(this.lang, step.topic, true);
            }

            if (typeof createConfetti === 'function') createConfetti(25);
            if (typeof showToast === 'function') showToast('Step complete!', 'success');
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

        var panel = document.createElement('div');
        panel.id = 'tutorial-stuck-panel';
        panel.innerHTML = ''
            + '<div class="tutorial-stuck-header">'
            + '<span>Need a hand?</span>'
            + '<button onclick="this.parentElement.parentElement.remove()">\u2715</button>'
            + '</div>'
            + '<div class="tutorial-stuck-body">'
            + '<div class="tutorial-stuck-tip"><strong>Working on:</strong> ' + tutorialEscapeHtml(step.topic) + '</div>'
            + '<div class="tutorial-stuck-tip"><strong>Try this:</strong> Run the code once, then change one value, name, message, or branch condition and run again.</div>'
            + '<div class="tutorial-stuck-actions">'
            + '<button onclick="tutorialDismissStuckPanel(); openCheatsheet()">Open Cheatsheet</button>'
            + '<button onclick="tutorialDismissStuckPanel(); tutorialAskDevin()">Ask Devin</button>'
            + '<button onclick="tutorialDismissStuckPanel(); tutorialManager.resetCurrentCode()">Reset code</button>'
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
        _tutorialStarterCode = item.code || '';
        _tutorialWalkStep = -1;
        tutorialClearAnnotations();
        tutorialClearFeedback();
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
        _tutorialTrackEvent('quiz', { data: { correct: correct, total: questions.length } });
        return { correct: correct, total: questions.length };
    }
}

var tutorialManager = null;

function tutorialDismissStuckPanel() {
    if (tutorialManager) tutorialManager.clearStuckTimer();
    var stuckBtn = document.getElementById('tutorial-stuck-btn');
    if (stuckBtn) stuckBtn.classList.remove('visible', 'pulse', 'glow');
    var panel = document.getElementById('tutorial-stuck-panel');
    if (panel) panel.remove();
}

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

    tutorialClearAnnotations();
    tutorialClearFeedback();
    tutorialInitKeys();
    _tutorialStarterCode = '';
    _tutorialWalkStep = -1;

    if (!tutorialManager || tutorialManager.lang !== tutorialLang) {
        tutorialManager = new TutorialManager(tutorialLang);
    }

    showTutorialTopicBrowser();
}

function showTutorialTopicBrowser() {
    var expEl = document.getElementById('explanation');
    var editor = document.getElementById('editor');
    var output = document.getElementById('output');
    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialLang]) || tutorialLang;
    var data = courseData[tutorialLang];
    if (!data) return;

    currentLang = tutorialLang;
    document.getElementById('app').className = 'tutorial-mode';
    var titleEl = document.getElementById('header-title');
    if (titleEl) titleEl.innerText = 'TUTORIAL — ' + langName.toUpperCase();

    document.querySelectorAll('.selector button').forEach(function (b) { b.classList.remove('active'); });
    document.getElementById('engine-bar').style.display = 'none';
    document.getElementById('platform-bar').style.display = 'none';
    document.getElementById('level-bar').style.display = 'none';
    document.getElementById('schema-btn').style.display = 'none';
    document.getElementById('cheatsheet-btn').style.display = 'none';

    renderTutorialLangBar();
    renderTutorialSidebar();

    var completed = tutorialManager.getCompletedCount();
    var total = tutorialManager.getTotalSteps();
    var step = tutorialManager.getCurrentStep();

    var resumeHtml = '';
    if (completed > 0 && step) {
        resumeHtml = '<div class="tutorial-resume-banner" onclick="resumeTutorial()">'
            + '\u25B6 Resume where you left off: <strong>' + tutorialEscapeHtml(step.topic) + '</strong>'
            + ' (' + completed + '/' + total + ' completed)'
            + '</div>';
    }

    var phases = Object.keys(data);
    var browserHtml = '';
    for (var p = 0; p < phases.length; p++) {
        var phase = phases[p];
        var topics = Object.keys(data[phase]);
        var topicCount = topics.length;
        var completedInPhase = 0;
        for (var t = 0; t < topics.length; t++) {
            for (var ci = 0; ci < tutorialManager.state.completedSteps.length; ci++) {
                var si = tutorialManager.steps[tutorialManager.state.completedSteps[ci]];
                if (si && si.phase === phase && si.topic === topics[t]) {
                    completedInPhase++;
                    break;
                }
            }
        }
        browserHtml += '<div class="tutorial-browser-phase">'
            + '<div class="tutorial-browser-phase-header">'
            + '<span class="tutorial-browser-phase-name">' + tutorialEscapeHtml(phase) + '</span>'
            + '<span class="tutorial-browser-phase-count">' + completedInPhase + '/' + topicCount + '</span>'
            + '</div>'
            + '<div class="tutorial-browser-topics">';
        for (var t = 0; t < topics.length; t++) {
            var topic = topics[t];
            var isCompleted = false;
            for (var ci = 0; ci < tutorialManager.state.completedSteps.length; ci++) {
                var si = tutorialManager.steps[tutorialManager.state.completedSteps[ci]];
                if (si && si.phase === phase && si.topic === topic) {
                    isCompleted = true;
                    break;
                }
            }
            var stepIdx = -1;
            for (var si2 = 0; si2 < tutorialManager.steps.length; si2++) {
                if (tutorialManager.steps[si2].phase === phase && tutorialManager.steps[si2].topic === topic) {
                    stepIdx = si2;
                    break;
                }
            }
            var completedCls = isCompleted ? ' completed' : '';
            browserHtml += '<button class="tutorial-browser-topic' + completedCls + '" onclick="goToTutorialStep(' + stepIdx + ')">'
                + (isCompleted ? '\u2713 ' : '') + tutorialEscapeHtml(topic)
                + '</button>';
        }
        browserHtml += '</div></div>';
    }

    expEl.innerHTML = ''
        + '<div class="tutorial-browser">'
        + '<div class="tutorial-browser-header">'
        + '<h2>' + tutorialEscapeHtml(langName) + '</h2>'
        + '<p>Pick any topic to start learning. No prerequisites needed \u2014 explore freely!</p>'
        + '</div>'
        + resumeHtml
        + browserHtml
        + '</div>';

    if (editor) editor.value = '// Pick a topic from the browser above to get started!';
    if (output) output.innerText = '// ' + tutorialEscapeHtml(langName) + ' \u2014 ' + total + ' topics available';
}

function resumeTutorial() {
    var step = tutorialManager.getCurrentStep();
    if (step) {
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
    if (searchInput) {
        searchInput.style.display = '';
        searchInput.placeholder = 'Search tutorial topics...';
        searchInput.oninput = function () {
            if (typeof debounceFilterTopics === 'function') debounceFilterTopics(this.value);
        };
    }

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
        tutorialManager.clearStuckTimer();
        _savedProgress[tutorialLang] = tutorialManager.state;
    }

    tutorialLang = lang;
    clearTutorialWorkspace(lang);

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
    currentLang = lang;
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
    showTutorialTopicBrowser();
}

function renderTutorialSidebar() {
    var topicList = document.getElementById('topic-list');
    if (!topicList) return;

    var langBar = topicList.querySelector('.tutorial-lang-bar');
    var steps = tutorialManager.steps;
    var currentIdx = tutorialManager.getCurrentStepIndex();
    var completedSteps = tutorialManager.state.completedSteps;

    var completedCount = tutorialManager.getCompletedCount();
    var total = tutorialManager.getTotalSteps();
    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialLang]) || tutorialLang;
    var html = langBar ? langBar.outerHTML : '';
    html += '<div class="tutorial-sidebar-summary">'
        + '<span>' + tutorialEscapeHtml(langName) + ' path</span>'
        + '<strong>' + completedCount + '/' + total + '</strong>'
        + '</div>'
        + '<div class="tutorial-path-toggle" onclick="tutorialToggleLearningPath()">\uD83D\uDCDA Learning Path <span class="tutorial-path-arrow">\u25BC</span></div>'
        + '<div class="tutorial-path-content" id="tutorial-path-content"></div>';

    var currentChapter = '';
    for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        if (s.phase !== currentChapter) {
            currentChapter = s.phase;
            html += '<div class="tutorial-chapter-label">' + s.phase + '</div>';
        }

        var isCompleted = completedSteps.includes(i);
        var isCurrent = i === currentIdx;

        var dotContent = isCompleted ? '\u2713' : (isCurrent ? '\u25B6' : '\u25CB');

        var cls = 'tutorial-step-btn';
        if (isCompleted) cls += ' completed';
        if (isCurrent) cls += ' current';

        html += '<button class="' + cls + '" onclick="goToTutorialStep(' + i + ')" title="' + tutorialEscapeHtml(s.topic) + '">'
            + '<span class="tutorial-step-dot">' + dotContent + '</span>'
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
    currentLang = tutorialLang;
    tutorialManager.state.currentStep = idx;
    tutorialManager.runCount = 0;
    tutorialManager.errorCount = 0;
    tutorialManager.lastInteraction = Date.now();
    tutorialManager.saveState();
    tutorialClearAnnotations();
    tutorialClearFeedback();
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

    var prevExplanation = document.getElementById('explanation').innerHTML;
    var prevExpContent = '';
    if (prevExplanation) {
        var expBody = document.getElementById('tutorial-exp-body');
        if (expBody) prevExpContent = expBody.innerHTML;
    }

    loadTopic(step.phase, step.topic);

    var expEl = document.getElementById('explanation');
    var item = langData[step.phase][step.topic];
    _tutorialStarterCode = item.code || '';
    _tutorialWalkStep = -1;
    _tutorialLastExercise = null;
    _tutorialAutoRan = false;
    _tutorialExplanationOpen = false;
    _tutorialQuickQShown = false;
    _tutorialTaskState = [false, false, false];
    tutorialClearAnnotations();
    tutorialClearFeedback();
    var hintBar = document.getElementById('tutorial-hint-bar');
    if (hintBar) hintBar.className = 'tutorial-hint-bar';

    var langName = (typeof LANG_NAMES !== 'undefined' && LANG_NAMES[tutorialLang]) || tutorialLang;
    var totalSteps = tutorialManager.getTotalSteps();

    var coach = document.createElement('div');
    coach.className = 'tutorial-coach-card';
    coach.innerHTML = ''
        + '<div class="tutorial-coach-top">'
        + '<div><div class="tutorial-coach-kicker">Step ' + (idx + 1) + ' of ' + totalSteps + '</div>'
        + '<h4>' + tutorialEscapeHtml(step.topic) + '</h4>'
        + '<p>' + tutorialEscapeHtml(step.phase) + ' \u00B7 ' + tutorialEscapeHtml(langName) + '</p></div>'
        + '<button type="button" onclick="tutorialAskDevin()">Ask Devin</button>'
        + '</div>'
        + '<div class="tutorial-coach-actions">'
        + '<button type="button" class="tutorial-interact-btn run" id="tutorial-run-btn" onclick="runCode()">\u25B6 Run</button>'
        + '<button type="button" class="tutorial-interact-btn" onclick="tutorialWalkCode()">\uD83D\uDD0D Walk</button>'
        + '<button type="button" class="tutorial-interact-btn" onclick="tutorialExplainCurrent()">\uD83D\uDCD6 Explain</button>'
        + '<button type="button" class="tutorial-interact-btn" onclick="tutorialShowExpectedOutput()">\uD83D\uDD2D Predict</button>'
        + '<button type="button" class="tutorial-interact-btn" onclick="tutorialShowDiff()">\uD83D\uDCDD Diff</button>'
        + '<button type="button" class="tutorial-interact-btn" onclick="tutorialManager.resetCurrentCode()">\u21BA Reset</button>'
        + '<button type="button" class="tutorial-interact-btn" onclick="tutorialLoadChallenge()">\uD83C\uDFC6 Challenge</button>'
        + '<button type="button" class="tutorial-interact-btn" onclick="openCheatsheet()">\uD83D\uDCCB Ref</button>'
        + '</div>';

    var taskBox = document.createElement('div');
    taskBox.className = 'tutorial-task-box';
    taskBox.id = 'tutorial-task-box';
    taskBox.innerHTML = '<div class="tutorial-task-header">Your task</div><div class="tutorial-task-body" id="tutorial-task-body">' + getTutorialStepTask(step, item) + '</div>'
        + '<div class="tutorial-hint-bar" id="tutorial-hint-bar"></div>';

    var explanationContent = expEl.innerHTML;
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'tutorial-exp-toggle';
    toggleBtn.id = 'tutorial-exp-toggle';
    toggleBtn.innerHTML = '\uD83D\uDCD6 Read about <strong>' + tutorialEscapeHtml(step.topic) + '</strong> <span class="tutorial-exp-arrow">\u25B6</span>';
    toggleBtn.onclick = function () { tutorialToggleExplanation(); };

    var expWrapper = document.createElement('div');
    expWrapper.className = 'tutorial-exp-body';
    expWrapper.id = 'tutorial-exp-body';
    expWrapper.style.display = 'none';
    expWrapper.innerHTML = explanationContent;

    expEl.innerHTML = '';
    expEl.appendChild(coach);
    expEl.appendChild(taskBox);

    var testSelfBtn = document.createElement('button');
    testSelfBtn.className = 'tutorial-test-self-btn';
    testSelfBtn.innerHTML = '\uD83E\uDDEA Test Yourself';
    testSelfBtn.onclick = function () {
        var q = _tutorialGenerateQuickQuestion(step.topic, item.code || '');
        if (q) {
            var existingQ = document.getElementById('tutorial-quick-q');
            if (existingQ) existingQ.remove();
            var quickQ = document.createElement('div');
            quickQ.className = 'tutorial-quick-q';
            quickQ.id = 'tutorial-quick-q';
            quickQ.innerHTML = ''
                + '<div class="tutorial-quick-q-header">\uD83D\uDCA1 Quick check</div>'
                + '<div class="tutorial-quick-q-text">' + q.q + '</div>'
                + '<div class="tutorial-quick-q-opts"></div>'
                + '<div class="tutorial-quick-q-result" id="tutorial-quick-q-result"></div>'
                + '<span class="tutorial-quick-q-skip" onclick="document.getElementById(\'tutorial-quick-q\')?.remove()">Dismiss \u2192</span>';
            taskBox.appendChild(quickQ);
            var optsContainer = quickQ.querySelector('.tutorial-quick-q-opts');
            if (optsContainer) {
                for (var oi = 0; oi < q.opts.length; oi++) {
                    var optBtn = document.createElement('button');
                    optBtn.className = 'tutorial-quick-q-opt';
                    optBtn.textContent = String.fromCharCode(65 + oi) + '. ' + q.opts[oi];
                    optBtn.onclick = (function (idx, answer, questionObj) {
                        return function () {
                            if (this.disabled) return;
                            var parent = this.parentElement;
                            if (!parent) return;
                            var btns = parent.querySelectorAll('.tutorial-quick-q-opt');
                            btns.forEach(function (b) { b.disabled = true; });
                            var allCorrect = idx === answer;
                            this.classList.add(allCorrect ? 'correct' : 'wrong');
                            btns[answer].classList.add('correct');
                            var resultEl = document.getElementById('tutorial-quick-q-result');
                            if (resultEl) {
                                resultEl.className = 'tutorial-quick-q-result ' + (allCorrect ? 'pass' : 'fail');
                                resultEl.innerHTML = allCorrect
                                    ? '\u2705 Correct! ' + (questionObj.explain || '')
                                    : '\u274C Not quite. The answer was: <strong>' + questionObj.opts[answer] + '</strong>';
                            }
                            var skipEl = parent.parentElement ? parent.parentElement.querySelector('.tutorial-quick-q-skip') : null;
                            if (skipEl) skipEl.textContent = allCorrect ? 'Dismiss \u2192' : 'Continue \u2192';
                            if (allCorrect && typeof showScorePopup === 'function') showScorePopup('+2 XP', 'game-xp-popup');
                        };
                    })(oi, q.ans, q);
                    optsContainer.appendChild(optBtn);
                }
            }
        }
    };
    expEl.appendChild(testSelfBtn);

    expEl.appendChild(toggleBtn);
    expEl.appendChild(expWrapper);

    tutorialAddInlineExercise(expEl, step, item.code || '');

    var relatedEl = buildRelatedTopics(step, idx);
    if (relatedEl) expEl.appendChild(relatedEl);

    var output = document.getElementById('output');
    output.innerText = '// \u26A1 Auto-running starter code...\n// Once it finishes, try the tasks above!';

    renderTutorialNav(idx);
    renderTutorialProgress();
    updateContinueButton(true);

    var ed = document.getElementById('editor');
    if (ed) {
        ed.focus();
        var firstEnd = ed.value.indexOf('\n');
        if (firstEnd === -1) firstEnd = ed.value.length;
        ed.setSelectionRange(0, firstEnd);

        if (_tutorialEditorListener) {
            ed.removeEventListener('input', _tutorialEditorListener);
        }
        _tutorialEditorListener = function () {
            if (_tutorialDebounceTimer) clearTimeout(_tutorialDebounceTimer);
            _tutorialDebounceTimer = setTimeout(function () {
                _tutorialDebouncedEditorCheck();
            }, 600);
        };
        ed.addEventListener('input', _tutorialEditorListener);
    }

    setTimeout(function () {
        if (typeof runCode === 'function') {
            _tutorialAutoRan = true;
            runCode();
        }
    }, 400);
}

function tutorialAddInlineExercise(expEl, step, code) {
    if (!code || !code.trim()) return;
    var lines = code.split('\n').filter(function (l) { return l.trim(); });
    if (lines.length < 2) return;

    var exercises = [];
    var lowerCode = code.toLowerCase();

    if (/\b(console\.log|print)\b/.test(code)) {
        exercises.push({
            task: 'Change the message being printed to say something else.',
            hint: 'Find the text inside quotes and change it.',
            check: function (val) { return val.length > 0; }
        });
    }
    if (/\b(let|var|const)\s+\w+\s*=/.test(code)) {
        exercises.push({
            task: 'Change the variable value and predict what will happen.',
            hint: 'Modify the number or string on the right side of the = sign.',
            check: function (val) { return val.length > 0; }
        });
    }
    if (/\b(for|while)\b/.test(code)) {
        exercises.push({
            task: 'Change how many times the loop runs.',
            hint: 'Modify the condition or counter in the loop header.',
            check: function (val) { return val.length > 0; }
        });
    }
    if (/\b(if|else|switch)\b/.test(code)) {
        exercises.push({
            task: 'Change the condition in the if-statement and see how output changes.',
            hint: 'Flip a comparison (>, <, ===) to change the behavior.',
            check: function (val) { return val.length > 0; }
        });
    }
    if (/\b(function|def|func|fn)\b/.test(code)) {
        exercises.push({
            task: 'Call the function with different arguments.',
            hint: 'Change the values passed to the function call.',
            check: function (val) { return val.length > 0; }
        });
    }

    if (exercises.length === 0) return;

    var ex = exercises[Math.floor(Math.random() * exercises.length)];

    var container = document.createElement('div');
    container.className = 'tutorial-inline-exercise';

    var header = document.createElement('div');
    header.className = 'tutorial-inline-exercise-header';
    header.textContent = '\uD83D\uDC45 Try This';
    container.appendChild(header);

    var text = document.createElement('div');
    text.className = 'tutorial-inline-exercise-text';
    text.textContent = ex.task;
    container.appendChild(text);

    var ta = document.createElement('textarea');
    ta.placeholder = ex.hint + ' (Then run the code to see)';
    ta.rows = 2;
    container.appendChild(ta);

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '8px';
    btnRow.style.alignItems = 'center';

    var btn = document.createElement('button');
    btn.className = 'tutorial-inline-exercise-btn';
    btn.textContent = 'I did it!';
    btn.onclick = function () {
        if (ta.value.trim().length > 0) {
            var result = document.getElementById('tutorial-inline-ex-result');
            if (result) {
                result.className = 'tutorial-inline-exercise-result show pass';
                result.innerHTML = '\u2705 Great! Now click <strong>Run \u25B6</strong> to see the effect of your change!';
            }
            btn.disabled = true;
            btn.textContent = '\u2713 Done';
            btn.style.background = '#10b981';
            if (!_tutorialTaskState[1]) tutorialUpdateTask(1);
        } else {
            var result = document.getElementById('tutorial-inline-ex-result');
            if (result) {
                result.className = 'tutorial-inline-exercise-result show fail';
                result.innerHTML = '\uD83D\uDCA1 Try making a change to the code in the editor first!';
            }
        }
        var editor = document.getElementById('editor');
        if (editor) editor.focus();
    };
    btnRow.appendChild(btn);

    var hintBtn = document.createElement('button');
    hintBtn.className = 'tutorial-inline-exercise-btn';
    hintBtn.textContent = 'Show Hint';
    hintBtn.style.background = '#475569';
    hintBtn.onclick = function () {
        var hintEl = document.getElementById('tutorial-inline-hint');
        if (hintEl) {
            hintEl.style.display = hintEl.style.display === 'none' ? 'block' : 'none';
        }
    };
    btnRow.appendChild(hintBtn);
    container.appendChild(btnRow);

    var hint = document.createElement('div');
    hint.id = 'tutorial-inline-hint';
    hint.style.cssText = 'display:none;margin-top:8px;padding:8px;background:#1e293b;border-radius:4px;font-size:10px;color:#94a3b8;line-height:1.5;';
    hint.textContent = ex.hint + ' After you make the change, click Run to see the new output.';
    container.appendChild(hint);

    var result = document.createElement('div');
    result.id = 'tutorial-inline-ex-result';
    result.className = 'tutorial-inline-exercise-result';
    container.appendChild(result);

    expEl.appendChild(container);
}

function buildRelatedTopics(currentStep, currentIdx) {
    if (!tutorialManager || !tutorialManager.steps) return null;
    var steps = tutorialManager.steps;
    var related = [];
    var currentPhase = currentStep.phase;
    var currentTopic = currentStep.topic;

    for (var i = 0; i < steps.length; i++) {
        if (i === currentIdx) continue;
        var s = steps[i];
        if (s.phase === currentPhase) {
            related.push({ idx: i, topic: s.topic, phase: s.phase, samePhase: true });
        }
    }

    if (related.length === 0) return null;

    var container = document.createElement('div');
    container.className = 'tutorial-related-topics';
    var header = document.createElement('div');
    header.className = 'tutorial-related-topics-header';
    header.textContent = 'Related Topics in ' + currentPhase;
    container.appendChild(header);

    var list = document.createElement('div');
    list.className = 'tutorial-related-topics-list';

    var shown = 0;
    for (var r = 0; r < related.length && shown < 12; r++) {
        var rel = related[r];
        if (rel.topic === currentTopic) continue;
        var btn = document.createElement('button');
        btn.className = 'tutorial-related-topic-btn';
        btn.textContent = rel.topic;
        btn.onclick = (function (idx) {
            return function () { goToTutorialStep(idx); };
        })(rel.idx);
        list.appendChild(btn);
        shown++;
    }

    container.appendChild(list);
    return container;
}

function _tutorialDebouncedEditorCheck() {
    if (!tutorialManager) return;
    var editor = document.getElementById('editor');
    if (!editor) return;
    var code = editor.value;
    if (!code.trim()) return;

    var step = tutorialManager.getCurrentStep();
    if (!step) return;

    var codeChanged = code !== _tutorialStarterCode;

    if (codeChanged && !_tutorialTaskState[1]) {
        var output = document.getElementById('output');
        if (output && output.innerText.indexOf('Detected code changes') === -1) {
            if (!tutorialManager.isStepCompleted(tutorialManager.getCurrentStepIndex())) {
                if (typeof showToast === 'function') showToast('Code changed! Run it to see the difference.', 'info');
            }
        }
    }

    if (typeof localAnalyzeStructure === 'function') {
        var issues = localAnalyzeStructure(code);
        if (issues && issues.length > 0) {
            var hintBar = document.getElementById('tutorial-hint-bar');
            if (hintBar && !hintBar.querySelector('.tutorial-structural-issue')) {
                var hasError = issues.some(function (i) { return i.severity === 'error'; });
                var msg = hasError
                    ? '<span class="tutorial-structural-issue" style="color:#fca5a5;">\u26A0\uFE0F ' + tutorialEscapeHtml(issues[0].message) + '</span>'
                    : '<span class="tutorial-structural-issue" style="color:#fbbf24;">\uD83D\uDCA1 ' + tutorialEscapeHtml(issues[0].message) + '</span>';
                hintBar.className = 'tutorial-hint-bar visible';
                hintBar.innerHTML = msg;
            }
        }
    }
}

function tutorialToggleExplanation() {
    var body = document.getElementById('tutorial-exp-body');
    var toggle = document.getElementById('tutorial-exp-toggle');
    if (!body || !toggle) return;
    _tutorialExplanationOpen = !_tutorialExplanationOpen;
    body.style.display = _tutorialExplanationOpen ? 'block' : 'none';
    toggle.classList.toggle('open', _tutorialExplanationOpen);
    toggle.innerHTML = _tutorialExplanationOpen
        ? '\uD83D\uDCD6 Hide explanation <span class="tutorial-exp-arrow">\u25BC</span>'
        : '\uD83D\uDCD6 Read about <strong>' + tutorialEscapeHtml(tutorialManager.getCurrentStep().topic) + '</strong> <span class="tutorial-exp-arrow">\u25B6</span>';
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
        + '<div class="tutorial-step-info">Step ' + (idx + 1) + ' of ' + total + '<span class="tutorial-step-name-nav"> ' + tutorialEscapeHtml(step.topic) + '</span><span class="tutorial-run-status" id="tutorial-run-status">Pick any topic from the sidebar</span></div>'
        + '<button class="tutorial-nav-btn tutorial-continue-btn" id="tutorial-continue-btn" onclick="tutorialContinue()">Next \u2192</button>'
        + '<button class="tutorial-stuck-btn" id="tutorial-stuck-btn" onclick="tutorialManager.showStuckPanel()" title="Need help?">?</button>'
        + '</div>';

    updateContinueButton(true);
}

function renderTutorialProgress() {
    var el = document.getElementById('tutorial-progress');
    if (!el) return;
    var completed = tutorialManager.getCompletedCount();
    var total = tutorialManager.getTotalSteps();
    var pct = Math.round((completed / total) * 100);
    var current = tutorialManager.getCurrentStep();
    el.innerHTML = ''
        + '<div class="tutorial-progress-bar-track"><div class="tutorial-progress-bar-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="tutorial-progress-text"><span>' + pct + '% complete</span><span>' + completed + '/' + total + ' lessons</span></div>'
        + (current ? '<div class="tutorial-progress-topic">' + tutorialEscapeHtml(current.phase) + '</div>' : '');
}

function updateContinueButton(enabled) {
    var btn = document.getElementById('tutorial-continue-btn');
    if (!btn) return;
    btn.disabled = false;
    btn.classList.add('ready');
    btn.textContent = 'Next \u2192';
}

function tutorialGoBack() {
    tutorialManager.goBack();
    renderTutorialSidebar();
    loadTutorialStep(tutorialManager.getCurrentStepIndex());
}

function tutorialContinue() {
    var currentIdx = tutorialManager.getCurrentStepIndex();
    var currentStep = tutorialManager.steps[currentIdx];

    if (tutorialManager.isOnLastStep()) {
        if (tutorialManager.isComplete()) {
            showTutorialComplete();
        } else {
            tutorialManager.markStepComplete(currentIdx);
            showTutorialComplete();
        }
        return;
    }

    var prevTopic = currentStep ? currentStep.topic : '';
    tutorialManager.markStepComplete(currentIdx);
    renderTutorialSidebar();

    if (prevTopic) {
        if (typeof showToast === 'function') showToast('\u2714\uFE0F Moving on from "' + prevTopic + '"', 'success');
    }

    var nextIdx = tutorialManager.getCurrentStepIndex();

    if (currentStep && currentStep.quizAfter) {
        if (typeof showToast === 'function') showToast('Quiz checkpoint available!', 'info');
        showQuizCheckpoint();
        return;
    }

    loadTutorialStep(nextIdx);
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
    tutorialClearAnnotations();
    tutorialClearFeedback();
    if (typeof createConfetti === 'function') {
        createConfetti(60);
        setTimeout(function () { createConfetti(40); }, 400);
    }
    if (typeof showToast === 'function') showToast('Tutorial complete! Great work!', 'success');
    if (typeof showScorePopup === 'function') showScorePopup('Completed!', 'game-xp-popup');
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
        + (typeof challengeData !== 'undefined' && challengeData[tutorialLang] ? '<div class="tutorial-complete-challenge"><span>\uD83C\uDFC6</span> <span>' + challengeData[tutorialLang].length + ' challenges available for ' + tutorialEscapeHtml(langName) + ' — <a href="#" onclick="setMode(\'challenge\'); return false;">Go to Code Lab</a></span></div>' : '')
        + '<button class="tutorial-complete-btn" onclick="tutorialManager.reset(); renderTutorial();">Start Again</button>'
        + '</div>';

    document.getElementById('editor').value = '// Congratulations on completing the ' + langName + ' tutorial!\n';
    document.getElementById('output').innerText = '// \uD83C\uDF89 Tutorial complete!';
    document.getElementById('tutorial-nav').style.display = 'none';
}

var _tutorialCheckpointIdx = 0;

function tutorialTriggerCheckpoint() {
    if (!tutorialManager) return;
    var step = tutorialManager.getCurrentStep();
    if (!step) return;
    var langData = courseData[tutorialLang];
    if (!langData || !langData[step.phase] || !langData[step.phase][step.topic]) return;
    var item = langData[step.phase][step.topic];
    var code = (item && item.code) || '';
    if (!code.trim()) return;

    var types = ['spotbug', 'scramble', 'fillblank', 'predict'];
    var type = types[_tutorialCheckpointIdx % types.length];
    _tutorialCheckpointIdx++;
    tutorialShowCheckpoint(type, step, code);
}

function tutorialShowCheckpoint(type, step, code) {
    var existing = document.getElementById('tutorial-checkpoint-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'tutorial-checkpoint-overlay';
    overlay.className = 'tutorial-checkpoint-overlay';
    overlay.onclick = function (e) { if (e.target === overlay) tutorialCloseCheckpoint(); };

    var paper = document.createElement('div');
    paper.className = 'tutorial-checkpoint-paper';
    paper.onclick = function (e) { e.stopPropagation(); };

    var typeLabels = { spotbug: '\uD83D\uDD0D Spot the Bug', scramble: '\uD83D\uDD00 Code Scramble', fillblank: '\u2753 Fill in the Blank', predict: '\uD83D\uDD2E Predict Output' };
    var typeLabel = typeLabels[type] || '\u2753 Checkpoint';

    var header = document.createElement('div');
    header.className = 'tutorial-checkpoint-header';
    header.textContent = typeLabel;

    var subtitle = document.createElement('div');
    subtitle.className = 'tutorial-checkpoint-subtitle';
    subtitle.textContent = step.phase + ' \u00B7 ' + step.topic;

    paper.appendChild(header);
    paper.appendChild(subtitle);

    var body = document.createElement('div');
    body.id = 'tutorial-checkpoint-body';
    paper.appendChild(body);

    if (type === 'spotbug') renderSpotBug(body, code);
    else if (type === 'scramble') renderScramble(body, code);
    else if (type === 'fillblank') renderFillBlank(body, code);
    else if (type === 'predict') renderPredict(body, code);

    overlay.appendChild(paper);
    document.body.appendChild(overlay);

    setTimeout(function () { overlay.classList.add('open'); }, 10);
}

function tutorialCloseCheckpoint() {
    var overlay = document.getElementById('tutorial-checkpoint-overlay');
    if (overlay) overlay.classList.remove('open');
    setTimeout(function () { if (overlay) overlay.remove(); }, 250);
}

function renderSpotBug(container, code) {
    var lines = code.split('\n');
    if (lines.length < 3) {
        container.innerHTML = '<div class="tutorial-checkpoint-desc">Not enough code for this exercise type.</div><div class="tutorial-checkpoint-actions"><button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">OK</button></div>';
        return;
    }

    var bugIdx = -1;
    var buggyLines = [];
    for (var i = 0; i < lines.length; i++) {
        var t = lines[i].trim();
        if (t && !t.startsWith('//') && !t.startsWith('#') && !t.startsWith('/*') && !t.startsWith('*')) {
            buggyLines.push(i);
        }
    }
    if (buggyLines.length === 0) { buggyLines.push(0); }
    bugIdx = buggyLines[Math.floor(Math.random() * buggyLines.length)];

    var original = lines[bugIdx];
    var buggyLine = original;
    var bugMap = [
        { pattern: /===/g, replacement: '==' },
        { pattern: /!==/g, replacement: '!=' },
        { pattern: /<=/g, replacement: '<' },
        { pattern: />=/g, replacement: '>' },
        { pattern: /\+\+/g, replacement: ' + 1' },
        { pattern: /--/g, replacement: ' - 1' },
        { pattern: /\b(let|var|const)\s+/g, replacement: '' },
        { pattern: /\+=/g, replacement: '= ' },
        { pattern: /\bconsole\.log\b/g, replacement: 'console.lg' },
        { pattern: /\breturn\b/g, replacement: 'retrun' },
        { pattern: /\bfunction\b/g, replacement: 'functon' },
        { pattern: /\bif\s*\(/g, replacement: 'if ' },
        { pattern: /\bfor\s*\(/g, replacement: 'for ' },
        { pattern: /\bwhile\s*\(/g, replacement: 'while ' },
    ];
    var availableBugs = bugMap.filter(function (b) { return b.pattern.test(original); });

    if (availableBugs.length > 0) {
        var chosen = availableBugs[Math.floor(Math.random() * availableBugs.length)];
        buggyLine = original.replace(chosen.pattern, chosen.replacement);
    } else {
        buggyLine = original + ' // BUG';
    }
    lines[bugIdx] = buggyLine;

    var desc = document.createElement('div');
    desc.className = 'tutorial-checkpoint-desc';
    desc.textContent = 'One line in this code has a bug. Click the line that you think is wrong.';
    container.appendChild(desc);

    var codeEl = document.createElement('div');
    codeEl.className = 'tutorial-checkpoint-code';
    codeEl.id = 'tutorial-spotbug-code';

    for (var li = 0; li < lines.length; li++) {
        var lineSpan = document.createElement('div');
        lineSpan.textContent = lines[li] || ' ';
        lineSpan.dataset.lineIndex = li;
        if (li === bugIdx) {
            lineSpan.className = 'bug-line';
            lineSpan.onclick = function (idx) {
                return function () { checkSpotBug(idx, bugIdx); };
            }(li);
        }
        codeEl.appendChild(lineSpan);
    }
    container.appendChild(codeEl);

    var result = document.createElement('div');
    result.id = 'tutorial-spotbug-result';
    container.appendChild(result);

    var actions = document.createElement('div');
    actions.className = 'tutorial-checkpoint-actions';
    actions.innerHTML = '<button class="tutorial-checkpoint-btn" onclick="tutorialCloseCheckpoint()">Skip</button>';
    container.appendChild(actions);

    container._bugIdx = bugIdx;
    container._checked = false;
}

function checkSpotBug(selectedIdx, bugIdx) {
    var container = document.getElementById('tutorial-checkpoint-body');
    if (!container || container._checked) return;
    container._checked = true;

    var codeEl = document.getElementById('tutorial-spotbug-code');
    if (codeEl) {
        var lines = codeEl.querySelectorAll('.bug-line');
        lines.forEach(function (el) { el.onclick = null; });
    }

    var resultEl = document.getElementById('tutorial-spotbug-result');
    if (!resultEl) return;

    var correct = selectedIdx === bugIdx;
    resultEl.className = 'tutorial-checkpoint-result ' + (correct ? 'pass' : 'fail');
    resultEl.innerHTML = correct
        ? '\u2705 Correct! You spotted the bug in the right line.'
        : '\u274C Not quite. The bug was on line ' + (bugIdx + 1) + '. Review the code and try to understand the error.';

    var actions = container.querySelector('.tutorial-checkpoint-actions');
    if (!actions) return;
    var continueBtn = document.createElement('button');
    continueBtn.className = 'tutorial-checkpoint-btn primary';
    continueBtn.textContent = correct ? 'Continue \u2192' : 'Try Again';
    continueBtn.onclick = function () { tutorialCloseCheckpoint(); };
    actions.appendChild(continueBtn);

    if (typeof showToast === 'function') showToast(correct ? 'Spot on!' : 'Keep practicing!', correct ? 'success' : 'error');
    if (correct && typeof showScorePopup === 'function') showScorePopup('+5 XP', 'game-xp-popup');
}

function renderScramble(container, code) {
    var lines = code.split('\n').filter(function (l) { return l.trim(); });
    if (lines.length < 3) {
        container.innerHTML = '<div class="tutorial-checkpoint-desc">Not enough lines for scrambling.</div><div class="tutorial-checkpoint-actions"><button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">OK</button></div>';
        return;
    }

    var shuffled = [...lines];
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }

    var desc = document.createElement('div');
    desc.className = 'tutorial-checkpoint-desc';
    desc.textContent = 'The code lines are scrambled. Click the lines in the correct order to reconstruct the program.';
    container.appendChild(desc);

    var sourcePool = document.createElement('div');
    sourcePool.id = 'tutorial-scramble-pool';
    sourcePool.style.marginBottom = '12px';

    var targetZone = document.createElement('div');
    targetZone.id = 'tutorial-scramble-target';
    targetZone.style.minHeight = '60px';
    targetZone.style.background = '#0f172a';
    targetZone.style.border = '1px dashed #334155';
    targetZone.style.borderRadius = '6px';
    targetZone.style.padding = '8px';
    targetZone.style.marginBottom = '12px';
    targetZone.innerHTML = '<div style="font-size:9px;color:#475569;text-align:center;">Click lines below to add them here in order</div>';

    var activeLines = [];
    var ordered = [];

    function rebuildPool() {
        sourcePool.innerHTML = '';
        for (var li = 0; li < lines.length; li++) {
            if (activeLines.includes(li)) continue;
            var btn = document.createElement('button');
            btn.className = 'tutorial-checkpoint-scramble-line';
            btn.textContent = shuffled[li];
            btn.onclick = (function (idx) {
                return function () {
                    ordered.push(shuffled[idx]);
                    activeLines.push(idx);
                    rebuildPool();
                    rebuildTarget();
                };
            })(li);
            sourcePool.appendChild(btn);
        }
        if (sourcePool.children.length === 0) {
            sourcePool.innerHTML = '<div style="font-size:9px;color:#475569;text-align:center;">All lines placed!</div>';
        }
    }

    function rebuildTarget() {
        targetZone.innerHTML = '';
        for (var oi = 0; oi < ordered.length; oi++) {
            var lineBtn = document.createElement('button');
            lineBtn.className = 'tutorial-checkpoint-scramble-line';
            lineBtn.style.borderColor = '#334155';
            lineBtn.style.cursor = 'pointer';
            lineBtn.textContent = ordered[oi];
            lineBtn.onclick = (function (idx) {
                return function () {
                    var removed = ordered.splice(idx, 1)[0];
                    var foundIdx = -1;
                    for (var si = 0; si < shuffled.length; si++) {
                        if (shuffled[si] === removed && !activeLines.includes(si)) continue;
                        if (shuffled[si] === removed) { foundIdx = si; break; }
                    }
                    if (foundIdx !== -1) {
                        activeLines.splice(activeLines.indexOf(foundIdx), 1);
                    } else {
                        var cleanIdx = ordered.indexOf(removed);
                        if (cleanIdx === -1) activeLines.pop();
                    }
                    rebuildPool();
                    rebuildTarget();
                };
            })(oi);
            targetZone.appendChild(lineBtn);
        }
        if (ordered.length === 0) {
            targetZone.innerHTML = '<div style="font-size:9px;color:#475569;text-align:center;">Click lines below to add them here in order</div>';
        }
    }

    container.appendChild(targetZone);
    container.appendChild(sourcePool);
    rebuildPool();

    var result = document.createElement('div');
    result.id = 'tutorial-scramble-result';
    container.appendChild(result);

    var actions = document.createElement('div');
    actions.className = 'tutorial-checkpoint-actions';
    actions.innerHTML = ''
        + '<button class="tutorial-checkpoint-btn primary" onclick="checkScramble()">Check Order</button>'
        + '<button class="tutorial-checkpoint-btn" onclick="tutorialCloseCheckpoint()">Skip</button>';
    container.appendChild(actions);
}

function checkScramble() {
    var container = document.getElementById('tutorial-checkpoint-body');
    if (!container) return;

    var code = container.parentElement ? container.parentElement.querySelector('.tutorial-checkpoint-subtitle') : null;
    var langData = tutorialManager ? courseData[tutorialManager.lang] : null;
    var step = tutorialManager ? tutorialManager.getCurrentStep() : null;
    if (!step || !langData || !langData[step.phase] || !langData[step.phase][step.topic]) return;
    var item = langData[step.phase][step.topic];
    var originalLines = (item.code || '').split('\n').filter(function (l) { return l.trim(); });

    var ordered = [];
    var targetZone = document.getElementById('tutorial-scramble-target');
    if (targetZone) {
        var buttons = targetZone.querySelectorAll('.tutorial-checkpoint-scramble-line');
        buttons.forEach(function (b) { ordered.push(b.textContent); });
    }

    var correctCount = 0;
    for (var i = 0; i < Math.min(ordered.length, originalLines.length); i++) {
        if (ordered[i].trim() === originalLines[i].trim()) correctCount++;
    }
    var allCorrect = correctCount === originalLines.length && ordered.length === originalLines.length;

    var resultEl = document.getElementById('tutorial-scramble-result');
    if (!resultEl) return;

    resultEl.className = 'tutorial-checkpoint-result ' + (allCorrect ? 'pass' : 'fail');
    resultEl.innerHTML = allCorrect
        ? '\u2705 Perfect! ' + correctCount + '/' + originalLines.length + ' lines in the right order.'
        : '\u274C ' + correctCount + '/' + originalLines.length + ' correct. Review the order and try again.';

    if (allCorrect) {
        var actions = container.querySelector('.tutorial-checkpoint-actions');
        if (actions) {
            actions.innerHTML = '<button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">Continue \u2192</button>';
        }
        if (typeof showToast === 'function') showToast('Scramble solved!', 'success');
        if (typeof showScorePopup === 'function') showScorePopup('+5 XP', 'game-xp-popup');
    }
}

function renderFillBlank(container, code) {
    var lines = code.split('\n');
    if (lines.length < 2) {
        container.innerHTML = '<div class="tutorial-checkpoint-desc">Not enough code for this exercise.</div><div class="tutorial-checkpoint-actions"><button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">OK</button></div>';
        return;
    }

    var targetWords = [];
    var wordCandidates = [];
    var lineText = '';
    for (var li = 0; li < lines.length; li++) {
        var t = lines[li].trim();
        if (!t || t.startsWith('//') || t.startsWith('#')) continue;
        var words = t.split(/\b/);
        for (var wi = 0; wi < words.length; wi++) {
            var w = words[wi].trim();
            if (w && /^[a-zA-Z_$][a-zA-Z0-9_$]{2,}$/.test(w) && !/^(var|let|const|function|if|else|for|while|do|switch|case|break|continue|return|class|new|this|typeof|void|import|export|from|try|catch|finally|throw)$/i.test(w)) {
                wordCandidates.push({ word: w, line: li, full: lines[li] });
            }
        }
        lineText += t + ' ';
    }

    if (wordCandidates.length < 2) {
        container.innerHTML = '<div class="tutorial-checkpoint-desc">Not enough suitable words to blank out.</div><div class="tutorial-checkpoint-actions"><button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">OK</button></div>';
        return;
    }

    var blanksCount = Math.min(3, wordCandidates.length);
    var selected = [];
    var usedIndices = {};
    while (selected.length < blanksCount) {
        var idx = Math.floor(Math.random() * wordCandidates.length);
        if (!usedIndices[idx]) {
            usedIndices[idx] = true;
            selected.push(wordCandidates[idx]);
        }
    }

    var blankedLines = lines.slice();
    for (var bi = 0; bi < selected.length; bi++) {
        var sel = selected[bi];
        blankedLines[sel.line] = blankedLines[sel.line].replace(sel.word, '____');
    }

    var desc = document.createElement('div');
    desc.className = 'tutorial-checkpoint-desc';
    desc.textContent = 'Fill in the ' + blanksCount + ' blank' + (blanksCount > 1 ? 's' : '') + ' with the correct word' + (blanksCount > 1 ? 's' : '') + '.';
    container.appendChild(desc);

    var codeEl = document.createElement('div');
    codeEl.className = 'tutorial-checkpoint-code';
    codeEl.id = 'tutorial-fillblank-code';
    codeEl.innerHTML = tutorialEscapeHtml(blankedLines.join('\n')).replace(/____/g, '<span class="blank">____</span>');
    container.appendChild(codeEl);

    var inputs = [];
    for (var fi = 0; fi < blanksCount; fi++) {
        var input = document.createElement('input');
        input.className = 'tutorial-checkpoint-input';
        input.placeholder = 'Enter word ' + (fi + 1) + '...';
        input.dataset.blankIdx = fi;
        container.appendChild(input);
        inputs.push({ input: input, answer: selected[fi].word });
    }

    container._fillAnswers = selected;

    var result = document.createElement('div');
    result.id = 'tutorial-fillblank-result';
    container.appendChild(result);

    var actions = document.createElement('div');
    actions.className = 'tutorial-checkpoint-actions';
    actions.innerHTML = ''
        + '<button class="tutorial-checkpoint-btn primary" onclick="checkFillBlank()">Check Answers</button>'
        + '<button class="tutorial-checkpoint-btn" onclick="tutorialCloseCheckpoint()">Skip</button>';
    container.appendChild(actions);
}

function checkFillBlank() {
    var container = document.getElementById('tutorial-checkpoint-body');
    if (!container) return;

    var inputs = container.querySelectorAll('.tutorial-checkpoint-input');
    var answers = container._fillAnswers;
    if (!answers || answers.length === 0) return;

    var correct = 0;
    inputs.forEach(function (inp, idx) {
        var val = inp.value.trim().toLowerCase();
        var ans = (answers[idx] && answers[idx].word || '').toLowerCase();
        if (val === ans) {
            correct++;
            inp.style.borderColor = '#10b981';
        } else {
            inp.style.borderColor = '#ef4444';
        }
        inp.disabled = true;
    });

    var allCorrect = correct === answers.length;

    var resultEl = document.getElementById('tutorial-fillblank-result');
    if (!resultEl) return;
    resultEl.className = 'tutorial-checkpoint-result ' + (allCorrect ? 'pass' : 'fail');
    resultEl.innerHTML = allCorrect
        ? '\u2705 All ' + correct + ' correct! Great memory!'
        : '\u274C ' + correct + '/' + answers.length + ' correct. Check the code and try again.';

    if (allCorrect) {
        var actions = container.querySelector('.tutorial-checkpoint-actions');
        if (actions) {
            actions.innerHTML = '<button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">Continue \u2192</button>';
        }
        if (typeof showToast === 'function') showToast('Fill-in complete!', 'success');
        if (typeof showScorePopup === 'function') showScorePopup('+5 XP', 'game-xp-popup');
    }
}

function renderPredict(container, code) {
    var lines = code.split('\n').filter(function (l) { return l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#'); });
    if (lines.length < 2) {
        container.innerHTML = '<div class="tutorial-checkpoint-desc">Not enough code to predict output.</div><div class="tutorial-checkpoint-actions"><button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">OK</button></div>';
        return;
    }

    var desc = document.createElement('div');
    desc.className = 'tutorial-checkpoint-desc';
    desc.textContent = 'Read the code below. What output do you expect when this program runs? Type your prediction.';
    container.appendChild(desc);

    var codeEl = document.createElement('div');
    codeEl.className = 'tutorial-checkpoint-code';
    codeEl.textContent = code;
    container.appendChild(codeEl);

    var examples = [
        { lang: 'js', output: 'Hello World' },
        { lang: 'js', output: '5' },
        { lang: 'js', output: 'true' },
        { lang: 'js', output: '10' },
        { lang: 'js', output: 'Hello' },
        { lang: 'py', output: 'Hello World' },
        { lang: 'py', output: '5' },
        { lang: 'py', output: 'True' },
    ];
    var outputHint = '';
    for (var ei = 0; ei < examples.length; ei++) {
        if (examples[ei].lang === tutorialLang && code.toLowerCase().includes('console.log') || code.toLowerCase().includes('print')) {
            outputHint = 'Hint: look for console.log / print statements to predict the output.';
            break;
        }
    }

    var input = document.createElement('input');
    input.className = 'tutorial-checkpoint-input';
    input.id = 'tutorial-predict-input';
    input.placeholder = outputHint || 'Type the expected output...';
    container.appendChild(input);

    var result = document.createElement('div');
    result.id = 'tutorial-predict-result';
    container.appendChild(result);

    var actions = document.createElement('div');
    actions.className = 'tutorial-checkpoint-actions';
    actions.innerHTML = ''
        + '<button class="tutorial-checkpoint-btn primary" onclick="checkPredict()">Check Prediction</button>'
        + '<button class="tutorial-checkpoint-btn" onclick="tutorialCloseCheckpoint()">Skip</button>'
        + '<button class="tutorial-checkpoint-btn" onclick="tutorialCloseCheckpoint(); runCode();">Run to See</button>';
    container.appendChild(actions);
}

function checkPredict() {
    var container = document.getElementById('tutorial-checkpoint-body');
    if (!container) return;

    var input = document.getElementById('tutorial-predict-input');
    if (!input) return;
    var prediction = input.value.trim();
    if (!prediction) {
        if (typeof showToast === 'function') showToast('Type your predicted output first!', 'error');
        return;
    }

    var resultEl = document.getElementById('tutorial-predict-result');
    if (!resultEl) return;

    var step = tutorialManager ? tutorialManager.getCurrentStep() : null;
    var langData = step && courseData[tutorialLang] ? courseData[tutorialLang][step.phase] : null;
    var item = langData && step ? langData[step.topic] : null;
    var actualOutput = '';
    if (item && item.output) {
        actualOutput = item.output;
    } else {
        actualOutput = 'Run the code to see the actual output.';
    }

    var isClose = false;
    if (actualOutput && actualOutput !== 'Run the code to see the actual output.') {
        var predLower = prediction.toLowerCase().trim();
        var actualLower = String(actualOutput).toLowerCase().trim();
        isClose = predLower === actualLower || predLower.indexOf(actualLower) !== -1 || actualLower.indexOf(predLower) !== -1;
    }

    var wasGuided = !actualOutput || actualOutput === 'Run the code to see the actual output.';

    resultEl.className = 'tutorial-checkpoint-result ' + (isClose || wasGuided ? 'pass' : 'fail');
    resultEl.innerHTML = isClose
        ? '\u2705 Great prediction! Expected output: "' + tutorialEscapeHtml(actualOutput) + '"'
        : wasGuided
            ? '\uD83D\uDCA1 You predicted: "' + tutorialEscapeHtml(prediction) + '". Click "Run to See" to check the actual output!'
            : '\uD83D\uDCC4 You predicted: "' + tutorialEscapeHtml(prediction) + '". Expected was: "' + tutorialEscapeHtml(actualOutput) + '". Run the code to see for yourself!';

    input.disabled = true;

    var actions = container.querySelector('.tutorial-checkpoint-actions');
    if (actions) {
        if (isClose || wasGuided) {
            actions.innerHTML = '<button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint()">Continue \u2192</button>';
        }
        if (!isClose && !wasGuided) {
            actions.innerHTML = '<button class="tutorial-checkpoint-btn primary" onclick="tutorialCloseCheckpoint(); runCode();">Run to Check</button><button class="tutorial-checkpoint-btn" onclick="tutorialCloseCheckpoint()">Skip</button>';
        }
    }

    if (isClose && typeof showScorePopup === 'function') showScorePopup('+5 XP', 'game-xp-popup');
}

function _tutorialGenerateQuickQuestion(topic, code) {
    var lower = (topic + ' ' + code).toLowerCase();
    var questions = [];
    if (/\bconsole\.log\b/.test(code) || /\bprint\b/.test(code)) {
        questions.push({ q: 'What does the <code>console.log()</code> / <code>print()</code> function do?', opts: ['Prints output to the console', 'Declares a variable', 'Creates a loop', 'Defines a function'], ans: 0 });
        questions.push({ q: 'Where does <code>console.log()</code> output appear?', opts: ['In the editor', 'In the output panel', 'In a popup', 'In a file'], ans: 1 });
    }
    if (/\b(let|var|const)\b/.test(code)) {
        questions.push({ q: 'Which keyword declares a variable that cannot be reassigned?', opts: ['let', 'var', 'const', 'function'], ans: 2 });
        questions.push({ q: 'What is the difference between <code>let</code> and <code>var</code>?', opts: ['No difference', 'let has block scope, var has function scope', 'var has block scope', 'let is for numbers only'], ans: 1 });
    }
    if (/\b(function|def|func|fn)\b/.test(code)) {
        questions.push({ q: 'What is the purpose of a function?', opts: ['To store data', 'To reuse a block of code', 'To create variables', 'To import modules'], ans: 1 });
        questions.push({ q: 'What keyword returns a value from a function?', opts: ['return', 'exit', 'break', 'continue'], ans: 0 });
    }
    if (/\b(for|while)\b/.test(code)) {
        questions.push({ q: 'What does a loop do?', opts: ['Repeats code multiple times', 'Declares a variable', 'Defines a class', 'Creates an array'], ans: 0 });
        questions.push({ q: 'What happens if a loop condition is always true?', opts: ['The loop runs once', 'The loop never runs', 'Infinite loop (program may hang)', 'Syntax error'], ans: 2 });
    }
    if (/\b(if|else|switch)\b/.test(code)) {
        questions.push({ q: 'What does an <code>if</code> statement do?', opts: ['Repeats code', 'Executes code based on a condition', 'Declares a function', 'Creates an object'], ans: 1 });
        questions.push({ q: 'What operator checks equality in JavaScript?', opts: ['=', '== or ===', '!=', '=>'], ans: 1 });
    }
    if (/\b(class|constructor)\b/.test(code)) {
        questions.push({ q: 'What is a class?', opts: ['A function', 'A blueprint for creating objects', 'A type of loop', 'A variable declaration'], ans: 1 });
        questions.push({ q: 'What method is called when a new object is created from a class?', opts: ['init()', 'start()', 'constructor()', 'new()'], ans: 2 });
    }
    if (/\[.*\]/.test(code) && /\.(push|pop)/.test(code)) {
        questions.push({ q: 'What does <code>.push()</code> do to an array?', opts: ['Removes the last element', 'Adds an element to the end', 'Sorts the array', 'Finds an element'], ans: 1 });
        questions.push({ q: 'How do you get the number of elements in an array?', opts: ['.size()', '.length', '.count()', '.len()'], ans: 1 });
    }
    if (/\b(for\s+|while\s+)/.test(code) && /\[/.test(code)) {
        questions.push({ q: 'How do you access each element in an array using a loop?', opts: ['By index (array[i])', 'By name', 'By value only', 'You cannot'], ans: 0 });
    }

    if (questions.length === 0) {
        questions.push({ q: 'What happens when you click Run?', opts: ['The code is executed and output appears', 'The code is saved', 'The page refreshes', 'Nothing'], ans: 0 });
        questions.push({ q: 'What should you do after seeing the output?', opts: ['Close the page', 'Try changing the code and running again', 'Ignore it', 'Copy it somewhere'], ans: 1 });
    }

    return questions[Math.floor(Math.random() * questions.length)];
}

function tutorialRunHook() {
    if (!tutorialManager) return;
    if (!document.getElementById('app')?.classList.contains('tutorial-mode')) return;
    if (currentLang !== tutorialManager.lang) return;
    var output = document.getElementById('output');
    var editor = document.getElementById('editor');
    var code = editor ? editor.value : '';
    var outputText = output ? output.innerText : '';
    var hasError = typeof _tutorialLastRunHadError !== 'undefined' ? _tutorialLastRunHadError : false;
    var currentIdx = tutorialManager.getCurrentStepIndex();
    var step = tutorialManager.getCurrentStep();

    var isAutoRun = _tutorialAutoRan;
    _tutorialAutoRan = false;

    var isStarterCode = code === _tutorialStarterCode;

    if (!isAutoRun) {
        tutorialManager.markRun(hasError);

        if (!hasError && tutorialManager.runCount > 0 && !tutorialManager.isStepCompleted(currentIdx)) {
            updateContinueButton(true);
        }
    }

    tutorialClearFeedback();

    if (hasError && step && !isAutoRun) {
        var tip = typeof getErrorTutorTip === 'function' ? getErrorTutorTip(step.topic, outputText) : null;
        if (tip) {
            tutorialShowFeedback('<strong>\uD83D\uDCA1 Hint:</strong> ' + tip.replace(/\*\*/g, '').split('\n')[0], 'error');
        }
    }

    if (isAutoRun && isStarterCode) {
        if (hasError) {
            var taskBody = document.getElementById('tutorial-task-body');
            if (taskBody && !taskBody.querySelector('.tutorial-auto-run-notice')) {
                var notice = document.createElement('div');
                notice.className = 'tutorial-auto-run-notice';
                notice.innerHTML = '\u26A1 The starter code shows an expected error \u2014 this demonstrates a concept! Read the explanation and try the tasks above.';
                taskBody.insertBefore(notice, taskBody.firstChild);
            }
            if (typeof showToast === 'function') showToast('Starter code ran \u2014 notice the expected behavior', 'info');
            return;
        }
        var taskBody = document.getElementById('tutorial-task-body');
        if (taskBody && !taskBody.querySelector('.tutorial-auto-run-notice')) {
            var notice = document.createElement('div');
            notice.className = 'tutorial-auto-run-notice';
            notice.innerHTML = '\u26A1 Code ran automatically \u2014 this is the starter output. Now try the tasks above!';
            taskBody.insertBefore(notice, taskBody.firstChild);
        }
        if (typeof showToast === 'function') showToast('Code auto-ran \u2014 showing starter output', 'info');
    }

    if (!hasError && code.trim()) {
        if (!isAutoRun) {
            var codeChanged = code !== _tutorialStarterCode;

            if (_tutorialTaskState[0] === false) {
                tutorialUpdateTask(0);
            }

            if (codeChanged && _tutorialTaskState[1] === false) {
                tutorialUpdateTask(1);
            }

            if (codeChanged && tutorialManager.runCount >= 2 && _tutorialTaskState[2] === false) {
                tutorialUpdateTask(2);
            }

            if (typeof showScorePopup === 'function') showScorePopup('+10 XP', 'game-xp-popup');

            if (!_tutorialQuickQShown && !tutorialManager.isStepCompleted(currentIdx)) {
                _tutorialQuickQShown = true;
                var q = _tutorialGenerateQuickQuestion(step ? step.topic : '', code);
                if (q) {
                    var taskBox = document.getElementById('tutorial-task-box');
                    if (taskBox) {
                        var quickQ = document.createElement('div');
                        quickQ.className = 'tutorial-quick-q';
                        quickQ.id = 'tutorial-quick-q';
                        quickQ.innerHTML = ''
                            + '<div class="tutorial-quick-q-header">\uD83D\uDCA1 Quick check</div>'
                            + '<div class="tutorial-quick-q-text">' + q.q + '</div>'
                            + '<div class="tutorial-quick-q-opts"></div>'
                            + '<div class="tutorial-quick-q-result" id="tutorial-quick-q-result"></div>'
                            + '<span class="tutorial-quick-q-skip" onclick="document.getElementById(\'tutorial-quick-q\')?.remove()">Skip \u2192</span>';
                        taskBox.appendChild(quickQ);
                        var optsContainer = quickQ.querySelector('.tutorial-quick-q-opts');
                        if (optsContainer) {
                            for (var oi = 0; oi < q.opts.length; oi++) {
                                var optBtn = document.createElement('button');
                                optBtn.className = 'tutorial-quick-q-opt';
                                optBtn.textContent = String.fromCharCode(65 + oi) + '. ' + q.opts[oi];
                                optBtn.onclick = (function (idx, answer, questionObj) {
                                    return function () {
                                        if (this.disabled) return;
                                        var parent = this.parentElement;
                                        if (!parent) return;
                                        var btns = parent.querySelectorAll('.tutorial-quick-q-opt');
                                        btns.forEach(function (b) { b.disabled = true; });
                                        var allCorrect = idx === answer;
                                        this.classList.add(allCorrect ? 'correct' : 'wrong');
                                        btns[answer].classList.add('correct');
                                        var resultEl = document.getElementById('tutorial-quick-q-result');
                                        if (resultEl) {
                                            resultEl.className = 'tutorial-quick-q-result ' + (allCorrect ? 'pass' : 'fail');
                                            resultEl.innerHTML = allCorrect
                                                ? '\u2705 Correct! ' + (questionObj.explain || '')
                                                : '\u274C Not quite. The answer was: <strong>' + questionObj.opts[answer] + '</strong>';
                                        }
                                        var skipEl = parent.parentElement ? parent.parentElement.querySelector('.tutorial-quick-q-skip') : null;
                                        if (skipEl) skipEl.textContent = allCorrect ? 'Dismiss \u2192' : 'Continue \u2192';
                                        if (allCorrect && typeof showScorePopup === 'function') showScorePopup('+2 XP', 'game-xp-popup');
                                    };
                                })(oi, q.ans, q);
                                optsContainer.appendChild(optBtn);
                            }
                        }
                    }
                }
            }
        }

        var review = typeof localCodeReview === 'function' ? localCodeReview(code, tutorialLang) : null;
        if (review && review.issues && review.issues.length > 0) {
            var errors = review.issues.filter(function (i) { return i.severity === 'error'; });
            var warnings = review.issues.filter(function (i) { return i.severity === 'warning'; });
            var msg = '<strong>\u2713 Code ran!</strong>';
            if (errors.length > 0 || warnings.length > 0) {
                msg += ' <span style="color:#f59e0b;">Review found ' + errors.length + ' errors, ' + warnings.length + ' warnings</span>';
                msg += ' <button class="tutorial-feedback-btn" onclick="checkCode()">\uD83D\uDD0D Check</button>';
            } else {
                msg += ' <span style="color:#22c55e;">Clean code \u2014 no issues!</span>';
            }
            msg += ' <button class="tutorial-feedback-btn" onclick="tutorialShowDiff()">\u2194 Diff</button>';
            tutorialShowFeedback(msg, 'success');
        } else {
            tutorialShowFeedback('<strong>\u2713 Code ran successfully!</strong> <button class="tutorial-feedback-btn" onclick="tutorialShowDiff()">\u2194 See changes</button>', 'success');
        }

        if (step && typeof localGenerateExercise === 'function') {
            _tutorialLastExercise = localGenerateExercise(step.topic, tutorialLang, 'beginner');
            if (_tutorialLastExercise && _tutorialLastExercise.starterCode && _tutorialLastExercise.description) {
                var hintBar = document.getElementById('tutorial-hint-bar');
                if (hintBar) {
                    hintBar.className = 'tutorial-hint-bar visible';
                    hintBar.innerHTML = ''
                        + '<div style="display:flex;align-items:flex-start;gap:8px;">'
                        + '<span style="flex-shrink:0;font-size:14px;">\uD83C\uDFAF</span>'
                        + '<div style="flex:1;">'
                        + '<div style="font-weight:800;font-size:10px;margin-bottom:2px;">' + tutorialEscapeHtml(_tutorialLastExercise.title) + '</div>'
                        + '<div style="font-size:9px;color:#94a3b8;line-height:1.5;">' + tutorialEscapeHtml(_tutorialLastExercise.description) + '</div>'
                        + '<button class="tutorial-feedback-btn" style="margin-top:6px;" onclick="tutorialLoadExercise()">\u2B06 Try this variation</button>'
                        + '</div>'
                        + '</div>';
                }
            }
        }
    }
}
