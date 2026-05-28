import { describe, it, expect } from 'vitest';
import { generateDockerfiles, isDockerAvailable, getSupportedDockerLangs } from '../services/docker-executor';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Docker Sandbox Service', () => {
  it('generates Dockerfiles for all supported languages', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docker-test-'));
    try {
      generateDockerfiles(tmpDir);
      const files = fs.readdirSync(tmpDir).filter(f => f.startsWith('Dockerfile.'));
      expect(files.length).toBeGreaterThanOrEqual(16);
      expect(files).toContain('Dockerfile.py');
      expect(files).toContain('Dockerfile.js');
      expect(files).toContain('Dockerfile.go');
      expect(files).toContain('Dockerfile.rs');
      expect(files).toContain('Dockerfile.c');
      expect(files).toContain('Dockerfile.cpp');
      expect(files).toContain('Dockerfile.zig');
      expect(files).toContain('Dockerfile.kt');
      expect(files).toContain('Dockerfile.cs');
      expect(files).toContain('Dockerfile.ts');
      expect(files).toContain('Dockerfile.swift');
      expect(files).toContain('Dockerfile.java');

      // Verify Python Dockerfile content
      const pyDf = fs.readFileSync(path.join(tmpDir, 'Dockerfile.py'), 'utf-8');
      expect(pyDf).toContain('python');
      expect(pyDf).toContain('useradd');
      expect(pyDf).toContain('USER code');

      // Verify build script exists
      expect(fs.existsSync(path.join(tmpDir, 'build-all.sh'))).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('returns supported language list', () => {
    const langs = getSupportedDockerLangs();
    expect(langs).toContain('py');
    expect(langs).toContain('js');
    expect(langs).toContain('rs');
    expect(langs).toContain('c');
    expect(langs).toContain('zig');
    expect(langs).toContain('kt');
    expect(langs).toContain('java');
    expect(langs).toContain('cs');
    expect(langs).toContain('wasm');
  });

  it('keeps committed Scala and C# Dockerfiles aligned with the sandbox runner', () => {
    const scalaDf = fs.readFileSync(path.join(process.cwd(), 'docker/Dockerfile.scala'), 'utf-8');
    const csDf = fs.readFileSync(path.join(process.cwd(), 'docker/Dockerfile.cs'), 'utf-8');
    const javaDf = fs.readFileSync(path.join(process.cwd(), 'docker/Dockerfile.java'), 'utf-8');

    expect(scalaDf).toContain('scala3-3.3.3.tar.gz');
    expect(scalaDf).toContain('ln -s /opt/scala3-3.3.3/bin/scala /usr/local/bin/scala');
    expect(scalaDf).toContain('USER code');

    expect(csDf).toContain('dotnet tool install -g dotnet-script');
    expect(csDf).toContain('PATH="$PATH:/home/code/.dotnet/tools"');
    expect(csDf).toContain('USER code');

    expect(javaDf).toContain('eclipse-temurin:22-jdk');
    expect(javaDf).toContain('USER code');
  });

  it('checks Docker availability without throwing', () => {
    const result = isDockerAvailable();
    // Should return a boolean without throwing
    expect(typeof result).toBe('boolean');
  });

  it('each Dockerfile has proper security (non-root user)', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docker-test-'));
    try {
      generateDockerfiles(tmpDir);
      const files = fs.readdirSync(tmpDir).filter(f => f.startsWith('Dockerfile.'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(tmpDir, file), 'utf-8');
        expect(content).toMatch(/useradd|adduser/i);
        expect(content).toMatch(/USER code/i);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
