<script>
  let { onprev = () => {}, onnext = () => {}, onrun = () => {}, onmark = () => {}, onedit = () => {}, enabled = true } = $props();

  let showHelp = $state(false);

  function handleKeydown(e) {
    if (!enabled) return;
    if (e.key === '?') { showHelp = !showHelp; return; }
    if (showHelp && e.key === 'Escape') { showHelp = false; return; }

    if (e.key === 'ArrowLeft' || e.key === 'k') { e.preventDefault(); onprev(); }
    else if (e.key === 'ArrowRight' || e.key === 'j') { e.preventDefault(); onnext(); }
    else if (e.key === 'm') { e.preventDefault(); onmark(); }
    else if (e.key === 'e') { e.preventDefault(); onedit(); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onrun(); }
  }

  $effect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="shortcuts-hint" class:active={showHelp}>
  <button class="shortcuts-toggle" onclick={() => showHelp = !showHelp}>? shortcuts</button>
</div>

{#if showHelp}
  <div class="shortcuts-overlay" onclick={() => showHelp = false} role="dialog" aria-label="Keyboard shortcuts">
    <div class="shortcuts-card" onclick={(e) => e.stopPropagation()}>
      <h3>Keyboard Shortcuts</h3>
      <table>
        <tbody>
          <tr><td><kbd>←</kbd> or <kbd>k</kbd></td><td>Previous topic</td></tr>
          <tr><td><kbd>→</kbd> or <kbd>j</kbd></td><td>Next topic</td></tr>
          <tr><td><kbd>Ctrl</kbd>+<kbd>Enter</kbd></td><td>Run code</td></tr>
          <tr><td><kbd>m</kbd></td><td>Mark complete</td></tr>
          <tr><td><kbd>e</kbd></td><td>Toggle edit mode</td></tr>
          <tr><td><kbd>?</kbd></td><td>Toggle this help</td></tr>
        </tbody>
      </table>
      <button class="shortcuts-close" onclick={() => showHelp = false}>Close</button>
    </div>
  </div>
{/if}

<style>
  .shortcuts-hint { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 50; }
  .shortcuts-toggle { background: #1e293b; border: 1px solid #334155; border-radius: 20px; color: #64748b; font-size: 11px; padding: 6px 14px; cursor: pointer; opacity: 0.6; transition: opacity 0.15s; }
  .shortcuts-toggle:hover { opacity: 1; color: #94a3b8; }
  .shortcuts-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .shortcuts-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px; max-width: 400px; width: 90%; }
  .shortcuts-card h3 { margin: 0 0 20px; font-size: 18px; color: #e2e8f0; }
  .shortcuts-card table { width: 100%; border-collapse: collapse; }
  .shortcuts-card td { padding: 8px 4px; font-size: 13px; color: #cbd5e1; border-bottom: 1px solid #334155; }
  .shortcuts-card td:first-child { white-space: nowrap; color: #f97316; font-weight: 600; width: 40%; }
  .shortcuts-card kbd { background: #0f172a; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; font-family: inherit; font-size: 12px; }
  .shortcuts-close { margin-top: 20px; padding: 8px 20px; background: #f97316; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; }
  .shortcuts-close:hover { background: #ea580c; }
</style>
