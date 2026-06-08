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


export function normalizeAnswer(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isCorrectAnswer(input, answer) {
  return normalizeAnswer(input) === normalizeAnswer(answer);
}
