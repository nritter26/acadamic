<script>
  let { label = 'Ask Devin', topic, lang = 'js', phase = '', code = '', context = '' } = $props();

  let expanded = $state(false);
  let response = $state('');
  let loading = $state(false);
  let error = $state('');
  let controller = $state(null);

  import { getAIState } from '$lib/stores/ai.svelte.js';

  async function handleClick() {
    if (loading) return;
    expanded = true;
    loading = true;
    response = '';
    error = '';

    const ai = getAIState();
    ai.togglePanel();

    const prompt = context
      ? `Regarding "${topic}": ${context}\n\nCan you help me with this?`
      : `Can you explain "${topic}" in ${lang}?`;

    ai.addMessage(prompt, 'user');
    ai.addMessage('', 'bot');

    const ac = new AbortController();
    controller = ac;

    try {
      const res = await fetch('/api/tutor/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lang, phase, code, learnerId: 'default' }),
        signal: ac.signal,
      });
      if (!res.ok) { error = `HTTP ${res.status}`; loading = false; return; }
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
            const chunk = parsed.content ?? parsed.text ?? data;
            streamed += chunk;
            response = streamed;
            ai.updateLastMessage(streamed);
          } catch { /* skip malformed */ }
        }
      }
      ai.addMessage('Anything else you want to know?', 'bot');
    } catch (e) {
      if (e.name !== 'AbortError') error = e.message;
    } finally {
      loading = false;
      controller = null;
    }
  }

  function toggle() {
    if (!expanded) handleClick();
    else expanded = false;
  }
</script>

<div class="tutorial-help-btn-wrapper">
  <button class="th-btn" onclick={toggle} disabled={loading}>
    {loading ? '⏳ Thinking...' : label}
  </button>
  {#if expanded}
    <div class="th-inline-response" aria-live="polite">
      {#if error}
        <div class="th-error">{error}</div>
      {:else if response}
        <div class="th-response-text">{response}</div>
      {:else}
        <div class="th-loading">Generating...</div>
      {/if}
      <button class="th-close" onclick={() => expanded = false}>✕</button>
    </div>
  {/if}
</div>

<style>
  .tutorial-help-btn-wrapper { margin-top: 8px; }
  .th-btn { padding: 6px 14px; background: transparent; color: #a78bfa; border: 1px solid #a78bfa; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
  .th-btn:hover:not(:disabled) { background: rgba(167,139,250,0.1); }
  .th-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .th-inline-response { position: relative; margin-top: 8px; padding: 12px; background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #c4b5fd; }
  .th-response-text { white-space: pre-wrap; }
  .th-loading { color: #8b5cf6; font-style: italic; }
  .th-error { color: #ef4444; }
  .th-close { position: absolute; top: 6px; right: 8px; background: none; border: none; color: #6b7280; cursor: pointer; font-size: 14px; }
  .th-close:hover { color: #e2e8f0; }
</style>
