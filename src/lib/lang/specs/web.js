export const HTML_SPEC = {
  id: 'html',
  name: 'HTML',
  keywords: ['div', 'span', 'p', 'a', 'img', 'input', 'form', 'button', 'table', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'section', 'article', 'header', 'footer', 'nav', 'main', 'head', 'body', 'html', 'title', 'meta', 'link', 'script', 'style'],
  operators: [],
  types: ['element', 'attribute', 'text'],
  patterns: [
    { lines: ['<!DOCTYPE html>', '<html>', '<head><title>Page</title></head>', '<body>', '  <h1>Hello, World!</h1>', '</body>', '</html>'], tags: ['page'] },
    { lines: ['<form action="/submit" method="POST">', '  <input type="text" name="name" />', '  <button type="submit">Send</button>', '</form>'], tags: ['form'] },
    { lines: ['<ul>', '  <li>Item 1</li>', '  <li>Item 2</li>', '  <li>Item 3</li>', '</ul>'], tags: ['list'] },
    { lines: ['<a href="https://example.com">Click here</a>'], tags: ['link'] },
    { lines: ['<img src="image.jpg" alt="Description" width="500" />'], tags: ['media'] },
    { lines: ['<table>', '  <tr><th>Name</th><th>Age</th></tr>', '  <tr><td>Alice</td><td>30</td></tr>', '</table>'], tags: ['table'] },
    { lines: ['<div class="container">', '  <header>Site Title</header>', '  <main>Content</main>', '  <footer>&copy; 2024</footer>', '</div>'], tags: ['layout'] },
    { lines: ['<input type="text" placeholder="Enter name..." required />'], tags: ['input'] },
    { lines: ['<select name="color">', '  <option value="red">Red</option>', '  <option value="blue">Blue</option>', '</select>'], tags: ['input'] },
    { lines: ['<nav>', '  <a href="/">Home</a>', '  <a href="/about">About</a>', '  <a href="/contact">Contact</a>', '</nav>'], tags: ['nav'] },
  ],
  bugs: [
    { wrong: '<img src="photo.jpg">', right: '<img src="photo.jpg" alt="photo" />', prompt: 'What accessibility attribute is missing from this image?', choices: ['alt', 'title', 'description'], answer: 'alt' },
    { wrong: '<a href="page.html">Click</a>', right: '<a href="page.html">Click</a>', prompt: 'Which creates a hyperlink in HTML?', choices: ['<a href="page.html">', '<link href="page.html">', '<url href="page.html">'], answer: '<a href="page.html">' },
    { wrong: '<div Click me!</div>', right: '<div>Click me!</div>', prompt: 'What is wrong with this HTML?', choices: ['Missing closing tag angle', 'Wrong attribute', 'Invalid element'], answer: 'Missing closing tag angle' },
  ],
  concepts: [
    { term: 'Semantic HTML', definition: 'Using meaningful tags (header, nav, main) that describe content purpose.' },
    { term: 'DOM', definition: 'Document Object Model — the tree structure representing HTML elements in memory.' },
    { term: 'Accessibility', definition: 'Designing content usable by people with disabilities (screen readers, keyboard nav).' },
  ],
  syntaxTests: [
    { valid: '<div>Content</div>', invalid: '<div>Content', category: 'closing' },
    { valid: '<img src="a.jpg" alt="a" />', invalid: '<img src=a.jpg>', category: 'attribute' },
    { valid: '<a href="page.html">Link</a>', invalid: '<a href=page.html>Link</a>', category: 'attribute' },
    { valid: '<input type="text" />', invalid: '<input type=text>', category: 'attribute' },
  ],
};

