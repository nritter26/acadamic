// ────────── DATA ──────────
const gameLangNames = {
  js:'JavaScript', py:'Python', go:'Go', rs:'Rust', c:'C', cpp:'C++', cs:'C#', kt:'Kotlin', swift:'Swift', zig:'Zig'
};
const gameLangList = ['js','py','go','rs','c','cpp','cs','kt','swift','zig'];

const gameSnippets = {
  js: [
`function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
`const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(function(n) { return n * 2; });\nconsole.log(doubled);`,
`class Person {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n  }\n  greet() { return "Hi, I'm " + this.name; }\n}`,
`async function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    return await res.json();\n  } catch (err) {\n    console.error("Failed:", err);\n  }\n}`,
`function sumArray(arr) {\n  return arr.reduce(function(acc, n) { return acc + n; }, 0);\n}\nconst nums = [1, 2, 3, 4, 5];\nconsole.log(sumArray(nums));`,
`const items = ["apple", "banana", "cherry"];\nconst filtered = items.filter(function(item) { return item.length > 5; });\nconsole.log(filtered);` ],
  py: [
`def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)`,
`numbers = [1, 2, 3, 4, 5]\ndoubled = [n * 2 for n in numbers]\nprint(doubled)`,
`class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    def greet(self):\n        return f"Hi, I'm {self.name}"`,
`import json\nimport urllib.request\n\ndef fetch_data(url):\n    with urllib.request.urlopen(url) as res:\n        return json.loads(res.read())`,
`def sum_array(arr):\n    total = 0\n    for n in arr:\n        total += n\n    return total\n\nnums = [1, 2, 3, 4, 5]\nprint(sum_array(nums))` ],
  go: [
`func fibonacci(n int) int {\n  if n <= 1 { return n }\n  return fibonacci(n-1) + fibonacci(n-2)\n}`,
`package main\nimport "fmt"\nfunc main() {\n  numbers := []int{1, 2, 3, 4, 5}\n  for _, n := range numbers { fmt.Println(n * 2) }\n}`,
`type Person struct { Name string; Age int }\nfunc (p Person) Greet() string { return "Hi, I'm " + p.Name }`,
`func sumArray(arr []int) int {\n  sum := 0\n  for _, n := range arr { sum += n }\n  return sum\n}` ],
  rs: [
`fn fibonacci(n: u32) -> u32 {\n  if n <= 1 { return n; }\n  fibonacci(n - 1) + fibonacci(n - 2)\n}`,
`fn main() {\n  let numbers = vec![1, 2, 3, 4, 5];\n  let doubled: Vec<i32> = numbers.iter().map(|n| n * 2).collect();\n  println!("{:?}", doubled);\n}`,
`struct Person { name: String, age: u32 }\nimpl Person {\n  fn greet(&self) -> String { format!("Hi, I'm {}", self.name) }\n}`,
`fn sum_array(arr: &[i32]) -> i32 {\n  arr.iter().sum()\n}\nfn main() { let nums = vec![1, 2, 3, 4, 5]; println!("{}", sum_array(&nums)); }` ],
  c: [
`int fibonacci(int n) { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); }`,
`#include <stdio.h>\nint main() {\n  int nums[] = {1,2,3,4,5};\n  for(int i=0;i<5;i++) printf("%d\\n",nums[i]*2);\n  return 0;\n}`,
`typedef struct { char name[50]; int age; } Person;\nvoid greet(Person p) { printf("Hi, I'm %s\\n", p.name); }`,
`int sumArray(int arr[], int len) { int t=0; for(int i=0;i<len;i++) t+=arr[i]; return t; }` ],
  cpp: [
`int fibonacci(int n) { if (n <= 1) return n; return fibonacci(n-1)+fibonacci(n-2); }`,
`#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> nums = {1,2,3,4,5};\n  for(int n:nums) std::cout<<n*2<<std::endl;\n}`,
`class Person {\npublic:\n  Person(std::string n, int a):name_(n),age_(a){}\n  std::string Greet(){return "Hi, I'm "+name_;}\nprivate:\n  std::string name_;int age_;\n};`,
`int sumArray(std::vector<int> arr) { int t=0; for(int n:arr) t+=n; return t; }` ],
  cs: [
`int Fibonacci(int n) { if (n <= 1) return n; return Fibonacci(n-1)+Fibonacci(n-2); }`,
`int[] numbers = {1,2,3,4,5};\nvar doubled = numbers.Select(n=>n*2).ToArray();\nforeach(var n in doubled) Console.WriteLine(n);`,
`class Person {\n  public string Name{get;set;}\n  public int Age{get;set;}\n  public string Greet(){return $"Hi, I'm {Name}";}\n}`,
`int SumArray(int[] arr) { return arr.Sum(); }\nint[] nums = {1,2,3,4,5};\nConsole.WriteLine(SumArray(nums));` ],
  kt: [
`fun fibonacci(n: Int): Int { return if (n <= 1) n else fibonacci(n-1)+fibonacci(n-2) }`,
`fun main() {\n  val numbers = listOf(1,2,3,4,5)\n  val doubled = numbers.map { it * 2 }\n  println(doubled)\n}`,
`class Person(val name: String, val age: Int) { fun greet() = "Hi, I'm $name" }`,
`fun sumArray(arr: IntArray): Int { return arr.sum() }\nfun main() { val nums = intArrayOf(1,2,3,4,5); println(sumArray(nums)) }` ],
  swift: [
`func fibonacci(_ n: Int) -> Int { if n <= 1 { return n }; return fibonacci(n-1)+fibonacci(n-2) }`,
`let numbers = [1,2,3,4,5]\nlet doubled = numbers.map { $0 * 2 }\nprint(doubled)`,
`class Person {\n  var name:String; var age:Int\n  init(name:String,age:Int){self.name=name;self.age=age}\n  func greet()->String{return "Hi, I'm \\(name)"}\n}`,
`func sumArray(_ arr:[Int])->Int{return arr.reduce(0,+)}; let nums=[1,2,3,4,5]; print(sumArray(nums))` ],
  zig: [
`fn fibonacci(n: u64) u64 { if (n <= 1) return n; return fibonacci(n-1)+fibonacci(n-2); }`,
`const std = @import(\"std\");\npub fn main() void {\n  var i: u32 = 0;\n  while (i < 10) { if (i % 2 == 0) std.debug.print(\"{d}\\n\", .{i}); i += 1; }\n}`,
`const Person = struct { name: []const u8, age: u32, fn greet(self: Person) []const u8 { return \"Hi \" ++ self.name; } };`,
`const std = @import(\"std\");\npub fn main() void {\n  const nums = [_]u32{ 1, 2, 3, 4, 5 };\n  var sum: u32 = 0;\n  for (nums) |n| { sum += n; }\n  std.debug.print(\"{d}\\n\", .{sum});\n}` ]
};

