// ── Schema Designer — Full Implementation ──

// ── State ──
let schemaTables = [];
let schemaNextId = 1;
let schemaActiveTab = 'design';
let linkingState = null;
let schemaAbortController = null;
let schemaUndoStack = [];
let schemaRedoStack = [];
let schemaAutoGenerateTimer = null;
let schemaDialect = 'postgresql';

const SCHEMA_STORAGE_KEY = 'dogeslab_schema';
const SCHEMA_VERSIONS_KEY = 'dogeslab_schema_versions'// schemaTypes extracted to content/app-data.json
// dialectTypeMap extracted to content/app-data.json

// ── Undo / Redo ──
function schemaPushState() {
    schemaUndoStack.push(JSON.parse(JSON.stringify(schemaTables)));
    if (schemaUndoStack.length > 50) schemaUndoStack.shift();
    schemaRedoStack = [];
}

function schemaUndo() {
    if (schemaUndoStack.length === 0) return;
    schemaRedoStack.push(JSON.parse(JSON.stringify(schemaTables)));
    schemaTables = schemaUndoStack.pop();
    schemaRender();
}

function schemaRedo() {
    if (schemaRedoStack.length === 0) return;
    schemaUndoStack.push(JSON.parse(JSON.stringify(schemaTables)));
    schemaTables = schemaRedoStack.pop();
    schemaRender();
}

// ── Toggle / Init ──
function toggleSchemaDesigner() {
    const el = document.getElementById('schemaDesigner');
    el.classList.toggle('open');
    const editor = document.getElementById('editor');
    editor.style.display = el.classList.contains('open') ? 'none' : 'block';
    if (el.classList.contains('open') && schemaTables.length === 0) {
        if (!schemaLoad()) {
            schemaAddTable();
            schemaAddTable();
        } else {
            schemaRender();
        }
    }
}

// ── CRUD: Tables ──
function schemaAddTable() {
    schemaPushState();
    const id = schemaNextId++;
    schemaTables.push({
        id, name: `table_${id}`, x: 10 + (schemaTables.length * 20) % 200,
        y: 10 + Math.floor(schemaTables.length / 3) * 40, comment: '',
        cols: [
            { name: 'id', type: 'SERIAL', pk: true, fk: null, notNull: true, default: null, unique: false, comment: '' },
            { name: 'name', type: 'VARCHAR(255)', pk: false, fk: null, notNull: false, default: null, unique: false, comment: '' }
        ],
        indexes: []
    });
    schemaRender();
}

function schemaRemoveTable(id) {
    schemaPushState();
    schemaTables = schemaTables.filter(t => t.id !== id);
    schemaTables.forEach(t => {
        t.cols.forEach(c => {
            if (c.fk && c.fk.tableId === id) c.fk = null;
        });
    });
    schemaRender();
}

function schemaRenameTable(id, name) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === id);
    if (table) table.name = name.replace(/[^a-zA-Z0-9_]/g, '_') || 'table_' + id;
    schemaRender();
}

// ── CRUD: Columns ──
function schemaAddCol(tableId) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    table.cols.push({ name: 'col', type: 'TEXT', pk: false, fk: null, notNull: false, default: null, unique: false, comment: '' });
    schemaRender();
}

function schemaRemoveCol(tableId, colIdx) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table || table.cols.length <= 1) return;
    schemaTables.forEach(t => {
        t.cols.forEach(c => {
            if (c.fk && c.fk.tableId === tableId && c.fk.colIdx === colIdx) c.fk = null;
            if (c.fk && c.fk.colIdx > colIdx && c.fk.tableId === tableId) c.fk.colIdx--;
        });
    });
    table.cols.splice(colIdx, 1);
    schemaRender();
}

function schemaUpdateCol(tableId, colIdx, field, value) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    if (field === 'name') value = value.replace(/[^a-zA-Z0-9_]/g, '_');
    if (field === 'default' && value === '') value = null;
    table.cols[colIdx][field] = value;
    schemaRender();
}

function schemaTogglePK(tableId, colIdx) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    table.cols[colIdx].pk = !table.cols[colIdx].pk;
    schemaRender();
}

function schemaToggleColFlag(tableId, colIdx, field) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    table.cols[colIdx][field] = !table.cols[colIdx][field];
    schemaRender();
}

// ── CRUD: Indexes ──
function schemaAddIndex(tableId) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const idxName = `idx_${table.name}_${table.indexes.length + 1}`;
    table.indexes.push({ name: idxName, cols: [], unique: false });
    schemaRender();
}

function schemaRemoveIndex(tableId, idxIdx) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    table.indexes.splice(idxIdx, 1);
    schemaRender();
}

function schemaUpdateIndex(tableId, idxIdx, field, value) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    if (field === 'name') value = value.replace(/[^a-zA-Z0-9_]/g, '_');
    table.indexes[idxIdx][field] = value;
    schemaRender();
}

function schemaToggleIndexCol(tableId, idxIdx, colName) {
    schemaPushState();
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const idx = table.indexes[idxIdx];
    const pos = idx.cols.indexOf(colName);
    if (pos > -1) idx.cols.splice(pos, 1);
    else idx.cols.push(colName);
    schemaRender();
}

// ── Persistence ──
function schemaSave() {
    try { localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schemaTables)); } catch {}
}

