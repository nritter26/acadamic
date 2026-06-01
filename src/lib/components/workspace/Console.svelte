<script>
  import { getExecutionState } from '$lib/stores/execution.svelte.js';

  let exec = $derived(getExecutionState());
</script>

<div class="console">
  <div class="console-label">
    Console
    {#if exec.running}
      <span class="running-indicator">running...</span>
    {/if}
  </div>
  <pre class="console-output" class:has-error={exec.error}>{exec.error ? exec.error : exec.output || '// Run code to see output'}</pre>
</div>

<style>
  .console { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .console-label { padding: 6px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; border-bottom: 1px solid #1e293b; display: flex; align-items: center; gap: 8px; }
  .running-indicator { color: #6366f1; font-size: 10px; }
  .console-output { flex: 1; margin: 0; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.5; color: #e2e8f0; overflow: auto; white-space: pre-wrap; }
  .console-output.has-error { color: #ef4444; }
</style>
