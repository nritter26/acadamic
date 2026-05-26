import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';
import { errorHandler } from '../middleware';

const TEST_EMAIL = `test_${Date.now()}@example.com`;
let token = '';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

describe('Auth API', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: 'password123', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(TEST_EMAIL);
    token = res.body.token;
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_EXISTS');
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(TEST_EMAIL);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects weak passwords on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'weak@example.com', password: '123' });
    expect(res.status).toBe(400);
  });
});
