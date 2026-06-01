<script>
  import { onMount } from 'svelte';
  import { getSchemaState } from '$lib/stores/schema.svelte.js';
  import { generateSchemaSql } from '$lib/lib/schema.js';
  import SchemaCanvas from '$lib/components/canvas/SchemaCanvas.svelte';
  import ERDCanvas from '$lib/components/canvas/ERDCanvas.svelte';

  let schema = $derived(getSchemaState());
  let sql = $derived(generateSchemaSql(schema.tables));

  onMount(() => schema.load());
</script>

<div class="schema-designer">
  <section class="schema-toolbar">
    <button onclick={() => schema.addTable()}>Add Table</button>
    <button onclick={() => schema.activeTab = schema.activeTab === 'design' ? 'erd' : 'design'}>
      {schema.activeTab === 'design' ? 'ERD View' : 'Design View'}
    </button>
    <select bind:value={schema.dialect}>
      <option value="postgresql">PostgreSQL</option>
      <option value="mysql">MySQL</option>
      <option value="sqlite">SQLite</option>
    </select>
  </section>
  <section class="schema-grid">
    <div class="tables">
      <div class="table-editor">
        {#each schema.tables as table}
          <article>
            <input value={table.name} oninput={(event) => schema.updateTable(table.id, { name: event.currentTarget.value })} aria-label="Table name" />
            {#each table.columns as column, index}
              <div class="column-row">
                <input value={column.name} oninput={(event) => schema.updateColumn(table.id, index, { name: event.currentTarget.value })} aria-label="Column name" />
                <select value={column.type} onchange={(event) => schema.updateColumn(table.id, index, { type: event.currentTarget.value })}>
                  <option>INTEGER</option>
                  <option>TEXT</option>
                  <option>BOOLEAN</option>
                  <option>TIMESTAMP</option>
                </select>
                <label><input type="checkbox" checked={column.primaryKey} onchange={(event) => schema.updateColumn(table.id, index, { primaryKey: event.currentTarget.checked })} /> PK</label>
              </div>
            {/each}
            <button onclick={() => schema.addColumn(table.id)}>Add Column</button>
          </article>
        {/each}
      </div>
      {#if schema.activeTab === 'design'}
        <SchemaCanvas tables={schema.tables} />
      {:else}
        <ERDCanvas tables={schema.tables} />
      {/if}
    </div>
    <pre>{sql}</pre>
  </section>
</div>

<style>
  .schema-designer { display: flex; flex-direction: column; height: 100%; color: #e2e8f0; }
  .schema-toolbar { display: flex; gap: 8px; padding: 12px; border-bottom: 1px solid #1e293b; }
  button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
  select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 8px; }
  .schema-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 0; flex: 1; }
  .tables { overflow: auto; min-height: 0; }
  .table-editor { display: grid; gap: 12px; padding: 12px; border-bottom: 1px solid #1e293b; }
  article { padding: 12px; border: 1px solid #334155; border-radius: 10px; background: #111827; }
  input, select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 6px; }
  article > input { width: 100%; box-sizing: border-box; margin-bottom: 8px; font-weight: 800; color: #38bdf8; }
  .column-row { display: grid; grid-template-columns: 1fr 120px auto; gap: 6px; align-items: center; margin-bottom: 6px; }
  label { color: #94a3b8; font-size: 12px; display: flex; align-items: center; gap: 4px; }
  pre { margin: 0; padding: 16px; overflow: auto; background: #0a0f1e; border-left: 1px solid #1e293b; white-space: pre-wrap; }
</style>
