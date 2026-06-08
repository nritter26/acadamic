<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { apiPost } from '$lib/lib/api.js';

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());
  let hintRevealed = $state(false);
  let checkResult = $state(null);

  async function check() {
    const res = await apiPost('/api/tutor/attempt-exercise', {
      topic: curr.topic,
      lang: curr.lang,
      code: ai.editorCode,
      learnerId: 'default',
    });
    checkResult = res;
    if (res.passed) {
      ai.sessionState = 'reviewing';
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
</script>

{#if ai.sessionState === 'explaining'}
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
    <button class="ex-btn" onclick={check}>Check my solution</button>
    {#if !hintRevealed}
      <button class="ex-hint-btn" onclick={() => hintRevealed = true}>Give me a hint</button>
    {:else if ai.exercise.hint}
      <div class="ex-hint">{ai.exercise.hint}</div>
    {/if}
    {#if checkResult}
      <div class="ex-result">
        <div class="ex-score">Score: {checkResult.score ?? '?'}/10</div>
        <div class="ex-attempts">Attempts: {checkResult.attempts}</div>
        {#if checkResult.hint}
          <div class="ex-hint">{checkResult.hint}</div>
        {/if}
        {#if checkResult.passed}
          <div class="ex-passed">Great work! You've completed this exercise.</div>
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
  .ex-result { margin-top: 8px; padding: 8px; background: #1e293b; border-radius: 6px; font-size: 11px; color: #94a3b8; }
  .ex-score { font-weight: 700; color: #e2e8f0; }
  .ex-passed { margin-top: 6px; color: #22c55e; font-weight: 700; }
  .ex-attempts { color: #64748b; }
</style>
