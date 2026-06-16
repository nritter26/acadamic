import { Router, Request, Response } from 'express';
import { generateStructureReview } from '../ai/reviewer';
import { validate } from '../middleware';
import { CheckSchema } from '../types';

const router = Router();

router.post('/', validate(CheckSchema), async (req: Request, res: Response) => {
  const { lang, code } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Code is required' });
    return;
  }

  const useLang = (lang as string) || 'js';

  const { review, issues, score } = generateStructureReview(code, useLang);

  res.json({ result: review, issues, score, source: 'static' });
});

export default router;
