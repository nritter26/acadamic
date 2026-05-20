"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post('/', (0, middleware_1.validate)(types_1.ExecuteSchema), async (req, res) => {
    const { lang, code, stdin } = req.body;
    if (lang === 'js') {
        const result = await (0, services_1.executeCode)(lang, code, stdin);
        res.json(result);
        return;
    }
    if (['sqlite', 'pg', 'mysql'].includes(lang)) {
        const result = await (0, services_1.executeCode)(lang, code, stdin);
        res.json(result);
        return;
    }
    const result = await (0, services_1.executeCode)(lang, code, stdin);
    if (result.error) {
        const hint = (0, services_1.getCompileHint)(lang);
        result.output += '\n' + hint;
    }
    res.json(result);
});
exports.default = router;
//# sourceMappingURL=execute.js.map