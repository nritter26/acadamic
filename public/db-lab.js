// ── DB Lab — Interactive SQL / NoSQL Playground with Live Visualization ──

// ── State ──
let dbLabState = null;
let dbLabEngine = 'sqlite';
let dbLabHistory = [];
let dbLabHistoryIdx = -1;
let dbLabTablePositions = {};
let dbLabLinkingState = null;
let dbLabDraggingState = null;

const DB_LAB_ENGINES = [
    { id: 'sqlite', label: 'SQLite', color: '#003B57' },
    { id: 'pg', label: 'PostgreSQL', color: '#336791' },
    { id: 'mysql', label: 'MySQL', color: '#F29111' },
    { id: 'mongodb', label: 'MongoDB', color: '#47A248' }
];

const DB_LAB_SCENARIOS = {
    blank: { name: 'Blank', desc: 'Start from scratch — no tables or collections.' },
    hr: {
        name: 'HR',
        desc: 'Departments, employees, salaries',
        init: function () {
            dbExec("CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL, location TEXT)");
            dbExec("INSERT INTO departments VALUES (1, 'Engineering', 'New York')");
            dbExec("INSERT INTO departments VALUES (2, 'Marketing', 'San Francisco')");
            dbExec("INSERT INTO departments VALUES (3, 'Sales', 'Chicago')");
            dbExec("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, department_id INTEGER REFERENCES departments(id), salary REAL, hire_date TEXT)");
            dbExec("INSERT INTO employees VALUES (1, 'Alice Johnson', 'alice@company.com', 1, 95000, '2020-03-15')");
            dbExec("INSERT INTO employees VALUES (2, 'Bob Smith', 'bob@company.com', 1, 85000, '2021-06-01')");
            dbExec("INSERT INTO employees VALUES (3, 'Charlie Brown', 'charlie@company.com', 2, 72000, '2022-01-10')");
            dbExec("CREATE TABLE salaries (id INTEGER PRIMARY KEY, employee_id INTEGER REFERENCES employees(id), amount REAL, paid_date TEXT)");
            dbExec("INSERT INTO salaries VALUES (1, 1, 95000, '2024-01-15')");
            dbExec("INSERT INTO salaries VALUES (2, 2, 85000, '2024-01-15')");
            dbExec("INSERT INTO salaries VALUES (3, 3, 72000, '2024-01-15')");
            dbLabRenderAll();
        }
    },
    ecommerce: {
        name: 'E-Commerce',
        desc: 'Customers, orders, products, categories',
        init: function () {
            dbExec("CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT)");
            dbExec("INSERT INTO categories VALUES (1, 'Electronics', 'Gadgets and devices')");
            dbExec("INSERT INTO categories VALUES (2, 'Clothing', 'Apparel and accessories')");
            dbExec("INSERT INTO categories VALUES (3, 'Books', 'Printed and digital books')");
            dbExec("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL, category_id INTEGER REFERENCES categories(id), stock INTEGER)");
            dbExec("INSERT INTO products VALUES (1, 'Laptop', 999.99, 1, 50)");
            dbExec("INSERT INTO products VALUES (2, 'T-Shirt', 19.99, 2, 200)");
            dbExec("INSERT INTO products VALUES (3, 'JavaScript Guide', 39.99, 3, 100)");
            dbExec("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, city TEXT)");
            dbExec("INSERT INTO customers VALUES (1, 'John Doe', 'john@email.com', 'New York')");
            dbExec("INSERT INTO customers VALUES (2, 'Jane Smith', 'jane@email.com', 'Los Angeles')");
            dbExec("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product_id INTEGER REFERENCES products(id), quantity INTEGER, order_date TEXT)");
            dbExec("INSERT INTO orders VALUES (1, 1, 1, 1, '2024-01-10')");
            dbExec("INSERT INTO orders VALUES (2, 1, 3, 2, '2024-01-12')");
            dbExec("INSERT INTO orders VALUES (3, 2, 2, 3, '2024-01-15')");
            dbLabRenderAll();
        }
    }
};

// ── Init ──

function initDbLab() {
    const appEl = document.getElementById('app');
    appEl.className = 'dblab-mode';
    currentLang = 'dblab';
    document.getElementById('header-title').innerText = 'DB LAB';
    document.querySelectorAll('.selector button').forEach(function (b) { b.classList.remove('active'); });
    var navBtn = document.getElementById('nav-dblab');
    if (navBtn) navBtn.classList.add('active');
    document.getElementById('level-bar').style.display = 'none';
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('compiler-output').style.display = 'none';
    document.getElementById('compiler-buttons').style.display = 'none';
    resetState();
    renderSidebar();
    renderWorkspace();
    addTerminalOutput('● DB Lab started — ' + dbLabEngineLabel() + ' mode');
    addTerminalOutput('Type SQL commands to create and explore your database', 'result');
    addTerminalOutput('Try: CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT)', 'result');
    setTimeout(focusTerminal, 50);
}

function resetState() {
    dbLabState = { tables: {}, collections: {}, nextId: 1 };
    dbLabTablePositions = {};
    dbLabHistory = [];
    dbLabHistoryIdx = -1;
    dbLabLinkingState = null;
    dbLabDraggingState = null;
}

function dbLabEngineLabel() {
    var e = DB_LAB_ENGINES.find(function (x) { return x.id === dbLabEngine; });
    return e ? e.label : dbLabEngine;
}

// ── Engine Switching ──

function switchDbLabEngine(engine) {
    dbLabEngine = engine;
    resetState();
    if (dbLabEngine === 'mongodb') {
        renderWorkspaceMongo();
    } else {
        renderWorkspace();
    }
    renderSidebar();
    addTerminalOutput('● Switched to ' + dbLabEngineLabel() + ' mode');
    focusTerminal();
}

// ── Sidebar ──

function renderSidebar() {
    var list = document.getElementById('topic-list');
    if (!list) return;
    var html = '';

    html += '<div style="padding:4px 0 8px 0;"><select id="dblabEngineSelect" onchange="switchDbLabEngine(this.value)" style="width:100%;background:#1e293b;color:#f1f5f9;border:1px solid #334155;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700;outline:none;cursor:pointer;">';
    for (var i = 0; i < DB_LAB_ENGINES.length; i++) {
        var e = DB_LAB_ENGINES[i];
        var sel = e.id === dbLabEngine ? ' selected' : '';
        html += '<option value="' + e.id + '"' + sel + '>' + e.label + '</option>';
    }
    html += '</select></div>';

    html += '<div class="dblab-scenario-bar">';
    for (var key in DB_LAB_SCENARIOS) {
        var sc = DB_LAB_SCENARIOS[key];
        html += '<button class="dblab-scenario-btn" onclick="loadDbLabScenario(\'' + key + '\')" title="' + sc.desc + '">' + sc.name + '</button>';
    }
    html += '</div>';
    if (dbLabEngine !== 'mongodb') {
        html += '<div style="margin-top:8px;padding:6px 8px;background:#0f172a;border:1px solid #1e293b;border-radius:6px;font-size:9px;color:#64748b;line-height:1.5;">';
        html += 'Link FKs: click <b style="color:#fbbf24;">~&gt;</b> on a source column, then click <b style="color:#fbbf24;">~&gt;</b> on the target table column. Click <b style="color:#fbbf24;">FK</b> to remove.';
        html += '</div>';
    }

    if (dbLabEngine === 'mongodb') {
        html += '<div style="margin-top:8px;font-size:9px;color:#64748b;padding:6px;background:#0f172a;border-radius:6px;border:1px solid #1e293b;">';
        html += 'MongoDB commands:<br><code style="color:#a5f3fc;">db.createCollection("x")</code><br><code style="color:#a5f3fc;">db.x.insertOne({..})</code><br><code style="color:#a5f3fc;">db.x.find({..})</code>';
        html += '</div>';
    } else {
        html += '<div style="margin-top:8px;font-size:9px;color:#64748b;padding:6px;background:#0f172a;border-radius:6px;border:1px solid #1e293b;">';
        html += 'SQL reference:<br><code style="color:#a5f3fc;">CREATE TABLE</code><br><code style="color:#a5f3fc;">INSERT INTO</code><br><code style="color:#a5f3fc;">SELECT</code><br><code style="color:#a5f3fc;">ALTER TABLE</code>';
        html += '</div>';
    }

    html += '<div id="dblabTableList" style="margin-top:8px;"></div>';
    list.innerHTML = html;
    updateTableList();
}

