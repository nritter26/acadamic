# Kodex's Lab: Full Mastery Edition

An interactive multi-language programming textbook, code playground, and compiler pipeline explorer. Learn 45+ programming languages, frameworks, databases, cloud platforms, and DevOps tools with built-in code execution, quizzes, challenges, an AI tutor, SQL database lab, visual schema designer, REST API client, and 16 mini-games.

## Features

| Feature | Description |
|---------|-------------|
| **Multi-topic curriculum** | 45+ content files covering 12 programming languages, 4 databases, 7 cloud/DevOps tools, 8 frontend frameworks, 10 backend/tech tools, 4 testing/infra tools, gamedev, and compiler design — 4,360+ indexed topics |
| **Live code execution** | JavaScript, TypeScript, Python, Go, Rust, C, C++, C#, Kotlin, Swift, Zig via system compilers/interpreters. Sandboxed with `ulimit`, concurrent execution queue, and 30s timeout. |
| **SQL database lab** | Execute SQL queries against a seeded in-memory SQLite database (20+ tables, 6 schemas). Optional PostgreSQL/MySQL via env vars. Results formatted as ASCII tables. |
| **Schema designer** | Visual PostgreSQL table designer with drag-and-drop FK connector lines, generates DDL SQL. |
| **Compiler pipeline explorer** | Client-side tokenizer, recursive-descent AST parser, and code statistics engine for any supported language. Step-through pipeline: source → tokens → AST → stats. |
| **AI tutor** | Keyword-based Q&A (default, no API key) with 26 curated responses + TF-IDF curriculum search across all 4,360+ topics. Optional LLM backends: OpenAI, Anthropic, local Ollama/LM Studio with SSE streaming. |
| **Quiz mode** | Per-language multiple-choice quizzes with instant feedback and progress tracking (6+ languages, 3 difficulty levels each). |
| **Code challenges** | 1,890 bug-fixing and implementation challenges across JavaScript, Python, Go, TypeScript, Rust, Swift — each with test expressions and solution code. |
| **Code analysis** | Static analysis with language-specific keyword pattern checks (JS, TS, Python, Go, Rust, SQL), balanced delimiter detection, structural analysis, and optional LLM-powered deep review with 1-10 scoring. |
| **AI exercises** | On-demand generated practice exercises per topic/level — fix-bug, fill-blank, write-function, predict-output, refactor, implement, optimize, debug, design, analyze, extend. LLM-generated with static fallback. |
| **Learner profile** | Per-user progress tracking with SM-2 spaced-repetition review scheduling (1/3/7/14/30 day intervals), concept mastery metrics, error/attempt tracking, and personalized next-topic recommendations. |
| **Benchmarking** | Compare Node.js vs Go backend performance with configurable iterations via `/api/benchmark`. |
| **Auto-complete & smart indent** | Editor helper with keyword completion, bracket pairing, and auto-indentation across all languages. |
| **Cheatsheet** | Per-language quick-reference cheatsheet with syntax, idioms, and common patterns. |
| **Gaming mode** | 16 mini-games: Typing Speed, Code Scramble, Debug the Bug, Syntax Sprint, Memory Match, Speed Read, Race Compiler, Syntax Swipe, Code Golf, Binary/Hex Blitz, Crossword, Regex Rally, SQL JOIN Match, Errorpedia, API Arcade, Daily Challenge. |
| **REST API client** | Built-in Thunderclient-style workspace with HTTP method selection, URL input, headers/body/auth tabs (Bearer/Basic), and response display with status, headers, and formatted JSON. |
| **Roadmap view** | SVG-based visual learning roadmap for topic progression. |
| **Code editor file integration** | Load `.js`/`.py`/etc. files from disk via `<input type="file">` and FileReader. |
| **Dynamic theming** | Language-specific accent colors applied via CSS custom properties (`--js`, `--py`, `--go`, etc.) across all UI elements. |

## Supported Topics

### Programming Languages (curriculum + code execution)
JavaScript, TypeScript, Python, Go, Rust, Zig, C, C++, C#, Kotlin, Swift — each with full topic trees and live server-side execution.

### Databases
PostgreSQL, MySQL, SQLite — with curriculum, live SQL execution, and schema designer.
MongoDB — curriculum only (no execution).

### DevOps & Cloud
Docker, Git, Firebase, AWS, Azure, GCP, Cloud — curriculum with compile hints.

### Frontend Frameworks
React, Vue, Angular, Svelte, Next.js, Nuxt, SvelteKit, Remix — curriculum.