// ── SCRAMBLE DATA ──
const scrambleSets = [
  { lines: ['function fibonacci(n) {', '  if (n <= 1) return n;', '  return fibonacci(n - 1) + fibonacci(n - 2);', '}'], lang: 'js' },
  { lines: ['const numbers = [1, 2, 3, 4, 5];', 'const doubled = numbers.map(n => n * 2);', 'console.log(doubled);'], lang: 'js' },
  { lines: ['class Person {', '  constructor(name, age) {', '    this.name = name;', '    this.age = age;', '  }', '  greet() { return "Hi"; }', '}'], lang: 'js' },
  { lines: ['def fibonacci(n):', '    if n <= 1:', '        return n', '    return fibonacci(n - 1) + fibonacci(n - 2)'], lang: 'py' },
  { lines: ['numbers = [1, 2, 3, 4, 5]', 'doubled = [n * 2 for n in numbers]', 'print(doubled)'], lang: 'py' },
  { lines: ['func fibonacci(n int) int {', '  if n <= 1 { return n }', '  return fibonacci(n-1) + fibonacci(n-2)', '}'], lang: 'go' },
  { lines: ['package main', 'import "fmt"', 'func main() {', '  fmt.Println("Hello, Go!")', '}'], lang: 'go' },
  { lines: ['fn main() {', '  let numbers = vec![1, 2, 3, 4, 5];', '  let sum: i32 = numbers.iter().sum();', '  println!("{}", sum);', '}'], lang: 'rs' },
];

// ── DEBUG DATA ──
const debugChallenges = [
  { bug: 'function add(a, b) {\n  return a - b;\n}', fix: 'function add(a, b) {\n  return a + b;\n}', hint: 'Wrong operator', lang: 'js' },
  { bug: 'for (let i = 0; i < 10; i--;) {\n  console.log(i);\n}', fix: 'for (let i = 0; i < 10; i++) {\n  console.log(i);\n}', hint: 'Increment direction', lang: 'js' },
  { bug: 'const PI = 3.14;\nPI = 3.14159;', fix: 'let PI = 3.14;\nPI = 3.14159;', hint: 'Constant cannot change', lang: 'js' },
  { bug: 'def add(a, b):\n  return a - b', fix: 'def add(a, b):\n  return a + b', hint: 'Wrong operator', lang: 'py' },
  { bug: 'for i in range(10):\nprint(i)', fix: 'for i in range(10):\n    print(i)', hint: 'Missing indent', lang: 'py' },
  { bug: 'for i in range(5);\n  print(i)', fix: 'for i in range(5):\n  print(i)', hint: 'Wrong punctuation', lang: 'py' },
  { bug: 'func add(a int, b int) int {\n  return a - b\n}', fix: 'func add(a int, b int) int {\n  return a + b\n}', hint: 'Wrong operator', lang: 'go' },
  { bug: 'fn main() {\n  let x = 5;\n  x = 10;\n  println!("{}", x);\n}', fix: 'fn main() {\n  let mut x = 5;\n  x = 10;\n  println!("{}", x);\n}', hint: 'Need mut keyword', lang: 'rs' },
];

// ── SPRINT DATA ──
const sprintChallenges = [
  { desc: 'Print "Hello World" to the console', code: 'console.log("Hello World");', lang: 'js' },
  { desc: 'Print "Hello World"', code: 'print("Hello World")', lang: 'py' },
  { desc: 'Declare a variable x = 10 and print it', code: 'let x = 10;\nconsole.log(x);', lang: 'js' },
  { desc: 'Create a list of 1-5 and print it', code: 'numbers = list(range(1, 6))\nprint(numbers)', lang: 'py' },
  { desc: 'Define a function that returns the sum of two numbers', code: 'function add(a, b) {\n  return a + b;\n}', lang: 'js' },
  { desc: 'Print "Hello" using fmt', code: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello")\n}', lang: 'go' },
];

// ── MEMORY DATA ──
const memoryPairs = [
  { a: 'console.log()', b: 'Print in JS' },
  { a: 'console.log()', b: 'Print in JS' },
  { a: 'print()', b: 'Print in Python' },
  { a: 'print()', b: 'Print in Python' },
  { a: 'fmt.Println()', b: 'Print in Go' },
  { a: 'fmt.Println()', b: 'Print in Go' },
  { a: 'println!()', b: 'Print in Rust' },
  { a: 'println!()', b: 'Print in Rust' },
  { a: 'let x = 5', b: 'Mutable variable JS' },
  { a: 'let x = 5', b: 'Mutable variable JS' },
  { a: 'const x = 5', b: 'Immutable JS' },
  { a: 'const x = 5', b: 'Immutable JS' },
  { a: 'def foo():', b: 'Function in Python' },
  { a: 'def foo():', b: 'Function in Python' },
  { a: 'func foo()', b: 'Function in Go' },
  { a: 'func foo()', b: 'Function in Go' },
  { a: 'fn foo()', b: 'Function in Rust' },
  { a: 'fn foo()', b: 'Function in Rust' },
  { a: 'if x > 0:', b: 'If in Python' },
  { a: 'if x > 0:', b: 'If in Python' },
  { a: 'for i in range(10):', b: 'Loop in Python' },
  { a: 'for i in range(10):', b: 'Loop in Python' },
  { a: '// comment', b: 'Single line comment' },
  { a: '// comment', b: 'Single line comment' },
];

// ── FLASH DATA ──
const flashQuestions = [
  { code: 'console.log(2 + 2);', asks: 'What does this print?', ans: 0, opts: ['4', '"22"', 'undefined', 'Error'] },
  { code: 'const x = 5;\nconsole.log(x * 2);', asks: 'What is the output?', ans: 0, opts: ['10', '52', '25', 'Error'] },
  { code: 'console.log(typeof "hello");', asks: 'What type is printed?', ans: 1, opts: ['hello', 'string', 'String', 'undefined'] },
  { code: 'const nums = [1, 2, 3];\nconsole.log(nums.length);', asks: 'What is the output?', ans: 2, opts: ['1', '2', '3', 'undefined'] },
  { code: 'console.log(10 > 5);', asks: 'What is the output?', ans: 0, opts: ['true', 'false', '10', 'Error'] },
  { code: 'const s = "hello";\nconsole.log(s[1]);', asks: 'What is the output?', ans: 2, opts: ['h', 'o', 'e', 'l'] },
  { code: 'print(2 ** 3)', asks: 'What does Python print?', ans: 3, opts: ['6', '5', '9', '8'], lang: 'py' },
  { code: 'print("ab" + "cd")', asks: 'What is the output?', ans: 0, opts: ['abcd', '"abcd"', 'ab+cd', 'Error'] },
  { code: 'console.log(true && false);', asks: 'What is the output?', ans: 1, opts: ['true', 'false', '0', 'undefined'] },
  { code: 'let x;\nconsole.log(x);', asks: 'What is the output?', ans: 3, opts: ['null', '0', '""', 'undefined'] },
];

// ── RACE DATA ──
const raceProblems = [
  { desc: 'Write a function that returns the sum of two numbers', check: (c) => c.includes('return') && (c.includes('+') || c.includes('plus')), hint: 'Use function and return' },
  { desc: 'Print numbers 1 to 5 using a loop', check: (c) => (c.includes('for') || c.includes('while')) && c.includes('console.log'), hint: 'Use a for loop' },
  { desc: 'Create an array with numbers 1-5', check: (c) => c.includes('[') && c.includes('1') && c.includes('2'), hint: 'Use bracket syntax' },
];

// ── SWIPE DATA ──
const swipeQuestions = [
  { code: 'let x = 5;', valid: true, explain: 'Valid JS: declares mutable variable' },
  { code: 'const x = 5; x = 6;', valid: false, explain: 'Cannot reassign a const' },
  { code: 'function add(a, b) { return a + b }', valid: true, explain: 'Valid JS function declaration' },
  { code: 'if x > 0 { console.log(x) }', valid: false, explain: 'Missing parentheses around condition' },
  { code: 'for (let i = 0; i < 10; i++) {}', valid: true, explain: 'Valid for loop syntax' },
  { code: 'console.log("hello);', valid: false, explain: 'Unclosed string literal' },
  { code: 'const obj = { name: "Alice" };', valid: true, explain: 'Valid object literal' },
  { code: 'def add(a, b):\n  return a + b', valid: true, explain: 'Valid Python function' },
  { code: 'numbers = [1, 2, 3\nprint(numbers)', valid: false, explain: 'Unclosed list bracket' },
  { code: 'for i in range(10):\n    print(i)', valid: true, explain: 'Valid Python for loop' },
  { code: 'func main() {\n  fmt.Println("hi")\n}', valid: true, explain: 'Valid Go main function' },
  { code: 'fn main() {\n  let x = 5;\n  x = 6;\n}', valid: false, explain: 'Rust variables are immutable by default, need mut' },
  { code: 'int x = 5;', valid: false, explain: 'JS uses let/const, not type prefix' },
  { code: 'const a = [1, 2, 3]; a.push(4);', valid: true, explain: 'Valid: const array can be mutated' },
  { code: 'if (x = 5) { }', valid: false, explain: 'Using = instead of == in condition, always truthy' },
];

// ── SHARED STATE ──
let gameActive = 'hub';
let gameLang = 'js';
let gameBestWPM = {};
let gameTotalXP = 0;
let gameLevel = 1;

function escapeHtml(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function shuffleArr(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]} return b; }

