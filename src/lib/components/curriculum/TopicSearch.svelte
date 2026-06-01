<script>
  let { searchQuery = $bindable('') } = $props();

  function clear() {
    searchQuery = '';
  }
</script>

<div class="search-wrapper">
  <input type="text" bind:value={searchQuery} placeholder="Search topics..." class="search-input" />
  {#if searchQuery}
    <button class="clear-btn" onclick={clear}>×</button>
  {/if}
</div>

<style>
  .search-wrapper { position: relative; margin-bottom: 8px; }
  .search-input { width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #334155; color: #e2e8f0; padding: 4px 8px; font-size: 11px; border-radius: 3px; outline: none; }
  .search-input:focus { border-color: #6366f1; }
  .search-input::placeholder { color: #475569; }
  .clear-btn { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748b; cursor: pointer; font-size: 14px; line-height: 1; padding: 0 4px; }
  .clear-btn:hover { color: #e2e8f0; }
</style>
