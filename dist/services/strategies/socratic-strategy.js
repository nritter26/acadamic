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
exports.SocraticStrategy = void 0;
const conv = __importStar(require("../conversation"));
class SocraticStrategy {
    name = 'socratic';
    priority = 4;
    async canHandle(_ctx) {
        return true;
    }
    async handle(ctx, sseSend, sseDone) {
        if (ctx.topic) {
            const reply = `Great question about **${ctx.topic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far?`;
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
        const fallbacks = [
            "That's an interesting question! To help you best, could you tell me: what language are you working with?",
            "I want to make sure I help you effectively. Could you tell me more about what you're working on?",
            "Let me help you learn! Try asking me about a specific topic you're studying, or share your code for debugging.",
        ];
        const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
exports.SocraticStrategy = SocraticStrategy;
//# sourceMappingURL=socratic-strategy.js.map