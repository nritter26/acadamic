/**
 * Remove extracted data declarations from source JS files.
 * Replaces each const/let/var data declaration with a comment marker.
 *
 * Usage: node scripts/cleanup-source-data.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── Each entry: { file, removals: [ {varName, type} ] } ──
// type: 'const' | 'assignment'
const CLEANUPS = [
  {
    file: 'public/game.js',
    removals: [
      { varName: 'gameLangNames' },
      { varName: 'gameLangList' },
      { varName: 'gameSnippets' },
      { varName: 'scrambleSets' },
      { varName: 'debugChallenges' },
      { varName: 'sprintChallenges' },
      { varName: 'spotBugQuestions' },
      { varName: 'flashQuestions' },
      { varName: 'raceProblems' },
      { varName: 'swipeQuestions' },
      { varName: 'GAMES' },
      { varName: 'SPOT_BUG_ROUNDS' },
      { varName: 'ACHIEVEMENT_DEFS' },
      { varName: 'THEMES' },
      { varName: 'golfChallenges' },
      { varName: 'baseConvQuestions' },
      { varName: 'crosswordTerms' },
      { varName: 'regexChallenges' },
      { varName: 'sqlJoinQuestions' },
      { varName: 'errorQuestions' },
      { varName: 'apiQuestions' },
    ]
  },
  {
    file: 'public/techstack.js',
    removals: [
      { varName: 'techStackProviderNames' },
      { varName: 'techStackProviderColors' },
      { varName: 'techStackIntro' },
    ]
  },
  {
    file: 'public/git-visualize.js',
    removals: [
      { varName: 'GIT_TUTORIAL' },
      { varName: 'GIT_SCENARIOS' },
      { varName: 'BRANCH_COLORS' },
    ]
  },
  {
    file: 'public/schema-tutorial.js',
    removals: [
      { varName: 'SCHEMA_TUT_STEPS' },
    ]
  },
  {
    file: 'public/schema.js',
    removals: [
      { varName: 'schemaTypes' },
      { varName: 'dialectTypeMap' },
    ]
  },
  {
    file: 'public/db.js',
    removals: [
      { varName: 'dbProviderNames' },
      { varName: 'dbProviderColors' },
    ]
  },
  {
    file: 'public/langConfig.js',
    removals: [
      { varName: 'LANG_NAMES' },
    ]
  },
  {
    file: 'public/compiler-core.js',
    removals: [
      { varName: 'LANG_CONFIG' },
      { varName: 'TOKEN_TYPES' },
      { varName: 'TOKEN_COLORS' },
    ]
  },
  {
    file: 'public/ai/core.js',
    removals: [
      { varName: 'LANG_NAMES' },
      { varName: 'SYNONYM_MAP' },
      { varName: 'ERROR_PATTERNS' },
      { varName: 'KEYWORD_ISSUES' },
      { varName: 'exercises' },
    ]
  },
];

// ── Extract JS value by brace-depth parsing (same as extract-app-data.js) ──
function isRegexStart(source, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(source[j])) j--;
  if (j < 0) return true;
  const prev = source[j];
  if (prev === ')' || prev === ']' || prev === '}') return false;
  if (/[a-zA-Z0-9_$]/.test(prev)) return false;
  return true;
}

function skipRegex(source, i) {
  i++;
  while (i < source.length) {
    if (source[i] === '\\') { i += 2; continue; }
    if (source[i] === '/') break;
    i++;
  }
  i++;
  while (i < source.length && /[gimsuy]/.test(source[i])) i++;
  return i;
}

function extractJSValueRange(source, startPos) {
  let i = startPos;
  while (i < source.length && /\s/.test(source[i])) i++;
  if (i >= source.length) return null;
  const ch = source[i];

  if (ch === '/' && source[i + 1] !== '/' && source[i + 1] !== '*') {
    i = skipRegex(source, i);
    return { start: startPos, end: i };
  }

  if (ch === '{' || ch === '[' || ch === '(') {
    const stack = [ch];
    i++;
    while (i < source.length && stack.length > 0) {
      const c = source[i];
      if (c === '/' && source[i + 1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
      if (c === '/' && source[i + 1] === '*') { i += 2; while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') {
        const quote = c; i++;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') { i += 2; continue; }
          if (quote === '`' && source[i] === '$' && source[i + 1] === '{') {
            let depth = 1; i += 2;
            while (i < source.length && depth > 0) {
              if (source[i] === '\\') { i += 2; continue; }
              if (source[i] === '{') depth++;
              if (source[i] === '}') depth--;
              if (depth > 0) i++;
            }
            i++; continue;
          }
          i++;
        }
        i++; continue;
      }
      if (c === '/' && source[i + 1] !== '/' && source[i + 1] !== '*' && isRegexStart(source, i)) {
        i = skipRegex(source, i); continue;
      }
      if (c === '{' || c === '[' || c === '(') stack.push(c);
      else if ((c === '}' && stack[stack.length - 1] === '{') ||
               (c === ']' && stack[stack.length - 1] === '[') ||
               (c === ')' && stack[stack.length - 1] === '(')) stack.pop();
      i++;
    }
    if (stack.length !== 0) return null;
    return { start: startPos, end: i };
  }

  while (i < source.length && !/[\s,;)\]}]/.test(source[i])) i++;
  return { start: startPos, end: i };
}

function findDeclaration(source, varName) {
  const re = new RegExp('(?:^|;|\\n)\\s*(const|let|var)\\s+' + varName + '\\s*=\\s*', 'm');
  const m = re.exec(source);
  if (!m) return null;
  const declStart = m.index;
  const eqPos = source.indexOf('=', m.index);
  const valueRange = extractJSValueRange(source, eqPos + 1);
  if (!valueRange) return null;
  return { start: declStart, end: valueRange.end, declType: m[1], varName };
}

function removeDeclaration(source, decl, comment) {
  // Find the end of the line containing the end of the value
  // The value might include a trailing ;
  let end = decl.end;
  while (end < source.length && (source[end] === ' ' || source[end] === ';' || source[end] === '\r')) end++;
  // If there's extra stuff after, only remove up to the semicolon/newline
  if (end < source.length && source[end] === '\n') end++;
  else if (end < source.length && source[end] === '\r') { end++; if (source[end] === '\n') end++; }

  const before = source.slice(0, decl.start);
  const after = source.slice(end);
  const replacement = `// ${comment}\n`;
  return before + replacement + after;
}

function main() {
  for (const { file, removals } of CLEANUPS) {
    const filePath = path.join(ROOT, file);
    let source = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const { varName } of removals) {
      const decl = findDeclaration(source, varName);
      if (!decl) {
        console.log(`  ${file}: ${varName} — not found, skipping`);
        continue;
      }
      const comment = `${varName} extracted to content/app-data.json`;
      source = removeDeclaration(source, decl, comment);
      modified = true;
      console.log(`  ${file}: ${varName} — removed`);
    }

    if (modified) {
      fs.writeFileSync(filePath, source, 'utf-8');
    }
  }
  console.log('\nDone.');
}

main();
