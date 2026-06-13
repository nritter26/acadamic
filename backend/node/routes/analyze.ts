import { Router, Request, Response } from 'express';
import { analyzeCode } from '../services';
import { validate } from '../middleware';
import { AnalyzeSchema } from '../types';

const router = Router();

router.post('/', validate(AnalyzeSchema), (req: Request, res: Response) => {
  const { code, lang } = req.body;
  const result = analyzeCode(code, lang);
  res.json(result);
});

export default router;
