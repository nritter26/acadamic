<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { apiPost } from '$lib/lib/api.js';

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());
  let hintRevealed = $state(false);
  let checkResult = $state(null);
  let checking = $state(false);
  let generatingPractice = $state(false);
  let recommendedTopics = $state(null);
  let practiceResult = $state(null);

  async function check() {
    if (checking) return;
    checking = true;
    checkResult = null;
    try {
      const res = await apiPost('/api/tutor/attempt-exercise', {
        topic: curr.topic,
        lang: curr.lang,
        code: ai.editorCode,
        learnerId: 'default',
      });
      checkResult = res;
      await handleCheckResult(res);
    } catch {
      checkResult = { error: 'Check failed. Make sure the server is running.', score: 0, attempts: 0, passed: false };
    } finally {
      checking = false;
    }
  }

  async function startExercise() {
    const res = await apiPost('/api/tutor/start-exercise', {
      topic: curr.topic,
      lang: curr.lang,
      learnerId: 'default',
    });
    ai.exercise = res.exercise;
    ai.sessionState = 'exercising';
    checkResult = null;
    hintRevealed = false;
  }

  async function generatePractice() {
    generatingPractice = true;
    practiceResult = null;
    try {
      const res = await apiPost('/api/tutor/start-exercise', {
        topic: curr.topic,
        lang: curr.lang,
        level: 'beginner',
        learnerId: 'default',
      });
      ai.exercise = res.exercise;
      ai.sessionState = 'exercising';
      practiceResult = res;
    } catch {
      practiceResult = { error: 'Failed to generate exercise.' };
    } finally {
      generatingPractice = false;
    }
  }

  async function loadRecommendations() {
    try {
      const r = await fetch(`/api/tutor/recommend?lang=${curr.lang}&learnerId=default`);
      const data = await r.json();
      if (data && data.topic) {
        recommendedTopics = data;
      }
    } catch {}
  }

  async function handleCheckResult(result) {
    if (result.passed) {
      ai.sessionState = 'reviewing';
      await loadRecommendations();
    }
  }
</script>

{#if ai.sessionState === 'idle'}
  <div class="exercise-offer">
    <button class="ex-btn" onclick={generatePractice} disabled={generatingPractice}>
      {generatingPractice ? 'Generating...' : 'Generate practice exercise'}
    </button>
  </div>
{:else if ai.sessionState === 'explaining'}
  <div class="exercise-offer">
    <button class="ex-btn" onclick={startExercise}>Try it yourself</button>
  </div>
{:else if ai.sessionState === 'exercising' && ai.exercise}
  <div class="exercise-box">
    <div class="ex-title">{ai.exercise.title}</div>
    <div class="ex-desc">{ai.exercise.description}</div>
    {#if ai.exercise.starterCode && ai.exercise.starterCode !== '// Write your code here'}
      <pre class="ex-code">{ai.exercise.starterCode}</pre>
    {/if}
    <button class="ex-btn" onclick={check} disabled={checking}>
      {checking ? 'Checking...' : 'Check my solution'}
    </button>
    {#if !hintRevealed}
      <button class="ex-hint-btn" onclick={() => hintRevealed = true}>Give me a hint</button>
    {:else if ai.exercise.hint}
      <div class="ex-hint">{ai.exercise.hint}</div>
    {/if}
    {#if checkResult}
      <div class="ex-result" class:ex-passed={checkResult.passed} class:ex-failed={!checkResult.passed}>
        <div class="ex-score">Score: {checkResult.score ?? '?'}/10</div>
        <div class="ex-attempts">Attempts: {checkResult.attempts}/3</div>
        {#if checkResult.hint}
          <div class="ex-hint">{checkResult.hint}</div>
        {/if}
        {#if checkResult.passed}
          <div class="ex-passed-msg">Great work! You've completed this exercise.</div>
        {:else}
          <div class="ex-failed-msg">Not quite. Try fixing the issues above and check again.</div>
        {/if}
        {#if checkResult.review}
          <div class="ex-review">{checkResult.review}</div>
        {/if}
      </div>
    {/if}
    {#if checkResult?.passed && recommendedTopics}
      <div class="ex-recommend">
        <strong>Recommended next:</strong> {recommendedTopics.topic}
        {#if recommendedTopics.reason}
          <p class="ex-recommend-reason">{recommendedTopics.reason}</p>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .exercise-offer { padding: 12px; border-top: 1px solid #334155; }
  .exercise-box { padding: 12px; border-top: 1px solid #334155; background: #0f172a; }
  .ex-title { font-weight: 700; color: #e2e8f0; font-size: 13px; margin-bottom: 6px; }
  .ex-desc { font-size: 12px; color: #94a3b8; margin-bottom: 8px; line-height: 1.5; }
  .ex-code { background: #0a0f1e; padding: 8px; border-radius: 6px; font-size: 11px; overflow-x: auto; margin-bottom: 8px; }
  .ex-btn { padding: 6px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer; margin-right: 6px; }
  .ex-hint-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 6px 14px; border-radius: 6px; font-size: 11px; cursor: pointer; }
  .ex-hint { margin-top: 8px; padding: 8px; background: #1e293b; border-radius: 6px; font-size: 11px; color: #f59e0b; }
  .ex-result { margin-top: 8px; padding: 8px; background: #1e293b; border-radius: 6px; font-size: 11px; color: #94a3b8; border: 1px solid transparent; }
  .ex-score { font-weight: 700; color: #e2e8f0; }
  .ex-attempts { color: #64748b; }
  .ex-passed { border-color: #22c55e !important; }
  .ex-failed { border-color: #ef4444 !important; }
  .ex-passed-msg { margin-top: 6px; color: #22c55e; font-weight: 700; }
  .ex-failed-msg { margin-top: 6px; color: #f59e0b; font-weight: 600; }
  .ex-review { margin-top: 8px; padding: 8px; background: #0a0f1e; border-radius: 6px; font-size: 11px; color: #94a3b8; white-space: pre-wrap; }
  .ex-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ex-recommend { margin-top: 8px; padding: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; font-size: 11px; color: #22c55e; }
  .ex-recommend-reason { color: #94a3b8; font-size: 10px; margin: 4px 0 0; }
</style>
