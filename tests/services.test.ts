import { describe, it, expect } from 'vitest';
import { analyzeCode } from '../services/analyzer';

describe('analyzeCode service', () => {
  it('detects loose equality', () => {
    const result = analyzeCode('a == b', 'js');
    expect(result.hints.length).toBeGreaterThan(0);
    expect(result.hints[0]).toContain('===');
  });

  it('detects var usage', () => {
    const result = analyzeCode('var x = 1;', 'js');
    expect(result.hints.some(h => h.includes('var'))).toBe(true);
  });

  it('detects unbalanced braces', () => {
    const result = analyzeCode('function foo() {', 'js');
    expect(result.hints.some(h => h.includes('curly') || h.includes('braces'))).toBe(true);
  });

  it('returns no hints for empty code', () => {
    const result = analyzeCode('', 'js');
    expect(result.hints).toEqual([]);
  });
});
