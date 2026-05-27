# Kodex's Lab: Full Mastery Edition

An interactive multi-language programming textbook, code playground, and compiler pipeline explorer. Learn programming languages, frameworks, databases, cloud platforms, and DevOps tools with built-in code execution, quizzes, challenges, an AI tutor, SQL database lab, visual schema designer, REST API client, CI/CD curriculum, game development curriculum, mobile development curriculum, and 16 mini-games.

## Features

| Feature | Description |
|---------|-------------|
| **Multi-topic curriculum** | 64 content files covering 18 programming languages, 10 databases, 11 cloud/DevOps tools, 14 frontend frameworks, 17 backend/tech tools, 4 testing/infra tools, CI/CD, gamedev (3 engines), mobile (Android + iOS), and compiler design — 3,571+ indexed topics across 797 phases |
| **Live code execution** | JavaScript, TypeScript, Python, Go, Rust, C, C++, C#, Kotlin, Scala, Swift, Zig, Bash, PHP, WebAssembly, Assembly via system compilers/interpreters. Sandboxed with `ulimit`, concurrent execution queue, and 30s timeout. Docker sandbox also available for isolated execution. |
| **SQL database lab** | Execute SQL queries against a seeded in-memory SQLite database (20+ tables, 7 schemas). Optional PostgreSQL/MySQL via env vars. Results formatted as ASCII tables. |
| **Schema designer** | Full visual database schema designer with Design and ERD views, drag tables, FK click-to-link, column constraints (PK, NOT NULL, UNIQUE, DEFAULT), index management, multi-dialect SQL generation (PostgreSQL, MySQL, SQLite), SQL import/export, JSON export/import, undo/redo (Ctrl+Z/Y), version history, auto-layout, and auto-updating SQL preview. |
| **Compiler pipeline explorer** | Client-side tokenizer, recursive-descent AST parser, and code statistics engine for any supported language. Step-through pipeline: source → tokens → AST → stats. |
| **AI tutor** | Hybrid keyword + tiny-LLM tutor by default, with 52+ curated responses + 24 topic-specific tutored responses + language-aware conversation context + TF-IDF curriculum search across all 64 content files. Optional LLM backends: OpenAI, Anthropic, local Ollama/LM Studio with SSE streaming. |
| **Quiz mode** | Per-language multiple-choice quizzes with instant feedback and progress tracking (18+ languages, 3 difficulty levels each). |
| **Code challenges** | 2,100+ bug-fixing and implementation challenges across JavaScript, Python, Go, TypeScript, Rust, Swift, Scala, Bash, PHP, Ruby, C, C++, C#, Kotlin, Zig — each with test expressions and solution code. |
| **Code analysis** | Static analysis with language-specific keyword pattern checks (JS, TS, Python, Go, Rust, SQL, Scala), balanced delimiter detection, structural analysis, and optional LLM-powered deep review with 1-10 scoring. |
| **AI exercises** | On-demand generated practice exercises per topic/level — fix-bug, fill-blank, write-function, predict-output, refactor, implement, optimize, debug, design, analyze, extend. LLM-generated with static fallback. |
| **Learner profile** | Per-user progress tracking with SM-2 spaced-repetition review scheduling (1/3/7/14/30 day intervals), concept mastery metrics, error/attempt tracking, and personalized next-topic recommendations. |
| **Auto-complete & smart indent** | Editor helper with keyword completion, bracket pairing, and auto-indentation across all languages. |
| **Cheatsheet** | Per-language quick-reference cheatsheet with syntax, idioms, and common patterns. |
| **Gaming mode** | 16 mini-games: Typing Speed, Code Scramble, Debug the Bug, Syntax Sprint, Memory Match, Speed Read, Race Compiler, Syntax Swipe, Code Golf, Binary/Hex Blitz, Crossword, Regex Rally, SQL JOIN Match, Errorpedia, API Arcade, Daily Challenge. |
| **GameDev mode** | Full game development curriculum covering Godot, Unity, and Unreal Engine with engine-specific topic filters. Each engine has 14 topics across dedicated phases. Also includes 5 general gamedev phases (Game Loop, Physics, Audio, Input, Rendering, ECS, Networking, Optimization, Save Systems, Build/Deploy, Accessibility). |
| **Mobile mode** | Android and iOS development curriculum with platform toggle filter. 98 topics across 16 phases (8 Android, 8 iOS) covering Kotlin, Jetpack Compose, Swift, SwiftUI, UIKit, architecture patterns, testing, distribution, and more. |
| **CI/CD mode** | Full CI/CD curriculum with 10 phases and ~30 topics covering CI/CD fundamentals, version control, CI tools (GitHub Actions, Jenkins, CircleCI, Azure DevOps), GitLab CI/CD (dedicated 4-topic phase), deployment strategies, IaC, containers, GitOps, security (SAST/DAST/SBOM), and monitoring. |
| **REST API client** | Built-in Thunderclient-style workspace with HTTP method selection, URL input, headers/body/auth tabs (Bearer/Basic), and response display with status, headers, and formatted JSON. |
| **Git visualizer** | Interactive Git learning mode with visualized branching, commits, merges, and common workflows. |
| **Tech Stack mode** | Explore full technology stacks (backend, frontend, database, DevOps) for different application types. |
| **Roadmap view** | SVG-based visual learning roadmap for topic progression. |
| **Code editor file integration** | Load `.js`/`.py`/etc. files from disk via `<input type="file">` and FileReader. |
| **Dynamic theming** | Language-specific accent colors applied via CSS custom properties (`--js`, `--py`, `--go`, etc.) across all UI elements. |

