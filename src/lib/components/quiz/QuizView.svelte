<script>
  const QUIZ_LANG_NAMES = {
    c:'C', cpp:'C++', cs:'C#', js:'JavaScript', ts:'TypeScript', py:'Python',
    go:'Go', rs:'Rust', kt:'Kotlin', swift:'Swift', java:'Java', zig:'Zig',
    scala:'Scala', php:'PHP', rb:'Ruby', bash:'Bash', wasm:'Wasm', asm:'ASM',
    html:'HTML', css:'CSS', git:'Git', pg:'PostgreSQL', mysql:'MySQL',
    sqlite:'SQLite', sql:'SQL', mongodb:'MongoDB', dk:'Docker', firebase:'Firebase',
    gamedev:'GameDev', cloud:'Cloud', aws:'AWS', azure:'Azure', gcp:'GCP',
    backend:'Backend',
  };
  const QUIZ_LANGS = Object.keys(QUIZ_LANG_NAMES);
  const ROUND_SIZE = 10;

  let appData = $state(null);
  let loading = $state(true);
  let quizLang = $state('js');
  let quizLevel = $state('all');
  let quizAnswers = $state({});
  let quizScore = $state({ correct: 0, total: 0 });
  let quizRoundQuestions = $state([]);
  let quizRoundDone = $state(false);
  let quizRoundNum = $state(1);
  let quizLevelCleared = $state({});

  let allQuestions = $derived(appData?.quizData?.[quizLang] || []);
  let filteredQuestions = $derived(
    quizLevel === 'all' ? allQuestions : allQuestions.filter(q => q.level === quizLevel)
  );
  let totalAnswered = $derived(Object.keys(quizAnswers).length);
  let roundAnswered = $derived(quizRoundQuestions.filter(idx => quizAnswers[idx] !== undefined).length);
  let roundProgress = $derived(quizRoundQuestions.length > 0 ? (roundAnswered / quizRoundQuestions.length * 100) : 0);

  let sortedLangs = $derived(
    QUIZ_LANGS.filter(l => appData?.quizData?.[l]?.length > 0)
  );

  async function loadAppData() {
    if (appData) { loading = false; return; }
    try {
      const r = await fetch('/content/app-data.json');
      appData = await r.json();
    } catch (e) { console.error('Failed to load quiz data', e); }
    loading = false;
  }

  function startNewRound() {
    const pool = filteredQuestions;
    if (pool.length === 0) return;
    const indices = [];
    const available = [];
    for (let i = 0; i < allQuestions.length; i++) {
      if (quizAnswers[i] === undefined && (quizLevel === 'all' || allQuestions[i].level === quizLevel)) {
        available.push(i);
      }
    }
    const source = available.length >= ROUND_SIZE ? available : [];
    if (source.length === 0) {
      for (let i = 0; i < allQuestions.length; i++) {
        if (quizLevel === 'all' || allQuestions[i].level === quizLevel) {
          source.push(i);
        }
      }
    }
    const shuffled = source.sort(() => Math.random() - 0.5);
    quizRoundQuestions = shuffled.slice(0, Math.min(ROUND_SIZE, shuffled.length));
    quizRoundDone = false;
  }

  function handleAnswer(qIdx, optIdx) {
    const globalIdx = quizRoundQuestions[qIdx];
    if (globalIdx === undefined || quizAnswers[globalIdx] !== undefined) return;
    quizAnswers[globalIdx] = optIdx;
    quizScore.total++;
    if (optIdx === allQuestions[globalIdx].ans) quizScore.correct++;

    const answeredInRound = quizRoundQuestions.filter(idx => quizAnswers[idx] !== undefined).length;
    if (answeredInRound >= quizRoundQuestions.length) {
      quizRoundDone = true;
      checkLevelCleared();
    }
    quizAnswers = { ...quizAnswers };
  }

  function checkLevelCleared() {
    for (const level of ['beginner', 'intermediate', 'expert']) {
      const key = quizLang + ':' + level;
      if (quizLevelCleared[key]) continue;
      const levelQIds = [];
      for (let i = 0; i < allQuestions.length; i++) {
        if (allQuestions[i].level === level) levelQIds.push(i);
      }
      if (levelQIds.length > 0 && levelQIds.every(idx => quizAnswers[idx] !== undefined)) {
        const correct = levelQIds.filter(idx => quizAnswers[idx] === allQuestions[idx].ans).length;
        quizLevelCleared = { ...quizLevelCleared, [key]: { total: levelQIds.length, correct } };
      }
    }
  }

  function nextRound() {
    quizRoundNum++;
    startNewRound();
  }

  function switchLang(lang) {
    if (lang === quizLang) return;
    quizLang = lang;
    quizRoundNum = 1;
    startNewRound();
  }

  function setLevel(level) {
    if (level === quizLevel) return;
    quizLevel = level;
    quizRoundNum = 1;
    startNewRound();
  }

  function resetQuiz() {
    quizAnswers = {};
    quizScore = { correct: 0, total: 0 };
    quizLevelCleared = {};
    quizRoundNum = 1;
    startNewRound();
  }

  function getLevelCount(level) {
    if (level === 'all') return allQuestions.length;
    return allQuestions.filter(q => q.level === level).length;
  }

  $effect(() => { loadAppData(); });

  $effect(() => {
    if (!loading && allQuestions.length > 0 && quizRoundQuestions.length === 0) {
      startNewRound();
    }
  });
