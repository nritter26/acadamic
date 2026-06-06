import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../middleware';
import { validate } from '../middleware';
import { ProgressSchema } from '../types';
// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
function ensureProgressFile() {
    if (!fs.existsSync(DATA_DIR))
        fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PROGRESS_FILE))
        fs.writeFileSync(PROGRESS_FILE, '{}');
}
router.get('/', (req, res) => {
    try {
        ensureProgressFile();
        const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        res.json(data);
    }
    catch {
        res.json({});
    }
});
router.post('/', validate(ProgressSchema), (req, res) => {
    try {
        const { lang, topic, completed } = req.body;
        if (lang === '__proto__' || lang === 'constructor' || lang === 'prototype' ||
            topic === '__proto__' || topic === 'constructor' || topic === 'prototype') {
            throw new AppError(400, 'Invalid key');
        }
        ensureProgressFile();
        const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        if (!data[lang])
            data[lang] = {};
        data[lang][topic] = completed ?? true;
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
        res.json({ ok: true });
    }
    catch (e) {
        if (e instanceof AppError)
            throw e;
        throw new AppError(400, e.message);
    }
});
export default router;
//# sourceMappingURL=progress.js.map