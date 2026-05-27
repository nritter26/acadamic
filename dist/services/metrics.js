"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackRequest = trackRequest;
exports.metricsHandler = metricsHandler;
const database = __importStar(require("../sql/database"));
const docker_executor_1 = require("./docker-executor");
const websocket_1 = require("./websocket");
const rateLimit_1 = require("./rateLimit");
const metricsStore = [];
let requestCount = 0;
let errorCount = 0;
const requestDurationBuckets = [];
function trackRequest(durationMs, statusCode) {
    requestCount++;
    if (statusCode >= 400)
        errorCount++;
    requestDurationBuckets.push(durationMs);
    if (requestDurationBuckets.length > 1000)
        requestDurationBuckets.shift();
}
function metricsHandler(_req, res) {
    const dbStatus = database.getStatus();
    const wsStats = (0, websocket_1.getWSStats)();
    const rateInfo = (0, rateLimit_1.getRateLimitInfo)();
    const dockerAvail = (0, docker_executor_1.isDockerAvailable)();
    const avgDuration = requestDurationBuckets.length > 0
        ? requestDurationBuckets.reduce((a, b) => a + b, 0) / requestDurationBuckets.length
        : 0;
    const lines = [
        '# HELP kodex_requests_total Total HTTP requests',
        '# TYPE kodex_requests_total counter',
        `kodex_requests_total ${requestCount}`,
        '',
        '# HELP kodex_errors_total Total HTTP errors (4xx/5xx)',
        '# TYPE kodex_errors_total counter',
        `kodex_errors_total ${errorCount}`,
        '',
        '# HELP kodex_request_duration_ms Average request duration in ms',
        '# TYPE kodex_request_duration_ms gauge',
        `kodex_request_duration_ms ${avgDuration.toFixed(1)}`,
        '',
        '# HELP kodex_ws_connections WebSocket connection count',
        '# TYPE kodex_ws_connections gauge',
        `kodex_ws_connections ${wsStats.connected}`,
        '',
        '# HELP kodex_ws_authenticated Authenticated WebSocket connections',
        '# TYPE kodex_ws_authenticated gauge',
        `kodex_ws_authenticated ${wsStats.authenticated}`,
        '',
        '# HELP kodex_docker_available Docker runtime availability',
        '# TYPE kodex_docker_available gauge',
        `kodex_docker_available ${dockerAvail ? 1 : 0}`,
        '',
        '# HELP kodex_db_sqlite SQLite database available',
        '# TYPE kodex_db_sqlite gauge',
        `kodex_db_sqlite ${dbStatus.sqlite?.available ? 1 : 0}`,
        '',
        '# HELP kodex_db_pg PostgreSQL database configured',
        '# TYPE kodex_db_pg gauge',
        `kodex_db_pg ${dbStatus.pg?.available ? 1 : 0}`,
        '',
        '# HELP kodex_db_mysql MySQL database configured',
        '# TYPE kodex_db_mysql gauge',
        `kodex_db_mysql ${dbStatus.mysql?.available ? 1 : 0}`,
        '',
        '# HELP kodex_rate_limit_max Max requests per window',
        '# TYPE kodex_rate_limit_max gauge',
        `kodex_rate_limit_max ${rateInfo.max}`,
        '',
        '# HELP kodex_uptime_seconds Server uptime',
        '# TYPE kodex_uptime_seconds gauge',
        `kodex_uptime_seconds ${process.uptime()}`,
        '',
        '# HELP kodex_node_info Node.js version info',
        '# TYPE kodex_node_info gauge',
        `kodex_node_info{version="${process.version}"} 1`,
    ];
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(lines.join('\n'));
}
//# sourceMappingURL=metrics.js.map