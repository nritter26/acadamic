<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';

  let { exercise, oncomplete = () => {}, lang = 'js' } = $props();

  let topic = $derived(exercise.prompt?.split('\n')[0] || 'programming');
  let selectedIndex = $state(null);
  let answered = $state(false);
  let showAiExplain = $state(false);
  let aiExplain = $state('');
  let aiExplainLoading = $state(false);
  let attempts = $state(0);
  const MAX_ATTEMPTS = 2;

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
    if (selectedIndex === exercise.correctIndex) {
      answered = true;
      oncomplete();
    } else {
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        answered = true;
      } else {
        selectedIndex = null;
      }
    }
  }

  async function requestAiExplain() {
    if (aiExplainLoading || showAiExplain) return;
    showAiExplain = true;
    aiExplainLoading = true;
    const ai = getAIState();
    if (!ai.useAI) {
      ai.toggleAI();
      aiExplainLoading = false;
      return;
    }
    ai.togglePanel();
    const prompt = `In the topic "${topic}" in ${lang}, the question was: "${exercise.prompt}". I chose: "${exercise.options[selectedIndex]}" but the correct answer was: "${exercise.options[exercise.correctIndex]}". Can you explain why my answer is wrong?`;
    ai.addMessage(prompt, 'user');
    ai.addMessage('', 'bot');

    try {
      const res = await fetch('/api/tutor/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lang, code: '', learnerId: 'default', promptContext: prompt }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let streamed = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.content ?? data;
            streamed += chunk;
            aiExplain = streamed;
            ai.updateLastMessage(streamed);
          } catch {}
        }
      }
    } catch (e) {
      aiExplain = 'Could not load explanation.';
    } finally {
      aiExplainLoading = false;
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
  {#if attempts > 0 && !answered}
    <div class="mcq-retry-hint">Not quite. Try again ({attempts}/{MAX_ATTEMPTS})</div>
  {/if}
  <button class="check-btn" onclick={handleCheck} disabled={selectedIndex === null || answered}>
    Check Answer
  </button>
  {#if answered}
    <div class="mcq-explanation" aria-live="polite">
      {#if selectedIndex === exercise.correctIndex}
        <div class="mcq-result correct">&#10003; Correct</div>
      {:else}
        <div class="mcq-result incorrect">&#10007; Incorrect</div>
      {/if}
      {exercise.explanation}
      {#if selectedIndex !== exercise.correctIndex}
        <div class="mcq-ai-explain">
          <button class="mcq-explain-btn" onclick={requestAiExplain} disabled={aiExplainLoading}>
            {aiExplainLoading ? 'Loading...' : 'Explain why this is wrong'}
          </button>
        </div>
      {/if}
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
  .mcq-retry-hint { margin-top: 8px; color: #f59e0b; font-size: 12px; font-weight: 600; }
  .check-btn { margin-top: 12px; padding: 8px 20px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .check-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .check-btn:hover:not(:disabled) { background: #ea580c; }
  .mcq-explanation { margin-top: 12px; padding: 10px; background: #1e293b; border-radius: 8px; font-size: 12px; color: #94a3b8; line-height: 1.5; }
  .mcq-result { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
  .mcq-result.correct { color: #22c55e; }
  .mcq-result.incorrect { color: #ef4444; }
  .mcq-ai-explain { margin-top: 8px; }
  .mcq-explain-btn { padding: 6px 14px; background: #4c1d95; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
  .mcq-explain-btn:hover:not(:disabled) { background: #6d28d9; }
  .mcq-explain-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
