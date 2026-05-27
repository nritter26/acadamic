// @ts-nocheck

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
    for (const l of ['asm','bash','backend','c','cpp','cs','git','go','java','js','kt','php','pg','py','rb','rs','scala','swift','ts','wasm','zig']) {
        const names = { asm:'ASM', bash:'Bash', backend:'Backend', c:'C', cpp:'C++', cs:'C#', git:'Git', go:'Go', java:'Java', js:'JavaScript', kt:'Kotlin', php:'PHP', pg:'SQL', py:'Python', rb:'Ruby', rs:'Rust', scala:'Scala', swift:'Swift', ts:'TypeScript', wasm:'Wasm', zig:'Zig' };
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
    
    showChallengeIntro();
}

function showChallengeIntro() {
    challengeIdx = -1;
    renderChallengeList();
    document.getElementById('editor').value = '// Welcome to Code Lab!\n//\n// Here you can practice coding by solving bite-sized challenges.\n//\n// HOW IT WORKS:\n// 1. Choose a language from the bar above\n// 2. Pick a challenge from the list\n// 3. Fix the buggy code in the editor\n// 4. Click "Test ▶" to check your solution\n//\n// Each challenge has a test — your code passes when the test returns true.\n// Stuck? Click the "Hint" button for clues, or "Reveal Answer" to see the solution.\n//\n// Happy coding! 🚀\n\n// Tip: Start by selecting a language above ☝️';
    updateHighlight();
    document.getElementById('output').innerText = '// Welcome to the Code Lab!\n// Select a challenge from the list to begin.';
    document.getElementById('explanation').innerHTML =
        '<div style="padding:20px;max-width:600px;">' +
            '<h2 style="color:#a855f7;margin:0 0 4px 0;font-size:22px;">🧪 Code Lab</h2>' +
            '<p style="color:#94a3b8;font-size:11px;margin:0 0 16px 0;">Practice makes perfect — sharpen your skills with hands-on coding challenges.</p>' +
            '<div style="background:#1e293b;border-radius:8px;padding:16px;margin-bottom:16px;">' +
                '<h3 style="color:#fff;margin:0 0 8px 0;font-size:13px;">How it works</h3>' +
                '<ol style="color:#94a3b8;font-size:11px;margin:0;padding-left:18px;line-height:1.8;">' +
                    '<li><strong style="color:#e2e8f0;">Choose a language</strong> — pick from the language panel on the left</li>' +
                    '<li><strong style="color:#e2e8f0;">Pick a challenge</strong> — click any challenge card to load it</li>' +
                    '<li><strong style="color:#e2e8f0;">Fix the code</strong> — the editor shows buggy starter code; edit until it works</li>' +
                    '<li><strong style="color:#e2e8f0;">Test your fix</strong> — click <strong style="color:#a855f7;">Test ▶</strong> to run the challenge test</li>' +
                    '<li><strong style="color:#e2e8f0;">Level up</strong> — complete Beginner → Intermediate → Expert challenges</li>' +
                '</ol>' +
            '</div>' +
            '<div style="background:#1e293b;border-radius:8px;padding:16px;">' +
                '<h3 style="color:#fff;margin:0 0 8px 0;font-size:13px;">Features</h3>' +
                '<ul style="color:#94a3b8;font-size:11px;margin:0;padding-left:18px;line-height:1.8;">' +
                    '<li>2,100+ challenges across 17 languages</li>' +
                    '<li>Three difficulty levels: <span style="color:#22c55e;">Beginner</span> · <span style="color:#f59e0b;">Intermediate</span> · <span style="color:#ef4444;">Expert</span></li>' +
                    '<li>Hint system — 3 levels of help when you\'re stuck</li>' +
                    '<li>Progress tracking — see solved vs total per language</li>' +
                    '<li>Search — find challenges by keyword</li>' +
                '</ul>' +
            '</div>' +
        '</div>';
    const hintBtn = document.getElementById('challenge-hint-btn');
    if (hintBtn) { hintBtn.textContent = 'Hint (0/3)'; hintBtn.disabled = true; hintBtn.className = 'challenge-btn'; }
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
    for (const l of ['backend','bash','c','cpp','cs','go','java','js','kt','php','py','rb','rs','scala','swift','ts','zig']) {
        const names = { backend:'Backend', bash:'Bash', c:'C', cpp:'C++', cs:'C#', go:'Go', java:'Java', js:'JavaScript', kt:'Kotlin', php:'PHP', py:'Python', rb:'Ruby', rs:'Rust', scala:'Scala', swift:'Swift', ts:'TypeScript', zig:'Zig' };
        const active = l === challengeLang ? 'active' : '';
        const solved = Object.keys(progress).filter(k => k.startsWith(l + '_')).length;
        const total = (challengeData[l] || []).length;
        html += `<button class="challenge-lang-btn ${active}" onclick="switchChallengeLang('${l}')">${names[l]} <span class="challenge-progress-badge">${solved}/${total}</span></button>`;
    }
    html += `</div>`;
    html += `<input class="challenge-search-input" type="text" placeholder="Search challenges..." id="challenge-search" oninput="filterChallengeList(this.value)">`;
    html += `<div style="font-size:9px;color:#64748b;margin-bottom:8px;"><a href="#" onclick="setMode('js');return false;" style="color:var(--accent);text-decoration:none;">← Back to topics</a></div>`;
    
    html += `<div class="challenge-card ${challengeIdx === -1 ? 'active' : ''}" onclick="showChallengeIntro()" style="border-color:#a855f7;background:#1e293b;">
        <div><span class="ch-title" style="color:#a855f7;">📖 About Code Lab</span></div>
        <div class="ch-desc" style="color:#94a3b8;">How challenges work and what you can practice</div>
    </div>`;
    
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
    challengeLang = lang;
    if (!challengeData[lang] || challengeData[lang].length === 0) {
        showChallengeIntro();
        renderChallengeList();
        return;
    }
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

// LANG_KEYWORDS is now in app-data.js (content/app-data.json)
