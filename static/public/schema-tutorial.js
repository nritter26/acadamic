// ── Schema Designer Tutorial — Full-Page Guide ──

let schemaTutActive = false;
var schemaTutStep = 0;

const SCHEMA_TUTORIAL_SEEN_KEY = 'schema_tutorial_seen'// SCHEMA_TUT_STEPS extracted to content/app-data.json

function initSchemaTutorial() {
    schemaTutActive = true;
    schemaTutStep = 0;
    var container = document.getElementById('schemaTutorialPage');
    if (!container) return;
    container.style.display = 'flex';
    document.getElementById('app').className = 'schema-tut-mode';
    document.getElementById('header-title').innerText = 'SCHEMA TUTORIAL';
    document.getElementById('level-bar').style.display = 'none';
    document.querySelectorAll('.selector button').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.header-extra-tabs .game-nav-btn').forEach(function (b) { b.classList.remove('active'); });
    var tutorialNav = document.getElementById('tutorial-nav');
    if (tutorialNav) tutorialNav.style.display = 'none';
    var topicList = document.getElementById('topic-list');
    if (topicList) topicList.style.display = 'none';
    var explanation = document.getElementById('explanation');
    if (explanation) explanation.style.display = 'none';
    var searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.style.display = 'none';
    var roadmapBtn = document.getElementById('roadmap-btn');
    if (roadmapBtn) roadmapBtn.style.display = 'none';
    schemaTutRender();
}

function schemaTutRender() {
    var container = document.getElementById('schemaTutorialPage');
    if (!container) return;
    var step = SCHEMA_TUT_STEPS[schemaTutStep];
    if (!step) return;
    var total = SCHEMA_TUT_STEPS.length;
    var pct = Math.round(((schemaTutStep + 1) / total) * 100);
    var dots = '';
    for (var i = 0; i < total; i++) {
        dots += '<span class="schema-tut-dot' + (i === schemaTutStep ? ' active' : '') + '" onclick="schemaTutGo(' + i + ')"></span>';
    }
    var html = ''
        + '<div class="schema-tut-overlay">'
        + '<div class="schema-tut-card">'
        + '<div class="schema-tut-topbar">'
        + '<span class="schema-tut-topbar-title">Schema Designer Tutorial</span>'
        + '<button class="schema-tut-close" onclick="schemaTutBackToDb()" title="Back to Database">&times;</button>'
        + '</div>'
        + '<div class="schema-tut-progress-bar"><div class="schema-tut-progress-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="schema-tut-body">'
        + step.body
        + '</div>'
        + '<div class="schema-tut-footer">'
        + '<div class="schema-tut-dots">' + dots + '</div>'
        + '<div class="schema-tut-nav">'
        + (schemaTutStep > 0
            ? '<button class="schema-tut-btn" onclick="schemaTutPrev()">\u2190 Back</button>'
            : '<button class="schema-tut-btn" disabled style="opacity:0.3;cursor:default;">\u2190 Back</button>')
        + (schemaTutStep < total - 1
            ? '<button class="schema-tut-btn schema-tut-btn-primary" onclick="schemaTutNext()">Next \u2192</button>'
            : '<button class="schema-tut-btn schema-tut-btn-primary" onclick="schemaTutBackToDb()">\u2192 Go Practice</button>')
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    container.innerHTML = html;
}

function schemaTutNext() {
    if (schemaTutStep < SCHEMA_TUT_STEPS.length - 1) {
        schemaTutStep++;
        schemaTutRender();
    }
}

function schemaTutPrev() {
    if (schemaTutStep > 0) {
        schemaTutStep--;
        schemaTutRender();
    }
}

function schemaTutGo(step) {
    schemaTutStep = step;
    schemaTutRender();
}

function schemaTutBackToDb() {
    schemaTutActive = false;
    schemaTutStep = 0;
    var container = document.getElementById('schemaTutorialPage');
    if (container) container.style.display = 'none';
    var topicList = document.getElementById('topic-list');
    if (topicList) topicList.style.display = '';
    var explanation = document.getElementById('explanation');
    if (explanation) explanation.style.display = '';
    var searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.style.display = '';
    var roadmapBtn = document.getElementById('roadmap-btn');
    if (roadmapBtn) roadmapBtn.style.display = '';
    localStorage.setItem(SCHEMA_TUTORIAL_SEEN_KEY, '1');
    setMode('db');
    setTimeout(function () {
        toggleSchemaDesigner();
    }, 100);
}
