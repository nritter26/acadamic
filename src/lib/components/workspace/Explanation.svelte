<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { formatInlineCode } from '$lib/lib/syntax.js';

  let curr = $derived(getCurriculumState());
  let editor = $derived(getEditorState());
  let app = $derived(getAppState());
  let dataKey = $derived(curr.lang === 'gamedev' && curr.engineFilter !== 'all' ? curr.engineFilter : curr.lang);
  let data = $derived(curr.topicData?.[dataKey]);
  let item = $derived(data?.[curr.phase]?.[curr.topic]);
  let explanation = $derived(Array.isArray(item) ? item[0] : item?.exp);
  let code = $derived(Array.isArray(item) ? item[1] : item?.code);
  let formatted = $derived(explanation ? formatInlineCode(explanation) : '');

  $effect(() => {
    if (code) editor.code = code;
  });
</script>

<div class="explanation-header">
  <label>Theory</label>
  <div class="theory-actions">
    <button class="ws-toggle-btn" onclick={() => app.toggleWorkspace()} title="Toggle workspace">
      Editor {app.workspaceOpen ? '▾' : '▸'}
    </button>
  </div>
</div>
<div class="explanation">
  {#if item}
    <h3 class="topic-title">{curr.topic}</h3>
    <p class="topic-metadata">{curr.phase}</p>
    <div class="topic-content">{@html formatted}</div>
  {:else}
    <div class="explanation-placeholder">Select a topic to begin learning</div>
  {/if}
</div>

<style>
  .explanation-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; border-bottom: 1px solid #1e293b; }
  .theory-actions { display: flex; gap: 4px; }
  .ws-toggle-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 2px 8px; font-size: 10px; border-radius: 3px; cursor: pointer; }
  .ws-toggle-btn:hover { color: #e2e8f0; }
  .explanation { padding: 16px; height: 100%; overflow-y: auto; box-sizing: border-box; }
  .topic-title { margin: 0 0 4px; color: #e2e8f0; font-size: 16px; }
  .topic-metadata { color: #94a3b8; font-size: 11px; margin: 0 0 12px; }
  .topic-content { font-size: 13px; line-height: 1.7; color: #cbd5e1; white-space: pre-wrap; }
  .topic-content :global(.inline-code) { background: #1e293b; padding: 1px 4px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f472b6; }
  .explanation-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b; font-size: 14px; }
</style>
