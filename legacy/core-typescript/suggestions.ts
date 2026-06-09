// @ts-nocheck

var suggestionSets = {
    js: ["Explain closures with an example", "How does async/await work?", "Common array methods guide", "What is 'this' keyword?", "Practice: write a function"],
    ts: ["Types vs interfaces explained", "What are generics?", "Utility types guide", "Enum best practices", "Practice: type a function"],
    py: ["List comprehensions explained", "How do decorators work?", "Why __init__?", "args and kwargs guide", "Practice: write a class"],
    go: ["Goroutines vs threads", "What are interfaces?", "When to use defer", "Error handling in Go", "Practice: write a struct"],
    zig: ["What is comptime?", "Memory allocators guide", "Error union types", "Zig vs C comparison", "Practice: zig basics"],
    pg: ["JOIN types explained", "Window functions guide", "Index strategies", "CTE vs subquery", "Practice: write a query"],
    dk: ["Docker vs VM explained", "Multi-stage builds", "Volume vs bind mount", "Docker Compose networks", "Practice: write a Dockerfile"],
    cs: ["LINQ queries explained", "Async/await in C#", "Record vs class", "What is .NET?", "Practice: write a class"],
    git: ["How to undo a commit", "Merge vs rebase", "How to fix a merge conflict", "What is HEAD?", "Practice: git workflow"],
    kt: ["Null safety explained", "Data classes guide", "Extension functions", "Coroutines basics", "Practice: write a class"],
    rs: ["Ownership explained simply", "Borrowing rules guide", "Traits vs generics", "Lifetimes explained", "Practice: write a struct"],
    swift: ["Optionals explained", "Protocols vs classes", "ARC memory guide", "Closures capture rules", "Practice: write a struct"],
    cloud: ["What is cloud computing?", "IaaS vs PaaS vs SaaS", "Serverless explained", "Containers vs VMs", "Practice: deploy something"],
    mongodb: ["Documents vs tables", "CRUD in MongoDB", "Aggregation pipeline", "Indexes in MongoDB", "Practice: write a query"],
    oop: ["What is inheritance?", "Polymorphism explained", "Encapsulation guide", "Abstract vs interface", "Composition vs inheritance"],
    gamedev: ["ECS explained simply", "Game loop patterns", "Physics for beginners", "Optimization tips"],
    godot: ["GDscript basics", "Scene system explained", "Signals vs groups", "Practice: build a scene"],
    unity: ["MonoBehaviour lifecycle", "Prefab system guide", "Unity Physics tips", "Practice: build a prefab"],
    unreal: ["Blueprint vs C++", "Chaos physics guide", "UMG UI basics", "Practice: build a widget"],
    mobile: ["Touch input handling", "Mobile optimization", "Battery life tips", "Store submission guide"],
    react: ["What is JSX?", "useState vs useReducer", "Props vs state", "Practice: build a component"],
    vue: ["Reactivity explained", "Composition API guide", "Vue Router basics", "Practice: build a component"],
    node: ["What is Node.js?", "Express basics", "File system guide", "Practice: build a server"],
};

