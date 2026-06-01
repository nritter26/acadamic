const projectsState = {
  currentProject: null,
  currentStep: 0,
  stepStates: [],
  language: 'javascript',
  filter: 'all',
  langFilter: 'all',
  projects: [],
  progress: {},
  stepUserCode: {},
  stepOutput: {},
  stepHintIndex: {}
};

function initProjects() {
  const topicList = document.getElementById('topic-list');
  const explanation = document.getElementById('explanation');
  const editor = document.getElementById('editor');
  const output = document.getElementById('output');

  topicList.innerHTML = '';
  if (editor) editor.style.display = 'none';
  if (output) output.style.display = 'none';
  explanation.innerHTML =
    '<div class="projects-guide-panel" id="projectsGuide"></div>' +
    '<div class="projects-workspace-panel" id="projectsWorkspace"></div>';

  renderWorkspaceLayout();
  loadProgress();
  loadAllProjects();
  renderSidebar();
  renderWelcome();

  document.getElementById('app').className = 'projects-mode';
  document.getElementById('header-title').innerText = 'PROJECTS';
  document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-projects');
  if (navBtn) navBtn.classList.add('active');
}

function renderWorkspaceLayout() {
  const ws = document.getElementById('projectsWorkspace');
  if (!ws) return;
  ws.innerHTML =
    '<div class="projects-workspace-tabs">' +
    '<span class="projects-workspace-tab active" data-projtab="code" onclick="switchWorkspaceTab(\'code\')">Code</span>' +
    '<span class="projects-workspace-tab" data-projtab="preview" onclick="switchWorkspaceTab(\'preview\')">Preview</span>' +
    '<span class="projects-run-btn" onclick="runProjectCode()">Run ▶</span>' +
    '<span class="projects-showhow-btn" onclick="showProjectAnswer()">Show How</span>' +
    '</div>' +
    '<div class="projects-workspace-content">' +
    '<textarea id="projectsEditor" spellcheck="false"></textarea>' +
    '<div id="projectsPreview" style="display:none"></div>' +
    '</div>';
}

function switchWorkspaceTab(tab) {
  document.querySelectorAll('.projects-workspace-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.projtab === tab);
  });
  const editor = document.getElementById('projectsEditor');
  const preview = document.getElementById('projectsPreview');
  if (editor) editor.style.display = tab === 'code' ? 'block' : 'none';
  if (preview) preview.style.display = tab === 'preview' ? 'block' : 'none';
}

