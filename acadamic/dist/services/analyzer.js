"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCode = analyzeCode;
exports.analyzeUserCode = analyzeUserCode;
const COMMON_PATTERNS = {
    '==': `You used \`==\` (loose equality). Prefer \`===\` (strict equality) to avoid type coercion bugs.`,
    'var ': `Using \`var\` is outdated. Use \`let\` (mutable) or \`const\` (immutable) for block-scoped variables.`,
    'console.log': '✓ Good use of console.log for debugging! Remember to remove or comment out debug logs in production.',
};
function analyzeCode(code, lang) {
    if (!code)
        return { hints: [] };
    const hints = [];
    if (lang === 'js') {
        for (const [pattern, hint] of Object.entries(COMMON_PATTERNS)) {
            if (code.includes(pattern))
                hints.push(hint);
        }
        if (code.includes('function') && !code.includes('return')) {
            hints.push('Your function doesn\'t use \`return\`. If it should return a value, add a \`return\` statement.');
        }
        const parenDiff = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
        if (parenDiff !== 0)
            hints.push('Unbalanced parentheses! Make sure every \`(\` has a matching \`)\`.');
        const braceDiff = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
        if (braceDiff !== 0)
            hints.push('Unbalanced curly braces! Make sure every \`{\` has a matching \`}\`.');
        const bracketDiff = (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;
        if (bracketDiff !== 0)
            hints.push('Unbalanced square brackets! Make sure every \`[\` has a matching \`]\`.');
    }
    return { hints };
}
function analyzeUserCode(code, lang) {
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
            hints.push('Your function has no \`return\` statement. It will return \`undefined\`.');
        }
        if (code.includes('=='))
            hints.push('Consider using \`===\` (strict equality) instead of \`==\`.');
        if (code.includes('var '))
            hints.push('Use \`let\` or \`const\` instead of \`var\`.');
    }
    else if (lang === 'py') {
        const leadingSpaces = lines.filter(l => l.trim() && l.startsWith(' '));
        if (leadingSpaces.length > 0) {
            const mixed = leadingSpaces.some(l => l.includes('\t'));
            if (mixed)
                hints.push('Mixing tabs and spaces in indentation causes errors. Stick to 4 spaces.');
        }
    }
    return hints.length > 0 ? hints : null;
}
//# sourceMappingURL=analyzer.js.map