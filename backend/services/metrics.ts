import { Request, Response } from 'express';
import * as database from '../sql/database';
import { isDockerAvailable } from './docker-executor';
import { getWSStats } from './websocket';
import { getRateLimitInfo } from './rateLimit';

interface MetricEntry {
  name: string;
  value: number | string;
  labels?: Record<string, string>;
}

const metricsStore: MetricEntry[] = [];
let requestCount = 0;
let errorCount = 0;
const requestDurationBuckets: number[] = [];

export function trackRequest(durationMs: number, statusCode: number): void {
  requestCount++;
  if (statusCode >= 400) errorCount++;
  requestDurationBuckets.push(durationMs);
  if (requestDurationBuckets.length > 1000) requestDurationBuckets.shift();
}

export function metricsHandler(_req: Request, res: Response): void {
  const dbStatus = database.getStatus();
  const wsStats = getWSStats();
  const rateInfo = getRateLimitInfo();
  const dockerAvail = isDockerAvailable();

  const avgDuration = requestDurationBuckets.length > 0
    ? requestDurationBuckets.reduce((a, b) => a + b, 0) / requestDurationBuckets.length
    : 0;

  const lines: string[] = [
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
