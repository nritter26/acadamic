"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const zod_1 = require("zod");
const middleware_1 = require("../middleware");
const middleware_2 = require("../middleware");
// Recreate __dirname for ES Modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const router = (0, express_1.Router)();
const CONTENT_DIR = path_1.default.join(__dirname, '..', 'content');
const UpdateContentSchema = zod_1.z.object({
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
});
function getContentFiles() {
    try {
        if (!fs_1.default.existsSync(CONTENT_DIR))
            return [];
        return fs_1.default.readdirSync(CONTENT_DIR)
            .filter(f => f.endsWith('.json'))
            .sort();
    }
    catch {
        return [];
    }
}
function safeLangParam(lang) {
    const safe = lang.replace(/[^a-zA-Z0-9_-]/g, '');
    const files = getContentFiles();
    const match = files.find(f => f.replace('.json', '') === safe || f === safe);
    if (!match)
        throw new middleware_2.AppError(404, `Content file '${safe}' not found`);
    return match;
}
// List all content files
router.get('/', (_req, res) => {
    const files = getContentFiles().map(f => f.replace('.json', ''));
    res.json({ files, count: files.length });
});
// Get content for a specific language
router.get('/:lang', (req, res) => {
    const file = safeLangParam(req.params.lang);
    const filePath = path_1.default.join(CONTENT_DIR, file);
    try {
        const data = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        const phaseCount = Object.keys(data).length;
        const topicCount = Object.values(data).reduce((sum, phase) => sum + Object.keys(phase).length, 0);
        res.json({ lang: file.replace('.json', ''), phases: phaseCount, topics: topicCount, data });
    }
    catch (e) {
        throw new middleware_2.AppError(500, 'Failed to read content file');
    }
});
// Get a specific phase within a language
router.get('/:lang/:phase', (req, res) => {
    const file = safeLangParam(req.params.lang);
    const filePath = path_1.default.join(CONTENT_DIR, file);
    try {
        const data = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        const phase = req.params.phase;
        if (!data[phase])
            throw new middleware_2.AppError(404, `Phase '${phase}' not found in ${file.replace('.json', '')}`);
        res.json({ lang: file.replace('.json', ''), phase, topics: Object.keys(data[phase]).length, data: data[phase] });
    }
    catch (e) {
        if (e instanceof middleware_2.AppError)
            throw e;
        throw new middleware_2.AppError(500, 'Failed to read content');
    }
});
// Update content (auth required)
router.put('/:lang', middleware_1.requireAuth, (0, middleware_1.validate)(UpdateContentSchema), (req, res) => {
    const file = safeLangParam(req.params.lang);
    const filePath = path_1.default.join(CONTENT_DIR, file);
    const { data } = req.body;
    // Validate structure
    if (typeof data !== 'object' || data === null) {
        throw new middleware_2.AppError(400, 'data must be a non-null object');
    }
    for (const [phase, topics] of Object.entries(data)) {
        if (typeof topics !== 'object' || topics === null) {
            throw new middleware_2.AppError(400, `Phase '${phase}' must be an object`);
        }
        for (const [topic, val] of Object.entries(topics)) {
            if (!val || typeof val !== 'object') {
                throw new middleware_2.AppError(400, `Topic '${topic}' in phase '${phase}' must be an object with exp/code fields`);
            }
            const entry = val;
            if (typeof entry.exp !== 'string') {
                throw new middleware_2.AppError(400, `Topic '${topic}' in phase '${phase}' missing required 'exp' string field`);
            }
        }
    }
    // Backup original
    const backupPath = filePath + '.bak';
    try {
        fs_1.default.copyFileSync(filePath, backupPath);
    }
    catch { }
    // Write new content
    fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    const phaseCount = Object.keys(data).length;
    const topicCount = Object.values(data).reduce((sum, phase) => sum + Object.keys(phase).length, 0);
    res.json({ ok: true, lang: file.replace('.json', ''), phases: phaseCount, topics: topicCount });
    // Rebuild AI curriculum index in background
    try {
        const { search } = require('../ai/embeddings');
        search('rebuild', undefined, 1).catch(() => { });
    }
    catch { }
});
// Delete a content file (auth required, destructive)
router.delete('/:lang', middleware_1.requireAuth, (req, res) => {
    const file = safeLangParam(req.params.lang);
    const filePath = path_1.default.join(CONTENT_DIR, file);
    const backupPath = filePath + '.bak';
    try {
        fs_1.default.copyFileSync(filePath, backupPath);
    }
    catch { }
    fs_1.default.unlinkSync(filePath);
    res.json({ ok: true, lang: file.replace('.json', '') });
});
exports.default = router;
//# sourceMappingURL=content.js.map