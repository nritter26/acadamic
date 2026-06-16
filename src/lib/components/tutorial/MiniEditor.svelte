<script>
  import CodeActionToolbar from '$lib/components/workspace/CodeActionToolbar.svelte';

  let { value = '', onexplain, onreview, onfix } = $props();

  let toolbarVisible = $state(false);
  let toolbarX = $state(0);
  let toolbarY = $state(0);
  let selectedText = $state('');

  let textareaEl;

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
  <textarea
    bind:this={textareaEl}
    bind:value
    class="me-textarea"
    spellcheck="false"
    onmouseup={handleMouseUp}
  ></textarea>
</div>

<CodeActionToolbar
  {selectedText}
  x={toolbarX}
  y={toolbarY}
  visible={toolbarVisible}
  onexplain={(t) => { toolbarVisible = false; onexplain?.(t); }}
  onreview={(t) => { toolbarVisible = false; onreview?.(t); }}
  onfix={(t) => { toolbarVisible = false; onfix?.(t); }}
/>

<style>
  .mini-editor { flex: 1; display: flex; background: #0a0f1e; }
  .me-textarea { width: 100%; min-height: 100px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 15px; line-height: 1.7; color: #e2e8f0; background: transparent; border: none; resize: vertical; outline: none; tab-size: 2; }
</style>
