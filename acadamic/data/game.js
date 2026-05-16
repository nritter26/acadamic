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
  { id:'typing',       name:'Typing Speed',     icon:'⌨️', desc:'Type code, test your WPM', color:'#ff6b6b' },
  { id:'scramble',     name:'Code Scramble',    icon:'🔀', desc:'Reorder shuffled code lines', color:'#f59e0b' },
  { id:'debug',        name:'Debug the Bug',    icon:'🐛', desc:'Find and fix the bug', color:'#10b981' },
  { id:'sprint',       name:'Syntax Sprint',    icon:'🏃', desc:'Write code from a description', color:'#3b82f6' },
  { id:'memory',       name:'Memory Match',     icon:'🧠', desc:'Match code concept pairs', color:'#8b5cf6' },
  { id:'flash',        name:'Speed Read',       icon:'⚡', desc:'Read code then answer', color:'#ec4899' },
  { id:'race',         name:'Race Compiler',    icon:'🏎️', desc:'Solve under time pressure', color:'#14b8a6' },
  { id:'swipe',        name:'Syntax Swipe',     icon:'👆', desc:'Valid syntax or not?', color:'#f97316' },
  { id:'codegolf',     name:'Code Golf',        icon:'⛳', desc:'Solve in fewest characters', color:'#ff6b6b' },
  { id:'binaryhex',    name:'Binary/Hex Blitz', icon:'🔄', desc:'Quick base conversions', color:'#a855f7' },
  { id:'crossword',    name:'Crossword',        icon:'🧩', desc:'Programming term puzzle', color:'#06b6d4' },
  { id:'regexrally',   name:'Regex Rally',      icon:'🎯', desc:'Write patterns to match', color:'#22c55e' },
  { id:'sqljoin',      name:'SQL JOIN Match',   icon:'🔗', desc:'Pick the right JOIN', color:'#3b82f6' },
  { id:'errorpedia',   name:'Errorpedia',       icon:'❌', desc:'Guess the error cause', color:'#ef4444' },
  { id:'apiarcade',    name:'API Arcade',       icon:'📡', desc:'Match endpoints & methods', color:'#f97316' },
  { id:'daily',        name:'Daily Challenge',  icon:'🗓️', desc:'One challenge per day', color:'#ec4899' },
];

function renderHub() {
  gameActive = 'hub';
  const body = document.getElementById('gamePaperBody');
  const lvlBonus = gameLevel > 1 ? `<span style="font-size:10px;color:#64748b;margin-left:auto">Lv ${gameLevel}</span>` : '';
  const dcKey = 'dogeslab_daily_' + new Date().toDateString();
  const dcDone = localStorage.getItem(dcKey);
  const achUnlocked = loadAchievements().filter(a => a.unlocked).length;
  const soundOn = localStorage.getItem('dogeslab_sound') !== 'off';
  let html = `<div class="game-hub-top"><span class="game-hub-title">🎮 Game Lab</span>${lvlBonus}</div>
  <div class="game-hub-xp"><div class="game-hub-xp-bar"><div class="game-hub-xp-fill" style="width:${Math.min(100, (gameTotalXP % 100))}%"></div></div><span>${gameTotalXP} XP</span></div>`;
  if (!dcDone) {
    html += `<div class="game-daily-banner" onclick="launchGame('daily')">
      <span class="game-daily-icon">🗓️</span>
      <span class="game-daily-text">Daily Challenge available!</span>
      <span class="game-daily-arrow">→</span>
    </div>`;
  }
  html += `<div class="game-hub-grid">`;
  for (const g of GAMES) {
    const best = g.id === 'typing' ? (gameBestWPM[gameLang] || 0) : 0;
    const lbs = getLeaderboardStats(g.id);
    html += `<div class="game-hub-card" onclick="launchGame('${g.id}')" style="--card-color:${g.color}">
      <div class="game-hub-icon">${g.icon}</div>
      <div class="game-hub-name">${g.name}</div>
      <div class="game-hub-desc">${g.desc}</div>
      ${best ? `<div class="game-hub-best">Best: ${best} WPM</div>` : ''}
      ${lbs.plays > 0 ? `<div class="game-hub-best" style="color:#64748b;">${lbs.plays} played</div>` : ''}
    </div>`;
  }
  html += '</div>';
  html += `<div class="game-hub-bar">
    <button class="game-hub-bar-btn" onclick="renderLeaderboard()">🏆 Leaderboard</button>
    <button class="game-hub-bar-btn" onclick="renderAchievements()">🏅 Achievements (${achUnlocked})</button>
    <button class="game-hub-bar-btn" onclick="renderThemes()">🎨 Themes</button>
    <button class="game-hub-bar-btn" onclick="toggleSound()">🔊 ${soundOn ? 'ON' : 'OFF'}</button>
  </div>`;
  body.innerHTML = html;
}

function getLeaderboardStats(id) {
  try { const d = JSON.parse(localStorage.getItem('dogeslab_lb') || '{}'); const g = d[id]; return g ? g : {plays:0,best:0}; } catch { return {plays:0,best:0}; }
}
function recordPlay(id, score) {
  try { const d = JSON.parse(localStorage.getItem('dogeslab_lb') || '{}'); if (!d[id]) d[id] = {plays:0,best:0}; d[id].plays++; if (score > d[id].best) d[id].best = score; localStorage.setItem('dogeslab_lb', JSON.stringify(d)); } catch {}
}
function toggleSound() {
  const cur = localStorage.getItem('dogeslab_sound');
  localStorage.setItem('dogeslab_sound', cur === 'off' ? 'on' : 'off');
  playSound('click'); renderHub();
}
function playSound(type) {
  if (localStorage.getItem('dogeslab_sound') === 'off') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'correct') { osc.frequency.value = 880; osc.type = 'sine'; gain.gain.value = 0.15; osc.start(); osc.stop(ctx.currentTime + 0.1); }
    else if (type === 'wrong') { osc.frequency.value = 220; osc.type = 'sawtooth'; gain.gain.value = 0.1; osc.start(); osc.stop(ctx.currentTime + 0.15); }
    else if (type === 'levelup') { osc.frequency.value = 1200; osc.type = 'sine'; gain.gain.value = 0.15; osc.start(); osc.stop(ctx.currentTime + 0.2); }
    else if (type === 'click') { osc.frequency.value = 600; osc.type = 'sine'; gain.gain.value = 0.08; osc.start(); osc.stop(ctx.currentTime + 0.05); }
  } catch {}
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
  else if (id === 'codegolf') initGolf();
  else if (id === 'binaryhex') initBinaryHex();
  else if (id === 'crossword') initCrossword();
  else if (id === 'regexrally') initRegexRally();
  else if (id === 'sqljoin') initSqlJoin();
  else if (id === 'errorpedia') initErrorpedia();
  else if (id === 'apiarcade') initApiArcade();
  else if (id === 'daily') initDaily();
}

function addBackBtn() {
  return `<button class="game-back-btn" onclick="renderHub()">← Back</button>`;
}

