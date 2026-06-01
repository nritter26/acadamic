import { describe, expect, test } from 'vitest';

describe('schema helpers', () => {
  test('generates create table SQL for schema tables', async () => {
    const { generateSchemaSql } = await import('../src/lib/lib/schema.js');

    expect(generateSchemaSql([{
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'email', type: 'TEXT', notNull: true },
      ],
    }])).toContain('CREATE TABLE users');
  });

  test('updates schema tables immutably', async () => {
    const { addColumn, updateColumn, updateTable } = await import('../src/lib/lib/schema.js');
    const tables = [{ id: 1, name: 'users', columns: [{ name: 'id', type: 'INTEGER' }] }];

    const renamed = updateTable(tables, 1, { name: 'accounts' });
    const withColumn = addColumn(renamed, 1);
    const updated = updateColumn(withColumn, 1, 1, { name: 'email' });

    expect(updated[0].name).toBe('accounts');
    expect(updated[0].columns[1].name).toBe('email');
    expect(tables[0].name).toBe('users');
  });
});

describe('compiler helpers', () => {
  test('tokenizes source code into words and symbols', async () => {
    const { tokenizeSource } = await import('../src/lib/lib/compiler.js');

    expect(tokenizeSource('let x = 1;').map(token => token.value)).toEqual(['let', 'x', '=', '1', ';']);
  });
});

describe('db helpers', () => {
  test('formats row results as an ascii table', async () => {
    const { formatRowsAsTable } = await import('../src/lib/lib/db.js');

    expect(formatRowsAsTable([{ id: 1, name: 'Ada' }])).toContain('Ada');
  });
});
