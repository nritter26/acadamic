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
const DOCKER_RUNNERS = {
    py: { image: 'kodex-py', ext: '.py', runCmd: 'python3 -u /code/prog.py', needsCompile: false },
    js: { image: 'kodex-js', ext: '.js', runCmd: 'node /code/prog.js', needsCompile: false },
    ts: { image: 'kodex-ts', ext: '.ts', runCmd: 'tsx /code/prog.ts', needsCompile: false },
    // go removed from DOCKER_RUNNERS — uses local runner with higher ulimit for Go's parallel compilation
    rs: { image: 'kodex-rs', ext: '.rs', compileCmd: 'rustc /code/prog.rs -o /code/out && /code/out', runCmd: '', needsCompile: true },
    c: { image: 'kodex-c', ext: '.c', compileCmd: 'gcc -Wall /code/prog.c -o /code/out && /code/out', runCmd: '', needsCompile: true },
    cpp: { image: 'kodex-cpp', ext: '.cpp', compileCmd: 'g++ -std=c++20 -Wall /code/prog.cpp -o /code/out && /code/out', runCmd: '', needsCompile: true },
    // zig removed from DOCKER_RUNNERS — std.debug.print goes to stderr, local runner handles it properly
    swift: { image: 'kodex-swift', ext: '.swift', runCmd: 'swift /code/prog.swift', needsCompile: false },
    // kt removed from DOCKER_RUNNERS — kotlinc on JVM times out with 256m memory limit
    // cs removed from DOCKER_RUNNERS — dotnet restore OOMs with 256m limit
    wasm: { image: 'kodex-wasm', ext: '.wat', runCmd: 'wasmtime /code/prog.wat', needsCompile: false },
    asm: { image: 'kodex-asm', ext: '.asm', compileCmd: 'nasm -f elf64 /code/prog.asm -o /code/prog.o && ld -o /code/prog /code/prog.o && /code/prog', runCmd: '', needsCompile: true },
    bash: { image: 'kodex-bash', ext: '.sh', runCmd: 'bash /code/prog.sh', needsCompile: false },
    php: { image: 'kodex-php', ext: '.php', runCmd: 'php /code/prog.php', needsCompile: false },
    scala: { image: 'kodex-scala', ext: '.scala', runCmd: 'scala /code/prog.scala', needsCompile: false },
    java: { image: 'kodex-java', ext: '.java', compileCmd: 'javac /code/Main.java && java -cp /code Main', runCmd: '', needsCompile: true },
    rb: { image: 'kodex-rb', ext: '.rb', runCmd: 'ruby /code/prog.rb', needsCompile: false },
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
const POOL_SIZE = Math.max(1, parseInt(process.env.WARM_POOL_SIZE || '1', 10));
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
    await Promise.allSettled(Array.from({ length: POOL_SIZE }, (_, i) => execAsync(`docker rm -f ${warmPoolContainerName(lang, i)} 2>/dev/null`, { timeout: 5000 }).catch(() => { })));
    const entries = [];
    for (let i = 0; i < POOL_SIZE; i++) {
        const workspaceDir = path_1.default.join(WARM_POOL_BASE, `${lang}-${i}`);
        fs_1.default.mkdirSync(workspaceDir, { recursive: true });
        try {
            const { stdout } = await execAsync(`docker run -d --name ${warmPoolContainerName(lang, i)} --network none --memory 256m --cpus 1 --pids-limit 50 -v "${workspaceDir}:/code:rw" ${config.image} sh -c "tail -f /dev/null"`, { timeout: 30000 });
            const containerId = stdout.trim();
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
            fs_1.default.rmSync(path_1.default.join(entry.workspaceDir, file), { recursive: true, force: true });
        }
    }
    catch { /* ignore */ }
    entry.busy = false;
}
async function executeOnWarmContainer(entry, lang, code, stdin) {
    const config = DOCKER_RUNNERS[lang];
    if (!config) {
        releasePoolContainer(entry);
        return { output: `Docker execution not available for ${lang}`, error: true, dockerAvailable: true };
    }
    const progFile = path_1.default.join(entry.workspaceDir, 'prog' + config.ext);
    fs_1.default.writeFileSync(progFile, code);
    try {
        const cmd = config.needsCompile && config.compileCmd ? config.compileCmd : config.runCmd;
        const execCmd = `docker exec -i ${entry.containerId} sh -c "${cmd} 2>&1"`;
        const stdout = (0, child_process_1.execSync)(execCmd, {
            timeout: 30000,
            stdio: stdin ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
            input: stdin,
            maxBuffer: 1024 * 1024,
        });
        releasePoolContainer(entry);
        return { output: stdout.toString().trim() || '(no output)' };
    }
    catch (err) {
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
        const stderr = err.stderr?.toString().trim() || '';
        const stdout = err.stdout?.toString().trim() || '';
        const output = stdout || stderr || `Execution failed: ${(err.message || '').slice(0, 200)}`;
        return { output, error: true, dockerAvailable: true };
    }
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
async function dockerExecute(lang, code, stdin) {
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
        return executeOnWarmContainer(warmPoolEntry, lang, code, stdin);
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
    const tmpFile = path_1.default.join(tmpDir, 'prog' + config.ext);
    fs_1.default.writeFileSync(tmpFile, code);
    try {
        const innerCmd = config.needsCompile && config.compileCmd ? config.compileCmd : config.runCmd;
        const cmd = `docker run --rm -i --network none --memory 256m --cpus 1 --pids-limit 50 -v "${tmpDir}:/code" ${config.image} sh -c "${innerCmd} 2>&1"`;
        middleware_1.logger.debug({ lang, cmd: cmd.slice(0, 100) }, 'Docker execute');
        const stdout = (0, child_process_1.execSync)(cmd, {
            timeout: 30000,
            stdio: stdin ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
            input: stdin,
            maxBuffer: 1024 * 1024,
        });
        return { output: stdout.toString().trim() || '(no output)' };
    }
    catch (err) {
        const stderr = err.stderr?.toString().trim() || '';
        const stdout = err.stdout?.toString().trim() || '';
        const output = stdout || stderr || `Execution failed: ${(err.message || '').slice(0, 200)}`;
        return { output, error: true, dockerAvailable: true };
    }
    finally {
        fs_1.default.rm(tmpDir, { recursive: true, force: true }, () => { });
    }
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
ENV PATH="$PATH:/home/code/.dotnet/tools"
RUN dotnet tool install -g dotnet-script
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
    curl -sL "https://github.com/lampepfl/dotty/releases/download/3.3.3/scala3-3.3.3.tar.gz" -o /tmp/scala3.tar.gz && \
    tar -xzf /tmp/scala3.tar.gz -C /opt && rm /tmp/scala3.tar.gz && \
    ln -s /opt/scala3-3.3.3/bin/scalac /usr/local/bin/scalac && \
    ln -s /opt/scala3-3.3.3/bin/scala /usr/local/bin/scala && \
    if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
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