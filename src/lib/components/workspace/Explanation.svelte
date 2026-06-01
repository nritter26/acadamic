<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import { formatInlineCode } from '$lib/lib/syntax.js';

  let curr = $derived(getCurriculumState());
  let editor = $derived(getEditorState());
  let data = $derived(curr.topicData?.[curr.lang]);
  let item = $derived(data?.[curr.phase]?.[curr.topic]);
  let explanation = $derived(Array.isArray(item) ? item[0] : item?.exp);
  let code = $derived(Array.isArray(item) ? item[1] : item?.code);
  let formatted = $derived(explanation ? formatInlineCode(explanation) : '');

  $effect(() => {
    if (code) editor.code = code;
  });
</script>

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
  .explanation { padding: 16px; height: 100%; overflow-y: auto; box-sizing: border-box; }
  .topic-title { margin: 0 0 4px; color: #e2e8f0; font-size: 16px; }
  .topic-metadata { color: #94a3b8; font-size: 11px; margin: 0 0 12px; }
  .topic-content { font-size: 13px; line-height: 1.7; color: #cbd5e1; white-space: pre-wrap; }
  .topic-content :global(.inline-code) { background: #1e293b; padding: 1px 4px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f472b6; }
  .explanation-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b; font-size: 14px; }
</style>
