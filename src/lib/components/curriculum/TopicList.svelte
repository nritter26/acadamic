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

  let data = $derived(curr.topicData?.[curr.lang] || {});

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
</script>

<div class="topic-list">
  <LevelFilter />
  {#if curr.lang === 'gamedev'}
    <EngineFilter />
  {/if}
  <TopicSearch bind:searchQuery />
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
  .topic-list { display: flex; flex-direction: column; }
  .phase-topics.hidden { display: none; }
</style>
