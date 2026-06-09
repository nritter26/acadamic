import { spawn, type ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import type { HttpTest, HttpTestResult } from '../types';
import { logger } from '../middleware';

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = (srv.address() as any).port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

function waitForServer(port: number, path = '/', maxWait = 10000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function poll() {
      const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > maxWait) {
          reject(new Error('Server did not start in time'));
        } else {
          setTimeout(poll, 300);
        }
      });
      req.end();
    }
    poll();
  });
}

function killProcess(proc: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve();
    }, 3000);
    proc.on('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    proc.kill('SIGTERM');
  });
}

async function runHttpTest(port: number, test: HttpTest): Promise<HttpTestResult> {
  return new Promise((resolve) => {
    const url = new URL(test.path, `http://127.0.0.1:${port}`);
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port,
      path: url.pathname + url.search,
      method: test.method.toUpperCase(),
      headers: { ...test.headers, 'Content-Type': 'application/json' },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk.toString(); });
      res.on('end', () => {
        const status = res.statusCode || 0;
        let bodyMatch = true;
        let shapeMatch = true;
        if (test.expectedBodySubstring) {
          bodyMatch = body.includes(test.expectedBodySubstring);
        }
        if (test.expectedBodyShape && test.expectedBodyShape.length > 0) {
          try {
            const parsed = JSON.parse(body);
            shapeMatch = test.expectedBodyShape.every((key) => key in parsed);
          } catch {
            shapeMatch = false;
          }
        }
        const passed = status === test.expectedStatus && bodyMatch && shapeMatch;
        resolve({ method: test.method, path: test.path, status, expectedStatus: test.expectedStatus, bodyMatch, shapeMatch, passed });
      });
    });
    req.on('error', (err) => {
      resolve({ method: test.method, path: test.path, status: 0, expectedStatus: test.expectedStatus, bodyMatch: false, shapeMatch: false, passed: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ method: test.method, path: test.path, status: 0, expectedStatus: test.expectedStatus, bodyMatch: false, shapeMatch: false, passed: false, error: 'Timeout' });
    });
    if (test.body && ['POST', 'PUT', 'PATCH'].includes(test.method.toUpperCase())) {
      req.write(JSON.stringify(test.body));
    }
    req.end();
  });
}

export async function executeServerCode(lang: string, code: string, httpTests: HttpTest[]): Promise<{ output: string; error?: boolean; serverResults: HttpTestResult[]; allPassed: boolean }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'srv-'));
  const port = await findFreePort();
  let proc: ChildProcess | null = null;
  let outputLog = '';

  try {
    if (lang === 'js' || lang === 'ts') {
      const content = lang === 'ts' ? code : code;
      const ext = lang === 'ts' ? '.ts' : '.js';
      const filePath = path.join(tmpDir, `server${ext}`);
      fs.writeFileSync(filePath, content);
      const runner = lang === 'ts' ? 'tsx' : 'node';
      proc = spawn(runner, [filePath], {
        cwd: tmpDir,
        env: { ...process.env, PORT: String(port) },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } else if (lang === 'py') {
      const filePath = path.join(tmpDir, 'main.py');
      fs.writeFileSync(filePath, code);
      proc = spawn('uvicorn', ['main:app', '--host', '127.0.0.1', '--port', String(port)], {
        cwd: tmpDir,
        env: { ...process.env, PORT: String(port) },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } else if (lang === 'go') {
      const filePath = path.join(tmpDir, 'main.go');
      fs.writeFileSync(filePath, code);
      proc = spawn('go', ['run', filePath], {
        cwd: tmpDir,
        env: { ...process.env, PORT: String(port) },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } else {
      return { output: `Server execution not supported for language: ${lang}`, error: true, serverResults: [], allPassed: false };
    }

    proc.stdout?.on('data', (d: Buffer) => { outputLog += d.toString(); });
    proc.stderr?.on('data', (d: Buffer) => { outputLog += d.toString(); });

    const firstTestPath = httpTests.length > 0 ? httpTests[0].path : '/';
    await waitForServer(port, firstTestPath, 15000);

    const serverResults: HttpTestResult[] = [];
    for (const test of httpTests) {
      const result = await runHttpTest(port, test);
      serverResults.push(result);
    }
    const allPassed = serverResults.every((r) => r.passed);

    await killProcess(proc);
    proc = null;
    fs.rmSync(tmpDir, { recursive: true, force: true });

    return { output: outputLog.slice(0, 2000), serverResults, allPassed };
  } catch (err) {
    if (proc) await killProcess(proc);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return { output: `Server execution failed: ${(err as Error).message}`, error: true, serverResults: [], allPassed: false };
  }
}
