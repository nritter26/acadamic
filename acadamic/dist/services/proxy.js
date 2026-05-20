"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidProxyUrl = isValidProxyUrl;
exports.proxyRequest = proxyRequest;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
const dns_1 = __importDefault(require("dns"));
const FORBIDDEN_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]', '169.254.169.254', 'metadata.google.internal', '100.100.100.200'];
const FORBIDDEN_PATTERNS = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^127\./, /^0\./];
function isPrivateIP(ip) {
    if (FORBIDDEN_HOSTS.includes(ip))
        return true;
    if (FORBIDDEN_PATTERNS.some(p => p.test(ip)))
        return true;
    return false;
}
async function isValidProxyUrl(urlStr) {
    try {
        const parsed = new url_1.URL(urlStr);
        if (!['http:', 'https:'].includes(parsed.protocol))
            return false;
        const host = parsed.hostname.toLowerCase();
        if (FORBIDDEN_HOSTS.some(fh => host === fh || host.endsWith('.' + fh)))
            return false;
        const addresses = await dns_1.default.promises.resolve4(host).catch(() => []);
        for (const addr of addresses) {
            if (isPrivateIP(addr))
                return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
async function proxyRequest(method, url, reqHeaders, body) {
    const maxSize = 2 * 1024 * 1024;
    const timeout = 15000;
    const parsedUrl = new url_1.URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https_1.default : http_1.default;
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
            const chunks = [];
            let totalSize = 0;
            proxyRes.on('data', (chunk) => {
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
                const responseHeaders = {};
                for (const [k, v] of Object.entries(proxyRes.headers)) {
                    responseHeaders[k] = Array.isArray(v) ? v.join(', ') : v;
                }
                let displayBody = raw;
                try {
                    const parsed = JSON.parse(raw);
                    displayBody = JSON.stringify(parsed, null, 2);
                }
                catch { }
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
        proxyReq.on('error', (e) => reject(new Error(e.message)));
        proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Request timed out')); });
        if (body && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
            proxyReq.write(body);
        }
        proxyReq.end();
    });
}
//# sourceMappingURL=proxy.js.map