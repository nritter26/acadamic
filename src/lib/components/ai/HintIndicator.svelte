<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());
  let visible = $state(false);
  let timer;

  $effect(() => {
    if (ai.sessionState === 'exercising' && ai.editorCode) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        visible = true;
      }, 30000);
    } else {
      visible = false;
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  });

  function askHint() {
    visible = false;
    ai.addMessage('Give me a hint', 'user');
    ai.panelOpen = true;
  }
</script>

{#if visible}
  <button class="hint-indicator" onclick={askHint}>
    Devin: need a hint?
  </button>
{/if}

<style>
  .hint-indicator { position: fixed; bottom: 60px; right: 16px; z-index: 499; background: #f59e0b; color: #0b1120; border: none; border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .hint-indicator:hover { background: #fbbf24; }
</style>