// ── EFFECTS ──
function createConfetti(count) {
  const colors = ['#ff6b6b','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316'];
  for (let i = 0; i < (count || 30); i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.animationDuration = (1 + Math.random()) + 's';
    el.style.width = (4 + Math.random() * 8) + 'px';
    el.style.height = (4 + Math.random() * 8) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

function showToast(msg, type) {
  const existing = document.querySelector('.game-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'game-toast ' + (type || '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 2000);
}

function showScorePopup(text, cls) {
  const el = document.createElement('div');
  el.className = 'game-score-popup ' + (cls || '');
  el.textContent = text;
  el.style.left = (40 + Math.random() * 20) + '%';
  el.style.top = (30 + Math.random() * 20) + '%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function toggleGameModal() {
  const o = document.getElementById('gameOverlay');
  const open = !o.classList.contains('open');
  if (open) {
    try { const s = localStorage.getItem('dogeslab_game_best'); if (s) gameBestWPM = JSON.parse(s); } catch {}
    try { const x = localStorage.getItem('dogeslab_game_xp'); if (x) { const d = JSON.parse(x); gameTotalXP = d.xp || 0; gameLevel = d.lvl || 1; } } catch {}
    renderHub();
  }
  o.classList.toggle('open');
}

// ── HUB ──
const GAMES = [
  { id:'typing',    name:'Typing Speed',   icon:'⌨️', desc:'Type code, test your WPM', color:'#ff6b6b' },
  { id:'scramble',  name:'Code Scramble',  icon:'🔀', desc:'Reorder shuffled code lines', color:'#f59e0b' },
  { id:'debug',     name:'Debug the Bug',  icon:'🐛', desc:'Find and fix the bug', color:'#10b981' },
  { id:'sprint',    name:'Syntax Sprint',  icon:'🏃', desc:'Write code from a description', color:'#3b82f6' },
  { id:'memory',    name:'Memory Match',   icon:'🧠', desc:'Match code concept pairs', color:'#8b5cf6' },
  { id:'flash',     name:'Speed Read',     icon:'⚡', desc:'Read code then answer', color:'#ec4899' },
  { id:'race',      name:'Race Compiler',  icon:'🏎️', desc:'Solve under time pressure', color:'#14b8a6' },
  { id:'swipe',     name:'Syntax Swipe',   icon:'👆', desc:'Valid syntax or not?', color:'#f97316' },
];

function renderHub() {
  gameActive = 'hub';
  const body = document.getElementById('gamePaperBody');
  const lvlBonus = gameLevel > 1 ? `<span style="font-size:10px;color:#64748b;margin-left:auto">Lv ${gameLevel}</span>` : '';
  let html = `<div class="game-hub-top"><span class="game-hub-title">🎮 Game Lab</span>${lvlBonus}</div>
  <div class="game-hub-xp"><div class="game-hub-xp-bar"><div class="game-hub-xp-fill" style="width:${Math.min(100, (gameTotalXP % 100))}%"></div></div><span>${gameTotalXP} XP</span></div>
  <div class="game-hub-grid">`;
  for (const g of GAMES) {
    const best = g.id === 'typing' ? (gameBestWPM[gameLang] || 0) : 0;
    html += `<div class="game-hub-card" onclick="launchGame('${g.id}')" style="--card-color:${g.color}">
      <div class="game-hub-icon">${g.icon}</div>
      <div class="game-hub-name">${g.name}</div>
      <div class="game-hub-desc">${g.desc}</div>
      ${best ? `<div class="game-hub-best">Best: ${best} WPM</div>` : ''}
    </div>`;
  }
  html += '</div>';
  body.innerHTML = html;
}

function launchGame(id) {
  gameActive = id;
  if (id === 'typing') { gameActive = 'typing'; gameStarted = false; gameFinished = false; renderTyping(); }
  else if (id === 'scramble') initScramble();
  else if (id === 'debug') initDebug();
  else if (id === 'sprint') initSprint();
  else if (id === 'memory') initMemory();
  else if (id === 'flash') initFlash();
  else if (id === 'race') initRace();
  else if (id === 'swipe') initSwipe();
}

function addBackBtn() {
  return `<button class="game-back-btn" onclick="renderHub()">← Back</button>`;
}

function earnXP(amt) {
  gameTotalXP += amt;
  const newLvl = Math.floor(gameTotalXP / 100) + 1;
  if (newLvl > gameLevel) { gameLevel = newLvl; createConfetti(60); setTimeout(() => showToast('🎉 Level Up! You reached level ' + gameLevel + '!', 'xp'), 200); }
  try { localStorage.setItem('dogeslab_game_xp', JSON.stringify({xp:gameTotalXP,lvl:gameLevel})); } catch {}
}

function circumference(r) { return 2 * Math.PI * r; }

// ════════════════════════════════════════
// 1. TYPING SPEED
// ════════════════════════════════════════
let gameSnippet = '', gameStartTime = null, gameTimerInterval = null;
let gameStarted = false, gameFinished = false;
let gameTotalKeystrokes = 0, gameCorrectKeystrokes = 0, gameErrors = 0, gameElapsed = 0, gamePendingFinish = false;

function renderTyping() {
  const body = document.getElementById('gamePaperBody');
  let html = addBackBtn();
  html += '<div class="game-lang-bar">';
  for (const l of gameLangList) html += `<button class="game-lang-btn${l===gameLang?' active':''}" onclick="switchTypingLang('${l}')">${gameLangNames[l]}</button>`;
  html += '</div>';
  const best = gameBestWPM[gameLang] || 0;
  html += `<div class="game-best">Best WPM: <strong>${best}</strong>  •  XP: ${gameTotalXP}  •  Lv ${gameLevel}</div>`;
  html += `<div class="game-controls"><button class="game-new-btn" onclick="startTyping()">${gameStarted?'Restart':'Start Game'}</button></div>`;
  if (gameStarted && !gameFinished) {
    const wpm = getLiveWPM(); const acc = getLiveAcc(); const time = getLiveTime();
    html += `<div class="game-stats-bar"><span class="game-stat-chip">WPM <strong id="gwpm">${wpm}</strong></span><span class="game-stat-chip">Acc <strong id="gacc">${acc}%</strong></span><span class="game-stat-chip">Time <strong id="gtime">${time}s</strong></span><span class="game-stat-chip">Errors <strong id="gerrors">${gameErrors}</strong></span></div>`;
    const pct = gameSnippet ? Math.round((gameTotalKeystrokes / gameSnippet.length) * 100) : 0;
    html += `<div class="typing-progress-wrap"><div class="typing-progress-fill" id="typingProgress" style="width:${Math.min(100, pct)}%"></div></div>`;
    html += '<div class="game-target"><div class="game-target-label">Type this code:</div><div class="game-target-code" id="gameTargetCode">'+buildTargetHtml('')+'</div></div>';
    html += `<textarea id="gameInput" class="game-input" spellcheck="false" placeholder="Start typing..."></textarea>`;
    body.innerHTML = html;
    const inp = document.getElementById('gameInput'); if (inp) { inp.focus(); inp.addEventListener('input', onGameInput); }
  } else if (gameFinished) {
    const m = gameElapsed/60; const chars=gameSnippet.length; const wpm=m>0?Math.round((chars/5)/m):0; const acc=gameTotalKeystrokes>0?Math.round((gameCorrectKeystrokes/gameTotalKeystrokes)*100):0;
    const isRecord = wpm > (gameBestWPM[gameLang]||0);
    if (isRecord) { gameBestWPM[gameLang]=wpm; try{localStorage.setItem('dogeslab_game_best',JSON.stringify(gameBestWPM))}catch{} earnXP(Math.round(wpm*0.5)); if (wpm > 20) createConfetti(40); }
    html += '<div class="game-target"><div class="game-target-label">Completed:</div><div class="game-target-code">'+buildTargetHtml(gameSnippet)+'</div></div>';
    if (isRecord) html += '<div class="game-new-record">NEW RECORD! +'+Math.round(wpm*0.5)+'XP</div>';
    html += `<div class="game-stats-grid"><div class="game-stat"><span class="game-stat-label">WPM</span><span class="game-stat-value">${wpm}</span></div><div class="game-stat"><span class="game-stat-label">Accuracy</span><span class="game-stat-value">${acc}%</span></div><div class="game-stat"><span class="game-stat-label">Time</span><span class="game-stat-value">${gameElapsed}s</span></div><div class="game-stat"><span class="game-stat-label">Errors</span><span class="game-stat-value">${gameErrors}</span></div></div>`;
    body.innerHTML = html;
  } else {
    html += '<div class="game-idle">Pick a <strong>language</strong> and hit <strong>Start Game</strong>!<br>Type the code as fast as you can. Timer starts automatically.</div>';
    body.innerHTML = html;
  }
}

function switchTypingLang(l) { if(gameStarted&&!gameFinished&&!confirm('Lose progress?'))return; if(gameTimerInterval){clearInterval(gameTimerInterval);gameTimerInterval=null} gameLang=l; gameStarted=false;gameFinished=false;gameStartTime=null; renderTyping(); }
function buildTargetHtml(typed) {
  const sl=gameSnippet.split('\n'); const tl=typed?typed.split('\n'):[]; let h='';
  for(let i=0;i<sl.length;i++){const l=sl[i];const t=i<tl.length?tl[i]:'';const p=i<tl.length-1||(i===tl.length-1&&typed&&typed.endsWith('\n'));const c=!gameFinished&&!p&&i===tl.length-1;const n=(i+1).toString().padStart(2,' ');
  h+=`<div class="game-line${c?' current':''}${p?(t===l?' done':' error-line'):''}"><span class="game-ln">${n}</span><span class="game-target-text">`;
  if(p) h+=`<span class="${t===l?'correct':'wrong'}">${escapeHtml(l)}</span>`;
  else if(c){for(let j=0;j<l.length;j++){const tc=t[j];if(tc===undefined)h+=`<span class="game-char">${escapeHtml(l[j])}</span>`;else if(tc===l[j])h+=`<span class="game-char correct-char">${escapeHtml(l[j])}</span>`;else h+=`<span class="game-char wrong-char">${escapeHtml(l[j])}</span>`}if(t&&t.length>l.length)h+=`<span class="game-extra">${escapeHtml(t.slice(l.length))}</span>`;h+=`<span class="game-cursor">|</span>`;}
  else h+=escapeHtml(l); h+='</span></div>';} return h;
}
function getLiveWPM(){if(!gameStarted||gameFinished||!gameStartTime)return 0;const m=(Date.now()-gameStartTime)/60000;return m>0?Math.round((gameCorrectKeystrokes/5)/m):0;}
function getLiveAcc(){return gameTotalKeystrokes>0?Math.round((gameCorrectKeystrokes/gameTotalKeystrokes)*100):100;}
function getLiveTime(){return gameStarted&&!gameFinished?Math.floor((Date.now()-gameStartTime)/1000):0;}
function startTyping(){
  const snips=gameSnippets[gameLang];if(!snips||!snips.length)return;
  if(gameTimerInterval){clearInterval(gameTimerInterval);gameTimerInterval=null}
  gameSnippet=snips[Math.floor(Math.random()*snips.length)];gameStarted=true;gameFinished=false;gamePendingFinish=false;gameStartTime=null;gameTotalKeystrokes=0;gameCorrectKeystrokes=0;gameErrors=0;gameElapsed=0;
  renderTyping();
  const body = document.getElementById('gamePaperBody');
  const ov = document.createElement('div'); ov.className = 'game-countdown-overlay'; ov.id = 'typingCountdown';
  ov.innerHTML = '<div class="game-countdown-num" id="countNum">3</div>';
  body.style.position = 'relative'; body.appendChild(ov);
  let c = 3; gameStarted = false;
  const ci = setInterval(() => {
    c--; const el = document.getElementById('countNum');
    if (el) el.textContent = c > 0 ? c : 'GO!';
    if (c <= 0) {
      clearInterval(ci);
      const o = document.getElementById('typingCountdown');
      if (o) { o.remove(); body.style.position = ''; }
      gameStarted = true; gameStartTime = Date.now();
      gameTimerInterval = setInterval(() => updateTypingDisplay(), 200);
      renderTyping();
    }
  }, 700);
}
function onGameInput(e){if(gameFinished||gamePendingFinish)return;const t=e.target.value;if(t===gameSnippet){gamePendingFinish=true;gameTotalKeystrokes=t.length;let c=0,e2=0;for(let i=0;i<t.length;i++){if(t[i]===gameSnippet[i])c++;else e2++}gameCorrectKeystrokes=c;gameErrors=e2;finishTyping();return}updateTypingDisplay();}
function updateTypingDisplay(){
  const inp=document.getElementById('gameInput');if(!inp)return;const t=inp.value;gameTotalKeystrokes=t.length;let c=0,e2=0;for(let i=0;i<t.length&&i<gameSnippet.length;i++){if(t[i]===gameSnippet[i])c++;else e2++}gameCorrectKeystrokes=c;gameErrors=e2;
  const te=document.getElementById('gameTargetCode');if(te)te.innerHTML=buildTargetHtml(t);
  ['gwpm','gacc','gtime','gerrors'].forEach(id=>{const el=document.getElementById(id);if(!el)return;if(id==='gwpm')el.textContent=getLiveWPM();else if(id==='gacc')el.textContent=getLiveAcc()+'%';else if(id==='gtime')el.textContent=getLiveTime()+'s';else el.textContent=gameErrors});
  const pb = document.getElementById('typingProgress');
  if (pb) { const pct = Math.min(100, Math.round((t.length / gameSnippet.length) * 100)); pb.style.width = pct + '%'; }
}
function finishTyping(){gameFinished=true;if(gameTimerInterval){clearInterval(gameTimerInterval);gameTimerInterval=null}gameElapsed=Math.floor((Date.now()-gameStartTime)/1000);renderTyping();}

// ════════════════════════════════════════
// 2. CODE SCRAMBLE
// ════════════════════════════════════════
let scrambleIdx = 0, scrambleOrder = [], scrambleScore = 0, scrambleLives = 3;
let scrambleDragEl = null;

function initScramble() {
  scrambleIdx = Math.floor(Math.random() * scrambleSets.length);
  scrambleOrder = scrambleSets[scrambleIdx].lines.map((_,i) => i);
  scrambleOrder = shuffleArr(scrambleOrder);
  scrambleScore = 0;
  renderScramble();
}

function renderScramble() {
  const body = document.getElementById('gamePaperBody');
  const set = scrambleSets[scrambleIdx];
  const lives = '❤️'.repeat(scrambleLives) + '🖤'.repeat(3 - scrambleLives);
  let html = addBackBtn() + `<div class="scramble-hud">${lives} <span style="margin-left:auto;color:#64748b;font-size:11px;">Reorder the code lines</span></div>`;
  html += '<div class="scramble-area" id="scrambleArea">';
  for (let i = 0; i < scrambleOrder.length; i++) {
    html += `<div class="scramble-item" draggable="true" data-idx="${i}" data-line="${scrambleOrder[i]}">
      <span class="scramble-num">${i+1}</span>
      <span class="scramble-code">${escapeHtml(set.lines[scrambleOrder[i]])}</span>
      <span class="scramble-drag">⠿</span>
    </div>`;
  }
  html += '</div>';
  html += `<button class="game-new-btn" style="margin-top:10px;" onclick="checkScramble()">Check Order</button>`;
  if (scrambleScore > 0) html += `<div style="text-align:center;margin-top:8px;color:#10b981;font-size:12px;">Score: ${scrambleScore}</div>`;
  body.innerHTML = html;
  setupScrambleDrag();
}

function setupScrambleDrag() {
  const area = document.getElementById('scrambleArea');
  if (!area) return;
  scrambleDragEl = null;
  area.querySelectorAll('.scramble-item').forEach(el => {
    el.addEventListener('dragstart', () => { scrambleDragEl = el; el.classList.add('dragging'); });
    el.addEventListener('dragend', () => { el.classList.remove('dragging'); area.querySelectorAll('.scramble-item').forEach(e => e.classList.remove('drag-over')); });
    el.addEventListener('dragover', e => { e.preventDefault(); const t = e.target.closest('.scramble-item'); if (t && t !== scrambleDragEl) { area.querySelectorAll('.scramble-item').forEach(e => e.classList.remove('drag-over')); t.classList.add('drag-over'); } });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => { e.preventDefault(); const t = e.target.closest('.scramble-item'); if (t && t !== scrambleDragEl) { area.querySelectorAll('.scramble-item').forEach(e => e.classList.remove('drag-over')); const r = t.getBoundingClientRect(); if (e.clientY < r.top + r.height/2) area.insertBefore(scrambleDragEl, t); else area.insertBefore(scrambleDragEl, t.nextSibling); } });
  });
  let touchEl = null, touchStartY = 0;
  area.addEventListener('touchstart', e => { const el = e.target.closest('.scramble-item'); if (!el) return; touchEl = el; touchStartY = e.touches[0].clientY; el.classList.add('dragging'); }, {passive:true});
  area.addEventListener('touchmove', e => { if (!touchEl) return; e.preventDefault(); const pt = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY); const target = pt ? pt.closest('.scramble-item') : null; area.querySelectorAll('.scramble-item').forEach(el => el.classList.remove('drag-over')); if (target && target !== touchEl) { const r = target.getBoundingClientRect(); if (e.touches[0].clientY < r.top + r.height/2) area.insertBefore(touchEl, target); else area.insertBefore(touchEl, target.nextSibling); target.classList.add('drag-over'); } }, {passive:false});
  area.addEventListener('touchend', () => { if (touchEl) { touchEl.classList.remove('dragging'); area.querySelectorAll('.scramble-item').forEach(el => el.classList.remove('drag-over')); touchEl = null; } }, {passive:true});
}