### Backend & Tech Tools
Node.js, Express, Tailwind, Vite, Webpack, GraphQL, Prisma, Redis, React Native, Flutter — curriculum.

### Testing & Infrastructure
Cypress, Playwright, Kubernetes, Terraform — curriculum.

### Game Development
GameDev — curriculum with 16 mini-games.

### Compiler Design
Complete compiler curriculum: tokenization, AST, parsing, code generation, optimization — with hands-on pipeline explorer.

### Code Execution Runtimes

| Language | Runtime | Sandbox |
|----------|---------|---------|
| JavaScript | `node` (sandboxed VM) | `ulimit -v 262144 -t 30` |
| TypeScript | `tsx` | `ulimit -v 262144 -t 30` |
| Python | `python3` | `ulimit -v 262144 -t 30` |
| Go | `go run` | `ulimit -v 262144 -t 30` |
| Rust | `rustc` + run | `ulimit -v 262144 -t 30` |
| C | `gcc` + run | `ulimit -v 262144 -t 30` |
| C++ | `g++` + run | `ulimit -v 262144 -t 30` |
| C# | `dotnet script` | `ulimit -v 262144 -t 30` |
| Kotlin | `kotlinc` + `kotlin` | `ulimit -v 262144 -t 30` |
| Swift | `swift` | `ulimit -v 262144 -t 30` |
| Zig | `zig run` | `ulimit -v 262144 -t 30` |
| SQLite / PostgreSQL / MySQL | Built-in database engine | Concurrency-guarded |

All execution is limited to 256MB virtual memory, 30s CPU time, and a maximum of 4 concurrent processes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS, no framework |
| Backend | Node.js (Express) or Go (alternative) |
| Runtime | Node.js 18+, Go 1.22+ |
| Database (SQL) | better-sqlite3 (built-in), optional pg + mysql2 |
| AI | Keyword matching + TF-IDF (default), OpenAI, Anthropic, local Ollama/LM Studio |
| Deploy | Netlify (static + serverless functions) |

## Project Structure

```
acadamic/
├── server.js                    # Express backend entry point (~1,006 lines)
├── index.html                   # Single-page frontend app
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration (ai/ → dist/)
├── .env.example                 # Env var template (58 entries)
├── netlify.toml                 # Netlify deployment config
│
├── public/                      # Client-side source files
│   ├── app.js                   # Main frontend logic (~3,833 lines)
│   ├── style.css                # Application stylesheet (~1,395 lines)
│   ├── courseData.js            # Course metadata container
│   ├── langConfig.js            # Language code ↔ name mappings (47 entries)
│   ├── techstack.js             # Tech stack tab frontend (23 topics)
│   ├── compiler-core.js         # Multi-language lexer/parser/AST (~428 lines)
│   ├── compiler-curriculum.js   # Compiler design curriculum (~353 lines)
│   ├── challenges.js            # 1,890 code challenges across 6 langs
│   ├── quiz.js                  # Quiz questions per language
│   ├── game.js                  # Gaming mode logic (16 mini-games)
│   ├── db.js                    # Database tab frontend
│   └── ai-responses.js          # 26 AI tutor keyword responses
│
├── content/                     # Course curriculum data (45 JSON files)
│   ├── js.json, py.json, ...    # 12 programming languages
│   ├── pg.json, mysql.json, ... # 4 databases
│   ├── dk.json, git.json, ...   # 7 cloud/DevOps tools
│   ├── react.json, vue.json,... # 8 frontend frameworks
│   ├── node.json, express.json  # 10 backend/tech tools
│   ├── cypress.json, k8s.json   # 4 testing/infra tools
│   └── gamedev.json             # Game development
│
├── data/                        # Runtime data (learner profiles, progress)
│   ├── progress.json            # Topic completion progress
│   └── learners/                # Per-user learner profiles (JSON, SM-2)
│
├── ai/                          # AI tutoring & analysis engine (TypeScript)
│   ├── config.ts                # Provider config (keyword/openai/anthropic/local)
│   ├── provider.ts              # LLM request handler with SSE streaming, retry
│   ├── embeddings.ts            # TF-IDF + OpenAI embedding semantic search
│   ├── learner.ts               # SM-2 spaced-repetition learner profiles
│   ├── reviewer.ts              # Static + LLM code review (JS/TS/PY/GO/RS/SQL)
│   └── exercises.ts             # On-demand exercise generation (11 types, 3 levels)
│
├── dist/                        # Compiled JS + declarations from tsconfig
│   ├── config.js (+ .d.ts)
│   ├── provider.js (+ .d.ts)
│   ├── embeddings.js (+ .d.ts)
│   ├── learner.js (+ .d.ts)
│   ├── reviewer.js (+ .d.ts)
│   └── exercises.js (+ .d.ts)
│
├── sql/                         # SQL database engine
│   ├── database.js              # SQLite in-memory DB + PG/MySQL pools
│   └── seed.sql                 # Sample data (20+ tables, 6 schemas)
│
├── backend-go/                  # Alternative Go backend
│   ├── main.go                  # Go HTTP server (~329 lines)
│   └── go.mod                   # Go module (Go 1.22)
│
└── netlify/                     # Netlify serverless functions
    └── functions/
        └── api.js               # Unified handler for all API routes (~521 lines)
```