function updateTableList() {
    var el = document.getElementById('dblabTableList');
    if (!el) return;
    var html = '<div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Tables/Collections</div>';
    if (dbLabEngine === 'mongodb') {
        var keys = Object.keys(dbLabState.collections);
        if (keys.length === 0) {
            html += '<div style="font-size:9px;color:#475569;font-style:italic;">No collections yet</div>';
        } else {
            for (var i = 0; i < keys.length; i++) {
                var coll = dbLabState.collections[keys[i]];
                html += '<div class="dblab-sidebar-item" onclick=\'highlightTable(' + jsArg(keys[i]) + ')\'>📁 ' + escapeHtml(keys[i]) + ' <span style="color:#64748b;font-size:8px;">(' + coll.documents.length + ' docs)</span></div>';
            }
        }
    } else {
        var keys = Object.keys(dbLabState.tables);
        if (keys.length === 0) {
            html += '<div style="font-size:9px;color:#475569;font-style:italic;">No tables yet</div>';
        } else {
            for (var i = 0; i < keys.length; i++) {
                var tbl = dbLabState.tables[keys[i]];
                html += '<div class="dblab-sidebar-item" onclick=\'highlightTable(' + jsArg(keys[i]) + ')\'>📋 ' + escapeHtml(keys[i]) + ' <span style="color:#64748b;font-size:8px;">(' + tbl.columns.length + ' cols, ' + tbl.rows.length + ' rows)</span></div>';
            }
        }
    }
    el.innerHTML = html;
}

function highlightTable(name) {
    var cards = document.querySelectorAll('.dblab-table-card, .dblab-coll-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.outline = cards[i].dataset.name === name ? '2px solid var(--accent)' : 'none';
    }
}

// ── Workspace ──

function renderDbLabToolbar() {
    var html = '<div class="dblab-scenario-bar" style="margin-bottom:6px;">';
    html += '<select id="dblabEngineSelect" onchange="switchDbLabEngine(this.value)" style="background:#1e293b;color:#f1f5f9;border:1px solid #334155;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:700;outline:none;cursor:pointer;">';
    for (var i = 0; i < DB_LAB_ENGINES.length; i++) {
        var e = DB_LAB_ENGINES[i];
        var sel = e.id === dbLabEngine ? ' selected' : '';
        html += '<option value="' + e.id + '"' + sel + '>' + e.label + '</option>';
    }
    html += '</select>';
    for (var key in DB_LAB_SCENARIOS) {
        var sc = DB_LAB_SCENARIOS[key];
        html += '<button class="dblab-scenario-btn" onclick="loadDbLabScenario(\'' + key + '\')" title="' + sc.desc + '">' + sc.name + '</button>';
    }
    html += '</div>';
    return html;
}

function renderWorkspace() {
    var exp = document.getElementById('explanation');
    exp.innerHTML = ''
        + renderDbLabToolbar()
        + '<div class="dblab-viz-area" id="dblabVizArea">'
        + '<div class="dblab-viz-canvas" id="dblabVizCanvas"></div>'
        + '<svg class="dblab-fk-overlay" id="dblabFkOverlay"></svg>'
        + '</div>'
        + '<div class="dblab-terminal" id="dblabTerminal">'
        + '<div class="dblab-terminal-output" id="dblabTerminalOutput"></div>'
        + '<div class="dblab-terminal-input-line">'
        + '<span class="dblab-prompt" id="dblabPrompt">sqlite></span>'
        + '<input type="text" id="dblabTerminalInput" class="dblab-terminal-input" autofocus placeholder="Type a SQL command..." spellcheck="false" autocomplete="off">'
        + '</div></div>';
    document.getElementById('dblabTerminalInput').addEventListener('keydown', handleDbLabKeydown);
    bindDbLabVizListeners();
    renderViz();
}

function renderWorkspaceMongo() {
    var exp = document.getElementById('explanation');
    exp.innerHTML = ''
        + '<div class="dblab-viz-area" id="dblabVizArea">'
        + '<div class="dblab-viz-canvas" id="dblabVizCanvas"></div>'
        + '</div>'
        + '<div class="dblab-terminal" id="dblabTerminal">'
        + '<div class="dblab-terminal-output" id="dblabTerminalOutput"></div>'
        + '<div class="dblab-terminal-input-line">'
        + '<span class="dblab-prompt" id="dblabPrompt">mongodb></span>'
        + '<input type="text" id="dblabTerminalInput" class="dblab-terminal-input" autofocus placeholder="Type a MongoDB command..." spellcheck="false" autocomplete="off">'
        + '</div></div>';
    document.getElementById('dblabTerminalInput').addEventListener('keydown', handleDbLabKeydown);
    bindDbLabVizListeners();
    renderVizMongo();
}

function bindDbLabVizListeners() {
    var area = document.getElementById('dblabVizArea');
    if (!area || area.dataset.bound === '1') return;
    area.dataset.bound = '1';
    var timer = null;
    area.addEventListener('scroll', function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
            if (document.getElementById('app').classList.contains('dblab-mode')) {
                drawFkLines();
            }
        }, 50);
    });
}

// ── Visualization: SQL ──

