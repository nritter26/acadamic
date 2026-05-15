const { askLLM } = require('./provider');

const KEYWORD_ISSUES = {
  js: [
    { pattern: /==(?!\s*=)/, message: 'Use `===` (strict equality) instead of `==` to avoid type coercion.', severity: 'style' },
    { pattern: /\bvar\s/, message: 'Use `let` or `const` instead of `var` for block scoping.', severity: 'style' },
    { pattern: /for\s*\([^)]+in\s+/, message: 'Use `for...of` instead of `for...in` for arrays — `for...in` iterates keys as strings.', severity: 'warning' },
    { pattern: /eval\s*\(/, message: 'Avoid `eval()` — it executes arbitrary code and is a security risk.', severity: 'error' },
    { pattern: /===\s*true\b/, message: 'Redundant comparison to `true` — use `if (value)` instead.', severity: 'style' },
    { pattern: /===\s*false\b/, message: 'Use `if (!value)` instead of comparing to `false`.', severity: 'style' },
    { pattern: /===\s*null\b/, message: 'Use `value === null` explicitly only if you mean null specifically — otherwise use `!value`.', severity: 'style' },
    { pattern: /\.length\s*!==\s*0/, message: 'Simpler: `if (arr.length)` instead of `if (arr.length !== 0)`.', severity: 'style' },
    { pattern: /\.length\s*===?\s*0/, message: 'Simpler: `if (!arr.length)` instead of `if (arr.length === 0)`.', severity: 'style' },
    { pattern: /new\s+(Array|Object|RegExp)\s*\(/, message: 'Use literal syntax: `[]`, `{}`, `/pattern/` instead of `new Array()`, etc.', severity: 'style' },
    { pattern: /\bString\s*\(/, message: 'Use `String(value)` or template literals `` `${value}` `` for conversion.', severity: 'style' },
    { pattern: /\bNumber\s*\(/, message: 'Use `Number(value)` or unary `+value` for numeric conversion.', severity: 'style' },
  ],
  py: [
    { pattern: /(?:except|catch)\s*:\s*$/, message: 'Bare `except:` catches ALL exceptions including Ctrl+C — specify the exception type.', severity: 'warning' },
    { pattern: /==\s*(?:True|False|None)/, message: 'Use `is` instead of `==` for comparing to `True`/`False`/`None`.', severity: 'style' },
    { pattern: /\t/, message: 'Mixed tabs and spaces — use 4 spaces consistently.', severity: 'error' },
  ],
  go: [
    { pattern: /if\s+err\s*!=\s*nil\s*\{\s*\n\s*return\s+\w+/, message: 'Good error check — but consider adding error context with `fmt.Errorf("context: %w", err)`.', severity: 'info' },
  ],
  rs: [
    { pattern: /\.unwrap\(\)/, message: '`.unwrap()` will panic on error — prefer pattern matching or `?` operator.', severity: 'warning' },
    { pattern: /\.expect\(/, message: '`.expect()` will panic on error — prefer proper error handling.', severity: 'warning' },
  ],
};

function analyzeStructure(code, lang) {
  const issues = [];
  const lines = code.split('\n');

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push({ line: 0, message: `Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing.`, severity: 'error', category: 'syntax' });
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push({ line: 0, message: `Unbalanced parentheses: ${openParens} opening vs ${closeParens} closing.`, severity: 'error', category: 'syntax' });
  }

  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.push({ line: 0, message: `Unbalanced brackets: ${openBrackets} opening vs ${closeBrackets} closing.`, severity: 'error', category: 'syntax' });
  }

  if ((code.includes('function') || code.includes('=>') || code.includes('def ') || code.includes('func ')) && !code.includes('return')) {
    if (code.includes('function') || code.includes('=>') || code.includes('def ') || code.includes('func ')) {
      const funcLines = lines.filter(l => l.includes('function') || l.includes('=>') || l.includes('def ') || l.includes('func '));
      if (funcLines.length > 0 && !funcLines.some(l => l.trim().startsWith('//') || l.trim().startsWith('#'))) {
        for (const fl of funcLines) {
          const lineNum = lines.indexOf(fl) + 1;
          const trimmed = fl.trim();
          if (!trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('console.log')) {
            issues.push({ line: lineNum, message: 'Function defined but no `return` statement found — will return undefined/None.', severity: 'warning', category: 'logic' });
            break;
          }
        }
      }
    }
  }

  return issues;
}

function checkKeywordPatterns(code, lang) {
  const issues = [];
  const patterns = KEYWORD_ISSUES[lang] || [];
  const lines = code.split('\n');
  for (const { pattern, message, severity } of patterns) {
    const match = code.match(pattern);
    if (match) {
      const matchedLine = lines.findIndex(l => pattern.test(l));
      issues.push({ line: matchedLine + 1, message, severity, category: 'style' });
    }
  }
  return issues;
}

async function reviewWithLLM(code, lang, topic) {
  const prompt = `You are an expert code reviewer. Review the following ${lang || 'programming'} code${topic ? ` on the topic of "${topic}"` : ''}.

Code to review:
\`\`\`${lang || ''}
${code}
\`\`\`

Provide your review in this format:
## Summary
(1-2 sentences describing what the code does)

## Issues
- **Severity** | Line X | Category | Message

## Strengths
- What the code does well

## Suggestions
- Specific improvements

## Score
Overall score out of 10 based on: correctness, style, efficiency, edge cases.`;

  try {
    const reply = await askLLM([{ role: 'user', content: prompt }]);
    return reply;
  } catch {
    return null;
  }
}

function generateStructureReview(code, lang) {
  const lines = code.split('\n');
  const hasMain = code.includes('main') || code.includes('Main');
  const hasFunctions = code.includes('function') || code.includes('=>') || code.includes('def ') || code.includes('func ');
  const hasClass = code.includes('class ');
  const hasLoop = /for\s*\(|while\s*\(|\.forEach|for\s+\w+\s+in|for\s+\w+\s+of/.test(code);
  const hasConditional = /if\s*\(|elif\s+|else\s+/.test(code);
  const hasTryCatch = code.includes('try') && (code.includes('catch') || code.includes('except'));
  const hasAsync = code.includes('async') || code.includes('await') || code.includes('then(');

  let review = `**Code Review — ${lang ? lang.toUpperCase() : 'Code'}**\n\n`;
  review += `**Overview:** ${lines.length} lines, ${hasFunctions ? 'contains functions, ' : ''}${hasClass ? 'contains classes, ' : ''}${hasLoop ? 'uses loops, ' : ''}${hasConditional ? 'uses conditionals, ' : ''}${hasTryCatch ? 'has error handling, ' : ''}${hasAsync ? 'uses async patterns.' : '.'}`;

  const structuralIssues = analyzeStructure(code, lang);
  const keywordIssues = checkKeywordPatterns(code, lang);
  const allIssues = [...structuralIssues, ...keywordIssues];

  if (allIssues.length > 0) {
    review += `\n\n**Issues Found:**\n`;
    const bySeverity = { error: [], warning: [], style: [], info: [] };
    for (const issue of allIssues) {
      (bySeverity[issue.severity] || bySeverity.info).push(issue);
    }
    for (const sev of ['error', 'warning', 'style', 'info']) {
      for (const issue of bySeverity[sev]) {
        const line = issue.line ? `Line ${issue.line}` : 'General';
        review += `- [${sev.toUpperCase()}] ${line}: ${issue.message}\n`;
      }
    }
  }

  if (hasMain && !hasFunctions && lines.length < 10) {
    review += `\n**Suggestion:** This code is very simple — try organizing it into functions to practice modular design.\n`;
  }

  if (lines.length > 50) {
    review += `\n**Suggestion:** This function/file is getting long (${lines.length} lines). Consider breaking it into smaller functions for readability.\n`;
  }

  if (!hasTryCatch && (code.includes('fetch(') || code.includes('readFile') || code.includes('writeFile'))) {
    review += `\n**Suggestion:** I/O operations like fetch/file access can fail — add error handling with try/catch.\n`;
  }

  const commentedRatio = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('#') || l.trim().startsWith('/*')).length / lines.length;
  if (commentedRatio > 0.4) {
    review += `\n**Suggestion:** High comment-to-code ratio (${Math.round(commentedRatio * 100)}%). Comments explain WHY, not WHAT — let the code speak for itself.\n`;
  }

  review += `\n**Score:** ${calculateScore(allIssues, lines.length)}/10`;
  return { review, issues: allIssues };
}

function calculateScore(issues, lineCount) {
  let score = 10;
  for (const issue of issues) {
    if (issue.severity === 'error') score -= 2;
    else if (issue.severity === 'warning') score -= 1;
    else if (issue.severity === 'style') score -= 0.5;
  }
  if (lineCount === 0) score = 0;
  return Math.max(1, Math.round(score * 10) / 10);
}

async function review(code, lang, topic) {
  if (!code || !code.trim()) {
    return { review: 'No code to review.', issues: [], score: 0 };
  }

  const llmReview = await reviewWithLLM(code, lang, topic);
  if (llmReview) {
    const structuralIssues = analyzeStructure(code, lang);
    const keywordIssues = checkKeywordPatterns(code, lang);
    return { review: llmReview, issues: [...structuralIssues, ...keywordIssues], score: null, source: 'llm' };
  }

  const result = generateStructureReview(code, lang);
  return { ...result, source: 'static' };
}

module.exports = { review, analyzeStructure, checkKeywordPatterns };
