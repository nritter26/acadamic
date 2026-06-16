<script>
  import { computeDiff } from '$lib/lib/diff.js';

  let { originalCode = '', transformedCode = '' } = $props();

  let diff = $derived(computeDiff(originalCode, transformedCode));
  let hasChanges = $derived(diff.some(d => d.type !== 'keep'));
</script>

{#if hasChanges}
  <div class="diff-view">
    <div class="diff-header">Changes</div>
    <div class="diff-lines">
      {#each diff as item, i}
        {#if item.type === 'keep'}
          <div class="diff-line keep"><span class="diff-marker"> </span><code>{item.line}</code></div>
        {:else if item.type === 'add'}
          <div class="diff-line add"><span class="diff-marker">+</span><code>{item.line}</code></div>
        {:else}
          <div class="diff-line remove"><span class="diff-marker">-</span><code>{item.line}</code></div>
        {/if}
      {/each}
    </div>
  </div>
{/if}

<style>
  .diff-view { margin: 8px 0; border: 1px solid #334155; border-radius: 6px; overflow: hidden; }
  .diff-header { padding: 4px 10px; font-size: 10px; font-weight: 700; color: #94a3b8; background: #1e293b; border-bottom: 1px solid #334155; }
  .diff-lines { max-height: 300px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.6; }
  .diff-line { display: flex; align-items: flex-start; padding: 0 8px; }
  .diff-line code { white-space: pre; flex: 1; }
  .diff-marker { width: 16px; flex-shrink: 0; font-weight: 700; }
  .diff-line.keep { color: #94a3b8; }
  .diff-line.add { background: rgba(34, 197, 94, 0.1); color: #bbf7d0; }
  .diff-line.add .diff-marker { color: #22c55e; }
  .diff-line.remove { background: rgba(239, 68, 68, 0.1); color: #fecaca; }
  .diff-line.remove .diff-marker { color: #ef4444; }
</style>
