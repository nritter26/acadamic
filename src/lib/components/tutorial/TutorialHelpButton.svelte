<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';

  let { label = 'Ask Devin', topic, lang = 'js', phase = '', code = '', context = '' } = $props();

  async function handleClick() {
    const ai = getAIState();
    if (!ai.useAI) {
      ai.toggleAI();
      return;
    }

    ai.togglePanel();

    const prompt = context
      ? `Regarding "${topic}": ${context}\n\nCan you help me with this?`
      : `Can you explain "${topic}" in ${lang}?`;

    ai.addMessage(prompt, 'user');
    ai.addMessage('', 'bot');
  }
</script>

<div class="tutorial-help-btn-wrapper">
  <button class="th-btn" onclick={handleClick}>
    {label}
  </button>
</div>

<style>
  .tutorial-help-btn-wrapper { margin-top: 8px; }
  .th-btn { padding: 6px 14px; background: transparent; color: #a78bfa; border: 1px solid #a78bfa; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
  .th-btn:hover { background: rgba(167,139,250,0.1); }
  .th-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
