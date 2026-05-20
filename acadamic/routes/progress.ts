import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AppError } from '../middleware';
import { validate } from '../middleware';
import { ProgressSchema } from '../types';

const router = Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

function ensureProgressFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROGRESS_FILE)) fs.writeFileSync(PROGRESS_FILE, '{}');
}

router.get('/', (req: Request, res: Response) => {
  try {
    ensureProgressFile();
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    res.json(data);
  } catch {
    res.json({});
  }
});

router.post('/', validate(ProgressSchema), (req: Request, res: Response) => {
  try {
    const { lang, topic, completed } = req.body;
    if (lang === '__proto__' || lang === 'constructor' || lang === 'prototype' ||
        topic === '__proto__' || topic === 'constructor' || topic === 'prototype') {
      throw new AppError(400, 'Invalid key');
    }
    ensureProgressFile();
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) as Record<string, Record<string, boolean>>;
    if (!data[lang]) data[lang] = {};
    data[lang][topic] = completed ?? true;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(400, (e as Error).message);
  }
});

export default router;
