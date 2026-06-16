<script>
  import { groupProjectsByDifficulty } from '$lib/lib/projects.js';

  let {
    projects = [],
    selectedId = '',
    language = 'all',
    progress = {},
    loading = { active: false, loaded: 0, total: 0 },
    onselect = () => {},
    onlanguagechange = () => {},
  } = $props();

  let grouped = $derived(groupProjectsByDifficulty(projects, { language: 'all' }));
  let activeLanguage = $derived(language);

  function getLangLogos(langs) {
    if (!langs) return [{ file: 'js', alt: 'JS' }];
    const langFiles = {
      'python': 'py', 'py': 'py',
      'go': 'go',
      'typescript': 'ts', 'ts': 'ts',
      'java': 'java',
      'cs': 'cs',
      'ruby': 'rb', 'rb': 'rb',
      'php': 'php',
      'rust': 'rs', 'rs': 'rs',
      'cpp': 'cpp',
      'c': 'c',
      'zig': 'zig',
      'kt': 'kt', 'kotlin': 'kt',
      'lua': 'lua',
      'swift': 'swift',
      'scala': 'scala',
      'bash': 'bash', 'shell': 'bash',
      'asm': 'asm', 'assembly': 'asm',
      'wasm': 'wasm',
    };
    return langs.map(l => ({
      file: langFiles[l] || 'js',
      alt: (langFiles[l] || 'js').toUpperCase()
    }));
  }

  function getAccent(langs) {
    if (!langs) return '#f1e05a';
    if (langs.includes('go')) return '#00add8';
    if (langs.includes('python') || langs.includes('py')) return '#3572A5';
    if (langs.includes('typescript') || langs.includes('ts')) return '#3178c6';
    if (langs.includes('java')) return '#b07219';
    if (langs.includes('cs')) return '#178600';
    if (langs.includes('ruby') || langs.includes('rb')) return '#701516';
    if (langs.includes('php')) return '#4F5D95';
    if (langs.includes('rust') || langs.includes('rs')) return '#dea584';
    if (langs.includes('cpp')) return '#f34b7d';
    if (langs.includes('c')) return '#555555';
    if (langs.includes('zig')) return '#ec915c';
    if (langs.includes('kt') || langs.includes('kotlin')) return '#A97BFF';
    if (langs.includes('lua')) return '#000080';
    if (langs.includes('swift')) return '#F05138';
    if (langs.includes('scala')) return '#c22d40';
    if (langs.includes('bash') || langs.includes('shell')) return '#89e051';
    if (langs.includes('asm') || langs.includes('assembly')) return '#6E4C13';
    if (langs.includes('wasm')) return '#04133b';
    return '#f1e05a';
  }

  function projectStatus(p) {
    const prog = progress[p.id];
    if (!prog) return '⬜';
    const done = prog.completedSteps?.length || 0;
    const total = p.steps?.length || 0;
    if (done === 0) return '⬜';
    if (done >= total) return '✅';
    return '🔄';
  }

  function projectDone(p) {
    const prog = progress[p.id];
    return prog ? (prog.completedSteps?.length || 0) : 0;
  }

  function projectTotal(p) {
    return p.steps?.length || 0;
  }

  function projectPct(p) {
    const total = projectTotal(p);
    if (total === 0) return 0;
    return Math.round(projectDone(p) / total * 100);
  }
</script>

