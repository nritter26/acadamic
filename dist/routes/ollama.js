import { Router } from 'express';
import { getOllamaStatus } from '../services';
const router = Router();
router.get('/models', async (_req, res) => {
    try {
        const status = await getOllamaStatus();
        res.json({ models: status.models || [] });
    }
    catch {
        res.json({ models: [] });
    }
});
export default router;
//# sourceMappingURL=ollama.js.map