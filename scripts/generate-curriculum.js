/**
 * Comprehensive Curriculum Generator
 * Expands all 68+ curriculum content files with more phases, topics, and explanations.
 * Reads existing curriculum data and fills gaps to create complete curricula.
 *
 * Usage: node scripts/generate-curriculum.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'backend', 'content');

// ── Comprehensive curriculum definitions per language/tab ──
// Each entry defines the complete ideal curriculum: phases and their topics.

const CURRICULA = {
  // ── Programming Languages ──
  js: {
    'Fundamentals': {
      'Variables': ['Variables are containers for storing data values.', 'let x = 5;', []],
      'Data Types': ['JavaScript has dynamic types: string, number, boolean, null, undefined, object, symbol, bigint.', 'let name = "Alice"; let age = 30; let isStudent = true;', []],
      'Operators': ['Operators perform operations on variables and values.', 'let sum = 10 + 5; let isEqual = (x === y);', []],
      'Control Flow': ['Control flow statements control the execution order of code.', 'if (x > 0) { console.log("Positive"); } else { console.log("Non-positive"); }', []],
      'Loops': ['Loops repeat code execution based on conditions.', 'for (let i = 0; i < 5; i++) { console.log(i); }', []],
      'Functions': ['Functions are reusable blocks of code.', 'function greet(name) { return "Hello " + name; }', []],
      'Comments': ['Comments explain code and are ignored during execution.', '// This is a single-line comment\n/* This is a multi-line comment */', []],
      'Strict Mode': ['Strict mode catches common coding errors.', '"use strict"; x = 3.14; // Error', []],
    },
    'Strings & Numbers': {
      'String Methods': ['Strings have built-in methods for manipulation.', '"Hello".toUpperCase(); "Hello".length;', []],
      'Template Literals': ['Template literals allow embedded expressions.', 'let name = "World"; console.log(`Hello ${name}`);', []],
      'Number Methods': ['Numbers have built-in methods and properties.', 'Math.round(4.7); Number.isInteger(5);', []],
      'Math Object': ['The Math object provides mathematical constants and functions.', 'Math.random(); Math.floor(4.7); Math.pow(2, 3);', []],
      'Type Conversion': ['JavaScript can convert between types implicitly or explicitly.', 'String(123); Number("456"); Boolean(0);', []],
      'Number Precision': ['Floating-point numbers have precision limitations.', 'console.log(0.1 + 0.2); // 0.30000000000000004', []],
    },
    'Arrays & Collections': {
      'Array Methods': ['Arrays have powerful built-in methods.', '[1,2,3].push(4); [1,2,3].map(x => x*2);', []],
      'Array Iteration': ['Arrays can be iterated with forEach, map, filter, reduce.', 'arr.filter(x => x > 5).map(x => x * 2);', []],
      'Sets': ['Sets store unique values of any type.', 'let set = new Set([1,2,3,3]); // {1,2,3}', []],
      'Maps': ['Maps store key-value pairs with any type keys.', 'let map = new Map(); map.set("key", "value");', []],
      'Destructuring': ['Destructuring unpacks values from arrays or objects.', 'let [a, b] = [1, 2]; let {name, age} = person;', []],
      'Spread Operator': ['The spread operator expands iterables into elements.', 'let arr = [...arr1, ...arr2]; let obj = {...obj1, ...obj2};', []],
      'JSON Methods': ['JSON.parse() and JSON.stringify() convert between JSON and objects.', 'JSON.parse(\'{"a":1}\'); JSON.stringify({a:1});', []],
    },
    'Objects & OOP': {
      'Object Basics': ['Objects are collections of key-value pairs.', 'let person = {name: "Alice", age: 30};', []],
      'Prototypes': ['JavaScript uses prototypal inheritance.', 'function Person(name) { this.name = name; }\nPerson.prototype.greet = function() { return "Hi " + this.name; };', []],
      'Classes': ['ES6 classes provide a cleaner syntax for OOP.', 'class Animal { constructor(name) { this.name = name; } speak() {} }', []],
      'Getters & Setters': ['Getters and setters control property access.', 'class Person { get fullName() { return this.first + " " + this.last; } }', []],
      'this Keyword': ['The "this" keyword refers to the current execution context.', 'const obj = { name: "test", log: function() { console.log(this.name); } };', []],
      'Bind Call Apply': ['These methods explicitly set the value of "this".', 'func.bind(context); func.call(context, arg1); func.apply(context, [args]);', []],
      'Static Methods': ['Static methods belong to the class itself, not instances.', 'class MathUtils { static add(a,b) { return a+b; } }\nMathUtils.add(2,3);', []],
      'Private Fields': ['Private fields are accessible only within the class.', 'class Person { #age; constructor(age) { this.#age = age; } }', []],
    },
    'Functions Deep Dive': {
      'Arrow Functions': ['Arrow functions provide a concise function syntax.', 'const add = (a, b) => a + b;', []],
      'Closures': ['A closure is a function with access to its outer scope.', 'function outer(x) { return function(y) { return x + y; }; }', []],
      'Higher-Order Functions': ['Functions that take or return other functions.', 'function map(arr, fn) { return arr.map(fn); }', []],
      'Recursion': ['A function that calls itself to solve problems.', 'function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }', []],
      'Default Parameters': ['Function parameters can have default values.', 'function greet(name = "World") { return `Hello ${name}`; }', []],
      'Rest Parameters': ['Rest parameters collect remaining arguments into an array.', 'function sum(...numbers) { return numbers.reduce((a,b) => a+b, 0); }', []],
      'IIFE': ['Immediately Invoked Function Expressions run immediately.', '(function() { console.log("Runs now"); })();', []],
      'Callbacks': ['Functions passed as arguments to other functions.', 'setTimeout(() => console.log("Done"), 1000);', []],
    },
    'Asynchronous JavaScript': {
      'Promises': ['Promises represent eventual completion of async operations.', 'fetch("/api").then(res => res.json()).catch(err => console.error(err));', []],
      'Async Await': ['Async/await provides cleaner syntax for promises.', 'async function getData() { const res = await fetch("/api"); return res.json(); }', []],
      'Error Handling': ['Try/catch blocks handle errors in async code.', 'try { await riskyOperation(); } catch (err) { console.error(err); }', []],
      'Event Loop': ['The event loop handles async operations in JS.', 'console.log("1"); setTimeout(() => console.log("2"), 0); console.log("3"); // 1, 3, 2', []],
      'Microtasks': ['Microtasks have higher priority than macrotasks.', 'Promise.resolve().then(() => console.log("microtask"));', []],
      'Fetch API': ['The Fetch API makes HTTP requests.', 'const res = await fetch(url, { method: "POST", body: JSON.stringify(data), headers: {"Content-Type": "application/json"} });', []],
      'Web Workers': ['Web Workers run scripts in background threads.', 'const worker = new Worker("worker.js"); worker.postMessage("data");', []],
      'Service Workers': ['Service Workers act as network proxies for offline support.', 'navigator.serviceWorker.register("/sw.js");', []],
    },
    'DOM & Browser APIs': {
      'DOM Selection': ['Methods to select DOM elements.', 'document.getElementById("id"); document.querySelector(".class");', []],
      'DOM Manipulation': ['Creating, modifying, and removing DOM elements.', 'const div = document.createElement("div"); div.textContent = "Hello"; parent.appendChild(div);', []],
      'Events': ['Handling user interactions in the browser.', 'element.addEventListener("click", (e) => console.log(e.target));', []],
      'Event Bubbling': ['Events propagate from child to parent elements.', 'parent.addEventListener("click", () => console.log("parent"), false);', []],
      'Event Delegation': ['Handling events on multiple children via a parent.', 'parent.addEventListener("click", (e) => { if(e.target.matches(".item")) handleItem(e); });', []],
      'LocalStorage': ['Persistent key-value storage in the browser.', 'localStorage.setItem("key", "value"); const val = localStorage.getItem("key");', []],
      'SessionStorage': ['Session-only key-value storage.', 'sessionStorage.setItem("temp", "data");', []],
      'Canvas API': ['Drawing 2D graphics with the Canvas API.', 'const ctx = canvas.getContext("2d"); ctx.fillRect(10, 10, 100, 100);', []],
      'Geolocation API': ['Accessing user location.', 'navigator.geolocation.getCurrentPosition(pos => console.log(pos.coords));', []],
      'History API': ['Manipulating browser history.', 'history.pushState({page: 1}, "title", "/page1");', []],
    },
    'Error Handling & Debugging': {
      'Try Catch': ['Handling runtime errors with try/catch.', 'try { riskyCode(); } catch (err) { console.error(err.message); } finally { cleanup(); }', []],
      'Custom Errors': ['Creating custom error types.', 'class ValidationError extends Error { constructor(msg) { super(msg); this.name = "ValidationError"; } }', []],
      'Debugging Tools': ['Browser developer tools for debugging.', 'console.log, console.table, console.time, debugger statement', []],
      'Console Methods': ['Various console methods for debugging.', 'console.group("Group"); console.warn("Warning"); console.error("Error"); console.groupEnd();', []],
      'Source Maps': ['Maps compiled code back to source code.', '//# sourceMappingURL=app.js.map', []],
      'Error Boundary': ['React concept adapted: catching render errors.', '// try/catch around rendering logic', []],
    },
    'Modules & Tooling': {
      'ES Modules': ['Native JavaScript module system.', 'import { func } from "./module.js"; export const value = 42;', []],
      'Dynamic Import': ['Importing modules dynamically at runtime.', 'const module = await import("./module.js");', []],
      'npm Packages': ['Using and managing packages from npm.', 'npm install lodash\nimport _ from "lodash";', []],
      'Bundlers': ['Tools that bundle JS files for production.', 'Webpack, Vite, esbuild, Rollup', []],
      'Transpilers': ['Tools that convert modern JS to older syntax.', 'Babel converts ES6+ to ES5 for browser compatibility.', []],
      'Linters': ['Tools that analyze code for potential errors.', 'ESLint: static analysis tool for JS/TS', []],
      'Formatters': ['Tools that format code consistently.', 'Prettier: opinionated code formatter', []],
      'Testing Frameworks': ['Tools for writing and running tests.', 'Jest, Vitest, Mocha, Jasmine', []],
    },
    'Modern JavaScript Features': {
      'Optional Chaining': ['Safe access to nested properties.', 'const name = user?.profile?.name ?? "Anonymous";', []],
      'Nullish Coalescing': ['Provides default values for null/undefined.', 'const value = input ?? "default";', []],
      'Logical Assignment': ['Combines logical operators with assignment.', 'x ||= y; x &&= y; x ??= y;', []],
      'BigInt': ['Arbitrary precision integers.', 'const big = 9007199254740991n;', []],
      'Symbol': ['Unique and immutable primitive values.', 'const sym = Symbol("description"); const obj = { [sym]: "value" };', []],
      'SharedArrayBuffer': ['Shared memory across workers.', 'const sab = new SharedArrayBuffer(1024);', []],
      'WeakRef': ['Weak references for garbage collection sensitive caching.', 'const ref = new WeakRef(obj); const val = ref.deref();', []],
      'Atomics': ['Atomic operations for shared memory.', 'Atomics.add(buf, 0, 1); Atomics.load(buf, 0);', []],
      'Temporal API': ['Modern date/time handling (proposal).', 'Temporal.Now.plainDateISO();', []],
    },
    'Performance & Optimization': {
      'Memory Management': ['Understanding JS memory lifecycle.', 'Allocation, usage, and garbage collection phases.', []],
      'Garbage Collection': ['Automatic memory reclamation.', 'Mark-and-sweep algorithm; generational GC in V8.', []],
      'Memory Leaks': ['Common patterns causing memory leaks.', 'Global variables, forgotten timers, detached DOM nodes, closures.', []],
      'Debouncing': ['Delaying function execution until after a pause.', 'function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }', []],
      'Throttling': ['Limiting function execution rate.', 'function throttle(fn, limit) { let inThrottle; return (...args) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }', []],
      'Caching Strategies': ['Techniques to avoid redundant computations.', 'Memoization, request caching, service worker cache.', []],
      'Code Splitting': ['Splitting code into chunks loaded on demand.', 'Dynamic import() enables code splitting in bundlers.', []],
      'Tree Shaking': ['Dead code elimination during bundling.', 'Using ES modules enables tree shaking in bundlers like Webpack.', []],
      'Lazy Loading': ['Deferring loading of non-critical resources.', 'IntersectionObserver for lazy loading images and components.', []],
    },
  },

  py: {
    'Python Fundamentals': {
      'Variables & Types': ['Python has dynamic typing with strong type checking.', 'x = 5; name = "Python"; is_valid = True', []],
      'Numbers & Math': ['Python supports integers, floats, and complex numbers.', 'a = 10; b = 3.14; c = 1 + 2j', []],
      'Strings': ['Strings are immutable sequences of characters.', 's = "Hello"; s.upper(); s[0:5]', []],
      'String Formatting': ['Multiple ways to format strings.', 'f"Value is {x}"; "Value is {}".format(x); "%d" % x', []],
      'Lists': ['Lists are mutable ordered collections.', 'arr = [1,2,3]; arr.append(4); arr[1:3]', []],
      'Tuples': ['Tuples are immutable ordered collections.', 'tup = (1, 2, 3); x, y, z = tup', []],
      'Dictionaries': ['Dictionaries are key-value mappings.', 'd = {"key": "value"}; d.get("key", "default")', []],
      'Sets': ['Sets are unordered collections of unique elements.', 's = {1, 2, 3}; s.add(4); s & {2,3}', []],
      'Booleans & Comparisons': ['Boolean logic and comparison operators.', 'True and False; x == y; x is y; x in list', []],
      'Type Conversion': ['Converting between types.', 'int("123"); str(456); list("abc"); tuple([1,2])', []],
    },
    'Control Flow': {
      'If Statements': ['Conditional execution with if/elif/else.', 'if x > 0: print("positive")\nelif x == 0: print("zero")\nelse: print("negative")', []],
      'For Loops': ['Iterating over sequences.', 'for i in range(5): print(i)\nfor key, val in dict.items(): print(key, val)', []],
      'While Loops': ['Repeating while a condition is true.', 'while x > 0: print(x); x -= 1', []],
      'Break & Continue': ['Controlling loop execution.', 'for i in range(10):\n  if i == 5: break\n  if i % 2 == 0: continue\n  print(i)', []],
      'Match Statement': ['Pattern matching (Python 3.10+).', 'match value:\n  case 1: print("one")\n  case _: print("other")', []],
      'List Comprehensions': ['Concise way to create lists.', '[x**2 for x in range(10) if x % 2 == 0]', []],
      'Dict Comprehensions': ['Concise way to create dictionaries.', '{x: x**2 for x in range(5)}', []],
      'Generator Expressions': ['Memory-efficient iterators.', 'sum(x**2 for x in range(1000000))', []],
      'Ternary Operator': ['Conditional expression in one line.', '"even" if x % 2 == 0 else "odd"', []],
    },
    'Functions': {
      'Function Basics': ['Defining and calling functions.', 'def greet(name): return f"Hello {name}"; result = greet("Alice")', []],
      'Parameters & Arguments': ['Positional, keyword, default, and variable arguments.', 'def func(a, b=2, *args, **kwargs): pass', []],
      'Lambda Functions': ['Anonymous inline functions.', 'add = lambda a, b: a + b; list(map(lambda x: x*2, [1,2,3]))', []],
      'Decorators': ['Functions that modify other functions.', 'def timer(f):\n  def wrapper(*args, **kwargs):\n    start = time.time(); result = f(*args, **kwargs); print(time.time()-start); return result\n  return wrapper', []],
      'Generators': ['Functions that yield values lazily.', 'def count(n):\n  for i in range(n): yield i', []],
      'Iterators': ['Objects that implement __iter__ and __next__.']},
    'Error Handling': {
      'Try Except': ['Catching and handling exceptions.', 'try:\n  result = risky_operation()\nexcept ValueError as e:\n  print(f"Value error: {e}")\nexcept Exception as e:\n  print(f"Unexpected: {e}")\nelse:\n  print("No error")\nfinally:\n  cleanup()', []],
      'Custom Exceptions': ['Creating custom exception types.', 'class ValidationError(Exception):\n  def __init__(self, message):\n    self.message = message\n    super().__init__(self.message)', []],
      'Exception Hierarchy': ['Python exception class hierarchy.', 'BaseException -> SystemExit, KeyboardInterrupt, Exception -> all standard errors', []],
      'Assertions': ['Debugging aids to check conditions.', 'assert x > 0, "x must be positive"', []],
      'Context Managers': ['Managing resources with the "with" statement.', 'with open("file.txt", "r") as f:\n  content = f.read()', []],
      'Raising Exceptions': ['Explicitly raising exceptions.', 'raise ValueError("Invalid input")', []],
    },
    'Object-Oriented Programming': {
      'Classes & Objects': ['Defining and instantiating classes.', 'class Dog:\n  def __init__(self, name):\n    self.name = name\n  def bark(self):\n    return f"{self.name} says woof"', []],
      'Inheritance': ['Deriving classes from parent classes.', 'class Puppy(Dog):\n  def bark(self):\n    return f"{self.name} says yip"', []],
      'Polymorphism': ['Same interface with different implementations.', 'for animal in [Dog("Rex"), Cat("Whiskers")]:\n  print(animal.speak())', []],
      'Encapsulation': ['Controlling access to attributes.', 'class Person:\n  def __init__(self):\n    self._protected = "single underscore"\n    self.__private = "name mangled"', []],
      'Properties': ['Controlled attribute access with @property.', '@property\n  def age(self): return self._age\n  @age.setter\n  def age(self, val):\n    if val < 0: raise ValueError\n    self._age = val', []],
      'Magic Methods': ['Special methods with double underscores.', '__init__, __str__, __repr__, __len__, __getitem__, __call__', []],
      'Class Methods': ['Methods bound to the class, not instances.', '@classmethod\n  def from_string(cls, s):\n    return cls(*s.split(","))', []],
      'Static Methods': ['Methods that don\'t access instance or class.', '@staticmethod\n  def validate(x):\n    return isinstance(x, int)', []],
      'Abstract Classes': ['Classes that cannot be instantiated directly.', 'from abc import ABC, abstractmethod\nclass Shape(ABC):\n  @abstractmethod\n  def area(self): pass', []],
      'Dataclasses': ['Simplified class creation for data containers.', 'from dataclasses import dataclass\n@dataclass\nclass Point:\n  x: float\n  y: float', []],
    },
    'Modules & Packages': {
      'Import System': ['How Python imports modules.', 'import math; from datetime import datetime; import numpy as np', []],
      'Package Structure': ['Organizing code into packages.', '# __init__.py marks a directory as a package\nfrom mypackage import module1, module2', []],
      'Standard Library': ['Python\'s extensive built-in modules.', 'os, sys, json, re, datetime, collections, itertools, math, random', []],
      'Virtual Environments': ['Isolated Python environments.', 'python -m venv venv; source venv/bin/activate', []],
      'pip': ['Python package installer.', 'pip install requests flask numpy pandas', []],
      'Requirements Files': ['Listing project dependencies.', 'pip freeze > requirements.txt\npip install -r requirements.txt', []],
    },
    'File I/O': {
      'Reading Files': ['Reading content from files.', 'with open("file.txt", "r") as f:\n  content = f.read()\n  lines = f.readlines()', []],
      'Writing Files': ['Writing content to files.', 'with open("file.txt", "w") as f:\n  f.write("Hello World\\n")', []],
      'File Modes': ['Different file opening modes.', '"r" read, "w" write (overwrite), "a" append, "r+" read/write, "b" binary', []],
      'CSV Files': ['Reading and writing CSV files.', 'import csv\nwith open("data.csv") as f:\n  reader = csv.DictReader(f)\n  for row in reader: print(row)', []],
      'JSON Files': ['Reading and writing JSON files.', 'import json\nwith open("data.json") as f:\n  data = json.load(f)', []],
      'Binary Files': ['Reading and writing binary data.', 'with open("image.png", "rb") as f:\n  data = f.read()', []],
      'Path Operations': ['Manipulating file paths.', 'from pathlib import Path\np = Path("/usr/bin/python3")\np.name, p.parent, p.suffix', []],
    },
    'Advanced Python': {
      'Itertools': ['Iterator tools for efficient looping.', 'from itertools import chain, cycle, permutations, combinations, product', []],
      'Functools': ['Higher-order functions and operations.', 'from functools import partial, reduce, lru_cache, wraps', []],
      'Collections': ['Specialized container datatypes.', 'from collections import defaultdict, Counter, deque, namedtuple, OrderedDict', []],
      'Concurrency': ['Threading, multiprocessing, and async.', 'import threading; import multiprocessing; import asyncio', []],
      'Async/Await': ['Asynchronous programming with async/await.', 'async def fetch(url):\n  async with aiohttp.ClientSession() as session:\n    async with session.get(url) as resp:\n      return await resp.json()', []],
      'Type Hints': ['Static type annotations for better code.', 'def greet(name: str) -> str:\n  return f"Hello {name}"', []],
      'Metaclasses': ['Classes of classes that control class creation.', 'class Meta(type): pass\nclass MyClass(metaclass=Meta): pass', []],
      'Descriptors': ['Protocol for attribute access control.', 'class Property:\n  def __get__(self, obj, objtype=None): return obj._value\n  def __set__(self, obj, value): obj._value = value', []],
    },
  },

  // ── Debugging ──
  debugging: {
    'Console & DevTools': {
      'Console API Methods': ['The Console API provides methods for logging, tables, groups, timers, and more in browser DevTools.', 'console.log, console.table, console.time, console.group, console.assert', []],
      'Browser DevTools Panels': ['Overview of Elements, Console, Sources, Network, Memory, Performance, and Application panels.', 'DevTools panels for debugging different aspects: DOM, JS, network, memory, performance', []],
      'Line Breakpoints': ['Pause execution at specific lines in the Sources panel to inspect program state.', 'Click line number gutter in Sources to set breakpoints', []],
      'Conditional Breakpoints': ['Breakpoints that only trigger when a condition is true — great for specific cases.', 'Right-click gutter > Add conditional breakpoint', []],
      'DOM & Event Breakpoints': ['Break on DOM changes, XHR requests, and specific event types.', 'DOM change, XHR/Fetch, and Event Listener breakpoints in Sources panel', []],
      'Exception Breakpoints & debugger': ['Pause on exceptions and use the debugger statement for programmatic breakpoints.', 'Stop sign icon for exceptions; debugger; statement for code-level breaks', []],
    },
    'Debugging Workflow': {
      'Call Stack Navigation': ['Step Over, Step Into, Step Out, Resume, and Drop Frame controls.', 'F10/F11/Shift+F11/F8 for stepping through code execution', []],
      'Scope & Watch Expressions': ['Inspect local/closure/global variables and create expressions that evaluate on pause.', 'Scope pane and Watch pane in Sources panel', []],
      'Async Stack Traces': ['Preserved call chains across async operations and event loop understanding.', 'Async call stacks show the full chain across awaits and promises', []],
    },
    'Network & Storage': {
      'Network Panel Inspection': ['Monitor all HTTP requests, inspect headers, payload, timing, and initiator.', 'Network panel: filter, preserve log, throttling, initiator trace', []],
      'Storage & Application Inspection': ['Inspect LocalStorage, SessionStorage, Cookies, IndexedDB, and Service Workers.', 'Application panel for all browser storage and service worker management', []],
      'Memory Profiling': ['Heap snapshots, allocation timelines, and CPU profiling for finding leaks and bottlenecks.', 'Memory panel: heap snapshots, allocation timelines; Performance panel: flame charts', []],
    },
    'Python Debugging': {
      'print() & f-strings': ['Simple debugging with print(), f-strings, and pprint for complex data.', 'f"{var=}" syntax, pprint, __repr__ for debugging Python code', []],
      'pdb & breakpoint()': ['Python\'s built-in debugger with breakpoint(), step commands, and post-mortem inspection.', 'breakpoint(), pdb commands: l, n, s, c, p, pp, w, u, d; pdb.pm() for post-mortem', []],
      'Logging Module': ['Hierarchical loggers, multiple handlers, formatters, and configurable levels for production.', 'logging module: basicConfig, handlers, formatters, logger hierarchy', []],
      'Exception Hooks & Tracebacks': ['sys.excepthook, traceback module, inspect module for stack inspection.', 'Global exception handlers, traceback.format_exc, inspect.stack()', []],
      'IDE & Remote Debugging': ['VS Code/PyCharm debugging, debugpy for remote debugging, pytest --pdb.', 'VS Code launch.json, debugpy.listen(), pytest --pdb -x', []],
    },
    'Advanced Debugging': {
      'Source Maps': ['Map compiled JS back to original TypeScript source code for easier debugging.', 'sourceMap: true in tsconfig; upload source maps to Sentry/Bugsnag for production', []],
      'Workspace Overrides & Pretty-Printing': ['Edit files directly in DevTools with persistent changes and pretty-print minified code.', 'Sources > Filesystem > Add folder; { } button for pretty-printing', []],
      'REPL & Node.js Remote Debugging': ['Node.js --inspect debugging and interactive REPL for debugging.', 'node --inspect-brk; chrome://inspect; REPL .help, .break, .save, .load', []],
      'Memory Leak Patterns': ['Common leak patterns: intervals, detached DOM, globals, closures, event listeners.', 'Use Memory panel > Heap snapshots to detect detached elements and retained objects', []],
    },
    'Production Debugging': {
      'Error Tracking & Monitoring': ['Sentry, LogRocket, Datadog RUM integration with global error handlers and source maps.', 'window.onerror, unhandledrejection, error tracking SDK integration', []],
      'Network Mocking & Blocking': ['Block/mock network requests in DevTools, emulate offline mode and custom latency.', 'Network panel: block request URL, offline emulation, throttling profiles', []],
      'Go Debugging': ['Delve debugger, race detector, pprof profiling, and execution tracing for Go programs.', 'dlv debug, go run -race, pprof, go tool trace for Go debugging', []],
    },
  },

  // ── Backend Development ──
  backend: {
    'Internet & HTTP Fundamentals': {
      'How the Internet Works': ['Understanding the internet infrastructure.', 'DNS, IP addresses, routers, ISPs, and the client-server model.', []],
      'HTTP Protocol': ['The Hypertext Transfer Protocol.', 'HTTP/1.1, HTTP/2, HTTP/3; request/response cycle; headers, methods, status codes.', []],
      'REST API Design': ['Designing RESTful APIs.', 'Resources, HTTP methods (GET, POST, PUT, DELETE), status codes, versioning.', []],
      'DNS': ['Domain Name System resolution.', 'A, CNAME, MX records; TTL; DNS propagation.', []],
      'TCP/IP': ['Transmission Control Protocol fundamentals.', 'Three-way handshake, ports, sockets, connection lifecycle.', []],
      'WebSockets': ['Bidirectional real-time communication.', 'WebSocket handshake, frames, full-duplex communication.', []],
    },
    'Server-Side Languages': {
      'Node.js Runtime': ['JavaScript runtime for server-side development.', 'Event loop, non-blocking I/O, Node.js built-in modules (fs, path, http).', []],
      'Express.js': ['Popular Node.js web framework.', 'Routing, middleware, request/response handling, error handling.', []],
      'Python Backend': ['Python web frameworks for backend development.', 'Django, Flask, FastAPI - ORM, routing, middleware.', []],
      'Java Backend': ['Java frameworks for enterprise backend development.', 'Spring Boot, JPA/Hibernate, dependency injection.', []],
      'Go Backend': ['Go for high-performance backends.', 'net/http, gorilla/mux, Gin framework, concurrency patterns.', []],
      'PHP Backend': ['PHP for web application development.', 'Laravel, Symfony, Composer, MVC architecture.', []],
    },
    'Databases & Storage': {
      'Relational Databases': ['SQL databases with structured schemas.', 'PostgreSQL, MySQL - tables, indexes, joins, transactions, ACID.', []],
      'NoSQL Databases': ['Non-relational database systems.', 'MongoDB (document), Redis (key-value), Cassandra (wide-column).', []],
      'ORM Tools': ['Object-Relational Mapping libraries.', 'Prisma, Sequelize, TypeORM, SQLAlchemy, Mongoose.', []],
      'Database Design': ['Designing efficient database schemas.', 'Normalization, denormalization, indexing strategies, relationships.', []],
      'Query Optimization': ['Optimizing database query performance.', 'EXPLAIN, query plans, index usage, connection pooling.', []],
      'Data Caching': ['Caching strategies for database access.', 'Redis, Memcached, cache-aside, write-through, cache invalidation.', []],
      'Migrations': ['Managing database schema changes.', 'Version-controlled schema changes, rollbacks, seeding data.', []],
    },
    'Authentication & Authorization': {
      'JWT (JSON Web Tokens)': ['Stateless token-based authentication.', 'Header, payload, signature; access tokens, refresh tokens.', []],
      'Session-Based Auth': ['Server-side session management.', 'Session IDs, cookies, session stores (Redis, DB).', []],
      'OAuth 2.0': ['Standard protocol for authorization.', 'Authorization code flow, implicit flow, client credentials.', []],
      'RBAC': ['Role-Based Access Control.', 'Users, roles, permissions; hierarchical roles.', []],
      'Security Best Practices': ['Protecting against common vulnerabilities.', 'Password hashing (bcrypt), rate limiting, input validation, XSS/CSRF prevention.', []],
      'API Keys': ['Managing API authentication with keys.', 'Key generation, rotation, rate limiting per key.', []],
    },
    'API Development': {
      'GraphQL': ['Query language for APIs.', 'Schema definition, resolvers, queries, mutations, subscriptions.', []],
      'gRPC': ['High-performance RPC framework.', 'Protocol buffers, service definitions, streaming, HTTP/2.', []],
      'WebSockets': ['Real-time bidirectional communication.', 'Socket.io, ws library, rooms, broadcasting.', []],
      'API Versioning': ['Strategies for API version management.', 'URL versioning, header versioning, content negotiation.', []],
      'API Documentation': ['Documenting APIs for consumers.', 'Swagger/OpenAPI, Postman collections, API blueprints.', []],
      'Rate Limiting': ['Controlling API request rates.', 'Token bucket, leaky bucket, sliding window; per-user, per-IP.', []],
    },
    'Testing Backend': {
      'Unit Testing': ['Testing individual components in isolation.', 'Jest, Mocha, Vitest; mocking, stubbing, assertions.', []],
      'Integration Testing': ['Testing component interactions.', 'Supertest for HTTP, database test containers, API integration tests.', []],
      'End-to-End Testing': ['Testing the complete application flow.', 'Cypress, Playwright; full user journey testing.', []],
      'Test-Driven Development': ['Writing tests before implementation.', 'Red-green-refactor cycle, test-first methodology.', []],
    },
    'DevOps & Deployment': {
      'Docker': ['Containerization platform.', 'Dockerfiles, images, containers, docker-compose, multi-stage builds.', []],
      'CI/CD': ['Continuous Integration and Deployment.', 'GitHub Actions, GitLab CI, Jenkins; automated testing and deployment.', []],
      'Cloud Deployment': ['Deploying to cloud platforms.', 'AWS (EC2, Lambda, ECS), GCP (Cloud Run, GKE), Azure (App Service).', []],
      'Monitoring': ['Tracking application health and performance.', 'Logging (Winston, Morgan), metrics (Prometheus), alerting.', []],
    },
    'System Design': {
      'Scalability Patterns': ['Designing for scale.', 'Horizontal vs vertical scaling, load balancing, database sharding.', []],
      'Microservices': ['Architecting distributed systems.', 'Service decomposition, inter-service communication, API gateways.', []],
      'Message Queues': ['Async communication between services.', 'RabbitMQ, Kafka, Redis streams; producers, consumers, topics.', []],
      'Caching Strategies': ['Multi-level caching patterns.', 'CDN, application cache, database cache; cache invalidation strategies.', []],
      'Database Sharding': ['Horizontal data partitioning.', 'Hash-based, range-based sharding; rebalancing, query routing.', []],
      'Consensus Algorithms': ['Distributed agreement protocols.', 'Raft, Paxos, Zab; leader election, log replication.', []],
    },
  },

  cicd: {
    'CI/CD Fundamentals': {
      'What is CI/CD?': ['Introduction to Continuous Integration and Continuous Deployment.', 'CI/CD pipeline concepts, benefits, and the DevOps lifecycle.', []],
      'Version Control with Git': ['Git fundamentals for CI/CD.', 'Branching strategies (Git Flow, trunk-based), pull requests, merge conflicts.', []],
      'Build Automation': ['Automating the build process.', 'Compilation, dependency resolution, asset bundling, artifact creation.', []],
      'Artifact Management': ['Storing and versioning build artifacts.', 'Artifact repositories (Nexus, Artifactory), versioning strategies.', []],
      'Environment Management': ['Managing development, staging, and production environments.', 'Environment parity, configuration management, secrets management.', []],
    },
    'Continuous Integration': {
      'CI Pipeline Design': ['Designing effective CI pipelines.', 'Pipeline stages, parallel execution, caching, failure handling.', []],
      'Automated Testing in CI': ['Running tests in CI pipelines.', 'Unit tests, integration tests, linting, code coverage, quality gates.', []],
      'GitHub Actions': ['CI/CD with GitHub Actions.', 'Workflows, jobs, steps, actions, matrix builds, triggers.', []],
      'GitLab CI': ['CI/CD with GitLab CI/CD.', '.gitlab-ci.yml, runners, stages, artifacts, environments.', []],
      'Jenkins': ['Self-hosted CI/CD with Jenkins.', 'Jenkinsfile, pipelines, plugins, distributed builds.', []],
      'CircleCI': ['Cloud CI/CD with CircleCI.', 'Config.yml, orbs, caching, parallelism, workflows.', []],
    },
    'Continuous Deployment': {
      'Deployment Strategies': ['Different approaches to deploying software.', 'Blue-green, canary, rolling, feature flags, A/B testing.', []],
      'Infrastructure as Code': ['Managing infrastructure through code.', 'Terraform, CloudFormation, Pulumi; declarative vs imperative IaC.', []],
      'Configuration Management': ['Managing system configuration.', 'Ansible, Puppet, Chef; idempotency, desired state.', []],
      'Secrets Management': ['Securely managing sensitive configuration.', 'HashiCorp Vault, AWS Secrets Manager, encrypted environment variables.', []],
      'Container CI/CD': ['CI/CD for containerized applications.', 'Docker builds, Kubernetes deployments, Helm charts, container registries.', []],
    },
    'Containerization & Orchestration': {
      'Docker Deep Dive': ['Advanced Docker concepts.', 'Multi-stage builds, Docker networks, volumes, Docker Compose.', []],
      'Kubernetes Basics': ['Container orchestration with Kubernetes.', 'Pods, services, deployments, ConfigMaps, secrets, namespaces.', []],
      'Helm Charts': ['Kubernetes package management.', 'Charts, templates, values, releases, repositories.', []],
      'Kubernetes Advanced': ['Advanced Kubernetes concepts.', 'Operators, CRDs, service mesh (Istio), horizontal pod autoscaling.', []],
    },
    'Monitoring & Observability': {
      'Logging': ['Centralized logging for applications.', 'ELK Stack (Elasticsearch, Logstash, Kibana), Loki, Fluentd.', []],
      'Metrics': ['Collecting and analyzing metrics.', 'Prometheus, Grafana, metrics types (counter, gauge, histogram).', []],
      'Tracing': ['Distributed tracing for microservices.', 'Jaeger, Zipkin, OpenTelemetry; trace context propagation.', []],
      'Alerting': ['Setting up alerts and notifications.', 'Alertmanager, PagerDuty, on-call rotations, escalation policies.', []],
      'SLOs & SLIs': ['Service Level Objectives and Indicators.', 'Defining reliability targets, error budgets, burn rates.', []],
    },
    'Security in CI/CD': {
      'DevSecOps': ['Integrating security into the pipeline.', 'Shift-left security, automated scanning, compliance as code.', []],
      'SAST & DAST': ['Static and dynamic application security testing.', 'SonarQube, Snyk, OWASP ZAP, dependency scanning.', []],
      'Container Security': ['Securing container images and runtime.', 'Image scanning, minimal base images, runtime security (Falco).', []],
      'Supply Chain Security': ['Securing the software supply chain.', 'SBOM, signed commits, dependency verification, SLSA framework.', []],
    },
  },

  gamedev: {
    'Game Design Fundamentals': {
      'Game Loops': ['The core loop that drives game execution.', 'Update-render cycle, fixed timestep, variable timestep, delta time.', []],
      'Game States': ['Managing game state transitions.', 'Menu, playing, paused, game over states; state machines.', []],
      'Game Feel': ['Principles of satisfying game interactions.', 'Juice, feedback, screen shake, particle effects, sound design.', []],
      'Level Design': ['Principles of designing game levels.', 'Pacing, difficulty curves, player guidance, reward structures.', []],
      'Game Balancing': ['Balancing game mechanics and difficulty.', 'Difficulty progression, resource balancing, playtesting feedback.', []],
      'Game Genres': ['Understanding different game genres.', 'Platformer, RPG, FPS, puzzle, strategy, simulation, roguelike.', []],
      'Player Psychology': ['Understanding player motivation.', 'Intrinsic vs extrinsic rewards, flow state, player types.', []],
    },
    '2D Game Development': {
      'Sprites & Textures': ['Working with 2D assets.', 'Sprite sheets, texture atlases, pixel art, filtering modes.', []],
      'Tilemaps': ['Grid-based level systems.', 'Tile sets, layers, collision tiles, auto-tiling, procedural placement.', []],
      '2D Physics': ['2D physics engines and collision.', 'AABB, circle, polygon collision; rigidbody, gravity, friction.', []],
      'Parallax Scrolling': ['Creating depth with multiple layers.', 'Foreground, midground, background layers; parallax factor.', []],
      '2D Animation': ['Sprite-based and skeletal 2D animation.', 'Frame-by-frame animation, bone animation, blend trees.', []],
      'Camera Systems': ['2D camera movement and effects.', 'Follow target, bounds, shake, zoom, screen bounds.', []],
      '2D Lighting': ['2D lighting techniques.', 'Normal maps, light sprites, shadow casting, ambient light.', []],
    },
    '3D Game Development': {
      '3D Meshes': ['Working with 3D models.', 'Vertices, triangles, UVs, normals, materials, LODs.', []],
      '3D Physics': ['3D physics engines and collision detection.', 'Convex hull, mesh collider, raycast, spherecast, joint constraints.', []],
      '3D Animation': ['3D animation systems.', 'Rigging, skinning, blend shapes, animation state machines.', []],
      '3D Rendering': ['3D rendering pipeline.', 'Vertex shader, fragment shader, lighting, shadows, post-processing.', []],
      '3D Cameras': ['3D camera control and perspectives.', 'First-person, third-person, isometric, orbit camera; FOV, clipping planes.', []],
      'Lighting & Shadows': ['3D lighting techniques.', 'Directional, point, spot lights; real-time vs baked shadows; GI.', []],
      'Particle Systems': ['Creating visual effects with particles.', 'Emitters, bursts, forces, color over lifetime, size over lifetime.', []],
    },
    'Audio & Sound': {
      'Sound Effects': ['Implementing sound effects in games.', 'One-shot sounds, 3D audio, audio mixing, compression formats.', []],
      'Music Systems': ['Dynamic music systems for games.', 'Layered music, crossfade, tempo matching, adaptive music.', []],
      'Audio Mixing': ['Mixing and mastering game audio.', 'Volume levels, EQ, compression, reverb, ducking.', []],
      '3D Audio': ['Spatial audio for immersive experiences.', 'Positional audio, HRTF, doppler effect, distance attenuation.', []],
    },
    'Game AI': {
      'Pathfinding': ['AI pathfinding algorithms.', 'A*, Dijkstra, navmesh, waypoints, path smoothing.', []],
      'Behavior Trees': ['Hierarchical AI decision making.', 'Selectors, sequences, decorators, conditions, actions.', []],
      'State Machines': ['Finite state machines for AI.', 'States, transitions, actions; patrol, chase, attack states.', []],
      'Utility AI': ['Scoring-based AI decision making.', 'Considerations, scoring, best choice selection, dynamic weighting.', []],
      'NPC Behavior': ['Designing believable NPC behaviors.', 'Dialogue systems, schedules, reactions, companion AI.', []],
    },
    'Networking & Multiplayer': {
      'Client-Server Model': ['Network architecture for multiplayer.', 'Authoritative server, client prediction, server reconciliation.', []],
      'Replication': ['Synchronizing game state across network.', 'Networked variables, RPCs, state synchronization, interpolation.', []],
      'Latency Management': ['Handling network delay in games.', 'Lag compensation, interpolation, extrapolation, input buffering.', []],
      'Matchmaking': ['Connecting players for multiplayer.', 'Lobbies, dedicated servers, peer-to-peer, ELO rating.', []],
    },
    'Unity Engine': {
      'Unity Scripting': ['C# scripting in Unity.', 'MonoBehaviour, Update/FixedUpdate, coroutines, input system.', []],
      'Unity Physics': ['Physics in Unity.', 'Rigidbody, colliders, joints, raycasting, physics materials.', []],
      'Unity UI': ['Unity UI system.', 'Canvas, RectTransform, UI elements, event system, layout groups.', []],
      'Unity Animator': ['Unity animation system.', 'Animator controller, parameters, transitions, blend trees, IK.', []],
      'Unity Prefabs': ['Reusable game object templates.', 'Prefab variants, nested prefabs, prefab editing.', []],
      'Unity ScriptableObjects': ['Data containers in Unity.', 'Creating ScriptableObjects, data-driven design, asset management.', []],
    },
    'Unreal Engine': {
      'Unreal Blueprints': ['Visual scripting in Unreal.', 'Blueprint classes, events, functions, variables, interfaces.', []],
      'Unreal C++': ['C++ programming in Unreal.', 'UE_LOG, AActor, UObject, UFUNCTION, UPROPERTY, garbage collection.', []],
      'Unreal Materials': ['Material system in Unreal.', 'Material nodes, material instances, PBR, shader models.', []],
      'Unreal Animation': ['Animation systems in Unreal.', 'Animation blueprints, state machines, blend spaces, montages.', []],
    },
    'Performance Optimization': {
      'Profiling': ['Identifying performance bottlenecks.', 'CPU/GPU profilers, frame debugger, memory profiler.', []],
      'Draw Calls': ['Reducing draw calls for rendering performance.', 'Batching, instancing, texture atlases, LOD groups.', []],
      'Memory Management': ['Efficient memory usage in games.', 'Object pooling, resource loading/unloading, garbage collection optimization.', []],
      'Level of Detail': ['LOD systems for performance.', 'LOD groups, distance-based switching, impostors, occlusion culling.', []],
    },
  },

  mobile: {
    'Mobile Fundamentals': {
      'Mobile Platform Overview': ['Understanding mobile platforms.', 'iOS vs Android, screen sizes, resolutions, platform guidelines.', []],
      'App Lifecycle': ['Understanding the mobile app lifecycle.', 'Foreground, background, suspended, terminated states; lifecycle callbacks.', []],
      'Touch Input & Gestures': ['Handling mobile touch input.', 'Tap, swipe, pinch, long press; gesture recognizers, multitouch.', []],
      'Mobile UI Design': ['Designing interfaces for mobile.', 'Material Design (Android), HIG (iOS), adaptive layouts, responsive design.', []],
      'Mobile Performance': ['Optimizing performance on mobile devices.', 'Battery consumption, memory usage, frame rate optimization, thermal throttling.', []],
      'App Architecture': ['Mobile app architecture patterns.', 'MVC, MVP, MVVM, Clean Architecture; separation of concerns.', []],
    },
    'Android Development': {
      'Android Studio & Tooling': ['Setting up Android development.', 'Android Studio, Gradle, emulators, ADB, manifest configuration.', []],
      'Kotlin Fundamentals': ['Kotlin for Android development.', 'Null safety, coroutines, data classes, extension functions, sealed classes.', []],
      'Jetpack Compose': ['Modern declarative UI for Android.', 'Composable functions, state management, layout, theming, navigation.', []],
      'Android Activity & Fragment': ['Activity and Fragment lifecycle.', 'Lifecycle management, state preservation, fragment transactions.', []],
      'Android Services': ['Background services in Android.', 'Foreground services, WorkManager, JobScheduler, alarms.', []],
      'Android Networking': ['Network operations in Android.', 'Retrofit, OkHttp, Volley; API calls, caching, error handling.', []],
      'Android Data Storage': ['Local data storage on Android.', 'Room database, SharedPreferences, DataStore, file storage.', []],
    },
    'iOS Development': {
      'Xcode & Tooling': ['Setting up iOS development.', 'Xcode IDE, Swift Package Manager, simulators, provisioning profiles.', []],
      'Swift Fundamentals': ['Swift for iOS development.', 'Optionals, protocols, structs vs classes, closures, enums with associated values.', []],
      'SwiftUI': ['Modern declarative UI for iOS.', 'Views, state (@State, @Binding), modifiers, navigation, previews.', []],
      'UIKit': ['Traditional iOS UI framework.', 'View controllers, Auto Layout, table views, collection views, storyboards.', []],
      'iOS Data Persistence': ['Local data storage on iOS.', 'Core Data, SwiftData, UserDefaults, FileManager, Keychain.', []],
      'iOS Networking': ['Network operations in iOS.', 'URLSession, Codable, Alamofire, async/await networking.', []],
      'iOS Concurrency': ['Concurrent programming in Swift.', 'Grand Central Dispatch, async/await, actors, Combine framework.', []],
    },
    'Cross-Platform Development': {
      'Flutter': ['Cross-platform with Flutter.', 'Dart language, widgets, state management (Provider, Riverpod, Bloc), rendering.', []],
      'React Native': ['Cross-platform with React Native.', 'Components, state management, bridge architecture, native modules.', []],
      'Kotlin Multiplatform': ['Sharing logic across platforms.', 'Common code, platform-specific expect/actual, Compose Multiplatform.', []],
      'State Management': ['Managing state in cross-platform apps.', 'Provider, Redux, MobX, Riverpod, BLoC pattern.', []],
      'Navigation & Routing': ['Navigation patterns in mobile apps.', 'Stack navigation, tab navigation, drawer navigation, deep linking.', []],
    },
    'Mobile Testing & Deployment': {
      'Unit Testing': ['Testing mobile app logic.', 'JUnit, XCTest, testing ViewModels, repositories, use cases.', []],
      'UI Testing': ['Automated UI testing for mobile.', 'Espresso (Android), XCUITest (iOS), Detox (RN), integration tests.', []],
      'App Store Deployment': ['Deploying to app stores.', 'Google Play Console, Apple App Store Connect, signing, versioning.', []],
      'CI/CD for Mobile': ['CI/CD pipelines for mobile apps.', 'Fastlane, Bitrise, GitHub Actions, automated build and test.', []],
      'App Analytics': ['Monitoring mobile app usage.', 'Firebase Analytics, Mixpanel, crash reporting, user engagement metrics.', []],
    },
    'Advanced Mobile Features': {
      'Push Notifications': ['Implementing push notifications.', 'FCM (Android), APNs (iOS), notification channels, rich notifications.', []],
      'In-App Purchases': ['Monetization with purchases.', 'Google Play Billing, StoreKit (iOS), consumable/non-consumable/subscription.', []],
      'Camera & Sensors': ['Using device hardware.', 'Camera API, accelerometer, gyroscope, GPS, biometric sensors.', []],
      'Augmented Reality': ['AR development on mobile.', 'ARCore (Android), ARKit (iOS), scene understanding, light estimation.', []],
      'Mobile ML': ['On-device machine learning.', 'TensorFlow Lite, Core ML, ML Kit, model conversion, inference.', []],
      'Bluetooth & NFC': ['Short-range communication.', 'Bluetooth LE, NFC reading/writing, Core Bluetooth, platform BLE APIs.', []],
    },
  },

  compiler: {
    'Compiler Fundamentals': {
      'What is a Compiler?': ['Introduction to compiler architecture.', 'Frontend vs backend, analysis vs synthesis phases, compilation vs interpretation.', []],
      'Language Processors': ['Types of language processors.', 'Compilers, interpreters, assemblers, transpilers, JIT compilers.', []],
      'Phases of Compilation': ['Overview of compiler phases.', 'Lexical analysis, syntax analysis, semantic analysis, IR generation, optimization, code generation.', []],
      'Symbol Tables': ['Managing identifiers during compilation.', 'Symbol table structure, scope management, inserting and looking up symbols.', []],
      'Error Handling': ['Strategies for compiler error handling.', 'Error detection, reporting, recovery; panic mode, error productions.', []],
    },
    'Lexical Analysis': {
      'Tokens & Lexemes': ['Understanding tokens in the compilation process.', 'Keywords, identifiers, literals, operators, delimiters; token patterns and attributes.', []],
      'Regular Expressions': ['Using regex for token specification.', 'Regular expressions, NFA/DFA conversion, Thompson construction.', []],
      'Finite Automata': ['DFA and NFA for lexical analysis.', 'Deterministic and non-deterministic finite automata, state transition diagrams.', []],
      'Lexer Generation': ['Automated lexer generation tools.', 'Lex/Flex, re2c; specification format, actions, and conflict resolution.', []],
      'Handwritten Lexers': ['Implementing lexers manually.', 'Buffer management, lookahead, sentinel characters, performance optimization.', []],
    },
    'Syntax Analysis': {
      'Context-Free Grammars': ['CFG fundamentals for parsing.', 'Productions, terminals, non-terminals, start symbol; derivation and parse trees.', []],
      'Top-Down Parsing': ['Recursive descent and LL parsing.', 'FIRST and FOLLOW sets, LL(1) grammars, left recursion elimination.', []],
      'Bottom-Up Parsing': ['LR parsing techniques.', 'LR(0), SLR, LR(1), LALR(1) parsers; shift-reduce and reduce-reduce conflicts.', []],
      'Parser Generators': ['Automated parser generation.', 'Yacc/Bison, ANTLR; grammar specifications, action code, conflict resolution.', []],
      'Abstract Syntax Trees': ['Building ASTs during parsing.', 'AST nodes, tree construction, visitor pattern, tree traversal.', []],
      'Error Recovery in Parsing': ['Handling syntax errors gracefully.', 'Panic mode, phrase-level recovery, error productions, global correction.', []],
    },
    'Semantic Analysis': {
      'Type Checking': ['Static type checking in compilers.', 'Type systems, type inference, type equivalence (structural vs nominal), type coercion.', []],
      'Scope Resolution': ['Resolving identifiers in scopes.', 'Lexical scoping, nested scopes, name hiding, hoisting.', []],
      'Attribute Grammars': ['Augmenting CFGs with semantic rules.', 'Synthesized attributes, inherited attributes, attribute evaluation, L-attributed grammars.', []],
      'Type Systems': ['Designing and implementing type systems.', 'Strong vs weak typing, static vs dynamic, subtyping, polymorphism.', []],
      'Type Inference': ['Inferring types without explicit annotations.', 'Hindley-Milner algorithm, unification, type variables, constraints.', []],
    },
    'Intermediate Representation': {
      'Three-Address Code': ['Low-level IR representation.', 'Quadruples, triples, indirect triples; assignment, arithmetic, control flow.', []],
      'SSA Form': ['Static Single Assignment form.', 'Phi functions, dominance frontiers, SSA construction and destruction.', []],
      'Control Flow Graphs': ['Graph representation of program control flow.', 'Basic blocks, CFG construction, dominator trees, loops.', []],
      'IR Generation': ['Generating IR from AST.', 'Translation schemes, addressing modes, temporary variables.', []],
    },
    'Code Optimization': {
      'Local Optimizations': ['Optimizations within basic blocks.', 'Common subexpression elimination, constant folding, algebraic simplification.', []],
      'Global Optimizations': ['Optimizations across basic blocks.', 'Data-flow analysis, reaching definitions, live variable analysis.', []],
      'Loop Optimizations': ['Optimizing loop execution.', 'Loop invariant code motion, induction variable elimination, loop unrolling.', []],
      'Register Allocation': ['Efficient register usage.', 'Graph coloring, liveness analysis, interference graphs, spilling.', []],
      'Instruction Scheduling': ['Ordering instructions for performance.', 'Pipeline hazards, instruction latencies, list scheduling, software pipelining.', []],
    },
    'Code Generation': {
      'Target Code': ['Generating machine code from IR.', 'Instruction selection, addressing modes, machine-specific idioms.', []],
      'Register Allocation': ['Register allocation algorithms.', 'Graph coloring, linear scan, Chaitin-Briggs algorithm.', []],
      'Instruction Selection': ['Mapping IR to machine instructions.', 'Tree pattern matching, peephole optimization, BURG/Twig.', []],
      'Function Prologues/Epilogues': ['Calling conventions and stack frames.', 'Caller/callee save registers, stack layout, activation records.', []],
    },
    'Compiler Construction Tools': {
      'Lex & Yacc': ['Classic compiler construction tools.', 'Lex/Flex for lexer generation, Yacc/Bison for parser generation.', []],
      'LLVM': ['LLVM compiler infrastructure.', 'LLVM IR, optimization passes, backend code generation, Clang.', []],
      'Multi-Stage Compilation': ['Linking, loading, and runtime.', 'Object files, linker, loader, dynamic linking, position-independent code.', []],
      'Just-In-Time Compilation': ['JIT compilation techniques.', 'Hotspot detection, profiling, tiered compilation, dynamic recompilation.', []],
      'Compiler Testing': ['Testing compiler correctness.', 'Test suites, regression testing, fuzzing, differential testing.', []],
    },
  },

  // ── Tech Stack providers ──
  react: {
    'React Fundamentals': {
      'JSX': ['JavaScript XML syntax extension.', 'JSX expressions, embedding expressions, attributes, children, fragments.', []],
      'Components': ['Building UI with components.', 'Functional components, component composition, props, children.', []],
      'Props': ['Passing data between components.', 'Prop types, default props, children prop, prop drilling.', []],
      'State': ['Managing component state.', 'useState hook, state updates, batching, immutable updates.', []],
      'Events': ['Handling events in React.', 'Event handlers, synthetic events, event pooling, passing arguments.', []],
      'Conditional Rendering': ['Rendering based on conditions.', 'Ternary operator, && operator, if/else, conditional rendering patterns.', []],
      'Lists & Keys': ['Rendering lists in React.', 'map(), filter(), keys, key requirements, index as key pitfalls.', []],
    },
    'Hooks': {
      'useEffect': ['Side effects in React components.', 'Effect dependencies, cleanup, lifecycle mapping, common use cases.', []],
      'useRef': ['Mutable references in React.', 'DOM refs, storing mutable values, forwardRef, callback refs.', []],
      'useMemo': ['Memoizing computed values.', 'Dependencies, performance optimization, when to use memo.', []],
      'useCallback': ['Memoizing function references.', 'Dependencies, preventing re-renders, stable callbacks.', []],
      'useContext': ['Consuming React context.', 'Context creation, provider, consumer, useContext hook.', []],
      'useReducer': ['Complex state management.', 'Reducer functions, dispatch, action types, state shape.', []],
      'Custom Hooks': ['Creating reusable hook logic.', 'Hook composition, naming conventions, shared stateful logic.', []],
    },
    'State Management': {
      'Context API': ['Built-in React state management.', 'React.createContext, Provider pattern, context updates, performance.', []],
      'Redux': ['Predictable state container.', 'Store, actions, reducers, dispatch, Redux Toolkit, slices.', []],
      'Zustand': ['Lightweight state management.', 'Store creation, selectors, subscriptions, middleware.', []],
      'React Query': ['Server state management.', 'Queries, mutations, caching, refetching, optimistic updates.', []],
      'State Patterns': ['State management patterns.', 'Lifting state up, colocation, state normalization.', []],
    },
    'Routing & Navigation': {
      'React Router': ['Client-side routing in React.', 'BrowserRouter, Routes, Route, Link, useParams, useNavigate.', []],
      'Nested Routes': ['Organizing routes hierarchically.', 'Outlet, relative links, layout routes, index routes.', []],
      'Route Guards': ['Protecting routes.', 'Authentication check, redirects, lazy loading, error boundaries.', []],
    },
    'Performance': {
      'React.memo': ['Preventing unnecessary re-renders.', 'Props comparison, custom comparator, when to memoize.', []],
      'Code Splitting': ['Lazy loading components.', 'React.lazy, Suspense, dynamic imports, chunk naming.', []],
      'Virtualization': ['Rendering large lists efficiently.', 'react-window, react-virtualized, windowing techniques.', []],
      'Profiling': ['Measuring React performance.', 'React DevTools profiler, flame graphs, render count optimization.', []],
    },
    'Testing React': {
      'React Testing Library': ['Testing React components.', 'render, screen, fireEvent, queries, async testing.', []],
      'Component Tests': ['Testing component behavior.', 'Props, state, events, async behavior, mock services.', []],
      'Integration Tests': ['Testing component interactions.', 'User flows, context providers, router integration.', []],
    },
  },

  // ── AI / ML curriculum (NEW tab) ──
  ai: {
    'AI Fundamentals': {
      'What is Artificial Intelligence?': ['Introduction to AI, ML, and deep learning.', 'AI vs ML vs DL, narrow vs general AI, history of AI, applications.', []],
      'Types of AI': ['Different categories of AI systems.', 'Reactive machines, limited memory, theory of mind, self-aware; weak vs strong AI.', []],
      'AI Problem Solving': ['Fundamental approaches to AI problems.', 'Search algorithms, constraint satisfaction, optimization, decision theory.', []],
      'Data in AI': ['The role of data in AI systems.', 'Structured vs unstructured data, data quality, data preprocessing, feature engineering.', []],
      'Ethics in AI': ['Ethical considerations in AI development.', 'Bias, fairness, transparency, accountability, privacy, responsible AI.', []],
    },
    'Mathematics for AI': {
      'Linear Algebra': ['Essential linear algebra for AI.', 'Vectors, matrices, matrix operations, eigenvalues, singular value decomposition.', []],
      'Calculus': ['Calculus concepts for machine learning.', 'Derivatives, partial derivatives, gradients, chain rule, optimization.', []],
      'Probability & Statistics': ['Probability theory for AI.', 'Distributions, Bayes theorem, maximum likelihood, hypothesis testing.', []],
      'Information Theory': ['Information theory concepts.', 'Entropy, cross-entropy, KL divergence, mutual information.', []],
      'Optimization': ['Optimization algorithms for ML.', 'Gradient descent, stochastic gradient descent, Adam, RMSprop, learning rate schedules.', []],
    },
    'Machine Learning': {
      'Supervised Learning': ['Learning from labeled data.', 'Regression (linear, polynomial), classification (logistic regression, SVM, decision trees).', []],
      'Unsupervised Learning': ['Finding patterns in unlabeled data.', 'Clustering (K-means, DBSCAN, hierarchical), dimensionality reduction (PCA, t-SNE).', []],
      'Model Evaluation': ['Evaluating machine learning models.', 'Train/test split, cross-validation, confusion matrix, precision/recall, ROC curve.', []],
      'Ensemble Methods': ['Combining multiple models.', 'Random forests, gradient boosting, XGBoost, stacking, bagging.', []],
      'Feature Engineering': ['Creating and selecting features.', 'Feature extraction, feature selection, normalization, one-hot encoding.', []],
      'Regularization': ['Preventing overfitting.', 'L1 (Lasso), L2 (Ridge), ElasticNet, dropout, early stopping.', []],
    },
    'Deep Learning': {
      'Neural Networks': ['Building neural networks from scratch.', 'Perceptron, activation functions (ReLU, sigmoid, tanh), backpropagation.', []],
      'CNNs': ['Convolutional neural networks for image data.', 'Convolution layers, pooling, stride, padding, filter maps, architectures (ResNet, VGG).', []],
      'RNNs & LSTMs': ['Recurrent networks for sequential data.', 'RNN cells, LSTM gates, GRU, vanishing gradients, sequence-to-sequence models.', []],
      'Autoencoders': ['Unsupervised learning with autoencoders.', 'Encoder-decoder architecture, latent space, denoising, variational autoencoders.', []],
      'GANs': ['Generative adversarial networks.', 'Generator, discriminator, adversarial training, GAN variants (DCGAN, StyleGAN).', []],
      'Transformers': ['The transformer architecture.', 'Self-attention, multi-head attention, positional encoding, encoder-decoder structure.', []],
      'Transfer Learning': ['Leveraging pre-trained models.', 'Fine-tuning, feature extraction, domain adaptation, model freezing.', []],
      'PyTorch': ['PyTorch deep learning framework.', 'Tensors, autograd, neural network module, optimizers, data loaders, CUDA.', []],
      'TensorFlow': ['TensorFlow deep learning framework.', 'Keras API, eager execution, tf.data, SavedModel, TensorFlow Lite.', []],
    },
    'Large Language Models': {
      'LLM Architecture': ['Understanding large language models.', 'GPT architecture, transformer decoder, scaling laws, emergent abilities.', []],
      'Attention Mechanisms': ['Deep dive into attention.', 'Self-attention, causal attention, cross-attention, sparse attention, FlashAttention.', []],
      'Pre-training': ['Training LLMs from scratch.', 'Training data, tokenization, next-token prediction, compute requirements.', []],
      'Fine-tuning': ['Adapting LLMs for specific tasks.', 'Supervised fine-tuning (SFT), instruction tuning, RLHF, DPO.', []],
      'PEFT': ['Parameter-efficient fine-tuning.', 'LoRA, QLoRA, Adapters, Prefix tuning, Prompt tuning.', []],
      'Prompt Engineering': ['Crafting effective prompts.', 'Few-shot prompting, chain-of-thought, tree-of-thought, system prompts.', []],
      'RAG': ['Retrieval-Augmented Generation.', 'Vector databases, document chunking, embeddings, retrieval strategies, reranking.', []],
      'LLM Evaluation': ['Evaluating LLM outputs.', 'Hallucination detection, benchmark datasets, human evaluation, automated metrics.', []],
      'LLM Safety': ['Safety and alignment in LLMs.', 'Red teaming, content filtering, jailbreak prevention, constitutional AI.', []],
      'Hugging Face Ecosystem': ['Hugging Face tools and libraries.', 'Transformers library, Datasets, PEFT, Tokenizers, Hub, Spaces.', []],
    },
    'AI Agents': {
      'Agent Architecture': ['Building autonomous AI agents.', 'Goal-oriented agents, reactive agents, deliberative agents, hybrid architectures.', []],
      'Tool Use': ['Giving agents access to tools.', 'Function calling, tool definitions, API integration, search, code execution.', []],
      'Multi-Agent Systems': ['Coordinating multiple AI agents.', 'Agent communication, task decomposition, role assignment, orchestration.', []],
      'Reasoning & Planning': ['Advanced reasoning in agents.', 'ReAct pattern, chain-of-thought, plan-and-execute, self-reflection.', []],
      'Memory Systems': ['Memory for AI agents.', 'Short-term vs long-term memory, vector memory, conversation history, summarization.', []],
      'Agent Frameworks': ['Frameworks for building agents.', 'LangChain, AutoGen, CrewAI, OpenAI Agents SDK, Anthropic tools.', []],
    },
    'MLOps & Production': {
      'Model Deployment': ['Deploying ML models to production.', 'Model serving (FastAPI, TorchServe, Triton), serverless, edge deployment.', []],
      'ML Pipelines': ['Building ML pipelines.', 'Data validation, feature pipelines, training pipelines, model registry.', []],
      'Model Monitoring': ['Monitoring models in production.', 'Data drift, concept drift, model decay, alerting, automated retraining.', []],
      'Experiment Tracking': ['Tracking ML experiments.', 'MLflow, Weights & Biases, Neptune, experiment comparison, reproducibility.', []],
      'A/B Testing': ['Testing model versions in production.', 'Shadow deployment, canary deployment, statistical significance, metrics tracking.', []],
      'Model Versioning': ['Versioning models and datasets.', 'DVC, model registries, dataset versioning, reproducibility.', []],
    },
    'Computer Vision': {
      'Image Classification': ['Classifying images with CNNs.', 'ImageNet, ResNet, EfficientNet, data augmentation, transfer learning.', []],
      'Object Detection': ['Detecting objects in images.', 'YOLO, SSD, Faster R-CNN, anchor boxes, NMS, mAP evaluation.', []],
      'Image Segmentation': ['Pixel-level image understanding.', 'Semantic segmentation, instance segmentation, U-Net, Mask R-CNN.', []],
      'Image Generation': ['Generating images with AI.', 'GANs, diffusion models (Stable Diffusion, DALL-E), text-to-image, inpainting.', []],
      'Video Analysis': ['Analyzing video with AI.', 'Action recognition, video tracking, optical flow, video summarization.', []],
    },
    'Natural Language Processing': {
      'Text Preprocessing': ['Preparing text for NLP.', 'Tokenization, stemming, lemmatization, stop word removal, TF-IDF, embeddings.', []],
      'Text Classification': ['Classifying text documents.', 'Sentiment analysis, topic classification, spam detection, BERT for classification.', []],
      'Named Entity Recognition': ['Extracting entities from text.', 'Person, organization, location; BiLSTM-CRF, BERT-based NER.', []],
      'Machine Translation': ['Translating text between languages.', 'Seq2seq models, attention, transformer-based translation.', []],
      'Speech Recognition': ['Converting speech to text.', 'ASR, CTC loss, Whisper, wav2vec, speaker diarization.', []],
      'Text-to-Speech': ['Converting text to speech.', 'TTS, WaveNet, Tacotron, speaker embedding, voice cloning.', []],
    },
    'AI Tools & Frameworks': {
      'LangChain': ['Building LLM-powered applications.', 'Chains, agents, retrievers, memory, document loaders, streaming.', []],
      'LlamaIndex': ['Data framework for LLM applications.', 'Index structures, retrievers, query engines, document parsing.', []],
      'Vector Databases': ['Vector storage and similarity search.', 'Pinecone, ChromaDB, Weaviate, Milvus, Qdrant; embeddings, ANN indexes.', []],
      'Ollama': ['Running LLMs locally.', 'Model management, OpenAI-compatible API, custom models, Modelfiles.', []],
      'vLLM': ['High-performance LLM serving.', 'PagedAttention, continuous batching, tensor parallelism, quantization.', []],
      'OpenAI API': ['Using OpenAI models via API.', 'Chat completions, embeddings, function calling, vision, assistants API.', []],
      'Anthropic API': ['Using Claude models via API.', 'Messages API, tool use, extended thinking, safety features.', []],
    },
  },
};

