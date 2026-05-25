"use strict";
(function(root) {
  const w = root;
  const aiTutorResponses = w.aiTutorResponses || [];
  const courseData = () => w.courseData || {};
  const currentLang = () => w.currentLang || "";
  const currentTopic = () => w.currentTopic || "";
  const currentPhase = () => w.currentPhase || "";
  const LANG_NAMES = {
    js: "JavaScript",
    ts: "TypeScript",
    py: "Python",
    go: "Go",
    rs: "Rust",
    zig: "Zig",
    c: "C",
    cpp: "C++",
    cs: "C#",
    kt: "Kotlin",
    swift: "Swift",
    java: "Java",
    rb: "Ruby",
    php: "PHP",
    sqlite: "SQLite",
    pg: "PostgreSQL",
    mysql: "MySQL",
    mongodb: "MongoDB",
    firebase: "Firebase",
    dk: "Docker",
    git: "Git",
    aws: "AWS",
    azure: "Azure",
    gcp: "GCP",
    cloud: "Cloud",
    k8s: "Kubernetes",
    terraform: "Terraform",
    react: "React",
    vue: "Vue",
    angular: "Angular",
    svelte: "Svelte",
    next: "Next.js",
    nuxt: "Nuxt",
    sveltekit: "SvelteKit",
    remix: "Remix",
    vite: "Vite",
    webpack: "Webpack",
    tailwind: "Tailwind",
    bootstrap: "Bootstrap",
    node: "Node.js",
    express: "Express",
    fastapi: "FastAPI",
    flask: "Flask",
    django: "Django",
    spring: "Spring",
    graphql: "GraphQL",
    prisma: "Prisma",
    redis: "Redis",
    reactnative: "React Native",
    flutter: "Flutter",
    cypress: "Cypress",
    playwright: "Playwright",
    sql: "SQL",
    compiler: "Compiler",
    schema: "Schema",
    tutorial: "Tutorial",
    gamedev: "GameDev",
    godot: "Godot",
    unity: "Unity",
    unreal: "Unreal Engine",
    mobile: "Mobile",
    android: "Android",
    ios: "iOS",
    asm: "Assembly",
    wasm: "WebAssembly"
  };
  const NAME_TO_LANG = {};
  for (const [k, v] of Object.entries(LANG_NAMES)) {
    NAME_TO_LANG[v.toLowerCase()] = k;
  }
  NAME_TO_LANG["c plus plus"] = "cpp";
  NAME_TO_LANG["c sharp"] = "cs";
  NAME_TO_LANG["javascript"] = "js";
  NAME_TO_LANG["typescript"] = "ts";
  NAME_TO_LANG["python"] = "py";
  NAME_TO_LANG["golang"] = "go";
  const SYNONYM_MAP = {
    variable: ["variable", "declare", "let", "const", "var", "declaration", "assign"],
    function: ["function", "method", "def", "func", "=>", "arrow", "lambda", "call"],
    class: ["class", "object", "oop", "inherit", "extends", "prototype", "struct", "constructor"],
    array: ["array", "list", "collection", "vector", "slice", "element", "index"],
    loop: ["loop", "for", "while", "iterate", "foreach", "iteration", "repeat"],
    string: ["string", "char", "text", "concatenat", "interpolat", "template"],
    async: ["async", "await", "promise", "callback", "future", "coroutine", "goroutine"],
    error: ["error", "exception", "try", "catch", "panic", "throw", "debug", "bug"],
    type: ["type", "int", "bool", "float", "string", "null", "undefined", "void"],
    pointer: ["pointer", "reference", "memory", "malloc", "free", "heap", "stack", "borrow", "ownership"],
    closure: ["closure", "scope", "hoist", "lexical", "temporal dead zone", "tdz"],
    recursion: ["recursion", "recursive", "base case", "stack overflow", "tail call"],
    testing: ["test", "testing", "assert", "jest", "mocha", "pytest"],
    sql: ["sql", "select", "join", "table", "database", "query", "where", "insert", "index"],
    git: ["git", "commit", "push", "pull", "branch", "merge", "rebase", "clone"],
    api: ["api", "rest", "http", "fetch", "endpoint", "request", "response", "axios"],
    dom: ["dom", "document", "window", "event", "click", "listener", "handler", "queryselector"],
    module: ["module", "import", "export", "require", "package", "npm", "dependency"],
    regex: ["regex", "regular expression", "pattern", "match", "replace"],
    file: ["file", "filesystem", "fs", "read", "write", "path", "directory", "stream"],
    datastructure: ["data structure", "stack", "queue", "tree", "graph", "linked list", "hash table"],
    algorithm: ["algorithm", "sort", "search", "binary", "big o", "time complexity"],
    functional: ["map", "filter", "reduce", "functional", "immutable", "pure function"],
    terminal: ["terminal", "command line", "bash", "shell", "cli", "console"],
    performance: ["performance", "optimize", "bottleneck", "profile", "cache", "memory leak"],
    build: ["build", "bundle", "webpack", "vite", "transpile", "compile"],
    security: ["security", "auth", "authentication", "hash", "encrypt", "injection", "xss"],
    docker: ["docker", "container", "deploy", "host", "server", "cloud", "devops"],
    config: ["config", "environment", "env", "settings", "dotenv"],
    math: ["math", "number", "random", "date", "timeout", "interval", "parseint", "parsefloat"]
  };
  const ERROR_PATTERNS = [
    { re: /SyntaxError|Unexpected token/i, title: "Syntax Error", tip: "A syntax error means the parser couldn't understand your code. Common causes:\n- Missing bracket, parenthesis, or curly brace\n- Missing comma between elements\n- Using a keyword as a variable name\n\n**Quick fix:** Look at the line number in the error and check for unbalanced `{`, `(`, `[`, or missing `,`." },
    { re: /ReferenceError|is not defined/i, title: "Reference Error", tip: "This means you're trying to use a variable or function that doesn't exist yet.\n\nCommon causes:\n- **Typo:** Did you spell it the same everywhere? JavaScript is case-sensitive!\n- **Not declared:** Did you use `let`, `const`, or `var` to declare it?\n- **Out of scope:** Is the variable accessible from where you're trying to use it?" },
    { re: /TypeError|is not a function|Cannot read property/i, title: "Type Error", tip: 'TypeError means a value is not the type you expected.\n\nCommon causes:\n- **undefined value:** `arr[0]` might be `undefined`, then calling `.name` on it fails\n- **Wrong type:** `"hello" - 5` doesn\'t work (but `"hello" + 5` does \u2014 string concatenation!)\n- **Not a function:** `arr.length()` is wrong \u2014 `length` is a property, not a method' },
    { re: /RangeError/i, title: "Range Error", tip: "RangeError means a value is outside the allowed range.\n\nCommon causes:\n- **Infinite recursion:** Your function calls itself without reaching a base case\n- **Array size:** Trying to create an array with a negative length\n- **Stack overflow:** Too many nested function calls" },
    { re: /FAIL|Error:/i, title: "Execution Error", tip: "Your code ran into an error during execution. Let's debug it step by step:\n1. Read the error message carefully \u2014 it tells you the line number\n2. Check the line it points to and the lines just before it\n3. Add `console.log()` to print values and see where things go wrong" }
  ];
  const KEYWORD_ISSUES = [
    { pattern: /==(?!\s*=)/, message: "Use === (strict equality) instead of == (loose equality)", severity: "warning", languages: ["js", "ts"] },
    { pattern: /!=/g, message: "Use !== (strict inequality) instead of != (loose inequality)", severity: "warning", languages: ["js", "ts"] },
    { pattern: /\bvar\s+/, message: "Avoid `var` \u2014 use `let` (mutable) or `const` (immutable)", severity: "warning", languages: ["js", "ts"] },
    { pattern: /console\.log\s*\(/, message: "Remove console.log before production", severity: "info", languages: ["js", "ts", "py"] },
    { pattern: /eval\s*\(/, message: "Avoid `eval()` \u2014 it's a security risk and performance killer", severity: "error", languages: ["js", "ts", "py"] },
    { pattern: /(document\.write|innerHTML\s*=)/, message: "Avoid document.write / innerHTML \u2014 use textContent or DOM methods", severity: "warning", languages: ["js", "ts"] },
    { pattern: /new\s+Function\s*\(/, message: "Avoid `new Function()` \u2014 it's essentially eval", severity: "error", languages: ["js", "ts"] },
    { pattern: /(\b|\))catch\s*\{/, message: "Catch block should handle or log the error, not be empty", severity: "warning", languages: ["js", "ts", "py", "kt", "cs"] },
    { pattern: /^\s*catch\s*\(.*\)\s*\{\s*\}\s*$/m, message: "Empty catch block swallows errors", severity: "warning", languages: ["js", "ts", "kt", "cs"] },
    { pattern: /\bundefined\s*=\s*/, message: "Never assign to undefined", severity: "error", languages: ["js", "ts"] },
    { pattern: /parseInt\(/, message: "Always specify radix: parseInt(str, 10)", severity: "warning", languages: ["js", "ts"] },
    { pattern: /==\s*null/, message: "Use `=== null` or `=== undefined`, not `== null` (catches both)", severity: "info", languages: ["js", "ts"] },
    { pattern: /\!=\s*null/, message: "Use strict inequality for null checks", severity: "info", languages: ["js", "ts"] },
    { pattern: /\bdebugger\b/, message: "Remove `debugger` statement before committing", severity: "warning", languages: ["js", "ts"] },
    { pattern: /alert\s*\(/, message: "Avoid `alert()` in production \u2014 use proper UI feedback", severity: "info", languages: ["js", "ts"] },
    { pattern: /\bfor\s*\(.*\)\s*\{[^}]*\}\s*$/m, message: "Prefer forEach / map / for-of over basic for loop", severity: "style", languages: ["js", "ts"] },
    { pattern: /\.forEach\s*\(/, message: "Consider for...of instead of forEach (better perf, supports break)", severity: "style", languages: ["js", "ts"] },
    { pattern: /\bsetTimeout\s*\(\s*["']/, message: "Pass function reference, not string, to setTimeout", severity: "warning", languages: ["js", "ts"] },
    { pattern: /\bsetInterval\s*\(\s*["']/, message: "Pass function reference, not string, to setInterval", severity: "warning", languages: ["js", "ts"] },
    { pattern: /,\s*\]/, message: "Trailing comma in array \u2014 might cause issues in older browsers", severity: "style", languages: ["js", "ts"] },
    { pattern: /,\s*\}/, message: "Trailing comma in object \u2014 might cause issues in older browsers", severity: "style", languages: ["js", "ts"] },
    { pattern: /\bprototype\b/, message: "Consider class syntax instead of modifying prototype directly", severity: "style", languages: ["js", "ts"] },
    // Python
    { pattern: /^\s*except\s*:(?!\s)/m, message: "Avoid bare `except:` \u2014 catch specific exceptions", severity: "warning", languages: ["py"] },
    { pattern: /print\s*\(/, message: "Remove print statements before production", severity: "info", languages: ["py"] },
    { pattern: /==\s*None/, message: "Use `is None` instead of `== None`", severity: "style", languages: ["py"] },
    { pattern: /\!=\s*None/, message: "Use `is not None` instead of `!= None`", severity: "style", languages: ["py"] },
    { pattern: /\btype\s*\(.*\)\s*==/, message: "Use `isinstance()` instead of `type() ==` for type checking", severity: "style", languages: ["py"] },
    { pattern: /,\s*\)/, message: "Trailing comma in tuple", severity: "style", languages: ["py"] },
    { pattern: /^\s*except\s*:.*\n\s*pass/m, message: "Empty except block silently swallows all errors", severity: "warning", languages: ["py"] },
    { pattern: /\binput\s*\(/, message: "Be careful with input() in Python 2 (use raw_input) or Python 3", severity: "info", languages: ["py"] },
    { pattern: /\bexec\s*\(/, message: "Avoid `exec()` \u2014 it's a security risk", severity: "error", languages: ["py"] },
    { pattern: /\b__[a-z]+__/, message: "Avoid dunder methods unless implementing a protocol", severity: "info", languages: ["py"] },
    { pattern: /\bglobal\s+/, message: "Avoid global variables \u2014 causes hard-to-track side effects", severity: "warning", languages: ["py", "js", "ts"] },
    // Go
    { pattern: /\bfmt\.Print(ln|f)?\s*\(/, message: "Remove fmt.Print statements before production", severity: "info", languages: ["go"] },
    { pattern: /\bpanic\s*\(/, message: "Avoid panic() for normal error handling \u2014 use error returns", severity: "warning", languages: ["go"] },
    { pattern: /\brecover\s*\(/, message: "recover() should only be used in deferred functions", severity: "warning", languages: ["go"] },
    { pattern: /\bdefer\s+recover/, message: "defer recover() without checking is a no-op", severity: "warning", languages: ["go"] },
    { pattern: /\bif\s+\w+\s*!=\s*nil\s*\{[^}]*\breturn\b/, message: "Consider using early returns for error handling", severity: "style", languages: ["go"] },
    { pattern: /\bfor\s+\w+\s*:=\s*range/, message: "Consider using `_` for unused loop variables", severity: "info", languages: ["go"] },
    // Rust
    { pattern: /\bunwrap\s*\(/, message: "Avoid `.unwrap()` \u2014 handle Result/Option properly with match or `?`", severity: "warning", languages: ["rs"] },
    { pattern: /\bexpect\s*\(/, message: "Consider proper error handling instead of `.expect()`", severity: "warning", languages: ["rs"] },
    { pattern: /\bprintln!\s*\(/, message: "Remove println! before production", severity: "info", languages: ["rs"] },
    { pattern: /\becover\s*\(/, message: "Avoid eprintln! for production code", severity: "info", languages: ["rs"] },
    { pattern: /\bBox::new/, message: "Consider if Box is needed or if a generic would work", severity: "info", languages: ["rs"] },
    { pattern: /\bVec::new\b/, message: "Consider using vec![] macro if initializing with values", severity: "style", languages: ["rs"] },
    { pattern: /\bstatic mut/, message: "`static mut` is unsafe \u2014 use `Mutex` or `OnceCell` instead", severity: "warning", languages: ["rs"] },
    { pattern: /\bleak\b/, message: "Typo: did you mean `leak`?", severity: "info", languages: ["rs"] },
    // SQL
    { pattern: /SELECT\s+\*/i, message: "Avoid `SELECT *` \u2014 specify columns explicitly", severity: "warning", languages: ["sql"] },
    { pattern: /DELETE\s+FROM\s+\w+\s*(;|$)/i, message: "DELETE without WHERE deletes ALL rows \u2014 add a WHERE clause", severity: "error", languages: ["sql"] },
    { pattern: /UPDATE\s+\w+\s+SET/i, message: "UPDATE without WHERE updates ALL rows \u2014 add a WHERE clause", severity: "error", languages: ["sql"] },
    { pattern: /INSERT\s+INTO\s+\w+\s+VALUES\s*\(/i, message: "INSERT should specify column list: INSERT INTO table (cols) VALUES (vals)", severity: "style", languages: ["sql"] },
    { pattern: /OR\s+1\s*=\s*1/i, message: "Potential SQL injection vulnerability \u2014 use parameterized queries", severity: "error", languages: ["sql"] },
    { pattern: /'\s*OR\s*'\s*'\s*=\s*'/i, message: "SQL injection pattern detected \u2014 use parameterized queries", severity: "error", languages: ["sql"] },
    { pattern: /;\s*DROP/i, message: "Potential SQL injection \u2014 use parameterized queries", severity: "error", languages: ["sql"] },
    { pattern: /LIKE\s+['"]%/i, message: "LIKE with leading wildcard (%) is slow \u2014 consider full-text search", severity: "warning", languages: ["sql"] },
    { pattern: /N\+1/, message: "N+1 query pattern detected \u2014 use JOIN or batch loading", severity: "warning", languages: ["sql"] },
    // C / C++
    { pattern: /\bmalloc\s*\(/, message: "Always check if malloc returned NULL before using the pointer", severity: "warning", languages: ["c", "cpp"] },
    { pattern: /\bfree\s*\(/, message: "Set pointer to NULL after free to avoid dangling pointer", severity: "info", languages: ["c", "cpp"] },
    { pattern: /\bsprintf\b/, message: "Use snprintf() instead of sprintf() to prevent buffer overflow", severity: "error", languages: ["c", "cpp"] },
    { pattern: /\bstrcpy\b/, message: "Use strncpy() or strlcpy() instead of strcpy() to prevent overflow", severity: "error", languages: ["c", "cpp"] },
    { pattern: /\bstrcat\b/, message: "Use strncat() or strlcat() instead of strcat() to prevent overflow", severity: "error", languages: ["c", "cpp"] },
    { pattern: /\bgets\b/, message: "NEVER use gets() \u2014 it cannot be used safely. Use fgets() instead", severity: "error", languages: ["c", "cpp"] },
    { pattern: /\bscanf\b/, message: "Consider using fgets() + sscanf() for safer input parsing", severity: "warning", languages: ["c", "cpp"] },
    { pattern: /\bgoto\b/, message: "Avoid goto \u2014 use structured control flow (break, return, functions)", severity: "warning", languages: ["c", "cpp"] },
    { pattern: /\bprintf\b/, message: "Consider using streams (cout) in C++ for type safety", severity: "style", languages: ["cpp"] },
    // C#
    { pattern: /\bConsole\.Write(Line)?\s*\(/, message: "Remove Console.Write/Line before production", severity: "info", languages: ["cs"] },
    { pattern: /\bvar\s+\w+\s*=\s*null/, message: "Cannot assign null to implicitly-typed variable. Use explicit type.", severity: "error", languages: ["cs"] },
    { pattern: /\bArrayList\b/, message: "Use `List<T>` instead of `ArrayList` for type safety", severity: "warning", languages: ["cs"] },
    { pattern: /\bHashtable\b/, message: "Use `Dictionary<TKey, TValue>` instead of `Hashtable`", severity: "warning", languages: ["cs"] },
    // Kotlin
    { pattern: /\bprintln\s*\(/, message: "Remove println before production", severity: "info", languages: ["kt"] },
    { pattern: /\b!!\b/, message: "Avoid `!!` (non-null assertion) \u2014 use safe calls `?.` or Elvis `?:`", severity: "warning", languages: ["kt"] },
    { pattern: /\bas\s*\)/, message: "Use safe cast `as?` instead of `as` to avoid ClassCastException", severity: "warning", languages: ["kt"] },
    // Swift
    { pattern: /\bprint\s*\(/, message: "Remove print before production", severity: "info", languages: ["swift"] },
    { pattern: /\b!\s*\)/, message: "Force unwrapping `!` may crash \u2014 use optional binding `if let` or `guard let`", severity: "warning", languages: ["swift"] },
    { pattern: /\btry!\b/, message: "Avoid `try!` \u2014 force-try crashes on error. Use `try` with `do/catch`.", severity: "warning", languages: ["swift"] },
    { pattern: /\bImplicitlyUnwrappedOptional\b/, message: "Avoid IUOs \u2014 use regular Optionals with `?`", severity: "warning", languages: ["swift"] },
    // General / cross-language
    { pattern: /TODO/i, message: "TODO left in code \u2014 implement this before shipping", severity: "info", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /FIXME/i, message: "FIXME left in code \u2014 fix this before shipping", severity: "warning", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /XXX/i, message: "XXX marker in code \u2014 review before shipping", severity: "info", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /HACK/i, message: "HACK in code \u2014 consider a cleaner solution", severity: "info", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /\bhack\b/i, message: "Hacky code detected \u2014 consider refactoring", severity: "style", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /\bsecret\b|\bpassword\b|\bapi.?key\b|\btoken\b/i, message: "Potential secret hardcoded \u2014 use environment variables instead", severity: "warning", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /^\s{3,4}(?!\s)/m, message: "Inconsistent indentation \u2014 use 2 or 4 spaces consistently", severity: "style", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /\t/, message: "Tabs detected \u2014 consider using spaces for indentation", severity: "style", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] },
    { pattern: /\n{4,}/, message: "Too many consecutive blank lines \u2014 max 2 recommended", severity: "style", languages: ["js", "ts", "py", "go", "rs", "c", "cpp", "cs", "kt", "swift", "zig", "java"] }
  ];
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function keywordInText(text, keyword) {
    const lower = text.toLowerCase();
    const kw = keyword.toLowerCase();
    const escaped = escapeRegex(kw);
    if (kw.includes(" ")) {
      return lower.includes(kw);
    }
    return new RegExp("\\b" + escaped + "\\b", "i").test(text);
  }
  function detectLanguageInQuery(q) {
    const lower = q.toLowerCase();
    for (const [code, name] of Object.entries(LANG_NAMES)) {
      const lowerName = name.toLowerCase();
      if (lower === lowerName || lower.includes(lowerName)) {
        return code;
      }
    }
    for (const [alias, code] of Object.entries(NAME_TO_LANG)) {
      if (lower === alias || lower.includes(alias)) {
        return code;
      }
    }
    if (/\b(js|javascript)\b/.test(lower)) return "js";
    if (/\bts|typescript\b/.test(lower)) return "ts";
    if (/\bpy|python\b/.test(lower)) return "py";
    if (/\bgo|golang\b/.test(lower)) return "go";
    if (/\brs|rust\b/.test(lower)) return "rs";
    if (/\bkt|kotlin\b/.test(lower)) return "kt";
    return null;
  }
  function getLanguageIntro(langCode) {
    const data = courseData();
    const langCourses = data[langCode];
    if (!langCourses) return null;
    const phases = Object.keys(langCourses);
    if (phases.length === 0) return null;
    const firstPhase = langCourses[phases[0]];
    const topics = Object.keys(firstPhase);
    if (topics.length === 0) return null;
    const firstTopic = firstPhase[topics[0]];
    return {
      displayName: LANG_NAMES[langCode] || langCode.toUpperCase(),
      exp: firstTopic.exp || "",
      code: firstTopic.code || ""
    };
  }
  function expandSynonyms(word) {
    for (const syns of Object.values(SYNONYM_MAP)) {
      if (syns.includes(word) || syns.some((s) => s.includes(word))) {
        return syns;
      }
    }
    return [word];
  }
  function getAIResponse(input, history) {
    const q = input.toLowerCase().trim();
    if (!q) return "Ask me something about programming!";
    if (history && history.length >= 2) {
      const hist = history;
      const lastBot = [...hist].reverse().find((m) => m.role === "bot");
      if (lastBot) {
        const bt = lastBot.text.toLowerCase();
        const followUpWords = /^(yes|ok|sure|tell me more|example|show me|how|what|why|more details|elaborate|can you explain|tell me more about|show example|example please|give example)\b/i;
        if (followUpWords.test(q)) {
          for (const entry of aiTutorResponses) {
            if (entry.keywords.some((k) => bt.includes(k))) {
              return entry.response + "\n\n---\n*Following up on our previous conversation...*";
            }
          }
          const ct2 = currentTopic();
          if (ct2) {
            return `Let's keep exploring **${ct2}**! Try this:
1. Modify the code example in the editor
2. Click Run to see what happens
3. Ask me about anything you notice!

What specific part would you like to dive deeper into?`;
          }
        }
      }
    }
    let bestEntry = null;
    let bestScore = 0;
    for (const entry of aiTutorResponses) {
      let matched = 0;
      for (const kw of entry.keywords) {
        if (keywordInText(q, kw)) matched++;
      }
      if (matched > 0) {
        const ratio = matched / entry.keywords.length;
        const score = matched * (1 + ratio);
        if (score > bestScore) {
          bestScore = score;
          bestEntry = entry;
        }
      }
    }
    if (bestEntry) {
      let reply = bestEntry.response;
      const cl = currentLang();
      if (cl && !q.includes("language") && !q.includes(cl)) {
        reply += `

**You're studying:** ${cl.toUpperCase()}`;
        reply += `
Try the code example in the editor, modify it, and click Run to see what happens!`;
      }
      return reply;
    }
    for (const entry of aiTutorResponses) {
      const combined = entry.keywords.join(" ");
      if (combined.includes(q.replace(/[^a-z\s]/g, "").trim())) {
        return entry.response;
      }
    }
    if (q.includes("thank") || q.includes("thanks")) {
      return "You're welcome! Keep up the great work. Learning programming is a journey \u2014 enjoy every step! What would you like to learn next?";
    }
    if (q.includes("hello") || q.includes("hi ") || q === "hey" || q.includes("good")) {
      const cl = currentLang();
      const langInfo = cl ? `I see you're studying **${cl.toUpperCase()}**. ` : "";
      return `Hello! ${langInfo}Ask me anything about the topic you're working on, or pick a suggestion below to get started!`;
    }
    const ct = currentTopic();
    if (ct) {
      return `Great question about **${ct}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far in the editor? Tell me your thought process and I'll help guide you to the right solution!`;
    }
    const fallbacks = [
      "That's an interesting question! To help you best, could you tell me:\n1. What language are you working with?\n2. What topic are you studying?\n3. What have you tried so far?",
      `I want to make sure I help you effectively. Could you tell me more about what you're working on? For example: "Explain functions" or "Help me debug my loop".`,
      "Let me help you learn! Try asking me about a specific topic you're studying, or tell me what you're trying to build. I can explain concepts, debug code, and suggest practice exercises.",
      `I'd love to help! Can you give me a bit more context? Try asking a question like "How do I use arrays?" or "Explain async/await".`,
      `Not sure what you're looking for \u2014 but that's OK! Try picking a topic from the curriculum on the left, or ask me something like "What is a variable?".`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  function getLocalAIResponse(input) {
    const q = input.toLowerCase().trim();
    if (!q || q.length < 3) return null;
    const words = q.split(/\s+/).filter((w2) => w2.length > 2);
    const meta = ["help", "hello", "hi", "hey", "thanks"];
    if (meta.includes(q) || words.length === 0) return null;
    const askedLang = detectLanguageInQuery(q);
    const searchLang = askedLang || currentLang();
    const data = courseData();
    const langData = data[searchLang];
    if (!langData) return null;
    if (askedLang && askedLang !== currentLang()) {
      const intro = getLanguageIntro(askedLang);
      if (intro) {
        return `**${intro.displayName}** is a programming language you can study here!<br><br>${intro.exp || ""}<br><br>**Example code:**<br><pre style="background:#000;color:#a5f3fc;padding:12px;border-radius:6px;font-size:11px;line-height:1.5;overflow-x:auto;margin:0;">${(intro.code || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre><br>Want to switch to **${intro.displayName}**? Click the language selector at the top!<br><br>I can also tell you about specific topics in ${intro.displayName} \u2014 just ask!`;
      }
    }
    const expandedWords = /* @__PURE__ */ new Set();
    for (const w2 of words) {
      for (const syn of expandSynonyms(w2)) {
        expandedWords.add(syn);
      }
    }
    const allWords = [...expandedWords];
    let best = null;
    let bestScore = 0;
    for (const phase in langData) {
      for (const topic in langData[phase]) {
        const item = langData[phase][topic];
        const topicLow = topic.toLowerCase();
        const expLow = (item.exp || "").toLowerCase();
        const searchText = topicLow + " " + expLow;
        let score = 0;
        let matchedWords = 0;
        let topicMatches = 0;
        for (const word of allWords) {
          if (topicLow.includes(word)) {
            score += 3;
            matchedWords++;
            topicMatches++;
          }
          if (expLow.includes(word)) {
            score += 1;
            matchedWords++;
          }
        }
        if (searchText.includes(q)) score += 10;
        if (matchedWords > 0) score = score * (1 + matchedWords / (allWords.length || 1));
        if (topicMatches > 0) score *= 1.3;
        if (phase === currentPhase() && searchLang === currentLang()) score *= 1.2;
        if (score > bestScore) {
          bestScore = score;
          best = { phase, topic, code: item.code || "", exp: item.exp || "", lang: searchLang };
        }
      }
    }
    if (best && bestScore >= 1.5) {
      const cl = currentLang();
      const langLabel = best.lang !== cl ? ` (${LANG_NAMES[best.lang] || best.lang.toUpperCase()})` : "";
      return `I found this in the curriculum that might help:<br><br><b>${best.topic}</b>${langLabel} \u2014 ${best.phase}<br><br>${best.exp || ""}<br><br><pre style="background:#000;color:#a5f3fc;padding:12px;border-radius:6px;font-size:11px;line-height:1.5;overflow-x:auto;margin:0;">${best.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre><br><b>Try this:</b> paste the code into the editor, modify it, and click Run to experiment!`;
    }
    return null;
  }
  function getErrorTutorTip(topic, output) {
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.re.test(output || "")) {
        return `I see you got a **${pattern.title}**! Don't worry, this is totally normal. Let's fix it together.

${pattern.tip}

**Still stuck?** Share what you expected to happen vs what actually happened and I'll help more!`;
      }
    }
    const normalizedTopic = topic ? topic.toLowerCase() : "";
    const topicTips = {
      variable: "Check if the variable is declared with `let`, `const`, or `var` before using it. Also check for typos \u2014 JavaScript is case-sensitive!",
      function: "Make sure your function has a closing `}` and that you're calling it with `()`. If it takes parameters, check you're passing the right number.",
      loop: "Check for infinite loops: does your loop condition eventually become false? Are you incrementing your counter?",
      array: "Arrays are 0-indexed \u2014 `arr[arr.length]` is out of bounds. Valid indices go from 0 to arr.length-1.",
      string: "Check that all string quotes match. `\"hello'` or `'hello\"` will cause an error. Also check concatenation with `+` vs template literals.",
      class: "Did you use the `new` keyword when creating an instance? Forgetting `new` causes the constructor to return `undefined` in non-strict mode.",
      async: "Did you forget `await`? Without it, you get a Promise object instead of the actual value. Also make sure you're in an `async` function."
    };
    for (const [key, tip] of Object.entries(topicTips)) {
      if (normalizedTopic.includes(key)) {
        return `I see you're learning about **${topic}** and got an error. That's part of the process!

${tip}

Try fixing the code and running it again. If you're still stuck, share what you expected vs what happened.`;
      }
    }
    return null;
  }
  function analyzeUserCodeClient(code, lang) {
    const lines = code.split("\n");
    const issues = [];
    const openers = code.match(/[{([\[]/g);
    const closers = code.match(/[})\]]/g);
    if (openers && closers && openers.length !== closers.length) {
      issues.push(`Unbalanced delimiters: ${openers.length} opening vs ${closers.length} closing`);
    }
    const hasFnWithBody = /\bfunction\s+\w+\s*\([^)]*\)\s*\{[\s\S]*\}/.test(code);
    const hasReturn = /\breturn\b/.test(code);
    if (hasFnWithBody && !hasReturn) {
      if (/\bfunction\s+\w+\s*\(/.test(code)) {
        issues.push("Function declared but missing `return` statement \u2014 does it need one?");
      }
    }
    if (/==(?!\s*=)/.test(code) && lang === "js") {
      issues.push("Using `==` instead of `===` \u2014 use strict equality to avoid type coercion bugs");
    }
    if (/\bvar\s+/.test(code) && (lang === "js" || lang === "ts")) {
      issues.push("Using `var` \u2014 consider `let` or `const` for better scoping");
    }
    return issues.join("\n");
  }
  function localFindLineIndex(text, matchIndex) {
    const before = text.slice(0, matchIndex);
    return before.split("\n").length - 1;
  }
  function localAnalyzeStructure(code) {
    const issues = [];
    const lines = code.split("\n");
    const pairs = [
      { open: "{", close: "}", name: "curly braces" },
      { open: "(", close: ")", name: "parentheses" },
      { open: "[", close: "]", name: "brackets" }
    ];
    for (const pair of pairs) {
      const openCount = (code.match(new RegExp(pair.open.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      const closeCount = (code.match(new RegExp(pair.close.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      if (openCount !== closeCount) {
        let problemLine = 0;
        if (openCount > closeCount) {
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(pair.open)) problemLine = i;
          }
        } else {
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(pair.close)) problemLine = i;
          }
        }
        issues.push({
          message: `Unbalanced ${pair.name} (${openCount} open, ${closeCount} close)`,
          severity: openCount > closeCount ? "warning" : "error",
          line: problemLine + 1
        });
      }
    }
    const fnRegex = /\b(function|=>|def\s+\w+|func\s+\w+)\s*\(/;
    if (fnRegex.test(code) && !/\breturn\b/.test(code)) {
      const singleReturnOk = /\.map\(|\.filter\(|\.forEach\(|console\.log/.test(code);
      if (!singleReturnOk) {
        const fnLines = lines.map((l, i) => l.match(fnRegex) ? i : -1).filter((i) => i >= 0);
        for (const fnLine of fnLines) {
          issues.push({
            message: "Function/closure declared but no `return` found \u2014 verify this is intentional",
            severity: "info",
            line: fnLine + 1
          });
        }
      }
    }
    return issues;
  }
  function localCheckKeywords(code, lang) {
    const issues = [];
    const lines = code.split("\n");
    for (const rule of KEYWORD_ISSUES) {
      if (!rule.languages.includes(lang)) continue;
      const matches = code.match(rule.pattern);
      if (matches) {
        const idx = code.indexOf(matches[0]);
        const line = localFindLineIndex(code, idx) + 1;
        issues.push({ message: rule.message, severity: rule.severity, line });
      }
    }
    return issues;
  }
  function localCalculateScore(issues, lineCount) {
    let score = 10;
    for (const issue of issues) {
      if (issue.severity === "error") score -= 2;
      else if (issue.severity === "warning") score -= 1;
      else if (issue.severity === "style") score -= 0.3;
      else score -= 0.1;
    }
    if (lineCount > 100) score -= 0.5;
    if (lineCount > 200) score -= 1;
    return Math.max(1, Math.round(score * 10) / 10);
  }
  function localCodeReview(code, lang) {
    if (!code || !code.trim()) {
      return { review: "No code to review.", issues: [], score: 0 };
    }
    const lines = code.split("\n");
    const structuralIssues = localAnalyzeStructure(code);
    const keywordIssues = localCheckKeywords(code, lang);
    const allIssues = [...structuralIssues, ...keywordIssues];
    const hasMain = /\bmain\b/i.test(code);
    const hasFunctions = /\b(function|=>|def\s+\w+|func\s+\w+)\s*\(/.test(code);
    const hasClass = /\bclass\s+/.test(code);
    const hasLoop = /for\s*\(|while\s*\(|\.forEach|for\s+\w+\s+in|for\s+\w+\s+of/.test(code);
    const hasConditional = /if\s*\(|elif\s+|else\s+/.test(code);
    const hasTryCatch = /\btry\b/.test(code) && (/\bcatch\b/.test(code) || /\bexcept\b/.test(code));
    const hasAsync = /\basync\b|\bawait\b|\.then\(/.test(code);
    const upper = lang ? lang.toUpperCase() : "CODE";
    let review = `**Code Review \u2014 ${upper}**

`;
    review += `**Overview:** ${lines.length} lines, ${hasFunctions ? "contains functions, " : ""}${hasClass ? "contains classes, " : ""}${hasLoop ? "uses loops, " : ""}${hasConditional ? "uses conditionals, " : ""}${hasTryCatch ? "has error handling, " : ""}${hasAsync ? "uses async patterns." : "."}`;
    if (allIssues.length > 0) {
      review += "\n\n**Issues Found:**\n";
      const bySeverity = { error: [], warning: [], style: [], info: [] };
      for (const issue of allIssues) {
        (bySeverity[issue.severity] || bySeverity.info).push(issue);
      }
      for (const sev of ["error", "warning", "style", "info"]) {
        for (const issue of bySeverity[sev]) {
          const line = issue.line ? `Line ${issue.line}` : "General";
          review += `- [${sev.toUpperCase()}] ${line}: ${issue.message}
`;
        }
      }
    }
    if (hasMain && !hasFunctions && lines.length < 10) {
      review += "\n**Suggestion:** This code is very simple \u2014 try organizing it into functions to practice modular design.\n";
    }
    if (lines.length > 50) {
      review += `
**Suggestion:** This function/file is getting long (${lines.length} lines). Consider breaking it into smaller functions for readability.
`;
    }
    if (!hasTryCatch && (/\bfetch\s*\(/.test(code) || /\breadFile\b/.test(code) || /\bwriteFile\b/.test(code))) {
      review += "\n**Suggestion:** I/O operations like fetch/file access can fail \u2014 add error handling with try/catch.\n";
    }
    const commentRe = /^\s*(\/\/|#|\/\*)/;
    const commentedLines = lines.filter((l) => commentRe.test(l)).length;
    const commentedRatio = commentedLines / lines.length;
    if (commentedRatio > 0.4) {
      review += `
**Suggestion:** High comment-to-code ratio (${Math.round(commentedRatio * 100)}%). Comments explain WHY, not WHAT \u2014 let the code speak for itself.
`;
    }
    const score = localCalculateScore(allIssues, lines.length);
    review += `
**Score:** ${score}/10`;
    return { review, issues: allIssues, score };
  }
  function localCodeExplain(code, lang, topic) {
    if (!code || !code.trim()) {
      return { explanation: "No code to explain.", issues: [], score: 0 };
    }
    const lines = code.split("\n");
    const langLabel = (lang || "code").toUpperCase();
    const reviewResult = localCodeReview(code, lang || "js");
    const funcNames = [];
    const funcRe = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|\bfunction\b)|def\s+(\w+)|func\s+(\w+)|fn\s+(\w+))/g;
    let fm;
    while ((fm = funcRe.exec(code)) !== null) {
      const name = fm[1] || fm[2] || fm[3] || fm[4] || fm[5];
      if (name) funcNames.push(name);
    }
    const varDecls = [];
    const varRe = /(?:const|let|var)\s+(\w+)\s*=\s*([^;]+)/g;
    let vm;
    while ((vm = varRe.exec(code)) !== null) {
      const val = vm[2].trim();
      let shortVal = val.slice(0, 30);
      if (val.length > 30) shortVal += "...";
      varDecls.push({ name: vm[1], val: shortVal });
    }
    const patterns = [];
    if (/\btry\b/.test(code) && /\bcatch\b/.test(code)) patterns.push("error handling");
    if (/\basync\b|\bawait\b/.test(code)) patterns.push("async/await");
    if (/\.map\s*\(/.test(code)) patterns.push("Array.map");
    if (/\.filter\s*\(/.test(code)) patterns.push("Array.filter");
    if (/\.reduce\s*\(/.test(code)) patterns.push("Array.reduce");
    if (/fetch\s*\(/.test(code)) patterns.push("HTTP requests");
    if (/Promise/.test(code)) patterns.push("Promises");
    if (/addEventListener/.test(code)) patterns.push("event handling");
    let explanation = `**Code Explanation \u2014 ${langLabel}**

`;
    explanation += `This code is **${lines.length} lines** long.`;
    if (funcNames.length > 0) {
      explanation += ` It defines **${funcNames.length} function(s)**: \`${funcNames.join("`, `")}\`.`;
    }
    if (varDecls.length > 0) {
      explanation += `

**Variables:**
`;
      for (const v of varDecls) {
        explanation += `\u2022 \`${v.name}\` = ${v.val}
`;
      }
    }
    if (patterns.length > 0) {
      explanation += `
**Techniques used:** ${patterns.join(", ")}.
`;
    }
    if (/\breturn\b/.test(code)) {
      const retLines = lines.filter((l) => /^\s*return\b/.test(l));
      if (retLines.length > 0) {
        explanation += `
**Returns:** The function${retLines.length > 1 ? "s" : ""} return${retLines.length === 1 ? "s" : ""} a value at line${retLines.length > 1 ? "s" : ""}: \`${retLines[0].trim()}\`
`;
      }
    }
    if (/console\.log/.test(code)) {
      const logLines = lines.filter((l) => /console\.log/.test(l));
      explanation += `
**Output:** Prints ${logLines.length} value(s) to the console.
`;
    }
    explanation += `
**How it works (step by step):**`;
    const relevantLines = lines.filter((l) => l.trim() && !l.trim().match(/^\s*(\/\/|#)/));
    if (relevantLines.length <= 20) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/^\s*(\/\/|#)/.test(line)) {
          explanation += `
\u2022 *(comment)* ${trimmed.replace(/^\/\/\s*|^#\s*/, "")}`;
        } else if (/^\s*(import|require|from)\b/.test(line)) {
          explanation += `
\u2022 **import** \u2014 loads dependencies`;
        } else if (/^\s*(const|let|var)\s+\w+\s*=/.test(line)) {
          const vn = trimmed.match(/(?:const|let|var)\s+(\w+)/)?.[1] || "";
          const vv = trimmed.match(/=\s*(.+)/)?.[1] || "";
          explanation += `
\u2022 Declares \`${vn}\` = ${vv.slice(0, 40)}`;
        } else if (/^\s*(function|def|func|fn)\s/.test(line)) {
          const fn = trimmed.match(/(?:function|def|func|fn)\s+(\w+)/)?.[1] || "";
          explanation += `
\u2022 Defines **\`${fn}\`** function`;
        } else if (/^\s*return\b/.test(line)) {
          explanation += `
\u2022 **Returns** ${trimmed.replace(/^return\s*/, "").slice(0, 50)}`;
        } else if (/^\s*(if|elif|else if|else)\b/.test(line)) {
          explanation += `
\u2022 **Conditional** branch`;
        } else if (/^\s*(for|while)\b/.test(line)) {
          explanation += `
\u2022 **Loop** \u2014 repeats execution`;
        } else if (/^\s*console\.log/.test(line)) {
          const lg = trimmed.match(/console\.log\s*\((.+)\)/)?.[1] || "";
          explanation += `
\u2022 **Prints** ${lg.slice(0, 50)}`;
        } else if (/^\s*try\b/.test(line)) {
          explanation += `
\u2022 **Try** \u2014 starts error handling`;
        } else if (/^\s*catch\b/.test(line)) {
          explanation += `
\u2022 **Catch** \u2014 handles errors`;
        } else if (/^\s*throw\b/.test(line)) {
          explanation += `
\u2022 **Throws** an error`;
        } else if (/^\s*class\s/.test(line)) {
          const cn = trimmed.match(/class\s+(\w+)/)?.[1] || "";
          explanation += `
\u2022 Defines **class** \`${cn}\``;
        } else if (/^\s*\}\s*$/.test(line)) {
          explanation += `
\u2022 *End of block*`;
        } else {
          explanation += `
\u2022 \`${trimmed.slice(0, 60)}\``;
        }
      }
    } else {
      explanation += `
\u2022 Runs ${relevantLines.length} lines of code`;
      if (/\breturn\b/.test(code)) explanation += `
\u2022 **Returns** a value at the end`;
      if (/console\.log/.test(code)) explanation += `
\u2022 **Outputs** results to console`;
      explanation += `
\u2022 *(code too long for full line-by-line explanation)*`;
    }
    if (topic) {
      explanation += `

**Context:** Relates to **"${topic}"**. Focus on how this concept is applied.`;
    }
    if (reviewResult.issues && reviewResult.issues.length > 0) {
      explanation += "\n\n**Potential Issues:**\n";
      reviewResult.issues.forEach((issue, i) => {
        const line = issue.line ? `(line ${issue.line})` : "";
        explanation += `${i + 1}. [${issue.severity.toUpperCase()}] ${line} ${issue.message}
`;
      });
    }
    if (reviewResult.score !== void 0) {
      explanation += `
**Code Score:** ${reviewResult.score}/10`;
    }
    explanation += "\n\n**Try this:** Modify the values in the editor and click **Run \u25B6** to see how output changes!";
    return { explanation, issues: reviewResult.issues, score: reviewResult.score };
  }
  function localGenerateExercise(topic, lang, level) {
    const exercises = {
      variables: {
        beginner: {
          title: "Declare and Print a Variable",
          description: "Declare a variable called `name` with your name as a string, then print it.",
          starterCode: '// Declare your variable here\nlet name = "Your Name";\nconsole.log(name);',
          solution: 'let name = "Alice";\nconsole.log(name);',
          hint: "Use `let variableName = value;` syntax.",
          test: 'typeof name === "string"'
        },
        intermediate: {
          title: "Variable Swap",
          description: "Swap the values of two variables without using a temporary variable.",
          starterCode: "let a = 5;\nlet b = 10;\n// Swap a and b here\nconsole.log(a, b); // should print 10 5",
          solution: "let a = 5;\nlet b = 10;\n[a, b] = [b, a];\nconsole.log(a, b);",
          hint: "JavaScript supports destructuring assignment.",
          test: "a === 10 && b === 5"
        }
      },
      functions: {
        beginner: {
          title: "Write an Add Function",
          description: "Write a function called `add` that takes two numbers and returns their sum.",
          starterCode: "function add(a, b) {\n  // Your code here\n}\nconsole.log(add(2, 3)); // should print 5",
          solution: "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));",
          hint: "Use the `return` keyword to send back a value.",
          test: "add(2,3) === 5"
        }
      },
      loops: {
        beginner: {
          title: "Count to 10",
          description: "Write a for loop that prints numbers 1 through 10.",
          starterCode: "// Write your loop here\nfor (let i = 1; i <= 10; i++) {\n  console.log(i);\n}",
          solution: "for (let i = 1; i <= 10; i++) {\n  console.log(i);\n}",
          hint: "A for loop has: initializer, condition, increment.",
          test: "true"
        }
      },
      arrays: {
        beginner: {
          title: "Sum an Array",
          description: "Write a function that takes an array of numbers and returns their sum.",
          starterCode: "function sumArray(arr) {\n  // Your code here\n}\nconsole.log(sumArray([1, 2, 3, 4])); // should print 10",
          solution: "function sumArray(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}\nconsole.log(sumArray([1, 2, 3, 4]));",
          hint: "Use `reduce` or a loop to accumulate values.",
          test: "sumArray([1,2,3,4]) === 10"
        },
        intermediate: {
          title: "Remove Duplicates",
          description: "Write a function to remove duplicate values from an array.",
          starterCode: "function removeDuplicates(arr) {\n  // Your code here\n}\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 4])); // should print [1, 2, 3, 4]",
          solution: "function removeDuplicates(arr) {\n  return [...new Set(arr)];\n}\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 4]));",
          hint: "A `Set` automatically keeps unique values.",
          test: "JSON.stringify(removeDuplicates([1,2,2,3,3,4])) === JSON.stringify([1,2,3,4])"
        }
      },
      strings: {
        beginner: {
          title: "Reverse a String",
          description: "Write a function to reverse a string.",
          starterCode: 'function reverseString(str) {\n  // Your code here\n}\nconsole.log(reverseString("hello")); // should print "olleh"',
          solution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}\nconsole.log(reverseString("hello"));',
          hint: 'Use `.split("")`, `.reverse()`, and `.join("")`.',
          test: 'reverseString("hello") === "olleh"'
        },
        intermediate: {
          title: "Check Palindrome",
          description: "Write a function to check if a string is a palindrome (reads the same forward and backward).",
          starterCode: 'function isPalindrome(str) {\n  // Your code here\n}\nconsole.log(isPalindrome("racecar")); // should print true\nconsole.log(isPalindrome("hello")); // should print false',
          solution: 'function isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return cleaned === cleaned.split("").reverse().join("");\n}\nconsole.log(isPalindrome("racecar"));\nconsole.log(isPalindrome("hello"));',
          hint: "Clean the string first (lowercase, remove non-alphanumeric), then compare to its reverse.",
          test: 'isPalindrome("racecar") === true'
        }
      },
      conditionals: {
        beginner: {
          title: "Even or Odd",
          description: "Write a function that tells whether a number is even or odd.",
          starterCode: 'function evenOrOdd(n) {\n  // Your code here\n}\nconsole.log(evenOrOdd(4)); // should print "even"\nconsole.log(evenOrOdd(7)); // should print "odd"',
          solution: 'function evenOrOdd(n) {\n  return n % 2 === 0 ? "even" : "odd";\n}\nconsole.log(evenOrOdd(4));\nconsole.log(evenOrOdd(7));',
          hint: "Use the modulo operator `%` to check divisibility by 2.",
          test: 'evenOrOdd(4) === "even" && evenOrOdd(7) === "odd"'
        }
      },
      objects: {
        beginner: {
          title: "Create a User Object",
          description: "Create an object representing a user with `name`, `age`, and `email` properties, then print a greeting.",
          starterCode: "// Create your object here\nconst user = {\n  // Your code here\n};\nconsole.log(user.name); // should print the name",
          solution: 'const user = {\n  name: "Alice",\n  age: 25,\n  email: "alice@example.com"\n};\nconsole.log(user.name);',
          hint: "Object properties are key-value pairs separated by commas.",
          test: 'typeof user === "object" && user.name !== undefined'
        }
      }
    };
    const levelKey = level || "beginner";
    const normalizedTopic = (topic || "").toLowerCase();
    const key = Object.keys(exercises).find((k) => normalizedTopic.includes(k));
    if (key) {
      const topicExercises = exercises[key];
      const result = topicExercises[levelKey] || topicExercises.beginner;
      if (result) return result;
    }
    return {
      title: `Practice: ${topic || "programming"}`,
      description: `Write code related to "${topic || "programming"}" in ${lang || "JavaScript"}. Try implementing the concept you just learned.`,
      starterCode: `// Practice: ${topic || "programming"}
// Write your code here
`,
      solution: "",
      hint: `Review the ${topic || "topic"} section in the curriculum.`,
      test: "true"
    };
  }
  root.LANG_NAMES = LANG_NAMES;
  root.NAME_TO_LANG = NAME_TO_LANG;
  root.SYNONYM_MAP = SYNONYM_MAP;
  root.ERROR_PATTERNS = ERROR_PATTERNS;
  root.KEYWORD_ISSUES = KEYWORD_ISSUES;
  root.detectLanguageInQuery = detectLanguageInQuery;
  root.getLanguageIntro = getLanguageIntro;
  root.expandSynonyms = expandSynonyms;
  root.getAIResponse = getAIResponse;
  root.getLocalAIResponse = getLocalAIResponse;
  root.getErrorTutorTip = getErrorTutorTip;
  root.analyzeUserCodeClient = analyzeUserCodeClient;
  root.localFindLineIndex = localFindLineIndex;
  root.localAnalyzeStructure = localAnalyzeStructure;
  root.localCheckKeywords = localCheckKeywords;
  root.localCalculateScore = localCalculateScore;
  root.localCodeReview = localCodeReview;
  root.localCodeExplain = localCodeExplain;
  root.localGenerateExercise = localGenerateExercise;
})(typeof self !== "undefined" ? self : this);
