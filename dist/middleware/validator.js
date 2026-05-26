"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const { ZodError } = require('zod');
            next(result.error);
            return;
        }
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=validator.js.map