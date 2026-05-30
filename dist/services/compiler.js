"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCompilers = checkCompilers;
exports.getCompileHint = getCompileHint;
exports.getCompilerList = getCompilerList;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const COMPILERS = {
    py: ['python3', '--version'],
    go: ['go', 'version'],
    rs: ['rustc', '--version'],
    c: ['gcc', '--version'],
    cpp: ['g++', '--version'],
    cs: ['dotnet', '--version'],
    kt: ['kotlinc', '-version'],
    swift: ['swift', '--version'],
    wasm: ['wasmtime', '--version'],
    asm: ['nasm', '--version'],
    zig: ['zig', 'version'],
    ts: ['tsx', '--version'],
    lua: ['lua', '--version'],
    bash: ['bash', '--version'],
    php: ['php', '--version'],
    scala: ['scalac', '-version'],
};
const compilerCache = new Map();
let lastCompilerCheck = 0;
const COMPILER_CACHE_TTL = 30000;
async function checkCompilers() {
    const now = Date.now();
    if (now - lastCompilerCheck < COMPILER_CACHE_TTL && compilerCache.size > 0) {
        return Object.fromEntries(compilerCache);
    }
    const extPath = `${process.env.PATH}:${path_1.default.join(os_1.default.homedir(), '.local/bin')}:${path_1.default.join(os_1.default.homedir(), '.cargo/bin')}`;
    const checks = Object.entries(COMPILERS).map(([lang, [cmd, flag]]) => {
        return new Promise(resolve => {
            (0, child_process_1.exec)(`${cmd} ${flag}`, { timeout: 5000, env: { ...process.env, PATH: extPath } }, (err, stdout) => {
                const ok = !err;
                const version = ok ? (stdout || '').split('\n')[0].trim() : null;
                compilerCache.set(lang, { available: ok, version });
                resolve([lang, { available: ok, version }]);
            });
        });
    });
    const results = await Promise.all(checks);
    lastCompilerCheck = Date.now();
    return Object.fromEntries(results);
}
function getCompileHint(lang) {
    const hints = {
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
        wasm: '// wasmtime program.wat',
        asm: '// nasm -f elf64 program.asm && ld -o program program.o && ./program',
        bash: '// bash program.sh',
        php: '// php program.php',
        dk: '// docker build -t myapp . && docker run myapp',
        git: '// git commands run in your terminal directly',
        sqlite: '// SQLite execution is built-in. Click Run!',
        pg: '// PostgreSQL: set PG_CONNECTION_STRING in .env or use psql -f query.sql',
        mysql: '// MySQL: set MYSQL_CONNECTION_STRING in .env or use mysql < query.sql',
        scala: '// scalac -d program.jar Main.scala && scala -cp program.jar Main',
        mongodb: '// mongosh < script.js or paste into mongosh',
        gamedev: '// Use your game engine IDE to run this code',
        quiz: '// Quiz questions are interactive in the UI',
        challenge: '// Challenges run in the JavaScript sandbox above',
    };
    return hints[lang] || `// Check your ${lang.toUpperCase()} documentation for execution instructions.`;
}
function getCompilerList() {
    return COMPILERS;
}
//# sourceMappingURL=compiler.js.map