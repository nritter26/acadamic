courseData.compiler = {
  "What is a Compiler?": {
    "What is a Compiler?": {
      exp: `<p>A <strong>compiler</strong> is a program that translates source code written in one language into another language — typically from a high-level language (like Python or JavaScript) into low-level machine code, bytecode, or another high-level language.</p>
<p>Think of a compiler as a translator between you (the programmer) and the computer. You write code in a human-readable language; the compiler converts it into instructions the computer can execute.</p>
<p><strong>Why do we need compilers?</strong></p>
<ul>
<li>Computers only understand machine code (1s and 0s)</li>
<li>Writing machine code is impractical for humans</li>
<li>Compilers let us write in readable languages and still run on hardware</li>
<li>Compilers can <strong>optimize</strong> code to run faster</li>
<li>Compilers can <strong>catch errors</strong> before the program runs</li>
</ul>
<p><strong>Compilers vs Interpreters:</strong></p>
<ul>
<li><strong>Compiler:</strong> Translates all code at once, produces an executable file (C, Go, Rust, Zig)</li>
<li><strong>Interpreter:</strong> Executes code line by line (Python, JavaScript, Ruby)</li>
<li><strong>JIT (Just-In-Time):</strong> Compiles code at runtime for speed (Java JVM, V8 for JavaScript)</li>
</ul>
<p><strong>Try this:</strong> Click "Pipeline ▶" in the Compiler mode below the editor to see how code gets tokenized and parsed step by step.</p>`,
      code: `// The compilation pipeline stages:
// 1. Source Code → Lexer → Tokens
// 2. Tokens → Parser → AST (Abstract Syntax Tree)
// 3. AST → Semantic Analysis → Validated AST
// 4. Validated AST → Code Generator → Output Code
// 5. Output Code → Execution → Result

// Example: A simple addition in C
int result = 5 + 3;
//           ^^^^^^^
//     Binary expression: operator '+'
//     Left operand: 5 (Literal)
//     Right operand: 3 (Literal)`
    }
  },
  "Tokenization (Lexing)": {
    "Lexical Analysis": {
      exp: `<p><strong>Tokenization</strong> (also called <strong>lexical analysis</strong> or <strong>lexing</strong>) is the first stage of compilation. It breaks source code into meaningful chunks called <strong>tokens</strong>.</p>
<p>A token is the smallest unit of meaning in a programming language — keywords, identifiers, operators, numbers, strings, punctuation, etc.</p>
<p><strong>Examples of tokens:</strong></p>
<ul>
<li><code>let</code> — keyword token</li>
<li><code>myVariable</code> — identifier token</li>
<li><code>=</code> — operator token</li>
<li><code>42</code> — number token</li>
<li><code>"hello"</code> — string token</li>
<li><code>;</code> — punctuation token</li>
<li><code>// comment</code> — comment token</li>
</ul>
<p><strong>How tokenizers work:</strong></p>
<ol>
<li>Read source code character by character</li>
<li>Group characters into tokens based on patterns</li>
<li>Classify each token (keyword, identifier, number, etc.)</li>
<li>Output a <strong>token stream</strong> for the parser</li>
</ol>
<p><strong>Why tokenization matters:</strong></p>
<ul>
<li>Simplifies the parser (works with tokens, not raw characters)</li>
<li>Catches basic errors (invalid characters, unterminated strings)</li>
<li>Removes whitespace and comments from the parse stream</li>
<li>Maps source positions for error reporting</li>
</ul>
<p><strong>Try this:</strong> Write code in the editor and click "Tokenize ▶" to see every token the compiler finds in your code.</p>`,
      code: `// Tokenization example:
// Input:  let count = 5 + 3;
//
// Tokens produced:
// [KEYWORD]  "let"
// [IDENT]    "count"
// [OPERATOR] "="
// [NUMBER]   "5"
// [OPERATOR] "+"
// [NUMBER]   "3"
// [PUNCT]    ";"

// Different languages, same token types:
// Python:    count = 5 + 3
// Go:        var count int = 5 + 3
// Rust:      let mut count = 5 + 3;
// SQL:       SELECT count + 3 FROM table;`
    }
  },
  "Parsing & ASTs": {
    "Syntax Analysis": {
      exp: `<p><strong>Parsing</strong> (syntax analysis) takes the flat token stream from the lexer and builds a tree structure called the <strong>Abstract Syntax Tree (AST)</strong>.</p>
<p>An AST represents the grammatical structure of your code as a tree. Each node in the tree represents a construct (variable declaration, function call, expression, etc.) and its children represent the components.</p>
<p><strong>Why an AST?</strong></p>
<ul>
<li>Captures the <strong>hierarchy</strong> of code (blocks inside functions inside classes)</li>
<li>Ignores syntactic sugar (semicolons, parentheses in some cases)</li>
<li>Makes it easy to <strong>transform</strong> or <strong>analyze</strong> code</li>
<li>Enables optimizations and code generation</li>
</ul>
<p><strong>Common AST node types:</strong></p>
<ul>
<li><strong>Program</strong> — the root of every AST</li>
<li><strong>FunctionDeclaration</strong> — a function definition</li>
<li><strong>VariableDeclaration</strong> — declaring a variable</li>
<li><strong>BinaryExpression</strong> — <code>a + b</code>, <code>x > 5</code></li>
<li><strong>CallExpression</strong> — calling a function: <code>foo()</code></li>
<li><strong>Block</strong> — a group of statements in <code>{ }</code></li>
<li><strong>ControlFlow</strong> — <code>if</code>, <code>for</code>, <code>while</code></li>
</ul>
<p><strong>Parsing strategies:</strong></p>
<ul>
<li><strong>Recursive Descent:</strong> Most common for hand-written parsers. One function per grammar rule.</li>
<li><strong>LL/LR Parsers:</strong> Generated from grammar definition. Used in production compilers (GCC, Clang).</li>
<li><strong>Operator Precedence:</strong> Specific technique for parsing expressions with operator precedence.</li>
</ul>
<p><strong>Try this:</strong> Click "AST ▶" to see the tree structure the compiler builds from your code.</p>`,
      code: `// Write code and click AST ▶ to see the tree
function greet(name) {
  const message = "Hello, " + name;
  return message;
}

// Expected AST structure:
// Program
//   FunctionDeclaration: "greet"
//     Block
//       VariableDeclaration: "message"
//       ReturnStatement
//         BinaryExpression: +
//           Identifier: "name"
`
    }
  },
  "Code Generation": {
    "Generating Output": {
      exp: `<p><strong>Code generation</strong> is the final stage of the compiler pipeline. It walks the AST and produces output code in the target language.</p>
<p>For most compilers, the output is machine code or bytecode. In this Compiler Explorer, you can see how the same code would be compiled to different output representations:</p>
<ul>
<li><strong>JavaScript:</strong> Same as input (JS is interpreted)</li>
<li><strong>Machine code view:</strong> Conceptual translation to low-level instructions</li>
<li><strong>Structural output:</strong> What the compiler "sees" in your code</li>
</ul>
<p><strong>What code generators do:</strong></p>
<ol>
<li>Walk the AST (depth-first or breadth-first)</li>
<li>For each node type, emit appropriate output code</li>
<li>Track context (scope, registers, variable locations)</li>
<li>Optimize the output (peephole optimization, register allocation)</li>
</ol>
<p><strong>Example walk:</strong> For <code>let x = 5 + 3</code></p>
<ol>
<li>Visit Program node → start new line</li>
<li>Visit VariableDeclaration → emit <code>let x = </code></li>
<li>Visit BinaryExpression → emit <code>5 + 3</code></li>
<li>Visit number "5" → emit <code>5</code></li>
<li>Visit operator "+" → emit <code>+</code></li>
<li>Visit number "3" → emit <code>3</code></li>
<li>Finish line → emit <code>;</code></li>
</ol>
<p><strong>Real compiler optimizations:</strong></p>
<ul>
<li><strong>Constant folding:</strong> <code>5 + 3</code> → <code>8</code> (evaluated at compile time)</li>
<li><strong>Dead code elimination:</strong> Remove code that never runs</li>
<li><strong>Inlining:</strong> Replace function calls with the function body</li>
<li><strong>Loop unrolling:</strong> Duplicate loop body for performance</li>
</ul>`,
      code: `// Code generation walkthrough:
// Input AST:
//   Program
//     VariableDeclaration: "total"
//       BinaryExpression: +
//         Number: 10
//         Number: 20

// Generated JavaScript:
let total = 10 + 20;

// With constant folding optimization:
let total = 30;  // 10+20 computed at compile time!
`
    }
  },
  "All Languages Supported": {
    "All Languages Supported": {
      exp: `<p>This Compiler Explorer analyzes code from <strong>all 15+ languages</strong> in Kodex's Lab! The tokenizer and AST builder adapt to each language's syntax.</p>
<p><strong>How it works across languages:</strong></p>
<ul>
<li><strong>Comment styles:</strong> <code>//</code> (JS/TS/C/C++/etc.), <code>#</code> (Python/Docker), <code>--</code> (SQL)</li>
<li><strong>String delimiters:</strong> <code>"</code>, <code>'</code>, backticks, <code>"""</code> (Python/Kotlin)</li>
<li><strong>Block structure:</strong> <code>{ }</code> for most languages, indentation for Python</li>
<li><strong>Keywords:</strong> Per-language keyword sets for accurate token classification</li>
<li><strong>Operators:</strong> Universal operators plus language-specific ones (<code>-&gt;</code> in Go/C, <code>=&gt;</code> in JS)</li>
</ul>
<p><strong>Switch languages and click Pipeline to see!</strong></p>
<p>The tokenizer recognizes language-specific syntax including:</p>
<ul>
<li><strong>Python:</strong> <code>def</code>, <code>class:</code>, indentation-based blocks</li>
<li><strong>Go:</strong> <code>func</code>, <code>defer</code>, <code>go</code> routines</li>
<li><strong>Rust:</strong> <code>fn</code>, <code>match</code>, <code>impl</code>, <code>trait</code></li>
<li><strong>SQL:</strong> Case-insensitive keywords, <code>SELECT</code>, <code>FROM</code>, <code>JOIN</code></li>
<li><strong>Docker:</strong> <code>FROM</code>, <code>RUN</code>, <code>CMD</code></li>
<li><strong>Git:</strong> Commands and flags</li>
<li><strong>MongoDB:</strong> Query operators <code>$match</code>, <code>$group</code></li>
</ul>`,
      code: `// Try these examples in different languages:

// Python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

// Go
func greet(name string) string {
    return "Hello, " + name
}

// Rust
fn factorial(n: u32) -> u32 {
    match n {
        0 => 1,
        _ => n * factorial(n - 1)
    }
}

// SQL
SELECT users.name, COUNT(orders.id)
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.name;`
    }
  },
  "Semantic Analysis": {
    "Type Checking & Scope": {
      exp: `<p><strong>Semantic analysis</strong> is the compiler stage that checks whether code makes logical sense — beyond just syntax.</p>
<p>While parsing checks <em>structure</em> (grammar), semantic analysis checks <em>meaning</em>. This is where the compiler catches real bugs.</p>
<p><strong>What semantic analysis checks:</strong></p>
<ul>
<li><strong>Type checking:</strong> Are operands the right types? <code>"hello" - 5</code> is syntactically valid but semantically wrong in most languages.</li>
<li><strong>Scope resolution:</strong> Does each variable reference point to a valid declaration?</li>
<li><strong>Name binding:</strong> Are functions, types, and variables used before declaration (where required)?</li>
<li><strong>Type inference:</strong> Can the compiler deduce types without explicit annotations?</li>
</ul>
<p><strong>Type systems spectrum:</strong></p>
<ul>
<li><strong>Dynamic:</strong> Types checked at runtime (Python, JavaScript) — flexible but error-prone</li>
<li><strong>Static:</strong> Types checked at compile time (C, Go, Rust) — catches errors early</li>
<li><strong>Gradual:</strong> Mix of both (TypeScript, Python with type hints)</li>
<li><strong>Strong:</strong> No implicit type coercion (Python, Rust)</li>
<li><strong>Weak:</strong> Implicit coercion allowed (C, JavaScript)</li>
</ul>
<p><strong>Semantic errors vs syntax errors:</strong></p>
<ul>
<li><strong>Syntax error:</strong> <code>let 5x = 3;</code> — the grammar doesn't allow this</li>
<li><strong>Semantic error:</strong> <code>let x: number = "hello";</code> — grammatically valid, but type mismatch</li>
</ul>`,
      code: `// Semantic analysis catches these:
// Type mismatch (TypeScript):
// let age: number = "twenty";  // Error: Type 'string' not assignable to 'number'

// Undefined variable (all languages):
// console.log(undeclaredVar);  // ReferenceError: undeclaredVar is not defined

// Scope error:
// {
//   let x = 1;
// }
// console.log(x);  // ReferenceError: x is not defined (block scoped)

// Type error caught by compiler:
// In Go: var x int = "hello"  // cannot use "hello" (type string) as type int`
    }
  },
  "Optimization": {
    "Making Code Faster": {
      exp: `<p><strong>Compiler optimization</strong> transforms code to run faster, use less memory, or consume less power — without changing its meaning.</p>
<p>Most optimizations are <strong>conservative</strong>: the compiler only applies them when it's sure the program's behavior won't change.</p>
<p><strong>Categories of optimization:</strong></p>
<ul>
<li><strong>Constant folding:</strong> <code>x = 5 + 3</code> → <code>x = 8</code> (evaluate at compile time)</li>
<li><strong>Constant propagation:</strong> If <code>x = 5</code>, replace all uses of <code>x</code> with <code>5</code></li>
<li><strong>Dead code elimination:</strong> Remove branches that never execute or variables never read</li>
<li><strong>Loop unrolling:</strong> Duplicate loop body to reduce overhead of the loop control</li>
<li><strong>Function inlining:</strong> Replace function call with the function body itself</li>
<li><strong>Strength reduction:</strong> Replace expensive ops with cheaper ones (e.g., <code>x * 2</code> → <code>x &lt;&lt; 1</code>)</li>
<li><strong>Common subexpression elimination:</strong> Compute a value once and reuse it</li>
</ul>
<p><strong>Optimization levels in GCC/Clang:</strong></p>
<ul>
<li><code>-O0</code>: No optimization (fastest compile, slowest code)</li>
<li><code>-O1</code>: Basic optimizations (good balance)</li>
<li><code>-O2</code>: More aggressive (recommended for release builds)</li>
<li><code>-O3</code>: Very aggressive (may increase code size)</li>
<li><code>-Os</code>: Optimize for size (embedded systems)</li>
</ul>`,
      code: `// Before optimization:
function compute(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    const taxRate = 0.08;
    total += arr[i] * taxRate;
  }
  return total;
}

// After constant propagation + inlining:
// const taxRate = 0.08;  // hoisted outside loop
// total += arr[i] * 0.08;  // constant propagated

// After loop-invariant code motion:
// const taxRate = 0.08;
// const len = arr.length;  // computed once
// for (let i = 0; i < len; i++) {
//   total += arr[i] * taxRate;
// }`
    }
  },
  "Intermediate Representations": {
    "From AST to Machine Code": {
      exp: `<p>Between the high-level AST and the low-level machine code, most compilers use one or more <strong>intermediate representations (IRs)</strong>.</p>
<p>IRs bridge the gap between the source language and the target hardware, making the compiler easier to port to new architectures.</p>
<p><strong>Common IRs:</strong></p>
<ul>
<li><strong>Three-Address Code (TAC):</strong> Simple instruction format: <code>t1 = a + b</code></li>
<li><strong>Static Single Assignment (SSA):</strong> Each variable assigned exactly once — enables powerful optimizations (used by LLVM, GCC)</li>
<li><strong>LLVM IR:</strong> A low-level, typed IR used by Clang, rustc, and many others</li>
<li><strong>Bytecode:</strong> Portable IR for virtual machines (JVM bytecode, Python bytecode, WASM)</li>
<li><strong>C as IR:</strong> Some compilers output C code and let the C compiler handle machine code generation</li>
</ul>
<p><strong>Why multi-level IRs?</strong></p>
<ul>
<li>Frontend (language-specific) → high-level IR → mid-level IR → low-level IR → machine code</li>
<li>Each level enables different optimizations</li>
<li>New language backends only need to generate IR, not full machine code</li>
</ul>
<p><strong>LLVM's architecture:</strong> The most popular compiler infrastructure uses this exact pattern. Language frontends (Clang for C/C++, rustc for Rust) all emit LLVM IR, which LLVM optimizes and compiles to native code.</p>`,
      code: `// High-level source:
// result = (a + b) * (c - d)

// Three-Address Code (TAC):
// t1 = a + b
// t2 = c - d
// result = t1 * t2

// SSA Form (Static Single Assignment):
// t1 = a + b
// t2 = c - d
// t3 = t1 * t2
// result = t3
// (each variable assigned exactly once)

// LLVM IR (conceptual):
// %t1 = add i32 %a, %b
// %t2 = sub i32 %c, %d
// %result = mul i32 %t1, %t2`
    }
  }
};