async function loadAllProjects() {
  const ids = [
    // Beginner (25)
    'hello-world','simple-calculator','even-or-odd','fizzbuzz','password-strength',
    'temperature-converter','tip-calculator','rock-paper-scissors','number-guessing','palindrome-checker',
    'vowel-counter','multiplication-table','bmi-calculator','factorial','string-reverser',
    'leap-year-checker','max-of-three','simple-interest','dice-roller','unit-converter',
    'word-counter','sum-of-natural','positive-negative','area-calculator','grade-calculator',
    // Intermediate (25)
    'todo-list','memory-card','quiz-app','weather-dashboard','expense-tracker',
    'countdown-timer','image-carousel','tab-accordion','form-validator','modal-dialog',
    'color-picker','stopwatch','pomodoro-timer','recipe-finder','movie-search',
    'github-profile','notes-app','flashcard-app','currency-converter','random-color-generator',
    'progress-steps','character-counter','password-generator','age-calculator','loan-calculator',
    // Advanced (25)
    'real-time-chat','markdown-previewer','kanban-board','typing-speed-test','ecommerce-filter',
    'music-player','calendar-app','paint-app','habit-tracker','budget-app',
    'news-aggregator','tic-tac-toe','snake-game','sort-visualizer','poll-app',
    'code-snippet-manager','bookmark-manager','text-editor','url-shortener','chart-renderer',
    'maze-generator','chess-validator','sudoku-solver','data-table','recipe-finder-app',
    // Expert (25)
    'authentication-system','rate-limiter','state-machine','pub-sub-broker','data-pipeline',
    'cache-layer','middleware-system','schema-validator','dependency-injection','task-queue',
    'observable-stream','state-management','query-builder','immutable-collections','template-engine',
    'testing-framework','diff-engine','markdown-parser','semver-system','crdt-counter',
    'distributed-lock','circuit-breaker','feature-flags','task-orchestrator','api-gateway',
    // Go Beginner (20)
    'go-hello-world','go-variables','go-data-types','go-functions','go-conditionals',
    'go-loops','go-arrays','go-maps','go-structs','go-methods',
    'go-interfaces','go-pointers','go-strings','go-errors','go-defer',
    'go-variadic','go-closures','go-recursion','go-range','go-type-switch',
    // Go Intermediate (20)
    'go-goroutines','go-channels','go-buffered-channels','go-select','go-mutex',
    'go-waitgroup','go-worker-pool','go-file-io','go-json','go-http-server',
    'go-http-client','go-testing','go-benchmarking','go-embedding','go-generics',
    'go-contexts','go-time','go-sorting','go-env-config','go-logging',
    // Go Advanced (20)
    'go-reflection','go-plugin-system','go-middleware','go-web-router','go-database-sql',
    'go-dependency-injection','go-graceful-shutdown','go-rate-limiting','go-tcp-server','go-websocket',
    'go-grpc','go-template-html','go-testing-advanced','go-coverage','go-race-detection',
    'go-pprof','go-tracing','go-microservice','go-event-bus','go-command-pattern',
    // Go Expert (25)
    'go-authentication-system','go-rate-limiter','go-state-machine','go-pub-sub-broker','go-data-pipeline',
    'go-cache-layer','go-middleware-system','go-schema-validator','go-dependency-injection','go-task-queue',
    'go-observable-stream','go-state-management','go-query-builder','go-immutable-collections','go-template-engine',
    'go-testing-framework','go-diff-engine','go-markdown-parser','go-semver-system','go-crdt-counter',
    'go-distributed-lock','go-circuit-breaker','go-feature-flags','go-task-orchestrator','go-api-gateway'
  ];
  const loaded = [];
  for (const id of ids) {
    try {
      const res = await fetch('content/projects/' + id + '.json');
      const data = await res.json();
      loaded.push(data);
    } catch (e) {
      console.warn('Failed to load project:', id, e);
    }
  }
  projectsState.projects = loaded;
  renderSidebar();
}

function renderSidebar() {
  const topicList = document.getElementById('topic-list');
  if (!topicList) return;
  const filters = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];
  const labels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  let html = '<div class="projects-filter-bar">';
  filters.forEach((f, i) => {
    html += '<button class="projects-filter-btn' + (projectsState.filter === f ? ' active' : '') + '" onclick="setFilter(\'' + f + '\')">' + labels[i] + '</button>';
  });
  html += '</div>';

  html += '<div class="projects-filter-bar" style="margin-bottom:4px">' +
    '<button class="projects-filter-btn' + (projectsState.langFilter === 'all' ? ' active' : '') + '" onclick="setLangFilter(\'all\')">All</button>' +
    '<button class="projects-filter-btn' + (projectsState.langFilter === 'javascript' ? ' active' : '') + '" onclick="setLangFilter(\'javascript\')">JS</button>' +
    '<button class="projects-filter-btn' + (projectsState.langFilter === 'typescript' ? ' active' : '') + '" onclick="setLangFilter(\'typescript\')">TS</button>' +
    '<button class="projects-filter-btn' + (projectsState.langFilter === 'python' ? ' active' : '') + '" onclick="setLangFilter(\'python\')">PY</button>' +
    '<button class="projects-filter-btn' + (projectsState.langFilter === 'go' ? ' active' : '') + '" onclick="setLangFilter(\'go\')">GO</button></div>';

  const filtered = projectsState.projects.filter(p => {
    if (projectsState.filter !== 'all' && p.difficulty !== projectsState.filter) return false;
    if (projectsState.langFilter !== 'all' && (!p.languages || !p.languages.includes(projectsState.langFilter))) return false;
    return true;
  });
  const grouped = { beginner: [], intermediate: [], advanced: [], expert: [] };
  filtered.forEach(p => { if (grouped[p.difficulty]) grouped[p.difficulty].push(p); });

  Object.entries(grouped).forEach(([level, projs]) => {
    if (projs.length === 0) return;
    html += '<div class="projects-group-label">' + level.charAt(0).toUpperCase() + level.slice(1) + '</div>';
    projs.forEach(p => {
      const prog = projectsState.progress[p.id];
      const done = prog ? prog.completedSteps?.length || 0 : 0;
      const total = p.steps?.length || 0;
      const pct = total > 0 ? Math.round(done / total * 100) : 0;
      const status = !prog ? '⬜' : done === total ? '✅' : '🔄';
      const active = projectsState.currentProject?.id === p.id ? ' active' : '';
      html += '<div class="project-item' + active + '" onclick="selectProject(\'' + p.id + '\')">' +
        '<div class="project-item-header"><span class="project-item-status">' + status + '</span><span class="project-item-title">' + esc(p.title) + '</span></div>' +
        '<div class="project-item-desc">' + esc((p.description || '').substring(0, 60)) + '...</div>' +
        '<div class="project-item-meta">' + getLangBadgesHtml(p.languages || ['javascript']) + '<span class="project-item-steps"><span class="steps-accent" style="background:' + getProjAccent(p.languages || ['javascript']) + '"></span>' + done + '/' + total + ' steps</span></div>' +
        '<div class="project-item-bar"><div class="project-item-bar-fill" style="width:' + pct + '%"></div></div></div>';
    });
  });

  html += '<div class="projects-lang-toggle">' +
    '<span class="projects-lang-label">Language:</span>' +
    '<button class="projects-lang-btn' + (projectsState.language === 'javascript' ? ' active' : '') + '" onclick="setProjectLang(\'javascript\')">JS</button>' +
    '<button class="projects-lang-btn' + (projectsState.language === 'typescript' ? ' active' : '') + '" onclick="setProjectLang(\'typescript\')">TS</button>' +
    '<button class="projects-lang-btn' + (projectsState.language === 'python' ? ' active' : '') + '" onclick="setProjectLang(\'python\')">PY</button>' +
    '<button class="projects-lang-btn' + (projectsState.language === 'go' ? ' active' : '') + '" onclick="setProjectLang(\'go\')">GO</button></div>';

  topicList.innerHTML = html;
}

