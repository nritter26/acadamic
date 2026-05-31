export const TOPIC_KEYWORDS_CLIENT: Record<string, string[]> = {
    variable: ['variable', 'variables', 'declare', 'declaration', 'let', 'const', 'var', 'assignment', 'mutable', 'immutable', 'scope'],
    function: ['function', 'functions', 'func', 'method', 'methods', 'def', 'fn', 'return', 'lambda', 'arrow', 'callback', 'callbacks'],
    string: ['string', 'strings', 'str', 'template literal', 'template literals', 'concatenation', 'char', 'text', 'substring'],
    number: ['number', 'numbers', 'int', 'float', 'integer', 'numeric', 'arithmetic', 'math', 'random'],
    boolean: ['boolean', 'booleans', 'bool', 'true', 'false', 'truthy', 'falsy', 'logical', 'comparison', 'condition', 'conditional'],
    array: ['array', 'arrays', 'list', 'lists', 'vector', 'slice', 'splice', 'push', 'pop', 'map', 'filter', 'reduce', 'foreach', 'forEach'],
    object: ['object', 'objects', 'dictionary', 'map', 'hash', 'property', 'key value', 'json', 'record', 'struct', 'prototype'],
    class: ['class', 'classes', 'constructor', 'extend', 'extends', 'inherit', 'inheritance', 'prototype', 'oop'],
    promise: ['promise', 'promises', 'async', 'await', 'then', 'catch', 'future', 'defer', 'callback', 'callbacks'],
    loop: ['loop', 'loops', 'for loop', 'while loop', 'iterate', 'iteration', 'foreach'],
    type: ['type', 'types', 'interface', 'interfaces', 'generic', 'generics', 'enum', 'typedef', 'type annotation', 'static typing', 'typeof'],
    null: ['null', 'undefined', 'nil', 'none', 'option', 'maybe', 'optional'],
    error_handling: ['error handling', 'try catch', 'throw', 'throws', 'except', 'exception', 'exceptions', 'panic', 'result', 'unwrap'],
    io: ['input', 'output', 'file', 'files', 'console', 'print', 'log', 'read', 'write', 'stdin', 'stdout'],
    comment: ['comment', 'comments', 'docstring', 'documentation', 'jsdoc'],
    operator: ['operator', 'operators', 'arithmetic', 'comparison', 'assignment', 'bitwise'],
    recursion: ['recursion', 'recursive', 'stack overflow', 'base case', 'tail call'],
    closure: ['closure', 'closures', 'lexical scope', 'scope chain', 'capture', 'inner function'],
    generics: ['generic', 'generics', 'template', 'templates', 'type parameter', 'type parameters', 'trait bound'],
    pointer: ['pointer', 'pointers', 'reference', 'references', 'memory address', 'dereference', 'borrow', 'borrowing'],
    pattern_match: ['pattern matching', 'match', 'switch', 'destructure', 'destructuring', 'deconstruct'],
    concurrency: ['concurrency', 'concurrent', 'parallel', 'parallelism', 'thread', 'threads', 'goroutine', 'goroutines', 'channel', 'channels'],
    testing: ['testing', 'test', 'tests', 'assert', 'assertion', 'unit test', 'unit tests', 'mock', 'mocks', 'tdd'],
    module: ['module', 'modules', 'import', 'export', 'require', 'package', 'packages', 'namespace', 'crate', 'npm'],
};

export function detectTopicInQuery(q: string): string | null {
    const lower = q.toLowerCase().trim();
    const words = lower.split(/\s+/);
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS_CLIENT)) {
        const phrase = words.join(' ');
        if (keywords.some(kw => kw === phrase || kw === lower || (kw.includes(' ') && phrase.includes(kw)))) {
            return topic;
        }
        if (words.length <= 4 && keywords.some(kw => words.includes(kw))) {
            return topic;
        }
    }
    const hasIndicator = /^(what|how|why|explain|define|tell|describe|show)\b/i.test(lower) || /\b(what about|tell me about|how about|explain|difference between)\b/i.test(lower);
    if (hasIndicator) {
        for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS_CLIENT)) {
            if (keywords.some(kw => kw.length > 2 && lower.includes(kw))) {
                return topic;
            }
        }
    }
    return null;
}