function checkScramble() {
  const items = document.querySelectorAll('#scrambleArea .scramble-item');
  const userOrder = Array.from(items).map(el => parseInt(el.dataset.line));
  const correct = scrambleSets[scrambleIdx].lines.map((_,i) => i);
  const match = userOrder.every((v,i) => v === correct[i]);
  if (match) {
    scrambleScore++;
    earnXP(15);
    showScorePopup('+15 XP', 'game-xp-popup');
    createConfetti(20);
    scrambleIdx = Math.floor(Math.random() * scrambleSets.length);
    scrambleOrder = scrambleSets[scrambleIdx].lines.map((_,i) => i);
    scrambleOrder = shuffleArr(scrambleOrder);
    items.forEach(el => el.classList.add('correct-glow'));
    setTimeout(() => renderScramble(), 500);
    showToast('✓ Correct! +15 XP', 'success');
  } else {
    scrambleLives--;
    items.forEach(el => el.classList.add('wrong-shake'));
    if (scrambleLives <= 0) {
      earnXP(5);
      showToast('Game Over! Score: ' + scrambleScore + ' (+5 XP)', 'xp');
      scrambleLives = 3; scrambleScore = 0;
      setTimeout(() => renderScramble(), 600);
    } else {
      setTimeout(() => renderScramble(), 500);
      showToast('✗ Wrong order! ' + '❤️'.repeat(scrambleLives) + ' lives left', 'error');
    }
  }
}

