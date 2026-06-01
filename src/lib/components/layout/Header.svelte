<script>
  import { getAppState } from '$lib/stores/app.svelte.js';
  import { LANG_NAMES } from '$lib/lib/constants.js';

  let { onmodechange = () => {} } = $props();
  let app = $derived(getAppState());

  const EXTRA_TABS = [
    { id: 'backend', label: 'Backend', color: '#6366F1' },
    { id: 'cicd', label: 'CI/CD', color: '#e24329' },
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
  ];

  function handleMode(mode) {
    app.mode = mode;
    onmodechange(mode);
  }
</script>

<header id="app-header" class="header">
  <div class="header-left">
    <div class="header-title">
      KODEX'S <span class="accent" id="header-title">{LANG_NAMES[app.mode]?.toUpperCase() || app.mode.toUpperCase()}</span>
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
  .header-extra-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
  .game-nav-btn { padding: 4px 10px; font-size: 11px; font-weight: 700; background: transparent; border: 1px solid; border-radius: 4px; cursor: pointer; }
  .cyber-motto { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 11px; }
  .cyber-line { flex: 1; height: 1px; background: #334155; width: 60px; }
  .hamburger-btn { display: none; background: none; border: none; color: #e2e8f0; font-size: 22px; cursor: pointer; }
  @media (max-width: 768px) { .hamburger-btn { display: block; } .header-extra-tabs { display: none; } }
</style>
