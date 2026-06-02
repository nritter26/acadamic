<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { apiStream } from '$lib/lib/api.js';
  import AIMessage from './AIMessage.svelte';
  import AISettings from './AISettings.svelte';
  import AISuggestions from './AISuggestions.svelte';
  import { slide } from 'svelte/transition';

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());
  let input = $state('');
  let showSettings = $state(false);
  let offlineStatus = $state('⟳ Checking server...');

  let messagesEl;
  let inputEl;

  $effect(() => {
    (async () => {
      try {
        const r = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        offlineStatus = r.ok ? '' : '⟳ Server unreachable';
      } catch {
        offlineStatus = '⟳ Server unreachable';
      }
    })();
  });

  function autoGrow() {
    if (inputEl) {
      inputEl.style.height = 'auto';
      inputEl.style.height = inputEl.scrollHeight + 'px';
    }
  }

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
      if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    }, () => {
      ai.setStreaming(false);
    }, (error) => {
      ai.updateLastMessage(`Error: ${error}`);
      ai.setStreaming(false);
    });
  }

  function stopStreaming() {
    ai.setStreaming(false);
  }

  function handleSuggest(text) {
    input = text;
    autoGrow();
  }

  function exportChat() {
    const markdown = ai.messages.map(m =>
      `**${m.role === 'user' ? 'You' : 'Devin'}**: ${m.text}`
    ).join('\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kodex-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
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

{#if ai.panelOpen}
  <section class="ai-panel" aria-label="AI tutor panel" transition:slide={{ duration: 200 }}>
    <div class="ai-header">
      <span>Devin</span>
      <div class="ai-header-actions">
        <button class="ai-header-btn" onclick={() => showSettings = !showSettings} title="Provider settings">⚙</button>
        <button class="ai-header-btn" onclick={exportChat} title="Export chat">Export</button>
        <button class="ai-header-btn" onclick={() => ai.clearHistory()}>Clear</button>
        <button class="ai-header-btn" onclick={() => ai.togglePanel()} aria-label="Close AI tutor panel">✕</button>
      </div>
    </div>
    {#if showSettings}
      <div class="ai-settings-panel">
        <AISettings />
      </div>
    {/if}
    <div class="ai-messages" bind:this={messagesEl}>
      {#each ai.messages as message (message.id)}
        <AIMessage text={message.text} role={message.role} />
      {/each}
      {#if ai.streaming}
        <div class="typing">Devin is thinking...</div>
      {/if}
    </div>
    <AISuggestions onsuggest={handleSuggest} />
    {#if offlineStatus}
      <div class="ai-offline-badge">{offlineStatus}</div>
    {/if}
    <div class="ai-input-row">
      <textarea
        bind:this={inputEl}
        bind:value={input}
        onkeydown={handleKeydown}
        oninput={autoGrow}
        placeholder="Ask a question... (Ctrl+K)"
        rows="1"
        aria-label="Ask Devin"
      ></textarea>
      {#if ai.streaming}
        <button class="ai-stop-btn" onclick={stopStreaming} title="Stop generating">■</button>
      {:else}
        <button onclick={send} disabled={ai.streaming}>Send</button>
      {/if}
    </div>
  </section>
{/if}

<style>
  .ai-toggle { position: fixed; bottom: 16px; right: 16px; z-index: 500; padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; }
  .ai-panel { position: fixed; right: 0; top: 0; bottom: 0; width: min(380px, 100vw); z-index: 900; background: #0b1120; border-left: 1px solid #1e293b; display: flex; flex-direction: column; }
  .ai-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-weight: 800; }
  .ai-header-actions { display: flex; gap: 2px; }
  .ai-header-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 11px; padding: 4px 6px; border-radius: 4px; }
  .ai-header-btn:hover { color: #e2e8f0; background: #1e293b; }
  .ai-settings-panel { border-bottom: 1px solid #334155; background: #0a0f1e; }
  .ai-messages { flex: 1; overflow-y: auto; padding: 8px; }
  .typing { padding: 8px 12px; color: #64748b; font-size: 12px; }
  .ai-offline-badge { padding: 4px 10px; font-size: 9px; color: #94a3b8; background: #1e293b; border-top: 1px solid #334155; text-align: center; }
  .ai-input-row { display: flex; gap: 8px; padding: 8px 12px; border-top: 1px solid #1e293b; align-items: flex-end; }
  .ai-input-row textarea { flex: 1; padding: 8px; border: 1px solid #334155; border-radius: 6px; background: #0a0f1e; color: #e2e8f0; font-size: 12px; resize: none; max-height: 120px; line-height: 1.4; }
  .ai-input-row button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
  .ai-input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
  .ai-stop-btn { background: #ef4444 !important; }
</style>
