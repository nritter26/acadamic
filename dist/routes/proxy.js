"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post('/', (0, middleware_1.validate)(types_1.ProxySchema), async (req, res) => {
    const { method = 'GET', url, headers: reqHeaders = {}, body } = req.body;
    if (!url) {
        res.status(400).json({ error: 'No URL provided' });
        return;
    }
    if (!(await (0, services_1.isValidProxyUrl)(url))) {
        res.status(400).json({ error: 'Invalid or forbidden URL' });
        return;
    }
    try {
        const result = await (0, services_1.proxyRequest)(method, url, reqHeaders, body);
        res.json(result);
    }
    catch (e) {
        res.json({
            error: e.message,
            status: 0,
            statusText: '',
            headers: {},
            body: '',
            displayBody: '',
            time: 0,
            size: 0,
        });
    }
});
exports.default = router;
//# sourceMappingURL=proxy.js.map