function renderViz() {
    var canvas = document.getElementById('dblabVizCanvas');
    if (!canvas) return;
    var tableNames = Object.keys(dbLabState.tables);
    if (tableNames.length === 0) {
        canvas.innerHTML = '<div class="dblab-empty-state">'
            + '<div style="font-size:28px;margin-bottom:8px;">🗄️</div>'
            + '<div style="font-size:12px;font-weight:700;color:#64748b;">No tables yet</div>'
            + '<div style="font-size:10px;color:#475569;margin-top:4px;">Type a SQL command below to create your first table</div>'
            + '<div style="margin-top:12px;padding:8px 12px;background:#0f172a;border-radius:6px;border:1px solid #1e293b;font-size:10px;color:#a5f3fc;font-family:monospace;">CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT)</div>'
            + '</div>';
        updateTableList();
        return;
    }
    var html = '';
    var layoutX = 12;
    var layoutY = 12;
    var rowHeight = 0;
    for (var i = 0; i < tableNames.length; i++) {
        var name = tableNames[i];
        var tbl = dbLabState.tables[name];
        if (!tbl) continue;
        var pos = dbLabTablePositions[name];
        if (!pos) {
            pos = { x: layoutX, y: layoutY };
            dbLabTablePositions[name] = pos;
            layoutX += 300;
            rowHeight = Math.max(rowHeight, 220);
            if (layoutX > 900) {
                layoutX = 12;
                layoutY += rowHeight + 20;
                rowHeight = 0;
            }
        }
        var colHtml = '';
        for (var j = 0; j < tbl.columns.length; j++) {
            var c = tbl.columns[j];
            var badges = '';
            if (c.pk) badges += '<span class="dblab-col-badge pk">PK</span>';
            if (c.fk) badges += '<span class="dblab-col-badge fk" data-fk-table="' + escapeAttr(c.fk.table) + '" data-fk-col="' + escapeAttr(c.fk.column) + '" data-table="' + escapeAttr(name) + '" data-col="' + escapeAttr(c.name) + '">FK</span>';
            if (c.notNull) badges += '<span class="dblab-col-badge nn">NN</span>';
            if (c.unique) badges += '<span class="dblab-col-badge uq">UQ</span>';
            var isSource = dbLabLinkingState && dbLabLinkingState.table === name && dbLabLinkingState.col === c.name;
            var isTarget = !!dbLabLinkingState && !isSource;
            var handleLabel = c.fk ? 'FK' : (isSource ? '...' : '~>');
            var handleTitle = c.fk ? 'Click to remove this FK' : (isSource ? 'Select a target column to link to' : 'Click to start linking this column');
            var rowClasses = 'dblab-tc-col' + (c.pk ? ' pk-col' : '') + (c.fk ? ' fk-col' : '');
            if (isSource) rowClasses += ' dblab-linking-source';
            else if (isTarget) rowClasses += ' dblab-linking-valid-target';
            colHtml += '<div class="' + rowClasses + '" data-col="' + escapeAttr(c.name) + '" data-table="' + escapeAttr(name) + '">'
                + '<span class="dblab-col-name">' + escapeHtml(c.name) + '</span>'
                + '<span class="dblab-col-type">' + escapeHtml(c.type) + '</span>'
                + badges
                + '<span class="dblab-link-handle" title="' + escapeAttr(handleTitle) + '" onclick="handleDbLabLinkHandleClick(event)" data-table="' + escapeAttr(name) + '" data-col="' + escapeAttr(c.name) + '">' + escapeHtml(handleLabel) + '</span>'
                + '</div>';
        }
        html += '<div class="dblab-table-card" data-name="' + escapeAttr(name) + '" id="' + safeDomId('dblabCard', name) + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px;">'
            + '<div class="dblab-tc-header dblab-drag-handle" onmousedown=\'startDbLabTableDrag(event, ' + jsArg(name) + ')\'>'
            + '<span class="dblab-tc-name">' + escapeHtml(name) + '</span>'
            + '<span class="dblab-tc-count">' + tbl.rows.length + ' row' + (tbl.rows.length !== 1 ? 's' : '') + '</span>'
            + '</div>'
            + '<div class="dblab-tc-cols">' + colHtml + '</div>'
            + '</div>';
    }
    canvas.innerHTML = html;
    canvas.style.height = Math.max(layoutY + rowHeight + 300, 600) + 'px';
    updateTableList();
    setTimeout(drawFkLines, 50);
}

function clearDbLabLinkState() {
    dbLabLinkingState = null;
}

function startDbLabLink(table, col) {
    dbLabLinkingState = { table: table, col: col };
    renderViz();
}

function finishDbLabLink(targetTable, targetCol) {
    if (!dbLabLinkingState) return;
    if (dbLabLinkingState.table === targetTable && dbLabLinkingState.col === targetCol) {
        clearDbLabLinkState();
        renderViz();
        return;
    }
    var srcTable = dbLabState.tables[dbLabLinkingState.table];
    var srcCol = srcTable && srcTable.columns.find(function (c) { return c.name === dbLabLinkingState.col; });
    if (!srcTable || !srcCol) {
        clearDbLabLinkState();
        renderViz();
        return;
    }
    srcCol.fk = { table: targetTable, column: targetCol };
    clearDbLabLinkState();
    renderViz();
}

function handleDbLabLinkHandleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    var handle = e.currentTarget || e.target;
    var table = handle && handle.dataset ? handle.dataset.table : '';
    var col = handle && handle.dataset ? handle.dataset.col : '';
    if (!table || !col) return;
    var tbl = dbLabState.tables[table];
    if (!tbl) return;
    var column = tbl.columns.find(function (c) { return c.name === col; });
    if (!column) return;
    if (column.fk && !dbLabLinkingState) {
        column.fk = null;
        renderViz();
        return;
    }
    if (!dbLabLinkingState) {
        startDbLabLink(table, col);
        return;
    }
    finishDbLabLink(table, col);
}

function startDbLabTableDrag(e, tableName) {
    if (e.button !== 0) return;
    var card = document.getElementById(safeDomId('dblabCard', tableName));
    var area = document.getElementById('dblabVizArea');
    if (!card || !area) return;
    if (e.target.closest('.dblab-link-handle') || e.target.classList.contains('dblab-col-badge') || e.target.closest('.dblab-col-badge')) return;
    e.preventDefault();
    e.stopPropagation();

    var startX = e.clientX;
    var startY = e.clientY;
    var startPos = dbLabTablePositions[tableName] || { x: parseInt(card.style.left || '0', 10) || 0, y: parseInt(card.style.top || '0', 10) || 0 };
    dbLabDraggingState = { tableName: tableName, startX: startX, startY: startY, startPosX: startPos.x, startPosY: startPos.y };
    card.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    function moveHandler(ev) {
        if (!dbLabDraggingState || dbLabDraggingState.tableName !== tableName) return;
        var dx = ev.clientX - dbLabDraggingState.startX;
        var dy = ev.clientY - dbLabDraggingState.startY;
        var x = Math.max(0, dbLabDraggingState.startPosX + dx);
        var y = Math.max(0, dbLabDraggingState.startPosY + dy);
        dbLabTablePositions[tableName] = { x: x, y: y };
        card.style.left = x + 'px';
        card.style.top = y + 'px';
        drawFkLines();
    }

    function upHandler() {
        if (!dbLabDraggingState || dbLabDraggingState.tableName !== tableName) return;
        dbLabDraggingState = null;
        card.classList.remove('dragging');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
    }

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
}

// ── FK Lines ──

function drawFkLines() {
    var svg = document.getElementById('dblabFkOverlay');
    if (!svg) return;
    var canvas = document.getElementById('dblabVizCanvas');
    var area = document.getElementById('dblabVizArea');
    if (!area || !canvas) return;
    var canvasRect = canvas.getBoundingClientRect();
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.width = canvas.scrollWidth + 'px';
    svg.style.height = canvas.scrollHeight + 'px';
    svg.style.transform = 'translate(' + (-area.scrollLeft) + 'px, ' + (-area.scrollTop) + 'px)';
    svg.style.zIndex = '3';
    var fkCols = document.querySelectorAll('.dblab-col-badge.fk');
    var lines = [];
    var defs = ''
        + '<defs>'
        + '<marker id="dblabFkArrow" markerWidth="14" markerHeight="12" refX="12" refY="6" orient="auto" markerUnits="userSpaceOnUse">'
        + '<polygon points="0 0, 12 6, 0 12" fill="#f59e0b" stroke="#fff7cc" stroke-width="0.8"></polygon>'
        + '</marker>'
        + '<marker id="dblabFkCircle" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="userSpaceOnUse">'
        + '<circle cx="5" cy="5" r="4" fill="#0a0e1a" stroke="#f59e0b" stroke-width="2"></circle>'
        + '</marker>'
        + '</defs>';
    for (var i = 0; i < fkCols.length; i++) {
        var badge = fkCols[i];
        var tableName = badge.dataset.table;
        var colName = badge.dataset.col;
        var refTable = badge.dataset.fkTable;
        var refCol = badge.dataset.fkCol;
        if (!tableName || !colName || !refTable || !refCol) continue;
        var colEl = badge.closest('.dblab-tc-col');
        if (!colEl) continue;
        var fromRect = colEl.getBoundingClientRect();
        var targetCard = document.getElementById(safeDomId('dblabCard', refTable));
        if (!targetCard) continue;
        var targetCol = targetCard.querySelector('.dblab-tc-col.pk-col');
        if (!targetCol) {
            var cols = targetCard.querySelectorAll('.dblab-tc-col');
            for (var k = 0; k < cols.length; k++) {
                if (cols[k].dataset.col === refCol) {
                    targetCol = cols[k];
                    break;
                }
            }
        }
        if (!targetCol) continue;
        var toRect = targetCol.getBoundingClientRect();
        var x1 = fromRect.right - canvasRect.left + area.scrollLeft;
        var y1 = fromRect.top + fromRect.height / 2 - canvasRect.top + area.scrollTop;
        var x2 = toRect.left - canvasRect.left + area.scrollLeft;
        var y2 = toRect.top + toRect.height / 2 - canvasRect.top + area.scrollTop;
        var midX = (x1 + x2) / 2;
        var offset = Math.max(40, Math.abs(x2 - x1) * 0.35);
        var path = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + offset) + ' ' + y1 + ', ' + (x2 - offset) + ' ' + y2 + ', ' + x2 + ' ' + y2;
        var color = (DB_LAB_ENGINES.find(function (e) { return e.id === dbLabEngine; }) || {}).color || '#2DD4BF';
        lines.push({ path: path, color: color, x1: x1, y1: y1, x2: x2, y2: y2 });
    }
    var svgContent = defs + '<g pointer-events="none">';
    for (var j = 0; j < lines.length; j++) {
        svgContent += '<path d="' + lines[j].path + '" fill="none" stroke="' + lines[j].color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" marker-start="url(#dblabFkCircle)" marker-end="url(#dblabFkArrow)"/>';
        svgContent += '<text x="' + (lines[j].x1 + 6) + '" y="' + (lines[j].y1 - 4) + '" fill="' + lines[j].color + '" font-size="8" font-weight="700">*</text>';
        svgContent += '<text x="' + (lines[j].x2 - 6) + '" y="' + (lines[j].y2 - 4) + '" fill="' + lines[j].color + '" font-size="8" font-weight="700" text-anchor="end">1</text>';
    }
    svgContent += '</g>';
    svg.innerHTML = svgContent;
}

