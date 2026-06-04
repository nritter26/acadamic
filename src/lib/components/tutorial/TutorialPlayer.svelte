<script>
  import { TUTORIAL_COURSES, getCourseById, getPhaseById } from '$lib/lib/tutorial.js';
  import { getTutorialState } from '$lib/stores/tutorial.svelte.js';
  import MiniEditor from './MiniEditor.svelte';
  import TutorialQuizOverlay from './TutorialQuizOverlay.svelte';

  let tutorial = $derived(getTutorialState());
  let currentCourse = $derived(getCourseById(tutorial.state.currentCourse, TUTORIAL_COURSES));
  let currentPhase = $derived(currentCourse ? getPhaseById(currentCourse, tutorial.state.currentPhase) : null);
  let topicName = $derived(currentPhase?.topics[tutorial.state.currentTopic] || '');
  let topicData = $state(null);
  let topicLoading = $state(false);
  let editMode = $state(false);
  let editableCode = $state('');

  $effect(() => {
    if (!currentCourse || !currentPhase || !topicName) return;
    loadTopicContent();
  });

  async function loadTopicContent() {
    topicLoading = true;
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
    }
  }

  function handleNext() {
    if (topicName && currentCourse) {
      tutorial.completeTopic(currentCourse.id, topicName);
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

  function openWorkspace() {
    if (!currentCourse || !currentPhase || !topicName) return;
    window.location.href = `/?mode=${currentCourse.lang}`;
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
      </div>

      <div class="lesson-body">
        <div class="lesson-explanation">
          <p>{topicData[0]}</p>
        </div>

        <div class="lesson-code">
          <div class="code-header">
            <span class="code-lang">JavaScript</span>
            <div class="code-actions">
              <button class="ca-btn" onclick={() => editMode = !editMode}>
                {editMode ? 'View Only' : 'Edit Code'}
              </button>
              <button class="ca-btn-workspace" onclick={openWorkspace}>Full Workspace →</button>
            </div>
          </div>
          {#if editMode}
            <MiniEditor bind:value={editableCode} />
          {:else}
            <pre class="code-display"><code>{topicData[1] || ''}</code></pre>
          {/if}
        </div>
      </div>

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
    </div>
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
  .tutorial-player { min-height: 100%; overflow: auto; background: linear-gradient(135deg, #111827, #431407); color: #e2e8f0; padding: clamp(24px, 5vw, 56px); box-sizing: border-box; }
  .eyebrow { color: #fb923c; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
  h1 { margin: 8px 0; font-size: clamp(42px, 9vw, 96px); line-height: 0.9; }
  .course-select p { max-width: 600px; color: #fed7aa; line-height: 1.6; margin-bottom: 24px; }
  .course-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .course-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 20px; background: rgba(15,23,42,0.72); border: 1px solid rgba(251,146,60,0.35); border-radius: 16px; cursor: pointer; color: #e2e8f0; }
  .course-btn:hover { border-color: #f97316; }
  .course-btn-icon { width: 36px; height: 36px; object-fit: contain; }
  .course-btn-title { font-size: 16px; font-weight: 700; }
  .course-btn-desc { font-size: 11px; color: #94a3b8; }
  .loading { padding: 40px; text-align: center; color: #64748b; }
  .error { padding: 40px; text-align: center; color: #ef4444; }
  .error button { margin-left: 8px; padding: 4px 12px; background: #f97316; border: none; border-radius: 4px; color: white; cursor: pointer; }
  .lesson-header { margin-bottom: 16px; }
  .lesson-breadcrumb { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
  .bc-btn { background: none; border: none; color: #f97316; cursor: pointer; padding: 0; font-size: 12px; }
  .bc-btn:hover { text-decoration: underline; }
  .bc-sep { margin: 0 6px; color: #475569; }
  .bc-current { color: #e2e8f0; }
  .lesson-progress { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .lesson-body { display: flex; flex-direction: column; gap: 16px; }
  .lesson-explanation { padding: 16px; border: 1px solid rgba(251,146,60,0.3); border-radius: 12px; background: rgba(15,23,42,0.6); font-size: 14px; line-height: 1.7; color: #cbd5e1; }
  .lesson-code { border: 1px solid #334155; border-radius: 12px; overflow: hidden; }
  .code-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #1e293b; border-bottom: 1px solid #334155; }
  .code-lang { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
  .code-actions { display: flex; gap: 6px; }
  .ca-btn { padding: 3px 10px; font-size: 10px; font-weight: 600; background: #334155; border: none; border-radius: 4px; color: #94a3b8; cursor: pointer; }
  .ca-btn:hover { background: #475569; color: #e2e8f0; }
  .ca-btn-workspace { padding: 3px 10px; font-size: 10px; font-weight: 600; background: #f97316; border: none; border-radius: 4px; color: #fff; cursor: pointer; }
  .ca-btn-workspace:hover { background: #ea580c; }
  .code-display { padding: 12px; margin: 0; background: #0a0f1e; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.5; color: #e2e8f0; white-space: pre; }
  .lesson-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(251,146,60,0.2); }
  .nav-btn { padding: 8px 16px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #e2e8f0; font-weight: 600; cursor: pointer; font-size: 12px; }
  .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .nav-btn:hover:not(:disabled) { background: #334155; }
  .nav-center { display: flex; gap: 8px; }
  .complete-btn { padding: 6px 14px; background: #22c55e; color: #052e16; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 11px; }
  .complete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .quiz-btn { padding: 6px 14px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 11px; }
  .quiz-btn:hover { background: #ea580c; }
</style>
