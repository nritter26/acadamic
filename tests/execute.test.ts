import { describe, it, expect, beforeAll } from 'vitest';
import { executeCode } from '../services/executor';
import * as database from '../sql/database';

beforeAll(() => {
  database.initAll();
});

describe('Code Execution Service', () => {
  it('executes JavaScript', async () => {
    const result = await executeCode('js', 'console.log("hello")');
    expect(result.output.trim()).toBe('hello');
    expect(result.error).toBeFalsy();
  });

  it('handles JS syntax errors', async () => {
    const result = await executeCode('js', 'if (true { }');
    expect(result.error).toBe(true);
    expect(result.output).toContain('Syntax Error');
  });

  it('handles JS runtime errors', async () => {
    const result = await executeCode('js', 'undefined.x');
    expect(result.error).toBe(true);
    expect(result.output).toContain('Error');
  });

  it('executes SQLite queries', async () => {
    const result = await executeCode('sqlite', 'SELECT 1 as num');
    expect(result.error).toBeFalsy();
    expect(result.output).toContain('num');
    expect(result.output).toContain('1');
    expect(result.output).toContain('rows');
  });

  it('returns no output for empty code', async () => {
    const result = await executeCode('js', '');
    expect(result.error).toBe(true);
  });

  it('returns hint for unsupported language', async () => {
    const result = await executeCode('nonexistent', 'code');
    expect(result.error).toBe(true);
    expect(result.output).toContain('not available');
  });
});