function getDynamicSuggestions(
    outputText: string,
    _conversationHistory: { role: string; text: string }[],
    currentTopic: string,
    _streamingFullText: string,
): string[] | null {
    const hasError = outputText.includes('Error:') || outputText.includes('FAIL') || outputText.includes('SyntaxError') || outputText.includes('ReferenceError') || outputText.includes('TypeError');
    const convLen = _conversationHistory.length;

    if (hasError) {
        if (outputText.includes('SyntaxError') || outputText.includes('Unexpected token')) {
            return ["What is a syntax error?", "How to fix missing brackets", "Check my punctuation", "Common syntax mistakes"];
        }
        if (outputText.includes('ReferenceError') || outputText.includes('is not defined')) {
            return ["What is a ReferenceError?", "How to declare variables", "Variable scope explained", "Check variable spelling"];
        }
        if (outputText.includes('TypeError') || outputText.includes('is not a function') || outputText.includes('Cannot read property')) {
            return ["What is a TypeError?", "Check variable types", "Debug undefined values", "How to use console.log"];
        }
        if (outputText.includes('FAIL') || outputText.includes('Challenge')) {
            return ["Hint for this challenge", "Explain the concept", "Show me a similar example", "Debug my logic"];
        }
        if (currentTopic) {
            const topicLC = currentTopic.toLowerCase();
            return [`Explain this ${topicLC} error`, `Help me fix ${topicLC}`, `How does ${topicLC} work?`, "Common debugging tips"];
        }
        return ["Why did I get this error?", "How do I fix my code?", "Explain what went wrong", "Debugging tips"];
    }

    if (convLen >= 4) {
        const lastBot = [..._conversationHistory].reverse().find(m => m.role === 'bot');
        if (lastBot && lastBot.text) {
            const bt = lastBot.text.toLowerCase();
            if (bt.includes('try this') || bt.includes('practice') || bt.includes('exercise')) {
                return ["I tried it, now what?", "Explain the concept more", "Show me a variation", "What's next after this?"];
            }
            if (bt.includes('would you like') || bt.includes('tell me more')) {
                return ["Yes, tell me more", "Give me an example", "Explain it simply", "Compare with other languages"];
            }
        }
    }

    if (currentTopic) {
        const topHints: Record<string, string[]> = {
            "Variables": ["How do I declare a variable?", "Variable naming rules", "What is scope?", "Practice: declare and print"],
            "Functions": ["How do I write a function?", "What is a return statement?", "Function parameters", "Practice: write a function"],
            "Loops": ["For vs while which to use?", "How to break a loop", "Nested loops explained", "Practice: loop exercise"],
            "Arrays": ["Common array methods", "How to loop over an array", "Adding and removing items", "Practice: array exercise"],
            "Objects": ["How to create an object", "Accessing properties", "Object methods", "Practice: build an object"],
            "Strings": ["String methods guide", "String interpolation", "How to concatenate", "Practice: string exercise"],
            "Classes": ["How to create a class?", "constructor method", "this keyword explained", "Practice: write a class"],
            "Inheritance": ["extends keyword", "super() call", "Override methods", "When to use inheritance"],
            "Error Handling": ["try/catch syntax", "Throwing errors", "Error types", "Practice: handle an error"],
            "Async/Await": ["Promise syntax guide", "async function basics", "await keyword", "Practice: fetch data"],
            "Pointers": ["What is a pointer?", "Stack vs heap", "Memory management", "Practice: pointer basics"],
            "Recursion": ["Base case explained", "Recursion vs loops", "Stack overflow risk", "Practice: recursion"],
            "Testing": ["How to write tests", "What is TDD?", "Jest for beginners", "Practice: test a function"],
            "SQL": ["SELECT vs INSERT", "JOIN types explained", "WHERE clause filter", "Practice: write a query"],
            "Git": ["How to commit", "Branching explained", "Merge vs rebase", "Practice: git workflow"],
            "DOM": ["What is the DOM?", "Query selectors guide", "Event listeners explained", "Practice: manipulate the DOM"],
            "Events": ["Event types explained", "Event delegation", "Event propagation (bubbling)", "Practice: handle a click"],
            "Promises": ["What is a Promise?", "Promise chaining", "Promise.all explained", "Practice: use a Promise"],
            "Modules": ["Import vs require", "Named vs default exports", "Module bundlers explained", "Practice: create a module"],
            "JSON": ["JSON.parse vs stringify", "Working with JSON data", "Fetching JSON from APIs", "Practice: parse JSON"],
            "Fetch": ["How to use fetch()", "GET vs POST requests", "Handling responses", "Practice: call an API"],
            "Closures": ["What is a closure?", "Lexical scope explained", "Practical closure examples", "Practice: write a closure"],
            "Prototypes": ["Prototype chain explained", "Proto vs prototype", "ES6 classes are syntactic sugar", "Practice: prototype method"],
            "this": ["How 'this' works", "Arrow functions vs this", "Call, apply, bind", "Practice: control 'this'"],
            "Map": ["Map vs Object", "Map methods guide", "Set data structure", "Practice: use Map and Set"],
            "Generators": ["What is a generator?", "Yield keyword explained", "Generator use cases", "Practice: write a generator"],
            "Regex": ["Common regex patterns", "Test vs exec", "Groups and capture", "Practice: regex exercise"],
            "Web APIs": ["LocalStorage guide", "Geolocation API", "Canvas basics", "Practice: use a Web API"],
            "Strict Mode": ["What is strict mode?", "Benefits of strict mode", "Common strict mode errors", "Practice: use strict"],
            "Template Literals": ["String interpolation", "Multi-line strings", "Tagged templates", "Practice: template literals"],
            "Destructuring": ["Array destructuring", "Object destructuring", "Nested destructuring", "Practice: destructure data"],
            "Spread": ["Spread operator guide", "Rest parameters", "Spread vs concat", "Practice: use spread"],
            "Ternary": ["Ternary operator syntax", "When to use ternary", "Nested ternaries", "Practice: use ternary"],
            "Nullish": ["Nullish coalescing ??", "Optional chaining ?.", "Logical OR vs ??", "Practice: use ?. and ??"],
            "Truthy": ["Truthy and falsy values", "Equality comparisons", "Type coercion explained", "Practice: check truthiness"],
            "Scope": ["Global vs local scope", "Block scope with let/const", "Hoisting explained", "Practice: scope exercise"],
            "Hoisting": ["What is hoisting?", "Var vs let hoisting", "Function declarations hoisted", "Practice: hoisting quiz"],
            "IIFE": ["What is an IIFE?", "Module pattern with IIFE", "Private variables", "Practice: write an IIFE"],
            "Memoization": ["What is memoization?", "Caching function results", "Performance optimization", "Practice: memoize a function"],
            "Debounce": ["What is debouncing?", "Debounce vs throttle", "Real-world use cases", "Practice: debounce input"],
        };
        const topicLC = currentTopic.toLowerCase();
        for (const [key, hints] of Object.entries(topHints)) {
            if (topicLC.includes(key.toLowerCase())) return hints;
        }
        return [`Explain ${currentTopic}`, `Practice: ${currentTopic.toLowerCase()} exercise`, "Show me an example", "Common mistakes"];
    }

    if (outputText.includes('PASS') || outputText.includes('Challenge solved')) {
        return ["What should I learn next?", "Explain the concept behind this", "Show me a harder challenge", "Practice more exercises"];
    }
    return null;
}

