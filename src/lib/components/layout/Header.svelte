<script>
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { LANG_NAMES } from '$lib/lib/constants.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getCurrentLang } from '$lib/lib/translate.js';
  import { onMount } from 'svelte';

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
    import('$lib/lib/translate.js').then(mod => {
      const next = mod.toggleLanguage();
      uiLang = next.toUpperCase();
    });
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

<header id="app-header" class="header">
  <div class="header-left">
    <div class="header-title">
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
      <button id="lang-btn" class="kodex-nav-btn lang-btn" onclick={quickToggleLang} oncontextmenu={(e) => { e.preventDefault(); toggleLang(); }} title="Click: quick switch EN/TH • Right-click: open language menu">{uiLang}</button>
    </div>
    <div class="header-extra-tabs">
      {#each EXTRA_TABS as tab}
        <button class="game-nav-btn" onclick={() => handleMode(tab.id)}
          style={tab.color ? `color:${tab.color};border-color:${tab.color}` : ''}>
          {tab.label}
        </button>
      {/each}
    </div>
  </div>
  <div class="cyber-motto">
    <span class="cyber-line"></span>
    <span class="cyber-text">Just code <span class="cyber-dash">&mdash;</span> don't overthink</span>
    <span class="cyber-line"></span>
  </div>
  <button class="hamburger-btn" onclick={() => app.toggleSidebar()}>☰</button>
</header>

<style>
  .header { display: flex; align-items: center; padding: 8px 16px; background: #0f172a; border-bottom: 1px solid #1e293b; gap: 12px; }
  .header-left { display: flex; align-items: center; gap: 12px; flex: 1; }
  .header-title { font-weight: 900; font-size: 22px; display: flex; align-items: center; gap: 8px; color: #e2e8f0; }
  .accent { color: var(--accent, #6366f1); }
  .kodex-nav-btn { background: transparent; border: none; cursor: pointer; padding: 2px; display: inline-flex; align-items: center; }
  .lang-btn { font-size: 11px; font-weight: 800; color: var(--accent, #6366f1); letter-spacing: 0.5px; margin-left: 4px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s; }
  .lang-btn:hover { background: #1e293b; }
  .header-extra-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
  .game-nav-btn { padding: 4px 10px; font-size: 11px; font-weight: 700; background: transparent; border: 1px solid; border-radius: 4px; cursor: pointer; }
  .cyber-motto { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 11px; }
  .cyber-line { flex: 1; height: 1px; background: #334155; width: 60px; }
  .hamburger-btn { display: none; background: none; border: none; color: #e2e8f0; font-size: 22px; cursor: pointer; }
  @media (max-width: 768px) { .hamburger-btn { display: block; } .header-extra-tabs { display: none; } }
</style>
