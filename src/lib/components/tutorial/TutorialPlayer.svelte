<script>
  import { onMount } from 'svelte';
  import { TUTORIAL_COURSES, getCourseById, getPhaseById } from '$lib/lib/tutorial.js';
  import { getTutorialState } from '$lib/stores/tutorial.svelte.js';
  import MiniEditor from './MiniEditor.svelte';
  import TutorialQuizOverlay from './TutorialQuizOverlay.svelte';
  import TutorialShortcuts from './TutorialShortcuts.svelte';
  import ExerciseGroup from './ExerciseGroup.svelte';
  import { getGamificationState, awardTopicXp, awardPhaseXp, checkStreak } from '$lib/stores/tutorial-gamification.svelte.js';

  let tutorial = $derived(getTutorialState());
  let currentCourse = $derived(getCourseById(tutorial.state.currentCourse, TUTORIAL_COURSES));
  let currentPhase = $derived(currentCourse ? getPhaseById(currentCourse, tutorial.state.currentPhase) : null);
  let topicName = $derived(currentPhase?.topics[tutorial.state.currentTopic] || '');
  let topicData = $state(null);
  let topicLoading = $state(false);
  let editMode = $state(false);
  let editableCode = $state('');
  let running = $state(false);
  let runOutput = $state('');
  let showOutput = $state(false);
  let showCelebration = $state(false);
  let xpToast = $state(null);
  let xpToastTimer = $state(null);
  let loadingTopic = false;

  function showXpToast(amount) {
    xpToast = { amount };
    if (xpToastTimer) clearTimeout(xpToastTimer);
    xpToastTimer = setTimeout(() => { xpToast = null; xpToastTimer = null; }, 2000);
  }

  async function handleRun() {
    if (!topicData || running) return;
    running = true;
    runOutput = '';
    showOutput = true;
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: currentCourse?.lang || 'js', code: editableCode || '' }),
      });
      const data = await res.json();
      runOutput = data.error || data.output || '(no output)';
    } catch (e) {
      runOutput = `Error: ${e.message}`;
    } finally {
      running = false;
    }
  }

  onMount(() => {
    checkStreak();
  });

  $effect(() => {
    if (!currentCourse || !currentPhase || !topicName) return;
    if (loadingTopic) return;
    loadTopicContent();
  });

  async function loadTopicContent() {
    loadingTopic = true;
    topicLoading = true;
    runOutput = '';
    showOutput = false;
    try {
      const res = await fetch(`/content/${currentCourse.lang}.json`);
      const data = await res.json();
      if (data[currentPhase.title] && data[currentPhase.title][topicName]) {
        topicData = data[currentPhase.title][topicName];
        editableCode = topicData[1] || '';
      } else {
        topicData = null;
      }
    } catch (e) {
      topicData = null;
    } finally {
      topicLoading = false;
      loadingTopic = false;
    }
  }

  function handleNext() {
    if (topicName && currentCourse) {
      awardTopicXp(currentCourse.id, topicName);
      showXpToast(10);
      tutorial.completeTopic(currentCourse.id, topicName);
    }
    if (isLastTopicInPhase() && currentPhase) {
      showCelebration = true;
      setTimeout(() => showCelebration = false, 3000);
    }
    if (currentPhase && tutorial.state.currentTopic < currentPhase.topics.length - 1) {
      tutorial.nextTopic(currentPhase.topics.length);
    } else {
      openQuiz();
    }
    editMode = false;
  }

  function handlePrevious() {
    tutorial.previousTopic();
    editMode = false;
  }

  function handleTopicClick(phaseId, topicIndex) {
    tutorial.setPhase(phaseId);
    tutorial.setTopic(topicIndex);
    editMode = false;
  }

  let showQuiz = $state(false);

  function openQuiz() {
    if (currentCourse && currentPhase) {
      showQuiz = true;
    }
  }

  function handleQuizComplete(phaseId, score) {
    tutorial.saveQuizScore(phaseId, score);
    if (score >= 60) {
      awardPhaseXp();
      showXpToast(50);
      tutorial.completePhase(phaseId);
    }
    showQuiz = false;
    if (currentCourse) {
      const phaseIndex = currentCourse.phases.findIndex(p => p.id === phaseId);
      if (phaseIndex >= 0 && phaseIndex < currentCourse.phases.length - 1) {
        const nextPhase = currentCourse.phases[phaseIndex + 1];
        tutorial.setPhase(nextPhase.id);
        tutorial.setTopic(0);
      }
    }
  }

  function isLastTopicInPhase() {
    return currentPhase && tutorial.state.currentTopic >= currentPhase.topics.length - 1;
  }
</script>

