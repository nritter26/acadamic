import pino from 'pino';
export const logger = pino({
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    level: process.env.LOG_LEVEL || 'info',
});
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        logger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            ms: Date.now() - start,
            ip: req.ip,
        });
    });
    next();
}
//# sourceMappingURL=logger.js.map