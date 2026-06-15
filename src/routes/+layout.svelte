<script>
  import { page } from '$app/stores';
  import { getAppState } from '$lib/stores/app.svelte.js';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import AIPanel from '$lib/components/ai/AIPanel.svelte';
  import KodexModal from '$lib/components/modals/KodexModal.svelte';
  import LangPopup from '$lib/components/modals/LangPopup.svelte';
  import CheatsheetModal from '$lib/components/modals/CheatsheetModal.svelte';
  import RoadmapModal from '$lib/components/modals/RoadmapModal.svelte';
  import GameModal from '$lib/components/modals/GameModal.svelte';
  import MainContent from '$lib/components/layout/MainContent.svelte';
  import { onMount } from 'svelte';
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import { getExecutionState } from '$lib/stores/execution.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { applySavedLanguage } from '$lib/lib/translate.js';
  import '../app.css';

  const STANDALONE_ROUTES = new Set(['tutorial', 'game', 'git', 'legacy']);

  let { children } = $props();
  let app = $derived(getAppState());
  let ai = getAIState();
  let editor = $derived(getEditorState());
  let exec = $derived(getExecutionState());
  let curr = $derived(getCurriculumState());
  let currentRoute = $derived($page.route.id || '');

  let isStandalone = $derived(STANDALONE_ROUTES.has(currentRoute.replace('/', '')));

  let showKodex = $state(false);
  let showLang = $state(false);
  let showCheatsheet = $state(false);
  let showRoadmap = $state(false);
  let showGame = $state(false);

  function handleModeChange(mode) {
    app.mode = mode;
    curr.lang = mode;
  }

  let pageTransition = $state(1);

  $effect(() => {
    $page.route.id;
    pageTransition = 0;
    requestAnimationFrame(() => { pageTransition = 1; });
  });

  onMount(() => {
    // Apply saved language preference
    applySavedLanguage();

    const handlers = {
      'toggle-kodex': () => showKodex = !showKodex,
      'toggle-lang': () => showLang = !showLang,
      'toggle-cheatsheet': () => showCheatsheet = !showCheatsheet,
      'toggle-roadmap': () => showRoadmap = !showRoadmap,
      'toggle-game': () => showGame = !showGame,
      'toggle-schema': () => { app.mode = 'schema'; },
      'close-all-modals': () => { showKodex = false; showLang = false; showCheatsheet = false; showRoadmap = false; showGame = false; },
    };
    for (const [event, handler] of Object.entries(handlers)) {
      window.addEventListener(event, handler);
    }
    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        window.removeEventListener(event, handler);
      }
    };
  });

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (showKodex || showLang || showCheatsheet || showRoadmap || showGame) {
        window.dispatchEvent(new CustomEvent('close-all-modals'));
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (isStandalone) return;
      e.preventDefault();
      exec.runCode(curr.lang, editor.code);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      ai.togglePanel();
    }
  }</script>

<svelte:window onkeydown={handleKeydown} />

<Header onmodechange={handleModeChange} />
<div class="workspace">
  <Sidebar onmodechange={handleModeChange} />
  <main>
    <div style="opacity: {pageTransition}; transition: opacity 0.2s ease;">
    {#if isStandalone}
      {@render children()}
    {:else}
      <MainContent />
    {/if}
    </div>
  </main>
</div>
<AIPanel />

<KodexModal open={showKodex} onclose={() => showKodex = false} />
<LangPopup open={showLang} onclose={() => showLang = false} />
<CheatsheetModal open={showCheatsheet} onclose={() => showCheatsheet = false} />
<RoadmapModal open={showRoadmap} onclose={() => showRoadmap = false} />
<GameModal open={showGame} onclose={() => showGame = false} />

<style>
  .workspace { display: flex; flex: 1; min-height: 0; overflow: hidden; }
  main { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
</style>
