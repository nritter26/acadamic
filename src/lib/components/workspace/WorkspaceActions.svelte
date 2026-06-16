<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import { getExecutionState } from '$lib/stores/execution.svelte.js';

  let curr = $derived(getCurriculumState());
  let editor = $derived(getEditorState());
  let exec = $derived(getExecutionState());

  let autoSyntax = $state(true);

  $effect(() => {
    if (autoSyntax && editor.code) {
      const hasErr = !editor.code.trim() || /[^\w\s;(){}\[\]<>+\-*/%=!&|^~?:.,'"`@#$]/.test(editor.code);
      if (hasErr) {
        editor.syntaxError = 'Potential syntax issue detected';
      } else {
        editor.syntaxError = '';
      }
    } else {
      editor.syntaxError = '';
    }
  });

  function handleRun() {
    exec.runCode(curr.lang, editor.code);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(editor.code);
  }

  async function handleExplain() {
    exec.running = true;
    exec.output = '';
    exec.error = '';
    try {
      const r = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: curr.lang, code: editor.code, topic: curr.topic }),
      });
      const data = await r.json();
      exec.output = data.explanation || data.output || '(no explanation)';
    } catch (e) {
      exec.error = 'Failed: ' + e.message;
    }
    exec.running = false;
  }

  async function handleReview() {
    exec.running = true;
    exec.output = '';
    exec.error = '';
    try {
      const r = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: curr.lang, code: editor.code }),
      });
      const data = await r.json();
      exec.output = data.review || data.output || '(no review)';
    } catch (e) {
      exec.error = 'Failed: ' + e.message;
    }
    exec.running = false;
  }

  async function handleCheckCode() {
    exec.running = true;
    exec.output = '';
    exec.error = '';
    try {
      const r = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: curr.lang, code: editor.code }),
      });
      const data = await r.json();
      exec.output = data.result || data.output || '(no issues found)';
    } catch (e) {
      exec.error = 'Failed: ' + e.message;
    }
    exec.running = false;
  }

  function toggleCheatsheet() {
    window.dispatchEvent(new CustomEvent('toggle-cheatsheet'));
  }

  function toggleSchema() {
    window.dispatchEvent(new CustomEvent('toggle-schema'));
  }
</script>

<div class="workspace-actions">
  <button class="action-btn primary" onclick={handleRun} disabled={exec.running}>
    {exec.running ? 'Running...' : 'Run'}
  </button>
  <button class="action-btn" class:syntax-active={autoSyntax} onclick={() => autoSyntax = !autoSyntax} title="Toggle real-time syntax checking">
    {autoSyntax ? '🔍 Auto' : '🔍 Auto'}
  </button>
  <button class="action-btn" onclick={handleCheckCode} disabled={exec.running} title="Static code analysis">Check Code</button>
  <button class="action-btn" onclick={toggleCheatsheet} title="Open cheatsheet">Cheatsheet</button>
  {#if curr.lang === 'db'}
    <button class="action-btn" onclick={toggleSchema} title="Schema designer">Schema</button>
  {/if}
  <button class="action-btn" onclick={handleExplain} disabled={exec.running} title="AI explanation">Explain</button>
  <button class="action-btn" onclick={handleReview} disabled={exec.running} title="AI review">Review</button>
  <button class="action-btn" onclick={handleCopy} title="Copy code">Copy</button>
  <button class="action-btn" onclick={() => exec.clear()}>Clear</button>
</div>

<style>
  .workspace-actions { display: flex; gap: 6px; padding: 8px 12px; border-top: 1px solid #1e293b; background: #0f172a; flex-wrap: wrap; }
  .action-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; cursor: pointer; white-space: nowrap; }
  .action-btn:hover:not(:disabled) { background: #334155; }
  .action-btn.primary { border-color: #6366f1; color: #c7d2fe; }
  .action-btn.syntax-active { border-color: #22c55e; color: #bbf7d0; }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
