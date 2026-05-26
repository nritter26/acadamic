"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.requestLogger = requestLogger;
const pino_1 = __importDefault(require("pino"));
exports.logger = (0, pino_1.default)({
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    level: process.env.LOG_LEVEL || 'info',
});
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        exports.logger.info({
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