function schemaLoad() {
    try {
        const saved = localStorage.getItem(SCHEMA_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                schemaTables = parsed;
                const maxId = parsed.reduce((m, t) => Math.max(m, t.id || 0), 0);
                schemaNextId = maxId + 1;
                return true;
            }
        }
    } catch {}
    return false;
}

function schemaLoadFromData(data) {
    schemaPushState();
    schemaTables = data;
    const maxId = data.reduce((m, t) => Math.max(m, t.id || 0), 0);
    schemaNextId = maxId + 1;
    schemaRender();
}

// ── Version History ──
function schemaSaveVersion() {
    const name = prompt('Name this schema version:');
    if (!name) return;
    schemaPushState();
    const versions = JSON.parse(localStorage.getItem(SCHEMA_VERSIONS_KEY) || '{}');
    versions[name] = JSON.parse(JSON.stringify(schemaTables));
    localStorage.setItem(SCHEMA_VERSIONS_KEY, JSON.stringify(versions));
    schemaRenderVersionList();
}

function schemaLoadVersion(name) {
    if (!confirm(`Restore version "${name}"? Current schema will be saved to undo stack.`)) return;
    schemaPushState();
    const versions = JSON.parse(localStorage.getItem(SCHEMA_VERSIONS_KEY) || '{}');
    if (versions[name]) {
        schemaTables = JSON.parse(JSON.stringify(versions[name]));
        const maxId = schemaTables.reduce((m, t) => Math.max(m, t.id || 0), 0);
        schemaNextId = maxId + 1;
        schemaRender();
    }
}

function schemaDeleteVersion(name) {
    const versions = JSON.parse(localStorage.getItem(SCHEMA_VERSIONS_KEY) || '{}');
    delete versions[name];
    localStorage.setItem(SCHEMA_VERSIONS_KEY, JSON.stringify(versions));
    schemaRenderVersionList();
}

function schemaRenderVersionList() {
    const container = document.getElementById('schemaVersionList');
    if (!container) return;
    const versions = JSON.parse(localStorage.getItem(SCHEMA_VERSIONS_KEY) || '{}');
    const names = Object.keys(versions);
    if (names.length === 0) { container.innerHTML = '<div style="color:#64748b;font-size:10px;">No saved versions</div>'; return; }
    container.innerHTML = names.map(n =>
        `<div class="schema-version-item"><span onclick="schemaLoadVersion('${n.replace(/'/g, "\\'")}')" style="cursor:pointer;flex:1;">${n}</span><button class="st-del-col" onclick="schemaDeleteVersion('${n.replace(/'/g, "\\'")}')">✕</button></div>`
    ).join('');
}

// ── Import / Export ──
function schemaOpenImport() {
    document.getElementById('schemaImportOverlay').classList.add('open');
    document.getElementById('schemaImportText').value = '';
    document.getElementById('schemaImportText').focus();
}

function schemaCloseImport() {
    document.getElementById('schemaImportOverlay').classList.remove('open');
}

function schemaImportSQL() {
    const text = document.getElementById('schemaImportText').value.trim();
    if (!text) return;
    try {
        const result = schemaParseSQL(text);
        if (result.length === 0) { alert('No valid CREATE TABLE statements found.'); return; }
        schemaPushState();
        schemaTables = result;
        const maxId = result.reduce((m, t) => Math.max(m, t.id || 0), 0);
        schemaNextId = maxId + 1;
        schemaCloseImport();
        schemaRender();
    } catch (e) { alert('Import error: ' + e.message); }
}

