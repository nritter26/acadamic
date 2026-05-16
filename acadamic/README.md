# Doge's Lab: Full Mastery Edition

An interactive multi-language programming textbook, code playground, and compiler pipeline explorer. Learn 22+ programming languages and tools with built-in code execution, quizzes, challenges, an AI tutor, SQL database lab, and a visual schema designer.

## Features

| Feature | Description |
|---------|-------------|
| **Multi-language curriculum** | JavaScript, TypeScript, Python, Go, Rust, Zig, C, C++, C#, Kotlin, Swift, PostgreSQL, MySQL, SQLite, MongoDB, Docker, Git, GameDev, Firebase, AWS, Azure, GCP, Cloud |
| **Live code execution** | Server-side (JS, Python, Go, Rust, C, C++, C#, Kotlin, Swift, TypeScript, Zig) or client-side (JS). All languages run via local system compilers/interpreters. |
| **SQL database lab** | Execute SQL queries against a seeded in-memory SQLite database (20 tables, 6 schemas). Optional PostgreSQL/MySQL via env vars. Results formatted as ASCII tables. |
| **Compiler pipeline explorer** | Visual tokenization, AST parsing, and statistics for any supported language. Step-through pipeline shows source → tokens → AST → stats. |
| **AI tutor** | Keyword-based Q&A (no API key needed) or pluggable LLM backends (OpenAI, Anthropic, local Ollama). Searches curriculum for relevant examples. |
| **Quiz mode** | Per-language multiple-choice quizzes with instant feedback and progress tracking. |
| **Code challenges** | 390 bug-fixing/implementation challenges across 3 difficulty levels (130 beginner, 130 intermediate, 130 expert) with automated JS test evaluation. |
| **Schema designer** | Visual PostgreSQL table designer with drag-and-drop FK relationships, generates DDL SQL. |
| **Code analysis** | Static analysis with keyword pattern checks (JS, Python, Go, Rust), balanced delimiter detection, and optional LLM-powered deep review. |
| **AI exercises** | On-demand generated practice exercises per topic/level — fix-bug, fill-blank, write-function, refactor, optimize, design. |
| **Learner profile** | Per-user progress tracking with spaced-repetition review scheduling, concept mastery metrics, and personalized topic recommendations. |
| **Benchmarking** | Compare Node.js vs Go backend performance with configurable iterations. |
| **Auto-complete & smart indent** | Editor helper with keyword completion, bracket pairing, and auto-indentation across all languages. |
| **Cheatsheet** | Per-language quick-reference cheatsheet with syntax, idioms, and common patterns. |

## Supported Languages

### Curriculum (full topic trees)
JavaScript, TypeScript, Python, Go, Rust, Zig, C, C++, C#, Kotlin, Swift, PostgreSQL, MySQL, SQLite, MongoDB, Docker, Git, GameDev, Firebase, AWS, Azure, GCP, Cloud, Compiler Design

### Code Execution
| Runs server-side | Runtime |
|-----------------|---------|
| JavaScript | `node` (sandboxed VM) |
| TypeScript | `ts-node` or `npx tsx` |
| Python | `python3` |
| Go | `go run` |
| Rust | `rustc` + run |
| C | `gcc` + run |
| C++ | `g++` + run |
| C# | `dotnet script` or `mono` |
| Kotlin | `kotlinc` + `kotlin` |
| Swift | `swift` |
| Zig | `zig run` |
| SQLite / PostgreSQL / MySQL | Built-in database engine |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS, no framework |
| Backend | Node.js (Express) or Go (alternative) |
| Runtime | Node.js 18+, Go 1.22+ |
| Database (SQL) | better-sqlite3 (built-in), optional pg + mysql2 |
| AI | Keyword matching (default), OpenAI, Anthropic, local Ollama/LM Studio |
| Deploy | Netlify (static + serverless functions) |

## Project Structure

```
acadamic/
├── server.js                    # Express backend (1046 lines)
├── index.html                   # Single-page frontend app
├── package.json                 # Dependencies & scripts
├── .env.example                 # Env var template
├── netlify.toml                 # Netlify deployment config
│
├── data/                        # Frontend app & course content
│   ├── app.js                   # Main frontend logic (~8300 lines)
│   ├── courseData.js            # Course metadata container
│   ├── langConfig.js            # Language code ↔ name mappings
│   ├── style.css                # Application stylesheet
│   ├── compiler-core.js         # Multi-language lexer/parser/AST
│   ├── compiler-curriculum.js   # Compiler design curriculum
│   ├── challenges.js            # 390 code challenges
│   ├── quiz.js                  # Quiz questions per language
│   ├── game.js                  # Gaming mode logic
│   ├── db.js                    # Database tab frontend
│   ├── js.js, py.js, ...        # Language-specific course data
│   └── learners/                # Per-user learner profiles (JSON)
│
├── ai/                          # AI tutoring & analysis engine
│   ├── config.js                # Provider config (keyword/openai/anthropic/local)
│   ├── provider.js              # LLM request handler with streaming
│   ├── curriculum.js            # Curriculum index builder & keyword search
│   ├── embeddings.js            # TF-IDF + OpenAI embedding semantic search
│   ├── learner.js               # Spaced-repetition learner profile
│   ├── reviewer.js              # Static + LLM code review
│   └── exercises.js             # On-demand exercise generation
│
├── sql/                         # SQL database engine
│   ├── database.js              # SQLite in-memory DB + PG/MySQL pools
│   └── seed.sql                 # Sample data (20 tables, 6 schemas)
│
├── backend-go/                  # Alternative Go backend
│   ├── main.go                  # Go HTTP server (333 lines)
│   └── go.mod                   # Go module definition
│
└── netlify/                     # Netlify serverless functions
    └── functions/
        ├── benchmark.js
        ├── chat.js
        ├── execute.js
        └── progress.js
```

## Quick Start

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

## API Endpoints

### Progress
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/progress` | Get all progress data |
| POST | `/api/progress` | Save topic completion |

### Code Execution
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/execute` | Execute code in specified language (supports js, ts, py, go, rs, zig, c, cpp, cs, kt, swift, sqlite, pg, mysql) |
| POST | `/api/proxy` | Proxy HTTP requests (client-side execution helper) |

### Analysis
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Static code analysis with keyword patterns |
| POST | `/api/review` | Full code review (static + optional LLM) |
| POST | `/api/explain` | Code explanation with curriculum context |

### AI & Tutor
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | AI assistant chat with curriculum-aware responses |
| POST | `/api/exercise` | Generate on-demand practice exercise |
| GET | `/api/health` | Health check with DB status |

### Learner Profile
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/learner/track` | Track topic completion, errors, attempts, quizzes, challenges |
| GET | `/api/learner/state` | Get learner profile & concept mastery |
| GET | `/api/learner/reviews` | Get due reviews (spaced repetition) |
| GET | `/api/learner/recommend` | Get next recommended topic |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/benchmark` | Performance benchmark (Node.js vs Go) |
| GET | `/api/courses` | List available course files |

## AI Module

The AI system supports multiple providers configured via `.env`:

- **`keyword`** (default, no API key needed) — Pattern-matches user questions against the curriculum index, returns relevant topic explanations.
- **`openai`** — Set `AI_PROVIDER=openai` + `OPENAI_API_KEY`. Uses GPT models with streaming support.
- **`anthropic`** — Set `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`. Uses Claude models with streaming support.
- **`local`** — Set `AI_PROVIDER=local`. Connects to any OpenAI-compatible local endpoint (Ollama, LM Studio, etc.).

The curriculum search uses:
1. **OpenAI embeddings** (if API key is configured) — semantic vector search via `text-embedding-3-small`
2. **TF-IDF** (always available) — keyword-based relevance scoring
3. **Curriculum index** — regex-based topic extraction from course data files

Learner profiles track per-user progress using spaced repetition with review intervals at 1, 3, 7, 14, 30 days.

## SQL Execution (Database Tab)

The Database tab includes a built-in SQLite engine seeded with 20 tables across 6 schemas:

| Schema | Tables |
|--------|--------|
| HR | employees, departments, salaries |
| Commerce | customers, orders, order_items, products, categories |
| Education | students, courses, enrollments |
| Content | authors, articles, comments |
| Supply Chain | suppliers, shipments, inventory |
| Banking | accounts, transactions |

- **SQLite** — Always available, no setup needed. In-memory, resets on server restart.
- **PostgreSQL** — Optional. Set `PG_CONNECTION_STRING` in `.env`.
- **MySQL** — Optional. Set `MYSQL_CONNECTION_STRING` in `.env`.

Results are formatted as ASCII box-drawing tables. Multiple semicolon-separated statements are supported.

## Compiler Pipeline Explorer

The Compiler tab provides a client-side multi-language tokenizer and parser:

1. **Tokens** — Lexical analysis: splits source into token stream (keywords, identifiers, literals, operators, etc.)
2. **AST** — Abstract Syntax Tree: recursive descent parser builds a structured tree
3. **Stats** — Code metrics: LOC, comment ratio, cyclomatic complexity, nesting depth, token counts

## Course Data Format

Course files in `data/` export language topics organized by phase:

```js
courseData.py = {
  "Basics": {
    "Variables": {
      exp: "<p>Explanation HTML</p>",
      code: "// Example code",
      level: "beginner"
    }
  }
};
```

## Deployment

The project is configured for Netlify deployment:

- `netlify.toml` maps `/api/*` to serverless functions
- Functions in `netlify/functions/` handle execute, chat, progress, and benchmark
- Static files are served from the root directory
