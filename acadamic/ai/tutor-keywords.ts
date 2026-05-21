import fs from 'fs';
import path from 'path';

const LANG_NAMES_AI: Record<string, string> = {
  js: 'JavaScript', py: 'Python', go: 'Go', rs: 'Rust',
  c: 'C', cpp: 'C++', cs: 'C#', kt: 'Kotlin',
  swift: 'Swift', ts: 'TypeScript', zig: 'Zig',
};

const GREETINGS: RegExp[] = [
  /^(hi|hello|hey|howdy|yo|sup|greetings|good\s*(morning|afternoon|evening))[.!]*$/i,
  /^(what'?s up|wassup|how are you|how'?s it going)[!?]*$/i,
];

const THANKS: RegExp[] = [
  /\b(thanks?|thank\s*you|thx|ty|appreciate\s*(it|that)|that\s*helps|got\s*it)\b/i,
  /\b(make\s*sense|clear|understood|understood)\b/i,
];

const FOLLOW_UP: RegExp[] = [
  /\b(what\s*about|how\s*(about|do\s*i)|what\s*next|next|continue|more|elaborate|expand)\b/i,
  /\b(can\s*you\s*(give|show|tell)\s*(me\s*)?(more|an?\s*example))\b/i,
  /^(and\s*then|so\s*what|tell\s*me\s*more|go\s*on)$/i,
];

