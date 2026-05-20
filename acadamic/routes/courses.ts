import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const CONTENT_DIR = path.join(__dirname, '..', 'content');
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
    const courses = files.map(f => f.replace('.json', ''));
    res.json(courses);
  } catch (e) {
    res.json({ error: (e as Error).message });
  }
});

export default router;
