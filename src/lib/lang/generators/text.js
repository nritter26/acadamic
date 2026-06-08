import { pick } from '../index.js';
import { getSpec } from './choice.js';

export function generateCodeGolf(langId, index) {
  const qs = {
    js: [
      { prompt: 'Shortest boolean conversion for `x` in JS:', answer: '!!x' },
      { prompt: 'Shortest empty array literal:', answer: '[]' },
      { prompt: 'Shortest arrow function returning 42:', answer: '()=>42' },
    ],
    py: [
      { prompt: 'Shortest way to check if `x` is truthy in Python:', answer: 'if x:' },
      { prompt: 'Shortest empty list:', answer: '[]' },
      { prompt: 'Shortest lambda returning its argument:', answer: 'lambda x:x' },
    ],
  };
  const list = qs[langId] || qs.js;
  return list[index % list.length];
}

export function generateBinaryHexBlitz(langId, index) {
  const dec = (index % 200) + 1;
  const hex = dec.toString(16);
  const bin = dec.toString(2);
  const qs = [
    { prompt: `Decimal ${dec} in hex:`, answer: hex },
    { prompt: `Hex ${hex} in decimal:`, answer: String(dec) },
    { prompt: `Binary ${bin} in decimal:`, answer: String(dec) },
    { prompt: `Decimal ${dec} in binary:`, answer: bin },
  ];
  return qs[index % qs.length];
}

export function generateCrossword(langId, index) {
  const qs = [
    { prompt: 'Clue: Reusable block of code with parameters.', answer: 'function' },
    { prompt: 'Clue: Key/value collection.', answer: 'object' },
    { prompt: 'Clue: A value that is either true or false.', answer: 'boolean' },
    { prompt: 'Clue: Collection of ordered elements.', answer: 'array' },
    { prompt: 'Clue: A named storage location in memory.', answer: 'variable' },
    { prompt: 'Clue: A loop that repeats a fixed number of times.', answer: 'for' },
    { prompt: 'Clue: Conditional execution based on a test.', answer: 'if' },
    { prompt: 'Clue: A function that calls itself.', answer: 'recursion' },
  ];
  return qs[index % qs.length];
}

export function generateRegexRally(langId, index) {
  const qs = [
    { prompt: 'Regex matching one or more digits:', answer: '\\d+' },
    { prompt: 'Regex matching start of string:', answer: '^' },
    { prompt: 'Regex matching end of string:', answer: '$' },
    { prompt: 'Regex matching zero or more word chars:', answer: '\\w*' },
    { prompt: 'Regex matching exactly 3 digits:', answer: '\\d{3}' },
    { prompt: 'Regex matching optional character "s":', answer: 's?' },
    { prompt: 'Regex matching "cat" or "car":', answer: 'ca[tr]' },
    { prompt: 'Regex matching any character except newline:', answer: '.' },
    { prompt: 'Regex matching whitespace:', answer: '\\s' },
    { prompt: 'Regex matching "color" or "colour":', answer: 'colou?r' },
  ];
  return qs[index % qs.length];
}
