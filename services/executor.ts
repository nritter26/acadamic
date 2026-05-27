import { exec, execSync, spawn, type ExecOptions, type SpawnOptions } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import vm from 'vm';
import type { RunnerConfig, ExecResult } from '../types';
import * as database from '../sql/database';
import { dockerExecute, isDockerAvailable, getSupportedDockerLangs } from './docker-executor';
import { logger } from '../middleware';

// ── Execution Queue ──

interface ExecJob {
  cmd: string;
  opts: ExecOptions & { shell?: boolean };
  resolve: (value: { stdout: string; stderr: string }) => void;
  reject: (reason: Error) => void;
  stdin?: string;
}

const EXEC_QUEUE: ExecJob[] = [];
let EXEC_RUNNING = 0;
const EXEC_MAX_CONCURRENT = 4;

function processNextExec(): void {
  while (EXEC_RUNNING < EXEC_MAX_CONCURRENT && EXEC_QUEUE.length > 0) {
    const job = EXEC_QUEUE.shift()!;
    EXEC_RUNNING++;
    if (job.stdin !== undefined) {
      const child = spawn('sh', ['-c', job.cmd], job.opts);
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d: string | Buffer) => stdout += d.toString());
      child.stderr.on('data', (d: string | Buffer) => stderr += d.toString());
      child.on('close', (code: number | null) => {
        EXEC_RUNNING--;
        job.resolve({ stdout, stderr });
        processNextExec();
      });
      child.on('error', (e: Error) => {
        EXEC_RUNNING--;
        job.reject(e);
        processNextExec();
      });
      if (job.stdin) {
        child.stdin.write(job.stdin);
        child.stdin.end();
      }
    } else {
      exec(job.cmd, job.opts, (err, stdout, stderr) => {
        EXEC_RUNNING--;
        if (err) job.reject(err);
        else job.resolve({ stdout: String(stdout), stderr: String(stderr) });
        processNextExec();
      });
    }
  }
}

function execQueue(cmd: string, opts: ExecOptions & { shell?: boolean }, stdin?: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    EXEC_QUEUE.push({ cmd, opts, resolve, reject, stdin });
    processNextExec();
  });
}

function execWithStdin(cmd: string, opts: SpawnOptions, stdin?: string): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', cmd], opts);
    let stdout = '';
    let stderr = '';
    child.stdout!.on('data', (d: string | Buffer) => stdout += d.toString());
    child.stderr!.on('data', (d: string | Buffer) => stderr += d.toString());
    child.on('close', code => resolve({ stdout, stderr, code }));
    child.on('error', reject);
    if (stdin) {
      child.stdin!.write(stdin);
      child.stdin!.end();
    }
  });
}

// ── JavaScript Sandbox Execution ──

function analyzeJSError(code: string, e: Error): string {
  const msg = e.message || '';
  let explanation = '';
  let fix = '';

  if (msg.includes('Unexpected token')) {
    const token = msg.match(/'([^']+)'/)?.[1] || 'something';
    explanation = `**Syntax Error: Unexpected token \`${token}\`**`;
    if (token === '}') explanation += '\n- You have an extra closing brace `}`';
    else if (token === ')') explanation += '\n- You have an extra closing parenthesis `)`';
    else explanation += `\n- Check for missing operators, quotes, or commas near \`${token}\``;
  } else if (msg.includes('is not defined')) {
    const name = msg.match(/'([^']+)'/)?.[1] || 'something';
    explanation = `**ReferenceError: \`${name}\` is not defined**`;
    fix = `- Declare it first: \`let ${name} = value;\`\n- Check for typos`;
  } else if (msg.includes('is not a function')) {
    explanation = `**TypeError: Value is not a function**`;
    fix = '- Check if the value is actually a function';
  } else if (msg.includes('Cannot read property') || msg.includes('Cannot read properties')) {
    explanation = `**TypeError: Cannot read property of undefined/null**`;
    fix = '- Use optional chaining: `obj?.prop`\n- Check initialization';
  } else {
    explanation = `**Error: ${msg}**`;
    fix = '- Check for typos, missing brackets, or incorrect syntax';
  }

  return `// ╔══════════════════════════════════════╗\n// ║  ERROR ANALYSIS                         ║\n// ╚══════════════════════════════════════╝\n\n${explanation}\n\n**How to fix:**\n${fix}`;
}

