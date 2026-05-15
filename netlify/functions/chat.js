function analyzeUserCode(code, lang) {
    if (!code || !lang) return null;
    const hints = [];
    const lines = code.split('\n');

    if (lang === 'js') {
        const unclosedBraces = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
        const unclosedParens = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        if (unclosedBraces > 0) hints.push('You have unclosed curly braces. Add `' + '}'.repeat(unclosedBraces) + '` at the end.');
        if (unclosedBraces < 0) hints.push('You have ' + Math.abs(unclosedBraces) + ' too many closing braces `}`.');
        if (unclosedParens > 0) hints.push('You have unclosed parentheses. Add `' + ')'.repeat(unclosedParens) + '`.');
        if (unclosedParens < 0) hints.push('You have extra closing parentheses.');
        if (!code.includes('return') && (code.includes('function') || code.includes('=>'))) {
            hints.push('Your function has no `return` statement. It will return `undefined`.');
        }
        if (code.includes('==')) hints.push('Consider using `===` (strict equality) instead of `==` to avoid type coercion.');
        if (code.includes('var ')) hints.push('Use `let` or `const` instead of `var` for block scoping.');
    } else if (lang === 'py') {
        const leadingSpaces = lines.filter(l => l.trim() && l.startsWith(' '));
        if (leadingSpaces.length > 0) {
            const mixed = leadingSpaces.some(l => l.includes('\t'));
            if (mixed) hints.push('Mixing tabs and spaces in indentation causes errors. Stick to 4 spaces.');
        }
    }
    return hints.length > 0 ? hints : null;
}

