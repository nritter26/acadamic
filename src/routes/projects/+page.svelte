<script>
  import { onMount } from 'svelte';
  import ProjectList from '$lib/components/projects/ProjectList.svelte';
  import ProjectDetail from '$lib/components/projects/ProjectDetail.svelte';
  import { loadProjectCatalog } from '$lib/lib/projects.js';

  let projects = $state([]);
  let selected = $state(null);
  let language = $state('javascript');
  let loading = $state(true);

  onMount(async () => {
    projects = await loadProjectCatalog(fetch);
    selected = projects[0] || null;
    loading = false;
  });
</script>

<div class="projects-route">
  <aside>
    <div class="toolbar">
      <label>
        Language
        <select bind:value={language}>
          <option value="all">All</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
        </select>
      </label>
    </div>
    {#if loading}
      <p class="loading">Loading projects...</p>
    {:else}
      <ProjectList {projects} selectedId={selected?.id} {language} onselect={(project) => selected = project} />
    {/if}
  </aside>
  <main>
    <ProjectDetail project={selected} {language} />
  </main>
</div>

<style>
  .projects-route { display: grid; grid-template-columns: 360px minmax(0, 1fr); height: 100%; min-height: 0; background: #0f172a; }
  aside { border-right: 1px solid #1e293b; min-height: 0; overflow: auto; }
  main { min-width: 0; min-height: 0; }
  .toolbar { padding: 12px; border-bottom: 1px solid #1e293b; }
  label { display: grid; gap: 5px; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 8px; }
  .loading { color: #64748b; padding: 12px; }
  @media (max-width: 980px) { .projects-route { grid-template-columns: 1fr; grid-template-rows: 320px minmax(0, 1fr); } }
</style>
