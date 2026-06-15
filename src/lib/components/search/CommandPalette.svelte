<script>
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { search, buildSearchIndex, isSearchReady } from '$lib/lib/search.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { onMount } from 'svelte';

  let open = $state(false);
  let query = $state('');
  let results = $state([]);
  let selectedIndex = $state(0);

  let curr = $derived(getCurriculumState());
  let app = $derived(getAppState());

  onMount(() => {
    buildSearchIndex();
  });

  function handleInput(e) {
    query = e.target.value;
    results = search(query);
    selectedIndex = 0;
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      selectResult(results[selectedIndex]);
    }
  }

  function selectResult(item) {
    curr.lang = item.lang;
    curr.phase = item.phase;
    curr.topic = item.topic;
    curr.loadLangData(item.lang);
    app.mode = item.lang;
    open = false;
    query = '';
    results = [];
  }

  function handleGlobalKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      open = true;
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<Dialog.Root bind:open>
  <Dialog.Content class="top-[15%] translate-y-0 max-w-lg">
    <div class="flex items-center gap-2 p-2 border-b border-[#1e293b]">
      <svg class="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        class="flex-1 bg-transparent border-none outline-none text-sm text-[#e2e8f0] placeholder:text-[#64748b]"
        placeholder="Search topics, phases, languages..."
        {value}={query}
        oninput={handleInput}
        onkeydown={handleKeydown}
        autofocus
      />
      <kbd class="text-[10px] text-[#64748b] border border-[#334155] rounded px-1.5 py-0.5">ESC</kbd>
    </div>
    <div class="max-h-80 overflow-y-auto p-2">
      {#if !isSearchReady()}
        <p class="text-xs text-[#64748b] p-2">Building search index...</p>
      {:else if results.length === 0 && query}
        <p class="text-xs text-[#64748b] p-2">No results for "{query}"</p>
      {:else if results.length === 0}
        <p class="text-xs text-[#64748b] p-2">Start typing to search curriculum topics</p>
      {:else}
        {#each results as item, i}
          <button
            class="w-full text-left px-3 py-2 rounded text-xs flex items-center gap-2"
            class:bg-[#1e293b]={i === selectedIndex}
            onmouseenter={() => selectedIndex = i}
            onclick={() => selectResult(item)}
          >
            <span class="font-semibold text-[#e2e8f0]">{item.topic}</span>
            <span class="text-[#64748b]">in {item.phase}</span>
            <span class="ml-auto text-[10px] uppercase px-1 rounded bg-[#334155] text-[#94a3b8]">{item.lang}</span>
          </button>
        {/each}
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
