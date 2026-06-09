<script>
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { apiStream } from '$lib/lib/api.js';

  let { project = null, language = 'javascript', projects = [], totalProjects = 0, onselect = () => {}, onlanguagechange = () => {} } = $props();
  let editor = $derived(getEditorState());

  let stepStates = $state([]);
  let stepIndex = $state(0);
  let stepUserCode = $state({});
  let stepOutput = $state({});
  let stepHintIndex = $state({});
  let activeTab = $state('code');
  let verifyResult = $state('');
  let verifyResultColor = $state('');
  let verifyResults = $state(null);
  let previewKey = $state(0);

  let activeStep = $derived(project?.steps?.[stepIndex]);
  let totalSteps = $derived(project?.steps?.length || 0);
  let completedCount = $derived(stepStates.filter(s => s === 'completed').length);
  let progressPct = $derived(totalSteps > 0 ? Math.round(completedCount / totalSteps * 100) : 0);
  let isComplete = $derived(totalSteps > 0 && completedCount === totalSteps);

  function getLearnerId() {
    if (typeof localStorage === 'undefined') return 'default';
    return localStorage.getItem('koded_learnerId') || 'default';
  }
  function storageKey() { return 'projects_progress_' + getLearnerId(); }

  $effect(() => {
    if (project) loadProject();
  });

  function loadProject() {
    const saved = loadProgress(project.id);
    if (saved) {
      stepStates = project.steps.map((_, i) => {
        if (saved.completedSteps?.includes(i)) return 'completed';
        if (saved.skippedSteps?.includes(i)) return 'skipped';
        if (i === 0 || saved.completedSteps?.includes(i - 1) || saved.skippedSteps?.includes(i - 1)) return 'active';
        return 'locked';
      });
      stepUserCode = saved.stepUserCode || {};
      stepOutput = saved.stepOutput || {};
      stepHintIndex = saved.stepHintIndex || {};
      stepIndex = saved.completedSteps?.length > 0
        ? Math.min(saved.completedSteps[saved.completedSteps.length - 1] + 1, totalSteps - 1)
        : 0;
    } else {
      stepStates = project.steps.map((_, i) => i === 0 ? 'active' : 'locked');
      stepUserCode = {};
      stepOutput = {};
      stepHintIndex = {};
      stepIndex = 0;
    }
    verifyResult = '';
    verifyResultColor = '';
  }

  $effect(() => {
    if (project) loadStep(stepIndex);
  });

  function loadStep(idx) {
    if (!project || idx < 0 || idx >= totalSteps) return;
    const template = project.steps[idx]?.codeTemplate?.[language] || '';
    const saved = stepUserCode[idx];
    editor.code = saved || template;
  }

  function saveCurrentCode() {
    if (project) stepUserCode[stepIndex] = editor.code;
  }

  function nextStep() {
    saveCurrentCode();
    if (stepIndex < totalSteps - 1) {
      const next = stepIndex + 1;
      if (stepStates[next] === 'locked') stepStates[next] = 'active';
      stepIndex = next;
      loadStep(stepIndex);
      saveProgress();
    }
  }

  function prevStep() {
    saveCurrentCode();
    if (stepIndex > 0) {
      stepIndex--;
      loadStep(stepIndex);
    }
  }

  function skipStep() {
    saveCurrentCode();
    stepStates[stepIndex] = 'skipped';
    if (stepIndex < totalSteps - 1) {
      const next = stepIndex + 1;
      if (stepStates[next] === 'locked') stepStates[next] = 'active';
      stepIndex = next;
      loadStep(stepIndex);
    }
    saveProgress();
  }

  function revealHint() {
    const hints = activeStep?.hints;
    if (!hints?.length) return;
    const current = stepHintIndex[stepIndex] || 0;
    if (current < hints.length) {
      stepHintIndex[stepIndex] = current + 1;
    } else {
      stepHintIndex[stepIndex] = 0;
    }
  }

  function showAnswer() {
    if (!activeStep?.codeTemplate?.[language]) return;
    if (confirm('Show the code for this step? Try to solve it yourself first!')) {
      const template = activeStep.codeTemplate[language];
      editor.code = template;
      stepUserCode[stepIndex] = template;
    }
  }

  function wrapForIframe(code, framework) {
    let head = '';
    if (framework === 'react') {
      head = '<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>' +
        '<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>' +
        '<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>';
    } else if (framework === 'vue') {
      head = '<script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>';
    }
    const instr = 'window._output="";window._error=null;' +
      'console.log=function(){' +
      'window._output+=Array.from(arguments).map(function(a){' +
      'return typeof a==="object"?JSON.stringify(a):String(a)' +
      '}).join(" ")+"\\n";};' +
      'window.onerror=function(m,u,l){window._error=m+" (line "+l+")";return true;};';
    const hasHTML = /<script|<html|<body|<div|<h[1-6]|<p|<ul|<ol|<li|<table|<form|<input|<button|<a\b|<img|<select|<textarea/i.test(code);
    const safe = code.replace(/<\/script>/gi, '<\\/script>');
    if (hasHTML) {
      return '<!DOCTYPE html><html>' + head + '<body><script>' + instr + '<\/script>' + safe + '\n</body></html>';
    }
    const scriptTag = framework === 'react' ? 'script type="text/babel"' : 'script';
    return '<!DOCTYPE html><html>' + head + '<body><' + scriptTag + '>' + instr + safe + '\n<\/' + scriptTag + '></body></html>';
  }

  function execJSInIframe(code) {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const fw = project?.framework || null;
      iframe.srcdoc = wrapForIframe(code, fw);
      iframe.onload = () => {
        const output = iframe.contentWindow?._output || '';
        const error = iframe.contentWindow?._error;
        document.body.removeChild(iframe);
        resolve({ output, error });
      };
    });
  }

  async function executeViaAPI(lang, code) {
    const res = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, code }),
    });
    return await res.json();
  }

  async function runCode() {
    saveCurrentCode();
    const code = editor.code?.trim();
    if (!code) return;

    activeTab = 'preview';

    if (language === 'python' || language === 'go') {
      try {
        const apiLang = language === 'go' ? 'go' : 'py';
        const data = await executeViaAPI(apiLang, code);
        const output = data.output || '(no output)';
        stepOutput[stepIndex] = output;
      } catch (err) {
        stepOutput[stepIndex] = 'Error: ' + err.message;
      }
    } else {
      try {
        const result = await execJSInIframe(code);
        stepOutput[stepIndex] = result.output || '(no output)';
        if (result.error) stepOutput[stepIndex] = 'Error: ' + result.error;
      } catch (err) {
        stepOutput[stepIndex] = 'Error: ' + err.message;
      }
    }
    previewKey++;
  }

  async function verifyStep() {
    saveCurrentCode();
    verifyResults = null;
    const code = editor.code?.trim();
    if (!code) {
      verifyResult = 'Write some code first!';
      verifyResultColor = '#f59e0b';
      return;
    }

    if (activeStep?.verification?.mode === 'http' && activeStep.verification.tests?.length > 0) {
      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lang: language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language,
            code,
            serverMode: true,
            httpTests: activeStep.verification.tests,
          }),
        });
        const data = await res.json();
        verifyResults = data.serverResults || [];
        stepOutput[stepIndex] = data.output || '(no output)';
        if (data.allPassed) {
          verifyResult = activeStep.verification.successMessage || 'All tests passed!';
          verifyResultColor = '#22c55e';
          markStepComplete();
        } else {
          verifyResult = activeStep.verification.failureMessage || 'Some tests failed';
          verifyResultColor = '#ef4444';
        }
      } catch (err) {
        verifyResult = 'Error: ' + err.message;
        verifyResultColor = '#ef4444';
      }
      previewKey++;
      return;
    }

    let output = '';
    try {
      if (language === 'python' || language === 'go') {
        const apiLang = language === 'go' ? 'go' : 'py';
        const data = await executeViaAPI(apiLang, code);
        output = data.output || '';
        stepOutput[stepIndex] = output || '(no output)';
        if (data.error) output += '\n(execution error)';
      } else {
        const result = await execJSInIframe(code);
        output = result.output;
        stepOutput[stepIndex] = output || '(no output)';
        if (result.error) {
          verifyResult = 'Error: ' + result.error;
          verifyResultColor = '#ef4444';
          return;
        }
      }
    } catch (err) {
      verifyResult = 'Error: ' + err.message;
      verifyResultColor = '#ef4444';
      return;
    }

    if (activeStep?.verification?.test) {
      try {
        const testFn = new Function('output', 'window', 'document', 'return (' + activeStep.verification.test + ');');
        const passed = testFn(output, window, document);
        if (passed) {
          verifyResult = activeStep.verification.successMessage || 'Passed!';
          verifyResultColor = '#22c55e';
          markStepComplete();
        } else {
          verifyResult = activeStep.verification.failureMessage || 'Try again';
          verifyResultColor = '#ef4444';
        }
      } catch (err) {
        verifyResult = 'Error in test: ' + err.message;
        verifyResultColor = '#ef4444';
      }
    } else {
      markStepComplete();
    }
    previewKey++;
  }

  function markStepComplete() {
    stepStates[stepIndex] = 'completed';
    if (stepIndex < totalSteps - 1) {
      const next = stepIndex + 1;
      if (stepStates[next] === 'locked') stepStates[next] = 'active';
    }
    saveProgress();
  }

  function saveProgress() {
    if (!project) return;
    saveCurrentCode();
    const key = storageKey();
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    all[project.id] = {
      completedSteps: stepStates.map((s, i) => s === 'completed' ? i : -1).filter(i => i >= 0),
      skippedSteps: stepStates.map((s, i) => s === 'skipped' ? i : -1).filter(i => i >= 0),
      totalSteps,
      language,
      stepUserCode,
      stepOutput,
      stepHintIndex,
    };
    try { localStorage.setItem(key, JSON.stringify(all)); }
    catch (e) { console.warn('Progress not saved', e); }
  }

  function loadProgress(projectId) {
    try {
      const key = storageKey();
      const all = JSON.parse(localStorage.getItem(key) || '{}');
      return all[projectId] || null;
    } catch { return null; }
  }

  async function askDevin() {
    const step = activeStep;
    const code = editor.code || '';
    const prompt = 'I\'m working on the project "' + (project?.title || '') + '", step "' + (step?.title || '') + '". ' +
      'The task: ' + (step?.description || '') + '. ' +
      (code.trim() ? '\n\nMy current code:\n' + code : '');
    const ai = getAIState();
    ai.togglePanel();
    await new Promise(r => setTimeout(r, 300));
    ai.addMessage(prompt, 'user');
    ai.addMessage('', 'bot');
    ai.setStreaming(true);
    let streamed = '';
    await apiStream('/api/chat', {
      message: prompt,
      lang: language,
      topic: project?.id || '',
      phase: 'project',
    }, (chunk) => {
      streamed += chunk;
      ai.updateLastMessage(streamed);
    }, () => {
      ai.setStreaming(false);
    }, (error) => {
      ai.updateLastMessage('Error: ' + error);
      ai.setStreaming(false);
    });
  }

  let suggestedNext = $derived(
    projects.filter(p => p.difficulty === project?.difficulty && p.id !== project?.id).slice(0, 3)
  );

  let displayedHints = $derived.by(() => {
    const hints = activeStep?.hints || [];
    const count = stepHintIndex[stepIndex] || 0;
    return hints.slice(0, count);
  });

  let previewSrcdoc = $derived.by(() => {
    if (activeTab !== 'preview') return '';
    if (language === 'python' || language === 'go') return '';
    const code = stepUserCode[stepIndex] || editor.code || '';
    if (!code.trim()) return '';
    return wrapForIframe(code, project?.framework || null);
  });

  let stepState = $derived(stepStates[stepIndex] || 'locked');
  let hintsVisible = $derived((stepHintIndex[stepIndex] || 0) > 0);
  let hintsTotal = $derived(activeStep?.hints?.length || 0);
  let hintsRevealed = $derived(stepHintIndex[stepIndex] || 0);
  let allHintsShown = $derived(hintsRevealed >= hintsTotal);

