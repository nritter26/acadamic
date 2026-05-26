import { WebSocketServer } from 'ws';
import { Server } from 'http';
export declare function setupWebSocket(server: Server): WebSocketServer;
export declare function broadcastToProject(projectId: string, type: string, data: Record<string, unknown>): void;
export declare function getWSStats(): {
    connected: number;
    authenticated: number;
};
//# sourceMappingURL=websocket.d.ts.map