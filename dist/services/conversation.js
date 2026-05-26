"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMessage = addMessage;
exports.getHistory = getHistory;
exports.clearConversation = clearConversation;
exports.pruneOldConversations = pruneOldConversations;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const CONV_DIR = path_1.default.join(__dirname, '..', 'data', 'conversations');
const cache = new Map();
const MAX_CACHE_SIZE = 100;
const TTL_MS = 24 * 60 * 60 * 1000;
function getPath(learnerId) {
    const safe = learnerId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path_1.default.join(CONV_DIR, `${safe}.json`);
}
async function ensureDir() {
    await promises_1.default.mkdir(CONV_DIR, { recursive: true });
}
async function load(learnerId) {
    const cached = cache.get(learnerId);
    if (cached)
        return cached;
    try {
        await ensureDir();
        const fp = getPath(learnerId);
        const raw = await promises_1.default.readFile(fp, 'utf-8');
        const conv = JSON.parse(raw);
        const cutoff = Date.now() - TTL_MS;
        conv.messages = conv.messages.filter(m => m.timestamp > cutoff);
        conv.updatedAt = Date.now();
        cache.set(learnerId, conv);
        return conv;
    }
    catch {
        const conv = { learnerId, messages: [], updatedAt: Date.now() };
        cache.set(learnerId, conv);
        return conv;
    }
}
async function save(conv) {
    await ensureDir();
    conv.updatedAt = Date.now();
    const fp = getPath(conv.learnerId);
    const tmp = fp + '.tmp';
    await promises_1.default.writeFile(tmp, JSON.stringify(conv));
    await promises_1.default.rename(tmp, fp);
}
async function addMessage(learnerId, role, content) {
    const conv = await load(learnerId);
    conv.messages.push({ role, content, timestamp: Date.now() });
    if (conv.messages.length > 100) {
        conv.messages = conv.messages.slice(-100);
    }
    await save(conv);
    if (cache.size > MAX_CACHE_SIZE) {
        const oldest = [...cache.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt)[0];
        if (oldest)
            cache.delete(oldest[0]);
    }
}
async function getHistory(learnerId, n = 20) {
    const conv = await load(learnerId);
    return conv.messages.slice(-n);
}
async function clearConversation(learnerId) {
    cache.delete(learnerId);
    try {
        await promises_1.default.unlink(getPath(learnerId));
    }
    catch { }
}
async function pruneOldConversations() {
    try {
        await ensureDir();
        const files = await promises_1.default.readdir(CONV_DIR);
        const cutoff = Date.now() - TTL_MS;
        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;
            const fp = path_1.default.join(CONV_DIR, file);
            try {
                const stat = await promises_1.default.stat(fp);
                if (stat.mtimeMs < cutoff) {
                    await promises_1.default.unlink(fp);
                    const id = file.replace('.json', '');
                    cache.delete(id);
                }
            }
            catch { }
        }
    }
    catch { }
}
//# sourceMappingURL=conversation.js.map