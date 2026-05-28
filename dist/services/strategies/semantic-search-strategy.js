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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticSearchStrategy = void 0;
const embeddings_1 = require("../../ai/embeddings");
const conv = __importStar(require("../conversation"));
const utils_1 = require("./utils");
const TOPIC_NAMES = {
    variables: 'variable', functions: 'function', strings: 'string',
    arrays: 'array', objects: 'object', classes: 'class', loops: 'loop',
    promises: 'promise', recursion: 'recursion', closures: 'closure',
    generics: 'generics', pointers: 'pointer', modules: 'module',
    testing: 'testing', types: 'type', operators: 'operator',
    conditionals: 'conditional', booleans: 'boolean', numbers: 'number',
    'error handling': 'error_handling', concurrency: 'concurrency',
    'pattern matching': 'pattern_match', comments: 'comment', io: 'io',
};
class SemanticSearchStrategy {
    name = 'semantic-search';
    priority = 3;
    async canHandle() {
        const provider = process.env.AI_PROVIDER || 'hybrid';
        return provider === 'keyword';
    }
    async handle(ctx, sseSend, sseDone) {
        if (ctx.q.split(/\s+/).length <= 2 && (TOPIC_NAMES[ctx.q] || Object.keys(TOPIC_NAMES).some(k => ctx.q.includes(k)))) {
            return false;
        }
        const searchLang = (0, utils_1.detectLanguage)(ctx.message) || ctx.lang;
        const semanticResults = await (0, embeddings_1.search)(ctx.q, searchLang, 1);
        if (semanticResults.length > 0 && semanticResults[0].score > 0.4) {
            const best = semanticResults[0];
            let reply = `Based on the curriculum, here's what I found about **${best.topic}** in ${best.lang.toUpperCase()}:\n\n`;
            const cleanExp = best.exp.replace(/<[^>]*>/g, '').slice(0, 600);
            if (cleanExp)
                reply += `${cleanExp}\n\n`;
            if (best.code) {
                reply += `**Example:**\n\`\`\`\n${best.code.slice(0, 300)}\n\`\`\`\n\n`;
            }
            reply += `Try this: open the **${best.topic}** topic in the ${best.lang.toUpperCase()} curriculum and experiment with the code example!`;
            await conv.addMessage(ctx.lid, 'assistant', reply).catch(() => { });
            sseSend(reply);
            sseDone();
            return true;
        }
        return false;
    }
}
exports.SemanticSearchStrategy = SemanticSearchStrategy;
//# sourceMappingURL=semantic-search-strategy.js.map