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
exports.GreetingStrategy = void 0;
const conv = __importStar(require("../conversation"));
class GreetingStrategy {
    name = 'greeting';
    priority = 5;
    async canHandle(ctx) {
        if (ctx.q.includes('thank')) {
            // FollowUpStrategy (higher priority) handles 'thank' when history >= 2
            if (ctx.history && ctx.history.length >= 2)
                return false;
            return true;
        }
        if (/hello|hi |^hey$|good/.test(ctx.q))
            return true;
        return false;
    }
    async handle(ctx, sseSend, sseDone) {
        if (ctx.q.includes('thank')) {
            const reply = "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step!";
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
        const langInfo = ctx.lang ? `I see you're studying **${ctx.lang.toUpperCase()}**. ` : '';
        const reply = `Hello! ${langInfo}Ask me anything about the topic you're working on!`;
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
exports.GreetingStrategy = GreetingStrategy;
//# sourceMappingURL=greeting-strategy.js.map