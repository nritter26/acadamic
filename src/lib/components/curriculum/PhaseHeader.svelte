<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getProgressState } from '$lib/stores/progress.svelte.js';

  let { phase, topics = [], phaseKey } = $props();
  let curr = $derived(getCurriculumState());
  let prog = $derived(getProgressState());
  let isCollapsed = $derived(curr.collapsedPhases.has(phaseKey));
  let done = $derived(topics.filter(t => prog.isCompleted(curr.lang, t)).length);
</script>

<button class="phase-header" onclick={() => curr.togglePhase(phaseKey)}>
  <span class="arrow">{isCollapsed ? '▶' : '▼'}</span>
  <span class="phase-name">{phase}</span>
  <span class="count">{done}/{topics.length}</span>
</button>

<style>
  .phase-header { display: flex; align-items: center; gap: 6px; width: 100%; background: #1e293b; border: none; border-bottom: 1px solid #334155; color: #e2e8f0; padding: 6px 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: left; }
  .phase-header:hover { background: #334155; }
  .arrow { font-size: 9px; color: #64748b; }
  .phase-name { flex: 1; }
  .count { font-size: 10px; color: #64748b; font-weight: 400; }
</style>
