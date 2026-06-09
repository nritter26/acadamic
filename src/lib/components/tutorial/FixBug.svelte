<script>
  import { requestHint } from '$lib/lib/tutorial-ai.js';
  import TutorialHelpButton from './TutorialHelpButton.svelte';

  let { exercise, oncomplete = () => {}, lang = 'js' } = $props();

  let topic = $derived(exercise.prompt?.split('\n')[0] || 'programming');

  let userCode = $state(exercise.code);
  let answered = $state(false);
  let correct = $state(false);
  let showHint = $state(false);
  let aiHint = $state('');
  let aiHintLoading = $state(false);
  let aiHintError = $state('');

  $effect(() => {
    userCode = exercise.code;
    answered = false;
    correct = false;
    showHint = false;
    aiHint = '';
    aiHintLoading = false;
    aiHintError = '';
  });

  function handleCheck() {
    if (answered || userCode.trim() === '') return;
    correct = userCode.trim() === exercise.expected.trim();
    answered = true;
    if (correct) {
      oncomplete();
    } else {
      requestAiHint();
    }
  }

  function requestAiHint() {
    aiHintLoading = true;
    const promptText = exercise.hint
      ? `Hint from exercise: ${exercise.hint}\nThe user got it wrong. Give them a helpful hint.`
      : 'The user got this wrong. Give them a helpful hint.';
    requestHint(topic, lang, userCode, promptText,
      (hint) => { aiHint = hint; },
      () => { aiHintLoading = false; },
      (err) => { aiHintError = err; aiHintLoading = false; }
    );
  }
</script>

<div class="exercise-fix">
  <p class="exercise-prompt">{exercise.prompt}</p>
  <textarea class="exercise-textarea" bind:value={userCode} disabled={answered} aria-label={exercise.prompt}></textarea>
  <div class="fix-actions">
    <button class="check-btn" onclick={handleCheck} disabled={answered || userCode.trim() === ''}>
      Check Answer
    </button>
    <button class="hint-btn" onclick={() => showHint = true} disabled={showHint}>
      Show Hint
    </button>
  </div>
  {#if showHint}
    <div class="hint">&#128161; {exercise.hint}</div>
  {/if}
  {#if answered}
    <div class="feedback" class:correct class:wrong={!correct} aria-live="polite">
      {#if correct}
        &#10003; Correct
      {:else}
        &#10007; Not quite
        {#if aiHint}
          <div class="ai-hint">&#128161; {aiHint}</div>
        {:else if aiHintLoading}
          <div class="ai-hint-loading">Generating hint...</div>
        {/if}
        <TutorialHelpButton
          label="Ask Devin for more help"
          topic={topic}
          lang={lang}
          code={userCode}
          context="I got this exercise wrong, can you help me understand why?"
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .exercise-fix { margin: 8px 0; }
  .exercise-prompt { color: #e2e8f0; font-size: 14px; margin: 0 0 12px; line-height: 1.6; }
  .exercise-textarea { display: block; width: 100%; min-height: 120px; padding: 16px; background: #0a0f1e; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.5; resize: vertical; box-sizing: border-box; }
  .exercise-textarea:focus { outline: none; border-color: #f97316; }
  .exercise-textarea:disabled { opacity: 0.6; cursor: default; }
  .fix-actions { display: flex; gap: 8px; margin-top: 12px; }
  .check-btn { padding: 8px 20px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .check-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .check-btn:hover:not(:disabled) { background: #ea580c; }
  .hint-btn { padding: 8px 20px; background: transparent; color: #fbbf24; border: 1px solid #fbbf24; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .hint-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .hint-btn:hover:not(:disabled) { background: rgba(251, 191, 36, 0.1); }
  .hint { margin-top: 12px; padding: 12px; background: #1e293b; border: 1px solid #fbbf24; border-radius: 8px; font-size: 13px; color: #fbbf24; line-height: 1.5; }
  .feedback { margin-top: 12px; padding: 12px; background: #1e293b; border-radius: 8px; font-size: 13px; font-weight: 700; line-height: 1.5; }
  .feedback.correct { color: #22c55e; border: 1px solid #22c55e; }
  .feedback.wrong { color: #ef4444; border: 1px solid #ef4444; }
  .expected-code { display: inline; margin: 0; padding: 2px 6px; background: #0a0f1e; border: 1px solid #334155; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e2e8f0; white-space: pre; }
  .ai-hint { margin-top: 8px; padding: 10px; background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 6px; font-size: 12px; color: #c4b5fd; line-height: 1.5; font-weight: 400; }
  .ai-hint-loading { margin-top: 8px; padding: 10px; font-size: 12px; color: #8b5cf6; font-style: italic; }
</style>