export const CSS_SPEC = {
  id: 'css',
  name: 'CSS',
  keywords: ['color', 'background', 'margin', 'padding', 'border', 'display', 'position', 'flex', 'grid', 'width', 'height', 'font-size', 'font-weight', 'text-align', 'align-items', 'justify-content', 'gap', 'overflow', 'z-index', 'opacity', 'transform', 'transition', 'animation', 'box-shadow', 'border-radius'],
  operators: [':', ';', ',', '.', '#', '>', '+', '~'],
  types: ['property', 'value', 'selector'],
  patterns: [
    { lines: ['.card {', '  background: #fff;', '  border-radius: 8px;', '  padding: 16px;', '  box-shadow: 0 2px 4px rgba(0,0,0,0.1);', '}'], tags: ['card'] },
    { lines: ['.container {', '  display: flex;', '  justify-content: center;', '  align-items: center;', '  gap: 16px;', '}'], tags: ['flexbox'] },
    { lines: ['.grid {', '  display: grid;', '  grid-template-columns: repeat(3, 1fr);', '  gap: 16px;', '}'], tags: ['grid'] },
    { lines: ['a:hover {', '  color: #f59e0b;', '  transition: color 0.2s;', '}'], tags: ['interaction'] },
    { lines: ['@media (max-width: 768px) {', '  .container {', '    flex-direction: column;', '  }', '}'], tags: ['responsive'] },
    { lines: ['.modal {', '  position: fixed;', '  top: 50%; left: 50%;', '  transform: translate(-50%, -50%);', '  z-index: 100;', '}'], tags: ['layout'] },
    { lines: ['button {', '  padding: 10px 20px;', '  border: none;', '  border-radius: 6px;', '  background: #f59e0b;', '  color: white;', '  cursor: pointer;', '}'], tags: ['button'] },
    { lines: ['@keyframes slide {', '  from { transform: translateX(-100%); }', '  to { transform: translateX(0); }', '}'], tags: ['animation'] },
    { lines: ['.text {', '  font-size: 16px;', '  line-height: 1.6;', '  color: #334155;', '  text-align: center;', '}'], tags: ['typography'] },
    { lines: ['.overlay {', '  background: linear-gradient(135deg, #111827, #431407);', '  min-height: 100vh;', '}'], tags: ['background'] },
  ],
  bugs: [
    { wrong: 'color red;', right: 'color: red;', prompt: 'What is missing in this CSS declaration?', choices: ['color: red;', 'color red;', 'color = red;'], answer: 'color: red;' },
    { wrong: '.class { background-color: red; }', right: '.class { background-color: red; }', prompt: 'Which CSS selector targets elements with class="class"?', choices: ['.class', '#class', 'class'], answer: '.class' },
    { wrong: 'margin 10px;', right: 'margin: 10px;', prompt: 'What separates property from value in CSS?', choices: ['colon', 'equals', 'space'], answer: 'colon' },
  ],
  concepts: [
    { term: 'Cascade', definition: 'The algorithm that determines which CSS rules apply when multiple rules match.' },
    { term: 'Flexbox', definition: 'A one-dimensional layout system for distributing space and aligning content.' },
    { term: 'CSS Grid', definition: 'A two-dimensional layout system for rows and columns.' },
    { term: 'Specificity', definition: 'The weight of a selector — inline > id > class > element.' },
  ],
  syntaxTests: [
    { valid: '.class { color: red; }', invalid: '.class { color red; }', category: 'declaration' },
    { valid: '#id { margin: 0; }', invalid: '#id { margin 0; }', category: 'declaration' },
    { valid: 'div { display: flex; }', invalid: 'div { display flex; }', category: 'declaration' },
    { valid: '@media (max-width: 768px) { }', invalid: '@media max-width 768px { }', category: 'rule' },
  ],
};

