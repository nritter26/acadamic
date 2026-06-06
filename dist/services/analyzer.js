const COMMON_PATTERNS = {
    '==': `You used \`==\` (loose equality). Prefer \`===\` (strict equality) to avoid type coercion bugs.`,
    'var ': `Using \`var\` is outdated. Use \`let\` (mutable) or \`const\` (immutable) for block-scoped variables.`,
    'console.log': '✓ Good use of console.log for debugging! Remember to remove or comment out debug logs in production.',
};
export function analyzeCode(code, lang) {
    if (!code)
        return { hints: [] };
    const hints = [];
    const lines = code.split('\n');
    if (lang === 'js') {
        for (const [pattern, hint] of Object.entries(COMMON_PATTERNS)) {
            if (code.includes(pattern))
                hints.push(hint);
        }
        if (code.includes('function') && !code.includes('return')) {
            hints.push('Your function doesn\'t use `return`. If it should return a value, add a `return` statement.');
        }
        const parenDiff = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        if (parenDiff !== 0)
            hints.push('Unbalanced parentheses! Make sure every `(` has a matching `)`.');
        const braceDiff = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
        if (braceDiff !== 0)
            hints.push('Unbalanced curly braces! Make sure every `{` has a matching `}`.');
        const bracketDiff = (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;
        if (bracketDiff !== 0)
            hints.push('Unbalanced square brackets! Make sure every `[` has a matching `]`.');
    }
    else if (lang === 'ts') {
        if (/\bany\b/.test(code))
            hints.push('Avoid `any` when possible. Prefer `unknown`, unions, or a concrete interface.');
        if (/\s+as\s+[A-Za-z_][\w<>\[\]\|?]*/.test(code))
            hints.push('Type assertions (`as`) bypass safety checks. Narrow the type if you can.');
        if (/\w+!\b/.test(code))
            hints.push('Non-null assertions (`!`) can hide bugs. Prefer a null check or optional chaining.');
    }
    else if (lang === 'py') {
        if (/def\s+\w+\s*\([^)]*=\s*(\[\]|\{\})[^)]*\)/.test(code)) {
            hints.push('Avoid mutable default arguments like `[]` or `{}`. Use `None` and create the object inside the function.');
        }
        const tabs = lines.some((line) => /^\t+/.test(line));
        const spaces = lines.some((line) => /^ +/.test(line));
        if (tabs && spaces)
            hints.push('Mixing tabs and spaces in indentation causes hard-to-debug errors. Stick to 4 spaces.');
        if (/^\s*except\s*:/m.test(code))
            hints.push('Avoid bare `except:` blocks. Catch a specific exception when you know what can fail.');
    }
    else if (lang === 'go') {
        if (/\berr\b/.test(code) && !/if\s+\w+\s*!=\s*nil/.test(code)) {
            hints.push('Go is explicit about failures. If you use `err`, handle it with `if err != nil`.');
        }
        if (/\bpanic\s*\(/.test(code)) {
            hints.push('`panic()` is usually for unrecoverable problems. Prefer returning an error for normal failure paths.');
        }
        if (/\bfmt\.Print(ln|f)?\s*\(/.test(code)) {
            hints.push('Great for learning: `fmt.Println` shows output clearly. In real code, keep output focused and structured.');
        }
    }
    return { hints };
}
export function analyzeUserCode(code, lang) {
    if (!code || !lang)
        return null;
    const hints = [];
    const lines = code.split('\n');
    if (lang === 'js') {
        const unclosedBraces = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
        const unclosedParens = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        if (unclosedBraces > 0)
            hints.push(`You have ${unclosedBraces} unclosed curly braces.`);
        if (unclosedBraces < 0)
            hints.push(`You have ${Math.abs(unclosedBraces)} too many closing braces.`);
        if (unclosedParens > 0)
            hints.push(`You have ${unclosedParens} unclosed parentheses.`);
        if (unclosedParens < 0)
            hints.push('You have extra closing parentheses.');
        if (!code.includes('return') && (code.includes('function') || code.includes('=>'))) {
            hints.push('Your function has no `return` statement. It will return `undefined`.');
        }
        if (code.includes('=='))
            hints.push('Consider using `===` (strict equality) instead of `==`.');
        if (code.includes('var '))
            hints.push('Use `let` or `const` instead of `var`.');
    }
    else if (lang === 'py') {
        const leadingSpaces = lines.filter((l) => l.trim() && l.startsWith(' '));
        if (leadingSpaces.length > 0) {
            const mixed = leadingSpaces.some((l) => l.includes('\t'));
            if (mixed)
                hints.push('Mixing tabs and spaces in indentation causes errors. Stick to 4 spaces.');
        }
        if (/def\s+\w+\s*\([^)]*=\s*(\[\]|\{\})[^)]*\)/.test(code)) {
            hints.push('Avoid mutable default arguments in Python. Use `None` and create the list/dict inside the function.');
        }
        if (/^\s*except\s*:/m.test(code)) {
            hints.push('Bare `except:` blocks hide bugs. Catch a specific exception instead.');
        }
    }
    else if (lang === 'ts') {
        if (/\bany\b/.test(code))
            hints.push('Replace `any` with `unknown`, unions, or a concrete interface when possible.');
        if (/\s+as\s+[A-Za-z_][\w<>\[\]\|?]*/.test(code))
            hints.push('Type assertions can bypass safety checks. Prefer narrowing or a type guard.');
        if (/\w+!\b/.test(code))
            hints.push('Non-null assertions can hide bugs. Prefer a null check or optional chaining.');
    }
    else if (lang === 'go') {
        if (/\berr\b/.test(code) && !/if\s+\w+\s*!=\s*nil/.test(code)) {
            hints.push('If you use `err`, handle it with `if err != nil`.');
        }
        if (/\bpanic\s*\(/.test(code)) {
            hints.push('Use `panic()` sparingly. Returning an error is usually better for normal failures.');
        }
    }
    return hints.length > 0 ? hints : null;
}
//# sourceMappingURL=analyzer.js.map