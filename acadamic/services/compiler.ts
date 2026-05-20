import { exec } from 'child_process';
import path from 'path';
import os from 'os';
import type { CompilerEntry } from '../types';

const COMPILERS: Record<string, [string, string]> = {
  py:  ['python3', '--version'],
  go:  ['go', 'version'],
  rs:  ['rustc', '--version'],
  c:   ['gcc', '--version'],
  cpp: ['g++', '--version'],
  cs:  ['dotnet', '--version'],
  kt:  ['kotlinc', '-version'],
  swift: ['swift', '--version'],
  zig: ['zig', 'version'],
  ts:  ['tsx', '--version'],
};

const compilerCache = new Map<string, CompilerEntry>();
let lastCompilerCheck = 0;
const COMPILER_CACHE_TTL = 30000;

export async function checkCompilers(): Promise<Record<string, CompilerEntry>> {
  const now = Date.now();
  if (now - lastCompilerCheck < COMPILER_CACHE_TTL && compilerCache.size > 0) {
    return Object.fromEntries(compilerCache);
  }

  const extPath = `${process.env.PATH}:${path.join(os.homedir(), '.local/bin')}:${path.join(os.homedir(), '.cargo/bin')}`;

  const checks = Object.entries(COMPILERS).map(([lang, [cmd, flag]]) => {
    return new Promise<[string, CompilerEntry]>(resolve => {
      exec(
        `${cmd} ${flag}`,
        { timeout: 5000, env: { ...process.env, PATH: extPath } as NodeJS.ProcessEnv },
        (err, stdout) => {
          const ok = !err;
          const version = ok ? (stdout || '').split('\n')[0].trim() : null;
          compilerCache.set(lang, { available: ok, version });
          resolve([lang, { available: ok, version }]);
        },
      );
    });
  });

  const results = await Promise.all(checks);
  lastCompilerCheck = Date.now();
  return Object.fromEntries(results);
}

export function getCompileHint(lang: string): string {
  const hints: Record<string, string> = {
    c: '// gcc -Wall -o program program.c && ./program',
    cpp: '// g++ -std=c++20 -Wall -o program program.cpp && ./program',
    cs: '// dotnet run or csc program.cs && mono program.exe',
    go: '// go run program.go',
    rust: '// rustc program.rs && ./program',
    zig: '// zig build-exe program.zig && ./program',
    swift: '// swift program.swift',
    kt: '// kotlinc program.kt -include-runtime -d program.jar && java -jar program.jar',
    ts: '// tsc program.ts && node program.js',
    rs: '// rustc program.rs && ./program',
    dk: '// docker build -t myapp . && docker run myapp',
    git: '// git commands run in your terminal directly',
    sqlite: '// SQLite execution is built-in. Click Run!',
    pg: '// PostgreSQL: set PG_CONNECTION_STRING in .env or use psql -f query.sql',
    mysql: '// MySQL: set MYSQL_CONNECTION_STRING in .env or use mysql < query.sql',
    mongodb: '// mongosh < script.js or paste into mongosh',
    gamedev: '// Use your game engine IDE to run this code',
    quiz: '// Quiz questions are interactive in the UI',
    challenge: '// Challenges run in the JavaScript sandbox above',
  };
  return hints[lang] || `// Check your ${lang.toUpperCase()} documentation for execution instructions.`;
}

export function getCompilerList(): Record<string, [string, string]> {
  return COMPILERS;
}
