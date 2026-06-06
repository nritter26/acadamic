import { ZodError } from 'zod';
import { logger } from './logger';
export class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
export function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
        return;
    }
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: (err.issues || err.errors || []).map((e) => ({
                path: e.path?.join?.('.') || 'unknown',
                message: e.message || 'Invalid value',
            })),
        });
        return;
    }
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
    });
}
export function notFound(_req, res) {
    res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}
//# sourceMappingURL=errorHandler.js.map