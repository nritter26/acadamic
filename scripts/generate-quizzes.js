/**
 * Generate Missing Quizzes — fills app-data.json with quiz questions for languages
 * that have fewer than 300 questions in the Quiz tab.
 *
 * Usage: node scripts/generate-quizzes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'backend', 'content', 'app-data.json');

const appData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const quizData = appData.quizData || {};

const TARGET = 300;

// ── Shuffle ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Helpers ──
function makeQ(question, options, correctIdx, level) {
  return { q: question, opts: options, ans: correctIdx, level };
}

// Language generators — each returns an array of quiz questions

function generateJsQuizzes(n) {
  const pool = [
    makeQ('What does `typeof null` return in JavaScript?', ['"null"', '"undefined"', '"object"', '"boolean"'], 2, 'beginner'),
    makeQ('Which method adds an element to the end of an array?', ['push()', 'pop()', 'shift()', 'unshift()'], 0, 'beginner'),
    makeQ('What is the correct way to declare a constant in JavaScript?', ['const x = 5;', 'let x = 5;', 'var x = 5;', 'constant x = 5;'], 0, 'beginner'),
    makeQ('What does the === operator check?', ['Value only', 'Type only', 'Value and type', 'Reference'], 2, 'beginner'),
    makeQ('Which method converts JSON to a JavaScript object?', ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'], 1, 'beginner'),
    makeQ('What does `Array.isArray()` do?', ['Creates an array', 'Checks if value is an array', 'Converts to array', 'Gets array length'], 1, 'beginner'),
    makeQ('How do you write a comment in JavaScript?', ['// comment', '<!-- comment -->', '# comment', '/* comment'], 0, 'beginner'),
    makeQ('What is the output of `3 + "3"`?', ['6', '"33"', '9', 'Error'], 1, 'beginner'),
    makeQ('What does `undefined` mean?', ['Variable has no value', 'Variable not declared', 'Null reference', 'Empty string'], 0, 'beginner'),
    makeQ('Which loop runs at least once?', ['for', 'while', 'do...while', 'forEach'], 2, 'beginner'),
    makeQ('What is a closure?', ['A closed function', 'Function with access to outer scope', 'A loop construct', 'A type of variable'], 1, 'intermediate'),
    makeQ('What does `bind()` do?', ['Binds two variables', 'Creates a new function with fixed this', 'Binds an event', 'Combines arrays'], 1, 'intermediate'),
    makeQ('What is prototypal inheritance?', ['Class-based inheritance', 'Objects inherit from other objects', 'Copying properties', 'Multiple inheritance'], 1, 'intermediate'),
    makeQ('What is the event loop?', ['A DOM event system', 'Handles async callbacks', 'A loop construct', 'An array method'], 1, 'intermediate'),
    makeQ('What does `Promise.all()` do?', ['Runs promises sequentially', 'Waits for all promises to resolve', 'Runs the fastest promise', 'Cancels all promises'], 1, 'intermediate'),
    makeQ('What is a generator function?', ['A function that returns multiple values', 'A function that can pause and resume', 'A loop generator', 'An array method'], 1, 'intermediate'),
    makeQ('What is the spread operator?', ['... expands iterables', '.. creates ranges', '** exponent operator', '?? nullish coalescing'], 0, 'beginner'),
    makeQ('What is hoisting?', ['Moving furniture', 'Variables/functions moved to top of scope', 'A CSS property', 'An HTML element'], 1, 'intermediate'),
    makeQ('What is the temporal dead zone?', ['A time-travel concept', 'Period between let declaration and initialization', 'A setTimeout issue', 'A debugging technique'], 1, 'intermediate'),
    makeQ('What does `Object.freeze()` do?', ['Makes object immutable', 'Freezes the browser', 'Creates a copy', 'Deletes properties'], 0, 'intermediate'),
    makeQ('What is a WeakMap?', ['A Map with weak encryption', 'Map with weak references as keys', 'A small Map', 'A deprecated Map'], 1, 'expert'),
    makeQ('What are microtasks?', ['Small tasks in a todo list', 'Async callbacks with higher priority than macrotasks', 'A testing framework', 'CSS animations'], 1, 'expert'),
    makeQ('What is the difference between `null` and `undefined`?', ['They are the same', 'null is assigned, undefined is default', 'undefined is assigned, null is default', 'Both are errors'], 1, 'intermediate'),
    makeQ('What does `Array.prototype.reduce()` do?', ['Reduces array size', 'Executes reducer function on each element', 'Removes duplicates', 'Sorts the array'], 1, 'intermediate'),
    makeQ('What is a Symbol in JavaScript?', ['A primitive type for unique identifiers', 'A type of string', 'A number wrapper', 'A boolean operator'], 0, 'intermediate'),
    makeQ('What is async/await?', ['Syntactic sugar over Promises', 'A new type of loop', 'A CSS feature', 'An HTML attribute'], 0, 'intermediate'),
    makeQ('What does `Array.from()` do?', ['Creates array from iterable', 'Gets element from array', 'Removes element from array', 'Copies array'], 0, 'intermediate'),
    makeQ('What is destructuring?', ['Breaking objects', 'Unpacking values from arrays/objects', 'A CSS grid feature', 'A testing method'], 1, 'beginner'),
    makeQ('What are template literals?', ['Strings with `${}` interpolation', 'HTML templates', 'CSS templates', 'Function templates'], 0, 'beginner'),
    makeQ('What does `setTimeout(fn, 0)` do?', ['Executes immediately', 'Executes after current stack clears', 'Does nothing', 'Throws an error'], 1, 'intermediate'),
    makeQ('What is a Promise?', ['A guarantee', 'An async operation result placeholder', 'A sync function', 'An error handler'], 1, 'beginner'),
    makeQ('What are arrow functions?', ['Shorter function syntax', 'Functions with arrows', 'Math functions', 'CSS functions'], 0, 'beginner'),
    makeQ('What is the difference between `let` and `var`?', ['No difference', 'let is block-scoped, var is function-scoped', 'var is block-scoped, let is function-scoped', 'Both are global'], 1, 'beginner'),
    makeQ('What is NaN?', ['Not a Number', 'Null and None', 'No Assignment Name', 'New Array Node'], 0, 'beginner'),
    makeQ('How do you check if a value is NaN?', ['x === NaN', 'isNaN(x)', 'x == NaN', 'NaN.is(x)'], 1, 'beginner'),
    makeQ('What does `console.log([] == ![])` output?', ['false', 'true', 'undefined', 'Error'], 1, 'expert'),
    makeQ('What is a Set in JavaScript?', ['An ordered collection with duplicates', 'A collection of unique values', 'A key-value store', 'A string method'], 1, 'intermediate'),
    makeQ('What is a Map?', ['A key-value store with any type keys', 'A type of array', 'A geographical tool', 'A string function'], 0, 'intermediate'),
    makeQ('What is the `this` keyword?', ['A pronoun', 'Current execution context object', 'A CSS selector', 'An HTML element'], 1, 'intermediate'),
    makeQ('What does `call()` and `apply()` do?', ['Call a function with given this and args', 'Start and stop timers', 'Create arrays', 'Define classes'], 0, 'intermediate'),
    makeQ('What is currying?', ['A spicy technique', 'Transforming function with multiple args into sequence of functions', 'A cooking metaphor', 'A testing pattern'], 1, 'expert'),
    makeQ('What is memoization?', ['Caching function results', 'Memory allocation', 'Creating objects', 'A design pattern'], 0, 'expert'),
    makeQ('What is a Proxy in JavaScript?', ['A network proxy', 'An object that wraps another to intercept operations', 'A design pattern', 'A security feature'], 1, 'expert'),
    makeQ('What are Service Workers?', ['Background scripts for offline support', 'Web servers', 'API handlers', 'Database connectors'], 0, 'expert'),
    makeQ('What is WebAssembly?', ['A binary instruction format for web', 'An assembly language', 'A JavaScript framework', 'A CSS extension'], 0, 'expert'),
    makeQ('What does `Object.create()` do?', ['Creates an object with a specified prototype', 'Creates a class', 'Creates an array', 'Copies an object'], 0, 'intermediate'),
    makeQ('What is the Reflect API?', ['A mirror API', 'A set of methods for interceptable operations', 'A reflection technique', 'A DOM API'], 1, 'expert'),
    makeQ('What is a TypedArray?', ['An array with type checking', 'Array-like view of binary data buffer', 'A typed variable', 'A type declaration'], 1, 'expert'),
    makeQ('What is an IIFE?', ['Immediately Invoked Function Expression', 'International JavaScript Function', 'Inline JavaScript Function', 'Iterative Function'], 0, 'intermediate'),
    makeQ('What is the difference between `==` and `===`?', ['Same thing', '== does type coercion, === does not', '=== does type coercion', 'Both do coercion'], 1, 'beginner'),
    makeQ('What is a higher-order function?', ['A function that takes or returns a function', 'A class method', 'A string function', 'A mathematical function'], 0, 'intermediate'),
    makeQ('What is the spread operator used for?', ['Copying arrays/objects', 'Only for functions', 'CSS properties', 'HTML attributes'], 0, 'beginner'),
    makeQ('What is the rest parameter syntax?', ['Takes rest of parameters as array', 'Pauses execution', 'Ends a function', 'Returns a value'], 0, 'intermediate'),
    makeQ('What is optional chaining `?.`?', ['Safe access to nested properties', 'Chain multiple functions', 'CSS selector chaining', 'Promise chaining'], 0, 'beginner'),
    makeQ('What does nullish coalescing `??` do?', ['Returns right side if left is null/undefined', 'Logical OR', 'Returns first truthy value', 'Combines strings'], 0, 'beginner'),
    makeQ('What is a RegExp?', ['Regular expression for pattern matching', 'A type of function', 'A CSS selector', 'An HTML tag'], 0, 'intermediate'),
    makeQ('What is the global object in browsers?', ['global', 'window', 'self', 'globalThis'], 1, 'beginner'),
    makeQ('What is `requestAnimationFrame`?', ['Animates CSS', 'Schedules function before next repaint', 'Creates a frame', 'Renders HTML'], 1, 'intermediate'),
    makeQ('What is event delegation?', ['Delegating events to other handlers', 'Using a single listener on parent for child events', 'Event priority', 'Event cancellation'], 1, 'intermediate'),
    makeQ('What is debouncing?', ['Delaying function execution until after a pause', 'Removing bugs', 'A CSS effect', 'A compression technique'], 0, 'intermediate'),
    makeQ('What is throttling?', ['Reducing function execution rate', 'A CSS animation', 'Slowing down network', 'Reducing image size'], 0, 'intermediate'),
    makeQ('What is `localStorage`?', ['Server-side storage', 'Client-side key-value storage', 'Database storage', 'Session storage'], 1, 'beginner'),
    makeQ('What is `sessionStorage`?', ['Persistent storage', 'Storage cleared when session ends', 'Database storage', 'Cloud storage'], 1, 'beginner'),
    makeQ('What is CORS?', ['Cross-Origin Resource Sharing', 'CSS Object Rendering System', 'Create Object Resource Standard', 'Code Organization System'], 0, 'intermediate'),
    makeQ('What is a polyfill?', ['A code that implements missing browser features', 'A CSS property', 'An HTML element', 'A testing tool'], 0, 'intermediate'),
    makeQ('What is tree shaking?', ['Shaking trees metaphor', 'Dead code elimination during bundling', 'A CSS animation', 'A debugging technique'], 1, 'expert'),
    makeQ('What is code splitting?', ['Splitting code into chunks loaded on demand', 'Formatting code', 'Debugging code', 'Testing code'], 0, 'expert'),
    makeQ('What is the `new` keyword?', ['Creates a new instance of a constructor', 'Declares a new variable', 'Creates a new file', 'Defines a new type'], 0, 'beginner'),
    makeQ('What is a constructor?', ['A special method for creating objects', 'A building function', 'A CSS class', 'An HTML attribute'], 0, 'beginner'),
    makeQ('What is the prototype chain?', ['Chain of object prototypes for inheritance', 'A linked list', 'A function chain', 'A promise chain'], 0, 'intermediate'),
    makeQ('What is `class` syntax?', ['Sugar over prototypal inheritance', 'A CSS class', 'A new type system', 'An HTML class'], 0, 'intermediate'),
    makeQ('What is `super` keyword?', ['Calls parent class constructor/methods', 'A super variable', 'A super function', 'A super object'], 0, 'intermediate'),
    makeQ('What are static methods?', ['Methods on the class itself, not instances', 'Methods that change state', 'Methods that return static values', 'Methods that are final'], 0, 'intermediate'),
    makeQ('What is a getter/setter?', ['Properties accessed as methods', 'Functions that get/set values', 'Object accessors', 'Array methods'], 2, 'intermediate'),
    makeQ('What is `JSON.stringify`?', ['Converts object to JSON string', 'Parses JSON string', 'Creates JSON file', 'Validates JSON'], 0, 'beginner'),
    makeQ('What is the `fetch` API?', ['A way to make HTTP requests', 'A way to fetch data from the DOM', 'A file system API', 'A database API'], 0, 'beginner'),
    makeQ('What does `catch()` do on a Promise?', ['Catches errors', 'Catches values', 'Catches exceptions in promise chain', 'Ends the promise'], 2, 'beginner'),
    makeQ('What is `finally()`?', ['Runs after promise settles regardless of outcome', 'Final callback', 'Ends the chain', 'Cleans up variables'], 0, 'intermediate'),
    makeQ('What is the event loop microtask queue?', ['Queue for Promise callbacks and mutation observers', 'UI events queue', 'Network request queue', 'Timer queue'], 0, 'expert'),
    makeQ('What is `Intl`?', ['Internationalization API', 'Integer type', 'Interface language', 'Internal module'], 0, 'expert'),
    makeQ('What is `structuredClone`?', ['Deep copies objects', 'Copies DOM structure', 'Clone CSS', 'Copy arrays'], 0, 'expert'),
    makeQ('What is `BigInt`?', ['Arbitrary precision integers', 'Big integer type', 'A large number', 'Big Int class'], 0, 'intermediate'),
    makeQ('What is `Symbol.iterator`?', ['Makes an object iterable', 'An iterator class', 'A Symbol for iteration', 'A loop type'], 0, 'expert'),
    makeQ('What is `WeakRef`?', ['Weak reference to an object', 'Weak reference type', 'A reference that can be garbage collected', 'A memory leak fix'], 2, 'expert'),
    makeQ('What is `FinalizationRegistry`?', ['Registry for cleanup after garbage collection', 'Final class registry', 'Final variable registry', 'Registry cleanup'], 0, 'expert'),
    makeQ('What is a module?', ['Reusable code in separate file', 'A class', 'A function', 'A package'], 0, 'beginner'),
    makeQ('What is CommonJS?', ['Module system using require/module.exports', 'A CSS system', 'A JavaScript version', 'A testing framework'], 0, 'intermediate'),
    makeQ('What is ESM?', ['ECMAScript Modules using import/export', 'Extra Script Manager', 'Enhanced State Module', 'Event Stream Monitor'], 0, 'intermediate'),
    makeQ('What is dynamic import?', ['Importing modules dynamically at runtime', 'A CSS import', 'A static import', 'An HTML import'], 0, 'intermediate'),
    makeQ('What is the DOM?', ['Document Object Model', 'Data Object Model', 'Document Order Management', 'Digital Object Mapping'], 0, 'beginner'),
    makeQ('What is event bubbling?', ['Events propagate from child to parent', 'Events go from parent to child', 'Events are canceled', 'Events are created'], 0, 'intermediate'),
    makeQ('What is event capturing?', ['Events go from parent to child before target', 'Events bubble up', 'Events are captured in a queue', 'Events are logged'], 0, 'expert'),
    makeQ('What does `addEventListener` do?', ['Attaches an event handler', 'Creates an event', 'Dispatches an event', 'Removes an event'], 0, 'beginner'),
    makeQ('What is `preventDefault()`?', ['Prevents default browser behavior', 'Prevents form submission', 'Stops event propagation', 'Cancels navigation'], 0, 'beginner'),
    makeQ('What is `stopPropagation()`?', ['Stops event from bubbling/capturing', 'Stops all JavaScript', 'Pauses execution', 'Ends the event'], 0, 'intermediate'),
    makeQ('What are Web Workers?', ['Background thread for JavaScript', 'Web page workers', 'Service workers', 'API workers'], 0, 'expert'),
    makeQ('What is `atob()`/`btoa()`?', ['Base64 encoding/decoding', 'ASCII to binary', 'Array to buffer', 'Authentication functions'], 0, 'intermediate'),
    makeQ('What is `Performance API`?', ['Measures web page performance', 'Performance optimization', 'Animation performance', 'Network speed test'], 0, 'expert'),
  ];
  return shuffle(pool).slice(0, n);
}

function generateGenericQuizzes(lang, langName, n) {
  const pool = [
    makeQ(`What is the correct file extension for ${langName}?`, [`.${lang}`, `.txt`, `.code`, `.script`], 0, 'beginner'),
    makeQ(`Which of these is a comment in ${langName}?`, ['// comment', '<!-- comment -->', '# comment', 'All of the above'], 0, 'beginner'),
    makeQ(`How do you declare a variable in ${langName}?`, ['Using keywords like let/var/const', 'Using $', 'Using dim', 'Using def'], 0, 'beginner'),
    makeQ(`What is a function in ${langName}?`, ['A reusable block of code', 'A variable', 'A loop', 'A condition'], 0, 'beginner'),
    makeQ(`What is a string in ${langName}?`, ['A sequence of characters', 'A number', 'A boolean', 'An array'], 0, 'beginner'),
    makeQ(`Which operator is used for equality check in ${langName}?`, ['=', '==', '===', '!='], 1, 'beginner'),
    makeQ(`What is an array in ${langName}?`, ['A collection of elements', 'A single value', 'A function', 'A string'], 0, 'beginner'),
    makeQ(`What is the output of typeof in ${langName}?`, ['The type of a value', 'The length of a value', 'The name of a function', 'The size of a variable'], 0, 'beginner'),
    makeQ(`What is a boolean in ${langName}?`, ['true or false', 'A number', 'A string', 'Null'], 0, 'beginner'),
    makeQ(`What is null in ${langName}?`, ['An intentional absence of value', 'Zero', 'Empty string', 'Undefined'], 0, 'beginner'),
    makeQ(`What is a loop used for in ${langName}?`, ['Repeating code', 'Conditional execution', 'Variable declaration', 'Function definition'], 0, 'beginner'),
    makeQ(`What does the "if" statement do in ${langName}?`, ['Conditional execution', 'Loop execution', 'Variable declaration', 'Function call'], 0, 'beginner'),
    makeQ(`What is a parameter in ${langName}?`, ['An input to a function', 'A return value', 'A variable', 'A loop counter'], 0, 'beginner'),
    makeQ(`What is a return value in ${langName}?`, ['The output of a function', 'A variable', 'A loop result', 'An error'], 0, 'beginner'),
    makeQ(`What does "throw" do in ${langName}?`, ['Throws an exception', 'Throws a ball', 'Returns a value', 'Ends the program'], 0, 'beginner'),
    makeQ(`What is exception handling in ${langName}?`, ['Handling runtime errors', 'Managing exceptions', 'Error recovery', 'All of the above'], 3, 'intermediate'),
    makeQ(`What is recursion in ${langName}?`, ['A function calling itself', 'A loop', 'A conditional', 'An array operation'], 0, 'intermediate'),
    makeQ(`What is an object in ${langName}?`, ['A collection of properties and methods', 'A function', 'A variable', 'A string'], 0, 'beginner'),
    makeQ(`What is the main entry point in ${langName}?`, ['The main function/method', 'The first line', 'The class definition', 'The import statement'], 0, 'beginner'),
    makeQ(`What are comments used for in ${langName}?`, ['Explaining code', 'Executing code', 'Debugging', 'Optimizing'], 0, 'beginner'),
    makeQ(`What is debugging in ${langName}?`, ['Finding and fixing errors', 'Writing code', 'Compiling code', 'Running code'], 0, 'beginner'),
    makeQ(`What is a library in ${langName}?`, ['A collection of reusable code', 'A book', 'A file', 'A function'], 0, 'beginner'),
    makeQ(`What is a framework in ${langName}?`, ['A structure for building applications', 'A library', 'A tool', 'A language feature'], 0, 'intermediate'),
    makeQ(`What is an API in ${langName}?`, ['Application Programming Interface', 'Application Process Integration', 'Automated Program Interface', 'Application Protocol Interface'], 0, 'intermediate'),
    makeQ(`What is type coercion in ${langName}?`, ['Implicit type conversion', 'Explicit type casting', 'Type declaration', 'Type checking'], 0, 'intermediate'),
    makeQ(`What is scope in ${langName}?`, ['The visibility of variables', 'A measurement tool', 'A function', 'A loop'], 0, 'intermediate'),
    makeQ(`What is a closure in ${langName}?`, ['A function with access to outer scope', 'A closed block', 'An enclosed loop', 'A private variable'], 0, 'intermediate'),
    makeQ(`What is inheritance in ${langName}?`, ['Deriving properties from a parent class', 'A financial concept', 'A legal term', 'A variable type'], 0, 'intermediate'),
    makeQ(`What is polymorphism in ${langName}?`, ['Many forms of a method', 'Multiple functions', 'Many variables', 'Multiple classes'], 0, 'intermediate'),
    makeQ(`What is encapsulation in ${langName}?`, ['Hiding internal details', 'Wrapping code', 'Creating capsules', 'Packaging code'], 0, 'intermediate'),
    makeQ(`What is an interface in ${langName}?`, ['A contract for classes', 'A user interface', 'A type of variable', 'A function signature'], 0, 'intermediate'),
    makeQ(`What is a static method in ${langName}?`, ['Belongs to the class, not instances', 'A method that runs once', 'A method that never changes', 'A method without parameters'], 0, 'intermediate'),
    makeQ(`What is constructor in ${langName}?`, ['Initializes new objects', 'A building function', 'Creates classes', 'Defines types'], 0, 'beginner'),
    makeQ(`What is a package in ${langName}?`, ['A namespace for organizing code', 'A shipping container', 'A compressed file', 'A variable group'], 0, 'intermediate'),
    makeQ(`What is a module in ${langName}?`, ['A reusable code file', 'A hardware component', 'A class', 'A function'], 0, 'intermediate'),
    makeQ(`What is a hash map in ${langName}?`, ['A key-value data structure', 'A type of array', 'A function', 'A string'], 0, 'intermediate'),
    makeQ(`What is sorting in ${langName}?`, ['Ordering elements', 'Filtering data', 'Searching items', 'Grouping values'], 0, 'beginner'),
    makeQ(`What is an algorithm in ${langName}?`, ['A step-by-step procedure', 'A type of data', 'A programming language', 'A software tool'], 0, 'beginner'),
    makeQ(`What is a data structure in ${langName}?`, ['A way to organize data', 'A class', 'A function', 'A variable'], 0, 'beginner'),
    makeQ(`What is version control used for in ${langName} projects?`, ['Tracking code changes', 'Controlling versions of software', 'Managing releases', 'All of the above'], 3, 'intermediate'),
    makeQ(`What is the difference between compilation and interpretation in ${langName}?`, ['Compiled translates whole program, interpreted runs line by line', 'No difference', 'Compiled runs faster always', 'Interpreted is always better'], 0, 'expert'),
    makeQ(`What is garbage collection in ${langName}?`, ['Automatic memory management', 'Trash cleanup', 'File organization', 'Code cleanup'], 0, 'expert'),
    makeQ(`What is memory leak in ${langName}?`, ['Memory not released after use', 'Memory shortage', 'Memory allocation', 'Memory fragmentation'], 0, 'expert'),
    makeQ(`What is a callback in ${langName}?`, ['A function passed as an argument', 'A return call', 'A phone callback', 'A recursive call'], 0, 'intermediate'),
    makeQ(`What is an anonymous function in ${langName}?`, ['A function without a name', 'A secret function', 'An unnamed class', 'A hidden method'], 0, 'intermediate'),
    makeQ(`What is regex in ${langName}?`, ['Regular expressions for pattern matching', 'A type of expression', 'A registration system', 'A reference guide'], 0, 'intermediate'),
    makeQ(`What is serialization in ${langName}?`, ['Converting objects to a storable format', 'Creating series', 'Organizing code', 'Running tasks sequentially'], 0, 'expert'),
    makeQ(`What is a design pattern in ${langName}?`, ['A reusable solution to common problems', 'A drawn pattern', 'A code format', 'A UI design'], 0, 'intermediate'),
    makeQ(`What is unit testing in ${langName}?`, ['Testing individual units of code', 'Testing the whole system', 'Testing hardware', 'Testing design'], 0, 'intermediate'),
    makeQ(`What is a debugger in ${langName}?`, ['A tool for finding bugs', 'A code formatter', 'A compiler', 'An interpreter'], 0, 'beginner'),
    makeQ(`What is the difference between pass by value and pass by reference in ${langName}?`, ['Value copies the value, reference passes the address', 'No difference', 'Both copy the value', 'Both pass the address'], 0, 'expert'),
    makeQ(`What is an IDE in ${langName} development?`, ['Integrated Development Environment', 'Internal Data Exchange', 'Input Device Emulator', 'Interactive Development Engine'], 0, 'beginner'),
    makeQ(`What is a linter in ${langName}?`, ['A tool that analyzes code for errors', 'A code formatter', 'A compiler', 'A debugger'], 0, 'intermediate'),
    makeQ(`What is continuous integration in ${langName} projects?`, ['Automatically building and testing code changes', 'Integrating continuously', 'Merging code', 'Deploying software'], 0, 'expert'),
    makeQ(`What is the terminal/console in ${langName} development?`, ['A command-line interface', 'A hardware device', 'A software program', 'A monitor'], 0, 'beginner'),
    makeQ(`What is an expression in ${langName}?`, ['A combination of values and operators', 'A statement', 'A function', 'A variable declaration'], 0, 'beginner'),
    makeQ(`What is a statement in ${langName}?`, ['A complete instruction', 'An expression', 'A function call', 'A variable'], 0, 'beginner'),
    makeQ(`What is whitespace in ${langName}?`, ['Spaces, tabs, and newlines', 'White space character', 'Empty file', 'Blank screen'], 0, 'beginner'),
    makeQ(`What is indentation used for in ${langName}?`, ['Formatting code for readability', 'Executing code', 'Compiling code', 'Optimizing code'], 0, 'beginner'),
    makeQ(`What is a keyword in ${langName}?`, ['A reserved word with special meaning', 'A search term', 'A function name', 'A variable name'], 0, 'beginner'),
    makeQ(`What is debugging output in ${langName}?`, ['Printing values for debugging', 'Final output', 'Error messages', 'Compiler output'], 0, 'beginner'),
    makeQ(`What is user input in ${langName}?`, ['Data provided by the user', 'System data', 'Network data', 'File data'], 0, 'beginner'),
  ];
  // Add level distribution
  const result = pool.map((q, i) => ({
    ...q,
    level: i < pool.length * 0.4 ? 'beginner' : i < pool.length * 0.75 ? 'intermediate' : 'expert'
  }));
  return shuffle(result).slice(0, n);
}

// Language-specific quiz generators
const specGenerators = {
  js: generateJsQuizzes,
  ts: (n) => generateGenericQuizzes('ts', 'TypeScript', n).concat([
    makeQ('What is the main benefit of TypeScript?', ['Type safety', 'Speed', 'Smaller files', 'No compilation'], 0, 'beginner'),
    makeQ('What does `interface` define in TypeScript?', ['A contract for object shapes', 'A class', 'A function', 'A variable'], 0, 'beginner'),
    makeQ('What is a union type in TypeScript?', ['A type that can be one of several types', 'A combined type', 'A union of objects', 'A merged interface'], 0, 'intermediate'),
    makeQ('What is a generic in TypeScript?', ['A type parameter', 'A general type', 'A class', 'A function'], 0, 'intermediate'),
    makeQ('What does `any` type do in TypeScript?', ['Disables type checking', 'Any type is accepted', 'A flexible type', 'All of the above'], 3, 'beginner'),
    makeQ('What is `unknown` type in TypeScript?', ['A safe version of any', 'An unknown value', 'A hidden type', 'A secret type'], 0, 'intermediate'),
    makeQ('What are enums in TypeScript?', ['A set of named constants', 'A type of number', 'A function', 'A class'], 0, 'beginner'),
    makeQ('What does `readonly` do in TypeScript?', ['Prevents property modification', 'Read-only access', 'A const modifier', 'A static member'], 0, 'intermediate'),
    makeQ('What is type inference in TypeScript?', ['TypeScript automatically deduces types', 'Manual type declaration', 'Type checking', 'Type compilation'], 0, 'beginner'),
    makeQ('What is a mapped type in TypeScript?', ['Creates new types by transforming properties', 'A map data structure', 'A type guard', 'A utility type'], 0, 'expert'),
    makeQ('What is a conditional type in TypeScript?', ['A type that depends on a condition', 'A conditional statement', 'A ternary operator', 'A type guard'], 0, 'expert'),
    makeQ('What does `Partial<T>` do?', ['Makes all properties optional', 'Makes all properties required', 'Removes properties', 'Adds properties'], 0, 'intermediate'),
    makeQ('What does `Pick<T,K>` do?', ['Selects properties from a type', 'Picks a value', 'Creates a picker', 'Chooses a type'], 0, 'intermediate'),
    makeQ('What does `Omit<T,K>` do?', ['Removes properties from a type', 'Omits a value', 'Creates omission', 'Excludes type'], 0, 'intermediate'),
    makeQ('What is a decorator in TypeScript?', ['A special declaration for modifying classes', 'A design pattern', 'A CSS style', 'A function wrapper'], 0, 'expert'),
    makeQ('What is the `as` keyword in TypeScript?', ['Type assertion', 'Type conversion', 'Type assignment', 'Type definition'], 0, 'beginner'),
    makeQ('What is `strictNullChecks`?', ['Makes null/undefined handling explicit', 'Null check optimization', 'Strict null validation', 'Null safety mode'], 0, 'intermediate'),
    makeQ('What are declaration files (.d.ts)?', ['TypeScript declaration files for type info', 'Data files', 'Documentation files', 'Debug files'], 0, 'intermediate'),
    makeQ('What is the `never` type?', ['Represents values that never occur', 'Never used type', 'Nonexistent type', 'Void type'], 0, 'expert'),
    makeQ('What is a type guard in TypeScript?', ['An expression that narrows types', 'A security feature', 'A type checker', 'A compiler option'], 0, 'intermediate'),
  ]).slice(0, n),
  
  py: (n) => generateGenericQuizzes('py', 'Python', n).concat([
    makeQ('What is indentation used for in Python?', ['Defining code blocks', 'Comments', 'Variable names', 'String literals'], 0, 'beginner'),
    makeQ('What is a list comprehension in Python?', ['A concise way to create lists', 'A list of comprehensions', 'A list function', 'A list method'], 0, 'intermediate'),
    makeQ('What is a dictionary in Python?', ['A key-value data structure', 'A list of words', 'A function', 'A class'], 0, 'beginner'),
    makeQ('What is a tuple in Python?', ['An immutable sequence', 'A mutable list', 'A function', 'A variable'], 0, 'beginner'),
    makeQ('What is slicing in Python?', ['Extracting parts of sequences', 'Cutting data', 'Splitting strings', 'Array method'], 0, 'beginner'),
    makeQ('What is a decorator in Python?', ['A function that modifies other functions', 'A design pattern', 'A CSS style', 'A class'], 0, 'intermediate'),
    makeQ('What is a generator in Python?', ['A function that yields values lazily', 'A loop', 'A list', 'A class'], 0, 'intermediate'),
    makeQ('What is `__init__` in Python?', ['The constructor method', 'Initialization function', 'Instance creator', 'Class method'], 0, 'beginner'),
    makeQ('What is a lambda in Python?', ['An anonymous function', 'A named function', 'A class', 'A module'], 0, 'intermediate'),
    makeQ('What is PIP in Python?', ['Package installer for Python', 'Python interpreter', 'Python IDE', 'Python debugger'], 0, 'beginner'),
    makeQ('What is a virtual environment in Python?', ['Isolated Python environment for projects', 'Virtual machine', 'Cloud environment', 'Simulator'], 0, 'beginner'),
    makeQ('What is `self` in Python methods?', ['Reference to the current instance', 'A variable', 'A function', 'A class'], 0, 'beginner'),
    makeQ('What is `__str__` in Python?', ['String representation of an object', 'String type', 'String function', 'String method'], 0, 'intermediate'),
    makeQ('What is exception handling in Python?', ['try/except blocks', 'Error prevention', 'Bug fixing', 'Code validation'], 0, 'beginner'),
    makeQ('What is a module in Python?', ['A file containing Python code', 'A class', 'A function', 'A package'], 0, 'beginner'),
    makeQ('What is `if __name__ == "__main__"` in Python?', ['Checks if script is run directly', 'Main function', 'Module check', 'Conditional'], 0, 'intermediate'),
    makeQ('What is a context manager in Python?', ['Manages resources using `with`', 'A class', 'A function', 'A variable'], 0, 'intermediate'),
    makeQ('What is `__slots__` in Python?', ['Reduces memory by preventing __dict__', 'A slot machine', 'A class variable', 'A method'], 0, 'expert'),
    makeQ('What is the GIL in Python?', ['Global Interpreter Lock', 'General Interface Layer', 'Global Input Library', 'Generic Instruction List'], 0, 'expert'),
    makeQ('What is a metaclass in Python?', ['A class of a class', 'A meta class', 'A parent class', 'A super class'], 0, 'expert'),
    makeQ('What is `__call__` in Python?', ['Makes an object callable like a function', 'Calls a function', 'Call method', 'Invokes class'], 0, 'intermediate'),
    makeQ('What is monkey patching in Python?', ['Modifying code at runtime', 'A testing technique', 'A debugging method', 'A code pattern'], 0, 'expert'),
    makeQ('What is a coroutine in Python?', ['An async function using async/await', 'A type of loop', 'A function', 'A class'], 0, 'intermediate'),
    makeQ('What is `asyncio` in Python?', ['Library for async I/O', 'Async input/output', 'I/O management', 'Async library'], 0, 'intermediate'),
    makeQ('What is `__repr__` in Python?', ['Official string representation of object', 'Representation method', 'String output', 'Object display'], 0, 'intermediate'),
    makeQ('What is `__dict__` in Python?', ['Namespace dictionary of an object', 'Dictionary type', 'Dictionary class', 'Dictionary method'], 0, 'expert'),
    makeQ('What is `__getattr__` in Python?', ['Called when attribute is not found', 'Get attribute method', 'Attribute getter', 'Attribute accessor'], 0, 'expert'),
    makeQ('What is `__setattr__` in Python?', ['Called when setting any attribute', 'Set attribute method', 'Attribute setter', 'Attribute mutator'], 0, 'expert'),
  ]).slice(0, n),
};

const langSpecs = {
  go: [
    makeQ('What is a goroutine in Go?', ['A lightweight thread', 'A function', 'A loop', 'A variable'], 0, 'beginner'),
    makeQ('What is a channel in Go?', ['A way to communicate between goroutines', 'A TV channel', 'A data type', 'A function'], 0, 'beginner'),
    makeQ('What is a defer in Go?', ['Postpones function execution until surrounding function returns', 'A loop', 'A variable', 'A condition'], 0, 'intermediate'),
    makeQ('What is an interface in Go?', ['A set of method signatures', 'A class', 'A function', 'A variable'], 0, 'intermediate'),
    makeQ('What is a slice in Go?', ['A dynamic array', 'A fixed array', 'A string', 'A number'], 0, 'beginner'),
    makeQ('What is a map in Go?', ['A key-value data structure', 'A function', 'A loop', 'A condition'], 0, 'beginner'),
    makeQ('What is a struct in Go?', ['A composite data type', 'A function', 'A variable', 'An interface'], 0, 'beginner'),
    makeQ('What is a method in Go?', ['A function with a receiver', 'A class method', 'A variable', 'A loop'], 0, 'intermediate'),
    makeQ('What is error handling in Go?', ['Returning error values', 'try/catch', 'Exception handling', 'Error code'], 0, 'beginner'),
    makeQ('What is a pointer in Go?', ['A memory address', 'A value', 'A function', 'A variable'], 0, 'intermediate'),
  ],
  rs: [
    makeQ('What is ownership in Rust?', ['Each value has a single owner', 'Memory ownership', 'Variable ownership', 'Data ownership'], 0, 'beginner'),
    makeQ('What is borrowing in Rust?', ['Temporary access to a value without ownership', 'Loan system', 'Memory sharing', 'Variable sharing'], 0, 'beginner'),
    makeQ('What is a lifetime in Rust?', ['How long a reference is valid', 'Life of a variable', 'Program duration', 'Memory duration'], 0, 'intermediate'),
    makeQ('What is a trait in Rust?', ['A collection of methods for types', 'A characteristic', 'A property', 'An attribute'], 0, 'beginner'),
    makeQ('What is a match expression in Rust?', ['Pattern matching control flow', 'A comparison', 'A loop', 'A function'], 0, 'beginner'),
    makeQ('What is a Result type in Rust?', ['An enum for error handling', 'A result value', 'A function output', 'A variable'], 0, 'beginner'),
    makeQ('What is an Option type in Rust?', ['An enum for optional values', 'A choice', 'A variable', 'A function'], 0, 'beginner'),
    makeQ('What is unsafe Rust?', ['Code with relaxed safety rules', 'Dangerous code', 'Insecure code', 'Unstable code'], 0, 'expert'),
    makeQ('What is a macro in Rust?', ['Code that generates code', 'A function', 'A variable', 'A loop'], 0, 'intermediate'),
    makeQ('What is the borrow checker?', ['Compiler component enforcing ownership rules', 'A memory checker', 'A code linter', 'A debugger'], 0, 'intermediate'),
    makeQ('What is `String` vs `&str` in Rust?', ['String is owned, &str is borrowed', 'Same thing', 'String is mutable, &str is not', 'String is faster'], 0, 'intermediate'),
    makeQ('What is a Box in Rust?', ['Heap allocation for values', 'A container', 'A pointer', 'A reference'], 0, 'intermediate'),
    makeQ('What is an enum in Rust?', ['A type with multiple variants', 'A number', 'A function', 'A variable'], 0, 'beginner'),
    makeQ('What is `impl` in Rust?', ['Implementation block for types', 'Import', 'Implicit', 'Inline'], 0, 'beginner'),
    makeQ('What is `derive` in Rust?', ['Automatically implement traits', 'Derive values', 'Create types', 'Generate code'], 0, 'intermediate'),
  ],
  cs: [
    makeQ('What is LINQ in C#?', ['Language Integrated Query', 'Link Integration', 'Library Query', 'Language Query'], 0, 'intermediate'),
    makeQ('What is a property in C#?', ['A member with get/set accessors', 'A variable', 'A function', 'A class'], 0, 'beginner'),
    makeQ('What is async/await in C#?', ['Asynchronous programming model', 'Synchronous code', 'Parallel execution', 'Thread management'], 0, 'intermediate'),
    makeQ('What is a delegate in C#?', ['A type-safe function pointer', 'A class', 'A variable', 'An interface'], 0, 'intermediate'),
    makeQ('What is an event in C#?', ['A notification mechanism', 'A function', 'A variable', 'A class'], 0, 'intermediate'),
    makeQ('What is an interface in C#?', ['A contract for classes', 'A user interface', 'A class', 'A function'], 0, 'beginner'),
    makeQ('What is garbage collection in C#?', ['Automatic memory management', 'Memory allocation', 'Memory cleanup', 'Memory optimization'], 0, 'beginner'),
    makeQ('What is a namespace in C#?', ['Organizes code into groups', 'A location', 'A file', 'A class'], 0, 'beginner'),
    makeQ('What is ASP.NET?', ['Web framework for .NET', 'A language', 'A database', 'An IDE'], 0, 'intermediate'),
    makeQ('What is Entity Framework?', ['ORM for .NET', 'A database', 'A framework', 'A library'], 0, 'intermediate'),
    makeQ('What is a tuple in C#?', ['A lightweight data structure with multiple values', 'A function', 'A class', 'A variable'], 0, 'beginner'),
    makeQ('What is `var` in C#?', ['Implicit type declaration', 'Variable', 'Variant', 'Value type'], 0, 'beginner'),
    makeQ('What is a record in C#?', ['A reference type for data', 'A music record', 'A file', 'A log entry'], 0, 'intermediate'),
    makeQ('What is a struct in C#?', ['A value type', 'A reference type', 'A class', 'An interface'], 0, 'intermediate'),
    makeQ('What is a nullable type in C#?', ['A type that can be null', 'A null value', 'A non-null type', 'An optional type'], 0, 'beginner'),
  ],
  kt: [
    makeQ('What is a coroutine in Kotlin?', ['A concurrency design pattern', 'A function', 'A loop', 'A class'], 0, 'intermediate'),
    makeQ('What is a data class in Kotlin?', ['A class for holding data', 'A database class', 'A data type', 'A class with data'], 0, 'beginner'),
    makeQ('What is null safety in Kotlin?', ['Built-in null protection', 'Null checking', 'Null handling', 'Null prevention'], 0, 'beginner'),
    makeQ('What is a sealed class in Kotlin?', ['A restricted class hierarchy', 'A closed class', 'A sealed type', 'A final class'], 0, 'intermediate'),
    makeQ('What is an extension function in Kotlin?', ['Adds functions to existing classes', 'Extended function', 'Extra method', 'Additional function'], 0, 'intermediate'),
    makeQ('What is a companion object in Kotlin?', ['Static-like members for a class', 'A friend class', 'A helper object', 'A utility class'], 0, 'intermediate'),
    makeQ('What is `lateinit` in Kotlin?', ['Late initialization for non-null properties', 'Late binding', 'Late loading', 'Lazy init'], 0, 'intermediate'),
    makeQ('What is `by lazy` in Kotlin?', ['Lazy initialization', 'Lazy loading', 'Lazy evaluation', 'Deferred init'], 0, 'intermediate'),
    makeQ('What is a scope function in Kotlin?', ['Functions like let/apply/run/with/also', 'A function scope', 'Variable scope', 'Access scope'], 0, 'intermediate'),
    makeQ('What is `when` in Kotlin?', ['A pattern matching expression', 'A loop', 'A condition', 'A function'], 0, 'beginner'),
    makeQ('What is `data class` in Kotlin?', ['Auto-generates equals/hashCode/toString', 'Data storage', 'Data type', 'Database class'], 0, 'beginner'),
    makeQ('What are coroutines in Kotlin?', ['Lightweight async execution', 'Threads', 'Functions', 'Loops'], 0, 'intermediate'),
    makeQ('What is a Flow in Kotlin?', ['Cold async data stream', 'Data flow', 'Stream of data', 'Event flow'], 0, 'intermediate'),
    makeQ('What is `sealed class` in Kotlin?', ['Restricted hierarchy with known subclasses', 'Encapsulated class', 'Hidden class', 'Final class'], 0, 'intermediate'),
    makeQ('What is a reified type in Kotlin?', ['Preserved generic type at runtime', 'Refied type', 'Real type', 'Concrete type'], 0, 'expert'),
  ],
  swift: [
    makeQ('What is optional in Swift?', ['A value that may be nil', 'A choice', 'An option', 'A selection'], 0, 'beginner'),
    makeQ('What is a struct in Swift?', ['A value type', 'A reference type', 'A class', 'An enum'], 0, 'beginner'),
    makeQ('What is a class in Swift?', ['A reference type', 'A value type', 'A struct', 'An enum'], 0, 'beginner'),
    makeQ('What is a protocol in Swift?', ['A blueprint of methods/properties', 'A class', 'A struct', 'An enum'], 0, 'beginner'),
    makeQ('What is a closure in Swift?', ['A self-contained block of code', 'A function', 'A variable', 'A class'], 0, 'intermediate'),
    makeQ('What is ARC in Swift?', ['Automatic Reference Counting', 'Automated Resource Control', 'Application Runtime Code', 'Apple Resource Counter'], 0, 'intermediate'),
    makeQ('What is optional chaining in Swift?', ['Safely accessing optional values', 'Chain of options', 'Optional sequence', 'Nil coalescing'], 0, 'intermediate'),
    makeQ('What is a guard statement in Swift?', ['Early exit when condition fails', 'Security guard', 'Protection', 'Conditional'], 0, 'intermediate'),
    makeQ('What is a computed property in Swift?', ['Property that calculates its value', 'Computed value', 'Calculated property', 'Math property'], 0, 'intermediate'),
    makeQ('What is an enum in Swift?', ['A type with multiple cases', 'A number', 'A function', 'A variable'], 0, 'beginner'),
  ],
  zig: [
    makeQ('What is comptime in Zig?', ['Compile-time execution', 'Computer time', 'Code timing', 'Compilation time'], 0, 'intermediate'),
    makeQ('What is an error union in Zig?', ['A type that can be an error or value', 'Error handling union', 'Error type', 'Union type'], 0, 'intermediate'),
    makeQ('What is `defer` in Zig?', ['Schedules code to run at scope exit', 'Delayed execution', 'Deferred function', 'Postponed code'], 0, 'beginner'),
    makeQ('What is `pub` in Zig?', ['Makes declaration publicly accessible', 'Public access', 'Publish', 'Public keyword'], 0, 'beginner'),
    makeQ('What is `var` vs `const` in Zig?', ['var is mutable, const is immutable', 'Same thing', 'var is global, const is local', 'var is constant'], 0, 'beginner'),
  ],
  c: [
    makeQ('What is a pointer in C?', ['A variable that stores a memory address', 'A pointer device', 'A reference', 'An index'], 0, 'beginner'),
    makeQ('What is malloc in C?', ['Allocates memory on the heap', 'Memory lock', 'Memory allocation', 'Memory management'], 0, 'intermediate'),
    makeQ('What is a null pointer in C?', ['A pointer that points to nothing', 'A zero pointer', 'An empty pointer', 'A void pointer'], 0, 'beginner'),
    makeQ('What is a struct in C?', ['A composite data type', 'A class', 'A function', 'A variable'], 0, 'beginner'),
    makeQ('What is the preprocessor in C?', ['Processes code before compilation', 'Code optimizer', 'Code formatter', 'Code analyzer'], 0, 'intermediate'),
    makeQ('What is `#include` in C?', ['Includes header files', 'Includes source files', 'Includes libraries', 'Includes functions'], 0, 'beginner'),
    makeQ('What is a function pointer in C?', ['Pointer to a function', 'Function that returns pointer', 'Pointer function', 'Function pointer type'], 0, 'intermediate'),
    makeQ('What is `sizeof` in C?', ['Returns size of type/variable in bytes', 'Size of file', 'Size of memory', 'Size of program'], 0, 'beginner'),
    makeQ('What is a linked list in C?', ['A dynamic data structure', 'A list of links', 'An array', 'A sequence'], 0, 'intermediate'),
    makeQ('What is recursion in C?', ['Function calling itself', 'A loop', 'A condition', 'An array'], 0, 'beginner'),
  ],
  java: [
    makeQ('What is the JVM?', ['Java Virtual Machine', 'Java Version Manager', 'Java Variable Memory', 'Java Visual Machine'], 0, 'beginner'),
    makeQ('What is a class in Java?', ['A blueprint for objects', 'A function', 'A variable', 'A type'], 0, 'beginner'),
    makeQ('What is inheritance in Java?', ['Deriving properties from a parent class', 'A financial term', 'A legal concept', 'A design pattern'], 0, 'beginner'),
    makeQ('What is the main method signature in Java?', ['public static void main(String[] args)', 'public void main()', 'static void main()', 'public main()'], 0, 'beginner'),
    makeQ('What is a constructor in Java?', ['Initializes new objects', 'A building function', 'A class', 'A method'], 0, 'beginner'),
    makeQ('What is the `this` keyword in Java?', ['Refers to current object', 'Current value', 'This variable', 'Current class'], 0, 'beginner'),
    makeQ('What is polymorphism in Java?', ['Many forms of a method', 'Multiple functions', 'Many variables', 'Multiple classes'], 0, 'intermediate'),
    makeQ('What is an abstract class in Java?', ['A class that cannot be instantiated', 'An incomplete class', 'A hidden class', 'A virtual class'], 0, 'intermediate'),
    makeQ('What is an interface in Java?', ['A contract for classes', 'A user interface', 'A class', 'A method'], 0, 'intermediate'),
    makeQ('What is a package in Java?', ['A namespace for classes', 'A compressed file', 'A library', 'A module'], 0, 'beginner'),
    makeQ('What is garbage collection in Java?', ['Automatic memory management', 'Memory allocation', 'Memory cleanup', 'Memory defragmentation'], 0, 'beginner'),
    makeQ('What is an exception in Java?', ['An unusual event that disrupts program flow', 'An error', 'A bug', 'A warning'], 0, 'beginner'),
    makeQ('What is `final` keyword in Java?', ['Makes variable/class/method unchangeable', 'The end', 'Final version', 'Last value'], 0, 'intermediate'),
    makeQ('What is `static` in Java?', ['Belongs to the class, not instances', 'Static value', 'Unchanging', 'Fixed'], 0, 'beginner'),
    makeQ('What is generics in Java?', ['Type parameters for classes/methods', 'General types', 'Generic programming', 'Type safety'], 0, 'intermediate'),
  ],
  php: [
    makeQ('What does PHP stand for?', ['PHP: Hypertext Preprocessor', 'Personal Home Page', 'Pretty Hard Programming', 'Professional HTML Parser'], 0, 'beginner'),
    makeQ('What is the `$` used for in PHP?', ['Prefix for variables', 'String delimiter', 'Array index', 'Function call'], 0, 'beginner'),
    makeQ('What is `echo` in PHP?', ['Outputs text', 'Returns value', 'Creates variable', 'Defines function'], 0, 'beginner'),
    makeQ('What is `$_POST` in PHP?', ['HTTP POST data', 'Post office', 'Post variable', 'Mail function'], 0, 'beginner'),
    makeQ('What is a session in PHP?', ['Persistent data across pages', 'A meeting', 'A class', 'A function'], 0, 'intermediate'),
    makeQ('What is PDO in PHP?', ['PHP Data Objects for database access', 'PHP Development Option', 'PHP Debug Output', 'PHP Directory Object'], 0, 'intermediate'),
    makeQ('What is Composer in PHP?', ['Dependency manager', 'Code composer', 'File organizer', 'Package creator'], 0, 'beginner'),
    makeQ('What is a trait in PHP?', ['A mechanism for code reuse', 'A characteristic', 'A property', 'An attribute'], 0, 'intermediate'),
    makeQ('What is `__construct` in PHP?', ['Class constructor', 'Build method', 'Init method', 'Start method'], 0, 'beginner'),
    makeQ('What is `namespace` in PHP?', ['Organizes code into groups', 'A location', 'A file path', 'A class name'], 0, 'intermediate'),
  ],
  rb: [
    makeQ('What is RubyGems?', ['Package manager for Ruby', 'Ruby jewels', 'Ruby Library', 'Ruby tools'], 0, 'beginner'),
    makeQ('What is `puts` in Ruby?', ['Prints to console with newline', 'Puts value', 'Prints string', 'Outputs data'], 0, 'beginner'),
    makeQ('What is a block in Ruby?', ['A chunk of code passed to methods', 'A code block', 'A loop', 'A condition'], 0, 'beginner'),
    makeQ('What is a symbol in Ruby?', ['An immutable identifier', 'A string', 'A number', 'A variable'], 0, 'beginner'),
    makeQ('What is a mixin in Ruby?', ['A module included in a class', 'Mixed drink', 'Combination', 'Fusion'], 0, 'intermediate'),
    makeQ('What is a proc in Ruby?', ['A stored block', 'A function', 'A variable', 'A class'], 0, 'intermediate'),
    makeQ('What is `yield` in Ruby?', ['Calls a block from a method', 'Returns a value', 'Pauses execution', 'Creates output'], 0, 'intermediate'),
    makeQ('What is `attr_accessor` in Ruby?', ['Creates getter and setter methods', 'Access attribute', 'Attribute reader', 'Property access'], 0, 'beginner'),
    makeQ('What is `nil` in Ruby?', ['Represents nothing/absence of value', 'Zero', 'Empty string', 'False'], 0, 'beginner'),
    makeQ('What is Rails?', ['A web framework for Ruby', 'A train track', 'A library', 'A tool'], 0, 'beginner'),
    makeQ('What is a hash in Ruby?', ['A key-value data structure', 'Hash function', 'Cryptographic hash', 'Data digest'], 0, 'beginner'),
    makeQ('What is an array in Ruby?', ['An ordered collection of elements', 'A single value', 'A function', 'A class'], 0, 'beginner'),
  ],
  scala: [
    makeQ('What is a case class in Scala?', ['Immutable class with pattern matching support', 'A legal class', 'A special case', 'A conditional class'], 0, 'beginner'),
    makeQ('What is an object in Scala?', ['A singleton instance', 'A regular class', 'A function', 'A variable'], 0, 'beginner'),
    makeQ('What is a trait in Scala?', ['Similar to interfaces with implementation', 'A characteristic', 'A property', 'An attribute'], 0, 'beginner'),
    makeQ('What is `val` vs `var` in Scala?', ['val is immutable, var is mutable', 'Same thing', 'val is local, var is global', 'val is constant'], 0, 'beginner'),
    makeQ('What is pattern matching in Scala?', ['Matching values against patterns', 'A design pattern', 'A code pattern', 'A string match'], 0, 'beginner'),
    makeQ('What is a for-comprehension in Scala?', ['Syntactic sugar for map/flatMap/filter', 'A loop', 'A condition', 'A function'], 0, 'intermediate'),
    makeQ('What is an Option in Scala?', ['A container for optional values', 'A choice', 'A selection', 'An alternative'], 0, 'beginner'),
    makeQ('What is an Either in Scala?', ['A type for values that can be one of two types', 'A choice', 'A binary', 'A pair'], 0, 'intermediate'),
    makeQ('What is a companion object in Scala?', ['Object paired with a class', 'Friend object', 'Helper object', 'Utility object'], 0, 'intermediate'),
    makeQ('What is `implicit` in Scala?', ['Automatic parameter/conversion', 'Hidden', 'Inferred', 'Indirect'], 0, 'expert'),
  ],
  bash: [
    makeQ('What is a shebang in bash?', ['#!/bin/bash at the start of a script', 'A dance', 'A comment', 'A variable'], 0, 'beginner'),
    makeQ('What does `$?` represent in bash?', ['Exit status of last command', 'Current PID', 'Number of arguments', 'Last argument'], 0, 'intermediate'),
    makeQ('What does `$#` mean in bash?', ['Number of arguments', 'All arguments', 'First argument', 'Last argument'], 0, 'beginner'),
    makeQ('What is `grep` used for in bash?', ['Searching text with patterns', 'Grabbing files', 'Global replace', 'Grouping text'], 0, 'beginner'),
    makeQ('What does `chmod` do in bash?', ['Changes file permissions', 'Change mode', 'Change document', 'Modify file'], 0, 'beginner'),
    makeQ('What is `stdout` in bash?', ['Standard output stream', 'Standard input', 'Standard error', 'Standard type'], 0, 'beginner'),
    makeQ('What does piping (`|`) do in bash?', ['Passes output of one command to another', 'Creates a new process', 'Joins commands', 'Separates commands'], 0, 'beginner'),
    makeQ('What is a variable in bash?', ['A named storage for data', 'A function', 'A command', 'A script'], 0, 'beginner'),
    makeQ('What does `$HOME` mean in bash?', ['Home directory path', 'Home variable', 'Current directory', 'Root directory'], 0, 'beginner'),
    makeQ('What is `awk` used for in bash?', ['Text processing and pattern scanning', 'Awkward tool', 'A text editor', 'A code formatter'], 0, 'intermediate'),
    makeQ('What is `sed` in bash?', ['Stream editor for text transformation', 'Set editor', 'Script editor', 'Search editor'], 0, 'intermediate'),
    makeQ('What is a function in bash?', ['A reusable block of commands', 'A variable', 'A script', 'A command'], 0, 'beginner'),
    makeQ('What does `[[ ... ]]` mean in bash?', ['Extended test construct', 'Array definition', 'Comment', 'String'], 0, 'intermediate'),
    makeQ('What is a for loop in bash?', ['Iterates over items', 'A conditional', 'A function', 'A variable'], 0, 'beginner'),
    makeQ('What is `exec` in bash?', ['Replaces current process with command', 'Execute command', 'Run script', 'Call function'], 0, 'intermediate'),
  ],
  html: [
    makeQ('What does HTML stand for?', ['HyperText Markup Language', 'HyperText Makeup Language', 'High Tech Modern Language', 'Home Tool Markup Language'], 0, 'beginner'),
    makeQ('What is the `<head>` element for?', ['Metadata and document info', 'Page heading', 'Header section', 'Navigation'], 0, 'beginner'),
    makeQ('What is the `<body>` element for?', ['Visible page content', 'Document body', 'Main content', 'Page structure'], 0, 'beginner'),
    makeQ('What does `<a href>` create?', ['A hyperlink', 'An anchor', 'A button', 'A navigation'], 0, 'beginner'),
    makeQ('What is the `<img>` tag for?', ['Embedding images', 'Image icon', 'Image map', 'Image link'], 0, 'beginner'),
    makeQ('What is the `alt` attribute for?', ['Alternate text for images', 'Alternative link', 'Alignment', 'Alteration'], 0, 'beginner'),
    makeQ('What is a semantic HTML element?', ['Meaningful element describing its content', 'A styled element', 'A hidden element', 'A decorative element'], 0, 'intermediate'),
    makeQ('What is `<article>` used for?', ['Self-contained content', 'Article in a newspaper', 'Blog post', 'All of the above'], 3, 'intermediate'),
    makeQ('What is the difference between `<div>` and `<span>`?', ['div is block, span is inline', 'Same thing', 'div is inline, span is block', 'Both are inline'], 0, 'beginner'),
    makeQ('What is a form used for in HTML?', ['Collecting user input', 'Formatting text', 'Creating shapes', 'Designing pages'], 0, 'beginner'),
    makeQ('What does `<!DOCTYPE html>` declare?', ['HTML5 document type', 'Document type', 'HTML version', 'Page type'], 0, 'beginner'),
    makeQ('What is the `<nav>` element?', ['Navigation section', 'Navigation bar', 'Navigation links', 'Menu'], 0, 'beginner'),
    makeQ('What is `<section>` used for?', ['Thematic grouping of content', 'A page section', 'A document section', 'A website section'], 0, 'intermediate'),
    makeQ('What is the `<footer>` element?', ['Bottom section of a page', 'Page footer', 'Document footer', 'End of content'], 0, 'beginner'),
    makeQ('What is accessibility in HTML?', ['Making web content usable by everyone', 'Access control', 'Web security', 'User permissions'], 0, 'intermediate'),
    makeQ('What is the `<meta charset="UTF-8">` tag for?', ['Specifying character encoding', 'Page description', 'Keyword list', 'Author info'], 0, 'beginner'),
    makeQ('What is a `<table>` in HTML?', ['Tabular data display', 'A chart', 'A layout', 'A list'], 0, 'beginner'),
    makeQ('What is `<label>` used for?', ['Associating text with form inputs', 'Labeling sections', 'Page title', 'Image caption'], 0, 'beginner'),
    makeQ('What is `aria-label`?', ['Accessible label for screen readers', 'A label attribute', 'An HTML label', 'A CSS property'], 0, 'intermediate'),
    makeQ('What is `<iframe>` used for?', ['Embedding another document', 'Inline frame', 'Image frame', 'Page frame'], 0, 'intermediate'),
  ],
  css: [
    makeQ('What does CSS stand for?', ['Cascading Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], 0, 'beginner'),
    makeQ('What is a CSS selector?', ['Pattern to select HTML elements', 'Selection tool', 'CSS property', 'CSS value'], 0, 'beginner'),
    makeQ('What is `color` in CSS?', ['Sets text color', 'Sets background color', 'Sets border color', 'Sets outline color'], 0, 'beginner'),
    makeQ('What is `margin` in CSS?', ['Space outside an element', 'Space inside an element', 'Element border', 'Element padding'], 0, 'beginner'),
    makeQ('What is `padding` in CSS?', ['Space inside an element', 'Space outside an element', 'Element margin', 'Element gap'], 0, 'beginner'),
    makeQ('What is `display: flex` used for?', ['Flexbox layout', 'Flexible display', 'Flex alignment', 'Flex container'], 0, 'intermediate'),
    makeQ('What is a class selector in CSS?', ['.className', '#idName', 'elementName', '*'], 0, 'beginner'),
    makeQ('What is an ID selector in CSS?', ['#idName', '.className', 'elementName', '*'], 0, 'beginner'),
    makeQ('What is the box model in CSS?', ['Content, padding, border, margin', 'Box sizing', 'Box shadow', 'Box layout'], 0, 'beginner'),
    makeQ('What is `position: absolute` in CSS?', ['Positioned relative to nearest positioned ancestor', 'Positioned at top-left', 'Fixed position', 'Relative position'], 0, 'intermediate'),
    makeQ('What is a media query in CSS?', ['Responsive design breakpoints', 'Media element', 'Query string', 'CSS condition'], 0, 'intermediate'),
    makeQ('What is `z-index` in CSS?', ['Stack order of elements', 'Zoom index', 'Z-axis position', 'Zero index'], 0, 'intermediate'),
    makeQ('What is `@keyframes` in CSS?', ['Defines animation steps', 'Keyframe animation', 'Animation sequence', 'Frame definition'], 0, 'intermediate'),
    makeQ('What is `box-sizing: border-box`?', ['Includes padding/border in width/height', 'Border box model', 'Content box model', 'Box style'], 0, 'intermediate'),
    makeQ('What is specificity in CSS?', ['Which selector takes priority', 'Specific attribute', 'CSS property', 'Selector type'], 0, 'intermediate'),
    makeQ('What is a CSS Grid?', ['Two-dimensional layout system', 'Grid of images', 'Table layout', 'Grid framework'], 0, 'intermediate'),
    makeQ('What is `:hover` in CSS?', ['Pseudo-class for mouse hover state', 'Hover effect', 'Hover animation', 'CSS transition'], 0, 'beginner'),
    makeQ('What is `@import` in CSS?', ['Imports external CSS files', 'Imports JavaScript', 'Imports images', 'Imports fonts'], 0, 'beginner'),
    makeQ('What is a CSS variable?', ['Custom property with -- prefix', 'Variable in CSS', 'CSS value', 'Property value'], 0, 'intermediate'),
    makeQ('What is `calc()` in CSS?', ['Mathematical calculation in CSS', 'Calculator function', 'Calculation method', 'CSS function'], 0, 'intermediate'),
  ],
  // Non-traditional languages
  git: [
    makeQ('What is Git?', ['Version control system', 'A code editor', 'A programming language', 'A database'], 0, 'beginner'),
    makeQ('What does `git commit` do?', ['Saves changes to local repository', 'Uploads code', 'Deletes files', 'Creates branch'], 0, 'beginner'),
    makeQ('What does `git push` do?', ['Uploads local changes to remote', 'Downloads changes', 'Creates branch', 'Merges code'], 0, 'beginner'),
    makeQ('What is a branch in Git?', ['A separate line of development', 'A code file', 'A folder', 'A commit'], 0, 'beginner'),
    makeQ('What does `git merge` do?', ['Combines branches', 'Deletes branch', 'Creates branch', 'Rebases branch'], 0, 'intermediate'),
    makeQ('What is a pull request?', ['Proposal to merge changes', 'Request to pull code', 'Code review', 'Merge request'], 0, 'beginner'),
    makeQ('What is `git status` used for?', ['Shows current state of repository', 'Shows commit history', 'Shows branches', 'Shows changes'], 0, 'beginner'),
    makeQ('What is `git log`?', ['Shows commit history', 'Shows log files', 'Shows errors', 'Shows branches'], 0, 'beginner'),
    makeQ('What is a remote in Git?', ['Remote repository URL', 'Remote server', 'Remote branch', 'Remote file'], 0, 'beginner'),
    makeQ('What is `git clone`?', ['Creates local copy of remote repository', 'Copies a file', 'Clones a branch', 'Duplicates code'], 0, 'beginner'),
    makeQ('What is `git stash`?', ['Temporarily saves uncommitted changes', 'Deletes changes', 'Stores code', 'Archives files'], 0, 'intermediate'),
    makeQ('What is a conflict in Git?', ['When changes overlap and can\'t be auto-merged', 'An error', 'A bug', 'A warning'], 0, 'intermediate'),
    makeQ('What is `git rebase`?', ['Reapplies commits on top of another base', 'Rebases branch', 'Reorganizes commits', 'Restructures history'], 0, 'expert'),
    makeQ('What is `HEAD` in Git?', ['Current commit/branch reference', 'Head of file', 'First commit', 'Main branch'], 0, 'beginner'),
    makeQ('What is `git diff`?', ['Shows differences between commits', 'File comparison', 'Code review', 'Change log'], 0, 'intermediate'),
  ],
  pg: [
    makeQ('What is PostgreSQL?', ['An open-source relational database', 'A programming language', 'A web server', 'An operating system'], 0, 'beginner'),
    makeQ('What is a primary key in PostgreSQL?', ['Unique identifier for a row', 'Main key', 'First key', 'Index key'], 0, 'beginner'),
    makeQ('What is a foreign key in PostgreSQL?', ['References primary key in another table', 'External key', 'Secondary key', 'Import key'], 0, 'beginner'),
    makeQ('What is a JOIN in PostgreSQL?', ['Combines rows from multiple tables', 'Joining data', 'Table connection', 'Data merge'], 0, 'beginner'),
    makeQ('What is an index in PostgreSQL?', ['Speeds up data retrieval', 'A list of items', 'A table', 'A constraint'], 0, 'intermediate'),
    makeQ('What is a transaction in PostgreSQL?', ['Group of operations as a unit', 'Data transfer', 'Query execution', 'Data change'], 0, 'intermediate'),
    makeQ('What is ACID in databases?', ['Atomicity, Consistency, Isolation, Durability', 'A base', 'A property', 'A standard'], 0, 'intermediate'),
    makeQ('What is a view in PostgreSQL?', ['A virtual table based on a query', 'A visible table', 'A perspective', 'A data view'], 0, 'beginner'),
    makeQ('What is a CTE in PostgreSQL?', ['Common Table Expression', 'Common Table Entry', 'Complex Table Expression', 'Core Table Element'], 0, 'intermediate'),
    makeQ('What is a stored procedure in PostgreSQL?', ['Precompiled SQL code', 'A function', 'A query', 'A trigger'], 0, 'intermediate'),
  ],
  mysql: [
    makeQ('What is MySQL?', ['An open-source relational database', 'A programming language', 'A web server', 'An operating system'], 0, 'beginner'),
    makeQ('What is the default port for MySQL?', ['3306', '5432', '8080', '27017'], 0, 'beginner'),
    makeQ('What is a table in MySQL?', ['A collection of related data in rows/columns', 'A data structure', 'A database', 'A schema'], 0, 'beginner'),
    makeQ('What is `SELECT` used for in MySQL?', ['Retrieving data', 'Inserting data', 'Updating data', 'Deleting data'], 0, 'beginner'),
    makeQ('What is a WHERE clause in MySQL?', ['Filters query results', 'Specifies location', 'Conditions', 'Limits data'], 0, 'beginner'),
    makeQ('What is an AUTO_INCREMENT in MySQL?', ['Automatically generates unique numbers', 'Auto increment value', 'Sequence number', 'Auto counter'], 0, 'beginner'),
    makeQ('What is a NULL value in MySQL?', ['Absence of value', 'Zero', 'Empty string', 'False'], 0, 'beginner'),
    makeQ('What is GROUP BY in MySQL?', ['Groups rows with same values', 'Groups columns', 'Organizes data', 'Sorts data'], 0, 'intermediate'),
    makeQ('What is a subquery in MySQL?', ['A query inside another query', 'A small query', 'A nested query', 'A secondary query'], 0, 'intermediate'),
    makeQ('What is a JOIN in MySQL?', ['Combines rows from multiple tables', 'Join tables', 'Data merge', 'Table connection'], 0, 'beginner'),
  ],
  sqlite: [
    makeQ('What is SQLite?', ['A lightweight embedded database', 'A server database', 'A programming language', 'An operating system'], 0, 'beginner'),
    makeQ('Is SQLite a server-based database?', ['No, it\'s serverless', 'Yes', 'Both', 'Neither'], 0, 'beginner'),
    makeQ('What file extension do SQLite databases use?', ['.db or .sqlite', '.sql', '.txt', '.csv'], 0, 'beginner'),
    makeQ('What is an INTEGER PRIMARY KEY in SQLite?', ['Alias for the rowid column', 'Integer key', 'Primary integer', 'Row ID'], 0, 'intermediate'),
    makeQ('Does SQLite support full SQL?', ['It supports most SQL standards', 'No', 'Only SELECT', 'Only DDL'], 0, 'beginner'),
    makeQ('What is a transaction in SQLite?', ['Group of operations as a unit', 'Data transfer', 'Query execution', 'Data change'], 0, 'beginner'),
    makeQ('What is BLOB in SQLite?', ['Binary Large Object', 'Binary data', 'Text data', 'Number data'], 0, 'beginner'),
    makeQ('What is VACUUM in SQLite?', ['Reclaims storage space', 'Cleans data', 'Repairs database', 'Optimizes queries'], 0, 'intermediate'),
    makeQ('What is PRAGMA in SQLite?', ['Special commands for configuration', 'A programming directive', 'A query', 'A function'], 0, 'intermediate'),
    makeQ('Can SQLite handle multiple concurrent writes?', ['No, it locks the database', 'Yes', 'Sometimes', 'Only on servers'], 0, 'intermediate'),
  ],
  sql: [
    makeQ('What does SQL stand for?', ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'], 0, 'beginner'),
    makeQ('What is a database?', ['An organized collection of data', 'A spreadsheet', 'A file', 'A program'], 0, 'beginner'),
    makeQ('What is a table in SQL?', ['A collection of data in rows and columns', 'A chart', 'A list', 'A form'], 0, 'beginner'),
    makeQ('What is a SELECT statement?', ['Retrieves data from a table', 'Inserts data', 'Updates data', 'Deletes data'], 0, 'beginner'),
    makeQ('What is a WHERE clause?', ['Filters records', 'Specifies location', 'Sets condition', 'Orders results'], 0, 'beginner'),
    makeQ('What is an INSERT statement?', ['Adds new data to a table', 'Reads data', 'Modifies data', 'Removes data'], 0, 'beginner'),
    makeQ('What is an UPDATE statement?', ['Modifies existing data', 'Creates new data', 'Deletes data', 'Reads data'], 0, 'beginner'),
    makeQ('What is a DELETE statement?', ['Removes data from a table', 'Adds data', 'Reads data', 'Modifies data'], 0, 'beginner'),
    makeQ('What is a primary key?', ['Unique identifier for each row', 'First column', 'Main index', 'Key column'], 0, 'beginner'),
    makeQ('What is a foreign key?', ['References another table\'s primary key', 'External key', 'Secondary key', 'Import key'], 0, 'beginner'),
    makeQ('What is a JOIN in SQL?', ['Combines data from multiple tables', 'Connects tables', 'Merges data', 'Links tables'], 0, 'beginner'),
    makeQ('What is GROUP BY?', ['Groups rows with same values', 'Groups rows', 'Sorts data', 'Filters data'], 0, 'intermediate'),
    makeQ('What is ORDER BY?', ['Sorts result set', 'Orders rows', 'Arranges data', 'Sequences output'], 0, 'beginner'),
    makeQ('What is a subquery?', ['A query within another query', 'Small query', 'Nested query', 'Secondary query'], 0, 'intermediate'),
    makeQ('What is NULL in SQL?', ['Missing or unknown value', 'Zero', 'Empty string', 'False'], 0, 'beginner'),
  ],
  mongodb: [
    makeQ('What is MongoDB?', ['A NoSQL document database', 'A relational database', 'A programming language', 'A web server'], 0, 'beginner'),
    makeQ('What is a document in MongoDB?', ['A JSON-like data record', 'A text file', 'A spreadsheet', 'A table'], 0, 'beginner'),
    makeQ('What is a collection in MongoDB?', ['A group of documents', 'A table', 'A database', 'A cluster'], 0, 'beginner'),
    makeQ('What is the MongoDB query language?', ['A JSON-based query language', 'SQL', 'Python', 'JavaScript'], 0, 'beginner'),
    makeQ('What is `_id` in MongoDB?', ['A unique identifier for documents', 'An index', 'A field', 'A key'], 0, 'beginner'),
    makeQ('What is an index in MongoDB?', ['Improves query performance', 'A book index', 'A search tool', 'A data structure'], 0, 'intermediate'),
    makeQ('What is aggregation in MongoDB?', ['Data processing pipeline', 'Data collection', 'Data merge', 'Data query'], 0, 'intermediate'),
    makeQ('What is a replica set in MongoDB?', ['Redundant data for high availability', 'Data copy', 'Backup set', 'Mirror set'], 0, 'intermediate'),
    makeQ('What is sharding in MongoDB?', ['Horizontal scaling by distributing data', 'Splitting data', 'Data partition', 'Data sharing'], 0, 'expert'),
    makeQ('What is BSON in MongoDB?', ['Binary JSON format', 'Binary data', 'JSON format', 'Data type'], 0, 'intermediate'),
  ],
  dk: [
    makeQ('What is Docker?', ['A containerization platform', 'A virtual machine', 'A programming language', 'An operating system'], 0, 'beginner'),
    makeQ('What is a Docker image?', ['A read-only template for containers', 'A picture', 'A file', 'A snapshot'], 0, 'beginner'),
    makeQ('What is a Docker container?', ['A runnable instance of an image', 'A box', 'A virtual machine', 'A process'], 0, 'beginner'),
    makeQ('What is a Dockerfile?', ['Script to build an image', 'A configuration file', 'A text file', 'A script'], 0, 'beginner'),
    makeQ('What does `docker run` do?', ['Creates and starts a container', 'Builds an image', 'Stops a container', 'Deletes a container'], 0, 'beginner'),
    makeQ('What is Docker Compose?', ['Multi-container orchestration tool', 'A compose file', 'A container manager', 'A deployment tool'], 0, 'beginner'),
    makeQ('What is a Docker volume?', ['Persistent data storage for containers', 'A file', 'A folder', 'A disk'], 0, 'intermediate'),
    makeQ('What is a Docker network?', ['Connects containers together', 'A network bridge', 'A virtual network', 'A connection'], 0, 'intermediate'),
    makeQ('What is a Docker registry?', ['Stores and distributes images', 'A database', 'A file server', 'A container storage'], 0, 'beginner'),
    makeQ('What is `docker-compose.yml`?', ['Config file for multi-container setup', 'A compose file', 'A Dockerfile', 'A configuration'], 0, 'beginner'),
  ],
  firebase: [
    makeQ('What is Firebase?', ['A Google-backed app development platform', 'A database', 'A hosting service', 'A cloud function'], 0, 'beginner'),
    makeQ('What is Firestore?', ['A NoSQL document database', 'A SQL database', 'A file storage', 'A cache'], 0, 'beginner'),
    makeQ('What is Firebase Authentication?', ['A user authentication service', 'A login page', 'A password manager', 'An auth library'], 0, 'beginner'),
    makeQ('What is Cloud Functions for Firebase?', ['Serverless backend functions', 'Cloud storage', 'Database functions', 'API functions'], 0, 'intermediate'),
    makeQ('What is Firebase Hosting?', ['Static web hosting service', 'Dynamic hosting', 'Server hosting', 'Database hosting'], 0, 'beginner'),
    makeQ('What is Firebase Realtime Database?', ['A real-time NoSQL database', 'A SQL database', 'A cache', 'A file store'], 0, 'beginner'),
    makeQ('What is Firebase Storage?', ['File and media storage', 'Database storage', 'Cache storage', 'App storage'], 0, 'beginner'),
    makeQ('What are Firebase Security Rules?', ['Access control for Firebase resources', 'Firewall rules', 'App permissions', 'Network rules'], 0, 'intermediate'),
    makeQ('What is Firebase Analytics?', ['App usage analytics', 'User tracking', 'Data analysis', 'Performance monitoring'], 0, 'beginner'),
    makeQ('What is Firebase Cloud Messaging?', ['Push notification service', 'Messaging app', 'Chat service', 'Email service'], 0, 'intermediate'),
  ],
  gamedev: [
    makeQ('What is a game loop?', ['A continuous cycle updating game state', 'A loop in code', 'A game feature', 'A game mode'], 0, 'beginner'),
    makeQ('What is a sprite in game development?', ['A 2D image representing a character/object', 'A small graphic', 'A pixel art', 'An animation'], 0, 'beginner'),
    makeQ('What is a hitbox?', ['An invisible collision area', 'A damaged box', 'A game item', 'A physics object'], 0, 'beginner'),
    makeQ('What is delta time?', ['Time between frames', 'Time difference', 'Game time', 'Frame rate'], 0, 'intermediate'),
    makeQ('What is physics in games?', ['Simulating real-world physics', 'Game rules', 'Movement system', 'Collision detection'], 0, 'beginner'),
    makeQ('What is a shader?', ['Program for rendering graphics', 'A graphical effect', 'A color filter', 'A lighting system'], 0, 'intermediate'),
    makeQ('What is a tilemap?', ['A grid-based level layout', 'A map of tiles', 'A terrain system', 'A level editor'], 0, 'beginner'),
    makeQ('What is ECS architecture?', ['Entity-Component-System pattern', 'A game engine', 'A design pattern', 'A code structure'], 0, 'intermediate'),
    makeQ('What is a quaternion?', ['A 3D rotation representation', 'A 4D vector', 'A math concept', 'A rotation matrix'], 0, 'expert'),
    makeQ('What is LOD in games?', ['Level of Detail for performance', 'Level design', 'Load on demand', 'Layer of depth'], 0, 'intermediate'),
  ],
  cloud: [
    makeQ('What is cloud computing?', ['On-demand computing resources over the internet', 'Computing in the sky', 'Remote computing', 'Network computing'], 0, 'beginner'),
    makeQ('What is IaaS?', ['Infrastructure as a Service', 'Internet as a Service', 'Integration as a Service', 'Infrastructure and Services'], 0, 'beginner'),
    makeQ('What is PaaS?', ['Platform as a Service', 'Product as a Service', 'Platform and Services', 'Programming as a Service'], 0, 'beginner'),
    makeQ('What is SaaS?', ['Software as a Service', 'System as a Service', 'Software and Services', 'Solution as a Service'], 0, 'beginner'),
    makeQ('What is a virtual machine in the cloud?', ['A software emulation of a computer', 'A physical server', 'A container', 'A cloud service'], 0, 'beginner'),
    makeQ('What is auto-scaling?', ['Automatically adjusting compute resources', 'Automatic sizing', 'Cloud scaling', 'Resource adjustment'], 0, 'intermediate'),
    makeQ('What is load balancing?', ['Distributing traffic across servers', 'Loading balance', 'Traffic distribution', 'Resource balance'], 0, 'beginner'),
    makeQ('What is serverless computing?', ['Executing code without managing servers', 'No servers', 'Serverless architecture', 'Cloud functions'], 0, 'intermediate'),
    makeQ('What is object storage?', ['Storing data as objects (like S3)', 'File storage', 'Block storage', 'Database storage'], 0, 'beginner'),
    makeQ('What is a CDN?', ['Content Delivery Network', 'Cloud Data Network', 'Content Distribution Network', 'Cache Delivery Network'], 0, 'beginner'),
  ],
  aws: [
    makeQ('What is AWS?', ['Amazon Web Services', 'Amazon Web System', 'Advanced Web Services', 'Amazon Window Service'], 0, 'beginner'),
    makeQ('What is EC2 in AWS?', ['Virtual servers in the cloud', 'Compute service', 'Database service', 'Storage service'], 0, 'beginner'),
    makeQ('What is S3 in AWS?', ['Object storage service', 'Server service', 'Database service', 'Compute service'], 0, 'beginner'),
    makeQ('What is Lambda in AWS?', ['Serverless compute service', 'Database service', 'Storage service', 'Networking service'], 0, 'beginner'),
    makeQ('What is RDS in AWS?', ['Relational Database Service', 'Random Data Storage', 'Rapid Deployment Service', 'Remote Data Service'], 0, 'beginner'),
    makeQ('What is DynamoDB?', ['NoSQL database service', 'Relational database', 'Document database', 'Graph database'], 0, 'beginner'),
    makeQ('What is CloudFront?', ['CDN service', 'Compute service', 'Database service', 'Storage service'], 0, 'beginner'),
    makeQ('What is Route 53?', ['DNS service', 'Compute service', 'Database service', 'Networking service'], 0, 'beginner'),
    makeQ('What is IAM in AWS?', ['Identity and Access Management', 'Infrastructure and Monitoring', 'Instance and Application Management', 'Integration and Automation Module'], 0, 'beginner'),
    makeQ('What is VPC in AWS?', ['Virtual Private Cloud', 'Virtual Public Cloud', 'Virtual Private Connection', 'Virtual Private Computing'], 0, 'intermediate'),
  ],
  azure: [
    makeQ('What is Microsoft Azure?', ['A cloud computing platform', 'A programming language', 'An operating system', 'A database'], 0, 'beginner'),
    makeQ('What are Azure Virtual Machines?', ['IaaS compute resources', 'Cloud servers', 'Virtual instances', 'Compute VMs'], 0, 'beginner'),
    makeQ('What is Azure Blob Storage?', ['Object storage for large data', 'Database storage', 'File storage', 'Block storage'], 0, 'beginner'),
    makeQ('What is Azure Functions?', ['Serverless compute service', 'Function app', 'Cloud functions', 'Event handlers'], 0, 'beginner'),
    makeQ('What is Azure SQL Database?', ['Managed relational database', 'NoSQL database', 'Document database', 'Graph database'], 0, 'beginner'),
    makeQ('What is Azure DevOps?', ['Development and deployment tools', 'Operations tools', 'CI/CD platform', 'Project management'], 0, 'beginner'),
    makeQ('What is Azure Kubernetes Service?', ['Managed Kubernetes service', 'Container service', 'Orchestration service', 'Compute service'], 0, 'intermediate'),
    makeQ('What is Azure Active Directory?', ['Identity and access management', 'Directory service', 'Authentication service', 'User management'], 0, 'beginner'),
    makeQ('What is Azure App Service?', ['PaaS for web applications', 'Compute service', 'Web hosting', 'Application service'], 0, 'beginner'),
    makeQ('What is Azure Cosmos DB?', ['Globally distributed NoSQL database', 'Relational database', 'Document database', 'Graph database'], 0, 'intermediate'),
  ],
  gcp: [
    makeQ('What is Google Cloud Platform?', ['A suite of cloud computing services', 'A search engine', 'A programming language', 'An operating system'], 0, 'beginner'),
    makeQ('What is Compute Engine in GCP?', ['Virtual machine service', 'Compute service', 'Container service', 'Serverless service'], 0, 'beginner'),
    makeQ('What is Cloud Storage in GCP?', ['Object storage service', 'File storage', 'Database storage', 'Block storage'], 0, 'beginner'),
    makeQ('What is Cloud Functions in GCP?', ['Serverless compute service', 'Function execution', 'Event-driven computing', 'Serverless functions'], 0, 'beginner'),
    makeQ('What is Cloud SQL in GCP?', ['Managed relational database', 'NoSQL database', 'Cloud database', 'SQL service'], 0, 'beginner'),
    makeQ('What is BigQuery in GCP?', ['Data warehouse and analytics', 'Query service', 'Big data tool', 'Database service'], 0, 'intermediate'),
    makeQ('What is Google Kubernetes Engine?', ['Managed Kubernetes service', 'Container orchestration', 'GCP Kubernetes', 'Container service'], 0, 'intermediate'),
    makeQ('What is Cloud Run in GCP?', ['Serverless container platform', 'Container service', 'Serverless compute', 'Run service'], 0, 'intermediate'),
    makeQ('What is Firebase integrated with GCP?', ['Yes, Firebase is a GCP product', 'No', 'Sometimes', 'Maybe'], 0, 'beginner'),
    makeQ('What is IAM in GCP?', ['Identity and Access Management', 'Infrastructure Management', 'Instance Management', 'Integration Management'], 0, 'beginner'),
  ],
  wasm: [
    makeQ('What is WebAssembly?', ['A binary instruction format for the web', 'A JavaScript framework', 'An assembly language', 'A CSS extension'], 0, 'beginner'),
    makeQ('Can WebAssembly run in the browser?', ['Yes, in all modern browsers', 'No', 'Only in Chrome', 'Only in Firefox'], 0, 'beginner'),
    makeQ('What languages can compile to WebAssembly?', ['C, C++, Rust, Go, and more', 'Only JavaScript', 'Only Python', 'Only Assembly'], 0, 'beginner'),
    makeQ('Is WebAssembly a replacement for JavaScript?', ['No, it complements JavaScript', 'Yes', 'Sometimes', 'Only for games'], 0, 'beginner'),
    makeQ('What is a .wasm file?', ['A compiled WebAssembly binary', 'A text file', 'A JavaScript file', 'An image file'], 0, 'beginner'),
    makeQ('What is the WAT format?', ['WebAssembly Text Format', 'Web Assembly Tool', 'WASM Text', 'Web Assembly Text'], 0, 'intermediate'),
    makeQ('What is Emscripten?', ['A toolchain for compiling to WASM', 'A JavaScript library', 'A WASM runtime', 'A code editor'], 0, 'intermediate'),
    makeQ('What is WASI?', ['WebAssembly System Interface', 'WASM Interface', 'Web Assembly Interface', 'Web System Interface'], 0, 'intermediate'),
    makeQ('What is a WebAssembly module?', ['A compiled .wasm binary', 'A JavaScript module', 'A CSS module', 'An HTML module'], 0, 'beginner'),
    makeQ('Does WebAssembly have garbage collection?', ['Not natively (GC proposal in progress)', 'Yes', 'No', 'Depends on the language'], 0, 'expert'),
  ],
  asm: [
    makeQ('What is assembly language?', ['A low-level programming language', 'A high-level language', 'A scripting language', 'A markup language'], 0, 'beginner'),
    makeQ('What is a register in assembly?', ['A small storage location in CPU', 'A file', 'A variable', 'A function'], 0, 'beginner'),
    makeQ('What is x86 architecture?', ['A family of CPU instruction sets', 'An operating system', 'A programming language', 'A file format'], 0, 'beginner'),
    makeQ('What is the stack in assembly?', ['A LIFO memory structure', 'A pile of data', 'A queue', 'A file'], 0, 'beginner'),
    makeQ('What is a system call?', ['An interface to the OS kernel', 'A function call', 'A system request', 'A library call'], 0, 'intermediate'),
    makeQ('What is the instruction pointer?', ['Points to the next instruction to execute', 'A memory pointer', 'A data pointer', 'A stack pointer'], 0, 'beginner'),
    makeQ('What is NASM?', ['Netwide Assembler', 'A CPU', 'An operating system', 'A debugger'], 0, 'beginner'),
    makeQ('What is a label in assembly?', ['A named location in code', 'A variable', 'A function', 'A comment'], 0, 'beginner'),
    makeQ('What is a MOV instruction?', ['Moves data between locations', 'Moves files', 'Moves memory', 'Moves registers'], 0, 'beginner'),
    makeQ('What is an interrupt in assembly?', ['A signal to CPU for attention', 'A break in code', 'A program stop', 'An error'], 0, 'intermediate'),
  ],
  backend: [
    makeQ('What is a REST API?', ['An API using HTTP methods for CRUD', 'A database API', 'A web service', 'A protocol'], 0, 'beginner'),
    makeQ('What is an HTTP method?', ['GET, POST, PUT, DELETE', 'A protocol', 'A status code', 'A header'], 0, 'beginner'),
    makeQ('What is a server?', ['A computer that serves resources', 'A program', 'A database', 'A network'], 0, 'beginner'),
    makeQ('What is a client?', ['A requester of services', 'A server', 'A database', 'A network'], 0, 'beginner'),
    makeQ('What is a database?', ['Persistent data storage', 'A file', 'A program', 'A server'], 0, 'beginner'),
    makeQ('What is authentication?', ['Verifying user identity', 'Authorization', 'Encryption', 'Validation'], 0, 'beginner'),
    makeQ('What is authorization?', ['Determining user permissions', 'Authentication', 'Identity check', 'Access control'], 0, 'beginner'),
    makeQ('What is middleware?', ['Software between request and response', 'A database', 'A server', 'A library'], 0, 'beginner'),
    makeQ('What is a session?', ['Server-side user state', 'A login', 'A cookie', 'A request'], 0, 'beginner'),
    makeQ('What is a JWT?', ['JSON Web Token', 'JavaScript Web Tool', 'Java Web Token', 'JSON Web Tool'], 0, 'beginner'),
    makeQ('What is CORS?', ['Cross-Origin Resource Sharing', 'Cross-Origin Request Security', 'Content Origin Resource Sharing', 'Cross-Origin Response Service'], 0, 'intermediate'),
    makeQ('What is rate limiting?', ['Limiting API request frequency', 'Speed limit', 'Request limit', 'Data limit'], 0, 'intermediate'),
    makeQ('What is caching?', ['Storing frequently accessed data', 'Hiding data', 'Encrypting data', 'Compressing data'], 0, 'beginner'),
    makeQ('What is a webhook?', ['HTTP callback for events', 'A web hook', 'An API endpoint', 'A web service'], 0, 'intermediate'),
    makeQ('What is GraphQL?', ['A query language for APIs', 'A database', 'A server', 'A framework'], 0, 'intermediate'),
    makeQ('What is a microservice?', ['A small, independent service', 'A small server', 'A micro app', 'A component'], 0, 'intermediate'),
    makeQ('What is an ORM?', ['Object-Relational Mapping', 'Object Resource Model', 'Object-Request Mapping', 'Online Resource Manager'], 0, 'intermediate'),
    makeQ('What is a connection pool?', ['Reusable database connections', 'A pool of connections', 'A network pool', 'A server pool'], 0, 'intermediate'),
    makeQ('What is horizontal scaling?', ['Adding more servers', 'Upgrading server hardware', 'Adding storage', 'Optimizing code'], 0, 'intermediate'),
    makeQ('What is vertical scaling?', ['Upgrading server hardware', 'Adding more servers', 'Adding storage', 'Optimizing code'], 0, 'beginner'),
    makeQ('What is a load balancer?', ['Distributes traffic across servers', 'Balances load', 'Traffic manager', 'Server selector'], 0, 'beginner'),
    makeQ('What is a reverse proxy?', ['Server that forwards client requests', 'A proxy server', 'A forward proxy', 'A web server'], 0, 'intermediate'),
    makeQ('What is a CDN?', ['Content Delivery Network', 'Content Distribution Network', 'Cache Delivery Network', 'Cloud Data Network'], 0, 'beginner'),
    makeQ('What is WebSocket?', ['A bidirectional communication protocol', 'A web socket', 'An HTTP protocol', 'A TCP protocol'], 0, 'intermediate'),
    makeQ('What is TLS/SSL?', ['Encryption protocol for secure communication', 'Transport Layer Security', 'A security certificate', 'A network protocol'], 0, 'intermediate'),
    makeQ('What is an API gateway?', ['Single entry point for APIs', 'A gateway server', 'An API manager', 'A proxy server'], 0, 'intermediate'),
    makeQ('What is CI/CD?', ['Continuous Integration/Continuous Deployment', 'Code Integration/Code Deployment', 'Continuous Improvement/Continuous Delivery', 'Code Implementation/Code Distribution'], 0, 'intermediate'),
    makeQ('What is Docker used for in backend?', ['Containerizing applications', 'Virtualization', 'Deployment', 'Orchestration'], 0, 'beginner'),
    makeQ('What is a NoSQL database?', ['Non-relational database', 'No SQL database', 'Not only SQL', 'Non-query database'], 0, 'beginner'),
    makeQ('What is indexing in databases?', ['Speeds up data retrieval', 'Creating an index', 'Organizing data', 'Sorting data'], 0, 'intermediate'),
    makeQ('What is a message queue?', ['Async communication between services', 'A queue of messages', 'A data structure', 'A communication tool'], 0, 'intermediate'),
    makeQ('What is a worker process?', ['Background task processor', 'A server process', 'A thread', 'A job'], 0, 'intermediate'),
    makeQ('What is logging in backend?', ['Recording application events', 'Writing logs', 'Monitoring', 'Debugging'], 0, 'beginner'),
    makeQ('What is monitoring?', ['Tracking system health and performance', 'Watching servers', 'Observing metrics', 'System observation'], 0, 'intermediate'),
    makeQ('What is a cron job?', ['Scheduled task', 'A job scheduler', 'A time-based task', 'A repeated job'], 0, 'beginner'),
    makeQ('What is environment variable?', ['Configuration value outside code', 'A variable', 'System variable', 'Config setting'], 0, 'beginner'),
    makeQ('What is a database migration?', ['Schema changes over time', 'Moving databases', 'Data transfer', 'Database copy'], 0, 'intermediate'),
    makeQ('What is a transaction in databases?', ['Group of operations as a unit', 'Data transfer', 'Query execution', 'Data change'], 0, 'beginner'),
    makeQ('What is the HTTP status code 404?', ['Not Found', 'OK', 'Server Error', 'Forbidden'], 0, 'beginner'),
    makeQ('What is the HTTP status code 500?', ['Internal Server Error', 'OK', 'Not Found', 'Bad Request'], 0, 'beginner'),
    makeQ('What is the HTTP status code 401?', ['Unauthorized', 'OK', 'Not Found', 'Forbidden'], 0, 'beginner'),
    makeQ('What is the HTTP status code 403?', ['Forbidden', 'OK', 'Not Found', 'Unauthorized'], 0, 'beginner'),
    makeQ('What is the HTTP status code 200?', ['OK', 'Created', 'Not Found', 'Redirect'], 0, 'beginner'),
    makeQ('What is the HTTP status code 201?', ['Created', 'OK', 'Not Found', 'Redirect'], 0, 'beginner'),
    makeQ('What is the HTTP status code 301?', ['Redirect (permanent)', 'OK', 'Not Found', 'Forbidden'], 0, 'beginner'),
    makeQ('What is the HTTP status code 400?', ['Bad Request', 'OK', 'Not Found', 'Server Error'], 0, 'beginner'),
  ],
  lua: [
    makeQ('What is Lua primarily used for?', ['Embedded scripting in applications', 'Web development', 'Mobile apps', 'Operating systems'], 0, 'beginner'),
    makeQ('What is a table in Lua?', ['The main data structure', 'A list', 'An array', 'A dictionary'], 0, 'beginner'),
    makeQ('How are arrays indexed in Lua?', ['Starting at 1', 'Starting at 0', 'Starting at -1', 'No index'], 0, 'beginner'),
    makeQ('What is `nil` in Lua?', ['Represents no value', 'Zero', 'Empty string', 'False'], 0, 'beginner'),
    makeQ('What is a metatable in Lua?', ['Customizes behavior of tables', 'A meta table', 'A parent table', 'A class'], 0, 'intermediate'),
    makeQ('What is `__index` in Lua metatables?', ['Fallback for missing keys', 'Index operation', 'Table index', 'Array index'], 0, 'intermediate'),
    makeQ('What is a coroutine in Lua?', ['Cooperative multitasking', 'A function', 'A thread', 'A loop'], 0, 'intermediate'),
    makeQ('What does `#` operator do on a table in Lua?', ['Returns length of array part', 'Returns size', 'Returns count', 'Returns index'], 0, 'beginner'),
    makeQ('What is `ipairs` in Lua?', ['Iterates over array part', 'Iterates over pairs', 'Iterates over keys', 'Iterates over values'], 0, 'beginner'),
    makeQ('What is `pairs` in Lua?', ['Iterates over all key-value pairs', 'Iterates over pairs', 'Iterates over array', 'Iterates over keys'], 0, 'beginner'),
    makeQ('What is a closure in Lua?', ['Function with upvalues from outer scope', 'A closed function', 'A block', 'A variable'], 0, 'intermediate'),
    makeQ('What does `require` do in Lua?', ['Loads a module', 'Requires a file', 'Imports code', 'Includes library'], 0, 'beginner'),
  ],
};

// Helper to build quizzes for each language
function buildGenerator(lang, specs) {
  return (n) => {
    const generic = generateGenericQuizzes(lang, lang, 60);
    const specific = specs || [];
    const combined = shuffle([...generic, ...specific]);
    // Assign levels
    return combined.slice(0, n).map((q, i) => ({
      ...q,
      level: q.level || (i < n * 0.35 ? 'beginner' : i < n * 0.7 ? 'intermediate' : 'expert')
    }));
  };
}

// Build full generator map
const generators = { ...specGenerators };
for (const lang of Object.keys(langSpecs)) {
  if (!generators[lang]) {
    generators[lang] = buildGenerator(lang, langSpecs[lang]);
  }
}

const genericLangs = ['lua', 'sql']; // Add more here if needed
for (const lang of genericLangs) {
  if (!generators[lang]) {
    generators[lang] = (n) => {
      const pool = generateGenericQuizzes(lang, lang, 60);
      return shuffle(pool).slice(0, n).map((q, i) => ({
        ...q,
        level: i < n * 0.35 ? 'beginner' : i < n * 0.7 ? 'intermediate' : 'expert'
      }));
    };
  }
}

// ── Main ──
function main() {
  const quizData = appData.quizData || {};
  
  for (const [lang, gen] of Object.entries(generators)) {
    const current = quizData[lang] || [];
    const missing = TARGET - current.length;
    if (missing <= 0) {
      console.log(`${lang}: already ${current.length} quizzes (>= ${TARGET})`);
      continue;
    }
    console.log(`${lang}: generating ${missing} new quizzes (currently ${current.length})...`);
    const newQuizzes = gen(missing);
    quizData[lang] = [...current, ...newQuizzes];
    console.log(`  → ${quizData[lang].length} total`);
  }

  appData.quizData = quizData;

  // Sort entries
  for (const lang of Object.keys(quizData)) {
    quizData[lang].sort((a, b) => {
      const order = { beginner: 0, intermediate: 1, expert: 2 };
      return (order[a.level] || 0) - (order[b.level] || 0);
    });
  }

  const json = JSON.stringify(appData, null, 2);
  fs.writeFileSync(DATA_FILE, json, 'utf-8');
  console.log(`\nDone! Updated app-data.json with new quizzes. (${(json.length / 1024 / 1024).toFixed(1)} MB)`);
}

main();
