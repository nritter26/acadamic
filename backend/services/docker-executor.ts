import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../middleware';

interface DockerRunnerConfig {
  image: string;
  ext: string;
  src?: string;
  compileCmd?: string;
  runCmd: string;
  needsCompile: boolean;
  memoryLimit?: string;
  pidsLimit?: number;
  poolSize?: number;
}

const DOCKER_RUNNERS: Record<string, DockerRunnerConfig> = {
  py:  { image: 'kodex-py', ext: '.py', runCmd: 'python3 -u /code/prog.py', needsCompile: false },
  js:  { image: 'kodex-js', ext: '.js', runCmd: 'node /code/prog.js', needsCompile: false },
  ts:  { image: 'kodex-ts', ext: '.ts', runCmd: 'tsx /code/prog.ts', needsCompile: false },
  go:  { image: 'kodex-go', ext: '.go', runCmd: 'go run /code/prog.go', needsCompile: false, memoryLimit: '512m', pidsLimit: 200 },
  rs:  { image: 'kodex-rs', ext: '.rs', compileCmd: 'rustc /code/prog.rs -o /code/out && /code/out', runCmd: '', needsCompile: true, memoryLimit: '512m' },
  c:   { image: 'kodex-c', ext: '.c', compileCmd: 'gcc -Wall /code/prog.c -o /code/out && /code/out', runCmd: '', needsCompile: true },
  cpp: { image: 'kodex-cpp', ext: '.cpp', compileCmd: 'g++ -std=c++20 -Wall /code/prog.cpp -o /code/out && /code/out', runCmd: '', needsCompile: true },
  zig: { image: 'kodex-zig', ext: '.zig', runCmd: 'zig run /code/prog.zig', needsCompile: false, memoryLimit: '512m' },
  swift: { image: 'kodex-swift', ext: '.swift', runCmd: 'swift /code/prog.swift', needsCompile: false, memoryLimit: '512m' },
  kt:  { image: 'kodex-kt', ext: '.kt', compileCmd: 'kotlinc -include-runtime -d /code/out.jar /code/prog.kt && java -jar /code/out.jar', runCmd: '', needsCompile: true, memoryLimit: '768m' },
  wasm: { image: 'kodex-wasm', ext: '.wat', runCmd: 'wasmtime /code/prog.wat', needsCompile: false },
  asm: { image: 'kodex-asm', ext: '.asm', compileCmd: 'nasm -f elf64 /code/prog.asm -o /code/prog.o && ld -o /code/prog /code/prog.o && /code/prog', runCmd: '', needsCompile: true },
  bash: { image: 'kodex-bash', ext: '.sh', runCmd: 'bash /code/prog.sh', needsCompile: false },
  php:  { image: 'kodex-php', ext: '.php', runCmd: 'php /code/prog.php', needsCompile: false },
  scala: { image: 'kodex-scala', ext: '.scala', runCmd: 'scala /code/prog.scala', needsCompile: false, memoryLimit: '512m' },
  java: { image: 'kodex-java', ext: '.java', src: 'Main', compileCmd: 'javac /code/Main.java && java -cp /code Main', runCmd: '', needsCompile: true, memoryLimit: '768m' },
  lua:  { image: 'kodex-lua', ext: '.lua', runCmd: 'lua /code/prog.lua', needsCompile: false },
  rb:   { image: 'kodex-rb', ext: '.rb', runCmd: 'ruby /code/prog.rb', needsCompile: false },
  cs:   { image: 'kodex-cs', ext: '.cs', runCmd: 'cp /code/prog.cs /home/code/proj/Program.cs && cd /home/code/proj && dotnet run --no-restore', needsCompile: false, memoryLimit: '512m', poolSize: 2 },
  sqlite: { image: 'kodex-sqlite', ext: '.sql', runCmd: 'sqlite3 /code/prog.sql', needsCompile: false },
};

export interface DockerExecResult {
  output: string;
  error?: boolean;
  dockerAvailable?: boolean;
}

let dockerAvailable: boolean | null = null;