// ════════════════════════════════════════
// 3. DEBUG THE BUG
// ════════════════════════════════════════
let debugIdx = 0, debugSolved = 0;

function initDebug() {
  debugIdx = Math.floor(Math.random() * debugChallenges.length);
  debugSolved = 0;
  renderDebug();
}

function renderDebug() {
  const body = document.getElementById('gamePaperBody');
  const ch = debugChallenges[debugIdx];
  let html = addBackBtn() + `<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Solved: ${debugSolved}  •  ${gameLangNames[ch.lang]}</div>`;
  html += `<div class="game-target"><div class="game-target-label">🐛 Find the bug:</div><div class="game-target-code" style="color:#ef4444;font-size:11px;line-height:1.5;">${buildDebugDiff(ch.bug, ch.fix)}</div></div>`;
  html += `<div style="margin:8px 0;font-size:10px;color:#64748b;">💡 <em>${ch.hint}</em></div>`;
  html += `<textarea id="debugInput" class="game-input" spellcheck="false" style="min-height:80px;" placeholder="Fix the code...">${escapeHtml(ch.bug)}</textarea>`;
  html += `<button class="game-new-btn" style="margin-top:8px;" onclick="checkDebug()">Check Fix</button>`;
  body.innerHTML = html;
  const inp = document.getElementById('debugInput'); if (inp) inp.focus();
}

