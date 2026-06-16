<script>
  import { requestHint } from '$lib/lib/tutorial-ai.js';
  import TutorialHelpButton from './TutorialHelpButton.svelte';

  let { exercise, oncomplete = () => {}, lang = 'js' } = $props();
  let topic = $derived(exercise.prompt?.split('\n')[0] || 'programming');

  let currentOrder = $state([...exercise.lines]);
  let answered = $state(false);
  let correct = $state(false);
  let aiHint = $state('');
  let aiHintLoading = $state(false);
  let aiHintError = $state('');
  let aiHintController = null;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  $effect(() => {
    currentOrder = shuffle(exercise.lines);
    answered = false;
    correct = false;
    aiHint = '';
    aiHintLoading = false;
    aiHintError = '';
    return () => {
      aiHintController?.abort();
      aiHintController = null;
    };
  });

  function moveUp(i) {
    if (answered || i === 0) return;
    const next = [...currentOrder];
    [next[i], next[i - 1]] = [next[i - 1], next[i]];
    currentOrder = next;
  }

  function moveDown(i) {
    if (answered || i === currentOrder.length - 1) return;
    const next = [...currentOrder];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    currentOrder = next;
  }

  function handleCheck() {
    if (answered) return;
    const expected = exercise.expected || exercise.lines;
    correct = currentOrder.every((line, i) => line === expected[i]);
    if (correct) {
      answered = true;
      oncomplete();
    } else {
      requestAiHint();
    }
  }

  function requestAiHint() {
    aiHintLoading = true;
    const ac = new AbortController();
    aiHintController = ac;
    const promptText = `The user is reordering code lines. The correct order is: ${(exercise.expected || exercise.lines).join(' | ')}. Their order: ${currentOrder.join(' | ')}. Give a hint about what's wrong.`;
    requestHint(topic, lang, currentOrder.join('\n'), promptText,
      (hint) => { aiHint = hint; },
      () => { aiHintLoading = false; },
      (err) => { aiHintError = err; aiHintLoading = false; },
      ac.signal
    );
  }
</script>

<div class="exercise-reorder">
  <p class="exercise-prompt">{exercise.prompt}</p>
  <div class="reorder-list">
    {#each currentOrder as line, i (i)}
      <div class="reorder-item" class:answered>
        <span class="reorder-num">#{i + 1}</span>
        <code class="reorder-code">{line}</code>
        <div class="reorder-arrows">
          <button disabled={i === 0 || answered} onclick={() => moveUp(i)}>↑</button>
          <button disabled={i === currentOrder.length - 1 || answered} onclick={() => moveDown(i)}>↓</button>
        </div>
      </div>
    {/each}
  </div>
  <button class="check-btn" disabled={answered} onclick={handleCheck}>Check Answer</button>
  {#if !answered && aiHint}
    <div class="ai-hint">&#128161; {aiHint}</div>
  {:else if !answered && aiHintLoading}
    <div class="ai-hint-loading">Analyzing order...</div>
  {:else if !answered && aiHintError}
    <div class="ai-hint-error">Hint unavailable: {aiHintError}</div>
  {/if}
  {#if answered}
    <div class="feedback" class:correct class:wrong={!correct} aria-live="polite">
      {#if correct}
        <span class="feedback-icon">&#10003;</span> Correct
      {:else}
        <span class="feedback-icon">&#10007;</span> Wrong order
      {/if}
    </div>
    {#if !correct}
      <TutorialHelpButton
        label="Ask Devin for help"
        topic={topic}
        lang={lang}
        context="I got the code order wrong, can you help?"
      />
    {/if}
  {/if}
</div>

<style>
  .exercise-reorder { margin: 8px 0; }
  .exercise-prompt { color: #e2e8f0; font-size: 14px; margin: 0 0 12px; line-height: 1.6; }
  .reorder-list { display: flex; flex-direction: column; gap: 6px; }
  .reorder-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; }
  .reorder-item.answered { opacity: 0.7; }
  .reorder-num { color: #64748b; font-size: 12px; font-weight: 700; min-width: 28px; }
  .reorder-code { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #e2e8f0; flex: 1; }
  .reorder-arrows { display: flex; flex-direction: column; gap: 2px; }
  .reorder-arrows button { background: none; border: 1px solid #334155; border-radius: 4px; color: #f97316; cursor: pointer; font-size: 12px; padding: 2px 6px; line-height: 1; }
  .reorder-arrows button:hover:not(:disabled) { background: rgba(249,115,22,0.1); }
  .reorder-arrows button:disabled { opacity: 0.3; cursor: not-allowed; }
  .check-btn { margin-top: 12px; padding: 8px 20px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .check-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .check-btn:hover:not(:disabled) { background: #ea580c; }
  .feedback { margin-top: 12px; padding: 12px; background: #1e293b; border-radius: 8px; font-size: 13px; font-weight: 700; line-height: 1.6; }
  .feedback.correct { color: #22c55e; border: 1px solid #22c55e; }
  .feedback.wrong { color: #ef4444; border: 1px solid #ef4444; }
  .feedback-icon { margin-right: 4px; }
  .ai-hint { margin-top: 8px; padding: 10px; background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 6px; font-size: 12px; color: #c4b5fd; line-height: 1.5; font-weight: 400; }
  .ai-hint-loading { margin-top: 8px; padding: 10px; font-size: 12px; color: #8b5cf6; font-style: italic; }
  .ai-hint-error { margin-top: 8px; padding: 10px; background: #1e1b4b; border: 1px solid #ef4444; border-radius: 6px; font-size: 12px; color: #fca5a5; line-height: 1.5; font-weight: 400; }
</style>
