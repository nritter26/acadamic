"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordMatchStrategy = void 0;
const responses_data_1 = __importDefault(require("../../ai/responses-data"));
const conv = __importStar(require("../conversation"));
const tutor_keywords_1 = require("../../ai/tutor-keywords");
const SINGLE_TOPIC_ALIASES = {
    variable: ['variables', 'var', 'declare', 'declaration', 'let', 'const'],
    function: ['functions', 'func', 'method', 'methods', 'def', 'fn'],
    string: ['strings', 'str', 'text', 'char', 'characters'],
    array: ['arrays', 'list', 'lists', 'vector', 'slice', 'collection'],
    object: ['objects', 'dict', 'dictionary', 'hash', 'map', 'json'],
    class: ['classes', 'oop', 'constructor', 'inheritance', 'extends'],
    loop: ['loops', 'for loop', 'while loop', 'iteration', 'iterate'],
    promise: ['promises', 'async', 'await', 'future', 'callback'],
    error_handling: ['error handling', 'try catch', 'exception', 'exceptions', 'panic'],
    type: ['types', 'typeof', 'annotation', 'static type', 'typing'],
    recursion: ['recursive', 'stack overflow', 'base case', 'tail call'],
    closure: ['closures', 'lexical scope', 'scope chain', 'capture'],
    generics: ['generic', 'template', 'type parameter', 'trait bound'],
    pointer: ['pointers', 'reference', 'memory address', 'dereference', 'heap'],
    pattern_match: ['pattern matching', 'match', 'switch', 'destructure'],
    concurrency: ['concurrent', 'parallel', 'thread', 'goroutine', 'channel'],
    testing: ['test', 'tests', 'unit test', 'assertion', 'jest', 'mocha'],
    module: ['modules', 'import', 'export', 'require', 'package'],
    io: ['input output', 'console', 'stdin', 'stdout', 'readline', 'print'],
    boolean: ['booleans', 'bool', 'true', 'false', 'logical'],
    number: ['numbers', 'integer', 'float', 'numeric', 'math'],
    operator: ['operators', 'arithmetic', 'comparison', 'assignment'],
    null: ['nil', 'none', 'undefined', 'optional', 'maybe'],
    comment: ['comments', 'docstring', 'documentation', 'jsdoc'],
};
class KeywordMatchStrategy {
    name = 'keyword_match';
    priority = 6;
    async canHandle(_ctx) {
        return true;
    }
    async handle(ctx, sseSend, sseDone) {
        // Step 1: Direct single-word topic name matching
        // When the user types a topic name like "variables" or "functions" directly
        const words = ctx.q.split(/\s+/).filter(w => w.length > 1);
        for (const word of words) {
            for (const [topicKey, aliases] of Object.entries(SINGLE_TOPIC_ALIASES)) {
                if (topicKey === word || aliases.includes(word)) {
                    for (const entry of responses_data_1.default) {
                        if (entry.keywords.some(k => topicKey.includes(k) || k.includes(topicKey))) {
                            let reply = entry.response;
                            const normalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
                            const langName = ctx.lang ? ctx.lang.toUpperCase() + ' ' : '';
                            if (words.length === 1) {
                                reply += `\n\n**Try this:** Open the **${normalizedWord}** topic in the ${langName}curriculum, read the explanation, then modify the code example and click **Run ▶**!`;
                            }
                            if (ctx.lid) {
                                try {
                                    await conv.addMessage(ctx.lid, 'assistant', reply);
                                }
                                catch { }
                            }
                            sseSend(reply);
                            sseDone();
                            return true;
                        }
                    }
                }
            }
        }
        // Step 1c: Compound query handling — only "difference between X and Y" or "X vs Y" (NOT plain "X or Y")
        const isExplicitComparison = /diff(?:erence)?\s+between\b/i.test(ctx.q);
        const diffMatch = ctx.q.match(isExplicitComparison
            ? /diff(?:erence)?\s+between\s+(\w+(?:\s+\w+)?)\s+and\s+(\w+(?:\s+\w+)?)/i
            : /(\w+(?:\s+\w+)?)\s+(?:vs|vs\.|versus)\s+(\w+(?:\s+\w+)?)/i);
        if (diffMatch) {
            const left = (0, tutor_keywords_1.matchTopic)(diffMatch[1]);
            const right = (0, tutor_keywords_1.matchTopic)(diffMatch[2]);
            const allTopics = [...new Set([...left, ...right])];
            if (allTopics.length > 0) {
                for (const topicName of allTopics) {
                    for (const entry of responses_data_1.default) {
                        if (entry.keywords.some(k => topicName.includes(k) || k.includes(topicName))) {
                            let reply = entry.response;
                            reply += `\n\n**Tip:** Try writing a small program that uses each approach and compare the results side by side.`;
                            if (ctx.lid) {
                                try {
                                    await conv.addMessage(ctx.lid, 'assistant', reply);
                                }
                                catch { }
                            }
                            sseSend(reply);
                            sseDone();
                            return true;
                        }
                    }
                }
            }
        }
        // Step 1b: Regex-based topic matching (uses server-side TOPIC_KEYWORDS patterns)
        // Handles queries like "variable scope", "let vs const", "how to use async await"
        const matchedTopics = (0, tutor_keywords_1.matchTopic)(ctx.message);
        if (matchedTopics.length > 0) {
            for (const entry of responses_data_1.default) {
                if (entry.keywords.some(k => matchedTopics.some(t => t.includes(k) || k.includes(t)))) {
                    let reply = entry.response;
                    const langName = ctx.lang ? ctx.lang.toUpperCase() + ' ' : '';
                    reply += `\n\n**In ${langName}curriculum:** Open the **${matchedTopics[0]}** topic and experiment with the code to make it stick.`;
                    if (ctx.lid) {
                        try {
                            await conv.addMessage(ctx.lid, 'assistant', reply);
                        }
                        catch { }
                    }
                    sseSend(reply);
                    sseDone();
                    return true;
                }
            }
        }
        // Step 2: Context-aware topic matching (current topic + question)
        if (ctx.topic && /what|how|explain|tell me|\?/.test(ctx.q)) {
            for (const entry of responses_data_1.default) {
                if (entry.keywords.some(k => ctx.topic.toLowerCase().includes(k))) {
                    let reply = entry.response;
                    reply += `\n\n**You're currently studying:** ${ctx.topic} (${ctx.phase || ''})`;
                    reply += `\nTry the code example in the editor and click Run!`;
                    if (ctx.lid) {
                        try {
                            await conv.addMessage(ctx.lid, 'assistant', reply);
                        }
                        catch { }
                    }
                    sseSend(reply);
                    sseDone();
                    return true;
                }
            }
        }
        // Step 3: Standard keyword matching (must match at least 2 keywords to avoid false positives)
        const matchedEntries = [];
        for (const entry of responses_data_1.default) {
            const matchCount = entry.keywords.filter(k => ctx.q.includes(k)).length;
            if (matchCount > 0) {
                matchedEntries.push({ entry, count: matchCount });
            }
        }
        matchedEntries.sort((a, b) => b.count - a.count);
        const bestMatch = matchedEntries[0];
        if (bestMatch && bestMatch.count >= 2) {
            if (ctx.lid) {
                try {
                    await conv.addMessage(ctx.lid, 'assistant', bestMatch.entry.response);
                }
                catch { }
            }
            sseSend(bestMatch.entry.response);
            sseDone();
            return true;
        }
        // Single keyword match — only respond if query is short (likely a direct topic query)
        if (bestMatch && ctx.q.split(/\s+/).length <= 4) {
            if (ctx.lid) {
                try {
                    await conv.addMessage(ctx.lid, 'assistant', bestMatch.entry.response);
                }
                catch { }
            }
            sseSend(bestMatch.entry.response);
            sseDone();
            return true;
        }
        // Single keyword match with long query — let it fall through to LLM or general response
        return false;
    }
}
exports.KeywordMatchStrategy = KeywordMatchStrategy;
//# sourceMappingURL=keyword-match-strategy.js.map