function buildDebugDiff(bug, fix) {
  const bl = bug.split('\n'), fl = fix.split('\n');
  let h = '<div style="font-family:Consolas,monospace;">';
  for (let i = 0; i < Math.max(bl.length, fl.length); i++) {
    const b = bl[i] || '', f = fl[i] || '';
    if (b === f) h += `<div class="debug-unchanged debug-diff-line">${escapeHtml(b)}</div>`;
    else {
      h += `<div class="debug-diff-removed debug-diff-line">− ${escapeHtml(b)}</div>`;
      h += `<div class="debug-diff-added debug-diff-line">+ ${escapeHtml(f)}</div>`;
    }
  }
  return h + '</div>';
}

function checkDebug() {
  const inp = document.getElementById('debugInput');
  if (!inp) return;
  const code = inp.value;
  const ch = debugChallenges[debugIdx];
  if (code === ch.fix) {
    debugSolved++; earnXP(20);
    createConfetti(25);
    showScorePopup('+20 XP', 'game-xp-popup');
    showToast('✓ Bug Fixed! +20 XP', 'success');
    setTimeout(() => { debugIdx = Math.floor(Math.random() * debugChallenges.length); renderDebug(); }, 1200);
  } else {
    const body = document.getElementById('gamePaperBody');
    const flash = document.createElement('div'); flash.style.cssText = 'text-align:center;color:#ef4444;font-weight:800;font-size:11px;margin:6px 0;padding:8px;background:rgba(239,68,68,0.08);border-radius:6px;';
    flash.textContent = '✗ Not quite right. Check the hint and try again.';
    body.appendChild(flash);
    setTimeout(() => flash.remove(), 2000);
  }
}

// ════════════════════════════════════════
// 4. SYNTAX SPRINT
// ════════════════════════════════════════
let sprintIdx = 0, sprintScore = 0;
function initSprint() { sprintIdx = Math.floor(Math.random() * sprintChallenges.length); sprintScore = 0; renderSprint(); }
function renderSprint() {
  const body = document.getElementById('gamePaperBody');
  const ch = sprintChallenges[sprintIdx];
  let html = addBackBtn() + `<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Score: ${sprintScore}  •  XP: ${gameTotalXP}</div>`;
  html += `<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.02));border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>🎯 Write code that does this:</strong><br><span style="color:#a5f3fc;font-size:12px;">${ch.desc}</span></div>`;
  html += `<textarea id="sprintInput" class="game-input" spellcheck="false" style="min-height:100px;" placeholder="Write your code here..."></textarea>`;
  html += `<button class="game-new-btn" style="margin-top:8px;" onclick="checkSprint()">Submit</button>`;
  body.innerHTML = html;
  const inp = document.getElementById('sprintInput'); if (inp) inp.focus();
}
function checkSprint() {
  const inp = document.getElementById('sprintInput'); if (!inp) return;
  const code = inp.value.trim().toLowerCase();
  const ch = sprintChallenges[sprintIdx];
  const expected = ch.code.toLowerCase();
  const normalize = s => s.replace(/\s+/g, ' ').trim();
  if (normalize(code) === normalize(expected)) {
    sprintScore++; earnXP(25);
    showScorePopup('+25 XP', 'game-xp-popup');
    createConfetti(20);
    showToast('✓ Correct! +25 XP', 'success');
    setTimeout(() => { sprintIdx = Math.floor(Math.random() * sprintChallenges.length); renderSprint(); }, 1000);
  } else {
    const body = document.getElementById('gamePaperBody');
    const flash = document.createElement('div'); flash.style.cssText = 'text-align:center;color:#f59e0b;font-weight:800;font-size:11px;margin:6px 0;padding:10px;background:rgba(245,158,11,0.08);border-radius:6px;border:1px solid rgba(245,158,11,0.2);';
    flash.innerHTML = '✗ Not quite. Expected something like:<br><code style="color:#a5f3fc;background:#000;padding:6px;border-radius:4px;display:block;margin-top:4px;font-size:11px;text-align:left;">' + escapeHtml(ch.code) + '</code>';
    body.appendChild(flash);
    setTimeout(() => flash.remove(), 3000);
  }
}

// ════════════════════════════════════════
// 5. MEMORY MATCH
// ════════════════════════════════════════
let memoryCards = [], memoryFlipped = [], memoryMatched = [], memoryLocked = false, memoryMoves = 0;

function initMemory() {
  const shuffled = shuffleArr(memoryPairs).slice(0, 12);
  memoryCards = [];
  for (const p of shuffled) { memoryCards.push({id:memoryCards.length, pair:memoryCards.length, text:p.a, val:'a'}); memoryCards.push({id:memoryCards.length, pair:memoryCards.length-1, text:p.b, val:'b'}); }
  memoryCards = shuffleArr(memoryCards);
  memoryFlipped = []; memoryMatched = []; memoryLocked = false; memoryMoves = 0;
  renderMemory();
}
function renderMemory() {
  const body = document.getElementById('gamePaperBody');
  let html = addBackBtn() + `<div style="display:flex;gap:12px;margin-bottom:8px;font-size:11px;color:#64748b;"><span>Moves: <strong id="memMoves">${memoryMoves}</strong></span><span>Matched: <strong>${memoryMatched.length/2}/${memoryCards.length/2}</strong></span></div>`;
  html += '<div class="memory-grid">';
  for (const card of memoryCards) {
    const isFlipped = memoryFlipped.includes(card.id) || memoryMatched.includes(card.id);
    const isMatched = memoryMatched.includes(card.id);
    html += `<div class="memory-card${isFlipped?' flipped':''}${isMatched?' matched':''}" onclick="${!isFlipped&&!memoryLocked?`flipMemCard(${card.id})`:''}">
      <div class="memory-inner"><div class="memory-front">?</div><div class="memory-back">${escapeHtml(card.text)}</div></div>
    </div>`;
  }
  html += '</div>';
  if (memoryMatched.length === memoryCards.length) {
    const xp = Math.max(10, 30 - memoryMoves);
    earnXP(xp);
    createConfetti(40);
    html += `<div class="game-new-record" style="font-size:14px;">All matched! +${xp} XP</div>`;
    html += `<button class="game-new-btn" style="margin-top:8px;" onclick="initMemory()">Play Again</button>`;
  }
  body.innerHTML = html;
}
function flipMemCard(id) {
  if (memoryLocked || memoryFlipped.includes(id) || memoryMatched.includes(id)) return;
  memoryFlipped.push(id); memoryMoves++;
  if (memoryFlipped.length === 2) {
    memoryLocked = true;
    const [a, b] = memoryFlipped;
    const cA = memoryCards.find(c => c.id === a), cB = memoryCards.find(c => c.id === b);
    if (cA.pair === cB.pair && cA.id !== cB.id) {
      memoryMatched.push(a, b); memoryFlipped = []; memoryLocked = false;
      if (memoryMatched.length === memoryCards.length) {
        renderMemory();
      } else {
        showToast('✓ Match!', 'success');
        renderMemory();
      }
    } else {
      setTimeout(() => { memoryFlipped = []; memoryLocked = false; renderMemory(); }, 800);
    }
  }
  renderMemory();
}