function updateAISuggestions(
    currentLang: string,
    currentTopic: string,
    _streamingFullText: string,
): void {
    const el = document.getElementById('aiSuggestions');
    if (!el) return;
    const output = document.getElementById('output');
    const outputText = output ? output.innerText : '';
    const dynamic = getDynamicSuggestions(outputText, conversationHistory, currentTopic, streamingFullText);

    if (streamingFullText) {
        const text = streamingFullText.toLowerCase();
        const followUps: string[] = [];
        if (text.includes('variable') || text.includes('declare')) followUps.push('Show me a variable example');
        if (text.includes('function') || text.includes('method')) followUps.push('Give me a function exercise');
        if (text.includes('loop') || text.includes('for ') || text.includes('while')) followUps.push('Show me a loop example');
        if (text.includes('class') || text.includes('object')) followUps.push('Practice: build a class');
        if (text.includes('array') || text.includes('list')) followUps.push('Practice with arrays');
        if (text.includes('error') || text.includes('debug')) followUps.push('How do I debug this?', 'Common mistakes');
        if (followUps.length > 0) {
            followUps.push('Tell me more', 'Give me an example');
            const buttons = followUps.slice(0, 4).map(s =>
                `<button onclick="askAI('${s.replace(/'/g, "\\'")}')">${s}</button>`
            );
            if (currentTopic && currentLang && currentLang !== 'compiler' && currentLang !== 'challenge') {
                buttons.push(`<button onclick="generateExercise()" style="background:#0ea5e9;color:#000;">✨ Exercise</button>`);
            }
            el.innerHTML = buttons.join('');
            return;
        }
    }

    const suggestions = dynamic || suggestionSets[currentLang] || suggestionSets.js;
    const hasAI = currentLang && currentLang !== 'compiler' && currentLang !== 'challenge' && currentLang !== 'quiz';
    const buttons = suggestions.map(s => `<button onclick="askAI('${s.replace(/'/g, "\\'")}')">${s}</button>`);
    if (hasAI) {
        const hasExercise = currentTopic && !suggestions.some(s => s.toLowerCase().includes('exercise'));
        if (hasExercise) buttons.push(`<button onclick="generateExercise()" style="background:#0ea5e9;color:#000;">✨ Exercise</button>`);
        if (currentTopic) buttons.push(`<button onclick="generateQuiz()" style="background:#f59e0b;color:#000;">📝 Quiz</button>`);
        buttons.push(`<button onclick="showLearningPath()" style="background:#8b5cf6;color:#000;">📚 Path</button>`);
    }
    buttons.push(`<button class="ai-dismiss-btn" onclick="document.getElementById('aiSuggestions').innerHTML=''" title="Dismiss suggestions">✕</button>`);
    el.innerHTML = buttons.join('');
}
