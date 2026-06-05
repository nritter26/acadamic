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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const url_1 = require("url"); // 1. Import fileURLToPath
const middleware_1 = require("./middleware");
const services_1 = require("./services");
const middleware_2 = require("./middleware");
const database = __importStar(require("./sql/database"));
const routes_1 = __importDefault(require("./routes"));
// 2. Recreate __dirname for ES Modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const DATA_DIR = path_1.default.join(__dirname, 'data');
// ── CORS (local dev) ──
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const localDevOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (localDevOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Learner-Id, Authorization');
    }
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});
// ── Core Middleware ──
app.use(express_1.default.json({ limit: '100kb' }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(__dirname));
app.use(middleware_1.requestLogger);
// Track request metrics
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        (0, services_1.trackRequest)(Date.now() - start, res.statusCode);
    });
    next();
});
app.use('/api/', services_1.rateLimit);
app.use(middleware_1.optionalAuth);
// ── Ensure data directory exists ──
if (!fs_1.default.existsSync(DATA_DIR))
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
// ── Initialize Database ──
const dbStatus = database.initAll();
middleware_2.logger.info({ db: dbStatus }, 'Database initialized');
// ── AI Provider Config ──
const AI_PROVIDER = process.env.AI_PROVIDER || 'hybrid';
if (AI_PROVIDER !== 'keyword' && AI_PROVIDER !== 'hybrid') {
    const REQUIRED_FOR_AI = { OPENAI_API_KEY: 'openai', ANTHROPIC_API_KEY: 'anthropic', LOCAL_LLM_ENDPOINT: 'local' };
    const keyForProvider = AI_PROVIDER === 'openai' ? 'OPENAI_API_KEY' : AI_PROVIDER === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'LOCAL_LLM_ENDPOINT';
    if (!process.env[keyForProvider]) {
        middleware_2.logger.error({ AI_PROVIDER }, `AI_PROVIDER="${AI_PROVIDER}" requires ${keyForProvider} but it's not set. Set the env var or use AI_PROVIDER=keyword`);
        process.exit(1);
    }
}
if (!process.env.AI_SYSTEM_PROMPT) {
    middleware_2.logger.info('Using default AI_SYSTEM_PROMPT. Set AI_SYSTEM_PROMPT to customize.');
}
middleware_2.logger.info(`AI Provider: ${AI_PROVIDER}`);
// ── Auto-detect Ollama ──
(0, services_1.detectOllama)();
// ── Mount API Routes ──
app.use('/api', routes_1.default);
// ── WebSocket stats endpoint ──
app.get('/api/ws/stats', (_req, res) => {
    res.json((0, services_1.getWSStats)());
});
// ── Prometheus metrics endpoint ──
app.get('/api/metrics', services_1.metricsHandler);
// ── OpenAPI documentation ──
app.get('/api/openapi.json', services_1.openapiHandler);
app.get('/api/docs', services_1.swaggerUIHandler);
// ── Error Handling ──
app.use(middleware_1.notFound);
app.use(middleware_1.errorHandler);
// ── Create HTTP server (needed for WebSocket) ──
const server = http_1.default.createServer(app);
// ── Setup WebSocket ──
(0, services_1.setupWebSocket)(server);
// ── Schedule periodic cleanup ──
const cleanupInterval = setInterval(services_1.pruneOldConversations, 3_600_000);
// ── Graceful shutdown ──
function shutdown() {
    middleware_2.logger.info('Shutting down...');
    clearInterval(cleanupInterval);
    (0, services_1.shutdownWarmPool)().catch(() => { });
    server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
// ── Start ──
server.listen(PORT, () => {
    middleware_2.logger.info(`Kodex's Lab running at http://localhost:${PORT}`);
    middleware_2.logger.info(`WebSocket ready at ws://localhost:${PORT}/ws`);
});
// ── Initialize Warm Container Pool (after listen so server is ready) ──
(0, services_1.initWarmPool)().catch(err => middleware_2.logger.warn({ err: err.message }, 'Warm pool init deferred to first request'));
exports.default = app;
//# sourceMappingURL=server.js.map