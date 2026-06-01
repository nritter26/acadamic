<script>
  let { onsuggest = () => {} } = $props();
  const suggestions = ['Explain this topic', 'Give me a hint', 'Review my code'];
</script>

<div class="suggestions">
  {#each suggestions as suggestion}
    <button onclick={() => onsuggest(suggestion)}>{suggestion}</button>
  {/each}
</div>

<style>
  .suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px; }
  button { background: #1e293b; border: 1px solid #334155; border-radius: 999px; color: #cbd5e1; cursor: pointer; font-size: 11px; padding: 4px 8px; }
</style>
