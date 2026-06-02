<script>
  import { onMount } from 'svelte';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let curr = $derived(getCurriculumState());

  onMount(async () => {
    await curr.loadLangData('js');
  });
</script>