## Supported Topics

### Programming Languages (curriculum + code execution)
JavaScript, TypeScript, Python, Go, Rust, Zig, C, C++, C#, Kotlin, Scala, Swift, Bash, PHP, Ruby, WebAssembly, Assembly — each with full topic trees and live server-side execution.

### Databases
PostgreSQL, MySQL, SQLite, MongoDB, Firebase — with curriculum; SQLite/PG/MySQL with live SQL execution.

### DevOps, Cloud & CI/CD
Docker, Git, Firebase, AWS, Azure, GCP, Cloud, Kubernetes, Terraform — curriculum with compile hints.
CI/CD — dedicated tab with 10 phases covering fundamentals, Git integration, CI tools (GitHub Actions, Jenkins, CircleCI, Azure DevOps), GitLab CI/CD (4-topic deep dive), deployment strategies, IaC, containers, GitOps, security, and monitoring.

### Frontend Frameworks
React, Vue, Angular, Svelte, Next.js, Nuxt, SvelteKit, Remix, Vite, Webpack, Tailwind, Bootstrap — curriculum.

### Backend & Tech Tools
Node.js, Express, FastAPI, Flask, Django, Spring, GraphQL, Prisma, Redis, React Native, Flutter — curriculum.

### Testing & Infrastructure
Cypress, Playwright — curriculum.

### Game Development (3 engines)
- **General**: Game Loop, Physics, Audio, Input, Rendering, ECS, Networking, Optimization, Save Systems, Build/Deploy, Accessibility (11 phases, 76 topics)
- **Godot Engine**: Nodes & Scenes, GDScript, Physics, Signals, Shaders, Tilemaps, Input, Resources, Editor Plugins, GDExtension, XR Tools, Render Modes (14 topics)
- **Unity Engine**: GameObjects, Components, Physics, Prefabs, Shaders, UI Toolkit, Animation, Scriptable Objects, Gaming Services, Multi-Scene, Editor Tools, NavMesh, VFX Graph (14 topics)
- **Unreal Engine**: Actors, Components, Blueprints, Physics, UMG, Materials, World Partition, MetaSounds, Animation Blueprints, Smart Objects, PCG, Mass Entity System (14 topics)

### Mobile Development (2 platforms)
- **Android**: Kotlin & Java, App Components, UI Toolkit (Jetpack Compose + Views), Architecture (MVVM, Hilt, Clean Architecture), Data & Networking (Retrofit, Room, Firebase), Async & Concurrency (Coroutines, Flow), Testing & Debug, Distribution (50 topics across 8 phases)
- **iOS**: Swift & Objective-C, Xcode & Architecture, UIKit & SwiftUI, App Components & Navigation, Data & Networking (URLSession, CoreData, SwiftData), Concurrency & Memory (GCD, async/await, Actors), Testing & Debug, Distribution (48 topics across 8 phases)