function schemaParseSQL(sql) {
    const tables = [];
    let idCounter = 1;
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?(\w+)`?\.)?`?(\w+)`?\s*\(/gi;
    let match;
    while ((match = tableRegex.exec(sql)) !== null) {
        const schemaName = match[1] || '';
        const tableNameRaw = match[2] || match[1] || '';
        const tableName = tableNameRaw.replace(/`/g, '');
        let depth = 1;
        let bodyStart = tableRegex.lastIndex;
        let bodyEnd = bodyStart;
        while (depth > 0 && bodyEnd < sql.length) {
            if (sql[bodyEnd] === '(') depth++;
            else if (sql[bodyEnd] === ')') depth--;
            if (depth > 0) bodyEnd++;
        }
        const body = sql.slice(bodyStart, bodyEnd);
        const cols = [];
        const tPkCols = [];
        const tFks = [];
        const indexes = [];

        const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--') && !l.startsWith('#'));

        for (let line of lines) {
            line = line.replace(/,$/, '').trim();
            if (!line) continue;

            const fkMatch = line.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(?:`?(\w+)`?\.)?`?(\w+)`?\s*\(([^)]+)\)/i);
            if (fkMatch) {
                tFks.push({ col: fkMatch[1].replace(/`/g, '').trim(), refTable: (fkMatch[3] || fkMatch[2]).replace(/`/g, ''), refCol: fkMatch[4].replace(/`/g, '').trim() });
                continue;
            }

            const tPkMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
            if (tPkMatch) {
                tPkCols.push(...tPkMatch[1].split(',').map(c => c.replace(/`/g, '').trim()));
                continue;
            }

            const tUqMatch = line.match(/UNIQUE\s*\(([^)]+)\)/i);
            if (tUqMatch) {
                const uqCols = tUqMatch[1].split(',').map(c => c.replace(/`/g, '').trim());
                indexes.push({ name: `uq_${tableName}_${uqCols[0]}`, cols: uqCols, unique: true });
                continue;
            }

            const idxMatch = line.match(/(?:UNIQUE\s+)?INDEX\s+(?:`?(\w+)`?)?\s*(?:USING\s+\w+\s*)?\(([^)]+)\)/i);
            if (idxMatch) {
                const idxUq = line.toUpperCase().includes('UNIQUE');
                indexes.push({ name: idxMatch[1] || `idx_${tableName}_${idCounter}`, cols: idxMatch[2].split(',').map(c => c.replace(/`/g, '').trim()), unique: idxUq });
                continue;
            }

            const colMatch = line.match(/^`?(\w+)`?\s+(\w+(?:\s*\([^)]*\))?)\s*(.*)/i);
            if (!colMatch) continue;

            const colName = colMatch[1].replace(/`/g, '');
            let colType = colMatch[2].replace(/\s*\((\d+)\)/, '($1)').toUpperCase();
            const rest = colMatch[3].toUpperCase();

            if (colType === 'SERIAL' || colType === 'BIGSERIAL') colType = 'SERIAL';
            else if (colType === 'INT' || colType === 'INTEGER' || colType === 'INT4') colType = 'INT';
            else if (colType.startsWith('VARCHAR')) colType = colType.replace(/VARCHAR\s*\((\d+)\)/, 'VARCHAR($1)');
            else if (colType.startsWith('CHAR')) colType = 'VARCHAR(255)';
            else if (colType === 'BOOLEAN' || colType === 'BOOL') colType = 'BOOLEAN';
            else if (colType === 'FLOAT' || colType === 'FLOAT8' || colType === 'REAL') colType = 'FLOAT';
            else if (colType === 'DOUBLE' || colType.startsWith('DOUBLE PRECISION')) colType = 'DECIMAL';
            else if (colType === 'NUMERIC') colType = 'DECIMAL';
            else if (colType === 'TINYINT' || colType === 'SMALLINT') colType = 'INT';
            else if (colType === 'BIGINT') colType = 'BIGINT';
            else if (colType === 'TIMESTAMP' || colType === 'TIMESTAMPTZ' || colType === 'DATETIME') colType = 'TIMESTAMP';
            else if (colType === 'UUID') colType = 'UUID';
            else if (colType === 'JSONB' || colType === 'JSON') colType = 'JSONB';
            else if (colType === 'TEXT' || colType === 'LONGTEXT' || colType === 'MEDIUMTEXT') colType = 'TEXT';
            else if (colType.startsWith('BLOB') || colType.startsWith('BINARY')) colType = 'TEXT';

            const isPk = rest.includes('PRIMARY KEY') || rest.includes('PRIMARYKEY');
            const isAutoInc = rest.includes('AUTO_INCREMENT') || rest.includes('AUTOINCREMENT') || rest.includes('GENERATED BY DEFAULT AS IDENTITY');
            const notNull = rest.includes('NOT NULL');
            const unique = rest.includes('UNIQUE');

            let defaultVal = null;
            const defMatch = rest.match(/DEFAULT\s+(['"]?)([^'"\s,)]+)\1/i);
            if (defMatch) defaultVal = defMatch[2];

            cols.push({
                name: colName, type: colType, pk: isPk || isAutoInc, fk: null,
                notNull: notNull || isPk, default: defaultVal, unique, comment: ''
            });
        }

        for (const pk of tPkCols) {
            const found = cols.find(c => c.name === pk);
            if (found) found.pk = true;
        }

        for (const fk of tFks) {
            const found = cols.find(c => c.name === fk.col);
            if (found) {
                const tgtTable = tables.find(t => t.name === fk.refTable);
                if (tgtTable) {
                    const tgtCol = tgtTable.cols.findIndex(c => c.name === fk.refCol);
                    if (tgtCol > -1) found.fk = { tableId: tgtTable.id, colIdx: tgtCol };
                }
            }
        }

        tables.push({
            id: idCounter++, name: tableName, comment: '',
            x: 10 + (tables.length * 20) % 200, y: 10 + Math.floor(tables.length / 3) * 40,
            cols, indexes
        });
    }
    return tables;
}

function schemaExportJSON() {
    const data = JSON.stringify(schemaTables, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
}

function schemaImportJSON() {
    const input = document.getElementById('schemaJSONInput');
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data) || data.length === 0) { alert('Invalid schema file.'); return; }
            for (const t of data) {
                if (!t || typeof t !== 'object' || typeof t.name !== 'string' || !Array.isArray(t.cols)) {
                    alert('Invalid schema: each table must have a name (string) and cols (array).');
                    return;
                }
            }
            schemaPushState();
            schemaTables = data;
            const maxId = data.reduce((m, t) => Math.max(m, t.id || 0), 0);
            schemaNextId = maxId + 1;
            schemaRender();
        } catch (err) { alert('Invalid JSON file: ' + err.message); }
    };
    reader.readAsText(input.files[0]);
}

function schemaCopySQL() {
    const el = document.getElementById('schemaSQLOutput');
    navigator.clipboard.writeText(el.textContent).then(() => {
        const btn = document.querySelector('.schema-copy-btn');
        if (btn) { const t = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = t, 1500); }
    });
}

function schemaDownloadSQL() {
    const sql = document.getElementById('schemaSQLOutput').textContent;
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'schema.sql';
    a.click();
    URL.revokeObjectURL(url);
}

// ── Clear All ──
function schemaClearAll() {
    if (schemaTables.length === 0) return;
    if (!confirm('Clear all tables?')) return;
    schemaPushState();
    schemaTables = [];
    schemaRender();
    document.getElementById('schemaSQLOutput').textContent = '-- Schema cleared';
}

// ── Rendering (Design View) ──
function schemaRender() {
    if (schemaAbortController) schemaAbortController.abort();
    schemaAbortController = new AbortController();
    schemaSave();
    const signal = schemaAbortController.signal;

    if (schemaActiveTab === 'erd') { schemaRenderERD(); return; }

    const canvas = document.getElementById('schemaCanvas');
    canvas.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.overflow = 'visible';
    svg.id = 'schemaLineLayer';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = '<marker id="fkArrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#f59e0b"/></marker><marker id="fkCircle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><circle cx="4" cy="4" r="3" fill="none" stroke="#f59e0b" stroke-width="1.5"/></marker>';
    svg.appendChild(defs);
    canvas.appendChild(svg);

    for (const table of schemaTables) {
        const el = document.createElement('div');
        el.className = 'schema-table';
        el.style.left = table.x + 'px';
        el.style.top = table.y + 'px';
        el.dataset.tableId = table.id;

        let html = `<div class="st-header">
            <input value="${table.name}" onchange="schemaRenameTable(${table.id}, this.value)" spellcheck="false" title="${table.comment || ''}">
            <button class="st-del" onclick="schemaRemoveTable(${table.id})" title="Remove table">✕</button>
        </div><div class="st-body">`;

        table.cols.forEach((col, i) => {
            const pkBadge = col.pk ? 'PK' : '';
            const fkBadge = col.fk ? 'FK' : '';
            const isFKTarget = schemaTables.some(t => t.cols.some(c => c.fk && c.fk.tableId === table.id && c.fk.colIdx === i));
            const hasFK = !!col.fk;
            const fkLabel = col.fk ? (() => { const t = schemaTables.find(x => x.id === col.fk.tableId); return t && t.cols[col.fk.colIdx] ? `${t.name}.${t.cols[col.fk.colIdx].name}` : 'FK'; })() : '';
            const rowClasses = ['st-row'];
            if (isFKTarget) rowClasses.push('fk-highlight');
            if (hasFK) rowClasses.push('has-fk');
            if (col.pk) rowClasses.push('st-row-pk');
            const handleContent = col.pk ? 'PK' : (col.fk ? 'FK' : '~>');
            const handleTitle = col.fk ? `FK → ${fkLabel} (click to remove)` : (col.pk ? 'Drag to link this PK as FK target' : 'Drag to another column to create FK');

            html += `<div class="${rowClasses.join(' ')}" data-table-id="${table.id}" data-col-idx="${i}">
                <span class="st-pk schema-fk-handle" title="${handleTitle}">${handleContent}</span>
                <input value="${col.name}" onchange="schemaUpdateCol(${table.id}, ${i}, 'name', this.value)" spellcheck="false" placeholder="col" class="st-col-name">
                <select onchange="schemaUpdateCol(${table.id}, ${i}, 'type', this.value)" class="st-col-type">
                    ${schemaTypes.map(t => `<option ${t === col.type ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
                <span class="st-constraint ${col.notNull ? 'active' : ''}" onclick="schemaToggleColFlag(${table.id}, ${i}, 'notNull')" title="NOT NULL">NN</span>
                <span class="st-constraint ${col.unique ? 'active' : ''}" onclick="schemaToggleColFlag(${table.id}, ${i}, 'unique')" title="UNIQUE">UQ</span>
                <span class="st-checkbox" title="Primary Key"><input type="checkbox" ${col.pk ? 'checked' : ''} onchange="schemaTogglePK(${table.id}, ${i})"></span>
                <button class="st-del-col" onclick="schemaRemoveCol(${table.id}, ${i})" title="Remove column">✕</button>
            </div>`;
            html += `<div class="st-row-extra-toggle" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'':'none'" style="cursor:pointer;font-size:9px;color:#64748b;padding:0 0 2px 24px;">+ default/comment</div>`;
            html += `<div class="st-row-extra" data-table-id="${table.id}" data-col-idx="${i}" style="${col.default !== null || col.comment ? '' : 'display:none'}">
                <span class="st-extra-label">default:</span> <input class="st-default-input" value="${col.default || ''}" placeholder="NULL" onchange="schemaUpdateCol(${table.id}, ${i}, 'default', this.value)" spellcheck="false">
                <span class="st-extra-label">comment:</span> <input class="st-comment-input" value="${col.comment || ''}" placeholder="" onchange="schemaUpdateCol(${table.id}, ${i}, 'comment', this.value)" spellcheck="false">
            </div>`;
        });

        html += `</div><div class="st-add-row">
            <input placeholder="col name" id="newCol-${table.id}" onkeydown="if(event.key==='Enter')schemaAddCol(${table.id})">
            <button onclick="schemaAddCol(${table.id})" title="Add column">+</button>
        </div>`;

        if (table.indexes.length > 0) {
            html += `<div class="st-indexes">`;
            for (let ii = 0; ii < table.indexes.length; ii++) {
                const idx = table.indexes[ii];
                const colTags = idx.cols.map(c => `<span class="st-index-col">${c}</span>`).join(' ');
                html += `<div class="st-index-row">
                    <span class="st-index-name">${idx.unique ? 'UQ' : 'IDX'}</span>
                    <input value="${idx.name}" onchange="schemaUpdateIndex(${table.id}, ${ii}, 'name', this.value)" spellcheck="false" class="st-index-name-input">
                    <span class="st-index-cols">${colTags || '<span style="color:#475569">(select cols)</span>'}</span>
                    <button class="st-del-col" onclick="schemaRemoveIndex(${table.id}, ${ii})" title="Remove index">✕</button>
                </div>`;
            }
            html += `</div>`;
        }
        html += `<div class="st-table-actions">
            <button class="st-sm-btn" onclick="schemaAddIndex(${table.id})" title="Add index">+ Index</button>
            <button class="st-sm-btn" onclick="schemaToggleComment(${table.id})" title="Edit table comment">+ Comment</button>
        </div>`;

        el.innerHTML = html;

        let isDragging = false, startX, startY, origX, origY;
        el.addEventListener('mousedown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.closest('.st-row-extra') || e.target.closest('.st-indexes') || e.target.closest('.st-table-actions') || e.target.closest('.schema-fk-handle')) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            origX = table.x; origY = table.y;
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            table.x = origX + (e.clientX - startX);
            table.y = origY + (e.clientY - startY);
            el.style.left = table.x + 'px';
            el.style.top = table.y + 'px';
            schemaDrawRelationLines();
        }, { signal });
        document.addEventListener('mouseup', () => { isDragging = false; }, { signal });

        canvas.appendChild(el);
    }
    schemaDrawRelationLines();

    if (linkingState) {
        const srcRow = canvas.querySelector(`.st-row[data-table-id="${linkingState.tableId}"][data-col-idx="${linkingState.colIdx}"]`);
        if (srcRow) {
            srcRow.classList.add('linking-source');
            const h = srcRow.querySelector('.schema-fk-handle');
            if (h) h.classList.add('linking');
        }
        document.querySelectorAll('.st-row').forEach(r => {
            const tid = parseInt(r.dataset.tableId);
            if (!isNaN(tid) && tid !== linkingState.tableId) r.classList.add('linking-valid-target');
        });
    }

    schemaAutoGenerateSQL();
}

