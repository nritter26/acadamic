<script>
  let { exercise, oncomplete = () => {} } = $props();

  let selectedIndex = $state(null);
  let answered = $state(false);

  function selectOption(i) {
    if (answered || !exercise) return;
    selectedIndex = i;
  }

  function isCorrect(i) {
    return answered && i === exercise.correctIndex;
  }

  function isWrong(i) {
    return answered && selectedIndex === i && i !== exercise.correctIndex;
  }

  function handleCheck() {
    if (answered || selectedIndex === null) return;
    answered = true;
    if (selectedIndex === exercise.correctIndex) {
      oncomplete();
    }
  }
</script>

<div class="exercise-mcq">
  <p class="exercise-prompt">{exercise.prompt}</p>
    <div class="mcq-options" role="radiogroup" aria-label="Answer choices">
    {#each exercise.options as opt, i}
      <button
        class="mcq-opt"
        class:selected={selectedIndex === i}
        class:correct={isCorrect(i)}
        class:wrong={isWrong(i)}
        disabled={answered}
        role="radio"
        aria-checked={selectedIndex === i}
        onclick={() => selectOption(i)}
      >
        {opt}
      </button>
    {/each}
  </div>
  <button class="check-btn" onclick={handleCheck} disabled={selectedIndex === null || answered}>
    Check Answer
  </button>
  {#if answered}
    <div class="mcq-explanation" aria-live="polite">
      {#if selectedIndex === exercise.correctIndex}
        <div class="mcq-result correct">Correct</div>
      {:else}
        <div class="mcq-result incorrect">Incorrect</div>
      {/if}
      {exercise.explanation}
    </div>
  {/if}
</div>

<style>
  .exercise-mcq { margin: 8px 0; }
  .exercise-prompt { color: #e2e8f0; font-size: 14px; margin: 0 0 12px; line-height: 1.6; }
  .mcq-options { display: flex; flex-direction: column; gap: 8px; }
  .mcq-opt { display: block; width: 100%; padding: 10px 14px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #cbd5e1; cursor: pointer; font-size: 13px; text-align: left; transition: border-color 0.15s; }
  .mcq-opt:hover:not(:disabled) { border-color: #475569; }
  .mcq-opt.selected { border-color: #f97316; background: rgba(249,115,22,0.1); }
  .mcq-opt.correct { border-color: #22c55e; background: rgba(34,197,94,0.1); color: #22c55e; }
  .mcq-opt.wrong { border-color: #ef4444; background: rgba(239,68,68,0.1); color: #ef4444; }
  .mcq-opt:disabled { cursor: default; opacity: 0.7; }
  .check-btn { margin-top: 12px; padding: 8px 20px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .check-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .check-btn:hover:not(:disabled) { background: #ea580c; }
  .mcq-explanation { margin-top: 12px; padding: 10px; background: #1e293b; border-radius: 8px; font-size: 12px; color: #94a3b8; line-height: 1.5; }
  .mcq-result { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
  .mcq-result.correct { color: #22c55e; }
  .mcq-result.incorrect { color: #ef4444; }
</style>