// ── Visualization: MongoDB ──

function renderVizMongo() {
    var canvas = document.getElementById('dblabVizCanvas');
    if (!canvas) return;
    var collNames = Object.keys(dbLabState.collections);
    if (collNames.length === 0) {
        canvas.innerHTML = '<div class="dblab-empty-state">'
            + '<div style="font-size:28px;margin-bottom:8px;">🍃</div>'
            + '<div style="font-size:12px;font-weight:700;color:#64748b;">No collections yet</div>'
            + '<div style="font-size:10px;color:#475569;margin-top:4px;">Type a MongoDB command below to create your first collection</div>'
            + '<div style="margin-top:12px;padding:8px 12px;background:#0f172a;border-radius:6px;border:1px solid #1e293b;font-size:10px;color:#a5f3fc;font-family:monospace;">db.createCollection("users")</div>'
            + '<div style="margin-top:6px;padding:8px 12px;background:#0f172a;border-radius:6px;border:1px solid #1e293b;font-size:10px;color:#a5f3fc;font-family:monospace;">db.users.insertOne({ name: "Alice", age: 30 })</div>'
            + '</div>';
        updateTableList();
        return;
    }
    var html = '';
    for (var i = 0; i < collNames.length; i++) {
        var name = collNames[i];
        var coll = dbLabState.collections[name];
        var docsHtml = '';
        for (var j = 0; j < Math.min(coll.documents.length, 5); j++) {
            var doc = coll.documents[j];
            var docStr = JSON.stringify(doc.data);
            docsHtml += '<div class="dblab-doc-card">' + escapeHtml(docStr) + '</div>';
        }
        if (coll.documents.length > 5) {
            docsHtml += '<div class="dblab-doc-more">… and ' + (coll.documents.length - 5) + ' more</div>';
        }
        html += '<div class="dblab-coll-card" data-name="' + escapeAttr(name) + '">'
            + '<div class="dblab-tc-header" style="background:#1e3a1e;">'
            + '<span class="dblab-tc-name">📁 ' + escapeHtml(name) + '</span>'
            + '<span class="dblab-tc-count">' + coll.documents.length + ' doc' + (coll.documents.length !== 1 ? 's' : '') + '</span>'
            + '</div>'
            + '<div style="padding:4px 8px;font-size:8px;color:#64748b;border-bottom:1px solid #1e293b;">Indexes: ' + (coll.indexes.length ? coll.indexes.map(function (x) { return escapeHtml(x.field); }).join(', ') : 'none') + '</div>'
            + '<div class="dblab-docs-list">' + docsHtml + '</div>'
            + '</div>';
    }
    canvas.innerHTML = html;
    updateTableList();
}

// ── Terminal ──

function addTerminalOutput(text, cls) {
    var out = document.getElementById('dblabTerminalOutput');
    if (!out) return;
    var className = 'dblab-terminal-line';
    if (cls) className += ' dblab-terminal-' + cls;
    out.innerHTML += '<div class="' + className + '">' + escapeHtml(text) + '</div>';
    out.scrollTop = out.scrollHeight;
}

function focusTerminal() {
    var inp = document.getElementById('dblabTerminalInput');
    if (inp) setTimeout(function () { inp.focus(); }, 10);
}