export const BASH_SPEC = {
  id: 'bash',
  name: 'Bash',
  keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'in', 'function', 'return', 'exit', 'echo', 'export', 'source', 'local', 'read', 'set', 'unset', 'trap'],
  operators: ['$', '|', '>', '<', '>>', '<<', '&&', '||', '!', '=', '==', '!=', '-eq', '-ne', '-lt', '-gt', '-le', '-ge'],
  types: ['string', 'integer', 'array', 'associative_array'],
  patterns: [
    { lines: ['#!/bin/bash', 'echo "Hello, World!"'], tags: ['hello'] },
    { lines: ['for i in {1..5}; do', '  echo "Number: $i"', 'done'], tags: ['loop'] },
    { lines: ['if [ -f "$file" ]; then', '  echo "File exists"', 'else', '  echo "File not found"', 'fi'], tags: ['conditional'] },
    { lines: ['greet() {', '  echo "Hello, $1!"', '}', '', 'greet "World"'], tags: ['function'] },
    { lines: ['while read line; do', '  echo "Line: $line"', 'done < "input.txt"'], tags: ['loop'] },
    { lines: ['case "$1" in', '  start) echo "Starting...";;', '  stop) echo "Stopping...";;', '  *) echo "Unknown";;', 'esac'], tags: ['case'] },
    { lines: ['ls -la | grep "\.txt$" | wc -l'], tags: ['pipeline'] },
    { lines: ['for file in *.txt; do', '  mv "$file" "${file%.txt}.bak"', 'done'], tags: ['loop'] },
    { lines: ['if [ "$USER" = "root" ]; then', '  echo "Running as root"', 'fi'], tags: ['conditional'] },
    { lines: ['trap "echo Interrupted; exit 1" INT', 'echo "Running... press Ctrl+C"', 'sleep 30'], tags: ['signal'] },
  ],
  bugs: [
    { wrong: 'if [ $x = "hello" ] then', right: 'if [ "$x" = "hello" ]; then', prompt: 'What is wrong with this Bash if statement?', choices: ['Missing semicolon before then', 'Missing $ on variable', 'Wrong bracket type'], answer: 'Missing semicolon before then' },
    { wrong: 'echo $5 + 10', right: 'echo $((5 + 10))', prompt: 'How do you do arithmetic in Bash?', choices: ['$((5 + 10))', 'echo $5 + 10', 'calculate 5 + 10'], answer: '$((5 + 10))' },
    { wrong: 'myvar = "hello"', right: 'myvar="hello"', prompt: 'How do you assign a variable in Bash?', choices: ['myvar="hello"', 'myvar = "hello"', 'set myvar = "hello"'], answer: 'myvar="hello"' },
  ],
  concepts: [
    { term: 'Exit code', definition: 'A numeric code returned by every command (0 = success, non-zero = error).' },
    { term: 'Pipeline', definition: 'Chaining commands with | where stdout of one feeds stdin of the next.' },
    { term: 'Globbing', definition: 'Pattern matching for filenames using *, ?, and [ ] wildcards.' },
    { term: 'Redirection', definition: 'Directing stdin/stdout/stderr to/from files using <, >, >>, 2>, etc.' },
  ],
  syntaxTests: [
    { valid: 'if [ "$x" = "ok" ]; then echo "ok"; fi', invalid: 'if [ $x = "ok" ] then echo "ok" fi', category: 'conditional' },
    { valid: 'for i in {1..5}; do echo "$i"; done', invalid: 'for i in {1..5} do echo "$i" done', category: 'loop' },
    { valid: 'myvar="hello"', invalid: 'myvar = "hello"', category: 'assignment' },
    { valid: 'echo "Hello, $name!"', invalid: 'echo "Hello, name!"', category: 'variable' },
  ],
};

export const WASM_SPEC = {
  id: 'wasm',
  name: 'WebAssembly',
  keywords: ['module', 'func', 'param', 'result', 'local', 'global', 'memory', 'table', 'import', 'export', 'i32', 'i64', 'f32', 'f64', 'block', 'loop', 'if', 'then', 'else', 'call', 'return'],
  operators: ['i32.add', 'i32.sub', 'i32.mul', 'i32.div_s', 'i32.eq', 'i32.ne', 'i32.lt_s', 'i32.gt_s', 'i32.load', 'i32.store'],
  types: ['i32', 'i64', 'f32', 'f64'],
  patterns: [
    { lines: ['(module', '  (func $add (param $a i32) (param $b i32) (result i32)', '    local.get $a', '    local.get $b', '    i32.add', '  )', ')'], tags: ['function'] },
    { lines: ['(module', '  (func (export "main") (result i32)', '    i32.const 42', '    return', '  )', ')'], tags: ['main'] },
    { lines: ['(module', '  (memory $mem 1)', '  (func (export "store") (param $addr i32) (param $val i32)', '    local.get $addr', '    local.get $val', '    i32.store', '  )', ')'], tags: ['memory'] },
  ],
  bugs: [],
  concepts: [
    { term: 'Stack machine', definition: 'WASM is a stack-based virtual machine where instructions push/pop values.' },
    { term: 'Linear memory', definition: 'A contiguous byte array accessible via load/store instructions.' },
  ],
  syntaxTests: [
    { valid: '(module (func (export "main") (result i32) i32.const 42))', invalid: 'module { func main() -> i32 { return 42 } }', category: 'syntax' },
  ],
};
