export function formatRowsAsTable(rows = []) {
  if (!rows.length) return '(no rows)';

  const columns = Object.keys(rows[0]);
  const widths = Object.fromEntries(columns.map((column) => [
    column,
    Math.max(column.length, ...rows.map(row => String(row[column] ?? '').length)),
  ]));
  const line = columns.map(column => '-'.repeat(widths[column])).join('-+-');
  const header = columns.map(column => column.padEnd(widths[column])).join(' | ');
  const body = rows.map(row => columns.map(column => String(row[column] ?? '').padEnd(widths[column])).join(' | '));

  return [header, line, ...body].join('\n');
}
