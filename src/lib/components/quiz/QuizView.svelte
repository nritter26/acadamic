<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import QuizQuestion from './QuizQuestion.svelte';

  let curr = $derived(getCurriculumState());
  let questions = $state([]);
  let currentIndex = $state(0);
  let score = $state(0);
  let finished = $state(false);
  let error = $state('');
  let loading = $state(false);

  async function startQuiz() {
    loading = true;
    error = '';
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: curr.lang, level: curr.level }),
      });
      const data = await response.json();
      questions = data.questions || data.quiz || [];
      currentIndex = 0;
      score = 0;
      finished = false;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function handleAnswer(correct) {
    if (correct) score += 1;
    if (currentIndex + 1 >= questions.length) finished = true;
    else currentIndex += 1;
  }
</script>

<div class="quiz-container">
  {#if questions.length === 0}
    <div class="quiz-start">
      <h2>Quiz Mode</h2>
      <p>Generate practice questions for the current curriculum language.</p>
      {#if error}<p class="error">{error}</p>{/if}
      <button onclick={startQuiz} disabled={loading}>{loading ? 'Loading...' : 'Start Quiz'}</button>
    </div>
  {:else if finished}
    <div class="quiz-result">
      <h2>Quiz Complete</h2>
      <p>Score: {score} / {questions.length}</p>
      <button onclick={startQuiz}>Try Again</button>
    </div>
  {:else}
    <QuizQuestion question={questions[currentIndex]} index={currentIndex} total={questions.length} onanswer={handleAnswer} />
  {/if}
</div>

<style>
  .quiz-container { display: flex; align-items: center; justify-content: center; height: 100%; color: #e2e8f0; padding: 24px; box-sizing: border-box; }
  .quiz-start, .quiz-result { text-align: center; max-width: 520px; }
  .quiz-start p, .quiz-result p { color: #94a3b8; }
  .error { color: #ef4444; }
  button { padding: 10px 24px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
</style>
