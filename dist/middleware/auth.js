import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'kodex-dev-secret-change-in-production';
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}
export function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        try {
            req.user = verifyToken(header.slice(7));
        }
        catch {
            // Invalid token — continue without auth
        }
    }
    next();
}
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
        return;
    }
    try {
        req.user = verifyToken(header.slice(7));
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
    }
}
//# sourceMappingURL=auth.js.map