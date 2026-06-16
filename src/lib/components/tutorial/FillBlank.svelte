<script>
  import { requestHint } from '$lib/lib/tutorial-ai.js';
  import TutorialHelpButton from './TutorialHelpButton.svelte';

  let { exercise, oncomplete = () => {}, lang = 'js' } = $props();

  let topic = $derived(exercise.prompt?.split('\n')[0] || 'programming');
  let userCode = $state(exercise.code);
  let answered = $state(false);
  let correct = $state(false);
  let aiHint = $state('');
  let aiHintLoading = $state(false);
  let aiHintError = $state('');
  let aiHintController = null;
  let attempts = $state(0);
  const MAX_ATTEMPTS = 2;

  $effect(() => {
    userCode = exercise.code;
    answered = false;
    correct = false;
    aiHint = '';
    aiHintLoading = false;
    aiHintError = '';
    attempts = 0;
    return () => {
      aiHintController?.abort();
      aiHintController = null;
    };
  });

  function handleCheck() {
    if (answered || userCode.trim() === '') return;

    const exactMatch = userCode.trim() === exercise.expected.trim();

    if (exactMatch) {
      correct = true;
      answered = true;
      oncomplete();
      return;
    }

    attempts += 1;

    if (attempts >= MAX_ATTEMPTS) {
      correct = false;
      answered = true;
      requestAiHint();
    } else {
      requestAiHint();
    }
  }

  function requestAiHint() {
    aiHintLoading = true;
    const ac = new AbortController();
    aiHintController = ac;
    const promptText = `The user is filling in blank code. Prompt: ${exercise.prompt || 'no prompt'}. Expected: ${exercise.expected}. The user wrote: ${userCode}. Give them a hint without revealing the full answer.`;
    requestHint(topic, lang, userCode, promptText,
      (hint) => { aiHint = hint; },
      () => { aiHintLoading = false; },
      (err) => { aiHintError = err; aiHintLoading = false; },
      ac.signal
    );
  }
</script>

<div class="exercise-fill">
  <p class="exercise-prompt">{exercise.prompt}</p>
  <textarea class="exercise-textarea" bind:value={userCode} disabled={answered} aria-label={exercise.prompt}></textarea>
  <button class="check-btn" onclick={handleCheck} disabled={answered || userCode.trim() === ''}>
    Check Answer
  </button>
  {#if !answered && attempts > 0}
    <div class="feedback wrong" aria-live="polite">
      <span class="feedback-icon">&#10007;</span> Not quite. {attempts}/{MAX_ATTEMPTS} attempts used
      {#if aiHint}
        <div class="ai-hint">&#128161; {aiHint}</div>
      {:else if aiHintLoading}
        <div class="ai-hint-loading">Generating hint...</div>
      {:else if aiHintError}
        <div class="ai-hint-error">Hint unavailable: {aiHintError}</div>
      {/if}
    </div>
  {/if}
  {#if answered}
    <div class="feedback" class:correct class:wrong={!correct} aria-live="polite">
      {#if correct}
        <span class="feedback-icon">&#10003;</span> Correct!
      {:else}
        <span class="feedback-icon">&#10007;</span> Not quite. The expected answer:
        <pre class="expected-code">{exercise.expected}</pre>
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

<!-- AI evaluation provides contextual hints on wrong answers -->
<!-- Feedback shows retry count and error state for better UX -->

<style>
  .exercise-fill { margin: 8px 0; }
  .exercise-prompt { color: #e2e8f0; font-size: 14px; margin: 0 0 12px; line-height: 1.6; }
  .exercise-textarea { display: block; width: 100%; min-height: 120px; padding: 16px; background: #0a0f1e; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.5; resize: vertical; box-sizing: border-box; }
  .exercise-textarea:focus { outline: none; border-color: #f97316; }
  .exercise-textarea:disabled { opacity: 0.6; cursor: default; }
  .check-btn { margin-top: 12px; padding: 8px 20px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .check-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .check-btn:hover:not(:disabled) { background: #ea580c; }
  .feedback { margin-top: 12px; padding: 12px; background: #1e293b; border-radius: 8px; font-size: 13px; font-weight: 700; line-height: 1.5; }
  .feedback.correct { color: #22c55e; border: 1px solid #22c55e; }
  .feedback.wrong { color: #ef4444; border: 1px solid #ef4444; }
  .feedback-icon { margin-right: 4px; }
  .expected-code { margin-top: 8px; padding: 10px; background: #0a0f1e; border: 1px solid #334155; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #e2e8f0; white-space: pre; overflow-x: auto; }
  .ai-hint { margin-top: 8px; padding: 10px; background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 6px; font-size: 12px; color: #c4b5fd; line-height: 1.5; font-weight: 400; }
  .ai-hint-loading { margin-top: 8px; padding: 10px; font-size: 12px; color: #8b5cf6; font-style: italic; }
  .ai-hint-error { margin-top: 8px; padding: 10px; background: #1e1b4b; border: 1px solid #ef4444; border-radius: 6px; font-size: 12px; color: #fca5a5; line-height: 1.5; font-weight: 400; }
</style>