const aiResponses = [
    {
        keywords: ['variable', 'declare', 'let', 'const', 'var'],
        response: "Variables store data in memory so you can reuse and manipulate values.\n\n**Syntax by language:**\n- **JS:** `let name = value;` (mutable), `const name = value;` (immutable)\n- **Python:** `name = value` (no keyword needed)\n- **Go:** `var name type = value` or `name := value` (type inference)\n- **Kotlin:** `var name = value` (mutable), `val name = value` (read-only)\n\n**Try this to experiment:**\n1. Declare a variable with your name\n2. Declare another with your age\n3. Print both using console.log / print()\n\n**Why this matters:** Variables are the foundation of all programs — every app stores and manipulates data.\n\n**Try to avoid:**\n- Using `var` in JS (function-scoped, causes bugs) — prefer `let`/`const`\n- Forgetting keywords creates globals: `x = 5` without `let`/`const`/`var` creates a global\n- Using `const` for values that need to change later"
    },
    {
        keywords: ['function', 'method', 'def', 'func', '=>'],
        response: "Functions are reusable blocks of code that perform a specific task. They help you avoid repetition and organize logic.\n\n**Syntax by language:**\n- **JS:** `function name(params) { ... }` or `const name = (params) => { ... }`\n- **Python:** `def name(params):`\n- **Go:** `func name(params) returnType { ... }`\n- **Rust:** `fn name(params) -> returnType { ... }`\n\n**Hands-on exercise:**\n```\nWrite a function that takes two numbers and returns their sum.\nThen call it and log the result.\n```\n\n**Design principle:** Each function should do ONE thing well. If a function does multiple things, split it up.\n\n**Common pitfalls:**\n- Missing `return` → function returns `undefined` (JS) / `None` (Python)\n- Calling without `()`: `myFunc` vs `myFunc()` — first one is the function itself, not a call\n- Mutating input parameters directly creates side effects"
    },
    {
        keywords: ['class', 'object', 'oop', 'inherit', 'extends', 'prototype', 'struct'],
        response: "Object-Oriented Programming organizes code around objects that contain both data (properties) and behavior (methods).\n\n**Key concepts:**\n- **Encapsulation:** bundle data + methods, hide internal details\n- **Inheritance:** a class can extend another, reusing behavior\n- **Polymorphism:** same method name, different implementations\n- **Composition:** building objects from other objects (prefer this over inheritance)\n\n**Language differences:**\n- **JS/Python/Kotlin/C#:** traditional `class` syntax\n- **Go:** no classes — uses structs + methods (composition-focused)\n- **Rust/Zig:** structs with traits/protocols for shared behavior\n\n**Try this:**\n1. Create a simple class (e.g., `Car` with `brand` and `year`)\n2. Add a method (e.g., `honk()`)\n3. Create an instance and call the method\n\n**Golden rule:** Favor composition over inheritance. Instead of `Dog extends Animal`, give Dog an `energy` property and a `tired()` method."
    },
    {
        keywords: ['array', 'list', 'collection', 'vector', 'slice', 'map', 'set', 'dictionary', 'hash'],
        response: "Collections let you store and manipulate groups of values.\n\n**Common collection types:**\n- **Array/Slice/List:** ordered sequence of values\n- **Map/Dict/Hash:** key-value pairs for fast lookups\n- **Set:** unique values (no duplicates)\n\n**Language specifics:**\n- **JS:** `[]`, `new Map()`, `new Set()`\n- **Python:** `[]`, `list()`, `{}`, `dict()`, `set()`\n- **Go:** `[]T`, `map[K]V`\n- **Rust:** `Vec<T>`, `HashMap<K, V>`, `HashSet<T>`\n\n**Exercise:**\n1. Create an array of 5 numbers\n2. Write a loop to double each number\n3. Store the results in a new array\n\n**Watch out for:**\n- Off-by-one: `arr[arr.length]` is always out of bounds — indices go 0 to length-1\n- Using `delete arr[i]` in JS leaves a hole — use `.splice()` instead\n- Arrays are 0-indexed in virtually all languages"
    },
    {
        keywords: ['loop', 'for', 'while', 'iterate', 'foreach', 'for...of', 'for...in', 'range'],
        response: "Loops let you repeat code — essential for processing collections, waiting for conditions, and automating repetitive tasks.\n\n**Types of loops:**\n- **`for` loop:** when you know how many iterations (`for (let i=0; i<5; i++)`)\n- **`while` loop:** when you don't know the count (`while (condition)`)\n- **`for...of` / `foreach`:** iterating over collections (cleaner)\n- **`map` / `filter` / `reduce`:** functional iteration (JS/Python)\n\n**Control flow:**\n- `break` — exit the loop immediately\n- `continue` — skip to the next iteration\n\n**Try this:**\n```\nWrite a loop that prints numbers 1 to 10, but skips 5 and stops at 8.\n```\n\n**Most common bugs:**\n- **Infinite loop:** forgetting to increment your counter: `for (let i=0; i<10;)`\n- **Off-by-one:** using `<=` when you mean `<` (or vice versa)\n- **Modifying an array while iterating:** skips elements or causes unexpected behavior"
    },
    {
        keywords: ['error', 'exception', 'try', 'catch', 'panic', 'throw', 'result', 'option'],
        response: "Error handling is how programs deal with unexpected situations. Different languages take very different approaches!\n\n**Approaches by language:**\n- **JS/Python/C#/Kotlin:** `try { risky() } catch (e) { handle(e) }`\n- **Go:** functions return errors: `result, err := doSomething()` — check `err != nil`\n- **Rust:** `Result<T, E>` and `Option<T>` — pattern match or use `?`\n- **Zig:** error union types — `catch` handles, `try` propagates\n\n**Best practices:**\n- Catch specific error types, not generic `Exception` — you might hide bugs\n- Always clean up resources (files, connections) in `finally`\n- Log errors WITH context (what were you doing, what inputs)\n- Don't silently swallow errors — at minimum log them\n\n**Exercise:**\n1. Write a function that divides two numbers\n2. Add error handling for division by zero\n3. Test both valid and invalid inputs"
    },
    {
        keywords: ['async', 'await', 'promise', 'future', 'coroutine', 'callback', 'goroutine', 'thread'],
        response: "Async programming lets your code handle time-consuming operations (network requests, file I/O, timers) without blocking.\n\n**How each language handles it:**\n- **JS:** `async function` + `await promise` — single-threaded, event loop\n- **Python:** `async def` + `await` — asyncio event loop\n- **C#:** `async Task` + `await` — built into the runtime\n- **Go:** `go func()` starts a goroutine, `chan` for communication\n- **Kotlin:** `suspend fun` + coroutines\n\n**Mental model:** Think of async code like ordering coffee: instead of waiting at the counter (blocking), you get a buzzer (promise) and do other things until it buzzes (resolved).\n\n**Common mistakes:**\n- Forgetting `await` — you get a Promise object instead of the value\n- Not handling rejections — unhandled promise rejections crash Node.js\n- Callback hell — use Promises (.then chain) or async/await\n- Passing async function where sync is expected without handling the promise"
    },
    {
        keywords: ['type', 'string', 'int', 'bool', 'float', 'null', 'undefined', 'void', 'any', 'generic'],
        response: "Types describe what kind of data a value is — this determines what you can do with it.\n\n**Static vs Dynamic typing:**\n- **Static (TS, Go, Rust, C#, Java):** types checked at compile time, catch errors early\n- **Dynamic (JS, Python):** types checked at runtime, more flexible but error-prone\n\n**Type annotations are your friends!** Even in dynamic languages, using clear type names helps readability.\n\n**Language oddities to know:**\n- **JS:** `typeof null === 'object'` — it's a longstanding bug!\n- **JS:** `'5' + 3 = '53'` (string concat wins), but `'5' - 3 = 2` (coercion)\n- **Python:** everything is an object, even functions and classes\n- **Go:** zero values — `int` defaults to `0`, `string` to `\"\"`, `bool` to `false`\n\n**Try this:**\n1. Declare a variable with a specific type annotation (if your language supports it)\n2. Try assigning a different type — see what error you get\n3. Experiment with type conversion/coercion"
    },
    {
        keywords: ['git', 'commit', 'push', 'pull', 'branch', 'merge', 'rebase'],
        response: "Git is the industry-standard version control system. It tracks changes to your code over time.\n\n**Essential workflow:**\n1. `git add .` — stage your changes\n2. `git commit -m \"message\"` — save a snapshot\n3. `git push` — upload to remote\n\n**Branching strategy:**\n- `main` — production-ready code\n- `feature/xyz` — work on new features\n- `bugfix/xyz` — fix bugs\n- Never commit directly to main! Use pull requests.\n\n**For learning, try this:**\n1. `git init` in a project folder\n2. Make some changes, commit them\n3. Create a branch: `git checkout -b my-experiment`\n4. Make more commits, then merge back\n\n**Pro tips to avoid disaster:**\n- Use `--force-with-lease` instead of `--force` on shared branches\n- Always pull before pushing: `git pull --rebase`\n- Commit early and often with clear messages\n- Use `.gitignore` to keep secrets and build artifacts out of the repo"
    },
    {
        keywords: ['sql', 'select', 'join', 'table', 'database', 'query', 'where', 'insert', 'update', 'delete', 'index'],
        response: "SQL is the language of relational databases. It's declarative — you say WHAT you want, not HOW to get it.\n\n**Core operations (CRUD):**\n- `SELECT columns FROM table WHERE condition` — retrieve data\n- `INSERT INTO table (cols) VALUES (vals)` — add data\n- `UPDATE table SET col=val WHERE condition` — modify data\n- `DELETE FROM table WHERE condition` — remove data\n\n**JOINs combine tables:**\n- `INNER JOIN` — only matching rows from both tables\n- `LEFT JOIN` — all rows from left table, NULLs where right doesn't match\n- `RIGHT JOIN` — opposite of LEFT\n- `FULL JOIN` — all rows from both tables\n\n**Most common errors:**\n- **Missing WHERE in UPDATE/DELETE** — modifies/deletes ALL rows!\n- **N+1 query problem:** looping queries instead of using JOIN\n- **Not using parameterized queries** — leads to SQL injection\n- **Missing indexes** on frequently queried columns = slow queries\n\n**Try the Schema Designer (click 'Schema' below the editor)** to build tables visually!"
    },
    {
        keywords: ['debug', 'bug', 'fix', 'issue', 'wrong', 'not working', 'broken', 'error'],
        response: "Debugging is a systematic process. Here's a methodical approach:\n\n**1. READ the error message**\nIt tells you WHAT went wrong and WHERE (line number). Don't skip this step!\n\n**2. REPRODUCE**\nCan you make the bug happen consistently? If not, find the exact conditions.\n\n**3. ISOLATE**\nComment out code until the bug disappears. The last thing you removed is likely the culprit.\n\n**4. INSPECT**\nUse `console.log()` (JS), `print()` (Python), `fmt.Println()` (Go), or a debugger to check values at each step.\n\n**5. HYPOTHESIZE**\nForm a theory: \"If X is wrong, then Y should happen.\" Test it.\n\n**6. FIX**\nMake the smallest possible change. Don't rewrite everything.\n\n**7. VERIFY**\nDoes the fix actually solve it? Does it break anything else?\n\n**Remember:** Every bug is a learning opportunity! The error message is trying to help you."
    },
    {
        keywords: ['help', 'how', 'what is', 'explain', 'understand', 'confused', 'beginner', 'start', 'learn'],
        response: "I'm here to help you learn! Here's my advice for effective learning:\n\n**The 4-step practice method:**\n1. **Read** the topic explanation in the curriculum\n2. **Type** the code example yourself (don't copy-paste — muscle memory matters!)\n3. **Modify** it — change values, add features, break it intentionally\n4. **Build** something small with the concept\n\n**Active recall technique:** After reading a topic, close it and try to explain it in your own words. If you can't, review and try again.\n\n**I can help with:**\n- Explaining a specific topic (ask \"Explain [topic]\")\n- Debugging your code (share what you've tried)\n- Showing examples (\"Show me an example of X\")\n- Best practices (\"What's the best way to do X?\")\n\n**What are you working on right now?** Tell me the topic and I'll give you a clear explanation."
    },
    {
        keywords: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack', 'alloc', 'borrow', 'ownership'],
        response: "Memory management is essential in systems languages (C, C++, Rust, Zig). Here's the conceptual foundation:\n\n**Stack vs Heap:**\n- **Stack:** Fast, small, automatic. Local variables go here. LIFO order (last in, first out).\n- **Heap:** Slower, flexible, manual. Dynamic allocations go here. You must free/delete.\n\n**Key concepts by language:**\n- **C:** `malloc()`/`free()` — completely manual, error-prone\n- **C++:** `new`/`delete`, smart pointers (`unique_ptr`, `shared_ptr`)\n- **Rust:** Ownership system — compiler enforces memory safety at compile time. NO garbage collector!\n- **Zig:** Manual but safe — explicit allocators, no hidden allocations\n\n**Classic memory bugs:**\n- **Memory leak:** forgetting to free → program uses more and more RAM\n- **Dangling pointer:** using memory after freeing → crashes or security holes\n- **Buffer overflow:** writing past array bounds → corrupts adjacent memory\n- **Double free:** freeing the same memory twice → crash"
    },
    {
        keywords: ['closure', 'scope', 'hoist', 'temporal dead zone', 'tdz', 'lexical'],
        response: "Scope determines WHERE variables are accessible in your code. Closures are a powerful consequence of how scope works.\n\n**Types of scope:**\n- **Global:** accessible everywhere (avoid polluting this)\n- **Function scope:** inside a function (`var` in JS, `function` declarations)\n- **Block scope:** inside `{}` (`let`, `const` in JS)\n\n**What's a closure?**\nA closure is a function that \"remembers\" the variables from where it was defined, even after that outer function has finished running.\n\n```js\nfunction makeCounter() {\n  let count = 0;\n  return function() { return ++count; };\n}\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2  <-- count is still accessible!\n```\n\n**Common closure bug (the loop problem):**\n```js\nfor (var i = 0; i < 5; i++) {\n  setTimeout(() => console.log(i), 100); // prints 5,5,5,5,5\n}\n```\n**Fix:** use `let` instead of `var` (creates a new binding per iteration).\n\n**Hoisting:** `var` declarations are hoisted (moved to top) and initialized as `undefined`. `let`/`const` are hoisted but NOT initialized (Temporal Dead Zone — accessing them before the declaration throws an error)."
    },
    {
        keywords: ['syntax', 'semicolon', 'bracket', 'parenthesis', 'brace', 'colon'],
        response: "Syntax errors mean the computer can't understand your code — you've broken the grammar rules of the language. This is NORMAL and happens to every programmer, every day.\n\n**Quick debugging checklist:**\n1. Are all `(`, `{`, `[` properly closed with `)`, `}`, `]`?\n2. Are strings quoted correctly? `\"...\"`, `'...'`, or backticks must match\n3. Are statements terminated? (JS/C#/C++ need `;`, Python uses newlines)\n4. Are variable/function names spelled identically everywhere?\n5. Are you missing a comma between array/object items?\n6. Did you use a reserved keyword as a variable name?\n\n**The error message is your friend!** It tells you:\n- **The line number** where it got confused (or slightly after)\n- **What it expected** vs what it found\n- **The specific character** that doesn't belong\n\n**Pro tip:** When you get a syntax error, look at the LINE BEFORE the error. The parser often doesn't realize something's wrong until the next line."
    },
    {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greeting', 'sup'],
        response: "Hey there! Welcome to Doge's Lab!\n\nI'm your AI programming tutor. Here's what I can do for you:\n- **Explain concepts** from the curriculum (just ask!)\n- **Debug your code** (tell me what's not working)\n- **Show examples** with runnable code\n- **Guide your learning** with exercises and challenges\n\n**To get started:**\n1. Pick a language from the top bar\n2. Click a topic on the left\n3. Read the explanation and try the code\n4. Modify the code and click \"Run\"\n5. Ask me anything if you get stuck!\n\n**What language are you learning today?**"
    },
    {
        keywords: ['string', 'concatenat', 'interpolat', 'template', 'char', 'substring', 'slice', 'split', 'trim'],
        response: "Strings are sequences of characters. They're one of the most common data types in any program.\n\n**Common string operations:**\n- **Length:** `str.length` (JS), `len(str)` (Python), `strlen(s)` (C)\n- **Substring:** `str.slice(0, 5)`, `str.substring(0, 5)` — first 5 chars\n- **Split:** `str.split(',')` → array of strings\n- **Join:** `arr.join(',')` → string\n- **Case:** `str.toUpperCase()`, `str.toLowerCase()`\n- **Trim whitespace:** `str.trim()`\n\n**String interpolation (build strings with variables):**\n- **JS:** `` `Hello, ${name}!` `` (template literals)\n- **Python:** `f\"Hello, {name}!\"` (f-strings)\n- **C#:** `$\"Hello, {name}!\"` (string interpolation)\n- **Go:** `fmt.Sprintf(\"Hello, %s!\", name)`\n\n**Important:** Strings are IMMUTABLE in virtually all languages. Methods like `.toUpperCase()` return a NEW string — the original stays the same.\n\n**Common gotchas:**\n- Off-by-one in substring: `\"hello\".slice(1, 3)` is `\"el\"` (end index is exclusive)\n- Using `==` vs `.equals()` in some languages for comparison\n- Forgetting to trim user input: `\"  input  \".trim()`"
    },
    {
        keywords: ['test', 'testing', 'unit test', 'assert', 'jest', 'mocha', 'pytest', 'testing library'],
        response: "Testing is how you verify your code works correctly. Good tests give you confidence to refactor and add features.\n\n**Testing levels:**\n- **Unit tests:** test individual functions/classes in isolation\n- **Integration tests:** test how components work together\n- **End-to-end tests:** test the full system from user perspective\n\n**The AAA pattern:**\n1. **Arrange** — set up test data and conditions\n2. **Act** — call the function/method you're testing\n3. **Assert** — check the result is what you expected\n\n```js\n// Example (Jest)\ntest('adds 1 + 2 to equal 3', () => {\n  expect(add(1, 2)).toBe(3);\n});\n```\n\n**Why test?**\n- Catches regressions (stuff you broke by accident)\n- Documents how your code should behave\n- Forces you to write testable (modular) code\n- Saves time in the long run\n\n**Getting started:** Write a test BEFORE you fix a bug — this is called \"red-green testing\" (test fails first, then you make it pass)."
    },
    {
        keywords: ['recursion', 'recursive', 'base case', 'stack overflow', 'tail call'],
        response: "Recursion is when a function calls itself. It's an elegant way to solve problems that have a repetitive structure (trees, fractals, divide-and-conquer).\n\n**Every recursive function needs two parts:**\n1. **Base case** — when to STOP (without this, infinite recursion!)\n2. **Recursive case** — call itself with a simpler version of the problem\n\n```js\n// Factorial: n! = n * (n-1) * ... * 1\nfunction factorial(n) {\n  if (n <= 1) return 1;       // base case\n  return n * factorial(n - 1); // recursive case\n}\n```\n\n**When to use recursion vs loops:**\n- **Recursion:** tree traversal, parsing, divide-and-conquer algorithms\n- **Loops:** simple iteration, performance-critical code\n\n**Watch out for:**\n- **Stack overflow:** too many recursive calls exhausts the call stack\n- **Missing base case:** infinite recursion = crash\n- **Tail recursion optimization:** some languages optimize this (not JS/Python)\n\n**Exercise:** Write a recursive function that computes the nth Fibonacci number. Then compare it with a loop-based version."
    }
];

