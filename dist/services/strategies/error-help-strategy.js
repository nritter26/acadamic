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
exports.ErrorHelpStrategy = void 0;
const learner = __importStar(require("../../ai/learner"));
const analyzer_1 = require("../analyzer");
const conv = __importStar(require("../conversation"));
class ErrorHelpStrategy {
    name = 'error_help';
    priority = 9;
    async canHandle(ctx) {
        return !!(ctx.hasError || /error|bug|fix|wrong|not working|issue/.test(ctx.q));
    }
    async handle(ctx, sseSend, sseDone) {
        let errorReply = '';
        if (ctx.code) {
            const analysis = (0, analyzer_1.analyzeUserCode)(ctx.code, ctx.lang || 'js');
            if (analysis?.length) {
                errorReply = "I looked at your code and found some issues:\n\n" +
                    analysis.map((h, i) => `${i + 1}. ${h}`).join('\n') + '\n\n';
            }
        }
        if (ctx.output && /Error|ReferenceError|TypeError|SyntaxError|FAIL/.test(ctx.output)) {
            errorReply += `**Your code produced this output:**\n\`\`\`\n${ctx.output.replace(/<[^>]*>/g, '').trim()}\n\`\`\`\n\n`;
        }
        if (ctx.code && ctx.topic) {
            errorReply += `Since you're working on **${ctx.topic}**, here's a hint:\n`;
            errorReply += `- Look at the example in the curriculum and compare it with your code line by line\n`;
            errorReply += `- Try simplifying: comment out parts until it works, then add them back one at a time\n`;
            errorReply += `- Check the most common mistake for this topic and see if it applies to you\n\n`;
        }
        if (!errorReply) {
            errorReply = "Let's debug this systematically:\n\n**1. What did you expect?**\n**2. What actually happened?**\n**3. What have you tried?**\n\nShare your code and the error message, and I'll help!";
        }
        else {
            errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step.";
        }
        if (ctx.topic && ctx.lang)
            await learner.trackError(ctx.lid, ctx.lang, ctx.topic);
        if (ctx.lid) {
            try {
                await conv.addMessage(ctx.lid, 'assistant', errorReply);
            }
            catch { }
        }
        sseSend(errorReply);
        sseDone();
        return true;
    }
}
exports.ErrorHelpStrategy = ErrorHelpStrategy;
//# sourceMappingURL=error-help-strategy.js.map