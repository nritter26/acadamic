<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { getExecutionState } from '$lib/stores/execution.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import TopicList from '$lib/components/curriculum/TopicList.svelte';
  import Explanation from '$lib/components/workspace/Explanation.svelte';
  import CodeEditor from '$lib/components/workspace/CodeEditor.svelte';
  import Console from '$lib/components/workspace/Console.svelte';
  import WorkspaceActions from '$lib/components/workspace/WorkspaceActions.svelte';
  import APIClient from '$lib/components/workspace/APIClient.svelte';
  import DbLab from '$lib/components/workspace/DbLab.svelte';
  import SchemaDesigner from '$lib/components/workspace/SchemaDesigner.svelte';
  import ChallengeView from '$lib/components/challenge/ChallengeView.svelte';
  import QuizView from '$lib/components/quiz/QuizView.svelte';
  import ProjectList from '$lib/components/projects/ProjectList.svelte';
  import ProjectDetail from '$lib/components/projects/ProjectDetail.svelte';
  import { loadProjectCatalog } from '$lib/lib/projects.js';
  import { STYLING_SCENARIOS, SCENARIO_ORDER } from '$lib/lib/styling-scenarios.js';
  import { LANG_INTROS } from '$lib/lib/lang-intros.js';
  import { runPipeline, highlightCode, renderTokens, renderAST, renderStats } from '$lib/lib/compiler.js';

  const LANGUAGE_MODES = ['asm','htmlcss','bash','c','cs','cpp','db','go','java','js','kt','lua','php','py','rb','rs','scala','swift','ts','wasm','zig'];
  const CURRICULUM_MODES = ['cicd', 'gamedev', 'mobile', 'backend'];
  const CUSTOM_WORKSPACE_MODES = ['compiler', 'schema', 'styling', 'challenge', 'quiz'];
  const STANDALONE_MODES = ['dblab', 'projects'];

  let curr = $derived(getCurriculumState());
  let app = $derived(getAppState());
  let exec = $derived(getExecutionState());
  let editor = $derived(getEditorState());
  let mode = $derived(app.mode);

  let hasCurriculum = $derived(LANGUAGE_MODES.includes(mode) || CURRICULUM_MODES.includes(mode));
  let usesCustomWorkspace = $derived(CUSTOM_WORKSPACE_MODES.includes(mode));
  let isStandalone = $derived(STANDALONE_MODES.includes(mode));
  let isBackendMode = $derived(mode === 'backend');
  let isTechStackMode = $derived(mode === 'techstack');
  let isSchemaMode = $derived(mode === 'schema' || mode === 'dblab');
  let isStylingMode = $derived(mode === 'styling');
  let isChallengeMode = $derived(mode === 'challenge');
  let isQuizMode = $derived(mode === 'quiz');
  let isCompilerMode = $derived(mode === 'compiler');

  let showApiClient = $state(false);
  let projects = $state([]);
  let selectedProject = $state(null);
  let projectDiffFilter = $state('all');
  let projectLangFilter = $state('all');
  let projectFrameworkFilter = $state('all');
  let projectLanguage = $state('javascript');

  let appData = $state(null);
  let techStackProvider = $state('react');
  let sortedProviders = $derived.by(() => {
    if (!appData?.techStackProviderNames) return [];
    return Object.entries(appData.techStackProviderNames).sort((a, b) => a[1].localeCompare(b[1]));
  });
  function getTsColor(p) { return appData?.techStackProviderColors?.[p] || '#94a3b8'; }

  async function loadAppData() {
    if (appData) return;
    try {
      const r = await fetch('/content/app-data.json');
      appData = await r.json();
    } catch (e) { console.error('Failed to load app data', e); }
  }

  function switchTechStackProvider(provider) {
    techStackProvider = provider;
    curr.lang = provider;
    curr.phase = '';
    curr.topic = '';
    showApiClient = false;
    curr.loadLangData(provider);
  }

  let stylingScenario = $state('box-model');
  let stylingCss = $state('');
  let stylingPreview = $derived.by(() => {
    const s = STYLING_SCENARIOS[stylingScenario];
    if (!s) return '';
    return `<html><head><meta charset="UTF-8"><style>${s.demoStyle}\n${stylingCss}</style></head><body>${s.demoHtml}</body></html>`;
  });

  function stylingLoadScenario(id) {
    const s = STYLING_SCENARIOS[id];
    if (!s) return;
    stylingScenario = id;
    stylingCss = s.defaultCss;
  }

  let compilerCurriculum = $derived(appData?.courseData__compiler || null);
  let compilerTopicData = $derived.by(() => {
    if (!compilerCurriculum || !curr.phase || !curr.topic) return null;
    return compilerCurriculum[curr.phase]?.[curr.topic] || null;
  });

  function loadCompilerTopic(phase, topic) {
    curr.phase = phase;
    curr.topic = topic;
    const data = compilerCurriculum?.[phase]?.[topic];
    if (data?.code) {
      editor.code = data.code;
      compilerRunPipeline(-1);
    }
  }

  let prevMode = $state(null);

  $effect(() => {
    const m = app.mode;
    if (prevMode !== m) {
      prevMode = m;
      showApiClient = false;
      if (m === 'styling') {
        stylingLoadScenario('box-model');
      } else if (m === 'techstack') {
        techStackProvider = 'react';
        curr.lang = 'react';
        curr.phase = '';
        curr.topic = '';
        curr.loadLangData('react');
        loadAppData();
      } else if (m === 'compiler') {
        loadAppData();
        curr.lang = 'compiler';
      } else {
        curr.lang = m;
        if (hasCurriculum) {
          curr.loadLangData(m);
        }
      }
      if (m === 'projects') {
        loadProjectCatalog().then(p => projects = p);
      }
      app.workspaceOpen = !STANDALONE_MODES.includes(m);
    }
  });

  const LANG_FILTERS = ['all', 'javascript', 'typescript', 'python', 'java', 'cs', 'rb', 'php', 'go', 'rust', 'cpp', 'c', 'zig', 'kt', 'lua', 'swift', 'scala', 'bash', 'asm', 'wasm'];
  const DIFF_FILTERS = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];
  const LANG_LABELS = { all: 'All', javascript: 'JS', typescript: 'TS', python: 'PY', java: 'Java', cs: 'C#', rb: 'Ruby', php: 'PHP', go: 'GO', rust: 'Rust', cpp: 'C++', c: 'C', zig: 'Zig', kt: 'KT', lua: 'Lua', swift: 'Swift', scala: 'Scala', bash: 'Bash', asm: 'ASM', wasm: 'WASM' };
  const DIFF_LABELS = { all: 'All', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' };

  $effect(() => {
    if (isTechStackMode && !curr.topic) {
      const intro = appData?.techStackIntro?.[curr.lang];
      if (intro?.code) {
        editor.code = intro.code;
        exec.output = `// ${intro.name} — explore the topics below to learn more`;
      }
    } else if (hasCurriculum && !curr.topic) {
      const intro = LANG_INTROS[curr.lang];
      if (intro?.code) {
        editor.code = intro.code;
        exec.output = `// ${intro.name} — explore the topics below to start learning`;
      }
    }
  });

  let hasFrameworkProjects = $derived(projects.some(p => p.framework));
  let projectProgress = $derived.by(() => {
    try {
      const learnerId = localStorage.getItem('koded_learnerId') || 'default';
      return JSON.parse(localStorage.getItem('projects_progress_' + learnerId) || '{}');
    } catch { return {}; }
  });

  let filteredProjects = $derived(
    projects.filter(p => {
      if (projectDiffFilter !== 'all' && p.difficulty !== projectDiffFilter) return false;
      if (projectLangFilter !== 'all' && (!p.languages || !p.languages.includes(projectLangFilter))) return false;
      if (projectFrameworkFilter !== 'all' && p.framework !== projectFrameworkFilter) return false;
      return true;
    })
  );

  let frameworkFilters = $derived.by(() => {
    const fws = new Set();
    projects.forEach(p => { if (p.framework) fws.add(p.framework); });
    return ['all', ...fws];
  });
  const FW_LABELS = { all: 'All', react: 'React', vue: 'Vue' };

  function handleProjectSelect(p) {
    selectedProject = p;
    const projLang = p.languages?.[0] || 'javascript';
    if (projLang !== projectLanguage) {
      projectLanguage = projLang;
    }
  }

  function handleProjectLangChange(lang) {
    projectLanguage = lang;
  }

  async function compilerRunPipeline(stage) {
    const labels = ['tokens', 'ast', 'stats'];
    const label = stage === -1 ? 'full' : labels[stage] || 'source';
    exec.running = true;
    exec.compilerStage = label;
    exec.compilerOutput = 'Processing...';
    try {
      if (!appData) await loadAppData();
      const code = editor.code || '';
      const lang = 'js';
      const configs = { LANG_CONFIG: appData?.LANG_CONFIG, TOKEN_TYPES: appData?.TOKEN_TYPES, TOKEN_COLORS: appData?.TOKEN_COLORS };
      if (label === 'source') {
        exec.compilerOutput = `<div class="cp-stage-result cp-source">${highlightCode(code, lang, configs)}</div>`;
      } else {
        const result = runPipeline(code, lang, configs);
        if (label === 'tokens') {
          exec.compilerOutput = renderTokens(result.tokens, configs.TOKEN_COLORS);
        } else if (label === 'ast') {
          exec.compilerOutput = `<div class="cp-stage-result">${renderAST(result.ast, 0)}</div>`;
        } else if (label === 'stats') {
          exec.compilerOutput = renderStats(result.stats);
        } else if (label === 'full') {
          exec.compilerOutput = `<div class="cp-full">
            <div class="cp-stage"><h4 class="cp-stage-title">Source Code</h4>${highlightCode(code, lang, configs)}</div>
            <div class="cp-stage"><h4 class="cp-stage-title">Tokens</h4>${renderTokens(result.tokens, configs.TOKEN_COLORS)}</div>
            <div class="cp-stage"><h4 class="cp-stage-title">AST</h4>${renderAST(result.ast, 0)}</div>
            <div class="cp-stage"><h4 class="cp-stage-title">Stats</h4>${renderStats(result.stats)}</div>
          </div>`;
        }
      }
    } catch (e) {
      exec.compilerOutput = 'Error: ' + e.message;
    }
    exec.running = false;
  }
</script>

{#if isStandalone}
  <div class="standalone-layout">
    {#if mode === 'dblab'}
      <DbLab />
    {:else if mode === 'projects'}
      <div class="projects-layout">
        <aside class="projects-sidebar">
          <div class="pfilters">
            <div class="pfilter-row">
              {#each DIFF_FILTERS as f}
                <button class="pfilter-btn" class:active={projectDiffFilter === f} onclick={() => projectDiffFilter = f}>{DIFF_LABELS[f]}</button>
              {/each}
            </div>
            <div class="pfilter-select-row">
              <label class="pfilter-label">Language</label>
              <select class="pfilter-select" bind:value={projectLangFilter}>
                {#each LANG_FILTERS as f}
                  <option value={f}>{LANG_LABELS[f]}</option>
                {/each}
              </select>
            </div>
            {#if hasFrameworkProjects}
              <div class="pfilter-row">
                {#each frameworkFilters as f}
                  <button class="pfilter-btn" class:active={projectFrameworkFilter === f} onclick={() => projectFrameworkFilter = f}>{FW_LABELS[f] || f}</button>
                {/each}
              </div>
            {/if}
          </div>
          <ProjectList
            projects={filteredProjects}
            selectedId={selectedProject?.id}
            language={projectLanguage}
            progress={projectProgress}
            onselect={handleProjectSelect}
            onlanguagechange={handleProjectLangChange}
          />
        </aside>
        <main class="projects-main">
          <ProjectDetail
            project={selectedProject}
            language={projectLanguage}
            projects={projects}
            totalProjects={projects.length}
            onselect={handleProjectSelect}
            onlanguagechange={handleProjectLangChange}
          />
        </main>
      </div>
    {/if}
  </div>
{:else if isChallengeMode}
  <ChallengeView />
{:else if isQuizMode}
  <QuizView />
{:else}
  <div class="curriculum-layout" class:tool-mode={usesCustomWorkspace}>
    <div class="col col-curriculum">
      {#if isStylingMode}
        <div class="styling-scenarios-header">Scenarios</div>
        {#each SCENARIO_ORDER as id}
          {@const sc = STYLING_SCENARIOS[id]}
          <button class="styling-scenario-btn" class:active={stylingScenario === id}
                  onclick={() => stylingLoadScenario(id)}>
            <span class="styling-sc-icon">{sc.icon}</span>
            <span class="styling-sc-name">{sc.name}</span>
          </button>
        {/each}
      {:else if isTechStackMode}
        <div class="ts-provider-bar">
          {#each sortedProviders as [key, label]}
            <button class="ts-provider-btn" class:active={curr.lang === key}
                    style="--ts-color: {getTsColor(key)}"
                    onclick={() => switchTechStackProvider(key)}>{label}</button>
          {/each}
        </div>
        <div class="ts-phase-list">
          <div class="ts-about-btn" onclick={() => { curr.phase = ''; curr.topic = ''; }}
               role="button" tabindex="0" onkeydown={() => {}}>
            <span>▼</span> About {appData?.techStackProviderNames?.[curr.lang] || curr.lang}
          </div>
          {#if curr.topicData?.[curr.lang]}
            {#each Object.entries(curr.topicData[curr.lang]) as [phase, topics]}
              <div class="ts-phase-label">{phase}</div>
              <div class="ts-topics">
                {#each Object.keys(topics) as topic}
                  <button class="ts-topic-btn" class:active={curr.topic === topic}
                          onclick={() => { curr.phase = phase; curr.topic = topic; }}>{topic}</button>
                {/each}
              </div>
            {/each}
          {:else}
            <div class="ts-loading">Loading topics...</div>
          {/if}
        </div>
      {:else if isCompilerMode}
        <div class="cp-curriculum">
          <div class="cp-cur-header">Compiler Pipeline</div>
          {#if compilerCurriculum}
            {#each Object.entries(compilerCurriculum) as [phase, topics]}
              <div class="cp-cur-phase">
                <div class="ts-phase-label">{phase}</div>
                <div class="ts-topics">
                  {#each Object.keys(topics) as topic}
                    <button class="ts-topic-btn" class:active={curr.topic === topic}
                            onclick={() => loadCompilerTopic(phase, topic)}>{topic}</button>
                  {/each}
                </div>
              </div>
            {/each}
          {:else}
            <div class="cp-cur-loading">Loading curriculum...</div>
          {/if}
        </div>
      {:else if hasCurriculum}
        <TopicList />
      {/if}
    </div>
    <div class="col col-theory">
      {#if isTechStackMode}
        {#if !curr.topic}
          {@const intro = appData?.techStackIntro?.[curr.lang]}
          {#if intro}
            {@const color = getTsColor(curr.lang)}
            <div class="ts-intro">
              <div class="ts-intro-header">
                <img class="ts-intro-logo" src="/public/logos/{curr.lang}.svg" alt={intro.name}
                     style="border-color:{color};" onerror={e => e.target.style.display='none'}>
                <h2>{intro.name}</h2>
              </div>
              <div class="ts-intro-section"><h3>What is it?</h3><p>{intro.what}</p></div>
              <div class="ts-intro-section"><h3>What is it used for?</h3><p>{intro.usedFor}</p></div>
              <div class="ts-intro-section"><h3>Who created it?</h3><p>{intro.creator}</p></div>
            </div>
          {/if}
        {:else}
          <Explanation />
        {/if}
      {:else if isStylingMode}
        {@const sc = STYLING_SCENARIOS[stylingScenario]}
        {#if sc}
          <div class="styling-viz">
            <div class="styling-viz-label">{sc.icon} {sc.name}</div>
            <div class="styling-viz-content">{@html sc.svg}</div>
            <div class="styling-viz-desc">{sc.desc}</div>
          </div>
        {/if}
      {:else if isCompilerMode}
        {#if compilerTopicData}
          <div class="cp-theory">
            <div class="cp-theory-header">{curr.topic}</div>
            <div class="cp-theory-phase">{curr.phase}</div>
            <div class="cp-theory-body">{@html compilerTopicData.exp}</div>
          </div>
        {:else}
          <div class="explanation-placeholder">Select a topic to begin learning about compilers</div>
        {/if}
      {:else if hasCurriculum}
        {#if curr.topic}
          <Explanation />
        {:else}
          {@const langIntro = LANG_INTROS[curr.lang]}
          {#if langIntro}
            <div class="ts-intro">
              <div class="ts-intro-header">
                <img class="ts-intro-logo" src="/public/logos/{curr.lang}.svg" alt={langIntro.name}
                     onerror={e => e.target.style.display='none'}>
                <h2>{langIntro.name}</h2>
              </div>
              <div class="ts-intro-section"><h3>What is it?</h3><p>{langIntro.what}</p></div>
              <div class="ts-intro-section"><h3>What is it used for?</h3><p>{langIntro.usedFor}</p></div>
              <div class="ts-intro-section"><h3>Who created it?</h3><p>{langIntro.creator}</p></div>
            </div>
          {:else}
            <div class="explanation-placeholder">Select a topic to begin learning</div>
          {/if}
        {/if}
      {/if}
    </div>
    {#if app.workspaceOpen}
    <div class="col col-workspace">
      {#if isBackendMode}
        {#if showApiClient}
          <APIClient />
          <div class="workspace-actions">
            <button class="action-btn" onclick={() => showApiClient = false}>Back to Editor</button>
          </div>
        {:else}
          <CodeEditor />
          <WorkspaceActions />
          <button class="api-toggle-btn" onclick={() => showApiClient = true}>API Client ▸</button>
        {/if}
      {:else if isSchemaMode}
        <SchemaDesigner />
      {:else if isStylingMode}
        <div class="styling-playground">
          <div class="styling-ws-header">CSS Editor</div>
          <textarea bind:value={stylingCss} class="styling-textarea" spellcheck="false"></textarea>
        </div>
      {:else if isChallengeMode}
        <ChallengeView />
      {:else if isQuizMode}
        <QuizView />
      {:else if isCompilerMode}
        <CodeEditor />
        <div class="compiler-buttons">
          <button class="cp-btn" onclick={() => compilerRunPipeline(0)} disabled={exec.running}>Tokens ▶</button>
          <button class="cp-btn" onclick={() => compilerRunPipeline(1)} disabled={exec.running}>AST ▶</button>
          <button class="cp-btn" onclick={() => compilerRunPipeline(2)} disabled={exec.running}>Stats ▶</button>
          <button class="cp-btn cp-btn-all" onclick={() => compilerRunPipeline(-1)} disabled={exec.running}>Full Pipeline ▶</button>
        </div>
      {:else}
        <CodeEditor />
        <WorkspaceActions />
      {/if}
    </div>
  {/if}
  {#if isStylingMode}
    <div class="col col-console">
      <div class="styling-console">
        <div class="styling-console-header">Preview</div>
        <iframe title="Styling preview" srcdoc={stylingPreview} class="styling-iframe"></iframe>
      </div>
    </div>
  {:else}
    <div class="col col-console">
      <Console />
    </div>
  {/if}
  </div>
{/if}

<style>
  .curriculum-layout { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; flex: 1; overflow: hidden; gap: 1px; background: #1e293b; }
  .curriculum-layout.tool-mode { grid-template-columns: 1fr 1fr 2fr 1fr; }
  .col { overflow-y: auto; background: #0f172a; display: flex; flex-direction: column; min-height: 0; }

  .standalone-layout { flex: 1; display: flex; overflow: hidden; background: #0f172a; }
  .projects-layout { display: flex; flex: 1; overflow: hidden; }
  .projects-sidebar { width: 300px; min-width: 300px; overflow-y: auto; border-right: 1px solid #1e293b; background: #0f172a; display: flex; flex-direction: column; }
  .projects-main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .pfilters { padding: 8px; display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid #1e293b; }
  .pfilter-row { display: flex; gap: 4px; flex-wrap: wrap; }
  .pfilter-btn { padding: 4px 8px; font-size: 10px; font-weight: 700; background: #111827; border: 1px solid #334155; border-radius: 4px; color: #94a3b8; cursor: pointer; text-transform: uppercase; }
  .pfilter-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }
  .pfilter-select-row { display: flex; align-items: center; gap: 6px; }
  .pfilter-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .pfilter-select { flex: 1; padding: 5px 8px; font-size: 11px; font-weight: 600; background: #111827; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; cursor: pointer; outline: none; }
  .pfilter-select:focus { border-color: #6366f1; }
  .pfilter-select option { background: #111827; color: #e2e8f0; }

  .ts-provider-bar { display: flex; gap: 3px; flex-wrap: wrap; padding: 6px; border-bottom: 1px solid #1e293b; }
  .ts-provider-btn { font-size: 9px; font-weight: 700; padding: 3px 7px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #94a3b8; cursor: pointer; white-space: nowrap; }
  .ts-provider-btn.active { border-color: var(--ts-color, #6366f1); color: var(--ts-color, #e2e8f0); background: rgba(0,0,0,0.3); }
  .ts-provider-btn:hover:not(.active) { border-color: #475569; color: #cbd5e1; }
  .ts-phase-list { overflow-y: auto; flex: 1; }
  .ts-about-btn { padding: 6px 8px; font-size: 10px; color: #64748b; cursor: pointer; border-bottom: 1px solid #1e293b; }
  .ts-about-btn:hover { color: #94a3b8; }
  .ts-phase-label { display: block; padding: 4px 8px; font-size: 9px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #0f172a; }
  .ts-topics { padding: 2px 0; }
  .ts-topic-btn { display: block; width: 100%; text-align: left; background: transparent; border: none; padding: 4px 8px 4px 16px; font-size: 10px; color: #94a3b8; cursor: pointer; }
  .ts-topic-btn:hover { background: #1e293b; color: #e2e8f0; }
  .ts-topic-btn.active { color: #38bdf8; background: rgba(56,189,248,0.06); font-weight: 600; }
  .ts-loading { padding: 12px; color: #64748b; font-size: 10px; font-style: italic; }

  .ts-intro { padding: 20px; overflow-y: auto; height: 100%; }
  .ts-intro-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .ts-intro-logo { width: 36px; height: 36px; object-fit: contain; border: 2px solid; border-radius: 8px; padding: 4px; background: rgba(0,0,0,0.3); }
  .ts-intro-header h2 { margin: 0; font-size: 22px; color: #e2e8f0; }
  .ts-intro-section { margin-bottom: 14px; }
  .ts-intro-section h3 { font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 5px; }
  .ts-intro-section p { font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0; }

  .styling-scenarios-header { padding: 6px 8px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; }
  .styling-scenario-btn { display: flex; align-items: center; gap: 6px; width: 100%; padding: 6px 8px; background: transparent; border: none; border-bottom: 1px solid #0f172a; color: #94a3b8; cursor: pointer; font-size: 10px; text-align: left; }
  .styling-scenario-btn:hover { background: #1e293b; color: #e2e8f0; }
  .styling-scenario-btn.active { color: #38bdf8; background: rgba(56,189,248,0.06); font-weight: 600; }
  .styling-sc-icon { font-size: 13px; }
  .styling-sc-name { font-weight: 500; }

  .styling-viz { padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
  .styling-viz-label { font-size: 11px; font-weight: 700; color: #e2e8f0; }
  .styling-viz-content { display: flex; justify-content: center; }
  .styling-viz-content :global(svg) { max-width: 100%; }
  .styling-viz-desc { font-size: 10px; color: #64748b; }

  .styling-playground { display: flex; flex-direction: column; gap: 0; flex: 1; min-height: 0; }
  .styling-ws-header { padding: 6px 12px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .styling-textarea { flex: 1; background: #0a0f1e; color: #e2e8f0; border: none; padding: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; resize: none; white-space: pre; overflow: auto; outline: none; }

  .styling-console { display: flex; flex-direction: column; flex: 1; min-height: 0; }
  .styling-console-header { padding: 6px 12px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .styling-iframe { flex: 1; border: none; background: white; min-height: 0; }
  .compiler-buttons { display: flex; gap: 8px; padding: 8px 12px; border-top: 1px solid #1e293b; }
  .cp-btn { padding: 6px 14px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #a5f3fc; cursor: pointer; }
  .cp-btn:hover:not(:disabled) { background: #334155; }
  .cp-btn-all { border-color: #6366f1; color: #c7d2fe; }
  .cp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .cp-curriculum { overflow-y: auto; flex: 1; }
  .cp-cur-header { padding: 6px 8px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; }
  .cp-cur-loading { padding: 12px; color: #64748b; font-size: 10px; font-style: italic; }
  .cp-theory { padding: 16px; overflow-y: auto; height: 100%; }
  .cp-theory-header { font-size: 18px; font-weight: 700; color: #e2e8f0; margin-bottom: 2px; }
  .cp-theory-phase { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
  .cp-theory-body { font-size: 13px; line-height: 1.7; color: #cbd5e1; }
  .cp-theory-body :global(p) { margin: 0 0 12px; }
  .cp-theory-body :global(code) { background: #1e293b; padding: 1px 5px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e2e8f0; }
  .cp-theory-body :global(strong) { color: #e2e8f0; }
  .api-toggle-btn { padding: 6px 12px; font-size: 11px; font-weight: 700; background: #f97316; border: none; border-radius: 4px; color: #fff; cursor: pointer; margin: 8px 12px; }
  .api-toggle-btn:hover { background: #ea580c; }
  .action-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; cursor: pointer; white-space: nowrap; margin: 8px 12px; }
  .action-btn:hover { background: #334155; }
</style>
