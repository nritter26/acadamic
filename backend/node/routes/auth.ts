import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { validate, generateToken, requireAuth, type AuthPayload } from '../middleware';
import { RegisterSchema, LoginSchema } from '../types';

const router = Router();

let authDb: Database.Database | null = null;

function getDb(): Database.Database {
  if (!authDb) {
    authDb = new Database(path.join(__dirname, '..', 'data', 'auth.db'));
    authDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }
  return authDb;
}

router.post('/register', validate(RegisterSchema), async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' });
    return;
  }

  const id = uuid();
  const password_hash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, email, password_hash, name || '');

  const token = generateToken({ userId: id, email, name: name || '' });
  res.status(201).json({ token, user: { id, email, name: name || '' } });
});

router.post('/login', validate(LoginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string; email: string; password_hash: string; name: string } | undefined;
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    return;
  }

  const token = generateToken({ userId: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user as AuthPayload;
  const db = getDb();
  const record = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(user.userId);
  if (!record) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(record);
});

export default router;
