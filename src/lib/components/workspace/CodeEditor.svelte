<script>
  import { getEditorState } from '$lib/stores/editor.svelte.js';

  let editor = $derived(getEditorState());
  let textareaEl;

  function handleInput() {
    editor.code = textareaEl.value;
  }
</script>

<div class="editor-wrapper">
  <div class="editor-lines" aria-hidden="true">
    {#each Array(editor.lineNumbers) as _, index}
      <span>{index + 1}</span>
    {/each}
  </div>
  <textarea
    bind:this={textareaEl}
    id="editor"
    class="editor-textarea notranslate"
    value={editor.code}
    oninput={handleInput}
    spellcheck="false"
    aria-label="Code editor"
  ></textarea>
</div>

<style>
  .editor-wrapper { flex: 1; min-height: 0; display: flex; overflow: hidden; background: #0a0f1e; }
  .editor-lines { width: 36px; padding: 15px 4px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #475569; text-align: right; user-select: none; overflow: hidden; border-right: 1px solid #111827; }
  .editor-lines span { display: block; }
  .editor-textarea { flex: 1; padding: 15px 12px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; line-height: 1.6; background: transparent; color: #e2e8f0; border: none; outline: none; resize: none; tab-size: 4; }
</style>
