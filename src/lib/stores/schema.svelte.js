import { browser } from '$app/environment';
import { addColumn, createDefaultSchema, updateColumn, updateTable } from '$lib/lib/schema.js';

let _tables = $state(createDefaultSchema());
let _dialect = $state('postgresql');
let _activeTab = $state('design');
let _history = $state([]);
let _historyIndex = $state(-1);

const STORAGE_KEY = 'kodex_schema';

function pushHistory(tables) {
  _history = _history.slice(0, _historyIndex + 1);
  _history.push(JSON.parse(JSON.stringify(tables)));
  if (_history.length > 50) _history.shift();
  _historyIndex = _history.length - 1;
}

export function getSchemaState() {
  return {
    get tables() { return _tables; },
    set tables(value) { _tables = value; },
    get dialect() { return _dialect; },
    set dialect(value) { _dialect = value; },
    get activeTab() { return _activeTab; },
    set activeTab(value) { _activeTab = value; },

    addTable() {
      const next = [..._tables, {
        id: Date.now(),
        name: `table_${_tables.length + 1}`,
        columns: [{ name: 'id', type: 'INTEGER', primaryKey: true }],
      }];
      pushHistory(_tables);
      _tables = next;
      this.persist();
    },

    updateTable(tableId, patch) {
      pushHistory(_tables);
      _tables = updateTable(_tables, tableId, patch);
      this.persist();
    },

    addColumn(tableId) {
      pushHistory(_tables);
      _tables = addColumn(_tables, tableId);
      this.persist();
    },

    updateColumn(tableId, columnIndex, patch) {
      pushHistory(_tables);
      _tables = updateColumn(_tables, tableId, columnIndex, patch);
      this.persist();
    },

    deleteTable(tableId) {
      pushHistory(_tables);
      _tables = _tables.filter(t => t.id !== tableId);
      this.persist();
    },

    deleteColumn(tableId, columnIndex) {
      pushHistory(_tables);
      _tables = _tables.map(t => {
        if (t.id !== tableId) return t;
        return { ...t, columns: t.columns.filter((_, i) => i !== columnIndex) };
      });
      this.persist();
    },

    undo() {
      if (_historyIndex < 0) return;
      _historyIndex--;
      _tables = _history[_historyIndex] || createDefaultSchema();
      this.persist();
    },

    redo() {
      if (_historyIndex >= _history.length - 1) return;
      _historyIndex++;
      _tables = JSON.parse(JSON.stringify(_history[_historyIndex]));
      this.persist();
    },

    clearAll() {
      pushHistory(_tables);
      _tables = [];
      this.persist();
    },

    importJSON(jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (Array.isArray(data)) {
          pushHistory(_tables);
          _tables = data;
          this.persist();
          return true;
        }
      } catch { /* invalid JSON */ }
      return false;
    },

    exportJSON() {
      return JSON.stringify(_tables, null, 2);
    },

    persist() {
      if (!browser) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tables: _tables, dialect: _dialect }));
    },

    load() {
      if (!browser) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          pushHistory(_tables);
          return;
        }
        const data = JSON.parse(raw);
        _tables = data.tables || createDefaultSchema();
        _dialect = data.dialect || 'postgresql';
        pushHistory(_tables);
      } catch {
        _tables = createDefaultSchema();
        pushHistory(_tables);
      }
    },
  };
}