// ════════════════════════════════════════
// 6. SPEED READ / CODE FLASH
// ════════════════════════════════════════
let flashQ = [], flashIdx = 0, flashCorrect = 0, flashPhase = 'show', flashTimer = null;

function initFlash() {
  flashQ = shuffleArr(flashQuestions);
  flashIdx = 0; flashCorrect = 0;
  showFlashCode();
}
function showFlashCode() {
  flashPhase = 'show';
  const body = document.getElementById('gamePaperBody');
  const q = flashQ[flashIdx];
  let html = addBackBtn() + `<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Question ${flashIdx+1}/${flashQ.length}  •  Correct: ${flashCorrect}</div>`;
  html += `<div class="game-target"><div class="game-target-label">⚡ Memorize this code (${q.lang||'js'}):</div><div class="game-target-code flash-code-display" style="color:#a5f3fc;font-size:14px;text-align:center;padding:30px;display:flex;align-items:center;justify-content:center;">${escapeHtml(q.code)}</div></div>`;
  const r = 26, circ = circumference(r);
  html += `<div class="flash-countdown-ring"><svg width="60" height="60"><circle class="bg" cx="30" cy="30" r="${r}"/><circle class="fg" cx="30" cy="30" r="${r}" stroke-dasharray="${circ}" stroke-dashoffset="0" id="flashRing"/></svg><div class="num" id="flashCount">5</div></div>`;
  body.innerHTML = html;
  let sec = 5;
  const ring = document.getElementById('flashRing');
  flashTimer = setInterval(() => {
    sec--;
    const el = document.getElementById('flashCount');
    if (el) el.textContent = sec;
    if (ring) ring.style.strokeDashoffset = circ * (1 - sec / 5);
    if (sec <= 0) { clearInterval(flashTimer); askFlashQuestion(); }
  }, 1000);
}
function askFlashQuestion() {
  flashPhase = 'ask';
  const q = flashQ[flashIdx];
  const body = document.getElementById('gamePaperBody');
  let html = addBackBtn() + `<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Question ${flashIdx+1}/${flashQ.length}</div>`;
  html += `<div class="game-target"><div class="game-target-label">${q.asks}</div></div>`;
  for (let i = 0; i < q.opts.length; i++) {
    html += `<button class="flash-opt" onclick="answerFlash(${i})">${String.fromCharCode(65+i)}. ${escapeHtml(q.opts[i])}</button>`;
  }
  body.innerHTML = html;
}
function answerFlash(idx) {
  if (flashPhase === 'done') return;
  const q = flashQ[flashIdx];
  const correct = idx === q.ans;
  if (correct) { flashCorrect++; earnXP(10); showScorePopup('+10 XP', 'game-xp-popup'); }
  flashIdx++;
  const body = document.getElementById('gamePaperBody');
  const flash = document.createElement('div');
  flash.style.cssText = `text-align:center;padding:8px;border-radius:6px;font-weight:800;font-size:13px;margin:8px 0;background:${correct?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)'};color:${correct?'#10b981':'#ef4444'};animation:flashReveal 0.3s ease;`;
  flash.textContent = correct ? '✓ Correct! +10 XP' : '✗ Wrong. Answer: ' + q.opts[q.ans];
  body.appendChild(flash);
  if (correct) createConfetti(15);
  setTimeout(() => {
    if (flashIdx >= flashQ.length) {
      const totalXP = flashCorrect * 10;
      flashPhase = 'done';
      let endHtml = addBackBtn() + `<div style="text-align:center;padding:20px;"><div style="font-size:24px;font-weight:900;color:var(--accent);">${flashCorrect}/${flashQ.length}</div><div style="color:#64748b;margin:8px 0;">Questions correct</div><div style="color:#10b981;font-weight:800;">+${totalXP} XP earned</div><button class="game-new-btn" style="margin-top:12px;" onclick="initFlash()">Play Again</button></div>`;
      body.innerHTML = endHtml;
    } else {
      showFlashCode();
    }
  }, 1200);
}

// ════════════════════════════════════════
// 7. RACE COMPILER
// ════════════════════════════════════════
let raceProblem = 0, raceCode = '', raceTimer = null, raceTimeLeft = 60, raceActive = false;

function initRace() {
  raceProblem = Math.floor(Math.random() * raceProblems.length);
  raceCode = ''; raceTimeLeft = 60; raceActive = false;
  renderRace();
}
function renderRace() {
  const body = document.getElementById('gamePaperBody');
  const p = raceProblems[raceProblem];
  let html = addBackBtn();
  if (!raceActive) {
    html += `<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(20,184,166,0.08),rgba(20,184,166,0.02));border:1px solid rgba(20,184,166,0.2);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>🏎️ Race Against the Compiler</strong><br><span style="color:#a5f3fc;font-size:12px;">${p.desc}</span><br><br><span style="color:#64748b;font-size:11px;">You have 60 seconds. Write working code!</span></div>`;
    html += `<button class="game-new-btn" onclick="startRace()">Start Race!</button>`;
    body.innerHTML = html;
  } else {
    const r = 24, circ = circumference(r);
    const tCls = raceTimeLeft <= 10 ? 'low' : raceTimeLeft <= 25 ? 'mid' : '';
    html += `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;"><div class="race-timer-ring ${tCls}"><svg width="64" height="64"><circle class="bg" cx="32" cy="32" r="${r}"/><circle class="fg" cx="32" cy="32" r="${r}" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - raceTimeLeft / 60)}" id="raceRing"/></svg><div class="num" id="raceTimerNum">${raceTimeLeft}</div></div><span style="font-size:10px;color:#64748b;">seconds left</span></div>`;
    html += `<div class="sprint-desc" style="font-size:12px;padding:10px;background:#0f172a;border-radius:8px;border-left:3px solid var(--accent);">${p.desc}</div>`;
    html += `<textarea id="raceInput" class="game-input" spellcheck="false" style="min-height:120px;" placeholder="Write code...">${escapeHtml(raceCode)}</textarea>`;
    html += `<button class="game-new-btn" style="margin-top:8px;" onclick="checkRace()">Submit</button>`;
    body.innerHTML = html;
    const inp = document.getElementById('raceInput'); if (inp) inp.focus();
  }
}
function startRace() {
  raceActive = true; raceTimeLeft = 60; raceCode = '';
  renderRace();
  const r = 24, circ = circumference(r);
  raceTimer = setInterval(() => {
    raceTimeLeft--;
    const el = document.getElementById('raceTimerNum'); if (el) el.textContent = raceTimeLeft;
    const ring = document.getElementById('raceRing'); if (ring) ring.style.strokeDashoffset = circ * (1 - raceTimeLeft / 60);
    const tc = document.querySelector('.race-timer-ring');
    if (tc) { tc.className = 'race-timer-ring' + (raceTimeLeft <= 10 ? ' low' : raceTimeLeft <= 25 ? ' mid' : ''); }
    if (raceTimeLeft <= 0) { clearInterval(raceTimer); showToast('⏰ Time\'s up!', 'error'); setTimeout(() => renderHub(), 500); }
  }, 1000);
}
function checkRace() {
  const inp = document.getElementById('raceInput'); if (!inp) return;
  raceCode = inp.value; const p = raceProblems[raceProblem];
  if (p.check(raceCode)) {
    clearInterval(raceTimer);
    const bonus = Math.max(5, Math.floor(raceTimeLeft / 5));
    earnXP(30 + bonus);
    createConfetti(35);
    showScorePopup('+' + (30+bonus) + ' XP', 'game-xp-popup');
    const body = document.getElementById('gamePaperBody');
    body.innerHTML = addBackBtn() + `<div class="game-new-record" style="font-size:16px;">✓ Solved! +${30+bonus} XP (${raceTimeLeft}s left)</div><button class="game-new-btn" style="margin-top:12px;" onclick="initRace()">Next Challenge</button>`;
  } else {
    const body = document.getElementById('gamePaperBody');
    const flash = document.createElement('div'); flash.style.cssText = 'text-align:center;color:#f59e0b;font-weight:800;font-size:11px;margin:6px 0;padding:8px;background:rgba(245,158,11,0.08);border-radius:6px;'; flash.textContent = '✗ Not quite. Keep trying! Hint: ' + p.hint;
    body.appendChild(flash);
    setTimeout(() => flash.remove(), 2500);
  }
}

