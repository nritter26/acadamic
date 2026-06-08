<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import HintIndicator from '$lib/components/ai/HintIndicator.svelte';

  let app = $derived(getAppState());
  let curr = $derived(getCurriculumState());
  let lang = $derived($page.params.lang);

  const LANGUAGE_MODES = ['asm','htmlcss','bash','c','cs','cpp','db','go','java','js','kt','lua','php','py','rb','rs','scala','swift','ts','wasm','zig'];
  const CURRICULUM_MODES = ['cicd', 'gamedev', 'mobile', 'backend'];
  const isCurriculumMode = $derived(LANGUAGE_MODES.includes(lang) || CURRICULUM_MODES.includes(lang));

  onMount(() => {
    app.mode = lang;
    curr.lang = lang;
    if (isCurriculumMode) {
      curr.loadLangData(lang);
    }
  });
</script>

<HintIndicator />
