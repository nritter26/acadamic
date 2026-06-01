<script>
  import { onMount } from 'svelte';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { goto } from '$app/navigation';

  let curr = $derived(getCurriculumState());

  onMount(async () => {
    await curr.loadLangData('js');
    goto('/js');
  });
</script>

<div class="loading-placeholder">Loading Kodex's Lab...</div>

<style>
  .loading-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b; font-size: 16px; }
</style>
