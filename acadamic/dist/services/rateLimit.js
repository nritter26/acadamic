"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
exports.getRateLimitInfo = getRateLimitInfo;
const rateLimitStore = new Map();
const RATE_WINDOW = 60000;
const RATE_MAX = 30;
// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of rateLimitStore) {
        const valid = timestamps.filter(t => now - t < RATE_WINDOW);
        if (valid.length === 0)
            rateLimitStore.delete(ip);
        else
            rateLimitStore.set(ip, valid);
    }
}, 300000);
function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    if (!rateLimitStore.has(ip))
        rateLimitStore.set(ip, []);
    const timestamps = rateLimitStore.get(ip).filter(t => now - t < RATE_WINDOW);
    if (timestamps.length >= RATE_MAX) {
        res.status(429).json({ error: 'Too many requests. Try again shortly.' });
        return;
    }
    timestamps.push(now);
    rateLimitStore.set(ip, timestamps);
    next();
}
function getRateLimitInfo() {
    return { window: '60s', max: RATE_MAX };
}
//# sourceMappingURL=rateLimit.js.map