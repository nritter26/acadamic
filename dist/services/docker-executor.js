"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDockerAvailable = isDockerAvailable;
exports.getSupportedDockerLangs = getSupportedDockerLangs;
exports.dockerExecute = dockerExecute;
exports.generateDockerfiles = generateDockerfiles;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const middleware_1 = require("../middleware");
const DOCKER_RUNNERS = {
    py: { image: 'kodex-py', ext: '.py', runCmd: 'python3 -u /code/prog', needsCompile: false },
    js: { image: 'kodex-js', ext: '.js', runCmd: 'node /code/prog', needsCompile: false },
    ts: { image: 'kodex-ts', ext: '.ts', runCmd: 'tsx /code/prog', needsCompile: false },
    go: { image: 'kodex-go', ext: '.go', runCmd: 'go run /code/prog', needsCompile: false },
    rs: { image: 'kodex-rs', ext: '.rs', compileCmd: 'rustc /code/prog -o /code/out && /code/out', runCmd: '', needsCompile: true },
    c: { image: 'kodex-c', ext: '.c', compileCmd: 'gcc -Wall /code/prog -o /code/out && /code/out', runCmd: '', needsCompile: true },
    cpp: { image: 'kodex-cpp', ext: '.cpp', compileCmd: 'g++ -std=c++20 -Wall /code/prog -o /code/out && /code/out', runCmd: '', needsCompile: true },
    zig: { image: 'kodex-zig', ext: '.zig', runCmd: 'zig run /code/prog', needsCompile: false },
    swift: { image: 'kodex-swift', ext: '.swift', runCmd: 'swift /code/prog', needsCompile: false },
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
async function dockerExecute(lang, code, stdin) {
    const config = DOCKER_RUNNERS[lang];
    if (!config) {
        return { output: `Docker execution not available for ${lang}`, error: true, dockerAvailable: isDockerAvailable() };
    }
    if (!isDockerAvailable()) {
        return { output: 'Docker is not available on this server', error: true, dockerAvailable: false };
    }
    const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'docker-exec-'));
    const tmpFile = path_1.default.join(tmpDir, 'prog' + config.ext);
    fs_1.default.writeFileSync(tmpFile, code);
    try {
        const cmd = config.needsCompile && config.compileCmd
            ? `docker run --rm -i --network none --memory 256m --cpus 1 --pids-limit 50 -v "${tmpDir}:/code:ro" ${config.image} sh -c "${config.compileCmd}"`
            : `docker run --rm -i --network none --memory 256m --cpus 1 --pids-limit 50 -v "${tmpDir}:/code:ro" ${config.image} ${config.runCmd}`;
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
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.ts': `
FROM node:22-slim
RUN npm install -g tsx && useradd -m -u 1000 code
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
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.c': `
FROM gcc:13-bookworm
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
        'Dockerfile.cpp': `
FROM gcc:13-bookworm
RUN useradd -m -u 1000 code
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
FROM swift:6.0-jammy-slim
RUN useradd -m -u 1000 code
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