<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { apiStream } from '$lib/lib/api.js';
  import AIMessage from './AIMessage.svelte';

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());
  let input = $state('');

  async function send() {
    const message = input.trim();
    if (!message || ai.streaming) return;

    input = '';
    ai.addMessage(message, 'user');
    ai.addMessage('', 'bot');
    ai.setStreaming(true);

    let streamed = '';
    await apiStream('/api/chat', {
      message,
      lang: curr.lang,
      topic: curr.topic,
      phase: curr.phase,
    }, (chunk) => {
      streamed += chunk;
      ai.updateLastMessage(streamed);
    }, () => {
      ai.setStreaming(false);
    }, (error) => {
      ai.updateLastMessage(`Error: ${error}`);
      ai.setStreaming(false);
    });
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }
</script>

<button class="ai-toggle" onclick={() => ai.togglePanel()} aria-label="Open AI tutor panel">
  Devin
</button>

<section class="ai-panel" class:open={ai.panelOpen} aria-label="AI tutor panel">
  <div class="ai-header">
    <span>Devin</span>
    <div>
      <button onclick={() => ai.clearHistory()}>Clear</button>
      <button onclick={() => ai.togglePanel()} aria-label="Close AI tutor panel">x</button>
    </div>
  </div>
  <div class="ai-messages">
    {#each ai.messages as message (message.id)}
      <AIMessage text={message.text} role={message.role} />
    {/each}
    {#if ai.streaming}
      <div class="typing">Devin is thinking...</div>
    {/if}
  </div>
  <div class="ai-input-row">
    <textarea bind:value={input} onkeydown={handleKeydown} placeholder="Ask a question..." rows="1" aria-label="Ask Devin"></textarea>
    <button onclick={send} disabled={ai.streaming}>Send</button>
  </div>
</section>

<style>
  .ai-toggle { position: fixed; bottom: 16px; right: 16px; z-index: 500; padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; }
  .ai-panel { position: fixed; right: 0; top: 0; bottom: 0; width: min(380px, 100vw); z-index: 900; background: #0b1120; border-left: 1px solid #1e293b; display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.2s ease; }
  .ai-panel.open { transform: translateX(0); }
  .ai-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-weight: 800; }
  .ai-header button { background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 12px; padding: 4px 8px; }
  .ai-messages { flex: 1; overflow-y: auto; padding: 8px; }
  .typing { padding: 8px 12px; color: #64748b; font-size: 12px; }
  .ai-input-row { display: flex; gap: 8px; padding: 8px 12px; border-top: 1px solid #1e293b; }
  .ai-input-row textarea { flex: 1; padding: 8px; border: 1px solid #334155; border-radius: 6px; background: #0a0f1e; color: #e2e8f0; font-size: 12px; resize: none; }
  .ai-input-row button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
  .ai-input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