## Quick Start

### Prerequisites

- Node.js 18+
- Go 1.22+ (optional, for Go backend)
- System compilers/interpreters for languages you want to execute

### Node.js Backend

```bash
cd acadamic
npm install
npm start
```

Open http://localhost:3000

### Go Backend (alternative)

```bash
cd acadamic/backend-go
go run main.go
```

The Go backend runs on port 8080 and serves the same API plus static files.

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm start` | `tsx server.js` | Run server with TypeScript execution |
| `npm run dev` | `tsx watch server.js` | Run server in watch mode with hot reload |
| `npm run build` | `tsc` | Compile TypeScript (`ai/` → `dist/`) |
| `npm run build:watch` | `tsc --watch` | Watch mode for TS compilation |

## API Endpoints

### Health & System
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check: node version, compiler availability, database status, rate limit info |

### Progress
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/progress` | Get all topic completion progress |
| POST | `/api/progress` | Save topic completion `{lang, topic, completed}` |

### Code Execution
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/execute` | Execute code `{lang, code, stdin?}` — supports js, ts, py, go, rs, zig, c, cpp, cs, kt, swift, sqlite, pg, mysql |
| POST | `/api/proxy` | Proxy HTTP requests with SSRF protection (blocks private IPs, metadata endpoints) |

### Analysis
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Static code analysis with keyword pattern detection |
| POST | `/api/review` | Full code review (static patterns + optional LLM) `{code, lang, topic?, learnerId?}` |
| POST | `/api/explain` | Code explanation with curriculum context `{code, lang, topic?}` |

### AI & Tutor
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | AI assistant chat with curriculum-aware responses, SSE streaming `{message, lang?, topic?, phase?, code?, output?, hasError?, history?, learnerId?}` |
| POST | `/api/exercise` | Generate on-demand practice exercise `{topic, lang?, level?}` |
| GET | `/api/courses` | List available course files from `content/` directory |

### Learner Profile
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/learner/track` | Track learner events: complete-topic, error, attempt, quiz, challenge, ai-interaction |
| GET | `/api/learner/state` | Get learner profile & concept mastery (optional `?lang=`) |
| GET | `/api/learner/reviews` | Get due spaced-repetition reviews |
| GET | `/api/learner/recommend` | Get next recommended topic `(?lang=&topics=)` |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/benchmark` | Performance benchmark (Node.js vs Go) `(?n=iterations)` |

Rate limiting: 30 requests per 60 seconds per IP across all `/api/*` routes.

## AI Module

The AI system (`ai/`) is a full-stack TypeScript module supporting multiple providers configured via `.env`:

- **`keyword`** (default, no API key needed) — Two-tier matching: 26 curated responses in `ai-responses.js` + TF-IDF curriculum search across all 45 content files via `embeddings.ts`. Returns relevant topic explanations with cosine similarity scoring.
- **`openai`** — Set `AI_PROVIDER=openai` + `OPENAI_API_KEY`. Uses GPT models with SSE streaming support.
- **`anthropic`** — Set `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`. Uses Claude models with SSE streaming support.
- **`local`** — Set `AI_PROVIDER=local`. Connects to any OpenAI-compatible local endpoint (Ollama, LM Studio, etc.).

The curriculum search pipeline:
1. **Curriculum index** — regex-based topic extraction from 45 JSON course files (4,360+ topics)
2. **TF-IDF** (always available) — keyword-based relevance scoring with cosine similarity
3. **OpenAI embeddings** (if API key configured) — semantic vector search via `text-embedding-3-small` with batch caching to disk

The system prompt is customizable via `AI_SYSTEM_PROMPT` in `.env`.

### Learner Profiles

Per-user profiles track progress using SM-2 spaced repetition:

- Review intervals: 1, 3, 7, 14, 30 days
- Tracks: topic completions, errors, attempts, quiz scores, challenge completions, AI interactions
- Concept mastery: per-language proficiency scoring
- Recommendations: due reviews → weakest concepts → next topic in sequence

Profiles are stored as JSON in `data/learners/` with fallback to `/tmp/kodex-lab-learners/`.

## SQL Execution (Database Tab)

The Database tab includes a built-in SQLite engine seeded with 20+ tables across 6 schemas:

| Schema | Tables |
|--------|--------|
| HR | departments, employees, salaries |
| Commerce | customers, orders, order_items, products, categories, reviews |
| Education | students, courses, enrollments |
| Content | blog_posts, comments |
| Supply Chain | suppliers, purchase_orders, purchase_order_items |
| Banking | accounts, transactions |
| Projects | projects, employee_projects |

- **SQLite** — Always available, no setup needed. In-memory, resets on server restart.
- **PostgreSQL** — Optional. Set `PG_CONNECTION_STRING` in `.env`.
- **MySQL** — Optional. Set `MYSQL_CONNECTION_STRING` in `.env`.

Results are formatted as ASCII box-drawing tables. Multiple semicolon-separated statements are supported (up to 200 rows displayed).

## Schema Designer

The workspace includes a visual PostgreSQL schema designer:

- Add tables with custom names
- Define columns with types, nullability, defaults, and primary keys
- Create foreign key relationships with visual connector lines
- Generate DDL SQL from the designed schema

## Compiler Pipeline Explorer

The Compiler tab provides a client-side multi-language tokenizer and recursive-descent parser:

1. **Tokens** — Lexical analysis: splits source into token stream (keywords, identifiers, literals, operators, delimiters, etc.)
2. **AST** — Abstract Syntax Tree: language-aware parser builds a structured tree
3. **Stats** — Code metrics: LOC, comment ratio, cyclomatic complexity, nesting depth, token counts

Supports all execution languages plus SQL-like syntax.

## REST API Client

The workspace includes a full Thunderclient-style HTTP client:

- Method selection (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- URL input with send button
- Headers editor (key-value pairs)
- Body tab with JSON, text, and form-data modes
- Auth tab with Bearer token and Basic auth
- Response display with status code, headers, and pretty-printed JSON

## Gaming Mode

16 mini-games designed to reinforce programming concepts:

| Game | Description |
|------|-------------|
| Typing Speed | Type code snippets as fast as possible, WPM tracking |
| Code Scramble | Reorder shuffled code lines into correct order |
| Debug the Bug | Find and fix bugs in short code snippets |
| Syntax Sprint | Write code matching a description |
| Memory Match | Match code concept pairs |
| Speed Read | Memorize code then answer questions |
| Race Compiler | Solve coding problems under time pressure |
| Syntax Swipe | Swipe left/right to identify valid/invalid syntax |
| Code Golf | Solve challenges in fewest characters |
| Binary/Hex Blitz | Quick base conversion challenges |
| Crossword | Programming term puzzle |
| Regex Rally | Write regex patterns to match strings |
| SQL JOIN Match | Pick the correct JOIN type |
| Errorpedia | Guess the cause of an error |
| API Arcade | Match API endpoints with HTTP methods |
| Daily Challenge | One unique challenge per day |

## Course Data Format

Course files in `content/` are 45 lazy-loaded JSON files with topics organized by phase:

```json
{
  "Fundamentals": {
    "Variables": {
      "exp": "<p>Explanation HTML with <code>code</code> and <strong>formatting</strong></p>",
      "code": "// Example code with syntax"
    }
  }
}
```

Each file has multiple phases, each phase has multiple topics. Topics can optionally include a `prereq` field.

## UI Features

- **Cyberpunk-themed header** — Animated "Just code — don't overthink" motto with glow/flicker CSS effects
- **Devin mascot** — Animated SVG backpack robot with talking animation (triggered by Tab in AI input)
- **Roadmap view** — SVG-based visual learning roadmap for topic progression
- **Language-specific theming** — Dynamic accent colors per language via CSS custom properties
- **Skeleton loading** — Placeholder UI while curriculum content lazy-loads
- **File integration** — Load local source files into the editor via file picker

## Deployment

The project is configured for Netlify deployment:

- `netlify.toml` maps `/api/*` to the unified serverless function
- `netlify/functions/api.js` handles all 17 API routes through a single function handler
- Static files are served from the root directory
- No build step required for the frontend (vanilla HTML/CSS/JS)
- TypeScript compilation (`npm run build`) only needed if modifying the AI module
