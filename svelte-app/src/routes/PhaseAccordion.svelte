<script lang="ts">
  let {
    phaseName = '',
    topics = [] as Array<[string, { exp: string; code?: string }]>,
    selectedTopic = null as string | null,
    onSelect = (_topic: string) => {},
  } = $props();

  let expanded = $state(true);
</script>

<div>
  <button
    onclick={() => expanded = !expanded}
    class="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-200 hover:bg-surface-light/20 transition"
  >
    <span>{phaseName}</span>
    <span class="text-gray-500 text-xs">{expanded ? '▼' : '▶'}</span>
  </button>
  {#if expanded}
    <div class="border-t border-surface-light/20">
      {#each topics as [topicName, _data]}
        <button
          onclick={() => onSelect(topicName)}
          class="w-full text-left px-4 py-1.5 text-sm transition-colors
            {topicName === selectedTopic
              ? 'bg-blue-500/10 text-blue-400 border-l-2 border-l-blue-400'
              : 'text-gray-400 hover:text-gray-200 hover:bg-surface-light/10 border-l-2 border-l-transparent'}"
        >
          {topicName}
        </button>
      {/each}
    </div>
  {/if}
</div>
