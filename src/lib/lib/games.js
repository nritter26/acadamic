export const GAME_CATALOG = [
  { id: 'typing-speed', title: 'Typing Speed', description: 'Type code snippets accurately under time pressure.', mode: 'typing', icon: '⌨️' },
  { id: 'code-scramble', title: 'Code Scramble', description: 'Reorder scrambled code into a working solution.', mode: 'order', icon: '🧩' },
  { id: 'debug-the-bug', title: 'Debug The Bug', description: 'Find the broken line and fix it.', mode: 'choice', icon: '🐛' },
  { id: 'syntax-sprint', title: 'Syntax Sprint', description: 'Choose the valid syntax before time runs out.', mode: 'choice', icon: '🏃' },
  { id: 'memory-match', title: 'Memory Match', description: 'Match concepts with definitions.', mode: 'choice', icon: '🧠' },
  { id: 'speed-read', title: 'Speed Read', description: 'Read snippets and answer comprehension prompts.', mode: 'choice', icon: '📖' },
  { id: 'race-compiler', title: 'Race Compiler', description: 'Predict compiler stages and outcomes.', mode: 'choice', icon: '🏎️' },
  { id: 'syntax-swipe', title: 'Syntax Swipe', description: 'Classify syntax as valid or invalid.', mode: 'choice', icon: '👆' },
  { id: 'code-golf', title: 'Code Golf', description: 'Solve tasks with fewer characters.', mode: 'text', icon: '⛳' },
  { id: 'binary-hex-blitz', title: 'Binary Hex Blitz', description: 'Convert between number systems.', mode: 'text', icon: '💠' },
  { id: 'crossword', title: 'Crossword', description: 'Solve programming clue grids.', mode: 'text', icon: '📝' },
  { id: 'regex-rally', title: 'Regex Rally', description: 'Build regular expressions for target strings.', mode: 'text', icon: '🔤' },
  { id: 'sql-join-match', title: 'SQL JOIN Match', description: 'Pick the correct JOIN for the output.', mode: 'choice', icon: '🗄️' },
  { id: 'errorpedia', title: 'Errorpedia', description: 'Match errors to causes and fixes.', mode: 'choice', icon: '❌' },
  { id: 'api-arcade', title: 'API Arcade', description: 'Assemble requests and inspect responses.', mode: 'choice', icon: '📡' },
  { id: 'logic-ladder', title: 'Logic Ladder', description: 'Step through branching logic puzzles.', mode: 'choice', icon: '🪜' },
];

import { generateChallenges } from '$lib/lang/index.js';

export function getChallenges(gameId, langId = 'js') {
  return generateChallenges(gameId, langId);
}

export const GAME_CHALLENGES = {
  'typing-speed': [
    { prompt: 'Type exactly:', target: 'const answer = 42;', answer: 'const answer = 42;' },
    { prompt: 'Type exactly:', target: 'console.log("Kodex");', answer: 'console.log("Kodex");' },
  ],
  'code-scramble': [
    { prompt: 'Order the expression that logs a value.', pieces: ['console', '.', 'log', '(', '"hi"', ')'], answer: 'console.log("hi")' },
    { prompt: 'Order the function call.', pieces: ['Math', '.', 'max', '(', '1, 2', ')'], answer: 'Math.max(1, 2)' },
  ],
  'debug-the-bug': [
    { prompt: 'Which line fixes `const x = ;`?', choices: ['const x = 1;', 'const = x 1;', 'x const = 1;'], answer: 'const x = 1;' },
    { prompt: 'What fixes `if x > 1 {}` in JavaScript?', choices: ['if (x > 1) {}', 'if x > 1 then', 'when (x > 1) {}'], answer: 'if (x > 1) {}' },
  ],
  'syntax-sprint': [
    { prompt: 'Pick valid JavaScript.', choices: ['let total = 0;', 'let = total 0;', 'total let 0;'], answer: 'let total = 0;' },
    { prompt: 'Pick valid Python.', choices: ['def greet():', 'function greet() {}', 'fn greet()'], answer: 'def greet():' },
  ],
  'memory-match': [
    { prompt: 'Closure means:', choices: ['Function plus captured scope', 'A database row', 'CSS selector'], answer: 'Function plus captured scope' },
    { prompt: 'HTTP 404 means:', choices: ['Not found', 'Unauthorized', 'Server error'], answer: 'Not found' },
  ],
  'speed-read': [
    { prompt: 'What does `arr.map(fn)` return?', choices: ['A new array', 'The same array', 'A promise'], answer: 'A new array' },
    { prompt: 'What does `await` pause?', choices: ['The async function', 'The whole process', 'CSS rendering'], answer: 'The async function' },
  ],
  'race-compiler': [
    { prompt: 'First compiler stage in this toy pipeline?', choices: ['Tokenize', 'Execute', 'Deploy'], answer: 'Tokenize' },
    { prompt: 'AST stands for:', choices: ['Abstract Syntax Tree', 'Applied Style Token', 'Async Stack Trace'], answer: 'Abstract Syntax Tree' },
  ],
  'syntax-swipe': [
    { prompt: '`const n = 1;`', choices: ['Valid', 'Invalid'], answer: 'Valid' },
    { prompt: '`return return value;`', choices: ['Valid', 'Invalid'], answer: 'Invalid' },
  ],
  'code-golf': [
    { prompt: 'Shortest JS truthy boolean conversion for `x`:', answer: '!!x' },
    { prompt: 'Shortest empty array literal:', answer: '[]' },
  ],
  'binary-hex-blitz': [
    { prompt: 'Binary `1010` in decimal:', answer: '10' },
    { prompt: 'Hex `ff` in decimal:', answer: '255' },
  ],
  crossword: [
    { prompt: 'Clue: Reusable block of code with parameters.', answer: 'function' },
    { prompt: 'Clue: Key/value collection in JavaScript.', answer: 'object' },
  ],
  'regex-rally': [
    { prompt: 'Regex matching one or more digits:', answer: '\\d+' },
    { prompt: 'Regex matching start of string:', answer: '^' },
  ],
  'sql-join-match': [
    { prompt: 'Keep all left rows and matching right rows.', choices: ['LEFT JOIN', 'INNER JOIN', 'CROSS JOIN'], answer: 'LEFT JOIN' },
    { prompt: 'Only rows matching both tables.', choices: ['INNER JOIN', 'LEFT JOIN', 'FULL JOIN'], answer: 'INNER JOIN' },
  ],
  errorpedia: [
    { prompt: '`ReferenceError` usually means:', choices: ['Variable is not defined', 'Network failed', 'CSS is invalid'], answer: 'Variable is not defined' },
    { prompt: '`TypeError: x is not a function` means:', choices: ['Called a non-function', 'Missing semicolon only', 'Database locked'], answer: 'Called a non-function' },
  ],
  'api-arcade': [
    { prompt: 'Which method creates a resource?', choices: ['POST', 'GET', 'OPTIONS'], answer: 'POST' },
    { prompt: 'JSON request header:', choices: ['Content-Type: application/json', 'Accept: image/png', 'Cache: no'], answer: 'Content-Type: application/json' },
  ],
  'logic-ladder': [
    { prompt: 'If `x = 3`, `x > 2 && x < 5` is:', choices: ['true', 'false'], answer: 'true' },
    { prompt: 'If first branch matches, else-if branches:', choices: ['are skipped', 'all run', 'throw'], answer: 'are skipped' },
  ],
};

export function normalizeAnswer(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isCorrectAnswer(input, answer) {
  return normalizeAnswer(input) === normalizeAnswer(answer);
}
