<script>
  import { getExecutionState } from '$lib/stores/execution.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import { runPipeline, highlightCode, renderTokens, renderAST, renderStats } from '$lib/lib/compiler.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';

  let exec = $derived(getExecutionState());
  let curr = $derived(getCurriculumState());
  let editor = $derived(getEditorState());

  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { apiStream } from '$lib/lib/api.js';

  let activeTab = $state('output');

  let ai = $derived(getAIState());

  let explainErrorLoading = $state(false);

  function handleExplainError() {
    const errorText = exec.error || exec.output;
    if (!errorText) return;
    explainErrorLoading = true;
    ai.togglePanel();
    ai.toggleAI();
    ai.addMessage(`Explain this error:\n\`\`\`\n${errorText}\n\`\`\``, 'user');
    ai.addMessage('', 'bot');
    ai.setStreaming(true);
    let streamed = '';
    apiStream('/api/tutor/explain-error', { code: editor.code || '', errorOutput: errorText, lang: curr.lang, topic: curr.topic }, (chunk) => {
      streamed += chunk;
      ai.updateLastMessage(streamed);
    }, () => {
      ai.setStreaming(false);
      explainErrorLoading = false;
    }, (error) => {
      ai.updateLastMessage(`Error: ${error}`);
      ai.setStreaming(false);
      explainErrorLoading = false;
    });
  }
  let appData = $state(null);

  async function loadAppData() {
    if (appData) return;
    try {
      const r = await fetch('/content/app-data.json');
      appData = await r.json();
    } catch (e) { console.error('Failed to load app data', e); }
  }

  async function compilerRunPipeline(stage) {
    const labels = ['tokens', 'ast', 'stats'];
    const label = stage === -1 ? 'full' : labels[stage] || 'source';
    exec.running = true;
    exec.compilerStage = label;
    exec.compilerOutput = 'Processing...';
    try {
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

  async function handleBenchmark() {
    exec.running = true;
    exec.output = '';
    exec.error = '';
    try {
      const r = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: curr.lang }),
      });
      const data = await r.json();
      exec.output = data.output || JSON.stringify(data, null, 2);
    } catch (e) {
      exec.error = 'Failed: ' + e.message;
    }
    exec.running = false;
  }

  let showHeaders = $state(false);

  function copyApiResponse() {
    if (exec.apiResponse) {
      navigator.clipboard?.writeText(exec.apiResponse);
    }
  }

  const STAGE_MAP = { source: -2, tokens: 0, ast: 1, stats: 2 };

  function handleCompilerStageClick(stage) {
    const label = stage.toLowerCase();
    loadAppData();
    compilerRunPipeline(STAGE_MAP[label]);
  }
</script>

