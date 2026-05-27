# Project Layout

This codebase is intentionally large, but it becomes easier to work with if you separate:

- source files
- generated artifacts
- scratch or sample files

## Source Of Truth

- `server.ts` for the Node/Express bootstrap
- `routes/` for API endpoints
- `services/` for backend runtime logic
- `middleware/` for shared Express middleware
- `sql/database.ts` for the SQL engine implementation
- `ai/` for AI and tutor logic
- `core-typescript/*.ts` for the browser app feature slices and mode handling
- `core-typescript/app-core.ts` for the browser app shell
- `core-typescript/app-run.ts` for run/debug/review flow
- `core-typescript/app-editor.ts` for editor helpers and completions
- `core-typescript/app-ai.ts` for AI chat, prompts, and tutor flow
- `core-typescript/app-layout.ts` for mode switching and layout wiring
- `core-typescript/app-quiz-challenge.ts` for quiz/challenge modes
- `browser-build/core-typescript/*.js` for the generated browser outputs that `index.html` loads
- `public/styles/*.css` for the stylesheet slices
- `public/style.css` as the stylesheet entry point that imports the component files
- `content/*.json` for curriculum data

## Generated Or Build-Adjacent Files

These files are useful, but they are not the best place to make manual edits:

- `content/app-data.json`
- `public/app-data.js`
- `public/app-data-globals.js`
- `public/ai/*.js`
- `public/components/*.js` no longer exists; browser JS now lands in `browser-build/core-typescript/*.js`
- `sql/database.js`
- `dist/*`

## Files That Are Hard To Read Today

These are the best candidates for future refactoring because they are doing too much at once:

- `public/compiler-core.js`
- `index.html`
- `browser-build/core-typescript/app-ai.js`
- `browser-build/core-typescript/app-layout.js`
- `public/styles/base.css`
- `public/styles/tutorial-overlays.css`

## Likely Next Refactor Steps

1. Continue splitting `core-typescript/` by feature:
   - bootstrap
   - navigation
   - landing
   - editor helpers
   - per-mode modules
2. Continue splitting `public/styles/` by concern:
   - base
   - layout
   - shared components
   - mode-specific styles
3. Keep browser JS outputs in `browser-build/core-typescript/` and source in `core-typescript/`.
4. Keep only one source file per runtime module when possible.

## Files To Leave Alone For Now

These are related to runtime behavior or user workflows, so moving them should wait until their references are updated:

- `program.kt`
- `Main.scala`
- `coordinate.sh`
- `payload.json`
- `.env` files