export default async (req) => {
    const { message, lang, topic, phase, code, output, hasError, history } = await req.json()
    if (!message) return Response.json({ reply: "Ask me something about programming!" })
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

        if (output && (output.includes('Error:') || output.includes('ReferenceError') || output.includes('TypeError') || output.includes('SyntaxError') || output.includes('FAIL'))) {
            const cleanOutput = output.replace(/<[^>]*>/g, '').trim()
            errorReply += `**Your code produced this output:**\n\`\`\`\n${cleanOutput}\n\`\`\`\n\n`
        }

        if (code && topic) {
            errorReply += `Since you're working on **${topic}**, here's a hint:\n`
            errorReply += `- Look at the example in the curriculum and compare it with your code line by line\n`
            errorReply += `- Try simplifying: comment out parts until it works, then add them back one at a time\n`
            errorReply += `- Check the most common mistake for this topic and see if it applies to you\n\n`
        }

        if (!errorReply) {
            errorReply = "Let's debug this systematically:\n\n"
            errorReply += "**1. What did you expect to happen?**\n"
            errorReply += "**2. What actually happened?**\n"
            errorReply += "**3. What have you tried so far?**\n\n"
            errorReply += "Share your code and the error message, and I'll help you find the issue!"
        } else {
            errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step."
        }

        return Response.json({ reply: errorReply })
    }

    // ── Topic-aware follow-up detection ──
    if (history && history.length >= 2) {
        const lastBotMsg = history.filter(h => h.role === 'bot').pop()
        if (lastBotMsg && (q.includes('yes') || q.includes('ok') || q.includes('sure') || q.includes('tell me more') || q.includes('example') || q.includes('show me'))) {
            const followUps = {
                'variable': "Let's practice! Try this in the editor:\n```\n// Declare a variable 'name' with your name as a string\n// Declare a variable 'age' with your age as a number\n// Print both using console.log()\n```\nThen click Run and tell me what you see!",
                'function': "Here's a simple exercise: Write a function called `add` that takes two parameters and returns their sum. Then call it and log the result.\n\n**Hint:** `function add(a, b) { ... }`",
                'loop': "Practice: Write a loop that prints the numbers 1 through 10. Then modify it to only print even numbers.\n\n**Hint for evens:** Use `if (i % 2 === 0)` to check if a number is even.",
                'array': "Try this: Create an array of your 3 favorite foods. Write a loop that prints \"I like [food]\" for each one.",
                'class': "Exercise: Create a `Person` class with `name` and `age` properties. Add a `greet()` method that says \"Hi, I'm [name]!\". Create an instance and call greet()."
            }
            for (const [key, reply] of Object.entries(followUps)) {
                if (lastBotMsg.text && lastBotMsg.text.toLowerCase().includes(key)) {
                    return Response.json({ reply })
                }
            }
        }
        if (q.includes('thank') || q.includes('thanks')) {
            return Response.json({ reply: "You're welcome! The best way to learn is by doing. Keep experimenting, keep breaking things, and keep asking questions. What would you like to explore next?" })
        }
    }

    // ── Context-aware: if topic is provided, try to answer based on it ──
    if (topic && (q.includes('what') || q.includes('how') || q.includes('explain') || q.includes('tell me') || q.includes('?') || q.length < 15)) {
        for (const entry of aiResponses) {
            if (topic && entry.keywords.some(k => topic.toLowerCase().includes(k))) {
                let reply = entry.response
                if (topic) {
                    reply += `\n\n**You're currently studying:** ${topic} (${phase || ''})`
                    reply += `\nTry the code example in the editor, modify it, and click Run to see what happens!`
                }
                return Response.json({ reply })
            }
        }
    }

    // ── Standard keyword matching (improved with substring matching) ──
    for (const entry of aiResponses) {
        if (entry.keywords.some(k => q.includes(k))) {
            return Response.json({ reply: entry.response })
        }
    }

    for (const entry of aiResponses) {
        const combined = entry.keywords.join(' ')
        if (combined.includes(q.replace(/[^a-z\s]/g, '').trim())) {
            return Response.json({ reply: entry.response })
        }
    }

    // ── Greeting / thanks catch-all ──
    if (q.includes('thank') || q.includes('thanks')) {
        return Response.json({ reply: "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step! What would you like to learn next?" })
    }

    if (q.includes('hello') || q.includes('hi ') || q === 'hey' || q.includes('good')) {
        const langInfo = lang ? `I see you're studying **${lang.toUpperCase()}**. ` : ''
        return Response.json({ reply: `Hello! ${langInfo}Ask me anything about the topic you're working on, or pick a suggestion below to get started!` })
    }

    // ── Fallback: try to match topic from curriculum (Socratic style) ──
    if (topic) {
        return Response.json({ reply: `Great question about **${topic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far in the editor? Tell me your thought process and I'll help guide you to the right solution!` })
    }

    // ── Generic fallback ──
    const fallbacks = [
        "That's an interesting question! To help you best, could you tell me:\n1. What language are you working with?\n2. What topic are you studying?\n3. What have you tried so far?",
        "I want to make sure I help you effectively. Could you tell me more about what you're working on? For example: \"Explain functions\" or \"Help me debug my loop\".",
        "Let me help you learn! Try asking me about a specific topic you're studying, or tell me what you're trying to build. I can explain concepts, debug code, and suggest practice exercises."
    ]
    return Response.json({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] })
}

export const config = {
    path: '/api/chat',
}
