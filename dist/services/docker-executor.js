"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDockerAvailable = isDockerAvailable;
exports.getSupportedDockerLangs = getSupportedDockerLangs;
exports.initWarmPool = initWarmPool;
exports.shutdownWarmPool = shutdownWarmPool;
exports.dockerExecute = dockerExecute;
exports.generateDockerfiles = generateDockerfiles;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const middleware_1 = require("../middleware");
const execAsync = (cmd, opts = {}) => new Promise((resolve, reject) => {
    (0, child_process_1.exec)(cmd, { maxBuffer: 1024 * 1024, ...opts }, (err, stdout, stderr) => {
        if (err)
            reject(err);
        else
            resolve({ stdout: stdout || '', stderr: stderr || '' });
    });
});
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function spawnWithTimeout(cmd, args, opts) {
    return new Promise((resolve) => {
        const child = (0, child_process_1.spawn)(cmd, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        const timer = setTimeout(() => {
            child.kill('SIGTERM');
            setTimeout(() => { try {
                child.kill('SIGKILL');
            }
            catch { } }, 2000);
        }, opts.timeout || 30000);
        child.stdout.on('data', (data) => {
            const chunk = data.toString();
            stdout += chunk;
            opts.onChunk?.(chunk);
        });
        child.on('error', () => {
            clearTimeout(timer);
            resolve({ stdout, exitCode: 1 });
        });
        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ stdout, exitCode: code });
        });
        if (opts.stdin) {
            child.stdin.write(opts.stdin);
            child.stdin.end();
        }
    });
}
const RUNNER_SCRIPT = `#!/bin/sh
while true; do
  if [ -f /code/.run ]; then
    cmd=$(cat /code/.cmd)
    if [ -f /code/.stdin ]; then
      eval "$cmd" < /code/.stdin > /code/.out 2>&1
    else
      eval "$cmd" > /code/.out 2>&1
    fi
    echo $? > /code/.exit
    rm -f /code/.run /code/.cmd /code/.stdin
  fi
  sleep 0.003
done
`;
const DOCKER_RUNNERS = {
    py: { image: 'kodex-py', ext: '.py', runCmd: 'python3 -u /code/prog.py', needsCompile: false },
    js: { image: 'kodex-js', ext: '.js', runCmd: 'node /code/prog.js', needsCompile: false },
    ts: { image: 'kodex-ts', ext: '.ts', runCmd: 'tsx /code/prog.ts', needsCompile: false },
    // go stays on the local runner — its compile path benefits from the larger host-side memory limit
    rs: { image: 'kodex-rs', ext: '.rs', compileCmd: 'rustc /code/prog.rs -o /code/out && /code/out', runCmd: '', needsCompile: true, memoryLimit: '512m', poolSize: 2 },
    c: { image: 'kodex-c', ext: '.c', compileCmd: 'gcc -Wall /code/prog.c -o /code/out && /code/out', runCmd: '', needsCompile: true },
    cpp: { image: 'kodex-cpp', ext: '.cpp', compileCmd: 'g++ -std=c++20 -Wall /code/prog.cpp -o /code/out && /code/out', runCmd: '', needsCompile: true },
    zig: { image: 'kodex-zig', ext: '.zig', runCmd: 'zig run /code/prog.zig', needsCompile: false, memoryLimit: '512m' },
    swift: { image: 'kodex-swift', ext: '.swift', runCmd: 'swift /code/prog.swift', needsCompile: false, memoryLimit: '512m' },
    kt: { image: 'kodex-kt', ext: '.kt', compileCmd: 'kotlinc -include-runtime -d /code/out.jar /code/prog.kt && java -jar /code/out.jar', runCmd: '', needsCompile: true, memoryLimit: '768m', poolSize: 2 },
    wasm: { image: 'kodex-wasm', ext: '.wat', runCmd: 'wasmtime /code/prog.wat', needsCompile: false },
    asm: { image: 'kodex-asm', ext: '.asm', compileCmd: 'nasm -f elf64 /code/prog.asm -o /code/prog.o && ld -o /code/prog /code/prog.o && /code/prog', runCmd: '', needsCompile: true },
    bash: { image: 'kodex-bash', ext: '.sh', runCmd: 'bash /code/prog.sh', needsCompile: false },
    php: { image: 'kodex-php', ext: '.php', runCmd: 'php /code/prog.php', needsCompile: false },
    scala: { image: 'kodex-scala', ext: '.scala', runCmd: 'scala /code/prog.scala', needsCompile: false, memoryLimit: '512m' },
    java: { image: 'kodex-java', ext: '.java', src: 'Main', compileCmd: 'javac /code/Main.java && java -cp /code Main', runCmd: '', needsCompile: true, memoryLimit: '768m', poolSize: 2 },
    lua: { image: 'kodex-lua', ext: '.lua', runCmd: 'lua5.4 /code/prog.lua', needsCompile: false },
    rb: { image: 'kodex-rb', ext: '.rb', runCmd: 'ruby /code/prog.rb', needsCompile: false },
    cs: { image: 'kodex-cs', ext: '.cs', runCmd: 'cp /code/prog.cs /home/code/proj/Program.cs && cd /home/code/proj && dotnet run --no-restore', needsCompile: false, memoryLimit: '512m', poolSize: 2 },
    sqlite: { image: 'kodex-sqlite', ext: '.sql', runCmd: 'sqlite3 /code/prog.sql', needsCompile: false },
};
let dockerAvailable = null;
function isDockerAvailable() {
    if (dockerAvailable !== null)
        return dockerAvailable;
    try {
        (0, child_process_1.execSync)('docker info', { timeout: 5000, stdio: 'pipe' });
        dockerAvailable = true;
    }
    catch {
        dockerAvailable = false;
    }
    return dockerAvailable;
}
function getSupportedDockerLangs() {
    return Object.keys(DOCKER_RUNNERS);
}
let warmPool = new Map();
const POOL_SIZE = Math.max(1, parseInt(process.env.WARM_POOL_SIZE || '3', 10));
const WARM_POOL_BASE = path_1.default.join(os_1.default.tmpdir(), 'kodex-warm-pool');
function warmPoolContainerName(lang, idx) {
    return `kodex-warm-${lang}-${idx}`;
}
async function ensureLangPool(lang) {
    if (warmPool.has(lang) && warmPool.get(lang).length > 0)
        return;
    const config = DOCKER_RUNNERS[lang];
    if (!config)
        return;
    const langPoolSize = config.poolSize || POOL_SIZE;
    await Promise.allSettled(Array.from({ length: langPoolSize }, (_, i) => execAsync(`docker rm -f ${warmPoolContainerName(lang, i)} 2>/dev/null`, { timeout: 5000 }).catch(() => { })));
    const entries = [];
    for (let i = 0; i < langPoolSize; i++) {
        const workspaceDir = path_1.default.join(WARM_POOL_BASE, `${lang}-${i}`);
        fs_1.default.mkdirSync(workspaceDir, { recursive: true });
        // Write the runner script into the shared volume
        const runnerPath = path_1.default.join(workspaceDir, '.runner.sh');
        if (!fs_1.default.existsSync(runnerPath)) {
            fs_1.default.writeFileSync(runnerPath, RUNNER_SCRIPT);
            fs_1.default.chmodSync(runnerPath, '755');
        }
        try {
            const { stdout } = await execAsync(`docker run -d --name ${warmPoolContainerName(lang, i)} --network none --memory ${config.memoryLimit || '256m'} --cpus 1 --pids-limit 50 -v "${workspaceDir}:/code:rw" ${config.image} sh -c "tail -f /dev/null"`, { timeout: 30000 });
            const containerId = stdout.trim();
            // Start the runner process inside the container (bypasses docker exec for code execution)
            try {
                await execAsync(`docker exec -d ${warmPoolContainerName(lang, i)} sh /code/.runner.sh`, { timeout: 10000 });
            }
            catch {
                middleware_1.logger.debug({ lang }, 'Runner process failed, falling back to docker exec for this container');
            }
            entries.push({ containerId, lang, busy: false, workspaceDir, lastUsed: Date.now() });
        }
        catch {
            middleware_1.logger.debug({ lang }, 'Failed to start warm pool container');
        }
    }
    warmPool.set(lang, entries);
}
async function acquirePoolContainer(lang) {
    try {
        await ensureLangPool(lang);
    }
    catch (err) {
        return null;
    }
    const entries = warmPool.get(lang);
    if (!entries)
        return null;
    const available = entries.find(e => !e.busy);
    if (!available)
        return null;
    available.busy = true;
    available.lastUsed = Date.now();
    return available;
}
function releasePoolContainer(entry) {
    try {
        const files = fs_1.default.readdirSync(entry.workspaceDir);
        for (const file of files) {
            if (file === '.runner.sh' || file === '.runner.pid')
                continue;
            fs_1.default.rmSync(path_1.default.join(entry.workspaceDir, file), { recursive: true, force: true });
        }
    }
    catch { /* ignore */ }
    entry.busy = false;
}
async function executeOnWarmContainer(entry, lang, code, stdin, onChunk) {
    const config = DOCKER_RUNNERS[lang];
    if (!config) {
        releasePoolContainer(entry);
        return { output: `Docker execution not available for ${lang}`, error: true, dockerAvailable: true };
    }
    const srcName = config.src || 'prog';
    const progFile = path_1.default.join(entry.workspaceDir, srcName + config.ext);
    const cmdPath = path_1.default.join(entry.workspaceDir, '.cmd');
    const runPath = path_1.default.join(entry.workspaceDir, '.run');
    const outPath = path_1.default.join(entry.workspaceDir, '.out');
    const exitPath = path_1.default.join(entry.workspaceDir, '.exit');
    // Write code file
    fs_1.default.writeFileSync(progFile, code);
    // Write command to execute
    const cmd = config.needsCompile && config.compileCmd ? config.compileCmd : config.runCmd;
    fs_1.default.writeFileSync(cmdPath, cmd);
    // Write stdin if provided
    if (stdin) {
        fs_1.default.writeFileSync(path_1.default.join(entry.workspaceDir, '.stdin'), stdin);
    }
    // Clean any stale artifacts from previous run
    try {
        fs_1.default.rmSync(outPath, { force: true });
    }
    catch { }
    try {
        fs_1.default.rmSync(exitPath, { force: true });
    }
    catch { }
    // Trigger execution
    fs_1.default.writeFileSync(runPath, '');
    // Poll for completion with output streaming
    let stdout = '';
    let exitCode = null;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
        try {
            if (fs_1.default.existsSync(outPath)) {
                const content = fs_1.default.readFileSync(outPath, 'utf-8');
                if (content.length > stdout.length) {
                    const chunk = content.slice(stdout.length);
                    stdout = content;
                    onChunk?.(chunk);
                }
            }
        }
        catch { }
        if (fs_1.default.existsSync(exitPath)) {
            try {
                exitCode = parseInt(fs_1.default.readFileSync(exitPath, 'utf-8').trim(), 10) || 0;
            }
            catch {
                exitCode = 0;
            }
            break;
        }
        await sleep(3);
    }
    // Final output read
    try {
        if (fs_1.default.existsSync(outPath)) {
            const content = fs_1.default.readFileSync(outPath, 'utf-8');
            if (content.length > stdout.length) {
                onChunk?.(content.slice(stdout.length));
            }
            stdout = content;
        }
    }
    catch { }
    // Cleanup run artifacts
    for (const f of [runPath, cmdPath, outPath, exitPath, path_1.default.join(entry.workspaceDir, '.stdin')]) {
        try {
            fs_1.default.rmSync(f, { force: true });
        }
        catch { }
    }
    // Timeout — kill runner, restart it, replace container
    if (exitCode === null) {
        try {
            (0, child_process_1.execSync)(`docker exec ${entry.containerId} sh -c "pkill -f 'while true' 2>/dev/null; pkill -P 1 2>/dev/null"`, { stdio: 'pipe', timeout: 3000 });
        }
        catch { }
        execAsync(`docker exec -d ${entry.containerId} sh /code/.runner.sh`, { timeout: 5000 }).catch(() => { });
        removeEntryFromPool(entry, lang);
        return { output: stdout.trim() || 'Execution timed out', error: true, dockerAvailable: true };
    }
    releasePoolContainer(entry);
    if (exitCode !== 0) {
        return { output: stdout.trim() || `Exit code ${exitCode}`, error: true, dockerAvailable: true };
    }
    return { output: stdout.trim() || '(no output)' };
}
function removeEntryFromPool(entry, lang) {
    const entries = warmPool.get(lang);
    if (entries) {
        const idx = entries.indexOf(entry);
        if (idx >= 0)
            entries.splice(idx, 1);
    }
    try {
        (0, child_process_1.execSync)(`docker rm -f ${entry.containerId} 2>/dev/null`, { stdio: 'pipe' });
    }
    catch { /* ignore */ }
    ensureLangPool(lang).catch(() => { });
}
async function initWarmPool() {
    if (!isDockerAvailable()) {
        middleware_1.logger.warn('Docker not available, skipping warm pool initialization');
        return;
    }
    try {
        const { stdout } = await execAsync('docker ps -aq --filter "name=kodex-warm-"', { timeout: 10000 });
        const existing = stdout.trim();
        if (existing) {
            await execAsync(`docker rm -f ${existing} 2>/dev/null`, { timeout: 30000 }).catch(() => { });
        }
    }
    catch { /* ignore */ }
    try {
        fs_1.default.rmSync(WARM_POOL_BASE, { recursive: true, force: true });
    }
    catch { /* ignore */ }
    fs_1.default.mkdirSync(WARM_POOL_BASE, { recursive: true });
    const langs = Object.keys(DOCKER_RUNNERS);
    const results = await Promise.allSettled(langs.map(lang => ensureLangPool(lang)));
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
        middleware_1.logger.warn({ total: langs.length, failed }, 'Some warm pool containers failed to start');
    }
    middleware_1.logger.info({ langs: langs.length - failed, poolSize: POOL_SIZE }, 'Warm container pool ready');
}
async function shutdownWarmPool() {
    const tasks = [];
    for (const [, entries] of warmPool) {
        for (const entry of entries) {
            tasks.push(execAsync(`docker stop ${entry.containerId} 2>/dev/null && docker rm ${entry.containerId} 2>/dev/null`, { timeout: 10000 })
                .then(() => { }).catch(() => { }));
        }
    }
    await Promise.allSettled(tasks);
    warmPool.clear();
    try {
        fs_1.default.rmSync(WARM_POOL_BASE, { recursive: true, force: true });
    }
    catch { /* ignore */ }
}
async function dockerExecute(lang, code, stdin, onChunk) {
    const config = DOCKER_RUNNERS[lang];
    if (!config) {
        return { output: `Docker execution not available for ${lang}`, error: true, dockerAvailable: isDockerAvailable() };
    }
    if (!isDockerAvailable()) {
        return { output: 'Docker is not available on this server', error: true, dockerAvailable: false };
    }
    // Try warm pool first
    const warmPoolEntry = await acquirePoolContainer(lang);
    if (warmPoolEntry) {
        return executeOnWarmContainer(warmPoolEntry, lang, code, stdin, onChunk);
    }
    // Check if the sandbox image exists before attempting to run
    try {
        (0, child_process_1.execSync)(`docker image inspect ${config.image}`, { timeout: 10000, stdio: 'pipe' });
    }
    catch {
        middleware_1.logger.debug({ lang, image: config.image }, 'Docker sandbox image not found, falling back to direct runner');
        return { output: `Docker image ${config.image} not found`, error: true, dockerAvailable: false };
    }
    const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'docker-exec-'));
    const srcName = config.src || 'prog';
    const tmpFile = path_1.default.join(tmpDir, srcName + config.ext);
    fs_1.default.writeFileSync(tmpFile, code);
    const innerCmd = config.needsCompile && config.compileCmd ? config.compileCmd : config.runCmd;
    const cmd = `docker run --rm -i --network none --memory ${config.memoryLimit || '256m'} --cpus 1 --pids-limit 50 -v "${tmpDir}:/code" ${config.image} sh -c "${innerCmd} 2>&1"`;
    middleware_1.logger.debug({ lang, cmd: cmd.slice(0, 100) }, 'Docker execute');
    const { stdout, exitCode } = await spawnWithTimeout('sh', ['-c', cmd], { stdin, timeout: 30000, onChunk });
    fs_1.default.rm(tmpDir, { recursive: true, force: true }, () => { });
    if (exitCode !== 0) {
        return { output: stdout.trim() || `Execution failed with exit code ${exitCode}`, error: true, dockerAvailable: true };
    }
    return { output: stdout.trim() || '(no output)' };
}
// ── Dockerfile generation ──
function generateDockerfiles(targetDir) {
    const dockerfiles = {
        'Dockerfile.py': `
FROM python:3.12-slim
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.js': `
FROM node:22-slim
RUN userdel node 2>/dev/null; useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.ts': `
FROM node:22-slim
RUN userdel node 2>/dev/null; npm install -g tsx && useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.go': `
FROM golang:1.23-alpine
RUN adduser -D -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.rs': `
FROM rust:1.78-slim
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.c': `
FROM gcc:13-bookworm
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.cpp': `
FROM gcc:13-bookworm
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.zig': `
FROM alpine:latest
RUN apk add --no-cache zig && adduser -D -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.swift': `
FROM swift:6.0-jammy
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.kt': `
FROM eclipse-temurin:22-jdk
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/* && \
    curl -sL https://github.com/JetBrains/kotlin/releases/download/v2.0.21/kotlin-compiler-2.0.21.zip -o /tmp/kc.zip && \
    unzip -q /tmp/kc.zip -d /opt && rm /tmp/kc.zip && \
    ln -s /opt/kotlinc/bin/kotlinc /usr/local/bin/kotlinc && \
    if id -u 1001 >/dev/null 2>&1; then userdel "$(id -un 1001)"; fi && useradd -m -u 1001 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.cs': `
FROM mcr.microsoft.com/dotnet/sdk:8.0
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
RUN mkdir -p /home/code/proj && cd /home/code/proj && dotnet new console --force --no-restore 2>/dev/null && dotnet restore 2>/dev/null && rm -rf bin
WORKDIR /code
`.trim(),
        'Dockerfile.wasm': `
FROM debian:stable-slim
RUN apt-get update && apt-get install -y curl ca-certificates xz-utils && rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://github.com/bytecodealliance/wasmtime/releases/download/v25.0.0/wasmtime-v25.0.0-x86_64-linux.tar.xz | \
    tar -C /usr/local/bin -xJ --strip-components=1 && \
    if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.asm': `
FROM alpine:latest
RUN apk add --no-cache nasm binutils && adduser -D -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.java': `
FROM eclipse-temurin:22-jdk
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.bash': `
FROM alpine:latest
RUN apk add --no-cache bash && adduser -D -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.php': `
FROM php:8.3-cli-alpine
RUN adduser -D -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.scala': `
FROM eclipse-temurin:22-jdk
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/* && \
    curl -fsSL "https://github.com/lampepfl/dotty/releases/download/3.3.3/scala3-3.3.3.tar.gz" -o /tmp/scala3.tar.gz && \
    tar -xzf /tmp/scala3.tar.gz -C /opt && rm /tmp/scala3.tar.gz && \
    ln -s /opt/scala3-3.3.3/bin/scalac /usr/local/bin/scalac && \
    ln -s /opt/scala3-3.3.3/bin/scala /usr/local/bin/scala && \
    if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
RUN echo '@main def main() = println(42)' > /tmp/warmup.scala && scala /tmp/warmup.scala && rm -rf /tmp/warmup.scala /tmp/.scala-build
`.trim(),
        'Dockerfile.lua': `
FROM alpine:latest
RUN apk add --no-cache lua5.4 && adduser -D -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.rb': `
FROM ruby:3.2-slim
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.sqlite': `
FROM alpine:latest
RUN apk add --no-cache sqlite && adduser -D -u 1000 code
USER code
WORKDIR /code
`.trim(),
    };
    if (!fs_1.default.existsSync(targetDir))
        fs_1.default.mkdirSync(targetDir, { recursive: true });
    for (const [filename, content] of Object.entries(dockerfiles)) {
        const lang = filename.replace('Dockerfile.', '');
        const outPath = path_1.default.join(targetDir, filename);
        fs_1.default.writeFileSync(outPath, content);
        console.log(`Wrote ${outPath}`);
    }
    // Write build script
    const buildScript = `#!/usr/bin/env bash
# Build all Docker sandbox images
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
for df in "$DIR"/Dockerfile.*; do
  lang=$(basename "$df" | sed 's/Dockerfile.//')
  echo "Building kodex-$lang..."
  docker build -t "kodex-$lang" -f "$df" "$DIR" &
done
wait
echo "All images built successfully!"
`;
    const buildPath = path_1.default.join(targetDir, 'build-all.sh');
    fs_1.default.writeFileSync(buildPath, buildScript);
    fs_1.default.chmodSync(buildPath, '755');
    console.log(`Wrote ${buildPath} (chmod +x)`);
}
//# sourceMappingURL=docker-executor.js.map