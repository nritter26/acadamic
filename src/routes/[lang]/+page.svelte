<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let curr = $derived(getCurriculumState());
  let lang = $derived($page.params.lang);

  onMount(async () => {
    curr.lang = lang;
    await curr.loadLangData(lang);
  });
</script>

<div class="curriculum-layout">
  <div class="col col-curriculum">
    <p style="color:#64748b">Topics for {lang}</p>
  </div>
  <div class="col col-theory">
    <p style="color:#64748b">Theory</p>
  </div>
  <div class="col col-workspace">
    <p style="color:#64748b">Editor</p>
  </div>
  <div class="col col-console">
    <p style="color:#64748b">Console</p>
  </div>
</div>

<style>
  .curriculum-layout { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; flex: 1; overflow: hidden; gap: 1px; background: #1e293b; }
  .col { overflow-y: auto; background: #0f172a; padding: 12px; }
  .col-curriculum { border-right: 1px solid #1e293b; }
  .col-theory { border-right: 1px solid #1e293b; }
</style>
