<script>
  let { tables = [] } = $props();
</script>

<div class="erd">
  {#each tables as table}
    <article>
      <h3>{table.name}</h3>
      {#each table.columns || [] as column}
        <div>{column.primaryKey ? 'PK' : '  '} {column.name}</div>
      {/each}
    </article>
  {/each}
</div>

<style>
  .erd { display: flex; flex-wrap: wrap; gap: 14px; padding: 16px; background: #0a0f1e; min-height: 280px; }
  article { min-width: 180px; border: 1px solid #334155; border-radius: 10px; background: #111827; color: #cbd5e1; padding: 12px; }
  h3 { margin: 0 0 8px; color: #38bdf8; }
  div { font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 3px 0; }
</style>