function earnXP(amt) {
  gameTotalXP += amt;
  const newLvl = Math.floor(gameTotalXP / 100) + 1;
  if (newLvl > gameLevel) { gameLevel = newLvl; createConfetti(60); playSound('levelup'); setTimeout(() => showToast('🎉 Level Up! You reached level ' + gameLevel + '!', 'xp'), 200); }
  try { localStorage.setItem('dogeslab_game_xp', JSON.stringify({xp:gameTotalXP,lvl:gameLevel})); } catch {}
  checkAchievements();
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

// ════════════════════════════════════════
// EXPANDED DATA FOR EXISTING GAMES
// ════════════════════════════════════════
// Additional typing snippets
gameSnippets.js.push(
  'const isPalindrome = (s) => s === s.split("").reverse().join("");',
  'function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }',
  'const unique = (arr) => [...new Set(arr)];',
  'const shuffled = (arr) => [...arr].sort(() => Math.random() - 0.5);',
  'const average = (arr) => arr.reduce((a,b) => a + b, 0) / arr.length;',
  'const binarySearch = (arr, target) => {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}'
);
gameSnippets.py.push(
  'def is_palindrome(s):\n    return s == s[::-1]',
  'def factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)',
  'unique = lambda arr: list(set(arr))',
  'def average(arr):\n    return sum(arr) / len(arr)',
  'import json\n\ndef save_data(data, path):\n    with open(path, "w") as f:\n        json.dump(data, f)'
);
gameSnippets.go.push(
  'func isPalindrome(s string) bool {\n  for i := 0; i < len(s)/2; i++ {\n    if s[i] != s[len(s)-1-i] { return false }\n  }\n  return true\n}',
  'func factorial(n int) int {\n  if n <= 1 { return 1 }\n  return n * factorial(n-1)\n}',
  'func unique(arr []int) []int {\n  seen := make(map[int]bool)\n  var res []int\n  for _, v := range arr {\n    if !seen[v] { seen[v] = true; res = append(res, v) }\n  }\n  return res\n}'
);
// Additional debug challenges
debugChallenges.push(
  { bug: 'function sum(a, b) {\n  return a * b;\n}', fix: 'function sum(a, b) {\n  return a + b;\n}', hint: 'Wrong arithmetic operator', lang: 'js' },
  { bug: 'const isEven = (n) => n % 2 === 1;', fix: 'const isEven = (n) => n % 2 === 0;', hint: 'Check the remainder for evens', lang: 'js' },
  { bug: 'let x = 10;\nif (x = 5) { console.log("yes"); }', fix: 'let x = 10;\nif (x === 5) { console.log("yes"); }', hint: 'Assignment vs comparison', lang: 'js' },
  { bug: 'for i in range(10)\n    print(i)', fix: 'for i in range(10):\n    print(i)', hint: 'Missing colon after for', lang: 'py' },
  { bug: 'console.log("hello world")', fix: 'console.log("hello world");', hint: 'Missing semicolon', lang: 'js' },
  { bug: 'fn main() {\n  let mut x = 5;\n  x = 10;\n  println!("{}", x);\n}', fix: 'fn main() {\n  let x = 5;\n  println!("{}", x);\n}', hint: 'Variable x is never mutated, remove mut' }
);
// Add a few more scramble sets
scrambleSets.push(
  { lines: ['function isEven(n) {', '  return n % 2 === 0;', '}'], lang: 'js' },
  { lines: ['const multiply = (a, b) => {', '  return a * b;', '};'], lang: 'js' },
  { lines: ['def greet(name):', '    return f"Hello, {name}!"', 'print(greet("World"))'], lang: 'py' },
  { lines: ['package main', 'import "fmt"', 'func main() {', '  fmt.Println("Hello, 世界")', '}'], lang: 'go' }
);
// Additional sprint challenges
sprintChallenges.push(
  { desc: 'Declare a constant PI = 3.14159 and log it', code: 'const PI = 3.14159;\nconsole.log(PI);', lang: 'js' },
  { desc: 'Create an arrow function that returns the square of a number', code: 'const square = (n) => n * n;', lang: 'js' },
  { desc: 'Filter an array to only even numbers', code: 'const evens = [1,2,3,4,5].filter(n => n % 2 === 0);', lang: 'js' },
  { desc: 'Create a list of squares from 1 to 5 using list comprehension', code: 'squares = [x**2 for x in range(1, 6)]\nprint(squares)', lang: 'py' },
  { desc: 'Print each character of "hello" on its own line', code: 'for c in "hello":\n    print(c)', lang: 'py' }
);
// Additional flash questions
flashQuestions.push(
  { code: 'console.log(2 + "2");', asks: 'What does this print?', ans: 0, opts: ['"22"', '4', '"4"', 'Error'] },
  { code: 'const x = null;\nconsole.log(typeof x);', asks: 'What is the output?', ans: 0, opts: ['"object"', '"null"', 'null', 'undefined'] },
  { code: 'console.log(0.1 + 0.2 === 0.3);', asks: 'What does this print?', ans: 1, opts: ['true', 'false', 'undefined', 'NaN'] },
  { code: 'console.log([] == ![]);', asks: 'What is the output?', ans: 0, opts: ['true', 'false', 'Error', 'undefined'] },
  { code: 'print(type(42))', asks: 'What type is printed in Python?', ans: 2, opts: ['int', 'Integer', "<class 'int'>", '<int>'] }
);
// Additional swipe questions
swipeQuestions.push(
  { code: 'switch (x) {\n  case 1: break;\n}', valid: true, explain: 'Valid switch statement structure' },
  { code: 'const f = () => { return 42; };', valid: true, explain: 'Valid arrow function' },
  { code: 'if (x > 5) console.log("big"); else console.log("small");', valid: true, explain: 'Valid if-else on single line' },
  { code: 'try {\n  doSomething();\n} catch {\n  // handle\n}', valid: true, explain: 'Valid try-catch (modern JS)' },
  { code: 'const arr = [1, 2, 3];\nconsole.log(arr[-1]);', valid: true, explain: 'Valid JS, returns undefined, not an error' },
  { code: 'for (i = 0; i < 10; i++) {}', valid: true, explain: 'Valid JS, i becomes global' },
  { code: 'function() { return 42; }', valid: false, explain: 'Function declaration needs a name' },
  { code: 'const obj = { get name() { return "x"; } };', valid: true, explain: 'Valid getter syntax' },
  { code: 'const { name, age } = person;', valid: true, explain: 'Valid destructuring assignment' },
  { code: 'let x = 5; let x = 10;', valid: false, explain: 'Cannot redeclare let in same scope' },
  { code: 'const x = [1, 2, 3];\nx = [4, 5, 6];', valid: false, explain: 'Cannot reassign a const variable' },
  { code: 'console.log(`Hello ${name}!`);', valid: true, explain: 'Valid template literal' }
);

// ════════════════════════════════════════
// LEADERBOARD
// ════════════════════════════════════════
function renderLeaderboard() {
  const body = document.getElementById('gamePaperBody');
  try { const d = JSON.parse(localStorage.getItem('dogeslab_lb') || '{}');
  let html = addBackBtn() + '<div class="lb-title">🏆 Leaderboard</div><div class="lb-list">';
  const entries = Object.entries(d).sort((a,b) => (b[1].best||0) - (a[1].best||0));
  if (!entries.length) { html += '<div class="lb-empty">No games played yet. Start playing to see scores!</div>'; }
  else { for (const [id, data] of entries) { const g = GAMES.find(g => g.id === id); html += `<div class="lb-row"><span class="lb-icon">${g ? g.icon : '🎮'}</span><span class="lb-name">${g ? g.name : id}</span><span class="lb-plays">${data.plays} plays</span><span class="lb-best">Best: ${data.best}</span></div>`; } }
  html += '</div>'; body.innerHTML = html; } catch { body.innerHTML = addBackBtn() + '<div class="lb-empty">Error loading leaderboard.</div>'; }
}

// ════════════════════════════════════════
// ACHIEVEMENTS
// ════════════════════════════════════════
const ACHIEVEMENT_DEFS = [
  { id:'first_game',    name:'First Steps',     desc:'Complete your first game',        icon:'🎮', check: s => s.totalPlays >= 1 },
  { id:'five_games',    name:'Getting Started',  desc:'Play 5 games',                    icon:'🎯', check: s => s.totalPlays >= 5 },
  { id:'twenty_games',  name:'Dedicated',        desc:'Play 20 games',                   icon:'🔥', check: s => s.totalPlays >= 20 },
  { id:'hundred_xp',    name:'Three Digits',     desc:'Earn 100 XP',                     icon:'💯', check: s => s.totalXP >= 100 },
  { id:'five_hundred_xp',name:'Half Kilo',       desc:'Earn 500 XP',                     icon:'🏅', check: s => s.totalXP >= 500 },
  { id:'thousand_xp',   name:'XP Master',        desc:'Earn 1000 XP',                    icon:'👑', check: s => s.totalXP >= 1000 },
  { id:'level_5',       name:'Level Up!',        desc:'Reach level 5',                   icon:'⭐', check: s => s.level >= 5 },
  { id:'level_10',      name:'Double Digits',    desc:'Reach level 10',                  icon:'🌟', check: s => s.level >= 10 },
  { id:'typing_50',     name:'Finger Flex',      desc:'Get 50 WPM in Typing',            icon:'⌨️', check: s => s.typingBest >= 50 },
  { id:'typing_80',     name:'Speed Demon',      desc:'Get 80 WPM in Typing',            icon:'⚡', check: s => s.typingBest >= 80 },
  { id:'scramble_5',    name:'Puzzle Solver',    desc:'Win 5 Scramble rounds',           icon:'🧩', check: s => s.scrambleWins >= 5 },
  { id:'debug_10',      name:'Bug Hunter',       desc:'Fix 10 bugs',                     icon:'🐛', check: s => s.debugFixed >= 10 },
  { id:'memory_full',   name:'Memory Master',    desc:'Complete a full Memory game',     icon:'🧠', check: s => s.memoryComplete >= 1 },
  { id:'flash_perfect', name:'Speed Reader',     desc:'Get all Flash questions right',   icon:'📖', check: s => s.flashPerfect >= 1 },
  { id:'swipe_10',      name:'Syntax Expert',    desc:'Get 10 Swipe questions right',    icon:'👆', check: s => s.swipeCorrect >= 10 },
  { id:'daily_3',       name:'Daily Devotee',    desc:'Complete 3 Daily Challenges',     icon:'🗓️', check: s => s.dailyDone >= 3 },
  { id:'daily_7',       name:'Week Warrior',     desc:'Complete 7 Daily Challenges',     icon:'📅', check: s => s.dailyDone >= 7 },
  { id:'golf_par',      name:'Code Golfer',      desc:'Get under par in Code Golf',      icon:'⛳', check: s => s.golfUnderPar >= 1 },
  { id:'golf_3_par',    name:'Golf Pro',         desc:'Get 3 under-par scores',          icon:'🏌️', check: s => s.golfUnderPar >= 3 },
  { id:'regex_5',       name:'Pattern Seeker',   desc:'Solve 5 Regex challenges',        icon:'🎯', check: s => s.regexSolved >= 5 },
  { id:'sql_5',         name:'Query Master',     desc:'Answer 5 SQL JOIN questions',     icon:'🗄️', check: s => s.sqlCorrect >= 5 },
  { id:'api_5',         name:'API Whisperer',    desc:'Answer 5 API Arcade questions',   icon:'📡', check: s => s.apiCorrect >= 5 },
  { id:'binary_10',     name:'Base Jumper',      desc:'Convert 10 numbers correctly',    icon:'🔄', check: s => s.binaryCorrect >= 10 },
  { id:'crossword_5',   name:'Word Wizard',      desc:'Solve 5 Crossword terms',         icon:'🔤', check: s => s.crosswordSolved >= 5 },
  { id:'error_5',       name:'Error Handler',     desc:'Answer 5 Errorpedia questions',  icon:'🚫', check: s => s.errorCorrect >= 5 },
];

function loadAchievements() {
  try { return JSON.parse(localStorage.getItem('dogeslab_ach') || '[]'); } catch { return []; }
}
function saveAchievements(list) {
  try { localStorage.setItem('dogeslab_ach', JSON.stringify(list)); } catch {}
}
function checkAchievements() {
  const unlocked = loadAchievements();
  const state = gatherAchievementState();
  let changed = false;
  for (const def of ACHIEVEMENT_DEFS) {
    if (unlocked.find(a => a.id === def.id)) continue;
    if (def.check(state)) {
      unlocked.push({ id: def.id, unlockedAt: Date.now() });
      changed = true;
      playSound('levelup');
      setTimeout(() => showToast('🏅 Achievement: ' + def.name + '!', 'xp'), 400);
    }
  }
  if (changed) saveAchievements(unlocked);
}
function gatherAchievementState() {
  const lb = JSON.parse(localStorage.getItem('dogeslab_lb') || '{}');
  const xpData = JSON.parse(localStorage.getItem('dogeslab_game_xp') || '{}');
  const extra = JSON.parse(localStorage.getItem('dogeslab_ach_extra') || '{}');
  const wpm = JSON.parse(localStorage.getItem('dogeslab_game_best') || '{}');
  const typingBest = Math.max(...Object.values(wpm).filter(v => typeof v === 'number'), 0);
  let totalPlays = 0; for (const v of Object.values(lb)) totalPlays += (v.plays || 0);
  return {
    totalXP: xpData.xp || 0, level: xpData.lvl || 1, totalPlays,
    typingBest, scrambleWins: extra.scrambleWins || 0, debugFixed: extra.debugFixed || 0,
    memoryComplete: extra.memoryComplete || 0, flashPerfect: extra.flashPerfect || 0,
    swipeCorrect: extra.swipeCorrect || 0, dailyDone: extra.dailyDone || 0,
    golfUnderPar: extra.golfUnderPar || 0, regexSolved: extra.regexSolved || 0,
    sqlCorrect: extra.sqlCorrect || 0, apiCorrect: extra.apiCorrect || 0,
    binaryCorrect: extra.binaryCorrect || 0, crosswordSolved: extra.crosswordSolved || 0,
    errorCorrect: extra.errorCorrect || 0,
  };
}
function recordAchievementStat(key, inc) {
  try { const d = JSON.parse(localStorage.getItem('dogeslab_ach_extra') || '{}'); d[key] = (d[key] || 0) + inc; localStorage.setItem('dogeslab_ach_extra', JSON.stringify(d)); } catch {}
  checkAchievements();
}
function renderAchievements() {
  const body = document.getElementById('gamePaperBody');
  const unlocked = loadAchievements();
  let html = addBackBtn() + '<div class="lb-title">🏅 Achievements</div><div class="ach-grid">';
  for (const def of ACHIEVEMENT_DEFS) {
    const isUnlocked = unlocked.find(a => a.id === def.id);
    html += `<div class="ach-card ${isUnlocked ? 'ach-unlocked' : 'ach-locked'}">
      <div class="ach-icon">${isUnlocked ? def.icon : '🔒'}</div>
      <div class="ach-name">${def.name}</div>
      <div class="ach-desc">${def.desc}</div>
    </div>`;
  }
  html += '</div>'; body.innerHTML = html;
}

// ════════════════════════════════════════
// THEMES
// ════════════════════════════════════════
const THEMES = [
  { id:'default',  name:'Default',       accent:'var(--js)',       bg:'#020617',   card:'#1e293b',  unlockXP: 0 },
  { id:'midnight', name:'Midnight',      accent:'#818cf8',        bg:'#0f0e17',   card:'#1a1a2e',  unlockXP: 100 },
  { id:'forest',   name:'Forest',        accent:'#34d399',        bg:'#022c22',   card:'#064e3b',  unlockXP: 250 },
  { id:'sunset',   name:'Sunset',        accent:'#fb923c',        bg:'#1c1917',   card:'#292524',  unlockXP: 500 },
  { id:'ocean',    name:'Ocean',         accent:'#38bdf8',        bg:'#082f49',   card:'#0c4a6e',  unlockXP: 750 },
  { id:'cherry',   name:'Cherry Blossom',accent:'#f472b6',        bg:'#1f0f1a',   card:'#2d1b2e',  unlockXP: 1000 },
];
function renderThemes() {
  const body = document.getElementById('gamePaperBody');
  const curTheme = localStorage.getItem('dogeslab_theme') || 'default';
  const xpData = JSON.parse(localStorage.getItem('dogeslab_game_xp') || '{}');
  const totalXP = xpData.xp || 0;
  let html = addBackBtn() + '<div class="lb-title">🎨 Themes</div><div class="theme-grid">';
  for (const t of THEMES) {
    const locked = totalXP < t.unlockXP;
    const active = curTheme === t.id;
    html += `<div class="theme-card ${active ? 'theme-active' : ''} ${locked ? 'theme-locked' : ''}" onclick="${locked ? '' : "applyTheme('" + t.id + "')"}">
      <div class="theme-preview" style="background:${t.bg};border:2px solid ${t.accent};">
        <div class="theme-preview-card" style="background:${t.card};"></div>
        <div class="theme-preview-accent" style="background:${t.accent};"></div>
      </div>
      <div class="theme-name">${t.name}</div>
      ${locked ? `<div class="theme-lock">🔒 ${t.unlockXP} XP</div>` : (active ? '<div class="theme-active-badge">✓ Active</div>' : '<div class="theme-unlock">Click to apply</div>')}
    </div>`;
  }
  html += '</div>'; body.innerHTML = html;
}
function applyTheme(id) {
  const t = THEMES.find(x => x.id === id); if (!t) return;
  localStorage.setItem('dogeslab_theme', id);
  document.documentElement.style.setProperty('--bg', t.bg);
  document.documentElement.style.setProperty('--card', t.card);
  document.documentElement.style.setProperty('--accent', t.accent);
  playSound('click'); renderThemes();
}
function loadTheme() {
  const id = localStorage.getItem('dogeslab_theme') || 'default';
  const t = THEMES.find(x => x.id === id); if (!t) return;
  document.documentElement.style.setProperty('--bg', t.bg);
  document.documentElement.style.setProperty('--card', t.card);
  document.documentElement.style.setProperty('--accent', t.accent);
}
// load theme on page load
loadTheme();

// ════════════════════════════════════════
// 9. CODE GOLF
// ════════════════════════════════════════
const golfChallenges = [
  { desc: 'Return the sum of two numbers',         par: 14, check: function(c) { return c.includes('=>') && c.includes('+'); } },
  { desc: 'Return the square of n',                par: 12, check: function(c) { return c.includes('=>') && (c.includes('*') || c.includes('**')); } },
  { desc: 'Return true if n is even',               par: 16, check: function(c) { return c.includes('%') && c.includes('==='); } },
  { desc: 'Return the first element of an array',   par: 13, check: function(c) { return c.includes('=>') && c.includes('['); } },
  { desc: 'Double each element of an array',        par: 20, check: function(c) { return c.includes('map') && c.includes('=>'); } },
  { desc: 'Return the length of a string',           par: 15, check: function(c) { return c.includes('=>') && c.includes('length'); } },
  { desc: 'Concatenate two strings',                 par: 10, check: function(c) { return c.includes('=>') || (c.includes('function') && c.includes('+')); } },
  { desc: 'Return max of two numbers',               par: 18, check: function(c) { return c.includes('=>') && (c.includes('>') || c.includes('Math')); } },
  { desc: 'Return absolute value of n',              par: 15, check: function(c) { return c.includes('=>') && (c.includes('<') || c.includes('Math')); } },
  { desc: 'Capitalize first letter of a string',    par: 24, check: function(c) { return c.includes('charAt') || (c.includes('[') && c.includes('toUpperCase') && c.includes('slice')); } },
];
let golfIdx = 0, golfScore = 0;
function initGolf() { golfIdx = Math.floor(Math.random() * golfChallenges.length); golfScore = 0; renderGolf(); }
function renderGolf() {
  const body = document.getElementById('gamePaperBody');
  const ch = golfChallenges[golfIdx];
  let html = addBackBtn() + '<div style="display:flex;gap:12px;margin-bottom:8px;font-size:10px;color:#64748b;"><span>Score: ' + golfScore + '</span></div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(255,107,107,0.08),rgba(255,107,107,0.02));border:1px solid rgba(255,107,107,0.2);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>⛳ Code Golf &mdash; Par ' + ch.par + '</strong><br><span style="color:#a5f3fc;font-size:12px;">' + ch.desc + '</span></div>';
  html += '<textarea id="golfInput" class="game-input" spellcheck="false" style="min-height:80px;" placeholder="Write the shortest code you can..."></textarea>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;"><button class="game-new-btn" style="flex:1;" onclick="checkGolf()">Submit</button><button class="game-new-btn" style="flex:1;background:#1e293b;color:#94a3b8;" onclick="initGolf()">Skip</button></div>';
  html += '<div id="golfResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html; var inp = document.getElementById('golfInput'); if (inp) inp.focus();
}
function checkGolf() {
  var inp = document.getElementById('golfInput'); if (!inp) return;
  var code = inp.value.trim(); var ch = golfChallenges[golfIdx];
  if (!ch.check(code)) { document.getElementById('golfResult').innerHTML = '<span style="color:#ef4444;">✗ Code doesn\'t work as expected</span>'; return; }
  var len = code.length; var diff = len - ch.par; var xp = 0;
  if (diff <= 0) { golfScore += 3; xp = 30; createConfetti(40); playSound('correct'); document.getElementById('golfResult').innerHTML = '<span style="color:#10b981;">✓ Under par! +30 XP (' + len + ' chars)</span>'; recordAchievementStat('golfUnderPar', 1); }
  else if (diff <= 3) { golfScore += 2; xp = 20; createConfetti(20); playSound('correct'); document.getElementById('golfResult').innerHTML = '<span style="color:#10b981;">✓ At par! +20 XP (' + len + ' chars)</span>'; }
  else if (diff <= 10) { golfScore += 1; xp = 10; playSound('correct'); document.getElementById('golfResult').innerHTML = '<span style="color:#10b981;">✓ +10 XP (' + len + ' chars, ' + diff + ' over par)</span>'; }
  else { playSound('wrong'); document.getElementById('golfResult').innerHTML = '<span style="color:#ef4444;">✗ ' + diff + ' over par, try to golf it down</span>'; return; }
  if (xp > 0) earnXP(xp);
  setTimeout(function() { golfIdx = Math.floor(Math.random() * golfChallenges.length); renderGolf(); }, 1500);
}

// ════════════════════════════════════════
// 10. BINARY/HEX BLITZ
// ════════════════════════════════════════
const baseConvQuestions = [
  { num: 42,  from: 'dec', to: 'bin', answer: '101010' },
  { num: 255, from: 'dec', to: 'bin', answer: '11111111' },
  { num: 15,  from: 'dec', to: 'bin', answer: '1111' },
  { num: 128, from: 'dec', to: 'bin', answer: '10000000' },
  { num: 7,   from: 'dec', to: 'bin', answer: '111' },
  { num: 10,  from: 'dec', to: 'bin', answer: '1010' },
  { num: 100, from: 'dec', to: 'bin', answer: '1100100' },
  { num: 16,  from: 'dec', to: 'bin', answer: '10000' },
  { num: 31,  from: 'dec', to: 'bin', answer: '11111' },
  { num: 64,  from: 'dec', to: 'bin', answer: '1000000' },
  { num: 255, from: 'dec', to: 'hex', answer: 'ff' },
  { num: 42,  from: 'dec', to: 'hex', answer: '2a' },
  { num: 16,  from: 'dec', to: 'hex', answer: '10' },
  { num: 100, from: 'dec', to: 'hex', answer: '64' },
  { num: 0,   from: 'dec', to: 'hex', answer: '0' },
  { num: 10,  from: 'dec', to: 'hex', answer: 'a' },
  { num: 31,  from: 'dec', to: 'hex', answer: '1f' },
  { num: 128, from: 'dec', to: 'hex', answer: '80' },
  { num: 200, from: 'dec', to: 'hex', answer: 'c8' },
  { num: 15,  from: 'dec', to: 'hex', answer: 'f' },
];
var bhIdx = 0, bhScore = 0, bhTotal = 0, bhCorrect = 0, bhTimer = null, bhTimeLeft = 45;
function initBinaryHex() { bhIdx = 0; bhScore = 0; bhTotal = 0; bhCorrect = 0; bhTimeLeft = 45; renderBinaryHex(); }
function renderBinaryHex() {
  var body = document.getElementById('gamePaperBody');
  if (bhIdx >= baseConvQuestions.length) { bhIdx = 0; }
  var q = baseConvQuestions[bhIdx];
  var pct = bhTotal > 0 ? Math.round((bhCorrect/bhTotal)*100) : 100;
  var html = addBackBtn() + '<div style="display:flex;gap:12px;font-size:10px;color:#64748b;margin-bottom:8px;"><span>Score: ' + bhScore + '</span><span>Accuracy: ' + pct + '%</span><span>Time: <strong id="bhTime">' + bhTimeLeft + '</strong>s</span></div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(168,85,247,0.08),rgba(168,85,247,0.02));border:1px solid rgba(168,85,247,0.2);border-radius:10px;padding:20px;margin-bottom:10px;text-align:center;"><span style="font-size:32px;font-weight:900;color:#a5f3fc;letter-spacing:2px;">' + q.num + '</span><br><span style="color:#94a3b8;font-size:11px;">Convert to <strong>' + q.to.toUpperCase() + '</strong></span></div>';
  html += '<input id="bhInput" class="game-input" style="min-height:40px;height:40px;padding:8px 12px;" placeholder="Enter the ' + q.to.toUpperCase() + ' value..." onkeydown="if(event.key===\'Enter\') checkBinaryHex()">';
  html += '<div style="display:flex;gap:8px;margin-top:8px;"><button class="game-new-btn" style="flex:1;" onclick="checkBinaryHex()">Submit</button></div>';
  html += '<div id="bhResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html; var inp = document.getElementById('bhInput'); if (inp) inp.focus();
  if (!bhTimer) { bhTimer = setInterval(function() { bhTimeLeft--; var el = document.getElementById('bhTime'); if (el) el.textContent = bhTimeLeft; if (bhTimeLeft <= 0) { clearInterval(bhTimer); bhTimer = null; showToast('⏰ Time\'s up!', 'error'); renderHub(); } }, 1000); }
}
function checkBinaryHex() {
  var inp = document.getElementById('bhInput'); if (!inp) return;
  var code = inp.value.trim().toLowerCase(); var q = baseConvQuestions[bhIdx]; bhTotal++;
  if (code === q.answer) { bhCorrect++; bhScore++; earnXP(5); playSound('correct'); recordAchievementStat('binaryCorrect', 1); createConfetti(10); document.getElementById('bhResult').innerHTML = '<span style="color:#10b981;">✓ Correct! +5 XP</span>'; }
  else { playSound('wrong'); document.getElementById('bhResult').innerHTML = '<span style="color:#ef4444;">✗ Wrong. Answer: ' + q.answer + '</span>'; }
  bhIdx++; setTimeout(function() { renderBinaryHex(); }, 800);
}

// ════════════════════════════════════════
// 11. CROSSWORD (Word Fill)
// ════════════════════════════════════════
const crosswordTerms = [
  { term: 'variable', clue: 'A named storage location for a value' },
  { term: 'function', clue: 'A reusable block of code' },
  { term: 'array', clue: 'An ordered collection of elements' },
  { term: 'object', clue: 'A collection of key-value pairs in JS' },
  { term: 'string', clue: 'A sequence of characters' },
  { term: 'number', clue: 'A numeric data type' },
  { term: 'boolean', clue: 'A true/false value' },
  { term: 'method', clue: 'A function that belongs to an object' },
  { term: 'loop', clue: 'Repeats a block of code' },
  { term: 'class', clue: 'A blueprint for creating objects' },
  { term: 'module', clue: 'A reusable piece of code, often a file' },
  { term: 'import', clue: 'Bring external code into scope' },
  { term: 'export', clue: 'Make code available to other modules' },
  { term: 'promise', clue: 'Represents an asynchronous operation' },
  { term: 'callback', clue: 'A function passed as an argument' },
  { term: 'closure', clue: 'A function with access to outer scope' },
  { term: 'prototype', clue: 'JS inheritance mechanism' },
  { term: 'recursion', clue: 'A function that calls itself' },
  { term: 'operator', clue: 'A symbol that performs an operation (e.g., +)' },
  { term: 'console', clue: 'A built-in object for logging' },
  { term: 'debugger', clue: 'A tool for finding bugs' },
  { term: 'syntax', clue: 'The set of rules for writing code' },
  { term: 'compile', clue: 'Transform source code into machine code' },
  { term: 'server', clue: 'A computer that serves data to clients' },
  { term: 'client', glue: 'A device or program that requests data' },
];
var cwIdx = 0, cwScore = 0;
function initCrossword() { cwIdx = Math.floor(Math.random() * crosswordTerms.length); cwScore = 0; renderCrossword(); }
function cwBuildBlanks(typed) {
  var t = crosswordTerms[cwIdx]; if (!t) return '';
  var term = t.term; var h = '';
  for (var i = 0; i < term.length; i++) {
    var ch = (typed && i < typed.length) ? typed[i] : '_';
    h += '<span class="cw-box' + ((typed && i < typed.length) ? ' cw-filled' : '') + '">' + ch + '</span>';
  }
  return h;
}
function cwOnInput() {
  var inp = document.getElementById('cwInput');
  if (!inp) return;
  var val = inp.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
  inp.value = val;
  var t = crosswordTerms[cwIdx];
  if (t) inp.maxLength = t.term.length;
  var el = document.getElementById('cwBlanks');
  if (el) el.innerHTML = cwBuildBlanks(val);
  if (t && val.length >= t.term.length) checkCrossword();
}
function renderCrossword() {
  var body = document.getElementById('gamePaperBody');
  var t = crosswordTerms[cwIdx];
  var html = addBackBtn() + '<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Solved: ' + cwScore + '</div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(6,182,212,0.08),rgba(6,182,212,0.02));border:1px solid rgba(6,182,212,0.2);border-radius:10px;padding:20px;margin-bottom:10px;text-align:center;">';
  html += '<div class="cw-row" id="cwBlanks">' + cwBuildBlanks('') + '</div>';
  html += '<div style="color:#94a3b8;font-size:14px;margin-bottom:8px;">📖 <em>' + t.clue + '</em></div>';
  html += '<div style="color:#64748b;font-size:10px;">Length: ' + t.term.length + ' &middot; Hint: starts with "' + t.term[0] + '", ends with "' + t.term[t.term.length-1] + '"</div>';
  html += '</div>';
  html += '<input id="cwInput" class="game-input" style="min-height:40px;height:40px;padding:8px 12px;text-align:center;font-size:16px;letter-spacing:4px;" placeholder="Type here..." oninput="cwOnInput()" onkeydown="if(event.key===\'Enter\') cwOnInput()" autocomplete="off">';
  html += '<div id="cwResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html; var inp = document.getElementById('cwInput'); if (inp) inp.focus();
}
function checkCrossword() {
  var inp = document.getElementById('cwInput'); if (!inp) return;
  var ans = inp.value.trim().toLowerCase(); var t = crosswordTerms[cwIdx];
  if (ans === t.term.toLowerCase()) { cwScore++; earnXP(15); playSound('correct'); recordAchievementStat('crosswordSolved', 1); createConfetti(15); if (document.getElementById('cwResult')) document.getElementById('cwResult').innerHTML = '<span style="color:#10b981;">✓ Correct! +15 XP</span>'; }
  else { playSound('wrong'); if (document.getElementById('cwResult')) document.getElementById('cwResult').innerHTML = '<span style="color:#ef4444;">✗ Wrong. The term was: <strong>' + t.term + '</strong></span>'; }
  var el = document.getElementById('cwInput'); if (el) el.disabled = true;
  setTimeout(function() { cwIdx = Math.floor(Math.random() * crosswordTerms.length); renderCrossword(); }, 1200);
}

// ════════════════════════════════════════
// 12. REGEX RALLY
// ════════════════════════════════════════
const regexChallenges = [
  { desc: 'Match any string containing "hello"',           hint: 'hello',     check: function(r) { return /hello/.test(r.pattern ? r.pattern : r); }, testPass: ['hello', 'say hello', 'hello!'], testFail: ['hi', 'bye', 'help'] },
  { desc: 'Match a string that starts with "abc"',          hint: '^abc',      check: function(r) { return /^abc/.test(r.pattern ? r.pattern : r); }, testPass: ['abc', 'abc123', 'abcdef'], testFail: ['xabc', 'ab', 'ABC'] },
  { desc: 'Match a string that ends with "end"',            hint: 'end$',      check: function(r) { return /end$/.test(r.pattern ? r.pattern : r); }, testPass: ['theend', 'end', 'friend'], testFail: ['ending', 'endless', 'e'] },
  { desc: 'Match digits only (one or more)',                hint: '^\\d+$',    check: function(r) { return /^\d+$/.test(r.pattern ? r.pattern : r); }, testPass: ['123', '0', '999'], testFail: ['a', '123a', ''] },
  { desc: 'Match a valid email (simple)',                   hint: '\\S+@\\S+', check: function(r) { return /\S+@\S+\.\S+/.test(r.pattern ? r.pattern : r); }, testPass: ['a@b.com', 'x@y.io'], testFail: ['a@b', '@b.com', 'no'] },
  { desc: 'Match strings with only lowercase letters',      hint: '^[a-z]+$',  check: function(r) { return /^[a-z]+$/.test(r.pattern ? r.pattern : r); }, testPass: ['hello', 'abc', 'test'], testFail: ['Hello', '123', 'hi!'] },
];
var regexIdx = 0, regexScore = 0;
function initRegexRally() { regexIdx = Math.floor(Math.random() * regexChallenges.length); regexScore = 0; renderRegexRally(); }
function renderRegexRally() {
  var body = document.getElementById('gamePaperBody');
  var ch = regexChallenges[regexIdx];
  var html = addBackBtn() + '<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Score: ' + regexScore + '</div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.02));border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>🎯 Regex Rally</strong><br><span style="color:#a5f3fc;font-size:12px;">' + ch.desc + '</span><br><span style="color:#64748b;font-size:10px;">💡 Hint: ' + ch.hint + '</span></div>';
  html += '<div style="font-size:10px;color:#94a3b8;margin-bottom:6px;">✅ Should match:</div><div style="font-family:Consolas,monospace;font-size:11px;color:#10b981;margin-bottom:8px;">' + ch.testPass.map(function(s) { return '&nbsp;&nbsp;✓ "' + s + '"<br>'; }).join('') + '</div>';
  html += '<div style="font-size:10px;color:#94a3b8;margin-bottom:6px;">❌ Should NOT match:</div><div style="font-family:Consolas,monospace;font-size:11px;color:#ef4444;margin-bottom:10px;">' + ch.testFail.map(function(s) { return '&nbsp;&nbsp;✗ "' + s + '"<br>'; }).join('') + '</div>';
  html += '<input id="regexInput" class="game-input" style="min-height:40px;height:40px;padding:8px 12px;font-size:14px;" placeholder="Enter regex pattern (without /)" onkeydown="if(event.key===\'Enter\') checkRegexRally()">';
  html += '<button class="game-new-btn" style="margin-top:8px;" onclick="checkRegexRally()">Test Pattern</button>';
  html += '<div id="regexResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html; var inp = document.getElementById('regexInput'); if (inp) inp.focus();
}
function checkRegexRally() {
  var inp = document.getElementById('regexInput'); if (!inp) return;
  var pattern = inp.value.trim(); var ch = regexChallenges[regexIdx];
  try {
    var re = new RegExp(pattern);
    var passOk = ch.testPass.every(function(s) { return re.test(s); });
    var failOk = ch.testFail.every(function(s) { return !re.test(s); });
    if (passOk && failOk) { regexScore++; earnXP(20); playSound('correct'); recordAchievementStat('regexSolved', 1); createConfetti(20); document.getElementById('regexResult').innerHTML = '<span style="color:#10b981;">✓ Correct! +20 XP</span>'; }
    else { playSound('wrong'); document.getElementById('regexResult').innerHTML = '<span style="color:#ef4444;">✗ Pattern doesn\'t match correctly</span>'; }
  } catch(e) { playSound('wrong'); document.getElementById('regexResult').innerHTML = '<span style="color:#ef4444;">✗ Invalid regex: ' + e.message + '</span>'; return; }
  setTimeout(function() { regexIdx = Math.floor(Math.random() * regexChallenges.length); renderRegexRally(); }, 1200);
}

// ════════════════════════════════════════
// 13. SQL JOIN MATCH
// ════════════════════════════════════════
const sqlJoinQuestions = [
  { desc: 'Return rows where both tables have matching values',     opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 0 },
  { desc: 'Return ALL rows from the left table, matched from right', opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 1 },
  { desc: 'Return ALL rows from the right table, matched from left', opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 2 },
  { desc: 'Return ALL rows when there is a match in either table',   opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 3 },
  { desc: 'Select users and their orders (keep users without orders)', opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], ans: 1 },
  { desc: 'Only products that have been ordered (no nulls)',          opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'], ans: 0 },
  { desc: 'Combine two tables without a join condition',              opts: ['INNER JOIN', 'CROSS JOIN', 'LEFT JOIN', 'SELF JOIN'], ans: 1 },
  { desc: 'Join a table to itself',                                  opts: ['SELF JOIN', 'CROSS JOIN', 'INNER JOIN', 'OUTER JOIN'], ans: 0 },
];
var sqlIdx = 0, sqlScore = 0;
function initSqlJoin() { sqlIdx = Math.floor(Math.random() * sqlJoinQuestions.length); sqlScore = 0; renderSqlJoin(); }
function renderSqlJoin() {
  var body = document.getElementById('gamePaperBody');
  var q = sqlJoinQuestions[sqlIdx]; if (!q) { initSqlJoin(); return; }
  var html = addBackBtn() + '<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Score: ' + sqlScore + '</div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.02));border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>🔗 SQL JOIN Match</strong><br><span style="color:#a5f3fc;font-size:12px;">' + q.desc + '</span></div>';
  html += '<div class="sql-opts">';
  for (var i = 0; i < q.opts.length; i++) {
    html += '<button class="sql-opt" onclick="checkSqlJoin(' + i + ')">' + q.opts[i] + '</button>';
  }
  html += '</div><div id="sqlResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html;
}
function checkSqlJoin(idx) {
  var q = sqlJoinQuestions[sqlIdx];
  if (idx === q.ans) { sqlScore++; earnXP(15); playSound('correct'); recordAchievementStat('sqlCorrect', 1); createConfetti(15); document.getElementById('sqlResult').innerHTML = '<span style="color:#10b981;">✓ Correct! +15 XP</span>'; }
  else { playSound('wrong'); document.getElementById('sqlResult').innerHTML = '<span style="color:#ef4444;">✗ Wrong. Answer: ' + q.opts[q.ans] + '</span>'; }
  setTimeout(function() { sqlIdx = Math.floor(Math.random() * sqlJoinQuestions.length); renderSqlJoin(); }, 1000);
}

// ════════════════════════════════════════
// 14. ERRORPEDIA
// ════════════════════════════════════════
const errorQuestions = [
  { error: 'TypeError: Cannot read properties of undefined (reading \'x\')', opts: ['Accessing a property on null/undefined', 'Calling a function that doesn\'t exist', 'Using an undefined variable', 'Syntax error'], ans: 0 },
  { error: 'ReferenceError: x is not defined', opts: ['Variable x doesn\'t exist in scope', 'x is null', 'x is a reserved word', 'x has no value'], ans: 0 },
  { error: 'SyntaxError: Unexpected token', opts: ['Invalid syntax in the code', 'Network error', 'File not found', 'Type mismatch'], ans: 0 },
  { error: 'TypeError: "x" is not a function', opts: ['Trying to call a non-function value', 'x is not defined', 'Function expects more arguments', 'Function returns undefined'], ans: 0 },
  { error: 'RangeError: Maximum call stack size exceeded', opts: ['Infinite recursion', 'Too many variables', 'Stack is full of data', 'Loop runs too many times'], ans: 0 },
  { error: 'TypeError: Assignment to constant variable', opts: ['Trying to reassign a const', 'Variable is read-only', 'Wrong assignment operator', 'Constant is frozen'], ans: 0 },
  { error: 'URIError: URI malformed', opts: ['Invalid URL/URI encoding', 'File not found', 'Network timeout', 'Server error'], ans: 0 },
  { error: 'TypeError: "undefined" is not iterable', opts: ['Trying to spread/loop over undefined', 'Undefined is not an array', 'Function returned undefined', 'Variable not initialized'], ans: 0 },
];
var errIdx = 0, errScore = 0;
function initErrorpedia() { errIdx = Math.floor(Math.random() * errorQuestions.length); errScore = 0; renderErrorpedia(); }
function renderErrorpedia() {
  var body = document.getElementById('gamePaperBody');
  var q = errorQuestions[errIdx];
  var html = addBackBtn() + '<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Score: ' + errScore + '</div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.02));border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>❌ Errorpedia</strong><br><span style="color:#fb7185;font-family:Consolas,monospace;font-size:11px;">' + escapeHtml(q.error) + '</span></div>';
  html += '<div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">What caused this error?</div><div class="sql-opts">';
  for (var i = 0; i < q.opts.length; i++) {
    html += '<button class="sql-opt" onclick="checkErrorpedia(' + i + ')">' + q.opts[i] + '</button>';
  }
  html += '</div><div id="errResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html;
}
function checkErrorpedia(idx) {
  var q = errorQuestions[errIdx];
  if (idx === q.ans) { errScore++; earnXP(15); playSound('correct'); recordAchievementStat('errorCorrect', 1); createConfetti(15); document.getElementById('errResult').innerHTML = '<span style="color:#10b981;">✓ Correct! +15 XP</span>'; }
  else { playSound('wrong'); document.getElementById('errResult').innerHTML = '<span style="color:#ef4444;">✗ Wrong. Answer: ' + q.opts[q.ans] + '</span>'; }
  setTimeout(function() { errIdx = Math.floor(Math.random() * errorQuestions.length); renderErrorpedia(); }, 1000);
}

// ════════════════════════════════════════
// 15. API ARACDE
// ════════════════════════════════════════
const apiQuestions = [
  { desc: 'Retrieve a list of all users',          opts: ['GET /users', 'POST /users', 'PUT /users', 'DELETE /users'], ans: 0 },
  { desc: 'Create a new user',                     opts: ['GET /users', 'POST /users', 'PUT /users', 'PATCH /users'], ans: 1 },
  { desc: 'Update an existing user completely',    opts: ['GET /users/1', 'POST /users/1', 'PUT /users/1', 'DELETE /users/1'], ans: 2 },
  { desc: 'Partially update a user',               opts: ['PUT /users/1', 'PATCH /users/1', 'POST /users/1', 'DELETE /users/1'], ans: 1 },
  { desc: 'Delete a user',                         opts: ['GET /users/1', 'POST /users/1', 'PUT /users/1', 'DELETE /users/1'], ans: 3 },
  { desc: 'Retrieve a single user by ID',          opts: ['GET /users', 'GET /users/1', 'POST /users/1', 'PUT /users/1'], ans: 1 },
  { desc: 'List all posts by a user',              opts: ['GET /posts', 'GET /users/1/posts', 'POST /users/1/posts', 'GET /users/posts'], ans: 1 },
  { desc: 'Replace the email of a user',           opts: ['POST /users/1/email', 'PATCH /users/1', 'PUT /users/1', 'DELETE /users/1/email'], ans: 2 },
];
var apiIdx = 0, apiScore = 0;
function initApiArcade() { apiIdx = Math.floor(Math.random() * apiQuestions.length); apiScore = 0; renderApiArcade(); }
function renderApiArcade() {
  var body = document.getElementById('gamePaperBody');
  var q = apiQuestions[apiIdx];
  var html = addBackBtn() + '<div style="font-size:10px;color:#64748b;margin-bottom:8px;">Score: ' + apiScore + '</div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(249,115,22,0.02));border:1px solid rgba(249,115,22,0.2);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>📡 API Arcade</strong><br><span style="color:#a5f3fc;font-size:12px;">' + q.desc + '</span></div>';
  html += '<div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Choose the correct endpoint:</div><div class="sql-opts">';
  for (var i = 0; i < q.opts.length; i++) {
    html += '<button class="sql-opt" onclick="checkApiArcade(' + i + ')">' + q.opts[i] + '</button>';
  }
  html += '</div><div id="apiResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html;
}
function checkApiArcade(idx) {
  var q = apiQuestions[apiIdx];
  if (idx === q.ans) { apiScore++; earnXP(15); playSound('correct'); recordAchievementStat('apiCorrect', 1); createConfetti(15); document.getElementById('apiResult').innerHTML = '<span style="color:#10b981;">✓ Correct! +15 XP</span>'; }
  else { playSound('wrong'); document.getElementById('apiResult').innerHTML = '<span style="color:#ef4444;">✗ Wrong. Answer: ' + q.opts[q.ans] + '</span>'; }
  setTimeout(function() { apiIdx = Math.floor(Math.random() * apiQuestions.length); renderApiArcade(); }, 1000);
}

// ════════════════════════════════════════
// 16. DAILY CHALLENGE
// ════════════════════════════════════════
var dailyIdx = 0;
function initDaily() {
  var dateStr = new Date().toDateString();
  var dayNum = dateStr.split(' ').reduce(function(a,s) { return a + s.charCodeAt(0); }, 0);
  dailyIdx = dayNum % golfChallenges.length;
  renderDaily();
}
function renderDaily() {
  var body = document.getElementById('gamePaperBody');
  var dcKey = 'dogeslab_daily_' + new Date().toDateString();
  var dcDone = localStorage.getItem(dcKey);
  if (dcDone) {
    body.innerHTML = addBackBtn() + '<div style="text-align:center;padding:30px;"><div style="font-size:40px;margin-bottom:12px;">✅</div><div style="font-size:16px;font-weight:900;color:#10b981;">Daily Challenge Complete!</div><div style="color:#64748b;font-size:12px;margin-top:8px;">Come back tomorrow for a new challenge.</div></div>';
    return;
  }
  var ch = golfChallenges[dailyIdx];
  var html = addBackBtn() + '<div style="display:flex;gap:12px;margin-bottom:8px;font-size:10px;color:#64748b;"><span>🗓️ Daily Challenge</span></div>';
  html += '<div class="sprint-desc" style="background:linear-gradient(135deg,rgba(236,72,153,0.1),rgba(236,72,153,0.02));border:1px solid rgba(236,72,153,0.3);border-radius:10px;padding:14px;margin-bottom:10px;"><strong>🗓️ Daily Code Golf</strong><br><span style="color:#a5f3fc;font-size:12px;">' + ch.desc + '</span><br><span style="color:#64748b;font-size:10px;">Par: ' + ch.par + ' characters</span></div>';
  html += '<textarea id="dailyInput" class="game-input" spellcheck="false" style="min-height:80px;" placeholder="Write your solution..."></textarea>';
  html += '<button class="game-new-btn" style="margin-top:8px;" onclick="checkDaily()">Submit</button>';
  html += '<div id="dailyResult" style="margin-top:8px;text-align:center;font-size:12px;font-weight:800;"></div>';
  body.innerHTML = html; var inp = document.getElementById('dailyInput'); if (inp) inp.focus();
}
function checkDaily() {
  var inp = document.getElementById('dailyInput'); if (!inp) return;
  var code = inp.value.trim(); var ch = golfChallenges[dailyIdx];
  if (!ch.check(code)) { document.getElementById('dailyResult').innerHTML = '<span style="color:#ef4444;">✗ Code doesn\'t work as expected</span>'; return; }
  var dcKey = 'dogeslab_daily_' + new Date().toDateString();
  localStorage.setItem(dcKey, 'done');
  var bonus = Math.max(10, 50 - code.length);
  earnXP(bonus); playSound('correct'); recordAchievementStat('dailyDone', 1); createConfetti(50);
  document.getElementById('dailyResult').innerHTML = '<span style="color:#10b981;">✓ Challenge complete! +' + bonus + ' XP</span>';
  showToast('🗓️ Daily Challenge done! +' + bonus + ' XP', 'success');
  setTimeout(function() { renderHub(); }, 1500);
}
