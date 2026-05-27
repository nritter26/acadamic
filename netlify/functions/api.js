const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const CONTENT_DIR = path.join(ROOT, 'content');
const ACTIVE_AI_PROVIDER = process.env.AI_PROVIDER || 'hybrid';

// ── Optional TS module imports (require build step to work on Netlify) ──
let askLLM, learner, codeReview, generateExercise, semanticSearch, getTopicContext, getCurriculumContext;
let database;
try {
  const m = require('../../ai/provider');
  askLLM = m.askLLM;
} catch {}
try { database = require('../../sql/database'); } catch {}
try { learner = require('../../ai/learner'); } catch {}
try {
  const r = require('../../ai/reviewer');
  codeReview = r.review;
} catch {}
try {
  const e = require('../../ai/exercises');
  generateExercise = e.generateExercise;
} catch {}
try {
  const s = require('../../ai/embeddings');
  semanticSearch = s.search;
  getTopicContext = s.getTopicContext;
  getCurriculumContext = s.getCurriculumContext;
} catch {}

exports.handler = async (event) => {
  const pathParts = event.path.replace(/^\/api\//, '').split('/');
  const route = pathParts[0];
  const subRoute = pathParts[1];

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {}

  const routeMap = {
    'health':       () => handleHealth(event),
    'progress':     () => handleProgress(event, body),
    'execute':      () => handleExecute(event, body),
    'analyze':      () => handleAnalyze(body),
    'chat':         () => handleChat(body),
    'explain':      () => handleExplain(body),
    'review':       () => handleReview(body),
    'exercise':     () => handleExercise(body, event),
    'proxy':        () => handleProxy(body),
    'benchmark':    () => handleBenchmark(event),
    'courses':      () => handleCourses(),
    'learner':      () => {
      const sub = { state: handleLearnerState, track: handleLearnerTrack, reviews: handleLearnerReviews, recommend: handleLearnerRecommend }[subRoute];
      return sub ? sub(event, body) : { statusCode: 404, body: JSON.stringify({ error: 'Unknown learner route' }) };
    },
  };

  const handler = routeMap[route];
  if (!handler) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };

  const result = await handler();
  return { ...result, headers };
};

// ── Health ──
async function handleHealth() {
  const compilers = {};
  const checks = {
    py: ['python3', '--version'], go: ['go', 'version'], rs: ['rustc', '--version'],
    c: ['gcc', '--version'], cpp: ['g++', '--version'], cs: ['dotnet', '--version'],
    kt: ['kotlinc', '-version'], swift: ['swift', '--version'], asm: ['nasm', '--version'], zig: ['zig', 'version'],
    ts: ['tsx', '--version'],
  };
  for (const [lang, [cmd, flag]] of Object.entries(checks)) {
    try {
      const out = execSync(`${cmd} ${flag}`, { timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] });
      compilers[lang] = { available: true, version: out.toString().split('\n')[0].trim() };
    } catch {
      compilers[lang] = { available: false, version: null };
    }
  }
  let dbStatus = { sqlite: { available: false } };
  if (database) dbStatus = database.getStatus();
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok', node: process.version, compilers, database: dbStatus }),
  };
}

// ── Progress ──
function handleProgress(event, body) {
  if (event.httpMethod === 'GET') {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      if (!fs.existsSync(PROGRESS_FILE)) fs.writeFileSync(PROGRESS_FILE, '{}');
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      return { statusCode: 200, body: JSON.stringify(data) };
    } catch { return { statusCode: 200, body: '{}' }; }
  }
  if (event.httpMethod === 'POST') {
    try {
      const { lang, topic, completed } = body;
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      if (!data[lang]) data[lang] = {};
      data[lang][topic] = completed;
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (e) { return { statusCode: 400, body: JSON.stringify({ error: e.message }) }; }
  }
  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
}

