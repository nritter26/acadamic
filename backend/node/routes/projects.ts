import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { validate, requireAuth, type AuthPayload } from '../middleware';
import { CreateProjectSchema, UpdateProjectSchema } from '../types';

const router = Router();

let projectsDb: Database.Database | null = null;

function getDb(): Database.Database {
  if (!projectsDb) {
    projectsDb = new Database(path.join(__dirname, '..', 'data', 'projects.db'));
    projectsDb.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        language TEXT DEFAULT 'js',
        description TEXT DEFAULT '',
        files TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }
  return projectsDb;
}

// All project routes require auth
router.use(requireAuth);

router.get('/', (req: Request, res: Response) => {
  const user = req.user as AuthPayload;
  const db = getDb();
  const projects = db.prepare('SELECT id, name, language, description, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(user.userId);
  res.json(projects);
});

router.get('/:id', (req: Request, res: Response) => {
  const user = req.user as AuthPayload;
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, user.userId) as Record<string, unknown> | undefined;
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  project.files = JSON.parse(project.files as string || '{}');
  res.json(project);
});

router.post('/', validate(CreateProjectSchema), (req: Request, res: Response) => {
  const user = req.user as AuthPayload;
  const db = getDb();
  const id = uuid();
  const { name, language, description } = req.body;
  db.prepare('INSERT INTO projects (id, user_id, name, language, description) VALUES (?, ?, ?, ?, ?)').run(id, user.userId, name, language || 'js', description || '');
  res.status(201).json({ id, name, language: language || 'js', description: description || '' });
});

router.put('/:id', validate(UpdateProjectSchema), (req: Request, res: Response) => {
  const user = req.user as AuthPayload;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, user.userId);
  if (!existing) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (req.body.name !== undefined) { updates.push('name = ?'); params.push(req.body.name); }
  if (req.body.language !== undefined) { updates.push('language = ?'); params.push(req.body.language); }
  if (req.body.description !== undefined) { updates.push('description = ?'); params.push(req.body.description); }
  if (req.body.files !== undefined) { updates.push('files = ?'); params.push(JSON.stringify(req.body.files)); }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id, user.userId);
    db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, user.userId) as Record<string, unknown>;
  project.files = JSON.parse(project.files as string || '{}');
  res.json(project);
});

router.delete('/:id', (req: Request, res: Response) => {
  const user = req.user as AuthPayload;
  const db = getDb();
  const result = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, user.userId);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json({ ok: true });
});

export default router;