// ════════════════════════════════════════
// 8. SYNTAX SWIPE
// ════════════════════════════════════════
let swipeQ = [], swipeIdx = 0, swipeCorrect = 0, swipeTotal = 0, swipeStreak = 0;
let swipeTouch = { startX: 0, startY: 0, el: null, dragging: false };

function initSwipe() {
  swipeQ = shuffleArr(swipeQuestions);
  swipeIdx = 0; swipeCorrect = 0; swipeTotal = 0; swipeStreak = 0;
  renderSwipe();
}
function renderSwipe() {
  const body = document.getElementById('gamePaperBody');
  if (swipeIdx >= swipeQ.length) {
    const pct = swipeTotal > 0 ? Math.round((swipeCorrect/swipeTotal)*100) : 0;
    earnXP(swipeCorrect * 5);
    createConfetti(30);
    body.innerHTML = addBackBtn() + `<div style="text-align:center;padding:20px;"><div style="font-size:24px;font-weight:900;color:var(--accent);">${swipeCorrect}/${swipeTotal}</div><div style="color:#64748b;margin:8px 0;">(${pct}%) Correct</div><div style="color:#10b981;font-weight:800;">+${swipeCorrect*5} XP</div><button class="game-new-btn" style="margin-top:12px;" onclick="initSwipe()">Play Again</button></div>`;
    return;
  }
  const q = swipeQ[swipeIdx];
  const streakText = swipeStreak >= 3 ? `<span class="swipe-streak ${swipeStreak >= 5 ? 'fire' : 'active'}">🔥 ${swipeStreak} streak</span>` : '';
  let html = addBackBtn() + `<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#64748b;margin-bottom:8px;"><span>${swipeIdx+1}/${swipeQ.length}  •  Correct: ${swipeCorrect}</span>${streakText}</div>`;
  html += `<div class="game-target"><div class="game-target-label">Is this valid syntax? <span style="font-size:9px;color:#475569;">(swipe right ✓ / swipe left ✗)</span></div></div>`;
  html += `<div class="swipe-hint"><span>Swipe ← Invalid</span><span>Valid → Swipe</span></div>`;
  html += `<div class="swipe-card-area"><div class="swipe-card" id="swipeCard">${escapeHtml(q.code)}</div></div>`;
  html += `<div class="swipe-btns"><button class="swipe-btn swipe-no" onclick="answerSwipe(false)">✗ Invalid</button><button class="swipe-btn swipe-yes" onclick="answerSwipe(true)">✓ Valid</button></div>`;
  body.innerHTML = html;
  setupSwipeTouch();
}
function setupSwipeTouch() {
  const card = document.getElementById('swipeCard');
  if (!card) return;
  swipeTouch = { startX: 0, startY: 0, el: card, dragging: false };
  card.addEventListener('mousedown', e => { swipeTouch.startX = e.clientX; swipeTouch.startY = e.clientY; swipeTouch.dragging = true; card.classList.add('dragging'); });
  document.addEventListener('mousemove', e => { if (!swipeTouch.dragging) return; const dx = e.clientX - swipeTouch.startX; if (Math.abs(dx) > 10) { card.style.transform = `translateX(${dx * 0.4}px) rotate(${dx * 0.03}deg)`; card.className = 'swipe-card dragging' + (dx > 0 ? ' swipe-right' : ' swipe-left'); } });
  document.addEventListener('mouseup', e => { if (!swipeTouch.dragging) return; const dx = e.clientX - swipeTouch.startX; card.classList.remove('dragging'); card.style.transform = ''; if (Math.abs(dx) > 80) { answerSwipe(dx > 0); } else { card.className = 'swipe-card'; } swipeTouch.dragging = false; });
  card.addEventListener('touchstart', e => { const t = e.touches[0]; swipeTouch.startX = t.clientX; swipeTouch.startY = t.clientY; swipeTouch.dragging = true; }, {passive:true});
  card.addEventListener('touchmove', e => { if (!swipeTouch.dragging) return; const dx = e.touches[0].clientX - swipeTouch.startX; if (Math.abs(dx) > 10) { e.preventDefault(); card.style.transform = `translateX(${dx * 0.4}px) rotate(${dx * 0.03}deg)`; card.className = 'swipe-card dragging' + (dx > 0 ? ' swipe-right' : ' swipe-left'); } }, {passive:false});
  card.addEventListener('touchend', e => { if (!swipeTouch.dragging) return; const dx = (e.changedTouches[0].clientX - swipeTouch.startX); card.style.transform = ''; if (Math.abs(dx) > 80) { answerSwipe(dx > 0); } else { card.className = 'swipe-card'; } swipeTouch.dragging = false; }, {passive:true});
}
function answerSwipe(ans) {
  const q = swipeQ[swipeIdx];
  swipeTotal++;
  const correct = ans === q.valid;
  if (correct) { swipeCorrect++; swipeStreak++; earnXP(5); } else { swipeStreak = 0; }
  swipeIdx++;
  const body = document.getElementById('gamePaperBody');
  const flash = document.createElement('div');
  flash.style.cssText = `padding:10px;border-radius:6px;font-size:11px;margin:8px 0;line-height:1.5;background:${correct?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)'};border:1px solid ${correct?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'};animation:flashReveal 0.3s ease;`;
  flash.innerHTML = `<div style="font-weight:800;color:${correct?'#10b981':'#ef4444'};margin-bottom:4px;">${correct?'✓ Correct':'✗ Wrong'}</div><div style="color:#94a3b8;">${q.explain}</div>`;
  body.appendChild(flash);
  if (correct) createConfetti(10);
  setTimeout(() => renderSwipe(), correct ? 600 : 1500);
}