// ── Execute ──
async function handleExecute(event, body) {
  const { lang, code, stdin } = body;
  if (!code) return { statusCode: 400, body: JSON.stringify({ error: 'No code provided' }) };

  // JavaScript via VM sandbox
  if (lang === 'js') {
    try {
      let output = '';
      const consoleCounts = {};
      const consoleTimers = {};
      const sandbox = {
        console: {
          log: (...args) => { output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
          info: (...args) => { output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
          debug: (...args) => { output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
          warn: (...args) => { output += 'WARN: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
          error: (...args) => { output += 'ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
          assert: (condition, ...args) => { if (!condition) output += 'Assertion failed: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
          trace: () => { output += 'console.trace()\n'; },
          dir: (obj) => { output += JSON.stringify(obj, null, 2) + '\n'; },
          table: (data) => {
            if (Array.isArray(data)) {
              output += data.map((item, i) => `${i}: ${JSON.stringify(item)}`).join('\n') + '\n';
            } else {
              output += JSON.stringify(data, null, 2) + '\n';
            }
          },
          count: (label = 'default') => {
            consoleCounts[label] = (consoleCounts[label] || 0) + 1;
            output += `${label}: ${consoleCounts[label]}\n`;
          },
          countReset: (label = 'default') => { delete consoleCounts[label]; },
          time: (label = 'default') => { consoleTimers[label] = Date.now(); },
          timeEnd: (label = 'default') => {
            const start = consoleTimers[label];
            if (start !== undefined) {
              output += `${label}: ${Date.now() - start}ms\n`;
              delete consoleTimers[label];
            }
          },
          timeLog: (label = 'default') => {
            const start = consoleTimers[label];
            if (start !== undefined) output += `${label}: ${Date.now() - start}ms\n`;
          },
          group: () => {},
          groupEnd: () => {},
          clear: () => { output = ''; },
        }
      };
      vm.runInNewContext(code, sandbox, { timeout: 5000 });
      return { statusCode: 200, body: JSON.stringify({ output: output || '(no output)' }) };
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ output: 'Error: ' + e.message, error: true }) };
    }
  }

  // SQL execution (if database module available)
  if (lang === 'sqlite' && database) {
    return { statusCode: 200, body: JSON.stringify(database.executeSQLite(code)) };
  }
  if (lang === 'pg' && database) {
    const result = await database.executePG(code);
    return { statusCode: 200, body: JSON.stringify(result) };
  }
  if (lang === 'mysql' && database) {
    const result = await database.executeMySQL(code);
    return { statusCode: 200, body: JSON.stringify(result) };
  }

  const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const prog = `_prog_${token}`;

  const javaHome = (() => {
    try {
      const p = require('child_process').execSync('readlink -f $(which javac)', { timeout: 5000 }).toString().trim();
      const jdkDir = require('path').dirname(require('path').dirname(p));
      const javaBin = require('path').join(jdkDir, 'bin', 'java');
      if (require('fs').existsSync(javaBin)) return javaBin;
    } catch {}
    return 'java';
  })();

  const runners = {
    py:  { cmd: 'python3 -u "%f"', ext: '.py' },
    go:  { cmd: 'go run "%f"', ext: '.go' },
    ts:  { cmd: 'tsx "%f"', ext: '.ts' },
    rs:  { cmd: `rustc -o ${prog} "%f" && ./${prog}`, ext: '.rs' },
    c:   { cmd: `gcc -Wall -o ${prog} "%f" && ./${prog}`, ext: '.c' },
    cpp: { cmd: `g++ -std=c++20 -Wall -o ${prog} "%f" && ./${prog}`, ext: '.cpp' },
    cs:  { cmd: 'dotnet script "%f"', ext: '.csx' },
    kt:  { cmd: `kotlinc -include-runtime -d ${prog}.jar "%f" && java -jar ${prog}.jar`, ext: '.kt' },
    java: { cmd: `javac "%f" && ${javaHome} -cp "%f" Main`, ext: '.java', src: 'Main' },
    swift: { cmd: 'swift "%f"', ext: '.swift' },
    wasm: { cmd: 'wasmtime "%f"', ext: '.wat' },
    asm: { cmd: `nasm -f elf64 "%f" -o ${prog}.o && ld -o ${prog} ${prog}.o && ./${prog}`, ext: '.asm' },
    zig: { cmd: 'zig run "%f"', ext: '.zig' },
  };

  const runner = runners[lang];
  if (!runner) {
    return { statusCode: 200, body: JSON.stringify({ output: `// ${(lang || '').toUpperCase()} execution not available in serverless mode` }) };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nflx-'));
  const srcName = runner.src || 'code';
  const tmpFile = path.join(tmpDir, srcName + runner.ext);
  fs.writeFileSync(tmpFile, code);

  let cmd = runner.cmd.replace('%f', tmpFile);
  if (lang === 'java') {
    const javacmd = javaHome !== 'java' ? javaHome : 'java';
    cmd = `javac "${tmpFile}" && ${javacmd} -cp "${tmpDir}" Main`;
  }
  const env = { ...process.env, PATH: `${process.env.PATH}:${path.join(os.homedir(), '.local/bin')}:${path.join(os.homedir(), '.cargo/bin')}` };

  try {
    const stdout = execSync(cmd, { timeout: 30000, cwd: tmpDir, env, maxBuffer: 1024 * 512, shell: true });
    const out = stdout.toString().trim() || '(no output)';
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return { statusCode: 200, body: JSON.stringify({ output: out }) };
  } catch (e) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    const stderr = e.stderr ? e.stderr.toString() : '';
    const output = stderr.trim() || 'Process failed: ' + (e.message || '').slice(0, 200);
    return { statusCode: 200, body: JSON.stringify({ output, error: true }) };
  }
}

// ── Analyze ──
function handleAnalyze(body) {
  const { code, lang } = body;
  if (!code) return { statusCode: 200, body: JSON.stringify({ hints: [] }) };
  const hints = [];
  if (lang === 'js') {
    if (code.includes('==')) hints.push('You used `==` (loose equality). Prefer `===` (strict equality).');
    if (code.includes('var ')) hints.push('Using `var` is outdated. Use `let` or `const`.');
    if ((code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length) {
      hints.push('Unbalanced parentheses!');
    }
    if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) {
      hints.push('Unbalanced curly braces!');
    }
  }
  return { statusCode: 200, body: JSON.stringify({ hints }) };
}

// ── Chat (simplified, keyword-based with LLM fallback if available) ──
const aiResponses = [
  { keywords: ['variable', 'declare', 'let', 'const', 'var'], response: "Variables store data in memory. In JS: `let name = value;` (mutable), `const name = value;` (immutable). In Python: `name = value`. In Go: `var name type = value` or `name := value`." },
  { keywords: ['function', 'method', 'def', 'func', '=>'], response: "Functions are reusable blocks of code. JS: `function name(params) { ... }`. Python: `def name(params):`. Go: `func name(params) returnType { ... }`. Rust: `fn name(params) -> returnType { ... }`." },
  { keywords: ['class', 'object', 'oop', 'inherit', 'extends'], response: "Object-Oriented Programming organizes code around objects with properties and methods. Key concepts: encapsulation, inheritance, polymorphism. Favor composition over inheritance." },
  { keywords: ['array', 'list', 'collection', 'vector', 'slice'], response: "Collections store groups of values. Arrays/lists are ordered sequences. Maps store key-value pairs. Sets store unique values. All are 0-indexed." },
  { keywords: ['loop', 'for', 'while', 'iterate', 'foreach'], response: "Loops repeat code. `for` loops when you know the count. `while` loops on a condition. Common bugs: infinite loops (missing increment) and off-by-one errors." },
  { keywords: ['error', 'exception', 'try', 'catch', 'panic'], response: "Error handling: JS/Python/C# use try/catch. Go returns errors as values. Rust uses Result/Option types. Always clean up resources in finally/defer." },
  { keywords: ['async', 'await', 'promise', 'future', 'goroutine'], response: "Async code runs without blocking. JS: async/await + Promises. Python: async/await + asyncio. Go: goroutines + channels. Common mistake: forgetting `await`." },
  { keywords: ['git', 'commit', 'push', 'pull', 'branch', 'merge'], response: "Git workflow: `git add .` -> `git commit -m \"msg\"` -> `git push`. Use branches for features. Pull before pushing." },
  { keywords: ['sql', 'select', 'join', 'table', 'database', 'query'], response: "SQL is declarative. CRUD: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove). JOINs combine tables. Always use parameterized queries." },
  { keywords: ['debug', 'bug', 'fix', 'issue', 'wrong', 'not working'], response: "Debugging: 1) Read the error, 2) Reproduce consistently, 3) Isolate by commenting code, 4) Inspect with logs, 5) Fix minimally, 6) Verify." },
  { keywords: ['help', 'how', 'what is', 'explain', 'understand', 'confused', 'learn', 'start'], response: "Learning method: 1) Read the topic, 2) Type the code yourself, 3) Modify and experiment, 4) Build something small." },
  { keywords: ['hello', 'hi', 'hey', 'greeting'], response: "Welcome to Doge's Lab! I'm your AI tutor. Pick a language, click a topic, read the explanation, try the code, and ask me anything!" },
  { keywords: ['string', 'concatenat', 'interpolat', 'template'], response: "Strings are immutable character sequences. Interpolation: JS uses `` `Hello ${name}` ``, Python uses `f\"Hello {name}\"`, Go uses `fmt.Sprintf`." },
  { keywords: ['pointer', 'reference', 'memory', 'malloc', 'free', 'heap', 'stack'], response: "Stack: fast, automatic (local variables). Heap: flexible, manual (dynamic allocation). C uses malloc/free. Rust has ownership for compile-time safety." },
  { keywords: ['syntax', 'semicolon', 'bracket', 'parenthesis', 'brace'], response: "Syntax errors are normal! Check: 1) All brackets closed? 2) Strings quoted correctly? 3) Statements terminated?" },
  { keywords: ['scope', 'closure', 'hoist'], response: "Scope determines where variables are accessible. Closures remember outer variables. `var` is function-scoped, `let`/`const` are block-scoped." },
  { keywords: ['test', 'testing', 'assert', 'jest', 'pytest'], response: "Testing verifies code works. AAA pattern: Arrange, Act, Assert. Levels: unit, integration, e2e." },
  { keywords: ['recursion', 'recursive', 'base case'], response: "Recursion = function calling itself. Every recursive function needs: 1) Base case, 2) Recursive case. Watch for stack overflow." },
];

async function handleChat(body) {
  const { message, lang, topic, code, output, hasError, history } = body;
  if (!message) return { statusCode: 200, body: JSON.stringify({ reply: "Ask me something about programming!" }) };
  const q = message.toLowerCase().trim();

  if (learner && body.learnerId) {
    try { await learner.trackAIInteraction(body.learnerId); } catch {}
  }

  // LLM path if available
  if (askLLM && ACTIVE_AI_PROVIDER !== 'keyword') {
    try {
      const llmMessages = [{ role: 'user', content: `Context: The user is studying ${lang || 'programming'}${topic ? `, topic: ${topic}` : ''}.\n\nUser question: ${message}` }];
      const reply = await askLLM(llmMessages);
      if (reply) return { statusCode: 200, body: JSON.stringify({ reply }) };
    } catch {}
  }

  // Error-aware help
  if (hasError || /error|bug|fix|wrong|not working|issue/.test(q)) {
    let reply = '';
    if (code) reply = "Let's debug your code! Check the error message for line numbers, simplify by commenting parts out, compare with the curriculum example.\n\n";
    if (output) reply += `**Your output:** ${output.slice(0, 300)}\n\n`;
    reply += "**Tip:** The most common bugs are typos, missing brackets, and off-by-one errors.";
    return { statusCode: 200, body: JSON.stringify({ reply }) };
  }

  // Keyword matching
  for (const entry of aiResponses) {
    if (entry.keywords.some(k => q.includes(k))) {
      return { statusCode: 200, body: JSON.stringify({ reply: entry.response }) };
    }
  }

  // Topic-aware
  if (topic && /what|how|explain|\?/.test(q)) {
    for (const entry of aiResponses) {
      if (entry.keywords.some(k => topic.toLowerCase().includes(k))) {
        let reply = entry.response;
        reply += `\n\n**You're currently studying:** ${topic}`;
        reply += `\nTry the code example in the editor and click Run!`;
        return { statusCode: 200, body: JSON.stringify({ reply }) };
      }
    }
  }

  if (q.includes('thank')) {
    return { statusCode: 200, body: JSON.stringify({ reply: "You're welcome! Keep experimenting and asking questions. What would you like to learn next?" }) };
  }

  const fallbacks = [
    "Tell me what language and topic you're working on and I'll explain it clearly!",
    "I'd love to help! What are you studying right now?",
    "Ask me about a specific topic, share your code for debugging, or check the curriculum examples!",
  ];
  return { statusCode: 200, body: JSON.stringify({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] }) };
}

// ── Explain ──
async function handleExplain(body) {
  const { code, lang, topic } = body;
  if (!code) return { statusCode: 200, body: JSON.stringify({ explanation: "No code provided." }) };

  if (askLLM && ACTIVE_AI_PROVIDER !== 'keyword') {
    const context = topic ? `The user is studying ${topic} in ${lang || 'programming'}.` : `The user is programming in ${lang || 'a language'}.`;
    const messages = [{ role: 'user', content: `${context}\n\nExplain this code step by step:\n\n\`\`\`\n${code}\n\`\`\`` }];
    const llmReply = await askLLM(messages);
    if (llmReply) return { statusCode: 200, body: JSON.stringify({ explanation: llmReply, source: 'llm' }) };
  }

  const lines = code.split('\n');
  let explanation = `**Code Overview:** ${lines.length} lines of ${(lang || 'code').toUpperCase()}\n`;
  if (code.includes('function') || code.includes('=>')) explanation += "- Defines one or more **functions**\n";
  if (code.includes('if(') || code.includes('if (')) explanation += "- Contains **conditional logic** (if statements)\n";
  if (code.includes('class ')) explanation += "- Defines a **class**\n";
  if (code.includes('return ')) explanation += "- Uses **return statements**\n";
  if (code.includes('const ') || code.includes('let ') || code.includes('var ')) explanation += "- Declares **variables**\n";
  return { statusCode: 200, body: JSON.stringify({ explanation, source: 'static' }) };
}

// ── Review ──
async function handleReview(body) {
  const { code, lang } = body;
  if (!code) return { statusCode: 200, body: JSON.stringify({ review: 'No code provided.', issues: [], score: 0 }) };

  if (codeReview) {
    try {
      const result = await codeReview(code, lang);
      return { statusCode: 200, body: JSON.stringify(result) };
    } catch {}
  }

  const issues = [];
  const openB = (code.match(/\{/g) || []).length;
  const closeB = (code.match(/\}/g) || []).length;
  if (openB !== closeB) issues.push({ message: `Unbalanced braces: ${openB} opening vs ${closeB} closing.`, severity: 'error' });
  const openP = (code.match(/\(/g) || []).length;
  const closeP = (code.match(/\)/g) || []).length;
  if (openP !== closeP) issues.push({ message: `Unbalanced parentheses: ${openP} opening vs ${closeP} closing.`, severity: 'error' });

  return { statusCode: 200, body: JSON.stringify({ review: `Static review found ${issues.length} issue(s).`, issues, score: issues.length > 0 ? 5 : 10, source: 'static' }) };
}

// ── Exercise ──
async function handleExercise(body, event) {
  const { topic, lang, level } = body;
  if (!topic) return { statusCode: 400, body: JSON.stringify({ error: 'No topic provided' }) };

  if (generateExercise) {
    try {
      const exercise = await generateExercise(topic, lang || 'js', level || 'beginner');
      return { statusCode: 200, body: JSON.stringify(exercise) };
    } catch {}
  }

  const langs = lang || 'js';
  const exercises = {
    js: {
      beginner: {
        'variable': { instruction: "Declare a variable called `name` and assign your name to it. Then print it using console.log().", starter: "// Declare name variable here\n// Print it here", solution: "const name = 'Your Name';\nconsole.log(name);" },
        'function': { instruction: "Write a function called `add` that takes two numbers and returns their sum.", starter: "function add(a, b) {\n  // your code here\n}", solution: "function add(a, b) {\n  return a + b;\n}" },
      },
      intermediate: {
        'function': { instruction: "Write a function `isEven` that returns true if a number is even, false otherwise.", starter: "function isEven(n) {\n  // your code here\n}", solution: "function isEven(n) {\n  return n % 2 === 0;\n}" },
      },
    },
    py: {
      beginner: {
        'variable': { instruction: "Create a variable called `name` and assign your name. Then print it.", starter: "# Create name variable here\n# Print it here", solution: "name = 'Your Name'\nprint(name)" },
      },
    },
  };
  const exercise = exercises[langs]?.[level || 'beginner']?.[topic];
  if (exercise) return { statusCode: 200, body: JSON.stringify(exercise) };
  return { statusCode: 200, body: JSON.stringify({ instruction: `Practice ${topic} in ${langs} at ${level || 'beginner'} level.`, starter: '// Write your code here', solution: '' }) };
}

// ── Proxy ──
const FORBIDDEN_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]', '169.254.169.254', 'metadata.google.internal', '100.100.100.200'];
const FORBIDDEN_PATTERNS = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^127\./, /^0\./];

