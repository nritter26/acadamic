courseData.js = {
        "Fundamentals": {
            "What is JavaScript": { exp: "Discover JavaScript as the language of the web, running in browsers and on servers. Learn how it is used to create dynamic interactions, applications, and page logic.", code: "console.log('Hello JavaScript');" },
            "Syntax & Comments": { exp: "Get comfortable with JavaScript syntax, statements, comments, and how to organize code into clean, readable blocks.", code: "// This is a single line comment\n/* This is a multi-line comment */\nlet answer = 42;" },
            "Strict Mode": { exp: "Use 'use strict' to enable a safer, more predictable subset of JavaScript behavior and avoid common silent errors.", code: "'use strict';\nfunction check() {\n  x = 5; // ReferenceError in strict mode\n}" },
            "Statements & Blocks": { exp: "Learn how statement groups and block scope work with braces, and why grouping code carefully helps avoid bugs.", code: "if (true) {\n  let count = 1;\n  console.log(count);\n}" }
        },
        "Variables & Types": {
            "var let const": { exp: "Choose between var, let, and const. Understand global scope, function scope, and block scope behavior.", code: "var oldStyle = 1;\nlet modern = 2;\nconst fixed = 3;" },
            "Primitive Types": { exp: "Review JavaScript primitive types including string, number, bigint, boolean, null, undefined, and symbol.", code: "console.log(typeof 'text');\nconsole.log(typeof 123);\nconsole.log(typeof true);" },
            "Reference Types": { exp: "Understand reference types like objects, arrays, and functions, and how they are stored by reference rather than by value.", code: "let obj = { name: 'Doge' };\nlet copy = obj;\ncopy.name = 'Buddy';\nconsole.log(obj.name);" },
            "Truthy & Falsy": { exp: "Learn which values are treated as true or false in boolean contexts and why this matters in conditions.", code: "console.log(Boolean(0));\nconsole.log(Boolean(''));\nconsole.log(Boolean([]));" },
            "Type Conversion": { exp: "See how JavaScript converts values automatically between strings, numbers, and booleans, and how to control it explicitly.", code: "console.log('5' + 1);\nconsole.log('5' - 1);\nconsole.log(Number('10'));" },
            "Template Literals": { exp: "Use template strings for cleaner multi-line text and embedded expressions.", code: "const name = 'Doge';\nconsole.log(`Hello ${name}!`);" },
            "null vs undefined": { exp: "undefined means a variable has been declared but not assigned. null is an intentional absence of any object value, assigned explicitly.", code: "let a;\nlet b = null;\nconsole.log(a);\nconsole.log(b);\nconsole.log(typeof null);\nconsole.log(typeof undefined);" },
            "Symbol & BigInt": { exp: "Symbol creates unique, immutable identifiers for object properties. BigInt represents integers beyond Number.MAX_SAFE_INTEGER using n suffix.", code: "const sym = Symbol('id');\nconst obj = { [sym]: 'secret' };\nconsole.log(obj[sym]);\n\nconst big = 9007199254740991n;\nconsole.log(big + 1n);" }
        },
        "Operators": {
            "Arithmetic Operators": { exp: "Perform math with addition, subtraction, multiplication, division, remainder, exponentiation, and unary operators.", code: "console.log(1 + 2);\nconsole.log(2 ** 3);\nlet count = 0;\nconsole.log(++count);" },
            "Comparison Operators": { exp: "Compare values using greater/less than and equality operators, including strict equality for safer checks.", code: "console.log(5 > 2);\nconsole.log(5 === '5');" },
            "Logical Operators": { exp: "Combine Boolean expressions using AND, OR, and NOT, and learn short-circuit evaluation.", code: "console.log(true && false);\nconsole.log(false || true);" },
            "Assignment Operators": { exp: "Use compound assignments to update values concisely with +=, -=, *=, /=, and more.", code: "let a = 10;\na += 5;\nconsole.log(a);" },
            "Ternary Operator": { exp: "Write compact conditional expressions using the ? : operator for simple branches.", code: "const label = score >= 60 ? 'Pass' : 'Fail';" },
            "Spread & Rest": { exp: "Spread expands iterables and rest collects arguments or array leftovers into variables.", code: "const nums = [1, 2, 3];\nconst copy = [...nums];\nfunction combine(...values) { return values; }" }
        },
        "Control Flow": {
            "If Else": { exp: "Make decisions with if, else if, and else blocks using boolean logic.", code: "if (score >= 90) {\n  console.log('A');\n} else {\n  console.log('Not A');\n}" },
            "Switch Statement": { exp: "Use switch for multi-case branching when comparing the same expression to several values.", code: "switch (status) {\n  case 'ok':\n    console.log('OK');\n    break;\n  default:\n    console.log('Unknown');\n}" },
            "for Loops": { exp: "Repeat actions for a fixed number of iterations and iterate over arrays, strings, and collections.", code: "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}" },
            "while & do while": { exp: "Execute loops while a condition stays true, and use do...while to run at least once.", code: "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n  i++;\n}" },
            "break & continue": { exp: "Exit loops early with break or skip the current iteration with continue.", code: "for (const n of [1, 2, 3]) {\n  if (n === 2) continue;\n  console.log(n);\n}" },
            "Error Handling": { exp: "Catch runtime exceptions with try/catch/finally and throw custom errors for invalid states.", code: "try {\n  throw new Error('Oops');\n} catch (e) {\n  console.error(e.message);\n}" }
        },
        "Functions": {
            "Function Declarations": { exp: "Define reusable named functions and understand hoisting differences.", code: "function greet(name) {\n  return 'Hello ' + name;\n}" },
            "Function Expressions": { exp: "Assign functions to variables and pass them as values.", code: "const greet = function(name) {\n  return 'Hello ' + name;\n};" },
            "Arrow Functions": { exp: "Use arrow functions for concise syntax and lexical this binding.", code: "const add = (a, b) => a + b;" },
            "Default Parameters": { exp: "Provide defaults for arguments when they are omitted.", code: "function log(message = 'Empty') {\n  console.log(message);\n}" },
            "Rest Parameters": { exp: "Gather variable numbers of arguments into an array.", code: "function sum(...values) {\n  return values.reduce((total, value) => total + value, 0);\n}" },
            "Closures": { exp: "Capture outer variables inside inner functions to create private state.", code: "function counter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nconst next = counter();\nconsole.log(next());" }
        },
        "Objects & Classes": {
            "Objects": { exp: "Store keyed values inside object literals and access them dynamically.", code: "const dog = { name: 'Doge', age: 5 };\nconsole.log(dog.name);" },
            "This Keyword": { exp: "Understand how this behaves differently in methods, callbacks, and arrow functions.", code: "const obj = {\n  name: 'Doge',\n  speak() {\n    console.log(this.name);\n  }\n};\nobj.speak();" },
            "Prototypes": { exp: "Explore prototype inheritance and how shared behavior is resolved through the prototype chain.", code: "function Animal(name) {\n  this.name = name;\n}\nAnimal.prototype.speak = function() {\n  console.log(this.name + ' speaks');\n};" },
            "Classes": { exp: "Write modern class syntax for constructors, methods, and inheritance with extends and super.", code: "class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    console.log(this.name);\n  }\n}\nclass Dog extends Animal {}" },
            "Inheritance": { exp: "Share behavior across related classes and override methods in subclasses.", code: "class Dog extends Animal {\n  speak() {\n    super.speak();\n    console.log('Woof');\n  }\n}" },
            "Getters & Setters": { exp: "Control property access with computed getters and setters.", code: "class Person {\n  constructor(name) {\n    this._name = name;\n  }\n  get name() { return this._name; }\n  set name(value) { this._name = value; }\n}" }
        },
        "Arrays & Collections": {
            "Arrays": { exp: "Work with ordered lists, indexing, and mutating arrays.", code: "const numbers = [1, 2, 3];\nnumbers.push(4);\nconsole.log(numbers[0]);" },
            "Array Methods": { exp: "Process arrays using map, filter, reduce, find, and sort.", code: "const evens = numbers.filter(n => n % 2 === 0);\nconsole.log(evens);" },
            "Destructuring": { exp: "Extract values from arrays and objects into variables.", code: "const [a, b] = [1, 2];\nconst { name } = { name: 'Doge' };" },
            "Map & Set": { exp: "Use Map for keyed collections and Set for unique values.", code: "const map = new Map([['a', 1]]);\nconst set = new Set([1, 2, 2]);" },
            "WeakMap & WeakSet": { exp: "Store objects weakly so garbage collection can clean up unused entries.", code: "const wm = new WeakMap();\nconst obj = {};\nwm.set(obj, 'meta');" },
            "Iterators & Generators": { exp: "Build custom iteration behavior using iterators and generator functions.", code: "function* gen() { yield 1; yield 2; }\nfor (const value of gen()) console.log(value);" }
        },
        "DOM & Browser APIs": {
            "DOM Manipulation": { exp: "Select elements, update attributes, and modify page content through the document object.", code: "const el = document.querySelector('body');\nel.style.background = '#020617';" },
            "Events": { exp: "Handle user input with event listeners like click, keypress, and submit.", code: "document.addEventListener('click', () => console.log('clicked'));" },
            "Forms & Validation": { exp: "Read form values, prevent submission, and validate input before sending data.", code: "const input = document.querySelector('input');\nconsole.log(input.value);" },
            "Fetch API": { exp: "Load remote resources, parse JSON, and handle request responses.", code: "fetch('/api/data')\n  .then(r => r.json())\n  .then(data => console.log(data));" },
            "Local Storage": { exp: "Persist small amounts of browser data using localStorage and sessionStorage.", code: "localStorage.setItem('key', 'value');\nconsole.log(localStorage.getItem('key'));" },
            "Timers": { exp: "Schedule work with setTimeout and setInterval, and cancel timers when needed.", code: "const id = setTimeout(() => console.log('later'), 1000);\nclearTimeout(id);" }
        },
        "Async JavaScript": {
            "Promises": { exp: "Model eventual values with promises and chain asynchronous operations cleanly.", code: "Promise.resolve('done').then(console.log);" },
            "Async/Await": { exp: "Write asynchronous code in synchronous style and await promise results inside async functions.", code: "async function load() {\n  const result = await Promise.resolve('hello');\n  console.log(result);\n}" },
            "Fetch & HTTP": { exp: "Make HTTP requests and handle responses using fetch, including JSON parsing.", code: "async function request() {\n  const resp = await fetch('https://api.example.com');\n  const json = await resp.json();\n  console.log(json);\n}" },
            "Event Loop": { exp: "Understand task queues, microtasks, and how async callbacks are scheduled after the current stack completes.", code: "console.log('start');\nPromise.resolve().then(() => console.log('micro'));\nconsole.log('end');" },
            "Web Workers": { exp: "Run expensive work off the main thread with Web Workers for smoother UI performance.", code: "// worker.js\nself.postMessage('done');" },
            "Async Iteration": { exp: "Consume asynchronous streams with for await...of and build async iterators.", code: "async function* asyncGen() {\n  yield 1;\n}\nfor await (const item of asyncGen()) console.log(item);" }
        },
        "Modern JavaScript": {
            "ES Modules": { exp: "Share code with import/export syntax, and run modules in modern browsers or bundlers.", code: "export function hello() { return 'hi'; }\nimport { hello } from './module.js';" },
            "Spread Syntax": { exp: "Expand iterable values into arrays or function calls, and merge object properties effortlessly.", code: "const copy = [...[1, 2]];\nconst merged = { ...{ a: 1 }, b: 2 };" },
            "Optional Chaining": { exp: "Safely access deeply nested values without throwing when a property is missing.", code: "console.log(user?.profile?.email);" },
            "Nullish Coalescing": { exp: "Provide a default value only when a variable is null or undefined.", code: "const value = input ?? 'default';" },
            "Dynamic Import": { exp: "Load modules on demand using import() for lazy loading and better performance.", code: "import('./module.js').then(mod => console.log(mod));" },
            "Promise Combinators": { exp: "Coordinate multiple promises with Promise.all, Promise.race, allSettled, and any.", code: "Promise.all([p1, p2]).then(results => console.log(results));" }
        },
        "Frameworks & Tools": {
            "React": { exp: "Learn the core concepts of React: components, props, state, and declarative rendering.", code: "function App() { return React.createElement('div', null, 'Hello React'); }" },
            "Vue": { exp: "Explore Vue's reactive templates, computed state, and component-based architecture.", code: "const app = Vue.createApp({ data() { return { title: 'Vue' }; } });" },
            "Express": { exp: "Build Node.js servers, routes, and middleware for backend APIs.", code: "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Hello Express'));" },
            "Next.js": { exp: "Create server-side rendered React apps with file-based routing and API routes.", code: "export default function Home() { return <h1>Home</h1>; }" },
            "NestJS": { exp: "Use a structured server framework with controllers, modules, providers, and dependency injection.", code: "import { Controller, Get } from '@nestjs/common';\n@Controller()\nexport class AppController {\n  @Get()\n  getHello() { return 'Hello Nest'; }\n}" },
            "Vite": { exp: "Set up a modern development environment with fast hot module replacement and build optimization.", code: "npm create vite@latest my-app -- --template vanilla" }
        },
        "Built-in Objects": {
            "JSON": { exp: "JSON.parse converts JSON strings to objects; JSON.stringify serializes objects to JSON strings. Essential for data exchange.", code: "const data = { name: 'Doge', age: 5 };\nconst json = JSON.stringify(data);\nconsole.log(json);\nconst parsed = JSON.parse(json);\nconsole.log(parsed.name);" },
            "Math & Number": { exp: "Math provides constants and functions like random, floor, round, max, min. Number offers parseInt, parseFloat, isNaN, and isFinite.", code: "console.log(Math.PI);\nconsole.log(Math.random());\nconsole.log(Math.floor(3.9));\nconsole.log(Number.parseInt('42'));\nconsole.log(Number.isNaN(NaN));" },
            "Date & Time": { exp: "Date handles date/time operations: creation, formatting, and arithmetic. Months are zero-indexed (0 = January).", code: "const now = new Date();\nconsole.log(now.toISOString());\nconst later = new Date();\nlater.setDate(later.getDate() + 7);\nconsole.log(later.toDateString());\nconsole.log(Date.now());" },
            "String Methods": { exp: "Strings have built-in methods for manipulation: slice, split, replace, toUpperCase, trim, includes, and repeat.", code: "const str = 'Hello, World!';\nconsole.log(str.slice(0, 5));\nconsole.log(str.split(', '));\nconsole.log(str.replace('World', 'Doge'));\nconsole.log('  hi  '.trim().toUpperCase());\nconsole.log('abc'.includes('b'));" },
            "Proxy & Reflect": { exp: "Proxy wraps an object to intercept operations (get, set, delete, etc.) via traps. Reflect provides methods that mirror the default proxy behavior for forwarding.", code: "const handler = {\n  get(target, prop) {\n    return prop in target ? target[prop] : `No ${prop}`;\n  }\n};\nconst p = new Proxy({ name: 'Doge' }, handler);\nconsole.log(p.name);\nconsole.log(p.age);" },
            "Intl API": { exp: "Intl provides locale-aware formatting for dates, numbers, currencies, and collation. Intl.DateTimeFormat, NumberFormat, and ListFormat are the most common.", code: "const date = new Date();\nconst df = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full' });\nconsole.log(df.format(date));\n\nconst nf = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });\nconsole.log(nf.format(1234.56));" },
            "TypedArrays (ArrayBuffer)": { exp: "TypedArrays provide views over raw binary data in an ArrayBuffer. Types include Int8Array, Uint8Array, Float64Array, and more for performance-critical work.", code: "const buf = new ArrayBuffer(16);\nconst view = new Float64Array(buf);\nview[0] = 3.14159;\nconsole.log(view[0]);\n// Also useful for WebSocket/WebRTC binary protocols" },
            "structuredClone & Deep Copy": { exp: "structuredClone creates a deep copy of an object, handling circular references and types like Date, Map, Set, ArrayBuffer, and Blob.", code: "const original = { name: 'Doge', tags: ['cool', 'fun'], meta: { created: new Date() } };\nconst clone = structuredClone(original);\nclone.tags.push('smart');\nconsole.log(original.tags);\nconsole.log(clone.tags);" }
        }
    };
