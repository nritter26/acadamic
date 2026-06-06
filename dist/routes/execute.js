import { Router } from 'express';
import { executeCode, getCompileHint } from '../services';
import { validate } from '../middleware';
import { ExecuteSchema } from '../types';
const router = Router();
router.post('/', validate(ExecuteSchema), async (req, res) => {
    try {
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
    }
    catch (e) {
        res.status(500).json({ output: 'Execution error: ' + e.message, error: true });
    }
});
export default router;
//# sourceMappingURL=execute.js.map