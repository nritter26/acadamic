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
      expect(files.length).toBeGreaterThanOrEqual(8);
      expect(files).toContain('Dockerfile.py');
      expect(files).toContain('Dockerfile.js');
      expect(files).toContain('Dockerfile.go');
      expect(files).toContain('Dockerfile.rs');
      expect(files).toContain('Dockerfile.c');
      expect(files).toContain('Dockerfile.cpp');
      expect(files).toContain('Dockerfile.zig');

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
    expect(langs).toContain('go');
    expect(langs).toContain('rs');
    expect(langs).toContain('c');
    expect(langs).toContain('zig');
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
