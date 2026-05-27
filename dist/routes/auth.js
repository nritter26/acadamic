"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
let authDb = null;
function getDb() {
    if (!authDb) {
        authDb = new better_sqlite3_1.default(path_1.default.join(__dirname, '..', 'data', 'auth.db'));
        authDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    }
    return authDb;
}
router.post('/register', (0, middleware_1.validate)(types_1.RegisterSchema), async (req, res) => {
    const { email, password, name } = req.body;
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        res.status(409).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' });
        return;
    }
    const id = (0, uuid_1.v4)();
    const password_hash = await bcryptjs_1.default.hash(password, 10);
    db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, email, password_hash, name || '');
    const token = (0, middleware_1.generateToken)({ userId: id, email, name: name || '' });
    res.status(201).json({ token, user: { id, email, name: name || '' } });
});
router.post('/login', (0, middleware_1.validate)(types_1.LoginSchema), async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
        return;
    }
    const valid = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!valid) {
        res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
        return;
    }
    const token = (0, middleware_1.generateToken)({ userId: user.id, email: user.email, name: user.name });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
router.get('/me', middleware_1.requireAuth, (req, res) => {
    const user = req.user;
    const db = getDb();
    const record = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(user.userId);
    if (!record) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    res.json(record);
});
exports.default = router;
//# sourceMappingURL=auth.js.map