export function isDockerAvailable(): boolean {
  if (dockerAvailable !== null) return dockerAvailable;
  try {
    execSync('docker info', { timeout: 5000, stdio: 'pipe' });
    dockerAvailable = true;
  } catch {
    dockerAvailable = false;
  }
  return dockerAvailable;
}

export function getSupportedDockerLangs(): string[] {
  return Object.keys(DOCKER_RUNNERS);
}

interface SpawnWithTimeoutOpts {
  stdin?: string;
  timeout?: number;
  onChunk?: (chunk: string) => void;
}

function spawnWithTimeout(cmd: string, args: string[], opts: SpawnWithTimeoutOpts): Promise<{ stdout: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: [opts.stdin ? 'pipe' : 'inherit', 'pipe', 'pipe'] });
    let stdout = '';
    let timer: NodeJS.Timeout | null = null;

    if (opts.stdin) {
      child.stdin!.write(opts.stdin);
      child.stdin!.end();
    }

    child.stdout?.on('data', (d: Buffer) => {
      const chunk = d.toString();
      stdout += chunk;
      opts.onChunk?.(chunk);
    });

    child.stderr?.on('data', () => {});

    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolve({ stdout, exitCode: code });
    });

    child.on('error', reject);

    if (opts.timeout && opts.timeout > 0) {
      timer = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({ stdout: stdout + '\nExecution timed out', exitCode: 1 });
      }, opts.timeout);
    }
  });
}

export async function dockerExecute(lang: string, code: string, stdin?: string, onChunk?: (chunk: string) => void): Promise<DockerExecResult> {
  const config = DOCKER_RUNNERS[lang];
  if (!config) {
    return { output: `Docker execution not available for ${lang}`, error: true, dockerAvailable: isDockerAvailable() };
  }

  if (!isDockerAvailable()) {
    return { output: 'Docker is not available on this server', error: true, dockerAvailable: false };
  }

  try {
    execSync(`docker image inspect ${config.image}`, { timeout: 10000, stdio: 'pipe' });
  } catch {
    logger.debug({ lang, image: config.image }, 'Docker sandbox image not found');
    return { output: `Docker image ${config.image} not found`, error: true, dockerAvailable: false };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docker-exec-'));
  fs.chmodSync(tmpDir, 0o777);
  const srcName = config.src || 'prog';
  const tmpFile = path.join(tmpDir, srcName + config.ext);
  fs.writeFileSync(tmpFile, code);

  const innerCmd = config.needsCompile && config.compileCmd ? config.compileCmd : config.runCmd;
  const pidsLimit = config.pidsLimit || 50;
  const cmd = `docker run --rm -i --network none --memory ${config.memoryLimit || '256m'} --cpus 1 --pids-limit ${pidsLimit} -v "${tmpDir}:/code" ${config.image} sh -c "${innerCmd} 2>&1"`;

  logger.debug({ lang, cmd: cmd.slice(0, 100) }, 'Docker execute');

  const { stdout, exitCode } = await spawnWithTimeout('sh', ['-c', cmd], { stdin, timeout: 30000, onChunk });

  fs.rm(tmpDir, { recursive: true, force: true }, () => {});

  if (exitCode !== 0) {
    return { output: stdout.trim() || `Execution failed with exit code ${exitCode}`, error: true, dockerAvailable: true };
  }
  return { output: stdout.trim() || '(no output)' };
}

// ── Dockerfile generation ──

export function generateDockerfiles(targetDir: string): void {
  const dockerfiles: Record<string, string> = {
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

  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  for (const [filename, content] of Object.entries(dockerfiles)) {
    const lang = filename.replace('Dockerfile.', '');
    const outPath = path.join(targetDir, filename);
    fs.writeFileSync(outPath, content);
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
  const buildPath = path.join(targetDir, 'build-all.sh');
  fs.writeFileSync(buildPath, buildScript);
  fs.chmodSync(buildPath, '755');
  console.log(`Wrote ${buildPath} (chmod +x)`);
}
