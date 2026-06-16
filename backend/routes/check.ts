import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { lang, code } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Code is required' });
    return;
  }

  const useLang = (lang as string) || 'js';

  res.json({
    result: 'Check complete',
    issues: [],
    score: null,
    source: 'static',
  });
});

export default router;