const ERROR_KEYWORDS: RegExp[] = [
  /error|bug|fix|wrong|not\s*working|issue|broken|crash|fail|exception|unexpected/i,
  /(doesn'?t|does\s*not|isn'?t|is\s*not|won'?t|will\s*not)\s*work/i,
  /\b(TypeError|ReferenceError|SyntaxError|RangeError|undefined|null|NaN)\b/,
  /(\d{2,}:\d{2}:\d{2}|line\s*\d+|at\s+\w+)/i,
  /(stack\s*trace|traceback|error\s*message)/i,
];

const TOPIC_KEYWORDS: Record<string, RegExp> = {
  variable: /variab|let|const|var|declar|assign|muta|scope/i,
  function: /function|func|fn|method|def|return|arrow|lambda|callback/i,
  string: /string|str|template.*literal|concatenat|char|text/i,
  number: /number|int|float|numeric|arithmetic|math|parseInt|parseFloat|toFixed/i,
  boolean: /boolean|bool|true|false|truthy|falsy|logical|comparison|if.*else|condition/i,
  array: /array|list|vector|slice|splice|push|pop|map|filter|reduce|forEach|index/i,
  object: /object|dictionary|map|hash|property|key.*value|json|record|struct/i,
  class: /class|constructor|extend|inherit|prototype|oop|object.orient/i,
  promise: /promise|async|await|then|catch|future|defer/i,
  loop: /loop|for|while|do.*while|iterate|foreach/i,
  type: /type|interface|generic|enum|typedef|type.*annotation|static.*typing/i,
  null: /null|undefined|nil|none|option|maybe|optional/i,
  error_handling: /try|catch|throw|except|error.*handl|panic|result|unwrap/i,
  import: /import|export|require|module|include|using|namespace|use\s+/i,
  io: /print|log|read|input|output|file|console|stdin|stdout/i,
  comment: /comment|docstring|document|documentation|\/\/|\/\*/i,
  operator: /operator|\+|-|\*|\/|%|\+\+|--|compound|assignment/i,
  recursion: /recurs|stack|base\s*case|tail\s*call/i,
  closure: /closur|lexical.*scope|inner.*function|capture/i,
  generics: /generic|template|type.*param|trait.*bound/i,
  pointer: /pointer|ref|deref|borrow|address|\*const|\*mut/i,
  pattern_match: /match|pattern|switch|case|destructur|deconstruct/i,
  concurrency: /concurr|parallel|thread|async.*task|goroutine|channel|tokio|spawn/i,
  testing: /test|assert|spec|unit\s*test|mock|tdd/i,
  module: /module|package|crate|namespace|import|export|pub/i,
};

interface KeywordResult {
  response: string;
  source: string;
}

const SOCRATIC_PROMPTS: string[] = [
  "What have you tried so far? Let's start there.",
  "Let me ask you: what do you think should happen here?",
  "Can you explain what this code is supposed to do, in your own words?",
  "Try reading the error message carefully — it usually tells you exactly what's wrong.",
  "What would you expect to see if you added a `console.log()` right before this line?",
  "Think about what type that value is — does the operation make sense for that type?",
  "Let's break this down. What's the first thing that happens when this code runs?",
  "Have you checked the documentation for that method? What does it say it returns?",
  "Try changing one thing at a time and see what happens. Debugging is experimental!",
  "What similar problems have you solved before? Can you apply the same pattern here?",
];

export function getSocratic(): string {
  return SOCRATIC_PROMPTS[Math.floor(Math.random() * SOCRATIC_PROMPTS.length)];
}

export function getGreet(): string {
  const greets = [
    "Hey there! I'm Devin, your coding buddy. What are you working on?",
    "Hello! Ready to learn some code? I'm here to help!",
    "Hi! Stuck on something? Just ask — I've got your back.",
    "Hey! What programming challenge are we tackling today?",
  ];
  return greets[Math.floor(Math.random() * greets.length)];
}

export function getThank(): string {
  const thanks = [
    "You're welcome! Keep up the great work!",
    "Happy to help! That's what I'm here for.",
    "No problem! What's next on your learning journey?",
    "Glad that helped! Don't forget to practice to make it stick.",
  ];
  return thanks[Math.floor(Math.random() * thanks.length)];
}

export function detectLangFromMsg(msg: string): string | null {
  const lower = msg.toLowerCase();
  if (/\b(python|py\b)/.test(lower) && !/\b(py\s+script|pypy)\b/.test(lower)) return 'py';
  if (/\b(javascript|js\b)/.test(lower) && !/\b(jsx|json)\b/.test(lower)) return 'js';
  if (/\b(typescript|ts\b)/.test(lower)) return 'ts';
  if (/\b(golang|go\s+lang)\b/.test(lower) || (/\bgo\b/.test(lower) && /\b(goroutine|gopath|gofmt|package|import|func\s+main)\b/.test(lower))) return 'go';
  if (/\brust\b/.test(lower) && !/\brusty\b|rust[- ]proof|surface\s+rust/.test(lower)) return 'rs';
  if (/\b(c\s*(\+\+|plus\s*plus)|cpp)\b/.test(lower)) return 'cpp';
  if (/\b(c\s*sharp|csharp)\b/.test(lower)) return 'cs';
  if (/\bkotlin\b/.test(lower)) return 'kt';
  if (/\bswift\b/.test(lower)) return 'swift';
  if (/\bzig\b/.test(lower)) return 'zig';
  if (/\bc\b/.test(lower) && /\b(pointer|malloc|free|printf|scanf|struct|union|sizeof)\b/.test(lower)) return 'c';
  return null;
}

export function getCurrContext(message: string, topic?: string): { type: string; topic?: string | null } {
  const lower = message.toLowerCase();
  const isFollowUp = FOLLOW_UP.some(r => r.test(message));
  if (topic && isFollowUp) return { type: 'followup', topic };
  if (isFollowUp) return { type: 'followup', topic: null };
  if (topic) return { type: 'topic', topic };
  return { type: 'general' };
}

function matchTopic(message: string): string[] {
  const lower = message.toLowerCase();
  const matches: string[] = [];
  for (const [topic, pattern] of Object.entries(TOPIC_KEYWORDS)) {
    if (pattern.test(lower)) {
      matches.push(topic);
    }
  }
  return matches;
}

function curriculumSearch(message: string, lang?: string): { phase: string; topic: string; content: string }[] {
  try {
    const contentDir = path.join(__dirname, '..', 'content');
    const langFile = path.join(contentDir, (lang || 'js') + '.json');
    if (fs.existsSync(langFile)) {
      const data = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
      const topics = matchTopic(message);
      const results: { phase: string; topic: string; content: string }[] = [];
      for (const [phase, phaseData] of Object.entries(data)) {
        for (const [topicName, topicContent] of Object.entries(phaseData as Record<string, unknown>)) {
          const lowerTopic = topicName.toLowerCase();
          const contentStr = Array.isArray(topicContent) ? (topicContent as string[])[0] : ((topicContent as Record<string, string>).exp || (topicContent as Record<string, string>).code || '');
          if (topics.some(t => lowerTopic.includes(t)) ||
              topics.some(t => contentStr.toLowerCase().includes(t))) {
            results.push({ phase, topic: topicName, content: contentStr.slice(0, 200) });
          }
        }
      }
      return results.slice(0, 3);
    }
  } catch {
    return [];
  }
  return [];
}

function handleErrorHelp(message: string, code?: string, lang?: string, hasError?: boolean): string | null {
  const lower = message.toLowerCase();
  let response = '';
  if (hasError === undefined || hasError === null) {
    hasError = /error|bug|fix|wrong|not\s*working|issue|broken|crash|fail|exception/i.test(lower);
  }

  if (hasError || code) {
    const langName = LANG_NAMES_AI[lang || ''] || lang || 'your code';

    if (/undefined/.test(lower) || (code && /undefined/.test(code))) {
      response = `It looks like you're dealing with an **undefined** value. This usually means:\n\n1. The variable hasn't been declared yet\n2. The variable is out of scope\n3. A function didn't return what you expected\n4. A property doesn't exist on the object\n\n**Try this:** add a \`console.log()\` right before the error to check what the value actually is. Also check that the variable name is spelled exactly the same everywhere (JavaScript is case-sensitive!).`;
      return response;
    }

    if (/null/.test(lower) || (code && /null/.test(code))) {
      response = `A **null** value error means something that should have a value is empty.\n\nCommon causes:\n1. A function returned \`null\` because it couldn't find what you asked for\n2. An API call hasn't loaded yet\n3. A DOM element doesn't exist yet\n\n**Fix:** Check if the value is \`null\` before using it: \`if (value !== null) { ... }\` or use optional chaining: \`value?.property\`.`;
      return response;
    }

    if (/type\s*error|cannot\s*read\s*property/i.test(lower) || /TypeError/.test(lower)) {
      response = `**TypeError** means you're trying to do something with a value that doesn't support that operation.\n\nExample: \`undefined.something\` or \`null()\`\n\n**Fix:** Check what type your value actually is using \`typeof\` or \`console.log()\`. Then make sure you're only calling methods that exist for that type.`;
      return response;
    }

    if (/syntax/i.test(lower) || /SyntaxError|Unexpected token|Unexpected identifier/i.test(lower)) {
      response = `**SyntaxError** means the ${langName} parser can't understand your code.\n\nCommon causes:\n1. Missing closing bracket \`}\`, \`]\`, or \`)\`\n2. Missing comma in an object or array\n3. Using a keyword as a variable name\n4. Forgetting quotes around a string\n\n**Fix:** Look at the line number in the error message. Check that all brackets are matched and all strings are quoted properly.`;
      return response;
    }
  }
  return null;
}

function handleTopicHelp(message: string, lang?: string): string | null {
  const topics = matchTopic(message);
  if (topics.length === 0) return null;

  const langName = LANG_NAMES_AI[lang || ''] || lang || 'programming';
  const topic = topics[0];

  const topicResponses: Record<string, string> = {
    variable: `**Variables** are containers for storing data values. In ${langName}:\n\n• Use descriptive names like \`userCount\` instead of \`x\`\n• Choose the right declaration keyword\n• Think about scope — where can this variable be accessed?\n\nWant me to show you an example of declaring and using variables in ${langName}?`,
    function: `**Functions** are reusable blocks of code. In ${langName}:\n\n• They take inputs (parameters) and return outputs\n• Good functions do ONE thing well\n• Name them with verbs like \`calculateTotal\` or \`getUserName\`\n\nWould you like to see a ${langName} function example?`,
    string: `**Strings** represent text data. In ${langName}:\n\n• Use quotes or template literals to create them\n• Common operations: concatenation, slicing, searching, replacing\n• Strings are usually immutable — operations return new strings\n\nWant string manipulation examples for ${langName}?`,
    array: `**Arrays/Lists** hold ordered collections of items. In ${langName}:\n\n• Access items by index (usually starting at 0)\n• Common operations: add, remove, find, filter, transform\n• Arrays can hold mixed types in some languages\n\nWant to see array operations in ${langName}?`,
    object: `**Objects/Dictionaries** hold key-value pairs. In ${langName}:\n\n• Keys are usually strings, values can be any type\n• Access properties with dot notation \`obj.prop\` or bracket notation \`obj["prop"]\`\n• Useful for grouping related data\n\nShow me an object example in ${langName}?`,
    class: `**Classes** are blueprints for creating objects. In ${langName}:\n\n• Define properties and methods\n• Support inheritance (extending from parent classes)\n• Help organize code following OOP principles\n\nWant to see a class example in ${langName}?`,
    loop: `**Loops** let you repeat code. In ${langName}:\n\n• \`for\` loops: when you know how many times\n• \`while\` loops: when you have a condition to check\n• Be careful of infinite loops! Always make sure the condition will eventually be false\n\nNeed a loop example for ${langName}?`,
    promise: `**Promises/Async** handle asynchronous operations. In ${langName}:\n\n• A promise represents a future value\n• Use \`async/await\` for cleaner code than raw callbacks\n• Always handle errors with \`try/catch\` or \`.catch()\`\n\nWant to see async patterns in ${langName}?`,
    type: `**Types** define what kind of data a value can hold. In ${langName}:\n\n• Static types catch errors at compile time\n• Types include: numbers, strings, booleans, and complex types\n• Good type systems balance safety with flexibility\n\nInterested in type examples for ${langName}?`,
    error_handling: `**Error Handling** helps your code fail gracefully:\n\n• Use try/catch (or similar) to handle expected errors\n• Always clean up resources in error cases\n• Think about what CAN go wrong, not just the happy path\n\nWant error handling examples for ${langName}?`,
    boolean: `**Booleans** represent true/false values — the foundation of decision-making in code. In ${langName}:\n\n• Used in conditions: \`if\`, \`while\`, ternary operators\n• Logical operators: AND (\`&&\`), OR (\`||\`), NOT (\`!\`)\n• Comparison operators produce booleans: \`===\`, \`>\`, \`<=\`, \`!==\`\n• Truthy/falsy coercion can surprise you — use strict equality\n\nWant to practice boolean logic with examples in ${langName}?`,
    number: `**Numbers** are used for arithmetic, counters, measurements, and indices. In ${langName}:\n\n• Integers vs floating-point: \`5\` vs \`5.5\`\n• Watch for precision issues: \`0.1 + 0.2 !== 0.3\` in many languages\n• Operator precedence: multiplication before addition (use parentheses!)\n• Overflow: numbers have limits — BigInt (JS), \`i64\`/\u0064ecimal (other langs)\n\nNeed help with numeric operations or math problems in ${langName}?`,
    null: `**Null/Undefined/None** represents the absence of a value. Each language handles it differently:\n\n• **JS:** \`null\` (intentional absence), \`undefined\` (uninitialized)\n• **Python:** \`None\` (the one null-like value)\n• **Go:** zero values (\`0\`, \`""\`, \`false\`, \`nil\` for pointers/slices/maps)\n• **Rust:** \`Option<T>\` — \`None\` variant, no null at all!\n• **Kotlin:** nullable types with \`?\` — \`String?\` vs \`String\`\n\n**Null reference bug** (Tony Hoare's "billion-dollar mistake"): always check for null before using a value. Use optional chaining (\`value?.prop\`) or null checks to stay safe.`,
    io: `**Input/Output (I/O)** lets your program interact with the outside world. In ${langName}:\n\n• **Console output:** \`console.log()\` (JS), \`print()\` (Python), \`fmt.Println()\` (Go)\n• **User input:** \`prompt()\` (JS/browser), \`input()\` (Python), \`fmt.Scan()\` (Go)\n• **File I/O:** read/write files with the filesystem API\n• **Network I/O:** HTTP requests, WebSockets, database queries\n\n**Key insight:** Most I/O operations are slow (millions of CPU cycles vs nanoseconds). Use async patterns and buffering to keep your program responsive.`,
    comment: `**Comments** are notes in your code that the computer ignores. They're for human readers — including your future self! In ${langName}:\n\n• Single-line: \`// comment\` (JS/C/C#/Go/Rust/Kotlin/Swift), \`# comment\` (Python)\n• Multi-line: \`/* comment */\` (most C-style languages), \`\"\"\"comment\"\"\"\` (Python docstrings)\n\n**Good comments explain WHY, not WHAT.** The code itself should show WHAT it does. Use comments for:\n1. **Why** a decision was made (tradeoffs, constraints)\n2. **Complex logic** that isn't obvious from reading\n3. **TODO/FIXME** markers for work-in-progress\n4. **Documentation** for public APIs (JSDoc, docstrings)\n\n**Bad comment:** \`// increment i by 1\` next to \`i++\` — the code already says that!`,
    operator: `**Operators** are symbols that perform operations on values. In ${langName}:\n\n• **Arithmetic:** \`+\`, \`-\`, \`*\`, \`/\`, \`%\` (modulo/remainder)\n• **Comparison:** \`===\`, \`!==\`, \`>\`, \`<\`, \`>=\`, \`<=\`\n• **Logical:** \`&&\` (AND), \`||\` (OR), \`!\` (NOT)\n• **Assignment:** \`=\`, \`+=\`, \`-=\`, \`*=\`, etc.\n• **Bitwise:** \`&\`, \`|\`, \`^\`, \`~\`, \`<<\`, \`>>\` (lower-level)\n\n**Watch out for:**\n- Operator precedence — \`2 + 3 * 4\` is \`14\`, not \`20\`!\n- Short-circuit evaluation: \`false && anything\` never evaluates \`anything\`\n- Type coercion in JS: \`"5" - 3\` is \`2\` but \`"5" + 3\` is \`"53"\``,
    recursion: `**Recursion** is when a function calls itself. It's elegant for problems with self-similar structure (trees, divide-and-conquer, backtracking). In ${langName}:\n\n**Every recursive function needs:**\n1. **Base case** — when to stop (without this: infinite recursion → stack overflow!)\n2. **Recursive case** — call itself with a simpler version of the problem\n\n\`\`\`\n// Factorial example\nfunction factorial(n) {\n  if (n <= 1) return 1;       // base case\n  return n * factorial(n - 1); // recursive case\n}\n\`\`\`\n\n**When to use:** tree traversal, parsing, backtracking (mazes, Sudoku), divide-and-conquer (quicksort, mergesort). **When to avoid:** simple iteration, very deep recursion (call stack limit), performance-critical paths.\n\n**Tail call optimization:** Some languages optimize tail-recursive functions (no stack growth). JS/Python generally don't — use loops for deep recursion in those.`,
    closure: `**Closures** are functions that "remember" the variables from where they were defined, even after the outer function has finished running. In ${langName}:\n\n\`\`\`\nfunction makeCounter() {\n  let count = 0;\n  return function() { return ++count; };\n}\nconst counter = makeCounter();\ncounter(); // 1 — count is still accessible!\ncounter(); // 2\n\`\`\`\n\n**Common uses:**\n- **Data privacy:** create private variables (the counter pattern)\n- **Function factories:** generate customized functions\n- **Event handlers:** capture state at creation time\n- **Partial application:** pre-fill some arguments\n\n**The classic loop bug (JS):**\n\`\`\`\nfor (var i = 0; i < 5; i++) {\n  setTimeout(() => console.log(i), 100); // prints 5,5,5,5,5\n}\n\`\`\`\n**Fix:** use \`let\` (block scoping) or an IIFE to capture each iteration's value.`,
    generics: `**Generics/Templates** let you write code that works with ANY type while keeping type safety. Instead of writing separate functions for \`int\`, \`string\`, and \`float\`, you write one that works for all. In ${langName}:\n\n**Why they matter:**\n- **Reusability:** one function, infinite types\n- **Type safety:** errors caught at compile time, not runtime\n- **Performance:** monomorphization (specialized code per type) has no runtime cost\n\n**Examples by language:**\n- **TS:** \`function identity<T>(arg: T): T { return arg; }\`\n- **Rust:** \`fn identity<T>(arg: T) -> T { arg }\`\n- **Go:** \`func identity[T any](arg T) T { return arg }\`\n- **C#:** \`T Identity<T>(T arg) => arg;\`\n- **Java:** \`<T> T identity(T arg) { return arg; }\`\n- **C++:** \`template<typename T> T identity(T arg) { return arg; }\`\n\n**Constraints:** \`<T extends Comparable>\` or \`T: Display\` — restrict what types are allowed. This lets you call methods on T safely.`,
    pointer: `**Pointers** are variables that store memory addresses instead of values. They're fundamental in systems programming (C, C++, Rust, Zig) and exist implicitly in many other languages. In ${langName}:\n\n**Why use pointers?**\n- **Efficiency:** pass large data by address instead of copying\n- **Mutation:** modify data through a reference\n- **Dynamic allocation:** create data of variable size on the heap\n\n**Key operations:**\n- \`&x\` — "address of" (C/C++), get the pointer\n- \`*p\` — "dereference" (C/C++), get the value at the address\n- \`->\` — dereference + member access (C/C++)\n\n**In higher-level languages:**\n- **JS/Python:** all objects are references (pointers under the hood)\n- **Go:** explicit pointers but no pointer arithmetic\n- **Rust:** references (\`&\`) with borrow-checker safety (no dangling pointers!)\n- **Zig:** explicit allocators, pointers are typed and safe\n\n**Always initialize pointers!** Uninitialized pointers cause crashes and security holes.`,
    pattern_match: `**Pattern Matching** lets you destructure and branch on data shapes in a clean, exhaustive way. It's a powerful alternative to long if-else chains. In ${langName}:\n\n**Examples by language:**\n- **Rust:** \`match value { Pattern => action, _ => default }\` — must cover all cases (exhaustive)!\n- **Python 3.10+:** \`match value: case Pattern: ...\` (structural pattern matching)\n- **Kotlin:** \`when (value) { Pattern -> action }\`\n- **TypeScript:** \`switch\` with discriminated unions + type narrowing\n- **C#:** \`switch\` expression: \`value switch { Pattern => result }\`\n\n**What you can do:**\n- **Destructure:** extract parts of a value (\`Some(x)\` → bind \`x\`)\n- **Guard:** add conditions (\`x if x > 0 => ...\`)\n- **Range:** match numeric ranges\n- **Nested:** match deeply nested structures\n\n**The killer feature: exhaustiveness.** The compiler warns you if you miss a case — no more runtime errors from unhandled branches!`,
    concurrency: `**Concurrency** lets your program handle multiple tasks seemingly at the same time. It's essential for modern software: servers, UIs, data processing. In ${langName}:\n\n**Concurrency vs Parallelism:**\n- **Concurrency:** dealing with many tasks at once (structure)\n- **Parallelism:** doing many tasks at once (execution)\n\n**Each language's approach:**\n- **JS:** single-threaded event loop + async/await (great for I/O, not CPU)\n- **Python:** GIL limits true parallelism — use \`asyncio\` for I/O, \`multiprocessing\` for CPU\n- **Go:** goroutines + channels — lightweight, built-in, beautiful\n- **Rust:** \`async/await\` with tokio, plus \`std::thread\` — fearless concurrency\n- **C#:** \`async Task\` with TPL — mature and performant\n- **Kotlin:** coroutines — structured concurrency\n\n**Common patterns:**\n- **Producer/Consumer:** one task produces data, another consumes it\n- **Fan-out/Fan-in:** distribute work, collect results\n- **Pipeline:** each stage processes and passes to the next\n\n**Danger zone:** race conditions, deadlocks, data races — always use proper synchronization!`,
    testing: `**Testing** verifies your code does what it's supposed to. Good tests give you confidence to refactor and ship. In ${langName}:\n\n**Testing levels:**\n- **Unit tests:** test one function/class in isolation (fast, focused)\n- **Integration tests:** test components working together\n- **E2E tests:** test the full system (slow but thorough)\n\n**The AAA pattern (Arrange-Act-Assert):**\n1. **Arrange** — set up data and preconditions\n2. **Act** — call the function under test\n3. **Assert** — check the result matches expectations\n\n\`\`\`\n// Example (Jest-style)\ntest('adds 1 + 2 to equal 3', () => {\n  expect(add(1, 2)).toBe(3);\n});\n\`\`\`\n\n**What to test:**\n- Happy path (normal inputs)\n- Edge cases (empty, zero, null, boundary values)\n- Error cases (invalid input, failures)\n- Regressions (bugs you've fixed — write a test first!)\n\n**Code coverage != good testing.** 100% coverage with weak assertions is useless. Focus on meaningful assertions about behavior.`,
    module: `**Modules** let you split code across files, each with a clear responsibility. They prevent naming collisions and make projects maintainable. In ${langName}:\n\n**Key concepts:**\n- **Export:** make functions/variables/types available to other files\n- **Import:** bring in exports from other files\n- **One module = one concern** — keep files focused (< 200 lines)\n\n**Syntax by language:**\n- **JS (ESM):** \`export function foo() {}\` / \`import { foo } from './bar.js'\`\n- **Python:** \`def foo(): ...\` (everything is public) / \`from bar import foo\`\n- **Go:** lowercase = private, uppercase = exported / \`import "module/pkg"\`\n- **Rust:** \`pub fn foo() {}\` / \`use crate::module::foo;\`\n- **C#:** \`public class Foo {}\` / \`using Namespace;\`\n\n**Circular dependencies** — when A imports B and B imports A — cause bugs in every language. Break the cycle by extracting shared logic into a third module.`,
  };

  const langSpecificContent: Record<string, Record<string, string>> = {
    type: {
      js: `**Types** in JavaScript are dynamic — a variable can hold any type. Use \`typeof\` to check: \`typeof 'hello'\` → \`'string'\`. JS has **primitives** (string, number, boolean, null, undefined, symbol, bigint) and **reference types** (objects, arrays, functions). Type mismatches show up at runtime.\n\n**Key difference from static languages:** no compile-time type checking. Use \`typeof\` and \`instanceof\` for runtime checks, or switch to TypeScript for static types.`,
      ts: `**Types** in TypeScript are static and checked at compile time. Annotate: \`let name: string = 'hello'\`. TS adds: interfaces, type aliases, union types (\`string | number\`), generics, and utility types (\`Partial<T>\`, \`Pick<T,K>\`). Type inference means you don't always need annotations.\n\n**The real power:** the type system catches entire classes of bugs before you run the code. Use strict mode (\`"strict": true\`) for maximum safety.`,
      rs: `**Types** in Rust are statically checked and fully inferred within function bodies. Key types: \`i32\`, \`u64\`, \`f64\`, \`bool\`, \`char\`, \`String\`, \`&str\`, tuples, arrays, \`Vec<T>\`, \`Option<T>\`, \`Result<T, E>\`.\n\n**Rust's type system enforces memory safety through ownership** — no garbage collector needed! The borrow checker verifies your types at compile time.`,
      py: `**Types** in Python are dynamic and checked at runtime. Python 3.5+ supports **type hints** (PEP 484) for documentation and tooling: \`def greet(name: str) -> str:\`. These aren't enforced at runtime — use \`mypy\` for static checking.\n\n**Duck typing:** "If it walks like a duck and quacks like a duck, it's a duck." Python cares about behavior, not explicit types.`,
      go: `**Types** in Go are static with type inference via \`:=\`. Go has basic types (\`int\`, \`float64\`, \`string\`, \`bool\`) and composite types (\`struct\`, \`slice\`, \`map\`, \`chan\`, \`interface\`).\n\n**Zero values:** variables without explicit initialization get zero values (0, "", false, nil). No null pointer exceptions from uninitialized variables!`,
    },
    object: {
      js: `**Objects** in JavaScript are key-value collections with prototype-based inheritance. Every object has a hidden \`[[Prototype]]\` link. Use \`Object.keys()\`, \`Object.values()\`, \`Object.entries()\` for iteration.\n\n**Reference semantics:** objects are passed by reference — \`obj2 = obj1\` doesn't copy! Use \`Object.assign()\`, spread (\`{...obj}\`), or \`structuredClone(obj)\` for copies.\n\n**Prototype chain:** \`obj.toString()\` works because JS walks up the prototype chain until it finds \`toString\` on \`Object.prototype\`.`,
      py: `**Dictionaries** in Python store key-value pairs: \`{'name': 'Alice', 'age': 30}\`. Access with \`d['key']\` (raises KeyError if missing) or \`d.get('key', default)\` (safe). Python 3.7+ preserves insertion order.\n\n**Everything is an object in Python!** Classes, functions, even modules are objects. Use \`__dict__\` to access an object's attribute dictionary.`,
      rs: `**Structs** in Rust are custom data types: \`struct User { name: String, age: u32 }\`. Access fields with dot notation: \`user.name\`. Structs can have methods via \`impl\` blocks.\n\n**Ownership:** structs own their data. To share without moving ownership, use references (\`&User\`) or smart pointers (\`Rc<T>\`, \`Arc<T>\`).`,
    },
    pointer: {
      js: `JavaScript doesn't have explicit **pointers**, but understanding reference vs value is crucial:\n\n• **Primitives** (string, number, boolean, null, undefined, symbol, bigint): passed by **value** — \`let a = 5; let b = a; b = 10;\` doesn't change \`a\`\n• **Objects** (arrays, functions, dates): passed by **reference** — \`let obj1 = {x: 1}; let obj2 = obj1; obj2.x = 2;\` changes \`obj1.x\` too!\n• For deep copies: \`JSON.parse(JSON.stringify(obj))\` or \`structuredClone(obj)\``,
      rs: `Rust has **references** (\`&T\`, \`&mut T\`) which are safe pointers checked by the borrow checker:\n• Only **one** mutable reference OR **many** immutable references (never both)\n• References are **always valid** — no dangling pointers\n• \`*\` dereferences, \`&\` takes a reference\n• Raw pointers (\`*const T\`, \`*mut T\`) exist but require \`unsafe\` to dereference\n\n**The Rust guarantee:** no garbage collector, no null pointer exceptions, no use-after-free.`,
      go: `Go has **pointers** but no pointer arithmetic: \`var p *int\`. Use \`&\` to get address, \`*\` to dereference: \`p = &x; fmt.Println(*p)\`.\n\n**Key differences from C:**\n• No pointer arithmetic (prevents buffer overflows)\n• Zero value of pointer is \`nil\` — dereferencing \`nil\` panics\n• Slices and maps are reference types — they already contain pointers to underlying data\n• Pass by value, but use pointers to mutate: \`func update(p *Person) { p.Name = "new" }\``,
    },
  };

  const generic = topicResponses[topic];
  if (!generic) return null;
  const perLang = langSpecificContent[topic];
  if (perLang && lang && perLang[lang]) {
    return perLang[lang] + `\n\nWant to learn more about ${topic}s in ${langName}?`;
  }
  return generic;
}

export function runKeywordTutor(
  message: string,
  lang?: string,
  topic?: string,
  code?: string,
  hasError?: boolean,
): KeywordResult | null {
  const lower = message.trim().toLowerCase();

  if (GREETINGS.some(r => r.test(message))) {
    return { response: getGreet(), source: 'keyword' };
  }

  if (THANKS.some(r => r.test(message))) {
    return { response: getThank(), source: 'keyword' };
  }

  if (/w(hat|ho|hy|hen|here|hich|hom)|how|can you|could you|please|tell/i.test(lower) &&
      /\b(i('m| am|'d| would)|you|your)\b/i.test(lower) &&
      /(devin|buddy|tutor|bot|assistant)/i.test(lower)) {
    return { response: "I'm Devin! I'm here to help you learn programming. Ask me about specific topics, paste your code if something's broken, or tell me what you're trying to build. What do you need help with?", source: 'keyword' };
  }

  if (code && code.length > 3) {
    if (hasError || /error|bug|fix|wrong|issue|broken/i.test(lower)) {
      return { response: "I see you've shared some code. Let me look at it and help you figure out what's going on. Can you tell me what you expect it to do and what's actually happening?", source: 'keyword' };
    }
    return { response: "Thanks for sharing your code! What would you like to know about it? I can help explain how it works, find bugs, or suggest improvements.", source: 'keyword' };
  }

  const errorHelp = handleErrorHelp(message, code, lang);
  if (errorHelp) {
    return { response: errorHelp, source: 'keyword' };
  }

  const topicHelp = handleTopicHelp(message, lang);
  if (topicHelp) {
    return { response: topicHelp, source: 'keyword' };
  }

  if (/lang|program|learn/i.test(lower) &&
      /(recommend|suggest|which|best|what|start|beginner)/i.test(lower)) {
    return { response: "Great question! If you're new to programming:\n\n• **JavaScript**: Great all-rounder, runs in browsers and servers\n• **Python**: Beginner-friendly, popular for data science and automation\n• **Go**: Fast, simple, great for backend services\n\nWhat kind of projects interest you? I can help you pick the best language for your goals!", source: 'keyword' };
  }

  const followUp = FOLLOW_UP.some(r => r.test(message));
  if (followUp) {
    return { response: "Sure! What specific part would you like me to elaborate on? If you mention a topic, I can dive deeper into it.", source: 'keyword' };
  }

  if (/practice|exercis|challenge|problem|project/i.test(lower) &&
      /(give|want|need|have|some|a\s)/i.test(lower)) {
    const langName = LANG_NAMES_AI[lang || ''] || 'programming';
    return { response: `Here's a quick ${langName} practice idea: try writing a program that converts temperatures between Celsius and Fahrenheit. Start with a function that takes a temperature and the conversion direction. Want more specific practice problems?`, source: 'keyword' };
  }

  if (lower.length < 3) {
    return { response: getSocratic(), source: 'keyword' };
  }

  return null;
}