</script>

{#if project}
  <div class="project-detail">
      <aside class="guide">
        <div class="guide-header">
        <span class="guide-title">{project.title}</span>
        <span class="guide-count">{stepIndex + 1} / {totalSteps}</span>
      </div>
      <div class="guide-bar"><div class="guide-bar-fill" style="width:{progressPct}%"></div></div>

      {#if isComplete}
        <div class="complete-view">
          <h2>Project Complete!</h2>
          <p>You built: <strong>{project.title}</strong></p>
          {#if project.concepts?.length}
            <p>Concepts covered: {project.concepts.join(', ')}</p>
          {/if}
          {#if suggestedNext.length > 0}
            <div class="complete-next">
              <p>Try next:</p>
              {#each suggestedNext as np}
                <button class="proj-btn" onclick={() => onselect(np)}>{np.title}</button>
              {/each}
            </div>
          {/if}
          <div class="complete-actions">
            <button class="proj-btn" onclick={() => { stepIndex = 0; loadProject(); }}>Review Again</button>
          </div>
        </div>
      {:else if activeStep}
        <div class="step-view">
          <h3 class="step-title">{activeStep.title}</h3>
          <div class="step-desc">{@html activeStep.description}</div>

          {#if activeStep.hints?.length}
            <div class="hints-area">
              <button class="hint-btn" onclick={revealHint}>
                {allHintsShown ? 'Hide Hints' : 'Hint ' + Math.min(hintsRevealed + 1, hintsTotal) + '/' + hintsTotal}
              </button>
              {#if hintsVisible}
                <div class="hint-text">
                  {#each displayedHints as hint, hi}
                    <div class="hint-item"><span class="hint-num">{hi + 1}.</span> {hint}</div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <div class="verify-area">
            <button class="verify-btn" onclick={verifyStep}>
              {stepState === 'completed' ? 'Verified' : 'Verify & Continue'}
            </button>
            {#if verifyResult}
              <span class="verify-result" style="color:{verifyResultColor}">{verifyResult}</span>
            {/if}
          </div>

          {#if verifyResults?.length > 0}
            <div class="test-results">
              {#each verifyResults as tr}
                <div class="test-result" class:test-pass={tr.passed} class:test-fail={!tr.passed}>
                  <span class="test-icon">{tr.passed ? '✓' : '✗'}</span>
                  <span class="test-label">{tr.method} {tr.path}</span>
                  <span class="test-detail">
                    {tr.passed ? `${tr.status}` : `expected ${tr.expectedStatus}, got ${tr.status}`}
                  </span>
                  {#if tr.error}
                    <span class="test-error">{tr.error}</span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          {#if stepOutput[stepIndex]}
            <pre class="inline-output">{stepOutput[stepIndex]}</pre>
          {/if}

          <div class="nav-area">
            <button class="nav-btn" onclick={prevStep} disabled={stepIndex === 0}>Previous</button>
            <button class="skip-link" onclick={skipStep}>Skip</button>
            {#if stepIndex < totalSteps - 1}
              <button class="nav-btn" onclick={nextStep}>Next</button>
            {/if}
          </div>

          <div class="ai-area">
            <button class="ai-btn" onclick={askDevin}>Ask Devin</button>
            <span class="ai-hint">Stuck? Get AI help with this step</span>
          </div>
          <div class="ai-area">
            <button class="ai-btn" onclick={showAnswer}>Show Answer</button>
          </div>
        </div>
      {/if}
    </aside>
    <main class="workspace">
      <div class="ws-tabs">
        <button class="ws-tab" class:active={activeTab === 'code'} onclick={() => activeTab = 'code'}>Code</button>
        <button class="ws-tab" class:active={activeTab === 'preview'} onclick={() => activeTab = 'preview'}>Preview</button>
        <button class="run-btn" onclick={runCode}>Run</button>
        <button class="showhow-btn" onclick={showAnswer}>Show How</button>
      </div>
      <div class="ws-content">
        {#if activeTab === 'code'}
          <div class="code-area">
            <textarea class="proj-editor" bind:value={editor.code} spellcheck="false"></textarea>
          </div>
        {:else}
          {#if language === 'python' || language === 'go'}
            <pre class="preview-text">{stepOutput[stepIndex] || 'Running...'}</pre>
          {:else}
            <iframe class="preview-iframe" title="Preview" srcdoc={previewSrcdoc} key={previewKey}></iframe>
          {/if}
        {/if}
      </div>
    </main>
  </div>
{:else}
  <div class="welcome">
    <h2>Projects Lab</h2>
    <p>Build real projects step by step. Pick a project from the sidebar to get started.</p>
    <div class="welcome-features">
      <div class="feature-card"><div class="feature-icon">Guided Steps</div><div class="feature-desc">Follow clear instructions</div></div>
      <div class="feature-card"><div class="feature-icon">Verify Your Code</div><div class="feature-desc">Check your work at each step</div></div>
      <div class="feature-card"><div class="feature-icon">JS, TS, or Python</div><div class="feature-desc">Toggle between languages</div></div>
    </div>
    <div class="welcome-count">{totalProjects} projects available</div>
  </div>
{/if}

<style>
  .project-detail { display: grid; grid-template-columns: 380px minmax(0, 1fr); height: 100%; min-height: 0; }

  .guide { padding: 16px; overflow-y: auto; border-right: 1px solid #1e293b; color: #cbd5e1; display: flex; flex-direction: column; gap: 8px; }
  .guide-header { display: flex; justify-content: space-between; align-items: center; }
  .guide-title { font-weight: 800; color: #e2e8f0; font-size: 14px; }
  .guide-count { color: #64748b; font-size: 11px; font-weight: 700; }
  .guide-bar { height: 4px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .guide-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a5b4fc); transition: width 0.3s; border-radius: 999px; }

  .step-view { display: flex; flex-direction: column; gap: 10px; }
  .step-title { margin: 0; font-size: 15px; color: #e2e8f0; }
  .step-desc { font-size: 13px; line-height: 1.6; color: #94a3b8; }
  .step-desc :global(p) { margin: 4px 0; }
  .step-desc :global(code) { background: #1e293b; padding: 1px 5px; border-radius: 3px; font-size: 12px; color: #e2e8f0; }

  .hints-area { }
  .hint-btn { background: transparent; border: 1px dashed #334155; color: #64748b; padding: 4px 10px; border-radius: 4px; font-size: 10px; cursor: pointer; }
  .hint-btn:hover { border-color: #6366f1; color: #a5b4fc; }
  .hint-text { margin-top: 6px; background: #111827; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; }
  .hint-item { font-size: 12px; color: #94a3b8; margin-bottom: 4px; line-height: 1.5; }
  .hint-num { color: #6366f1; font-weight: 700; }

  .verify-area { display: flex; align-items: center; gap: 8px; }
  .verify-btn { padding: 6px 14px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #22c55e; cursor: pointer; }
  .verify-btn:hover { background: #334155; }
  .verify-result { font-size: 11px; font-weight: 600; }
  .test-results { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
  .test-result { display: flex; align-items: center; gap: 6px; font-size: 11px; padding: 4px 8px; border-radius: 4px; }
  .test-result.test-pass { background: rgba(34,197,94,0.08); color: #86efac; }
  .test-result.test-fail { background: rgba(239,68,68,0.08); color: #fca5a5; }
  .test-icon { font-weight: 700; width: 14px; }
  .test-label { font-weight: 600; }
  .test-detail { color: #64748b; font-size: 10px; }
  .test-error { color: #ef4444; font-size: 10px; margin-left: auto; }

  .inline-output { margin: 0; padding: 8px; background: #0a0f1e; border: 1px solid #1e293b; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; white-space: pre-wrap; max-height: 120px; overflow: auto; }

  .nav-area { display: flex; align-items: center; gap: 8px; }
  .nav-btn { padding: 5px 12px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #e2e8f0; cursor: pointer; }
  .nav-btn:hover:not(:disabled) { background: #334155; }
  .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .skip-link { background: transparent; border: none; color: #64748b; font-size: 10px; cursor: pointer; margin: 0 auto; }
  .skip-link:hover { color: #94a3b8; }

  .ai-area { display: flex; align-items: center; gap: 6px; }
  .ai-btn { background: transparent; border: 1px solid #334155; color: #a78bfa; padding: 4px 10px; border-radius: 4px; font-size: 10px; cursor: pointer; }
  .ai-btn:hover { border-color: #a78bfa; }
  .ai-hint { font-size: 10px; color: #64748b; }

  .complete-view { text-align: center; padding: 24px 0; }
  .complete-view h2 { font-size: 20px; color: #22c55e; margin: 0 0 8px; }
  .complete-view p { color: #94a3b8; font-size: 13px; }
  .complete-next { margin: 12px 0; }
  .complete-next p { font-size: 11px; color: #64748b; margin-bottom: 6px; }
  .complete-next .proj-btn { margin: 2px 4px; }
  .complete-actions { display: flex; gap: 8px; justify-content: center; margin-top: 12px; }
  .proj-btn { padding: 6px 14px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #e2e8f0; cursor: pointer; }
  .proj-btn:hover { background: #334155; }

  .workspace { display: flex; flex-direction: column; min-height: 0; }
  .ws-tabs { display: flex; border-bottom: 1px solid #1e293b; }
  .ws-tab { padding: 6px 14px; font-size: 11px; font-weight: 600; background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; cursor: pointer; }
  .ws-tab.active { color: #e2e8f0; border-bottom-color: #6366f1; }
  .ws-tab:hover { color: #cbd5e1; }
  .run-btn { margin-left: auto; padding: 4px 12px; font-size: 10px; font-weight: 700; background: #059669; border: none; border-radius: 4px; color: #fff; cursor: pointer; align-self: center; }
  .run-btn:hover { background: #047857; }
  .showhow-btn { padding: 4px 10px; font-size: 10px; font-weight: 700; background: transparent; border: 1px solid #475569; border-radius: 4px; color: #cbd5e1; cursor: pointer; margin-right: 8px; align-self: center; }
  .showhow-btn:hover { border-color: #a78bfa; color: #a78bfa; }

  .ws-content { flex: 1; min-height: 0; display: flex; }
  .code-area { flex: 1; display: flex; }
  .proj-editor { flex: 1; padding: 15px 12px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; line-height: 1.6; background: #0a0f1e; color: #e2e8f0; border: none; outline: none; resize: none; tab-size: 4; }
  .preview-text { flex: 1; margin: 0; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e2e8f0; white-space: pre-wrap; overflow: auto; background: #0a0f1e; }
  .preview-iframe { flex: 1; border: none; background: #fff; }

  .welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center; color: #cbd5e1; }
  .welcome h2 { font-size: 24px; color: #e2e8f0; margin: 0 0 8px; }
  .welcome p { font-size: 14px; color: #64748b; margin: 0 0 24px; max-width: 400px; }
  .welcome-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .feature-card { background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; }
  .feature-icon { font-weight: 700; color: #6366f1; font-size: 12px; margin-bottom: 4px; }
  .feature-desc { font-size: 11px; color: #64748b; }
  .welcome-count { font-size: 12px; color: #64748b; }
</style>
