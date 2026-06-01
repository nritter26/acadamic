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
exports.LLMStrategy = void 0;
const config_1 = require("../../ai/config");
const provider_1 = require("../../ai/provider");
const learner = __importStar(require("../../ai/learner"));
const conv = __importStar(require("../conversation"));
const tutor_1 = require("../tutor");
class LLMStrategy {
    name = 'llm';
    priority = 7;
    async canHandle() {
        return (0, config_1.getActiveAIProvider)() !== 'keyword';
    }
    async handle(ctx, sseSend, sseDone) {
        const llmMessages = await (0, tutor_1.buildLLMMessages)(ctx.message, ctx.lang, ctx.topic, ctx.phase, ctx.code, ctx.output, ctx.hasError, ctx.history, ctx.learnerId);
        let gotChunk = false;
        let fullResponse = '';
        await (0, provider_1.askLLM)(llmMessages, (chunk) => {
            gotChunk = true;
            fullResponse += chunk;
            sseSend(chunk);
        }, { lang: ctx.lang, topic: ctx.topic, code: ctx.code, hasError: ctx.hasError, providerConfig: ctx.providerConfig });
        if (gotChunk) {
            if (ctx.topic && ctx.lang)
                await learner.trackAttempt(ctx.lid, ctx.lang, ctx.topic);
            try {
                await conv.addMessage(ctx.lid, 'assistant', fullResponse);
            }
            catch { }
            sseDone();
            return true;
        }
        return false;
    }
}
exports.LLMStrategy = LLMStrategy;
//# sourceMappingURL=llm-strategy.js.map