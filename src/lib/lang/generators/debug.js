import { pick, deterministicShuffle } from '../index.js';
import { getSpec } from './choice.js';

export function generateDebugTheBug(langId, index) {
  const spec = getSpec(langId);
  const bugs = spec.bugs;
  const patterns = spec.patterns;

  // For low-bug-count specs, generate synthetic bugs from patterns
  if (!bugs || bugs.length < 3) {
    if (patterns && patterns.length > 0) {
      const p = pick(patterns, langId, 'debug-synth', index);
      const code = p.lines.join('\n');
      // Create a synthetic bug: wrong keyword/variable swap
      const wrongCode = code.replace(/\b(let|const|var|def|fun|func|fn|int|val)\b/g, (m) =>
        m === 'let' ? 'lte' : m === 'const' ? 'consts' : m === 'def' ? 'deff' : m === 'fun' ? 'func' : m + 'x'
      );
      return { prompt: `Find the bug in this ${spec.name} code:\n\`\`\`\n${wrongCode}\n\`\`\``, choices: deterministicShuffle(['Syntax error: typo in keyword', 'Missing closing bracket', 'Wrong variable type'], langId + 'dsyn' + index), answer: 'Syntax error: typo in keyword' };
    }
    return { prompt: `Which is correct ${spec.name} syntax?`, choices: ['let x = 5;', 'let 5 = x;', 'x let = 5;'], answer: 'let x = 5;' };
  }

  const bug = pick(bugs, langId, 'debug-the-bug', index);
  // Alternate between original and inverted question type
  if (index % 3 === 0) {
    return { prompt: bug.prompt, choices: deterministicShuffle(bug.choices, langId + 'debug' + index), answer: bug.answer };
  } else if (index % 3 === 1) {
    // Ask to identify the WRONG option instead
    return { prompt: `Which option has a bug in ${spec.name}?`, choices: deterministicShuffle(bug.choices, langId + 'debug' + index + 'w'), answer: bug.choices.find(c => c !== bug.answer) || bug.answer };
  } else {
    // Ask a code-fix question
    return { prompt: bug.prompt.replace('Which', 'Fix the bug: which'), choices: deterministicShuffle(bug.choices, langId + 'debug' + index + 'f'), answer: bug.answer };
  }
}
