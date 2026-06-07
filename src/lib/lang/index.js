const HASH_SEED = 42;

function hash(str) {
  let h = HASH_SEED;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function pick(arr, langId, gameId, index) {
  const idx = hash(langId + gameId + index) % arr.length;
  return arr[idx];
}

export function deterministicShuffle(arr, seed) {
  const a = [...arr];
  let s = hash(seed);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) | 0;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const GEN_LANG_IDS = {
  js: 'js', ts: 'ts', react: 'react', py: 'py', go: 'go', rs: 'rs',
  c: 'c', cs: 'cs', cpp: 'cpp', zig: 'zig',
  java: 'java', kt: 'kt', scala: 'scala',
  swift: 'swift', lua: 'lua',
  html: 'html', css: 'css', bash: 'bash', wasm: 'wasm',
  sql: 'sql', php: 'php', rb: 'rb',
  vue: 'vue', svelte: 'svelte',
  asm: 'asm',
};

export const LANG_NAMES = {
  asm: 'Assembly', html: 'HTML', css: 'CSS', bash: 'Bash',
  c: 'C', cs: 'C#', cpp: 'C++', sql: 'SQL', go: 'Go',
  java: 'Java', js: 'JavaScript', kt: 'Kotlin', lua: 'Lua',
  php: 'PHP', py: 'Python', rb: 'Ruby', rs: 'Rust',
  scala: 'Scala', swift: 'Swift', ts: 'TypeScript', wasm: 'WebAssembly',
  zig: 'Zig', react: 'React', vue: 'Vue', svelte: 'Svelte',
};

import { generateSyntaxSprint, generateSyntaxSwipe, generateMemoryMatch, generateSpeedRead, generateRaceCompiler, generateSqlJoinMatch, generateErrorpedia, generateApiArcade, generateLogicLadder } from './generators/choice.js';
import { generateCodeScramble } from './generators/order.js';
import { generateDebugTheBug } from './generators/debug.js';
import { generateCodeGolf, generateBinaryHexBlitz, generateCrossword, generateRegexRally } from './generators/text.js';
import { generateTypingSpeed } from './generators/typing.js';

const GENERATORS = {
  'typing-speed': generateTypingSpeed,
  'code-scramble': generateCodeScramble,
  'debug-the-bug': generateDebugTheBug,
  'syntax-sprint': generateSyntaxSprint,
  'memory-match': generateMemoryMatch,
  'speed-read': generateSpeedRead,
  'race-compiler': generateRaceCompiler,
  'syntax-swipe': generateSyntaxSwipe,
  'code-golf': generateCodeGolf,
  'binary-hex-blitz': generateBinaryHexBlitz,
  'crossword': generateCrossword,
  'regex-rally': generateRegexRally,
  'sql-join-match': generateSqlJoinMatch,
  'errorpedia': generateErrorpedia,
  'api-arcade': generateApiArcade,
  'logic-ladder': generateLogicLadder,
};

export function generateChallenges(gameId, langId, count = 100) {
  const gen = GENERATORS[gameId];
  if (!gen) return [];
  const results = [];
  for (let i = 0; i < count; i++) {
    const challenge = gen(langId, i);
    if (challenge) results.push(challenge);
    if (results.length >= count) break;
  }
  while (results.length < count) {
    results.push({ prompt: 'Challenge', choices: ['Option A', 'Option B'], answer: 'Option A' });
  }
  return results;
}
