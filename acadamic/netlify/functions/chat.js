const aiResponses = [
    { keywords: ['variable', 'declare', 'let', 'const', 'var'], response: "Variables store data in memory. In JS: `let name = value;` (mutable), `const name = value;` (immutable). In Python: `name = value`. In Go: `var name type = value` or `name := value`." },
    { keywords: ['function', 'method', 'def', 'func', '=>'], response: "Functions are reusable blocks of code. JS: `function name(params) { ... }`. Python: `def name(params):`. Go: `func name(params) returnType { ... }`. Rust: `fn name(params) -> returnType { ... }`." },
    { keywords: ['class', 'object', 'oop', 'inherit', 'extends'], response: "Object-Oriented Programming organizes code around objects with properties and methods. Key concepts: encapsulation, inheritance, polymorphism. Favor composition over inheritance." },
    { keywords: ['array', 'list', 'collection', 'vector', 'slice'], response: "Collections store groups of values. Arrays/lists are ordered sequences. Maps store key-value pairs. Sets store unique values. All are 0-indexed." },
    { keywords: ['loop', 'for', 'while', 'iterate', 'foreach'], response: "Loops repeat code. `for` loops when you know the count. `while` loops on a condition. Common bugs: infinite loops (missing increment) and off-by-one errors." },
    { keywords: ['error', 'exception', 'try', 'catch', 'panic'], response: "Error handling: JS/Python/C# use try/catch. Go returns errors as values. Rust uses Result/Option types. Always clean up resources in finally/defer." },
    { keywords: ['async', 'await', 'promise', 'future', 'goroutine'], response: "Async code runs without blocking. JS: async/await + Promises. Python: async/await + asyncio. Go: goroutines + channels. Common mistake: forgetting `await`." },
    { keywords: ['git', 'commit', 'push', 'pull', 'branch', 'merge'], response: "Git workflow: `git add .` → `git commit -m \"msg\"` → `git push`. Use branches for features. Pull before pushing with `git pull --rebase`." },
    { keywords: ['sql', 'select', 'join', 'table', 'database', 'query'], response: "SQL is declarative. CRUD: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove). JOINs combine tables. Always use parameterized queries." },
    { keywords: ['debug', 'bug', 'fix', 'issue', 'wrong', 'not working'], response: "Debugging: 1) Read the error, 2) Reproduce consistently, 3) Isolate by commenting code, 4) Inspect with logs, 5) Fix minimally, 6) Verify. Every bug is a learning opportunity!" },
    { keywords: ['help', 'how', 'what is', 'explain', 'understand', 'confused', 'learn', 'start'], response: "Learning method: 1) Read the topic, 2) Type the code yourself, 3) Modify and experiment, 4) Build something small. I can explain concepts, debug code, and suggest exercises." },
    { keywords: ['hello', 'hi', 'hey', 'greeting'], response: "Welcome to Doge's Lab! I'm your AI tutor. Pick a language, click a topic, read the explanation, try the code, and ask me anything!" },
    { keywords: ['string', 'concatenat', 'interpolat', 'template'], response: "Strings are immutable character sequences. Interpolation: JS uses `` `Hello ${name}` ``, Python uses `f\"Hello {name}\"`, Go uses `fmt.Sprintf`. Common operations: length, slice, split, join, trim." },
    { keywords: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack'], response: "Stack: fast, automatic (local variables). Heap: flexible, manual (dynamic allocation). C uses malloc/free. Rust has ownership for compile-time safety. Zig uses explicit allocators." },
    { keywords: ['syntax', 'semicolon', 'bracket', 'parenthesis', 'brace'], response: "Syntax errors are normal! Check: 1) All brackets closed? 2) Strings quoted correctly? 3) Statements terminated? The error line number is your best clue — check the line before too." },
    { keywords: ['scope', 'closure', 'hoist'], response: "Scope determines where variables are accessible. Closures remember outer variables. `var` is function-scoped, `let`/`const` are block-scoped. Hoisting: var is hoisted (undefined), let/const are in Temporal Dead Zone." },
    { keywords: ['test', 'testing', 'assert', 'jest', 'pytest'], response: "Testing verifies your code works. AAA pattern: Arrange, Act, Assert. Levels: unit, integration, e2e. Write tests before fixing bugs (red-green testing). Good tests give confidence to refactor." },
    { keywords: ['recursion', 'recursive', 'base case'], response: "Recursion = function calling itself. Every recursive function needs: 1) Base case (stop condition), 2) Recursive case (call with simpler input). Watch out for stack overflow with deep recursion." },
];

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { message, lang, topic, hasError, output, code } = body;
    if (!message) {
        return { statusCode: 200, body: JSON.stringify({ reply: "Ask me something about programming!" }) };
    }

    const q = message.toLowerCase().trim();

    if (hasError || /error|bug|fix|wrong|not working|issue/.test(q)) {
        let reply = '';
        if (code) {
            reply = "Let's debug your code! Check the error message for line numbers, simplify by commenting parts out, compare with the curriculum example.\n\n";
        }
        if (output) {
            reply += `**Your output:** ${output.slice(0, 300)}\n\n`;
        }
        reply += "**Tip:** The most common bugs are typos, missing brackets, and off-by-one errors.";
        return { statusCode: 200, body: JSON.stringify({ reply }) };
    }

    for (const entry of aiResponses) {
        if (entry.keywords.some(k => q.includes(k))) {
            return { statusCode: 200, body: JSON.stringify({ reply: entry.response }) };
        }
    }

    if (topic && (q.includes('what') || q.includes('how') || q.includes('explain') || q.includes('?'))) {
        return { statusCode: 200, body: JSON.stringify({ reply: `Great question about **${topic}**! What do you think the answer might be? Tell me your thought process and I'll guide you.` }) };
    }

    const fallbacks = [
        "Tell me what language and topic you're working on and I'll explain it clearly!",
        "I'd love to help! What are you studying right now?",
        "Ask me about a specific topic, share your code for debugging, or check the curriculum examples!",
    ];
    return { statusCode: 200, body: JSON.stringify({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] }) };
};
