# 🌏 Language Porting Plan: English → Thai

## Objective
Translate all programming curriculum content from English to Thai using native in-app toggling (replaces old Google Translate).

## Architecture

### Content Storage
- English: `backend/node/content/{lang}.json` (unchanged)
- Thai: `backend/node/content/{lang}_th.json` (new)
- The content API (`/api/content/{lang}`) serves both — the curriculum store appends `_th` suffix when Thai is selected

### UI Toggle
- **Header**: `lang-btn` button (already exists) → shows `EN`/`TH`
- **LangPopup**: Replaced Google Translate with native curriculum language toggle
- **Curriculum Store**: New `uiLang` state — `'en'` or `'th'` — controls which content files load

### Branch Strategy
- Branch: `language-porting`
- 1 task = 1 commit
- Sequential commits for traceability

## Sub-Tasks (18 total)

### Phase 1: Infrastructure (Setup)
1. **PLAN.md + branch** — Write this plan, ensure on `language-porting` branch
2. **Remove Google Translate** — Strip from LangPopup.svelte, Header.svelte, translate.js, +layout.svelte, app.html. Keep only native toggle
3. **Native language toggle** — Add `uiLang` to curriculum store, modify LangPopup + Header to use native toggle instead of Google Translate

### Phase 2: Content Translation (JSON files)
4. **SUB-TASK 1: JavaScript** — Translate `js.json` → `js_th.json`
5. **SUB-TASK 2: Python** — Translate `py.json` → `py_th.json`
6. **SUB-TASK 3: TypeScript** — Translate `ts.json` → `ts_th.json`
7. **SUB-TASK 4: Go** — Translate `go.json` → `go_th.json`
8. **SUB-TASK 5: Rust** — Translate `rust.json` → `rust_th.json`
9. **SUB-TASK 6: Java** — Translate `java.json` → `java_th.json`
10. **SUB-TASK 7: C, C++, C#** — Translate `c.json`, `cpp.json`, `cs.json` → `c_th.json`, `cpp_th.json`, `cs_th.json`
11. **SUB-TASK 8: Kotlin, Swift, Scala** — Translate `kt.json`, `swift.json`, `scala.json` → `kt_th.json`, `swift_th.json`, `scala_th.json`
12. **SUB-TASK 9: Ruby, PHP, Lua** — Translate `rb.json`, `php.json`, `lua.json` → `rb_th.json`, `php_th.json`, `lua_th.json`
13. **SUB-TASK 10: HTML/CSS/SQL/DB content** — Translate `html.json`, `css.json`, `htmlcss.json`, `sqlite.json`, `mysql.json`, `pg.json`, `mongodb.json`, `db.json`
14. **SUB-TASK 11: Frameworks (React, Vue, Angular, Express, etc.)** — Translate `react.json`, `vue.json`, `angular.json`, `express.json`, `next.json`, `nuxt.json`, `svelte.json`, `sveltekit.json`, `remix.json`, `vite.json`, `webpack.json`, `tailwind.json`, `bootstrap.json`, `node.json`, `django.json`, `flask.json`, `fastapi.json`, `spring.json`
15. **SUB-TASK 12: DevOps/Cloud (AWS, Azure, Docker, k8s, etc.)** — Translate `aws.json`, `azure.json`, `gcp.json`, `docker.json`, `k8s.json`, `terraform.json`, `cicd.json`, `git.json`, `cloud.json`, `system-design.json`, `firebase.json`, `prisma.json`, `graphql.json`, `redis.json`

### Phase 3: Large Content Files
16. **SUB-TASK 13: curriculum.json** — Translate `curriculum.json` → `curriculum_th.json`
17. **SUB-TASK 14: Tutorial/content library** — Handle `tutorial-content.js` and other Svelte-side content

### Phase 4: Polish
18. **Final review & test** — Verify all files load, toggle works, no broken content

## Translation Guidelines
- **DO NOT** translate code, inline code, variables, function names, HTML tags
- Use Thai term + English in parentheses on first mention (e.g., วนลูป (Loop))
- Keep "Debugging", "Compiler", "Framework" in English
- Educational, encouraging tone for beginners
- Polite standard educational Thai

## Glossary
| English | Thai |
|---------|------|
| Variable | ตัวแปร (Variable) |
| Object | อ็อบเจกต์ (Object) |
| String | สตริง (String) |
| Integer | อินทิเจอร์ (Integer) |
| Error | ข้อผิดพลาด (Error) |
| Function | ฟังก์ชัน (Function) |
| Array | อาร์เรย์ (Array) |
| Class | คลาส (Class) |
| Loop | วนลูป (Loop) |
| Boolean | บูลีน (Boolean) |
| Null | นัล (Null) |
| Undefined | อันดีไฟน์ (Undefined) |

---

*Last updated: 2026-06-13 — Tasks 1-3 (Infrastructure) ✅, Task 4 (JS Thai) 🔄*
