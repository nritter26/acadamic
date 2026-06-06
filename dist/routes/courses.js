import { Router } from 'express';
import fs from 'fs';
import path from 'path';
const router = Router();
router.get('/', (req, res) => {
    try {
        const CONTENT_DIR = path.join(__dirname, '..', 'content');
        const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
        const courses = files.map(f => f.replace('.json', ''));
        res.json(courses);
    }
    catch (e) {
        res.json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=courses.js.map