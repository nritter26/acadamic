export const TUTORIAL_COURSES = [
  {
    "id": "js",
    "title": "JavaScript",
    "summary": "Learn JavaScript from the ground up — fundamentals, variables & types, operators, and more.",
    "lang": "js",
    "icon": "/public/logos/js.svg",
    "phases": [
      {
        "id": "fundamentals",
        "title": "Fundamentals",
        "topics": [
          "What is JavaScript",
          "Syntax & Comments",
          "Strict Mode",
          "Statements & Blocks",
          "JavaScript Engines"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "var let const",
          "Primitive Types",
          "Reference Types",
          "Truthy & Falsy",
          "Type Conversion",
          "Template Literals",
          "null vs undefined",
          "Symbol & BigInt"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic Operators",
          "Comparison Operators",
          "Logical Operators",
          "Assignment Operators",
          "Ternary Operator",
          "Spread & Rest"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "If Else",
          "Else If",
          "Switch Statement",
          "for Loops",
          "while & do while",
          "break & continue",
          "Nested Loops",
          "Error Handling"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Declarations",
          "Function Expressions",
          "Arrow Functions",
          "Default Parameters",
          "Rest Parameters",
          "Closures"
        ]
      },
      {
        "id": "objects-and-classes",
        "title": "Objects & Classes",
        "topics": [
          "Objects",
          "This Keyword",
          "Prototypes",
          "Classes",
          "Inheritance",
          "Getters & Setters"
        ]
      },
      {
        "id": "arrays-and-collections",
        "title": "Arrays & Collections",
        "topics": [
          "Arrays",
          "Array Methods",
          "Destructuring",
          "Map & Set",
          "WeakMap & WeakSet",
          "Iterators & Generators"
        ]
      },
      {
        "id": "dom-and-browser-apis",
        "title": "DOM & Browser APIs",
        "topics": [
          "DOM Manipulation",
          "Events",
          "Forms & Validation",
          "Fetch API",
          "Local Storage",
          "Timers",
          "Web APIs (File, Drag, Clipboard)"
        ]
      },
      {
        "id": "async-javascript",
        "title": "Async JavaScript",
        "topics": [
          "Promises",
          "Async/Await",
          "Fetch & HTTP",
          "Event Loop",
          "Web Workers",
          "Async Iteration"
        ]
      },
      {
        "id": "modern-javascript",
        "title": "Modern JavaScript",
        "topics": [
          "ES Modules",
          "Spread Syntax",
          "Optional Chaining",
          "Nullish Coalescing",
          "Dynamic Import",
          "Promise Combinators",
          "Records & Tuples (Proposal)"
        ]
      },
      {
        "id": "frameworks-and-tools",
        "title": "Frameworks & Tools",
        "topics": [
          "React",
          "Vue",
          "Express",
          "Next.js",
          "NestJS",
          "Vite"
        ]
      },
      {
        "id": "built-in-objects",
        "title": "Built-in Objects",
        "topics": [
          "JSON",
          "Math & Number",
          "Date & Time",
          "String Methods",
          "Proxy & Reflect",
          "Intl API",
          "TypedArrays (ArrayBuffer)",
          "structuredClone & Deep Copy",
          "Intl & Localization"
        ]
      },
      {
        "id": "hoisting-and-scopes",
        "title": "Hoisting & Scopes",
        "topics": [
          "Hoisting Explained",
          "Global Scope",
          "Lexical Scoping",
          "Temporal Dead Zone (TDZ)"
        ]
      },
      {
        "id": "equality-comparisons",
        "title": "Equality Comparisons",
        "topics": [
          "Object.is",
          "SameValueZero",
          "Object.is & SameValue"
        ]
      },
      {
        "id": "async-details",
        "title": "Async Details",
        "topics": [
          "The Event Loop",
          "Microtasks vs Macrotasks",
          "Callbacks",
          "Microtasks & Event Loop"
        ]
      },
      {
        "id": "modules",
        "title": "Modules",
        "topics": [
          "ES Modules (ESM)",
          "CommonJS (CJS)",
          "Dynamic Import & Code Splitting"
        ]
      },
      {
        "id": "memory-management",
        "title": "Memory Management",
        "topics": [
          "Memory Lifecycle",
          "Garbage Collection",
          "WeakRef & FinalizationRegistry"
        ]
      },
      {
        "id": "using-browser-devtools",
        "title": "Using Browser DevTools",
        "topics": [
          "Console Debugging",
          "Performance Debugging",
          "Debugging Memory Leaks"
        ]
      }
    ]
  },
  {
    "id": "ts",
    "title": "TypeScript",
    "summary": "Learn TypeScript from the ground up — fundamentals, type system, type guards & narrowing, and more.",
    "lang": "ts",
    "icon": "/public/logos/ts.svg",
    "phases": [
      {
        "id": "fundamentals",
        "title": "Fundamentals",
        "topics": [
          "What is TypeScript",
          "Type Annotations",
          "Basic Types",
          "unknown vs any",
          "Enums",
          "Type Inference",
          "Literal Types",
          "Strict Mode"
        ]
      },
      {
        "id": "type-system",
        "title": "Type System",
        "topics": [
          "Union Types",
          "Intersection Types",
          "Type Aliases",
          "Interfaces",
          "Structural Typing",
          "Type Assertions",
          "Branded Types",
          "satisfies Operator"
        ]
      },
      {
        "id": "type-guards-and-narrowing",
        "title": "Type Guards & Narrowing",
        "topics": [
          "typeof Type Guards",
          "instanceof Type Guards",
          "Equality Narrowing",
          "Truthiness Narrowing",
          "Type Predicates",
          "Discriminated Unions"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Types",
          "Optional & Default Parameters",
          "Generic Functions",
          "Function Overloads",
          "Rest Parameters",
          "this Parameters",
          "Async Functions",
          "void & never Return Types",
          "Nested Loops"
        ]
      },
      {
        "id": "classes-and-oop",
        "title": "Classes & OOP",
        "topics": [
          "Classes",
          "Inheritance",
          "Access Modifiers",
          "Abstract Classes",
          "Interfaces with Classes",
          "Static Members",
          "Parameter Properties",
          "Mixins"
        ]
      },
      {
        "id": "generics",
        "title": "Generics",
        "topics": [
          "Generic Types",
          "Constraints",
          "Utility Types",
          "Generic Classes",
          "Conditional Types",
          "Mapped Types",
          "Template Literal Types",
          "infer Keyword"
        ]
      },
      {
        "id": "utility-types",
        "title": "Utility Types",
        "topics": [
          "Partial<T>",
          "Required<T>",
          "Readonly<T>",
          "Record<K,T>",
          "Pick<T,K>",
          "Omit<T,K>",
          "Exclude<T,U>",
          "Extract<T,U>",
          "NonNullable<T>",
          "ReturnType<T>",
          "Parameters<T>",
          "Awaited<T>"
        ]
      },
      {
        "id": "advanced-types",
        "title": "Advanced Types",
        "topics": [
          "Conditional Types",
          "Mapped Types",
          "Indexed Access Types",
          "Type Guards",
          "Variadic Tuple Types",
          "Recursive Types",
          "Discriminated Unions",
          "keyof & typeof Operators"
        ]
      },
      {
        "id": "modules-and-tooling",
        "title": "Modules & Tooling",
        "topics": [
          "ESM Imports",
          "Namespaces",
          "Decorators",
          "tsconfig",
          "Declaration Files",
          "Triple-Slash Directives"
        ]
      },
      {
        "id": "asynchronous-typescript",
        "title": "Asynchronous TypeScript",
        "topics": [
          "Promise Types",
          "Async/Await",
          "Async Iterators",
          "Typed Event Emitters",
          "Promise Combinators",
          "Error Handling in Async Code"
        ]
      },
      {
        "id": "modern-patterns",
        "title": "Modern Patterns",
        "topics": [
          "Template Literal Types",
          "satisfies Operator",
          "Assertion Functions",
          "Branded Types",
          "Nominal Typing",
          "Covariance & Contravariance"
        ]
      },
      {
        "id": "dom-and-typescript",
        "title": "DOM & TypeScript",
        "topics": [
          "Typed DOM APIs",
          "Event Typing",
          "Form Typing",
          "Fetch Typing",
          "Typed Fetch & API Clients"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Typed Error Classes",
          "Try/Catch with unknown",
          "Result Types",
          "Definite Assignment Assertions",
          "Null Checks",
          "Result Pattern & Discriminated Unions"
        ]
      },
      {
        "id": "ecosystem",
        "title": "Ecosystem",
        "topics": [
          "Formatting (Prettier)",
          "Linting (ESLint)",
          "DefinitelyTyped & @types",
          "Build Tools",
          "Bun Runtime & Tools"
        ]
      },
      {
        "id": "configuration-and-build",
        "title": "Configuration & Build",
        "topics": [
          "Strict Compiler Options",
          "Module Resolution",
          "Path Aliases",
          "Project References",
          "Build Modes",
          "ESM vs CJS Deep"
        ]
      },
      {
        "id": "ai-and-llms-in-typescript",
        "title": "AI & LLMs in TypeScript",
        "topics": [
          "LLM API Integration",
          "LangChain.js",
          "Vercel AI SDK",
          "Embeddings & Vector Search in JS",
          "Transformers.js",
          "Browser ML (WebGPU/WebNN)",
          "Structured LLM Output with Zod",
          "Streaming & Real-time AI",
          "AI-Powered Search",
          "Building AI Agents in TypeScript"
        ]
      }
    ]
  },
  {
    "id": "py",
    "title": "Python",
    "summary": "Learn Python from the ground up — getting started, operators, control flow, and more.",
    "lang": "py",
    "icon": "/public/logos/py.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Python",
          "Python Syntax",
          "Variables",
          "Comments & Docstrings",
          "Basic I/O"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic",
          "Bitwise",
          "Assignment",
          "Comparison",
          "Logical",
          "Identity & Membership"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if-elif-else",
          "match statement",
          "for & range()",
          "while statement",
          "break, continue & else"
        ]
      },
      {
        "id": "data-structures",
        "title": "Data Structures",
        "topics": [
          "Lists",
          "Tuples",
          "Dictionaries",
          "Sets",
          "Slicing",
          "collections.deque",
          "namedtuple"
        ]
      },
      {
        "id": "comprehensions",
        "title": "Comprehensions",
        "topics": [
          "List Comprehensions",
          "Dict & Set Comprehensions",
          "Generator Expressions",
          "Nested Comprehensions"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Definitions & Scopes",
          "Argument Logic",
          "Lambda Expressions",
          "Recursion",
          "Docstrings",
          "Type Hints in Functions"
        ]
      },
      {
        "id": "classes",
        "title": "Classes",
        "topics": [
          "Class & Objects",
          "Methods & Variables",
          "Inheritance",
          "dataclasses",
          "@property Decorator",
          "Magic Methods",
          "Abstract Base Classes"
        ]
      },
      {
        "id": "modules-and-errors",
        "title": "Modules & Errors",
        "topics": [
          "Modules & Packages",
          "Handling Exceptions",
          "Raising Exceptions",
          "Custom Exceptions",
          "pip & Virtual Environments",
          "if __name__ == '__main__'",
          "with Statement (Context Managers)"
        ]
      },
      {
        "id": "files-and-inputs",
        "title": "Files & Inputs",
        "topics": [
          "Reading & Writing",
          "Terminal Input",
          "Binary Files",
          "File Modes & Positions"
        ]
      },
      {
        "id": "additions",
        "title": "Additions",
        "topics": [
          "pass & Ellipsis",
          "Generators",
          "f-strings & Formatting",
          "Ternary Expression",
          "enumerate & zip",
          "any & all"
        ]
      },
      {
        "id": "standard-libraries",
        "title": "Standard Libraries",
        "topics": [
          "json",
          "re (Regular Expressions)",
          "math, random & statistics",
          "datetime",
          "collections",
          "os & sys"
        ]
      },
      {
        "id": "async-python",
        "title": "Async Python",
        "topics": [
          "async/await",
          "asyncio.gather",
          "Async Context Managers",
          "asyncio.TaskGroup",
          "Async Generators"
        ]
      },
      {
        "id": "file-system-and-paths",
        "title": "File System & Paths",
        "topics": [
          "pathlib",
          "shutil",
          "glob (file patterns)",
          "tempfile"
        ]
      },
      {
        "id": "logging",
        "title": "Logging",
        "topics": [
          "logging module",
          "Logging Configuration",
          "Logging Handlers & Filters"
        ]
      },
      {
        "id": "itertools-and-functools",
        "title": "Itertools & Functools",
        "topics": [
          "itertools",
          "functools",
          "contextlib",
          "operator module"
        ]
      },
      {
        "id": "decorators-and-closures",
        "title": "Decorators & Closures",
        "topics": [
          "Function Decorators",
          "Decorators with Arguments",
          "Class Decorators",
          "Closures",
          "Nested Functions & nonlocal",
          "@wraps (functools.wraps)"
        ]
      },
      {
        "id": "testing-and-debugging",
        "title": "Testing & Debugging",
        "topics": [
          "doctest",
          "unittest",
          "pytest",
          "pdb (Debugger)",
          "cProfile & Profiling",
          "unittest.mock"
        ]
      },
      {
        "id": "packaging-and-distribution",
        "title": "Packaging & Distribution",
        "topics": [
          "setuptools & setup.py",
          "pyproject.toml",
          "Wheels & sdist",
          "pip install -e (Editable Installs)",
          "Namespace Packages"
        ]
      },
      {
        "id": "working-with-data",
        "title": "Working with Data",
        "topics": [
          "CSV",
          "JSON",
          "YAML",
          "SQLite",
          "pickle",
          "XML & ElementTree"
        ]
      },
      {
        "id": "concurrency-deep-dive",
        "title": "Concurrency Deep Dive",
        "topics": [
          "threading",
          "multiprocessing",
          "ThreadPoolExecutor & ProcessPoolExecutor",
          "Queues (threading/multiprocessing)",
          "asyncio.Queue"
        ]
      },
      {
        "id": "web-and-apis",
        "title": "Web & APIs",
        "topics": [
          "requests",
          "httpx",
          "FastAPI Basics",
          "Flask Basics",
          "aiohttp"
        ]
      },
      {
        "id": "type-hints",
        "title": "Type Hints",
        "topics": [
          "Basic Types & Annotations",
          "Optional & Union",
          "Generics & TypeVar",
          "Protocol (Structural Subtyping)",
          "TypedDict",
          "Literal, Final & Type Aliases"
        ]
      },
      {
        "id": "performance",
        "title": "Performance",
        "topics": [
          "Profiling & Optimization",
          "__slots__",
          "Generators vs Lists",
          "C Extensions (Cython & ctypes)",
          "timeit & Benchmarking",
          "Memory Management & GC"
        ]
      },
      {
        "id": "automation-and-browsing",
        "title": "Automation & Browsing",
        "topics": [
          "Web Scraping with BeautifulSoup",
          "Selenium & Browser Automation",
          "Working with PDFs (PyMuPDF)",
          "Excel (openpyxl)",
          "Word Documents (python-docx)",
          "Email (smtplib)",
          "Scheduled Tasks (schedule)",
          "GUI Automation (PyAutoGUI)",
          "Image Manipulation (Pillow)",
          "CLI Tools (argparse & click)"
        ]
      },
      {
        "id": "fluent-python-deep-dive",
        "title": "Fluent Python Deep Dive",
        "topics": [
          "Python Data Model (Dunder Methods)",
          "__getattr__ & __setattr__",
          "__call__ & Callable Objects",
          "Descriptors",
          "Metaclasses",
          "ABC Advanced (subclasshook)",
          "Operator Overloading Advanced",
          "Context Managers Advanced",
          "Coroutines & yield from"
        ]
      },
      {
        "id": "data-science-and-ai",
        "title": "Data Science & AI",
        "topics": [
          "NumPy Basics",
          "Pandas Essentials",
          "Matplotlib & Visualization",
          "Seaborn Statistical Plots",
          "scikit-learn ML Basics",
          "Pandas Data Wrangling",
          "PyTorch Deep Learning",
          "Transformers & Hugging Face",
          "NumPy Linear Algebra",
          "Feature Engineering & Preprocessing",
          "Model Evaluation & Validation",
          "Time Series Analysis",
          "Gradient Boosting",
          "Unsupervised Learning"
        ]
      },
      {
        "id": "ai-and-llm-engineering",
        "title": "AI & LLM Engineering",
        "topics": [
          "LLM Foundations (Tokenization & Embeddings)",
          "Prompt Engineering",
          "RAG (Retrieval-Augmented Generation)",
          "Fine-tuning with LoRA/QLoRA",
          "LLM Evaluation & Guardrails",
          "AI Agents & Tool Use",
          "LLM API Integration & Streaming",
          "Data Collection for AI (Web Scraping Pipelines)"
        ]
      },
      {
        "id": "ai-engineering-pro",
        "title": "AI Engineering Pro",
        "topics": [
          "Embeddings & Vector Databases",
          "LangChain & LlamaIndex",
          "Multimodal AI",
          "Structured Output from LLMs",
          "AI Agent Frameworks",
          "Prompt Caching & Optimization",
          "Synthetic Data Generation",
          "Model Serving & Deployment",
          "AI Evaluations (Advanced)",
          "MLOps for LLMs",
          "AI Safety & Alignment"
        ]
      }
    ]
  },
  {
    "id": "go",
    "title": "Go",
    "summary": "Learn Go from the ground up — getting started, variables & types, operators, and more.",
    "lang": "go",
    "icon": "/public/logos/go.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Go",
          "Go Syntax",
          "Your First Program",
          "Go Playground",
          "go run vs go build",
          "GOPATH & Module Basics"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "Variable Declaration",
          "Primitive Types",
          "Type Conversion",
          "Constants",
          "Zero Values",
          "Short Declaration (:=)",
          "Type Inference"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic Operators",
          "Comparison Operators",
          "Logical Operators",
          "Bitwise Operators",
          "Increment/Decrement Statements",
          "Operator Precedence"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "If & Else",
          "Switch Statement",
          "For Loop",
          "Break & Continue",
          "Label Statements",
          "Type Switch",
          "Defer",
          "Goto"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Declaration",
          "Multiple Return Values",
          "Named Return Values",
          "Variadic Functions",
          "Anonymous Functions & Closures",
          "init Functions",
          "Function Values"
        ]
      },
      {
        "id": "collections",
        "title": "Collections",
        "topics": [
          "Arrays",
          "Slices",
          "Slice Internals",
          "Maps",
          "Range Loops",
          "make vs new"
        ]
      },
      {
        "id": "pointers-and-references",
        "title": "Pointers & References",
        "topics": [
          "Pointer Basics",
          "Pointers to Structs",
          "Pointers as Parameters",
          "new() Function",
          "Pointer vs Value Receiver",
          "unsafe Package & uintptr"
        ]
      },
      {
        "id": "structs-and-composition",
        "title": "Structs & Composition",
        "topics": [
          "Struct Definition",
          "Struct Tags",
          "Anonymous (Embedded) Fields",
          "Struct Methods",
          "Pointer Receivers",
          "Struct Comparison",
          "Constructor Functions"
        ]
      },
      {
        "id": "interfaces",
        "title": "Interfaces",
        "topics": [
          "Interface Definition",
          "Implicit Implementation",
          "Type Assertions",
          "Empty Interface (any)",
          "Interface Composition",
          "Interface Values & Nil",
          "Best Practices (Accept interfaces, return structs)"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Error Interface",
          "Error Checking",
          "Custom Error Types",
          "Sentinel Errors",
          "Error Wrapping",
          "errors.Is and errors.As",
          "Panic & Recover"
        ]
      },
      {
        "id": "concurrency",
        "title": "Concurrency",
        "topics": [
          "Goroutines",
          "Channels",
          "Buffered Channels",
          "Range & Close",
          "Select Statement",
          "WaitGroup",
          "sync.Once",
          "Mutex & RWMutex",
          "Worker Pools",
          "Fan-in / Fan-out",
          "Context Deep & Cancellation Patterns"
        ]
      },
      {
        "id": "packages-and-imports",
        "title": "Packages & Imports",
        "topics": [
          "Package Declaration",
          "Importing Packages",
          "Exported Names",
          "Package Initialization (init)",
          "Internal Packages",
          "Blank Imports",
          "Import Cycles"
        ]
      },
      {
        "id": "file-i-o",
        "title": "File I/O",
        "topics": [
          "Reading Files (os.ReadFile)",
          "Writing Files (os.WriteFile)",
          "Buffered I/O (bufio)",
          "io.ReadAll",
          "io.Copy",
          "File Permissions & ioutil Deprecation",
          "Directory Operations"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "Test Functions",
          "Table-Driven Tests",
          "Subtests",
          "Test Helpers",
          "Test Coverage",
          "Fuzzing",
          "Benchmarks",
          "Fuzzing with go test -fuzz"
        ]
      },
      {
        "id": "standard-library",
        "title": "Standard Library",
        "topics": [
          "fmt Package",
          "strings & strconv Packages",
          "io Package",
          "encoding/json Package",
          "flag Package",
          "log Package",
          "os/exec Package",
          "time Package",
          "context Package",
          "sync Package"
        ]
      },
      {
        "id": "modules-and-tooling",
        "title": "Modules & Tooling",
        "topics": [
          "Go Modules",
          "Workspace Mode",
          "Build Tags",
          "go generate",
          "go tooling (vet, fmt, fix)",
          "Dependency Management (go get)",
          "Generics",
          "Workspace Mode (go.work)"
        ]
      },
      {
        "id": "networking",
        "title": "Networking",
        "topics": [
          "HTTP Server (net/http)",
          "HTTP Client",
          "Routing & ServeMux (Go 1.22+)",
          "Middleware Pattern",
          "Templates (html/template)",
          "TLS & HTTPS",
          "TCP & UDP Sockets"
        ]
      },
      {
        "id": "database-and-sql",
        "title": "Database & SQL",
        "topics": [
          "database/sql Interface",
          "Querying (Query & QueryRow)",
          "Prepared Statements",
          "Transactions",
          "Connection Pooling",
          "Migrations (golang-migrate)",
          "Database Drivers"
        ]
      },
      {
        "id": "learning-go-and-best-practices",
        "title": "Learning Go & Best Practices",
        "topics": [
          "Go Design Philosophy",
          "nil & Zero Values Mental Model",
          "slog Structured Logging (Go 1.21+)",
          "errors.Join & Error Handling (Go 1.20+)",
          "maps & slices Packages (Go 1.21+)",
          "Range over Iterators & func (Go 1.23+)",
          "Embedding (//go:embed)",
          "Race Detector & Data Races",
          "Profiling & pprof",
          "sync/atomic (Go 1.19+ Typed API)"
        ]
      },
      {
        "id": "ecosystem-and-frameworks",
        "title": "Ecosystem & Frameworks",
        "topics": [
          "CLI Applications (Cobra)",
          "Web Frameworks (Gin, Echo)",
          "gRPC & Protocol Buffers",
          "Logging Libraries (Zap, Zerolog)",
          "Linters & Code Quality",
          "TinyGo & WebAssembly"
        ]
      },
      {
        "id": "advanced-go",
        "title": "Advanced Go",
        "topics": [
          "Reflection",
          "CGO Basics",
          "Escape Analysis",
          "unsafe Package",
          "Generics Deep: Constraints & Type Inference"
        ]
      },
      {
        "id": "deployment-and-devops",
        "title": "Deployment & DevOps",
        "topics": [
          "Docker Multi-stage Builds",
          "Kubernetes Deployment"
        ]
      }
    ]
  },
  {
    "id": "rust",
    "title": "Rust",
    "summary": "Learn Rust from the ground up — getting started, control flow, ownership & borrowing, and more.",
    "lang": "rust",
    "icon": "/public/logos/rust.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Rust",
          "Rust Syntax Basics",
          "Variables & Mutability",
          "Scalar Types",
          "rustup & Toolchains",
          "Cargo Basics",
          "rustfmt",
          "Clippy",
          "rust-analyzer"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if / else if / else",
          "Loops (loop, while, for)",
          "Pattern Matching (match)",
          "if let",
          "while let",
          "Labeled Break & Continue",
          "Loop Returning Values"
        ]
      },
      {
        "id": "ownership-and-borrowing",
        "title": "Ownership & Borrowing",
        "topics": [
          "Ownership Rules",
          "Move Semantics",
          "Borrowing & References",
          "Borrow Rules Deep",
          "Split Borrows",
          "Non-Lexical Lifetimes (NLL)",
          "Slices",
          "Interior Mutability",
          "RefCell & Borrow Checking at Runtime"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Declaration",
          "Methods & Associated Functions",
          "Closures",
          "Diverging Functions & Never Type",
          "Function Pointers",
          "Where Clauses",
          "Higher-Order Functions"
        ]
      },
      {
        "id": "compound-types",
        "title": "Compound Types",
        "topics": [
          "Tuples",
          "Arrays",
          "Vectors",
          "Strings (&str vs String)",
          "Structs",
          "Tuple Structs",
          "Unit Structs",
          "Enums"
        ]
      },
      {
        "id": "traits-and-generics",
        "title": "Traits & Generics",
        "topics": [
          "Generics",
          "Traits",
          "Derive Macros",
          "Supertraits",
          "Trait Objects & dyn Trait",
          "impl Trait Syntax",
          "Associated Types",
          "Blanket Implementations",
          "Trait Bounds & where Clauses"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Result & Option",
          "The ? Operator",
          "Panic & Unrecoverable Errors",
          "Custom Error Types",
          "thiserror Crate",
          "anyhow / eyre Crates",
          "Error Chaining",
          "Result Combinators"
        ]
      },
      {
        "id": "collections",
        "title": "Collections",
        "topics": [
          "Vec",
          "VecDeque",
          "HashMap & HashSet",
          "BTreeMap & BTreeSet",
          "BinaryHeap",
          "LinkedList",
          "Iterators Deep"
        ]
      },
      {
        "id": "advanced-rust",
        "title": "Advanced Rust",
        "topics": [
          "Box<T> (Heap Allocation)",
          "Rc<T> (Reference Counting)",
          "Arc<T> (Atomic RC)",
          "Cell<T> & RefCell<T>",
          "Cow (Clone-on-Write)",
          "Pin<T>",
          "Drop Order",
          "Mutex, RwLock, Condvar",
          "Channels (mpsc)",
          "Pinning & Pin<P>"
        ]
      },
      {
        "id": "modules-and-cargo",
        "title": "Modules & Cargo",
        "topics": [
          "Modules & Paths",
          "Re-exports",
          "Nested Modules & File System",
          "Cargo.toml & Crate Types",
          "Dependencies & Features",
          "Workspaces",
          "Conditional Compilation"
        ]
      },
      {
        "id": "lifetimes",
        "title": "Lifetimes",
        "topics": [
          "Basic Lifetime Annotations",
          "Lifetime Elision Rules",
          "'static Lifetime",
          "Lifetime Bounds & Subtyping",
          "Higher-Ranked Trait Bounds (HRTB)",
          "Variance",
          "Lifetime Coercion",
          "NLL Deep"
        ]
      },
      {
        "id": "async-rust",
        "title": "Async Rust",
        "topics": [
          "async/await Basics",
          "Tokio Runtime Deep",
          "Async Traits",
          "select! & join! Macros",
          "join_all / FuturesUnordered",
          "Async Streams",
          "Pin Projection",
          "Async Sync Primitives"
        ]
      },
      {
        "id": "unsafe-and-ffi",
        "title": "Unsafe & FFI",
        "topics": [
          "Raw Pointers",
          "Unsafe Functions & Blocks",
          "Calling C (FFI)",
          "#[repr(C)] & repr Attributes",
          "no_std & Global Allocator",
          "#[link] & extern Blocks",
          "Exposing Rust to C (cdylib)"
        ]
      },
      {
        "id": "patterns-and-idioms",
        "title": "Patterns & Idioms",
        "topics": [
          "Builder Pattern",
          "RAII (Resource Acquisition Is Initialization)",
          "Newtype Pattern",
          "Deref Pattern & Deref Coercion",
          "Drop Order in Composed Types",
          "Typestate Pattern",
          "Interior Mutability Patterns"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "Unit Tests",
          "Integration Tests",
          "Doc Tests",
          "Test Organization & Attributes",
          "Benchmarks",
          "Property Testing with proptest",
          "Mocking & Test Doubles"
        ]
      },
      {
        "id": "macros",
        "title": "Macros",
        "topics": [
          "Declarative Macros (macro_rules!)",
          "Macro Patterns & Designators",
          "Procedural Macros (proc-macro)",
          "Derive Macros",
          "Attribute Macros",
          "Debugging Macros",
          "Declarative Macro Patterns"
        ]
      }
    ]
  },
  {
    "id": "java",
    "title": "Java",
    "summary": "Learn Java from the ground up — java basics, object-oriented programming, functional programming, and more.",
    "lang": "java",
    "icon": "/public/logos/java.svg",
    "phases": [
      {
        "id": "java-basics",
        "title": "Java Basics",
        "topics": [
          "What is Java",
          "JDK vs JRE vs JVM",
          "Basic Syntax",
          "Comments",
          "var Keyword & Type Inference",
          "Autoboxing & Unboxing",
          "Data Types",
          "Variables & Scope",
          "Type Casting",
          "Operators",
          "Conditionals",
          "Loops",
          "Arrays",
          "String Pool & Interning",
          "Strings",
          "Try-With-Resources Deep",
          "Exception Handling",
          "Exception Patterns & Best Practices"
        ]
      },
      {
        "id": "object-oriented-programming",
        "title": "Object-Oriented Programming",
        "topics": [
          "Classes & Objects",
          "Constructors",
          "Access Modifiers",
          "Static Keyword",
          "Inheritance",
          "Encapsulation",
          "Polymorphism",
          "Anonymous Classes",
          "Abstraction",
          "Interfaces",
          "Enums",
          "Nested & Inner Classes",
          "Object Methods (equals/hashCode/toString)",
          "Composition Over Inheritance",
          "Records"
        ]
      },
      {
        "id": "functional-programming",
        "title": "Functional Programming",
        "topics": [
          "Lambda Expressions",
          "Primitive Streams & Optionals",
          "Functional Interfaces",
          "Method References",
          "Stream API",
          "Collectors Deep",
          "Optional"
        ]
      },
      {
        "id": "collections-framework",
        "title": "Collections Framework",
        "topics": [
          "List Interface",
          "Set Interface",
          "Map Interface",
          "Queue & Deque",
          "Immutable & Unmodifiable Collections",
          "ArrayList vs LinkedList",
          "Sorting & Comparator",
          "Collections Utility"
        ]
      },
      {
        "id": "generics",
        "title": "Generics",
        "topics": [
          "Generic Classes",
          "Generic Methods",
          "Wildcards",
          "Type Inference & Target Types",
          "Type Erasure"
        ]
      },
      {
        "id": "i-o-and-file-handling",
        "title": "I/O & File Handling",
        "topics": [
          "RandomAccessFile & Mapped Files",
          "Stream I/O",
          "NIO (New I/O)",
          "Compression (GZIP & ZIP)",
          "Serialization"
        ]
      },
      {
        "id": "concurrency",
        "title": "Concurrency",
        "topics": [
          "Threads & Runnable",
          "Synchronization",
          "ExecutorService",
          "CompletableFuture",
          "Atomic Variables & Locks",
          "ForkJoinPool & Parallel Streams",
          "Virtual Threads"
        ]
      },
      {
        "id": "build-tools",
        "title": "Build Tools",
        "topics": [
          "Maven Basics",
          "Maven Lifecycle & Plugins",
          "Gradle Basics",
          "Build Performance & Multi-Module"
        ]
      },
      {
        "id": "database-access",
        "title": "Database Access",
        "topics": [
          "Flyway Migrations",
          "JDBC",
          "Connection Pooling (HikariCP)",
          "JPA & Hibernate"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "JUnit 5",
          "Integration Testing",
          "Parameterized Tests",
          "Mockito"
        ]
      },
      {
        "id": "web-frameworks",
        "title": "Web Frameworks",
        "topics": [
          "Spring Boot Basics",
          "REST API Patterns",
          "Servlets & JSP"
        ]
      },
      {
        "id": "logging",
        "title": "Logging",
        "topics": [
          "MDC & Structured Logging",
          "SLF4J & Logback"
        ]
      },
      {
        "id": "strings-and-text",
        "title": "Strings & Text",
        "topics": [
          "StringBuilder & StringBuffer",
          "Regex (Pattern & Matcher)",
          "StringJoiner & Formatting"
        ]
      },
      {
        "id": "standard-library",
        "title": "Standard Library",
        "topics": [
          "java.util.function Package",
          "java.time Deep",
          "Collections Utility Deep",
          "JAR Packaging & Manifests"
        ]
      },
      {
        "id": "java-platform-features",
        "title": "Java Platform Features",
        "topics": [
          "Modules (Project Jigsaw)",
          "Date & Time API",
          "Annotations",
          "Vector API (Incubator/Preview)",
          "Foreign Function & Memory API",
          "Newer Language Features"
        ]
      }
    ]
  },
  {
    "id": "kt",
    "title": "Kotlin",
    "summary": "Learn Kotlin from the ground up — getting started, control flow, functions, and more.",
    "lang": "kt",
    "icon": "/public/logos/kt.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Kotlin",
          "Kotlin Syntax",
          "Variables & Types",
          "Null Safety",
          "Kotlin Playground",
          "Multiplatform Overview",
          "Project Structure",
          "Kotlin/Native & WASM"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "If & When expressions",
          "for & while Loops",
          "Range & Progression",
          "Equality Checks",
          "Exception Handling",
          "try as Expression",
          "Ranges & Progressions"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Declaration",
          "Default & Named Args",
          "Lambda & Higher-Order",
          "Extension Functions",
          "Infix Functions",
          "Operator Overloading",
          "tailrec",
          "Inline Functions",
          "Destructuring Declarations"
        ]
      },
      {
        "id": "collections",
        "title": "Collections",
        "topics": [
          "Lists & Arrays",
          "Maps & Sets",
          "Sequences",
          "Functional Operations",
          "Grouping & Partitioning",
          "Windowed & Chunked",
          "Element Operations",
          "Sequences vs Iterables"
        ]
      },
      {
        "id": "classes-and-oop",
        "title": "Classes & OOP",
        "topics": [
          "Class Basics",
          "Inheritance & Interfaces",
          "Data Classes",
          "Sealed Classes & Interfaces",
          "Object & Companion",
          "Value & Inline Classes",
          "Type Aliases",
          "Delegation",
          "Abstract Classes & Nested",
          "Value Classes (Inline)"
        ]
      },
      {
        "id": "generics",
        "title": "Generics",
        "topics": [
          "Generic Functions & Classes",
          "Variance — out & in",
          "Reified Type Parameters",
          "Star Projections",
          "Type Bounds & Where"
        ]
      },
      {
        "id": "coroutines",
        "title": "Coroutines",
        "topics": [
          "Launch & Async",
          "Dispatchers",
          "Structured Concurrency",
          "supervisorScope",
          "Coroutine Context & Scope",
          "Cancellation & Timeouts",
          "Exception Handling",
          "coroutineScope vs runBlocking",
          "Dispatchers & Threading"
        ]
      },
      {
        "id": "flows",
        "title": "Flows",
        "topics": [
          "Flow Basics",
          "Flow Builders",
          "Flow Operators",
          "StateFlow",
          "SharedFlow",
          "CallbackFlow",
          "Terminal Flow Operators",
          "Combining Flows",
          "Flow Operators Deep"
        ]
      },
      {
        "id": "advanced-kotlin",
        "title": "Advanced Kotlin",
        "topics": [
          "Context Receivers",
          "Contracts",
          "@JvmInline & JvmAnnotations",
          "Type Erasure & Reified",
          "Reflection",
          "Annotations",
          "Destructuring Declarations",
          "Inline Functions & Performance"
        ]
      },
      {
        "id": "kotlin-multiplatform",
        "title": "Kotlin Multiplatform",
        "topics": [
          "KMP Overview",
          "expect/actual",
          "Common Code",
          "Platform-Specific Code",
          "KMP Libraries & Frameworks",
          "expect/actual Mechanism"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "kotlin.test Basics",
          "Kotest",
          "MockK",
          "Property-Based Testing",
          "Coroutine Testing",
          "JUnit 5 Integration",
          "Property Testing (Kotest)",
          "Mocking with MockK"
        ]
      },
      {
        "id": "build-and-tooling",
        "title": "Build & Tooling",
        "topics": [
          "Gradle Kotlin DSL",
          "Version Catalogs",
          "buildSrc & Convention Plugins",
          "KSP & K2 Compiler",
          "Dokka & Tooling"
        ]
      },
      {
        "id": "kotlin-idioms-and-dsl",
        "title": "Kotlin Idioms & DSL",
        "topics": [
          "Scope Functions Deep",
          "Lambda with Receiver",
          "Type-Safe Builders & @DslMarker",
          "SAM Conversion",
          "Java Interop",
          "Kotlin Idioms"
        ]
      },
      {
        "id": "android-development",
        "title": "Android Development",
        "topics": [
          "Jetpack Compose Basics",
          "ViewModel & State",
          "LiveData & StateFlow",
          "Room Database",
          "Retrofit & Networking",
          "Navigation Compose",
          "Ktor Client & Networking"
        ]
      }
    ]
  },
  {
    "id": "cs",
    "title": "C#",
    "summary": "Learn C# from the ground up — getting started, variables & types, operators, and more.",
    "lang": "cs",
    "icon": "/public/logos/cs.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is .NET?",
          "Project Types & Templates",
          "IDE & Editor Choices",
          "Top-Level Statements",
          "File-Scoped Namespaces",
          "Project Structure & SDKs"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "Primitive Types",
          "var & Implicit Typing",
          "object & dynamic",
          "Nullable Value Types",
          "Nullable Reference Types",
          "Null-Forgiving Operator",
          "Constants & Readonly",
          "Tuple Types"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic & Assignment",
          "Comparison & Equality",
          "Logical & Bitwise",
          "Null-Conditional Operator",
          "Null-Coalescing Operators",
          "Switch Expressions",
          "Conditional Operator"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if / else if / else",
          "Switch Statement",
          "Pattern Matching",
          "for Loop",
          "foreach Loop",
          "while & do-while",
          "break, continue, goto",
          "using Declaration"
        ]
      },
      {
        "id": "methods",
        "title": "Methods",
        "topics": [
          "Method Basics",
          "Parameter Modifiers (ref, in, out)",
          "params Keyword",
          "Optional & Named Parameters",
          "Expression-Bodied Members",
          "Local Functions",
          "Return Values & Multiple Returns",
          "Delegates & Lambda Expressions"
        ]
      },
      {
        "id": "classes-and-oop",
        "title": "Classes & OOP",
        "topics": [
          "Classes & Objects",
          "Fields & Properties",
          "Init Setters & Required Members",
          "Primary Constructors",
          "Record Types",
          "Inheritance",
          "Polymorphism",
          "Abstract Classes & Sealed",
          "Static Members & Classes",
          "Object Initializers"
        ]
      },
      {
        "id": "interfaces-and-generics",
        "title": "Interfaces & Generics",
        "topics": [
          "Interface Basics",
          "Default Interface Methods",
          "Generic Constraints",
          "Covariance & Contravariance",
          "Generic Methods",
          "IDisposable & IAsyncDisposable",
          "Variance: in/out"
        ]
      },
      {
        "id": "collections-and-linq",
        "title": "Collections & LINQ",
        "topics": [
          "Arrays",
          "List<T>",
          "Dictionary<TKey, TValue>",
          "HashSet<T> & SortedSet<T>",
          "Queue<T> & Stack<T>",
          "LINQ Basics",
          "LINQ Methods Deep",
          "LINQ GroupBy & Joins",
          "Concurrent Collections",
          "PLINQ (Parallel LINQ)"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "try / catch / finally",
          "Exception Filters (when)",
          "Custom Exceptions",
          "Guard Clauses & Argument Validation",
          "Throw Helpers",
          "Result Pattern (Functional Error Handling)"
        ]
      },
      {
        "id": "async-and-concurrency",
        "title": "Async & Concurrency",
        "topics": [
          "async / await Basics",
          "Task & Task<T>",
          "Cancellation",
          "ValueTask & ValueTask<T>",
          "Async Streams (IAsyncEnumerable)",
          "Channel<T>",
          "Task Parallel Library (Dataflow)",
          "Thread Synchronization",
          "Parallel.For / Parallel.ForEach"
        ]
      },
      {
        "id": "file-i-o-and-serialization",
        "title": "File I/O & Serialization",
        "topics": [
          "File & Directory Operations",
          "StreamReader / StreamWriter",
          "System.Text.Json",
          "System.Text.Json Source Generators",
          "XML Serialization",
          "Binary Serialization (obsolete)",
          "Protocol Buffers (Protobuf)"
        ]
      },
      {
        "id": "memory-and-performance",
        "title": "Memory & Performance",
        "topics": [
          "Span<T> & ReadOnlySpan<T>",
          "Memory<T> & ReadOnlyMemory<T>",
          "ref struct & readonly ref struct",
          "stackalloc",
          "Unsafe Code & Pointers",
          "Ref Returns & Ref Locals",
          "Memory Pool & ArrayPool",
          "WeakReference & Conditional Weak Tables"
        ]
      },
      {
        "id": "interop",
        "title": "Interop",
        "topics": [
          "P/Invoke (Platform Invoke)",
          "COM Interop",
          "Fixed Size Buffers",
          "Marshal Class",
          "WinRT Interop & COM"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "xUnit.net Basics",
          "NUnit Basics",
          "Moq (Mocking)",
          "FluentAssertions",
          "TDD with C#",
          "xUnit & Fluent Assertions"
        ]
      },
      {
        "id": "net-ecosystem",
        "title": ".NET Ecosystem",
        "topics": [
          "NuGet Package Manager",
          "ASP.NET Core Minimal API",
          "Entity Framework Core",
          "Blazor Basics",
          "Dependency Injection",
          "Configuration & Options"
        ]
      },
      {
        "id": "advanced",
        "title": "Advanced",
        "topics": [
          "Source Generators",
          "Compile-Time Code Generation with Roslyn",
          "Native AOT Compilation",
          "Function Pointers (delegate*)",
          "Regex Source Generators",
          "Raw String Literals",
          "Interceptors (Experimental)",
          "List Patterns"
        ]
      },
      {
        "id": "c-12-and-net-8-features",
        "title": "C# 12 & .NET 8 Features",
        "topics": [
          "Collection Expressions",
          "Default Lambda Parameters",
          "ref readonly Parameters",
          "Alias Any Type",
          "params Collections",
          "Primary Constructors"
        ]
      },
      {
        "id": "software-engineering-heuristics",
        "title": "Software Engineering Heuristics",
        "topics": [
          "Small Methods (Fits in Your Head)",
          "Command-Query Separation",
          "Pure Functions & Determinism",
          "Cyclomatic Complexity & Guard Clauses",
          "API Surface & Information Hiding",
          "Property-Based Testing",
          "SUT & Test Data Builders",
          "Postel's Law & Defensive Coding",
          "Dependency Inversion & Composition Root",
          "Parameter Objects & Immutability"
        ]
      }
    ]
  },
  {
    "id": "cpp",
    "title": "C++",
    "summary": "Learn C++ from the ground up — getting started, variables & types, operators, and more.",
    "lang": "cpp",
    "icon": "/public/logos/cpp.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is C++",
          "C++ Versions",
          "Compilers & Build",
          "Project Structure",
          "Namespaces",
          "Basic Syntax"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "Fundamental Types",
          "auto & decltype",
          "Type Deduction Rules",
          "nullptr & Fixed-Width Types",
          "const & constexpr"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic & Logical",
          "Bitwise & Shift",
          "Overloaded Operators Basics",
          "User-Defined Literals"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if / else",
          "Switch",
          "Loops",
          "Range-Based For",
          "if constexpr",
          "Structured Bindings",
          "Init-Statements"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Declaration & Definition",
          "Overloading & Default Args",
          "Lambda Expressions",
          "Trailing Return Type",
          "noexcept",
          "consteval / constinit",
          "Function Try Blocks"
        ]
      },
      {
        "id": "strings",
        "title": "Strings",
        "topics": [
          "std::string",
          "String Views",
          "Raw String Literals",
          "String Conversion",
          "UTF-8 Support"
        ]
      },
      {
        "id": "object-oriented-programming",
        "title": "Object-Oriented Programming",
        "topics": [
          "Classes & Objects",
          "Inheritance & Polymorphism",
          "Virtual Destructors",
          "Pure Virtual & Abstract Classes",
          "Virtual Inheritance",
          "Copy & Swap Idiom",
          "Rule of Five",
          "Move Semantics",
          "RAII"
        ]
      },
      {
        "id": "stl-containers",
        "title": "STL Containers",
        "topics": [
          "std::vector",
          "std::map & std::set",
          "std::unordered_map / set",
          "std::deque",
          "std::list & forward_list",
          "Container Adaptors",
          "std::array"
        ]
      },
      {
        "id": "stl-algorithms",
        "title": "STL Algorithms",
        "topics": [
          "sort, find, transform",
          "lower_bound & binary_search",
          "partial_sort & nth_element",
          "accumulate & iota",
          "count_if & for_each"
        ]
      },
      {
        "id": "templates",
        "title": "Templates",
        "topics": [
          "Function & Class Templates",
          "Template Specialization",
          "Template Template Parameters",
          "Variadic Templates",
          "Fold Expressions",
          "SFINAE & enable_if"
        ]
      },
      {
        "id": "c-20-features",
        "title": "C++20 Features",
        "topics": [
          "Concepts",
          "Ranges Library",
          "Coroutines",
          "Modules",
          "Spaceship Operator <=>",
          "Views & Lazy Evaluation"
        ]
      },
      {
        "id": "c-23-features",
        "title": "C++23 Features",
        "topics": [
          "std::expected",
          "Deducing This",
          "flat_map & flat_set",
          "mdspan"
        ]
      },
      {
        "id": "smart-pointers",
        "title": "Smart Pointers",
        "topics": [
          "std::unique_ptr",
          "std::shared_ptr",
          "std::weak_ptr",
          "enable_shared_from_this",
          "Custom Deleters"
        ]
      },
      {
        "id": "concurrency",
        "title": "Concurrency",
        "topics": [
          "std::thread",
          "Mutex & Locks",
          "Async & Futures",
          "std::jthread",
          "std::latch & std::barrier",
          "std::counting_semaphore",
          "std::latch, std::barrier & std::semaphore"
        ]
      },
      {
        "id": "file-i-o",
        "title": "File I/O",
        "topics": [
          "std::fstream Basics",
          "std::filesystem",
          "std::stringstream",
          "Binary I/O"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Exceptions",
          "noexcept Specifier",
          "std::exception Hierarchy",
          "Error Codes & std::error_code",
          "noexcept & noexcept Specifier Deep"
        ]
      },
      {
        "id": "build-systems",
        "title": "Build Systems",
        "topics": [
          "CMake Deep",
          "vcpkg",
          "Conan",
          "Build Tools Overview"
        ]
      },
      {
        "id": "frameworks",
        "title": "Frameworks",
        "topics": [
          "Qt Framework",
          "Boost Libraries",
          "Unreal Engine C++",
          "Google Test & Benchmark"
        ]
      },
      {
        "id": "utilities-and-type-support",
        "title": "Utilities & Type Support",
        "topics": [
          "std::optional (C++17)",
          "std::variant (C++17)",
          "std::any (C++17)",
          "Type Traits & Metaprogramming"
        ]
      },
      {
        "id": "modern-c-practice",
        "title": "Modern C++ Practice",
        "topics": [
          "Inline Variables (C++17)",
          "[[nodiscard]] & [[maybe_unused]]",
          "std::clamp / std::gcd / std::lcm (C++17)",
          "Parallel STL Algorithms (C++17)",
          "Code Organization (PIMPL Idiom)",
          "Design Patterns: Strategy & Observer",
          "Testing with Catch2 & GTest",
          "Performance Optimization"
        ]
      },
      {
        "id": "pointers-and-memory",
        "title": "Pointers & Memory",
        "topics": [
          "References",
          "Raw Pointers",
          "new & delete",
          "Memory Leakage",
          "Memory Model",
          "Object Lifetime"
        ]
      },
      {
        "id": "type-casting",
        "title": "Type Casting",
        "topics": [
          "static_cast",
          "dynamic_cast",
          "const_cast",
          "reinterpret_cast",
          "RTTI & typeid"
        ]
      },
      {
        "id": "language-internals",
        "title": "Language Internals",
        "topics": [
          "Undefined Behavior",
          "ADL",
          "Name Mangling",
          "Macros",
          "Forward Declaration",
          "Scope & Storage Duration"
        ]
      },
      {
        "id": "inheritance-and-advanced-oop",
        "title": "Inheritance & Advanced OOP",
        "topics": [
          "Multiple Inheritance",
          "Diamond Inheritance",
          "Virtual Tables",
          "Dynamic Polymorphism"
        ]
      },
      {
        "id": "debugging",
        "title": "Debugging",
        "topics": [
          "GDB Basics",
          "Debugging Symbols",
          "Sanitizers",
          "Performance Profiling"
        ]
      },
      {
        "id": "compilers",
        "title": "Compilers",
        "topics": [
          "Compiler Stages",
          "GCC & Clang",
          "MSVC",
          "Linkers & LTO"
        ]
      },
      {
        "id": "c-idioms",
        "title": "C++ Idioms",
        "topics": [
          "CRTP",
          "Non-Copyable Idiom",
          "Erase-Remove Idiom",
          "Copy on Write"
        ]
      },
      {
        "id": "date-and-time",
        "title": "Date & Time",
        "topics": [
          "std::chrono",
          "Random Number Generation"
        ]
      },
      {
        "id": "iterator-and-i-o-streams",
        "title": "Iterator & I/O Streams",
        "topics": [
          "Iterator Categories",
          "iostream Deep"
        ]
      },
      {
        "id": "additional-libraries",
        "title": "Additional Libraries",
        "topics": [
          "OpenCV",
          "fmtlib",
          "spdlog",
          "Protobuf & gRPC",
          "Boost.Asio",
          "fmtlib & spdlog"
        ]
      }
    ]
  },
  {
    "id": "c",
    "title": "C",
    "summary": "Learn C from the ground up — getting started, variables & storage, operators, and more.",
    "lang": "c",
    "icon": "/public/logos/c.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is C",
          "Hello World",
          "C Syntax & Structure",
          "Compilation Process",
          "Data Types",
          "Comments",
          "C Standards"
        ]
      },
      {
        "id": "variables-and-storage",
        "title": "Variables & Storage",
        "topics": [
          "Variables & Assignment",
          "Constants & Literals",
          "Scope & Lifetime",
          "Storage Classes",
          "Type Qualifiers",
          "Type Conversion",
          "typedef"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic Operators",
          "Relational & Logical Operators",
          "Bitwise Operators",
          "Assignment Operators",
          "sizeof, Ternary & Comma",
          "Operator Precedence",
          "Comma & Sequence Points"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if / else if / else",
          "Switch Statement",
          "Loops: for, while, do-while",
          "break & continue",
          "goto & Labels",
          "Infinite Loops & Pitfalls",
          "Switch Deep & Duff's Device"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Declaration & Definition",
          "Pass by Value",
          "Return Values",
          "Recursion",
          "Inline Functions",
          "Variadic Functions",
          "main() Arguments",
          "Variable Arguments (stdarg)"
        ]
      },
      {
        "id": "pointers",
        "title": "Pointers",
        "topics": [
          "Pointer Basics",
          "Pointer Arithmetic",
          "Pointers & Arrays",
          "Pointer to Pointer",
          "Void Pointers",
          "Function Pointers",
          "Dynamic Memory Allocation",
          "Memory Leaks & Debugging",
          "Function Pointers & Callbacks"
        ]
      },
      {
        "id": "arrays-and-strings",
        "title": "Arrays & Strings",
        "topics": [
          "One-Dimensional Arrays",
          "Multidimensional Arrays",
          "Array Initialization & Bounds",
          "Strings as char Arrays",
          "String Library",
          "Array of Strings",
          "Character Classification",
          "Variable-Length Arrays"
        ]
      },
      {
        "id": "structures-unions-and-enums",
        "title": "Structures, Unions & Enums",
        "topics": [
          "Structs",
          "Unions",
          "Bit Fields",
          "enum",
          "Struct Padding & Alignment",
          "Flexible Array Members",
          "Nested & Self-Referential Structs",
          "Bit Fields & Packing"
        ]
      },
      {
        "id": "file-i-o",
        "title": "File I/O",
        "topics": [
          "Opening & Closing Files",
          "Reading & Writing Text",
          "Formatted I/O",
          "Binary I/O",
          "File Positioning",
          "Error Handling",
          "Stream Buffering & setvbuf"
        ]
      },
      {
        "id": "preprocessor",
        "title": "Preprocessor",
        "topics": [
          "Macros (#define)",
          "Conditional Compilation",
          "Header Files & Guards",
          "#pragma & #error",
          "Predefined Macros",
          "Stringification & Token Pasting",
          "Variadic Macros",
          "#pragma & Implementation Extensions"
        ]
      },
      {
        "id": "standard-library",
        "title": "Standard Library",
        "topics": [
          "stdlib.h Utilities",
          "math.h Functions",
          "time.h Functions",
          "assert.h & setjmp.h",
          "signal.h Handling",
          "stddef.h & Limits",
          "Time & Date (<time.h>)"
        ]
      },
      {
        "id": "advanced-topics",
        "title": "Advanced Topics",
        "topics": [
          "Linked Lists",
          "Debugging with GDB",
          "Memory Debugging (Valgrind)",
          "Build Systems (Make)",
          "Multithreading (pthreads)",
          "Network Programming (Sockets)",
          "Atomics & _Generic (C11)",
          "POSIX Threads (pthreads)"
        ]
      },
      {
        "id": "c-in-practice",
        "title": "C in Practice",
        "topics": [
          "Interactive I/O (getchar/putchar)",
          "Low-Level I/O (UNIX System Interface)",
          "Storage Allocator (K&R Chapter 8)",
          "Complex Declarations (Right-Left Rule)",
          "Variable-Length Arrays (C99)",
          "Complex Numbers (C99)",
          "Building Larger Projects"
        ]
      },
      {
        "id": "defensive-c",
        "title": "Defensive C",
        "topics": [
          "Defensive Programming",
          "Three Common Bugs",
          "Safe String Handling",
          "Pointer Pitfalls",
          "Debugging Strategies",
          "Working with Multiple Files",
          "Static Analysis & Sanitizers"
        ]
      },
      {
        "id": "build-systems-and-makefiles",
        "title": "Build Systems & Makefiles",
        "topics": [
          "Makefile Basics",
          "Autotools & CMake"
        ]
      },
      {
        "id": "data-structures",
        "title": "Data Structures",
        "topics": [
          "Linked Lists",
          "Hash Tables",
          "Dynamic Arrays"
        ]
      },
      {
        "id": "embedded-and-bit-manipulation",
        "title": "Embedded & Bit Manipulation",
        "topics": [
          "Bitwise Operations",
          "Endianness & Binary Protocols",
          "Memory-Mapped I/O"
        ]
      },
      {
        "id": "posix-and-system-programming",
        "title": "POSIX & System Programming",
        "topics": [
          "Process Management",
          "Pipes & IPC"
        ]
      }
    ]
  },
  {
    "id": "rb",
    "title": "Ruby",
    "summary": "Learn Ruby from the ground up — getting started, variables & types, operators, and more.",
    "lang": "rb",
    "icon": "/public/logos/rb.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "Time, Date & DateTime",
          "IRB & Interactive Ruby",
          "Ruby Version Managers",
          "What is Ruby",
          "Ruby Syntax & Conventions",
          "Variables & Types",
          "Strings & Interpolation",
          "Arrays",
          "Hashes",
          "Symbols"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "Local & Global Variables",
          "Constants",
          "Data Types",
          "Type Conversion"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic",
          "Comparison",
          "Logical",
          "Range"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "Ternary & Statement Modifiers",
          "if/unless/elsif",
          "case/when",
          "while/until Loops",
          "for/in & each"
        ]
      },
      {
        "id": "methods",
        "title": "Methods",
        "topics": [
          "Keyword Arguments",
          "Default Values",
          "Defining Methods",
          "Splat Arguments",
          "Method Visibility",
          "Refinements"
        ]
      },
      {
        "id": "procs-and-lambdas",
        "title": "Procs & Lambdas",
        "topics": [
          "Blocks & yield",
          "Proc Objects",
          "Lambda Semantics",
          "Closures & Binding"
        ]
      },
      {
        "id": "enumerables-and-collections",
        "title": "Enumerables & Collections",
        "topics": [
          "Enumerable Module",
          "map/select/reduce Deep Dive",
          "Arrays Deep",
          "Hashes Deep",
          "Sets & SortedSet",
          "Enumerable Chaining"
        ]
      },
      {
        "id": "strings-and-regex",
        "title": "Strings & Regex",
        "topics": [
          "String Methods Deep",
          "Regular Expressions",
          "String Interpolation & Formatting",
          "String Building & Performance",
          "Encoding & Unicode"
        ]
      },
      {
        "id": "classes-and-oop",
        "title": "Classes & OOP",
        "topics": [
          "Singleton Class & Eigenclass",
          "Classes & Objects",
          "Inheritance",
          "Modules & Mixins",
          "attr_accessor/reader/writer",
          "super & Method Dispatch",
          "Struct & OpenStruct",
          "Duck Typing & Polymorphism"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Exception Hierarchy",
          "begin/rescue/ensure",
          "Custom Exceptions",
          "ensure & retry",
          "raise vs throw"
        ]
      },
      {
        "id": "modules-and-packages",
        "title": "Modules & Packages",
        "topics": [
          "require/load/autoload",
          "Gems & Gemfile",
          "Bundler Workflow"
        ]
      },
      {
        "id": "file-i-o",
        "title": "File I/O",
        "topics": [
          "Tempfile & StringIO",
          "Reading & Writing Files",
          "CSV & YAML Parsing",
          "Dir Operations"
        ]
      },
      {
        "id": "metaprogramming",
        "title": "Metaprogramming",
        "topics": [
          "send & define_method",
          "method_missing",
          "DSL Patterns"
        ]
      },
      {
        "id": "gems-and-bundler",
        "title": "Gems & Bundler",
        "topics": [
          "RubyGems & Bundler"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "Minitest & RSpec",
          "RSpec describe/it/expect",
          "CI Integration for Ruby",
          "Mocking with RSpec"
        ]
      },
      {
        "id": "concurrency-and-parallelism",
        "title": "Concurrency & Parallelism",
        "topics": [
          "Thread Safety & Mutex",
          "Ractors (Ruby 3+)",
          "Fibers for Async",
          "Concurrent Ruby Patterns"
        ]
      },
      {
        "id": "web-development",
        "title": "Web Development",
        "topics": [
          "Rack & Middleware",
          "Sinatra Deep Dive",
          "Rails MVC Overview",
          "API Building with Grape"
        ]
      },
      {
        "id": "database-and-persistence",
        "title": "Database & Persistence",
        "topics": [
          "ActiveRecord ORM",
          "Sequel Gem",
          "SQLite & PG Integration"
        ]
      },
      {
        "id": "tools-and-best-practices",
        "title": "Tools & Best Practices",
        "topics": [
          "RuboCop & Linting",
          "Debugging with Pry",
          "Profiling & Benchmarking",
          "YARD Documentation"
        ]
      },
      {
        "id": "advanced-ruby",
        "title": "Advanced Ruby",
        "topics": [
          "Threads & Fibers",
          "Rake Tasks",
          "Sinatra Overview"
        ]
      }
    ]
  },
  {
    "id": "php",
    "title": "PHP",
    "summary": "Learn PHP from the ground up — getting started, control flow, functions, and more.",
    "lang": "php",
    "icon": "/public/logos/php.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is PHP",
          "PHP Syntax",
          "Variables",
          "Data Types",
          "Constants & Magic Constants",
          "HTTP Headers & Status Codes",
          "Superglobals Deep",
          "PHP Tags & Output"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "declare & Ticks",
          "goto & Labels",
          "if/else/elseif",
          "switch & match",
          "for & foreach",
          "while & do-while",
          "Alternative Syntax"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Arrow Functions Deep",
          "Variadic Params & Spread",
          "Callable & Invocable",
          "Defining Functions",
          "Variable Scope",
          "Type Declarations",
          "Anonymous Functions & Closures",
          "Variable Functions & Callbacks"
        ]
      },
      {
        "id": "arrays-and-data-structures",
        "title": "Arrays & Data Structures",
        "topics": [
          "Indexed Arrays",
          "Associative Arrays",
          "Multidimensional Arrays",
          "Array Functions",
          "Array Destructuring",
          "Array Sorting",
          "SPL Data Structures"
        ]
      },
      {
        "id": "oop",
        "title": "OOP",
        "topics": [
          "Magic Methods",
          "Abstract Classes & Late Static Binding",
          "Classes & Objects",
          "Inheritance",
          "Interfaces & Traits",
          "Namespaces",
          "Anonymous Classes",
          "Static Methods & Properties"
        ]
      },
      {
        "id": "file-handling",
        "title": "File Handling",
        "topics": [
          "Reading Files",
          "Writing Files",
          "File Info & Directories",
          "CSV & JSON Processing",
          "File Uploads"
        ]
      },
      {
        "id": "forms-and-user-input",
        "title": "Forms & User Input",
        "topics": [
          "GET & POST",
          "Input Validation",
          "Sessions",
          "XSS Prevention & Output Escaping",
          "Cookies"
        ]
      },
      {
        "id": "databases",
        "title": "Databases",
        "topics": [
          "PDO Connection",
          "Prepared Statements",
          "CRUD Operations",
          "Migrations & Schema Management",
          "MySQLi"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Exceptions",
          "Error Reporting",
          "Multiple Catch & Finally",
          "Shutdown & Error Handler Functions",
          "Custom Exception Classes"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "Type Declarations & Coercion",
          "Null & falsy Handling",
          "Type Juggling Deep",
          "Constants (const vs define)"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic & Assignment",
          "Comparison & Spaceship",
          "Logical & Bitwise",
          "String & Array Operators"
        ]
      },
      {
        "id": "strings-and-text",
        "title": "Strings & Text",
        "topics": [
          "String Functions",
          "sprintf & printf",
          "Multi-byte Strings"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "PHPUnit Setup",
          "Pest Framework",
          "Mocking & Test Doubles"
        ]
      },
      {
        "id": "security-and-performance",
        "title": "Security & Performance",
        "topics": [
          "SQL Injection Prevention",
          "CSRF & Session Security",
          "OPcache & Caching"
        ]
      },
      {
        "id": "date-and-time",
        "title": "Date & Time",
        "topics": [
          "DateTime Class",
          "DateInterval & Period",
          "strtotime & Relative Dates"
        ]
      },
      {
        "id": "modern-php-and-ecosystem",
        "title": "Modern PHP & Ecosystem",
        "topics": [
          "Composer & Autoloading",
          "PSR Standards",
          "Attributes (Annotations)",
          "Enums (PHP 8.1)",
          "Fibers (PHP 8.1)",
          "PHP 8 Features"
        ]
      }
    ]
  },
  {
    "id": "swift",
    "title": "Swift",
    "summary": "Learn Swift from the ground up — getting started, variables & types, control flow, and more.",
    "lang": "swift",
    "icon": "/public/logos/swift.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Swift",
          "Swift Syntax",
          "Variables & Constants",
          "Basic Types",
          "Xcode & Playgrounds",
          "Swift Versions",
          "Swift REPL & Format"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "Type Inference",
          "Type Safety",
          "Tuples",
          "Type Aliases",
          "Numeric Types",
          "Booleans & Characters",
          "Any & AnyObject"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if / else",
          "switch",
          "for-in & while",
          "if case & guard let",
          "for where",
          "Labeled Statements",
          "Availability Check",
          "#warning & #error"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Declaration",
          "Closures",
          "inout Parameters",
          "@discardableResult",
          "autoclosure",
          "Operator Functions",
          "Variadic Parameters",
          "Nested Functions"
        ]
      },
      {
        "id": "optionals",
        "title": "Optionals",
        "topics": [
          "Optional Basics",
          "Optional Chaining",
          "map & flatMap on Optionals",
          "Implicitly Unwrapped Optionals",
          "Nil Coalescing Deep",
          "Optional Pattern Matching",
          "Optional Chaining Deep"
        ]
      },
      {
        "id": "collections",
        "title": "Collections",
        "topics": [
          "Arrays",
          "Sets",
          "Dictionaries",
          "Slice",
          "Lazy Sequences",
          "anySatisfy & allSatisfy",
          "reduce into",
          "zip & sequence"
        ]
      },
      {
        "id": "structs-and-classes",
        "title": "Structs & Classes",
        "topics": [
          "Structs Deep",
          "Classes Deep",
          "Properties & Observers",
          "Mutating Methods",
          "Static Subscript",
          "Subclass Deep",
          "Convenience & Required Init",
          "@objc & Dynamic"
        ]
      },
      {
        "id": "protocols-and-extensions",
        "title": "Protocols & Extensions",
        "topics": [
          "Protocols",
          "Extensions",
          "Protocol Composition",
          "Associated Types Deep",
          "Conditional Conformance",
          "Opaque Types",
          "Existential Types",
          "Default Implementations"
        ]
      },
      {
        "id": "enums",
        "title": "Enums",
        "topics": [
          "Enum Basics",
          "Associated Values",
          "Indirect Enums",
          "CaseIterable",
          "@unknown default",
          "Raw Values"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "do / try / catch",
          "try? & try! Deep",
          "Result Type",
          "Throwing Properties",
          "Throwing Subscripts",
          "rethrowing",
          "Defer",
          "Custom Errors"
        ]
      },
      {
        "id": "generics",
        "title": "Generics",
        "topics": [
          "Generic Functions",
          "Generic Types",
          "Generic Where Clauses",
          "Constrained Extensions",
          "Phantom Types",
          "Type Erasure",
          "some & any Keywords"
        ]
      },
      {
        "id": "advanced-swift",
        "title": "Advanced Swift",
        "topics": [
          "KeyPaths",
          "Dynamic Member Lookup",
          "Result Builders",
          "@propertyWrapper Deep",
          "Codable & JSON Deep",
          "Regex",
          "Opaque vs Existential",
          "Opaque Parameter Types",
          "Macros (Swift 5.9+)"
        ]
      },
      {
        "id": "concurrency",
        "title": "Concurrency",
        "topics": [
          "async/await",
          "Actors Deep",
          "Task Groups",
          "async let",
          "MainActor",
          "Global Actors",
          "Sendable",
          "AsyncSequence Deep",
          "Task Local Values"
        ]
      },
      {
        "id": "memory",
        "title": "Memory",
        "topics": [
          "ARC Deep",
          "Strong Reference Cycles",
          "unowned vs weak Deep",
          "Closure Capture Lists",
          "@NSCopying",
          "Memory Layout",
          "ARC & Reference Cycles"
        ]
      },
      {
        "id": "swift-package-manager",
        "title": "Swift Package Manager",
        "topics": [
          "Package.swift",
          "Package Structure",
          "Binary Targets",
          "SPM Plugins",
          "Macro Targets",
          "Build Settings",
          "SPM Commands",
          "Creating Libraries"
        ]
      },
      {
        "id": "protocol-oriented-programming",
        "title": "Protocol-Oriented Programming",
        "topics": [
          "POP Principles",
          "Protocol Inheritance & Composition",
          "Protocol Extensions & Defaults",
          "Empty Protocols (Marker)",
          "Self Requirements"
        ]
      },
      {
        "id": "swift-in-practice",
        "title": "Swift in Practice",
        "topics": [
          "Access Control",
          "URLSession & Networking",
          "Custom ViewModifier & Animation",
          "Date & Time Handling",
          "SwiftUI Preferences & Custom Layout",
          "UIKit Integration with SwiftUI"
        ]
      },
      {
        "id": "swiftui-basics",
        "title": "SwiftUI Basics",
        "topics": [
          "View Protocol",
          "Modifiers",
          "@State",
          "@Binding",
          "@Observable",
          "@Environment",
          "StateObject & ObservedObject",
          "Lists & Navigation",
          "State Management Deep"
        ]
      }
    ]
  },
  {
    "id": "scala",
    "title": "Scala",
    "summary": "Learn Scala from the ground up — getting started, control flow, functions, and more.",
    "lang": "scala",
    "icon": "/public/logos/scala.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Scala",
          "Scala Syntax",
          "Variables & Types",
          "Type Inference",
          "REPL & Worksheet",
          "Project Structure",
          "Installation & Setup"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "If Expressions",
          "Match Expressions",
          "For Loops & Comprehensions",
          "While Loops",
          "Exception Handling",
          "Custom Control Structures"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Method Declaration",
          "Default & Named Args",
          "Anonymous Functions",
          "Higher-Order Functions",
          "Currying & Partially Applied",
          "By-Name Parameters",
          "Tail Recursion"
        ]
      },
      {
        "id": "collections",
        "title": "Collections",
        "topics": [
          "Lists",
          "Maps & Sets",
          "Seq, Vector & IndexedSeq",
          "Functional Operations",
          "LazyList",
          "Options & Either",
          "Arrays & ArrayBuffer",
          "View & Lazy Evaluation"
        ]
      },
      {
        "id": "object-oriented-scala",
        "title": "Object-Oriented Scala",
        "topics": [
          "Classes & Constructors",
          "Objects & Companions",
          "Traits",
          "Case Classes",
          "Inheritance & Sealed Types",
          "Enums (Scala 3)",
          "Visibility Modifiers",
          "Self Types & Cake Pattern"
        ]
      },
      {
        "id": "pattern-matching",
        "title": "Pattern Matching",
        "topics": [
          "Case Matching",
          "Pattern Guards",
          "Extractors & unapply",
          "For-Comprehension Desugaring",
          "Sealed Hierarchies & Exhaustiveness"
        ]
      },
      {
        "id": "functional-programming",
        "title": "Functional Programming",
        "topics": [
          "Immutability",
          "Pure Functions",
          "Monadic Operations",
          "Functors & Applicatives",
          "Type Classes (Scala 2)",
          "Given & Using (Scala 3)",
          "For-Comprehension Deep",
          "Recursion Schemes"
        ]
      },
      {
        "id": "generics-and-variance",
        "title": "Generics & Variance",
        "topics": [
          "Generic Classes & Methods",
          "Variance Annotations",
          "Type Bounds",
          "Ad-Hoc Polymorphism"
        ]
      },
      {
        "id": "concurrency-and-futures",
        "title": "Concurrency & Futures",
        "topics": [
          "Future Basics",
          "Promise & Async",
          "Try & Error Handling",
          "Akka Actors (Overview)",
          "Future Combinators",
          "Ref & Atomic Primitives"
        ]
      },
      {
        "id": "build-and-tooling",
        "title": "Build & Tooling",
        "topics": [
          "sbt Basics",
          "Scala CLI",
          "Testing with ScalaTest",
          "Scala Ecosystem Overview",
          "Build Performance & Multi-Module"
        ]
      },
      {
        "id": "scala-3-features",
        "title": "Scala 3 Features",
        "topics": [
          "Indentation Syntax",
          "Union & Intersection Types",
          "Multiversal Equality",
          "Extension Methods",
          "Top-Level Definitions",
          "Opaque Types",
          "Export Clauses"
        ]
      },
      {
        "id": "variables-and-data-types",
        "title": "Variables & Data Types",
        "topics": [
          "Literals & String Interpolation",
          "Numeric Types & Conversions",
          "Tuples & Unit",
          "Type Hierarchy & Any"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Try & Recovery",
          "Either & Validated",
          "Custom Exceptions & Error ADTs",
          "Resource Management"
        ]
      },
      {
        "id": "strings-and-text-processing",
        "title": "Strings & Text Processing",
        "topics": [
          "String Operations",
          "Regular Expressions",
          "StringBuilder & Performance"
        ]
      },
      {
        "id": "i-o-and-file-handling",
        "title": "I/O & File Handling",
        "topics": [
          "File I/O Basics",
          "Java NIO & Channels",
          "Serialization & JSON"
        ]
      },
      {
        "id": "testing",
        "title": "Testing",
        "topics": [
          "Property-Based Testing",
          "Mocking & Stubbing"
        ]
      },
      {
        "id": "standard-library",
        "title": "Standard Library",
        "topics": [
          "Collections Hierarchy",
          "Date & Time API",
          "System Properties & Environment"
        ]
      },
      {
        "id": "implicits-and-type-classes",
        "title": "Implicits & Type Classes",
        "topics": [
          "Implicit Conversions",
          "Implicit Resolution & Scope",
          "Context Bounds & Type Classes"
        ]
      },
      {
        "id": "performance-and-optimization",
        "title": "Performance & Optimization",
        "topics": [
          "Profiling & Benchmarking",
          "Memory & GC Tuning"
        ]
      },
      {
        "id": "java-interoperability",
        "title": "Java Interoperability",
        "topics": [
          "Calling Java from Scala",
          "Scala from Java"
        ]
      }
    ]
  },
  {
    "id": "lua",
    "title": "Lua",
    "summary": "Learn Lua from the ground up — getting started, variables & types, operators, and more.",
    "lang": "lua",
    "icon": "/public/logos/lua.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Lua",
          "Lua Syntax",
          "Comments",
          "Hello World",
          "Interactive Mode",
          "Lua Versions & Compatibility"
        ]
      },
      {
        "id": "variables-and-types",
        "title": "Variables & Types",
        "topics": [
          "Dynamic Typing",
          "nil",
          "boolean",
          "number",
          "string",
          "type() and Coercion",
          "Multiple Assignment"
        ]
      },
      {
        "id": "operators",
        "title": "Operators",
        "topics": [
          "Arithmetic",
          "Relational",
          "Logical",
          "Concatenation and Length",
          "Operator Precedence"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if/elseif/else",
          "while",
          "repeat/until",
          "Numeric for",
          "Generic for",
          "break"
        ]
      },
      {
        "id": "tables-arrays",
        "title": "Tables (Arrays)",
        "topics": [
          "Table Basics",
          "Constructors",
          "Array-style Tables",
          "Table Manipulation",
          "Iterating Arrays"
        ]
      },
      {
        "id": "tables-dictionaries",
        "title": "Tables (Dictionaries)",
        "topics": [
          "Dictionary-style Tables",
          "Nested Tables",
          "pairs() Iteration",
          "Table Size Caveats",
          "Table Constructors Mixed Forms",
          "Table Manipulation Library"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Definition",
          "Return Values",
          "Multiple Returns",
          "Variadic Args",
          "Closures and Upvalues",
          "Tail Calls",
          "Closures & Upvalues"
        ]
      },
      {
        "id": "string-handling",
        "title": "String Handling",
        "topics": [
          "String Basics",
          "Concatenation",
          "string Library",
          "string.match",
          "string.gmatch",
          "string.gsub",
          "Lua Patterns"
        ]
      },
      {
        "id": "input-and-output",
        "title": "Input & Output",
        "topics": [
          "print vs io.write",
          "io.read",
          "File I/O",
          "Formatted Output",
          "Advanced File Operations"
        ]
      },
      {
        "id": "modules-and-packages",
        "title": "Modules & Packages",
        "topics": [
          "require",
          "Module Pattern",
          "package.path",
          "Module Best Practices"
        ]
      },
      {
        "id": "metatables-and-oop",
        "title": "Metatables & OOP",
        "topics": [
          "Metatables",
          "__index",
          "__newindex",
          "__call",
          "Arithmetic Metamethods",
          "OOP via Prototypes"
        ]
      },
      {
        "id": "coroutines",
        "title": "Coroutines",
        "topics": [
          "coroutine.create/resume/yield",
          "coroutine.status",
          "coroutine.wrap",
          "Producer-Consumer Example",
          "Coroutine Use Cases"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "pcall",
          "xpcall",
          "error",
          "assert"
        ]
      },
      {
        "id": "standard-libraries",
        "title": "Standard Libraries",
        "topics": [
          "math",
          "os",
          "io Library",
          "table (full recap)",
          "bit32",
          "Testing with Busted"
        ]
      },
      {
        "id": "advanced-topics",
        "title": "Advanced Topics",
        "topics": [
          "Weak Tables",
          "Garbage Collection",
          "Environment (_ENV)",
          "Debug Library",
          "C API Overview",
          "LuaJIT & Performance"
        ]
      }
    ]
  },
  {
    "id": "zig",
    "title": "Zig",
    "summary": "Learn Zig from the ground up — getting started, types, variables & constants, and more.",
    "lang": "zig",
    "icon": "/public/logos/zig.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "Install Zig",
          "zig init-exe",
          "Hello World",
          "build.zig Explained",
          "Zig Version Manager",
          "Build System Deep"
        ]
      },
      {
        "id": "types",
        "title": "Types",
        "topics": [
          "Integer Types",
          "Floats",
          "Bool & Void",
          "anytype",
          "Type Coercion",
          "enum & union",
          "Sentinel Arrays & Slices"
        ]
      },
      {
        "id": "variables-and-constants",
        "title": "Variables & Constants",
        "topics": [
          "const vs var",
          "Comptime Constants",
          "Shadowing",
          "Undefined & Default Values",
          "Anonymous Bindings",
          "Shadowing & Blocks"
        ]
      },
      {
        "id": "control-flow",
        "title": "Control Flow",
        "topics": [
          "if Expressions",
          "while with continue expressions",
          "for with Ranges",
          "Labeled break & continue",
          "switch Expressions",
          "Inline Loops"
        ]
      },
      {
        "id": "functions",
        "title": "Functions",
        "topics": [
          "Function Basics",
          "Function Pointers",
          "Inline Functions",
          "Calling Conventions",
          "Error Return Traces",
          "Nested Functions"
        ]
      },
      {
        "id": "arrays-slices-and-strings",
        "title": "Arrays, Slices & Strings",
        "topics": [
          "Multi-dimensional Arrays",
          "Sentinel Arrays",
          "String Literals",
          "Format Strings",
          "Slice Operations",
          "Array Concatenation & Multiplication"
        ]
      },
      {
        "id": "pointers-and-memory",
        "title": "Pointers & Memory",
        "topics": [
          "Many-item Pointers",
          "Pointer Alignment",
          "Slice Pointers",
          "Allocator Types",
          "Memory Leak Detection",
          "Comptime Pointer Handling"
        ]
      },
      {
        "id": "error-handling",
        "title": "Error Handling",
        "topics": [
          "Error Sets",
          "Error Union Inference",
          "Merge Error Sets",
          "catch / unreachable",
          "try Keyword",
          "Global Error Set",
          "Custom Error Sets"
        ]
      },
      {
        "id": "optionals",
        "title": "Optionals",
        "topics": [
          "orelse & Unwrap",
          "if Capture",
          "Payload Capturing",
          "Optional Pointers",
          "orelse & Unwrapping Patterns"
        ]
      },
      {
        "id": "comptime",
        "title": "Comptime",
        "topics": [
          "Compile-time Parameters",
          "Compile-time Variables",
          "@compileLog",
          "@field",
          "@hasDecl & @hasField",
          "Compile-time Reflection",
          "Reflection & Type Info"
        ]
      },
      {
        "id": "structs-and-unions",
        "title": "Structs & Unions",
        "topics": [
          "packed Structs",
          "extern Structs",
          "Zero-bit Types",
          "Field Alignment",
          "Default Field Values",
          "Anonymous Structs & Unions"
        ]
      },
      {
        "id": "standard-library",
        "title": "Standard Library",
        "topics": [
          "ArrayList",
          "AutoHashMap",
          "BufMap",
          "BufferedWriter",
          "File I/O",
          "Formatting",
          "File I/O with std.fs"
        ]
      },
      {
        "id": "advanced",
        "title": "Advanced",
        "topics": [
          "Async / Await Deep Dive",
          "@cImport in Depth",
          "Inline Assembly",
          "Vectorization",
          "@export & Section Attributes",
          "Build System Advanced",
          "Inline Assembly (@asm)"
        ]
      },
      {
        "id": "zig-in-practice-ziglang-org-learn",
        "title": "Zig in Practice (ziglang.org/learn)",
        "topics": [
          "Testing with zig test",
          "build.zig.zon Package Manager",
          "Cross-Compilation",
          "WebAssembly with Zig",
          "C Interop Deep Dive",
          "Zig fmt & Code Style",
          "Debugging Zig Programs",
          "Package Management"
        ]
      }
    ]
  },
  {
    "id": "asm",
    "title": "Assembly",
    "summary": "Learn Assembly from the ground up — number systems and data representation, getting started with assembly, x64 architecture and registers, and more.",
    "lang": "asm",
    "icon": "/public/logos/asm.svg",
    "phases": [
      {
        "id": "number-systems-and-data-representation",
        "title": "Number Systems and Data Representation",
        "topics": [
          "Binary Numbers",
          "Hexadecimal System",
          "Two's Complement",
          "Boolean Logic",
          "Bit Shifting",
          "ASCII and BCD Numbers",
          "Endianness"
        ]
      },
      {
        "id": "getting-started-with-assembly",
        "title": "Getting Started with Assembly",
        "topics": [
          "Environment Setup",
          "Basic NASM Syntax",
          "Memory Segments",
          "Variables",
          "Constants",
          "Build Tools & Makefiles"
        ]
      },
      {
        "id": "x64-architecture-and-registers",
        "title": "x64 Architecture and Registers",
        "topics": [
          "CPU Architecture Overview",
          "General Purpose Registers",
          "Special Purpose Registers",
          "Stack and Calling Conventions",
          "Memory Addressing Modes",
          "Segment & Control Registers",
          "SIMD Register State"
        ]
      },
      {
        "id": "nasm-assembly-basics",
        "title": "NASM Assembly Basics",
        "topics": [
          "Hello World",
          "Data Types and Directives",
          "Moving Data",
          "Arithmetic Instructions",
          "Control Flow and Branching",
          "Loops",
          "Stack Operations"
        ]
      },
      {
        "id": "procedures-and-the-stack",
        "title": "Procedures and the Stack",
        "topics": [
          "CALL and RET",
          "Passing Arguments",
          "Stack Frames",
          "Recursion",
          "Macros",
          "Multi-File Programs",
          "Stack Alignment & Red Zone"
        ]
      },
      {
        "id": "condition-codes-and-logical-operations",
        "title": "Condition Codes and Logical Operations",
        "topics": [
          "Flag Register",
          "Comparison and TEST",
          "Conditional Moves",
          "Logical Instructions",
          "Bit Manipulation",
          "SETcc & Bit Test Instructions"
        ]
      },
      {
        "id": "strings-and-data-structures",
        "title": "Strings and Data Structures",
        "topics": [
          "String Instructions",
          "Arrays and Addressing",
          "Structures and Records",
          "Buffers and I/O",
          "String Comparison and Search",
          "Linked List Traversal"
        ]
      },
      {
        "id": "floating-point-and-simd",
        "title": "Floating Point and SIMD",
        "topics": [
          "x87 Floating Point",
          "SSE Scalar Operations",
          "SSE Packed Operations",
          "AVX and Advanced SIMD",
          "SSE Integer and Conversion",
          "SSE Data Conversion & Shuffle"
        ]
      },
      {
        "id": "interfacing-with-c-and-linux",
        "title": "Interfacing with C and Linux",
        "topics": [
          "Linux System Calls",
          "Calling C Library Functions",
          "Command Line Arguments",
          "File I/O with syscalls",
          "Memory Management",
          "Debugging with GDB",
          "Dynamic Linking & Shared Libraries"
        ]
      },
      {
        "id": "advanced-topics-and-optimization",
        "title": "Advanced Topics and Optimization",
        "topics": [
          "Performance Optimization",
          "Inline Assembly (GCC)",
          "Interrupts and Exception Handling",
          "PIC and Position-Independent Code",
          "Multithreading and Atomic Ops",
          "Loop Optimization & Unrolling",
          "Data Alignment & Prefetching"
        ]
      },
      {
        "id": "macros-and-preprocessing",
        "title": "Macros & Preprocessing",
        "topics": [
          "Multi-Line Macros",
          "Conditional Assembly",
          "Context Stack & Advanced Preprocessing",
          "%include & File Organization"
        ]
      },
      {
        "id": "debugging-and-profiling",
        "title": "Debugging & Profiling",
        "topics": [
          "GDB Advanced Techniques",
          "Profiling & Performance Counters",
          "Valgrind & Sanitizers",
          "GAS & Other Assemblers"
        ]
      },
      {
        "id": "crypto-and-security",
        "title": "Crypto & Security",
        "topics": [
          "AES-NI Instructions",
          "Constant-Time Code",
          "CRC & Hashing Instructions"
        ]
      },
      {
        "id": "system-programming",
        "title": "System Programming",
        "topics": [
          "Signal Handling",
          "Process Creation & Syscalls",
          "Shared Memory & IPC"
        ]
      }
    ]
  },
  {
    "id": "dk",
    "title": "Dart",
    "summary": "Learn Dart from the ground up — getting started, images & dockerfiles, container management, and more.",
    "lang": "dk",
    "icon": "/public/logos/dk.svg",
    "phases": [
      {
        "id": "getting-started",
        "title": "Getting Started",
        "topics": [
          "What is Docker",
          "Containers vs Images",
          "Docker Architecture",
          "Docker Desktop",
          "WSL2 Backend",
          "Daemon Configuration",
          "docker info",
          "Lifecycle Management",
          "Listing & Inspecting"
        ]
      },
      {
        "id": "images-and-dockerfiles",
        "title": "Images & Dockerfiles",
        "topics": [
          "Dockerfile Basics",
          "FROM Variants",
          "RUN Layers",
          "COPY vs ADD",
          "ARG vs ENV",
          "WORKDIR",
          "USER",
          "EXPOSE",
          "LABEL",
          "SHELL",
          "HEALTHCHECK",
          "Multi-Stage Build",
          "BuildKit",
          "Buildx",
          "Cache Mounts",
          ".dockerignore"
        ]
      },
      {
        "id": "container-management",
        "title": "Container Management",
        "topics": [
          "docker run deep",
          "Interactive Mode",
          "Detachment",
          "Resource Limits",
          "Logging Drivers",
          "Restart Policies",
          "stop vs kill",
          "update",
          "rename",
          "wait",
          "Port Mapping Deep",
          "Environment Variables"
        ]
      },
      {
        "id": "networking",
        "title": "Networking",
        "topics": [
          "Port Forwarding",
          "DNS Resolution",
          "Network Drivers Deep",
          "User-Defined Bridge",
          "Host Network",
          "Macvlan",
          "Ipvlan",
          "Network Aliases",
          "Container Networking Model",
          "Overlay Networks"
        ]
      },
      {
        "id": "storage",
        "title": "Storage",
        "topics": [
          "Named Volumes",
          "Bind Mounts",
          "tmpfs Mounts",
          "Storage Drivers",
          "Volume Drivers",
          "Backup & Restore Volumes",
          "Bind Mount Deep",
          "Permissions"
        ]
      },
      {
        "id": "compose",
        "title": "Compose",
        "topics": [
          "Compose File Structure",
          "Profiles",
          "Extends",
          "depends_on Deep",
          "Healthcheck in Compose",
          "env_file",
          "Secrets in Compose",
          "Configs in Compose",
          "Deploy Section",
          "Compose Watch"
        ]
      },
      {
        "id": "swarm",
        "title": "Swarm",
        "topics": [
          "Swarm Init",
          "Node Types",
          "Raft Consensus",
          "Service Replication",
          "Rolling Updates",
          "Secrets Deep",
          "Configs in Swarm",
          "docker stack",
          "Swarm Mode Networking",
          "Routing Mesh"
        ]
      },
      {
        "id": "security",
        "title": "Security",
        "topics": [
          "Seccomp Profiles",
          "AppArmor",
          "Linux Capabilities",
          "Read-Only Root",
          "User Namespaces",
          "Content Trust",
          "Image Scanning",
          "Secrets Management",
          "gVisor",
          "Security Best Practices"
        ]
      },
      {
        "id": "monitoring-and-logging",
        "title": "Monitoring & Logging",
        "topics": [
          "docker events",
          "Prometheus Metrics",
          "ELK Stack with Docker",
          "cAdvisor",
          "Resource Monitoring Deep",
          "Logging Drivers",
          "Telemetry Logs"
        ]
      },
      {
        "id": "ci-cd",
        "title": "CI/CD",
        "topics": [
          "Docker in Docker",
          "Caching Strategies",
          "Multi-Arch Builds",
          "GitHub Actions with Docker",
          "Docker Layer Caching",
          "Build Cache Optimization"
        ]
      },
      {
        "id": "docker-desktop",
        "title": "Docker Desktop",
        "topics": [
          "Kubernetes Integration",
          "Dev Environments",
          "Extensions",
          "Resource Settings"
        ]
      },
      {
        "id": "best-practices",
        "title": "Best Practices",
        "topics": [
          "Image Size Optimization",
          "Security Scanning",
          "Dockerfile Linter (Hadolint)",
          ".dockerignore Deep",
          "Tagging Strategy",
          "Non-Root User",
          "Read-Only Filesystem",
          "Graceful Shutdown"
        ]
      },
      {
        "id": "docker-internals",
        "title": "Docker Internals",
        "topics": [
          "Namespaces",
          "Cgroups",
          "OCI Spec & containerd",
          "Overlay2 Storage Deep",
          "Veth Pairs & Bridge Forwarding",
          "iptables & NAT"
        ]
      },
      {
        "id": "docker-in-practice",
        "title": "Docker in Practice",
        "topics": [
          "Troubleshooting Exec",
          "Dockerfile Optimization",
          "Multi-Stage Build Patterns",
          "Compose Development Workflow",
          "Docker Build Secrets"
        ]
      },
      {
        "id": "docker-in-production",
        "title": "Docker in Production",
        "topics": [
          "Structured Logging",
          "CI/CD Pipeline Patterns",
          "Production Monitoring Stack",
          "Backup & Disaster Recovery"
        ]
      }
    ]
  }
];

