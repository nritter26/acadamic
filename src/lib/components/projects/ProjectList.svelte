<script>
  import { groupProjectsByDifficulty } from '$lib/lib/projects.js';

  let {
    projects = [],
    selectedId = '',
    language = 'all',
    progress = {},
    onselect = () => {},
    onlanguagechange = () => {},
  } = $props();

  let grouped = $derived(groupProjectsByDifficulty(projects, { language: 'all' }));
  let activeLanguage = $derived(language);

  function getLangBadge(langs) {
    if (!langs) return '<span class="badge badge-js">JS</span>';
    return langs.map(l => {
      if (l === 'python') return '<span class="badge badge-py"><span class="py-p">P</span><span class="py-y">Y</span></span>';
      if (l === 'go') return '<span class="badge badge-go">GO</span>';
      if (l === 'typescript') return '<span class="badge badge-ts">TS</span>';
      return '<span class="badge badge-js">JS</span>';
    }).join(' ');
  }

  function getAccent(langs) {
    if (!langs) return '#eab308';
    if (langs.includes('go')) return '#06b6d4';
    if (langs.includes('python')) return '#eab308';
    if (langs.includes('typescript')) return '#3b82f6';
    return '#eab308';
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
            <span class="card-badges">{@html getLangBadge(project.serverMode ? (project.languages||[]).filter(l => ['javascript','typescript','python','go'].includes(l)) : (project.languages || ['javascript']))}</span>
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
  .card-badges { display: flex; gap: 2px; }
  .card-steps { font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 3px; }
  .steps-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
  .card-bar { height: 3px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .card-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a5b4fc); transition: width 0.3s; border-radius: 999px; }
  .badge { display: inline-block; padding: 0 4px; font-size: 8px; font-weight: 800; border-radius: 2px; line-height: 14px; }
  .badge-js { background: #eab308; color: #000; }
  .badge-ts { background: #3b82f6; color: #fff; }
  .badge-py { background: #eab308; color: #000; padding: 0 2px; }
  .badge-go { background: #06b6d4; color: #000; }
  .badge-api { background: rgba(6,182,212,0.15); color: #67e8f9; border: 1px solid rgba(6,182,212,0.3); padding: 0 4px; font-size: 8px; font-weight: 800; border-radius: 2px; line-height: 14px; display: inline-block; }
  .py-p { color: #2563eb; font-weight: 800; }
  .py-y { color: #eab308; font-weight: 800; }

  .lang-toggle { display: flex; align-items: center; gap: 4px; padding: 8px; border-top: 1px solid #1e293b; background: #0f172a; }
  .lang-toggle-label { font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-right: 2px; }
  .lang-toggle-btn { padding: 3px 8px; font-size: 10px; font-weight: 700; background: #111827; border: 1px solid #334155; border-radius: 4px; color: #94a3b8; cursor: pointer; }
  .lang-toggle-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }
  .lang-toggle-btn:hover:not(.active) { border-color: #475569; color: #cbd5e1; }
</style>