function isPrivateIP(ip) {
  if (FORBIDDEN_HOSTS.includes(ip)) return true;
  if (FORBIDDEN_PATTERNS.some(p => p.test(ip))) return true;
  return false;
}

async function isValidProxyUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    if (FORBIDDEN_HOSTS.some(fh => host === fh || host.endsWith('.' + fh))) return false;
    const dns = require('dns');
    const addresses = await dns.promises.resolve4(host).catch(() => []);
    for (const addr of addresses) {
      if (isPrivateIP(addr)) return false;
    }
    return true;
  } catch { return false; }
}

async function handleProxy(body) {
  const { method = 'GET', url, headers: reqHeaders = {}, body: reqBody } = body;
  if (!url) return { statusCode: 400, body: JSON.stringify({ error: 'No URL provided' }) };
  if (!(await isValidProxyUrl(url))) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or forbidden URL' }) };

  try {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method.toUpperCase(),
      headers: { ...reqHeaders },
      timeout: 15000,
    };
    const result = await new Promise((resolve, reject) => {
      const proxyReq = lib.request(options, (proxyRes) => {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          const responseHeaders = {};
          for (const [k, v] of Object.entries(proxyRes.headers)) responseHeaders[k] = Array.isArray(v) ? v.join(', ') : v;
          resolve({ status: proxyRes.statusCode, headers: responseHeaders, body: raw });
        });
      });
      proxyReq.on('error', e => reject(new Error(e.message)));
      proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Timed out')); });
      if (reqBody && method.toUpperCase() !== 'GET') proxyReq.write(reqBody);
      proxyReq.end();
    });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ error: e.message, status: 0, body: '' }) };
  }
}

