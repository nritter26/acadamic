import { browser } from '$app/environment';
import { addColumn, createDefaultSchema, updateColumn, updateTable } from '$lib/lib/schema.js';

let _tables = $state(createDefaultSchema());
let _dialect = $state('postgresql');
let _activeTab = $state('design');

const STORAGE_KEY = 'kodex_schema';

export function getSchemaState() {
  return {
    get tables() { return _tables; },
    set tables(value) { _tables = value; },
    get dialect() { return _dialect; },
    set dialect(value) { _dialect = value; },
    get activeTab() { return _activeTab; },
    set activeTab(value) { _activeTab = value; },

    addTable() {
      _tables = [..._tables, {
        id: Date.now(),
        name: `table_${_tables.length + 1}`,
        columns: [{ name: 'id', type: 'INTEGER', primaryKey: true }],
      }];
      this.persist();
    },

    updateTable(tableId, patch) {
      _tables = updateTable(_tables, tableId, patch);
      this.persist();
    },

    addColumn(tableId) {
      _tables = addColumn(_tables, tableId);
      this.persist();
    },

    updateColumn(tableId, columnIndex, patch) {
      _tables = updateColumn(_tables, tableId, columnIndex, patch);
      this.persist();
    },

    persist() {
      if (!browser) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tables: _tables, dialect: _dialect }));
    },

    load() {
      if (!browser) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        _tables = data.tables || createDefaultSchema();
        _dialect = data.dialect || 'postgresql';
      } catch {
        _tables = createDefaultSchema();
      }
    },
  };
}