function setFilter(filter) {
  projectsState.filter = filter;
  renderSidebar();
}

function setLangFilter(lang) {
  projectsState.langFilter = lang;
  renderSidebar();
}

function setProjectLang(lang) {
  projectsState.language = lang;
  renderSidebar();
  if (projectsState.currentProject) {
    loadStep(projectsState.currentStep);
  }
}

function getLangBadgesHtml(langs) {
  return langs.map(function (l) {
    if (l === 'python') return '<span class="lang-badge lang-badge-py"><span class="py-p">P</span><span class="py-y">Y</span></span>';
    if (l === 'go') return '<span class="lang-badge lang-badge-go">GO</span>';
    if (l === 'typescript') return '<span class="lang-badge lang-badge-ts">TS</span>';
    return '<span class="lang-badge lang-badge-js">JS</span>';
  }).join(' ');
}

function getProjAccent(langs) {
  if (langs.includes('go')) return '#06b6d4';
  if (langs.includes('python')) return '#eab308';
  if (langs.includes('typescript')) return '#3b82f6';
  return '#eab308';
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderWelcome() {
  const guide = document.getElementById('projectsGuide');
  if (!guide) return;
  guide.innerHTML =
    '<div class="projects-welcome">' +
    '<h2>🚀 Projects Lab</h2>' +
    '<p>Build real projects step by step. Pick a project from the sidebar to get started.</p>' +
    '<div class="projects-welcome-features">' +
    '<div class="projects-feature-card"><div class="projects-feature-icon">📘</div><div class="projects-feature-title">Guided Steps</div><div class="projects-feature-desc">Follow clear instructions</div></div>' +
    '<div class="projects-feature-card"><div class="projects-feature-icon">✅</div><div class="projects-feature-title">Verify Your Code</div><div class="projects-feature-desc">Check your work at each step</div></div>' +
    '<div class="projects-feature-card"><div class="projects-feature-icon">🔄</div><div class="projects-feature-title">JS, TS, or Python</div><div class="projects-feature-desc">Toggle between languages</div></div>' +
    '</div>' +
    '<div class="projects-welcome-stats">' + projectsState.projects.length + ' projects available</div></div>';
  const ws = document.getElementById('projectsWorkspace');
  if (ws) ws.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:13px;">Select a project to start coding</div>';
}

function selectProject(projectId) {
  const project = projectsState.projects.find(p => p.id === projectId);
  if (!project) return;
  projectsState.currentProject = project;

  const projLang = project.languages?.[0] || 'javascript';
  if (projLang !== projectsState.language) {
    projectsState.language = projLang;
    renderSidebar();
  }

  const saved = projectsState.progress[projectId];
  if (saved) {
    projectsState.stepStates = project.steps.map(function (_, i) {
      if (saved.completedSteps && saved.completedSteps.includes(i)) return 'completed';
      if (saved.skippedSteps && saved.skippedSteps.includes(i)) return 'skipped';
      if (i === 0 || (saved.completedSteps && saved.completedSteps.includes(i - 1)) || (saved.skippedSteps && saved.skippedSteps.includes(i - 1))) return 'active';
      return 'locked';
    });
    projectsState.stepUserCode = saved.stepUserCode || {};
    projectsState.stepOutput = saved.stepOutput || {};
    projectsState.stepHintIndex = saved.stepHintIndex || {};
    projectsState.currentStep = saved.completedSteps && saved.completedSteps.length > 0
      ? Math.min(saved.completedSteps[saved.completedSteps.length - 1] + 1, project.steps.length - 1)
      : 0;
  } else {
    projectsState.stepStates = project.steps.map(function (_, i) { return i === 0 ? 'active' : 'locked'; });
    projectsState.stepUserCode = {};
    projectsState.stepOutput = {};
    projectsState.stepHintIndex = {};
    projectsState.currentStep = 0;
  }

  renderWorkspaceLayout();
  renderGuidePanel();
  loadStep(projectsState.currentStep);
  renderSidebar();
}

function renderGuidePanel() {
  const guide = document.getElementById('projectsGuide');
  const p = projectsState.currentProject;
  if (!p) { renderWelcome(); return; }
  const total = p.steps.length;
  const done = projectsState.stepStates.filter(s => s === 'completed').length;
  const pct = Math.round(done / total * 100);
  const step = p.steps[projectsState.currentStep];

  let html = '<div class="projects-guide">' +
    '<div class="projects-guide-header"><span class="projects-guide-title">' + esc(p.title) + '</span><span class="projects-guide-count">Step ' + (projectsState.currentStep + 1) + ' of ' + total + '</span></div>' +
    '<div class="projects-guide-bar"><div class="projects-guide-bar-fill" style="width:' + pct + '%"></div></div>';

  if (!step) {
    html += '</div>';
    guide.innerHTML = html;
    return;
  }

  const state = projectsState.stepStates[projectsState.currentStep];
  const hints = step.hints || [];
  const currentHintIdx = projectsState.stepHintIndex[projectsState.currentStep] || 0;

  let hintsHtml = '';
  if (hints.length > 0) {
    const hintLabel = currentHintIdx > 0 && currentHintIdx >= hints.length
      ? '💡 Hide Hints'
      : '💡 Show Hint ' + Math.min(currentHintIdx + 1, hints.length) + '/' + hints.length;
    const hintsVisible = currentHintIdx > 0 ? 'block' : 'none';
    let hintsContent = '';
    for (let hi = 0; hi < currentHintIdx && hi < hints.length; hi++) {
      hintsContent += '<div class="projects-hint-item"><span class="projects-hint-num">' + (hi + 1) + '.</span> ' + hints[hi] + '</div>';
    }
    hintsHtml = '<div class="projects-hints">' +
      '<button class="projects-hint-btn" onclick="revealProgressiveHint()">' + hintLabel + '</button>' +
      '<div class="projects-hint-text" id="projectsHintText" style="display:' + hintsVisible + '">' + hintsContent + '</div>' +
      '</div>';
  }

  const outputText = projectsState.stepOutput[projectsState.currentStep] || '';

  html += '<div class="projects-step">' +
    '<h3 class="projects-step-title">' + esc(step.title) + '</h3>' +
    '<div class="projects-step-desc">' + step.description + '</div>' +
    hintsHtml +
    '<div class="projects-verify-area">' +
    '<button class="projects-verify-btn" onclick="verifyStep()">' + (state === 'completed' ? '✅ Verified' : 'Verify & Continue') + '</button>' +
    '<span class="projects-verify-result" id="projectsVerifyResult"></span></div>' +
    '<div class="projects-inline-output" id="projectsInlineOutput"' + (outputText ? ' style="display:block"' : '') + '>' + esc(outputText) + '</div>';

  const prevDisabled = projectsState.currentStep === 0;
  const nextDisabled = projectsState.currentStep >= p.steps.length - 1;
  html += '<div class="projects-nav">' +
    '<button class="projects-nav-btn" onclick="prevStep()"' + (prevDisabled ? ' disabled' : '') + '>◀ Previous</button>' +
    '<span class="projects-skip-link" onclick="skipStep()">Skip this step</span>' +
    '<button class="projects-nav-btn" onclick="nextStep()"' + (nextDisabled ? ' disabled' : '') + '>Next ▶</button></div>';

  html += '</div>' +
    '<div class="projects-ai-section">' +
    '<button class="projects-ai-btn" onclick="askProjectDevin()">🤖 Ask Devin</button>' +
    '<span class="projects-ai-hint">Stuck? Get AI help with this step</span>' +
    '</div></div>';
  guide.innerHTML = html;
}

function saveCurrentCode() {
  const editor = document.getElementById('projectsEditor');
  if (editor && projectsState.currentProject) {
    projectsState.stepUserCode[projectsState.currentStep] = editor.value;
  }
}

function loadStep(index) {
  const p = projectsState.currentProject;
  if (!p || index < 0 || index >= p.steps.length) return;

  saveCurrentCode();

  projectsState.currentStep = index;
  renderGuidePanel();

  const editor = document.getElementById('projectsEditor');
  const savedCode = projectsState.stepUserCode[index] || '';
  if (editor) editor.value = savedCode;

  const savedOutput = projectsState.stepOutput[index] || '';
  const inlineOutput = document.getElementById('projectsInlineOutput');
  if (inlineOutput) {
    inlineOutput.textContent = savedOutput;
    if (savedOutput) inlineOutput.style.display = 'block';
  }

  switchWorkspaceTab('code');
}

function nextStep() {
  const p = projectsState.currentProject;
  if (!p) return;
  if (projectsState.currentStep < p.steps.length - 1) {
    const next = projectsState.currentStep + 1;
    if (projectsState.stepStates[next] === 'locked') projectsState.stepStates[next] = 'active';
    loadStep(next);
    saveProgress();
    renderSidebar();
  }
}

function prevStep() {
  if (projectsState.currentStep > 0) loadStep(projectsState.currentStep - 1);
}

function skipStep() {
  const p = projectsState.currentProject;
  if (!p) return;
  projectsState.stepStates[projectsState.currentStep] = 'skipped';
  if (projectsState.currentStep < p.steps.length - 1) {
    const next = projectsState.currentStep + 1;
    if (projectsState.stepStates[next] === 'locked') projectsState.stepStates[next] = 'active';
    loadStep(next);
  }
  saveProgress();
  renderSidebar();
}

function revealProgressiveHint() {
  const step = projectsState.currentProject?.steps[projectsState.currentStep];
  if (!step?.hints?.length) return;
  const currentHint = projectsState.stepHintIndex[projectsState.currentStep] || 0;

  if (currentHint < step.hints.length) {
    const newIdx = currentHint + 1;
    projectsState.stepHintIndex[projectsState.currentStep] = newIdx;
    const hintText = document.getElementById('projectsHintText');
    if (hintText) {
      hintText.style.display = 'block';
      let content = '';
      for (let hi = 0; hi < newIdx && hi < step.hints.length; hi++) {
        content += '<div class="projects-hint-item"><span class="projects-hint-num">' + (hi + 1) + '.</span> ' + step.hints[hi] + '</div>';
      }
      hintText.innerHTML = content;
    }
    const btn = document.querySelector('.projects-hint-btn');
    if (btn) {
      btn.textContent = newIdx >= step.hints.length
        ? '💡 Hide Hints'
        : '💡 Show Hint ' + (newIdx + 1) + '/' + step.hints.length;
    }
  } else {
    projectsState.stepHintIndex[projectsState.currentStep] = 0;
    const hintText = document.getElementById('projectsHintText');
    if (hintText) hintText.style.display = 'none';
    const btn = document.querySelector('.projects-hint-btn');
    if (btn) btn.textContent = '💡 Show Hint 1/' + step.hints.length;
  }
}

function askProjectDevin() {
  if (typeof toggleAI === 'function') toggleAI();
  setTimeout(function () {
    if (typeof askAI === 'function') {
      var p = projectsState.currentProject;
      var step = p?.steps[projectsState.currentStep];
      var code = document.getElementById('projectsEditor')?.value || '';
      var prompt = 'I\'m working on the project "' + (p?.title || '') + '", step "' + (step?.title || '') + '". ';
      prompt += 'The task: ' + (step?.description || '') + '. ';
      if (code.trim()) prompt += '\n\nMy current code:\n' + code;
      askAI(prompt);
    }
  }, 300);
}

function showProjectAnswer() {
  var p = projectsState.currentProject;
  var step = p?.steps[projectsState.currentStep];
  var template = step?.codeTemplate?.[projectsState.language];
  if (!template) return;
  if (confirm('Show the code for this step? Try to solve it yourself first!')) {
    var editor = document.getElementById('projectsEditor');
    if (editor) {
      editor.value = template;
      projectsState.stepUserCode[projectsState.currentStep] = template;
    }
  }
}

function wrapForIframe(code) {
  const hasHTML = /<script|<html|<body|<div|<h[1-6]|<p|<ul|<ol|<li|<table|<form|<input|<button|<a\b|<img|<select|<textarea/i.test(code);
  const safe = code.replace(/<\/script>/gi, '<\\/script>');
  const instr =
    'window._output="";window._error=null;' +
    'console.log=function(){' +
    'window._output+=Array.from(arguments).map(function(a){' +
    'return typeof a==="object"?JSON.stringify(a):String(a)' +
    '}).join(" ")+"\\n";};' +
    'window.onerror=function(m,u,l){window._error=m+" (line "+l+")";return true;};';
  if (hasHTML) {
    return '<!DOCTYPE html><html><body><script>' + instr + '<\/script>' + safe + '\n</body></html>';
  }
  return '<!DOCTYPE html><html><body><script>' + instr + safe + '\n<\/script></body></html>';
}

function execJSInIframe(code) {
  return new Promise(function (resolve) {
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.srcdoc = wrapForIframe(code);
    iframe.onload = function () {
      var output = iframe.contentWindow._output || '';
      var error = iframe.contentWindow._error;
      document.body.removeChild(iframe);
      resolve({ output: output, error: error });
    };
  });
}

function setInlineOutput(text) {
  const el = document.getElementById('projectsInlineOutput');
  if (el) {
    el.textContent = text;
    el.style.display = 'block';
  }
  projectsState.stepOutput[projectsState.currentStep] = text;
}

async function executeViaAPI(lang, code) {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang: lang, code: code })
  });
  return await res.json();
}