// ── Benchmark ──
function handleBenchmark(event) {
  const count = parseInt(event.queryStringParameters?.n) || 10000;
  const start = Date.now();
  let sum = 0;
  for (let i = 0; i < count; i++) sum += i * i;
  const ms = Date.now() - start;
  return {
    statusCode: 200,
    body: JSON.stringify({ backend: 'Node.js (Netlify)', version: process.version, iterations: count, result: sum, timeMs: ms, opsPerSec: Math.round(count / (ms / 1000)) }),
  };
}

// ── Courses ──
function handleCourses() {
  try {
    if (!fs.existsSync(CONTENT_DIR)) return { statusCode: 200, body: JSON.stringify([]) };
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
    const courses = files.map(f => f.replace('.json', ''));
    return { statusCode: 200, body: JSON.stringify(courses) };
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ error: e.message }) };
  }
}

// ── Learner Routes ──
async function handleLearnerTrack(event, body) {
  if (!learner) return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  const learnerId = body.learnerId || event.queryStringParameters?.learnerId || event.headers['client-ip'] || 'default';
  const { event: evt, lang, topic, phase, data } = body;
  try {
    switch (evt) {
      case 'complete-topic': await learner.trackTopicCompletion(learnerId, lang, topic, phase); break;
      case 'error': await learner.trackError(learnerId, lang, topic); break;
      case 'attempt': await learner.trackAttempt(learnerId, lang, topic); break;
      case 'quiz': await learner.trackQuiz(learnerId, data?.correct, data?.total); break;
      case 'challenge': await learner.trackChallenge(learnerId, data?.solved); break;
      case 'ai-interaction': await learner.trackAIInteraction(learnerId); break;
      default: return { statusCode: 400, body: JSON.stringify({ error: 'Unknown event' }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

async function handleLearnerState(event) {
  if (!learner) return { statusCode: 200, body: JSON.stringify({ learner: {}, mastery: null }) };
  const learnerId = event.queryStringParameters?.learnerId || event.headers['client-ip'] || 'default';
  const lang = event.queryStringParameters?.lang;
  try {
    const learnerState = await learner.getLearner(learnerId);
    const mastery = lang ? await learner.getConceptMastery(learnerId, lang) : null;
    return { statusCode: 200, body: JSON.stringify({ learner: learnerState, mastery }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

async function handleLearnerReviews(event) {
  if (!learner) return { statusCode: 200, body: JSON.stringify({ due: [] }) };
  const learnerId = event.queryStringParameters?.learnerId || event.headers['client-ip'] || 'default';
  try {
    const due = await learner.getDueReviews(learnerId);
    return { statusCode: 200, body: JSON.stringify({ due }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}

async function handleLearnerRecommend(event) {
  if (!learner) return { statusCode: 200, body: JSON.stringify({ recommendation: null }) };
  const learnerId = event.queryStringParameters?.learnerId || event.headers['client-ip'] || 'default';
  const lang = event.queryStringParameters?.lang;
  try {
    const availablePhases = event.queryStringParameters?.topics ? JSON.parse(event.queryStringParameters.topics) : {};
    const recommendation = await learner.getNextRecommendedTopic(learnerId, lang, availablePhases);
    return { statusCode: 200, body: JSON.stringify({ recommendation }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ recommendation: null }) };
  }
}
