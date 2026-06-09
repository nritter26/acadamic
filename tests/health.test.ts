import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import healthRouter from '../backend/routes/health';
import { errorHandler } from '../backend/middleware';

const app = express();
app.use('/api', healthRouter);
app.use(errorHandler);

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('node');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('compilers');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('rateLimit');
  });
});

describe('GET /api/ollama/status', () => {
  it('returns ollama status', async () => {
    const res = await request(app).get('/api/ollama/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('available');
    expect(res.body).toHaveProperty('models');
  });
});
