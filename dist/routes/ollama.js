"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const router = (0, express_1.Router)();
router.get('/models', async (_req, res) => {
    try {
        const status = await (0, services_1.getOllamaStatus)();
        res.json({ models: status.models || [] });
    }
    catch {
        res.json({ models: [] });
    }
});
exports.default = router;
//# sourceMappingURL=ollama.js.map