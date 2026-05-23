import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../middleware';

interface DockerRunnerConfig {
  image: string;
  ext: string;
  compileCmd?: string;
  runCmd: string;
  needsCompile: boolean;
}

const DOCKER_RUNNERS: Record<string, DockerRunnerConfig> = {
  py:  { image: 'kodex-py', ext: '.py', runCmd: 'python3 -u /code/prog.py', needsCompile: false },
  js:  { image: 'kodex-js', ext: '.js', runCmd: 'node /code/prog.js', needsCompile: false },
  ts:  { image: 'kodex-ts', ext: '.ts', runCmd: 'tsx /code/prog.ts', needsCompile: false },
  go:  { image: 'kodex-go', ext: '.go', runCmd: 'go run /code/prog.go', needsCompile: false },
  rs:  { image: 'kodex-rs', ext: '.rs', compileCmd: 'rustc /code/prog.rs -o /code/out && /code/out', runCmd: '', needsCompile: true },
  c:   { image: 'kodex-c', ext: '.c', compileCmd: 'gcc -Wall /code/prog.c -o /code/out && /code/out', runCmd: '', needsCompile: true },
  cpp: { image: 'kodex-cpp', ext: '.cpp', compileCmd: 'g++ -std=c++20 -Wall /code/prog.cpp -o /code/out && /code/out', runCmd: '', needsCompile: true },
  zig: { image: 'kodex-zig', ext: '.zig', runCmd: 'zig run /code/prog.zig', needsCompile: false },
  swift: { image: 'kodex-swift', ext: '.swift', runCmd: 'swift /code/prog.swift', needsCompile: false },
  kt:  { image: 'kodex-kt', ext: '.kt', compileCmd: 'kotlinc -include-runtime -d /code/out.jar /code/prog.kt && java -jar /code/out.jar', runCmd: '', needsCompile: true },
  cs:  { image: 'kodex-cs', ext: '.csx', runCmd: 'dotnet script /code/prog.csx', needsCompile: false },
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

export async function dockerExecute(lang: string, code: string, stdin?: string): Promise<DockerExecResult> {
  const config = DOCKER_RUNNERS[lang];
  if (!config) {
    return { output: `Docker execution not available for ${lang}`, error: true, dockerAvailable: isDockerAvailable() };
  }

  if (!isDockerAvailable()) {
    return { output: 'Docker is not available on this server', error: true, dockerAvailable: false };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docker-exec-'));
  const tmpFile = path.join(tmpDir, 'prog' + config.ext);
  fs.writeFileSync(tmpFile, code);

  try {
    const cmd = config.needsCompile && config.compileCmd
      ? `docker run --rm -i --network none --memory 256m --cpus 1 --pids-limit 50 -v "${tmpDir}:/code:ro" ${config.image} sh -c "${config.compileCmd}"`
      : `docker run --rm -i --network none --memory 256m --cpus 1 --pids-limit 50 -v "${tmpDir}:/code:ro" ${config.image} ${config.runCmd}`;

    logger.debug({ lang, cmd: cmd.slice(0, 100) }, 'Docker execute');

    const stdout = execSync(cmd, {
      timeout: 30000,
      stdio: stdin ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
      input: stdin,
      maxBuffer: 1024 * 1024,
    });

    return { output: stdout.toString().trim() || '(no output)' };
  } catch (err: any) {
    const stderr = err.stderr?.toString().trim() || '';
    const stdout = err.stdout?.toString().trim() || '';
    const output = stdout || stderr || `Execution failed: ${(err.message || '').slice(0, 200)}`;
    return { output, error: true, dockerAvailable: true };
  } finally {
    fs.rm(tmpDir, { recursive: true, force: true }, () => {});
  }
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
    'Dockerfile.kt': `
FROM openjdk:22-slim
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/* && \\
    curl -sL https://github.com/JetBrains/kotlin/releases/download/v2.0.21/kotlin-compiler-2.0.21.zip -o /tmp/kc.zip && \\
    unzip -q /tmp/kc.zip -d /opt && rm /tmp/kc.zip && \\
    ln -s /opt/kotlinc/bin/kotlinc /usr/local/bin/kotlinc
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
`.trim(),
    'Dockerfile.cs': `
FROM mcr.microsoft.com/dotnet/sdk:8.0
RUN dotnet tool install -g dotnet-script && useradd -m -u 1000 code
ENV PATH="$PATH:/root/.dotnet/tools"
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
