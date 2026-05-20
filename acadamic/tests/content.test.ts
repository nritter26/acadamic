import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import contentRouter from '../routes/content';
import authRouter from '../routes/auth';
import { errorHandler } from '../middleware';

const app = express();
app.use(express.json());
app.use('/api/content', contentRouter);
app.use('/api/auth', authRouter);
app.use(errorHandler);

describe('Content API', () => {
  it('lists all content files', async () => {
    const res = await request(app).get('/api/content');
    expect(res.status).toBe(200);
    expect(res.body.files.length).toBeGreaterThan(50);
    expect(res.body.count).toBeGreaterThan(50);
    expect(res.body.files).toContain('js');
    expect(res.body.files).toContain('py');
    expect(res.body.files).toContain('go');
  });

  it('gets content for a language', async () => {
    const res = await request(app).get('/api/content/js');
    expect(res.status).toBe(200);
    expect(res.body.lang).toBe('js');
    expect(res.body.phases).toBeGreaterThan(0);
    expect(res.body.topics).toBeGreaterThan(0);
    expect(res.body.data).toBeDefined();
  });

  it('gets a specific phase', async () => {
    const res = await request(app).get('/api/content/js/Fundamentals');
    expect(res.status).toBe(200);
    expect(res.body.phase).toBe('Fundamentals');
    expect(res.body.topics).toBeGreaterThan(0);
  });

  it('returns 404 for unknown language', async () => {
    const res = await request(app).get('/api/content/nonexistent');
    expect(res.status).toBe(404);
  });

  it('returns 404 for unknown phase', async () => {
    const res = await request(app).get('/api/content/js/NoSuchPhase');
    expect(res.status).toBe(404);
  });

  it('requires auth for content updates', async () => {
    const res = await request(app)
      .put('/api/content/js')
      .send({ data: { Test: { test: { exp: '<p>test</p>' } } } });
    expect(res.status).toBe(401);
  });

  it('requires auth for content deletion', async () => {
    const res = await request(app).delete('/api/content/js');
    expect(res.status).toBe(401);
  });
});