### Compiler Design (Experimental Stage)
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
| Scala | `scalac` + `scala` | `ulimit -v 262144 -t 30` |
| Swift | `swift` | `ulimit -v 262144 -t 30` |
| Zig | `zig run` | `ulimit -v 262144 -t 30` |
| Bash | `bash` | `ulimit -v 262144 -t 30` |
| PHP | `php` | `ulimit -v 262144 -t 30` |
| WebAssembly | `wasmtime` | `ulimit -v 262144 -t 30` |
| Assembly | `nasm` + `gcc` | `ulimit -v 262144 -t 30` |
| SQLite / PostgreSQL / MySQL | Built-in database engine | Concurrency-guarded |

All execution is limited to 256MB virtual memory, 30s CPU time, and a maximum of 4 concurrent processes. Docker sandbox images are also available for each language (see Docker section).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS, no framework |
| Backend | Node.js (Express) or Go (alternative) |
| Runtime | Node.js 18+, Go 1.22+ |
| Database (SQL) | better-sqlite3 (built-in), optional pg + mysql2 |
| AI | Hybrid keyword + tiny-LLM tutor (default), OpenAI, Anthropic, local Ollama/LM Studio |
| Deploy | Docker, Netlify (static + serverless functions) |

## Quick Start

### Prerequisites

- Node.js 18+
- Go 1.22+ (optional, for Go backend)
- System compilers/interpreters for languages you want to execute (or use Docker)

### Docker (recommended — includes all runtimes)

```bash
docker compose build
docker compose up
```

Open http://localhost:3001

This builds a single image with all 16 language runtimes pre-installed (Node.js, Python, Go, Rust, .NET, Kotlin, Scala, Swift, Zig, Wasmtime, PHP, C/C++, Bash).

### Node.js Backend

```bash
npm install
npm start
```

Open http://localhost:3000

### Go Backend (alternative)

```bash
cd backend-go
go run main.go
```

The Go backend runs on port 8080 and serves the core API subset plus static files.

### Docker Sandbox Images (optional, for isolated code execution)

Per-language sandbox images can be built individually for isolated code execution:

```bash
bash docker/build-all.sh
```

Or build a single language sandbox:

```bash
docker build -t kodex-scala -f docker/Dockerfile.scala docker/
```

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm start` | `npm run build:ai && npm run build:browser && tsx server.ts` | Build browser assets, then run the server |
| `npm run dev` | `npm run build:ai && npm run build:browser && tsx watch server.ts` | Build browser assets, then run in watch mode |
| `npm run build` | `npm run build:ai && npm run build:browser && tsc` | Compile server TS and browser TS outputs |
| `npm run build:watch` | `tsc --watch` | Watch mode for TS compilation |
| `npm run typecheck` | `tsc --noEmit` | Type-check without writing build output |

## Project Structure

The repo is organized around these boundaries:

- [`server.ts`](./server.ts) boots Express, WebSockets, cleanup jobs, and the API mount.
- [`routes/`](./routes) contains HTTP handlers.
- [`services/`](./services) contains execution, compiler, AI, proxy, metrics, and WebSocket logic.
- [`middleware/`](./middleware) contains shared Express middleware.
- [`sql/`](./sql) contains the database layer and seed data.
- [`ai/`](./ai) contains the AI orchestration and analysis helpers.
- [`public/`](./public) contains the browser app, visual tools, landing/bootstrap helpers, and source assets.
- [`core-typescript/`](./core-typescript) contains the browser app TypeScript source slices split out of the old monolith.
- [`browser-build/core-typescript/`](./browser-build/core-typescript) contains the generated browser JS outputs that `index.html` loads.
- [`public/styles/`](./public/styles) contains the stylesheet slices imported by [`public/style.css`](./public/style.css).
- [`content/`](./content) contains curriculum JSON files.
- [`data/`](./data) contains runtime state and learner profiles.
- [`tests/`](./tests) contains integration and service tests.
- [`docker/`](./docker) contains the language sandbox images.
- [`scripts/`](./scripts) contains build and maintenance helpers.
- [`backend-go/`](./backend-go) contains the alternative Go backend.
- [`netlify/`](./netlify) contains the serverless function entry point.

For a cleaner breakdown of source files, generated assets, and refactor candidates, see [`docs/project-layout.md`](./docs/project-layout.md).

Recent frontend splits:

- [`public/bootstrap.js`](./public/bootstrap.js) handles shared startup globals.
- [`public/landing.js`](./public/landing.js) handles the welcome screen.
- [`public/mobile-helpers.js`](./public/mobile-helpers.js) handles the mobile/tech stack intro handoff.
- [`public/lang-intro.js`](./public/lang-intro.js) owns language intro content rendering.

## API Endpoints

### Health & System
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check: node version, compiler availability, database status, rate limit info |
| GET | `/api/ws/stats` | WebSocket connection statistics |

### Progress
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/progress` | Get all topic completion progress |
| POST | `/api/progress` | Save topic completion `{lang, topic, completed}` |

