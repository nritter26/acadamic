<script>
  import { groupProjectsByDifficulty } from '$lib/lib/projects.js';

  let { projects = [], selectedId = '', language = 'all', onselect = () => {} } = $props();
  let grouped = $derived(groupProjectsByDifficulty(projects, { language }));
</script>

<div class="project-list">
  {#each Object.entries(grouped) as [level, items]}
    {#if items.length > 0}
      <h3>{level}</h3>
      {#each items as project}
        <button class="project-card" class:active={selectedId === project.id} onclick={() => onselect(project)}>
          <span class="title">{project.title}</span>
          <span class="meta">{project.languages?.join(', ')} · {project.steps?.length || 0} steps</span>
          <span class="desc">{project.description}</span>
        </button>
      {/each}
    {/if}
  {/each}
</div>

<style>
  .project-list { padding: 12px; overflow: auto; }
  h3 { color: #e2e8f0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
  .project-card { display: grid; gap: 4px; width: 100%; margin-bottom: 8px; padding: 10px; text-align: left; background: #111827; border: 1px solid #1e293b; border-radius: 8px; color: #cbd5e1; cursor: pointer; }
  .project-card.active, .project-card:hover { border-color: #6366f1; background: #172554; }
  .title { font-weight: 800; color: #e2e8f0; }
  .meta { font-size: 10px; color: #94a3b8; text-transform: uppercase; }
  .desc { font-size: 12px; color: #94a3b8; line-height: 1.4; }
</style>
