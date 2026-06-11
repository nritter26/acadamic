import { pick } from '../index.js';
import { getSpec } from './choice.js';

export function generateCodeGolf(langId, index) {
  const shorten = (s) => s.replace(/\s/g, '');
  const qs = {
    js: [
      { prompt: 'Shortest boolean conversion for `x`:', answer: '!!x' },
      { prompt: 'Shortest empty array literal:', answer: '[]' },
      { prompt: 'Shortest arrow function returning 42:', answer: '()=>42' },
      { prompt: 'Shortest way to increment `x` by 1:', answer: '++x' },
      { prompt: 'Shortest way to negate `n`:', answer: '-n' },
      { prompt: 'Shortest string containing "a":', answer: "'a'" },
      { prompt: 'Shortest typeof check for function:', answer: 'typeof x===\'function\'' },
      { prompt: 'Shortest way to create an object:', answer: '({})' },
      { prompt: 'Shortest truthy check:', answer: 'if(x)' },
      { prompt: 'Shortest string concatenation:', answer: 'a+b' },
    ],
    py: [
      { prompt: 'Shortest way to check if `x` is truthy:', answer: 'if x:' },
      { prompt: 'Shortest empty list:', answer: '[]' },
      { prompt: 'Shortest lambda returning its argument:', answer: 'lambda x:x' },
      { prompt: 'Shortest way to increment `x` by 1:', answer: 'x+=1' },
      { prompt: 'Shortest empty dict:', answer: '{}' },
      { prompt: 'Shortest way to get length of list `l`:', answer: 'len(l)' },
      { prompt: 'Shortest way to check if `l` is empty:', answer: 'not l' },
      { prompt: 'Shortest inline if-else:', answer: 'x if c else y' },
      { prompt: 'Shortest way to join strings:', answer: '"".join(l)' },
      { prompt: 'Shortest way to sort list:', answer: 'sorted(l)' },
    ],
    go: [
      { prompt: 'Shortest variable declaration in Go:', answer: 'x:=0' },
      { prompt: 'Shortest function returning nothing:', answer: 'func(){}' },
      { prompt: 'Shortest true boolean:', answer: 'true' },
      { prompt: 'Shortest for loop:', answer: 'for{}' },
      { prompt: 'Shortest goroutine:', answer: 'go f()' },
      { prompt: 'Shortest way to get slice length:', answer: 'len(s)' },
      { prompt: 'Shortest pointer dereference:', answer: '*p' },
    ],
    rs: [
      { prompt: 'Shortest mutable variable in Rust:', answer: 'let mut x' },
      { prompt: 'Shortest unit-returning closure:', answer: '||{}' },
      { prompt: 'Shortest true boolean in Rust:', answer: 'true' },
      { prompt: 'Shortest vector creation:', answer: 'vec![]' },
      { prompt: 'Shortest match arm:', answer: '_=>()' },
      { prompt: 'Shortest string slice:', answer: '&s[..]' },
      { prompt: 'Shortest dereference:', answer: '*x' },
    ],
    java: [
      { prompt: 'Shortest void method:', answer: 'void m(){}' },
      { prompt: 'Shortest main method declaration:', answer: 'public static void main(String[]a)' },
      { prompt: 'Shortest array declaration:', answer: 'int[]a' },
      { prompt: 'Shortest for-each loop:', answer: 'for(var x:l)' },
    ],
    cpp: [
      { prompt: 'Shortest include directive:', answer: '#include<iostream>' },
      { prompt: 'Shortest lambda in C++:', answer: '[]{}' },
      { prompt: 'Shortest auto variable:', answer: 'auto x=0' },
      { prompt: 'Shortest pointer:', answer: 'int*p' },
    ],
    ts: [
      { prompt: 'Shortest type annotation:', answer: 'x:number' },
      { prompt: 'Shortest arrow func with type:', answer: '(x:number)=>x' },
      { prompt: 'Shortest interface:', answer: 'interface I{}' },
      { prompt: 'Shortest generic function:', answer: '<T>(x:T)=>x' },
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
    { prompt: 'Clue: A named constant that cannot change.', answer: 'const' },
    { prompt: 'Clue: Converting one type to another.', answer: 'coercion' },
    { prompt: 'Clue: A value passed to a function.', answer: 'argument' },
    { prompt: 'Clue: Code that handles runtime errors.', answer: 'exception' },
    { prompt: 'Clue: A blueprint for creating objects.', answer: 'class' },
    { prompt: 'Clue: A group of related functions and variables.', answer: 'module' },
    { prompt: 'Clue: Comparing two values for equality.', answer: 'comparison' },
    { prompt: 'Clue: A reusable template for strings.', answer: 'template' },
    { prompt: 'Clue: A function with no name.', answer: 'anonymous' },
    { prompt: 'Clue: A value representing nothing.', answer: 'null' },
    { prompt: 'Clue: Repeating a block of code.', answer: 'iteration' },
    { prompt: 'Clue: Breaking code into smaller pieces.', answer: 'modular' },
    { prompt: 'Clue: A function attached to an object.', answer: 'method' },
    { prompt: 'Clue: The scope where a variable is accessible.', answer: 'closure' },
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
    { prompt: 'Regex matching 2 to 4 digits:', answer: '\\d{2,4}' },
    { prompt: 'Regex matching a word boundary:', answer: '\\b' },
    { prompt: 'Regex matching non-digit:', answer: '\\D' },
    { prompt: 'Regex matching non-whitespace:', answer: '\\S' },
    { prompt: 'Regex matching "yes" or "no":', answer: 'yes|no' },
    { prompt: 'Regex matching a digit between 1 and 9:', answer: '[1-9]' },
    { prompt: 'Regex matching any lowercase letter:', answer: '[a-z]' },
    { prompt: 'Regex matching zero or one "a":', answer: 'a?' },
    { prompt: 'Regex matching "aa" or "bb":', answer: '(aa|bb)' },
    { prompt: 'Regex matching everything except newlines:', answer: '.*' },
    { prompt: 'Regex matching a literal dot:', answer: '\\.' },
    { prompt: 'Regex matching a backslash:', answer: '\\\\' },
    { prompt: 'Regex matching a hexadecimal digit:', answer: '[0-9a-fA-F]' },
    { prompt: 'Regex matching a tab character:', answer: '\\t' },
    { prompt: 'Regex matching at least one vowel:', answer: '[aeiou]+' },
    { prompt: 'Regex matching optional group "ing":', answer: '(ing)?' },
    { prompt: 'Regex matching a 5-letter word:', answer: '\\b\\w{5}\\b' },
    { prompt: 'Regex matching either 3 digits or 3 letters:', answer: '(\\d{3}|[a-z]{3})' },
    { prompt: 'Regex matching strings starting with "abc":', answer: '^abc' },
    { prompt: 'Regex matching strings ending with "xyz":', answer: 'xyz$' },
    { prompt: 'Regex matching date format MM/DD/YYYY:', answer: '\\d{2}/\\d{2}/\\d{4}' },
    { prompt: 'Regex matching email local part before @:', answer: '[a-zA-Z0-9._%+-]+' },
    { prompt: 'Regex matching an IP address octet:', answer: '(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)' },
    { prompt: 'Regex matching a word of exactly 4 letters:', answer: '\\b[a-zA-Z]{4}\\b' },
    { prompt: 'Regex matching a US zip code:', answer: '\\d{5}(-\\d{4})?' },
    { prompt: 'Regex matching positive lookahead for "test":', answer: '(?=.*test)' },
    { prompt: 'Regex matching a non-capturing group:', answer: '(?:pattern)' },
  ];
  return qs[index % qs.length];
}