function schemaToggleComment(tableId) {
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const comment = prompt('Table comment:', table.comment || '');
    if (comment === null) return;
    schemaPushState();
    table.comment = comment;
    schemaRender();
}

// ── Relation Lines ──
function schemaDrawRelationLines() {
    const svg = document.getElementById('schemaLineLayer');
    if (!svg) return;
    const oldGroup = svg.querySelector('g');
    if (oldGroup) oldGroup.remove();
    const canvas = document.getElementById('schemaCanvas');
    if (canvas.offsetParent === null) return;
    const canvasRect = canvas.getBoundingClientRect();
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.pointerEvents = 'none';

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];
    let colorIdx = 0;

    for (const table of schemaTables) {
        for (const col of table.cols) {
            if (!col.fk) continue;
            const targetTable = schemaTables.find(t => t.id === col.fk.tableId);
            if (!targetTable) continue;
            const targetCol = targetTable.cols[col.fk.colIdx];
            if (!targetCol) continue;
            const srcEl = canvas.querySelector(`[data-table-id="${table.id}"]`);
            const tgtEl = canvas.querySelector(`[data-table-id="${targetTable.id}"]`);
            if (!srcEl || !tgtEl) continue;
            const sr = srcEl.getBoundingClientRect();
            const tr = tgtEl.getBoundingClientRect();
            const srcRows = srcEl.querySelectorAll('.st-row');
            const tgtRows = tgtEl.querySelectorAll('.st-row');
            const srcRow = srcRows[table.cols.indexOf(col)];
            const tgtRow = tgtRows[col.fk.colIdx];
            let y1 = sr.top + sr.height / 2 - canvasRect.top;
            let x1 = sr.right - canvasRect.left;
            if (srcRow) {
                const srRect = srcRow.getBoundingClientRect();
                y1 = srRect.top + srRect.height / 2 - canvasRect.top;
                x1 = srRect.right - canvasRect.left;
            }
            let y2 = tr.top + tr.height / 2 - canvasRect.top;
            let x2 = tr.left - canvasRect.left;
            if (tgtRow) {
                const trRect = tgtRow.getBoundingClientRect();
                y2 = trRect.top + trRect.height / 2 - canvasRect.top;
                x2 = trRect.left - canvasRect.left;
            }
            const dx = Math.abs(x2 - x1);
            const midX = (x1 + x2) / 2;
            const offset = Math.max(40, dx * 0.4);
            const c = colors[colorIdx % colors.length];
            colorIdx++;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`);
            path.setAttribute('stroke', c);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-start', 'url(#fkCircle)');
            path.setAttribute('marker-end', 'url(#fkArrow)');
            group.appendChild(path);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x1 + 6);
            label.setAttribute('y', y1 + 3);
            label.setAttribute('fill', c);
            label.setAttribute('font-size', '8');
            label.setAttribute('font-weight', 'bold');
            label.textContent = '*';
            group.appendChild(label);

            const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label2.setAttribute('x', x2 - 6);
            label2.setAttribute('y', y2 + 3);
            label2.setAttribute('fill', c);
            label2.setAttribute('font-size', '8');
            label2.setAttribute('font-weight', 'bold');
            label2.setAttribute('text-anchor', 'end');
            label2.textContent = '1';
            group.appendChild(label2);
        }
    }
    svg.appendChild(group);
}

// ── FK Linking ──
function linkClear() {
    if (linkingState) {
        linkingState = null;
        document.querySelectorAll('.st-row.linking-source, .st-row.linking-valid-target, .schema-fk-handle.linking, .erd-row.erd-linking-source, .erd-row.erd-linking-valid-target')
            .forEach(r => r.classList.remove('linking-source', 'linking-valid-target', 'linking', 'erd-linking-source', 'erd-linking-valid-target'));
        document.body.style.cursor = '';
    }
}

function linkStart(tableId, colIdx) {
    linkClear();
    linkingState = { tableId, colIdx };
    document.body.style.cursor = 'crosshair';
    if (schemaActiveTab === 'erd') schemaRenderERD();
    else schemaRender();
}

function linkEnd(targetTableId, targetColIdx) {
    if (!linkingState) return;
    if (targetTableId === linkingState.tableId) { linkClear(); return; }
    schemaPushState();
    const srcTable = schemaTables.find(t => t.id === linkingState.tableId);
    const srcCol = srcTable?.cols[linkingState.colIdx];
    const tgtTable = schemaTables.find(t => t.id === targetTableId);
    const tgtCol = tgtTable?.cols[targetColIdx];
    if (srcCol && tgtCol) {
        srcCol.fk = { tableId: targetTableId, colIdx: targetColIdx };
    } else if (!tgtCol) {
        alert('Could not create FK: target column not found.');
    }
    linkClear();
    schemaRender();
}

function handleDesignHandleClick(e) {
    const handle = e.target.closest('.schema-fk-handle');
    if (!handle) return;
    if (!document.getElementById('schemaDesigner').classList.contains('open')) return;
    e.preventDefault();
    e.stopPropagation();
    const row = handle.closest('[data-col-idx]');
    if (!row) return;
    const tableId = parseInt(row.dataset.tableId);
    const colIdx = parseInt(row.dataset.colIdx);
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const col = table.cols[colIdx];
    if (!col) return;

    if (linkingState) {
        const tColIdx = parseInt(row.dataset.colIdx);
        linkEnd(tableId, tColIdx);
        return;
    }

    if (col.fk) { col.fk = null; schemaPushState(); schemaRender(); return; }

    linkStart(tableId, colIdx);
}

// ── Tab Switching ──
function schemaSwitchTab(tab) {
    schemaActiveTab = tab;
    linkClear();
    document.getElementById('schemaTabDesign').classList.toggle('active', tab === 'design');
    document.getElementById('schemaTabErd').classList.toggle('active', tab === 'erd');
    document.getElementById('schemaCanvas').style.display = tab === 'design' ? 'flex' : 'none';
    document.getElementById('erdCanvas').style.display = tab === 'erd' ? 'block' : 'none';
    document.getElementById('schemaDesignTabBtn').style.display = tab === 'design' ? 'flex' : 'none';
    if (tab === 'erd') schemaRenderERD();
    else schemaRender();
}

// ── Auto Layout ──
function schemaAutoLayout() {
    if (schemaTables.length === 0) return;
    const padding = 30;
    const tableW = 280;
    const gapX = 60;
    const gapY = 60;
    const cols = Math.max(1, Math.ceil(Math.sqrt(schemaTables.length)));
    schemaTables.forEach((table, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        table.x = padding + c * (tableW + gapX);
        table.y = padding + r * (gapY + 120);
    });
    schemaRender();
}

// ── ERD View ──
function erdHandleRowClick(e) {
    const row = e.target.closest('.erd-row');
    if (!row) return;
    const tableEl = row.closest('.erd-table');
    if (!tableEl) return;
    const tableId = parseInt(tableEl.dataset.tableId);
    if (isNaN(tableId)) return;
    const colIdx = parseInt(row.dataset.colIdx);
    if (isNaN(colIdx)) return;
    const table = schemaTables.find(t => t.id === tableId);
    if (!table) return;
    const col = table.cols[colIdx];
    if (!col) return;

    if (linkingState) {
        linkEnd(tableId, colIdx);
        return;
    }

    if (col.fk) { col.fk = null; schemaPushState(); schemaRenderERD(); schemaRender(); return; }

    linkStart(tableId, colIdx);
}

function schemaRenderERD() {
    if (schemaAbortController) schemaAbortController.abort();
    schemaAbortController = new AbortController();
    schemaSave();
    const signal = schemaAbortController.signal;

    const canvas = document.getElementById('erdCanvas');
    canvas.innerHTML = '';
    if (schemaTables.length === 0) {
        canvas.innerHTML = '<div style="color:#64748b; padding:40px; text-align:center; font-size:13px;">No tables defined. Switch to Design tab to create a schema.</div>';
        return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.overflow = 'visible';
    svg.id = 'erdLineLayer';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = '<marker id="erdArrow" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#f59e0b"/></marker><marker id="erdCircle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><circle cx="4" cy="4" r="3" fill="none" stroke="#f59e0b" stroke-width="1.5"/></marker>';
    svg.appendChild(defs);
    canvas.appendChild(svg);

    schemaTables.forEach((table) => {
        const el = document.createElement('div');
        el.className = 'erd-table';
        el.style.left = table.x + 'px';
        el.style.top = table.y + 'px';
        el.dataset.tableId = table.id;

        const body = table.cols.map((c, i) => {
            const isPK = c.pk;
            const isFK = !!c.fk;
            const tag = isPK ? '<span class="erd-pk">PK</span>' : (isFK ? '<span class="erd-fk">FK</span>' : '<span class="erd-pk"></span>');
            const cls = ['erd-row'];
            if (c.fk) cls.push('erd-has-fk');
            if (c.notNull) cls.push('erd-nn');
            const flags = [];
            if (c.notNull) flags.push('NN');
            if (c.unique) flags.push('UQ');
            if (c.default !== null) flags.push('DF');
            const flagHtml = flags.length ? `<span class="erd-flags">${flags.join(' ')}</span>` : '';
            return `<div class="${cls.join(' ')}" data-col-idx="${i}">${tag}<span class="erd-name">${c.name}</span><span class="erd-type">${c.type}</span>${flagHtml}</div>`;
        }).join('');

        el.innerHTML = `<div class="erd-header"><span class="erd-icon">▦</span>${table.name}${table.comment ? `<span class="erd-comment"> — ${table.comment}</span>` : ''}</div><div class="erd-body">${body}</div>`;

        let isDragging = false, startX, startY, origX, origY;
        el.addEventListener('mousedown', function(e) {
            if (e.target.closest('.erd-row')) return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            origX = table.x; origY = table.y;
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            table.x = origX + (e.clientX - startX);
            table.y = origY + (e.clientY - startY);
            el.style.left = table.x + 'px';
            el.style.top = table.y + 'px';
            schemaDrawERDLines();
        }, { signal });
        document.addEventListener('mouseup', function() { isDragging = false; }, { signal });

        canvas.appendChild(el);
    });

    canvas.removeEventListener('click', erdHandleRowClick);
    canvas.addEventListener('click', erdHandleRowClick);

    if (linkingState) {
        const srcRow = canvas.querySelector(`.erd-row[data-col-idx="${linkingState.colIdx}"]`);
        if (srcRow) {
            const parentTable = srcRow.closest('.erd-table');
            if (parentTable && parseInt(parentTable.dataset.tableId) === linkingState.tableId) {
                srcRow.classList.add('erd-linking-source');
            }
        }
        canvas.querySelectorAll('.erd-row').forEach(r => {
            const parent = r.closest('.erd-table');
            if (parent && parseInt(parent.dataset.tableId) !== linkingState.tableId) {
                r.classList.add('erd-linking-valid-target');
            }
        });
    }

    setTimeout(() => schemaDrawERDLines(), 50);
}

function schemaDrawERDLines() {
    const erdSvg = document.getElementById('erdLineLayer');
    if (!erdSvg) return;
    const oldGroup = erdSvg.querySelector('g');
    if (oldGroup) oldGroup.remove();
    const canvas = document.getElementById('erdCanvas');
    const cr = canvas.getBoundingClientRect();
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.pointerEvents = 'none';
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];
    let colorIdx = 0;

    for (const table of schemaTables) {
        for (const col of table.cols) {
            if (!col.fk) continue;
            const targetTable = schemaTables.find(t => t.id === col.fk.tableId);
            if (!targetTable) continue;
            const srcEl = canvas.querySelector(`.erd-table[data-table-id="${table.id}"]`);
            const tgtEl = canvas.querySelector(`.erd-table[data-table-id="${targetTable.id}"]`);
            if (!srcEl || !tgtEl) continue;
            const sr = srcEl.getBoundingClientRect();
            const tr = tgtEl.getBoundingClientRect();
            const srcRows = srcEl.querySelectorAll('.erd-row');
            const tgtRows = tgtEl.querySelectorAll('.erd-row');
            const srcRow = srcRows[table.cols.indexOf(col)];
            const tgtRow = tgtRows[col.fk.colIdx];
            let y1 = sr.top + sr.height / 2 - cr.top;
            let x1 = sr.right - cr.left;
            if (srcRow) { const r2 = srcRow.getBoundingClientRect(); y1 = r2.top + r2.height / 2 - cr.top; x1 = r2.right - cr.left; }
            let y2 = tr.top + tr.height / 2 - cr.top;
            let x2 = tr.left - cr.left;
            if (tgtRow) { const r2 = tgtRow.getBoundingClientRect(); y2 = r2.top + r2.height / 2 - cr.top; x2 = r2.left - cr.left; }
            const dx = Math.abs(x2 - x1);
            const offset = Math.max(40, dx * 0.4);
            const c = colors[colorIdx % colors.length];
            colorIdx++;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`);
            path.setAttribute('stroke', c);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-dasharray', '6,3');
            path.setAttribute('marker-start', 'url(#erdCircle)');
            path.setAttribute('marker-end', 'url(#erdArrow)');
            group.appendChild(path);

            const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            lbl.setAttribute('x', x1 + 6); lbl.setAttribute('y', y1 - 4);
            lbl.setAttribute('fill', c); lbl.setAttribute('font-size', '9');
            lbl.setAttribute('font-weight', 'bold'); lbl.textContent = '*';
            group.appendChild(lbl);

            const lbl2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            lbl2.setAttribute('x', x2 - 6); lbl2.setAttribute('y', y2 - 4);
            lbl2.setAttribute('fill', c); lbl2.setAttribute('font-size', '9');
            lbl2.setAttribute('font-weight', 'bold'); lbl2.setAttribute('text-anchor', 'end');
            lbl2.textContent = '1';
            group.appendChild(lbl2);
        }
    }
    erdSvg.appendChild(group);
}

