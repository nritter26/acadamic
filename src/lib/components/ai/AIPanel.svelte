<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { apiStream } from '$lib/lib/api.js';
  import AIMessage from './AIMessage.svelte';
  import AISettings from './AISettings.svelte';
  import AISuggestions from './AISuggestions.svelte';
  import ExercisePrompt from './ExercisePrompt.svelte';
  import DiffView from './DiffView.svelte';
  import { slide } from 'svelte/transition';

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());
  let input = $state('');
  let showSettings = $state(false);
  let offlineStatus = $state('⟳ Checking server...');
  let showCommands = $state(false);
  let selectedCmdIndex = $state(0);
  let currentSuggestions = $state([]);
  let transformResult = $state(null);

  const COMMANDS = [
    { name: '/async', desc: 'Convert to async/await' },
    { name: '/error-handling', desc: 'Add error handling' },
    { name: '/typescript', desc: 'Convert to TypeScript' },
    { name: '/optimize', desc: 'Optimize performance' },
    { name: '/document', desc: 'Add documentation' },
    { name: '/test', desc: 'Write unit tests' },
    { name: '/fix', desc: 'Fix bugs/issues' },
  ];

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

  function getCommandMatch(text) {
    const cmd = COMMANDS.find(c => text.startsWith(c.name + ' ') || text === c.name);
    return cmd || null;
  }

  async function handleTransformCommand(cmdName) {
    const code = ai.editorCode;
    if (!code) {
      ai.updateLastMessage('No code available to transform. Open a file or write some code first.');
      ai.setStreaming(false);
      return;
    }

    const cmdType = cmdName.slice(1);
    const typeLabels = { async: 'Async/Await', 'error-handling': 'Error Handling', typescript: 'TypeScript', optimize: 'Optimization', document: 'Documentation', test: 'Tests', fix: 'Bug Fix' };
    const label = typeLabels[cmdType] || cmdType;
    try {
      const r = await fetch('/api/tutor/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, lang: curr.lang, type: cmdType }),
      });
      const data = await r.json();
      transformResult = null;
      if (data.error) {
        ai.updateLastMessage(`Transformation failed: ${data.error}`);
      } else {
        transformResult = { originalCode: code, transformedCode: data.transformedCode, explanation: data.explanation };
        ai.updateLastMessage(`**${label}**\n\n${data.explanation}`);
      }
    } catch (e) {
      ai.updateLastMessage(`Error: ${e.message}`);
    }
    ai.setStreaming(false);
  }

  async function send() {
    if (!ai.useAI) {
      ai.toggleAI();
      return;
    }

    const message = input.trim();
    if (!message || ai.streaming) return;

    if (offlineStatus && !offlineStatus.includes('Checking')) {
      try {
        const r = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        if (!r.ok) { ai.addMessage('The backend server is not responding. Make sure it is running (npm run server).', 'bot'); return; }
        offlineStatus = '';
      } catch {
        ai.addMessage('Cannot reach the backend server. Start it with: npm run server', 'bot');
        return;
      }
    }

    showCommands = false;
    input = '';

    const cmd = getCommandMatch(message);
    if (cmd) {
      ai.addMessage(message, 'user', 'transform');
      ai.addMessage('', 'bot', 'transform');
      ai.setStreaming(true);
      await handleTransformCommand(cmd.name);
      return;
    }

    ai.addMessage(message, 'user');
    ai.addMessage('', 'bot');
    ai.setStreaming(true);

    let streamed = '';
    const body = { message, lang: curr.lang, topic: curr.topic, phase: curr.phase, code: ai.editorCode || undefined };
    if (ai.provider && ai.provider !== 'hybrid') body.provider = ai.provider;
    if (ai.model) body.model = ai.model;
    await apiStream('/api/chat', body, (chunk) => {
      streamed += chunk;
      ai.updateLastMessage(streamed);
      if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    }, () => {
      ai.setStreaming(false);
    }, (error) => {
      const msg = error.includes('502') || error.includes('unreachable')
        ? '⚠️ Backend server unreachable. Make sure the server is running: npm run server'
        : `Error: ${error}`;
      ai.updateLastMessage(msg);
      ai.setStreaming(false);
    }, (event, data) => {
      if (event === 'suggestions' && data?.suggestions) {
        currentSuggestions = data.suggestions;
      }
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

<button
  class="ai-toggle"
  class:ai-on={ai.useAI}
  onclick={() => ai.useAI ? ai.togglePanel() : ai.toggleAI()}
  aria-label={ai.useAI ? 'Open AI tutor panel' : 'Enable AI tutor'}
  title={ai.useAI ? 'Devin AI is on' : 'Devin AI is off — click to enable'}
>
  Devin {ai.useAI ? '✦' : '✧'}
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
    {#if !ai.useAI}
      <div class="ai-disabled">
        <div class="ai-disabled-icon">✦</div>
        <p>Devin AI is currently off.</p>
        <button class="ai-enable-btn" onclick={() => ai.toggleAI()}>Enable Devin AI</button>
        <p class="ai-disabled-hint">Toggle AI on to get coding help, hints, and explanations.</p>
      </div>
    {/if}
    <div class="ai-messages" bind:this={messagesEl}>
      {#each ai.messages as message, i (message.id)}
        <AIMessage text={message.text} role={message.role} source={message.source || ''} />
        {#if transformResult && i === ai.messages.length - 1 && message.role === 'bot'}
          <DiffView originalCode={transformResult.originalCode} transformedCode={transformResult.transformedCode} />
          <button class="apply-transform-btn" onclick={() => { ai.editorCode = transformResult.transformedCode; transformResult = null; }}>
            Apply Changes
          </button>
        {/if}
      {/each}
      {#if ai.streaming}
        <div class="typing">Devin is thinking...</div>
      {/if}
    </div>
    <AISuggestions onsuggest={handleSuggest} suggestions={currentSuggestions} />
    <ExercisePrompt />
    {#if offlineStatus}
      <div class="ai-offline-badge">{offlineStatus}</div>
    {/if}
    <div class="ai-input-row">
      <div class="ai-input-wrapper">
        <textarea
          bind:this={inputEl}
          bind:value={input}
          onkeydown={handleKeydown}
          oninput={() => { autoGrow(); showCommands = input.startsWith('/') && input.length > 1; }}
          onblur={() => setTimeout(() => showCommands = false, 200)}
          onfocus={() => { showCommands = input.startsWith('/') && input.length > 1; }}
          placeholder="Ask a question... (Ctrl+K)"
          rows="1"
          aria-label="Ask Devin"
        ></textarea>
        {#if showCommands}
          <div class="commands-dropdown">
            {#each COMMANDS.filter(c => c.name.startsWith(input.toLowerCase().split(' ')[0])) as cmd, i}
              <button
                class="cmd-item"
                onmousedown={(e) => { e.preventDefault(); input = cmd.name + ' '; showCommands = false; inputEl?.focus(); }}
              >
                <span class="cmd-name">{cmd.name}</span>
                <span class="cmd-desc">{cmd.desc}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
      {#if ai.streaming}
        <button class="ai-stop-btn" onclick={stopStreaming} title="Stop generating">■</button>
      {:else}
        <button onclick={send} disabled={ai.streaming}>Send</button>
      {/if}
    </div>
  </section>
{/if}

<style>
  .ai-toggle { position: fixed; bottom: 16px; right: 16px; z-index: 500; padding: 8px 14px; background: #334155; color: #94a3b8; border: 1px solid #475569; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; transition: all 0.2s; }
  .ai-toggle.ai-on { background: #6366f1; color: #fff; border-color: #6366f1; }
  .ai-toggle:hover { background: #4f46e5; color: #fff; border-color: #4f46e5; }
  .ai-disabled { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; text-align: center; gap: 12px; }
  .ai-disabled-icon { font-size: 28px; color: #6366f1; }
  .ai-disabled p { color: #94a3b8; font-size: 13px; margin: 0; }
  .ai-disabled-hint { font-size: 11px !important; color: #64748b !important; }
  .ai-enable-btn { padding: 8px 20px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .ai-enable-btn:hover { background: #4f46e5; }
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
  .ai-input-row .ai-input-wrapper { flex: 1; }
  .ai-input-row button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
  .ai-input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
  .ai-stop-btn { background: #ef4444 !important; }
  .ai-input-wrapper { position: relative; flex: 1; display: flex; }
  .ai-input-wrapper textarea { flex: 1; padding: 8px; border: 1px solid #334155; border-radius: 6px; background: #0a0f1e; color: #e2e8f0; font-size: 12px; resize: none; max-height: 120px; line-height: 1.4; }
  .commands-dropdown { position: absolute; bottom: 100%; left: 0; right: 0; background: #1e293b; border: 1px solid #334155; border-radius: 6px; margin-bottom: 4px; max-height: 200px; overflow-y: auto; z-index: 100; }
  .cmd-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 10px; background: transparent; border: none; color: #e2e8f0; font-size: 11px; cursor: pointer; text-align: left; }
  .cmd-item:hover { background: #334155; }
  .cmd-name { font-weight: 700; color: #6366f1; }
  .cmd-desc { color: #94a3b8; font-size: 10px; }
  .apply-transform-btn { display: block; margin: 4px 12px 8px; padding: 6px 14px; background: #22c55e; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
  .apply-transform-btn:hover { background: #16a34a; }
</style>