<div class="project-list">
  {#each Object.entries(grouped) as [level, items]}
    {#if items.length > 0}
      <h3>{level}</h3>
      {#each items as project (project.id)}
        {@const pct = projectPct(project)}
        {@const done = projectDone(project)}
        {@const total = projectTotal(project)}
        {@const status = projectStatus(project)}
        {@const accent = getAccent(project.languages)}
        {@const logos = getLangLogos(project.serverMode ? (project.languages||[]).filter(l => ['js','ts','py','go','java','cs','rb','php','kt','scala'].includes(l)) : (project.languages || ['javascript']))}
        <button
          class="project-card"
          class:active={selectedId === project.id}
          onclick={() => onselect(project)}
        >
          <div class="card-header">
            <span class="card-status">{status}</span>
            <span class="card-title">{project.title}</span>
          </div>
          <div class="card-desc">{(project.description || '').substring(0, 60)}...</div>
          <div class="card-meta">
            <span class="card-logos">
              {#each logos as logo}
                <img class="lang-logo" src="/public/logos/{logo.file}.svg" alt={logo.alt} onerror={e => e.target.style.display = 'none'}>
              {/each}
            </span>
            {#if project.serverMode}
              <span class="proj-badge badge-api">API</span>
            {/if}
            <span class="card-steps">
              <span class="steps-dot" style="background:{accent}"></span>
              {done}/{total} steps
            </span>
          </div>
          <div class="card-bar">
            <div class="card-bar-fill" style="width:{pct}%"></div>
          </div>
        </button>
      {/each}
    {/if}
  {/each}
  {#if loading.active}
    <div class="loading-bar">
      <div class="loading-bar-fill" style="width: {loading.total > 0 ? (loading.loaded / loading.total * 100) : 0}%"></div>
    </div>
    <div class="loading-text">
      <span class="loading-spinner"></span>
      Loading {loading.loaded}{#if loading.total > 0}/{loading.total}{/if} projects…
    </div>
  {/if}
</div>

<div class="lang-toggle">
  <span class="lang-toggle-label">Language:</span>
  <button
    class="lang-toggle-btn"
    class:active={activeLanguage === 'javascript'}
    onclick={() => onlanguagechange('javascript')}
  >JS</button>
  <button
    class="lang-toggle-btn"
    class:active={activeLanguage === 'typescript'}
    onclick={() => onlanguagechange('typescript')}
  >TS</button>
  <button
    class="lang-toggle-btn"
    class:active={activeLanguage === 'python'}
    onclick={() => onlanguagechange('python')}
  >PY</button>
  <button
    class="lang-toggle-btn"
    class:active={activeLanguage === 'go'}
    onclick={() => onlanguagechange('go')}
  >GO</button>
</div>

<style>
  .project-list { flex: 1; overflow-y: auto; padding: 8px; }
  h3 { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin: 8px 0 4px 4px; }
  .project-card { display: grid; gap: 3px; width: 100%; margin-bottom: 6px; padding: 8px; text-align: left; background: #111827; border: 1px solid #1e293b; border-radius: 6px; color: #cbd5e1; cursor: pointer; }
  .project-card.active, .project-card:hover { border-color: #6366f1; background: #172554; }
  .card-header { display: flex; align-items: center; gap: 6px; }
  .card-status { font-size: 12px; line-height: 1; }
  .card-title { font-weight: 700; color: #e2e8f0; font-size: 12px; }
  .card-desc { font-size: 10px; color: #64748b; line-height: 1.3; padding-left: 22px; }
  .card-meta { display: flex; align-items: center; justify-content: space-between; padding-left: 22px; }
  .card-logos { display: flex; gap: 4px; align-items: center; }
  .lang-logo { width: 14px; height: 14px; display: inline-block; object-fit: contain; }
  .card-steps { font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 3px; }
  .steps-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
  .card-bar { height: 3px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .card-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a5b4fc); transition: width 0.3s; border-radius: 999px; }
  .badge-api { background: rgba(6,182,212,0.15); color: #67e8f9; border: 1px solid rgba(6,182,212,0.3); padding: 0 4px; font-size: 8px; font-weight: 800; border-radius: 2px; line-height: 14px; display: inline-block; }

  .loading-bar { height: 2px; background: #1e293b; margin: 0 8px 4px; border-radius: 999px; overflow: hidden; }
  .loading-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a5b4fc); transition: width 0.2s; border-radius: 999px; }
  .loading-text { display: flex; align-items: center; gap: 5px; padding: 2px 8px 6px; font-size: 9px; color: #64748b; }
  .loading-spinner { width: 8px; height: 8px; border: 1.5px solid #334155; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .lang-toggle { display: flex; align-items: center; gap: 4px; padding: 8px; border-top: 1px solid #1e293b; background: #0f172a; }
  .lang-toggle-label { font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-right: 2px; }
  .lang-toggle-btn { padding: 3px 8px; font-size: 10px; font-weight: 700; background: #111827; border: 1px solid #334155; border-radius: 4px; color: #94a3b8; cursor: pointer; }
  .lang-toggle-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }
  .lang-toggle-btn:hover:not(.active) { border-color: #475569; color: #cbd5e1; }
</style>
