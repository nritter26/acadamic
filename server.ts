import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url'; // 1. Import fileURLToPath

import { requestLogger, errorHandler, notFound, optionalAuth } from './middleware';
import { rateLimit, detectOllama, setupWebSocket, getWSStats, metricsHandler, trackRequest, openapiHandler, swaggerUIHandler, pruneOldConversations } from './services';
import { logger } from './middleware';
import * as database from './sql/database';
import apiRoutes from './routes';

// 2. Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

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
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(express.static(__dirname));
app.use(requestLogger);

// Track request metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    trackRequest(Date.now() - start, res.statusCode);
  });
  next();
});

app.use('/api/', rateLimit);
app.use(optionalAuth);

// ── Ensure data directory exists ──
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Initialize Database ──
const dbStatus = database.initAll();
logger.info({ db: dbStatus }, 'Database initialized');

// ── AI Provider Config ──
const AI_PROVIDER = process.env.AI_PROVIDER || 'hybrid';
if (AI_PROVIDER !== 'keyword' && AI_PROVIDER !== 'hybrid') {
  const REQUIRED_FOR_AI: Record<string, string> = { OPENAI_API_KEY: 'openai', ANTHROPIC_API_KEY: 'anthropic', LOCAL_LLM_ENDPOINT: 'local' };
  const keyForProvider = AI_PROVIDER === 'openai' ? 'OPENAI_API_KEY' : AI_PROVIDER === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'LOCAL_LLM_ENDPOINT';
  if (!process.env[keyForProvider]) {
    logger.error({ AI_PROVIDER }, `AI_PROVIDER="${AI_PROVIDER}" requires ${keyForProvider} but it's not set. Set the env var or use AI_PROVIDER=keyword`);
    process.exit(1);
  }
}
if (!process.env.AI_SYSTEM_PROMPT) {
  logger.info('Using default AI_SYSTEM_PROMPT. Set AI_SYSTEM_PROMPT to customize.');
}
logger.info(`AI Provider: ${AI_PROVIDER}`);

// ── Auto-detect Ollama ──
detectOllama();

// ── Mount API Routes ──
app.use('/api', apiRoutes);

// ── WebSocket stats endpoint ──
app.get('/api/ws/stats', (_req, res) => {
  res.json(getWSStats());
});

// ── Prometheus metrics endpoint ──
app.get('/api/metrics', metricsHandler);

// ── OpenAPI documentation ──
app.get('/api/openapi.json', openapiHandler);
app.get('/api/docs', swaggerUIHandler);

// ── Error Handling ──
app.use(notFound);
app.use(errorHandler);

// ── Create HTTP server (needed for WebSocket) ──
const server = http.createServer(app);

// ── Setup WebSocket ──
setupWebSocket(server);

// ── Schedule periodic cleanup ──
const cleanupInterval = setInterval(pruneOldConversations, 3_600_000);

// ── Graceful shutdown ──
function shutdown() {
  logger.info('Shutting down...');
  clearInterval(cleanupInterval);

  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ── Start ──
server.listen(PORT, () => {
  logger.info(`Kodex's Lab running at http://localhost:${PORT}`);
  logger.info(`WebSocket ready at ws://localhost:${PORT}/ws`);
});

export default app;

