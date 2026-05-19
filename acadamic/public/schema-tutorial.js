// ── Schema Designer Tutorial — Full-Page Guide ──

let schemaTutActive = false;
var schemaTutStep = 0;

const SCHEMA_TUTORIAL_SEEN_KEY = 'schema_tutorial_seen';
const SCHEMA_TUT_STEPS = [
    {
        title: 'Welcome to Schema Designer',
        icon: '▦',
        body: '<div style="text-align:center;padding:20px 0;">'
            + '<div style="font-size:48px;margin-bottom:10px;color:#8b5cf6;">▦</div>'
            + '<h2 style="color:#f1f5f9;font-size:22px;margin:0 0 6px;">Schema Designer Tutorial</h2>'
            + '<p style="color:#94a3b8;font-size:13px;max-width:500px;margin:0 auto 20px;">'
            + 'Learn to visually design database schemas — add tables, define columns, set constraints, create relationships, and generate production-ready SQL.</p>'
            + '</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:16px;">'
            + '<span style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;color:#cbd5e1;">Tables &amp; Columns</span>'
            + '<span style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;color:#cbd5e1;">Constraints (PK, NN, UQ)</span>'
            + '<span style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;color:#cbd5e1;">Foreign Keys</span>'
            + '<span style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;color:#cbd5e1;">Indexes</span>'
            + '<span style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;color:#cbd5e1;">SQL Generation</span>'
            + '<span style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:6px 14px;font-size:11px;font-weight:700;color:#cbd5e1;">ERD View</span>'
            + '</div>'
            + '<p style="color:#64748b;font-size:11px;text-align:center;">10 steps &middot; ~5 minutes</p>'
    },
    {
        title: 'Tables',
        icon: '📋',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Tables store your data in rows and columns</h3>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'Click <strong style="color:#f1f5f9;">"+ Table"</strong> in the toolbar to add a table. Each table starts with two default columns (<code>id</code> and <code>name</code>). '
            + 'You can <strong style="color:#f1f5f9;">drag tables</strong> around the canvas to arrange them. Click the name input to rename &mdash; use lowercase plural nouns like <code>users</code>, <code>orders</code>, <code>products</code>.</p>'
            + '<p style="color:#64748b;font-size:11px;margin:0 0 10px;">Generated SQL:</p>'
            + '<pre style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:12px;font-size:11px;color:#a5f3fc;overflow-x:auto;margin:0;">'
            + 'CREATE TABLE users (\n'
            + '    id SERIAL PRIMARY KEY,\n'
            + '    name VARCHAR(255) NOT NULL\n'
            + ');\n\n'
            + 'CREATE TABLE orders (\n'
            + '    id SERIAL PRIMARY KEY,\n'
            + '    name VARCHAR(255) NOT NULL\n'
            + ');</pre>'
    },
    {
        title: 'Columns & Data Types',
        icon: '📊',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Define the structure of your data</h3>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'Each column needs a <strong style="color:#f1f5f9;">name</strong> and a <strong style="color:#f1f5f9;">type</strong>. Use the "col name" field and type dropdown in each table row. Available types:</p>'
            + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">INT</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">SERIAL</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">BIGINT</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">VARCHAR(255)</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">TEXT</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">BOOLEAN</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">DATE</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">TIMESTAMP</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">DECIMAL</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">UUID</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">JSONB</span>'
            + '<span style="background:#1e293b;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace;color:#a5f3fc;">FLOAT</span>'
            + '</div>'
            + '<p style="color:#64748b;font-size:11px;margin:0 0 10px;">Each type maps to the appropriate dialect-specific type when you switch dialects.</p>'
            + '<pre style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:12px;font-size:11px;color:#a5f3fc;overflow-x:auto;margin:0;">'
            + 'CREATE TABLE products (\n'
            + '    id SERIAL PRIMARY KEY,\n'
            + '    name VARCHAR(255) NOT NULL,\n'
            + '    price DECIMAL NOT NULL,\n'
            + '    in_stock BOOLEAN DEFAULT true,\n'
            + '    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n'
            + ');</pre>'
    },
    {
        title: 'Constraints',
        icon: '🔒',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Enforce data integrity</h3>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'Toggle constraints on any column using the badges and checkbox in each row:</p>'
            + '<div style="display:flex;flex-direction:column;gap:8px;margin:0 0 12px;">'
            + '<div style="display:flex;align-items:center;gap:10px;background:#1e293b;padding:8px 12px;border-radius:6px;"><span style="background:var(--accent);color:#000;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:800;">PK</span><span style="color:#cbd5e1;font-size:12px;">Primary Key &mdash; uniquely identifies each row</span></div>'
            + '<div style="display:flex;align-items:center;gap:10px;background:#1e293b;padding:8px 12px;border-radius:6px;"><span style="background:#475569;color:#f1f5f9;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:800;">NN</span><span style="color:#cbd5e1;font-size:12px;">NOT NULL &mdash; column must have a value</span></div>'
            + '<div style="display:flex;align-items:center;gap:10px;background:#1e293b;padding:8px 12px;border-radius:6px;"><span style="background:#475569;color:#f1f5f9;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:800;">UQ</span><span style="color:#cbd5e1;font-size:12px;">UNIQUE &mdash; no duplicate values allowed</span></div>'
            + '<div style="display:flex;align-items:center;gap:10px;background:#1e293b;padding:8px 12px;border-radius:6px;"><span style="background:#475569;color:#f1f5f9;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:800;">DF</span><span style="color:#cbd5e1;font-size:12px;">DEFAULT &mdash; sets a fallback value if none is provided</span></div>'
            + '</div>'
            + '<pre style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:12px;font-size:11px;color:#a5f3fc;overflow-x:auto;margin:0;">'
            + 'CREATE TABLE employees (\n'
            + '    id SERIAL PRIMARY KEY,\n'
            + '    email VARCHAR(255) NOT NULL UNIQUE,\n'
            + '    department VARCHAR(100) DEFAULT \'engineering\'\n'
            + ');</pre>'
    },
    {
        title: 'Foreign Keys',
        icon: '🔗',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Link tables together</h3>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'A <strong style="color:#f1f5f9;">foreign key</strong> creates a relationship between two tables. To create one:</p>'
            + '<ol style="color:#94a3b8;font-size:12px;line-height:1.8;margin:0 0 12px;padding-left:20px;">'
            + '<li>Click the <strong style="color:#f1f5f9;">"~>"</strong> handle on the source column</li>'
            + '<li>Then click a column in the <strong style="color:#f1f5f9;">target table</strong></li>'
            + '<li>A colored bezier curve appears showing the relationship</li>'
            + '</ol>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'Cardinality labels (<code>*</code> and <code>1</code>) show one-to-many relationships. Click an existing FK badge to remove it.</p>'
            + '<pre style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:12px;font-size:11px;color:#a5f3fc;overflow-x:auto;margin:0;">'
            + 'CREATE TABLE orders (\n'
            + '    id SERIAL PRIMARY KEY,\n'
            + '    user_id INT NOT NULL REFERENCES users(id),\n'
            + '    total DECIMAL,\n'
            + '    status VARCHAR(50) DEFAULT \'pending\'\n'
            + ');</pre>'
    },
    {
        title: 'Indexes',
        icon: '⚡',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Speed up your queries</h3>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'Indexes make database queries faster by allowing quick lookups on specific columns. To add one:</p>'
            + '<ol style="color:#94a3b8;font-size:12px;line-height:1.8;margin:0 0 12px;padding-left:20px;">'
            + '<li>Click <strong style="color:#f1f5f9;">"+ Index"</strong> below a table</li>'
            + '<li>Name your index (e.g., <code>idx_users_email</code>)</li>'
            + '<li>Select which columns to include</li>'
            + '<li>Toggle <strong style="color:#f1f5f9;">UNIQUE</strong> if the index should enforce uniqueness</li>'
            + '</ol>'
            + '<pre style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:12px;font-size:11px;color:#a5f3fc;overflow-x:auto;margin:0;">'
            + 'CREATE UNIQUE INDEX idx_users_email ON users(email);\n'
            + 'CREATE INDEX idx_orders_user_id ON orders(user_id);</pre>'
    },
    {
        title: 'ERD View',
        icon: '🌐',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Visualize relationships</h3>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'The <strong style="color:#f1f5f9;">ERD (Entity-Relationship Diagram)</strong> view shows a simplified, read-only visualization of your schema:</p>'
            + '<ul style="color:#94a3b8;font-size:12px;line-height:1.8;margin:0 0 12px;padding-left:20px;">'
            + '<li>Compact table cards with <strong style="color:#f1f5f9;">PK</strong> and <strong style="color:#f1f5f9;">FK</strong> badges</li>'
            + '<li>Constraint flags: <code>NN</code>, <code>UQ</code>, <code>DF</code></li>'
            + '<li><strong style="color:#f1f5f9;">Dashed lines</strong> represent relationships</li>'
            + '<li>Click a row to create or remove FK links (same click-to-link flow)</li>'
            + '<li>Drag tables to reposition</li>'
            + '</ul>'
            + '<p style="color:#64748b;font-size:11px;margin:0 0 10px;">Switch between Design and ERD using the tabs at the top of the schema designer.</p>'
    },
    {
        title: 'SQL Generation',
        icon: '⚙️',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Generate production-ready DDL</h3>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'The <strong style="color:#f1f5f9;">SQL Preview</strong> panel at the bottom of the schema designer auto-generates DDL as you design, with a 500ms debounce.</p>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'Switch dialects using the dropdown to see how the same schema translates:</p>'
            + '<div style="display:flex;gap:6px;margin:0 0 12px;">'
            + '<span style="background:#1e293b;border:1px solid #336791;padding:4px 10px;border-radius:4px;font-size:10px;color:#336791;font-weight:700;">PostgreSQL</span>'
            + '<span style="background:#1e293b;border:1px solid #F29111;padding:4px 10px;border-radius:4px;font-size:10px;color:#F29111;font-weight:700;">MySQL</span>'
            + '<span style="background:#1e293b;border:1px solid #003B57;padding:4px 10px;border-radius:4px;font-size:10px;color:#47A248;font-weight:700;">SQLite</span>'
            + '</div>'
            + '<p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0 0 12px;">'
            + 'Use <strong style="color:#f1f5f9;">Copy</strong> to copy to clipboard or <strong style="color:#f1f5f9;">Download</strong> to save as a <code>.sql</code> file.</p>'
            + '<pre style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:12px;font-size:11px;color:#a5f3fc;overflow-x:auto;margin:0;">'
            + '-- PostgreSQL\n'
            + 'CREATE TABLE users (\n'
            + '    id SERIAL PRIMARY KEY,\n'
            + '    name VARCHAR(255) NOT NULL\n'
            + ');\n\n'
            + '-- MySQL\n'
            + 'CREATE TABLE users (\n'
            + '    id INT AUTO_INCREMENT PRIMARY KEY,\n'
            + '    name VARCHAR(255) NOT NULL\n'
            + ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n'
            + '-- SQLite\n'
            + 'CREATE TABLE users (\n'
            + '    id INTEGER PRIMARY KEY AUTOINCREMENT,\n'
            + '    name TEXT NOT NULL\n'
            + ');</pre>'
    },
    {
        title: 'Import, Export & Versioning',
        icon: '💾',
        body: '<h3 style="color:#f1f5f9;font-size:15px;margin:0 0 8px;">Save and restore your work</h3>'
            + '<div style="display:flex;flex-direction:column;gap:8px;margin:0 0 12px;">'
            + '<div style="background:#1e293b;padding:10px 14px;border-radius:6px;"><span style="color:#8b5cf6;font-weight:800;font-size:12px;">Import SQL</span><p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">Paste CREATE TABLE statements to parse them into the visual designer. Supports PostgreSQL, MySQL, and SQLite dialects.</p></div>'
            + '<div style="background:#1e293b;padding:10px 14px;border-radius:6px;"><span style="color:#8b5cf6;font-weight:800;font-size:12px;">Export JSON / SQL</span><p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">Download your schema as a JSON file (for re-import) or as a SQL file (for direct use).</p></div>'
            + '<div style="background:#1e293b;padding:10px 14px;border-radius:6px;"><span style="color:#8b5cf6;font-weight:800;font-size:12px;">Undo / Redo</span><p style="color:#94a3b8;font-size:11px;margin:4px 0 0;"><strong>Ctrl+Z</strong> and <strong>Ctrl+Y</strong> for 50-deep undo/redo stack. Never lose your changes.</p></div>'
            + '<div style="background:#1e293b;padding:10px 14px;border-radius:6px;"><span style="color:#8b5cf6;font-weight:800;font-size:12px;">Version History</span><p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">Save named snapshots of your schema to localStorage. Restore or delete them anytime.</p></div>'
            + '</div>'
    },
    {
        title: "You're Ready!",
        icon: '🎉',
        body: '<div style="text-align:center;padding:20px 0;">'
            + '<div style="font-size:48px;margin-bottom:10px;">🎉</div>'
            + '<h2 style="color:#f1f5f9;font-size:20px;margin:0 0 8px;">You\'ve Completed the Tutorial!</h2>'
            + '<p style="color:#94a3b8;font-size:13px;max-width:450px;margin:0 auto 20px;">'
            + 'You now know how to use every feature of the Schema Designer. '
            + 'Click the button below to open the practice workspace and start designing your own schemas!</p>'
            + '<p style="color:#64748b;font-size:11px;margin:0 0 16px;">'
            + 'Tip: You can replay this tutorial anytime by clicking the <strong style="color:#8b5cf6;">Tutorial</strong> button in the schema toolbar.</p>'
            + '</div>'
    }
];

