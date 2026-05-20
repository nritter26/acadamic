import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import projectsRouter from '../routes/projects';
import { errorHandler } from '../middleware';

const TEST_EMAIL = `proj_${Date.now()}@test.com`;
let token = '';
let projectId = '';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use(errorHandler);

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: TEST_EMAIL, password: 'password123', name: 'Project Tester' });
  token = res.body.token;
}, 15000);

describe('Projects API', () => {
  it('creates a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My App', language: 'js', description: 'A test project' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My App');
    projectId = res.body.id;
  });

  it('lists user projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('gets a project by id', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(projectId);
  });

  it('updates a project', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated App', files: { 'index.js': 'console.log("hello")' } });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated App');
  });

  it('deletes a project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('requires auth for project operations', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'No Auth' });
    expect(res.status).toBe(401);
  });
});
