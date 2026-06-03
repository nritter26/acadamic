<script>
  import CodeEditor from '$lib/components/workspace/CodeEditor.svelte';
  import ChallengeTestRunner from './ChallengeTestRunner.svelte';
  import {
    loadChallengeProgress, isChallengeSolved,
    computeDiff, formatDiff, escapeHtml,
    CHALLENGE_LANGS, CHALLENGE_LANG_NAMES
  } from '$lib/lib/challenge.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';

  let editor = $derived(getEditorState());

  let appData = $state(null);
  let challengeData = $state({});
  let loading = $state(true);
  let error = $state('');

  let challengeLang = $state('js');
  let challengeIdx = $state(-1);
  let currentLevel = $state('all');
  let searchQuery = $state('');
  let hintLevel = $state(0);
  let challengeCache = $state({});
  let testResult = $state(null);
  let testRunning = $state(false);

  async function loadAppData() {
    loading = true;
    error = '';
    try {
      const r = await fetch('/content/app-data.json');
      const data = await r.json();
      appData = data;
      challengeData = data.challengeData || {};
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function getChallenges() {
    return challengeData[challengeLang] || [];
  }

  function getFilteredChallenges() {
    const challenges = getChallenges();
    return challenges.filter((ch, i) => {
      if (currentLevel !== 'all' && ch.level !== currentLevel) return false;
      if (searchQuery && !ch.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).map((ch, i) => {
      const realIdx = getChallenges().indexOf(ch);
      return { ...ch, idx: realIdx, solved: isChallengeSolved(challengeLang, realIdx) };
    });
  }

  function showIntro() {
    challengeIdx = -1;
    hintLevel = 0;
    testResult = null;
    editor.code = '// Welcome to Code Lab!\n//\n// Here you can practice coding by solving bite-sized challenges.\n//\n// HOW IT WORKS:\n// 1. Choose a language from the bar above\n// 2. Pick a challenge from the list\n// 3. Fix the buggy code in the editor\n// 4. Click "Run Tests" to check your solution\n//\n// Each challenge has a test — your code passes when the test returns true.\n// Stuck? Click the "Hint" button for clues.\n//\n// Happy coding! 🚀\n\n// Tip: Start by selecting a language above ☝️';
  }

  function switchLang(lang) {
    challengeLang = lang;
    const challenges = getChallenges();
    if (challenges.length === 0) {
      showIntro();
      return;
    }
    challengeIdx = 0;
    loadChallenge(0);
  }

  function loadChallenge(idx) {
    const challenges = getChallenges();
    if (idx < 0 || idx >= challenges.length) return;
    challengeIdx = idx;
    hintLevel = 0;
    testResult = null;
    const ch = challenges[idx];
    editor.code = ch.bug;
  }

  function getCurrentChallenge() {
    const challenges = getChallenges();
    return challengeIdx >= 0 && challengeIdx < challenges.length ? challenges[challengeIdx] : null;
  }

  function resetChallenge() {
    const ch = getCurrentChallenge();
    if (!ch) return;
    editor.code = ch.bug;
    hintLevel = 0;
    testResult = null;
  }

  function showHint() {
    const ch = getCurrentChallenge();
    if (!ch) return;
    if (!challengeCache[challengeLang + '_' + challengeIdx]) {
      challengeCache[challengeLang + '_' + challengeIdx] = {
        diff: computeDiff(ch.bug, ch.solution)
      };
    }
    const cache = challengeCache[challengeLang + '_' + challengeIdx];

    hintLevel++;
    if (hintLevel > 3) hintLevel = 3;

    let html = '<div class="hint-box">';

    if (hintLevel === 1) {
      const changedLines = cache.diff.filter(d => d.status !== 'same');
      const lineNums = [...new Set(changedLines.map(d => d.status === 'added' ? d.lineB + 1 : d.lineA + 1))].sort((a, b) => a - b);
      html += '<div class="hint-label">💡 Hint 1/3 — Conceptual</div>';
      html += `<p>Focus on the core issue. The challenge says: <em>"${escapeHtml(ch.desc)}"</em></p>`;
      if (lineNums.length > 0) {
        html += `<p>Look carefully at line${lineNums.length > 1 ? 's' : ''} <strong>${lineNums.join(', ')}</strong> — that${lineNums.length > 1 ? "'s where the changes need to happen" : "'s where the fix goes"}.</p>`;
      }
    } else if (hintLevel === 2) {
      html += '<div class="hint-label">🔍 Hint 2/3 — Line-Level</div>';
      html += '<p>Here\'s what needs to change (before → after):</p>';
      html += formatDiff(cache.diff);
    } else {
      html += '<div class="hint-label">👁️ Hint 3/3 — Solution Revealed</div>';
      html += '<p>The full solution has been loaded into the editor.</p>';
      html += formatDiff(cache.diff);
      html += '</div>';
      editor.code = ch.solution;
      testResult = { html, type: 'hint' };
      return;
    }

    html += '</div>';
    testResult = { html, type: 'hint' };
  }

  let hintLabel = $derived.by(() => {
    if (hintLevel === 0) return 'Hint (0/3)';
    if (hintLevel < 3) return `Hint (${hintLevel}/3)`;
    return 'Solved';
  });

  let hintDisabled = $derived(challengeIdx < 0 || hintLevel >= 3);

  $effect(() => {
    loadAppData();
  });
</script>

<div class="challenge-layout">
  <aside class="challenge-sidebar">
    <div class="challenge-lang-bar">
      {#each CHALLENGE_LANGS as lang}
        {@const challenges = challengeData[lang] || []}
        {@const progress = loadChallengeProgress()}
        {@const solved = Object.keys(progress).filter(k => k.startsWith(lang + '_')).length}
        <button class="challenge-lang-btn" class:active={challengeLang === lang} onclick={() => switchLang(lang)}>
          <span class="lang-name">{CHALLENGE_LANG_NAMES[lang]}</span>
          <span class="challenge-progress-badge">{solved}/{challenges.length}</span>
        </button>
      {/each}
    </div>
    <div class="challenge-controls-bar">
      <div class="level-filters">
        {#each ['all', 'beginner', 'intermediate', 'expert'] as level}
          {@const challenges = getChallenges()}
          {@const count = level === 'all' ? challenges.length : challenges.filter(c => c.level === level).length}
          {@const solvedCount = level === 'all'
            ? Object.keys(loadChallengeProgress()).filter(k => k.startsWith(challengeLang + '_')).length
            : challenges.filter((c, i) => c.level === level && isChallengeSolved(challengeLang, i)).length}
          <button class="level-btn" class:active={currentLevel === level} onclick={() => currentLevel = level}>
            {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
            <span class="challenge-progress-badge">{solvedCount}/{count}</span>
          </button>
        {/each}
      </div>
      <input class="challenge-search" type="text" placeholder="Search challenges..." bind:value={searchQuery} />
    </div>
    <div class="challenge-list">
      {#if loading}
        <div class="challenge-empty">Loading challenges...</div>
      {:else if error}
        <div class="challenge-empty error">{error}</div>
      {:else}
        <div class="challenge-card" class:active={challengeIdx === -1} onclick={showIntro}>
          <div class="ch-title" style="color:#a855f7;">📖 About Code Lab</div>
          <div class="ch-desc">How challenges work and what you can practice</div>
        </div>
        {@const filtered = getFilteredChallenges()}
        {#if filtered.length === 0}
          <div class="challenge-empty">No challenges match your search</div>
        {:else}
          <div class="challenge-count">{filtered.length} of {getChallenges().length} challenges</div>
          {#each filtered as ch}
            <div class="challenge-card" class:active={ch.idx === challengeIdx} class:solved={ch.solved} onclick={() => loadChallenge(ch.idx)}>
              <div>
                <span class="ch-title">{ch.title}</span>
                <span class="ch-level {ch.level}">{ch.level}</span>
              </div>
              <div class="ch-desc">{ch.desc}</div>
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  </aside>
  <main class="challenge-main">
    {#if challengeIdx >= 0}
      {@const ch = getCurrentChallenge()}
      {#if ch}
        <div class="challenge-header">
          <h3>{ch.title}</h3>
          <span class="ch-level-badge {ch.level}">{ch.level}</span>
          {#if isChallengeSolved(challengeLang, challengeIdx)}
            <span class="solved-badge">✓ Solved</span>
          {/if}
        </div>
        <p class="challenge-desc">{ch.desc}</p>
      {/if}
    {:else}
      <div class="challenge-intro">
        <h2 style="color:#a855f7;margin:0 0 4px 0;font-size:22px;">🧪 Code Lab</h2>
        <p style="color:#94a3b8;font-size:11px;margin:0 0 16px 0;">Practice makes perfect — sharpen your skills with hands-on coding challenges.</p>
        <div class="intro-card">
          <h3>How it works</h3>
          <ol>
            <li><strong>Choose a language</strong> — pick from the language bar on the left</li>
            <li><strong>Pick a challenge</strong> — click any challenge card to load it</li>
            <li><strong>Fix the code</strong> — the editor shows buggy starter code; edit until it works</li>
            <li><strong>Test your fix</strong> — click <strong style="color:#a855f7;">Run Tests</strong> to run the challenge test</li>
            <li><strong>Level up</strong> — complete Beginner → Intermediate → Expert challenges</li>
          </ol>
        </div>
        <div class="intro-card">
          <h3>Features</h3>
          <ul>
            <li>2,100+ challenges across 19 languages</li>
            <li>Three difficulty levels: <span style="color:#22c55e;">Beginner</span> · <span style="color:#f59e0b;">Intermediate</span> · <span style="color:#ef4444;">Expert</span></li>
            <li>Hint system — 3 levels of help when you're stuck</li>
            <li>Progress tracking — see solved vs total per language</li>
            <li>Search — find challenges by keyword</li>
          </ul>
        </div>
      </div>
    {/if}
    <div class="challenge-toolbar">
      <button class="challenge-btn hint-btn" onclick={showHint} disabled={hintDisabled}>{hintLabel}</button>
      <button class="challenge-btn" onclick={resetChallenge} disabled={challengeIdx < 0}>↺ Reset</button>
    </div>
    {#if testResult?.type === 'hint'}
      <div class="challenge-test-output">{@html testResult.html}</div>
    {:else if testResult?.type === 'result'}
      <div class="challenge-test-output">{@html testResult.html}</div>
    {/if}
  </main>
  <section class="challenge-editor-section">
    <CodeEditor />
    {#if challengeIdx >= 0}
      {@const ch = getCurrentChallenge()}
      <ChallengeTestRunner
        {challengeLang}
        challengeIdx={challengeIdx}
        currentChallenge={ch}
        onresult={(r) => testResult = r}
        {hintLevel}
        bind:testRunning
      />
    {/if}
  </section>
</div>

<style>
  .challenge-layout { display: grid; grid-template-columns: 280px 1fr minmax(400px, 1.5fr); height: 100%; background: #0f172a; }
  .challenge-sidebar { display: flex; flex-direction: column; border-right: 1px solid #1e293b; overflow: hidden; }
  .challenge-lang-bar { display: flex; flex-direction: column; overflow-y: auto; border-bottom: 1px solid #1e293b; max-height: 50%; }
  .challenge-lang-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 6px 10px; background: transparent; border: none; border-bottom: 1px solid #0f172a; color: #94a3b8; cursor: pointer; font-size: 10px; text-align: left; }
  .challenge-lang-btn:hover { background: #1e293b; color: #e2e8f0; }
  .challenge-lang-btn.active { color: #a855f7; background: rgba(168,85,247,0.06); font-weight: 600; }
  .lang-name { font-weight: 600; }
  .challenge-progress-badge { font-size: 9px; color: #64748b; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 8px; }
  .challenge-controls-bar { padding: 6px; border-bottom: 1px solid #1e293b; display: flex; flex-direction: column; gap: 4px; }
  .level-filters { display: flex; gap: 2px; }
  .level-btn { font-size: 9px; font-weight: 700; padding: 2px 5px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #94a3b8; cursor: pointer; white-space: nowrap; flex: 1; }
  .level-btn.active { border-color: #a855f7; color: #e2e8f0; background: rgba(0,0,0,0.3); }
  .level-btn:hover:not(.active) { border-color: #475569; color: #cbd5e1; }
  .challenge-search { width: 100%; padding: 4px 6px; font-size: 10px; background: #111827; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; outline: none; box-sizing: border-box; }
  .challenge-search:focus { border-color: #a855f7; }
  .challenge-list { flex: 1; overflow-y: auto; }
  .challenge-card { padding: 8px 10px; border-bottom: 1px solid #0f172a; cursor: pointer; }
  .challenge-card:hover { background: #1e293b; }
  .challenge-card.active { background: rgba(168,85,247,0.06); border-left: 2px solid #a855f7; }
  .challenge-card.solved { opacity: 0.6; }
  .ch-title { font-size: 11px; font-weight: 600; color: #e2e8f0; display: inline; }
  .ch-level { font-size: 8px; font-weight: 700; text-transform: uppercase; margin-left: 6px; padding: 1px 4px; border-radius: 3px; }
  .ch-level.beginner { background: rgba(34,197,94,0.15); color: #22c55e; }
  .ch-level.intermediate { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .ch-level.expert { background: rgba(239,68,68,0.15); color: #ef4444; }
  .ch-desc { font-size: 9px; color: #64748b; margin-top: 2px; }
  .challenge-count { font-size: 9px; color: #64748b; padding: 4px 10px; }
  .challenge-empty { padding: 20px; text-align: center; color: #64748b; font-size: 11px; }
  .challenge-empty.error { color: #ef4444; }

  .challenge-main { display: flex; flex-direction: column; padding: 16px; overflow-y: auto; border-right: 1px solid #1e293b; }
  .challenge-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .challenge-header h3 { margin: 0; font-size: 16px; color: #e2e8f0; }
  .ch-level-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
  .ch-level-badge.beginner { background: rgba(34,197,94,0.15); color: #22c55e; }
  .ch-level-badge.intermediate { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .ch-level-badge.expert { background: rgba(239,68,68,0.15); color: #ef4444; }
  .solved-badge { font-size: 10px; color: #10b981; font-weight: 700; }
  .challenge-desc { color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0; }
  .challenge-intro { overflow-y: auto; }
  .intro-card { background: #1e293b; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
  .intro-card h3 { color: #e2e8f0; margin: 0 0 6px 0; font-size: 12px; }
  .intro-card ol, .intro-card ul { color: #94a3b8; font-size: 10px; margin: 0; padding-left: 16px; line-height: 1.8; }

  .challenge-toolbar { display: flex; gap: 6px; margin-top: 12px; }
  .challenge-btn { padding: 6px 12px; font-size: 10px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #cbd5e1; cursor: pointer; }
  .challenge-btn:hover:not(:disabled) { background: #334155; }
  .challenge-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .hint-btn { border-color: #a855f7; color: #d8b4fe; }
  .hint-btn:disabled:not(.solved) { opacity: 0.5; }

  .challenge-test-output { padding: 8px; margin-top: 8px; background: #1e293b; border-radius: 6px; font-size: 10px; overflow-x: auto; }

  .challenge-editor-section { display: flex; flex-direction: column; min-width: 0; min-height: 0; }

  @media (max-width: 980px) {
    .challenge-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; }
    .challenge-sidebar { max-height: 300px; border-right: none; border-bottom: 1px solid #1e293b; }
    .challenge-lang-bar { flex-direction: row; flex-wrap: wrap; max-height: none; }
    .challenge-lang-btn { width: auto; }
  }
</style>
