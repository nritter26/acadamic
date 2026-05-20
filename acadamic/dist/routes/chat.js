"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post('/', (0, middleware_1.validate)(types_1.ChatSchema), async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const { message, lang, topic, phase, code, output, hasError, history, learnerId } = req.body;
    if (!message) {
        res.write(`data: ${JSON.stringify({ content: "Ask me something about programming!" })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
    }
    const sseSend = (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    };
    const sseDone = () => {
        res.write('data: [DONE]\n\n');
        res.end();
    };
    await (0, services_1.handleTutorMessage)(message, { lang, topic, phase, code, output, hasError, history, learnerId }, sseSend, sseDone);
});
exports.default = router;
//# sourceMappingURL=chat.js.map