function handleDbLabKeydown(e) {
    var inp = document.getElementById('dblabTerminalInput');
    if (!inp) return;
    if (e.key === 'Enter') {
        var cmd = inp.value.trim();
        inp.value = '';
        if (!cmd) return;
        var prompt = dbLabEngine === 'mongodb' ? 'mongodb>' : dbLabEngine + '>';
        addTerminalOutput(prompt + ' ' + cmd);
        processDbLabCommand(cmd);
        focusTerminal();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (dbLabHistory.length === 0) return;
        if (dbLabHistoryIdx === -1) dbLabHistoryIdx = dbLabHistory.length;
        if (dbLabHistoryIdx > 0) {
            dbLabHistoryIdx--;
            inp.value = dbLabHistory[dbLabHistoryIdx];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (dbLabHistoryIdx === -1) return;
        dbLabHistoryIdx++;
        if (dbLabHistoryIdx >= dbLabHistory.length) {
            dbLabHistoryIdx = dbLabHistory.length;
            inp.value = '';
        } else {
            inp.value = dbLabHistory[dbLabHistoryIdx];
        }
    }
}

// ── Command Processing ──

function processDbLabCommand(cmd) {
    dbLabHistory.push(cmd);
    dbLabHistoryIdx = dbLabHistory.length;
    if (dbLabEngine === 'mongodb') {
        processMongoCommand(cmd);
    } else {
        processSqlCommand(cmd);
    }
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
}

function jsArg(s) {
    return JSON.stringify(String(s));
}

function safeDomId(prefix, name) {
    return prefix + '-' + encodeURIComponent(String(name));
}

function padRight(s, len) {
    s = String(s);
    return s.length < len ? s + ' '.repeat(len - s.length) : s;
}

// ── SQL Processing ──

function processSqlCommand(cmd) {
    var trimmed = cmd.trim().replace(/;\s*$/, '').trim();
    if (!trimmed) return;
    var result;
    if (/^SELECT\b/i.test(trimmed) || /^EXPLAIN\b/i.test(trimmed) || /^SHOW\b/i.test(trimmed) || /^PRAGMA\b/i.test(trimmed)) {
        executeLocalQuery(trimmed);
        return;
    }
    if (/^CREATE\s+TABLE\b/i.test(trimmed)) result = execCreateTable(trimmed);
    else if (/^DROP\s+TABLE\b/i.test(trimmed)) result = execDropTable(trimmed);
    else if (/^ALTER\s+TABLE\b/i.test(trimmed)) result = execAlterTable(trimmed);
    else if (/^INSERT\s+INTO\b/i.test(trimmed)) result = execInsert(trimmed);
    else if (/^UPDATE\b/i.test(trimmed)) result = execUpdate(trimmed);
    else if (/^DELETE\s+FROM\b/i.test(trimmed)) result = execDelete(trimmed);
    else if (/^CREATE\s+INDEX\b/i.test(trimmed)) result = execCreateIndex(trimmed);
    else if (/^DROP\s+INDEX\b/i.test(trimmed)) result = execDropIndex(trimmed);
    else if (/^TRUNCATE\s+TABLE\b/i.test(trimmed)) result = execTruncate(trimmed);
    else if (/^BEGIN\b/i.test(trimmed) || /^COMMIT\b/i.test(trimmed) || /^ROLLBACK\b/i.test(trimmed)) {
        addTerminalOutput('✓ Transaction control acknowledged', 'result');
        return;
    } else {
        addTerminalOutput('✗ Unrecognized SQL statement. Try: CREATE TABLE, INSERT, SELECT', 'error');
        return;
    }
    if (result) {
        if (result.error) {
            addTerminalOutput('✗ ' + result.msg, 'error');
        } else {
            addTerminalOutput('✓ ' + result.msg, 'result');
            renderViz();
        }
    }
}

function dbExec(sql) {
    var trimmed = sql.trim().replace(/;\s*$/, '').trim();
    if (/^SELECT\b/i.test(trimmed)) return;
    if (/^CREATE\s+TABLE\b/i.test(trimmed)) execCreateTable(trimmed, true);
    else if (/^INSERT\s+INTO\b/i.test(trimmed)) execInsert(trimmed, true);
    else if (/^CREATE\s+INDEX\b/i.test(trimmed)) execCreateIndex(trimmed, true);
}

function dbLabRenderAll() {
    renderViz();
    renderSidebar();
}

// ── SQL: CREATE TABLE ──

function execCreateTable(sql, silent) {
    var m = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]+)\)\s*$/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse CREATE TABLE statement' };
        return;
    }
    var name = m[1];
    var colsDef = m[2];
    if (dbLabState.tables[name]) {
        if (!silent) return { error: true, msg: 'Table "' + name + '" already exists' };
        return;
    }
    var cols = parseColumns(colsDef);
    if (!cols || cols.length === 0) {
        if (!silent) return { error: true, msg: 'No valid columns found in CREATE TABLE' };
        return;
    }
    dbLabState.tables[name] = { columns: cols, rows: [], indexes: [] };
    if (!silent) return { msg: 'Table "' + name + '" created (' + cols.length + ' columns)' };
}

// ── SQL: DROP TABLE ──

function execDropTable(sql, silent) {
    var m = sql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse DROP TABLE statement' };
        return;
    }
    var name = m[1];
    if (!dbLabState.tables[name]) {
        if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
        return;
    }
    delete dbLabState.tables[name];
    for (var t in dbLabState.tables) {
        for (var i = 0; i < dbLabState.tables[t].columns.length; i++) {
            var c = dbLabState.tables[t].columns[i];
            if (c.fk && c.fk.table === name) c.fk = null;
        }
    }
    if (!silent) return { msg: 'Table "' + name + '" dropped' };
}

// ── SQL: ALTER TABLE ──

function execAlterTable(sql, silent) {
    var mAdd = sql.match(/ALTER\s+TABLE\s+(\w+)\s+ADD\s+(?:COLUMN\s+)?(\w+)\s+(\S+)(.*)/i);
    if (mAdd) {
        var name = mAdd[1];
        var colName = mAdd[2];
        var colType = mAdd[3].replace(/,.*$/, '');
        var rest = mAdd[4] || '';
        if (!dbLabState.tables[name]) {
            if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
            return;
        }
        var col = parseColumnDef(colName + ' ' + colType + ' ' + rest);
        if (!col) {
            if (!silent) return { error: true, msg: 'Could not parse column definition' };
            return;
        }
        dbLabState.tables[name].columns.push(col);
        if (!silent) return { msg: 'Column "' + colName + '" added to "' + name + '"' };
        return;
    }
    var mDrop = sql.match(/ALTER\s+TABLE\s+(\w+)\s+DROP\s+(?:COLUMN\s+)?(\w+)/i);
    if (mDrop) {
        var name = mDrop[1];
        var colName = mDrop[2];
        if (!dbLabState.tables[name]) {
            if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
            return;
        }
        var idx = -1;
        for (var i = 0; i < dbLabState.tables[name].columns.length; i++) {
            if (dbLabState.tables[name].columns[i].name === colName) { idx = i; break; }
        }
        if (idx === -1) {
            if (!silent) return { error: true, msg: 'Column "' + colName + '" not found in "' + name + '"' };
            return;
        }
        dbLabState.tables[name].columns.splice(idx, 1);
        if (!silent) return { msg: 'Column "' + colName + '" dropped from "' + name + '"' };
        return;
    }
    var mRename = sql.match(/ALTER\s+TABLE\s+(\w+)\s+RENAME\s+TO\s+(\w+)/i);
    if (mRename) {
        var name = mRename[1];
        var newName = mRename[2];
        if (!dbLabState.tables[name]) {
            if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
            return;
        }
        dbLabState.tables[newName] = dbLabState.tables[name];
        delete dbLabState.tables[name];
        for (var t in dbLabState.tables) {
            for (var i = 0; i < dbLabState.tables[t].columns.length; i++) {
                var c = dbLabState.tables[t].columns[i];
                if (c.fk && c.fk.table === name) c.fk.table = newName;
            }
        }
        if (!silent) return { msg: 'Table "' + name + '" renamed to "' + newName + '"' };
        return;
    }
    if (!silent) return { error: true, msg: 'Could not parse ALTER TABLE statement. Supported: ADD COLUMN, DROP COLUMN, RENAME TO' };
}

// ── SQL: INSERT ──

function execInsert(sql, silent) {
    var m = sql.match(/INSERT\s+INTO\s+(\w+)(?:\s*\(([^)]+)\))?\s*VALUES\s*(.+)/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse INSERT statement' };
        return;
    }
    var name = m[1];
    var colsList = m[2] ? m[2].split(',').map(function (s) { return s.trim(); }) : null;
    var valuesStr = m[3];
    if (!dbLabState.tables[name]) {
        if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
        return;
    }
    var tbl = dbLabState.tables[name];
    var valSets = parseValueSets(valuesStr);
    if (!valSets || valSets.length === 0) {
        if (!silent) return { error: true, msg: 'Could not parse VALUES' };
        return;
    }
    var inserted = 0;
    for (var vi = 0; vi < valSets.length; vi++) {
        var vals = valSets[vi];
        var row = {};
        if (colsList) {
            for (var ci = 0; ci < colsList.length && ci < vals.length; ci++) {
                row[colsList[ci]] = vals[ci];
            }
        } else {
            for (var ci2 = 0; ci2 < tbl.columns.length && ci2 < vals.length; ci2++) {
                row[tbl.columns[ci2].name] = vals[ci2];
            }
        }
        tbl.rows.push(row);
        inserted++;
    }
    if (!silent) return { msg: inserted + ' row(s) inserted into "' + name + '"' };
}

// ── SQL: UPDATE ──

function execUpdate(sql, silent) {
    var m = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse UPDATE statement' };
        return;
    }
    var name = m[1];
    var setClause = m[2];
    var whereClause = m[3] || null;
    if (!dbLabState.tables[name]) {
        if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
        return;
    }
    var tbl = dbLabState.tables[name];
    var setParts = setClause.split(',').map(function (s) { return s.trim(); });
    var updated = 0;
    for (var i = 0; i < tbl.rows.length; i++) {
        if (whereClause && !evalWhere(tbl.rows[i], whereClause)) continue;
        for (var j = 0; j < setParts.length; j++) {
            var sp = setParts[j].match(/(\w+)\s*=\s*(.+)/);
            if (sp) {
                tbl.rows[i][sp[1]] = parseValue(sp[2]);
            }
        }
        updated++;
    }
    if (!silent) return { msg: updated + ' row(s) updated in "' + name + '"' };
}