<div class="flex flex-col h-full min-h-0">
  <div class="px-3 py-1.5 text-[11px] font-bold text-[#94a3b8] border-b border-[#1e293b] flex items-center gap-2">
    Console
    {#if exec.running}
      <span class="text-[#6366f1] text-[10px]">⟳ running...</span>
    {/if}
    <button class="benchmark-btn" onclick={handleBenchmark} disabled={exec.running}>Benchmark</button>
  </div>
  <Tabs.Root bind:value={activeTab} class="flex flex-1 min-h-0">
    <Tabs.List variant="line" class="border-b border-[#1e293b]">
      <Tabs.Trigger value="output" class="text-[10px] font-semibold">Output</Tabs.Trigger>
      <Tabs.Trigger value="api" class="text-[10px] font-semibold">API Response</Tabs.Trigger>
      <Tabs.Trigger value="compiler" class="text-[10px] font-semibold" onclick={() => { loadAppData(); compilerRunPipeline(-1); }}>Compiler</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="output" class="flex-1 flex flex-col p-0">
      <div class="output-toolbar">
        {#if (exec.error || /error|exception|failed|panic/i.test(exec.output)) && !explainErrorLoading}
          <button class="explain-error-btn" onclick={handleExplainError}>Explain Error</button>
        {/if}
        {#if explainErrorLoading}
          <span class="explain-error-loading">Explaining error...</span>
        {/if}
      </div>
      <pre class="flex-1 m-0 p-3 font-mono text-xs leading-relaxed text-[#e2e8f0] overflow-auto whitespace-pre-wrap" class:has-error={exec.error}>{exec.error ? exec.error : exec.output || '// Run code to see output'}</pre>
    </Tabs.Content>
    <Tabs.Content value="api" class="flex-1 flex flex-col p-0">
      <div class="api-res-topbar">
        <span class="api-res-status">{exec.apiStatus || '—'}</span>
        <button class="api-res-copy" onclick={copyApiResponse}>Copy</button>
      </div>
      {#if exec.apiHeaders}
        <div class="api-res-headers">
          <button class="api-res-headers-toggle" onclick={() => showHeaders = !showHeaders}>
            {showHeaders ? '▼' : '▶'} Response Headers
          </button>
          {#if showHeaders}
            <pre class="api-res-pre">{exec.apiHeaders}</pre>
          {/if}
        </div>
      {/if}
      <pre class="flex-1 m-0 p-3 font-mono text-xs leading-relaxed text-[#e2e8f0] overflow-auto whitespace-pre-wrap">{exec.apiResponse || 'Send a request to see the response'}</pre>
    </Tabs.Content>
    <Tabs.Content value="compiler" class="flex-1 flex flex-col p-0">
      <div class="compiler-tabs">
        {#each ['Source', 'Tokens', 'AST', 'Stats'] as stage}
          <button class="cp-tab" class:active={exec.compilerStage === stage.toLowerCase()} onclick={() => handleCompilerStageClick(stage)} disabled={exec.running}>{stage}</button>
        {/each}
      </div>
      <div class="flex-1 m-0 p-3 font-mono text-xs leading-relaxed text-[#e2e8f0] overflow-auto whitespace-pre-wrap compiler-html">{@html exec.compilerOutput || '<span class="cp-empty">Click a pipeline stage button to analyze your code.</span>'}</div>
    </Tabs.Content>
  </Tabs.Root>
</div>

<style>
  .has-error { color: #ef4444; }
  .benchmark-btn { margin-left: auto; background: #1e293b; border: none; color: #94a3b8; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 9px; font-weight: 800; }
  .benchmark-btn:hover:not(:disabled) { background: #334155; color: #e2e8f0; }
  .benchmark-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .api-res-topbar { display: flex; align-items: center; gap: 8px; padding: 4px 12px; border-bottom: 1px solid #1e293b; font-size: 11px; }
  .api-res-status { color: #22c55e; font-weight: 700; }
  .api-res-copy { margin-left: auto; background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 2px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; }
  .api-res-headers { border-bottom: 1px solid #1e293b; }
  .api-res-headers-toggle { width: 100%; background: transparent; border: none; color: #94a3b8; padding: 4px 12px; font-size: 10px; text-align: left; cursor: pointer; font-weight: 600; }
  .api-res-headers-toggle:hover { color: #e2e8f0; background: #1e293b; }
  .api-res-pre { margin: 0; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #94a3b8; white-space: pre-wrap; background: #0a0f1e; }
  .compiler-tabs { display: flex; border-bottom: 1px solid #1e293b; }
  .cp-tab { flex: 1; padding: 4px 8px; font-size: 10px; font-weight: 600; background: transparent; border: none; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; }
  .cp-tab.active { color: #a5f3fc; border-bottom-color: #a5f3fc; }
  .cp-tab:hover { color: #cbd5e1; }
  .compiler-html :global(.cp-token-summary) { color: #64748b; font-size: 10px; font-weight: 700; margin-bottom: 8px; }
  .compiler-html :global(.cp-token-list) { display: flex; flex-wrap: wrap; gap: 4px; }
  .compiler-html :global(.cp-token) { padding: 2px 6px; border-radius: 3px; background: rgba(0,0,0,0.2); font-family: 'JetBrains Mono', monospace; font-size: 11px; white-space: nowrap; }
  .compiler-html :global(.cp-ast-node) { margin: 2px 0; }
  .compiler-html :global(.cp-ast-label) { color: #e2e8f0; font-size: 11px; font-family: 'JetBrains Mono', monospace; }
  .compiler-html :global(.cp-ast-val) { color: #fbbf24; }
  .compiler-html :global(.cp-ast-lang) { color: #64748b; font-size: 9px; font-weight: 700; }
  .compiler-html :global(.cp-stats-grid) { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .compiler-html :global(.cp-stat) { display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(0,0,0,0.2); border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
  .compiler-html :global(.cp-stat-label) { color: #64748b; }
  .compiler-html :global(.cp-stat-val) { color: #e2e8f0; font-weight: 700; }
  .compiler-html :global(.cp-stage-title) { margin: 8px 0 4px; font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; }
  .compiler-html :global(.cp-stage) { margin-bottom: 12px; }
  .compiler-html :global(.cp-empty) { color: #64748b; font-style: italic; }
  .output-toolbar { display: flex; align-items: center; gap: 8px; padding: 4px 12px; border-bottom: 1px solid #1e293b; min-height: 28px; }
  .explain-error-btn { background: #dc2626; color: #fff; border: none; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer; }
  .explain-error-btn:hover { background: #b91c1c; }
  .explain-error-loading { color: #f59e0b; font-size: 10px; font-weight: 600; }
</style>
