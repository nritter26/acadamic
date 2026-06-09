import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import analyzeRouter from '../backend/routes/analyze';
import { errorHandler } from '../backend/middleware';

const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRouter);
app.use(errorHandler);

describe('POST /api/analyze', () => {
  it('returns hints for JS code with ==', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ code: 'if (a == b) {}', lang: 'js' });
    expect(res.status).toBe(200);
    expect(res.body.hints.length).toBeGreaterThan(0);
    expect(res.body.hints[0]).toContain('===');
  });

  it('returns empty hints for clean code', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ code: 'const x = 1;', lang: 'js' });
    expect(res.status).toBe(200);
    expect(res.body.hints).toEqual([]);
  });

  it('returns empty hints for no code', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ lang: 'js' });
    expect(res.status).toBe(200);
    expect(res.body.hints).toEqual([]);
  });

  it('returns 400 for invalid body', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ code: 123 });
    expect(res.status).toBe(400);
  });
});