function analyzeRuntimeError(code: string, e: Error): string {
  const msg = e.message || '';
  let explanation = '';
  let fix = '';

  if (msg.includes('not a function')) {
    explanation = `**Runtime Error: Value is not a function**`;
    fix = '- Check if the variable holds a function or a different type';
  } else if (msg.includes('Cannot read property') || msg.includes('Cannot read properties')) {
    explanation = `**Runtime Error: Accessing property on undefined/null**`;
    fix = '- Use optional chaining: `obj?.prop`\n- Initialize variables before using them';
  } else if (msg.includes('is not iterable')) {
    explanation = `**Runtime Error: Value is not iterable**`;
    fix = '- Check if the value is actually an array';
  } else if (msg.includes('timeout')) {
    explanation = `**Runtime Error: Execution timed out**`;
    fix = '- Check for infinite loops';
  } else {
    explanation = `**Runtime Error:** ${msg}`;
    fix = '- Review the logic of your code';
  }

  return `// ╔══════════════════════════════════════╗\n// ║  RUNTIME ERROR ANALYSIS                 ║\n// ╚══════════════════════════════════════╝\n\n${explanation}\n\n**How to fix:**\n${fix}`;
}

function parseErrorPosition(msg: string): { line: number } {
  const m = msg.match(/line (\d+)/i);
  return { line: m ? parseInt(m[1]) : 0 };
}

function getCodeLine(code: string, line: number): string {
  if (line <= 0) return '';
  const lines = code.split('\n');
  if (line - 1 < lines.length) {
    const start = Math.max(0, line - 3);
    const end = Math.min(lines.length, line + 1);
    let result = '';
    for (let i = start; i < end; i++) {
      result += `${i === line - 1 ? '>>> ' : '    '}${i + 1}: ${lines[i]}\n`;
    }
    return result.trim();
  }
  return '';
}

// ── Java Home Resolution ──

let javaBin: string | null = null;

function detectJavaBin(): string {
  if (javaBin) return javaBin;
  try {
    const javacPath = execSync('readlink -f $(which javac)', { timeout: 5000, stdio: 'pipe' }).toString().trim();
    const jdkHome = path.dirname(path.dirname(javacPath));
    const candidate = path.join(jdkHome, 'bin', 'java');
    if (fs.existsSync(candidate)) {
      javaBin = candidate;
      return javaBin;
    }
  } catch { /* fall through */ }
  javaBin = 'java';
  return javaBin;
}

function resolveJavaCmd(workDir: string): string {
  const java = detectJavaBin();
  const javac = 'javac';
  return `${javac} "${path.join(workDir, 'Main.java')}" && ${java} -cp "${workDir}" Main`;
}

// ── Runners config ──

const RUNNERS: Record<string, RunnerConfig> = {
  py:  { cmd: 'python3 -u "%f"', ext: '.py' },
  go:  { cmd: 'go run "%f"', ext: '.go' },
  ts:  { cmd: 'tsx "%f"', ext: '.ts' },
  rs:  { cmd: 'rustc -o _prog "%f" && ./_prog', ext: '.rs' },
  c:   { cmd: 'gcc -Wall -o _prog "%f" && ./_prog', ext: '.c' },
  cpp: { cmd: 'g++ -std=c++20 -Wall -o _prog "%f" && ./_prog', ext: '.cpp' },
  cs:  { cmd: 'dotnet script "%f"', ext: '.csx' },
  kt:  { cmd: 'kotlinc -include-runtime -d _prog.jar "%f" && java -jar _prog.jar', ext: '.kt' },
  swift: { cmd: 'swift "%f"', ext: '.swift' },
  wasm: { cmd: 'wasmtime "%f"', ext: '.wat' },
  asm: { cmd: 'nasm -f elf64 "%f" -o _prog.o && ld -o _prog _prog.o && ./_prog', ext: '.asm' },
  zig: { cmd: 'zig run "%f"', ext: '.zig' },
  bash: { cmd: 'bash "%f"', ext: '.sh' },
  php:  { cmd: 'php "%f"', ext: '.php' },
  scala: { cmd: 'scala "%f"', ext: '.scala' },
  java: { cmd: 'javac "Main.java" && java -cp . Main', ext: '.java', src: 'Main' },
  rb: { cmd: 'ruby "%f"', ext: '.rb' },
};

// ── Execute ──

