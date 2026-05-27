"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const n = parseInt(req.query.n) || 10000;
    const count = n;
    const start = process.hrtime.bigint();
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum += i * i;
    }
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    res.json({
        backend: 'Node.js',
        version: process.version,
        iterations: count,
        result: sum,
        timeMs: Math.round(ms * 100) / 100,
        opsPerSec: Math.round(count / (ms / 1000)),
    });
});
exports.default = router;
//# sourceMappingURL=benchmark.js.map