</script>

<div class="quiz-layout">
  <aside class="quiz-sidebar">
    <div class="quiz-lang-bar">
      {#each sortedLangs as lang}
        {@const count = appData?.quizData?.[lang]?.length || 0}
        <button class="quiz-lang-btn" class:active={quizLang === lang} onclick={() => switchLang(lang)}>
          <span class="ql-name">{QUIZ_LANG_NAMES[lang]}</span>
          <span class="ql-count">{count}</span>
        </button>
      {/each}
    </div>
    {#if !loading}
      <div class="quiz-level-bar">
        {#each ['all', 'beginner', 'intermediate', 'expert'] as level}
          {@const cleared = level !== 'all' && quizLevelCleared[quizLang + ':' + level]}
          <button class="ql-btn" class:active={quizLevel === level} onclick={() => setLevel(level)}>
            {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
            ({getLevelCount(level)})
            {#if cleared}🏆{/if}
          </button>
        {/each}
      </div>
      <div class="quiz-stats">
        {#if quizLevelCleared[quizLang + ':beginner']}<div class="quiz-cleared">🏆 Beginner Cleared ({quizLevelCleared[quizLang + ':beginner'].correct}/{quizLevelCleared[quizLang + ':beginner'].total})</div>{/if}
        {#if quizLevelCleared[quizLang + ':intermediate']}<div class="quiz-cleared">🏆 Intermediate Cleared ({quizLevelCleared[quizLang + ':intermediate'].correct}/{quizLevelCleared[quizLang + ':intermediate'].total})</div>{/if}
        {#if quizLevelCleared[quizLang + ':expert']}<div class="quiz-cleared">🏆 Expert Cleared ({quizLevelCleared[quizLang + ':expert'].correct}/{quizLevelCleared[quizLang + ':expert'].total})</div>{/if}
        <div class="quiz-score-bar">
          <span>Score: <strong>{quizScore.correct}/{quizScore.total}</strong></span>
          <span>Total: <strong>{totalAnswered}/{allQuestions.length}</strong></span>
          <button class="quiz-reset-btn" onclick={resetQuiz}>Reset</button>
        </div>
      </div>
    {/if}
  </aside>
  <main class="quiz-main">
    {#if loading}
      <div class="quiz-loading">Loading quiz data...</div>
    {:else if allQuestions.length === 0}
      <div class="quiz-empty">No quiz questions available for this language.</div>
    {:else}
      <div class="quiz-round-header">
        <span class="qr-round">Round {quizRoundNum}</span>
        <span class="qr-progress">{roundAnswered}/{quizRoundQuestions.length} answered</span>
        <div class="qr-track"><div class="qr-bar" style="width:{roundProgress}%"></div></div>
      </div>
      {#if quizRoundDone}
        {@const roundCorrect = quizRoundQuestions.filter(idx => quizAnswers[idx] === allQuestions[idx].ans).length}
        <div class="quiz-round-banner">
          <span class="qrb-pass">Round {quizRoundNum} Complete! {roundCorrect}/{quizRoundQuestions.length} correct</span>
          <button class="qrb-next" onclick={nextRound}>Next Round ▶</button>
        </div>
      {/if}
      {#if quizRoundQuestions.length === 0}
        <div class="quiz-empty">
          {#if totalAnswered >= allQuestions.length}
            All questions completed! Try a different level or language.
          {:else}
            No questions match the selected level. Try a different difficulty.
          {/if}
        </div>
      {:else}
        {#each quizRoundQuestions as globalIdx, i}
          {@const q = allQuestions[globalIdx]}
          {@const sel = quizAnswers[globalIdx]}
          <div class="quiz-card">
            <div class="qc-header">
              <span>Round {quizRoundNum} · Q{i+1}/{quizRoundQuestions.length}</span>
              <span class="qc-level" class:beginner={q.level === 'beginner'} class:intermediate={q.level === 'intermediate'} class:expert={q.level === 'expert'}>{q.level}</span>
            </div>
            <div class="qc-text">{q.q}</div>
            <div class="qc-opts">
              {#each q.opts as opt, j}
                {@const letter = String.fromCharCode(65 + j)}
                <button class="qc-opt"
                  class:correct={sel !== undefined && j === q.ans}
                  class:wrong={sel !== undefined && sel === j && j !== q.ans}
                  onclick={() => handleAnswer(i, j)}
                  disabled={sel !== undefined}>
                  {letter}. {opt}
                </button>
              {/each}
            </div>
            {#if sel !== undefined && sel !== q.ans}
              <div class="qc-explain">Correct answer: <strong>{q.opts[q.ans]}</strong></div>
            {/if}
          </div>
        {/each}
      {/if}
    {/if}
  </main>
</div>

<style>
  .quiz-layout { display: grid; grid-template-columns: 240px 1fr; height: 100%; background: #0f172a; color: #e2e8f0; }
  .quiz-sidebar { display: flex; flex-direction: column; border-right: 1px solid #1e293b; overflow: hidden; }
  .quiz-lang-bar { display: flex; flex-direction: column; overflow-y: auto; border-bottom: 1px solid #1e293b; max-height: 50%; }
  .quiz-lang-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 5px 10px; background: transparent; border: none; border-bottom: 1px solid #0f172a; color: #94a3b8; cursor: pointer; font-size: 10px; text-align: left; }
  .quiz-lang-btn:hover { background: #1e293b; color: #e2e8f0; }
  .quiz-lang-btn.active { color: #f59e0b; background: rgba(245,158,11,0.06); font-weight: 600; }
  .ql-name { font-weight: 600; }
  .ql-count { font-size: 9px; color: #64748b; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 8px; }
  .quiz-level-bar { display: flex; flex-direction: column; padding: 6px; gap: 3px; border-bottom: 1px solid #1e293b; }
  .ql-btn { font-size: 9px; font-weight: 700; padding: 4px 8px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #94a3b8; cursor: pointer; text-align: left; }
  .ql-btn.active { border-color: #f59e0b; color: #e2e8f0; background: rgba(0,0,0,0.3); }
  .ql-btn:hover:not(.active) { border-color: #475569; color: #cbd5e1; }
  .quiz-stats { padding: 8px; overflow-y: auto; flex: 1; }
  .quiz-cleared { font-size: 9px; font-weight: 700; color: #22c55e; padding: 3px 6px; background: rgba(34,197,94,0.1); border-radius: 4px; margin-bottom: 4px; }
  .quiz-score-bar { display: flex; flex-direction: column; gap: 2px; font-size: 10px; color: #64748b; padding-top: 6px; border-top: 1px solid #1e293b; }
  .quiz-score-bar strong { color: #e2e8f0; }
  .quiz-reset-btn { margin-top: 4px; padding: 3px 8px; font-size: 9px; font-weight: 700; background: transparent; border: 1px solid #475569; border-radius: 4px; color: #94a3b8; cursor: pointer; align-self: flex-start; }
  .quiz-reset-btn:hover { background: #1e293b; color: #e2e8f0; }

  .quiz-main { padding: 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 12px; }
  .quiz-loading, .quiz-empty { color: #64748b; font-size: 12px; padding: 30px; text-align: center; }
  .quiz-round-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .qr-round { font-size: 13px; font-weight: 700; color: #f59e0b; }
  .qr-progress { font-size: 10px; color: #64748b; }
  .qr-track { flex: 1; height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden; }
  .qr-bar { height: 100%; background: #f59e0b; border-radius: 2px; transition: width 0.3s; }
  .quiz-round-banner { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; border-radius: 6px; }
  .qrb-pass { font-size: 11px; font-weight: 700; color: #fbbf24; }
  .qrb-next { padding: 6px 14px; font-size: 10px; font-weight: 700; background: #f59e0b; border: none; border-radius: 4px; color: #0f172a; cursor: pointer; }
  .qrb-next:hover { background: #d97706; }

  .quiz-card { background: #1e293b; border-radius: 8px; padding: 14px; }
  .qc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .qc-header span { font-size: 10px; color: #64748b; }
  .qc-level { font-size: 8px; font-weight: 700; text-transform: uppercase; padding: 1px 5px; border-radius: 3px; }
  .qc-level.beginner { background: rgba(34,197,94,0.15); color: #22c55e; }
  .qc-level.intermediate { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .qc-level.expert { background: rgba(239,68,68,0.15); color: #ef4444; }
  .qc-text { font-size: 14px; color: #e2e8f0; margin-bottom: 10px; line-height: 1.5; }
  .qc-opts { display: flex; flex-direction: column; gap: 4px; }
  .qc-opt { display: block; width: 100%; text-align: left; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 5px; color: #cbd5e1; font-size: 12px; cursor: pointer; }
  .qc-opt:hover:not(:disabled) { background: #334155; }
  .qc-opt.correct { background: #166534; border-color: #22c55e; color: #bbf7d0; }
  .qc-opt.wrong { background: #7f1d1d; border-color: #ef4444; color: #fecaca; }
  .qc-opt:disabled { cursor: default; }
  .qc-explain { margin-top: 8px; padding: 6px 10px; font-size: 11px; color: #fca5a5; background: rgba(239,68,68,0.06); border-radius: 4px; }
  .qc-explain strong { color: #fbbf24; }
</style>
