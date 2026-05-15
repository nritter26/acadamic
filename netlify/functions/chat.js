function analyzeUserCode(code, lang) {
    if (!code || !lang) return null;
    const hints = [];

    if (lang === 'js') {
        const unclosedBraces = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
        const unclosedParens = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        if (unclosedBraces > 0) hints.push('You have {unclosed curly braces}.');
        if (unclosedBraces < 0) hints.push('You have extra closing braces `}`.');
        if (unclosedParens > 0) hints.push('You have {unclosed parentheses}.');
        if (unclosedParens < 0) hints.push('You have extra closing parentheses.');
        if (!code.includes('return') && (code.includes('function') || code.includes('=>'))) {
            hints.push('Your function has no `return` statement.');
        }
        if (code.includes('==')) hints.push('Use `===` instead of `==` for strict equality.');
    }
    return hints.length > 0 ? hints : null;
}

const aiResponses = [
  { keywords: ['variable', 'declare', 'let', 'const', 'var'], response: "Variables store data in memory so you can reuse and manipulate values.\n\n**Syntax by language:**\n- **JS:** `let name = value;` (mutable), `const name = value;` (immutable)\n- **Python:** `name = value` (no keyword needed)\n- **Go:** `var name type = value` or `name := value` (type inference)\n- **Kotlin:** `var name = value` (mutable), `val name = value` (read-only)\n\n**Try this to experiment:**\n1. Declare a variable with your name\n2. Declare another with your age\n3. Print both using console.log / print()\n\n**Avoid:**\n- Using `var` in JS (function-scoped, causes bugs)\n- Forgetting keywords creates globals: `x = 5` without `let`/`const`/`var`\n- Using `const` for values that need to change later" },
  { keywords: ['function', 'method', 'def', 'func', '=>'], response: "Functions are reusable blocks of code that perform a specific task.\n\n**Syntax by language:**\n- **JS:** `function name(params) { ... }` or `const name = (params) => { ... }`\n- **Python:** `def name(params):`\n- **Go:** `func name(params) returnType { ... }`\n- **Rust:** `fn name(params) -> returnType { ... }`\n\n**Exercise:** Write a function that takes two numbers and returns their sum. Then call it and log the result.\n\n**Common pitfalls:**\n- Missing `return` — function returns `undefined` (JS) / `None` (Python)\n- Calling without `()`: `myFunc` vs `myFunc()`" },
  { keywords: ['class', 'object', 'oop', 'inherit', 'extends', 'prototype', 'struct'], response: "Object-Oriented Programming organizes code around objects.\n\n**Key concepts:**\n- **Encapsulation:** bundle data + methods, hide internal details\n- **Inheritance:** a class can extend another\n- **Polymorphism:** same interface, different behavior\n- **Composition:** building objects from other objects (prefer over inheritance)\n\n**Language differences:**\n- **JS/Python/Kotlin/C#:** traditional `class` syntax\n- **Go:** no classes — structs + methods\n- **Rust/Zig:** structs with traits/protocols\n\n**Exercise:** Create a `Person` class with `name`/`age`, add a `greet()` method, make an instance, and call it." },
  { keywords: ['array', 'list', 'collection', 'vector', 'slice', 'map', 'set', 'dictionary', 'hash'], response: "Collections let you store and manipulate groups of values.\n\n**Common types:**\n- **Array/Slice/List:** ordered sequence of values\n- **Map/Dict/Hash:** key-value pairs for fast lookups\n- **Set:** unique values (no duplicates)\n\n**Exercise:**\n1. Create an array of 5 numbers\n2. Write a loop to double each number\n3. Store results in a new array\n\n**Watch out for:**\n- Off-by-one: `arr[arr.length]` is out of bounds\n- `delete arr[i]` leaves a hole — use `.splice()` instead\n- Arrays are 0-indexed in virtually all languages" },
  { keywords: ['loop', 'for', 'while', 'iterate', 'foreach', 'for...of', 'for...in', 'range'], response: "Loops let you repeat code.\n\n**Types:**\n- **`for`:** when you know how many iterations\n- **`while`:** when you don't know the count\n- **`for...of` / `foreach`:** iterating over collections\n\n**Control:** `break` exits early, `continue` skips to next iteration.\n\n**Try:** Write a loop that prints 1 to 10, skips 5, and stops at 8.\n\n**Most common bugs:**\n- **Infinite loop:** forgetting to increment the counter\n- **Off-by-one:** using `<=` instead of `<`\n- Modifying an array while iterating over it" },
  { keywords: ['error', 'exception', 'try', 'catch', 'panic', 'throw', 'result', 'option'], response: "Error handling is how programs deal with unexpected situations.\n\n**By language:**\n- **JS/Python/C#:** `try { risky() } catch (e) { handle(e) }`\n- **Go:** `result, err := doSomething()` — check `err != nil`\n- **Rust:** `Result<T, E>` and `Option<T>` — pattern match or use `?`\n\n**Best practices:**\n- Catch specific error types, not generic `Exception`\n- Clean up resources in `finally`\n- Don't silently swallow errors" },
  { keywords: ['async', 'await', 'promise', 'future', 'coroutine', 'callback', 'goroutine', 'thread'], response: "Async programming lets your code handle time-consuming operations without blocking.\n\n**By language:**\n- **JS:** `async function` + `await promise`\n- **Python:** `async def` + `await`\n- **C#:** `async Task` + `await`\n- **Go:** goroutines (`go func()`) + channels\n\n**Mental model:** Like ordering coffee — get a buzzer (promise), do other things, it buzzes when ready (resolved).\n\n**Common mistakes:**\n- Forgetting `await` — you get a Promise instead of the value\n- Not handling rejections/crashes\n- Callback hell — use Promises or async/await" },
  { keywords: ['type', 'string', 'int', 'bool', 'float', 'null', 'undefined', 'void', 'any', 'generic'], response: "Types describe what kind of data a value is.\n\n**Static (TS, Go, Rust, C#, Java)** catch errors at compile time. **Dynamic (JS, Python)** are flexible but error-prone.\n\n**Oddities to know:**\n- **JS:** `typeof null === 'object'` — a longstanding bug!\n- **JS:** `'5' + 3 = '53'` but `'5' - 3 = 2`\n- **Python:** everything is an object\n- **Go:** zero values — `int` defaults to `0`, `string` to `\"\"`" },
  { keywords: ['git', 'commit', 'push', 'pull', 'branch', 'merge', 'rebase'], response: "Git tracks changes to your code over time.\n\n**Essential workflow:**\n1. `git add .` — stage changes\n2. `git commit -m \"message\"` — save snapshot\n3. `git push` — upload to remote\n\n**Try:**\n1. `git init` in a project\n2. Make changes, commit\n3. `git checkout -b my-experiment`\n4. Merge back to main\n\n**Pro tips:**\n- Use `--force-with-lease` not `--force` on shared branches\n- Always pull before pushing: `git pull --rebase`\n- Use `.gitignore` to keep secrets out" },
  { keywords: ['sql', 'select', 'join', 'table', 'database', 'query', 'where', 'insert', 'update', 'delete', 'index'], response: "SQL is the language of relational databases.\n\n**Core operations (CRUD):**\n- `SELECT` — retrieve data\n- `INSERT` — add data\n- `UPDATE` — modify data\n- `DELETE` — remove data\n\n**JOINs combine tables:** `INNER`, `LEFT`, `RIGHT`, `FULL`\n\n**Most common errors:**\n- **Missing WHERE in UPDATE/DELETE** — affects ALL rows!\n- **N+1 query:** looping instead of using JOIN\n- **No parameterized queries** = SQL injection\n\n**Try the Schema Designer** (click 'Schema' below the editor) to build tables visually!" },
  { keywords: ['debug', 'bug', 'fix', 'issue', 'wrong', 'not working', 'broken', 'error'], response: "Debugging is a systematic process:\n\n1. **READ** the error message — line number + description\n2. **REPRODUCE** — find exact conditions\n3. **ISOLATE** — comment out code until bug disappears\n4. **INSPECT** — `console.log()` to check values step by step\n5. **HYPOTHESIZE** — form a theory, test it\n6. **FIX** — smallest possible change\n7. **VERIFY** — does it work? Did it break anything?\n\nEvery bug is a learning opportunity!" },
  { keywords: ['help', 'how', 'what is', 'explain', 'understand', 'confused', 'beginner', 'start', 'learn'], response: "Here's my advice for effective learning:\n\n**The 4-step method:**\n1. **Read** the topic explanation\n2. **Type** the code yourself (don't copy-paste)\n3. **Modify** it — change values, add features, break it\n4. **Build** something small with the concept\n\n**I can help with:**\n- Explaining topics (\"Explain closures\")\n- Debugging code (share what you've tried)\n- Showing examples\n\n**What are you working on right now?**" },
  { keywords: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack', 'alloc', 'borrow', 'ownership'], response: "Memory management in systems languages (C, C++, Rust, Zig):\n\n**Stack:** fast, small, automatic (local variables). **Heap:** flexible, manual, larger (dynamic allocations).\n\n**By language:**\n- **C:** `malloc()`/`free()` — fully manual\n- **C++:** `new`/`delete`, smart pointers\n- **Rust:** Ownership — compiler enforces memory safety at compile time\n- **Zig:** Manual but safe — explicit allocators\n\n**Classic bugs:** memory leaks, dangling pointers, buffer overflow, double free" },
  { keywords: ['closure', 'scope', 'hoist', 'temporal dead zone', 'tdz', 'lexical'], response: "Scope determines WHERE variables are accessible.\n\n**A closure** is a function that remembers its outer variables even after the outer function returns.\n\n```js\nfunction makeCounter() {\n  let count = 0;\n  return function() { return ++count; };\n}\n```\n\n**Classic bug:** `var i` in a loop with async callbacks — use `let` to fix.\n\n**Hoisting:** `var` is hoisted (initialized as undefined), `let`/`const` are hoisted but NOT initialized (Temporal Dead Zone)." },
  { keywords: ['syntax', 'semicolon', 'bracket', 'parenthesis', 'brace', 'colon'], response: "Syntax errors are NORMAL — every programmer gets them daily.\n\n**Quick checklist:**\n1. Are all `(`, `{`, `[` properly closed?\n2. Are strings quoted with matching quotes?\n3. Are statements terminated? (`;` in JS/C#, newlines in Python)\n4. Are variable names spelled identically?\n5. Did you forget a comma between items?\n\n**The error message tells you the line number and what it expected.** Look at the line BEFORE the error too!" },
  { keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greeting', 'sup'], response: "Hey there! Welcome to Doge's Lab!\n\nI'm your AI programming tutor. I can:\n- **Explain concepts** from the curriculum\n- **Debug your code**\n- **Show examples** with runnable code\n- **Guide your learning** with exercises\n\n**To get started:** Pick a language, click a topic, read the explanation, try the code, and click Run! Ask me anything if you get stuck." },
  { keywords: ['string', 'concatenat', 'interpolat', 'template', 'char', 'substring', 'slice', 'split', 'trim'], response: "Strings are sequences of characters.\n\n**Common operations:**\n- **Length:** `str.length` (JS), `len(str)` (Python)\n- **Substring:** `str.slice(0, 5)`\n- **Split/Join:** `str.split(',')`, `arr.join(',')`\n- **Case:** `.toUpperCase()`, `.toLowerCase()`\n- **Trim:** `.trim()`\n\n**Interpolation:**\n- **JS:** `` `Hello, ${name}!` ``\n- **Python:** `f\"Hello, {name}!\"`\n- **C#:** `$\"Hello, {name}!\"`\n- **Go:** `fmt.Sprintf(\"Hello, %s!\", name)`\n\n**Important:** Strings are IMMUTABLE — methods return NEW strings." },
  { keywords: ['test', 'testing', 'unit test', 'assert', 'jest', 'mocha', 'pytest'], response: "Testing verifies your code works correctly.\n\n**Levels:**\n- **Unit tests:** test individual functions\n- **Integration tests:** components working together\n- **E2E tests:** full system\n\n**The AAA pattern:** Arrange, Act, Assert.\n\n**Why test?** Catches regressions, documents behavior, forces modular code, saves time long-term." },
  { keywords: ['recursion', 'recursive', 'base case', 'stack overflow'], response: "Recursion is when a function calls itself.\n\n**Two parts:**\n1. **Base case** — when to STOP\n2. **Recursive case** — call with a simpler version\n\n```js\nfunction factorial(n) {\n  if (n <= 1) return 1;       // base case\n  return n * factorial(n - 1); // recursive case\n}\n```\n\n**Watch out for:** stack overflow with too many calls, missing base case." },
]

export default async (req) => {
  const { message, lang, topic, code, output, hasError, history } = await req.json()
  if (!message) return Response.json({ reply: 'Ask me something about programming!' })
  const q = message.toLowerCase().trim()

  // ── Code-aware, error-aware help ──
  if (hasError || q.includes('error') || q.includes('bug') || q.includes('fix') || q.includes('wrong') || q.includes('not working') || q.includes('issue')) {
    let errorReply = ''

    if (code) {
      const analysis = analyzeUserCode(code, lang)
      if (analysis && analysis.length > 0) {
        errorReply = "I looked at your code and found some issues:\n\n" +
          analysis.map((h, i) => `${i + 1}. ${h}`).join('\n') + '\n\n'
      }
    }

    if (output && (output.includes('Error:') || output.includes('FAIL'))) {
      const cleanOutput = output.replace(/<[^>]*>/g, '').trim()
      errorReply += `**Your output:**\n\`\`\`\n${cleanOutput}\n\`\`\`\n\n`
    }

    if (!errorReply) {
      errorReply = "Let's debug systematically:\n\n**1.** What did you expect?\n**2.** What actually happened?\n**3.** What have you tried?\n\nShare your code and error message for specific help!"
    } else {
      errorReply += "**Need more?** Describe what you expected and I'll help step by step."
    }

    return Response.json({ reply: errorReply })
  }

  // ── Follow-up detection ──
  if (history && history.length >= 2) {
    const lastBotMsg = history.filter(h => h.role === 'bot').pop()
    if (lastBotMsg && (q.includes('yes') || q.includes('ok') || q.includes('sure') || q.includes('tell me more') || q.includes('example') || q.includes('show me'))) {
      const followUps = {
        'variable': "Practice: declare variables with your name and age, then print them!",
        'function': "Exercise: write an `add(a, b)` function that returns the sum, then call it.",
        'loop': "Practice: print numbers 1-10, then only even numbers.",
        'array': "Create an array of 3 favorite foods and print \"I like [food]\" for each.",
        'class': "Create a `Person` class with `name`/`age` and a `greet()` method."
      }
      for (const [key, reply] of Object.entries(followUps)) {
        if (lastBotMsg.text && lastBotMsg.text.toLowerCase().includes(key)) {
          return Response.json({ reply })
        }
      }
    }
    if (q.includes('thank')) {
      return Response.json({ reply: "You're welcome! Keep experimenting and asking questions. What next?" })
    }
  }

  // ── Topic-aware responses ──
  if (topic && (q.includes('what') || q.includes('how') || q.includes('explain') || q.includes('?') || q.length < 15)) {
    for (const entry of aiResponses) {
      if (topic && entry.keywords.some(k => topic.toLowerCase().includes(k))) {
        let reply = entry.response
        reply += `\n\n**You're studying:** ${topic}`
        reply += `\nTry the code example, modify it, and click Run!`
        return Response.json({ reply })
      }
    }
  }

  // ── Keyword matching ──
  for (const entry of aiResponses) {
    if (entry.keywords.some(k => q.includes(k))) {
      return Response.json({ reply: entry.response })
    }
  }

  if (q.includes('thank')) {
    return Response.json({ reply: "You're welcome! Keep learning — every expert was once a beginner!" })
  }

  if (q.includes('hello') || q.includes('hi ') || q === 'hey') {
    const langInfo = lang ? `I see you're studying **${lang.toUpperCase()}**. ` : ''
    return Response.json({ reply: `Hello! ${langInfo}Ask me about the topic you're working on!` })
  }

  if (topic) {
    return Response.json({ reply: `Great question about **${topic}**! What do you think the answer might be? Tell me your thought process and I'll help guide you!` })
  }

  const fallbacks = [
    "Could you tell me what language and topic you're working on? I'll explain it clearly.",
    "I'd love to help! Tell me what you're studying and I'll give you a clear explanation with examples.",
    "Ask me about a specific topic, paste your code for debugging, or pick a suggestion below!"
  ]
  return Response.json({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] })
}

export const config = {
  path: '/api/chat',
}
