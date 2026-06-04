<script>
  let { value = '', onrun = () => {} } = $props();

  let output = $state('');
  let running = $state(false);

  async function handleRun() {
    running = true;
    output = '';
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: 'js', code: value }),
      });
      const data = await res.json();
      output = data.error || data.output || '(no output)';
    } catch (e) {
      output = `Error: ${e.message}`;
    } finally {
      running = false;
    }
  }

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  }
</script>

<div class="mini-editor">
  <div class="me-toolbar">
    <span class="me-lang">JavaScript</span>
    <button class="me-run-btn" onclick={handleRun} disabled={running}>
      {running ? 'Running...' : '▶ Run'}
    </button>
  </div>
  <textarea
    bind:value
    class="me-textarea"
    spellcheck="false"
    onkeydown={handleKeydown}
  ></textarea>
  {#if output}
    <div class="me-output">{output}</div>
  {/if}
</div>

<style>
  .mini-editor { border: 1px solid #334155; border-radius: 8px; overflow: hidden; background: #0a0f1e; margin: 8px 0; }
  .me-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: #1e293b; border-bottom: 1px solid #334155; }
  .me-lang { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .me-run-btn { padding: 3px 10px; font-size: 10px; font-weight: 700; background: #22c55e; color: #052e16; border: none; border-radius: 4px; cursor: pointer; }
  .me-run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .me-run-btn:hover:not(:disabled) { background: #16a34a; }
  .me-textarea { width: 100%; min-height: 100px; padding: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e2e8f0; background: transparent; border: none; resize: vertical; outline: none; tab-size: 2; line-height: 1.5; }
  .me-output { padding: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #a5f3fc; background: #0f172a; border-top: 1px solid #334155; white-space: pre-wrap; max-height: 120px; overflow: auto; }
</style>
