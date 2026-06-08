export const TUTORIAL_COURSES = [
  {
    id: 'js',
    title: 'JavaScript',
    summary: 'Learn JavaScript from the ground up — variables, control flow, functions, objects, and browser APIs.',
    lang: 'js',
    icon: '/public/logos/js.svg',
    phases: [
      {
        id: 'fundamentals',
        title: 'Fundamentals',
        topics: [
          'What is JavaScript',
          'Syntax & Comments',
          'Strict Mode',
          'Statements & Blocks',
        ],
      },
      {
        id: 'variables-types',
        title: 'Variables & Types',
        topics: [
          'var let const',
          'Primitive Types',
          'Reference Types',
          'Truthy & Falsy',
          'Type Conversion',
          'Template Literals',
          'null vs undefined',
          'Symbol & BigInt',
        ],
      },
      {
        id: 'operators',
        title: 'Operators',
        topics: [
          'Arithmetic Operators',
          'Comparison Operators',
          'Logical Operators',
          'Assignment Operators',
          'Ternary Operator',
          'Spread & Rest',
        ],
      },
      {
        id: 'control-flow',
        title: 'Control Flow',
        topics: [
          'If Else',
          'Else If',
          'Switch Statement',
          'for Loops',
          'while & do while',
          'break & continue',
          'Error Handling',
        ],
      },
      {
        id: 'functions',
        title: 'Functions',
        topics: [
          'Function Declarations',
          'Function Expressions',
          'Arrow Functions',
          'Default Parameters',
          'Rest Parameters',
          'Closures',
        ],
      },
      {
        id: 'objects-classes',
        title: 'Objects & Classes',
        topics: [
          'Objects',
          'This Keyword',
          'Prototypes',
          'Classes',
          'Inheritance',
          'Getters & Setters',
        ],
      },
      {
        id: 'arrays-collections',
        title: 'Arrays & Collections',
        topics: [
          'Arrays',
          'Array Methods',
          'Destructuring',
          'Map & Set',
          'WeakMap & WeakSet',
          'Iterators & Generators',
        ],
      },
      {
        id: 'dom-apis',
        title: 'DOM & Browser APIs',
        topics: [
          'DOM Manipulation',
          'Events',
          'Forms & Validation',
          'Fetch API',
          'Local Storage',
          'Timers',
        ],
      },
    ],
  },
];

export const TUTORIAL_QUIZZES = {
  'js:fundamentals': [
    {
      question: 'What does `typeof null` return?',
      options: ['null', 'undefined', 'object', 'boolean'],
      answer: 2,
      explanation: 'typeof null returns "object" — a known JavaScript bug since version 1.',
    },
    {
      question: 'Which of these is NOT a valid variable declaration?',
      options: ['var x = 1;', 'let x = 1;', 'const x = 1;', 'new x = 1;'],
      answer: 3,
      explanation: 'new x = 1; is not valid syntax. Variables are declared with var, let, or const.',
    },
  ],
  'js:variables-types': [
    {
      question: 'Which of the following is falsy in JavaScript?',
      options: ['[]', '{}', '""', '"false"'],
      answer: 2,
      explanation: 'Only 7 values are falsy: false, 0, -0, 0n, "", null, undefined, NaN. Empty arrays [] and objects {} are truthy.',
    },
    {
      question: 'What is the result of `5 === "5"`?',
      options: ['true', 'false', 'TypeError', 'undefined'],
      answer: 1,
      explanation: '=== is strict equality — no type coercion. 5 (number) is not the same type as "5" (string), so it returns false.',
    },
  ],
  'js:operators': [
    {
      question: 'What does `console.log(0 || 42)` print?',
      options: ['0', '42', 'true', 'false'],
      answer: 1,
      explanation: '|| returns the first truthy value. 0 is falsy, so it evaluates and returns 42.',
    },
    {
      question: 'What is the result of `10 + "2"`?',
      options: ['12', '"12"', '102', '"102"'],
      answer: 1,
      explanation: 'When one operand is a string, + performs string concatenation. 10 is coerced to "10", resulting in "102".',
    },
  ],
  'js:control-flow': [
    {
      question: 'What does `break` do inside a loop?',
      options: ['Skips the current iteration', 'Exits the loop entirely', 'Restarts the loop', 'Throws an error'],
      answer: 1,
      explanation: 'break exits the loop immediately. continue skips the current iteration only.',
    },
    {
      question: 'What happens if you forget `break` in a switch case?',
      options: ['Syntax error', 'The switch throws an error', 'Execution falls through to the next case', 'The case is skipped'],
      answer: 2,
      explanation: 'Without break, execution falls through to the next case — this is called "fall-through" and is sometimes intentional but often a bug.',
    },
  ],
  'js:functions': [
    {
      question: 'What is a closure?',
      options: [
        'A function that returns another function',
        'A function that remembers variables from its outer scope even after the outer function returns',
        'A function with no parameters',
        'A function that only runs once',
      ],
      answer: 1,
      explanation: 'A closure is a function that retains access to its outer (enclosing) scope\'s variables even after the outer function has finished executing.',
    },
    {
      question: 'Are arrow functions hoisted?',
      options: ['Yes, like function declarations', 'No, they are not hoisted', 'Only if assigned with var', 'Only in strict mode'],
      answer: 1,
      explanation: 'Arrow functions are function expressions, not declarations. They follow variable hoisting rules — a const/let arrow function is in the TDZ until the declaration line.',
    },
  ],
  'js:objects-classes': [
    {
      question: 'What does `this` refer to in a regular function called as obj.method()?',
      options: ['The global object', 'undefined', 'The object the method was called on', 'The function itself'],
      answer: 2,
      explanation: 'When a function is called as a method (obj.method()), this refers to the object the method was called on.',
    },
    {
      question: 'What must you call in a subclass constructor before using `this`?',
      options: ['this.init()', 'super()', 'parent()', 'Object.create(this)'],
      answer: 1,
      explanation: 'super() must be called in a subclass constructor before accessing this, or a ReferenceError is thrown.',
    },
  ],
  'js:arrays-collections': [
    {
      question: 'Which method creates a new array with elements that pass a test?',
      options: ['map()', 'filter()', 'reduce()', 'forEach()'],
      answer: 1,
      explanation: 'filter() creates a new array with all elements that pass the test implemented by the provided function.',
    },
    {
      question: 'What key type does Map accept that plain objects do not?',
      options: ['Strings', 'Numbers', 'Objects', 'All of the above'],
      answer: 2,
      explanation: 'Map accepts any value as a key — including objects, functions, and primitives. Plain objects only accept strings and symbols as keys.',
    },
  ],
  'js:dom-apis': [
    {
      question: 'Which method is the safest way to set text content and avoid XSS?',
      options: ['innerHTML', 'textContent', 'outerHTML', 'insertAdjacentHTML'],
      answer: 1,
      explanation: 'textContent sets text safely — it does not parse HTML. innerHTML and insertAdjacentHTML parse HTML and can introduce XSS vulnerabilities.',
    },
    {
      question: 'What does `fetch()` return?',
      options: ['A Promise that resolves to JSON', 'A Promise that resolves to a Response object', 'The response data directly', 'An XMLHttpRequest object'],
      answer: 1,
      explanation: 'fetch() returns a Promise that resolves to a Response object. You must call .json() or .text() on the Response to get the actual data.',
    },
  ],
};
