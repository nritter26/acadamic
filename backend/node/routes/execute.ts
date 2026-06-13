import { Router, Request, Response } from 'express';
import { executeCode, getCompileHint, executeServerCode } from '../services';
import { validate } from '../middleware';
import { ExecuteSchema } from '../types';

const router = Router();

router.post('/', validate(ExecuteSchema), async (req: Request, res: Response) => {
  try {
    const { lang, code, stdin, serverMode, httpTests } = req.body;

    if (serverMode && httpTests?.length > 0) {
      const result = await executeServerCode(lang, code, httpTests);
      res.json(result);
      return;
    }

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
  } catch (e) {
    res.status(500).json({ output: 'Execution error: ' + (e as Error).message, error: true });
  }
});

export default router;