// ── SQL: DELETE ──

function execDelete(sql, silent) {
    var m = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse DELETE statement' };
        return;
    }
    var name = m[1];
    var whereClause = m[2] || null;
    if (!dbLabState.tables[name]) {
        if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
        return;
    }
    var tbl = dbLabState.tables[name];
    var before = tbl.rows.length;
    if (whereClause) {
        tbl.rows = tbl.rows.filter(function (r) { return !evalWhere(r, whereClause); });
    } else {
        tbl.rows = [];
    }
    var deleted = before - tbl.rows.length;
    if (!silent) return { msg: deleted + ' row(s) deleted from "' + name + '"' };
}

// ── SQL: TRUNCATE ──

function execTruncate(sql, silent) {
    var m = sql.match(/TRUNCATE\s+TABLE\s+(\w+)/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse TRUNCATE statement' };
        return;
    }
    var name = m[1];
    if (!dbLabState.tables[name]) {
        if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
        return;
    }
    dbLabState.tables[name].rows = [];
    if (!silent) return { msg: 'Table "' + name + '" truncated' };
}

// ── SQL: CREATE / DROP INDEX ──

function execCreateIndex(sql, silent) {
    var m = sql.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:\w+\s+)?ON\s+(\w+)\s*\((\w+)\)/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse CREATE INDEX statement' };
        return;
    }
    var name = m[1];
    var col = m[2];
    if (!dbLabState.tables[name]) {
        if (!silent) return { error: true, msg: 'Table "' + name + '" does not exist' };
        return;
    }
    dbLabState.tables[name].indexes.push({ column: col });
    if (!silent) return { msg: 'Index on "' + name + '(' + col + ')" created' };
}

function execDropIndex(sql, silent) {
    var m = sql.match(/DROP\s+INDEX\s+(\w+)/i);
    if (!m) {
        if (!silent) return { error: true, msg: 'Could not parse DROP INDEX statement' };
        return;
    }
    var idxName = m[1];
    for (var t in dbLabState.tables) {
        var tbl = dbLabState.tables[t];
        for (var i = 0; i < tbl.indexes.length; i++) {
            if (tbl.indexes[i].column === idxName || idxName === t + '_' + tbl.indexes[i].column + '_idx') {
                tbl.indexes.splice(i, 1);
                if (!silent) return { msg: 'Index dropped from "' + t + '"' };
                return;
            }
        }
    }
    if (!silent) return { error: true, msg: 'Index not found' };
}

// ── SQL: Query Execution ──

function executeLocalQuery(sql) {
    if (/^EXPLAIN\b/i.test(sql)) {
        addTerminalOutput('EXPLAIN is not implemented in DB Lab yet', 'error');
        return;
    }
    if (/^SHOW\b/i.test(sql)) {
        executeShowQuery(sql);
        return;
    }
    if (/^PRAGMA\b/i.test(sql)) {
        executePragmaQuery(sql);
        return;
    }
    if (!/^SELECT\b/i.test(sql)) {
        addTerminalOutput('✗ Query type not supported in DB Lab', 'error');
        return;
    }
    executeSelectQuery(sql);
}

function executeShowQuery(sql) {
    if (!/^SHOW\s+TABLES\b/i.test(sql)) {
        addTerminalOutput('✗ Only SHOW TABLES is supported in DB Lab', 'error');
        return;
    }
    var names = Object.keys(dbLabState.tables);
    if (names.length === 0) {
        addTerminalOutput('(0 rows)', 'result');
        return;
    }
    var rows = [];
    for (var i = 0; i < names.length; i++) rows.push({ table_name: names[i] });
    addTerminalOutput(formatAsciiTable(rows, ['table_name']), 'result');
}

function executePragmaQuery(sql) {
    var m = sql.match(/^PRAGMA\s+table_info\s*\(\s*(\w+)\s*\)\s*$/i);
    if (!m) {
        addTerminalOutput('✗ Only PRAGMA table_info(table) is supported in DB Lab', 'error');
        return;
    }
    var name = m[1];
    var tbl = dbLabState.tables[name];
    if (!tbl) {
        addTerminalOutput('✗ Table "' + name + '" does not exist', 'error');
        return;
    }
    var rows = [];
    for (var i = 0; i < tbl.columns.length; i++) {
        var c = tbl.columns[i];
        rows.push({
            cid: i,
            name: c.name,
            type: c.type,
            notnull: c.notNull ? 1 : 0,
            pk: c.pk ? 1 : 0,
        });
    }
    addTerminalOutput(formatAsciiTable(rows, ['cid', 'name', 'type', 'notnull', 'pk']), 'result');
}

function executeSelectQuery(sql) {
    var parsed = parseSelectStatement(sql);
    if (!parsed) {
        addTerminalOutput('✗ Could not parse SELECT statement', 'error');
        return;
    }
    var tbl = dbLabState.tables[parsed.table];
    if (!tbl) {
        addTerminalOutput('✗ Table "' + parsed.table + '" does not exist', 'error');
        return;
    }
    var rows = tbl.rows.slice();
    if (parsed.where) rows = rows.filter(function (row) { return evalWhere(row, parsed.where); });
    if (parsed.orderBy) {
        rows.sort(function (a, b) {
            var av = a[parsed.orderBy];
            var bv = b[parsed.orderBy];
            var cmp = String(av === undefined ? '' : av).localeCompare(String(bv === undefined ? '' : bv), undefined, { numeric: true, sensitivity: 'base' });
            return parsed.orderDesc ? -cmp : cmp;
        });
    }
    if (parsed.limit !== null) rows = rows.slice(0, parsed.limit);

    if (parsed.countOnly) {
        addTerminalOutput(formatAsciiTable([{ count: rows.length }], ['count']), 'result');
        return;
    }

    var selectedCols = parsed.columns[0] === '*' ? tbl.columns.map(function (c) { return c.name; }) : parsed.columns;
    var outputRows = [];
    for (var i = 0; i < rows.length; i++) {
        var outRow = {};
        for (var j = 0; j < selectedCols.length; j++) {
            var col = selectedCols[j];
            outRow[col] = rows[i][col];
        }
        outputRows.push(outRow);
    }
    addTerminalOutput(formatAsciiTable(outputRows, selectedCols), 'result');
}

function parseSelectStatement(sql) {
    var m = sql.match(/^SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)([\s\S]*)$/i);
    if (!m) return null;
    var selectPart = m[1].trim();
    var table = m[2];
    var rest = (m[3] || '').trim();
    var where = null;
    var orderBy = null;
    var orderDesc = false;
    var limit = null;
    var whereMatch = rest.match(/\bWHERE\b\s+([\s\S]*?)(?=\bORDER\s+BY\b|\bLIMIT\b|$)/i);
    if (whereMatch) where = whereMatch[1].trim().replace(/;\s*$/, '');
    var orderMatch = rest.match(/\bORDER\s+BY\b\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
        orderBy = orderMatch[1];
        orderDesc = String(orderMatch[2] || 'ASC').toUpperCase() === 'DESC';
    }
    var limitMatch = rest.match(/\bLIMIT\b\s+(\d+)/i);
    if (limitMatch) limit = parseInt(limitMatch[1], 10);
    var columns = splitColumns(selectPart).map(function (s) { return s.trim(); });
    var countOnly = columns.length === 1 && /^COUNT\s*\(\s*(\*|1)\s*\)$/i.test(columns[0]);
    return {
        columns: columns,
        table: table,
        where: where,
        orderBy: orderBy,
        orderDesc: orderDesc,
        limit: isNaN(limit) ? null : limit,
        countOnly: countOnly,
    };
}

