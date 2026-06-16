import { Router, Request, Response } from 'express';
import { generateStructureReview } from '../ai/reviewer';
import { validate } from '../middleware';
import { CheckSchema } from '../types';

const router = Router();

router.post('/', validate(CheckSchema), async (req: Request, res: Response) => {
  const { lang, code } = req.body;

  const useLang = (lang as string) || 'js';

  if (!code.trim()) {
    res.json({ result: 'No code to check.', issues: [], score: 0, source: 'static' });
    return;
  }

  try {
    const { review, issues, score } = generateStructureReview(code, useLang);

    res.json({ result: review, issues, score, source: 'static' });
  } catch (e) {
    console.error('[check] error:', (e as Error).message);
    res.status(500).json({ error: 'Check failed', result: 'Internal error.' });
  }
});

export default router;
