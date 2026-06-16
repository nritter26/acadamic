<script>
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { LANG_NAMES } from '$lib/lib/constants.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getCurrentLang, toggleLanguage } from '$lib/lib/translate.js';
  import { onMount } from 'svelte';
  import CommandPalette from '$lib/components/search/CommandPalette.svelte';

  let { onmodechange = () => {} } = $props();
  let app = $derived(getAppState());

  const STANDALONE_TABS = new Set(['tutorial', 'game', 'git', 'legacy']);
  const STANDALONE_ROUTES = new Set(['tutorial', 'game', 'git', 'legacy']);

  const EXTRA_TABS = [
    { id: 'ai', label: 'AI', color: '#22d3ee' },
    { id: 'backend', label: 'Backend', color: '#6366F1' },
    { id: 'cicd', label: 'CI/CD', color: '#e24329' },
    { id: 'debugging', label: 'Debugging', color: '#f59e0b' },
    { id: 'challenge', label: 'Code Lab', color: '#a855f7' },
    { id: 'compiler', label: 'Compiler', color: '#a5f3fc' },
    { id: 'dblab', label: 'DB Lab', color: '#2DD4BF' },
    { id: 'projects', label: 'Projects', color: '#06b6d4' },
    { id: 'gamedev', label: 'GameDev', color: '#10b981' },
    { id: 'game', label: 'Gaming', color: '' },
    { id: 'git', label: 'Git Grounds', color: '#f1502f' },
    { id: 'mobile', label: 'Mobile', color: '#ec4899' },
    { id: 'quiz', label: 'Quiz', color: '#f59e0b' },
    { id: 'tutorial', label: 'Learn Code', color: '#f97316' },
    { id: 'techstack', label: 'Tech Stack', color: '#2DD4BF' },
    { id: 'styling', label: 'Styling Grounds', color: '#a855f7' },
    { id: 'system-design', label: 'System Design', color: '#8b5cf6' },
    { id: 'legacy', label: 'Full Web App', color: '#22c55e' },
  ];

  let uiLang = $state('EN');

  function handleMode(mode) {
    if (STANDALONE_TABS.has(mode)) {
      goto('/' + mode);
    } else {
      const routeId = $page.route.id || '';
      if (STANDALONE_ROUTES.has(routeId.replace('/', ''))) {
        goto('/', { replaceState: true });
      }
      app.mode = mode;
      onmodechange(mode);
    }
  }

  function toggleKodex() {
    window.dispatchEvent(new CustomEvent('toggle-kodex'));
  }

  function toggleLang() {
    window.dispatchEvent(new CustomEvent('toggle-lang'));
  }

  // Quick toggle: click the lang-btn to switch between EN/TH directly
  function quickToggleLang() {
    const next = toggleLanguage();
    uiLang = next.toUpperCase();
  }

  function updateUILang() {
    const lang = getCurrentLang();
    uiLang = lang === 'en' ? 'EN' : 'TH';
  }

  onMount(() => {
    updateUILang();
    window.addEventListener('language-changed', updateUILang);
    return () => window.removeEventListener('language-changed', updateUILang);
  });
</script>

<header id="app-header" class="flex items-center px-4 py-2 bg-[#0f172a] border-b border-[#1e293b] gap-3">
  <div class="flex items-center gap-3 flex-1">
    <div class="font-black text-[22px] flex items-center gap-2 text-[#e2e8f0] flex-shrink-0 whitespace-nowrap">
      KODEX'S <span class="accent" id="header-title">{LANG_NAMES[app.mode]?.toUpperCase() || app.mode.toUpperCase()}</span>
      <button class="kodex-nav-btn" onclick={toggleKodex} title="About Kodex's Lab">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" width="22" height="22">
          <path d="M8 10 C8 7 10 5 14 5 L26 5 C30 5 32 7 32 10 L32 30 C32 33 30 35 26 35 L14 35 C10 35 8 33 8 30Z" stroke-width="2.5"/>
          <rect x="10" y="18" width="20" height="13" rx="2" stroke-width="2"/>
          <path d="M10 18 L20 14 L30 18" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M10 22 C10 22 16 25 20 25 C24 25 30 22 30 22" stroke-width="1.8" stroke-linecap="round"/>
          <rect x="17" y="22" width="6" height="4" rx="1" stroke-width="1.5"/>
          <path d="M14 5 L12 1" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M26 5 L28 1" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M10 14 C10 14 12 10 20 10 C28 10 30 14 30 14" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
      <a href="https://github.com/nritter26" target="_blank" rel="noopener noreferrer" class="kodex-nav-btn" title="GitHub — nritter26">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>
      <button id="lang-btn" class="kodex-nav-btn lang-btn" onclick={quickToggleLang} oncontextmenu={(e) => { e.preventDefault(); toggleLang(); }} title="Click: quick switch EN/TH • Right-click: open language menu">{uiLang}</button>
      <button class="search-btn" onclick={() => window.dispatchEvent(new CustomEvent('open-search'))} title="Search (Ctrl+K)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
    <div class="flex gap-1 flex-wrap max-md:hidden">
      {#each EXTRA_TABS as tab}
        <button class="px-2.5 py-1 text-[11px] font-bold bg-transparent border rounded cursor-pointer whitespace-nowrap" onclick={() => handleMode(tab.id)}
          style={tab.color ? `color:${tab.color};border-color:${tab.color}` : ''}>
          {tab.label}
        </button>
      {/each}
    </div>
  </div>
  <div class="flex items-center gap-2 text-[#64748b] text-[11px]">
    <span class="h-px bg-[#334155] w-[60px] shrink-0"></span>
    <span class="whitespace-nowrap neon-flash">The right to education is the foundation of a free society</span>
    <span class="h-px bg-[#334155] w-[60px] shrink-0"></span>
  </div>
  <button class="hidden max-md:block bg-none border-none text-[#e2e8f0] text-[22px] cursor-pointer" onclick={() => app.toggleSidebar()}>☰</button>
  <CommandPalette />
</header>

<style>
  .accent { color: var(--accent, #6366f1); }
  .kodex-nav-btn { background: transparent; border: none; cursor: pointer; padding: 2px; display: inline-flex; align-items: center; }
  .lang-btn { font-size: 11px; font-weight: 800; color: var(--accent, #6366f1); letter-spacing: 0.5px; margin-left: 4px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s; }
  .lang-btn:hover { background: #1e293b; }
  .search-btn { background: transparent; border: none; cursor: pointer; color: #64748b; padding: 4px; display: inline-flex; align-items: center; }
  .search-btn:hover { color: #e2e8f0; }

  .neon-flash {
    font-family: 'Orbitron', monospace;
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 1.5px;
    color: #7dd3fc;
    animation: flicker 3s infinite;
    text-shadow:
      0 0 2px #7dd3fc,
      0 0 6px #38bdf8,
      0 0 12px #0284c7;
  }

  @keyframes flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
      opacity: 0.9;
      text-shadow:
        0 0 2px #7dd3fc,
        0 0 6px #38bdf8,
        0 0 12px #0284c7;
    }
    20%, 24%, 55% {
      opacity: 0.5;
      text-shadow:
        0 0 1px #7dd3fc,
        0 0 3px #38bdf8;
    }
  }
</style>