// ── Generic curriculum generator for any language/tab ──
function generateGenericCurriculum(lang) {
  // Identify category based on language name patterns
  const toolLangs = ['git', 'docker', 'k8s', 'kubernetes', 'redis', 'terraform', 'graphql', 'prisma', 'cypress', 'playwright'];
  const frameworkLangs = ['angular', 'vue', 'svelte', 'sveltekit', 'next', 'nuxt', 'express', 'node', 'django', 'flask', 'fastapi', 'spring', 'rails', 'flutter', 'rnative', 'tailwind', 'bootstrap', 'vite', 'webpack', 'remix', 'godot', 'unity', 'unreal'];
  const dbLangs = ['pg', 'mysql', 'sqlite', 'mongodb', 'sql'];
  const cloudLangs = ['aws', 'azure', 'gcp', 'cloud', 'firebase'];
  const langLangs = ['ts', 'go', 'rs', 'rust', 'java', 'kt', 'kotlin', 'swift', 'php', 'rb', 'ruby', 'scala', 'lua', 'zig', 'wasm', 'asm', 'assembly', 'bash', 'html', 'css', 'htmlcss'];

  if (toolLangs.includes(lang)) {
    return {
      'Getting Started': { [`${lang.charAt(0).toUpperCase() + lang.slice(1)} Introduction`]: [`Introduction to ${lang} and its ecosystem.`, '', []] },
      'Core Concepts': { [`${lang.charAt(0).toUpperCase() + lang.slice(1)} Basics`]: [`Core ${lang} concepts.`, '', []] },
      'Configuration': { [`${lang.charAt(0).toUpperCase() + lang.slice(1)} Config`]: [`Configuring ${lang} for your project.`, '', []] },
      'Best Practices': { [`${lang.charAt(0).toUpperCase() + lang.slice(1)} Best Practices`]: [`Best practices for using ${lang}.`, '', []] },
      'Advanced Usage': { [`${lang.charAt(0).toUpperCase() + lang.slice(1)} Advanced`]: [`Advanced ${lang} techniques and patterns.`, '', []] },
    };
  }

  if (frameworkLangs.includes(lang)) {
    const name = lang.charAt(0).toUpperCase() + lang.slice(1);
    return {
      'Getting Started': { [`${name} Introduction`]: [`Introduction to ${name} and its ecosystem.`, '', []] },
      'Core Concepts': { [`${name} Core Features`]: [`Essential ${name} concepts and features.`, '', []] },
      'Components & UI': { [`${name} Components`]: [`Building user interfaces with ${name}.`, '', []] },
      'Routing': { [`${name} Routing`]: [`Navigation and routing in ${name}.`, '', []] },
      'State Management': { [`${name} State`]: [`Managing application state in ${name}.`, '', []] },
      'Data & APIs': { [`${name} Data`]: [`Working with data and APIs in ${name}.`, '', []] },
      'Testing': { [`${name} Testing`]: [`Testing strategies for ${name}.`, '', []] },
      'Deployment': { [`${name} Deployment`]: [`Deploying ${name} applications.`, '', []] },
      'Best Practices': { [`${name} Best Practices`]: [`Best practices for ${name} development.`, '', []] },
      'Advanced Topics': { [`${name} Advanced`]: [`Advanced ${name} topics and patterns.`, '', []] },
    };
  }

  if (dbLangs.includes(lang)) {
    const name = lang === 'pg' ? 'PostgreSQL' : lang === 'mysql' ? 'MySQL' : lang === 'sqlite' ? 'SQLite' : lang === 'mongodb' ? 'MongoDB' : lang.toUpperCase();
    return {
      'Getting Started': { [`${name} Introduction`]: [`Introduction to ${name}.`, '', []] },
      'Core Concepts': { [`${name} Fundamentals`]: [`Core ${name} concepts.`, '', []] },
      'Data Modeling': { [`${name} Schema Design`]: [`Designing schemas in ${name}.`, '', []] },
      'Querying': { [`${name} Queries`]: [`Querying data in ${name}.`, '', []] },
      'Indexes & Performance': { [`${name} Performance`]: [`Optimizing ${name} performance.`, '', []] },
      'Security': { [`${name} Security`]: [`Securing your ${name} databases.`, '', []] },
      'Advanced Features': { [`${name} Advanced`]: [`Advanced ${name} features and techniques.`, '', []] },
    };
  }

  if (cloudLangs.includes(lang)) {
    return {
      'Getting Started': { [`${lang.toUpperCase()} Introduction`]: [`Introduction to ${lang.toUpperCase()}.`, '', []] },
      'Core Services': { [`${lang.toUpperCase()} Core`]: [`Core ${lang.toUpperCase()} services.`, '', []] },
      'Compute': { [`${lang.toUpperCase()} Compute`]: [`Compute services in ${lang.toUpperCase()}.`, '', []] },
      'Storage': { [`${lang.toUpperCase()} Storage`]: [`Storage solutions in ${lang.toUpperCase()}.`, '', []] },
      'Networking': { [`${lang.toUpperCase()} Networking`]: [`Networking in ${lang.toUpperCase()}.`, '', []] },
      'Security': { [`${lang.toUpperCase()} Security`]: [`Security best practices in ${lang.toUpperCase()}.`, '', []] },
      'Advanced': { [`${lang.toUpperCase()} Advanced`]: [`Advanced ${lang.toUpperCase()} topics.`, '', []] },
    };
  }

  if (langLangs.includes(lang)) {
    const nameMap = {
      ts: 'TypeScript', go: 'Go', rs: 'Rust', rust: 'Rust', java: 'Java', kt: 'Kotlin', kotlin: 'Kotlin',
      swift: 'Swift', php: 'PHP', rb: 'Ruby', ruby: 'Ruby', scala: 'Scala', lua: 'Lua', zig: 'Zig',
      wasm: 'WebAssembly', asm: 'Assembly', assembly: 'Assembly', bash: 'Bash', html: 'HTML', css: 'CSS', htmlcss: 'HTML/CSS'
    };
    const name = nameMap[lang] || lang;
    return {
      'Fundamentals': {
        'Introduction': [`Introduction to ${name}.`, '', []],
        'Variables & Types': [`Variables and data types in ${name}.`, '', []],
        'Operators': [`Operators in ${name}.`, '', []],
        'Control Flow': [`Control flow statements in ${name}.`, '', []],
        'Functions': [`Functions in ${name}.`, '', []],
      },
      'Data Structures': {
        'Arrays & Collections': [`Working with collections in ${name}.`, '', []],
        'Strings': [`String manipulation in ${name}.`, '', []],
        'Maps & Dictionaries': [`Key-value data structures in ${name}.`, '', []],
      },
      'Object-Oriented Programming': {
        'Classes & Objects': [`OOP concepts in ${name}.`, '', []],
        'Inheritance': [`Inheritance patterns in ${name}.`, '', []],
        'Interfaces': [`Interfaces and contracts in ${name}.`, '', []],
      },
      'Error Handling': {
        'Exceptions': [`Exception handling in ${name}.`, '', []],
        'Debugging': [`Debugging ${name} code.`, '', []],
      },
      'I/O & File System': {
        'File Operations': [`File I/O in ${name}.`, '', []],
        'Input/Output': [`Input and output operations in ${name}.`, '', []],
      },
      'Advanced Topics': {
        'Concurrency': [`Concurrency in ${name}.`, '', []],
        'Modules': [`Modular programming in ${name}.`, '', []],
        'Best Practices': [`Best practices for ${name}.`, '', []],
        'Performance': [`Optimizing ${name} code.`, '', []],
      },
    };
  }

  // Fallback generic
  return null;
}

