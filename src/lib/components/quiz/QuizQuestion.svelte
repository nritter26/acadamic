<script>
  let { question, index = 0, total = 1, onanswer = () => {} } = $props();
  let selected = $state(null);
  let answered = $state(false);

  function select(choice) {
    if (answered) return;
    selected = choice;
    answered = true;
    onanswer(choice === question.answer || choice === question.ans);
  }
</script>

<div class="quiz-question">
  <div class="quiz-progress">Question {index + 1} of {total}</div>
  <div class="quiz-prompt">{question.prompt || question.q}</div>
  {#each question.choices || question.options || [] as choice}
    <button
      class="quiz-choice"
      class:correct={answered && (choice === question.answer || choice === question.ans)}
      class:wrong={answered && selected === choice && choice !== question.answer && choice !== question.ans}
      onclick={() => select(choice)}
      disabled={answered}
    >
      {choice}
    </button>
  {/each}
</div>

<style>
  .quiz-question { width: min(720px, 100%); padding: 20px; }
  .quiz-progress { font-size: 11px; color: #64748b; margin-bottom: 12px; }
  .quiz-prompt { font-size: 15px; color: #e2e8f0; margin-bottom: 16px; }
  .quiz-choice { display: block; width: 100%; text-align: left; padding: 10px 14px; margin-bottom: 6px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #cbd5e1; font-size: 13px; cursor: pointer; }
  .quiz-choice:hover:not(:disabled) { background: #334155; }
  .quiz-choice.correct { background: #166534; border-color: #22c55e; }
  .quiz-choice.wrong { background: #7f1d1d; border-color: #ef4444; }
</style>
