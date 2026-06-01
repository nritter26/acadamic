<script>
  import { getAppState } from '$lib/stores/app.svelte.js';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import AIPanel from '$lib/components/ai/AIPanel.svelte';
  import { goto } from '$app/navigation';
  import '../app.css';

  let { children } = $props();
  let app = $derived(getAppState());

  function handleModeChange(mode) {
    const route = mode === 'js' ? '/' : `/${mode}`;
    goto(route);
  }
</script>

<Header onmodechange={handleModeChange} />
<div class="workspace">
  <Sidebar onmodechange={handleModeChange} />
  <main>
    {@render children()}
  </main>
</div>
<AIPanel />

<style>
  .workspace { display: flex; flex: 1; overflow: hidden; }
  main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
</style>
