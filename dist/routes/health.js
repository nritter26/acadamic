import { Router } from 'express';
import { checkCompilers, getOllamaStatus, getRateLimitInfo } from '../services';
import * as database from '../sql/database';
const router = Router();
router.get('/health', async (_req, res) => {
    const compilers = await checkCompilers();
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        node: process.version,
        compilers,
        database: database.getStatus(),
        ollama: getOllamaStatus(),
        rateLimit: getRateLimitInfo(),
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
    res.json(getOllamaStatus());
});
router.get('/tutor/status', async (_req, res) => {
    let modelLoaded = false;
    try {
        const { isModelLoaded } = require('../ai/template-matcher');
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
        ollama: getOllamaStatus(),
    });
});
export default router;
//# sourceMappingURL=health.js.map