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
    },

    "print() Function & f-strings Formatting": {
      exp: "Python's <code>print()</code> is the simplest debugging tool. Modern f-strings support <code>f\"{var=}\"</code> syntax for inline variable printing, format specifiers like <code>:.2f</code> for precision, and custom <code>__str__</code>/<code>__repr__</code> for object representation. Use <code>pprint</code> for pretty-printing complex data structures and <code>textwrap.dedent</code> for clean indentation.",
      code: `# Print debugging with f-strings
name = "Alice"
age = 30
price = 49.99

# Basic f-string debugging
print(f"name={name}, age={age}")

# Python 3.8+ f-string = syntax (prints expression + value)
print(f"{name=}, {age=}")

# Format specifiers
print(f"{price=:.2f}")        # 49.99
print(f"{price=:>10.2f}")     # Right-aligned in 10 chars: "     49.99"
print(f"{price=:010.2f}")     # Zero-padded: "000049.99"

# Custom __str__ and __repr__ for debugging
class User:
    def __init__(self, id, name, email):
        self.id = id
        self.name = name
        self.email = email

    def __repr__(self):
        return f"User(id={self.id}, name='{self.name}', email='{self.email}')"

    def __str__(self):
        return f"{self.name} ({self.email})"

user = User(1, "Alice", "alice@example.com")
print(repr(user))  # Calls __repr__
print(user)        # Calls __str__

# Pretty-print complex structures
import pprint
data = {
    "users": [
        {"name": "Alice", "scores": [85, 92, 78]},
        {"name": "Bob", "scores": [73, 88, 91]},
    ],
    "metadata": {"version": 2, "last_updated": "2024-01-15"}
}
pprint.pprint(data, indent=2, width=80)

# Conditional debugging with __debug__
DEBUG = True
if DEBUG:
    print(f"{len(data['users'])=}")

# Using inspect for debug output
import inspect
frame = inspect.currentframe()
print(f"{frame.f_lineno=}, {frame.f_code.co_name=}")

# Print with file and flush for real-time output
print("Debug: processing item", file=__import__('sys').stderr, flush=True)

print("\\nPrint debugging best practices:")
print("1. Use f\"{var=}\" for quick variable inspection")
print("2. Define __repr__ on custom classes")
print("3. Use pprint for nested structures")
print("4. Print to stderr to separate from stdout output")
print("5. Use logging module for production debugging")`
    },

    "Built-in Interactive Debugger (pdb / breakpoint)": {
      exp: "Python's built-in <code>pdb</code> module provides a full interactive debugger. The <code>breakpoint()</code> function (Python 3.7+) drops into the debugger at that line. IPython's <code>ipdb</code> offers tab completion, syntax highlighting, and better UX. Key commands: <code>l</code> (list source), <code>n</code> (next), <code>s</code> (step into), <code>c</code> (continue), <code>p</code> (print expression), <code>pp</code> (pretty-print), <code>w</code> (where/show stack), <code>u</code>/<code>d</code> (up/down stack), <code>h</code> (help), <code>q</code> (quit). Set environment variable <code>PYTHONBREAKPOINT=0</code> to disable all breakpoints.",
      code: `# Built-in Interactive Debugger (pdb / breakpoint)

def calculate_discount(price, category, is_member):
    # breakpoint() drops into pdb here
    base_discount = 0.1 if category == "electronics" else 0.05
    member_discount = 0.15 if is_member else 0.0
    # pdb commands when paused here:
    # (Pdb) l        - List source code around current line
    # (Pdb) p price  - Print variable value
    # (Pdb) pp vars()- Pretty-print all locals
    # (Pdb) w        - Show call stack
    # (Pdb) n        - Execute next line
    # (Pdb) s        - Step into function call
    # (Pdb) c        - Continue execution
    # (Pdb) u        - Move up call stack frame
    total_discount = base_discount + member_discount
    final_price = price * (1 - total_discount)
    return round(final_price, 2)

breakpoint()  # Debugger stops here
result = calculate_discount(100, "electronics", True)
print(f"Result: {result}")

# Post-mortem debugging after an exception
def faulty_division(a, b):
    return a / b

try:
    faulty_division(10, 0)
except ZeroDivisionError:
    import pdb
    pdb.post_mortem()  # Inspect state at the crash point

# Using ipdb (install: pip install ipdb)
# import ipdb; ipdb.set_trace()
# IPython debugger has tab completion and syntax highlighting

# Conditional breakpoint pattern
def process_items(items):
    for i, item in enumerate(items):
        if item.get("value", 0) > 1000:
            # Only break for high-value items
            breakpoint()
        print(f"Processing item {i}: {item}")

process_items([{"value": 100}, {"value": 2000}])

# Debugging utilities
print("\\npdb configuration:")
print("PYTHONBREAKPOINT=0      - Disable all breakpoints")
print("PYTHONBREAKPOINT=pdb.set_trace  - Use pdb explicitly")
print("\\nIf breakpoint() doesn't work:")
print("  Check: PYTHONBREAKPOINT environment variable")
print("  Use: import pdb; pdb.set_trace() as fallback")
print("  Use: import ipdb; ipdb.set_trace() (needs pip install ipdb)")`
    },

    "Exception Handling & Hooking": {
      exp: "Python's exception handling uses <code>try/except/else/finally</code> blocks. The <code>sys.excepthook</code> intercepts uncaught exceptions globally, <code>sys.unraisablehook</code> handles unraisable exceptions (like <code>__del__</code> failures), and <code>threading.excepthook</code> catches thread exceptions. Custom hooks enable structured logging, notification, and graceful degradation. The <code>warnings</code> module intercepts non-fatal warnings as a debugging aid.",
      code: `# Exception Handling & Hooking
import sys
import traceback
import threading

# 1. Basic try/except/else/finally
def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError as e:
        print(f"Caught: {e}")
        return float('inf')
    except TypeError as e:
        print(f"Type error: {e}")
        return None
    else:
        print(f"Division succeeded: {result}")
        return result
    finally:
        print("Cleanup: always runs")

print(safe_divide(10, 2))
print(safe_divide(10, 0))

# 2. Global exception hook
def global_exception_handler(exc_type, exc_value, exc_traceback):
    print("=== GLOBAL EXCEPTION ===")
    print(f"Type: {exc_type.__name__}")
    print(f"Value: {exc_value}")
    print("Traceback:")
    traceback.print_tb(exc_traceback)
    # Log to file
    with open("errors.log", "a") as f:
        f.write(f"{exc_type.__name__}: {exc_value}\\n")
        traceback.print_tb(exc_traceback, file=f)

sys.excepthook = global_exception_handler

# Test: raise uncaught exception
# raise RuntimeError("Test uncaught exception")

# 3. Unraisable hook (for __del__ failures)
def unraisable_hook(unraisable):
    print(f"Unraisable error: {unraisable.exc_type.__name__}: {unraisable.exc_value}")
    print(f"  Object: {unraisable.object}")

sys.unraisablehook = unraisable_hook

class Broken:
    def __del__(self):
        raise RuntimeError("Del method failed")

# b = Broken()
# del b  # Triggers unraisablehook

# 4. Thread exception hook
def thread_exception_handler(args):
    print(f"Thread exception: {args.exc_type.__name__}: {args.exc_value}")
    print(f"  Thread: {args.thread.name}")

threading.excepthook = thread_exception_handler

# 5. Warning interception
import warnings
warnings.filterwarnings("error")  # Turn warnings into errors
try:
    warnings.warn("This becomes an error", DeprecationWarning)
except DeprecationWarning as e:
    print(f"Warning caught as error: {e}")

print("\\nException hook debugging:")
print("1. sys.excepthook - global uncaught exceptions")
print("2. sys.unraisablehook - __del__ and finalizer errors")
print("3. threading.excepthook - exceptions in threads")
print("4. warnings.filterwarnings - intercept warnings")
print("5. Log everything to file for production debugging")`
    },

    "Logging Module Configuration": {
      exp: "Python's <code>logging</code> module provides hierarchical loggers, multiple handlers (Stream, File, Rotating, Syslog, SMTP), formatters, and configurable levels (DEBUG, INFO, WARNING, ERROR, CRITICAL). Debug by inspecting logger hierarchy, checking propagation, verifying handler attachments, and using <code>logging_tree</code> for visualization. Configure via <code>basicConfig()</code>, dictConfig, or fileConfig for production setups.",
      code: `# Logging Module Configuration
import logging
import logging.handlers
import sys

# 1. Basic configuration
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)

# 2. Logger hierarchy - child loggers propagate to parents
parent_logger = logging.getLogger("app")
child_logger = logging.getLogger("app.service")
deep_logger = logging.getLogger("app.service.db")

parent_logger.setLevel(logging.WARNING)
child_logger.setLevel(logging.DEBUG)
deep_logger.setLevel(logging.INFO)

parent_logger.debug("Parent debug - won't show")       # Filtered by level
child_logger.debug("Child debug - shows")               # Shows via child
deep_logger.info("Deep info - shows")                   # Shows via deep

# 3. Multiple handlers with different levels/formats
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(logging.Formatter(
    "%(levelname)s: %(message)s"
))

file_handler = logging.handlers.RotatingFileHandler(
    "app.log", maxBytes=1024*1024, backupCount=3
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter(
    "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
))

error_handler = logging.handlers.SMTPHandler(
    mailhost=("smtp.example.com", 587),
    fromaddr="app@example.com",
    toaddrs=["dev@example.com"],
    subject="App Error Alert",
    credentials=("user", "pass"),
    secure=(),
)
error_handler.setLevel(logging.ERROR)

root_logger = logging.getLogger()
root_logger.addHandler(console_handler)
root_logger.addHandler(file_handler)
root_logger.addHandler(error_handler)

# 4. Logger isolation debugging
print("\\n=== Logger Debug Info ===")
print(f"Root handlers: {logging.getLogger().handlers}")
print(f"Child effective level: {child_logger.getEffectiveLevel()}")
print(f"Child propagate: {child_logger.propagate}")

# Check if a handler will process a record
record = child_logger.makeRecord(
    child_logger.name, logging.WARNING,
    __file__, 42, "Test message", (), None
)
for handler in child_logger.handlers:
    print(f"Handler {handler}: level={handler.level}")
    print(f"  Would handle: {handler.filter(record)}")

# 5. Third-party logger configuration
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("requests").setLevel(logging.WARNING)

# Diagnostic tools:
# pip install logging_tree
# import logging_tree; print(logging_tree.format.build_description())

# Debug: temporarily increase logging
logging.getLogger().setLevel(logging.DEBUG)
logging.debug("Debug mode active")

print("\\nLogging debugging commands:")
print("  logging_tree - Print logger hierarchy")
print("  getEffectiveLevel() - Resolved level")
print("  logger.handlers - List attached handlers")
print("  logger.propagate - Parent forwarding flag")`
    },

    "Variable Scope Inspection": {
      exp: "Python's <code>locals()</code>, <code>globals()</code>, <code>dir()</code>, and <code>vars()</code> provide runtime access to variable scopes. The <code>inspect</code> module gives deeper introspection: stack frames (<code>inspect.stack()</code>), source code (<code>inspect.getsource()</code>), and signature (<code>inspect.signature()</code>). Use <code>gc.get_referrers()</code> to find what holds a reference. In pdb, <code>p locals()</code> shows all local variables and <code>p globals()</code> shows globals.",
      code: `# Variable Scope Inspection
import sys
import inspect
import gc

# 1. locals() and globals()
global_var = "I am global"

def outer_function(x):
    outer_var = "outer"
    y = 42

    def inner_function(z):
        inner_var = "inner"
        # Inspect all scopes from deepest frame
        print("=== Locals (inner) ===")
        for k, v in locals().items():
            print(f"  {k} = {v!r}")

        print("\\n=== Globals ===")
        for k in list(globals().keys())[-5:]:  # Last 5 globals
            print(f"  {k} = {globals()[k]!r}")

        return inner_var

    # dir() shows all names accessible in current scope
    print("\\n=== dir() in outer ===")
    print([n for n in dir() if not n.startswith("_")])

    # vars() returns __dict__ of an object
    print("\\n=== vars(sys) sample ===")
    sys_vars = vars(sys)
    print(list(sys_vars.keys())[:5])

    return inner_function

result = outer_function(10)("test")

# 2. inspect module - stack frame inspection
def deep_stack():
    frame = inspect.currentframe()
    print("\\n=== Stack Frames ===")
    for i, frame_info in enumerate(inspect.stack()):
        print(f"  [{i}] {frame_info.function} at {frame_info.filename}:{frame_info.lineno}")

def middle():
    deep_stack()

def top_level():
    middle()

top_level()

# 3. Get source code of a function
def my_function(a, b):
    """Add two numbers."""
    return a + b

print("\\n=== Source Code ===")
print(inspect.getsource(my_function))
print("\\n=== Signature ===")
print(inspect.signature(my_function))

# 4. Find who holds a reference
class Demo:
    pass

obj = Demo()
container = [obj, obj]
refs = gc.get_referrers(obj)
print(f"\\n=== References to obj: {len(refs)} ===")
for ref in refs:
    print(f"  {type(ref).__name__}: {ref!r:.80}")

# 5. Debug scope leakage
leaked = "I should not be global"
# Check: did this end up in globals?
if "leaked" in globals():
    print("\\nWARNING: 'leaked' is in global scope!")

print("\\nScope inspection commands:")
print("  locals()  - Local variables in current scope")
print("  globals() - Global namespace dictionary")
print("  dir()     - Names accessible in current scope")
print("  vars(x)   - __dict__ of object x")
print("  inspect.currentframe() - Current stack frame")
print("  gc.get_referrers(x)    - Find reference holders")`
    },

    "Memory Profiling Tools": {
      exp: "Python memory profiling tools track allocation and detect leaks. <code>tracemalloc</code> (built-in, Python 3.4+) traces memory allocations with stack traces. <code>memory_profiler</code> provides line-by-line memory usage. <code>objgraph</code> visualizes object references to find leaks. For production, use <code>gc.get_objects()</code> to count instances and <code>sys.getsizeof()</code> for object sizes. Always combine with heap snapshots for effective leak detection.",
      code: `# Memory Profiling Tools
import sys
import gc

# 1. sys.getsizeof() - shallow object size
print("=== Shallow Sizes ===")
print(f"int: {sys.getsizeof(42)} bytes")
print(f"list (empty): {sys.getsizeof([])} bytes")
print(f"list (10 items): {sys.getsizeof([1]*10)} bytes")
print(f"dict (empty): {sys.getsizeof({})} bytes")
print(f"str: {sys.getsizeof('hello world')} bytes")

# 2. tracemalloc - trace memory allocations
import tracemalloc

tracemalloc.start()

# Allocate some memory
data = [bytearray(1000) for _ in range(100)]
more_data = {str(i): i for i in range(1000)}

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')

print("\\n=== Top 10 Memory Allocations (tracemalloc) ===")
for i, stat in enumerate(top_stats[:10], 1):
    print(f"  #{i}: {stat.size / 1024:.1f} KiB at {stat.count} allocations")
    for frame in stat.traceback[:2]:
        print(f"    {frame.filename}:{frame.lineno}")

current, peak = tracemalloc.get_traced_memory()
print(f"\\nCurrent: {current / 1024:.1f} KiB, Peak: {peak / 1024:.1f} KiB")

# 3. gc module - garbage collector inspection
print("\\n=== GC Object Counts (Top Types) ===")
type_counts = {}
for obj in gc.get_objects():
    t = type(obj).__name__
    type_counts[t] = type_counts.get(t, 0) + 1

sorted_types = sorted(type_counts.items(), key=lambda x: -x[1])
for t, count in sorted_types[:10]:
    print(f"  {t}: {count}")

# 4. Find cyclic garbage
gc.set_debug(gc.DEBUG_SAVEALL)
gc.collect()
if gc.garbage:
    print(f"\\n=== {len(gc.garbage)} cyclic garbage objects ===")
    for obj in gc.garbage[:5]:
        print(f"  {type(obj).__name__}: {obj!r:.60}")

# 5. Object reference graph
# pip install objgraph
# import objgraph
# objgraph.show_refs([my_object], filename='refs.png')
# objgraph.show_backrefs(my_object, max_depth=5)
# objgraph.by_type('MyClass')  # Find all instances of a class

# 6. memory_profiler usage (run with: python -m memory_profiler script.py)
# @profile decorator shows per-line memory usage
# from memory_profiler import profile
# @profile
# def my_func():
#     a = [1] * 100000
#     b = [2] * 100000
#     return a, b

print("\\nMemory profiling commands:")
print("  python -m memory_profiler script.py")
print("  tracemalloc.start() / take_snapshot()")
print("  gc.get_objects() - all tracked objects")
print("  sys.getsizeof(x) - object shallow size")
print("  objgraph.show_refs(x) - visual ref graph")`
    },

    "C-Extensions & Native Code Debugging": {
      exp: "Debugging Python C extensions (Cython, CFFI, pybind11) requires crossing the Python/C boundary. Use <code>gdb</code> or <code>lldb</code> with Python debugging extensions (<code>python3-dbg</code> package on Debian, <code>python-dbg</code> on Fedora). Build extensions with <code>-g -O0</code> flags for debug symbols. Set <code>PYTHONDUMPREFS=1</code> for reference count debugging. Use <code>faulthandler</code> to dump C tracebacks on segfaults. GDB has Python scripting for pretty-printing Python objects (<code>py-bt</code>, <code>py-list</code>, <code>py-locals</code> commands).",
      code: `# C-Extensions & Native Code Debugging

# 1. Build extension with debug symbols
# setup.py
from setuptools import setup, Extension
ext = Extension(
    "my_module",
    sources=["src/my_module.c"],
    extra_compile_args=["-g", "-O0"],   # Debug symbols, no optimizations
    extra_link_args=["-g"],
)

# 2. GDB with Python support
# Install: apt-get install python3-dbg gdb python3-gdb
# Run: gdb --args python3 script.py
# (gdb) run
# (gdb) bt               - C backtrace
# (gdb) py-bt            - Python backtrace (gdb python extension)
# (gdb) py-list          - Show current Python line
# (gdb) py-locals        - Show Python local variables
# (gdb) py-print x       - Print Python variable x
# (gdb) frame 3          - Switch to frame 3
# (gdb) info threads     - List all threads
# (gdb) thread 2         - Switch to thread 2

# 3. LLDB with Python support (macOS)
# lldb -- python3 script.py
# (lldb) run
# (lldb) bt
# (lldb) frame variable

# 4. Python faulthandler - dump C tracebacks on crash
import faulthandler
import signal

faulthandler.enable()  # Dump tracebacks on segfault
faulthandler.register(signal.SIGUSR1)  # Dump on signal

# 5. Reference count debugging
import sys

# PYTHONDUMPREFS=1 environment variable prints all refs on exit
# Can also check specific objects:
x = []
print(f"Reference count of x: {sys.getrefcount(x) - 1}")

# 6. CFFI/pybind11 debugging
# For pybind11: add -DCMAKE_BUILD_TYPE=Debug
# For CFFI: set_source("cffi_module", source, extra_compile_args=["-g", "-O0"])

# 7. Valgrind for memory issues in C extensions
# valgrind --tool=memcheck --suppressions=python.supp python3 script.py

# Helper: check if extension was built with debug
def check_debug_build(module_name):
    try:
        mod = __import__(module_name)
        if hasattr(mod, "__file__"):
            import subprocess
            result = subprocess.run(
                ["objdump", "-h", mod.__file__],
                capture_output=True, text=True
            )
            has_debug = ".debug_info" in result.stdout or ".debug_line" in result.stdout
            print(f"Module {module_name}: {'DEBUG' if has_debug else 'RELEASE'} build")
    except Exception as e:
        print(f"Could not check: {e}")

print("\\nC extension debugging commands:")
print("  gdb --args python3 script.py - GDB debugging")
print("  PYTHONDUMPREFS=1           - Dump refs on exit")
print("  faulthandler.enable()      - Traceback on crash")
print("  valgrind python3 script.py  - Memory checking")
print("  Build with -g -O0 for debug symbols")`
    },

    "Garbage Collector Inspection": {
      exp: "Python's <code>gc</code> module provides full control over the garbage collector. Track cyclic references, inspect unreachable objects, and monitor collection frequency. Generational GC (generations 0, 1, 2) collects young objects more frequently. Use <code>gc.set_debug()</code> flags to log collection details. <code>gc.DEBUG_SAVEALL</code> preserves unreachable objects in <code>gc.garbage</code> for inspection. The <code>gc.get_stats()</code> method provides per-generation collection counters.",
      code: `# Garbage Collector Inspection
import gc
import sys

# 1. GC status and configuration
print("=== GC Configuration ===")
print(f"Enabled: {gc.isenabled()}")
print(f"Generation thresholds: {gc.get_threshold()}")  # (700, 10, 10)
print(f"Object count: {len(gc.get_objects())}")
print(f"Garbage count: {len(gc.garbage)}")

# 2. Create cyclic reference (leak)
class Node:
    def __init__(self, name):
        self.name = name
        self.next = None

    def __repr__(self):
        return f"Node({self.name})"

# Create a cycle
a = Node("A")
b = Node("B")
a.next = b
b.next = a  # Cycle!

# Delete references - cycle remains
del a, b

# 3. Manual collection with debugging
gc.set_debug(gc.DEBUG_SAVEALL | gc.DEBUG_STATS | gc.DEBUG_LEAK)
collected = gc.collect()
print(f"\\n=== Collection Results ===")
print(f"Collected: {collected} objects")
print(f"Unreachable (in gc.garbage): {len(gc.garbage)}")

# Inspect garbage
for i, obj in enumerate(gc.garbage[:5]):
    print(f"  Garbage #{i}: {type(obj).__name__}: {obj!r}")

gc.set_debug(0)  # Reset debug flags

# 4. Per-generation stats
print("\\n=== Generation Stats ===")
for i, gen_stats in enumerate(gc.get_stats()):
    print(f" Generation {i}:")
    print(f"   Collections: {gen_stats['collections']}")
    print(f"   Collected: {gen_stats['collected']}")
    print(f"   Uncollectable: {gen_stats['uncollectable']}")

# 5. Find objects by type
print("\\n=== Instance Finder ===")
class MyClass:
    def __init__(self, value):
        self.value = value

instances = [MyClass(i) for i in range(5)]

all_my_instances = [obj for obj in gc.get_objects() if isinstance(obj, MyClass)]
print(f"Found {len(all_my_instances)} MyClass instances")

# 6. Reference tracking
obj = [1, 2, 3]
print(f"\\n=== Reference Tracking for {id(obj)} ===")
print(f"Referrers: {len(gc.get_referrers(obj))}")
for ref in gc.get_referrers(obj):
    print(f"  {type(ref).__name__}: {ref!r:.60}")

# 7. GC callbacks (Python 3.3+)
def gc_callback(phase, info):
    if phase == "start":
        print(f"GC started: gen={info['generation']}")
    elif phase == "stop":
        print(f"GC finished: collected={info['collected']}")

gc.callbacks.append(gc_callback)
# Trigger a collection to see the callback
gc.collect(0)

# 8. Track specific object
gc.set_debug(gc.DEBUG_SAVEALL)
tracked = []
for i in range(100):
    tracked.append({"index": i, "data": [0] * 100})

# del tracked  # Would create collectable garbage

print("\\nGC debugging tips:")
print("  gc.set_debug(gc.DEBUG_LEAK) - Find leak sources")
print("  gc.get_referrers(x) - Find what holds references")
print("  gc.get_referents(x) - Find what x references")
print("  gc.DEBUG_SAVEALL - Preserve unreachable objects")
print("  gc.callbacks - Monitor collection events")
print("  PYTHONGC=0 - Disable GC (use with caution)")`
    },

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

    "Linter Rule Exception Debugging": {
      exp: "TypeScript-aware ESLint rules catch type errors, unused variables, and common pitfalls. Debugging linter issues requires understanding parser options (parser, parserOptions.project for typed linting), rule configuration, and using diagnostic commands like <code>eslint --debug</code> and <code>--print-config</code>. Common issues: parser project resolution failures, incompatible rule configurations between TS and JS, and performance bottlenecks from typed linting. Use <code>parserOptions.project</code> for type-aware rules like <code>@typescript-eslint/no-floating-promises</code>, <code>@typescript-eslint/strict-boolean-expressions</code>, and <code>@typescript-eslint/no-unnecessary-condition</code>.",
      code: `// Linter Rule Exception Debugging
// ESLint configuration for TypeScript
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json",        // Required for type-aware rules
    "tsconfigRootDir": "."
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error"
  }
}

// Debug commands:
// npx eslint --debug src/               - Show verbose debugging output
// npx eslint --print-config src/file.ts  - Print resolved config
// npx eslint --rulesdir src/file.ts      - Show which rules apply
// npx eslint --format unix src/          - Unix-style format

// Diagnose parser issues:
// npx tsc --noEmit --generateTrace trace
// Check: project resolution, tsconfig paths, module resolution

// Performance debugging:
// TIMING=1 npx eslint src/              - Show per-rule timing
// npx eslint --cache src/               - Cache results

// Common linter error diagnostics:
// "Parsing error: Cannot find module 'typescript'" -> Install typescript
// "The file must be included in at least one of the projects provided"
//   -> Ensure file is in tsconfig.json include array
// "ESLint couldn't determine the tsconfig" -> Check parserOptions.project

// Suppression strategies:
// // eslint-disable-next-line @typescript-eslint/no-floating-promises
// // @ts-expect-error - for expected type errors
// /* eslint-disable @typescript-eslint/no-unused-vars */

console.log("Linter debugging commands:");
console.log("  eslint --debug         - Verbose logs");
console.log("  eslint --print-config  - Resolved rules");
console.log("  TIMING=1 eslint       - Per-rule timing");
console.log("  eslint --cache         - Faster re-runs");`
    },

    "TS-Aware Test Runner Debugging": {
      exp: "Modern test runners include TypeScript support for debugging. Vitest runs tests with Vite's transform pipeline and supports <code>--inspect</code> for breakpoints. Jest with <code>ts-jest</code> uses source maps for .ts debugging. Playwright and Cypress enable debugging TypeScript end-to-end tests by configuring <code>tsconfig</code> paths and using source maps. Debug strategies: set breakpoints directly in <code>.test.ts</code> files, use the <code>debugger</code> statement, attach a Node.js inspector, and use watch mode with <code>--repl</code> for interactive debugging.",
      code: `// TS-Aware Test Runner Debugging

// Vitest - fastest TS test runner
// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    // TypeScript is handled automatically by Vite
  },
});

// Debug Vitest with inspector:
// node --inspect-brk node_modules/.bin/vitest --run
// Or: npx vitest --inspect-brk --pool forks --poolOptions.forks.singleFork

// Jest with ts-jest
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  // Debug: npx jest --inspect-brk --no-cache
};

// Playwright TypeScript debugging
// playwright.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { trace: "on-first-retry" },
});
// Debug: npx playwright test --debug
// Opens Playwright Inspector with pause on each test step

// Cypress with TypeScript
// cypress.config.ts
import { defineConfig } from "cypress";
export default defineConfig({
  e2e: { supportFile: "cypress/support/e2e.ts" },
});
// Debug: npx cypress open --e2e --browser chrome
// Use cy.pause() for step-by-step debugging

// Example test with breakpoint debugging
import { describe, it, expect } from "vitest";

function calculateDiscount(price: number, code?: string): number {
  let discount = 0;
  if (code === "SAVE10") discount = 0.1;
  if (code === "SAVE20") discount = 0.2;
  // SET BREAKPOINT HERE - inspect price and discount
  return price * (1 - discount);
}

describe("calculateDiscount", () => {
  it("applies correct discount", () => {
    expect(calculateDiscount(100, "SAVE10")).toBe(90);
    expect(calculateDiscount(100, "SAVE20")).toBe(80);
    expect(calculateDiscount(100)).toBe(100);
  });
});

// Debugging commands cheat-sheet:
console.log("Vitest:    npx vitest --inspect-brk");
console.log("Jest:      npx jest --inspect-brk --no-cache");
console.log("Playwright: npx playwright test --debug");
console.log("Cypress:   npx cypress open --e2e");
console.log("All support breakpoints in .ts and .test.ts files");`
    },

    "Decorators & Metadata Reflection Debugging": {
      exp: "TypeScript decorators (enabled via <code>experimentalDecorators</code>) wrap classes, methods, properties, and parameters. <code>emitDecoratorMetadata</code> generates type metadata via the <code>reflect-metadata</code> shim. Debugging decorators involves understanding execution order: parameter decorators first, then method/property/accessor, then class. Metadata reflection stores design-time types accessible via <code>Reflect.getMetadata</code>. Common issues: incorrect decorator application order, missing <code>reflect-metadata</code> import, and type resolution failures in emitted metadata. Use source maps to debug transpiled decorator code.",
      code: `// Decorators & Metadata Reflection Debugging
// tsconfig.json - enable decorators
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "sourceMap": true
  }
}

// reflect-metadata is required for emitDecoratorMetadata
import "reflect-metadata";

// Debugging: decorator execution order
function ClassDecorator(): ClassDecorator {
  console.log("1. Class decorator factory");
  return (target) => {
    console.log("2. Class decorator applied");
  };
}

function MethodDecorator(): MethodDecorator {
  console.log("3. Method decorator factory");
  return (target, key, descriptor) => {
    console.log("4. Method decorator applied to:", key);
    const original = descriptor.value!;
    descriptor.value = function (...args: any[]) {
      console.log("5. Method intercepted:", key);
      return original.apply(this, args);
    };
  };
}

function ParamDecorator(target: Object, key: string | symbol, index: number) {
  console.log("6. Parameter decorator:", key, "index:", index);
}

@ClassDecorator()
class Service {
  @MethodDecorator()
  process(@ParamDecorator data: string): string {
    console.log("7. Original method executing");
    return \`Processed: \${data}\`;
  }
}

// Metadata reflection
const metadataKeys = Reflect.getMetadataKeys(Service.prototype, "process");
console.log("Metadata keys:", metadataKeys);

// Design-time types from emitDecoratorMetadata
const designType = Reflect.getMetadata("design:type", Service.prototype, "process");
const paramTypes = Reflect.getMetadata("design:paramtypes", Service.prototype, "process");
const returnType = Reflect.getMetadata("design:returntype", Service.prototype, "process");
console.log("Design type:", designType?.name);
console.log("Param types:", paramTypes?.map((t: any) => t.name));
console.log("Return type:", returnType?.name);

// Custom metadata
Reflect.defineMetadata("route", "/api/data", Service.prototype, "process");
const route = Reflect.getMetadata("route", Service.prototype, "process");
console.log("Custom metadata:", route);

const service = new Service();
service.process("test");

// Debugging decorators:
console.log("\\nDecorator debugging tips:");
console.log("1. Check reflect-metadata is imported first");
console.log("2. Debug with source maps to see decorated code");
console.log("3. Execution order: param -> method/property -> class");
console.log("4. SET BREAKPOINT inside decorator factory function");
console.log("5. Use Reflect.getMetadataKeys to inspect all metadata");`
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
    },

    "Built-in Printing & Formatter Verbs": {
      exp: "Go's <code>fmt.Printf</code> formatting verbs are essential for debugging. <code>%+v</code> prints structs with field names, <code>%#v</code> prints Go-syntax representation (reusable in code), <code>%T</code> prints type, <code>%x</code>/<code>%X</code> for hex dumps, and <code>%q</code> for safe quoted strings. The <code>fmt</code> package also provides <code>fmt.Println</code> with spaces and <code>fmt.Sprintf</code> for string building. For complex debugging, use <code>spew</code> or <code>pretty</code> packages.",
      code: `// Built-in Printing & Formatter Verbs
package main

import "fmt"

type Config struct {
    Host     string
    Port     int
    Timeout  float64
    Enabled  bool
    Tags     []string
}

func main() {
    cfg := Config{
        Host:    "localhost",
        Port:    8080,
        Timeout: 30.5,
        Enabled: true,
        Tags:    []string{"production", "us-east"},
    }

    // Basic printing
    fmt.Println("=== Print Debugging ===")
    fmt.Print("No newline")
    fmt.Printf("Formatted: %s:%d\\n", cfg.Host, cfg.Port)

    // Verbose verbs for struct debugging
    fmt.Println("\\n=== %+v (struct with field names) ===")
    fmt.Printf("  %+v\\n", cfg)

    // Go-syntax representation
    fmt.Println("\\n=== %#v (Go syntax) ===")
    fmt.Printf("  %#v\\n", cfg)

    // Type inspection
    fmt.Println("\\n=== %T (type) ===")
    fmt.Printf("  cfg: %T\\n", cfg)
    fmt.Printf("  Tags: %T\\n", cfg.Tags)
    fmt.Printf("  Port: %T\\n", cfg.Port)

    // Pointer representation
    x := 42
    p := &x
    fmt.Println("\\n=== Pointer verbs ===")
    fmt.Printf("  value: %v, type: %T, address: %p\\n", p, p, p)

    // String and byte formatting
    data := []byte("hello\\x00world")
    fmt.Println("\\n=== String/byte verbs ===")
    fmt.Printf("  %%s: %s\\n", data)
    fmt.Printf("  %%q: %q\\n", data)     // Safe quoted
    fmt.Printf("  %%x: %x\\n", data)     // Hex
    fmt.Printf("  %%X: %X\\n", data)     // Upper hex
    fmt.Printf("  %%d: %d\\n", data)     // Decimal bytes

    // Width and precision
    pi := 3.1415926535
    fmt.Println("\\n=== Width/Precision ===")
    fmt.Printf("  %%f:    %f\\n", pi)
    fmt.Printf("  %%.2f:  %.2f\\n", pi)
    fmt.Printf("  %%10.2f: %10.2f\\n", pi)
    fmt.Printf("  %%-10.2f: %-10.2f\\n", pi)

    // Boolean and special
    fmt.Println("\\n=== Bool and special ===")
    fmt.Printf("  %%t: %t\\n", cfg.Enabled)   // bool
    fmt.Printf("  %%p: %p\\n", &cfg)         // pointer

    // spew deep pretty-print (install: go get github.com/davecgh/go-spew/spew)
    // spew.Dump(cfg)

    // pretty package (go get github.com/kr/pretty)
    // fmt.Printf("%# v\\n", pretty.Formatter(cfg))

    fmt.Println("\\nKey debugging verbs:")
    fmt.Println("  %+v - Struct with field names")
    fmt.Println("  %#v - Go-syntax representation")
    fmt.Println("  %T  - Type of value")
    fmt.Println("  %q  - Safe quoted string")
    fmt.Println("  %x  - Hex dump")
    fmt.Println("  %p  - Pointer address")
}`
    },

    "GDB for Go Debugging": {
      exp: "GDB can debug Go programs as a fallback when Delve is unavailable (older systems, ARM, limited environments). Build Go programs with <code>-gcflags='all=-N -l'</code> to disable optimization and inlining. GDB commands like <code>break</code>, <code>next</code>, <code>step</code>, <code>print</code>, and <code>backtrace</code> work but with limitations: Go runtime internals are visible, goroutines appear as threads, and variable names may be mangled. GDB 7.1+ includes Go support with <code>goroutine</code> commands and pretty-printers for slices and maps. For full debugging experience, prefer Delve.",
      code: `// GDB for Go Debugging
// Build with no optimization for GDB compatibility:
// go build -gcflags='all=-N -l' -o app main.go

// Then debug with:
// gdb ./app
// (gdb) break main.main
// (gdb) run
// (gdb) next
// (gdb) print variable
// (gdb) info goroutines
// (gdb) goroutine 1 backtrace
// (gdb) goroutine 1 info locals

package main

import "fmt"

type User struct {
    ID    int
    Name  string
    Email string
}

func processUser(u User) string {
    // GDB: break processUser
    // GDB: print u
    // GDB: print u.Name
    return fmt.Sprintf("Processed: %s (%d)", u.Name, u.ID)
}

func main() {
    // GDB: break main.main
    user := User{ID: 1, Name: "Alice", Email: "alice@example.com"}
    result := processUser(user)
    fmt.Println(result)

    // Debugging GDB vs Delve:
    fmt.Println("\\nGDB limitations with Go:")
    fmt.Println("1. Optimized variables may be unavailable")
    fmt.Println("2. Goroutines appear as OS threads")
    fmt.Println("3. Variable names may be mangled (e.g., p->Name != p.Name)")
    fmt.Println("4. No native channel/goroutine inspection")
    fmt.Println("5. Must build with -gcflags='all=-N -l'")
    fmt.Println("\\nUse Delve (dlv) when possible for better Go debugging")
}`
    },

    "Conditional Breakpoints & Watchpoints in Delve": {
      exp: "Delve supports conditional breakpoints that pause only when a condition is true, and watchpoints that pause when a variable's value changes. Use <code>condition</code> to set breakpoint conditions, <code>trace</code> for non-breaking logpoints, and <code>watch</code> for variable change detection. Delve also supports <code>breakpoint set</code> with predicates and <code>on</code> for executing commands on breakpoint hits.",
      code: `// Conditional Breakpoints & Watchpoints in Delve
package main

import (
    "fmt"
    "time"
)

type Transaction struct {
    ID     int
    Amount float64
    Status string
}

func processTransaction(tx Transaction) {
    // Conditional breakpoint: break main.go:XX if tx.Amount > 1000
    // dlv> condition 1 tx.Amount > 1000 && tx.Status == "failed"
    // dlv> break processTransaction
    // dlv> condition 1 tx.Status == "failed" && tx.Amount > 500

    fmt.Printf("Processing tx %d: $%.2f [%s]\\n", tx.ID, tx.Amount, tx.Status)

    // Watchpoint: break when variable changes
    var statusChanged string
    if tx.Amount > 0 {
        statusChanged = "validated"
    }
    _ = statusChanged
    // dlv> watch statusChanged  (pauses when statusChanged changes)
}

func main() {
    transactions := []Transaction{
        {ID: 1, Amount: 50.00, Status: "completed"},
        {ID: 2, Amount: 1500.00, Status: "pending"},
        {ID: 3, Amount: 200.00, Status: "failed"},
        {ID: 4, Amount: 5000.00, Status: "failed"},
    }

    for _, tx := range transactions {
        processTransaction(tx)
    }

    // Logpoints (trace) - log without pausing:
    // dlv> trace processTransaction "Processing: {tx.ID}, {tx.Amount}"

    // On hit commands:
    // dlv> break processTransaction
    // dlv> on 1 print tx.ID
    // dlv> on 1 print tx.Amount

    fmt.Println("\\nDelve conditional debugging commands:")
    fmt.Println("  dlv> condition <bp#> <expression>")
    fmt.Println("  dlv> trace <func> <format-string>")
    fmt.Println("  dlv> watch <variable>")
    fmt.Println("  dlv> on <bp#> <command>")
    fmt.Println("Example: condition 1 tx.Amount > 1000 && tx.Status == \"failed\"")
}`

    },

    "Variable, Expression & Pointer Evaluation in Delve": {
      exp: "Delve provides rich expression evaluation at breakpoints. Use <code>print</code> for expressions, <code>whatis</code> for type information, <code>locals</code> for all local variables, <code>vars</code> for package variables, and <code>regs</code> for CPU registers. Delve supports pointer dereferencing, array/slice indexing, struct field access, type conversions, and calling functions. The <code>expr</code> command evaluates arbitrary Go expressions within the debugged program's context.",
      code: `// Variable, Expression & Pointer Evaluation in Delve
package main

import (
    "fmt"
    "unsafe"
)

type Employee struct {
    ID     int
    Name   string
    Salary float64
    Skills []string
    Meta   map[string]interface{}
}

func calculateBonus(emp *Employee, performance float64) float64 {
    // SET BREAKPOINT here: break main.go:XX
    // dlv> print emp            - Show pointer
    // dlv> print *emp           - Dereference pointer
    // dlv> print emp.Name       - Struct field access
    // dlv> print emp.Skills[0]  - Slice indexing
    // dlv> print len(emp.Skills) - Built-in call
    // dlv> print emp.Salary * performance  - Expression eval

    baseBonus := emp.Salary * 0.1
    perfBonus := emp.Salary * (performance * 0.2)
    totalBonus := baseBonus + perfBonus
    return totalBonus
}

func main() {
    emp := &Employee{
        ID:     101,
        Name:   "Alice Smith",
        Salary: 85000.00,
        Skills: []string{"Go", "Python", "Kubernetes"},
        Meta: map[string]interface{}{
            "department": "Engineering",
            "level":     "Senior",
        },
    }

    // Expression evaluation examples (in delve):
    // dlv> print emp.Salary / 12          - Monthly salary
    // dlv> print emp.Meta["department"]   - Map access
    // dlv> print unsafe.Sizeof(*emp)      - Size calculation
    // dlv> print fmt.Sprintf("Name: %s", emp.Name)  - Function call
    // dlv> whatis emp                     - Type information
    // dlv> whatis emp.Salary              - Field type
    // dlv> locals                         - All locals
    // dlv> vars main                      - Package vars
    // dlv> regs                           - CPU registers

    bonus := calculateBonus(emp, 1.5)
    fmt.Printf("Bonus: $%.2f\\n", bonus)

    // Type conversions:
    // dlv> print float64(emp.ID)
    // dlv> print string([]byte{72, 105})

    fmt.Println("\\nExpression evaluation commands:")
    fmt.Println("  dlv> print <expression>   - Evaluate expression")
    fmt.Println("  dlv> whatis <variable>    - Show type")
    fmt.Println("  dlv> locals               - All local vars")
    fmt.Println("  dlv> vars <pkg>           - Package variables")
    fmt.Println("  dlv> regs                 - CPU registers")
    fmt.Println("  dlv> call <func>(<args>)  - Call function")
}`
    },

    "Block & Mutex Contention Profiling": {
      exp: "Go's <code>runtime.SetBlockProfileRate()</code> and <code>runtime.SetMutexProfileFraction()</code> enable profiling of blocking events and mutex contention. Block profiling captures goroutine blocking on channels, mutexes, and network operations. Mutex profiling captures contended mutex acquisitions. View profiles via <code>net/http/pprof</code> endpoints or <code>go tool pprof</code>. Use <code>pprof -http=:8080</code> for visual flame graphs of contention. Contention profiling is essential for debugging concurrency bottlenecks and identifying hot locks in concurrent Go programs.",
      code: `// Block & Mutex Contention Profiling
package main

import (
    "fmt"
    "net/http"
    _ "net/http/pprof"
    "os"
    "runtime"
    "runtime/pprof"
    "sync"
    "time"
)

type SafeCache struct {
    mu    sync.Mutex
    items map[string]string
}

func (c *SafeCache) Get(key string) string {
    c.mu.Lock()
    defer c.mu.Unlock()
    // Simulate slow operation
    time.Sleep(time.Millisecond)
    return c.items[key]
}

func (c *SafeCache) Set(key, value string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    time.Sleep(time.Millisecond)
    c.items[key] = value
}

func main() {
    // Enable block profiling (rate = 1 means every blocking event)
    runtime.SetBlockProfileRate(1)

    // Enable mutex profiling (rate = 1 means every mutex event)
    runtime.SetMutexProfileFraction(1)

    cache := &SafeCache{items: make(map[string]string)}
    var wg sync.WaitGroup

    // Simulate contention
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for j := 0; j < 50; j++ {
                key := fmt.Sprintf("key-%d", j)
                if j%2 == 0 {
                    cache.Set(key, fmt.Sprintf("value-%d-%d", id, j))
                } else {
                    _ = cache.Get(key)
                }
            }
        }(i)
    }

    wg.Wait()

    // Save block profile
    f, _ := os.Create("block.pprof")
    pprof.Lookup("block").WriteTo(f, 0)
    f.Close()

    // Save mutex profile
    f, _ = os.Create("mutex.pprof")
    pprof.Lookup("mutex").WriteTo(f, 0)
    f.Close()

    // Start HTTP server for live profiling
    go func() {
        fmt.Println("Profiling at http://localhost:6060/debug/pprof/")
        http.ListenAndServe("localhost:6060", nil)
    }()

    fmt.Println("Profiles saved:")
    fmt.Println("  block.pprof - Blocking events")
    fmt.Println("  mutex.pprof - Mutex contention")

    // Analyze with:
    // go tool pprof -http=:8080 block.pprof
    // go tool pprof -http=:8080 mutex.pprof

    // In pprof interactive mode:
    // (pprof) top10
    // (pprof) list <function>
    // (pprof) web

    fmt.Println("\\nAnalysis commands:")
    fmt.Println("  go tool pprof -http=:8080 mutex.pprof")
    fmt.Println("  go tool pprof -http=:8080 block.pprof")
    fmt.Println("  http://localhost:6060/debug/pprof/block")
    fmt.Println("  http://localhost:6060/debug/pprof/mutex")`
    },

    "Compiler Optimization Inlining Overrides": {
      exp: "Go's compiler aggressively inlines functions for performance, which can hide stack frames during debugging. Use <code>-gcflags='all=-N -l'</code> to disable all optimizations and inlining (<code>-N</code> disables optimization, <code>-l</code> disables inlining). For selective control, use <code>//go:noinline</code> directive on specific functions, <code>-gcflags='-l'</code> for package-level inlining control, and <code>-gcflags='-m'</code> to print optimization decisions. The <code>-l</code> flag accepts multiple levels: <code>-l</code> (basic), <code>-ll</code> (more), <code>-lll</code> (aggressive).",
      code: `// Compiler Optimization Inlining Overrides
package main

import (
    "fmt"
    "runtime"
)

//go:noinline  // Prevent inlining of this function
func debugFunction(x int) int {
    // Without //go:noinline, this function would be inlined
    // Making it invisible in stack traces and Delve
    result := x * x + x
    return result
}

// Inline directive (rarely used)
//go:inline
func smallFunction(x int) int {
    return x + 1
}

func main() {
    // Build with optimization tracing:
    // go build -gcflags='-m' main.go 2>&1 | grep "inlined"

    // Build with no optimizations for debugging:
    // go build -gcflags='all=-N -l' -o debug-app main.go

    // Selective optimization control:
    // go build -gcflags='-N -l' -o debug-app main.go
    // go build -gcflags='mypackage=-N -l' main.go  // Per-package

    // Check if function was inlined
    callerFunc := runtime.FuncForPC(reflect.ValueOf(debugFunction).Pointer())
    // In go 1.12+, entry line indicates inlining
    file, line := callerFunc.FileLine(0)
    fmt.Printf("Function debugFunction at %s:%d\\n", file, line)

    result := debugFunction(42)
    fmt.Printf("Result: %d\\n", result)

    // Check optimization settings at runtime
    fmt.Println("\\nBuild flags for debugging:")
    fmt.Println("  -gcflags='all=-N -l'  - No opt, no inline")
    fmt.Println("  -gcflags='-m'         - Print opt decisions")
    fmt.Println("  //go:noinline         - Per-function control")
    fmt.Println("\\nInlining complicates debugging because:")
    fmt.Println("1. Inlined functions disappear from stack traces")
    fmt.Println("2. Local variables may be optimized away")
    fmt.Println("3. Step-over/step-into behavior changes")
    fmt.Println("4. Delve shows 'optimized function' warnings")
}`
    },

    "Core Dump Generation & Post-Mortem Analysis": {
      exp: "Go core dumps capture the full process state for post-mortem debugging. Set <code>GOTRACEBACK=crash</code> to generate a core dump on panic, or <code>GOTRACEBACK=all</code> for all goroutine stacks on panic. Use <code>dlv core</code> to analyze core dumps with Delve, or <code>gdb</code> for legacy analysis. Core dumps include all goroutine states, memory, and variable values at the crash point. For fine-grained control, use <code>runtime/debug.WriteHeapDump()</code> for heap-only snapshots. Core dump files can be large; compress and limit to production issues only.",
      code: `// Core Dump Generation & Post-Mortem Analysis
package main

import (
    "fmt"
    "os"
    "runtime"
    "runtime/debug"
)

func crashFunction(data map[string]int, key string) int {
    // Simulates nil pointer dereference
    var nilMap map[string]int
    return nilMap[key] // This would panic
}

func main() {
    // Method 1: Environment variables for automatic dumps
    // GOTRACEBACK=crash ./program    (core dump + crash on panic)
    // GOTRACEBACK=all  ./program    (stack trace + continue)
    // GOTRACEBACK=system ./program  (include runtime frames)

    // Method 2: runtime/debug.WriteHeapDump
    f, _ := os.Create("heap.dump")
    debug.WriteHeapDump(f)
    f.Close()
    fmt.Println("Heap dump saved to heap.dump")

    // Method 3: runtime.GOMAXPROCS and debug.SetPanicOnFault
    debug.SetPanicOnFault(true) // Make memory faults recoverable

    // Method 4: Signal-based core dumps
    // kill -SIGQUIT <pid>    (on Unix: prints stacks + continues)
    // kill -SIGABRT <pid>    (on Unix: core dump with GOTRACEBACK=crash)

    // Analyze core dumps with Delve:
    // dlv core ./program core
    // (dlv) goroutines
    // (dlv) goroutine 1
    // (dlv) stack
    // (dlv) locals
    // (dlv) print <variable>

    // Analyze with GDB:
    // gdb ./program core
    // (gdb) bt
    // (gdb) info goroutines
    // (gdb) goroutine 1 bt

    // Method 5: Graceful crash with stack
    defer func() {
        if r := recover(); r != nil {
            fmt.Printf("Panic: %v\\n", r)
            debug.PrintStack()
            // Write goroutine stacks
            buf := make([]byte, 1<<20)
            n := runtime.Stack(buf, true)
            os.WriteFile("goroutine_dump.txt", buf[:n], 0644)
        }
    }()

    fmt.Println("\\nCore dump methods:")
    fmt.Println("  GOTRACEBACK=crash     - Core dump on panic")
    fmt.Println("  GOTRACEBACK=all       - All stacks on panic")
    fmt.Println("  dlv core ./prog ./core - Post-mortem analysis")
    fmt.Println("  debug.WriteHeapDump()  - Heap snapshot")
    fmt.Println("  runtime.Stack()       - Programmatic stacks")
    fmt.Println("\\nAnalyze: dlv core ./program ./core")
}`

    },

    "Network & HTTP Request Tracing (httptrace)": {
      exp: "Go's <code>net/http/httptrace</code> package provides hooks into the HTTP request lifecycle: DNS lookup, TCP connection, TLS handshake, request start/end, response headers, and connection reuse. Use it to debug slow requests, DNS issues, TLS problems, and connection pooling. Combine with <code>net/http/pprof</code> for comprehensive HTTP debugging. The <code>httptrace.ClientTrace</code> struct accepts callback functions for each event. Always check <code>context.Done()</code> in long-running traces to avoid leaks.",
      code: `// Network & HTTP Request Tracing
package main

import (
    "fmt"
    "net/http"
    "net/http/httptrace"
    "time"
)

func traceHTTPRequest(url string) error {
    // Create a ClientTrace with all hooks
    trace := &httptrace.ClientTrace{
        // DNS lookup
        DNSStart: func(info httptrace.DNSStartInfo) {
            fmt.Printf("DNS Start: %s\\n", info.Host)
        },
        DNSDone: func(info httptrace.DNSDoneInfo) {
            fmt.Printf("DNS Done: %v (err: %v)\\n", info.Addrs, info.Err)
        },

        // TCP connection
        ConnectStart: func(network, addr string) {
            fmt.Printf("TCP Connect Start: %s %s\\n", network, addr)
        },
        ConnectDone: func(network, addr string, err error) {
            fmt.Printf("TCP Connect Done: %s %s (err: %v)\\n", network, addr, err)
        },

        // TLS handshake
        TLSHandshakeStart: func() {
            fmt.Println("TLS Handshake Start")
        },
        TLSHandshakeDone: func(state httptrace.TLSHandshakeState, err error) {
            fmt.Printf("TLS Handshake Done: version=0x%x (err: %v)\\n", state.State.Version, err)
        },

        // Request headers
        WroteHeaders: func() {
            fmt.Println("Wrote Request Headers")
        },
        WroteRequest: func(info httptrace.WroteRequestInfo) {
            fmt.Printf("Wrote Request Complete (err: %v)\\n", info.Err)
        },

        // Response
        GotFirstResponseByte: func() {
            fmt.Println("Got First Response Byte")
        },
    }

    // Attach trace to request context
    req, _ := http.NewRequest("GET", url, nil)
    ctx := httptrace.WithClientTrace(req.Context(), trace)
    req = req.WithContext(ctx)

    // Execute request
    client := &http.Client{Timeout: 10 * time.Second}
    start := time.Now()
    resp, err := client.Do(req)
    elapsed := time.Since(start)

    if err != nil {
        return fmt.Errorf("request failed: %w", err)
    }
    defer resp.Body.Close()

    fmt.Printf("\\nResponse: %s (status: %d, elapsed: %v)\\n", url, resp.StatusCode, elapsed)

    // Check connection reuse
    fmt.Printf("Connection reused: %v\\n", resp.Request == nil) // Simplified check

    return nil
}

func main() {
    urls := []string{
        "https://google.com",
        "https://github.com",
        "https://httpbin.org/delay/2", // Slow endpoint
    }

    for _, url := range urls {
        fmt.Printf("\\n=== Tracing: %s ===\\n", url)
        if err := traceHTTPRequest(url); err != nil {
            fmt.Printf("Error: %v\\n", err)
        }
    }

    fmt.Println("\\nHTTP tracing use cases:")
    fmt.Println("1. Debug slow API responses (DNS, TCP, TLS timing)")
    fmt.Println("2. Find connection pooling issues")
    fmt.Println("3. Detect DNS resolution failures")
    fmt.Println("4. Debug TLS certificate problems")
    fmt.Println("5. Monitor redirect chains")
    fmt.Println("\\nCombine with pprof for full HTTP debugging")
    fmt.Println("  import _ \"net/http/pprof\"")
    fmt.Println("  go func() { http.ListenAndServe(\":6060\", nil) }()")
}`

    },

    "Assembly Code Generation Inspection": {
      exp: "Go's <code>go tool compile -S</code> generates assembly listings from Go source code, useful for debugging compiler optimizations, inlining decisions, and performance bottlenecks. Use <code>-S</code> for assembly output, <code>-m</code> for optimization decisions, <code>-l</code> for inlining control, and <code>-race</code> for race-instrumented assembly. Filter output with <code>grep</code> for specific functions. The <code>go tool objdump</code> disassembles compiled binaries. Compare assembly with and without optimizations to understand compiler behavior.",
      code: `// Assembly Code Generation Inspection
package main

import "fmt"

//go:noinline
func sum(numbers []int) int {
    total := 0
    for _, n := range numbers {
        total += n
    }
    return total
}

func main() {
    data := []int{1, 2, 3, 4, 5}
    result := sum(data)
    fmt.Println("Result:", result)

    // Assembly inspection commands:
    // 1. Compile to assembly:
    //    go tool compile -S main.go > assembly.s
    //
    // 2. With optimization decisions:
    //    go tool compile -S -m main.go 2>&1
    //
    // 3. Compile without inlining:
    //    go tool compile -S -l main.go > noinline_asm.s
    //
    // 4. Disassemble compiled binary:
    //    go build -o app main.go
    //    go tool objdump -s 'main\.sum' app
    //
    // 5. Machine code for a specific function:
    //    go tool objdump -s 'main\.main' app
    //
    // 6. With race detection instrumentation:
    //    go tool compile -race -S main.go > race_asm.s
    //
    // 7. Compare optimized vs unoptimized:
    //    go tool compile -S -N -l main.go > unopt_asm.s
    //    go tool compile -S main.go > opt_asm.s
    //    diff unopt_asm.s opt_asm.s

    // Reading assembly output:
    // "TEXT main.sum(SB)" - Function symbol
    // "MOVQ" - Move quad word (64-bit)
    // "ADDQ" - Add quad word
    // "CMPQ" - Compare quad word
    // "JLT"  - Jump if less than
    // "RET"  - Return

    fmt.Println("\\nAssembly inspection commands:")
    fmt.Println("  go tool compile -S main.go")
    fmt.Println("  go tool compile -S -m main.go   (with opt decisions)")
    fmt.Println("  go tool compile -S -l main.go   (no inlining)")
    fmt.Println("  go tool objdump -s 'main.sum' app")
    fmt.Println("  go tool objdump -s 'main.main' app")
    fmt.Println("  go build -gcflags='-S' main.go  (direct asm output)")
    fmt.Println("\\nKey assembly patterns:")
    fmt.Println("  Bounds checking: CMPQ + JLS sequences")
    fmt.Println("  Inlined calls: no CALL instruction")
    fmt.Println("  Escape analysis: heap vs stack allocation")`
    },

    "Build Tag & Conditional Compilation Diagnostics": {
      exp: "Go build tags and conditional compilation can introduce subtle bugs when files are unexpectedly included or excluded. Use <code>go list -json</code> to inspect resolved build constraints, <code>go build -v</code> to see which files are compiled, and <code>go list -f '{{.GoFiles}}'</code> for file listings. Debug tag resolution with <code>-tags</code> flag and <code>GOOS</code>/<code>GOARCH</code> environment variables. The <code>go/env</code> package and <code>runtime.GOOS</code>/<code>runtime.GOARCH</code> provide runtime platform detection. Common issues: missing //go:build directives, conflicting tags, and partial file inclusion.",
      code: `// Build Tag & Conditional Compilation Diagnostics
package main

import (
    "fmt"
    "go/build"
    "runtime"
    "strings"
)

//go:build linux
// +build linux

// This file only compiles on linux
// Check: go list -f '{{.GoFiles}}' .

func platformSpecific() string {
    return "Running on Linux"
}

// In a separate file (platform_windows.go):
// //go:build windows
// // +build windows
// package main
// func platformSpecific() string { return "Running on Windows" }

// In default file (platform_default.go):
// //go:build !linux && !windows
// package main
// func platformSpecific() string { return "Running on other OS" }

func main() {
    // 1. Runtime platform check
    fmt.Printf("Runtime GOOS: %s\\n", runtime.GOOS)
    fmt.Printf("Runtime GOARCH: %s\\n", runtime.GOARCH)

    // 2. Build tags in effect
    fmt.Println("\\n=== Build Context ===")
    ctx := build.Default
    fmt.Printf("GOOS: %s\\n", ctx.GOOS)
    fmt.Printf("GOARCH: %s\\n", ctx.GOARCH)
    fmt.Printf("Build tags: %v\\n", ctx.BuildTags)
    fmt.Printf("Release tags: %v\\n", ctx.ReleaseTags)

    // 3. Check if a file would be included
    // Run: go list -json -tags 'prod,integration'
    // Output shows: GoFiles, IgnoredGoFiles, TestGoFiles

    // 4. Diagnostic commands
    fmt.Println("\\n=== Build Tag Diagnostics ===")
    fmt.Println("  go list -f '{{.GoFiles}}' .")
    fmt.Println("  go list -f '{{.IgnoredGoFiles}}' .")
    fmt.Println("  go list -f '{{.TestGoFiles}}' .")
    fmt.Println("  go list -json . | grep GoFiles")
    fmt.Println("  go build -v ./...")
    fmt.Println("  go build -tags 'integration' -v ./...")

    // 5. Environment variable debugging
    fmt.Println("\\n=== Environment ===")
    env := []string{"GOOS", "GOARCH", "GOARM", "GOMIPS", "CGO_ENABLED"}
    for _, e := range env {
        fmt.Printf("  %s=%s\\n", e, getEnv(e))
    }

    // 6. Conditional file inclusion test
    platform := platformSpecific()
    fmt.Printf("\\nPlatform-specific function says: %s\\n", platform)
    fmt.Printf("File ends with _linux.go: %v\\n", strings.HasSuffix(runtime.GOOS+"_"+runtime.GOARCH, "_linux"))

    fmt.Println("\\nCommon build tag issues:")
    fmt.Println("1. Missing //go:build directive in new files")
    fmt.Println("2. Conflicting tags across files")
    fmt.Println("3. Case-sensitive tag names")
    fmt.Println("4. Forgot to commit all platform files")
    fmt.Println("5. CGO vs non-CGO build mismatches")
    fmt.Println("\\nFix: use 'go list -json' to verify file inclusion")
}

func getEnv(key string) string {
    // Simulated - use 'go env' command for actual values
    values := map[string]string{
        "GOOS":         runtime.GOOS,
        "GOARCH":       runtime.GOARCH,
        "CGO_ENABLED":  "1",
    }
    if v, ok := values[key]; ok {
        return v
    }
    return "(run 'go env " + key + "')"
}`

    },

  }
};
