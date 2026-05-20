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
const express_1 = require("express");
const services_1 = require("../services");
const database = __importStar(require("../sql/database"));
const router = (0, express_1.Router)();
router.get('/health', async (_req, res) => {
    const compilers = await (0, services_1.checkCompilers)();
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        node: process.version,
        compilers,
        database: database.getStatus(),
        ollama: (0, services_1.getOllamaStatus)(),
        rateLimit: (0, services_1.getRateLimitInfo)(),
        endpoints: [
            '/api/progress', '/api/execute', '/api/analyze', '/api/chat',
            '/api/health', '/api/benchmark', '/api/courses', '/api/proxy',
            '/api/ollama/status', '/api/tutor/status',
            '/api/explain', '/api/review', '/api/exercise', '/api/quiz/generate',
            '/api/learner/*',
        ],
    });
});
router.get('/ollama/status', (_req, res) => {
    res.json((0, services_1.getOllamaStatus)());
});
router.get('/tutor/status', async (_req, res) => {
    let modelLoaded = false;
    try {
        const { isModelLoaded } = require('../ai/tiny-llm');
        modelLoaded = await isModelLoaded();
    }
    catch { }
    const activeProvider = process.env.AI_PROVIDER || 'hybrid';
    const activeModel = activeProvider === 'local'
        ? process.env.LOCAL_LLM_MODEL || 'llama3.2'
        : activeProvider === 'openai'
            ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
            : activeProvider === 'anthropic'
                ? process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
                : 'gte-small';
    res.json({
        mode: activeProvider,
        model: activeModel,
        modelLoaded,
        keywordReady: true,
        ollama: (0, services_1.getOllamaStatus)(),
    });
});
exports.default = router;
//# sourceMappingURL=health.js.map