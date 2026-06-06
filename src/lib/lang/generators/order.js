import { pick, deterministicShuffle } from '../index.js';
import { getSpec } from './choice.js';

export function generateCodeScramble(langId, index) {
  const spec = getSpec(langId);
  const patterns = spec.patterns;
  if (!patterns || patterns.length === 0) return null;
  const p = pick(patterns, langId, 'code-scramble', index);
  const lines = [...p.lines];
  const shuffled = deterministicShuffle(lines, langId + 'cs' + index);
  const prompt = `Reorder these ${spec.name} code lines into the correct order:`;
  return { prompt, pieces: shuffled, answer: p.lines.join('\n') };
}
