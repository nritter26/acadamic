# Kodex's Lab: Full Mastery Edition

An interactive multi-language programming textbook, code playground, and compiler pipeline explorer. Learn programming languages, frameworks, databases, cloud platforms, and DevOps tools with built-in code execution, quizzes, challenges, an AI tutor, SQL database lab, visual schema designer, REST API client, CI/CD curriculum, game development curriculum, mobile development curriculum, and 16 mini-games.

## Table of Contents

- [Features](#features)
- [Supported Topics](#supported-topics)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [Docker (Recommended)](#docker-recommended--includes-all-runtimes)
  - [Rust Backend (Direct)](#rust-backend-direct)
  - [Node.js Backend (Fallback)](#node-js-backend-fallback)
  - [Svelte Frontend (Development)](#svelte-frontend-development)
- [Ollama AI Setup](#ollama-ai-setup)
- [AI Module Configuration](#ai-module-configuration)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Scripts Reference](#scripts-reference)
- [API Endpoints](#api-endpoints)
- [Code Execution Runtimes](#code-execution-runtimes)
- [SQL Execution (Database Tab)](#sql-execution-database-tab)
- [Schema Designer](#schema-designer)
- [Compiler Pipeline Explorer](#compiler-pipeline-explorer)
- [REST API Client](#rest-api-client)
- [Gaming Mode](#gaming-mode)
- [Docker Configuration](#docker-configuration)
- [Learner Profiles](#learner-profiles)
- [Course Data Format](#course-data-format)
- [Deployment](#deployment)
- [UI Features](#ui-features)

---

## Features

| Feature | Description |
|---------|-------------|
| **Multi-topic curriculum** | 71+ content files covering 20+ programming languages, 10 databases, 11 cloud/DevOps tools, 14 frontend frameworks, 17 backend/tech tools, 4 testing/infra tools, CI/CD, gamedev (3 engines), mobile (Android + iOS), AI/ML, HTML/CSS, and compiler design — 5,500+ indexed topics across 800+ phases |
| **Live code execution** | JavaScript, TypeScript, Python, Go, Rust, C, C++, C#, Kotlin, Scala, Swift, Zig, Bash, PHP, WebAssembly, Assembly via system compilers/interpreters. Sandboxed with `ulimit`, concurrent execution queue, and 30s timeout. Docker sandbox also available for isolated execution. |
| **SQL database lab** | Execute SQL queries against a seeded in-memory SQLite database (20+ tables, 7 schemas). Optional PostgreSQL/MySQL via env vars. Results formatted as ASCII tables. |
| **Schema designer** | Full visual database schema designer with Design and ERD views, drag tables, FK click-to-link, column constraints (PK, NOT NULL, UNIQUE, DEFAULT), index management, multi-dialect SQL generation (PostgreSQL, MySQL, SQLite), SQL import/export, JSON export/import, undo/redo (Ctrl+Z/Y), version history, auto-layout, and auto-updating SQL preview. |
| **Compiler pipeline explorer** | Client-side tokenizer, recursive-descent AST parser, and code statistics engine for any supported language. Step-through pipeline: source → tokens → AST → stats. |
| **AI tutor** | Hybrid keyword + tiny-LLM tutor by default, with 52+ curated responses + 24 topic-specific tutored responses + language-aware conversation context + TF-IDF curriculum search across all 71 content files. Optional LLM backends: OpenAI, Anthropic, Google Gemini, local Ollama/LM Studio with SSE streaming. |
| **Quiz mode** | Per-language multiple-choice quizzes with instant feedback and progress tracking (71 languages/tabs, 3 difficulty levels each, 21,300+ total questions). Covers all programming languages, frameworks, databases, cloud platforms, dev tools, and concept tabs. |
| **Code challenges** | 22,290+ bug-fixing challenges across 74 languages/tabs — each with bug code, solution code, and test validation. Covers all programming languages, databases, cloud platforms, dev tools, frameworks, and concept tabs (backend, CI/CD, compiler, gamedev, mobile, AI, etc.). |
| **Projects tab** | 54 hands-on projects across beginner to advanced levels (hello-world, calculator, todo-list, weather-dashboard, chat app, chess validator, etc.) with step-by-step instructions, built-in code editor, preview pane, and progress tracking. |
| **Styling Grounds** | Interactive CSS visualizer with 8 scenarios (box model, flexbox, CSS grid, positioning, borders/shadows, typography, colors/gradients, transforms). Edit CSS live and see results instantly. |
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
| **Git visualizer** | Interactive Git learning mode with visualized branching, commits, merges, rebases, cherry-picks, squash, freeplay sandbox, and an interactive command terminal. |
| **Tech Stack mode** | Explore full technology stacks (backend, frontend, database, DevOps) for different application types. |
| **Roadmap view** | SVG-based visual learning roadmap for topic progression. |
| **Code editor file integration** | Load `.js`/`.py`/etc. files from disk via `<input type="file">` and FileReader. |
| **Dynamic theming** | Language-specific accent colors applied via CSS custom properties (`--js`, `--py`, `--go`, etc.) across all UI elements. |

---

## Supported Topics

### Programming Languages (curriculum + code execution)
JavaScript, TypeScript, Python, Go, Rust, Zig, C, C++, C#, Kotlin, Scala, Swift, Bash, PHP, Ruby, Lua, Java, WebAssembly, Assembly, HTML, CSS — each with full topic trees and live server-side execution (HTML/CSS rendered client-side).

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

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Svelte 5 + SvelteKit + Tailwind CSS v4 + Shadcn-Svelte |
| Frontend (legacy) | Vanilla JS (TypeScript-compiled) |
| Backend (primary) | Rust (Axum 0.8, async, tokio) |
| Backend (fallback) | Node.js (Express 4, TypeScript via tsx) |
| Database (SQL) | SQLite (better-sqlite3 / rusqlite), optional PostgreSQL + MySQL |
| AI | Hybrid keyword + Transformers.js (default, no API key), OpenAI, Anthropic, Google Gemini, local Ollama/LM Studio |
| Code execution | 19 language runtimes via subprocess + Docker sandbox |
| Code bundler | Vite 6 (Svelte), esbuild (AI data), tsc (TypeScript), Cargo (Rust) |
| Deploy | Docker (+ Docker Compose), Netlify (serverless) |
| Testing | Vitest (frontend/Node), Cargo test (Rust) |

---

## Prerequisites

- **Rust 1.80+** (for primary backend) — [Download](https://rustup.rs/)
- **Node.js 18+** (for fallback backend & frontend build) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized setup) — [Download](https://www.docker.com/products/docker-desktop/)
- **Ollama** (optional, for local AI) — [Download](https://ollama.ai/download)
- System compilers/interpreters for languages you want to execute (or use Docker)

---

## Quick Start

### Docker (Recommended — includes all runtimes)

The Docker setup runs the **Rust backend** by default on port 3001. Node.js fallback is available via the `fallback` profile.

```bash
# Build and start the application
docker compose build
docker compose up
```

Open http://localhost:3001

To run the Node.js fallback instead:

```bash
docker compose --profile fallback up
```

To run in detached mode:

```bash
docker compose up -d
```

To stop:

```bash
docker compose down
```

### Rust Backend (Direct)

```bash
# 1. Build and run the Rust backend
cargo run --release
```

The Rust server starts on port 3001 by default (configurable via `PORT` env var).

For development with hot-reload (requires `cargo-watch`):

```bash
cargo watch -x run
```

### Node.js Backend (Fallback)

```bash
# 1. Install dependencies
npm install

# 2. Build browser assets and AI data
npm run build:ai
npm run build:browser

# 3. Start the server
npm start
```

Open http://localhost:3000

For development with hot-reload:

```bash
npm run dev
```

### Svelte Frontend (Development)

The Svelte 5 frontend runs on its own dev server and proxies `/api` calls to the backend:

```bash
# Development server (proxies /api to http://localhost:3000)
npm run dev:svelte
```

Open http://localhost:5173

For production build:

```bash
npm run build:svelte
npm run preview:svelte
```

---

## Ollama AI Setup

Kodex supports running AI locally using **Ollama**, giving you a free, private, offline AI tutor. Follow these steps:

### 1. Install Ollama

**Windows & macOS:** Download from [ollama.ai](https://ollama.ai/download) and install.

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start the Ollama Server

Ollama runs as a background service by default after installation.

```bash
# Verify it's running
ollama serve
```

If it's already running as a service, just confirm it's available:
```bash
curl http://localhost:11434/api/tags
```

### 3. Pull a Model

Choose a model based on your hardware:

```bash
# Lightweight (2GB RAM, runs on most machines)
ollama pull llama3.2

# Medium (4GB RAM, good balance of speed and quality)
ollama pull mistral

# Larger (8GB+ RAM, best quality)
ollama pull llama3.3
ollama pull codellama

# Fast and capable (4GB RAM)
ollama pull neural-chat

# Specialized for code (4GB RAM)
ollama pull deepseek-coder
```

**Recommended for programming:** `ollama pull llama3.2` or `ollama pull mistral`.

### 4. Configure Kodex to Use Ollama

Copy the environment file and edit it:

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
# Set AI provider to "local" for Ollama
AI_PROVIDER=local

# Ollama endpoint (default)
LOCAL_LLM_ENDPOINT=http://localhost:11434/v1

# Model you pulled (e.g., llama3.2, mistral, codellama)
LOCAL_LLM_MODEL=llama3.2
```

### 5. Run Kodex with Ollama

```bash
npm start
```

The server will auto-detect Ollama on startup and log:
```
[Ollama] Detected at http://localhost:11434
[Ollama] Available models: llama3.2, mistral
```

### Using Ollama with Docker Compose

Uncomment the Ollama service in `docker-compose.yml`:

```yaml
services:
  app:
    # ... your app config
    environment:
      - AI_PROVIDER=local
      - LOCAL_LLM_ENDPOINT=http://ollama:11434/v1
      - LOCAL_LLM_MODEL=llama3.2

  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

volumes:
  ollama_data:
```

Then start everything:

```bash
docker compose up -d
# Pull a model inside the container
docker exec -it kodex-ollama-1 ollama pull llama3.2
```

### Troubleshooting Ollama

```bash
# Check if Ollama is running
ollama list

# Check the Ollama API directly
curl http://localhost:11434/api/tags

# View Ollama logs (Linux/macOS)
journalctl -u ollama -f

# Test a prompt
curl http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"Hello"}'
```

Kodex auto-detects Ollama at startup. If it's not detected, the app falls back to keyword/hybrid mode gracefully.

### Other LLM Backend Options

**OpenAI:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

**Anthropic:**
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

**Google Gemini:**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
```

**LM Studio (alternative local server):**
```bash
AI_PROVIDER=local
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
LOCAL_LLM_MODEL=local-model
```

---

## AI Module Configuration

The AI system (`ai/`) is a full-stack TypeScript module supporting multiple providers configured via `.env`:

| Provider | Description | API Key Required |
|----------|-------------|-----------------|
| `hybrid` | (Default) Keyword cascade + Transformers.js tiny model fallback. Works out of the box, no setup needed. | No |
| `keyword` | Free, no API key, uses pattern matching only (good for learning, no downloads) | No |
| `openai` | GPT-4, GPT-3.5, etc. with SSE streaming support | Yes |
| `anthropic` | Claude models with SSE streaming support | Yes |
| `gemini` | Google Gemini models | Yes |
| `local` | Ollama, LM Studio, etc. (requires local server running) | No |

### AI Architecture

```
User Message
    │
    ▼
Execute Strategies (tries each in order):
    ├── 1. Greeting Strategy      — Detects and responds to greetings
    ├── 2. Error Help Strategy    — Detects error messages and offers debugging help
    ├── 3. Follow-up Strategy     — Resolves pronouns to previous topic context
    ├── 4. Keyword Match Strategy — Matches curated responses to known topics
    ├── 5. Semantic Search        — TF-IDF / Embedding search across curriculum
    ├── 6. Socratic Strategy      — Asks guiding questions instead of direct answers
    └── 7. LLM Strategy           — Forwards to configured LLM provider with SSE streaming
```

The curriculum search pipeline:
1. **Curriculum index** — regex-based topic extraction from 69+ JSON course files (3,571+ topics)
2. **TF-IDF** (always available) — keyword-based relevance scoring with cosine similarity
3. **OpenAI embeddings** (if API key configured) — semantic vector search via `text-embedding-3-small` with batch caching to disk

The system prompt is customizable via `AI_SYSTEM_PROMPT` in `.env`.

---

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Core Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Runtime environment |

### AI Provider Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `hybrid` | One of: `hybrid`, `keyword`, `openai`, `anthropic`, `gemini`, `local` |
| `AI_MAX_TOKENS` | `1024` | Max tokens in AI responses |
| `AI_SYSTEM_PROMPT` | *(built-in)* | Custom system prompt for AI tutor |

### Provider-Specific Keys

| Variable | Required For |
|----------|--------------|
| `OPENAI_API_KEY` | OpenAI provider |
| `OPENAI_MODEL` | OpenAI provider (default: `gpt-4o-mini`) |
| `ANTHROPIC_API_KEY` | Anthropic provider |
| `ANTHROPIC_MODEL` | Anthropic provider (default: `claude-3-haiku-20240307`) |
| `GEMINI_API_KEY` | Gemini provider |
| `GEMINI_MODEL` | Gemini provider (default: `gemini-2.0-flash`) |
| `LOCAL_LLM_ENDPOINT` | Local/Ollama provider (default: `http://localhost:11434/v1`) |
| `LOCAL_LLM_MODEL` | Local/Ollama provider (default: `llama3.2`) |

### Database Connections (Optional)

| Variable | Description |
|----------|-------------|
| `PG_CONNECTION_STRING` | PostgreSQL connection string for live SQL execution |
| `MYSQL_CONNECTION_STRING` | MySQL connection string for live SQL execution |

### Hybrid Tutor Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `TINY_LLM_MODEL` | `Xenova/gte-small` | Transformers.js model for hybrid mode |
| `TINY_LLM_CACHE_DIR` | *(default)* | Custom cache directory for model files |

### Learner Profile Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `STALE_TOPIC_DAYS` | `90` | Archive completed topics older than N days |
| `MAX_TOPICS_PER_LANG` | `500` | Maximum active topics stored per learner |

---

## Project Structure

```
├── Cargo.toml                # Rust workspace root (7 crates)
├── crates/                   # Rust backend (primary)
│   ├── kodex-core/           #   Common types, config, error handling
│   ├── kodex-sql/            #   Database connection pool & models
│   ├── kodex-api/            #   API route handlers
│   ├── kodex-ai/             #   AI providers, strategies, conversation
│   ├── kodex-executor/       #   Code execution sandbox (subprocess + Docker)
│   ├── kodex-websocket/      #   WebSocket server (axum ws)
│   └── kodex-server/         #   Main entrypoint: Axum HTTP server
├── backend/                  # Node.js backend (fallback)
│   ├── server.ts             #   Express server boot, WebSocket, cleanup
│   ├── routes/               #   HTTP handlers (Express routers)
│   ├── services/             #   Business logic layer
│   ├── middleware/            #   Express middleware
│   ├── ai/                   #   AI orchestration (TS version)
│   ├── sql/                  #   SQLite initialization, seed data
│   ├── content/              #   Curriculum JSON files (71+ files)
│   ├── data/                 #   Runtime state and learner profiles
│   ├── rust/                 #   Legacy Rust backend (superseded by root crates/)
│   └── scripts/              #   Build and maintenance helpers
├── src/                      # Svelte 5 frontend (primary)
│   ├── routes/               #   SvelteKit routes ([lang]/, game/, git/, etc.)
│   ├── lib/components/       #   UI components (ai, canvas, challenge, etc.)
│   ├── lib/stores/           #   App state stores
│   └── lib/lib/              #   Utilities
├── public/                   # Legacy browser app (vanilla HTML/CSS/JS)
│   ├── index.html            #   Main entry point
│   ├── app.js                #   Main application logic
│   ├── style.css             #   Main stylesheet
│   ├── app-data.js           #   Aggregated curriculum data
│   └── ...                   #   Schema designer, DB lab, games, etc.
├── netlify/                  # Netlify serverless function entry
├── docker/                   # Language sandbox Dockerfiles
├── tests/                    # Integration and service tests
├── docs/                     # Documentation
├── content/                  # Aggregated curriculum data (app-data.json)
├── data/                     # Runtime state and learner profiles
├── docker-compose.yml        # Docker Compose (rust-backend default)
├── Dockerfile                # Node.js Docker image (all runtimes)
├── docker-entrypoint.sh      # Container startup script
├── package.json              # Node.js dependencies + npm scripts
├── svelte.config.js          # SvelteKit configuration
├── vite.config.js            # Vite configuration (Svelte + API proxy)
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json             # TypeScript configuration (Node backend)
├── vitest.config.ts          # Vitest test configuration
└── netlify.toml              # Netlify deployment config
```

---

## Scripts Reference

| Command | Purpose |
|---------|---------|
| **Rust Backend** | |
| `cargo run --release` | Build & run the Rust backend (port 3001) |
| `cargo run` | Build & run Rust backend in debug mode |
| `cargo test` | Run Rust test suite across all crates |
| `cargo watch -x run` | Run Rust with hot-reload (requires `cargo-watch`) |
| `npm run start:rust` | Shortcut for `cd backend/rust && cargo run` (legacy Rust) |
| **Node.js Backend** | |
| `npm start` | Build AI + browser assets, then run Express server (port 3000) |
| `npm run dev` | Same as `start` but with file watch / hot-reload (tsx watch) |
| `npm run build` | Build AI data, browser TS, and compile server TS |
| `npm run build:ai` | Build AI response data for browser (esbuild) |
| `npm run build:browser` | Build browser TypeScript to JS |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | `tsc --noEmit` type-check without writing output |
| **Svelte Frontend** | |
| `npm run dev:svelte` | Start SvelteKit dev server (port 5173, proxies `/api` to backend) |
| `npm run build:svelte` | Build Svelte production bundle |
| `npm run preview:svelte` | Preview Svelte production build |

---

## API Endpoints

All endpoints are served by both the **Rust backend** (port 3001, primary) and the **Node.js fallback** (port 3000). Rate limiting: 30 requests per 60 seconds per IP across all `/api/*` routes.

### Health & System
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check: node version, compiler availability, database status, rate limit info, Ollama status |
| GET | `/api/ws/stats` | WebSocket connection statistics |

### Progress
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/progress` | Get all topic completion progress |
| POST | `/api/progress` | Save topic completion `{lang, topic, completed}` |

### Code Execution
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/execute` | Execute code `{lang, code, stdin?}` — supports py, go, ts, rs, c, cpp, cs, kt, swift, wasm, asm, zig, bash, php, scala, lua, java, rb, sqlite, pg, mysql |
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
| POST | `/api/learner/feedback` | Submit feedback on AI response `{rating, responseId?}` |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/benchmark` | Performance benchmark (Node.js vs Go) `(?n=iterations)` |
| GET | `/api/metrics` | Prometheus application metrics |
| GET | `/api/openapi.json` | OpenAPI specification |
| GET | `/api/docs` | Swagger UI documentation |

---

## Code Execution Runtimes

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
| Lua | `lua` | `ulimit -v 262144 -t 30` |
| Java | `javac` + `java` | `ulimit -v 262144 -t 30` |
| Ruby | `ruby` | `ulimit -v 262144 -t 30` |
| SQLite / PostgreSQL / MySQL | Built-in database engine | Concurrency-guarded |

All execution is limited to 256MB virtual memory, 30s CPU time, and a maximum of 4 concurrent processes. Docker sandbox images are also available for each language (see Docker section).

---

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

---

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

---

## Compiler Pipeline Explorer

The Compiler tab provides a client-side multi-language tokenizer and recursive-descent parser:

1. **Tokens** — Lexical analysis: splits source into token stream (keywords, identifiers, literals, operators, delimiters, etc.)
2. **AST** — Abstract Syntax Tree: language-aware parser builds a structured tree
3. **Stats** — Code metrics: LOC, comment ratio, cyclomatic complexity, nesting depth, token counts

Supports all execution languages plus SQL-like syntax.

---

## REST API Client

The workspace includes a full Thunderclient-style HTTP client:

- Method selection (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- URL input with send button
- Headers editor (key-value pairs)
- Body tab with JSON, text, and form-data modes
- Auth tab with Bearer token and Basic auth
- Response display with status code, headers, and pretty-printed JSON

---

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

---

## Docker Configuration

### Rust Backend (default)

The `docker-compose.yml` runs the **Rust backend** on port 3001 by default. The image is built from `backend/rust/Dockerfile` and includes all API routes, WebSocket support, and middleware.

```bash
docker compose build
docker compose up
```

Open http://localhost:3001

### Node.js Backend (fallback profile)

The root `Dockerfile` builds a single image with all 19 language runtimes pre-installed, alongside the Express backend. Run it with the `fallback` profile:

```bash
docker compose --profile fallback up
```

Open http://localhost:3000

The `docker-entrypoint.sh` script verifies all runtimes at container startup.

### Per-Language Sandbox Images

Individual sandbox images are available in `docker/` for isolated code execution (used by the Docker executor):

```bash
bash docker/build-all.sh
```

Or build a single language sandbox:

```bash
docker build -t kodex-scala -f docker/Dockerfile.scala docker/
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
| `kodex-lua` | Lua | alpine:latest (lua5.4) |
| `kodex-java` | Java | eclipse-temurin:22-jdk |
| `kodex-rb` | Ruby | ruby:3.3 |
| `kodex-sqlite` | SQLite | nixos:latest |
| `kodex-pg` | PostgreSQL | postgres:16 |
| `kodex-mysql` | MySQL | mysql:8.0 |

---

## Learner Profiles

Per-user profiles track progress using SM-2 spaced repetition:

- Review intervals: 1, 3, 7, 14, 30 days
- Tracks: topic completions, errors, attempts, quiz scores, challenge completions, AI interactions
- Concept mastery: per-language proficiency scoring
- Recommendations: due reviews → weakest concepts → next topic in sequence

Profiles are stored as JSON in `data/learners/` with fallback to `/tmp/kodex-lab-learners/`.

---

## Course Data Format

Course files in `content/` are 71+ JSON files with topics organized by phase (now includes AI/ML curriculum):

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

## Deployment

### Docker

The Rust backend runs on port 3001 by default. Use the `fallback` profile for the Node.js backend.

```bash
# Rust backend (default)
docker compose up -d

# Node.js backend
docker compose --profile fallback up -d
```

### Netlify

The project is configured for Netlify deployment:

- `netlify.toml` maps `/api/*` to the unified serverless function
- `netlify/functions/api.js` handles all API routes through a single function handler
- Static files are served from the root directory
- No build step required for the frontend (vanilla HTML/CSS/JS)
- TypeScript compilation (`npm run build`) is needed after changing TypeScript sources

---

## UI Features

- **Header extra tabs** — Backend, CI/CD, Code Lab, Compiler, DB Lab, Projects, GameDev, Gaming, Git Grounds, Mobile, Quiz, Learn Code, Tech Stack, Styling Grounds — each with distinct accent colors and hover effects
- **Engine filter bar** — Filter gamedev topics by engine (All Engines / Godot / Unity / Unreal), shows only engine-specific phases
- **Platform filter bar** — Filter mobile topics by platform (All / Android / iOS), shows only platform-specific phases
- **Cyberpunk-themed header** — Animated "Just code — don't overthink" motto with glow/flicker CSS effects
- **Devin mascot** — Animated SVG backpack robot with talking animation (triggered by Tab in AI input)
- **Roadmap view** — SVG-based visual learning roadmap for topic progression
- **Language-specific theming** — Dynamic accent colors per language via CSS custom properties
- **Skeleton loading** — Placeholder UI while curriculum content lazy-loads
- **File integration** — Load local source files into the editor via file picker
- **Collapsible phases** — Expand/collapse all phases, with per-phase completion counters

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source. See the LICENSE file for details.
