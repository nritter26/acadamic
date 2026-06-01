<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let curr = $derived(getCurriculumState());

  const levels = [
    { id: 'all', label: 'All' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'expert', label: 'Expert' },
  ];

  const completions = [
    { id: 'all', label: 'All' },
    { id: 'todo', label: 'Todo' },
    { id: 'done', label: 'Done' },
  ];
</script>

<div class="level-filters">
  <div class="filter-group">
    {#each levels as l}
      <button
        class="filter-btn"
        class:active={curr.level === l.id}
        onclick={() => curr.level = l.id}
      >{l.label}</button>
    {/each}
  </div>
  <div class="filter-group">
    {#each completions as c}
      <button
        class="filter-btn"
        class:active={curr.completionFilter === c.id}
        onclick={() => curr.completionFilter = c.id}
      >{c.label}</button>
    {/each}
  </div>
</div>

<style>
  .level-filters { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
  .filter-group { display: flex; gap: 2px; }
  .filter-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 2px 8px; font-size: 10px; border-radius: 3px; cursor: pointer; }
  .filter-btn.active { background: #334155; color: #e2e8f0; border-color: #475569; }
  .filter-btn:hover { background: #1e293b; }
</style>
