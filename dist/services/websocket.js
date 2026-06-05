"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.broadcastToProject = broadcastToProject;
exports.getWSStats = getWSStats;
const ws_1 = require("ws");
const tutor_1 = require("./tutor");
const executor_1 = require("./executor");
const middleware_1 = require("../middleware");
const middleware_2 = require("../middleware");
const clients = new Map();
function generateId() {
    return Math.random().toString(36).slice(2, 10);
}
function send(ws, type, data) {
    if (ws.readyState === ws_1.WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, ...data }));
    }
}
function setupWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws, req) => {
        const clientId = generateId();
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        let user;
        if (token) {
            try {
                user = (0, middleware_1.verifyToken)(token);
            }
            catch { }
        }
        const client = { ws, id: clientId, userId: user?.userId };
        clients.set(clientId, client);
        middleware_2.logger.info({ clientId, userId: user?.userId }, 'WebSocket connected');
        // Send welcome
        send(ws, 'connected', { clientId, authenticated: !!user });
        ws.on('message', async (raw) => {
            let msg;
            try {
                msg = JSON.parse(raw.toString());
            }
            catch {
                send(ws, 'error', { message: 'Invalid JSON' });
                return;
            }
            try {
                await handleWSMessage(ws, client, msg);
            }
            catch (err) {
                middleware_2.logger.error({ err, clientId, msgType: msg.type }, 'WS message error');
                send(ws, 'error', { message: 'Internal error processing message' });
            }
        });
        ws.on('close', () => {
            clients.delete(clientId);
            middleware_2.logger.info({ clientId }, 'WebSocket disconnected');
        });
        ws.on('error', (err) => {
            middleware_2.logger.error({ err, clientId }, 'WebSocket error');
            clients.delete(clientId);
        });
    });
    middleware_2.logger.info('WebSocket server ready at /ws');
    return wss;
}
async function handleWSMessage(ws, client, msg) {
    switch (msg.type) {
        case 'ping':
            send(ws, 'pong', {});
            break;
        case 'chat': {
            const { message, lang, topic, phase, code, output, hasError, history, learnerId } = msg;
            if (!message) {
                send(ws, 'chat:error', { message: 'No message provided' });
                return;
            }
            const sseSend = (chunk) => {
                send(ws, 'chat:chunk', { content: chunk });
            };
            const sseDone = () => {
                send(ws, 'chat:done', {});
            };
            await (0, tutor_1.handleTutorMessage)(message, {
                lang: lang,
                topic: topic,
                phase: phase,
                code: code,
                output: output,
                hasError: hasError,
                history: history,
                learnerId: (learnerId || client.userId),
            }, sseSend, sseDone);
            break;
        }
        case 'execute': {
            const { lang, code, stdin } = msg;
            if (!lang || !code) {
                send(ws, 'execute:error', { message: 'lang and code required' });
                return;
            }
            try {
                send(ws, 'execute:start', { lang });
                const result = await (0, executor_1.executeCode)(lang, code, stdin, (chunk) => {
                    send(ws, 'execute:chunk', { chunk });
                });
                send(ws, 'execute:result', { output: result.output, error: result.error });
            }
            catch (err) {
                send(ws, 'execute:error', { message: err.message });
            }
            break;
        }
        case 'subscribe:project': {
            const { projectId } = msg;
            if (typeof projectId !== 'string') {
                send(ws, 'error', { message: 'projectId required' });
                return;
            }
            client.subscribedProject = projectId;
            send(ws, 'subscribed', { projectId });
            break;
        }
        case 'project:update': {
            const { projectId, files, cursors } = msg;
            if (!client.subscribedProject || client.subscribedProject !== projectId) {
                send(ws, 'error', { message: 'Not subscribed to this project' });
                return;
            }
            // Broadcast to other clients subscribed to this project
            for (const [, other] of clients) {
                if (other.id !== client.id && other.subscribedProject === projectId) {
                    send(other.ws, 'project:updated', {
                        projectId,
                        userId: client.userId,
                        files,
                        cursors,
                    });
                }
            }
            break;
        }
        default:
            send(ws, 'error', { message: `Unknown message type: ${msg.type}` });
    }
}
function broadcastToProject(projectId, type, data) {
    for (const [, client] of clients) {
        if (client.subscribedProject === projectId) {
            send(client.ws, type, data);
        }
    }
}
function getWSStats() {
    let connected = 0;
    let authenticated = 0;
    for (const [, client] of clients) {
        connected++;
        if (client.userId)
            authenticated++;
    }
    return { connected, authenticated };
}
//# sourceMappingURL=websocket.js.map