# Doge's Lab

An interactive multi-language programming textbook and code playground. Learn 15+ programming languages with built-in code execution, quizzes, challenges, an AI assistant, and a PostgreSQL schema designer.

## Features

- **Multi-language curriculum** — JavaScript, TypeScript, Python, Go, Rust, Zig, C, C++, C#, Kotlin, Swift, PostgreSQL, Docker, Git, MongoDB, GameDev
- **Live code execution** — Run code server-side (JS, Python, Go, Rust, C, C++, C#, Kotlin, Swift, TypeScript, Zig) or client-side (JS)
- **AI assistant** — Keyword-based Q&A about programming concepts, searches curriculum for relevant examples
- **Quiz mode** — Per-language multiple-choice quizzes with instant feedback
- **Code challenges** — Bug-fixing exercises with automated JS test evaluation
- **Schema designer** — Visual PostgreSQL table designer with drag-and-drop FK relationships, generates DDL SQL
- **Benchmarking** — Compare Node.js vs Go backend performance
- **Progress tracking** — Server-persistent topic completion per language
- **Code analysis** — Static analysis with hints for common mistakes, error message explanations
- **Auto-complete & smart indent** — Editor helper with keyword completion, bracket pairing, and auto-indentation

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | Vanilla HTML/CSS/JS         |
| Backend  | Node.js (Express) or Go     |
| Runtime  | Node.js 18+, Go 1.21+       |
| Deploy   | Netlify (static + functions)|

## Project Structure

```
acadamic/
├── server.js              # Node.js Express backend
├── index.html             # Single-page frontend app
├── package.json           # Node.js dependencies
├── data/                  # Course content & frontend JS
│   ├── app.js             # Frontend application logic
│   ├── courseData.js      # Course metadata
│   ├── style.css          # Stylesheet
│   ├── js.js, py.js, ...  # Language-specific course data
│   ├── quiz.js            # Quiz questions
│   └── challenges.js      # Code challenges
├── backend-go/            # Alternative Go backend
│   ├── main.go
│   └── go.mod
├── netlify/               # Netlify serverless functions
│   └── functions/
│       ├── benchmark.js
│       ├── chat.js
│       ├── execute.js
│       └── progress.js
└── netlify.toml           # Netlify deployment config
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

| Method | Path              | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/api/progress`   | Get all progress data              |
| POST   | `/api/progress`   | Save topic completion              |
| POST   | `/api/execute`    | Execute code in specified language |
| POST   | `/api/analyze`    | Static code analysis               |
| POST   | `/api/chat`       | AI assistant chat                  |
| GET    | `/api/benchmark`  | Performance benchmark              |
| GET    | `/api/courses`    | List available course files        |

## Course Data Format

Course files in `data/` export language topics organized by phase:

```js
const courseData = {
  py: {
    "Basics": {
      "Variables": {
        exp: "<p>Explanation HTML</p>",
        code: "// Example code",
        level: "beginner"
      }
    }
  }
};
```

## Supported Languages for Execution

JS runs in a sandboxed VM on the server (or client-side eval fallback). All other languages execute via the local system's compiler/interpreter.

## Deployment

The project is configured for Netlify deployment via `netlify.toml`.
