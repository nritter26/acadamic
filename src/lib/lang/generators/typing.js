import { pick, deterministicShuffle } from '../index.js';
import { getSpec } from './choice.js';

export function generateTypingSpeed(langId, index) {
  const spec = getSpec(langId);
  const patterns = spec.patterns;
  if (!patterns || patterns.length === 0) {
    return { prompt: 'Type exactly:', target: 'const answer = 42;', answer: 'const answer = 42;' };
  }
  const p = pick(patterns, langId, 'typing-speed', index);
  const code = p.lines.join('\n');
  return { prompt: 'Type exactly:', target: code, answer: code };
}