export const TUTORIAL_QUIZZES = {
  "js:fundamentals": [
    {
      "question": "Which of these best describes \"What is JavaScript\" in JavaScript?",
      "options": [
        "A core concept covered in Fundamentals",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is JavaScript\" is one of the fundamental topics covered in the Fundamentals section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Syntax & Comments\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in fundamentals",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Syntax & Comments\" is a key concept in JavaScript's Fundamentals domain."
    }
  ],
  "js:variables-and-types": [
    {
      "question": "Which of these best describes \"var let const\" in JavaScript?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"var let const\" is one of the fundamental topics covered in the Variables & Types section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Primitive Types\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Primitive Types\" is a key concept in JavaScript's Variables & Types domain."
    }
  ],
  "js:operators": [
    {
      "question": "Which of these best describes \"Arithmetic Operators\" in JavaScript?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic Operators\" is one of the fundamental topics covered in the Operators section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Comparison Operators\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Comparison Operators\" is a key concept in JavaScript's Operators domain."
    }
  ],
  "js:control-flow": [
    {
      "question": "Which of these best describes \"If Else\" in JavaScript?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"If Else\" is one of the fundamental topics covered in the Control Flow section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Else If\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Else If\" is a key concept in JavaScript's Control Flow domain."
    }
  ],
  "js:functions": [
    {
      "question": "Which of these best describes \"Function Declarations\" in JavaScript?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Declarations\" is one of the fundamental topics covered in the Functions section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Function Expressions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Function Expressions\" is a key concept in JavaScript's Functions domain."
    }
  ],
  "js:objects-and-classes": [
    {
      "question": "Which of these best describes \"Objects\" in JavaScript?",
      "options": [
        "A core concept covered in Objects & Classes",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Objects\" is one of the fundamental topics covered in the Objects & Classes section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"This Keyword\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in objects & classes",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"This Keyword\" is a key concept in JavaScript's Objects & Classes domain."
    }
  ],
  "js:arrays-and-collections": [
    {
      "question": "Which of these best describes \"Arrays\" in JavaScript?",
      "options": [
        "A core concept covered in Arrays & Collections",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arrays\" is one of the fundamental topics covered in the Arrays & Collections section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Array Methods\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in arrays & collections",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Array Methods\" is a key concept in JavaScript's Arrays & Collections domain."
    }
  ],
  "js:dom-and-browser-apis": [
    {
      "question": "Which of these best describes \"DOM Manipulation\" in JavaScript?",
      "options": [
        "A core concept covered in DOM & Browser APIs",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"DOM Manipulation\" is one of the fundamental topics covered in the DOM & Browser APIs section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Events\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in dom & browser apis",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Events\" is a key concept in JavaScript's DOM & Browser APIs domain."
    }
  ],
  "js:async-javascript": [
    {
      "question": "Which of these best describes \"Promises\" in JavaScript?",
      "options": [
        "A core concept covered in Async JavaScript",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Promises\" is one of the fundamental topics covered in the Async JavaScript section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Async/Await\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in async javascript",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Async/Await\" is a key concept in JavaScript's Async JavaScript domain."
    }
  ],
  "js:modern-javascript": [
    {
      "question": "Which of these best describes \"ES Modules\" in JavaScript?",
      "options": [
        "A core concept covered in Modern JavaScript",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"ES Modules\" is one of the fundamental topics covered in the Modern JavaScript section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Spread Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modern javascript",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Spread Syntax\" is a key concept in JavaScript's Modern JavaScript domain."
    }
  ],
  "js:frameworks-and-tools": [
    {
      "question": "Which of these best describes \"React\" in JavaScript?",
      "options": [
        "A core concept covered in Frameworks & Tools",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"React\" is one of the fundamental topics covered in the Frameworks & Tools section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Vue\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in frameworks & tools",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Vue\" is a key concept in JavaScript's Frameworks & Tools domain."
    }
  ],
  "js:built-in-objects": [
    {
      "question": "Which of these best describes \"JSON\" in JavaScript?",
      "options": [
        "A core concept covered in Built-in Objects",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"JSON\" is one of the fundamental topics covered in the Built-in Objects section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Math & Number\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in built-in objects",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Math & Number\" is a key concept in JavaScript's Built-in Objects domain."
    }
  ],
  "js:hoisting-and-scopes": [
    {
      "question": "Which of these best describes \"Hoisting Explained\" in JavaScript?",
      "options": [
        "A core concept covered in Hoisting & Scopes",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Hoisting Explained\" is one of the fundamental topics covered in the Hoisting & Scopes section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Global Scope\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in hoisting & scopes",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Global Scope\" is a key concept in JavaScript's Hoisting & Scopes domain."
    }
  ],
  "js:equality-comparisons": [
    {
      "question": "Which of these best describes \"Object.is\" in JavaScript?",
      "options": [
        "A core concept covered in Equality Comparisons",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Object.is\" is one of the fundamental topics covered in the Equality Comparisons section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"SameValueZero\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in equality comparisons",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"SameValueZero\" is a key concept in JavaScript's Equality Comparisons domain."
    }
  ],
  "js:async-details": [
    {
      "question": "Which of these best describes \"The Event Loop\" in JavaScript?",
      "options": [
        "A core concept covered in Async Details",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"The Event Loop\" is one of the fundamental topics covered in the Async Details section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Microtasks vs Macrotasks\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in async details",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Microtasks vs Macrotasks\" is a key concept in JavaScript's Async Details domain."
    }
  ],
  "js:modules": [
    {
      "question": "Which of these best describes \"ES Modules (ESM)\" in JavaScript?",
      "options": [
        "A core concept covered in Modules",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"ES Modules (ESM)\" is one of the fundamental topics covered in the Modules section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"CommonJS (CJS)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modules",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"CommonJS (CJS)\" is a key concept in JavaScript's Modules domain."
    }
  ],
  "js:memory-management": [
    {
      "question": "Which of these best describes \"Memory Lifecycle\" in JavaScript?",
      "options": [
        "A core concept covered in Memory Management",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Memory Lifecycle\" is one of the fundamental topics covered in the Memory Management section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Garbage Collection\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in memory management",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Garbage Collection\" is a key concept in JavaScript's Memory Management domain."
    }
  ],
  "js:using-browser-devtools": [
    {
      "question": "Which of these best describes \"Console Debugging\" in JavaScript?",
      "options": [
        "A core concept covered in Using Browser DevTools",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Console Debugging\" is one of the fundamental topics covered in the Using Browser DevTools section of JavaScript."
    },
    {
      "question": "In JavaScript, what is the purpose of \"Performance Debugging\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in using browser devtools",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Performance Debugging\" is a key concept in JavaScript's Using Browser DevTools domain."
    }
  ],
  "ts:fundamentals": [
    {
      "question": "Which of these best describes \"What is TypeScript\" in TypeScript?",
      "options": [
        "A core concept covered in Fundamentals",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is TypeScript\" is one of the fundamental topics covered in the Fundamentals section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Type Annotations\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in fundamentals",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Type Annotations\" is a key concept in TypeScript's Fundamentals domain."
    }
  ],
  "ts:type-system": [
    {
      "question": "Which of these best describes \"Union Types\" in TypeScript?",
      "options": [
        "A core concept covered in Type System",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Union Types\" is one of the fundamental topics covered in the Type System section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Intersection Types\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in type system",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Intersection Types\" is a key concept in TypeScript's Type System domain."
    }
  ],
  "ts:type-guards-and-narrowing": [
    {
      "question": "Which of these best describes \"typeof Type Guards\" in TypeScript?",
      "options": [
        "A core concept covered in Type Guards & Narrowing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"typeof Type Guards\" is one of the fundamental topics covered in the Type Guards & Narrowing section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"instanceof Type Guards\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in type guards & narrowing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"instanceof Type Guards\" is a key concept in TypeScript's Type Guards & Narrowing domain."
    }
  ],
  "ts:functions": [
    {
      "question": "Which of these best describes \"Function Types\" in TypeScript?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Types\" is one of the fundamental topics covered in the Functions section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Optional & Default Parameters\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Optional & Default Parameters\" is a key concept in TypeScript's Functions domain."
    }
  ],
  "ts:classes-and-oop": [
    {
      "question": "Which of these best describes \"Classes\" in TypeScript?",
      "options": [
        "A core concept covered in Classes & OOP",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Classes\" is one of the fundamental topics covered in the Classes & OOP section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Inheritance\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in classes & oop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Inheritance\" is a key concept in TypeScript's Classes & OOP domain."
    }
  ],
  "ts:generics": [
    {
      "question": "Which of these best describes \"Generic Types\" in TypeScript?",
      "options": [
        "A core concept covered in Generics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Generic Types\" is one of the fundamental topics covered in the Generics section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Constraints\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in generics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Constraints\" is a key concept in TypeScript's Generics domain."
    }
  ],
  "ts:utility-types": [
    {
      "question": "Which of these best describes \"Partial<T>\" in TypeScript?",
      "options": [
        "A core concept covered in Utility Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Partial<T>\" is one of the fundamental topics covered in the Utility Types section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Required<T>\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in utility types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Required<T>\" is a key concept in TypeScript's Utility Types domain."
    }
  ],
  "ts:advanced-types": [
    {
      "question": "Which of these best describes \"Conditional Types\" in TypeScript?",
      "options": [
        "A core concept covered in Advanced Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Conditional Types\" is one of the fundamental topics covered in the Advanced Types section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Mapped Types\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Mapped Types\" is a key concept in TypeScript's Advanced Types domain."
    }
  ],
  "ts:modules-and-tooling": [
    {
      "question": "Which of these best describes \"ESM Imports\" in TypeScript?",
      "options": [
        "A core concept covered in Modules & Tooling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"ESM Imports\" is one of the fundamental topics covered in the Modules & Tooling section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Namespaces\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modules & tooling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Namespaces\" is a key concept in TypeScript's Modules & Tooling domain."
    }
  ],
  "ts:asynchronous-typescript": [
    {
      "question": "Which of these best describes \"Promise Types\" in TypeScript?",
      "options": [
        "A core concept covered in Asynchronous TypeScript",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Promise Types\" is one of the fundamental topics covered in the Asynchronous TypeScript section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Async/Await\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in asynchronous typescript",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Async/Await\" is a key concept in TypeScript's Asynchronous TypeScript domain."
    }
  ],
  "ts:modern-patterns": [
    {
      "question": "Which of these best describes \"Template Literal Types\" in TypeScript?",
      "options": [
        "A core concept covered in Modern Patterns",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Template Literal Types\" is one of the fundamental topics covered in the Modern Patterns section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"satisfies Operator\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modern patterns",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"satisfies Operator\" is a key concept in TypeScript's Modern Patterns domain."
    }
  ],
  "ts:dom-and-typescript": [
    {
      "question": "Which of these best describes \"Typed DOM APIs\" in TypeScript?",
      "options": [
        "A core concept covered in DOM & TypeScript",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Typed DOM APIs\" is one of the fundamental topics covered in the DOM & TypeScript section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Event Typing\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in dom & typescript",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Event Typing\" is a key concept in TypeScript's DOM & TypeScript domain."
    }
  ],
  "ts:error-handling": [
    {
      "question": "Which of these best describes \"Typed Error Classes\" in TypeScript?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Typed Error Classes\" is one of the fundamental topics covered in the Error Handling section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Try/Catch with unknown\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Try/Catch with unknown\" is a key concept in TypeScript's Error Handling domain."
    }
  ],
  "ts:ecosystem": [
    {
      "question": "Which of these best describes \"Formatting (Prettier)\" in TypeScript?",
      "options": [
        "A core concept covered in Ecosystem",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Formatting (Prettier)\" is one of the fundamental topics covered in the Ecosystem section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Linting (ESLint)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in ecosystem",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Linting (ESLint)\" is a key concept in TypeScript's Ecosystem domain."
    }
  ],
  "ts:configuration-and-build": [
    {
      "question": "Which of these best describes \"Strict Compiler Options\" in TypeScript?",
      "options": [
        "A core concept covered in Configuration & Build",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Strict Compiler Options\" is one of the fundamental topics covered in the Configuration & Build section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"Module Resolution\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in configuration & build",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Module Resolution\" is a key concept in TypeScript's Configuration & Build domain."
    }
  ],
  "ts:ai-and-llms-in-typescript": [
    {
      "question": "Which of these best describes \"LLM API Integration\" in TypeScript?",
      "options": [
        "A core concept covered in AI & LLMs in TypeScript",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"LLM API Integration\" is one of the fundamental topics covered in the AI & LLMs in TypeScript section of TypeScript."
    },
    {
      "question": "In TypeScript, what is the purpose of \"LangChain.js\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in ai & llms in typescript",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"LangChain.js\" is a key concept in TypeScript's AI & LLMs in TypeScript domain."
    }
  ],
  "py:getting-started": [
    {
      "question": "Which of these best describes \"What is Python\" in Python?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Python\" is one of the fundamental topics covered in the Getting Started section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Python Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Python Syntax\" is a key concept in Python's Getting Started domain."
    }
  ],
  "py:operators": [
    {
      "question": "Which of these best describes \"Arithmetic\" in Python?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic\" is one of the fundamental topics covered in the Operators section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Bitwise\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Bitwise\" is a key concept in Python's Operators domain."
    }
  ],
  "py:control-flow": [
    {
      "question": "Which of these best describes \"if-elif-else\" in Python?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if-elif-else\" is one of the fundamental topics covered in the Control Flow section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"match statement\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"match statement\" is a key concept in Python's Control Flow domain."
    }
  ],
  "py:data-structures": [
    {
      "question": "Which of these best describes \"Lists\" in Python?",
      "options": [
        "A core concept covered in Data Structures",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Lists\" is one of the fundamental topics covered in the Data Structures section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Tuples\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in data structures",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Tuples\" is a key concept in Python's Data Structures domain."
    }
  ],
  "py:comprehensions": [
    {
      "question": "Which of these best describes \"List Comprehensions\" in Python?",
      "options": [
        "A core concept covered in Comprehensions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"List Comprehensions\" is one of the fundamental topics covered in the Comprehensions section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Dict & Set Comprehensions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in comprehensions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Dict & Set Comprehensions\" is a key concept in Python's Comprehensions domain."
    }
  ],
  "py:functions": [
    {
      "question": "Which of these best describes \"Definitions & Scopes\" in Python?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Definitions & Scopes\" is one of the fundamental topics covered in the Functions section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Argument Logic\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Argument Logic\" is a key concept in Python's Functions domain."
    }
  ],
  "py:classes": [
    {
      "question": "Which of these best describes \"Class & Objects\" in Python?",
      "options": [
        "A core concept covered in Classes",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Class & Objects\" is one of the fundamental topics covered in the Classes section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Methods & Variables\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in classes",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Methods & Variables\" is a key concept in Python's Classes domain."
    }
  ],
  "py:modules-and-errors": [
    {
      "question": "Which of these best describes \"Modules & Packages\" in Python?",
      "options": [
        "A core concept covered in Modules & Errors",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Modules & Packages\" is one of the fundamental topics covered in the Modules & Errors section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Handling Exceptions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modules & errors",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Handling Exceptions\" is a key concept in Python's Modules & Errors domain."
    }
  ],
  "py:files-and-inputs": [
    {
      "question": "Which of these best describes \"Reading & Writing\" in Python?",
      "options": [
        "A core concept covered in Files & Inputs",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Reading & Writing\" is one of the fundamental topics covered in the Files & Inputs section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Terminal Input\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in files & inputs",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Terminal Input\" is a key concept in Python's Files & Inputs domain."
    }
  ],
  "py:additions": [
    {
      "question": "Which of these best describes \"pass & Ellipsis\" in Python?",
      "options": [
        "A core concept covered in Additions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"pass & Ellipsis\" is one of the fundamental topics covered in the Additions section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Generators\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in additions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Generators\" is a key concept in Python's Additions domain."
    }
  ],
  "py:standard-libraries": [
    {
      "question": "Which of these best describes \"json\" in Python?",
      "options": [
        "A core concept covered in Standard Libraries",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"json\" is one of the fundamental topics covered in the Standard Libraries section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"re (Regular Expressions)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in standard libraries",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"re (Regular Expressions)\" is a key concept in Python's Standard Libraries domain."
    }
  ],
  "py:async-python": [
    {
      "question": "Which of these best describes \"async/await\" in Python?",
      "options": [
        "A core concept covered in Async Python",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"async/await\" is one of the fundamental topics covered in the Async Python section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"asyncio.gather\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in async python",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"asyncio.gather\" is a key concept in Python's Async Python domain."
    }
  ],
  "py:file-system-and-paths": [
    {
      "question": "Which of these best describes \"pathlib\" in Python?",
      "options": [
        "A core concept covered in File System & Paths",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"pathlib\" is one of the fundamental topics covered in the File System & Paths section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"shutil\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in file system & paths",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"shutil\" is a key concept in Python's File System & Paths domain."
    }
  ],
  "py:logging": [
    {
      "question": "Which of these best describes \"logging module\" in Python?",
      "options": [
        "A core concept covered in Logging",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"logging module\" is one of the fundamental topics covered in the Logging section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Logging Configuration\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in logging",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Logging Configuration\" is a key concept in Python's Logging domain."
    }
  ],
  "py:itertools-and-functools": [
    {
      "question": "Which of these best describes \"itertools\" in Python?",
      "options": [
        "A core concept covered in Itertools & Functools",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"itertools\" is one of the fundamental topics covered in the Itertools & Functools section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"functools\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in itertools & functools",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"functools\" is a key concept in Python's Itertools & Functools domain."
    }
  ],
  "py:decorators-and-closures": [
    {
      "question": "Which of these best describes \"Function Decorators\" in Python?",
      "options": [
        "A core concept covered in Decorators & Closures",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Decorators\" is one of the fundamental topics covered in the Decorators & Closures section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Decorators with Arguments\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in decorators & closures",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Decorators with Arguments\" is a key concept in Python's Decorators & Closures domain."
    }
  ],
  "py:testing-and-debugging": [
    {
      "question": "Which of these best describes \"doctest\" in Python?",
      "options": [
        "A core concept covered in Testing & Debugging",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"doctest\" is one of the fundamental topics covered in the Testing & Debugging section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"unittest\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing & debugging",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"unittest\" is a key concept in Python's Testing & Debugging domain."
    }
  ],
  "py:packaging-and-distribution": [
    {
      "question": "Which of these best describes \"setuptools & setup.py\" in Python?",
      "options": [
        "A core concept covered in Packaging & Distribution",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"setuptools & setup.py\" is one of the fundamental topics covered in the Packaging & Distribution section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"pyproject.toml\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in packaging & distribution",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"pyproject.toml\" is a key concept in Python's Packaging & Distribution domain."
    }
  ],
  "py:working-with-data": [
    {
      "question": "Which of these best describes \"CSV\" in Python?",
      "options": [
        "A core concept covered in Working with Data",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"CSV\" is one of the fundamental topics covered in the Working with Data section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"JSON\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in working with data",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"JSON\" is a key concept in Python's Working with Data domain."
    }
  ],
  "py:concurrency-deep-dive": [
    {
      "question": "Which of these best describes \"threading\" in Python?",
      "options": [
        "A core concept covered in Concurrency Deep Dive",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"threading\" is one of the fundamental topics covered in the Concurrency Deep Dive section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"multiprocessing\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in concurrency deep dive",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"multiprocessing\" is a key concept in Python's Concurrency Deep Dive domain."
    }
  ],
  "py:web-and-apis": [
    {
      "question": "Which of these best describes \"requests\" in Python?",
      "options": [
        "A core concept covered in Web & APIs",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"requests\" is one of the fundamental topics covered in the Web & APIs section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"httpx\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in web & apis",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"httpx\" is a key concept in Python's Web & APIs domain."
    }
  ],
  "py:type-hints": [
    {
      "question": "Which of these best describes \"Basic Types & Annotations\" in Python?",
      "options": [
        "A core concept covered in Type Hints",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Basic Types & Annotations\" is one of the fundamental topics covered in the Type Hints section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Optional & Union\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in type hints",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Optional & Union\" is a key concept in Python's Type Hints domain."
    }
  ],
  "py:performance": [
    {
      "question": "Which of these best describes \"Profiling & Optimization\" in Python?",
      "options": [
        "A core concept covered in Performance",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Profiling & Optimization\" is one of the fundamental topics covered in the Performance section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"__slots__\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in performance",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"__slots__\" is a key concept in Python's Performance domain."
    }
  ],
  "py:automation-and-browsing": [
    {
      "question": "Which of these best describes \"Web Scraping with BeautifulSoup\" in Python?",
      "options": [
        "A core concept covered in Automation & Browsing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Web Scraping with BeautifulSoup\" is one of the fundamental topics covered in the Automation & Browsing section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Selenium & Browser Automation\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in automation & browsing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Selenium & Browser Automation\" is a key concept in Python's Automation & Browsing domain."
    }
  ],
  "py:fluent-python-deep-dive": [
    {
      "question": "Which of these best describes \"Python Data Model (Dunder Methods)\" in Python?",
      "options": [
        "A core concept covered in Fluent Python Deep Dive",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Python Data Model (Dunder Methods)\" is one of the fundamental topics covered in the Fluent Python Deep Dive section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"__getattr__ & __setattr__\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in fluent python deep dive",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"__getattr__ & __setattr__\" is a key concept in Python's Fluent Python Deep Dive domain."
    }
  ],
  "py:data-science-and-ai": [
    {
      "question": "Which of these best describes \"NumPy Basics\" in Python?",
      "options": [
        "A core concept covered in Data Science & AI",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"NumPy Basics\" is one of the fundamental topics covered in the Data Science & AI section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Pandas Essentials\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in data science & ai",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pandas Essentials\" is a key concept in Python's Data Science & AI domain."
    }
  ],
  "py:ai-and-llm-engineering": [
    {
      "question": "Which of these best describes \"LLM Foundations (Tokenization & Embeddings)\" in Python?",
      "options": [
        "A core concept covered in AI & LLM Engineering",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"LLM Foundations (Tokenization & Embeddings)\" is one of the fundamental topics covered in the AI & LLM Engineering section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"Prompt Engineering\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in ai & llm engineering",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Prompt Engineering\" is a key concept in Python's AI & LLM Engineering domain."
    }
  ],
  "py:ai-engineering-pro": [
    {
      "question": "Which of these best describes \"Embeddings & Vector Databases\" in Python?",
      "options": [
        "A core concept covered in AI Engineering Pro",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Embeddings & Vector Databases\" is one of the fundamental topics covered in the AI Engineering Pro section of Python."
    },
    {
      "question": "In Python, what is the purpose of \"LangChain & LlamaIndex\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in ai engineering pro",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"LangChain & LlamaIndex\" is a key concept in Python's AI Engineering Pro domain."
    }
  ],
  "go:getting-started": [
    {
      "question": "Which of these best describes \"What is Go\" in Go?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Go\" is one of the fundamental topics covered in the Getting Started section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Go Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Go Syntax\" is a key concept in Go's Getting Started domain."
    }
  ],
  "go:variables-and-types": [
    {
      "question": "Which of these best describes \"Variable Declaration\" in Go?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Variable Declaration\" is one of the fundamental topics covered in the Variables & Types section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Primitive Types\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Primitive Types\" is a key concept in Go's Variables & Types domain."
    }
  ],
  "go:operators": [
    {
      "question": "Which of these best describes \"Arithmetic Operators\" in Go?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic Operators\" is one of the fundamental topics covered in the Operators section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Comparison Operators\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Comparison Operators\" is a key concept in Go's Operators domain."
    }
  ],
  "go:control-flow": [
    {
      "question": "Which of these best describes \"If & Else\" in Go?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"If & Else\" is one of the fundamental topics covered in the Control Flow section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Switch Statement\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Switch Statement\" is a key concept in Go's Control Flow domain."
    }
  ],
  "go:functions": [
    {
      "question": "Which of these best describes \"Function Declaration\" in Go?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Declaration\" is one of the fundamental topics covered in the Functions section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Multiple Return Values\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Multiple Return Values\" is a key concept in Go's Functions domain."
    }
  ],
  "go:collections": [
    {
      "question": "Which of these best describes \"Arrays\" in Go?",
      "options": [
        "A core concept covered in Collections",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arrays\" is one of the fundamental topics covered in the Collections section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Slices\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in collections",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Slices\" is a key concept in Go's Collections domain."
    }
  ],
  "go:pointers-and-references": [
    {
      "question": "Which of these best describes \"Pointer Basics\" in Go?",
      "options": [
        "A core concept covered in Pointers & References",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Pointer Basics\" is one of the fundamental topics covered in the Pointers & References section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Pointers to Structs\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in pointers & references",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pointers to Structs\" is a key concept in Go's Pointers & References domain."
    }
  ],
  "go:structs-and-composition": [
    {
      "question": "Which of these best describes \"Struct Definition\" in Go?",
      "options": [
        "A core concept covered in Structs & Composition",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Struct Definition\" is one of the fundamental topics covered in the Structs & Composition section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Struct Tags\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in structs & composition",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Struct Tags\" is a key concept in Go's Structs & Composition domain."
    }
  ],
  "go:interfaces": [
    {
      "question": "Which of these best describes \"Interface Definition\" in Go?",
      "options": [
        "A core concept covered in Interfaces",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Interface Definition\" is one of the fundamental topics covered in the Interfaces section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Implicit Implementation\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in interfaces",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Implicit Implementation\" is a key concept in Go's Interfaces domain."
    }
  ],
  "go:error-handling": [
    {
      "question": "Which of these best describes \"Error Interface\" in Go?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Error Interface\" is one of the fundamental topics covered in the Error Handling section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Error Checking\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Error Checking\" is a key concept in Go's Error Handling domain."
    }
  ],
  "go:concurrency": [
    {
      "question": "Which of these best describes \"Goroutines\" in Go?",
      "options": [
        "A core concept covered in Concurrency",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Goroutines\" is one of the fundamental topics covered in the Concurrency section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Channels\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in concurrency",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Channels\" is a key concept in Go's Concurrency domain."
    }
  ],
  "go:packages-and-imports": [
    {
      "question": "Which of these best describes \"Package Declaration\" in Go?",
      "options": [
        "A core concept covered in Packages & Imports",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Package Declaration\" is one of the fundamental topics covered in the Packages & Imports section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Importing Packages\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in packages & imports",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Importing Packages\" is a key concept in Go's Packages & Imports domain."
    }
  ],
  "go:file-i-o": [
    {
      "question": "Which of these best describes \"Reading Files (os.ReadFile)\" in Go?",
      "options": [
        "A core concept covered in File I/O",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Reading Files (os.ReadFile)\" is one of the fundamental topics covered in the File I/O section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Writing Files (os.WriteFile)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in file i/o",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Writing Files (os.WriteFile)\" is a key concept in Go's File I/O domain."
    }
  ],
  "go:testing": [
    {
      "question": "Which of these best describes \"Test Functions\" in Go?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Test Functions\" is one of the fundamental topics covered in the Testing section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Table-Driven Tests\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Table-Driven Tests\" is a key concept in Go's Testing domain."
    }
  ],
  "go:standard-library": [
    {
      "question": "Which of these best describes \"fmt Package\" in Go?",
      "options": [
        "A core concept covered in Standard Library",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"fmt Package\" is one of the fundamental topics covered in the Standard Library section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"strings & strconv Packages\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in standard library",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"strings & strconv Packages\" is a key concept in Go's Standard Library domain."
    }
  ],
  "go:modules-and-tooling": [
    {
      "question": "Which of these best describes \"Go Modules\" in Go?",
      "options": [
        "A core concept covered in Modules & Tooling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Go Modules\" is one of the fundamental topics covered in the Modules & Tooling section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Workspace Mode\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modules & tooling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Workspace Mode\" is a key concept in Go's Modules & Tooling domain."
    }
  ],
  "go:networking": [
    {
      "question": "Which of these best describes \"HTTP Server (net/http)\" in Go?",
      "options": [
        "A core concept covered in Networking",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"HTTP Server (net/http)\" is one of the fundamental topics covered in the Networking section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"HTTP Client\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in networking",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"HTTP Client\" is a key concept in Go's Networking domain."
    }
  ],
  "go:database-and-sql": [
    {
      "question": "Which of these best describes \"database/sql Interface\" in Go?",
      "options": [
        "A core concept covered in Database & SQL",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"database/sql Interface\" is one of the fundamental topics covered in the Database & SQL section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Querying (Query & QueryRow)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in database & sql",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Querying (Query & QueryRow)\" is a key concept in Go's Database & SQL domain."
    }
  ],
  "go:learning-go-and-best-practices": [
    {
      "question": "Which of these best describes \"Go Design Philosophy\" in Go?",
      "options": [
        "A core concept covered in Learning Go & Best Practices",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Go Design Philosophy\" is one of the fundamental topics covered in the Learning Go & Best Practices section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"nil & Zero Values Mental Model\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in learning go & best practices",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"nil & Zero Values Mental Model\" is a key concept in Go's Learning Go & Best Practices domain."
    }
  ],
  "go:ecosystem-and-frameworks": [
    {
      "question": "Which of these best describes \"CLI Applications (Cobra)\" in Go?",
      "options": [
        "A core concept covered in Ecosystem & Frameworks",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"CLI Applications (Cobra)\" is one of the fundamental topics covered in the Ecosystem & Frameworks section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Web Frameworks (Gin, Echo)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in ecosystem & frameworks",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Web Frameworks (Gin, Echo)\" is a key concept in Go's Ecosystem & Frameworks domain."
    }
  ],
  "go:advanced-go": [
    {
      "question": "Which of these best describes \"Reflection\" in Go?",
      "options": [
        "A core concept covered in Advanced Go",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Reflection\" is one of the fundamental topics covered in the Advanced Go section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"CGO Basics\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced go",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"CGO Basics\" is a key concept in Go's Advanced Go domain."
    }
  ],
  "go:deployment-and-devops": [
    {
      "question": "Which of these best describes \"Docker Multi-stage Builds\" in Go?",
      "options": [
        "A core concept covered in Deployment & DevOps",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Docker Multi-stage Builds\" is one of the fundamental topics covered in the Deployment & DevOps section of Go."
    },
    {
      "question": "In Go, what is the purpose of \"Kubernetes Deployment\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in deployment & devops",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Kubernetes Deployment\" is a key concept in Go's Deployment & DevOps domain."
    }
  ],
  "rust:getting-started": [
    {
      "question": "Which of these best describes \"What is Rust\" in Rust?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Rust\" is one of the fundamental topics covered in the Getting Started section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Rust Syntax Basics\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Rust Syntax Basics\" is a key concept in Rust's Getting Started domain."
    }
  ],
  "rust:control-flow": [
    {
      "question": "Which of these best describes \"if / else if / else\" in Rust?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if / else if / else\" is one of the fundamental topics covered in the Control Flow section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Loops (loop, while, for)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Loops (loop, while, for)\" is a key concept in Rust's Control Flow domain."
    }
  ],
  "rust:ownership-and-borrowing": [
    {
      "question": "Which of these best describes \"Ownership Rules\" in Rust?",
      "options": [
        "A core concept covered in Ownership & Borrowing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Ownership Rules\" is one of the fundamental topics covered in the Ownership & Borrowing section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Move Semantics\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in ownership & borrowing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Move Semantics\" is a key concept in Rust's Ownership & Borrowing domain."
    }
  ],
  "rust:functions": [
    {
      "question": "Which of these best describes \"Function Declaration\" in Rust?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Declaration\" is one of the fundamental topics covered in the Functions section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Methods & Associated Functions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Methods & Associated Functions\" is a key concept in Rust's Functions domain."
    }
  ],
  "rust:compound-types": [
    {
      "question": "Which of these best describes \"Tuples\" in Rust?",
      "options": [
        "A core concept covered in Compound Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Tuples\" is one of the fundamental topics covered in the Compound Types section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Arrays\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in compound types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Arrays\" is a key concept in Rust's Compound Types domain."
    }
  ],
  "rust:traits-and-generics": [
    {
      "question": "Which of these best describes \"Generics\" in Rust?",
      "options": [
        "A core concept covered in Traits & Generics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Generics\" is one of the fundamental topics covered in the Traits & Generics section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Traits\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in traits & generics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Traits\" is a key concept in Rust's Traits & Generics domain."
    }
  ],
  "rust:error-handling": [
    {
      "question": "Which of these best describes \"Result & Option\" in Rust?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Result & Option\" is one of the fundamental topics covered in the Error Handling section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"The ? Operator\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"The ? Operator\" is a key concept in Rust's Error Handling domain."
    }
  ],
  "rust:collections": [
    {
      "question": "Which of these best describes \"Vec\" in Rust?",
      "options": [
        "A core concept covered in Collections",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Vec\" is one of the fundamental topics covered in the Collections section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"VecDeque\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in collections",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"VecDeque\" is a key concept in Rust's Collections domain."
    }
  ],
  "rust:advanced-rust": [
    {
      "question": "Which of these best describes \"Box<T> (Heap Allocation)\" in Rust?",
      "options": [
        "A core concept covered in Advanced Rust",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Box<T> (Heap Allocation)\" is one of the fundamental topics covered in the Advanced Rust section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Rc<T> (Reference Counting)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced rust",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Rc<T> (Reference Counting)\" is a key concept in Rust's Advanced Rust domain."
    }
  ],
  "rust:modules-and-cargo": [
    {
      "question": "Which of these best describes \"Modules & Paths\" in Rust?",
      "options": [
        "A core concept covered in Modules & Cargo",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Modules & Paths\" is one of the fundamental topics covered in the Modules & Cargo section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Re-exports\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modules & cargo",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Re-exports\" is a key concept in Rust's Modules & Cargo domain."
    }
  ],
  "rust:lifetimes": [
    {
      "question": "Which of these best describes \"Basic Lifetime Annotations\" in Rust?",
      "options": [
        "A core concept covered in Lifetimes",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Basic Lifetime Annotations\" is one of the fundamental topics covered in the Lifetimes section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Lifetime Elision Rules\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in lifetimes",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Lifetime Elision Rules\" is a key concept in Rust's Lifetimes domain."
    }
  ],
  "rust:async-rust": [
    {
      "question": "Which of these best describes \"async/await Basics\" in Rust?",
      "options": [
        "A core concept covered in Async Rust",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"async/await Basics\" is one of the fundamental topics covered in the Async Rust section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Tokio Runtime Deep\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in async rust",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Tokio Runtime Deep\" is a key concept in Rust's Async Rust domain."
    }
  ],
  "rust:unsafe-and-ffi": [
    {
      "question": "Which of these best describes \"Raw Pointers\" in Rust?",
      "options": [
        "A core concept covered in Unsafe & FFI",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Raw Pointers\" is one of the fundamental topics covered in the Unsafe & FFI section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Unsafe Functions & Blocks\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in unsafe & ffi",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Unsafe Functions & Blocks\" is a key concept in Rust's Unsafe & FFI domain."
    }
  ],
  "rust:patterns-and-idioms": [
    {
      "question": "Which of these best describes \"Builder Pattern\" in Rust?",
      "options": [
        "A core concept covered in Patterns & Idioms",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Builder Pattern\" is one of the fundamental topics covered in the Patterns & Idioms section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"RAII (Resource Acquisition Is Initialization)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in patterns & idioms",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"RAII (Resource Acquisition Is Initialization)\" is a key concept in Rust's Patterns & Idioms domain."
    }
  ],
  "rust:testing": [
    {
      "question": "Which of these best describes \"Unit Tests\" in Rust?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Unit Tests\" is one of the fundamental topics covered in the Testing section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Integration Tests\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Integration Tests\" is a key concept in Rust's Testing domain."
    }
  ],
  "rust:macros": [
    {
      "question": "Which of these best describes \"Declarative Macros (macro_rules!)\" in Rust?",
      "options": [
        "A core concept covered in Macros",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Declarative Macros (macro_rules!)\" is one of the fundamental topics covered in the Macros section of Rust."
    },
    {
      "question": "In Rust, what is the purpose of \"Macro Patterns & Designators\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in macros",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Macro Patterns & Designators\" is a key concept in Rust's Macros domain."
    }
  ],
  "java:java-basics": [
    {
      "question": "Which of these best describes \"What is Java\" in Java?",
      "options": [
        "A core concept covered in Java Basics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Java\" is one of the fundamental topics covered in the Java Basics section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"JDK vs JRE vs JVM\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in java basics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"JDK vs JRE vs JVM\" is a key concept in Java's Java Basics domain."
    }
  ],
  "java:object-oriented-programming": [
    {
      "question": "Which of these best describes \"Classes & Objects\" in Java?",
      "options": [
        "A core concept covered in Object-Oriented Programming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Classes & Objects\" is one of the fundamental topics covered in the Object-Oriented Programming section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Constructors\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in object-oriented programming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Constructors\" is a key concept in Java's Object-Oriented Programming domain."
    }
  ],
  "java:functional-programming": [
    {
      "question": "Which of these best describes \"Lambda Expressions\" in Java?",
      "options": [
        "A core concept covered in Functional Programming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Lambda Expressions\" is one of the fundamental topics covered in the Functional Programming section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Primitive Streams & Optionals\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functional programming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Primitive Streams & Optionals\" is a key concept in Java's Functional Programming domain."
    }
  ],
  "java:collections-framework": [
    {
      "question": "Which of these best describes \"List Interface\" in Java?",
      "options": [
        "A core concept covered in Collections Framework",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"List Interface\" is one of the fundamental topics covered in the Collections Framework section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Set Interface\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in collections framework",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Set Interface\" is a key concept in Java's Collections Framework domain."
    }
  ],
  "java:generics": [
    {
      "question": "Which of these best describes \"Generic Classes\" in Java?",
      "options": [
        "A core concept covered in Generics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Generic Classes\" is one of the fundamental topics covered in the Generics section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Generic Methods\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in generics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Generic Methods\" is a key concept in Java's Generics domain."
    }
  ],
  "java:i-o-and-file-handling": [
    {
      "question": "Which of these best describes \"RandomAccessFile & Mapped Files\" in Java?",
      "options": [
        "A core concept covered in I/O & File Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"RandomAccessFile & Mapped Files\" is one of the fundamental topics covered in the I/O & File Handling section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Stream I/O\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in i/o & file handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Stream I/O\" is a key concept in Java's I/O & File Handling domain."
    }
  ],
  "java:concurrency": [
    {
      "question": "Which of these best describes \"Threads & Runnable\" in Java?",
      "options": [
        "A core concept covered in Concurrency",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Threads & Runnable\" is one of the fundamental topics covered in the Concurrency section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Synchronization\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in concurrency",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Synchronization\" is a key concept in Java's Concurrency domain."
    }
  ],
  "java:build-tools": [
    {
      "question": "Which of these best describes \"Maven Basics\" in Java?",
      "options": [
        "A core concept covered in Build Tools",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Maven Basics\" is one of the fundamental topics covered in the Build Tools section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Maven Lifecycle & Plugins\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in build tools",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Maven Lifecycle & Plugins\" is a key concept in Java's Build Tools domain."
    }
  ],
  "java:database-access": [
    {
      "question": "Which of these best describes \"Flyway Migrations\" in Java?",
      "options": [
        "A core concept covered in Database Access",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Flyway Migrations\" is one of the fundamental topics covered in the Database Access section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"JDBC\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in database access",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"JDBC\" is a key concept in Java's Database Access domain."
    }
  ],
  "java:testing": [
    {
      "question": "Which of these best describes \"JUnit 5\" in Java?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"JUnit 5\" is one of the fundamental topics covered in the Testing section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Integration Testing\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Integration Testing\" is a key concept in Java's Testing domain."
    }
  ],
  "java:web-frameworks": [
    {
      "question": "Which of these best describes \"Spring Boot Basics\" in Java?",
      "options": [
        "A core concept covered in Web Frameworks",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Spring Boot Basics\" is one of the fundamental topics covered in the Web Frameworks section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"REST API Patterns\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in web frameworks",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"REST API Patterns\" is a key concept in Java's Web Frameworks domain."
    }
  ],
  "java:logging": [
    {
      "question": "Which of these best describes \"MDC & Structured Logging\" in Java?",
      "options": [
        "A core concept covered in Logging",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"MDC & Structured Logging\" is one of the fundamental topics covered in the Logging section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"SLF4J & Logback\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in logging",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"SLF4J & Logback\" is a key concept in Java's Logging domain."
    }
  ],
  "java:strings-and-text": [
    {
      "question": "Which of these best describes \"StringBuilder & StringBuffer\" in Java?",
      "options": [
        "A core concept covered in Strings & Text",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"StringBuilder & StringBuffer\" is one of the fundamental topics covered in the Strings & Text section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Regex (Pattern & Matcher)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in strings & text",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Regex (Pattern & Matcher)\" is a key concept in Java's Strings & Text domain."
    }
  ],
  "java:standard-library": [
    {
      "question": "Which of these best describes \"java.util.function Package\" in Java?",
      "options": [
        "A core concept covered in Standard Library",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"java.util.function Package\" is one of the fundamental topics covered in the Standard Library section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"java.time Deep\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in standard library",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"java.time Deep\" is a key concept in Java's Standard Library domain."
    }
  ],
  "java:java-platform-features": [
    {
      "question": "Which of these best describes \"Modules (Project Jigsaw)\" in Java?",
      "options": [
        "A core concept covered in Java Platform Features",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Modules (Project Jigsaw)\" is one of the fundamental topics covered in the Java Platform Features section of Java."
    },
    {
      "question": "In Java, what is the purpose of \"Date & Time API\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in java platform features",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Date & Time API\" is a key concept in Java's Java Platform Features domain."
    }
  ],
  "kt:getting-started": [
    {
      "question": "Which of these best describes \"What is Kotlin\" in Kotlin?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Kotlin\" is one of the fundamental topics covered in the Getting Started section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Kotlin Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Kotlin Syntax\" is a key concept in Kotlin's Getting Started domain."
    }
  ],
  "kt:control-flow": [
    {
      "question": "Which of these best describes \"If & When expressions\" in Kotlin?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"If & When expressions\" is one of the fundamental topics covered in the Control Flow section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"for & while Loops\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"for & while Loops\" is a key concept in Kotlin's Control Flow domain."
    }
  ],
  "kt:functions": [
    {
      "question": "Which of these best describes \"Function Declaration\" in Kotlin?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Declaration\" is one of the fundamental topics covered in the Functions section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Default & Named Args\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Default & Named Args\" is a key concept in Kotlin's Functions domain."
    }
  ],
  "kt:collections": [
    {
      "question": "Which of these best describes \"Lists & Arrays\" in Kotlin?",
      "options": [
        "A core concept covered in Collections",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Lists & Arrays\" is one of the fundamental topics covered in the Collections section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Maps & Sets\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in collections",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Maps & Sets\" is a key concept in Kotlin's Collections domain."
    }
  ],
  "kt:classes-and-oop": [
    {
      "question": "Which of these best describes \"Class Basics\" in Kotlin?",
      "options": [
        "A core concept covered in Classes & OOP",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Class Basics\" is one of the fundamental topics covered in the Classes & OOP section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Inheritance & Interfaces\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in classes & oop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Inheritance & Interfaces\" is a key concept in Kotlin's Classes & OOP domain."
    }
  ],
  "kt:generics": [
    {
      "question": "Which of these best describes \"Generic Functions & Classes\" in Kotlin?",
      "options": [
        "A core concept covered in Generics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Generic Functions & Classes\" is one of the fundamental topics covered in the Generics section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Variance — out & in\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in generics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Variance — out & in\" is a key concept in Kotlin's Generics domain."
    }
  ],
  "kt:coroutines": [
    {
      "question": "Which of these best describes \"Launch & Async\" in Kotlin?",
      "options": [
        "A core concept covered in Coroutines",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Launch & Async\" is one of the fundamental topics covered in the Coroutines section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Dispatchers\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in coroutines",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Dispatchers\" is a key concept in Kotlin's Coroutines domain."
    }
  ],
  "kt:flows": [
    {
      "question": "Which of these best describes \"Flow Basics\" in Kotlin?",
      "options": [
        "A core concept covered in Flows",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Flow Basics\" is one of the fundamental topics covered in the Flows section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Flow Builders\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in flows",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Flow Builders\" is a key concept in Kotlin's Flows domain."
    }
  ],
  "kt:advanced-kotlin": [
    {
      "question": "Which of these best describes \"Context Receivers\" in Kotlin?",
      "options": [
        "A core concept covered in Advanced Kotlin",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Context Receivers\" is one of the fundamental topics covered in the Advanced Kotlin section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Contracts\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced kotlin",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Contracts\" is a key concept in Kotlin's Advanced Kotlin domain."
    }
  ],
  "kt:kotlin-multiplatform": [
    {
      "question": "Which of these best describes \"KMP Overview\" in Kotlin?",
      "options": [
        "A core concept covered in Kotlin Multiplatform",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"KMP Overview\" is one of the fundamental topics covered in the Kotlin Multiplatform section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"expect/actual\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in kotlin multiplatform",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"expect/actual\" is a key concept in Kotlin's Kotlin Multiplatform domain."
    }
  ],
  "kt:testing": [
    {
      "question": "Which of these best describes \"kotlin.test Basics\" in Kotlin?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"kotlin.test Basics\" is one of the fundamental topics covered in the Testing section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Kotest\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Kotest\" is a key concept in Kotlin's Testing domain."
    }
  ],
  "kt:build-and-tooling": [
    {
      "question": "Which of these best describes \"Gradle Kotlin DSL\" in Kotlin?",
      "options": [
        "A core concept covered in Build & Tooling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Gradle Kotlin DSL\" is one of the fundamental topics covered in the Build & Tooling section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Version Catalogs\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in build & tooling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Version Catalogs\" is a key concept in Kotlin's Build & Tooling domain."
    }
  ],
  "kt:kotlin-idioms-and-dsl": [
    {
      "question": "Which of these best describes \"Scope Functions Deep\" in Kotlin?",
      "options": [
        "A core concept covered in Kotlin Idioms & DSL",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Scope Functions Deep\" is one of the fundamental topics covered in the Kotlin Idioms & DSL section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"Lambda with Receiver\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in kotlin idioms & dsl",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Lambda with Receiver\" is a key concept in Kotlin's Kotlin Idioms & DSL domain."
    }
  ],
  "kt:android-development": [
    {
      "question": "Which of these best describes \"Jetpack Compose Basics\" in Kotlin?",
      "options": [
        "A core concept covered in Android Development",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Jetpack Compose Basics\" is one of the fundamental topics covered in the Android Development section of Kotlin."
    },
    {
      "question": "In Kotlin, what is the purpose of \"ViewModel & State\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in android development",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"ViewModel & State\" is a key concept in Kotlin's Android Development domain."
    }
  ],
  "cs:getting-started": [
    {
      "question": "Which of these best describes \"What is .NET?\" in C#?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is .NET?\" is one of the fundamental topics covered in the Getting Started section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Project Types & Templates\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Project Types & Templates\" is a key concept in C#'s Getting Started domain."
    }
  ],
  "cs:variables-and-types": [
    {
      "question": "Which of these best describes \"Primitive Types\" in C#?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Primitive Types\" is one of the fundamental topics covered in the Variables & Types section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"var & Implicit Typing\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"var & Implicit Typing\" is a key concept in C#'s Variables & Types domain."
    }
  ],
  "cs:operators": [
    {
      "question": "Which of these best describes \"Arithmetic & Assignment\" in C#?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic & Assignment\" is one of the fundamental topics covered in the Operators section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Comparison & Equality\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Comparison & Equality\" is a key concept in C#'s Operators domain."
    }
  ],
  "cs:control-flow": [
    {
      "question": "Which of these best describes \"if / else if / else\" in C#?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if / else if / else\" is one of the fundamental topics covered in the Control Flow section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Switch Statement\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Switch Statement\" is a key concept in C#'s Control Flow domain."
    }
  ],
  "cs:methods": [
    {
      "question": "Which of these best describes \"Method Basics\" in C#?",
      "options": [
        "A core concept covered in Methods",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Method Basics\" is one of the fundamental topics covered in the Methods section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Parameter Modifiers (ref, in, out)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in methods",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Parameter Modifiers (ref, in, out)\" is a key concept in C#'s Methods domain."
    }
  ],
  "cs:classes-and-oop": [
    {
      "question": "Which of these best describes \"Classes & Objects\" in C#?",
      "options": [
        "A core concept covered in Classes & OOP",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Classes & Objects\" is one of the fundamental topics covered in the Classes & OOP section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Fields & Properties\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in classes & oop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Fields & Properties\" is a key concept in C#'s Classes & OOP domain."
    }
  ],
  "cs:interfaces-and-generics": [
    {
      "question": "Which of these best describes \"Interface Basics\" in C#?",
      "options": [
        "A core concept covered in Interfaces & Generics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Interface Basics\" is one of the fundamental topics covered in the Interfaces & Generics section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Default Interface Methods\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in interfaces & generics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Default Interface Methods\" is a key concept in C#'s Interfaces & Generics domain."
    }
  ],
  "cs:collections-and-linq": [
    {
      "question": "Which of these best describes \"Arrays\" in C#?",
      "options": [
        "A core concept covered in Collections & LINQ",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arrays\" is one of the fundamental topics covered in the Collections & LINQ section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"List<T>\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in collections & linq",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"List<T>\" is a key concept in C#'s Collections & LINQ domain."
    }
  ],
  "cs:error-handling": [
    {
      "question": "Which of these best describes \"try / catch / finally\" in C#?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"try / catch / finally\" is one of the fundamental topics covered in the Error Handling section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Exception Filters (when)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Exception Filters (when)\" is a key concept in C#'s Error Handling domain."
    }
  ],
  "cs:async-and-concurrency": [
    {
      "question": "Which of these best describes \"async / await Basics\" in C#?",
      "options": [
        "A core concept covered in Async & Concurrency",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"async / await Basics\" is one of the fundamental topics covered in the Async & Concurrency section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Task & Task<T>\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in async & concurrency",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Task & Task<T>\" is a key concept in C#'s Async & Concurrency domain."
    }
  ],
  "cs:file-i-o-and-serialization": [
    {
      "question": "Which of these best describes \"File & Directory Operations\" in C#?",
      "options": [
        "A core concept covered in File I/O & Serialization",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"File & Directory Operations\" is one of the fundamental topics covered in the File I/O & Serialization section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"StreamReader / StreamWriter\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in file i/o & serialization",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"StreamReader / StreamWriter\" is a key concept in C#'s File I/O & Serialization domain."
    }
  ],
  "cs:memory-and-performance": [
    {
      "question": "Which of these best describes \"Span<T> & ReadOnlySpan<T>\" in C#?",
      "options": [
        "A core concept covered in Memory & Performance",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Span<T> & ReadOnlySpan<T>\" is one of the fundamental topics covered in the Memory & Performance section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Memory<T> & ReadOnlyMemory<T>\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in memory & performance",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Memory<T> & ReadOnlyMemory<T>\" is a key concept in C#'s Memory & Performance domain."
    }
  ],
  "cs:interop": [
    {
      "question": "Which of these best describes \"P/Invoke (Platform Invoke)\" in C#?",
      "options": [
        "A core concept covered in Interop",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"P/Invoke (Platform Invoke)\" is one of the fundamental topics covered in the Interop section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"COM Interop\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in interop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"COM Interop\" is a key concept in C#'s Interop domain."
    }
  ],
  "cs:testing": [
    {
      "question": "Which of these best describes \"xUnit.net Basics\" in C#?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"xUnit.net Basics\" is one of the fundamental topics covered in the Testing section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"NUnit Basics\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"NUnit Basics\" is a key concept in C#'s Testing domain."
    }
  ],
  "cs:net-ecosystem": [
    {
      "question": "Which of these best describes \"NuGet Package Manager\" in C#?",
      "options": [
        "A core concept covered in .NET Ecosystem",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"NuGet Package Manager\" is one of the fundamental topics covered in the .NET Ecosystem section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"ASP.NET Core Minimal API\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in .net ecosystem",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"ASP.NET Core Minimal API\" is a key concept in C#'s .NET Ecosystem domain."
    }
  ],
  "cs:advanced": [
    {
      "question": "Which of these best describes \"Source Generators\" in C#?",
      "options": [
        "A core concept covered in Advanced",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Source Generators\" is one of the fundamental topics covered in the Advanced section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Compile-Time Code Generation with Roslyn\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Compile-Time Code Generation with Roslyn\" is a key concept in C#'s Advanced domain."
    }
  ],
  "cs:c-12-and-net-8-features": [
    {
      "question": "Which of these best describes \"Collection Expressions\" in C#?",
      "options": [
        "A core concept covered in C# 12 & .NET 8 Features",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Collection Expressions\" is one of the fundamental topics covered in the C# 12 & .NET 8 Features section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Default Lambda Parameters\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in c# 12 & .net 8 features",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Default Lambda Parameters\" is a key concept in C#'s C# 12 & .NET 8 Features domain."
    }
  ],
  "cs:software-engineering-heuristics": [
    {
      "question": "Which of these best describes \"Small Methods (Fits in Your Head)\" in C#?",
      "options": [
        "A core concept covered in Software Engineering Heuristics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Small Methods (Fits in Your Head)\" is one of the fundamental topics covered in the Software Engineering Heuristics section of C#."
    },
    {
      "question": "In C#, what is the purpose of \"Command-Query Separation\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in software engineering heuristics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Command-Query Separation\" is a key concept in C#'s Software Engineering Heuristics domain."
    }
  ],
  "cpp:getting-started": [
    {
      "question": "Which of these best describes \"What is C++\" in C++?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is C++\" is one of the fundamental topics covered in the Getting Started section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"C++ Versions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"C++ Versions\" is a key concept in C++'s Getting Started domain."
    }
  ],
  "cpp:variables-and-types": [
    {
      "question": "Which of these best describes \"Fundamental Types\" in C++?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Fundamental Types\" is one of the fundamental topics covered in the Variables & Types section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"auto & decltype\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"auto & decltype\" is a key concept in C++'s Variables & Types domain."
    }
  ],
  "cpp:operators": [
    {
      "question": "Which of these best describes \"Arithmetic & Logical\" in C++?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic & Logical\" is one of the fundamental topics covered in the Operators section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Bitwise & Shift\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Bitwise & Shift\" is a key concept in C++'s Operators domain."
    }
  ],
  "cpp:control-flow": [
    {
      "question": "Which of these best describes \"if / else\" in C++?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if / else\" is one of the fundamental topics covered in the Control Flow section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Switch\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Switch\" is a key concept in C++'s Control Flow domain."
    }
  ],
  "cpp:functions": [
    {
      "question": "Which of these best describes \"Declaration & Definition\" in C++?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Declaration & Definition\" is one of the fundamental topics covered in the Functions section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Overloading & Default Args\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Overloading & Default Args\" is a key concept in C++'s Functions domain."
    }
  ],
  "cpp:strings": [
    {
      "question": "Which of these best describes \"std::string\" in C++?",
      "options": [
        "A core concept covered in Strings",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::string\" is one of the fundamental topics covered in the Strings section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"String Views\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in strings",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"String Views\" is a key concept in C++'s Strings domain."
    }
  ],
  "cpp:object-oriented-programming": [
    {
      "question": "Which of these best describes \"Classes & Objects\" in C++?",
      "options": [
        "A core concept covered in Object-Oriented Programming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Classes & Objects\" is one of the fundamental topics covered in the Object-Oriented Programming section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Inheritance & Polymorphism\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in object-oriented programming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Inheritance & Polymorphism\" is a key concept in C++'s Object-Oriented Programming domain."
    }
  ],
  "cpp:stl-containers": [
    {
      "question": "Which of these best describes \"std::vector\" in C++?",
      "options": [
        "A core concept covered in STL Containers",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::vector\" is one of the fundamental topics covered in the STL Containers section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"std::map & std::set\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in stl containers",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"std::map & std::set\" is a key concept in C++'s STL Containers domain."
    }
  ],
  "cpp:stl-algorithms": [
    {
      "question": "Which of these best describes \"sort, find, transform\" in C++?",
      "options": [
        "A core concept covered in STL Algorithms",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"sort, find, transform\" is one of the fundamental topics covered in the STL Algorithms section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"lower_bound & binary_search\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in stl algorithms",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"lower_bound & binary_search\" is a key concept in C++'s STL Algorithms domain."
    }
  ],
  "cpp:templates": [
    {
      "question": "Which of these best describes \"Function & Class Templates\" in C++?",
      "options": [
        "A core concept covered in Templates",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function & Class Templates\" is one of the fundamental topics covered in the Templates section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Template Specialization\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in templates",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Template Specialization\" is a key concept in C++'s Templates domain."
    }
  ],
  "cpp:c-20-features": [
    {
      "question": "Which of these best describes \"Concepts\" in C++?",
      "options": [
        "A core concept covered in C++20 Features",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Concepts\" is one of the fundamental topics covered in the C++20 Features section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Ranges Library\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in c++20 features",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Ranges Library\" is a key concept in C++'s C++20 Features domain."
    }
  ],
  "cpp:c-23-features": [
    {
      "question": "Which of these best describes \"std::expected\" in C++?",
      "options": [
        "A core concept covered in C++23 Features",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::expected\" is one of the fundamental topics covered in the C++23 Features section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Deducing This\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in c++23 features",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Deducing This\" is a key concept in C++'s C++23 Features domain."
    }
  ],
  "cpp:smart-pointers": [
    {
      "question": "Which of these best describes \"std::unique_ptr\" in C++?",
      "options": [
        "A core concept covered in Smart Pointers",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::unique_ptr\" is one of the fundamental topics covered in the Smart Pointers section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"std::shared_ptr\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in smart pointers",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"std::shared_ptr\" is a key concept in C++'s Smart Pointers domain."
    }
  ],
  "cpp:concurrency": [
    {
      "question": "Which of these best describes \"std::thread\" in C++?",
      "options": [
        "A core concept covered in Concurrency",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::thread\" is one of the fundamental topics covered in the Concurrency section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Mutex & Locks\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in concurrency",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Mutex & Locks\" is a key concept in C++'s Concurrency domain."
    }
  ],
  "cpp:file-i-o": [
    {
      "question": "Which of these best describes \"std::fstream Basics\" in C++?",
      "options": [
        "A core concept covered in File I/O",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::fstream Basics\" is one of the fundamental topics covered in the File I/O section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"std::filesystem\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in file i/o",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"std::filesystem\" is a key concept in C++'s File I/O domain."
    }
  ],
  "cpp:error-handling": [
    {
      "question": "Which of these best describes \"Exceptions\" in C++?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Exceptions\" is one of the fundamental topics covered in the Error Handling section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"noexcept Specifier\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"noexcept Specifier\" is a key concept in C++'s Error Handling domain."
    }
  ],
  "cpp:build-systems": [
    {
      "question": "Which of these best describes \"CMake Deep\" in C++?",
      "options": [
        "A core concept covered in Build Systems",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"CMake Deep\" is one of the fundamental topics covered in the Build Systems section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"vcpkg\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in build systems",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"vcpkg\" is a key concept in C++'s Build Systems domain."
    }
  ],
  "cpp:frameworks": [
    {
      "question": "Which of these best describes \"Qt Framework\" in C++?",
      "options": [
        "A core concept covered in Frameworks",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Qt Framework\" is one of the fundamental topics covered in the Frameworks section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Boost Libraries\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in frameworks",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Boost Libraries\" is a key concept in C++'s Frameworks domain."
    }
  ],
  "cpp:utilities-and-type-support": [
    {
      "question": "Which of these best describes \"std::optional (C++17)\" in C++?",
      "options": [
        "A core concept covered in Utilities & Type Support",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::optional (C++17)\" is one of the fundamental topics covered in the Utilities & Type Support section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"std::variant (C++17)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in utilities & type support",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"std::variant (C++17)\" is a key concept in C++'s Utilities & Type Support domain."
    }
  ],
  "cpp:modern-c-practice": [
    {
      "question": "Which of these best describes \"Inline Variables (C++17)\" in C++?",
      "options": [
        "A core concept covered in Modern C++ Practice",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Inline Variables (C++17)\" is one of the fundamental topics covered in the Modern C++ Practice section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"[[nodiscard]] & [[maybe_unused]]\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modern c++ practice",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"[[nodiscard]] & [[maybe_unused]]\" is a key concept in C++'s Modern C++ Practice domain."
    }
  ],
  "cpp:pointers-and-memory": [
    {
      "question": "Which of these best describes \"References\" in C++?",
      "options": [
        "A core concept covered in Pointers & Memory",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"References\" is one of the fundamental topics covered in the Pointers & Memory section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Raw Pointers\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in pointers & memory",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Raw Pointers\" is a key concept in C++'s Pointers & Memory domain."
    }
  ],
  "cpp:type-casting": [
    {
      "question": "Which of these best describes \"static_cast\" in C++?",
      "options": [
        "A core concept covered in Type Casting",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"static_cast\" is one of the fundamental topics covered in the Type Casting section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"dynamic_cast\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in type casting",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"dynamic_cast\" is a key concept in C++'s Type Casting domain."
    }
  ],
  "cpp:language-internals": [
    {
      "question": "Which of these best describes \"Undefined Behavior\" in C++?",
      "options": [
        "A core concept covered in Language Internals",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Undefined Behavior\" is one of the fundamental topics covered in the Language Internals section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"ADL\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in language internals",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"ADL\" is a key concept in C++'s Language Internals domain."
    }
  ],
  "cpp:inheritance-and-advanced-oop": [
    {
      "question": "Which of these best describes \"Multiple Inheritance\" in C++?",
      "options": [
        "A core concept covered in Inheritance & Advanced OOP",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Multiple Inheritance\" is one of the fundamental topics covered in the Inheritance & Advanced OOP section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Diamond Inheritance\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in inheritance & advanced oop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Diamond Inheritance\" is a key concept in C++'s Inheritance & Advanced OOP domain."
    }
  ],
  "cpp:debugging": [
    {
      "question": "Which of these best describes \"GDB Basics\" in C++?",
      "options": [
        "A core concept covered in Debugging",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"GDB Basics\" is one of the fundamental topics covered in the Debugging section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Debugging Symbols\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in debugging",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Debugging Symbols\" is a key concept in C++'s Debugging domain."
    }
  ],
  "cpp:compilers": [
    {
      "question": "Which of these best describes \"Compiler Stages\" in C++?",
      "options": [
        "A core concept covered in Compilers",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Compiler Stages\" is one of the fundamental topics covered in the Compilers section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"GCC & Clang\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in compilers",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"GCC & Clang\" is a key concept in C++'s Compilers domain."
    }
  ],
  "cpp:c-idioms": [
    {
      "question": "Which of these best describes \"CRTP\" in C++?",
      "options": [
        "A core concept covered in C++ Idioms",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"CRTP\" is one of the fundamental topics covered in the C++ Idioms section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Non-Copyable Idiom\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in c++ idioms",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Non-Copyable Idiom\" is a key concept in C++'s C++ Idioms domain."
    }
  ],
  "cpp:date-and-time": [
    {
      "question": "Which of these best describes \"std::chrono\" in C++?",
      "options": [
        "A core concept covered in Date & Time",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"std::chrono\" is one of the fundamental topics covered in the Date & Time section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"Random Number Generation\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in date & time",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Random Number Generation\" is a key concept in C++'s Date & Time domain."
    }
  ],
  "cpp:iterator-and-i-o-streams": [
    {
      "question": "Which of these best describes \"Iterator Categories\" in C++?",
      "options": [
        "A core concept covered in Iterator & I/O Streams",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Iterator Categories\" is one of the fundamental topics covered in the Iterator & I/O Streams section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"iostream Deep\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in iterator & i/o streams",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"iostream Deep\" is a key concept in C++'s Iterator & I/O Streams domain."
    }
  ],
  "cpp:additional-libraries": [
    {
      "question": "Which of these best describes \"OpenCV\" in C++?",
      "options": [
        "A core concept covered in Additional Libraries",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"OpenCV\" is one of the fundamental topics covered in the Additional Libraries section of C++."
    },
    {
      "question": "In C++, what is the purpose of \"fmtlib\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in additional libraries",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"fmtlib\" is a key concept in C++'s Additional Libraries domain."
    }
  ],
  "c:getting-started": [
    {
      "question": "Which of these best describes \"What is C\" in C?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is C\" is one of the fundamental topics covered in the Getting Started section of C."
    },
    {
      "question": "In C, what is the purpose of \"Hello World\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Hello World\" is a key concept in C's Getting Started domain."
    }
  ],
  "c:variables-and-storage": [
    {
      "question": "Which of these best describes \"Variables & Assignment\" in C?",
      "options": [
        "A core concept covered in Variables & Storage",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Variables & Assignment\" is one of the fundamental topics covered in the Variables & Storage section of C."
    },
    {
      "question": "In C, what is the purpose of \"Constants & Literals\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & storage",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Constants & Literals\" is a key concept in C's Variables & Storage domain."
    }
  ],
  "c:operators": [
    {
      "question": "Which of these best describes \"Arithmetic Operators\" in C?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic Operators\" is one of the fundamental topics covered in the Operators section of C."
    },
    {
      "question": "In C, what is the purpose of \"Relational & Logical Operators\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Relational & Logical Operators\" is a key concept in C's Operators domain."
    }
  ],
  "c:control-flow": [
    {
      "question": "Which of these best describes \"if / else if / else\" in C?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if / else if / else\" is one of the fundamental topics covered in the Control Flow section of C."
    },
    {
      "question": "In C, what is the purpose of \"Switch Statement\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Switch Statement\" is a key concept in C's Control Flow domain."
    }
  ],
  "c:functions": [
    {
      "question": "Which of these best describes \"Function Declaration & Definition\" in C?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Declaration & Definition\" is one of the fundamental topics covered in the Functions section of C."
    },
    {
      "question": "In C, what is the purpose of \"Pass by Value\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pass by Value\" is a key concept in C's Functions domain."
    }
  ],
  "c:pointers": [
    {
      "question": "Which of these best describes \"Pointer Basics\" in C?",
      "options": [
        "A core concept covered in Pointers",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Pointer Basics\" is one of the fundamental topics covered in the Pointers section of C."
    },
    {
      "question": "In C, what is the purpose of \"Pointer Arithmetic\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in pointers",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pointer Arithmetic\" is a key concept in C's Pointers domain."
    }
  ],
  "c:arrays-and-strings": [
    {
      "question": "Which of these best describes \"One-Dimensional Arrays\" in C?",
      "options": [
        "A core concept covered in Arrays & Strings",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"One-Dimensional Arrays\" is one of the fundamental topics covered in the Arrays & Strings section of C."
    },
    {
      "question": "In C, what is the purpose of \"Multidimensional Arrays\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in arrays & strings",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Multidimensional Arrays\" is a key concept in C's Arrays & Strings domain."
    }
  ],
  "c:structures-unions-and-enums": [
    {
      "question": "Which of these best describes \"Structs\" in C?",
      "options": [
        "A core concept covered in Structures, Unions & Enums",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Structs\" is one of the fundamental topics covered in the Structures, Unions & Enums section of C."
    },
    {
      "question": "In C, what is the purpose of \"Unions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in structures, unions & enums",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Unions\" is a key concept in C's Structures, Unions & Enums domain."
    }
  ],
  "c:file-i-o": [
    {
      "question": "Which of these best describes \"Opening & Closing Files\" in C?",
      "options": [
        "A core concept covered in File I/O",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Opening & Closing Files\" is one of the fundamental topics covered in the File I/O section of C."
    },
    {
      "question": "In C, what is the purpose of \"Reading & Writing Text\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in file i/o",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Reading & Writing Text\" is a key concept in C's File I/O domain."
    }
  ],
  "c:preprocessor": [
    {
      "question": "Which of these best describes \"Macros (#define)\" in C?",
      "options": [
        "A core concept covered in Preprocessor",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Macros (#define)\" is one of the fundamental topics covered in the Preprocessor section of C."
    },
    {
      "question": "In C, what is the purpose of \"Conditional Compilation\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in preprocessor",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Conditional Compilation\" is a key concept in C's Preprocessor domain."
    }
  ],
  "c:standard-library": [
    {
      "question": "Which of these best describes \"stdlib.h Utilities\" in C?",
      "options": [
        "A core concept covered in Standard Library",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"stdlib.h Utilities\" is one of the fundamental topics covered in the Standard Library section of C."
    },
    {
      "question": "In C, what is the purpose of \"math.h Functions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in standard library",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"math.h Functions\" is a key concept in C's Standard Library domain."
    }
  ],
  "c:advanced-topics": [
    {
      "question": "Which of these best describes \"Linked Lists\" in C?",
      "options": [
        "A core concept covered in Advanced Topics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Linked Lists\" is one of the fundamental topics covered in the Advanced Topics section of C."
    },
    {
      "question": "In C, what is the purpose of \"Debugging with GDB\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced topics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Debugging with GDB\" is a key concept in C's Advanced Topics domain."
    }
  ],
  "c:c-in-practice": [
    {
      "question": "Which of these best describes \"Interactive I/O (getchar/putchar)\" in C?",
      "options": [
        "A core concept covered in C in Practice",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Interactive I/O (getchar/putchar)\" is one of the fundamental topics covered in the C in Practice section of C."
    },
    {
      "question": "In C, what is the purpose of \"Low-Level I/O (UNIX System Interface)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in c in practice",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Low-Level I/O (UNIX System Interface)\" is a key concept in C's C in Practice domain."
    }
  ],
  "c:defensive-c": [
    {
      "question": "Which of these best describes \"Defensive Programming\" in C?",
      "options": [
        "A core concept covered in Defensive C",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Defensive Programming\" is one of the fundamental topics covered in the Defensive C section of C."
    },
    {
      "question": "In C, what is the purpose of \"Three Common Bugs\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in defensive c",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Three Common Bugs\" is a key concept in C's Defensive C domain."
    }
  ],
  "c:build-systems-and-makefiles": [
    {
      "question": "Which of these best describes \"Makefile Basics\" in C?",
      "options": [
        "A core concept covered in Build Systems & Makefiles",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Makefile Basics\" is one of the fundamental topics covered in the Build Systems & Makefiles section of C."
    },
    {
      "question": "In C, what is the purpose of \"Autotools & CMake\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in build systems & makefiles",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Autotools & CMake\" is a key concept in C's Build Systems & Makefiles domain."
    }
  ],
  "c:data-structures": [
    {
      "question": "Which of these best describes \"Linked Lists\" in C?",
      "options": [
        "A core concept covered in Data Structures",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Linked Lists\" is one of the fundamental topics covered in the Data Structures section of C."
    },
    {
      "question": "In C, what is the purpose of \"Hash Tables\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in data structures",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Hash Tables\" is a key concept in C's Data Structures domain."
    }
  ],
  "c:embedded-and-bit-manipulation": [
    {
      "question": "Which of these best describes \"Bitwise Operations\" in C?",
      "options": [
        "A core concept covered in Embedded & Bit Manipulation",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Bitwise Operations\" is one of the fundamental topics covered in the Embedded & Bit Manipulation section of C."
    },
    {
      "question": "In C, what is the purpose of \"Endianness & Binary Protocols\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in embedded & bit manipulation",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Endianness & Binary Protocols\" is a key concept in C's Embedded & Bit Manipulation domain."
    }
  ],
  "c:posix-and-system-programming": [
    {
      "question": "Which of these best describes \"Process Management\" in C?",
      "options": [
        "A core concept covered in POSIX & System Programming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Process Management\" is one of the fundamental topics covered in the POSIX & System Programming section of C."
    },
    {
      "question": "In C, what is the purpose of \"Pipes & IPC\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in posix & system programming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pipes & IPC\" is a key concept in C's POSIX & System Programming domain."
    }
  ],
  "rb:getting-started": [
    {
      "question": "Which of these best describes \"Time, Date & DateTime\" in Ruby?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Time, Date & DateTime\" is one of the fundamental topics covered in the Getting Started section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"IRB & Interactive Ruby\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"IRB & Interactive Ruby\" is a key concept in Ruby's Getting Started domain."
    }
  ],
  "rb:variables-and-types": [
    {
      "question": "Which of these best describes \"Local & Global Variables\" in Ruby?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Local & Global Variables\" is one of the fundamental topics covered in the Variables & Types section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Constants\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Constants\" is a key concept in Ruby's Variables & Types domain."
    }
  ],
  "rb:operators": [
    {
      "question": "Which of these best describes \"Arithmetic\" in Ruby?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic\" is one of the fundamental topics covered in the Operators section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Comparison\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Comparison\" is a key concept in Ruby's Operators domain."
    }
  ],
  "rb:control-flow": [
    {
      "question": "Which of these best describes \"Ternary & Statement Modifiers\" in Ruby?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Ternary & Statement Modifiers\" is one of the fundamental topics covered in the Control Flow section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"if/unless/elsif\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"if/unless/elsif\" is a key concept in Ruby's Control Flow domain."
    }
  ],
  "rb:methods": [
    {
      "question": "Which of these best describes \"Keyword Arguments\" in Ruby?",
      "options": [
        "A core concept covered in Methods",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Keyword Arguments\" is one of the fundamental topics covered in the Methods section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Default Values\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in methods",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Default Values\" is a key concept in Ruby's Methods domain."
    }
  ],
  "rb:procs-and-lambdas": [
    {
      "question": "Which of these best describes \"Blocks & yield\" in Ruby?",
      "options": [
        "A core concept covered in Procs & Lambdas",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Blocks & yield\" is one of the fundamental topics covered in the Procs & Lambdas section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Proc Objects\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in procs & lambdas",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Proc Objects\" is a key concept in Ruby's Procs & Lambdas domain."
    }
  ],
  "rb:enumerables-and-collections": [
    {
      "question": "Which of these best describes \"Enumerable Module\" in Ruby?",
      "options": [
        "A core concept covered in Enumerables & Collections",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Enumerable Module\" is one of the fundamental topics covered in the Enumerables & Collections section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"map/select/reduce Deep Dive\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in enumerables & collections",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"map/select/reduce Deep Dive\" is a key concept in Ruby's Enumerables & Collections domain."
    }
  ],
  "rb:strings-and-regex": [
    {
      "question": "Which of these best describes \"String Methods Deep\" in Ruby?",
      "options": [
        "A core concept covered in Strings & Regex",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"String Methods Deep\" is one of the fundamental topics covered in the Strings & Regex section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Regular Expressions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in strings & regex",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Regular Expressions\" is a key concept in Ruby's Strings & Regex domain."
    }
  ],
  "rb:classes-and-oop": [
    {
      "question": "Which of these best describes \"Singleton Class & Eigenclass\" in Ruby?",
      "options": [
        "A core concept covered in Classes & OOP",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Singleton Class & Eigenclass\" is one of the fundamental topics covered in the Classes & OOP section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Classes & Objects\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in classes & oop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Classes & Objects\" is a key concept in Ruby's Classes & OOP domain."
    }
  ],
  "rb:error-handling": [
    {
      "question": "Which of these best describes \"Exception Hierarchy\" in Ruby?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Exception Hierarchy\" is one of the fundamental topics covered in the Error Handling section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"begin/rescue/ensure\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"begin/rescue/ensure\" is a key concept in Ruby's Error Handling domain."
    }
  ],
  "rb:modules-and-packages": [
    {
      "question": "Which of these best describes \"require/load/autoload\" in Ruby?",
      "options": [
        "A core concept covered in Modules & Packages",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"require/load/autoload\" is one of the fundamental topics covered in the Modules & Packages section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Gems & Gemfile\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modules & packages",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Gems & Gemfile\" is a key concept in Ruby's Modules & Packages domain."
    }
  ],
  "rb:file-i-o": [
    {
      "question": "Which of these best describes \"Tempfile & StringIO\" in Ruby?",
      "options": [
        "A core concept covered in File I/O",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Tempfile & StringIO\" is one of the fundamental topics covered in the File I/O section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Reading & Writing Files\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in file i/o",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Reading & Writing Files\" is a key concept in Ruby's File I/O domain."
    }
  ],
  "rb:metaprogramming": [
    {
      "question": "Which of these best describes \"send & define_method\" in Ruby?",
      "options": [
        "A core concept covered in Metaprogramming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"send & define_method\" is one of the fundamental topics covered in the Metaprogramming section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"method_missing\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in metaprogramming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"method_missing\" is a key concept in Ruby's Metaprogramming domain."
    }
  ],
  "rb:gems-and-bundler": [
    {
      "question": "Which topic is part of Ruby's Gems & Bundler?",
      "options": [
        "RubyGems & Bundler",
        "None of the above"
      ],
      "answer": 0,
      "explanation": "\"RubyGems & Bundler\" is covered in Gems & Bundler."
    },
    {
      "question": "What does Gems & Bundler cover in Ruby?",
      "options": [
        "The basics of RubyGems & Bundler",
        "Only advanced concepts",
        "Network protocols",
        "Database design patterns"
      ],
      "answer": 0,
      "explanation": "Gems & Bundler introduces the core concepts including RubyGems & Bundler."
    }
  ],
  "rb:testing": [
    {
      "question": "Which of these best describes \"Minitest & RSpec\" in Ruby?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Minitest & RSpec\" is one of the fundamental topics covered in the Testing section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"RSpec describe/it/expect\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"RSpec describe/it/expect\" is a key concept in Ruby's Testing domain."
    }
  ],
  "rb:concurrency-and-parallelism": [
    {
      "question": "Which of these best describes \"Thread Safety & Mutex\" in Ruby?",
      "options": [
        "A core concept covered in Concurrency & Parallelism",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Thread Safety & Mutex\" is one of the fundamental topics covered in the Concurrency & Parallelism section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Ractors (Ruby 3+)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in concurrency & parallelism",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Ractors (Ruby 3+)\" is a key concept in Ruby's Concurrency & Parallelism domain."
    }
  ],
  "rb:web-development": [
    {
      "question": "Which of these best describes \"Rack & Middleware\" in Ruby?",
      "options": [
        "A core concept covered in Web Development",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Rack & Middleware\" is one of the fundamental topics covered in the Web Development section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Sinatra Deep Dive\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in web development",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Sinatra Deep Dive\" is a key concept in Ruby's Web Development domain."
    }
  ],
  "rb:database-and-persistence": [
    {
      "question": "Which of these best describes \"ActiveRecord ORM\" in Ruby?",
      "options": [
        "A core concept covered in Database & Persistence",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"ActiveRecord ORM\" is one of the fundamental topics covered in the Database & Persistence section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Sequel Gem\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in database & persistence",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Sequel Gem\" is a key concept in Ruby's Database & Persistence domain."
    }
  ],
  "rb:tools-and-best-practices": [
    {
      "question": "Which of these best describes \"RuboCop & Linting\" in Ruby?",
      "options": [
        "A core concept covered in Tools & Best Practices",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"RuboCop & Linting\" is one of the fundamental topics covered in the Tools & Best Practices section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Debugging with Pry\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in tools & best practices",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Debugging with Pry\" is a key concept in Ruby's Tools & Best Practices domain."
    }
  ],
  "rb:advanced-ruby": [
    {
      "question": "Which of these best describes \"Threads & Fibers\" in Ruby?",
      "options": [
        "A core concept covered in Advanced Ruby",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Threads & Fibers\" is one of the fundamental topics covered in the Advanced Ruby section of Ruby."
    },
    {
      "question": "In Ruby, what is the purpose of \"Rake Tasks\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced ruby",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Rake Tasks\" is a key concept in Ruby's Advanced Ruby domain."
    }
  ],
  "php:getting-started": [
    {
      "question": "Which of these best describes \"What is PHP\" in PHP?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is PHP\" is one of the fundamental topics covered in the Getting Started section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"PHP Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"PHP Syntax\" is a key concept in PHP's Getting Started domain."
    }
  ],
  "php:control-flow": [
    {
      "question": "Which of these best describes \"declare & Ticks\" in PHP?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"declare & Ticks\" is one of the fundamental topics covered in the Control Flow section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"goto & Labels\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"goto & Labels\" is a key concept in PHP's Control Flow domain."
    }
  ],
  "php:functions": [
    {
      "question": "Which of these best describes \"Arrow Functions Deep\" in PHP?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arrow Functions Deep\" is one of the fundamental topics covered in the Functions section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Variadic Params & Spread\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Variadic Params & Spread\" is a key concept in PHP's Functions domain."
    }
  ],
  "php:arrays-and-data-structures": [
    {
      "question": "Which of these best describes \"Indexed Arrays\" in PHP?",
      "options": [
        "A core concept covered in Arrays & Data Structures",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Indexed Arrays\" is one of the fundamental topics covered in the Arrays & Data Structures section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Associative Arrays\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in arrays & data structures",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Associative Arrays\" is a key concept in PHP's Arrays & Data Structures domain."
    }
  ],
  "php:oop": [
    {
      "question": "Which of these best describes \"Magic Methods\" in PHP?",
      "options": [
        "A core concept covered in OOP",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Magic Methods\" is one of the fundamental topics covered in the OOP section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Abstract Classes & Late Static Binding\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in oop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Abstract Classes & Late Static Binding\" is a key concept in PHP's OOP domain."
    }
  ],
  "php:file-handling": [
    {
      "question": "Which of these best describes \"Reading Files\" in PHP?",
      "options": [
        "A core concept covered in File Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Reading Files\" is one of the fundamental topics covered in the File Handling section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Writing Files\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in file handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Writing Files\" is a key concept in PHP's File Handling domain."
    }
  ],
  "php:forms-and-user-input": [
    {
      "question": "Which of these best describes \"GET & POST\" in PHP?",
      "options": [
        "A core concept covered in Forms & User Input",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"GET & POST\" is one of the fundamental topics covered in the Forms & User Input section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Input Validation\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in forms & user input",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Input Validation\" is a key concept in PHP's Forms & User Input domain."
    }
  ],
  "php:databases": [
    {
      "question": "Which of these best describes \"PDO Connection\" in PHP?",
      "options": [
        "A core concept covered in Databases",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"PDO Connection\" is one of the fundamental topics covered in the Databases section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Prepared Statements\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in databases",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Prepared Statements\" is a key concept in PHP's Databases domain."
    }
  ],
  "php:error-handling": [
    {
      "question": "Which of these best describes \"Exceptions\" in PHP?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Exceptions\" is one of the fundamental topics covered in the Error Handling section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Error Reporting\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Error Reporting\" is a key concept in PHP's Error Handling domain."
    }
  ],
  "php:variables-and-types": [
    {
      "question": "Which of these best describes \"Type Declarations & Coercion\" in PHP?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Type Declarations & Coercion\" is one of the fundamental topics covered in the Variables & Types section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Null & falsy Handling\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Null & falsy Handling\" is a key concept in PHP's Variables & Types domain."
    }
  ],
  "php:operators": [
    {
      "question": "Which of these best describes \"Arithmetic & Assignment\" in PHP?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic & Assignment\" is one of the fundamental topics covered in the Operators section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Comparison & Spaceship\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Comparison & Spaceship\" is a key concept in PHP's Operators domain."
    }
  ],
  "php:strings-and-text": [
    {
      "question": "Which of these best describes \"String Functions\" in PHP?",
      "options": [
        "A core concept covered in Strings & Text",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"String Functions\" is one of the fundamental topics covered in the Strings & Text section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"sprintf & printf\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in strings & text",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"sprintf & printf\" is a key concept in PHP's Strings & Text domain."
    }
  ],
  "php:testing": [
    {
      "question": "Which of these best describes \"PHPUnit Setup\" in PHP?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"PHPUnit Setup\" is one of the fundamental topics covered in the Testing section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"Pest Framework\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pest Framework\" is a key concept in PHP's Testing domain."
    }
  ],
  "php:security-and-performance": [
    {
      "question": "Which of these best describes \"SQL Injection Prevention\" in PHP?",
      "options": [
        "A core concept covered in Security & Performance",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"SQL Injection Prevention\" is one of the fundamental topics covered in the Security & Performance section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"CSRF & Session Security\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in security & performance",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"CSRF & Session Security\" is a key concept in PHP's Security & Performance domain."
    }
  ],
  "php:date-and-time": [
    {
      "question": "Which of these best describes \"DateTime Class\" in PHP?",
      "options": [
        "A core concept covered in Date & Time",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"DateTime Class\" is one of the fundamental topics covered in the Date & Time section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"DateInterval & Period\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in date & time",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"DateInterval & Period\" is a key concept in PHP's Date & Time domain."
    }
  ],
  "php:modern-php-and-ecosystem": [
    {
      "question": "Which of these best describes \"Composer & Autoloading\" in PHP?",
      "options": [
        "A core concept covered in Modern PHP & Ecosystem",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Composer & Autoloading\" is one of the fundamental topics covered in the Modern PHP & Ecosystem section of PHP."
    },
    {
      "question": "In PHP, what is the purpose of \"PSR Standards\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modern php & ecosystem",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"PSR Standards\" is a key concept in PHP's Modern PHP & Ecosystem domain."
    }
  ],
  "swift:getting-started": [
    {
      "question": "Which of these best describes \"What is Swift\" in Swift?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Swift\" is one of the fundamental topics covered in the Getting Started section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Swift Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Swift Syntax\" is a key concept in Swift's Getting Started domain."
    }
  ],
  "swift:variables-and-types": [
    {
      "question": "Which of these best describes \"Type Inference\" in Swift?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Type Inference\" is one of the fundamental topics covered in the Variables & Types section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Type Safety\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Type Safety\" is a key concept in Swift's Variables & Types domain."
    }
  ],
  "swift:control-flow": [
    {
      "question": "Which of these best describes \"if / else\" in Swift?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if / else\" is one of the fundamental topics covered in the Control Flow section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"switch\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"switch\" is a key concept in Swift's Control Flow domain."
    }
  ],
  "swift:functions": [
    {
      "question": "Which of these best describes \"Function Declaration\" in Swift?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Declaration\" is one of the fundamental topics covered in the Functions section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Closures\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Closures\" is a key concept in Swift's Functions domain."
    }
  ],
  "swift:optionals": [
    {
      "question": "Which of these best describes \"Optional Basics\" in Swift?",
      "options": [
        "A core concept covered in Optionals",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Optional Basics\" is one of the fundamental topics covered in the Optionals section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Optional Chaining\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in optionals",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Optional Chaining\" is a key concept in Swift's Optionals domain."
    }
  ],
  "swift:collections": [
    {
      "question": "Which of these best describes \"Arrays\" in Swift?",
      "options": [
        "A core concept covered in Collections",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arrays\" is one of the fundamental topics covered in the Collections section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Sets\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in collections",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Sets\" is a key concept in Swift's Collections domain."
    }
  ],
  "swift:structs-and-classes": [
    {
      "question": "Which of these best describes \"Structs Deep\" in Swift?",
      "options": [
        "A core concept covered in Structs & Classes",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Structs Deep\" is one of the fundamental topics covered in the Structs & Classes section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Classes Deep\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in structs & classes",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Classes Deep\" is a key concept in Swift's Structs & Classes domain."
    }
  ],
  "swift:protocols-and-extensions": [
    {
      "question": "Which of these best describes \"Protocols\" in Swift?",
      "options": [
        "A core concept covered in Protocols & Extensions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Protocols\" is one of the fundamental topics covered in the Protocols & Extensions section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Extensions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in protocols & extensions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Extensions\" is a key concept in Swift's Protocols & Extensions domain."
    }
  ],
  "swift:enums": [
    {
      "question": "Which of these best describes \"Enum Basics\" in Swift?",
      "options": [
        "A core concept covered in Enums",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Enum Basics\" is one of the fundamental topics covered in the Enums section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Associated Values\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in enums",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Associated Values\" is a key concept in Swift's Enums domain."
    }
  ],
  "swift:error-handling": [
    {
      "question": "Which of these best describes \"do / try / catch\" in Swift?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"do / try / catch\" is one of the fundamental topics covered in the Error Handling section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"try? & try! Deep\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"try? & try! Deep\" is a key concept in Swift's Error Handling domain."
    }
  ],
  "swift:generics": [
    {
      "question": "Which of these best describes \"Generic Functions\" in Swift?",
      "options": [
        "A core concept covered in Generics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Generic Functions\" is one of the fundamental topics covered in the Generics section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Generic Types\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in generics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Generic Types\" is a key concept in Swift's Generics domain."
    }
  ],
  "swift:advanced-swift": [
    {
      "question": "Which of these best describes \"KeyPaths\" in Swift?",
      "options": [
        "A core concept covered in Advanced Swift",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"KeyPaths\" is one of the fundamental topics covered in the Advanced Swift section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Dynamic Member Lookup\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced swift",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Dynamic Member Lookup\" is a key concept in Swift's Advanced Swift domain."
    }
  ],
  "swift:concurrency": [
    {
      "question": "Which of these best describes \"async/await\" in Swift?",
      "options": [
        "A core concept covered in Concurrency",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"async/await\" is one of the fundamental topics covered in the Concurrency section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Actors Deep\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in concurrency",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Actors Deep\" is a key concept in Swift's Concurrency domain."
    }
  ],
  "swift:memory": [
    {
      "question": "Which of these best describes \"ARC Deep\" in Swift?",
      "options": [
        "A core concept covered in Memory",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"ARC Deep\" is one of the fundamental topics covered in the Memory section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Strong Reference Cycles\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in memory",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Strong Reference Cycles\" is a key concept in Swift's Memory domain."
    }
  ],
  "swift:swift-package-manager": [
    {
      "question": "Which of these best describes \"Package.swift\" in Swift?",
      "options": [
        "A core concept covered in Swift Package Manager",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Package.swift\" is one of the fundamental topics covered in the Swift Package Manager section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Package Structure\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in swift package manager",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Package Structure\" is a key concept in Swift's Swift Package Manager domain."
    }
  ],
  "swift:protocol-oriented-programming": [
    {
      "question": "Which of these best describes \"POP Principles\" in Swift?",
      "options": [
        "A core concept covered in Protocol-Oriented Programming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"POP Principles\" is one of the fundamental topics covered in the Protocol-Oriented Programming section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Protocol Inheritance & Composition\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in protocol-oriented programming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Protocol Inheritance & Composition\" is a key concept in Swift's Protocol-Oriented Programming domain."
    }
  ],
  "swift:swift-in-practice": [
    {
      "question": "Which of these best describes \"Access Control\" in Swift?",
      "options": [
        "A core concept covered in Swift in Practice",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Access Control\" is one of the fundamental topics covered in the Swift in Practice section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"URLSession & Networking\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in swift in practice",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"URLSession & Networking\" is a key concept in Swift's Swift in Practice domain."
    }
  ],
  "swift:swiftui-basics": [
    {
      "question": "Which of these best describes \"View Protocol\" in Swift?",
      "options": [
        "A core concept covered in SwiftUI Basics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"View Protocol\" is one of the fundamental topics covered in the SwiftUI Basics section of Swift."
    },
    {
      "question": "In Swift, what is the purpose of \"Modifiers\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in swiftui basics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Modifiers\" is a key concept in Swift's SwiftUI Basics domain."
    }
  ],
  "scala:getting-started": [
    {
      "question": "Which of these best describes \"What is Scala\" in Scala?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Scala\" is one of the fundamental topics covered in the Getting Started section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Scala Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Scala Syntax\" is a key concept in Scala's Getting Started domain."
    }
  ],
  "scala:control-flow": [
    {
      "question": "Which of these best describes \"If Expressions\" in Scala?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"If Expressions\" is one of the fundamental topics covered in the Control Flow section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Match Expressions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Match Expressions\" is a key concept in Scala's Control Flow domain."
    }
  ],
  "scala:functions": [
    {
      "question": "Which of these best describes \"Method Declaration\" in Scala?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Method Declaration\" is one of the fundamental topics covered in the Functions section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Default & Named Args\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Default & Named Args\" is a key concept in Scala's Functions domain."
    }
  ],
  "scala:collections": [
    {
      "question": "Which of these best describes \"Lists\" in Scala?",
      "options": [
        "A core concept covered in Collections",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Lists\" is one of the fundamental topics covered in the Collections section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Maps & Sets\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in collections",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Maps & Sets\" is a key concept in Scala's Collections domain."
    }
  ],
  "scala:object-oriented-scala": [
    {
      "question": "Which of these best describes \"Classes & Constructors\" in Scala?",
      "options": [
        "A core concept covered in Object-Oriented Scala",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Classes & Constructors\" is one of the fundamental topics covered in the Object-Oriented Scala section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Objects & Companions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in object-oriented scala",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Objects & Companions\" is a key concept in Scala's Object-Oriented Scala domain."
    }
  ],
  "scala:pattern-matching": [
    {
      "question": "Which of these best describes \"Case Matching\" in Scala?",
      "options": [
        "A core concept covered in Pattern Matching",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Case Matching\" is one of the fundamental topics covered in the Pattern Matching section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Pattern Guards\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in pattern matching",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pattern Guards\" is a key concept in Scala's Pattern Matching domain."
    }
  ],
  "scala:functional-programming": [
    {
      "question": "Which of these best describes \"Immutability\" in Scala?",
      "options": [
        "A core concept covered in Functional Programming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Immutability\" is one of the fundamental topics covered in the Functional Programming section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Pure Functions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functional programming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pure Functions\" is a key concept in Scala's Functional Programming domain."
    }
  ],
  "scala:generics-and-variance": [
    {
      "question": "Which of these best describes \"Generic Classes & Methods\" in Scala?",
      "options": [
        "A core concept covered in Generics & Variance",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Generic Classes & Methods\" is one of the fundamental topics covered in the Generics & Variance section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Variance Annotations\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in generics & variance",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Variance Annotations\" is a key concept in Scala's Generics & Variance domain."
    }
  ],
  "scala:concurrency-and-futures": [
    {
      "question": "Which of these best describes \"Future Basics\" in Scala?",
      "options": [
        "A core concept covered in Concurrency & Futures",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Future Basics\" is one of the fundamental topics covered in the Concurrency & Futures section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Promise & Async\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in concurrency & futures",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Promise & Async\" is a key concept in Scala's Concurrency & Futures domain."
    }
  ],
  "scala:build-and-tooling": [
    {
      "question": "Which of these best describes \"sbt Basics\" in Scala?",
      "options": [
        "A core concept covered in Build & Tooling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"sbt Basics\" is one of the fundamental topics covered in the Build & Tooling section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Scala CLI\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in build & tooling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Scala CLI\" is a key concept in Scala's Build & Tooling domain."
    }
  ],
  "scala:scala-3-features": [
    {
      "question": "Which of these best describes \"Indentation Syntax\" in Scala?",
      "options": [
        "A core concept covered in Scala 3 Features",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Indentation Syntax\" is one of the fundamental topics covered in the Scala 3 Features section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Union & Intersection Types\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in scala 3 features",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Union & Intersection Types\" is a key concept in Scala's Scala 3 Features domain."
    }
  ],
  "scala:variables-and-data-types": [
    {
      "question": "Which of these best describes \"Literals & String Interpolation\" in Scala?",
      "options": [
        "A core concept covered in Variables & Data Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Literals & String Interpolation\" is one of the fundamental topics covered in the Variables & Data Types section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Numeric Types & Conversions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & data types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Numeric Types & Conversions\" is a key concept in Scala's Variables & Data Types domain."
    }
  ],
  "scala:error-handling": [
    {
      "question": "Which of these best describes \"Try & Recovery\" in Scala?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Try & Recovery\" is one of the fundamental topics covered in the Error Handling section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Either & Validated\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Either & Validated\" is a key concept in Scala's Error Handling domain."
    }
  ],
  "scala:strings-and-text-processing": [
    {
      "question": "Which of these best describes \"String Operations\" in Scala?",
      "options": [
        "A core concept covered in Strings & Text Processing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"String Operations\" is one of the fundamental topics covered in the Strings & Text Processing section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Regular Expressions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in strings & text processing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Regular Expressions\" is a key concept in Scala's Strings & Text Processing domain."
    }
  ],
  "scala:i-o-and-file-handling": [
    {
      "question": "Which of these best describes \"File I/O Basics\" in Scala?",
      "options": [
        "A core concept covered in I/O & File Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"File I/O Basics\" is one of the fundamental topics covered in the I/O & File Handling section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Java NIO & Channels\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in i/o & file handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Java NIO & Channels\" is a key concept in Scala's I/O & File Handling domain."
    }
  ],
  "scala:testing": [
    {
      "question": "Which of these best describes \"Property-Based Testing\" in Scala?",
      "options": [
        "A core concept covered in Testing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Property-Based Testing\" is one of the fundamental topics covered in the Testing section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Mocking & Stubbing\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in testing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Mocking & Stubbing\" is a key concept in Scala's Testing domain."
    }
  ],
  "scala:standard-library": [
    {
      "question": "Which of these best describes \"Collections Hierarchy\" in Scala?",
      "options": [
        "A core concept covered in Standard Library",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Collections Hierarchy\" is one of the fundamental topics covered in the Standard Library section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Date & Time API\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in standard library",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Date & Time API\" is a key concept in Scala's Standard Library domain."
    }
  ],
  "scala:implicits-and-type-classes": [
    {
      "question": "Which of these best describes \"Implicit Conversions\" in Scala?",
      "options": [
        "A core concept covered in Implicits & Type Classes",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Implicit Conversions\" is one of the fundamental topics covered in the Implicits & Type Classes section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Implicit Resolution & Scope\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in implicits & type classes",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Implicit Resolution & Scope\" is a key concept in Scala's Implicits & Type Classes domain."
    }
  ],
  "scala:performance-and-optimization": [
    {
      "question": "Which of these best describes \"Profiling & Benchmarking\" in Scala?",
      "options": [
        "A core concept covered in Performance & Optimization",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Profiling & Benchmarking\" is one of the fundamental topics covered in the Performance & Optimization section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Memory & GC Tuning\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in performance & optimization",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Memory & GC Tuning\" is a key concept in Scala's Performance & Optimization domain."
    }
  ],
  "scala:java-interoperability": [
    {
      "question": "Which of these best describes \"Calling Java from Scala\" in Scala?",
      "options": [
        "A core concept covered in Java Interoperability",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Calling Java from Scala\" is one of the fundamental topics covered in the Java Interoperability section of Scala."
    },
    {
      "question": "In Scala, what is the purpose of \"Scala from Java\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in java interoperability",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Scala from Java\" is a key concept in Scala's Java Interoperability domain."
    }
  ],
  "lua:getting-started": [
    {
      "question": "Which of these best describes \"What is Lua\" in Lua?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Lua\" is one of the fundamental topics covered in the Getting Started section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Lua Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Lua Syntax\" is a key concept in Lua's Getting Started domain."
    }
  ],
  "lua:variables-and-types": [
    {
      "question": "Which of these best describes \"Dynamic Typing\" in Lua?",
      "options": [
        "A core concept covered in Variables & Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Dynamic Typing\" is one of the fundamental topics covered in the Variables & Types section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"nil\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"nil\" is a key concept in Lua's Variables & Types domain."
    }
  ],
  "lua:operators": [
    {
      "question": "Which of these best describes \"Arithmetic\" in Lua?",
      "options": [
        "A core concept covered in Operators",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Arithmetic\" is one of the fundamental topics covered in the Operators section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Relational\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in operators",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Relational\" is a key concept in Lua's Operators domain."
    }
  ],
  "lua:control-flow": [
    {
      "question": "Which of these best describes \"if/elseif/else\" in Lua?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if/elseif/else\" is one of the fundamental topics covered in the Control Flow section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"while\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"while\" is a key concept in Lua's Control Flow domain."
    }
  ],
  "lua:tables-arrays": [
    {
      "question": "Which of these best describes \"Table Basics\" in Lua?",
      "options": [
        "A core concept covered in Tables (Arrays)",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Table Basics\" is one of the fundamental topics covered in the Tables (Arrays) section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Constructors\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in tables (arrays)",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Constructors\" is a key concept in Lua's Tables (Arrays) domain."
    }
  ],
  "lua:tables-dictionaries": [
    {
      "question": "Which of these best describes \"Dictionary-style Tables\" in Lua?",
      "options": [
        "A core concept covered in Tables (Dictionaries)",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Dictionary-style Tables\" is one of the fundamental topics covered in the Tables (Dictionaries) section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Nested Tables\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in tables (dictionaries)",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Nested Tables\" is a key concept in Lua's Tables (Dictionaries) domain."
    }
  ],
  "lua:functions": [
    {
      "question": "Which of these best describes \"Function Definition\" in Lua?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Definition\" is one of the fundamental topics covered in the Functions section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Return Values\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Return Values\" is a key concept in Lua's Functions domain."
    }
  ],
  "lua:string-handling": [
    {
      "question": "Which of these best describes \"String Basics\" in Lua?",
      "options": [
        "A core concept covered in String Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"String Basics\" is one of the fundamental topics covered in the String Handling section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Concatenation\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in string handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Concatenation\" is a key concept in Lua's String Handling domain."
    }
  ],
  "lua:input-and-output": [
    {
      "question": "Which of these best describes \"print vs io.write\" in Lua?",
      "options": [
        "A core concept covered in Input & Output",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"print vs io.write\" is one of the fundamental topics covered in the Input & Output section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"io.read\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in input & output",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"io.read\" is a key concept in Lua's Input & Output domain."
    }
  ],
  "lua:modules-and-packages": [
    {
      "question": "Which of these best describes \"require\" in Lua?",
      "options": [
        "A core concept covered in Modules & Packages",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"require\" is one of the fundamental topics covered in the Modules & Packages section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Module Pattern\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in modules & packages",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Module Pattern\" is a key concept in Lua's Modules & Packages domain."
    }
  ],
  "lua:metatables-and-oop": [
    {
      "question": "Which of these best describes \"Metatables\" in Lua?",
      "options": [
        "A core concept covered in Metatables & OOP",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Metatables\" is one of the fundamental topics covered in the Metatables & OOP section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"__index\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in metatables & oop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"__index\" is a key concept in Lua's Metatables & OOP domain."
    }
  ],
  "lua:coroutines": [
    {
      "question": "Which of these best describes \"coroutine.create/resume/yield\" in Lua?",
      "options": [
        "A core concept covered in Coroutines",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"coroutine.create/resume/yield\" is one of the fundamental topics covered in the Coroutines section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"coroutine.status\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in coroutines",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"coroutine.status\" is a key concept in Lua's Coroutines domain."
    }
  ],
  "lua:error-handling": [
    {
      "question": "Which of these best describes \"pcall\" in Lua?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"pcall\" is one of the fundamental topics covered in the Error Handling section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"xpcall\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"xpcall\" is a key concept in Lua's Error Handling domain."
    }
  ],
  "lua:standard-libraries": [
    {
      "question": "Which of these best describes \"math\" in Lua?",
      "options": [
        "A core concept covered in Standard Libraries",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"math\" is one of the fundamental topics covered in the Standard Libraries section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"os\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in standard libraries",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"os\" is a key concept in Lua's Standard Libraries domain."
    }
  ],
  "lua:advanced-topics": [
    {
      "question": "Which of these best describes \"Weak Tables\" in Lua?",
      "options": [
        "A core concept covered in Advanced Topics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Weak Tables\" is one of the fundamental topics covered in the Advanced Topics section of Lua."
    },
    {
      "question": "In Lua, what is the purpose of \"Garbage Collection\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced topics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Garbage Collection\" is a key concept in Lua's Advanced Topics domain."
    }
  ],
  "zig:getting-started": [
    {
      "question": "Which of these best describes \"Install Zig\" in Zig?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Install Zig\" is one of the fundamental topics covered in the Getting Started section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"zig init-exe\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"zig init-exe\" is a key concept in Zig's Getting Started domain."
    }
  ],
  "zig:types": [
    {
      "question": "Which of these best describes \"Integer Types\" in Zig?",
      "options": [
        "A core concept covered in Types",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Integer Types\" is one of the fundamental topics covered in the Types section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"Floats\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in types",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Floats\" is a key concept in Zig's Types domain."
    }
  ],
  "zig:variables-and-constants": [
    {
      "question": "Which of these best describes \"const vs var\" in Zig?",
      "options": [
        "A core concept covered in Variables & Constants",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"const vs var\" is one of the fundamental topics covered in the Variables & Constants section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"Comptime Constants\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in variables & constants",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Comptime Constants\" is a key concept in Zig's Variables & Constants domain."
    }
  ],
  "zig:control-flow": [
    {
      "question": "Which of these best describes \"if Expressions\" in Zig?",
      "options": [
        "A core concept covered in Control Flow",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"if Expressions\" is one of the fundamental topics covered in the Control Flow section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"while with continue expressions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in control flow",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"while with continue expressions\" is a key concept in Zig's Control Flow domain."
    }
  ],
  "zig:functions": [
    {
      "question": "Which of these best describes \"Function Basics\" in Zig?",
      "options": [
        "A core concept covered in Functions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Function Basics\" is one of the fundamental topics covered in the Functions section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"Function Pointers\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in functions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Function Pointers\" is a key concept in Zig's Functions domain."
    }
  ],
  "zig:arrays-slices-and-strings": [
    {
      "question": "Which of these best describes \"Multi-dimensional Arrays\" in Zig?",
      "options": [
        "A core concept covered in Arrays, Slices & Strings",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Multi-dimensional Arrays\" is one of the fundamental topics covered in the Arrays, Slices & Strings section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"Sentinel Arrays\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in arrays, slices & strings",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Sentinel Arrays\" is a key concept in Zig's Arrays, Slices & Strings domain."
    }
  ],
  "zig:pointers-and-memory": [
    {
      "question": "Which of these best describes \"Many-item Pointers\" in Zig?",
      "options": [
        "A core concept covered in Pointers & Memory",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Many-item Pointers\" is one of the fundamental topics covered in the Pointers & Memory section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"Pointer Alignment\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in pointers & memory",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Pointer Alignment\" is a key concept in Zig's Pointers & Memory domain."
    }
  ],
  "zig:error-handling": [
    {
      "question": "Which of these best describes \"Error Sets\" in Zig?",
      "options": [
        "A core concept covered in Error Handling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Error Sets\" is one of the fundamental topics covered in the Error Handling section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"Error Union Inference\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in error handling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Error Union Inference\" is a key concept in Zig's Error Handling domain."
    }
  ],
  "zig:optionals": [
    {
      "question": "Which of these best describes \"orelse & Unwrap\" in Zig?",
      "options": [
        "A core concept covered in Optionals",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"orelse & Unwrap\" is one of the fundamental topics covered in the Optionals section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"if Capture\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in optionals",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"if Capture\" is a key concept in Zig's Optionals domain."
    }
  ],
  "zig:comptime": [
    {
      "question": "Which of these best describes \"Compile-time Parameters\" in Zig?",
      "options": [
        "A core concept covered in Comptime",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Compile-time Parameters\" is one of the fundamental topics covered in the Comptime section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"Compile-time Variables\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in comptime",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Compile-time Variables\" is a key concept in Zig's Comptime domain."
    }
  ],
  "zig:structs-and-unions": [
    {
      "question": "Which of these best describes \"packed Structs\" in Zig?",
      "options": [
        "A core concept covered in Structs & Unions",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"packed Structs\" is one of the fundamental topics covered in the Structs & Unions section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"extern Structs\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in structs & unions",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"extern Structs\" is a key concept in Zig's Structs & Unions domain."
    }
  ],
  "zig:standard-library": [
    {
      "question": "Which of these best describes \"ArrayList\" in Zig?",
      "options": [
        "A core concept covered in Standard Library",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"ArrayList\" is one of the fundamental topics covered in the Standard Library section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"AutoHashMap\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in standard library",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"AutoHashMap\" is a key concept in Zig's Standard Library domain."
    }
  ],
  "zig:advanced": [
    {
      "question": "Which of these best describes \"Async / Await Deep Dive\" in Zig?",
      "options": [
        "A core concept covered in Advanced",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Async / Await Deep Dive\" is one of the fundamental topics covered in the Advanced section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"@cImport in Depth\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"@cImport in Depth\" is a key concept in Zig's Advanced domain."
    }
  ],
  "zig:zig-in-practice-ziglang-org-learn": [
    {
      "question": "Which of these best describes \"Testing with zig test\" in Zig?",
      "options": [
        "A core concept covered in Zig in Practice (ziglang.org/learn)",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Testing with zig test\" is one of the fundamental topics covered in the Zig in Practice (ziglang.org/learn) section of Zig."
    },
    {
      "question": "In Zig, what is the purpose of \"build.zig.zon Package Manager\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in zig in practice (ziglang.org/learn)",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"build.zig.zon Package Manager\" is a key concept in Zig's Zig in Practice (ziglang.org/learn) domain."
    }
  ],
  "asm:number-systems-and-data-representation": [
    {
      "question": "Which of these best describes \"Binary Numbers\" in Assembly?",
      "options": [
        "A core concept covered in Number Systems and Data Representation",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Binary Numbers\" is one of the fundamental topics covered in the Number Systems and Data Representation section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Hexadecimal System\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in number systems and data representation",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Hexadecimal System\" is a key concept in Assembly's Number Systems and Data Representation domain."
    }
  ],
  "asm:getting-started-with-assembly": [
    {
      "question": "Which of these best describes \"Environment Setup\" in Assembly?",
      "options": [
        "A core concept covered in Getting Started with Assembly",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Environment Setup\" is one of the fundamental topics covered in the Getting Started with Assembly section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Basic NASM Syntax\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started with assembly",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Basic NASM Syntax\" is a key concept in Assembly's Getting Started with Assembly domain."
    }
  ],
  "asm:x64-architecture-and-registers": [
    {
      "question": "Which of these best describes \"CPU Architecture Overview\" in Assembly?",
      "options": [
        "A core concept covered in x64 Architecture and Registers",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"CPU Architecture Overview\" is one of the fundamental topics covered in the x64 Architecture and Registers section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"General Purpose Registers\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in x64 architecture and registers",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"General Purpose Registers\" is a key concept in Assembly's x64 Architecture and Registers domain."
    }
  ],
  "asm:nasm-assembly-basics": [
    {
      "question": "Which of these best describes \"Hello World\" in Assembly?",
      "options": [
        "A core concept covered in NASM Assembly Basics",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Hello World\" is one of the fundamental topics covered in the NASM Assembly Basics section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Data Types and Directives\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in nasm assembly basics",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Data Types and Directives\" is a key concept in Assembly's NASM Assembly Basics domain."
    }
  ],
  "asm:procedures-and-the-stack": [
    {
      "question": "Which of these best describes \"CALL and RET\" in Assembly?",
      "options": [
        "A core concept covered in Procedures and the Stack",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"CALL and RET\" is one of the fundamental topics covered in the Procedures and the Stack section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Passing Arguments\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in procedures and the stack",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Passing Arguments\" is a key concept in Assembly's Procedures and the Stack domain."
    }
  ],
  "asm:condition-codes-and-logical-operations": [
    {
      "question": "Which of these best describes \"Flag Register\" in Assembly?",
      "options": [
        "A core concept covered in Condition Codes and Logical Operations",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Flag Register\" is one of the fundamental topics covered in the Condition Codes and Logical Operations section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Comparison and TEST\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in condition codes and logical operations",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Comparison and TEST\" is a key concept in Assembly's Condition Codes and Logical Operations domain."
    }
  ],
  "asm:strings-and-data-structures": [
    {
      "question": "Which of these best describes \"String Instructions\" in Assembly?",
      "options": [
        "A core concept covered in Strings and Data Structures",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"String Instructions\" is one of the fundamental topics covered in the Strings and Data Structures section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Arrays and Addressing\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in strings and data structures",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Arrays and Addressing\" is a key concept in Assembly's Strings and Data Structures domain."
    }
  ],
  "asm:floating-point-and-simd": [
    {
      "question": "Which of these best describes \"x87 Floating Point\" in Assembly?",
      "options": [
        "A core concept covered in Floating Point and SIMD",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"x87 Floating Point\" is one of the fundamental topics covered in the Floating Point and SIMD section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"SSE Scalar Operations\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in floating point and simd",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"SSE Scalar Operations\" is a key concept in Assembly's Floating Point and SIMD domain."
    }
  ],
  "asm:interfacing-with-c-and-linux": [
    {
      "question": "Which of these best describes \"Linux System Calls\" in Assembly?",
      "options": [
        "A core concept covered in Interfacing with C and Linux",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Linux System Calls\" is one of the fundamental topics covered in the Interfacing with C and Linux section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Calling C Library Functions\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in interfacing with c and linux",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Calling C Library Functions\" is a key concept in Assembly's Interfacing with C and Linux domain."
    }
  ],
  "asm:advanced-topics-and-optimization": [
    {
      "question": "Which of these best describes \"Performance Optimization\" in Assembly?",
      "options": [
        "A core concept covered in Advanced Topics and Optimization",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Performance Optimization\" is one of the fundamental topics covered in the Advanced Topics and Optimization section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Inline Assembly (GCC)\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in advanced topics and optimization",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Inline Assembly (GCC)\" is a key concept in Assembly's Advanced Topics and Optimization domain."
    }
  ],
  "asm:macros-and-preprocessing": [
    {
      "question": "Which of these best describes \"Multi-Line Macros\" in Assembly?",
      "options": [
        "A core concept covered in Macros & Preprocessing",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Multi-Line Macros\" is one of the fundamental topics covered in the Macros & Preprocessing section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Conditional Assembly\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in macros & preprocessing",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Conditional Assembly\" is a key concept in Assembly's Macros & Preprocessing domain."
    }
  ],
  "asm:debugging-and-profiling": [
    {
      "question": "Which of these best describes \"GDB Advanced Techniques\" in Assembly?",
      "options": [
        "A core concept covered in Debugging & Profiling",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"GDB Advanced Techniques\" is one of the fundamental topics covered in the Debugging & Profiling section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Profiling & Performance Counters\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in debugging & profiling",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Profiling & Performance Counters\" is a key concept in Assembly's Debugging & Profiling domain."
    }
  ],
  "asm:crypto-and-security": [
    {
      "question": "Which of these best describes \"AES-NI Instructions\" in Assembly?",
      "options": [
        "A core concept covered in Crypto & Security",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"AES-NI Instructions\" is one of the fundamental topics covered in the Crypto & Security section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Constant-Time Code\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in crypto & security",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Constant-Time Code\" is a key concept in Assembly's Crypto & Security domain."
    }
  ],
  "asm:system-programming": [
    {
      "question": "Which of these best describes \"Signal Handling\" in Assembly?",
      "options": [
        "A core concept covered in System Programming",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Signal Handling\" is one of the fundamental topics covered in the System Programming section of Assembly."
    },
    {
      "question": "In Assembly, what is the purpose of \"Process Creation & Syscalls\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in system programming",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Process Creation & Syscalls\" is a key concept in Assembly's System Programming domain."
    }
  ],
  "dk:getting-started": [
    {
      "question": "Which of these best describes \"What is Docker\" in Dart?",
      "options": [
        "A core concept covered in Getting Started",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"What is Docker\" is one of the fundamental topics covered in the Getting Started section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Containers vs Images\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in getting started",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Containers vs Images\" is a key concept in Dart's Getting Started domain."
    }
  ],
  "dk:images-and-dockerfiles": [
    {
      "question": "Which of these best describes \"Dockerfile Basics\" in Dart?",
      "options": [
        "A core concept covered in Images & Dockerfiles",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Dockerfile Basics\" is one of the fundamental topics covered in the Images & Dockerfiles section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"FROM Variants\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in images & dockerfiles",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"FROM Variants\" is a key concept in Dart's Images & Dockerfiles domain."
    }
  ],
  "dk:container-management": [
    {
      "question": "Which of these best describes \"docker run deep\" in Dart?",
      "options": [
        "A core concept covered in Container Management",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"docker run deep\" is one of the fundamental topics covered in the Container Management section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Interactive Mode\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in container management",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Interactive Mode\" is a key concept in Dart's Container Management domain."
    }
  ],
  "dk:networking": [
    {
      "question": "Which of these best describes \"Port Forwarding\" in Dart?",
      "options": [
        "A core concept covered in Networking",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Port Forwarding\" is one of the fundamental topics covered in the Networking section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"DNS Resolution\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in networking",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"DNS Resolution\" is a key concept in Dart's Networking domain."
    }
  ],
  "dk:storage": [
    {
      "question": "Which of these best describes \"Named Volumes\" in Dart?",
      "options": [
        "A core concept covered in Storage",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Named Volumes\" is one of the fundamental topics covered in the Storage section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Bind Mounts\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in storage",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Bind Mounts\" is a key concept in Dart's Storage domain."
    }
  ],
  "dk:compose": [
    {
      "question": "Which of these best describes \"Compose File Structure\" in Dart?",
      "options": [
        "A core concept covered in Compose",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Compose File Structure\" is one of the fundamental topics covered in the Compose section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Profiles\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in compose",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Profiles\" is a key concept in Dart's Compose domain."
    }
  ],
  "dk:swarm": [
    {
      "question": "Which of these best describes \"Swarm Init\" in Dart?",
      "options": [
        "A core concept covered in Swarm",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Swarm Init\" is one of the fundamental topics covered in the Swarm section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Node Types\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in swarm",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Node Types\" is a key concept in Dart's Swarm domain."
    }
  ],
  "dk:security": [
    {
      "question": "Which of these best describes \"Seccomp Profiles\" in Dart?",
      "options": [
        "A core concept covered in Security",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Seccomp Profiles\" is one of the fundamental topics covered in the Security section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"AppArmor\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in security",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"AppArmor\" is a key concept in Dart's Security domain."
    }
  ],
  "dk:monitoring-and-logging": [
    {
      "question": "Which of these best describes \"docker events\" in Dart?",
      "options": [
        "A core concept covered in Monitoring & Logging",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"docker events\" is one of the fundamental topics covered in the Monitoring & Logging section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Prometheus Metrics\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in monitoring & logging",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Prometheus Metrics\" is a key concept in Dart's Monitoring & Logging domain."
    }
  ],
  "dk:ci-cd": [
    {
      "question": "Which of these best describes \"Docker in Docker\" in Dart?",
      "options": [
        "A core concept covered in CI/CD",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Docker in Docker\" is one of the fundamental topics covered in the CI/CD section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Caching Strategies\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in ci/cd",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Caching Strategies\" is a key concept in Dart's CI/CD domain."
    }
  ],
  "dk:docker-desktop": [
    {
      "question": "Which of these best describes \"Kubernetes Integration\" in Dart?",
      "options": [
        "A core concept covered in Docker Desktop",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Kubernetes Integration\" is one of the fundamental topics covered in the Docker Desktop section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Dev Environments\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in docker desktop",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Dev Environments\" is a key concept in Dart's Docker Desktop domain."
    }
  ],
  "dk:best-practices": [
    {
      "question": "Which of these best describes \"Image Size Optimization\" in Dart?",
      "options": [
        "A core concept covered in Best Practices",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Image Size Optimization\" is one of the fundamental topics covered in the Best Practices section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Security Scanning\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in best practices",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Security Scanning\" is a key concept in Dart's Best Practices domain."
    }
  ],
  "dk:docker-internals": [
    {
      "question": "Which of these best describes \"Namespaces\" in Dart?",
      "options": [
        "A core concept covered in Docker Internals",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Namespaces\" is one of the fundamental topics covered in the Docker Internals section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Cgroups\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in docker internals",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Cgroups\" is a key concept in Dart's Docker Internals domain."
    }
  ],
  "dk:docker-in-practice": [
    {
      "question": "Which of these best describes \"Troubleshooting Exec\" in Dart?",
      "options": [
        "A core concept covered in Docker in Practice",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Troubleshooting Exec\" is one of the fundamental topics covered in the Docker in Practice section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"Dockerfile Optimization\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in docker in practice",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"Dockerfile Optimization\" is a key concept in Dart's Docker in Practice domain."
    }
  ],
  "dk:docker-in-production": [
    {
      "question": "Which of these best describes \"Structured Logging\" in Dart?",
      "options": [
        "A core concept covered in Docker in Production",
        "An advanced feature not yet available",
        "A deprecated syntax pattern",
        "A third-party library function"
      ],
      "answer": 0,
      "explanation": "\"Structured Logging\" is one of the fundamental topics covered in the Docker in Production section of Dart."
    },
    {
      "question": "In Dart, what is the purpose of \"CI/CD Pipeline Patterns\"?",
      "options": [
        "To define application configuration",
        "To handle a specific programming concern in docker in production",
        "To optimize network requests",
        "To manage package dependencies"
      ],
      "answer": 1,
      "explanation": "\"CI/CD Pipeline Patterns\" is a key concept in Dart's Docker in Production domain."
    }
  ]
};