function formatAsciiTable(rows, cols) {
    if (!rows || rows.length === 0) return '(0 rows)';
    var widths = cols.map(function (c) { return Math.max(String(c).length, 8); });
    for (var i = 0; i < rows.length; i++) {
        for (var j = 0; j < cols.length; j++) {
            var val = rows[i][cols[j]];
            var s = val === null || typeof val === 'undefined' ? 'NULL' : String(val);
            if (s.length > widths[j]) widths[j] = Math.min(s.length, 80);
        }
    }
    var totalWidth = widths.reduce(function (a, w) { return a + w + 3; }, 0) + 1;
    var out = '┌' + '─'.repeat(totalWidth - 2) + '┐\n';
    out += '│';
    for (var k = 0; k < cols.length; k++) {
        out += ' ' + padRight(cols[k], widths[k]) + ' │';
    }
    out += '\n├' + widths.map(function (w) { return '─'.repeat(w + 2); }).join('┬') + '┤\n';
    for (var r = 0; r < rows.length; r++) {
        out += '│';
        for (var c = 0; c < cols.length; c++) {
            var raw = rows[r][cols[c]];
            var str = raw === null || typeof raw === 'undefined' ? 'NULL' : String(raw);
            var truncated = str.length > 80 ? str.slice(0, 77) + '...' : str;
            out += ' ' + padRight(truncated, widths[c]) + ' │';
        }
        out += '\n';
    }
    out += '└' + widths.map(function (w) { return '─'.repeat(w + 2); }).join('┴') + '┘\n';
    out += '(' + rows.length + ' rows)';
    return out;
}

// ── Column Parsing ──

function parseColumns(def) {
    var parts = splitColumns(def);
    var cols = [];
    for (var i = 0; i < parts.length; i++) {
        var col = parseColumnDef(parts[i]);
        if (col) cols.push(col);
    }
    return cols;
}

