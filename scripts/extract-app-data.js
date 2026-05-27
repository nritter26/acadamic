/**
 * Extract App Data — Extracts all non-logic data from JS sources
 * into a single content/app-data.json.
 *
 * Usage: node scripts/extract-app-data.js
 *
 * Strategy: For each data declaration, extract the raw JS value text
 * using brace-depth parsing, then evaluate it with vm.runInNewContext
 * and serialize to JSON. RegExp instances become {source, flags} and
 * functions become {body: "..."} via a JSON replacer.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'content', 'app-data.json');

// ── Configuration ──
const EXTRACTIONS = [
  { file: 'public/techstack.js',          varName: 'techStackProviderNames',type: 'const' },
  { file: 'public/techstack.js',          varName: 'techStackProviderColors',type: 'const' },
  { file: 'public/techstack.js',          varName: 'techStackIntro',        type: 'const' },
  { file: 'public/git-visualize.js',      varName: 'GIT_TUTORIAL',          type: 'const' },
  { file: 'public/git-visualize.js',      varName: 'GIT_SCENARIOS',         type: 'const' },
  { file: 'public/git-visualize.js',      varName: 'BRANCH_COLORS',         type: 'const' },
  { file: 'public/schema-tutorial.js',    varName: 'SCHEMA_TUT_STEPS',      type: 'const' },
  { file: 'public/schema.js',            varName: 'schemaTypes',           type: 'const' },
  { file: 'public/schema.js',            varName: 'dialectTypeMap',        type: 'const' },
  { file: 'public/db.js',                varName: 'dbProviderNames',       type: 'const' },
  { file: 'public/db.js',                varName: 'dbProviderColors',      type: 'const' },
  { file: 'public/langConfig.js',        varName: 'LANG_NAMES',            type: 'const' },

  // ai/core.js — data inside IIFE
  { file: 'public/ai/core.js',           varName: 'LANG_NAMES',            type: 'iife' },
  { file: 'public/ai/core.js',           varName: 'SYNONYM_MAP',           type: 'iife' },
  { file: 'public/ai/core.js',           varName: 'ERROR_PATTERNS',        type: 'iife' },
  { file: 'public/ai/core.js',           varName: 'KEYWORD_ISSUES',        type: 'iife' },
  { file: 'public/ai/core.js',           varName: 'exercises',             type: 'const' },

  // compiler-core.js — data inside IIFE
  { file: 'public/compiler-core.js',     varName: 'LANG_CONFIG',           type: 'iife' },
  { file: 'public/compiler-core.js',     varName: 'TOKEN_TYPES',           type: 'iife' },
  { file: 'public/compiler-core.js',     varName: 'TOKEN_COLORS',          type: 'iife' },

  // game.js
  { file: 'public/game.js',              varName: 'gameLangNames',         type: 'const' },
  { file: 'public/game.js',              varName: 'gameLangList',          type: 'const' },
  { file: 'public/game.js',              varName: 'gameSnippets',          type: 'const' },
  { file: 'public/game.js',              varName: 'scrambleSets',          type: 'const' },
  { file: 'public/game.js',              varName: 'debugChallenges',       type: 'const' },
  { file: 'public/game.js',              varName: 'sprintChallenges',      type: 'const' },
  { file: 'public/game.js',              varName: 'spotBugQuestions',      type: 'const' },
  { file: 'public/game.js',              varName: 'flashQuestions',        type: 'const' },
  { file: 'public/game.js',              varName: 'raceProblems',          type: 'const' },
  { file: 'public/game.js',              varName: 'swipeQuestions',        type: 'const' },
  { file: 'public/game.js',              varName: 'GAMES',                 type: 'const' },
  { file: 'public/game.js',              varName: 'SPOT_BUG_ROUNDS',       type: 'const' },
  { file: 'public/game.js',              varName: 'ACHIEVEMENT_DEFS',      type: 'const' },
  { file: 'public/game.js',              varName: 'THEMES',                type: 'const' },
  { file: 'public/game.js',              varName: 'golfChallenges',        type: 'const' },
  { file: 'public/game.js',              varName: 'baseConvQuestions',     type: 'const' },
  { file: 'public/game.js',              varName: 'crosswordTerms',        type: 'const' },
  { file: 'public/game.js',              varName: 'regexChallenges',       type: 'const' },
  { file: 'public/game.js',              varName: 'sqlJoinQuestions',      type: 'const' },
  { file: 'public/game.js',              varName: 'errorQuestions',        type: 'const' },
  { file: 'public/game.js',              varName: 'apiQuestions',          type: 'const' },
];

// ── Helper: check if / at position i starts a RegExp literal ──
// Heuristic: / is a regex if the previous non-whitespace char is
// an operator, opening bracket, comma, colon, or similar.
function isRegexStart(source, i) {
  // Walk back skipping whitespace and comments to find the previous token
  let j = i - 1;
  while (j >= 0 && /\s/.test(source[j])) j--;
  if (j < 0) return true;
  const prev = source[j];
  // If prev is a closing bracket, it's likely division (e.g., `} / 2`)
  if (prev === ')' || prev === ']' || prev === '}') return false;
  // If prev is an identifier or number, it's likely division (e.g., `x / 2`, `5 / 2`)
  if (/[a-zA-Z0-9_$]/.test(prev)) return false;
  return true; // Otherwise, it's likely a regex (after =, (, [, ,, :, ;, !, &, |, ?, +, -, *, /, %, etc.)
}

// ── Skip one regex literal starting at position i (which points to the opening /) ──
// Returns the position after the regex (including flags).
function skipRegex(source, i) {
  i++; // past opening /
  while (i < source.length) {
    if (source[i] === '\\') { i += 2; continue; }
    if (source[i] === '/') break;
    i++;
  }
  i++; // past closing /
  while (i < source.length && /[gimsuy]/.test(source[i])) i++;
  return i;
}

// ── Extract JS value by brace-depth parsing ──
function extractJSValue(source, startPos) {
  let i = startPos;
  while (i < source.length && /\s/.test(source[i])) i++;

  if (i >= source.length) throw new Error('Unexpected EOF');
  const ch = source[i];

  if (ch === '/' && source[i + 1] !== '/' && source[i + 1] !== '*') {
    // RegExp literal at value level (e.g., const x = /pattern/)
    i = skipRegex(source, i);
    return source.slice(startPos, i);
  }

  if (ch === '{' || ch === '[' || ch === '(') {
    const stack = [ch];
    i++;
    while (i < source.length && stack.length > 0) {
      const c = source[i];
      // line comment
      if (c === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i++;
        continue;
      }
      // block comment
      if (c === '/' && source[i + 1] === '*') {
        i += 2;
        while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++;
        i += 2;
        continue;
      }
      // string literals
      if (c === '"' || c === "'" || c === '`') {
        const quote = c;
        i++;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') { i += 2; continue; }
          // template expression inside backtick
          if (quote === '`' && source[i] === '$' && source[i + 1] === '{') {
            let depth = 1;
            i += 2;
            while (i < source.length && depth > 0) {
              if (source[i] === '\\') { i += 2; continue; }
              if (source[i] === '{') depth++;
              if (source[i] === '}') depth--;
              if (depth > 0) i++;
            }
            i++;
            continue;
          }
          i++;
        }
        i++;
        continue;
      }
      // regex literal detection
      if (c === '/' && source[i + 1] !== '/' && source[i + 1] !== '*' && isRegexStart(source, i)) {
        i = skipRegex(source, i);
        continue;
      }
      // nesting
      if (c === '{' || c === '[' || c === '(') stack.push(c);
      else if ((c === '}' && stack[stack.length - 1] === '{') ||
               (c === ']' && stack[stack.length - 1] === '[') ||
               (c === ')' && stack[stack.length - 1] === '(')) stack.pop();
      i++;
    }
    if (stack.length !== 0) throw new Error('Unterminated brace/bracket at ' + startPos);
    return source.slice(startPos, i);
  }

  // Simple/atomic value
  while (i < source.length && !/[\s,;)\]}]/.test(source[i])) i++;
  return source.slice(startPos, i);
}

// ── Find const declaration ──
function findConstValue(source, varName) {
  const re = new RegExp('(?:^|[;\\n])\\s*(?:const|let|var)\\s+' + varName + '\\s*=\\s*', 'm');
  const m = re.exec(source);
  if (!m) return null;
  const startPos = source.indexOf('=', m.index) + 1;
  return extractJSValue(source, startPos);
}

// ── Find custom pattern ──
function findCustomValue(source, pattern) {
  const m = pattern.exec(source);
  if (!m) return null;
  return extractJSValue(source, m.index + m[0].length);
}

// ── JSON replacer for RegExp and Function ──
function jsonReplacer(key, value) {
  // Use duck-typing for RegExp since vm context creates cross-realm RegExp
  if (value !== null && typeof value === 'object' && Object.prototype.toString.call(value) === '[object RegExp]') {
    return { __regex: true, source: value.source, flags: value.flags };
  }
  if (typeof value === 'function') {
    return { __fn: true, body: value.toString() };
  }
  return value;
}

// ── Process a single extraction ──
function processExtraction(extraction) {
  const { file, varName, type } = extraction;
  const filePath = path.join(ROOT, file);
  const source = fs.readFileSync(filePath, 'utf-8');

  let rawValue;
  if (type === 'assignment') {
    rawValue = findCustomValue(source, extraction.pattern);
  } else if (type === 'iife') {
    rawValue = findConstValue(source, varName);
  } else {
    rawValue = findConstValue(source, varName);
  }

  if (!rawValue) {
    throw new Error(`Could not find ${varName} in ${file}`);
  }

  // Evaluate the JS value in a sandbox
  let evaluated;
  try {
    evaluated = vm.runInNewContext('(' + rawValue + ')', {}, { timeout: 5000 });
  } catch (e) {
    throw new Error(`vm evaluation failed for ${varName}: ${e.message}`);
  }

  // Serialize to JSON with custom replacer
  const json = JSON.stringify(evaluated, jsonReplacer);
  return JSON.parse(json); // parse back so we can merge into result object
}

// ── Main ──
function main() {
  const result = {};
  let ok = 0, fail = 0;

  for (const extraction of EXTRACTIONS) {
    const { varName, file } = extraction;
    process.stdout.write(`  ${varName} ... `);
    try {
      const value = processExtraction(extraction);
      result[varName] = value;
      console.log(`OK`);
      ok++;
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
      fail++;
    }
  }

  const json = JSON.stringify(result, null, 2);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, json, 'utf-8');
  console.log(`\nDone: ${ok} OK, ${fail} FAIL — written to ${OUT_FILE} (${(json.length / 1024).toFixed(0)} KB)`);
}

main();
