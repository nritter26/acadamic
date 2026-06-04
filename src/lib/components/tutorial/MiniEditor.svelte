<script>
  let { value = '' } = $props();
</script>

<div class="mini-editor">
  <textarea
    bind:value
    class="me-textarea"
    spellcheck="false"
  ></textarea>
</div>

<style>
  .mini-editor { flex: 1; display: flex; background: #0a0f1e; }
  .me-textarea { width: 100%; min-height: 100px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 15px; line-height: 1.7; color: #e2e8f0; background: transparent; border: none; resize: vertical; outline: none; tab-size: 2; }
</style>