function splitColumns(def) {
    var depth = 0;
    var current = '';
    var parts = [];
    for (var i = 0; i < def.length; i++) {
        var ch = def[i];
        if (ch === '(') { depth++; current += ch; }
        else if (ch === ')') { depth--; current += ch; }
        else if (ch === ',' && depth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

function parseColumnDef(def) {
    var tokens = def.trim().split(/\s+/);
    if (tokens.length < 2) return null;
    var name = tokens[0];
    var type = tokens[1].toUpperCase();
    var rest = tokens.slice(2).join(' ').toUpperCase();
    var pk = /PRIMARY\s+KEY/i.test(rest);
    var notNull = /NOT\s+NULL/i.test(rest);
    var unique = /UNIQUE/i.test(rest);
    var fk = null;
    var fkMatch = rest.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i);
    if (fkMatch) fk = { table: fkMatch[1], column: fkMatch[2] };
    if (/SERIAL/i.test(type) && !pk) { pk = true; }
    return { name: name, type: type, pk: pk, fk: fk, notNull: notNull, unique: unique };
}

// ── Value Parsing ──

function parseValueSets(str) {
    var sets = [];
    var depth = 0;
    var current = '';
    var inStr = false;
    var strChar = '';
    for (var i = 0; i < str.length; i++) {
        var ch = str[i];
        if (inStr) {
            current += ch;
            if (ch === strChar) inStr = false;
        } else if (ch === '\'' || ch === '"') {
            inStr = true;
            strChar = ch;
            current += ch;
        } else if (ch === '(') {
            depth++;
            if (depth === 1) { current = ''; continue; }
            current += ch;
        } else if (ch === ')') {
            depth--;
            if (depth === 0) {
                sets.push(parseValues(current));
                continue;
            }
            current += ch;
        } else {
            current += ch;
        }
    }
    return sets;
}

function parseValues(str) {
    var vals = [];
    var current = '';
    var inStr = false;
    var strChar = '';
    for (var i = 0; i < str.length; i++) {
        var ch = str[i];
        if (inStr) {
            current += ch;
            if (ch === strChar) { inStr = false; vals.push(current); current = ''; }
        } else if (ch === '\'' || ch === '"') {
            inStr = true;
            strChar = ch;
            current = ch;
        } else if (ch === ',') {
            var trimmed = current.trim();
            if (trimmed) vals.push(parseLiteral(trimmed));
            current = '';
        } else {
            current += ch;
        }
    }
    var trimmed = current.trim();
    if (trimmed) vals.push(parseLiteral(trimmed));
    return vals;
}

function parseLiteral(s) {
    if (s === 'NULL') return null;
    if (s === 'TRUE') return true;
    if (s === 'FALSE') return false;
    if ((s[0] === '\'' && s[s.length - 1] === '\'') || (s[0] === '"' && s[s.length - 1] === '"')) {
        return s.slice(1, -1);
    }
    var n = Number(s);
    if (!isNaN(n)) return n;
    return s;
}

function parseValue(s) {
    return parseLiteral(s.trim());
}

// ── WHERE Evaluation (Simplified) ──

function evalWhere(row, clause) {
    try {
        var eq = clause.match(/(\w+)\s*=\s*(.+)/);
        if (eq) {
            var col = eq[1];
            var val = parseLiteral(eq[2].trim());
            return String(row[col]) === String(val);
        }
        var neq = clause.match(/(\w+)\s*!=\s*(.+)/);
        if (neq) {
            var col = neq[1];
            var val = parseLiteral(neq[2].trim());
            return String(row[col]) !== String(val);
        }
        var gt = clause.match(/(\w+)\s*>\s*(.+)/);
        if (gt) {
            var col = gt[1];
            var val = parseLiteral(gt[2].trim());
            return Number(row[col]) > Number(val);
        }
        var lt = clause.match(/(\w+)\s*<\s*(.+)/);
        if (lt) {
            var col = lt[1];
            var val = parseLiteral(lt[2].trim());
            return Number(row[col]) < Number(val);
        }
        var gte = clause.match(/(\w+)\s*>=\s*(.+)/);
        if (gte) {
            var col = gte[1];
            var val = parseLiteral(gte[2].trim());
            return Number(row[col]) >= Number(val);
        }
        var lte = clause.match(/(\w+)\s*<=\s*(.+)/);
        if (lte) {
            var col = lte[1];
            var val = parseLiteral(lte[2].trim());
            return Number(row[col]) <= Number(val);
        }
        var like = clause.match(/(\w+)\s+LIKE\s+(.+)/i);
        if (like) {
            var col = like[1];
            var pattern = parseLiteral(like[2].trim());
            var regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
            return regex.test(String(row[col]));
        }
        return true;
    } catch (e) {
        return true;
    }
}

// ── MongoDB Processing ──

function processMongoCommand(cmd) {
    var trimmed = cmd.trim();
    if (/^show\s+collections/i.test(trimmed)) {
        var names = Object.keys(dbLabState.collections);
        if (names.length === 0) {
            addTerminalOutput('No collections yet', 'result');
        } else {
            for (var i = 0; i < names.length; i++) {
                addTerminalOutput(names[i], 'result');
            }
        }
        return;
    }
    if (/^show\s+dbs/i.test(trimmed)) {
        addTerminalOutput('DB Lab (active)', 'result');
        return;
    }
    if (/^db\.createCollection\s*\(\s*["'](\w+)["']\s*\)/i.test(trimmed)) {
        var m = trimmed.match(/^db\.createCollection\s*\(\s*["'](\w+)["']\s*\)/i);
        if (m) {
            var name = m[1];
            if (dbLabState.collections[name]) {
                addTerminalOutput('✗ Collection "' + name + '" already exists', 'error');
                return;
            }
            dbLabState.collections[name] = { documents: [], indexes: [] };
            addTerminalOutput('✓ Collection "' + name + '" created', 'result');
            renderVizMongo();
            updateTableList();
        } else {
            addTerminalOutput('✗ Could not parse db.createCollection()', 'error');
        }
        return;
    }
    if (/^db\.(\w+)\.insertOne\s*\(/.test(trimmed)) {
        var m = trimmed.match(/^db\.(\w+)\.insertOne\s*\(\s*(\{.+\})\s*\)/);
        if (m) {
            var collName = m[1];
            var docStr = m[2];
            if (!dbLabState.collections[collName]) {
                dbLabState.collections[collName] = { documents: [], indexes: [] };
            }
            try {
                var doc = parseJSObject(docStr);
                dbLabState.collections[collName].documents.push({ data: doc });
                addTerminalOutput('✓ 1 document inserted into "' + collName + '"', 'result');
                renderVizMongo();
                updateTableList();
            } catch (e) {
                addTerminalOutput('✗ Could not parse document: ' + e.message, 'error');
            }
        } else {
            addTerminalOutput('✗ Could not parse insertOne()', 'error');
        }
        return;
    }
    if (/^db\.(\w+)\.insertMany\s*\(/.test(trimmed)) {
        var m = trimmed.match(/^db\.(\w+)\.insertMany\s*\(\s*(\[.+\])\s*\)/);
        if (m) {
            var collName = m[1];
            var arrStr = m[2];
            if (!dbLabState.collections[collName]) {
                dbLabState.collections[collName] = { documents: [], indexes: [] };
            }
            try {
                var docs = parseJSArray(arrStr);
                for (var i = 0; i < docs.length; i++) {
                    dbLabState.collections[collName].documents.push({ data: docs[i] });
                }
                addTerminalOutput('✓ ' + docs.length + ' document(s) inserted into "' + collName + '"', 'result');
                renderVizMongo();
                updateTableList();
            } catch (e) {
                addTerminalOutput('✗ Could not parse documents: ' + e.message, 'error');
            }
        } else {
            addTerminalOutput('✗ Could not parse insertMany()', 'error');
        }
        return;
    }
    if (/^db\.(\w+)\.find\s*\(/.test(trimmed)) {
        var m = trimmed.match(/^db\.(\w+)\.find\s*\(\s*(\{[^}]*\})?\s*\)/);
        if (m) {
            var collName = m[1];
            var filterStr = m[2] || '{}';
            if (!dbLabState.collections[collName]) {
                addTerminalOutput('✗ Collection "' + collName + '" does not exist', 'error');
                return;
            }
            var coll = dbLabState.collections[collName];
            var filter = {};
            try {
                filter = parseJSObject(filterStr);
            } catch (e) {
                addTerminalOutput('✗ Could not parse filter: ' + e.message, 'error');
                return;
            }
            var docs = coll.documents.filter(function (entry) { return matchesMongoFilter(entry.data, filter); });
            if (docs.length === 0) {
                addTerminalOutput('No documents found in "' + collName + '"', 'result');
            } else {
                for (var i = 0; i < docs.length; i++) {
                    addTerminalOutput(JSON.stringify(docs[i].data), 'result');
                }
            }
        } else {
            addTerminalOutput('✗ Could not parse find()', 'error');
        }
        return;
    }
    if (/^db\.(\w+)\.deleteMany\s*\(\s*\{\}\s*\)/.test(trimmed)) {
        var m = trimmed.match(/^db\.(\w+)\.deleteMany\s*\(\s*(\{[^}]*\})\s*\)/);
        if (m) {
            var collName = m[1];
            if (!dbLabState.collections[collName]) {
                addTerminalOutput('✗ Collection "' + collName + '" does not exist', 'error');
                return;
            }
            var before = dbLabState.collections[collName].documents.length;
            dbLabState.collections[collName].documents = [];
            addTerminalOutput('✓ ' + before + ' document(s) deleted from "' + collName + '"', 'result');
            renderVizMongo();
            updateTableList();
        } else {
            addTerminalOutput('✗ Could not parse deleteMany()', 'error');
        }
        return;
    }
    if (/^db\.(\w+)\.drop\s*\(\s*\)/.test(trimmed)) {
        var m = trimmed.match(/^db\.(\w+)\.drop\s*\(\s*\)/);
        if (m) {
            var collName = m[1];
            if (!dbLabState.collections[collName]) {
                addTerminalOutput('✗ Collection "' + collName + '" does not exist', 'error');
                return;
            }
            delete dbLabState.collections[collName];
            addTerminalOutput('✓ Collection "' + collName + '" dropped', 'result');
            renderVizMongo();
            updateTableList();
        } else {
            addTerminalOutput('✗ Could not parse drop()', 'error');
        }
        return;
    }
    if (/^db\.(\w+)\.createIndex\s*\(/.test(trimmed)) {
        var m = trimmed.match(/db\.(\w+)\.createIndex\s*\(\s*(\{[^}]+\})\s*\)/);
        if (m) {
            var collName = m[1];
            var idxStr = m[2];
            if (!dbLabState.collections[collName]) {
                addTerminalOutput('✗ Collection "' + collName + '" does not exist', 'error');
                return;
            }
            try {
                var idx = parseJSObject(idxStr);
                var field = Object.keys(idx)[0];
                dbLabState.collections[collName].indexes.push({ field: field });
                addTerminalOutput('✓ Index on "' + collName + '.' + field + '" created', 'result');
                renderVizMongo();
                updateTableList();
            } catch (e) {
                addTerminalOutput('✗ Could not parse index: ' + e.message, 'error');
            }
        } else {
            addTerminalOutput('✗ Could not parse createIndex()', 'error');
        }
        return;
    }
    addTerminalOutput('✗ Unrecognized MongoDB command', 'error');
}

// ── MongoDB Helpers ──

function parseJSObject(str) {
    return JSON.parse(str
        .replace(/'/g, '"')
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']'));
}

function parseJSArray(str) {
    return JSON.parse(str
        .replace(/'/g, '"')
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']'));
}

function matchesMongoFilter(doc, filter) {
    var keys = Object.keys(filter || {});
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var expected = filter[key];
        var actual = doc ? doc[key] : undefined;
        if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
            if (!matchesMongoFilter(actual, expected)) return false;
            continue;
        }
        if (String(actual) !== String(expected)) return false;
    }
    return true;
}

// ── Scenario Loading ──

function loadDbLabScenario(key) {
    if (dbLabEngine === 'mongodb') {
        addTerminalOutput('Scenarios are available in SQL mode. Switch to SQLite, PostgreSQL, or MySQL.', 'error');
        return;
    }
    var sc = DB_LAB_SCENARIOS[key];
    if (!sc) return;
    if (!sc.init) {
        resetState();
        renderViz();
        updateTableList();
        addTerminalOutput('● Blank slate — type SQL to build your database', 'result');
        return;
    }
    resetState();
    addTerminalOutput('● Loading scenario: ' + sc.name + '...', 'result');
    sc.init();
    addTerminalOutput('✓ Scenario "' + sc.name + '" loaded', 'result');
}

// ── Window Resize: Redraw FK Lines ──

if (typeof window !== 'undefined') {
    var _dblabResizeTimer = null;
    window.addEventListener('resize', function () {
        if (_dblabResizeTimer) clearTimeout(_dblabResizeTimer);
        _dblabResizeTimer = setTimeout(function () {
            if (document.getElementById('app').classList.contains('dblab-mode')) {
                drawFkLines();
            }
        }, 200);
    });
}
