<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getProgressState } from '$lib/stores/progress.svelte.js';
  import LevelFilter from './LevelFilter.svelte';
  import TopicSearch from './TopicSearch.svelte';
  import EngineFilter from './EngineFilter.svelte';
  import PhaseHeader from './PhaseHeader.svelte';
  import TopicButton from './TopicButton.svelte';

  let curr = $derived(getCurriculumState());
  let prog = $derived(getProgressState());
  let searchQuery = $state('');

  let dataKey = $derived(curr.lang === 'gamedev' && curr.engineFilter !== 'all' ? curr.engineFilter : curr.lang);
  let data = $derived(curr.topicData?.[dataKey] || {});

  let filteredPhases = $derived.by(() => {
    return Object.entries(data).map(([phaseName, topics]) => {
      const entries = Object.keys(topics);
      const third = Math.ceil(entries.length / 3);

      const topicList = entries.map((topicName, i) => {
        let lvl;
        if (i < third) lvl = 'beginner';
        else if (i < third * 2) lvl = 'intermediate';
        else lvl = 'expert';
        return { name: topicName, level: lvl };
      });

      const filtered = topicList.filter(t => {
        if (curr.level !== 'all' && t.level !== curr.level) return false;
        if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (curr.completionFilter === 'done' && !prog.isCompleted(curr.lang, t.name)) return false;
        if (curr.completionFilter === 'todo' && prog.isCompleted(curr.lang, t.name)) return false;
        return true;
      });

      return { phaseName, topics: filtered };
    }).filter(p => p.topics.length > 0);
  });

  function toggleRoadmap() {
    window.dispatchEvent(new CustomEvent('toggle-roadmap'));
  }
</script>

<div class="topic-list-header">
  <label>Curriculum</label>
  <div class="tl-actions">
    <button class="tl-btn" onclick={() => curr.collapseAllPhases()} title="Collapse all phases">▲</button>
    <button class="tl-btn" onclick={() => curr.expandAllPhases()} title="Expand all phases">▼</button>
  </div>
</div>
<div class="topic-list-toolbar">
  <button class="roadmap-btn" onclick={toggleRoadmap}>Roadmap</button>
  <TopicSearch bind:searchQuery />
</div>
<LevelFilter />
{#if curr.lang === 'gamedev'}
  <EngineFilter />
{/if}
<div class="topic-list">
  {#each filteredPhases as { phaseName, topics }}
    <PhaseHeader phase={phaseName} topics={topics.map(t => t.name)} phaseKey={phaseName} />
    <div class="phase-topics" class:hidden={curr.collapsedPhases.has(phaseName)}>
      {#each topics as { name, level }}
        <TopicButton topic={name} phase={phaseName} {level} isCollapsed={curr.collapsedPhases.has(phaseName)} />
      {/each}
    </div>
  {/each}
</div>

<style>
  .topic-list-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; font-size: 11px; font-weight: 700; color: #94a3b8; border-bottom: 1px solid #1e293b; }
  .tl-actions { display: flex; gap: 2px; }
  .tl-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 2px 6px; font-size: 8px; }
  .tl-btn:hover { color: #e2e8f0; }
  .topic-list-toolbar { display: flex; gap: 4px; padding: 6px 8px; }
  .roadmap-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 2px 8px; font-size: 10px; border-radius: 3px; cursor: pointer; white-space: nowrap; }
  .roadmap-btn:hover { color: #e2e8f0; border-color: #475569; }
  .topic-list { display: flex; flex-direction: column; }
  .phase-topics.hidden { display: none; }
</style>
