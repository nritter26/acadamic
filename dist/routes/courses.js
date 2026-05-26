"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    try {
        const CONTENT_DIR = path_1.default.join(__dirname, '..', 'content');
        const files = fs_1.default.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
        const courses = files.map(f => f.replace('.json', ''));
        res.json(courses);
    }
    catch (e) {
        res.json({ error: e.message });
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map