<script>
  import { onMount } from 'svelte';
  import { getSchemaState } from '$lib/stores/schema.svelte.js';
  import { generateSchemaSql } from '$lib/lib/schema.js';
  import SchemaCanvas from '$lib/components/canvas/SchemaCanvas.svelte';
  import ERDCanvas from '$lib/components/canvas/ERDCanvas.svelte';

  let schema = $derived(getSchemaState());
  let sql = $derived(generateSchemaSql(schema.tables));
  let showImport = $state(false);
  let importText = $state('');

  onMount(() => schema.load());

  function handleImport() {
    if (schema.importJSON(importText)) {
      showImport = false;
      importText = '';
    }
  }

  function downloadSQL() {
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const json = schema.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function copySQL() {
    navigator.clipboard?.writeText(sql);
  }

  function schemaAutoLayout() {
    if (schema.tables.length === 0) return;
    const mid = Math.ceil(schema.tables.length / 2);
    const reordered = [
      ...schema.tables.filter((_, i) => i < mid),
      ...schema.tables.filter((_, i) => i >= mid),
    ];
    schema.tables = reordered;
  }
</script>

<div class="schema-designer">
  <section class="schema-toolbar">
    <button class="primary" onclick={() => schema.addTable()}>+ Table</button>
    <button onclick={schemaAutoLayout} title="Auto-arrange tables">Auto Layout</button>
    <button onclick={() => schema.activeTab = 'tutorial'} style="background:#8b5cf6;color:#fff;">Tutorial</button>
    <button onclick={() => schema.undo()} title="Undo (Ctrl+Z)">↩</button>
    <button onclick={() => schema.redo()} title="Redo (Ctrl+Y)">↪</button>
    <span class="schema-separator"></span>
    <button onclick={() => showImport = true}>Import SQL</button>
    <button onclick={exportJSON}>Export JSON</button>
    <span class="schema-separator"></span>
    <span class="schema-dialect-group">
      Dialect:
      <select bind:value={schema.dialect} class="schema-dialect-select">
        <option value="postgresql">PostgreSQL</option>
        <option value="mysql">MySQL</option>
        <option value="sqlite">SQLite</option>
      </select>
    </span>
    <span class="schema-separator"></span>
    <button onclick={() => schema.persist()}>Save Version</button>
    <button class="danger" onclick={() => schema.clearAll()}>Clear All</button>
  </section>

  {#if schema.activeTab === 'tutorial'}
    <div class="schema-tutorial">
      <h2>Schema Designer Tutorial</h2>
      <p>The Schema Designer lets you visually create and manage database tables.</p>
      <ul>
        <li>Click <strong>+ Table</strong> to add a new table.</li>
        <li>Edit column names, types, and set primary keys.</li>
        <li>Use <strong>Auto Layout</strong> to arrange tables neatly.</li>
        <li>Switch to <strong>ERD View</strong> for entity-relationship visualization.</li>
        <li>Import SQL or JSON, export your schema anytime.</li>
        <li>SQL preview auto-generates as you design.</li>
      </ul>
      <button onclick={() => schema.activeTab = 'design'}>Back to Designer</button>
    </div>
  {:else if schema.activeTab === 'design' || schema.activeTab === 'erd'}
    <div class="schema-grid">
      <div class="tables">
        <div class="schema-tabs">
          <button class="schema-tab" class:active={schema.activeTab === 'design'} onclick={() => schema.activeTab = 'design'}>Design</button>
          <button class="schema-tab" class:active={schema.activeTab === 'erd'} onclick={() => schema.activeTab = 'erd'}>ERD</button>
        </div>
        <div class="table-editor">
          {#each schema.tables as table}
            <article>
              <div class="table-header">
                <input value={table.name} oninput={(event) => schema.updateTable(table.id, { name: event.currentTarget.value })} aria-label="Table name" />
                <button class="table-del-btn" onclick={() => schema.deleteTable(table.id)} title="Delete table">✕</button>
              </div>
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
                  <button class="col-del-btn" onclick={() => schema.deleteColumn(table.id, index)} title="Delete column">✕</button>
                </div>
              {/each}
              <button onclick={() => schema.addColumn(table.id)}>Add Column</button>
            </article>
          {/each}
        </div>
      </div>
      <div class="schema-visual">
        {#if schema.activeTab === 'design'}
          <SchemaCanvas tables={schema.tables} />
        {:else}
          <ERDCanvas tables={schema.tables} />
        {/if}
      </div>
    </div>
    <div class="schema-sql-footer">
      <div class="schema-sql-header">
        <span class="schema-sql-title">SQL Preview (auto-generated)</span>
        <div class="schema-sql-actions">
          <button class="schema-copy-btn" onclick={copySQL} title="Copy SQL">Copy</button>
          <button onclick={downloadSQL} title="Download SQL file">Download</button>
        </div>
      </div>
      <pre class="schema-sql-output">{sql || '-- Schema will auto-generate as you design'}</pre>
    </div>
  {/if}
</div>

{#if showImport}
  <div class="schema-import-overlay" onclick={() => showImport = false}>
    <div class="schema-import-modal" onclick={(e) => e.stopPropagation()}>
      <h3>Import JSON</h3>
      <textarea bind:value={importText} class="schema-import-textarea" placeholder={JSON.stringify([{name:"users",columns:[{name:"id",type:"INTEGER",primaryKey:true}]}], null, 2)}></textarea>
      <div class="schema-import-actions">
        <button class="primary" onclick={handleImport}>Import</button>
        <button onclick={() => showImport = false}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .schema-designer { display: flex; flex-direction: column; height: 100%; color: #e2e8f0; }
  .schema-toolbar { display: flex; gap: 6px; padding: 8px 12px; border-bottom: 1px solid #1e293b; flex-wrap: wrap; align-items: center; background: #0f172a; }
  .schema-toolbar button { padding: 5px 10px; font-size: 10px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; cursor: pointer; white-space: nowrap; }
  .schema-toolbar button.primary { border-color: #6366f1; color: #c7d2fe; }
  .schema-toolbar button.danger { border-color: #ef4444; color: #fecaca; }
  .schema-toolbar button:hover { background: #334155; }
  .schema-separator { width: 1px; height: 20px; background: #334155; flex-shrink: 0; }
  .schema-dialect-group { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #94a3b8; }
  .schema-dialect-select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 3px 6px; font-size: 10px; }
  .schema-tabs { display: flex; border-bottom: 1px solid #1e293b; }
  .schema-tab { flex: 1; padding: 6px; font-size: 11px; font-weight: 600; background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; cursor: pointer; }
  .schema-tab.active { color: #e2e8f0; border-bottom-color: #6366f1; }
  .schema-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 0; flex: 1; }
  .tables { overflow: auto; min-height: 0; display: flex; flex-direction: column; }
  .table-editor { display: grid; gap: 12px; padding: 12px; }
  article { padding: 12px; border: 1px solid #334155; border-radius: 10px; background: #111827; }
  .table-header { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }
  .table-header input { flex: 1; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 6px; font-weight: 800; color: #38bdf8; }
  .table-del-btn, .col-del-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 12px; padding: 2px 4px; border-radius: 3px; }
  .table-del-btn:hover, .col-del-btn:hover { background: #450a0a; }
  .column-row { display: grid; grid-template-columns: 1fr 100px auto auto; gap: 6px; align-items: center; margin-bottom: 6px; }
  .column-row input { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px 6px; }
  .column-row select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 4px; }
  .column-row label { color: #94a3b8; font-size: 11px; display: flex; align-items: center; gap: 3px; }
  article > button { margin-top: 8px; background: transparent; border: 1px dashed #334155; color: #64748b; padding: 4px 10px; font-size: 10px; border-radius: 4px; cursor: pointer; }
  article > button:hover { color: #e2e8f0; border-color: #475569; }
  .schema-visual { border-left: 1px solid #1e293b; overflow: auto; background: #0a0f1e; }
  .schema-sql-footer { border-top: 1px solid #1e293b; }
  .schema-sql-header { display: flex; align-items: center; padding: 6px 12px; background: #0f172a; border-bottom: 1px solid #1e293b; }
  .schema-sql-title { font-size: 11px; font-weight: 700; color: #94a3b8; }
  .schema-sql-actions { margin-left: auto; display: flex; gap: 4px; }
  .schema-sql-actions button { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 2px 8px; font-size: 9px; border-radius: 3px; cursor: pointer; }
  .schema-sql-actions button:hover { color: #e2e8f0; }
  .schema-sql-output { margin: 0; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #cbd5e1; white-space: pre-wrap; max-height: 120px; overflow: auto; }
  .schema-tutorial { padding: 24px; overflow: auto; }
  .schema-tutorial h2 { color: #8b5cf6; }
  .schema-tutorial ul { color: #cbd5e1; line-height: 2; }
  .schema-tutorial button { margin-top: 16px; padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
  .schema-import-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .schema-import-modal { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; width: min(500px, 90vw); }
  .schema-import-modal h3 { margin: 0 0 12px; color: #e2e8f0; }
  .schema-import-textarea { width: 100%; height: 200px; box-sizing: border-box; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  .schema-import-actions { display: flex; gap: 8px; margin-top: 12px; }
  .schema-import-actions button { padding: 8px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
  .schema-import-actions .primary { background: #6366f1; color: #fff; border: none; }
  .schema-import-actions button:not(.primary) { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
</style>
