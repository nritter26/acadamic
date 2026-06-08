<script>
  import { TUTORIAL_QUIZZES } from '$lib/lib/tutorial-content.js';

  let { open = false, courseId = 'js', phaseId = null, oncomplete = () => {}, onclose = () => {} } = $props();

  let questions = $derived(phaseId ? (TUTORIAL_QUIZZES[`${courseId}:${phaseId}`] || []) : []);
  let currentQuestion = $state(0);
  let selectedAnswer = $state(null);
  let showResult = $state(false);
  let correctCount = $state(0);
  let finished = $state(false);

  function selectAnswer(index) {
    if (showResult) return;
    selectedAnswer = index;
  }

  function confirmAnswer() {
    if (selectedAnswer === null) return;
    showResult = true;
    if (selectedAnswer === questions[currentQuestion].answer) {
      correctCount++;
    }
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      selectedAnswer = null;
      showResult = false;
    } else {
      finished = true;
      const score = Math.round((correctCount / questions.length) * 100);
      oncomplete(phaseId, score);
    }
  }

  function handleClose() {
    currentQuestion = 0;
    selectedAnswer = null;
    showResult = false;
    correctCount = 0;
    finished = false;
    onclose();
  }
</script>

{#if open}
  <div class="tutorial-quiz-overlay" onclick={handleClose} role="dialog">
    <div class="tutorial-quiz-paper" onclick={(e) => e.stopPropagation()}>
      <div class="tutorial-quiz-body">
        {#if finished}
          <h2>Quiz Complete!</h2>
          <p class="quiz-score">Score: {Math.round((correctCount / questions.length) * 100)}%</p>
          <p>{correctCount} of {questions.length} correct</p>
          <button onclick={handleClose}>Close</button>
        {:else if questions.length > 0}
          <div class="quiz-progress">Question {currentQuestion + 1} of {questions.length}</div>
          <h3>{questions[currentQuestion].question}</h3>
          <div class="quiz-options">
            {#each questions[currentQuestion].options as option, i}
              <button
                class="quiz-option"
                class:selected={selectedAnswer === i}
                class:correct={showResult && i === questions[currentQuestion].answer}
                class:wrong={showResult && selectedAnswer === i && i !== questions[currentQuestion].answer}
                disabled={showResult}
                onclick={() => selectAnswer(i)}
              >
                {option}
              </button>
            {/each}
          </div>
          {#if showResult}
            <div class="quiz-explanation">
              {selectedAnswer === questions[currentQuestion].answer ? '✅ ' : '❌ '}
              {questions[currentQuestion].explanation}
            </div>
            <button onclick={nextQuestion}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          {:else}
            <button onclick={confirmAnswer} disabled={selectedAnswer === null}>Confirm</button>
          {/if}
        {:else}
          <p>No quiz available for this phase.</p>
          <button onclick={handleClose}>Close</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .tutorial-quiz-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100; }
  .tutorial-quiz-paper { background: #0f172a; border: 1px solid #fb923c; border-radius: 16px; padding: 32px; width: min(500px, 90vw); max-height: 80vh; overflow: auto; }
  .tutorial-quiz-body { color: #e2e8f0; text-align: center; }
  .tutorial-quiz-body h2 { color: #22c55e; margin: 0 0 8px; }
  .tutorial-quiz-body h3 { color: #e2e8f0; font-size: 16px; margin: 12px 0; }
  .quiz-score { font-size: 24px; font-weight: 700; color: #22c55e; }
  .quiz-progress { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .quiz-options { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
  .quiz-option { padding: 10px 16px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #cbd5e1; cursor: pointer; font-size: 13px; text-align: left; }
  .quiz-option:hover:not(:disabled) { border-color: #475569; }
  .quiz-option.selected { border-color: #f97316; background: rgba(249,115,22,0.1); }
  .quiz-option.correct { border-color: #22c55e; background: rgba(34,197,94,0.1); color: #22c55e; }
  .quiz-option.wrong { border-color: #ef4444; background: rgba(239,68,68,0.1); color: #ef4444; }
  .quiz-explanation { margin: 12px 0; padding: 10px; background: #1e293b; border-radius: 8px; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: left; }
  .tutorial-quiz-body button:not(.quiz-option) { padding: 8px 20px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 12px; }
  .tutorial-quiz-body button:not(.quiz-option):disabled { opacity: 0.4; cursor: not-allowed; }
</style>
