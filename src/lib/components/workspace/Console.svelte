<script>
  import { getExecutionState } from '$lib/stores/execution.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let exec = $derived(getExecutionState());
  let curr = $derived(getCurriculumState());

  let activeTab = $state('output');

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
</script>

<div class="console">
  <div class="console-label">
    Console
    {#if exec.running}
      <span class="running-indicator">⟳ running...</span>
    {/if}
    <button class="benchmark-btn" onclick={handleBenchmark} disabled={exec.running}>Benchmark</button>
  </div>
  <div class="console-tabs">
    <button class="console-tab" class:active={activeTab === 'output'} onclick={() => activeTab = 'output'}>Output</button>
    <button class="console-tab" class:active={activeTab === 'api'} onclick={() => activeTab = 'api'}>API Response</button>
    <button class="console-tab" class:active={activeTab === 'compiler'} onclick={() => activeTab = 'compiler'}>Compiler</button>
  </div>
  {#if activeTab === 'output'}
    <pre class="console-output" class:has-error={exec.error}>{exec.error ? exec.error : exec.output || '// Run code to see output'}</pre>
  {:else if activeTab === 'api'}
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
    <pre class="console-output">{exec.apiResponse || 'Send a request to see the response'}</pre>
  {:else if activeTab === 'compiler'}
    <div class="compiler-tabs">
      {#each ['Source', 'Tokens', 'AST', 'Stats'] as stage}
        <button class="cp-tab" class:active={exec.compilerStage === stage.toLowerCase()} onclick={() => exec.compilerStage = stage.toLowerCase()}>{stage}</button>
      {/each}
    </div>
    <div class="console-output compiler-html">{@html exec.compilerOutput || '<span class="cp-empty">Click a pipeline stage button to analyze your code.</span>'}</div>
  {/if}
</div>

<style>
  .console { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .console-label { padding: 6px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; border-bottom: 1px solid #1e293b; display: flex; align-items: center; gap: 8px; }
  .running-indicator { color: #6366f1; font-size: 10px; }
  .console-tabs { display: flex; border-bottom: 1px solid #1e293b; }
  .console-tab { flex: 1; padding: 4px 8px; font-size: 10px; font-weight: 600; background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; cursor: pointer; }
  .console-tab.active { color: #e2e8f0; border-bottom-color: #6366f1; }
  .console-tab:hover { color: #cbd5e1; }
  .console-output { flex: 1; margin: 0; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.5; color: #e2e8f0; overflow: auto; white-space: pre-wrap; }
  .console-output.has-error { color: #ef4444; }
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
  .compiler-html { padding: 12px; font-size: 12px; line-height: 1.6; overflow: auto; white-space: pre-wrap; }
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
</style>
