<script lang="ts">
  import { onMount } from 'svelte';
  import { contentStore, courses, courseData, contentLoading, loadCourses, loadCourseData } from '../lib/stores/content';
  import { topicStore, setCurrentTopic } from '../lib/stores/topic';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  import Card from '../lib/components/Card.svelte';
  import Badge from '../lib/components/Badge.svelte';
  import PhaseAccordion from './PhaseAccordion.svelte';
  import TopicViewer from './TopicViewer.svelte';

  let courseFilter = $state('');
  let selectedPhase = $state<string | null>(null);
  let selectedTopic = $state<string | null>(null);

  onMount(() => {
    loadCourses();
    setBreadcrumbs([{ label: 'Learn', section: 'learn' }]);
  });

  $effect(() => {
    if ($courses.length > 0 && !$contentStore.currentCourse) {
      loadCourseData($courses[0]);
    }
  });

  let phases = $derived($courseData ? Object.entries($courseData) : []);

  let filteredPhases = $derived(
    phases
      .map(([phaseName, topics]) => ({
        phaseName,
        topics: Object.entries(topics).filter(([topicName]) =>
          !courseFilter || topicName.toLowerCase().includes(courseFilter.toLowerCase())
        ),
      }))
      .filter((p) => p.topics.length > 0)
  );

  function selectTopic(phase: string, topic: string) {
    selectedPhase = phase;
    selectedTopic = topic;
    setCurrentTopic(topic, phase);
    setBreadcrumbs([
      { label: 'Learn', section: 'learn' },
      { label: phase },
      { label: topic },
    ]);
  }
</script>

<div class="h-full flex gap-4">
  <div class="w-80 flex-shrink-0 overflow-y-auto space-y-3">
    <div class="flex items-center gap-2 mb-2">
      <h1 class="text-lg font-bold text-white">Curriculum</h1>
      {#if $contentLoading}
        <Badge variant="info">Loading...</Badge>
      {/if}
    </div>

    <input
      bind:value={courseFilter}
      placeholder="Search topics..."
      class="w-full bg-surface border border-surface-light/50 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-400"
    />

    <select
      bind:value={$contentStore.currentCourse}
      onchange={(e) => loadCourseData(e.currentTarget.value)}
      class="w-full bg-surface border border-surface-light/50 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-400"
    >
      {#each $courses as course}
        <option value={course}>{course}</option>
      {/each}
    </select>

    {#each filteredPhases as { phaseName, topics }}
      <Card padding={false}>
        <PhaseAccordion
          {phaseName}
          {topics}
          selectedTopic={$topicStore.currentTopic}
          onSelect={(topic: string) => selectTopic(phaseName, topic)}
        />
      </Card>
    {/each}
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if selectedTopic && selectedPhase && $courseData}
      <TopicViewer
        phase={selectedPhase}
        topic={selectedTopic}
        data={$courseData[selectedPhase][selectedTopic]}
      />
    {:else}
      <div class="flex items-center justify-center h-full text-gray-500">
        <p>Select a topic to begin learning</p>
      </div>
    {/if}
  </div>
</div>
