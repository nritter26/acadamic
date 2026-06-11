/**
 * Debugging Curriculum Data
 * Full explanations and code examples for debugging topics across JS, TS, Python, and Go
 */

export const DEBUGGING_CONTENT = {
  "JavaScript Console & DevTools": {
    "JavaScript Console API Methods": {
      exp: "The Console API provides a suite of methods for debugging directly in the browser's developer console. These tools let you log structured data, measure performance, trace execution, and group related output.",
      code: `// Console API Methods
console.log("Basic log with multiple args");
console.table([{name:"Alice",age:30},{name:"Bob",age:25}]);
console.group("Group Label");
console.log("Inside group");
console.groupEnd();
console.time("timer");
console.timeEnd("timer");
console.assert(1===2,"Assertion failed");
console.trace("Stack trace here");
console.dir(document.body);`
    },
    "Browser DevTools Panels": {
      exp: "Modern browser DevTools consist of specialized panels: Elements (DOM/CSS), Console (JS execution), Sources (debugger), Network (HTTP requests), Memory (heap snapshots), Performance (profiling), Application (storage, service workers), and Security.",
      code: `// DevTools Panels Usage
// Elements: Right-click > Inspect to view DOM/CSS
// Console: Execute JS, view logs, errors
// Sources: Debugger with breakpoints, scope
// Network: Monitor all HTTP requests
// Memory: Heap snapshots, allocation timelines
// Performance: Record and analyze flame charts
// Application: LocalStorage, cookies, IndexedDB
console.log("Open DevTools with F12 or Ctrl+Shift+I");`
    },
    "Standard Line Breakpoints": {
      exp: "Line breakpoints pause script execution at a specific line, allowing variable inspection and call stack analysis. Click the line number gutter in the Sources panel to set one.",
      code: `// Standard Line Breakpoints
function processOrder(order) {
  // Click line number in Sources gutter to SET BREAKPOINT HERE
  let total = 0;
  for (const item of order.items) {
    // SET BREAKPOINT HERE to inspect each iteration
    total += item.price * item.quantity;
  }
  // SET BREAKPOINT HERE to see final total
  const discount = order.discountCode ? total * 0.1 : 0;
  return total - discount;
}
const result = processOrder({
  id: "ORD-001",
  items: [
    { name: "Widget", price: 19.99, quantity: 2 },
    { name: "Gadget", price: 49.99, quantity: 1 },
  ],
  discountCode: "SAVE10",
});
console.log("Order total:", result);`
    },
    "Conditional Breakpoints": {
      exp: "Conditional breakpoints pause only when a condition evaluates to true. Right-click the gutter and select Add conditional breakpoint. Shown with an orange arrow.",
      code: `// Conditional Breakpoints
const transactions = Array.from({length:100}, (_, i) => ({
  id: "TXN-" + i.toString().padStart(4,"0"),
  amount: Math.round(Math.random()*10000)/100,
  currency: ["USD","EUR","GBP","JPY"][Math.floor(Math.random()*4)],
  status: ["pending","completed","failed"][Math.floor(Math.random()*3)],
}));
function processTransactions(txns) {
  // CONDITIONAL BREAKPOINT: txn.amount > 5000 && txn.currency === "EUR"
  // Right-click line number > Add conditional breakpoint
  for (const txn of txns) {
    console.log("Processing:", txn.id, txn.amount);
  }
}
processTransactions(transactions);
console.log("Set conditional breakpoints in Sources panel");`
    },
    "Logpoints / Tracepoints": {
      exp: "Logpoints log messages to the console without pausing execution. Right-click a line number and select Add logpoint. Perfect for adding temporary logging without editing source code.",
      code: `// Logpoints / Tracepoints
// Right-click line > Add logpoint
// Expression: "addToCart: " + product.name + ", qty: " + quantity
function addToCart(product, quantity) {
  const cart = JSON.parse(localStorage.getItem("cart") || '{"items":[]}');
  cart.items.push({...product, quantity});
  localStorage.setItem("cart", JSON.stringify(cart));
}
document.querySelectorAll(".buy-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    // Add LOGPOINT: "Button clicked: " + e.target.textContent
    addToCart({name: e.target.dataset.name, price: 29.99}, 1);
  });
});
console.log("Logpoints active - check Console panel");
console.log("They survive page refreshes until DevTools closes");`
    },
    "DOM Change Breakpoints": {
      exp: "DOM Change breakpoints pause on DOM modifications. Three types: Subtree modifications (children added/removed), Attribute modifications (class/style), Node removal. Set in the Elements panel.",
      code: `// DOM Change Breakpoints
// Right-click element in Elements panel > Break on
// Subtree modifications / Attribute modifications / Node removal
const app = document.createElement("div");
app.id = "app";
document.body.appendChild(app);
const btn = document.createElement("button");
btn.textContent = "Toggle";
app.appendChild(btn);
const status = document.createElement("div");
status.textContent = "Active: false";
app.appendChild(status);
btn.addEventListener("click", () => {
  // Attribute Modification Breakpoint on #status will pause here
  status.classList.toggle("active");
  status.textContent = "Active: " + status.classList.contains("active");
});
console.log("Set DOM breakpoints in Elements panel");
console.log("Click the button to trigger attribute changes");`
    },
    "XHR / Fetch Breakpoints": {
      exp: "XHR/Fetch breakpoints pause when a network request matches a URL pattern. In Sources panel, expand XHR/Fetch Breakpoints, click +, and enter a URL substring.",
      code: `// XHR / Fetch Breakpoints
// Sources > XHR/Fetch Breakpoints > + > Enter: /api/
// Or leave empty to pause on ALL fetch/XHR requests
const API = "https://jsonplaceholder.typicode.com";
async function fetchUsers() {
  // Debugger pauses HERE when breakpoint is triggered
  const response = await fetch(API + "/users", {
    method: "GET",
    headers: {"Content-Type": "application/json"},
  });
  const data = await response.json();
  console.log("Fetched", data.length, "users");
  return data;
}
fetchUsers().catch(console.error);
console.log("Set XHR breakpoint in Sources > XHR/Fetch Breakpoints");`
    },
    "Event Listener Breakpoints": {
      exp: "Event Listener Breakpoints pause when a specific event fires. Check event types in Sources > Event Listener Breakpoints. Useful for debugging event handler chains and third-party scripts.",
      code: `// Event Listener Breakpoints
// Sources > Event Listener Breakpoints
// Check: Mouse > click, Keyboard > keydown, Window > resize
const btn = document.createElement("button");
btn.textContent = "Click Me";
btn.addEventListener("click", (e) => {
  // Debugger pauses here when click breakpoint is enabled
  console.log("Clicked at", e.clientX, e.clientY);
});
document.body.appendChild(btn);
document.addEventListener("keydown", (e) => {
  // Debugger pauses here when keydown breakpoint is enabled
  console.log("Key pressed:", e.key);
});
console.log("Enable event breakpoints in Sources panel");
console.log("Debugger pauses on every matching event");`
    },
    "Exception Breakpoints": {
      exp: "Exception breakpoints pause on errors. Click the stop sign icon in Sources: once for uncaught, again (blue) for all exceptions including caught ones.",
      code: `// Exception Breakpoints
// Click stop sign icon (Sources panel toolbar)
// Click once: pauses on uncaught exceptions only
// Click again (blue): pauses on ALL exceptions
function divide(a, b) {
  // With pause on exceptions ON, debugger pauses here
  return a / b;
}
try {
  divide(10, 0);
} catch (e) {
  console.error("Caught:", e.message);
}
// Uncaught: always triggers with pause on uncaught
console.log("Exception breakpoints active");`
    },
    "The debugger; Statement": {
      exp: "The debugger; statement acts as a programmatic breakpoint. When DevTools is open, execution pauses at that line. Wrap in conditionals for targeted debugging.",
      code: `// The debugger; Statement
function calculate(a, b, c) {
  const intermediate = a * b;
  debugger; // Execution PAUSES here with DevTools open
  const result = intermediate + c;
  return result;
}
console.log("Result:", calculate(5, 3, 7));
// Conditional debugger equivalent
function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].value > 1000) {
      debugger; // Only pauses for high-value items
    }
    console.log(items[i].id);
  }
}
processItems([
  {id:"A", value:500},
  {id:"B", value:1500},
]);
console.log("ESLint rule: no-debugger prevents production use");`
    },
    "Call Stack Navigation": {
      exp: "Call stack navigation controls: Step Over (F10), Step Into (F11), Step Out (Shift+F11), Resume (F8). Drop Frame rewinds to function start.",
      code: `// Call Stack Navigation
function inner(num) {
  // SET BREAKPOINT HERE
  // F10: Step over (execute line, stay in current function)
  // F11: Step into (go into called functions)
  // Shift+F11: Step out (exit current function)
  // F8: Resume (continue to next breakpoint)
  const squared = num * num;
  return squared;
}
function middle() {
  const val = inner(42);
  return val * 2;
}
function outer() {
  const result = middle();
  console.log("Result:", result);
  return result;
}
outer();
console.log("Use F10/F11/Shift+F11 to step through");
console.log("Call stack: inner -> middle -> outer -> (anonymous)");`
    },
    "Scope Pane Analysis": {
      exp: "The Scope pane displays variables at each level: Local, Closure, Script, Module, Global, and Block scopes. Inspect values and detect variable shadowing.",
      code: `// Scope Pane Analysis
const globalVar = "I am global";
function outer(param) {
  let outerVar = "outer scope";
  function inner() {
    // SET BREAKPOINT HERE
    // Scope: Local (innerVar), Closure (outerVar, param), Script (globalVar), Global
    const innerVar = "inner scope";
    console.log(innerVar, outerVar, param, globalVar);
  }
  return inner;
}
outer("hello")();
// Block scope demo
function scopeTest() {
  var functionScoped = "var leaks to function";
  let blockScoped = "let is block scoped";
  if (true) {
    var functionScoped = "overwritten";
    let blockScoped = "separate block variable";
    console.log("Inside block:", functionScoped, blockScoped);
  }
  console.log("After block:", functionScoped, blockScoped);
}
scopeTest();
console.log("Check Scope pane when paused at breakpoints");`
    },
    "Watch Expressions": {
      exp: "Watch Expressions evaluate JS expressions each time execution pauses. Add them in the Watch pane (Sources panel, right side below Scope) by clicking +.",
      code: `// Watch Expressions
// Sources > Watch pane > Click + to add:
// "currentItem", "total", "total.toFixed(2)", "currentItem.price > 50"
function processCart(cart) {
  let total = 0;
  let count = 0;
  for (const item of cart.items) {
    // SET BREAKPOINT HERE
    // Watch: item, total, item.price > 50 ? "Expensive" : "Cheap"
    count++;
    total += item.price * item.quantity;
    console.log("Item:", item.name, "Running total:", total);
  }
  return {total, count};
}
processCart({
  items: [
    {name:"Notebook", price:12.99, quantity:3},
    {name:"Monitor", price:199.99, quantity:1},
    {name:"Mouse", price:29.99, quantity:2},
  ],
});
console.log("Add watch expressions in Sources > Watch pane");`
    },
    "Live Expression Monitoring": {
      exp: "Live Expressions continuously evaluate expressions and display results in real-time. Click the eye icon in the Console panel. Values update automatically as page state changes.",
      code: `// Live Expression Monitoring
// Console panel > Click eye icon to add Live Expressions
// Try: document.title
// Try: window.innerWidth + "x" + window.innerHeight
// Try: new Date().toLocaleTimeString()
const stateManager = {
  state: {counter: 0, lastAction: ""},
  update(partial) {
    Object.assign(this.state, partial);
    this.state.lastAction = new Date().toLocaleTimeString();
    this.render();
  },
  render() {
    const el = document.getElementById("state-display") || (() => {
      const d = document.createElement("pre");
      d.id = "state-display";
      d.style.cssText = "background:#1e293b;padding:8px;color:#e2e8f0";
      document.body.appendChild(d);
      return d;
    })();
    el.textContent = JSON.stringify(this.state, null, 2);
  }
};
function setupUI() {
  const btn = document.createElement("button");
  btn.textContent = "Increment";
  btn.onclick = () => stateManager.update({counter: stateManager.state.counter + 1});
  document.body.appendChild(btn);
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset";
  resetBtn.onclick = () => stateManager.update({counter: 0});
  document.body.appendChild(resetBtn);
  stateManager.render();
}
setupUI();
console.log("Add Live Expressions in Console panel (eye icon)");
console.log("Watch stateManager.state update in real-time");`
    },

    "REPL-driven Debugging (Node.js)": {
      exp: "Node.js REPL provides an interactive debugging environment. Use <code>.break</code> to exit multi-line mode, <code>.save</code> to save session to file, and <code>.editor</code> for multi-line editing. The <code>repl</code> module lets you create custom REPLs.",
      code: `// REPL-driven Debugging (Node.js)
// Start: node
// Then:
// > .help        - List all REPL commands
// > .break       - Exit multi-line expression
// > .save file   - Save REPL session to file
// > .load file   - Load file into REPL
// > .editor      - Enter editor mode (Ctrl+D to run)

// Custom REPL server
const repl = require("repl");
const server = repl.start({ prompt: "debug> " });
server.defineCommand("inspect", {
  help: "Inspect a variable",
  action(variable) {
    this.clearBufferedCommand();
    console.log(typeof eval(variable), eval(variable));
    this.displayPrompt();
  },
});

// Debug with global exposure
global.cart = { items: [], total: 0 };
// Now in REPL: > cart.items.push({name:"test"}); cart.total
console.log("Start REPL with: node");
console.log("Access variables exposed on global");
console.log("REPL commands: .help .break .save .load .editor");`
    }
  },

  "Advanced JS Debugging": {
    "Asynchronous Stack Traces": {
      exp: "Async stack traces preserve the calling chain across async operations. Chrome DevTools traces promise chains, async/await calls, and setTimeout/setInterval callbacks.",
      code: `// Asynchronous Stack Traces
// Async stack traces show the full calling chain
const API = "https://jsonplaceholder.typicode.com";
function getUser(id) {
  return fetch(API + "/users/" + id).then(r => r.json());
}
function getUserPosts(user) {
  return fetch(API + "/posts?userId=" + user.id).then(r => r.json());
}
async function main() {
  // SET BREAKPOINT HERE
  // Async stack trace shows: main -> getUserPosts -> getUser
  const user = await getUser(1);
  const posts = await getUserPosts(user);
  console.log(user.name, "has", posts.length, "posts");
}
main().catch(console.error);
console.log("Check async stack traces in Sources panel");`
    },
    "Event Loop & Task Queues": {
      exp: "The event loop processes code in order: synchronous, then microtasks (Promise.then, queueMicrotask), then macrotasks (setTimeout, setInterval). Understanding this order is crucial for async debugging.",
      code: `// Event Loop & Task Queues
console.log("1. Synchronous code");
Promise.resolve().then(() => {
  console.log("2. Promise.then (microtask)");
});
setTimeout(() => {
  console.log("4. setTimeout (macrotask)");
}, 0);
queueMicrotask(() => {
  console.log("3. queueMicrotask (microtask)");
});
console.log("5. More synchronous code");
// Output: 1, 5, 2, 3, 4
// Microtasks run before the next macrotask
console.log("Microtasks > Macrotasks in event loop");
console.log("Set breakpoints to observe execution order");`
    },
    "Network Panel Inspection": {
      exp: "The Network panel shows headers, payload, cookies, timing, and initiator for every request. The Initiator tab links to the source code that triggered the request.",
      code: `// Network Panel Inspection
// Open DevTools > Network panel before running
// Filter by "jsonplaceholder" to isolate requests
const API = "https://jsonplaceholder.typicode.com";
async function inspectRequests() {
  // GET: Check Headers, Timing, Initiator tabs
  const getRes = await fetch(API + "/posts/1");
  console.log("GET:", await getRes.json());
  // POST: Check Payload tab
  const postRes = await fetch(API + "/posts", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({title: "Test", body: "Content", userId: 1}),
  });
  console.log("POST:", await postRes.json());
}
inspectRequests().catch(console.error);
console.log("Check Headers, Payload, Cookies, Timing tabs");
console.log("Initiator tab links to this source code");`
    },
    "Storage Inspection": {
      exp: "The Application panel shows all browser storage: LocalStorage, SessionStorage, Cookies, IndexedDB, Cache Storage. View, edit, and delete entries for debugging.",
      code: `// Storage Inspection
// Open DevTools > Application panel to view
// Local Storage (persists across browser sessions)
localStorage.setItem("auth_token", "demo-token-123");
localStorage.setItem("preferences", JSON.stringify({
  theme: "dark", fontSize: 14, language: "en"
}));
localStorage.setItem("last_visit", new Date().toISOString());
// Session Storage (cleared when tab closes)
sessionStorage.setItem("current_page", "/dashboard");
sessionStorage.setItem("form_draft", JSON.stringify({
  name: "John", email: "john@example.com"
}));
// Cookies (visible in Application > Cookies)
document.cookie = "session_id=abc123; path=/; max-age=3600";
document.cookie = "theme=dark; path=/; max-age=86400";
// Debug helper
console.log("Inspect all storage in Application panel");
console.log("Use Clear Site Data button to reset");
console.log("LocalStorage keys:", Object.keys(localStorage));`
    },
    "Memory Heap Snapshots": {
      exp: "Heap snapshots capture memory state. Compare snapshots to find leaks. Key metrics: Shallow size (object itself) vs Retained size (object + referenced objects).",
      code: `// Memory Heap Snapshots
// 1. Memory panel > Heap snapshot > Take snapshot #1
// 2. Run this code
// 3. Take snapshot #2 > Select "Comparison"
class LeakyComponent {
  constructor() {
    this.cache = [];
  }
  createDetached() {
    const el = document.createElement("div");
    el.textContent = "Leaked element";
    document.body.appendChild(el);
    this.cache.push(el);
    document.body.removeChild(el);
    // el is still referenced - NOT garbage collected!
  }
}
const leaky = new LeakyComponent();
for (let i = 0; i < 5; i++) leaky.createDetached();
// Accidental global variable
function createGlobalLeak() {
  globalVar = {data: "This will never be GCd"};
}
createGlobalLeak();
console.log("Take heap snapshot #2 now");
console.log("Filter by: Detached, (string), (object)");
console.log("Look for objects that should have been freed");`
    },
    "CPU Profiling & Flame Charts": {
      exp: "CPU profiling shows where execution time is spent. Record in the Performance panel. Flame charts visualize nested function calls - wider blocks mean more time spent.",
      code: `// CPU Profiling & Flame Charts
// Record in Performance panel (Ctrl+E)
// Then run this code to generate activity
function heavyComputation(n) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
    result += Math.log(i + 1) * Math.exp(i % 50);
  }
  return result;
}
function domOperations(count) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.textContent = "Item " + i;
    el.style.cssText = "padding:2px;margin:1px;border:1px solid #ccc";
    document.body.appendChild(el);
  }
}
console.log("Profiling started - check Performance panel");
const res = heavyComputation(300000);
console.log("Computation result:", res);
domOperations(200);
console.log("Profiling complete");
console.log("Look for long tasks (red bars > 50ms)");`
    },

    "Memory Allocation Timelines": {
      exp: "Memory Allocation Timelines in the Performance panel show where memory is allocated over time. Record activity, then inspect the Allocation timeline to see which functions allocated memory. Combine with Heap Snapshots for leak detection.",
      code: `// Memory Allocation Timelines
// Performance panel > Check "Memory" checkbox
// Record > Look at the Allocation timeline

function allocatePeriodically() {
  const buffers = [];
  for (let i = 0; i < 100; i++) {
    // Allocation appears as blue bars on timeline
    buffers.push(new Array(10000).fill("x"));
    if (i % 20 === 0) {
      // Periodic GC will show as sawtooth pattern
      console.log("Allocated batch", i, "buffers:", buffers.length);
    }
  }
  return buffers;
}

// Simulate allocation patterns
const data = allocatePeriodically();
console.log("Allocation complete");
console.log("Check Performance > Memory for allocation timeline");
console.log("Blue bars = new allocations, sawtooth = GC");`
    },

    "Minified Code Pretty-Printing": {
      exp: "Sources panel pretty-printing ({ }) reformats minified code into readable JS. The Blackbox feature hides framework/lib scripts from stack traces. Use <code>//# sourceURL=</code> for naming eval'd code.",
      code: `// Minified Code Pretty-Printing
// Click { } button in Sources panel to pretty-print

// Script eval with named sourceURL
function createDynamicScript() {
  const code = [
    "function process(data) {",
    "  return data.map(x => x * 2);",
    "}",
    "//# sourceURL=myModule.js",
  ].join("\\n");
  eval(code);
  // Sources panel shows "myModule.js" as a file
  const result = process([1, 2, 3, 4, 5]);
  console.log("Dynamic module result:", result);
}

createDynamicScript();

// Blackbox a script
// Sources > Right-click file > Blackbox Script
// This hides it from stack traces during debugging
console.log("Pretty-print: Click { } in Sources panel");
console.log("Blackbox: Right-click > Blackbox Script");
console.log("sourceURL: //# sourceURL=name.js");`
    },

    "Local Workspace Overrides": {
      exp: "Workspace Overrides let you edit files directly in Sources and persist changes across page reloads. Files are saved to a local folder. Enable in Sources > Filesystem > Add folder to workspace.",
      code: `// Local Workspace Overrides
// 1. Sources > Filesystem > Add folder to workspace
// 2. Edit any file directly in Sources
// 3. Ctrl+S saves to local folder
// 4. Overrides take effect on page reload

// Make a local edit for testing
const DEBUG_MODE = true;
const API_ENDPOINT = "http://localhost:3000/api";

async function testOverride() {
  console.log("DEBUG_MODE:", DEBUG_MODE);
  console.log("API:", API_ENDPOINT);
  // Edit this line in Sources > save > reload
  // Changes persist without server modification
  return { debug: DEBUG_MODE, endpoint: API_ENDPOINT };
}

testOverride();

console.log("Workspace overrides workflow:");
console.log("1. Add local folder to workspace");
console.log("2. Edit files in Sources panel");
console.log("3. Save (Ctrl+S) persists changes");
console.log("4. Reload page to see changes");`
    },

    "V8 Engine Optimization Tracing": {
      exp: "V8 optimization tracing logs optimization and deoptimization of functions. Run with <code>--trace-opt</code> and <code>--trace-deopt</code> flags. Use <code>--trace-ic</code> for inline cache state changes and <code>--print-opt-code</code> for generated machine code.",
      code: `// V8 Engine Optimization Tracing
// Run: node --trace-opt --trace-deopt script.js

// Functions that get optimized by V8
function hotFunction(count) {
  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += i * i;
  }
  return sum;
}

// Warm up the function (triggers optimization)
for (let j = 0; j < 10000; j++) {
  hotFunction(100);
}

// This call is now optimized
console.log("Hot function result:", hotFunction(1000));

// Deoptimization trigger: changing parameter type
function typedAdd(a, b) {
  return a + b;
}

// Keep it monomorphic (same type) to stay optimized
for (let k = 0; k < 10000; k++) {
  typedAdd(k, k + 1);
}

console.log("V8 optimization flags:");
console.log("  --trace-opt      - Log optimized functions");
console.log("  --trace-deopt    - Log deoptimizations");
console.log("  --trace-ic       - Log inline cache state");
console.log("  --print-opt-code - Print generated machine code");
console.log("  --trace-maps     - Log hidden class transitions");`
    }
  },

  "Web & Production Debugging": {
    "Strict Mode Runtime Failures": {
      exp: "Strict mode catches common errors: undeclared variables, deleting undeletable properties, duplicate params. ES modules and classes are always strict.",
      code: `// Strict Mode Runtime Failures
// ES modules and classes are always strict
function strictDemo() {
  "use strict";
  // These would throw instead of silently failing:
  // undeclaredVar = "test"; // ReferenceError
  // Assignment to non-writable property
  const obj = {};
  Object.defineProperty(obj, "readonly", {value: 1, writable: false});
  // obj.readonly = 2; // TypeError: Cannot assign to read only property
  function showThis() {
    console.log("this is undefined:", this === undefined);
  }
  showThis();
}
strictDemo();
class StrictClass {
  process(items) {
    items.forEach(function(item) {
      // this is undefined here in class methods (strict mode)
      // Fix: use arrow function: items.forEach(item => {...})
    });
  }
}
console.log("Strict mode prevents silent failures");
console.log("Debug: enable strict mode to find hidden bugs");`
    },
    "Hydration Error Debugging": {
      exp: "Hydration errors in SSR frameworks (Next.js, Nuxt, SvelteKit) occur when server HTML does not match client render. Debug by comparing View Source vs Elements panel.",
      code: `// Hydration Error Debugging
// Server HTML must match what the client renders
// Common causes:
// 1. Browser-only APIs during server render
function ServerSafeComponent() {
  // BAD: window.innerWidth during SSR
  // GOOD: Use CSS media queries or client-only code
}
// 2. Timestamps / random values differ
function TimeDisplay() {
  // BAD: new Date().toISOString()
  // GOOD: Pass timestamp as prop from server
}
// 3. Browser extensions modifying DOM before hydration
// Debugging steps:
console.log("1. View Page Source for server HTML");
console.log("2. Open Elements panel for client render");
console.log("3. Find the first difference");
console.log("4. Check for typeof window !== undefined guards");`
    },
    "Web & Service Workers Debugging": {
      exp: "Workers run in separate global contexts. Debug them in DevTools: Application panel for Service Workers, Sources panel for Worker scripts.",
      code: `// Web & Service Workers Debugging
console.log("Main thread running");
// Create a Web Worker with inline code
const workerCode = "self.onmessage = function(e) { postMessage(e.data * 2); };";
const blob = new Blob([workerCode], {type: "application/javascript"});
const worker = new Worker(URL.createObjectURL(blob));
worker.onmessage = (e) => console.log("Worker result:", e.data);
worker.postMessage(21);
console.log("Debugging workers:");
console.log("1. Sources panel > Workers tab");
console.log("2. Application panel > Service Workers");
console.log("3. Check Update on reload for development");`
    },
    "Memory Leak Identification": {
      exp: "Memory leaks occur when objects are retained unintentionally. Common patterns: detached DOM elements, uncleared intervals, closures, global variables, event listeners.",
      code: `// Memory Leak Identification
// Pattern 1: Uncleared intervals
const intervalId = setInterval(() => {
  console.log("Running...");
}, 1000);
// FIX: clearInterval(intervalId) when component unmounts
// Pattern 2: Detached DOM references
const detachedElements = [];
for (let i = 0; i < 5; i++) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  detachedElements.push(el);
  document.body.removeChild(el);
  // Elements still referenced in array - NOT GCd!
}
// Pattern 3: Accidental global
function leaky() {
  leakedGlobal = {data: "Will never be garbage collected"};
}
leaky();
// Pattern 4: Closure retaining large data
function createLeakyClosure() {
  const largeData = new Array(10000).fill("x");
  return function() { return "small"; };
  // largeData is retained via closure even though unused
}
console.log("Check Memory panel > Heap snapshots");
console.log("Look for Detached DOM trees");`
    },
    "Production Error Tracking": {
      exp: "Production error tracking tools (Sentry, LogRocket, Datadog) capture errors with context: browser, device, user actions. Integrate via SDK for real-time monitoring.",
      code: `// Production Error Tracking Integration
class ErrorTracker {
  constructor(dsn) {
    this.dsn = dsn;
    this.errors = [];
  }
  capture(error, context) {
    this.errors.push({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context: context || {},
    });
    console.log("Error captured:", error.message);
  }
  flush() {
    // Send to your error tracking service
    console.log("Would flush", this.errors.length, "errors");
    this.errors = [];
  }
}
// Global handlers
const tracker = new ErrorTracker("https://errors.example.com/api");
window.onerror = (msg, url, line, col, error) => {
  tracker.capture(error || new Error(msg), {url, line, col});
};
window.addEventListener("unhandledrejection", (event) => {
  tracker.capture(event.reason, {type: "unhandledrejection"});
});
console.log("Error tracker initialized");
console.log("Popular services: Sentry, LogRocket, Datadog RUM");`
    },
    "Node.js Remote Debugging": {
      exp: "Node.js debugging with --inspect flags enables Chrome DevTools connection. Use --inspect-brk to pause on first line. Connect via chrome://inspect.",
      code: `// Node.js Remote Debugging
// Run: node --inspect-brk server.js
// Open chrome://inspect in Chrome
// Click "Open dedicated DevTools for Node"
const http = require("http");
const server = http.createServer((req, res) => {
  // SET BREAKPOINT HERE in Chrome DevTools for Node
  console.log("Request:", req.method, req.url);
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify({status: "ok", url: req.url}));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
  console.log("Debug: open chrome://inspect");
});
console.log("Commands:");
console.log("node --inspect server.js");
console.log("node --inspect-brk server.js");
console.log("chrome://inspect - connect DevTools");`
    },

    "Browser Extension Debugging": {
      exp: "Debug browser extensions via <code>chrome://extensions</code> or <code>about:debugging</code> in Firefox. Enable developer mode, inspect background scripts, content scripts, and popup pages. Service worker extensions use the Application panel.",
      code: `// Browser Extension Debugging
// Chrome: chrome://extensions > Developer mode > Inspect
// Firefox: about:debugging > This Firefox > Inspect

// Background script (Manifest V2)
// Sources panel shows background.js when inspected

// Service worker background (Manifest V3)
// Application > Service Workers > Inspect

// Content script example (runs on page)
function contentScriptDemo() {
  console.log("Content script active");
  console.log("Can access: DOM, console, localStorage");
  // Content scripts are visible in page's Sources panel
  document.body.style.outline = "2px solid red";
}

// Popup page debugging
// Right-click extension icon > Inspect popup

console.log("Extension debugging tips:");
console.log("1. Enable Developer mode in extensions page");
console.log("2. Click 'Inspect views: background page'");
console.log("3. For MV3: Application > Service Workers");
console.log("4. Content scripts: Sources > Content scripts tab");
console.log("5. Popup: Right-click > Inspect popup");`
    },

    "Mocking & Blocking Network Requests": {
      exp: "The Network panel supports request blocking, mocking, and offline simulation. Right-click a request > Block request URL. Use Overrides for custom responses. The Network conditions panel emulates offline mode and custom latency.",
      code: `// Mocking & Blocking Network Requests
const API = "https://jsonplaceholder.typicode.com";

// Blocked request pattern
async function fetchWithFallback() {
  try {
    // If blocked: request fails with NetError
    const res = await fetch(API + "/posts/1");
    console.log("Response:", await res.json());
  } catch (err) {
    console.log("Request blocked:", err.message);
    console.log("Using fallback data instead");
    return { id: 1, title: "Fallback", body: "Mock data" };
  }
}

fetchWithFallback().then(console.log);

// Block requests: Network panel > right-click > Block
// Network Conditions: Offline emulation, latency throttling
// Custom responses: Overrides tab in Network panel

console.log("\\nNetwork mocking options:");
console.log("1. Block request URL - right-click in Network");
console.log("2. Offline emulation - Network Conditions tab");
console.log("3. Custom latency - Throttling dropdown");
console.log("4. Request blocking pattern - */api/* blocks all API calls");`
    }
  },

  "Python Debugging": {
    "Post-Mortem Debugging": {
      exp: "Post-mortem debugging allows you to inspect a program's state <em>after</em> an exception has occurred. Instead of setting breakpoints before the error, you enter an interactive debugger session at the exact frame where the exception was raised.",
      code: `# Post-Mortem Debugging
def process_user_data(data):
    name = data["name"]
    age = data["age"]
    email = data["emial"]  # KeyError! 'emial' doesn't exist
    return {"name": name, "age": age, "email": email}
def load_and_process():
    user_data = {"name": "Alice", "age": 30, "email": "alice@example.com"}
    result = process_user_data(user_data)
    return result
print("Post-mortem debugging commands:")
print("  pdb.pm()        - Enter post-mortem after exception")
print("  pdb.post_mortem() - Use with traceback object")
print("  l (list)        - Show source context")
print("  u (up)          - Move up call stack")
print("  d (down)        - Move down call stack")`
    },
    "IDE Debugging Integrations": {
      exp: "Modern IDEs provide visual debugging for Python. VS Code and PyCharm offer breakpoints, variable inspection, watch expressions, and step-through controls. Create a .vscode/launch.json for VS Code debugging configuration.",
      code: `# IDE Debugging Integrations
# VS Code launch.json configuration:
# {
#     "version": "0.2.0",
#     "configurations": [
#         {
#             "name": "Python: Current File",
#             "type": "python",
#             "request": "launch",
#             "program": "\${file}",
#             "console": "integratedTerminal",
#             "justMyCode": true
#         }
#     ]
# }
def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    seq = [0, 1]
    for i in range(2, n):
        seq.append(seq[i-1] + seq[i-2])
    return seq
result = fibonacci(10)
print("Fibonacci:", result)`
    },
    "Traceback Module Inspection": {
      exp: "The traceback module provides utilities for extracting, formatting, and printing Python stack traces. Essential for capturing error context in logs and diagnostic output.",
      code: `# Traceback Module Inspection
import traceback
import sys
def faulty_function():
    return {"key": "value"}
def analyze_error():
    try:
        faulty_function()
    except KeyError:
        traceback.print_exc()
        tb_string = traceback.format_exc()
        exc_type, exc_value, exc_tb = sys.exc_info()
        frames = traceback.extract_tb(exc_tb)
        for i, frame in enumerate(frames):
            print(f"  Frame {i}: {frame.filename}:{frame.lineno}")
analyze_error()`
    },
    "Multi-threading & Multi-processing Debugging": {
      exp: "Debugging concurrent code is challenging due to race conditions, deadlocks, and shared state issues. Name threads for identification and use logging with thread names.",
      code: `# Multi-threading Debugging
import threading
import time
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(threadName)s] %(message)s",
    datefmt="%H:%M:%S",
)
class SafeCounter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()
    def increment(self):
        with self.lock:
            current = self.value
            time.sleep(0.0001)
            self.value = current + 1
safe_counter = SafeCounter()
def safe_worker(n):
    for _ in range(100):
        safe_counter.increment()
threads = []
for i in range(10):
    t = threading.Thread(target=safe_worker, args=(i,), name=f"Safe-{i}")
    t.start()
    threads.append(t)
for t in threads:
    t.join()
print(f"Safe counter: {safe_counter.value}")`
    },
    "Asynchronous Code Debugging (asyncio)": {
      exp: "Debugging asyncio code requires understanding the event loop and coroutine execution. Enable debug mode with PYTHONASYNCIODEBUG=1 for warnings about unawaited coroutines.",
      code: `# Asynchronous Code Debugging (asyncio)
import asyncio
loop = asyncio.new_event_loop()
loop.set_debug(True)
asyncio.set_event_loop(loop)
async def important_task(name):
    await asyncio.sleep(0.5)
    return f"Result from {name}"
async def proper_function():
    result = await important_task("demo")
    return "done"
asyncio.run(proper_function())
print("asyncio debug checklist:")
print("1. PYTHONASYNCIODEBUG=1 for auto-warnings")
print("2. loop.set_debug(True) for verbose logging")
print("3. asyncio.all_tasks() to find leaked tasks")`
    },
    "Environment, Path & Dependency Diagnostics": {
      exp: "Many Python bugs stem from environment misconfiguration: wrong Python version, missing dependencies, incorrect import paths, or virtual environment conflicts.",
      code: `# Environment, Path & Dependency Diagnostics
import sys
import os
print("=== Python Environment ===")
print(f"Executable: {sys.executable}")
print(f"Version: {sys.version}")
in_venv = sys.prefix != sys.base_prefix
print(f"Inside virtual environment: {in_venv}")
print("\\n=== Module Search Path ===")
for i, path in enumerate(sys.path):
    print(f"  [{i}] {path}")
print("\\n=== Package Status ===")
packages = ["os", "sys", "json", "math", "requests", "numpy", "flask"]
for pkg in packages:
    try:
        mod = __import__(pkg)
        ver = getattr(mod, "__version__", "stdlib")
        print(f"  OK: {pkg} == {ver}")
    except ImportError:
        print(f"  MISSING: {pkg}")
print("\\n=== Diagnostic Commands ===")
print("  pip check           - Verify dependency consistency")
print("  python -m site      - Show site-packages paths")`
    },

    "Remote Debugging with debugpy": {
      exp: "debugpy enables remote debugging from VS Code and PyCharm. Call debugpy.listen() to start the debug server, then attach from your IDE.",
      code: `# Remote Debugging
import debugpy
debugpy.listen(("0.0.0.0", 5678))
print("Waiting for debugger on port 5678")
debugpy.wait_for_client()
print("Debugger attached!")`
    },

    "Testing Framework Debugging (pytest --pdb)": {
      exp: "Use <code>pytest --pdb</code> to enter the debugger on test failure. <code>breakpoint()</code> inside tests provides manual inspection points. pytest <code>-s</code> shows stdout and <code>-vv</code> provides verbose assertions.",
      code: `# Testing Debugging
import pytest
def add(a, b): return a + b
class TestMath:
    def test_add(self):
        assert add(2, 3) == 5
    def test_debug(self):
        x = add(10, 20)
        breakpoint()  # Inspect x here
        assert x == 30
# pytest --pdb -x test.py
print("Run: pytest --pdb -x test_file.py")`
    },

    "Jupyter Notebook Debugging (%debug)": {
      exp: "Jupyter supports <code>%debug</code> for post-mortem inspection after errors, <code>%pdb</code> for auto-debug toggle, and <code>set_trace()</code> from IPython for manual breakpoints.",
      code: `# Jupyter Debugging
# %pdb on  (auto-debug errors)
import pandas as pd
df = pd.DataFrame({"a": [1, 2]})
# df["missing"] raises KeyError
# Then: %debug enters post-mortem
from IPython.core.debugger import set_trace
set_trace()  # Manual breakpoint
print("Debug commands: %debug, %pdb, set_trace()")`
    },

    "Code Profiling (cProfile & snakeviz)": {
      exp: "cProfile measures function-level execution time. Use snakeviz or pstats for visualization. line_profiler gives per-line timings and memory_profiler tracks memory usage.",
      code: `# Code Profiling
import cProfile, pstats
def slow(n):
    total = 0
    for i in range(n):
        for j in range(100): total += i * j
    return total
profiler = cProfile.Profile()
profiler.enable()
slow(1000)
profiler.disable()
pstats.Stats(profiler).sort_stats("cumulative").print_stats(5)
# python -m cProfile -o out.prof script.py
# snakeviz out.prof
print("Use: python -m cProfile script.py")`
    },

    "Custom Exception Hooks (sys.excepthook)": {
      exp: "Override <code>sys.excepthook</code> to intercept uncaught exceptions for logging. Use <code>threading.excepthook</code> for thread exceptions and the <code>signal</code> module for OS signals.",
      code: `# Custom Exception Hooks
import sys, traceback
sys.excepthook = lambda t, v, tb: (
    open("crash.log","a").write(f"{t.__name__}: {v}\n"),
    traceback.print_tb(tb),
    sys.__excepthook__(t, v, tb)
)
import signal
signal.signal(signal.SIGINT, lambda s, f: (
    print(f"Signal {s} at {f.f_code.co_name}"), sys.exit(1)
))
print("Custom exception hooks active")`
    }

  },

  "TypeScript Debugging": {
    "Source Maps & Transpiled Code Debugging": {
      exp: "Source maps map compiled JavaScript back to original TypeScript source. Enable with <code>sourceMap: true</code> in tsconfig.json. Chrome DevTools automatically loads .map files to show TS code in the Sources panel.",
      code: `// Source Maps in tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,           // Generates .js.map files
    "inlineSourceMap": false,    // Embeds map in JS (larger)
    "inlineSources": false,      // Embeds TS source in map
    "sourceRoot": "../src"       // Base path for sources
  }
}
// Debug in VS Code launch.json
{
  "version": "0.2.0",
  "configurations": [{
    "type": "node",
    "request": "launch",
    "name": "Debug TS via ts-node",
    "runtimeArgs": ["-r", "ts-node/register"],
    "args": ["\${workspaceFolder}/src/index.ts"],
    "sourceMaps": true
  }]
}
interface User {
  id: number;
  name: string;
}
function greet(user: User): string {
  // Breakpoint here in .ts file via source map
  return "Hello, " + user.name;
}
console.log(greet({ id: 1, name: "Alice" }));`
    },
    "tsconfig.json Flags for Debugging": {
      exp: "tsconfig flags control compilation debugging. Key flags: <code>strict</code> for full type checking, <code>noEmitOnError</code> to fail on errors, <code>diagnostics</code> for compile timings, <code>listEmittedFiles</code> for output tracking.",
      code: `// tsconfig.json Diagnostics Flags
{
  "compilerOptions": {
    "diagnostics": true,             // Show compile timing info
    "extendedDiagnostics": true,     // Detailed memory/time per file
    "listEmittedFiles": true,        // List all output files
    "listFiles": true,               // List all input files
    "traceResolution": true,         // Trace module resolution
    "explainFiles": true,            // Explain why files are included
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noEmitOnError": true,
    "skipLibCheck": false
  }
}
console.log("Use tsc --showConfig to see resolved config");`
    },
    "TypeScript Compiler Diagnostics": {
      exp: "Understanding compiler diagnostics: error codes (TSXXXX), <code>tsc --noEmit</code> for type-checking without output, <code>tsc --pretty</code> for formatted errors. Use <code>// @ts-expect-error</code> for expected errors.",
      code: `// TypeScript Compiler Diagnostics
// Run: tsc --noEmit --pretty
function multiply(a: number, b: number): number {
  return a * b;
}
const data: any = "hello";
// @ts-expect-error - intentionally accessing missing property
data.nonexistent();
console.log("Common TS diagnostics:");
console.log("  TS2322: Type X is not assignable to type Y");
console.log("  TS2531: Object is possibly null");
console.log("  TS2345: Argument of type X is not assignable to Y");
console.log("  TS18046: X is of type unknown");
// Use tsc --showConfig to see effective configuration
// Use tsc --generateTrace trace.json for compiler performance`
    },
    "IDE Debugger Configuration": {
      exp: "VS Code and WebStorm support TypeScript debugging with source maps. Configure <code>preLaunchTask</code> for compilation, use <code>runtimeArgs</code> for ts-node, and set breakpoints directly in .ts files.",
      code: `// VS Code launch.json for TypeScript
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug TS",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["\${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "resolveSourceMapLocations": [
        "\${workspaceFolder}/**",
        "!**/node_modules/**"
      ]
    },
    {
      "name": "Debug TS (ts-node)",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["\${workspaceFolder}/src/index.ts"]
    }
  ]
}
// tasks.json for preLaunchTask
{
  "version": "2.0.0",
  "tasks": [{
    "type": "typescript",
    "tsconfig": "tsconfig.json",
    "option": "watch",
    "problemMatcher": ["$tsc-watch"]
  }]
}
console.log("VS Code shortcuts: F5 (start), Shift+F5 (stop)");`
    },
    "Type-Level Debugging with Conditional Types": {
      exp: "Debug complex type logic using <code>// @ts-expect-error</code> to assert types, utility types inline, and the <code>satisfies</code> operator. Use IDE type hovers and Type declarations for inspection.",
      code: `// Type-Level Debugging
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};
interface Config {
  server: { host: string; port: number };
  database: { url: string; pool: number };
}
type ReadonlyConfig = DeepReadonly<Config>;
const config = {
  server: { host: "localhost", port: 3000 },
  database: { url: "postgres://...", pool: 10 },
} satisfies Config;
type Result<T> = T extends string
  ? "String type"
  : T extends number
  ? "Number type"
  : "Other type";
type A = Result<string>;  // "String type"
type B = Result<number>;  // "Number type"
type C = Result<boolean>; // "Other type"
console.log("Use IDE type hovers to debug complex generics");
console.log("TypeScript playground: https://www.typescriptlang.org/play");`
    },

    "ts-node & tsx Runtime Debugging": {
      exp: "ts-node and tsx run TypeScript directly without compilation. Use <code>--inspect</code> for debugger attachment. Configure VS Code to use ts-node for breakpoint debugging in .ts files.",
      code: `// ts-node & tsx Debugging
// Install: npm install -D ts-node
// Run: node --inspect-brk -r ts-node/register src/index.ts
// Or: npx tsx --inspect-brk src/index.ts

// VS Code launch.json for ts-node:
// {
//   "type": "node",
//   "request": "launch",
//   "runtimeArgs": ["-r", "ts-node/register"],
//   "args": ["\${workspaceFolder}/src/index.ts"]
// }

// With tsx (faster, ESM support):
// npx tsx --inspect src/index.ts

async function fetchData(id: number): Promise<string> {
  // Breakpoint works in .ts file
  const response = await fetch(\`/api/data/\${id}\`);
  return response.text();
}
console.log("Use tsx or ts-node with --inspect for debugging");
console.log("tsx: npm install -D tsx (recommended)");
console.log("ts-node: npm install -D ts-node");`
    },

    "Declaration File (*.d.ts) Debugging": {
      exp: "Debug type declarations by examining <code>.d.ts</code> files. Use <code>--declaration</code> and <code>--declarationMap</code> to generate type maps. <code>skipLibCheck: false</code> enables checking declarations for errors.",
      code: `// Declaration File Debugging
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,         // Generate .d.ts
    "declarationMap": true,      // Source maps for .d.ts
    "emitDeclarationOnly": true, // Only emit .d.ts files
    "skipLibCheck": false        // Check .d.ts for errors
  }
}

// Debug: hover over imported types to see declaration
import { Express } from "express";
// Cmd+click on Express opens express/index.d.ts

// Custom declaration example
declare module "my-library" {
  export interface Config {
    apiKey: string;
    endpoint: string;
  }
  export function init(config: Config): void;
}

console.log("Cmd+click types to inspect declarations");
console.log("Use --declarationMap for navigation");`
    },

    "Project References & Build Mode": {
      exp: "TypeScript project references partition large codebases into composable projects. Use <code>tsc --build</code> with <code>--force</code> or <code>--clean</code> flags. Debug reference resolution with <code>--verbose</code>.",
      code: `// Project References
// tsconfig.json (root)
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" },
    { "path": "./packages/app", "prepend": true }
  ],
  "files": []
}

// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}

// Build commands:
// tsc --build                   - Build all references
// tsc --build --force           - Force rebuild
// tsc --build --clean           - Clean outputs
// tsc --build --verbose         - Debug resolution
// tsc --build -w                - Watch mode

console.log("Use tsc --build for composite projects");
console.log("--verbose shows reference resolution order");`
    },

    "Type Testing with expect-type & tsd": {
      exp: "Type testing libraries verify type behavior at compile time. <code>expect-type</code> asserts type equality, <code>tsd</code> provides a test framework for type definitions. Both catch type regressions.",
      code: `// Type Testing
// npm install -D expect-type tsd

import { expectTypeOf } from "expect-type";

function createUser(name: string, age: number) {
  return { id: Date.now(), name, age, active: true };
}

const user = createUser("Alice", 30);

// Type assertions (compile-time checks)
expectTypeOf(user).toHaveProperty("id");
expectTypeOf(user).toHaveProperty("name");
expectTypeOf(user.name).toBeString();
expectTypeOf(user.age).toBeNumber();

// Conditional type testing
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type ROUser = DeepReadonly<typeof user>;
expectTypeOf<ROUser>().toHaveProperty("name");

// tsd test file example:
// $expectType string
// const result: string = getUserName(user);

console.log("expect-type and tsd catch type regressions");
console.log("Run: npx tsd");`
    },

    "Module Resolution Debugging": {
      exp: "Module resolution determines how imports resolve to files. Use <code>--traceResolution</code> for detailed resolution logs, <code>--explainFiles</code> for file inclusion reasons, and <code>moduleResolution</code> settings to control behavior.",
      code: `// Module Resolution Debugging
// Run: tsc --traceResolution

// tsconfig.json settings
{
  "compilerOptions": {
    "moduleResolution": "node16",  // or "bundler", "nodenext"
    "baseUrl": ".",                // Base for non-relative imports
    "paths": {
      "@/*": ["./src/*"],          // Path mapping
      "#utils": ["./src/utils/index.ts"]
    },
    "rootDirs": ["./src", "./generated"],  // Virtual roots
    "typeRoots": ["./node_modules/@types", "./types"],
    "allowJs": true,               // Include .js in resolution
  }
}

// Resolution order (node16):
// 1. import "./foo" -> ./foo.ts, ./foo.tsx, ./foo.d.ts
// 2. import "lodash" -> node_modules/lodash (package.json exports/types/main)
// 3. import "@/*" -> baseUrl + path mapping

console.log("Run: tsc --traceResolution | grep \"Resolving\"");
console.log("Use --explainFiles to see why files are included");`
    },

    "Source Map Upload Pipelines": {
      exp: "Source maps must be uploaded to error tracking services (Sentry, Bugsnag, Datadog) so production stack traces point back to original TypeScript source code. The upload pipeline typically: builds with source maps enabled, extracts map files, uploads them to the service via their CLI or API, and then either removes them from production or restricts access. Services like Sentry use <code>sentry-cli</code> to upload releases with source maps, while Datadog uses <code>datadog-ci</code> and Bugsnag uses <code>bugsnag-sourcemaps</code>. Always strip source maps from production builds to avoid exposing source code to end users.",
      code: `// Source Map Upload Pipelines
// Example: Sentry CI/CD integration (GitHub Actions)
name: Upload Source Maps
on:
  push:
    branches: [main]

jobs:
  upload-sourcemaps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build  # Generates .js and .js.map files

      # Sentry Release + Source Map Upload
      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: \${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: my-org
          SENTRY_PROJECT: my-project
        with:
          environment: production
          sourcemaps: ./dist
          url_prefix: ~/static/js/

// Or using sentry-cli directly:
// npm install -D @sentry/cli
// sentry-cli releases new VERSION
// sentry-cli releases files VERSION upload-sourcemaps ./dist --url-prefix '~/static/js/'
// sentry-cli releases set-commits VERSION --auto
// sentry-cli releases finalize VERSION

// Datadog source map upload:
// npm install -D @datadog/datadog-ci
// datadog-ci sourcemaps upload ./dist \\
//   --service my-service \\
//   --release-version VERSION \\
//   --minified-path-prefix 'https://cdn.example.com/static/js/'

// Bugsnag source map upload:
// npm install -D bugsnag-sourcemaps
// bugsnag-sourcemaps upload \\
//   --api-key YOUR_API_KEY \\
//   --minified-file ./dist/app.min.js \\
//   --source-map ./dist/app.min.js.map \\
//   --minified-url 'https://cdn.example.com/app.min.js' \\
//   --upload-sources

// tsconfig.json — ensure source maps are generated
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true  // Embeds TS source in map for Sentry
  }
}

// Webpack config for controlled source map exposure:
// production: use 'hidden-source-map' (maps exist but not referenced)
// development: use 'eval-source-map' (fast rebuilds with full maps)

// Verify upload:
// 1. Trigger an intentional error in production
// 2. Check Sentry/Bugsnag/Datadog for original TS source in stack trace
// 3. The error should show .ts file paths and line numbers
console.log("Source map upload pipeline configured");
console.log("Key services: Sentry (sentry-cli), Datadog (datadog-ci), Bugsnag (bugsnag-sourcemaps)");
console.log("Always strip source maps from production static assets");`
    },

  },

  "Go Debugging": {
    "Delve CLI Debugger": {
      exp: "Delve is the standard debugger for Go programs. Key commands: <code>break</code> (set breakpoint), <code>continue</code> (resume), <code>next</code> (step over), <code>step</code> (step into), <code>list</code> (show source), <code>print</code> (evaluate expression), and <code>goroutines</code> (list goroutines).",
      code: `// Delve CLI Debugger
// Install: go install github.com/go-delve/delve/cmd/dlv@latest
// Start: dlv debug ./main.go
// Or attach: dlv attach <pid> ./program

package main

import "fmt"

func calculateSum(n int) int {
	sum := 0
	for i := 0; i < n; i++ {
		// dlv> break main.go:8
		sum += i * i
	}
	return sum
}

func main() {
	// dlv> break main.main
	result := calculateSum(100)
	fmt.Println("Result:", result)
}

// Delve commands:
// dlv> break main.calculateSum  - Set breakpoint
// dlv> continue                 - Resume execution
// dlv> next                     - Step over
// dlv> step                     - Step into
// dlv> print result             - Print variable
// dlv> list                     - Show source context
// dlv> locals                   - Show local variables
// dlv> goroutines               - List all goroutines
// dlv> stack                    - Print call stack`
    },

    "Goroutine Stack Inspection": {
      exp: "Goroutine stacks show the execution state of each goroutine. Use <code>runtime.Stack()</code> for programmatic access, <code>SIGQUIT</code> for full dump, and <code>net/http/pprof</code> for HTTP-accessible stack traces. Delve's <code>goroutines</code> command lists all goroutines.",
      code: `// Goroutine Stack Inspection
package main

import (
	"fmt"
	"runtime"
	"time"
)

func worker(id int, done chan bool) {
	for i := 0; i < 5; i++ {
		time.Sleep(10 * time.Millisecond)
		fmt.Printf("Worker %d: step %d\\n", id, i)
	}
	done <- true
}

func printGoroutineStacks() {
	buf := make([]byte, 1024*64)
	n := runtime.Stack(buf, true) // true = all goroutines
	fmt.Printf("=== Goroutine Stacks (%d bytes) ===\\n", n)
	fmt.Printf("%s\\n", buf[:n])
}

func main() {
	done := make(chan bool)
	
	// Start 3 goroutines
	go worker(1, done)
	go worker(2, done)
	go worker(3, done)
	
	// Print stacks while goroutines are running
	printGoroutineStacks()
	
	// Wait for completion
	<-done
	<-done
	<-done
	
	// Alternative: use SIGQUIT on running process
	// kill -SIGQUIT <pid>  (prints all stacks to stderr)
	fmt.Println("\\nAll workers done")
	fmt.Println("\\nStack inspection methods:")
	fmt.Println("1. runtime.Stack() - programmatic")
	fmt.Println("2. SIGQUIT - full dump to stderr")
	fmt.Println("3. /debug/pprof/goroutine - HTTP endpoint")
	fmt.Println("4. dlv goroutines - Delve interactive")
	fmt.Println("5. go tool trace - execution tracer")
}`
    },

    "Race Detection (go run -race)": {
      exp: "Go's built-in race detector (<code>go run -race</code>) finds concurrent access bugs. It detects data races when two goroutines access the same variable without synchronization. The compiler instruments memory accesses at runtime.",
      code: `// Race Detection
// Run: go run -race main.go
// Build: go build -race ./...
// Test: go test -race ./...

package main

import (
	"fmt"
	"sync"
)

// RACY: unsynchronized concurrent access
func raceExample() {
	counter := 0
	var wg sync.WaitGroup

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 1000; j++ {
				counter++ // RACE! No mutex
			}
		}()
	}

	wg.Wait()
	fmt.Println("Racy counter:", counter)
}

// FIXED: with mutex synchronization
func safeExample() {
	counter := 0
	var mu sync.Mutex
	var wg sync.WaitGroup

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 1000; j++ {
				mu.Lock()
				counter++ // SAFE: mutex protected
				mu.Unlock()
			}
		}()
	}

	wg.Wait()
	fmt.Println("Safe counter:", counter)
}

func main() {
	fmt.Println("Run with: go run -race main.go")
	fmt.Println("\\nRace output shows:")
	fmt.Println("  - Concurrent access locations")
	fmt.Println("  - Goroutine call stacks")
	fmt.Println("  - Previous vs current access")
	fmt.Println("\\nNote: race build is slower but thorough")
	
	// Run racy example to trigger detector
	raceExample()
	safeExample()
}`
    },

    "Panic Recovery & Stack Traces": {
      exp: "Panics in Go produce stack traces showing the call chain. Use <code>recover()</code> inside a deferred function to catch panics. <code>debug.Stack()</code> captures the trace as a string for logging. <code>GOTRACEBACK=all</code> controls trace verbosity.",
      code: `// Panic Recovery & Stack Traces
package main

import (
	"fmt"
	"runtime/debug"
)

func riskyOperation(depth int) {
	if depth > 3 {
		// This panic will be caught by recover
		panic("recursion limit exceeded")
	}
	riskyOperation(depth + 1)
}

func safeCaller() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic: %v\\n", r)
			fmt.Println("\\nStack trace:")
			fmt.Printf("%s\\n", debug.Stack())
		}
	}()
	
	riskyOperation(0)
}

func main() {
	fmt.Println("Before panic")
	safeCaller()
	fmt.Println("After panic (recovered)")
	
	fmt.Println("\\nPanic debugging tips:")
	fmt.Println("1. GOTRACEBACK=all - full goroutine traces")
	fmt.Println("2. GOTRACEBACK=system - includes runtime")
	fmt.Println("3. debug.PrintStack() - print to stderr")
	fmt.Println("4. recover() in deferred func - catch panics")
	fmt.Println("5. runtime.Caller() - custom stack inspection")
}`
    },

    "GC Tracing & Memory Profiling": {
      exp: "Go's garbage collector tracing shows GC cycles and memory pressure. Use <code>GODEBUG=gctrace=1</code> for GC logs, <code>runtime.ReadMemStats()</code> for programmatic stats, and <code>pprof</code> for heap profiling. The <code>go tool trace</code> command provides visualization.",
      code: `// GC Tracing & Memory Profiling
package main

import (
	"fmt"
	"runtime"
	"time"
)

func allocateMemory() {
	// GC tracing: GODEBUG=gctrace=1 go run main.go
	// Output: gc 1 @0.003s 4%: 0.012+0.42+0.004 ms clock
	// Fields: gc# @time ms, CPU%, STW, concurrent
	
	for i := 0; i < 100; i++ {
		_ = make([]byte, 10*1024*1024) // 10MB allocations
		time.Sleep(time.Millisecond)
	}
}

func printMemStats() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	fmt.Printf("Alloc = %v MiB\\n", bToMb(m.Alloc))
	fmt.Printf("TotalAlloc = %v MiB\\n", bToMb(m.TotalAlloc))
	fmt.Printf("Sys = %v MiB\\n", bToMb(m.Sys))
	fmt.Printf("NumGC = %v\\n", m.NumGC)
	fmt.Printf("LastGC = %v\\n", time.Unix(0, int64(m.LastGC)))
	fmt.Printf("PauseTotal = %v\\n", m.PauseTotalNs/1e6, "ms")
}

func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}

func main() {
	fmt.Println("=== GC Tracing ===")
	fmt.Println("Run with: GODEBUG=gctrace=1 go run main.go")
	fmt.Println("\\n=== Memory Stats ===")
	
	printMemStats()
	allocateMemory()
	printMemStats()
	
	fmt.Println("\\nProfiling commands:")
	fmt.Println("  go tool pprof http://localhost:6060/debug/pprof/heap")
	fmt.Println("  go test -bench=. -benchmem")
	fmt.Println("  GODEBUG=gctrace=1 ./program")
	fmt.Println("  go tool trace trace.out")
}`
    },

    "pprof Profiling (CPU, Memory, Block)": {
      exp: "Go's pprof provides runtime profiling data including CPU, heap (memory), goroutine, block (contention), mutex, and thread counts. Access via <code>net/http/pprof</code> HTTP endpoint or <code>runtime/pprof</code> for file output.",
      code: `// pprof Profiling
package main

import (
	"fmt"
	"net/http"
	_ "net/http/pprof"  // Register pprof handlers
	"time"
)

func cpuWork() {
	for i := 0; i < 10000000; i++ {
		_ = i * i
	}
}

func memWork() {
	data := make([][]byte, 0, 100)
	for i := 0; i < 100; i++ {
		data = append(data, make([]byte, 1024*1024))
		time.Sleep(time.Millisecond)
	}
}

func main() {
	go func() {
		http.ListenAndServe("localhost:6060", nil)
	}()
	
	cpuWork()
	memWork()
	
	fmt.Println("Profiling endpoints:")
	fmt.Println("  /debug/pprof/         - Index")
	fmt.Println("  /debug/pprof/heap     - Memory profile")
	fmt.Println("  /debug/pprof/profile  - CPU profile (30s)")
	fmt.Println("  /debug/pprof/goroutine - Goroutine stack")
	fmt.Println("  /debug/pprof/block    - Block/contention")
	fmt.Println("Commands:")
	fmt.Println("  go tool pprof http://localhost:6060/debug/pprof/heap")
	fmt.Println("  go tool pprof -http=:8080 profile.out")
}`
    },

    "go tool trace Execution Tracing": {
      exp: "The execution tracer (<code>go tool trace</code>) captures goroutine creation/blocking, network events, syscalls, and GC activity. Use <code>runtime/trace</code> to generate traces programmatically or via <code>net/http/pprof</code>.",
      code: `// Execution Tracing
package main

import (
	"fmt"
	"os"
	"runtime/trace"
	"sync"
	"time"
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	for i := 0; i < 5; i++ {
		time.Sleep(time.Millisecond)
		fmt.Printf("Worker %d: step %d\n", id, i)
	}
}

func main() {
	// Start trace
	f, _ := os.Create("trace.out")
	defer f.Close()
	trace.Start(f)
	defer trace.Stop()

	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go worker(i, &wg)
	}
	wg.Wait()
	
	fmt.Println("Trace saved to trace.out")
	fmt.Println("View: go tool trace trace.out")
	fmt.Println("  Shows: goroutine timeline, network, syscalls, GC")
	fmt.Println("  Key views: View trace, Goroutine analysis, Network")
}`
    },

    "Benchmarking & Benchmem": {
      exp: "Go benchmarking measures performance with <code>go test -bench</code>. Use <code>-benchmem</code> for memory allocation stats, <code>-benchtime</code> for duration, and <code>-count</code> for statistical significance.",
      code: `// Benchmarking
package main

import (
	"testing"
)

// Benchmarks: go test -bench=. -benchmem

func slowConcat(n int) string {
	var s string
	for i := 0; i < n; i++ {
		s += "a"  // Allocates new string each time
	}
	return s
}

func fastBuilder(n int) string {
	var b strings.Builder
	b.Grow(n)
	for i := 0; i < n; i++ {
		b.WriteByte("a"[0])
	}
	return b.String()
}

// Benchmark functions
func BenchmarkSlowConcat(b *testing.B) {
	for i := 0; i < b.N; i++ {
		slowConcat(100)
	}
}

func BenchmarkFastBuilder(b *testing.B) {
	for i := 0; i < b.N; i++ {
		fastBuilder(100)
	}
}

// Run:
// go test -bench=. -benchmem -benchtime=10s -count=5
// Output shows: ns/op, B/op (bytes/alloc), allocs/op

/* Example output:
BenchmarkSlowConcat-8   50000  32000 ns/op  10240 B/op  100 allocs/op
BenchmarkFastBuilder-8 500000   1200 ns/op    480 B/op    2 allocs/op
*/

func main() {
	fmt.Println("Run: go test -bench=. -benchmem")
	fmt.Println("Compare: ns/op, B/op, allocs/op")
}`
    },

    "Test Verbose Output & Table-Driven Tests": {
      exp: "Use <code>go test -v</code> for verbose output showing each test case, <code>-run</code> to run specific tests, and <code>-count=1</code> to disable caching. Table-driven tests organize multiple cases with descriptive names.",
      code: `// Test Verbose Output & Table Tests
package main

import (
	"fmt"
	"testing"
)

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, fmt.Errorf("division by zero")
	}
	return a / b, nil
}

// Table-driven test
func TestDivide(t *testing.T) {
	tests := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr bool
	}{
		{"positive", 10, 2, 5, false},
		{"negative", -10, 2, -5, false},
		{"divide by zero", 10, 0, 0, true},
		{"fraction", 1, 3, 0.3333333333333333, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := divide(tt.a, tt.b)
			if (err != nil) != tt.wantErr {
				t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("got %v, want %v", got, tt.want)
			}
		})
	}
}

// Run specific test: go test -v -run TestDivide/positive
// Run: go test -v -count=1 ./...
// go test -v -run "TestDivide" -count=1
// go test -v -short  (skip long tests via testing.Short())

func main() {
	fmt.Println("Test commands:")
	fmt.Println("  go test -v -run TestDivide/positive")
	fmt.Println("  go test -v -count=1 -run .")
	fmt.Println("  go test -v -short")
	fmt.Println("  go test -v ./...  (all packages)")
}`
    },

    "Delve DAP & VS Code Integration": {
      exp: "Delve implements the Debug Adapter Protocol (DAP) for IDE integration. Install via <code>go install github.com/go-delve/delve/cmd/dlv@latest</code>. VS Code uses the Go extension to configure launch.json for debugging.",
      code: `// Delve DAP & VS Code Integration

// VS Code launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Go",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "\${workspaceFolder}",
      "env": {},
      "args": ["--flag", "value"],
      "showLog": true,
      "trace": "verbose"   // Delve DAP logs
    },
    {
      "name": "Attach to Process",
      "type": "go",
      "request": "attach",
      "mode": "local",
      "processId": 0      // PID to attach
    },
    {
      "name": "Debug Test",
      "type": "go",
      "request": "launch",
      "mode": "test",
      "program": "\${workspaceFolder}"
    }
  ]
}

// Delve DAP CLI:
// dlv dap              - Start DAP server (VS Code connects)
// dlv debug --headless  - Headless debug server
// dlv test ./...        - Debug tests

package main

import "fmt"

func main() {
	// Set breakpoint in VS Code, then F5
	msg := "Hello from Delve!"
	fmt.Println(msg)
	
	// VS Code debug panel shows:
	// Variables, Watch, Call Stack, Breakpoints
	fmt.Println("Use F5 in VS Code to start debugging")
	fmt.Println("Go extension required: golang.go")
}`
    }
,

    "cgo Debugging": {
      exp: "cgo debugging requires special tools since cgo crosses the Go/C boundary. Use <code>dlv exec</code> with C library symbol loading, <code>GOTRACEBACK=all</code> for cgo crash traces, and <code>-ldflags=-linkmode=external</code> for external linker debugging. The <code>runtime/cgo</code> package provides call stack inspection across the boundary.",
      code: `// cgo Debugging
package main

/*
#include <stdio.h>
#include <stdlib.h>

void c_hello(const char* name) {
    printf("Hello from C: %s\n", name);
}

int* create_array(int n) {
    int* arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) arr[i] = i * i;
    return arr;
}
*/
import "C"
import "unsafe"

func cgoDemo() {
    name := C.CString("Gopher")
    defer C.free(unsafe.Pointer(name))
    C.c_hello(name)

    n := C.int(5)
    arr := C.create_array(n)
    defer C.free(unsafe.Pointer(arr))

    slice := unsafe.Slice((*C.int)(unsafe.Pointer(arr)), n)
    for i, v := range slice {
        println("arr[" + string(rune('0'+i)) + "] =", v)
    }
}

func main() {
    cgoDemo()
    println("cgo debugging approaches:")
    println("  dlv exec -- -ldflags=-linkmode=external")
    println("  GOTRACEBACK=all for full cgo traces")
    println("  GOTRACEBACK=crash for coredumps")
    println("  CGO_CFLAGS=-g -O0 for debuggable C code")
    println("  dlv supports stepping into C functions")
}`
    },

    "Plugin Debugging (go plugin)": {
      exp: "Go plugin debugging involves shared object (<code>.so</code>) files loaded at runtime. Build with <code>go build -buildmode=plugin</code>, use <code>plugin.Open()</code> for loading, and debug with <code>dlv exec</code>. Symbol resolution and type assertion issues are common plugin bugs.",
      code: `// Plugin Debugging
// Build plugin: go build -buildmode=plugin -o plugin.so plugin.go

package main

import (
    "fmt"
    "plugin"
)

// plugin.go (separate file):
// package main
//
// var VERSION = "1.0.0"
//
// func Greet(name string) string {
//     return "Hello, " + name
// }

func loadAndDebug() {
    p, err := plugin.Open("./plugin.so")
    if err != nil {
        fmt.Println("Open failed:", err)
        return
    }

    // Debug: check symbol existence
    sym, err := p.Lookup("Greet")
    if err != nil {
        fmt.Println("Symbol not found:", err)
        return
    }

    // Type assertion debugging
    greetFunc, ok := sym.(func(string) string)
    if !ok {
        fmt.Println("Type assertion failed - unexpected signature")
        fmt.Printf("Actual type: %T\n", sym)
        return
    }

    result := greetFunc("World")
    fmt.Println("Plugin result:", result)
}

func main() {
    fmt.Println("Plugin debugging tips:")
    fmt.Println("  dlv exec -- -buildmode=plugin")
    fmt.Println("  Check: plugin version mismatch")
    fmt.Println("  Check: symbol casing and export")
    fmt.Println("  Check: type signature matching")
    fmt.Println("  Debug with: GOTRACEBACK=all")
    loadAndDebug()
}`
    },

    "Testing -v Output Parsing": {
      exp: "<code>go test -v</code> produces structured output including PASS/FAIL, timing, coverage, and subtests. Parse with <code>go tool test2json</code> for machine-readable output, or use <code>-json</code> flag for JSON format. Useful for CI pipelines and test result dashboards.",
      code: `// Testing -v Output Parsing
package main

import (
    "encoding/json"
    "fmt"
    "os/exec"
    "strings"
)

type TestEvent struct {
    Time    string  \`json:"Time"\`
    Action  string  \`json:"Action"\` // run/pass/fail/skip/output
    Package string  \`json:"Package"\`
    Test    string  \`json:"Test,omitempty"\`
    Elapsed float64 \`json:"Elapsed,omitempty"\`
    Output  string  \`json:"Output,omitempty"\`
}

func parseTestOutput() {
    // go test -v -json ./... outputs JSON lines
    cmd := exec.Command("go", "test", "-v", "-json", "./...")
    output, _ := cmd.CombinedOutput()

    lines := strings.Split(string(output), "\n")
    var passed, failed, skipped int

    for _, line := range lines {
        if line == "" {
            continue
        }
        var event TestEvent
        if err := json.Unmarshal([]byte(line), &event); err != nil {
            continue
        }
        switch event.Action {
        case "pass":
            passed++
            fmt.Println("PASS:", event.Test)
        case "fail":
            failed++
            fmt.Println("FAIL:", event.Test)
        case "skip":
            skipped++
        case "output":
            if strings.Contains(event.Output, "RACE") {
                fmt.Println("RACE DETECTED:", event.Test)
            }
        }
    }

    fmt.Printf("\nResults: %d passed, %d failed, %d skipped\n", passed, failed, skipped)
}

func main() {
    fmt.Println("Test output formats:")
    fmt.Println("  go test -v              - Verbose text")
    fmt.Println("  go test -v -json        - JSON lines")
    fmt.Println("  go tool test2json       - Convert to JSON")
    fmt.Println("  go test -v -race        - With race detection")
    fmt.Println("  go test -v -count=1     - No caching")
    fmt.Println("  go test -v -run Pattern - Filter tests")
    fmt.Println()
    parseTestOutput()
}`
    },

    "Race Detector Integration Tests": {
      exp: "Integrate the race detector into your test suite with <code>go test -race ./...</code>. Best practices: run race tests in CI, use <code>-count=1</code> to bypass caching, combine with short mode for faster runs, and use build tags for race-specific test helpers.",
      code: `// Race Detector Integration Tests
package main

import (
    "fmt"
    "sync"
    "testing"
    "time"
)

// SafeCounter with race detection
// Run: go test -race -v -count=1 .

type SafeCounter struct {
    mu    sync.Mutex
    value int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

func (c *SafeCounter) Value() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.value
}

// Race condition: concurrent map writes
//go:noinline
func racyMapWrite(m map[int]int, key, val int, wg *sync.WaitGroup) {
    defer wg.Done()
    m[key] = val // RACE! Unprotected concurrent map access
}

// Integration tests with race detection
func TestRaceSafe(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping race test in short mode")
    }
    c := SafeCounter{}
    var wg sync.WaitGroup
    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            c.Increment()
        }()
    }
    wg.Wait()
    if c.Value() != 100 {
        t.Errorf("Expected 100, got %d", c.Value())
    }
}

func TestRaceRacyMap(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping in short mode")
    }
    m := make(map[int]int)
    var wg sync.WaitGroup
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go racyMapWrite(m, i, i*2, &wg) // Will trigger race detector!
    }
    wg.Wait()
}

func main() {
    fmt.Println("Race detector in CI:")
    fmt.Println("  go test -race -count=1 -v ./...")
    fmt.Println("  go test -race -short ./...  (short mode)")
    fmt.Println("  go build -race -o app ./... (build with race)")
    fmt.Println()
    fmt.Println("Race CI config (GitHub Actions):")
    fmt.Println("  - name: Race Detection Tests")
    fmt.Println("    run: go test -race -count=1 ./...")
    fmt.Println("    timeout: 10m")
}`
    }

  }
};
