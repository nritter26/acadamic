<script>
  let { onsuggest = () => {}, suggestions: dynamicSuggestions = [] } = $props();
  const defaults = ['Explain this topic', 'Give me a hint', 'Review my code'];
  let items = $derived(dynamicSuggestions.length > 0 ? dynamicSuggestions : defaults);
</script>

{#if items.length > 0}
  <div class="suggestions">
    {#each items as suggestion}
      <button onclick={() => onsuggest(suggestion)}>{suggestion}</button>
    {/each}
  </div>
{/if}

<style>
  .suggestions { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px; }
  button { background: #1e293b; border: 1px solid #334155; border-radius: 999px; color: #cbd5e1; cursor: pointer; font-size: 11px; padding: 4px 8px; }
  button:hover { background: #334155; }
</style>
