<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import TopicList from '$lib/components/curriculum/TopicList.svelte';
  import Explanation from '$lib/components/workspace/Explanation.svelte';
  import CodeEditor from '$lib/components/workspace/CodeEditor.svelte';
  import Console from '$lib/components/workspace/Console.svelte';
  import WorkspaceActions from '$lib/components/workspace/WorkspaceActions.svelte';

  let curr = $derived(getCurriculumState());
  let lang = $derived($page.params.lang);

  onMount(async () => {
    curr.lang = lang;
    await curr.loadLangData(lang);
  });
</script>

<div class="curriculum-layout">
  <div class="col col-curriculum">
    <TopicList />
  </div>
  <div class="col col-theory">
    <Explanation />
  </div>
  <div class="col col-workspace">
    <CodeEditor />
    <WorkspaceActions />
  </div>
  <div class="col col-console">
    <Console />
  </div>
</div>

<style>
  .curriculum-layout { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; flex: 1; overflow: hidden; gap: 1px; background: #1e293b; }
  .col { overflow-y: auto; background: #0f172a; display: flex; flex-direction: column; min-height: 0; }
  .col-curriculum { border-right: 1px solid #1e293b; }
  .col-theory { border-right: 1px solid #1e293b; }
  .col-workspace { border-right: 1px solid #1e293b; }
</style>
