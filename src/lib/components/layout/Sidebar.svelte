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

  function selectLang(lang) {
    curr.lang = lang;
    curr.loadLangData(lang);
    app.mode = lang;
    onmodechange(lang);
  }
</script>

<aside class="sidebar" class:open={app.sidebarOpen}>
  <nav class="selector" aria-label="Language selector">
    {#each LANGUAGES as lang}
      <button
        class:active={curr.lang === lang}
        onclick={() => selectLang(lang)}
        aria-label={LANG_NAMES[lang] || lang}
      >
        {lang === 'htmlcss' ? 'HTML/CSS' : lang.toUpperCase()}
      </button>
    {/each}
  </nav>
</aside>

<style>
  .sidebar { width: 80px; min-width: 80px; background: #0f172a; border-right: 1px solid #1e293b; overflow-y: auto; }
  .selector { display: flex; flex-direction: column; gap: 2px; padding: 8px; }
  .selector button { padding: 6px 4px; font-size: 10px; font-weight: 700; background: transparent; border: none; color: #64748b; cursor: pointer; border-radius: 4px; text-align: center; }
  .selector button:hover { background: #1e293b; color: #e2e8f0; }
  .selector button.active { background: #1e293b; color: var(--accent, #6366f1); }
  @media (max-width: 768px) { .sidebar { display: none; } .sidebar.open { display: block; position: fixed; z-index: 100; height: 100%; } }
</style>
