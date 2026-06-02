<script>
  import GitGraph from '$lib/components/canvas/GitGraph.svelte';
  import { onMount } from 'svelte';
  import { getAppState } from '$lib/stores/app.svelte.js';

  let app = $derived(getAppState());

  onMount(() => {
    app.workspaceOpen = false;
  });
</script>

<div class="git-route">
  <GitGraph />
</div>

<style>
  .git-route { height: 100%; display: flex; flex-direction: column; background: #0f172a; color: #e2e8f0; }
</style>