async function runProjectCode() {
  const editor = document.getElementById('projectsEditor');
  const code = editor?.value || '';
  if (!code.trim()) return;
  const preview = document.getElementById('projectsPreview');
  if (projectsState.language === 'python' || projectsState.language === 'go') {
    try {
      const apiLang = projectsState.language === 'go' ? 'go' : 'py';
      const data = await executeViaAPI(apiLang, code);
      let output = data.output || '(no output)';
      if (data.error) output += '\n(execution error)';
      if (preview) preview.textContent = output;
      setInlineOutput(output);
    } catch (err) {
      const msg = '❌ Error: ' + err.message;
      if (preview) preview.textContent = msg;
      setInlineOutput(msg);
    }
  } else {
    preview.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    preview.appendChild(iframe);
    iframe.srcdoc = wrapForIframe(code);
    setInlineOutput('▶ Code rendered in preview tab');
  }
  switchWorkspaceTab('preview');
}

async function verifyStep() {
  const p = projectsState.currentProject;
  const step = p?.steps[projectsState.currentStep];
  if (!step?.verification) {
    markStepComplete();
    return;
  }
  const editor = document.getElementById('projectsEditor');
  const code = editor?.value || '';
  if (!code.trim()) {
    const el = document.getElementById('projectsVerifyResult');
    if (el) { el.innerText = 'Write some code first!'; el.style.color = '#f59e0b'; }
    return;
  }
  const resultEl = document.getElementById('projectsVerifyResult');
  if (!resultEl) return;
  let output = '';
  if (projectsState.language === 'python' || projectsState.language === 'go') {
    try {
      const apiLang = projectsState.language === 'go' ? 'go' : 'py';
      const data = await executeViaAPI(apiLang, code);
      output = data.output || '';
      setInlineOutput(output || '(no output)');
      const preview = document.getElementById('projectsPreview');
      if (preview) preview.textContent = output || '(no output)';
      if (data.error) { output += '\n(execution error)'; }
    } catch (err) {
      const preview = document.getElementById('projectsPreview');
      if (preview) preview.textContent = '❌ Error: ' + err.message;
      resultEl.innerText = '❌ Error: ' + err.message;
      resultEl.style.color = '#ef4444';
      setInlineOutput('❌ Error: ' + err.message);
      return;
    }
  } else {
    try {
      const result = await execJSInIframe(code);
      output = result.output;
      setInlineOutput(output || '(no output)');
      const preview = document.getElementById('projectsPreview');
      if (preview) {
        preview.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        preview.appendChild(iframe);
        iframe.srcdoc = wrapForIframe(code);
      }
      if (result.error) {
        resultEl.innerText = '❌ Error: ' + result.error;
        resultEl.style.color = '#ef4444';
        setInlineOutput('❌ Error: ' + result.error);
        return;
      }
    } catch (err) {
      const preview = document.getElementById('projectsPreview');
      if (preview) preview.textContent = '❌ Error: ' + err.message;
      resultEl.innerText = '❌ Error: ' + err.message;
      resultEl.style.color = '#ef4444';
      setInlineOutput('❌ Error: ' + err.message);
      return;
    }
  }
  try {
    const testFn = new Function('output', 'window', 'document', 'return (' + step.verification.test + ');');
    const passed = testFn(output, window, document);
    if (passed) {
      resultEl.innerText = step.verification.successMessage || '✅ Passed!';
      resultEl.style.color = '#22c55e';
      markStepComplete();
      renderSidebar();
    } else {
      resultEl.innerText = step.verification.failureMessage || '❌ Try again';
      resultEl.style.color = '#ef4444';
    }
  } catch (err) {
    resultEl.innerText = '❌ Error in test: ' + err.message;
    resultEl.style.color = '#ef4444';
  }
}

