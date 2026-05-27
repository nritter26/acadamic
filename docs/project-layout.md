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
- `public/app.js` for the browser app shell and mode switching
- `public/style.css` for the application stylesheet
- `content/*.json` for curriculum data

## Generated Or Build-Adjacent Files

These files are useful, but they are not the best place to make manual edits:

- `content/app-data.json`
- `public/app-data.js`
- `public/app-data-globals.js`
- `public/ai/*.js`
- `sql/database.js`
- `dist/*`

## Files That Are Hard To Read Today

These are the best candidates for future refactoring because they are doing too much at once:

- `public/app.js`
- `public/style.css`
- `public/compiler-core.js`
- `index.html`

## Likely Next Refactor Steps

1. Split `public/app.js` by feature:
   - bootstrap
   - navigation
   - landing
   - editor helpers
   - per-mode modules
2. Split `public/style.css` by concern:
   - base
   - layout
   - shared components
   - mode-specific styles
3. Move generated browser assets into a clearer build output folder.
4. Keep only one source file per runtime module when possible.

## Files To Leave Alone For Now

These are related to runtime behavior or user workflows, so moving them should wait until their references are updated:

- `program.kt`
- `Main.scala`
- `coordinate.sh`
- `payload.json`
- `.env` files

