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
class KeywordMatchStrategy {
    name = 'keyword_match';
    priority = 6;
    async canHandle(_ctx) {
        return true;
    }
    async handle(ctx, sseSend, sseDone) {
        // Step 5: Context-aware topic matching
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
        // Step 6: Standard keyword matching
        for (const entry of responses_data_1.default) {
            if (entry.keywords.some(k => ctx.q.includes(k))) {
                if (ctx.lid) {
                    try {
                        await conv.addMessage(ctx.lid, 'assistant', entry.response);
                    }
                    catch { }
                }
                sseSend(entry.response);
                sseDone();
                return true;
            }
        }
        // Step 7: Secondary keyword matching
        const cleaned = ctx.q.replace(/[^a-z\s]/g, '').trim();
        for (const entry of responses_data_1.default) {
            const combined = entry.keywords.join(' ');
            if (combined.includes(cleaned)) {
                if (ctx.lid) {
                    try {
                        await conv.addMessage(ctx.lid, 'assistant', entry.response);
                    }
                    catch { }
                }
                sseSend(entry.response);
                sseDone();
                return true;
            }
        }
        return false;
    }
}
exports.KeywordMatchStrategy = KeywordMatchStrategy;
//# sourceMappingURL=keyword-match-strategy.js.map