### Code Execution
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/execute` | Execute code `{lang, code, stdin?}` — supports py, go, ts, rs, c, cpp, cs, kt, swift, wasm, asm, zig, bash, php, scala, sqlite, pg, mysql |
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
| POST | `/api/quiz/generate` | Generate a short quiz for `{topic?, lang?, level?}` |
| GET | `/api/courses` | List available course files from `content/` directory |

### Learner Profile
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/learner/track` | Track learner events: complete-topic, error, attempt, quiz, challenge, ai-interaction |
| GET | `/api/learner/path` | Get recommended learner path data |
| GET | `/api/learner/state` | Get learner profile & concept mastery (optional `?lang=`) |
| GET | `/api/learner/reviews` | Get due spaced-repetition reviews |
| GET | `/api/learner/recommend` | Get next recommended topic `(?lang=&topics=)` |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/benchmark` | Performance benchmark (Node.js vs Go) `(?n=iterations)` |
| GET | `/api/metrics` | Application metrics |
| GET | `/api/openapi.json` | OpenAPI specification |
| GET | `/api/docs` | Swagger UI documentation |

Rate limiting: 30 requests per 60 seconds per IP across all `/api/*` routes.

## AI Module

The AI system (`ai/`) is a full-stack TypeScript module supporting multiple providers configured via `.env`:

- **`hybrid`** (default in `.env.example`, no API key needed) — Keyword cascade plus a Transformers.js tiny model fallback.
- **`keyword`** — Fast no-download fallback using curated responses and curriculum context.
- **`openai`** — Set `AI_PROVIDER=openai` + `OPENAI_API_KEY`. Uses GPT models with SSE streaming support.
- **`anthropic`** — Set `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`. Uses Claude models with SSE streaming support.
- **`local`** — Set `AI_PROVIDER=local`. Connects to any OpenAI-compatible local endpoint (Ollama, LM Studio, etc.).

The curriculum search pipeline:
1. **Curriculum index** — regex-based topic extraction from 64 JSON course files (3,571+ topics)
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

The Database tab includes a built-in SQLite engine seeded with 20+ tables across 7 schemas:

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

The workspace includes a full visual database schema designer with two views:

### Design View
- **Tables**: Create, rename, delete, and drag-to-position tables on a dot-grid canvas
- **Columns**: Define column name, type (INT, SERIAL, BIGINT, VARCHAR, TEXT, BOOLEAN, DATE, TIMESTAMP, DECIMAL, UUID, JSONB, FLOAT), constraint toggles (PK, NOT NULL, UNIQUE), and default values
- **Foreign Keys**: Click-to-link FK relationships (click `~>` on source column, then click target column handle). Colored bezier curves show relationships with cardinality labels. Click an existing FK badge to remove it.
- **Indexes**: Add, name, and toggle unique indexes per table. Select which columns are included.
- **Table comments**: Add descriptive comments to tables.

### ERD View
- Read-only entity-relationship diagram with simplified table cards
- PK/FK badges, constraint flags (NN, UQ, DF), and dashed relationship lines
- Click rows to create or remove FK links (same click-to-link flow)
- Drag tables to reposition

### Toolbar Features
- **Undo/Redo**: 50-deep stack with Ctrl+Z / Ctrl+Y keyboard shortcuts
- **Auto Layout**: Auto-arranges tables in a grid
- **Import SQL**: Paste CREATE TABLE statements (PostgreSQL, MySQL, SQLite dialects) and parse into visual design
- **Export SQL**: Copy to clipboard or download as `.sql` file
- **Export JSON**: Download schema as `.json` file
- **Import JSON**: Load a previously exported `.json` schema file
- **Multi-dialect**: Switch between PostgreSQL, MySQL, and SQLite for generated DDL
- **Auto-generate SQL**: SQL preview auto-updates (500ms debounce) as you edit
- **Version history**: Save named snapshots to localStorage, restore or delete them
- **Clear All**: Wipe the current schema with confirmation

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

## Docker

### Single Image (all runtimes)

The root `Dockerfile` builds a single image with all 16 language runtimes pre-installed, alongside the Express backend:

```bash
docker compose build
docker compose up
```

The `docker-entrypoint.sh` script verifies all runtimes at container startup.

### Per-Language Sandbox Images

Individual sandbox images are available in `docker/` for isolated code execution (used by the Docker executor):

```bash
bash docker/build-all.sh
```

Each sandbox image is tagged `kodex-<lang>` (e.g., `kodex-py`, `kodex-scala`) and contains only the runtime needed for that language, plus a dedicated `code` user.

### Supported Sandbox Languages

| Image | Language | Base Image |
|-------|----------|------------|
| `kodex-py` | Python | python:3.12-slim |
| `kodex-js` | JavaScript | node:22-slim |
| `kodex-ts` | TypeScript | node:22-slim |
| `kodex-go` | Go | golang:1.23 |
| `kodex-rs` | Rust | rust:1.83 |
| `kodex-c` | C | gcc:13-bookworm |
| `kodex-cpp` | C++ | gcc:13-bookworm |
| `kodex-cs` | C# | mcr.microsoft.com/dotnet/sdk:8.0 |
| `kodex-kt` | Kotlin | eclipse-temurin:22-jdk |
| `kodex-scala` | Scala | eclipse-temurin:22-jdk |
| `kodex-swift` | Swift | swift:6.0 |
| `kodex-zig` | Zig | zig:0.13 |
| `kodex-bash` | Bash | ubuntu:22.04 |
| `kodex-php` | PHP | php:8.3-cli |
| `kodex-wasm` | WebAssembly | rust:1.83 (wasmtime) |
| `kodex-asm` | Assembly | gcc:13-bookworm (nasm) |

## Course Data Format

Course files in `content/` are 64 JSON files with topics organized by phase:

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

Each file has multiple phases, each phase has multiple topics. Topics can optionally include a `prereq` field. All course data is aggregated into `content/app-data.json` and embedded into `public/app-data.js` for browser delivery.

## UI Features

- **Header extra tabs** — Backend, CI/CD, Code Lab, Compiler, GameDev, Mobile, Tech Stack, Quiz, Gaming — each with distinct accent colors and hover effects
- **Engine filter bar** — Filter gamedev topics by engine (All Engines / Godot / Unity / Unreal), shows only engine-specific phases
- **Platform filter bar** — Filter mobile topics by platform (All / Android / iOS), shows only platform-specific phases
- **Roadmap view** — SVG-based visual learning roadmap for topic progression
- **Language-specific theming** — Dynamic accent colors per language via CSS custom properties
- **Skeleton loading** — Placeholder UI while curriculum content lazy-loads
- **File integration** — Load local source files into the editor via file picker
- **Collapsible phases** — Expand/collapse all phases, with per-phase completion counters

## Deployment

### Docker

```bash
docker compose up -d
```

Builds and runs a self-contained image with all language runtimes. Listens on port 3001 (maps to container port 3000).

### Netlify

The project is configured for Netlify deployment:

- `netlify.toml` maps `/api/*` to the unified serverless function
- `netlify/functions/api.js` handles all API routes through a single function handler
- Static files are served from the root directory
- No build step required for the frontend (vanilla HTML/CSS/JS)
- TypeScript compilation (`npm run build`) is needed after changing TypeScript sources