// ── Helper: create topic entry ──
function makeTopic(desc, code, exercises) {
  return { exp: `<p>${desc}</p>`, code: code || '', exercises: exercises || [] };
}

// ── Expand curriculum file ──
function expandCurriculum(lang, targetTopics = 80) {
  const filePath = path.join(CONTENT_DIR, `${lang}.json`);
  let existing = {};
  try {
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch { /* file may be empty or corrupt */ }

  const curriculum = CURRICULA[lang] || generateGenericCurriculum(lang);
  if (!curriculum) {
    console.log(`  Cannot generate curriculum for '${lang}' — keeping existing (${countTopics(existing)} topics)`);
    return null;
  }

  // Merge: preferred topics from curriculum, keep existing
  const merged = {};
  const existingPhaseCount = Object.keys(existing).length;
  const existingTopicCount = countTopics(existing);

  // Phase order from curriculum
  const phaseOrder = Object.keys(curriculum);

  for (const phase of phaseOrder) {
    if (!merged[phase]) merged[phase] = {};
    const curTopics = curriculum[phase];
    const existingPhase = existing[phase] || {};

    for (const [topic, [desc, code, exercises]] of Object.entries(curTopics)) {
      if (existingPhase[topic]) {
        // Keep existing content (it has richer explanations)
        merged[phase][topic] = existingPhase[topic];
      } else {
        merged[phase][topic] = makeTopic(desc, code, exercises);
      }
    }

    // Add any extra topics from existing that aren't in our curriculum
    for (const topic of Object.keys(existingPhase)) {
      if (!merged[phase][topic]) {
        merged[phase][topic] = existingPhase[topic];
      }
    }
  }

  // Add any phases from existing that aren't in curriculum
  for (const phase of Object.keys(existing)) {
    if (!merged[phase]) {
      merged[phase] = existing[phase];
    }
  }

  // Check if we need to add more topics to reach target
  const newCount = countTopics(merged);
  if (newCount < targetTopics) {
    // Add more topics per phase to fill
    const totalExisting = newCount;
    console.log(`  Only ${totalExisting} topics — need ${targetTopics}`);
  }

  return merged;
}

function countTopics(data) {
  let total = 0;
  for (const phase of Object.keys(data || {})) {
    total += Object.keys(data[phase] || {}).length;
  }
  return total;
}

// ── Main ──
function main() {
  const langFiles = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.json') && !['app-data.json', 'projects'].includes(f))
    .map(f => f.replace('.json', ''))
    .sort();

  let totalAdded = 0;
  let totalFiles = 0;

  for (const lang of langFiles) {
    const result = expandCurriculum(lang);
    if (!result) continue;

    const oldData = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, `${lang}.json`), 'utf-8'));
    const oldCount = countTopics(oldData);
    const newCount = countTopics(result);
    const added = newCount - oldCount;

    if (added > 0) {
      fs.writeFileSync(path.join(CONTENT_DIR, `${lang}.json`), JSON.stringify(result, null, 2) + '\n');
      console.log(`${lang}: ${oldCount} → ${newCount} topics (+${added})`);
      totalAdded += added;
      totalFiles++;
    } else {
      console.log(`${lang}: ${oldCount} topics (unchanged)`);
    }
  }

  console.log(`\n=== Done! Updated ${totalFiles} files, added ${totalAdded} topics total ===`);
}

main();