// ── SQL Generation ──
function schemaSetDialect(dialect) {
    schemaDialect = dialect;
    document.getElementById('schemaDialectBtn').value = dialect;
    schemaGenerateSQL();
}

function schemaGenerateSQL() {
    if (schemaTables.length === 0) {
        document.getElementById('schemaSQLOutput').textContent = '-- No tables defined';
        return;
    }
    const typeMap = dialectTypeMap[schemaDialect] || dialectTypeMap.postgresql;
    const isPg = schemaDialect === 'postgresql';
    const isMy = schemaDialect === 'mysql';
    const isSqlite = schemaDialect === 'sqlite';
    const q = isMy ? '`' : '';

    let sql = `-- Schema generated by Kodex's Lab Schema Designer\n-- Dialect: ${schemaDialect}\n`;
    let tableConstraints = [];

    for (const table of schemaTables) {
        const pkCols = table.cols.filter(c => c.pk).map(c => c.name);
        const colDefs = [];
        const fkDefs = [];
        const tConstraints = [];

        for (const c of table.cols) {
            let type = typeMap[c.type] || c.type;
            let def = `    ${q}${c.name}${q} ${type}`;

            if (isSqlite && c.pk && pkCols.length === 1) {
                def += ' PRIMARY KEY';
                if (c.type === 'SERIAL' || c.type === 'INT') def += ' AUTOINCREMENT';
            } else if (isPg && c.pk && pkCols.length === 1) {
                if (c.type === 'SERIAL') { def = `    ${q}${c.name}${q} SERIAL PRIMARY KEY`; }
                else def += ' PRIMARY KEY';
            } else if (isMy && c.pk && pkCols.length === 1) {
                if (c.type === 'SERIAL') def = `    ${q}${c.name}${q} INT AUTO_INCREMENT PRIMARY KEY`;
                else def += ' PRIMARY KEY';
            }

            if (c.notNull && !def.includes('PRIMARY KEY')) def += ' NOT NULL';
            if (c.default !== null) {
                const dv = c.default;
                if (dv === 'CURRENT_TIMESTAMP' || dv === 'NOW()' || dv.startsWith('CURRENT_')) def += ` DEFAULT ${dv}`;
                else if (/^-?\d+(\.\d+)?$/.test(dv)) def += ` DEFAULT ${dv}`;
                else def += ` DEFAULT '${dv.replace(/'/g, "''")}'`;
            }
            if (c.unique && !c.pk) def += ' UNIQUE';

            colDefs.push(def);

            if (c.fk) {
                const t = schemaTables.find(x => x.id === c.fk.tableId);
                const tc = t ? t.cols[c.fk.colIdx] : null;
                if (t && tc) {
                    fkDefs.push(`    FOREIGN KEY (${q}${c.name}${q}) REFERENCES ${q}${t.name}${q}(${q}${tc.name}${q})`);
                }
            }
        }

        if (pkCols.length > 1) {
            tConstraints.push(`    PRIMARY KEY (${pkCols.map(n => q + n + q).join(', ')})`);
        }

        sql += `\nCREATE TABLE ${q}${table.name}${q} (\n`;
        sql += [...colDefs, ...fkDefs, ...tConstraints].join(',\n');
        sql += '\n)';
        if (isMy) sql += ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
        sql += ';\n';

        for (const idx of table.indexes) {
            if (idx.cols.length === 0) continue;
            const idxName = `${q}${idx.name}${q}`;
            const idxCols = idx.cols.map(n => q + n + q).join(', ');
            if (isMy) {
                sql += `CREATE ${idx.unique ? 'UNIQUE ' : ''}INDEX ${idxName} ON ${q}${table.name}${q} (${idxCols});\n`;
            } else {
                sql += `CREATE ${idx.unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS ${idxName} ON ${table.name} (${idxCols});\n`;
            }
        }
    }
    document.getElementById('schemaSQLOutput').textContent = sql;
}

function schemaAutoGenerateSQL() {
    clearTimeout(schemaAutoGenerateTimer);
    schemaAutoGenerateTimer = setTimeout(() => {
        if (document.getElementById('schemaDesigner').classList.contains('open')) schemaGenerateSQL();
    }, 500);
}

// ── Event Handlers ──
document.addEventListener('mousedown', handleDesignHandleClick);
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && linkingState) { linkClear(); schemaRender(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); schemaUndo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); schemaRedo(); }
});

// ── Expose functions globally ──
// All schema* functions are already global (var/function declarations at top level)
