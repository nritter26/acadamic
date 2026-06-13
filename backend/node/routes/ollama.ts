import { Router, Request, Response } from 'express';
import { getOllamaStatus } from '../services';

const router = Router();

router.get('/models', async (_req: Request, res: Response) => {
  try {
    const status = await getOllamaStatus();
    res.json({ models: status.models || [] });
  } catch {
    res.json({ models: [] });
  }
});

export default router;