function initSchemaTutorial() {
    schemaTutActive = true;
    schemaTutStep = 0;
    var container = document.getElementById('schemaTutorialPage');
    if (!container) return;
    container.style.display = 'flex';
    document.getElementById('app').className = 'schema-tut-mode';
    document.getElementById('header-title').innerText = 'SCHEMA TUTORIAL';
    document.getElementById('level-bar').style.display = 'none';
    document.querySelectorAll('.selector button').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.header-extra-tabs .game-nav-btn').forEach(function (b) { b.classList.remove('active'); });
    var tutorialNav = document.getElementById('tutorial-nav');
    if (tutorialNav) tutorialNav.style.display = 'none';
    var topicList = document.getElementById('topic-list');
    if (topicList) topicList.style.display = 'none';
    var explanation = document.getElementById('explanation');
    if (explanation) explanation.style.display = 'none';
    var searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.style.display = 'none';
    var roadmapBtn = document.getElementById('roadmap-btn');
    if (roadmapBtn) roadmapBtn.style.display = 'none';
    schemaTutRender();
}

function schemaTutRender() {
    var container = document.getElementById('schemaTutorialPage');
    if (!container) return;
    var step = SCHEMA_TUT_STEPS[schemaTutStep];
    if (!step) return;
    var total = SCHEMA_TUT_STEPS.length;
    var pct = Math.round(((schemaTutStep + 1) / total) * 100);
    var dots = '';
    for (var i = 0; i < total; i++) {
        dots += '<span class="schema-tut-dot' + (i === schemaTutStep ? ' active' : '') + '" onclick="schemaTutGo(' + i + ')"></span>';
    }
    var html = ''
        + '<div class="schema-tut-overlay">'
        + '<div class="schema-tut-card">'
        + '<div class="schema-tut-topbar">'
        + '<span class="schema-tut-topbar-title">Schema Designer Tutorial</span>'
        + '<button class="schema-tut-close" onclick="schemaTutBackToDb()" title="Back to Database">&times;</button>'
        + '</div>'
        + '<div class="schema-tut-progress-bar"><div class="schema-tut-progress-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="schema-tut-body">'
        + step.body
        + '</div>'
        + '<div class="schema-tut-footer">'
        + '<div class="schema-tut-dots">' + dots + '</div>'
        + '<div class="schema-tut-nav">'
        + (schemaTutStep > 0
            ? '<button class="schema-tut-btn" onclick="schemaTutPrev()">\u2190 Back</button>'
            : '<button class="schema-tut-btn" disabled style="opacity:0.3;cursor:default;">\u2190 Back</button>')
        + (schemaTutStep < total - 1
            ? '<button class="schema-tut-btn schema-tut-btn-primary" onclick="schemaTutNext()">Next \u2192</button>'
            : '<button class="schema-tut-btn schema-tut-btn-primary" onclick="schemaTutBackToDb()">\u2192 Go Practice</button>')
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    container.innerHTML = html;
}

function schemaTutNext() {
    if (schemaTutStep < SCHEMA_TUT_STEPS.length - 1) {
        schemaTutStep++;
        schemaTutRender();
    }
}

function schemaTutPrev() {
    if (schemaTutStep > 0) {
        schemaTutStep--;
        schemaTutRender();
    }
}

function schemaTutGo(step) {
    schemaTutStep = step;
    schemaTutRender();
}

function schemaTutBackToDb() {
    schemaTutActive = false;
    schemaTutStep = 0;
    var container = document.getElementById('schemaTutorialPage');
    if (container) container.style.display = 'none';
    var topicList = document.getElementById('topic-list');
    if (topicList) topicList.style.display = '';
    var explanation = document.getElementById('explanation');
    if (explanation) explanation.style.display = '';
    var searchInput = document.getElementById('topic-search');
    if (searchInput) searchInput.style.display = '';
    var roadmapBtn = document.getElementById('roadmap-btn');
    if (roadmapBtn) roadmapBtn.style.display = '';
    localStorage.setItem(SCHEMA_TUTORIAL_SEEN_KEY, '1');
    setMode('db');
    setTimeout(function () {
        toggleSchemaDesigner();
    }, 100);
}
