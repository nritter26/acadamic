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
exports.FollowUpStrategy = void 0;
const conv = __importStar(require("../conversation"));
class FollowUpStrategy {
    name = 'follow_up';
    priority = 8;
    async canHandle(ctx) {
        if (!ctx.history || ctx.history.length < 2)
            return false;
        if (ctx.q.includes('thank'))
            return true;
        const lastBotMsg = ctx.history.filter(h => h.role === 'bot').pop();
        if (!lastBotMsg)
            return false;
        return /yes|ok|sure|tell me more|example|show me/.test(ctx.q);
    }
    async handle(ctx, sseSend, sseDone) {
        if (ctx.q.includes('thank')) {
            const reply = "You're welcome! Keep experimenting, keep breaking things, and keep asking questions. What would you like to explore next?";
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
        const lastBotMsg = ctx.history.filter(h => h.role === 'bot').pop();
        const followUps = {
            variable: "Let's practice! Try this in the editor:\n```\nlet name = 'Your Name';\nlet age = 25;\nconsole.log(name, age);\n```\nThen click Run!",
            function: "Here's a simple exercise: Write a function called `add` that takes two parameters and returns their sum.",
            loop: "Practice: Write a loop that prints the numbers 1 through 10. Then modify it to only print even numbers.",
            array: "Try this: Create an array of your 3 favorite foods. Write a loop that prints each one.",
            class: "Exercise: Create a `Person` class with `name` and `age` properties. Add a `greet()` method.",
        };
        for (const [key, reply] of Object.entries(followUps)) {
            if (lastBotMsg?.text?.toLowerCase().includes(key)) {
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
        return false;
    }
}
exports.FollowUpStrategy = FollowUpStrategy;
//# sourceMappingURL=follow-up-strategy.js.map