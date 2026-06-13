import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { validate, requireAuth } from '../middleware';
import { AppError } from '../middleware';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const CONTENT_DIR = path.join(__dirname, '..', 'content');

const UpdateContentSchema = z.object({
  data: z.record(z.string(), z.any()),
});
type UpdateContentInput = z.infer<typeof UpdateContentSchema>;

function getContentFiles(): string[] {
  try {
    if (!fs.existsSync(CONTENT_DIR)) return [];
    return fs.readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();
  } catch {
    return [];
  }
}

function safeLangParam(lang: string): string {
  const safe = lang.replace(/[^a-zA-Z0-9_-]/g, '');
  const files = getContentFiles();
  const match = files.find(f => f.replace('.json', '') === safe || f === safe);
  if (!match) throw new AppError(404, `Content file '${safe}' not found`);
  return match;
}

// List all content files
router.get('/', (_req: Request, res: Response) => {
  const files = getContentFiles().map(f => f.replace('.json', ''));
  res.json({ files, count: files.length });
});

// List all projects (bulk)
router.get('/projects', (_req: Request, res: Response) => {
  const projectsDir = path.join(CONTENT_DIR, 'projects');
  if (!fs.existsSync(projectsDir)) {
    res.json([]);
    return;
  }
  try {
    const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json')).sort();
    const total = files.length;

    // Support NDJSON streaming for lazy loading
    const acceptsStream = _req.headers.accept === 'application/x-ndjson';
    if (acceptsStream) {
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('X-Total-Projects', String(total));
      for (const f of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(projectsDir, f), 'utf-8'));
          res.write(JSON.stringify(data) + '\n');
        } catch {
          // Skip corrupt files
        }
      }
      res.end();
      return;
    }

    // Default: return all projects as JSON array
    const projects = files.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(projectsDir, f), 'utf-8'));
      } catch {
        return null;
      }
    }).filter(Boolean);
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Failed to read projects directory' });
  }
});

// Get a single project catalog file
router.get('/projects/:id', (req: Request, res: Response) => {
  const projectPath = path.join(CONTENT_DIR, 'projects', `${req.params.id}.json`);
  if (!fs.existsSync(projectPath)) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  try {
    const data = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to read project file' });
  }
});

// Get content for a specific language
router.get('/:lang', (req: Request, res: Response) => {
  const file = safeLangParam(req.params.lang);
  const filePath = path.join(CONTENT_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const phaseCount = Object.keys(data).length;
    const topicCount = Object.values(data).reduce(
      (sum: number, phase: any) => sum + Object.keys(phase).length, 0,
    );
    res.json({ lang: file.replace('.json', ''), phases: phaseCount, topics: topicCount, data });
  } catch (e) {
    throw new AppError(500, 'Failed to read content file');
  }
});

// Get a specific phase within a language
router.get('/:lang/:phase', (req: Request, res: Response) => {
  const file = safeLangParam(req.params.lang);
  const filePath = path.join(CONTENT_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const phase = req.params.phase;
    if (!data[phase]) throw new AppError(404, `Phase '${phase}' not found in ${file.replace('.json', '')}`);
    res.json({ lang: file.replace('.json', ''), phase, topics: Object.keys(data[phase]).length, data: data[phase] });
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(500, 'Failed to read content');
  }
});

// Update content (auth required)
router.put('/:lang', requireAuth, validate(UpdateContentSchema), (req: Request, res: Response) => {
  const file = safeLangParam(req.params.lang);
  const filePath = path.join(CONTENT_DIR, file);
  const { data } = req.body as UpdateContentInput;

  // Validate structure
  if (typeof data !== 'object' || data === null) {
    throw new AppError(400, 'data must be a non-null object');
  }
  for (const [phase, topics] of Object.entries(data)) {
    if (typeof topics !== 'object' || topics === null) {
      throw new AppError(400, `Phase '${phase}' must be an object`);
    }
    for (const [topic, val] of Object.entries(topics as Record<string, unknown>)) {
      if (!val || typeof val !== 'object') {
        throw new AppError(400, `Topic '${topic}' in phase '${phase}' must be an object with exp/code fields`);
      }
      const entry = val as Record<string, unknown>;
      if (typeof entry.exp !== 'string') {
        throw new AppError(400, `Topic '${topic}' in phase '${phase}' missing required 'exp' string field`);
      }
    }
  }

  // Backup original
  const backupPath = filePath + '.bak';
  try {
    fs.copyFileSync(filePath, backupPath);
  } catch {}

  // Write new content
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');

  const phaseCount = Object.keys(data).length;
  const topicCount = Object.values(data).reduce(
    (sum: number, phase: any) => sum + Object.keys(phase).length, 0,
  );

  res.json({ ok: true, lang: file.replace('.json', ''), phases: phaseCount, topics: topicCount });

  // Rebuild AI curriculum index in background
  try {
    const { search } = require('../ai/embeddings');
    search('rebuild', undefined, 1).catch(() => {});
  } catch {}
});

// Delete a content file (auth required, destructive)
router.delete('/:lang', requireAuth, (req: Request, res: Response) => {
  const file = safeLangParam(req.params.lang);
  const filePath = path.join(CONTENT_DIR, file);
  const backupPath = filePath + '.bak';
  try { fs.copyFileSync(filePath, backupPath); } catch {}
  fs.unlinkSync(filePath);
  res.json({ ok: true, lang: file.replace('.json', '') });
});

export default router;
