"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.review = review;
const provider_1 = require("./provider");
const KEYWORD_ISSUES = {
    js: [
        { pattern: /==(?!\s*=)/, message: 'Use `===` (strict equality) instead of `==` to avoid type coercion.', severity: 'style' },
        { pattern: /\bvar\s/, message: 'Use `let` or `const` instead of `var` for block scoping.', severity: 'style' },
        { pattern: /for\s*\([^)]+in\s+/, message: 'Use `for...of` instead of `for...in` for arrays — `for...in` iterates keys as strings.', severity: 'warning' },
        { pattern: /eval\s*\(/, message: 'Avoid `eval()` — it executes arbitrary code and is a security risk.', severity: 'error' },
        { pattern: /===\s*true\b/, message: 'Redundant comparison to `true` — use `if (value)` instead.', severity: 'style' },
        { pattern: /===\s*false\b/, message: 'Use `if (!value)` instead of comparing to `false`.', severity: 'style' },
        { pattern: /===\s*null\b/, message: 'Use `value === null` explicitly only if you mean null specifically — otherwise use `!value`.', severity: 'style' },
        { pattern: /\.length\s*!==\s*0/, message: 'Simpler: `if (arr.length)` instead of `if (arr.length !== 0)`.', severity: 'style' },
        { pattern: /\.length\s*===?\s*0/, message: 'Simpler: `if (!arr.length)` instead of `if (arr.length === 0)`.', severity: 'style' },
        { pattern: /new\s+(Array|Object|RegExp)\s*\(/, message: 'Use literal syntax: `[]`, `{}`, `/pattern/` instead of `new Array()`, etc.', severity: 'style' },
        { pattern: /\bString\s*\(/, message: 'Use `String(value)` or template literals `` `${value}` `` for conversion.', severity: 'style' },
        { pattern: /\bNumber\s*\(/, message: 'Use `Number(value)` or unary `+value` for numeric conversion.', severity: 'style' },
        { pattern: /\basync\s+function\b(?![\s\S]*\bawait\b)/, message: 'Async function without `await` inside — either use `await` or remove `async`.', severity: 'warning' },
        { pattern: /\.then\([^)]*\)\s*\.catch\(/, message: 'Mix of `await` and `.then()/.catch()` — choose one style (prefer `async/await` with try/catch).', severity: 'style' },
        { pattern: /new\s+Promise\b(?![\s\S]*\.catch\b)/, message: 'Promise without `.catch()` — unhandled rejections crash the process.', severity: 'warning' },
    ],
    ts: [
        { pattern: /\bany\b(?!\s*[)};,\]])/, message: 'Avoid `any` — use proper types or `unknown` with type guards.', severity: 'warning' },
        { pattern: /@ts-ignore/, message: '`@ts-ignore` suppresses all type errors — use `@ts-expect-error` to document expected violations.', severity: 'warning' },
        { pattern: /@ts-nocheck/, message: '`@ts-nocheck` disables type checking entirely — fix the types instead.', severity: 'error' },
        { pattern: /as\s+any\b/, message: '`as any` bypasses the type system — use a proper type or assertion function.', severity: 'warning' },
        { pattern: /!\s*[.);\],}]/, message: 'Non-null assertion `!` hides undefined — use a type guard instead.', severity: 'style' },
        { pattern: /interface\s+\w+\s*\{[^}]*\}[^;]/s, message: 'Prefer `type` over `interface` for union/intersection types; use `interface` for object shapes that may be extended.', severity: 'style' },
    ],
    py: [
        { pattern: /(?:except|catch)\s*:\s*$/, message: 'Bare `except:` catches ALL exceptions including Ctrl+C — specify the exception type.', severity: 'warning' },
        { pattern: /==\s*(?:True|False|None)/, message: 'Use `is` instead of `==` for comparing to `True`/`False`/`None`.', severity: 'style' },
        { pattern: /\t/, message: 'Mixed tabs and spaces — use 4 spaces consistently.', severity: 'error' },
        { pattern: /os\.system\s*\(/, message: 'Prefer `subprocess.run()` with argument list over `os.system()` — avoids shell injection.', severity: 'warning' },
        { pattern: /shell\s*=\s*True/, message: '`shell=True` in subprocess is a security risk — use argument list instead.', severity: 'error' },
        { pattern: /pickle\.(loads|load)\s*\(/, message: '`pickle` deserialization can execute arbitrary code — prefer JSON or safe serializers.', severity: 'error' },
        { pattern: /exec\s*\(/, message: '`exec()` executes arbitrary code — avoid it unless absolutely necessary.', severity: 'error' },
        { pattern: /def\s+\w+\s*\([^)]*=\s*\[/, message: 'Mutable default argument `[]` is shared across calls — use `None` and create inside the function.', severity: 'warning' },
        { pattern: /def\s+\w+\s*\([^)]*=\s*\{/, message: 'Mutable default argument `{}` is shared across calls — use `None` and create inside the function.', severity: 'warning' },
        { pattern: /from\s+\w+\s+import\s+\*/, message: 'Star imports pollute the namespace — import only what you need.', severity: 'style' },
    ],
    go: [
        { pattern: /if\s+err\s*!=\s*nil\s*\{\s*\n\s*return\s+\w+/, message: 'Good error check — but consider adding error context with `fmt.Errorf("context: %w", err)`.', severity: 'info' },
        { pattern: /ioutil\./, message: '`ioutil` is deprecated since Go 1.16 — use `os` and `io` packages instead.', severity: 'warning' },
        { pattern: /http\.DefaultServeMux/, message: '`http.DefaultServeMux` is a global — use a local `http.ServeMux` for security.', severity: 'warning' },
        { pattern: /defer\s+\w+[.\w]*\(\)\s*\n[^}]*\bfor\b/, message: '`defer` inside a loop accumulates — consider moving the defer outside or using immediate execution.', severity: 'warning' },
        { pattern: /go\s+\w+\(.*\)/, message: 'Goroutine launched without sync mechanism — ensure proper synchronization with WaitGroup or channels.', severity: 'info' },
        { pattern: /time\.Sleep\s*\(/, message: 'Using `time.Sleep` for synchronization is fragile — use channels or sync primitives.', severity: 'warning' },
        { pattern: /recover\(\)/, message: '`recover()` only works inside a deferred function — verify it is inside `defer`.', severity: 'info' },
        { pattern: /:=.*err/, message: 'Short variable declaration `:=` can shadow existing `err` — check that `err` is intentionally declared.', severity: 'info' },
    ],
    rs: [
        { pattern: /\.unwrap\(\)/, message: '`.unwrap()` will panic on error — prefer pattern matching or `?` operator.', severity: 'warning' },
        { pattern: /\.expect\(/, message: '`.expect()` will panic on error — prefer proper error handling.', severity: 'warning' },
        { pattern: /unsafe\s*\{/, message: '`unsafe` block bypasses Rust\'s safety guarantees — avoid unless absolutely necessary.', severity: 'error' },
        { pattern: /transmute\s*\(/, message: '`transmute` is extremely dangerous — prefer safe conversions or `bytemuck` crate.', severity: 'error' },
        { pattern: /\bas\s+(i\d+|u\d+|f\d+|isize|usize)/, message: 'Numeric cast `as` can silently truncate — use `TryFrom` for safe conversions.', severity: 'warning' },
        { pattern: /panic!\s*\(/, message: '`panic!` should be reserved for unrecoverable states — use `Result` for fallible operations.', severity: 'warning' },
        { pattern: /Box::new\s*\(/, message: 'Excessive heap allocation with `Box::new` — consider stack allocation or `Cow`.', severity: 'style' },
        { pattern: /\.clone\(\)/, message: 'Unnecessary `.clone()` creates a full copy — consider borrowing instead.', severity: 'style' },
        { pattern: /Rc<RefCell</, message: '`Rc<RefCell<>>` is single-threaded and runtime-checked — consider `Arc<Mutex<>>` for threading or simpler ownership.', severity: 'info' },
        { pattern: /Box<dyn\s/, message: 'Trait object `Box<dyn T>` has runtime overhead — prefer generics with static dispatch where possible.', severity: 'style' },
    ],
    sql: [
        { pattern: /(['"])\s*\+\s*\w+\s*\+/, message: 'String concatenation in SQL is vulnerable to injection — use parameterized queries.', severity: 'error' },
        { pattern: /INSERT\s+INTO.*VALUES\s*\([^)]*\)/i, message: 'Use parameterized INSERT with placeholders (`?` or `$1`) instead of string interpolation.', severity: 'warning' },
        { pattern: /' OR '1'='1/, message: 'SQL injection pattern detected — always use parameterized queries.', severity: 'error' },
        { pattern: /DROP\s+TABLE/i, message: '`DROP TABLE` is irreversible in production — use migrations with rollbacks.', severity: 'warning' },
        { pattern: /SELECT\s+\*/i, message: '`SELECT *` can break on schema changes — list columns explicitly.', severity: 'style' },
        { pattern: /DELETE\s+FROM\s+\w+\s*(?:;|$)/i, message: 'Unconditional DELETE without WHERE clause will remove all rows.', severity: 'error' },
        { pattern: /UPDATE\s+\w+\s+SET(?!.*\bWHERE\b)/is, message: 'Unconditional UPDATE without WHERE clause will modify all rows.', severity: 'error' },
    ],
    cpp: [
        { pattern: /malloc\s*\(/, message: 'In C++, prefer `new`/`make_unique`/`make_shared` over `malloc`.', severity: 'warning' },
        { pattern: /free\s*\(/, message: 'In C++, use `delete`/`delete[]` or smart pointers instead of `free`.', severity: 'warning' },
        { pattern: /printf\s*\(/, message: 'In C++, prefer `std::cout` or `fmt::print` over `printf`.', severity: 'style' },
        { pattern: /\bgoto\s+/, message: '`goto` makes code harder to follow — use structured control flow.', severity: 'style' },
        { pattern: /\bnew\b(?!.*\bdelete\b)/, message: '`new` without matching `delete` causes memory leaks — use smart pointers (unique_ptr/shared_ptr).', severity: 'warning' },
        { pattern: /using\s+namespace\s+std\b/, message: '`using namespace std` pollutes the namespace — prefer `std::` prefix or selective `using` declarations.', severity: 'style' },
    ],
    c: [
        { pattern: /malloc\s*\([^)]*\)(?!.*free)/, message: '`malloc` without a matching `free` causes memory leaks.', severity: 'error' },
        { pattern: /gets\s*\(/, message: '`gets()` is unsafe and removed in C11 — use `fgets()` with buffer size.', severity: 'error' },
        { pattern: /strcpy\s*\(/, message: '`strcpy()` does not check buffer bounds — use `strncpy()` or `snprintf()`.', severity: 'warning' },
        { pattern: /strcat\s*\(/, message: '`strcat()` does not check buffer bounds — use `strncat()` with size limit.', severity: 'warning' },
        { pattern: /sprintf\s*\(/, message: '`sprintf()` can overflow — use `snprintf()` with buffer size.', severity: 'warning' },
        { pattern: /\bgoto\s+/, message: '`goto` makes code harder to follow — use structured control flow (if/else, loops).', severity: 'style' },
        { pattern: /scanf\s*\([^)]*%[^n]/, message: '`scanf()` without field width specifiers can overflow buffers.', severity: 'warning' },
        { pattern: /printf\s*\([^)]*%n/, message: '`%n` in printf writes to memory — security risk and undefined behavior.', severity: 'error' },
    ],
    cs: [
        { pattern: /async\s+void\b/, message: '`async void` can\'t be awaited and crashes on exception — use `async Task` instead.', severity: 'error' },
        { pattern: /\bvar\s+\w+\s*=\s*null\b/, message: '`var` with `null` resolves to `object` — specify the type explicitly.', severity: 'warning' },
        { pattern: /\.Result\b/, message: '`.Result` blocks the thread and can cause deadlocks — use `await` instead.', severity: 'warning' },
        { pattern: /\.Wait\(\)/, message: '`.Wait()` blocks the thread and can cause deadlocks — use `await` instead.', severity: 'warning' },
        { pattern: /\bthrow\s+new\s+Exception\b/, message: 'Throwing the base `Exception` type is too broad — use a more specific exception type.', severity: 'style' },
        { pattern: /foreach\s*\([^)]+\.Select\b/, message: 'LINQ `.Select()` inside `foreach` adds overhead — query once and materialize with `.ToList()`.', severity: 'style' },
        { pattern: /\"\s*\+\s*[^\"]/, message: 'String concatenation in loops is inefficient — use `StringBuilder`.', severity: 'style' },
    ],
    kt: [
        { pattern: /\w+\s*!!\b/, message: '`!!` (double-bang) throws NullPointerException — use safe calls `?.` or Elvis `?:` instead.', severity: 'error' },
        { pattern: /\blateinit\s+var\b/, message: '`lateinit var` crashes if accessed before init — consider `by lazy` or nullable with default.', severity: 'warning' },
        { pattern: /\bas\b(?!\?)/, message: 'Unsafe cast `as` throws ClassCastException — use `as?` for safe casting.', severity: 'warning' },
        { pattern: /\bnull\s*!=\s*\w+/, message: 'Use `?.let { }` or Elvis `?:` instead of manual null checks for idiomatic Kotlin.', severity: 'style' },
        { pattern: /\bcompanion\s+object\b/, message: '`companion object` members are effectively static — consider top-level declarations.', severity: 'style' },
    ],
    swift: [
        { pattern: /\w+\s*!\s*\./, message: 'Force unwrap `!` crashes on nil — use `if let` or `guard let` for safe unwrapping.', severity: 'error' },
        { pattern: /\w+\s*!\s*\)/, message: 'Force unwrap `!` crashes on nil — use optional binding instead.', severity: 'error' },
        { pattern: /\bImplicitlyUnwrappedOptional\b/, message: 'Implicitly unwrapped optionals are unsafe — use regular optionals with `?`.', severity: 'warning' },
        { pattern: /\btry!\s*/, message: '`try!` crashes on error — use `try?` or `do/catch` for proper error handling.', severity: 'error' },
        { pattern: /\bself\s*!\s*/, message: 'Force unwrapping `self` is dangerous — use `guard let self = self else { return }`.', severity: 'warning' },
        { pattern: /\bclass\s+\w+\s*:\s*NSObject\b/, message: 'Inheriting from `NSObject` is unnecessary for pure Swift classes.', severity: 'style' },
        { pattern: /\bdispatch_async\b/, message: '`dispatch_async` is outdated — use Swift Concurrency (`async/await`) or `Task`.', severity: 'warning' },
    ],
};
function findLineIndex(lines, matchIndex) {
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1;
        if (charCount > matchIndex)
            return i;
    }
    return 0;
}
function analyzeStructure(code, _lang) {
    const issues = [];
    const lines = code.split('\n');
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
        issues.push({ line: 0, message: `Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing.`, severity: 'error', category: 'syntax' });
    }
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        issues.push({ line: 0, message: `Unbalanced parentheses: ${openParens} opening vs ${closeParens} closing.`, severity: 'error', category: 'syntax' });
    }
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
        issues.push({ line: 0, message: `Unbalanced brackets: ${openBrackets} opening vs ${closeBrackets} closing.`, severity: 'error', category: 'syntax' });
    }
    const funcRe = /\b(function|=>|def\s+\w+|func\s+\w+)\s*\(/g;
    let funcMatch;
    const funcLinesFound = new Set();
    while ((funcMatch = funcRe.exec(code)) !== null) {
        const lineIdx = findLineIndex(lines, funcMatch.index);
        if (lineIdx !== undefined)
            funcLinesFound.add(lineIdx);
    }
    const hasReturn = /\breturn\b/.test(code);
    if (!hasReturn && funcLinesFound.size > 0) {
        for (const lIdx of funcLinesFound) {
            const trimmed = lines[lIdx].trim();
            if (!trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('/*') && !trimmed.startsWith('console.log')) {
                issues.push({
                    line: lIdx + 1,
                    message: 'Function defined but no `return` statement found — will return undefined/None.',
                    severity: 'warning',
                    category: 'logic',
                });
                break;
            }
        }
    }
    return issues;
}
function checkKeywordPatterns(code, lang) {
    const issues = [];
    const patterns = KEYWORD_ISSUES[lang];
    if (!patterns)
        return issues;
    const lines = code.split('\n');
    for (const { pattern, message, severity } of patterns) {
        const match = code.match(pattern);
        if (match && match.index !== undefined) {
            const lineIdx = findLineIndex(lines, match.index);
            issues.push({ line: lineIdx + 1, message, severity, category: 'style' });
        }
    }
    return issues;
}
async function reviewWithLLM(code, lang, topic) {
    const prompt = `You are an expert code reviewer. Review the following ${lang || 'programming'} code${topic ? ` on the topic of "${topic}"` : ''}.

Code to review:
\`\`\`${lang || ''}
${code}
\`\`\`

Provide your review in this format:
## Summary
(1-2 sentences describing what the code does)

## Issues
- **Severity** | Line X | Category | Message

## Strengths
- What the code does well

## Suggestions
- Specific improvements

## Score
Overall score out of 10 based on: correctness, style, efficiency, edge cases.`;
    try {
        const reply = await (0, provider_1.askLLM)([{ role: 'user', content: prompt }]);
        return reply;
    }
    catch {
        return null;
    }
}
function generateStructureReview(code, lang) {
    const lines = code.split('\n');
    const hasMain = /\bmain\b/i.test(code);
    const hasFunctions = /\b(function|=>|def\s+\w+|func\s+\w+)\s*\(/.test(code);
    const hasClass = /\bclass\s+/.test(code);
    const hasLoop = /for\s*\(|while\s*\(|\.forEach|for\s+\w+\s+in|for\s+\w+\s+of/.test(code);
    const hasConditional = /if\s*\(|elif\s+|else\s+/.test(code);
    const hasTryCatch = /\btry\b/.test(code) && (/\bcatch\b/.test(code) || /\bexcept\b/.test(code));
    const hasAsync = /\basync\b|\bawait\b|\.then\(/.test(code);
    let review = `**Code Review — ${lang ? lang.toUpperCase() : 'Code'}**\n\n`;
    review += `**Overview:** ${lines.length} lines, ${hasFunctions ? 'contains functions, ' : ''}${hasClass ? 'contains classes, ' : ''}${hasLoop ? 'uses loops, ' : ''}${hasConditional ? 'uses conditionals, ' : ''}${hasTryCatch ? 'has error handling, ' : ''}${hasAsync ? 'uses async patterns.' : '.'}`;
    const structuralIssues = analyzeStructure(code, lang);
    const keywordIssues = checkKeywordPatterns(code, lang);
    const allIssues = [...structuralIssues, ...keywordIssues];
    if (allIssues.length > 0) {
        review += '\n\n**Issues Found:**\n';
        const bySeverity = { error: [], warning: [], style: [], info: [] };
        for (const issue of allIssues) {
            (bySeverity[issue.severity] || bySeverity.info).push(issue);
        }
        for (const sev of ['error', 'warning', 'style', 'info']) {
            for (const issue of bySeverity[sev]) {
                const line = issue.line ? `Line ${issue.line}` : 'General';
                review += `- [${sev.toUpperCase()}] ${line}: ${issue.message}\n`;
            }
        }
    }
    if (hasMain && !hasFunctions && lines.length < 10) {
        review += '\n**Suggestion:** This code is very simple — try organizing it into functions to practice modular design.\n';
    }
    if (lines.length > 50) {
        review += `\n**Suggestion:** This function/file is getting long (${lines.length} lines). Consider breaking it into smaller functions for readability.\n`;
    }
    if (!hasTryCatch && (/\bfetch\s*\(/.test(code) || /\breadFile\b/.test(code) || /\bwriteFile\b/.test(code))) {
        review += '\n**Suggestion:** I/O operations like fetch/file access can fail — add error handling with try/catch.\n';
    }
    const commentRe = /^\s*(\/\/|#|\/\*)/;
    const commentedLines = lines.filter(l => commentRe.test(l)).length;
    const commentedRatio = commentedLines / lines.length;
    if (commentedRatio > 0.4) {
        review += `\n**Suggestion:** High comment-to-code ratio (${Math.round(commentedRatio * 100)}%). Comments explain WHY, not WHAT — let the code speak for itself.\n`;
    }
    const score = calculateScore(allIssues, lines.length);
    review += `\n**Score:** ${score}/10`;
    return { review, issues: allIssues, score };
}
function calculateScore(issues, lineCount) {
    let score = 10;
    for (const issue of issues) {
        if (issue.severity === 'error')
            score -= 2;
        else if (issue.severity === 'warning')
            score -= 1;
        else if (issue.severity === 'style')
            score -= 0.5;
    }
    if (lineCount === 0)
        score = 0;
    return Math.max(1, Math.round(score * 10) / 10);
}
async function review(code, lang, topic) {
    if (!code || !code.trim()) {
        return { review: 'No code to review.', issues: [], score: 0 };
    }
    const llmReview = await reviewWithLLM(code, lang, topic);
    if (llmReview) {
        const structuralIssues = analyzeStructure(code, lang);
        const keywordIssues = checkKeywordPatterns(code, lang);
        return { review: llmReview, issues: [...structuralIssues, ...keywordIssues], score: null, source: 'llm' };
    }
    const result = generateStructureReview(code, lang);
    return { ...result, source: 'static' };
}
//# sourceMappingURL=reviewer.js.map