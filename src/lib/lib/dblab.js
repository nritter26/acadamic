// ── DB Lab Engine — SQL / MongoDB execution ──

export function createDbLabEngine() {
  let state = { tables: {}, collections: {}, nextId: 1 };
  let history = [];
  let historyIdx = -1;
  let tablePositions = {};
  let linkingState = null;

  const ENGINES = [
    { id: 'sqlite', label: 'SQLite', color: '#003B57' },
    { id: 'pg', label: 'PostgreSQL', color: '#336791' },
    { id: 'mysql', label: 'MySQL', color: '#F29111' },
    { id: 'mongodb', label: 'MongoDB', color: '#47A248' },
  ];

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(s) { return escapeHtml(s).replace(/'/g, '&#39;'); }

  function jsArg(s) { return JSON.stringify(String(s)); }

  function safeDomId(prefix, name) { return prefix + '-' + encodeURIComponent(String(name)); }

  function padRight(s, len) { s = String(s); return s.length < len ? s + ' '.repeat(len - s.length) : s; }

  function splitColumns(def) {
    let depth = 0, current = '', parts = [];
    for (const ch of def) {
      if (ch === '(') { depth++; current += ch; }
      else if (ch === ')') { depth--; current += ch; }
      else if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
      else current += ch;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  function parseColumnDef(def) {
    const tokens = def.trim().split(/\s+/);
    if (tokens.length < 2) return null;
    const name = tokens[0];
    const type = tokens[1].toUpperCase();
    const rest = tokens.slice(2).join(' ').toUpperCase();
    const pk = /PRIMARY\s+KEY/i.test(rest);
    const notNull = /NOT\s+NULL/i.test(rest);
    const unique = /UNIQUE/i.test(rest);
    let fk = null;
    const fkMatch = rest.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i);
    if (fkMatch) fk = { table: fkMatch[1], column: fkMatch[2] };
    if (/SERIAL/i.test(type) && !pk) { /* serial implies pk */ }
    return { name, type, pk: pk || /SERIAL/i.test(type), fk, notNull, unique };
  }

  function parseColumns(def) {
    return splitColumns(def).map(parseColumnDef).filter(Boolean);
  }

  function parseLiteral(s) {
    if (s === 'NULL') return null;
    if (s === 'TRUE') return true;
    if (s === 'FALSE') return false;
    if ((s[0] === '\'' && s[s.length - 1] === '\'') || (s[0] === '"' && s[s.length - 1] === '"')) return s.slice(1, -1);
    const n = Number(s);
    return isNaN(n) ? s : n;
  }

  function parseValues(str) {
    const vals = []; let current = '', inStr = false, strChar = '';
    for (const ch of str) {
      if (inStr) { current += ch; if (ch === strChar) { inStr = false; vals.push(current); current = ''; } }
      else if (ch === '\'' || ch === '"') { inStr = true; strChar = ch; current = ch; }
      else if (ch === ',') { const t = current.trim(); if (t) vals.push(parseLiteral(t)); current = ''; }
      else current += ch;
    }
    const t = current.trim(); if (t) vals.push(parseLiteral(t));
    return vals;
  }

  function parseValueSets(str) {
    const sets = []; let depth = 0, current = '', inStr = false, strChar = '';
    for (const ch of str) {
      if (inStr) { current += ch; if (ch === strChar) inStr = false; }
      else if (ch === '\'' || ch === '"') { inStr = true; strChar = ch; current += ch; }
      else if (ch === '(') { depth++; if (depth === 1) { current = ''; continue; } current += ch; }
      else if (ch === ')') { depth--; if (depth === 0) { sets.push(parseValues(current)); continue; } current += ch; }
      else current += ch;
    }
    return sets;
  }

  function evalWhere(row, clause) {
    try {
      const eq = clause.match(/(\w+)\s*=\s*(.+)/);
      if (eq) return String(row[eq[1]]) === String(parseLiteral(eq[2].trim()));
      const neq = clause.match(/(\w+)\s*!=\s*(.+)/);
      if (neq) return String(row[neq[1]]) !== String(parseLiteral(neq[2].trim()));
      const gt = clause.match(/(\w+)\s*>\s*(.+)/);
      if (gt) return Number(row[gt[1]]) > Number(parseLiteral(gt[2].trim()));
      const lt = clause.match(/(\w+)\s*<\s*(.+)/);
      if (lt) return Number(row[lt[1]]) < Number(parseLiteral(lt[2].trim()));
      const gte = clause.match(/(\w+)\s*>=\s*(.+)/);
      if (gte) return Number(row[gte[1]]) >= Number(parseLiteral(gte[2].trim()));
      const lte = clause.match(/(\w+)\s*<=\s*(.+)/);
      if (lte) return Number(row[lte[1]]) <= Number(parseLiteral(lte[2].trim()));
      return true;
    } catch { return true; }
  }

  function parseSelectStatement(sql) {
    const m = sql.match(/^SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)([\s\S]*)$/i);
    if (!m) return null;
    const columns = splitColumns(m[1].trim()).map(s => s.trim());
    const rest = (m[3] || '').trim();
    const whereMatch = rest.match(/\bWHERE\b\s+([\s\S]*?)(?=\bORDER\s+BY\b|\bLIMIT\b|$)/i);
    const orderMatch = rest.match(/\bORDER\s+BY\b\s+(\w+)(?:\s+(ASC|DESC))?/i);
    const limitMatch = rest.match(/\bLIMIT\b\s+(\d+)/i);
    return {
      columns,
      table: m[2],
      where: whereMatch ? whereMatch[1].trim().replace(/;\s*$/, '') : null,
      orderBy: orderMatch ? orderMatch[1] : null,
      orderDesc: orderMatch && String(orderMatch[2] || '').toUpperCase() === 'DESC',
      limit: limitMatch ? parseInt(limitMatch[1], 10) : null,
      countOnly: columns.length === 1 && /^COUNT\s*\(\s*(\*|1)\s*\)$/i.test(columns[0]),
    };
  }

  function formatAsciiTable(rows, cols) {
    if (!rows || rows.length === 0) return '(0 rows)';
    const widths = cols.map(c => Math.max(String(c).length, 8));
    for (const row of rows) {
      for (let j = 0; j < cols.length; j++) {
        const s = row[cols[j]] === null || typeof row[cols[j]] === 'undefined' ? 'NULL' : String(row[cols[j]]);
        if (s.length > widths[j]) widths[j] = Math.min(s.length, 80);
      }
    }
    const tw = widths.reduce((a, w) => a + w + 3, 0) + 1;
    let out = '┌' + '─'.repeat(tw - 2) + '┐\n│';
    for (let k = 0; k < cols.length; k++) out += ' ' + padRight(cols[k], widths[k]) + ' │';
    out += '\n├' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┤\n';
    for (const row of rows) {
      out += '│';
      for (const c of cols) {
        const raw = row[c];
        const str = raw === null || typeof raw === 'undefined' ? 'NULL' : String(raw);
        out += ' ' + padRight(str.length > 80 ? str.slice(0, 77) + '...' : str, widths[cols.indexOf(c)]) + ' │';
      }
      out += '\n';
    }
    out += '└' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘\n(' + rows.length + ' rows)';
    return out;
  }

  function getEngine() { return state; }
  function getState() { return { tables: state.tables, collections: state.collections, nextId: state.nextId }; }
  function getTablePositions() { return tablePositions; }
  function getLinkingState() { return linkingState; }
  function getHistory() { return history; }
  function getHistoryIdx() { return historyIdx; }

  function setHistoryIdx(i) { historyIdx = i; }

  function resetState() {
    state = { tables: {}, collections: {}, nextId: 1 };
    tablePositions = {};
    history = [];
    historyIdx = -1;
    linkingState = null;
  }

  function pushHistory(cmd) {
    history.push(cmd);
    historyIdx = history.length;
  }

  function createTable(sql, silent) {
    const m = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]+)\)\s*$/i);
    if (!m) return !silent && { error: 'Could not parse CREATE TABLE statement' };
    const name = m[1], colsDef = m[2];
    if (state.tables[name]) return !silent && { error: `Table "${name}" already exists` };
    const cols = parseColumns(colsDef);
    if (!cols || cols.length === 0) return !silent && { error: 'No valid columns found' };
    state.tables[name] = { columns: cols, rows: [], indexes: [] };
    return { msg: `Table "${name}" created (${cols.length} columns)` };
  }

  function dropTable(sql, silent) {
    const m = sql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
    if (!m) return !silent && { error: 'Could not parse DROP TABLE statement' };
    const name = m[1];
    if (!state.tables[name]) return !silent && { error: `Table "${name}" does not exist` };
    delete state.tables[name];
    for (const t of Object.keys(state.tables)) {
      for (const c of state.tables[t].columns) { if (c.fk && c.fk.table === name) c.fk = null; }
    }
    return { msg: `Table "${name}" dropped` };
  }

  function alterTable(sql, silent) {
    const add = sql.match(/ALTER\s+TABLE\s+(\w+)\s+ADD\s+(?:COLUMN\s+)?(\w+)\s+(\S+)(.*)/i);
    if (add) {
      const name = add[1], colName = add[2], colType = add[3].replace(/,.*$/, '');
      if (!state.tables[name]) return !silent && { error: `Table "${name}" does not exist` };
      const col = parseColumnDef(colName + ' ' + colType + ' ' + (add[4] || ''));
      if (!col) return !silent && { error: 'Could not parse column definition' };
      state.tables[name].columns.push(col);
      return { msg: `Column "${colName}" added to "${name}"` };
    }
    const drop = sql.match(/ALTER\s+TABLE\s+(\w+)\s+DROP\s+(?:COLUMN\s+)?(\w+)/i);
    if (drop) {
      const name = drop[1], colName = drop[2];
      if (!state.tables[name]) return !silent && { error: `Table "${name}" does not exist` };
      const idx = state.tables[name].columns.findIndex(c => c.name === colName);
      if (idx === -1) return !silent && { error: `Column "${colName}" not found` };
      state.tables[name].columns.splice(idx, 1);
      return { msg: `Column "${colName}" dropped from "${name}"` };
    }
    const rename = sql.match(/ALTER\s+TABLE\s+(\w+)\s+RENAME\s+TO\s+(\w+)/i);
    if (rename) {
      const name = rename[1], newName = rename[2];
      if (!state.tables[name]) return !silent && { error: `Table "${name}" does not exist` };
      state.tables[newName] = state.tables[name];
      delete state.tables[name];
      for (const t of Object.keys(state.tables)) {
        for (const c of state.tables[t].columns) { if (c.fk && c.fk.table === name) c.fk.table = newName; }
      }
      return { msg: `Table "${name}" renamed to "${newName}"` };
    }
    return !silent && { error: 'Could not parse ALTER TABLE. Supported: ADD COLUMN, DROP COLUMN, RENAME TO' };
  }

  function insertInto(sql, silent) {
    const m = sql.match(/INSERT\s+INTO\s+(\w+)(?:\s*\(([^)]+)\))?\s*VALUES\s*(.+)/i);
    if (!m) return !silent && { error: 'Could not parse INSERT statement' };
    const name = m[1], colsList = m[2] ? m[2].split(',').map(s => s.trim()) : null;
    if (!state.tables[name]) return !silent && { error: `Table "${name}" does not exist` };
    const tbl = state.tables[name];
    const valSets = parseValueSets(m[3]);
    if (!valSets || valSets.length === 0) return !silent && { error: 'Could not parse VALUES' };
    let inserted = 0;
    for (const vals of valSets) {
      const row = {};
      if (colsList) { colsList.forEach((c, i) => { if (i < vals.length) row[c] = vals[i]; }); }
      else { tbl.columns.forEach((c, i) => { if (i < vals.length) row[c.name] = vals[i]; }); }
      tbl.rows.push(row); inserted++;
    }
    return { msg: `${inserted} row(s) inserted into "${name}"` };
  }

  function updateTable(sql, silent) {
    const m = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (!m) return !silent && { error: 'Could not parse UPDATE statement' };
    const name = m[1], setClause = m[2], whereClause = m[3] || null;
    if (!state.tables[name]) return !silent && { error: `Table "${name}" does not exist` };
    const tbl = state.tables[name];
    const setParts = setClause.split(',').map(s => s.trim());
    let updated = 0;
    for (const row of tbl.rows) {
      if (whereClause && !evalWhere(row, whereClause)) continue;
      for (const sp of setParts) { const p = sp.match(/(\w+)\s*=\s*(.+)/); if (p) row[p[1]] = parseLiteral(p[2].trim()); }
      updated++;
    }
    return { msg: `${updated} row(s) updated in "${name}"` };
  }

  function deleteFrom(sql, silent) {
    const m = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
    if (!m) return !silent && { error: 'Could not parse DELETE statement' };
    const name = m[1], whereClause = m[2] || null;
    if (!state.tables[name]) return !silent && { error: `Table "${name}" does not exist` };
    const tbl = state.tables[name];
    const before = tbl.rows.length;
    tbl.rows = whereClause ? tbl.rows.filter(r => !evalWhere(r, whereClause)) : [];
    return { msg: `${before - tbl.rows.length} row(s) deleted from "${name}"` };
  }

  function truncateTable(sql, silent) {
    const m = sql.match(/TRUNCATE\s+TABLE\s+(\w+)/i);
    if (!m) return !silent && { error: 'Could not parse TRUNCATE statement' };
    if (!state.tables[m[1]]) return !silent && { error: `Table "${m[1]}" does not exist` };
    state.tables[m[1]].rows = [];
    return { msg: `Table "${m[1]}" truncated` };
  }

  function createIndex(sql, silent) {
    const m = sql.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:\w+\s+)?ON\s+(\w+)\s*\((\w+)\)/i);
    if (!m) return !silent && { error: 'Could not parse CREATE INDEX' };
    if (!state.tables[m[1]]) return !silent && { error: `Table "${m[1]}" does not exist` };
    state.tables[m[1]].indexes.push({ column: m[2] });
    return { msg: `Index on "${m[1]}(${m[2]})" created` };
  }

  function dropIndex(sql, silent) {
    const m = sql.match(/DROP\s+INDEX\s+(\w+)/i);
    if (!m) return !silent && { error: 'Could not parse DROP INDEX' };
    for (const [t, tbl] of Object.entries(state.tables)) {
      for (let i = 0; i < tbl.indexes.length; i++) {
        if (tbl.indexes[i].column === m[1] || m[1] === t + '_' + tbl.indexes[i].column + '_idx') {
          tbl.indexes.splice(i, 1); return { msg: 'Index dropped' };
        }
      }
    }
    return !silent && { error: 'Index not found' };
  }

  function executeSelect(sql) {
    const parsed = parseSelectStatement(sql);
    if (!parsed) return { error: 'Could not parse SELECT statement' };
    const tbl = state.tables[parsed.table];
    if (!tbl) return { error: `Table "${parsed.table}" does not exist` };
    let rows = tbl.rows.slice();
    if (parsed.where) rows = rows.filter(r => evalWhere(r, parsed.where));
    if (parsed.orderBy) {
      rows.sort((a, b) => String(a[parsed.orderBy] ?? '').localeCompare(String(b[parsed.orderBy] ?? ''), undefined, { numeric: true, sensitivity: 'base' }) * (parsed.orderDesc ? -1 : 1));
    }
    if (parsed.limit !== null) rows = rows.slice(0, parsed.limit);
    if (parsed.countOnly) return { text: formatAsciiTable([{ count: rows.length }], ['count']) };
    const cols = parsed.columns[0] === '*' ? tbl.columns.map(c => c.name) : parsed.columns;
    const out = rows.map(r => { const o = {}; cols.forEach(c => o[c] = r[c]); return o; });
    return { text: formatAsciiTable(out, cols) };
  }

  function processSqlCommand(cmd) {
    const trimmed = cmd.trim().replace(/;\s*$/, '').trim();
    if (!trimmed) return null;
    if (/^(SELECT|EXPLAIN|SHOW|PRAGMA)\b/i.test(trimmed)) {
      if (/^EXPLAIN\b/i.test(trimmed)) return { text: 'EXPLAIN not implemented', error: true };
      if (/^SHOW\s+TABLES\b/i.test(trimmed)) {
        const names = Object.keys(state.tables);
        if (names.length === 0) return { text: '(0 rows)' };
        return { text: formatAsciiTable(names.map(n => ({ table_name: n })), ['table_name']) };
      }
      if (/^PRAGMA\s+table_info\s*\(\s*(\w+)\s*\)\s*$/i.test(trimmed)) {
        const tname = RegExp.$1;
        const tbl = state.tables[tname];
        if (!tbl) return { text: `Table "${tname}" does not exist`, error: true };
        return { text: formatAsciiTable(tbl.columns.map((c, i) => ({ cid: i, name: c.name, type: c.type, notnull: c.notNull ? 1 : 0, pk: c.pk ? 1 : 0 })), ['cid', 'name', 'type', 'notnull', 'pk']) };
      }
      if (/^SHOW\b/i.test(trimmed)) return { text: 'Only SHOW TABLES supported', error: true };
      return executeSelect(trimmed);
    }
    let result;
    if (/^CREATE\s+TABLE\b/i.test(trimmed)) result = createTable(trimmed);
    else if (/^DROP\s+TABLE\b/i.test(trimmed)) result = dropTable(trimmed);
    else if (/^ALTER\s+TABLE\b/i.test(trimmed)) result = alterTable(trimmed);
    else if (/^INSERT\s+INTO\b/i.test(trimmed)) result = insertInto(trimmed);
    else if (/^UPDATE\b/i.test(trimmed)) result = updateTable(trimmed);
    else if (/^DELETE\s+FROM\b/i.test(trimmed)) result = deleteFrom(trimmed);
    else if (/^CREATE\s+INDEX\b/i.test(trimmed)) result = createIndex(trimmed);
    else if (/^DROP\s+INDEX\b/i.test(trimmed)) result = dropIndex(trimmed);
    else if (/^TRUNCATE\s+TABLE\b/i.test(trimmed)) result = truncateTable(trimmed);
    else if (/^(BEGIN|COMMIT|ROLLBACK)\b/i.test(trimmed)) return { text: '✓ Transaction control acknowledged' };
    else return { text: 'Unrecognized SQL. Try: CREATE TABLE, INSERT, SELECT', error: true };
    return result;
  }

  // ── MongoDB ──

  function processMongoCommand(cmd) {
    const trimmed = cmd.trim();
    if (/^db\.createCollection\s*\(\s*"([^"]+)"\s*\)\s*$/i.test(trimmed)) {
      const name = RegExp.$1;
      if (state.collections[name]) return { text: `Collection "${name}" already exists`, error: true };
      state.collections[name] = { documents: [], indexes: [] };
      return { text: `Collection "${name}" created` };
    }
    if (/^db\.(\w+)\.insertOne\s*\(\s*({.+})\s*\)\s*$/i.test(trimmed)) {
      const coll = RegExp.$1;
      if (!state.collections[coll]) return { text: `Collection "${coll}" does not exist. Create it first.`, error: true };
      try { const doc = JSON.parse(RegExp.$2); state.collections[coll].documents.push({ data: doc }); return { text: 'Document inserted' }; }
      catch { return { text: 'Could not parse document', error: true }; }
    }
    if (/^db\.(\w+)\.find\s*\(\s*({?[^}]*}?)\s*\)\s*$/i.test(trimmed)) {
      const coll = RegExp.$1;
      if (!state.collections[coll]) return { text: `Collection "${coll}" does not exist`, error: true };
      let query = {};
      try { if (RegExp.$2.trim()) query = JSON.parse(RegExp.$2); } catch {}
      const results = state.collections[coll].documents.filter(d => {
        for (const [k, v] of Object.entries(query)) { if (d.data[k] !== v) return false; }
        return true;
      });
      if (results.length === 0) return { text: '(no documents)' };
      const lines = results.map(d => JSON.stringify(d.data));
      return { text: lines.join('\n') + '\n(' + results.length + ' document(s))' };
    }
    if (/^db\.(\w+)\.drop\s*\(\s*\)\s*$/i.test(trimmed)) {
      const coll = RegExp.$1;
      if (!state.collections[coll]) return { text: `Collection "${coll}" does not exist`, error: true };
      delete state.collections[coll];
      return { text: `Collection "${coll}" dropped` };
    }
    return { text: 'Unknown MongoDB command. Try: db.createCollection("x"), db.x.insertOne({..}), db.x.find({..})', error: true };
  }

  function processCommand(cmd, engine) {
    pushHistory(cmd);
    if (engine === 'mongodb') return processMongoCommand(cmd);
    return processSqlCommand(cmd);
  }

  // ── Scenarios ──

  const SCENARIOS = {
    blank: { name: 'Blank', desc: 'Start from scratch — no tables.' },
    hr: {
      name: 'HR',
      desc: 'Departments, employees, salaries',
      init() {
        createTable("CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL, location TEXT)", true);
        insertInto("INSERT INTO departments VALUES (1, 'Engineering', 'New York')", true);
        insertInto("INSERT INTO departments VALUES (2, 'Marketing', 'San Francisco')", true);
        insertInto("INSERT INTO departments VALUES (3, 'Sales', 'Chicago')", true);
        createTable("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, department_id INTEGER REFERENCES departments(id), salary REAL, hire_date TEXT)", true);
        insertInto("INSERT INTO employees VALUES (1, 'Alice Johnson', 'alice@company.com', 1, 95000, '2020-03-15')", true);
        insertInto("INSERT INTO employees VALUES (2, 'Bob Smith', 'bob@company.com', 1, 85000, '2021-06-01')", true);
        insertInto("INSERT INTO employees VALUES (3, 'Charlie Brown', 'charlie@company.com', 2, 72000, '2022-01-10')", true);
        createTable("CREATE TABLE salaries (id INTEGER PRIMARY KEY, employee_id INTEGER REFERENCES employees(id), amount REAL, paid_date TEXT)", true);
        insertInto("INSERT INTO salaries VALUES (1, 1, 95000, '2024-01-15')", true);
        insertInto("INSERT INTO salaries VALUES (2, 2, 85000, '2024-01-15')", true);
        insertInto("INSERT INTO salaries VALUES (3, 3, 72000, '2024-01-15')", true);
      },
    },
    ecommerce: {
      name: 'E-Commerce',
      desc: 'Customers, orders, products, categories',
      init() {
        createTable("CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT)", true);
        insertInto("INSERT INTO categories VALUES (1, 'Electronics', 'Gadgets and devices')", true);
        insertInto("INSERT INTO categories VALUES (2, 'Clothing', 'Apparel and accessories')", true);
        insertInto("INSERT INTO categories VALUES (3, 'Books', 'Printed and digital books')", true);
        createTable("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL, category_id INTEGER REFERENCES categories(id), stock INTEGER)", true);
        insertInto("INSERT INTO products VALUES (1, 'Laptop', 999.99, 1, 50)", true);
        insertInto("INSERT INTO products VALUES (2, 'T-Shirt', 19.99, 2, 200)", true);
        insertInto("INSERT INTO products VALUES (3, 'JavaScript Guide', 39.99, 3, 100)", true);
        createTable("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, city TEXT)", true);
        insertInto("INSERT INTO customers VALUES (1, 'John Doe', 'john@email.com', 'New York')", true);
        insertInto("INSERT INTO customers VALUES (2, 'Jane Smith', 'jane@email.com', 'Los Angeles')", true);
        createTable("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product_id INTEGER REFERENCES products(id), quantity INTEGER, order_date TEXT)", true);
        insertInto("INSERT INTO orders VALUES (1, 1, 1, 1, '2024-01-10')", true);
        insertInto("INSERT INTO orders VALUES (2, 1, 3, 2, '2024-01-12')", true);
        insertInto("INSERT INTO orders VALUES (3, 2, 2, 3, '2024-01-15')", true);
      },
    },
  };

  return {
    getState, getEngine, getTablePositions, getLinkingState, getHistory, getHistoryIdx, setHistoryIdx,
    resetState, processCommand, SCENARIOS, ENGINES,
    createTable, dropTable, insertInto, alterTable, updateTable, deleteFrom,
    executeSelect, formatAsciiTable, escapeHtml, escapeAttr, jsArg, safeDomId,
    setLinkingState(s) { linkingState = s; },
    clearLinkingState() { linkingState = null; },
  };
}
