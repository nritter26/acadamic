"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
let projectsDb = null;
function getDb() {
    if (!projectsDb) {
        projectsDb = new better_sqlite3_1.default(path_1.default.join(__dirname, '..', 'data', 'projects.db'));
        projectsDb.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        language TEXT DEFAULT 'js',
        description TEXT DEFAULT '',
        files TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    }
    return projectsDb;
}
// All project routes require auth
router.use(middleware_1.requireAuth);
router.get('/', (req, res) => {
    const user = req.user;
    const db = getDb();
    const projects = db.prepare('SELECT id, name, language, description, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(user.userId);
    res.json(projects);
});
router.get('/:id', (req, res) => {
    const user = req.user;
    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, user.userId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    project.files = JSON.parse(project.files || '{}');
    res.json(project);
});
router.post('/', (0, middleware_1.validate)(types_1.CreateProjectSchema), (req, res) => {
    const user = req.user;
    const db = getDb();
    const id = (0, uuid_1.v4)();
    const { name, language, description } = req.body;
    db.prepare('INSERT INTO projects (id, user_id, name, language, description) VALUES (?, ?, ?, ?, ?)').run(id, user.userId, name, language || 'js', description || '');
    res.status(201).json({ id, name, language: language || 'js', description: description || '' });
});
router.put('/:id', (0, middleware_1.validate)(types_1.UpdateProjectSchema), (req, res) => {
    const user = req.user;
    const db = getDb();
    const existing = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, user.userId);
    if (!existing) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const updates = [];
    const params = [];
    if (req.body.name !== undefined) {
        updates.push('name = ?');
        params.push(req.body.name);
    }
    if (req.body.language !== undefined) {
        updates.push('language = ?');
        params.push(req.body.language);
    }
    if (req.body.description !== undefined) {
        updates.push('description = ?');
        params.push(req.body.description);
    }
    if (req.body.files !== undefined) {
        updates.push('files = ?');
        params.push(JSON.stringify(req.body.files));
    }
    if (updates.length > 0) {
        updates.push("updated_at = datetime('now')");
        params.push(req.params.id, user.userId);
        db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
    }
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, user.userId);
    project.files = JSON.parse(project.files || '{}');
    res.json(project);
});
router.delete('/:id', (req, res) => {
    const user = req.user;
    const db = getDb();
    const result = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, user.userId);
    if (result.changes === 0) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=projects.js.map