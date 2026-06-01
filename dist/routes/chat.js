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
    const { message, lang, topic, phase, code, output, hasError, history, learnerId, provider, model, apiKey, endpoint } = req.body;
    let aborted = false;
    const onClose = () => { aborted = true; };
    const onFinish = () => { req.off('close', onClose); };
    req.on('close', onClose);
    res.on('finish', onFinish);
    const TIMEOUT_MS = 30000;
    const timeoutHandle = setTimeout(() => {
        if (!aborted) {
            aborted = true;
            res.write(`data: ${JSON.stringify({ content: "\n\n[TIMEOUT] The AI tutor took too long to respond. Please try again." })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
    }, TIMEOUT_MS);
    res.on('finish', () => clearTimeout(timeoutHandle));
    req.on('close', () => clearTimeout(timeoutHandle));
    if (!message) {
        res.write(`data: ${JSON.stringify({ content: "Ask me something about programming!" })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
    }
    const sseSend = (chunk) => {
        if (aborted)
            return;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    };
    const sseDone = () => {
        clearTimeout(timeoutHandle);
        if (aborted)
            return;
        res.write('data: [DONE]\n\n');
        res.end();
    };
    const providerConfig = (provider || model || apiKey || endpoint)
        ? { provider, model, apiKey, endpoint }
        : undefined;
    try {
        await (0, services_1.handleTutorMessage)(message, { lang, topic, phase, code, output, hasError, history, learnerId, providerConfig }, sseSend, sseDone);
    }
    catch (e) {
        if (!aborted) {
            res.write(`data: ${JSON.stringify({ content: 'Error: ' + e.message })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map