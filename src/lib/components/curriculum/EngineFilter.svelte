<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let curr = $derived(getCurriculumState());

  const engines = [
    { id: 'all', label: 'All Engines' },
    { id: 'godot', label: 'Godot' },
    { id: 'unity', label: 'Unity' },
    { id: 'unreal', label: 'Unreal' },
  ];

  function selectEngine(id) {
    curr.engineFilter = id;
    curr.phase = '';
    curr.topic = '';
    if (id === 'all') {
      curr.loadLangData('gamedev');
    } else {
      curr.loadLangData(id);
    }
  }
</script>

<div class="engine-filters">
  {#each engines as e}
    <button
      class="engine-btn"
      class:active={curr.engineFilter === e.id}
      onclick={() => selectEngine(e.id)}
    >{e.label}</button>
  {/each}
</div>

<style>
  .engine-filters { display: flex; gap: 2px; margin-bottom: 8px; }
  .engine-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 2px 8px; font-size: 10px; border-radius: 3px; cursor: pointer; }
  .engine-btn.active { background: #334155; color: #e2e8f0; border-color: #475569; }
  .engine-btn:hover { background: #1e293b; }
</style>
