<script>
  import { onMount } from 'svelte';
  import { createDbLabEngine } from '$lib/lib/dblab.js';

  let engine = createDbLabEngine();
  let dbEngine = $state('sqlite');
  let terminalHistory = $state([]);
  let cmdInput = $state('');
  let histIdx = $state(-1);
  let linkingState = $state(null);
  let positions = $state({});
  let forceUpdate = $state(0);
  let vizAreaEl;

  const ENGINES = engine.ENGINES;

  function engineLabel() {
    const e = ENGINES.find(x => x.id === dbEngine);
    return e ? e.label : dbEngine;
  }

  function switchEngine(id) {
    dbEngine = id;
    engine.resetState();
    terminalHistory = [];
    histIdx = -1;
    linkingState = null;
    positions = {};
    addOutput(`● Switched to ${engineLabel()} mode`);
    if (id === 'mongodb') addOutput('Try: db.createCollection("users")');
    else addOutput('Try: CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT)');
    forceUpdate++;
  }

  function loadScenario(key) {
    const s = engine.SCENARIOS[key];
    if (!s) return;
    engine.resetState();
    terminalHistory = [];
    histIdx = -1;
    linkingState = null;
    positions = {};
    if (s.init) s.init();
    addOutput(`✓ Scenario: ${s.name} — ${s.desc}`);
    forceUpdate++;
  }

  function addOutput(text, cls) {
    terminalHistory = [...terminalHistory, { text, cls: cls || '' }];
  }

  function processCommand() {
    const cmd = cmdInput.trim();
    if (!cmd) return;
    const prompt = dbEngine === 'mongodb' ? 'mongodb>' : `${dbEngine}>`;
    addOutput(`${prompt} ${cmd}`);
    const result = engine.processCommand(cmd, dbEngine);
    if (result) {
      if (result.error) addOutput(result.text, 'error');
      else if (result.text) addOutput(result.text, 'result');
      else if (result.msg) addOutput(`✓ ${result.msg}`, 'result');
    }
    cmdInput = '';
    forceUpdate++;
  }

  function handleKeydown(e) {
    const h = engine.getHistory();
    if (e.key === 'Enter') processCommand();
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (h.length === 0) return;
      let idx = histIdx === -1 ? h.length : histIdx;
      if (idx > 0) { idx--; histIdx = idx; cmdInput = h[idx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === -1) return;
      histIdx++;
      if (histIdx >= h.length) { histIdx = h.length; cmdInput = ''; }
      else cmdInput = h[histIdx];
    }
  }

  let tableNames = $derived.by(() => { forceUpdate; return Object.keys(engine.getState().tables).sort(); });
  let collNames = $derived.by(() => { forceUpdate; return Object.keys(engine.getState().collections).sort(); });
  let tables = $derived.by(() => { forceUpdate; const s = engine.getState(); return tableNames.map(n => ({ name: n, ...s.tables[n] })); });
  let collections = $derived.by(() => { forceUpdate; const s = engine.getState(); return collNames.map(n => ({ name: n, ...s.collections[n] })); });

  function computePositions() {
    const names = tableNames;
    const p = { ...positions };
    let lx = 12, ly = 12, rh = 0;
    for (const name of names) {
      if (!p[name]) { p[name] = { x: lx, y: ly }; lx += 300; rh = Math.max(rh, 220); if (lx > 900) { lx = 12; ly += rh + 20; rh = 0; } }
    }
    return p;
  }

  let cardPositions = $derived(computePositions());

  let fkLines = $derived.by(() => {
    forceUpdate;
    if (dbEngine === 'mongodb') return [];
    const lines = [];
    const state = engine.getState();
    const names = Object.keys(state.tables).sort();
    if (names.length === 0) return [];
    const pos = cardPositions;
    const HDR = 28;
    const COL = 22;
    const CW = 260;
    for (const name of names) {
      const tbl = state.tables[name];
      if (!tbl) continue;
      for (const col of tbl.columns) {
        if (!col.fk) continue;
        const srcP = pos[name];
        const tgtP = pos[col.fk.table];
        if (!srcP || !tgtP) continue;
        const colIdx = tbl.columns.indexOf(col);
        const x1 = srcP.x + CW;
        const y1 = srcP.y + HDR + colIdx * COL + COL / 2;
        const tgtTbl = state.tables[col.fk.table];
        const tgtColIdx = tgtTbl ? tgtTbl.columns.findIndex(c => c.name === col.fk.column) : -1;
        const x2 = tgtP.x;
        const y2 = tgtP.y + HDR + (tgtColIdx >= 0 ? tgtColIdx * COL + COL / 2 : COL / 2);
        const offset = Math.max(40, Math.abs(x2 - x1) * 0.35);
        const path = `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
        const color = (ENGINES.find(e => e.id === dbEngine) || {}).color || '#2DD4BF';
        lines.push({ path, color, x1, y1, x2, y2 });
      }
    }
    return lines;
  });

  let dragState = $state(null);

  function startDrag(e, name) {
    if (e.button !== 0) return;
    if (e.target.closest('.dblab-link-handle') || e.target.closest('.dblab-col-badge')) return;
    e.preventDefault();
    const p = cardPositions[name] || { x: 0, y: 0 };
    dragState = { name, startX: e.clientX, startY: e.clientY, startPosX: p.x, startPosY: p.y };
  }

  function onPointerMove(e) {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const np = { ...positions, [dragState.name]: { x: Math.max(0, dragState.startPosX + dx), y: Math.max(0, dragState.startPosY + dy) } };
    positions = np;
    forceUpdate++;
  }

  function onPointerUp() { dragState = null; }

  function handleLinkClick(e) {
    const handle = e.currentTarget;
    const table = handle.dataset.table;
    const col = handle.dataset.col;
    if (!table || !col) return;
    const tbl = engine.getState().tables[table];
    if (!tbl) return;
    const column = tbl.columns.find(c => c.name === col);
    if (!column) return;
    if (column.fk && !linkingState) { column.fk = null; forceUpdate++; return; }
    if (!linkingState) { linkingState = { table, col }; forceUpdate++; return; }
    if (linkingState.table === table && linkingState.col === col) { linkingState = null; forceUpdate++; return; }
    const srcTable = engine.getState().tables[linkingState.table];
    const srcCol = srcTable?.columns.find(c => c.name === linkingState.col);
    if (srcCol) srcCol.fk = { table, column: col };
    linkingState = null;
    forceUpdate++;
  }

  function highlightTable(name) {
    document.querySelectorAll('.dblab-table-card').forEach(c => c.style.outline = c.dataset.name === name ? '2px solid var(--accent, #6366f1)' : 'none');
  }

  let inputEl;

  onMount(() => {
    addOutput(`● DB Lab started — ${engineLabel()} mode`);
    addOutput('Type SQL commands to create and explore your database', 'result');
    addOutput('Try: CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT)', 'result');
  });

  $effect(() => { if (inputEl) inputEl.focus(); });


</script>

<div class="dblab-layout">
  <aside class="dblab-sidebar">
    <div class="dblab-sidebar-section">
      <select class="dblab-select" onchange={(e) => switchEngine(e.currentTarget.value)}>
        {#each ENGINES as e}
          <option value={e.id} selected={e.id === dbEngine}>{e.label}</option>
        {/each}
      </select>
    </div>
    <div class="dblab-sidebar-section">
      <div class="dblab-scenario-bar">
        {#each Object.entries(engine.SCENARIOS) as [key, sc]}
          <button class="dblab-scenario-btn" onclick={() => loadScenario(key)} title={sc.desc}>{sc.name}</button>
        {/each}
      </div>
    </div>
    {#if dbEngine !== 'mongodb'}
      <div class="dblab-sidebar-hint">
        Link FKs: click <b style="color:#fbbf24;">~&gt;</b> on a source column, then click <b style="color:#fbbf24;">~&gt;</b> on the target table column. Click <b style="color:#fbbf24;">FK</b> to remove.
      </div>
    {/if}
    {#if dbEngine === 'mongodb'}
      <div class="dblab-sidebar-hint">
        MongoDB commands:<br>
        <code style="color:#a5f3fc;">db.createCollection("x")</code><br>
        <code style="color:#a5f3fc;">db.x.insertOne({'{..}'})</code><br>
        <code style="color:#a5f3fc;">db.x.find({'{..}'})</code>
      </div>
    {:else}
      <div class="dblab-sidebar-hint">
        SQL reference:<br>
        <code style="color:#a5f3fc;">CREATE TABLE</code><br>
        <code style="color:#a5f3fc;">INSERT INTO</code><br>
        <code style="color:#a5f3fc;">SELECT</code><br>
        <code style="color:#a5f3fc;">ALTER TABLE</code>
      </div>
    {/if}
    <div class="dblab-sidebar-section" style="flex:1;overflow:auto;">
      <div class="dblab-table-list-label">Tables/Collections</div>
      {#if dbEngine === 'mongodb'}
        {#if collections.length === 0}
          <div class="dblab-empty-sidebar">No collections yet</div>
        {:else}
          {#each collections as coll}
            <div class="dblab-sidebar-item" onclick={() => highlightTable(coll.name)} onkeydown={() => {}} role="button" tabindex="0">
              📁 {coll.name} <span class="dblab-sidebar-meta">({coll.documents.length} docs)</span>
            </div>
          {/each}
        {/if}
      {:else}
        {#if tables.length === 0}
          <div class="dblab-empty-sidebar">No tables yet</div>
        {:else}
          {#each tables as tbl}
            <div class="dblab-sidebar-item" onclick={() => highlightTable(tbl.name)} onkeydown={() => {}} role="button" tabindex="0">
              📋 {tbl.name} <span class="dblab-sidebar-meta">({tbl.columns.length} cols, {tbl.rows.length} rows)</span>
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  </aside>
  <div class="dblab-main">
    {#if dbEngine === 'mongodb'}
      <div class="dblab-workspace">
        {#if collections.length === 0}
          <div class="dblab-empty-state">
            <div style="font-size:28px;margin-bottom:8px;">🍃</div>
            <div style="font-size:12px;font-weight:700;color:#64748b;">No collections yet</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Type a MongoDB command below to create your first collection</div>
            <div class="dblab-example-sql">db.createCollection("users")</div>
            <div class="dblab-example-sql" style="margin-top:6px;">db.users.insertOne({'{'} name: "Alice", age: 30 {'}'})</div>
          </div>
        {:else}
          <div class="dblab-coll-cards">
            {#each collections as coll}
              <div class="dblab-coll-card">
                <div class="dblab-tc-header" style="background:#1e3a1e;">
                  <span class="dblab-tc-name">📁 {coll.name}</span>
                  <span class="dblab-tc-count">{coll.documents.length} doc{coll.documents.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="dblab-coll-indexes">Indexes: {coll.indexes.length ? coll.indexes.map(x => x.field).join(', ') : 'none'}</div>
                <div class="dblab-docs-list">
                  {#each coll.documents.slice(0, 5) as doc}
                    <div class="dblab-doc-card">{JSON.stringify(doc.data)}</div>
                  {/each}
                  {#if coll.documents.length > 5}
                    <div class="dblab-doc-more">… and {coll.documents.length - 5} more</div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="dblab-workspace" bind:this={vizAreaEl} onpointermove={onPointerMove} onpointerup={onPointerUp} style="position:relative;">
        {#if tables.length === 0}
          <div class="dblab-empty-state">
            <div style="font-size:28px;margin-bottom:8px;">🗄️</div>
            <div style="font-size:12px;font-weight:700;color:#64748b;">No tables yet</div>
            <div style="font-size:10px;color:#475569;margin-top:4px;">Type a SQL command below to create your first table</div>
            <div class="dblab-example-sql">CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT)</div>
          </div>
        {:else}
          {#each tables as tbl}
            {@const pos = cardPositions[tbl.name] || { x: 12, y: 12 }}
            <div class="dblab-table-card" data-name={tbl.name} id={engine.safeDomId('dblabCard', tbl.name)} style="left:{pos.x}px;top:{pos.y}px;">
              <div class="dblab-tc-header dblab-drag-handle" onmousedown={(e) => startDrag(e, tbl.name)}>
                <span class="dblab-tc-name">{tbl.name}</span>
                <span class="dblab-tc-count">{tbl.rows.length} row{tbl.rows.length !== 1 ? 's' : ''}</span>
              </div>
              <div class="dblab-tc-cols">
                {#each tbl.columns as col}
                  {@const isSource = linkingState?.table === tbl.name && linkingState?.col === col.name}
                  {@const handleLabel = col.fk ? 'FK' : (isSource ? '...' : '~>')}
                  {@const handleTitle = col.fk ? 'Click to remove this FK' : (isSource ? 'Select target column' : 'Start linking')}
                  <div class="dblab-tc-col" class:pk-col={col.pk} class:fk-col={col.fk} class:dblab-linking-source={isSource} class:dblab-linking-valid-target={!!linkingState && !isSource}>
                    <span class="dblab-col-name">{col.name}</span>
                    <span class="dblab-col-type">{col.type}</span>
                    {#if col.pk}<span class="dblab-col-badge pk">PK</span>{/if}
                    {#if col.fk}<span class="dblab-col-badge fk" data-table={tbl.name} data-col={col.name} data-fk-table={col.fk.table} data-fk-col={col.fk.column}>FK</span>{/if}
                    {#if col.notNull}<span class="dblab-col-badge nn">NN</span>{/if}
                    {#if col.unique}<span class="dblab-col-badge uq">UQ</span>{/if}
                    <span class="dblab-link-handle" title={handleTitle} data-table={tbl.name} data-col={col.name} onclick={handleLinkClick}>{handleLabel}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
          <svg class="dblab-fk-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:3;">
            {#each fkLines as line}
              <path d={line.path} fill="none" stroke={line.color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
              <text x={line.x1 + 6} y={line.y1 - 4} fill={line.color} font-size="8" font-weight="700">*</text>
              <text x={line.x2 - 6} y={line.y2 - 4} fill={line.color} font-size="8" font-weight="700" text-anchor="end">1</text>
            {/each}
          </svg>
        {/if}
        {#if linkingState && tables.length > 0}
          <div class="dblab-linking-hint">Linking: {linkingState.table}.{linkingState.col} — click a target column</div>
        {/if}
      </div>
    {/if}
    <div class="dblab-terminal">
      <div class="dblab-terminal-output">
        {#each terminalHistory as entry}
          <div class="dblab-terminal-line" class:dblab-terminal-result={entry.cls === 'result'} class:dblab-terminal-error={entry.cls === 'error'}>
            {entry.text}
          </div>
        {/each}
      </div>
      <div class="dblab-terminal-input-line">
        <span class="dblab-prompt">{dbEngine === 'mongodb' ? 'mongodb' : dbEngine}></span>
        <input bind:this={inputEl} bind:value={cmdInput} onkeydown={handleKeydown} class="dblab-terminal-input" placeholder={dbEngine === 'mongodb' ? 'Type a MongoDB command...' : 'Type a SQL command...'} spellcheck="false" autocomplete="off" />
      </div>
    </div>
  </div>
</div>

<style>
  .dblab-layout { display: flex; flex: 1; overflow: hidden; background: #0f172a; }
  .dblab-sidebar { width: 240px; min-width: 240px; display: flex; flex-direction: column; border-right: 1px solid #1e293b; background: #0f172a; overflow: hidden; }
  .dblab-sidebar-section { padding: 8px; }
  .dblab-select { width:100%; background:#1e293b; color:#f1f5f9; border:1px solid #334155; padding:6px 8px; border-radius:6px; font-size:10px; font-weight:700; outline:none; cursor:pointer; }
  .dblab-scenario-bar { display: flex; gap: 4px; flex-wrap: wrap; }
  .dblab-scenario-btn { padding: 4px 10px; font-size: 10px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #94a3b8; cursor: pointer; }
  .dblab-scenario-btn:hover { border-color: #6366f1; color: #e2e8f0; }
  .dblab-sidebar-hint { margin: 4px 8px; padding: 6px 8px; background: #0a0f1e; border: 1px solid #1e293b; border-radius: 6px; font-size: 9px; color: #64748b; line-height: 1.5; }
  .dblab-table-list-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; padding: 0 8px; }
  .dblab-empty-sidebar { font-size: 9px; color: #475569; font-style: italic; padding: 0 8px; }
  .dblab-sidebar-item { padding: 4px 8px; font-size: 10px; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 4px; }
  .dblab-sidebar-item:hover { background: #1e293b; }
  .dblab-sidebar-meta { color: #64748b; font-size: 8px; }

  .dblab-main { flex: 1; display: flex; flex-direction: column; min-height: 0; }
  .dblab-workspace { flex: 1; overflow: auto; min-height: 0; background: #020617; position: relative; }
  .dblab-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px; }
  .dblab-example-sql { margin-top: 12px; padding: 8px 12px; background: #0f172a; border-radius: 6px; border: 1px solid #1e293b; font-size: 10px; color: #a5f3fc; font-family: monospace; }

  .dblab-table-card { position: absolute; width: 260px; background: #111827; border: 1px solid #334155; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .dblab-tc-header { display: flex; align-items: center; padding: 8px 10px; background: #1e293b; cursor: grab; user-select: none; }
  .dblab-tc-header:active { cursor: grabbing; }
  .dblab-tc-name { font-weight: 800; font-size: 11px; color: #38bdf8; letter-spacing: 0.03em; }
  .dblab-tc-count { margin-left: auto; font-size: 9px; color: #64748b; }
  .dblab-tc-cols { padding: 4px 0; }
  .dblab-tc-col { display: flex; align-items: center; gap: 4px; padding: 5px 10px; font-size: 10px; border-bottom: 1px solid #1e293b; }
  .dblab-tc-col.pk-col { background: rgba(99,102,241,0.06); }
  .dblab-tc-col.fk-col { background: rgba(245,158,11,0.06); }
  .dblab-tc-col.dblab-linking-source { background: rgba(251,191,36,0.12); }
  .dblab-tc-col.dblab-linking-valid-target { background: rgba(99,102,241,0.08); cursor: pointer; }
  .dblab-col-name { color: #e2e8f0; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .dblab-col-type { color: #64748b; font-size: 8px; }
  .dblab-col-badge { font-size: 7px; font-weight: 800; padding: 1px 4px; border-radius: 3px; }
  .dblab-col-badge.pk { background: #6366f1; color: #fff; }
  .dblab-col-badge.fk { background: #f59e0b; color: #000; }
  .dblab-col-badge.nn { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
  .dblab-col-badge.uq { background: #0f766e; color: #ccfbf1; }
  .dblab-link-handle { margin-left: auto; font-size: 8px; font-weight: 700; color: #fbbf24; cursor: pointer; padding: 1px 4px; border-radius: 3px; }
  .dblab-link-handle:hover { background: rgba(251,191,36,0.15); }

  .dblab-coll-cards { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; }
  .dblab-coll-card { width: 280px; background: #111827; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden; }
  .dblab-coll-indexes { padding: 4px 8px; font-size: 8px; color: #64748b; border-bottom: 1px solid #1e293b; }
  .dblab-docs-list { max-height: 240px; overflow: auto; }
  .dblab-doc-card { padding: 6px 8px; font-size: 9px; color: #94a3b8; font-family: monospace; border-bottom: 1px solid #0f172a; white-space: pre-wrap; word-break: break-all; }
  .dblab-doc-more { padding: 6px 8px; font-size: 9px; color: #475569; font-style: italic; }

  .dblab-linking-hint { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fbbf24; padding: 6px 14px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid #fbbf24; }

  .dblab-terminal { flex: 0 0 200px; display: flex; flex-direction: column; border-top: 1px solid #1e293b; background: #0a0f1e; }
  .dblab-terminal-output { flex: 1; overflow-y: auto; padding: 6px 10px; font-family: 'JetBrains Mono', monospace; font-size: 10px; line-height: 1.5; }
  .dblab-terminal-line { white-space: pre-wrap; color: #e2e8f0; }
  .dblab-terminal-result { color: #94a3b8; }
  .dblab-terminal-error { color: #f87171; }
  .dblab-prompt { color: #22c55e; font-weight: 700; font-size: 10px; font-family: 'JetBrains Mono', monospace; }
  .dblab-terminal-input-line { display: flex; align-items: center; gap: 4px; padding: 5px 10px; border-top: 1px solid #1e293b; background: #0a0f1e; }
  .dblab-terminal-input { flex: 1; background: transparent; border: none; outline: none; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
</style>
