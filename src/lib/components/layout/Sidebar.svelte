<script>
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { LANG_NAMES } from '$lib/lib/constants.js';

  let { onmodechange = () => {} } = $props();
  let app = $derived(getAppState());
  let curr = $derived(getCurriculumState());

  const LANGUAGES = [
    'asm','htmlcss','bash','c','cs','cpp','db','go','java','js','kt',
    'lua','php','py','rb','rs','scala','swift','ts','wasm','zig',
  ];

  let hoveredLang = $state(null);

  function selectLang(lang) {
    curr.lang = lang;
    curr.loadLangData(lang);
    app.mode = lang;
    onmodechange(lang);
  }
</script>

<aside class="w-20 min-w-20 bg-[#0f172a] border-r border-[#1e293b] overflow-y-auto max-md:hidden" class:max-md:block={app.sidebarOpen} class:max-md:fixed={app.sidebarOpen} class:max-md:z-[100]={app.sidebarOpen} class:max-md:h-full={app.sidebarOpen}>
  <nav class="flex flex-col gap-0.5 p-2" aria-label="Language selector">
    {#each LANGUAGES as lang}
      <button
        class="flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-bold bg-transparent border-none text-[#64748b] cursor-pointer rounded text-center hover:bg-[#1e293b] hover:text-[#e2e8f0]"
        class:bg-[#1e293b]={curr.lang === lang}
        class:text-[var(--accent,#6366f1)]={curr.lang === lang}
        onclick={() => selectLang(lang)}
        onmouseenter={() => hoveredLang = lang}
        onmouseleave={() => hoveredLang = null}
        style={hoveredLang === lang ? 'transform: scale(1.05); transition: transform 0.15s;' : ''}
        aria-label={LANG_NAMES[lang] || lang}
      >
        <img class="w-[28px] h-[28px] object-contain" src="/public/logos/{lang}.svg" alt="" onerror={e => e.target.style.display = 'none'}>
        <span class="leading-none">{lang === 'htmlcss' ? 'HTML/CSS' : lang.toUpperCase()}</span>
      </button>
    {/each}
  </nav>
</aside>


