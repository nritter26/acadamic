<script>
  let { exercise, oncomplete = () => {} } = $props();

  let currentId = $state(0);
  let userCode = $state(exercise.code);
  let answered = $state(false);
  let correct = $state(false);

  $effect(() => {
    const _ = exercise.code;
    currentId++;
    userCode = exercise.code;
    answered = false;
    correct = false;
  });

  function handleCheck() {
    if (answered || userCode.trim() === '') return;
    correct = userCode.trim() === exercise.expected.trim();
    answered = true;
    if (correct) {
      oncomplete();
    }
  }
</script>

<div class="exercise-fill">
  <p class="exercise-prompt">{exercise.prompt}</p>
  <textarea class="exercise-textarea" bind:value={userCode} disabled={answered} aria-label={exercise.prompt}></textarea>
  <button class="check-btn" onclick={handleCheck} disabled={answered || userCode.trim() === ''}>
    Check Answer
  </button>
  {#if answered}
    <div class="feedback" class:correct class:wrong={!correct} aria-live="polite">
      {#if correct}
        <span class="feedback-icon">&#10003;</span> Correct
      {:else}
        <span class="feedback-icon">&#10007;</span> Not quite
        <pre class="expected-code">{exercise.expected}</pre>
      {/if}
    </div>
  {/if}
</div>

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
</style>
