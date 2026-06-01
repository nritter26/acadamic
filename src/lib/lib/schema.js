export function generateSchemaSql(tables = []) {
  return tables.map((table) => {
    const columns = (table.columns || []).map((column) => {
      const parts = [quoteIdent(column.name), column.type || 'TEXT'];
      if (column.primaryKey) parts.push('PRIMARY KEY');
      if (column.notNull) parts.push('NOT NULL');
      if (column.unique) parts.push('UNIQUE');
      if (column.references) parts.push(`REFERENCES ${quoteIdent(column.references.table)}(${quoteIdent(column.references.column)})`);
      return `  ${parts.join(' ')}`;
    });
    return `CREATE TABLE ${quoteIdent(table.name)} (\n${columns.join(',\n')}\n);`;
  }).join('\n\n');
}

export function quoteIdent(value = '') {
  return String(value).replace(/[^\w]/g, '_') || 'unnamed';
}

export function createDefaultSchema() {
  return [{
    id: 1,
    name: 'users',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true },
      { name: 'email', type: 'TEXT', notNull: true, unique: true },
    ],
  }];
}

export function updateTable(tables, tableId, patch) {
  return tables.map(table => table.id === tableId ? { ...table, ...patch } : table);
}

export function updateColumn(tables, tableId, columnIndex, patch) {
  return tables.map((table) => {
    if (table.id !== tableId) return table;
    return {
      ...table,
      columns: table.columns.map((column, index) => index === columnIndex ? { ...column, ...patch } : column),
    };
  });
}

export function addColumn(tables, tableId) {
  return tables.map((table) => {
    if (table.id !== tableId) return table;
    return {
      ...table,
      columns: [...table.columns, { name: `column_${table.columns.length + 1}`, type: 'TEXT' }],
    };
  });
}