function markStepComplete() {
  const p = projectsState.currentProject;
  if (!p) return;
  projectsState.stepStates[projectsState.currentStep] = 'completed';
  if (projectsState.currentStep < p.steps.length - 1) {
    const next = projectsState.currentStep + 1;
    if (projectsState.stepStates[next] === 'locked') projectsState.stepStates[next] = 'active';
  } else {
    showProjectComplete();
  }
  saveProgress();
  renderSidebar();
}

function showProjectComplete() {
  const guide = document.getElementById('projectsGuide');
  const p = projectsState.currentProject;
  if (!guide || !p) return;
  const nextProjects = projectsState.projects.filter(x => x.difficulty === p.difficulty && x.id !== p.id).slice(0, 3);
  let nextHtml = '';
  if (nextProjects.length > 0) {
    nextHtml = '<div class="projects-next"><p>Try next:</p>' +
      nextProjects.map(x => '<button class="projects-btn" onclick="selectProject(\'' + x.id + '\')">' + esc(x.title) + '</button>').join('') + '</div>';
  }
  guide.innerHTML =
    '<div class="projects-complete">' +
    '<h2>🎉 Project Complete!</h2>' +
    '<p>You built: <strong>' + esc(p.title) + '</strong></p>' +
    '<p>Concepts covered: ' + (p.concepts ? p.concepts.join(', ') : 'Various') + '</p>' +
    nextHtml +
    '<div class="projects-complete-actions">' +
    '<button class="projects-btn" onclick="selectProject(\'' + p.id + '\')">Review Again</button>' +
    '<button class="projects-btn" onclick="initProjects()">Back to Projects</button></div></div>';
}

function saveProgress() {
  if (!projectsState.currentProject) return;
  saveCurrentCode();
  const key = 'projects_progress_' + (localStorage.getItem('koded_learnerId') || 'default');
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  data[projectsState.currentProject.id] = {
    completedSteps: projectsState.stepStates.map((s, i) => s === 'completed' ? i : -1).filter(i => i >= 0),
    skippedSteps: projectsState.stepStates.map((s, i) => s === 'skipped' ? i : -1).filter(i => i >= 0),
    totalSteps: projectsState.currentProject.steps.length,
    language: projectsState.language,
    stepUserCode: projectsState.stepUserCode,
    stepOutput: projectsState.stepOutput,
    stepHintIndex: projectsState.stepHintIndex
  };
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage full, progress not saved');
  }
}

function loadProgress() {
  const key = 'projects_progress_' + (localStorage.getItem('koded_learnerId') || 'default');
  try {
    projectsState.progress = JSON.parse(localStorage.getItem(key) || '{}');
  } catch (e) {
    projectsState.progress = {};
  }
}
