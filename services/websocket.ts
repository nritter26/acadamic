import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import { handleTutorMessage } from './tutor';
import { executeCode } from './executor';
import { verifyToken, type AuthPayload } from '../middleware';
import { logger } from '../middleware';

interface WSClient {
  ws: WebSocket;
  id: string;
  userId?: string;
  subscribedProject?: string;
}

const clients = new Map<string, WSClient>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function send(ws: WebSocket, type: string, data: Record<string, unknown>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...data }));
  }
}

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientId = generateId();
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    let user: AuthPayload | undefined;

    if (token) {
      try {
        user = verifyToken(token);
      } catch {}
    }

    const client: WSClient = { ws, id: clientId, userId: user?.userId };
    clients.set(clientId, client);

    logger.info({ clientId, userId: user?.userId }, 'WebSocket connected');

    // Send welcome
    send(ws, 'connected', { clientId, authenticated: !!user });

    ws.on('message', async (raw) => {
      let msg: { type: string; [key: string]: unknown };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(ws, 'error', { message: 'Invalid JSON' });
        return;
      }

      try {
        await handleWSMessage(ws, client, msg);
      } catch (err) {
        logger.error({ err, clientId, msgType: msg.type }, 'WS message error');
        send(ws, 'error', { message: 'Internal error processing message' });
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      logger.info({ clientId }, 'WebSocket disconnected');
    });

    ws.on('error', (err) => {
      logger.error({ err, clientId }, 'WebSocket error');
      clients.delete(clientId);
    });
  });

  logger.info('WebSocket server ready at /ws');
  return wss;
}

async function handleWSMessage(ws: WebSocket, client: WSClient, msg: { type: string; [key: string]: unknown }): Promise<void> {
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

      const sseSend = (chunk: string) => {
        send(ws, 'chat:chunk', { content: chunk });
      };
      const sseDone = () => {
        send(ws, 'chat:done', {});
      };

      await handleTutorMessage(
        message as string,
        {
          lang: lang as string | undefined,
          topic: topic as string | undefined,
          phase: phase as string | undefined,
          code: code as string | undefined,
          output: output as string | undefined,
          hasError: hasError as boolean | undefined,
          history: history as { role: string; text: string }[] | undefined,
          learnerId: (learnerId || client.userId) as string | undefined,
        },
        sseSend,
        sseDone,
      );
      break;
    }

    case 'execute': {
      const { lang, code, stdin } = msg as unknown as { lang: string; code: string; stdin?: string };
      if (!lang || !code) {
        send(ws, 'execute:error', { message: 'lang and code required' });
        return;
      }

      try {
        send(ws, 'execute:start', { lang });
        const result = await executeCode(lang, code, stdin, (chunk: string) => {
          send(ws, 'execute:chunk', { chunk });
        });
        send(ws, 'execute:result', { output: result.output, error: result.error });
      } catch (err) {
        send(ws, 'execute:error', { message: (err as Error).message });
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

export function broadcastToProject(projectId: string, type: string, data: Record<string, unknown>): void {
  for (const [, client] of clients) {
    if (client.subscribedProject === projectId) {
      send(client.ws, type, data);
    }
  }
}

export function getWSStats(): { connected: number; authenticated: number } {
  let connected = 0;
  let authenticated = 0;
  for (const [, client] of clients) {
    connected++;
    if (client.userId) authenticated++;
  }
  return { connected, authenticated };
}
