"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const middleware_1 = require("../middleware");
const middleware_2 = require("../middleware");
const types_1 = require("../types");
// Recreate __dirname for ES Modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const router = (0, express_1.Router)();
const DATA_DIR = path_1.default.join(__dirname, '..', 'data');
const PROGRESS_FILE = path_1.default.join(DATA_DIR, 'progress.json');
function ensureProgressFile() {
    if (!fs_1.default.existsSync(DATA_DIR))
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs_1.default.existsSync(PROGRESS_FILE))
        fs_1.default.writeFileSync(PROGRESS_FILE, '{}');
}
router.get('/', (req, res) => {
    try {
        ensureProgressFile();
        const data = JSON.parse(fs_1.default.readFileSync(PROGRESS_FILE, 'utf-8'));
        res.json(data);
    }
    catch {
        res.json({});
    }
});
router.post('/', (0, middleware_2.validate)(types_1.ProgressSchema), (req, res) => {
    try {
        const { lang, topic, completed } = req.body;
        if (lang === '__proto__' || lang === 'constructor' || lang === 'prototype' ||
            topic === '__proto__' || topic === 'constructor' || topic === 'prototype') {
            throw new middleware_1.AppError(400, 'Invalid key');
        }
        ensureProgressFile();
        const data = JSON.parse(fs_1.default.readFileSync(PROGRESS_FILE, 'utf-8'));
        if (!data[lang])
            data[lang] = {};
        data[lang][topic] = completed ?? true;
        fs_1.default.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
        res.json({ ok: true });
    }
    catch (e) {
        if (e instanceof middleware_1.AppError)
            throw e;
        throw new middleware_1.AppError(400, e.message);
    }
});
exports.default = router;
//# sourceMappingURL=progress.js.map