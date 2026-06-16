<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { shuffleOptions } from '$lib/lib/quiz-utils';
  let { topic, lang = 'js', phase = '', alreadyCompleted = false } = $props();

  let collapsed = $state(alreadyCompleted);
  let guide = $state('');
  let loading = $state(false);
  let error = $state('');
  let controller = $state(null);
  let checkinQuestion = $state(null);
  let checkinSelected = $state(null);
  let checkinAnswered = $state(false);
  let checkinResult = $state(null);

  let aiState = $derived(getAIState());

  let aiDisabled = $state(false);

  $effect(() => {
    aiDisabled = !!topic && !aiState.useAI;
  });

  function toggleGuide() {
    collapsed = !collapsed;
  }

  function explain() {
    if (!guide && !loading) loadGuide();
  }

  async function loadGuide() {
    if (loading) return;
    loading = true;
    guide = '';
    error = '';
    checkinQuestion = null;
    checkinSelected = null;
    checkinAnswered = false;
    checkinResult = null;

    const ac = new AbortController();
    controller = ac;

    try {
      const res = await fetch('/api/tutor/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lang, phase, learnerId: 'default', include_checkin: true }),
        signal: ac.signal,
      });
      if (!res.ok) { error = `HTTP ${res.status}`; loading = false; return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let streamed = '';
      while (true) {
        if (ac.signal.aborted) return;
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'checkin') {
              const { shuffledOptions, newCorrectIdx } = shuffleOptions(parsed.options, parsed.answerIndex);
              checkinQuestion = { ...parsed, options: shuffledOptions, answerIndex: newCorrectIdx };
              guide = streamed;
            } else if (parsed.type === 'explanation_end') {
              continue;
            } else {
              const chunk = parsed.content ?? parsed.text ?? data;
              streamed += chunk;
              guide = streamed;
            }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') error = e.message;
    } finally {
      loading = false;
      controller = null;
    }
  }

  function retry() {
    error = '';
    loadGuide();
  }

  function handleCheckin(index) {
    if (checkinAnswered) return;
    checkinSelected = index;
    checkinAnswered = true;
    const correct = index === checkinQuestion.answerIndex;
    checkinResult = {
      passed: correct,
      text: correct ? '✅ Correct! ' + checkinQuestion.explanation : '❌ Not quite. ' + checkinQuestion.explanation,
    };
  }
</script>

<div class="ai-guide" class:collapsed>
  <button class="ag-header" onclick={toggleGuide} aria-expanded={!collapsed}>
    <span class="ag-icon">{collapsed ? '▶' : '▼'}</span>
    <span class="ag-title">AI Guide</span>
    {#if loading}
      <span class="ag-badge">Generating...</span>
    {/if}
  </button>
  {#if !collapsed}
    <div class="ag-body">
      {#if error}
        <div class="ag-error">
          <p>Guide unavailable: {error}</p>
          <button class="ag-retry" onclick={retry}>Retry</button>
        </div>
      {:else if loading && !guide}
        <div class="ag-skeleton">
          <div class="ag-skel-line"></div>
          <div class="ag-skel-line"></div>
          <div class="ag-skel-line ag-skel-short"></div>
        </div>
      {:else if guide}
        <div class="ag-content">{guide}</div>
        {#if checkinQuestion}
          <div class="ag-checkin">
            <p class="ag-checkin-q">{checkinQuestion.question}</p>
            <div class="ag-checkin-options">
              {#each checkinQuestion.options as opt, i}
                <button
                  class="ag-checkin-opt"
                  class:selected={checkinSelected === i}
                  class:correct={checkinAnswered && i === checkinQuestion.answerIndex}
                  class:wrong={checkinAnswered && checkinSelected === i && i !== checkinQuestion.answerIndex}
                  onclick={() => handleCheckin(i)}
                  disabled={checkinAnswered}
                >{opt}</button>
              {/each}
            </div>
            {#if checkinResult}
              <div class="ag-checkin-result" class:pass={checkinResult.passed}>
                {checkinResult.text}
              </div>
            {/if}
          </div>
        {/if}
      {:else if aiDisabled}
        <div class="ag-empty">AI is disabled. <button class="ag-retry" onclick={() => { const a = getAIState(); a.toggleAI(); }}>Enable Devin AI</button> for AI guides.</div>
      {:else if !guide && !loading}
        <div class="ag-empty">
          <button class="ag-explain-btn" onclick={explain}>Explain this topic</button>
        </div>
      {:else}
        <div class="ag-empty">No guide content available.</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ai-guide { margin-top: 20px; border: 1px solid #4c1d95; border-radius: 12px; overflow: hidden; background: rgba(30,27,75,0.4); }
  .ag-header { display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; background: rgba(76,29,149,0.2); border: none; color: #c4b5fd; cursor: pointer; font-size: 14px; font-weight: 700; text-align: left; }
  .ag-header:hover { background: rgba(76,29,149,0.3); }
  .ag-icon { font-size: 10px; width: 12px; }
  .ag-title { flex: 1; }
  .ag-badge { font-size: 11px; font-weight: 400; color: #8b5cf6; }
  .ag-body { padding: 16px; }
  .ag-content { font-size: 14px; line-height: 1.8; color: #c4b5fd; white-space: pre-wrap; }
  .ag-skeleton { display: flex; flex-direction: column; gap: 10px; }
  .ag-skel-line { height: 14px; background: linear-gradient(90deg, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
  .ag-skel-short { width: 60%; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .ag-error { color: #ef4444; font-size: 13px; }
  .ag-retry { margin-top: 8px; padding: 6px 14px; background: #4c1d95; border: none; border-radius: 6px; color: #fff; cursor: pointer; font-size: 12px; }
  .ag-empty { color: #6b7280; font-size: 13px; font-style: italic; }
  .ag-explain-btn { padding: 8px 20px; background: #4c1d95; border: none; border-radius: 6px; color: #fff; cursor: pointer; font-size: 13px; font-weight: 600; }
  .ag-explain-btn:hover { background: #6d28d9; }
  .ag-checkin { margin-top: 16px; padding: 12px; background: rgba(15,23,42,0.5); border: 1px solid #334155; border-radius: 8px; }
  .ag-checkin-q { font-size: 14px; font-weight: 600; color: #e2e8f0; margin: 0 0 10px; }
  .ag-checkin-options { display: flex; flex-direction: column; gap: 6px; }
  .ag-checkin-opt { padding: 8px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #cbd5e1; cursor: pointer; font-size: 13px; text-align: left; }
  .ag-checkin-opt:hover:not(:disabled) { border-color: #6366f1; }
  .ag-checkin-opt.selected { border-color: #6366f1; background: rgba(99,102,241,0.15); }
  .ag-checkin-opt.correct { border-color: #22c55e; background: rgba(34,197,94,0.15); color: #86efac; }
  .ag-checkin-opt.wrong { border-color: #ef4444; background: rgba(239,68,68,0.15); color: #fca5a5; }
  .ag-checkin-result { margin-top: 8px; padding: 8px 12px; border-radius: 6px; font-size: 13px; line-height: 1.5; }
  .ag-checkin-result.pass { background: rgba(34,197,94,0.1); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
  .ag-checkin-result:not(.pass) { background: rgba(239,68,68,0.1); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
</style>
