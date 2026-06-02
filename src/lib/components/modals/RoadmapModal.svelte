<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let { open = false, onclose = () => {} } = $props();
  let curr = $derived(getCurriculumState());

  let phases = $derived(Object.keys(curr.topicData?.[curr.lang] || {}));
  const phaseColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316'];
</script>

<Modal {open} {onclose}>
  <h2>Roadmap — {curr.lang.toUpperCase()}</h2>
  {#if phases.length > 0}
    <div class="roadmap">
      {#each phases as phase, i}
        <div class="roadmap-node">
          <div class="roadmap-dot" style="background: {phaseColors[i % phaseColors.length]}"></div>
          <div class="roadmap-label">{phase}</div>
          {#if i < phases.length - 1}
            <div class="roadmap-line"></div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p>Load a language curriculum to see its roadmap.</p>
  {/if}
</Modal>

<style>
  .roadmap { display: flex; flex-direction: column; align-items: flex-start; gap: 0; margin-top: 16px; }
  .roadmap-node { display: flex; align-items: flex-start; gap: 12px; position: relative; }
  .roadmap-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
  .roadmap-label { font-size: 13px; color: #e2e8f0; padding: 0 0 16px; }
  .roadmap-line { width: 2px; height: 24px; background: #334155; position: absolute; left: 6px; top: 16px; }
</style>