<div class="tutorial-player">
  {#if !tutorial.state.currentCourse}
    <div class="course-select">
      <div class="eyebrow">Guided Path</div>
      <h1>Learn Code</h1>
      <p>Choose a language to start learning. Follow structured lessons with live code editing and checkpoint quizzes.</p>
      <div class="course-grid">
        {#each TUTORIAL_COURSES as course}
          <button class="course-btn" onclick={() => { tutorial.setCourse(course.id); tutorial.setPhase(course.phases[0].id); tutorial.setTopic(0); }}>
            <img class="course-btn-icon" src={course.icon} alt={course.title} onerror={e => e.target.style.display = 'none'}>
            <span class="course-btn-title">{course.title}</span>
            <span class="course-btn-desc">{course.phases.length} phases</span>
          </button>
        {/each}
      </div>
    </div>
  {:else if topicLoading}
    <div class="loading">Loading lesson...</div>
  {:else if topicData}
{#key topicName}
    <div class="lesson-view">
      <div class="lesson-header">
        <div class="lesson-breadcrumb">
          <button class="bc-btn" onclick={() => tutorial.setCourse(null)}>Courses</button>
          <span class="bc-sep">›</span>
          <span>{currentPhase?.title}</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">{topicName}</span>
        </div>
        <div class="lesson-progress">Topic {tutorial.state.currentTopic + 1} of {currentPhase?.topics.length || 0}</div>
        <div class="lesson-gamification">
          <span class="gamification-xp">🔥 {getGamificationState().xp} XP</span>
          {#if getGamificationState().streak > 0}
            <span class="gamification-streak">⚡ {getGamificationState().streak} day streak</span>
          {/if}
        </div>
      </div>

      <div class="lesson-body">
        <div class="lesson-explanation">
          <p>{topicData[0]}</p>
        </div>

        <div class="lesson-code">
          <div class="code-left">
            <div class="code-header">
              <span class="code-lang">JavaScript</span>
              <div class="code-actions">
                <button class="ca-btn-run" onclick={handleRun} disabled={running}>
                  {running ? '⏳ Running...' : '▶ Run'}
                </button>
                <button class="ca-btn" onclick={() => { editMode = !editMode; runOutput = ''; showOutput = false; }}>
                  {editMode ? 'View Only' : 'Edit Code'}
                </button>
                <button class="ca-btn" onclick={() => window.dispatchEvent(new CustomEvent('toggle-cheatsheet'))}>Cheatsheet</button>
              </div>
            </div>
            {#if editMode}
              <MiniEditor bind:value={editableCode} />
            {:else}
              <pre class="code-display"><code>{editableCode || ''}</code></pre>
            {/if}
          </div>
          <div class="code-right">
            <div class="code-output-header">
              <span>Output</span>
              <button class="ca-btn" onclick={() => showOutput = false}>✕</button>
            </div>
            <pre class="code-output-text" class:is-error={String(runOutput ?? '').startsWith('Error')} class:code-output-empty={!showOutput}>{showOutput ? runOutput : 'Click ▶ Run to execute this code'}</pre>
          </div>
        </div>
      </div>

      {#if showCelebration}
        <div class="celebration" onclick={() => showCelebration = false}>
          <div class="celebration-icon">🎉</div>
          <div class="celebration-text">
            <strong>Phase Complete!</strong>
            <span>{currentPhase?.title} — ready for the next phase</span>
          </div>
        </div>
      {/if}

      {#if topicData[2] && topicData[2].length > 0}
        <ExerciseGroup exercises={topicData[2]} />
      {/if}

      <div class="lesson-footer">
        <button class="nav-btn" onclick={handlePrevious} disabled={tutorial.state.currentTopic === 0}>
          ← Previous
        </button>
        <div class="nav-center">
          <button
            class="complete-btn"
            onclick={() => { tutorial.completeTopic(currentCourse.id, topicName); }}
            disabled={tutorial.state.completedTopics.includes(`${currentCourse.id}:${topicName}`)}
          >
            {tutorial.state.completedTopics.includes(`${currentCourse.id}:${topicName}`) ? '✅ Completed' : 'Mark Complete'}
          </button>
          {#if isLastTopicInPhase()}
            <button class="quiz-btn" onclick={openQuiz}>Phase Quiz ▶</button>
          {/if}
        </div>
        <button class="nav-btn" onclick={handleNext}>
          {isLastTopicInPhase() ? 'Finish Phase' : 'Next →'}
        </button>
      </div>

      {#if xpToast}
        <div class="xp-toast" aria-live="polite">+{xpToast.amount} XP</div>
      {/if}
    </div>
  {/key}
    <TutorialShortcuts
      onprev={handlePrevious}
      onnext={handleNext}
      onrun={handleRun}
      onmark={() => { if (currentCourse && topicName) tutorial.completeTopic(currentCourse.id, topicName); }}
      enabled={!!topicData}
    />
  {:else}
    <div class="error">Topic content not found. <button onclick={loadTopicContent}>Retry</button></div>
  {/if}
</div>

<TutorialQuizOverlay
  open={showQuiz}
  courseId={currentCourse?.id}
  phaseId={currentCourse?.id ? tutorial.state.currentPhase : null}
  oncomplete={handleQuizComplete}
  onclose={() => showQuiz = false}
/>

<style>
  .tutorial-player { height: 100%; overflow: auto; background: linear-gradient(135deg, #111827, #431407); color: #e2e8f0; padding: clamp(48px, 8vw, 96px); box-sizing: border-box; }
  .eyebrow { color: #fb923c; font-size: 16px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
  h1 { margin: 16px 0 20px; font-size: clamp(72px, 12vw, 140px); line-height: 0.85; }
  .course-select p { max-width: 800px; color: #fed7aa; font-size: 20px; line-height: 1.7; margin-bottom: 40px; }
  .course-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
  .course-btn { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 36px; background: rgba(15,23,42,0.72); border: 1px solid rgba(251,146,60,0.35); border-radius: 24px; cursor: pointer; color: #e2e8f0; transition: border-color 0.15s, transform 0.15s; }
  .course-btn:hover { border-color: #f97316; transform: translateY(-4px); box-shadow: 0 8px 32px rgba(249,115,22,0.1); }
  .course-btn-icon { width: 64px; height: 64px; object-fit: contain; }
  .course-btn-title { font-size: 24px; font-weight: 700; }
  .course-btn-desc { font-size: 15px; color: #94a3b8; }
  .loading { padding: 80px; text-align: center; color: #64748b; font-size: 20px; }
  .error { padding: 80px; text-align: center; color: #ef4444; font-size: 18px; }
  .error button { margin-left: 16px; padding: 10px 20px; background: #f97316; border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 16px; }
  .lesson-header { margin-bottom: 32px; }
  .lesson-breadcrumb { font-size: 16px; color: #94a3b8; margin-bottom: 8px; }
  .bc-btn { background: none; border: none; color: #f97316; cursor: pointer; padding: 0; font-size: 16px; }
  .bc-btn:hover { text-decoration: underline; }
  .bc-sep { margin: 0 10px; color: #475569; }
  .bc-current { color: #e2e8f0; }
  .lesson-progress { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .lesson-body { display: flex; flex-direction: column; gap: 28px; }
  .lesson-explanation { padding: 32px; border: 1px solid rgba(251,146,60,0.3); border-radius: 20px; background: rgba(15,23,42,0.6); font-size: 18px; line-height: 1.8; color: #cbd5e1; }
  .lesson-code { display: flex; flex-direction: row; border: 1px solid #334155; border-radius: 16px; overflow: hidden; min-height: 200px; }
  .code-left { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .code-right { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; border-left: 1px solid #334155; background: #0f172a; }
  .code-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #1e293b; border-bottom: 1px solid #334155; }
  .code-lang { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; }
  .code-actions { display: flex; gap: 10px; }
  .ca-btn { padding: 8px 16px; font-size: 13px; font-weight: 600; background: #334155; border: none; border-radius: 6px; color: #94a3b8; cursor: pointer; }
  .ca-btn:hover { background: #475569; color: #e2e8f0; }
  .code-display { padding: 20px; margin: 0; background: #0a0f1e; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 15px; line-height: 1.7; color: #e2e8f0; white-space: pre; }
  .lesson-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(251,146,60,0.2); }
  .nav-btn { padding: 12px 24px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; color: #e2e8f0; font-weight: 600; cursor: pointer; font-size: 15px; }
  .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .nav-btn:hover:not(:disabled) { background: #334155; }
  .nav-center { display: flex; gap: 14px; }
  .complete-btn { padding: 12px 22px; background: #22c55e; color: #052e16; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 15px; }
  .complete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .quiz-btn { padding: 12px 22px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 15px; }
  .quiz-btn:hover { background: #ea580c; }
  .ca-btn-run { padding: 8px 16px; font-size: 13px; font-weight: 600; background: #f97316; border: none; border-radius: 6px; color: #fff; cursor: pointer; }
  .ca-btn-run:hover:not(:disabled) { background: #ea580c; }
  .ca-btn-run:disabled { opacity: 0.5; cursor: not-allowed; }
  .code-right .code-output-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #334155; flex-shrink: 0; }
  .code-output-text { margin: 0; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6; color: #a5f3fc; white-space: pre-wrap; overflow: auto; flex: 1; }
  .code-output-text.is-error { color: #ef4444; }
  .code-output-empty { color: #475569; font-style: italic; }
  .lesson-view { animation: fadeSlide 0.25s ease; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .celebration { display: flex; align-items: center; gap: 16px; padding: 20px; margin: 16px 0; background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(249,115,22,0.1)); border: 1px solid rgba(34,197,94,0.3); border-radius: 16px; cursor: pointer; animation: fadeSlide 0.3s ease; }
  .celebration-icon { font-size: 32px; }
  .celebration-text { display: flex; flex-direction: column; gap: 2px; }
  .celebration-text strong { font-size: 16px; color: #22c55e; }
  .celebration-text span { font-size: 13px; color: #94a3b8; }
  .lesson-gamification { display: flex; gap: 16px; margin-bottom: 16px; font-size: 13px; }
  .gamification-xp { color: #f97316; font-weight: 700; }
  .gamification-streak { color: #fbbf24; font-weight: 600; }
  .xp-toast { position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #f97316, #fb923c); color: #fff; padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 16px rgba(249,115,22,0.3); z-index: 200; animation: fadeSlide 0.2s ease; pointer-events: none; }
</style>
