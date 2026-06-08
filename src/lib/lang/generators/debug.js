import { pick, deterministicShuffle } from '../index.js';
import { getSpec } from './choice.js';

export function generateDebugTheBug(langId, index) {
  const spec = getSpec(langId);
  const bugs = spec.bugs;
  if (!bugs || bugs.length === 0) {
    return { prompt: `Which is correct ${spec.name} syntax?`, choices: ['let x = 5;', 'let 5 = x;', 'x let = 5;'], answer: 'let x = 5;' };
  }
  const bug = pick(bugs, langId, 'debug-the-bug', index);
  return { prompt: bug.prompt, choices: deterministicShuffle(bug.choices, langId + 'debug' + index), answer: bug.answer };
}