export async function executeCode(lang: string, code: string, stdin?: string): Promise<ExecResult> {
  if (!code) return { output: 'No code provided', error: true };

  // JavaScript sandbox
  if (lang === 'js') {
    try {
      new vm.Script(code);
    } catch (e) {
      return { output: analyzeJSError(code, e as Error), error: true };
    }
    try {
      let output = '';
      const formatArg = (a: unknown): string => typeof a === 'object' ? JSON.stringify(a) : String(a);
      const consoleCounts: Record<string, number> = {};
      const consoleTimers: Record<string, number> = {};
      const sandbox = {
        console: {
          log: (...args: unknown[]) => { output += args.map(formatArg).join(' ') + '\n'; },
          info: (...args: unknown[]) => { output += args.map(formatArg).join(' ') + '\n'; },
          debug: (...args: unknown[]) => { output += args.map(formatArg).join(' ') + '\n'; },
          warn: (...args: unknown[]) => { output += 'WARN: ' + args.map(formatArg).join(' ') + '\n'; },
          error: (...args: unknown[]) => { output += 'ERROR: ' + args.map(formatArg).join(' ') + '\n'; },
          assert: (condition: unknown, ...args: unknown[]) => { if (!condition) output += 'Assertion failed: ' + args.map(formatArg).join(' ') + '\n'; },
          trace: () => { output += 'console.trace()\n'; },
          dir: (obj: unknown) => { output += JSON.stringify(obj, null, 2) + '\n'; },
          table: (data: unknown) => {
            if (Array.isArray(data)) {
              const rows = data.map((item, i) => `${i}: ${JSON.stringify(item)}`);
              output += rows.join('\n') + '\n';
            } else {
              output += JSON.stringify(data, null, 2) + '\n';
            }
          },
          count: (label = 'default') => {
            consoleCounts[label] = (consoleCounts[label] || 0) + 1;
            output += `${label}: ${consoleCounts[label]}\n`;
          },
          countReset: (label = 'default') => { delete consoleCounts[label]; },
          time: (label = 'default') => { consoleTimers[label] = Date.now(); },
          timeEnd: (label = 'default') => {
            const start = consoleTimers[label];
            if (start !== undefined) {
              output += `${label}: ${Date.now() - start}ms\n`;
              delete consoleTimers[label];
            }
          },
          timeLog: (label = 'default') => {
            const start = consoleTimers[label];
            if (start !== undefined) output += `${label}: ${Date.now() - start}ms\n`;
          },
          group: () => {},
          groupEnd: () => {},
          clear: () => { output = ''; },
        },
      };
      vm.runInNewContext(code, sandbox, { timeout: 5000 });
      return { output: output || '(no output)' };
    } catch (e) {
      return { output: analyzeRuntimeError(code, e as Error), error: true };
    }
  }

  // SQL
  if (lang === 'sqlite') return database.executeSQLite(code);
  if (lang === 'pg') return database.executePG(code);
  if (lang === 'mysql') return database.executeMySQL(code);

  // Try Docker sandbox first if available
  if (isDockerAvailable() && getSupportedDockerLangs().includes(lang)) {
    logger.debug({ lang }, 'Executing via Docker sandbox');
    const dockerResult = await dockerExecute(lang, code, stdin);
    if (!dockerResult.error || dockerResult.dockerAvailable !== false) {
      return dockerResult;
    }
  }

  // Fallback: external compiler execution
  const runner = RUNNERS[lang];
  if (!runner) {
    return { output: `// ${lang.toUpperCase()} execution not available on this server`, error: true };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-'));
  const srcName = runner.src || 'code';
  const tmpFile = path.join(tmpDir, srcName + runner.ext);
  fs.writeFileSync(tmpFile, code);

  let cmd = runner.cmd.replace('%f', tmpFile);
  const env = {
    ...process.env,
    PATH: `${process.env.PATH}:${path.join(os.homedir(), '.local/bin')}:${path.join(os.homedir(), '.cargo/bin')}`,
  } as NodeJS.ProcessEnv;
  if (!process.env.DOTNET_ROOT) {
    env.DOTNET_ROOT = path.join(os.homedir(), '.local/dotnet');
  }
  if (lang === 'java') {
    cmd = resolveJavaCmd(tmpDir);
  }

  const compiledLangs = new Set(['rs', 'c', 'cpp', 'scala', 'java', 'kt', 'zig', 'swift', 'asm']);
  const goLimit = 786432;
  const memLimit = lang === 'go' ? goLimit : compiledLangs.has(lang) ? 524288 : 262144;
  const sandboxedCmd = `ulimit -v ${memLimit} -t 30 2>/dev/null; ${cmd}`;
  const execOpts = { timeout: 30000, cwd: tmpDir, env };

  try {
    const result = await execQueue(sandboxedCmd, { ...execOpts, maxBuffer: 1024 * 1024, shell: true } as unknown as ExecOptions & { shell?: boolean }, stdin);

    fs.rm(tmpDir, { recursive: true, force: true }, () => {});
    const stdoutClean = (result.stdout || '').trimEnd();
    const stderrClean = (result.stderr || '').trimEnd();
    let output = stdoutClean;
    if (stderrClean) {
      output += (output ? '\n' : '') + '// stderr:\n' + stderrClean;
    }
    return { output: output || '(no output)' };
  } catch (err) {
    fs.rm(tmpDir, { recursive: true, force: true }, () => {});
    return { output: 'Process failed: ' + (err as Error).message.slice(0, 200), error: true };
  }
}
