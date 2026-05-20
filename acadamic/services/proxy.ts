import http from 'http';
import https from 'https';
import { URL } from 'url';

const FORBIDDEN_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]', '169.254.169.254', 'metadata.google.internal', '100.100.100.200'];
const FORBIDDEN_PATTERNS = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^127\./, /^0\./];

export function isValidProxyUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    if (FORBIDDEN_HOSTS.some(fh => host === fh || host.endsWith('.' + fh))) return false;
    if (FORBIDDEN_PATTERNS.some(p => p.test(host))) return false;
    return true;
  } catch { return false; }
}

export interface ProxyResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  displayBody: string;
  time: number;
  size: number;
  error?: string;
}

export async function proxyRequest(method: string, url: string, reqHeaders: Record<string, string>, body?: string): Promise<ProxyResult> {
  const maxSize = 2 * 1024 * 1024;
  const timeout = 15000;

  const parsedUrl = new URL(url);
  const lib = parsedUrl.protocol === 'https:' ? https : http;
  const start = Date.now();

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    method: method.toUpperCase(),
    headers: { ...reqHeaders },
    timeout,
  };

  return new Promise((resolve, reject) => {
    const proxyReq = lib.request(options, (proxyRes) => {
      const chunks: Buffer[] = [];
      let totalSize = 0;
      proxyRes.on('data', (chunk: Buffer) => {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          proxyRes.destroy();
          reject(new Error('Response too large (>2MB)'));
          return;
        }
        chunks.push(chunk);
      });
      proxyRes.on('end', () => {
        const responseTime = Date.now() - start;
        const raw = Buffer.concat(chunks).toString('utf-8');
        const responseHeaders: Record<string, string> = {};
        for (const [k, v] of Object.entries(proxyRes.headers)) {
          responseHeaders[k] = Array.isArray(v) ? v.join(', ') : v as string;
        }

        let displayBody = raw;
        try {
          const parsed = JSON.parse(raw);
          displayBody = JSON.stringify(parsed, null, 2);
        } catch {}

        resolve({
          status: proxyRes.statusCode || 0,
          statusText: proxyRes.statusMessage || '',
          headers: responseHeaders,
          body: raw,
          displayBody,
          time: responseTime,
          size: totalSize,
        });
      });
    });

    proxyReq.on('error', (e: Error) => reject(new Error(e.message)));
    proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Request timed out')); });

    if (body && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}
