"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFound = notFound;
const zod_1 = require("zod");
const logger_1 = require("./logger");
class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
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
    logger_1.logger.error({ err }, 'Unhandled error');
    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
    });
}
function notFound(_req, res) {
    res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}
//# sourceMappingURL=errorHandler.js.map