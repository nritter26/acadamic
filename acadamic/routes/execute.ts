import { Router, Request, Response } from 'express';
import { executeCode, getCompileHint } from '../services';
import { validate } from '../middleware';
import { ExecuteSchema } from '../types';

const router = Router();

router.post('/', validate(ExecuteSchema), async (req: Request, res: Response) => {
  const { lang, code, stdin } = req.body;

  if (lang === 'js') {
    const result = await executeCode(lang, code, stdin);
    res.json(result);
    return;
  }

  if (['sqlite', 'pg', 'mysql'].includes(lang)) {
    const result = await executeCode(lang, code, stdin);
    res.json(result);
    return;
  }

  const result = await executeCode(lang, code, stdin);
  if (result.error) {
    const hint = getCompileHint(lang);
    result.output += '\n' + hint;
  }
  res.json(result);
});

export default router;
