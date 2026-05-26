"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post('/', (0, middleware_1.validate)(types_1.AnalyzeSchema), (req, res) => {
    const { code, lang } = req.body;
    const result = (0, services_1.analyzeCode)(code, lang);
    res.json(result);
});
exports.default = router;
//# sourceMappingURL=analyze.js.map