<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import { getExecutionState } from '$lib/stores/execution.svelte.js';

  let curr = $derived(getCurriculumState());
  let editor = $derived(getEditorState());
  let exec = $derived(getExecutionState());

  function handleRun() {
    exec.runCode(curr.lang, editor.code);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(editor.code);
  }
</script>

<div class="workspace-actions">
  <button class="action-btn primary" onclick={handleRun} disabled={exec.running}>
    {exec.running ? 'Running...' : 'Run'}
  </button>
  <button class="action-btn" onclick={handleCopy}>Copy</button>
  <button class="action-btn" onclick={() => exec.clear()}>Clear</button>
</div>

<style>
  .workspace-actions { display: flex; gap: 6px; padding: 8px 12px; border-top: 1px solid #1e293b; background: #0f172a; }
  .action-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; cursor: pointer; }
  .action-btn:hover:not(:disabled) { background: #334155; }
  .action-btn.primary { border-color: #6366f1; color: #c7d2fe; }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
