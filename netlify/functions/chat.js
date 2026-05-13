const aiResponses = [
  { keywords: ['variable', 'declare', 'let', 'const', 'var'], response: "Variables store data values. Use `let`/`const` in JS, `var`/`val` in Kotlin, `:=` in Go, or just `name = value` in Python. Pick the right scope for your use case.\n\n**Common mistakes:**\n- Using `var` instead of `let`/`const` (JS) — causes scope bugs\n- Forgetting `let`/`const`/`var` makes a global variable (JS)\n- Using `const` for values that need to change — use `let` with `const` for constants only" },
  { keywords: ['function', 'method', 'def', 'func'], response: "Functions are reusable blocks. `function name(){}` in JS, `def name():` in Python, `func name(){}` in Go, `fun name(){}` in Kotlin. Keep them short and focused on one task.\n\n**Common mistakes:**\n- Missing `return` statement — function returns `undefined`\n- Forgetting parentheses when calling: `myFunc` vs `myFunc()`\n- Mutating input parameters directly — creates side effects" },
  { keywords: ['class', 'object', 'oop', 'inherit', 'extends', 'prototype'], response: "OOP organizes code around objects. Classes define blueprints: JS/Python/Kotlin/C# use `class`, Go uses structs+methods, Zig uses structs with no inheritance. Favor composition over inheritance.\n\n**Key concepts:**\n- Encapsulation: keep internal state private\n- Polymorphism: same interface, different behavior\n- Composition: has-a vs is-a relationships" },
  { keywords: ['array', 'list', 'collection', 'map', 'set'], response: "Collections hold multiple values. Arrays are fixed-size. Lists/Slices grow dynamically. Maps store key-value pairs. Choose the right collection for your access pattern.\n\n**Common mistakes:**\n- Off-by-one errors: `arr[arr.length]` is out of bounds\n- Using `delete arr[i]` (leaves hole) instead of `splice()`\n- Forgetting arrays are 0-indexed" },
  { keywords: ['loop', 'for', 'while', 'iterate', 'foreach'], response: "Loops repeat code. `for` is universal. `while` runs while a condition is true. `forEach`/`map` provide functional iteration. Use `break` to exit early, `continue` to skip.\n\n**Common mistakes:**\n- Infinite loops: forgetting to increment counter\n- Off-by-one: using `<=` instead of `<`\n- Modifying an array while iterating over it" },
  { keywords: ['error', 'exception', 'try', 'catch', 'panic', 'throw'], response: "Error handling: JS/Python/C# use try/catch. Go returns errors as values. Zig uses error unions. Rust uses Result. Handle errors explicitly and early — don't swallow exceptions.\n\n**Best practices:**\n- Catch specific error types, not generic `Exception`\n- Always clean up resources in `finally`\n- Log errors with context, not just the message" },
  { keywords: ['async', 'await', 'promise', 'future', 'coroutine', 'callback'], response: "Async code runs without blocking. JS: Promises + async/await. Python: asyncio. C#: Task + async/await. Go: goroutines + channels. Kotlin: coroutines + suspend.\n\n**Common mistakes:**\n- Forgetting `await` inside `async` function\n- Not handling promise rejections with `.catch()`\n- Callback hell — use Promises or async/await\n- Passing async function directly where sync is expected" },
  { keywords: ['type', 'string', 'int', 'bool', 'float', 'null', 'undefined'], response: "Types define data. Statically-typed languages catch errors at compile time. Dynamically-typed languages are flexible. Type annotations improve readability.\n\n**Common mistakes:**\n- Confusing `null` vs `undefined` (JS)\n- String vs number coercion: `'5' + 3 = '53'` not 8\n- `typeof null === 'object'` — a longstanding JS bug" },
  { keywords: ['git', 'commit', 'push', 'pull', 'branch', 'merge', 'rebase'], response: "Git tracks changes. `git add` stages, `git commit` saves, `git push` uploads. Branches isolate work. Merge combines branches. Pull fetches + merges remote changes.\n\n**Common mistakes:**\n- Committing to main instead of a feature branch\n- Merge conflicts from not pulling before pushing\n- Using `--force` push on shared branches (use `--force-with-lease`)\n- Forgetting to add `.gitignore` before committing" },
  { keywords: ['sql', 'select', 'join', 'table', 'database', 'query', 'where'], response: "SQL manages relational data. SELECT retrieves, INSERT adds, UPDATE modifies, DELETE removes. JOINs combine tables. Indexes speed up queries. Design schemas before coding.\n\n**Common mistakes:**\n- Forgetting WHERE in UPDATE/DELETE — affects ALL rows\n- N+1 query problem — use JOIN instead of looping\n- Not using parameterized queries — SQL injection vulnerability\n- Missing indexes on frequently queried columns" },
  { keywords: ['debug', 'bug', 'fix', 'issue', 'wrong', 'not working', 'broken'], response: "Debugging is the art of finding what's wrong. Systematic approach:\n\n1. **Read the error message** — it tells you what and where\n2. **Reproduce** — can you make it happen consistently?\n3. **Isolate** — comment out code until the bug disappears\n4. **Inspect** — use `console.log()` or a debugger to check values\n5. **Fix** — make the smallest change possible\n6. **Verify** — does the fix actually work?\n\n**Tools:** built-in debugger, `console.log()`, breakpoints, watch variables" },
  { keywords: ['help', 'how', 'what is', 'explain', 'understand', 'confused'], response: "Happy to help you understand! Let me break it down:\n\n**To learn effectively:**\n1. Read the code example in the curriculum\n2. Type it out yourself (don't copy-paste)\n3. Modify it slightly and see what changes\n4. Break it intentionally to understand error messages\n5. Build small projects to practice\n\nWhat specific concept are you working on? Tell me the topic and I'll explain it clearly." },
  { keywords: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack'], response: "Memory management is crucial in low-level languages (C, C++, Rust, Zig).\n\n- **Stack:** fast, limited size, automatic cleanup (local variables)\n- **Heap:** flexible, manual management, larger (dynamic allocation)\n- **Pointer:** stores a memory address\n\n**Common mistakes:**\n- Memory leaks: forgetting to `free()`/`delete`\n- Dangling pointers: using memory after freeing\n- Buffer overflows: writing past array bounds\n- Double free: freeing the same memory twice" },
  { keywords: ['closure', 'scope', 'hoist', 'temporal dead zone', 'tdz'], response: "Scope determines where variables are accessible.\n\n- **Global scope:** accessible everywhere\n- **Function scope:** only inside the function (var, function)\n- **Block scope:** only inside the block `{}` (let, const)\n- **Closure:** a function that remembers its outer variables even after the outer function returns\n\n**Common mistakes:**\n- Hoisting confusion: `var` is hoisted (initialized as undefined), `let`/`const` are hoisted but not initialized (TDZ)\n- Closure loop bug: using `var i` in a loop with async callbacks captures the same `i`" },
  { keywords: ['syntax', 'error', 'semicolon', 'bracket', 'parenthesis', 'brace'], response: "Syntax errors mean the compiler/parser can't understand your code. This is the most common beginner issue!\n\n**Quick checklist:**\n- Are all `(`, `{`, `[` properly closed with `)`, `}`, `]`?\n- Are strings quoted with matching quotes? `\"...\"` or `'...'` or backticks?\n- Are all statements terminated? (JS/C#/C++/Java: semicolons; Python: newlines)\n- Are variable names spelled the same everywhere?\n- Did you forget a comma between array/object items?\n\n**Tip:** Read the error message carefully — it tells you the line number and what it expected vs what it found." },
  { keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'], response: "Hello! I'm your programming assistant. I can help you with:\n- Understanding code examples\n- Debugging errors\n- Explaining programming concepts\n- Best practices and common mistakes\n\nWhat language are you learning today? Ask me anything about the curriculum!" },
  { keywords: ['string', 'concatenat', 'interpolat', 'template', 'char', 'substring'], response: "Strings are sequences of characters.\n\n**Common operations:**\n- Concatenation: `'a' + 'b'` or template literals with interpolation\n- Length: `str.length` (JS), `len(str)` (Python), `strlen(s)` (C)\n- Substring: `str.slice(0, 5)`, `str.substring(0, 5)`\n- Case: `str.toUpperCase()`, `str.toLowerCase()`\n\n**Common mistakes:**\n- Strings are immutable in most languages — methods return NEW strings\n- Off-by-one in substring/slice end index\n- Using `==` vs `.equals()` for string comparison in some languages" },
]

export default async (req) => {
  const { message, lang } = await req.json()
  if (!message) return Response.json({ reply: 'Ask me something about programming!' })
  const q = message.toLowerCase()

  for (const entry of aiResponses) {
    if (entry.keywords.some((k) => q.includes(k))) {
      return Response.json({ reply: entry.response })
    }
  }

  if (q.startsWith('fix ') || q.startsWith('debug ') || q.includes(' not working')) {
    return Response.json({
      reply: `I see you need help debugging! Try this:\n\n1. **Read the error** — what does it say exactly?\n2. **Isolate the problem** — comment out parts until it works\n3. **Check the console** — use \`console.log()\` to inspect values step by step\n4. **Simplify** — can you reproduce the issue with fewer lines?\n\nIf you share the code and error, I can give more specific help!`,
    })
  }

  if (q.includes('thank')) {
    return Response.json({
      reply: "You're welcome! Keep coding and learning. Remember: every expert was once a beginner. What would you like to learn next?",
    })
  }

  const suggestions = [
    'Try exploring the curriculum for code examples.',
    "Type 'help' to see what I can assist with.",
    'Common topics I can help with: variables, functions, loops, classes, arrays, error handling, async code.',
  ]
  const greeting = `Great question about **${(lang || 'programming').toUpperCase()}**! `
  return Response.json({ reply: greeting + suggestions[Math.floor(Math.random() * suggestions.length)] })
}

export const config = {
  path: '/api/chat',
}
