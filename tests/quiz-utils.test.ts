import { describe, it, expect } from 'vitest';
import { shuffleOptions } from '../src/lib/lib/quiz-utils';

describe('shuffleOptions', () => {
  it('preserves the correct answer after shuffling', () => {
    const options = ['A', 'B', 'C', 'D'];
    const correctIdx = 0;

    const result = shuffleOptions(options, correctIdx);

    expect(result.shuffledOptions).toHaveLength(4);
    expect([...result.shuffledOptions].sort()).toEqual([...options].sort());
    expect(result.shuffledOptions[result.newCorrectIdx]).toBe('A');
  });

  it('works when correct answer is at any position', () => {
    const options = ['red', 'green', 'blue', 'yellow'];
    const correctIdx = 2;

    const result = shuffleOptions(options, correctIdx);

    expect(result.shuffledOptions[result.newCorrectIdx]).toBe('blue');
  });

  it('returns different order on consecutive calls (non-deterministic)', () => {
    const options = ['x', 'y', 'z', 'w'];
    const correctIdx = 1;

    const results = new Set();
    for (let i = 0; i < 20; i++) {
      const r = shuffleOptions(options, correctIdx);
      results.add(r.shuffledOptions.join(','));
    }

    expect(results.size).toBeGreaterThan(1);
  });

  it('handles two options', () => {
    const options = ['yes', 'no'];
    const correctIdx = 0;

    const result = shuffleOptions(options, correctIdx);

    expect(result.shuffledOptions).toHaveLength(2);
    expect(result.shuffledOptions).toContain('yes');
    expect(result.shuffledOptions).toContain('no');
    expect(result.shuffledOptions[result.newCorrectIdx]).toBe('yes');
  });

  it('does not mutate the original array', () => {
    const options = ['A', 'B', 'C'];
    const original = [...options];

    shuffleOptions(options, 0);

    expect(options).toEqual(original);
  });
});
