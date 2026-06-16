<script>
  import CodeActionToolbar from '$lib/components/workspace/CodeActionToolbar.svelte';
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { apiStream } from '$lib/lib/api.js';

  let { value = '', highlightLine = null } = $props();

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());

  let toolbarVisible = $state(false);
  let toolbarX = $state(0);
  let toolbarY = $state(0);
  let selectedText = $state('');

  let textareaEl;

  function handleCodeAction(action, text) {
    toolbarVisible = false;
    ai.togglePanel();
    ai.toggleAI();
    ai.addMessage(`Explain this code:\n\`\`\`\n${text}\n\`\`\``, 'user');
    ai.addMessage('', 'bot');
    ai.setStreaming(true);

    const endpoint = action === 'fix' ? '/api/tutor/transform' : action === 'review' ? '/api/review' : '/api/explain';
    const body = action === 'fix'
      ? { code: text, lang: curr.lang, type: 'fix' }
      : { code: text, lang: curr.lang, topic: curr.topic };

    let streamed = '';
    if (action === 'fix') {
      apiStream(endpoint, body, (chunk) => {
        streamed += chunk;
        ai.updateLastMessage(streamed);
      }, () => {
        ai.setStreaming(false);
      }, (error) => {
        ai.updateLastMessage(`Error: ${error}`);
        ai.setStreaming(false);
      });
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()).then(data => {
        const text = data.explanation || data.review || data.output || '(no response)';
        ai.updateLastMessage(text);
        ai.setStreaming(false);
      }).catch(e => {
        ai.updateLastMessage(`Error: ${e.message}`);
        ai.setStreaming(false);
      });
    }
  }

  function handleMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      toolbarVisible = false;
      return;
    }
    selectedText = sel.toString();
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    toolbarX = rect.left;
    toolbarY = rect.top;
    toolbarVisible = true;
  }

  let gutterEl;

  function syncScroll() {
    if (gutterEl) gutterEl.scrollTop = textareaEl?.scrollTop || 0;
  }

  let clickHandler;

  $effect(() => {
    if (toolbarVisible) {
      clickHandler = (e) => {
        if (textareaEl && !textareaEl.contains(e.target)) {
          toolbarVisible = false;
        }
      };
      document.addEventListener('mousedown', clickHandler);
    } else {
      if (clickHandler) {
        document.removeEventListener('mousedown', clickHandler);
        clickHandler = undefined;
      }
    }
    return () => {
      if (clickHandler) {
        document.removeEventListener('mousedown', clickHandler);
      }
    };
  });
</script>

<div class="mini-editor">
  <div class="me-gutter" bind:this={gutterEl}>
    {#each (value || '').split('\n') as _, i}
      <span class="me-gutter-line" class:me-gutter-active={highlightLine !== null && i === highlightLine}>{i + 1}</span>
    {/each}
  </div>
  <textarea
    bind:this={textareaEl}
    bind:value
    class="me-textarea"
    spellcheck="false"
    onmouseup={handleMouseUp}
    onscroll={syncScroll}
  ></textarea>
</div>

<CodeActionToolbar
  {selectedText}
  x={toolbarX}
  y={toolbarY}
  visible={toolbarVisible}
  onexplain={(t) => handleCodeAction('explain', t)}
  onreview={(t) => handleCodeAction('review', t)}
  onfix={(t) => handleCodeAction('fix', t)}
/>

<style>
  .mini-editor { flex: 1; display: flex; background: #0a0f1e; }
  .me-gutter { width: 32px; padding: 16px 4px; font-family: 'JetBrains Mono', monospace; font-size: 15px; line-height: 1.7; color: #475569; text-align: right; user-select: none; border-right: 1px solid #111827; overflow: hidden; }
  .me-gutter-line { display: block; }
  .me-gutter-active { color: #6366f1; font-weight: 700; background: rgba(99, 102, 241, 0.1); border-right: 2px solid #6366f1; }
  .me-textarea { width: 100%; min-height: 100px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 15px; line-height: 1.7; color: #e2e8f0; background: transparent; border: none; resize: vertical; outline: none; tab-size: 2; }
</style>
