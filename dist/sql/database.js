"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAll = initAll;
exports.getStatus = getStatus;
exports.executeSQLite = executeSQLite;
exports.executePG = executePG;
exports.executeMySQL = executeMySQL;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
let pgPool = null;
let mysqlPool = null;
let db = null;
function initSQLite() {
    try {
        db = new better_sqlite3_1.default(':memory:');
        const seedPath = path_1.default.join(__dirname, 'seed.sql');
        const seedSQL = fs_1.default.readFileSync(seedPath, 'utf-8');
        db.exec(seedSQL);
        return { available: true };
    }
    catch (e) {
        return { available: false, error: e.message };
    }
}
function initPG() {
    const connStr = process.env.PG_CONNECTION_STRING;
    if (!connStr)
        return { available: false, reason: 'PG_CONNECTION_STRING not set' };
    try {
        const { Pool } = require('pg');
        pgPool = new Pool({ connectionString: connStr, max: 3, idleTimeoutMillis: 5000 });
        return { available: true };
    }
    catch (e) {
        return { available: false, error: e.message };
    }
}
function initMySQL() {
    const connStr = process.env.MYSQL_CONNECTION_STRING;
    if (!connStr)
        return { available: false, reason: 'MYSQL_CONNECTION_STRING not set' };
    try {
        const mysql = require('mysql2/promise');
        mysqlPool = mysql.createPool({ uri: connStr, connectionLimit: 3 });
        return { available: true };
    }
    catch (e) {
        return { available: false, error: e.message };
    }
}
function padRight(s, len) {
    const str = String(s);
    return str.length < len ? str + ' '.repeat(len - str.length) : str;
}
function formatQueryResult(rows, cols) {
    if (!rows || rows.length === 0)
        return '(0 rows)';
    const widths = cols.map(c => Math.max(String(c).length, 8));
    for (const row of rows) {
        for (let i = 0; i < cols.length; i++) {
            const val = row[cols[i]];
            const s = val === null ? 'NULL' : String(val);
            if (s.length > widths[i])
                widths[i] = Math.min(s.length, 80);
        }
    }
    const totalWidth = widths.reduce((a, w) => a + w + 3, 0) + 1;
    let out = '';
    out += '┌' + '─'.repeat(totalWidth - 2) + '┐\n';
    out += '│';
    for (let i = 0; i < cols.length; i++) {
        out += ' ' + padRight(cols[i], widths[i]) + ' │';
    }
    out += '\n';
    out += '├' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┤\n';
    const maxRows = 200;
    const displayRows = rows.slice(0, maxRows);
    for (const row of displayRows) {
        out += '│';
        for (let i = 0; i < cols.length; i++) {
            const val = row[cols[i]];
            const s = val === null ? 'NULL' : String(val);
            const truncated = s.length > 80 ? s.slice(0, 77) + '...' : s;
            out += ' ' + padRight(truncated, widths[i]) + ' │';
        }
        out += '\n';
    }
    if (rows.length > maxRows) {
        out += '│ ' + padRight('... ' + (rows.length - maxRows) + ' more rows', totalWidth - 4) + ' │\n';
    }
    out += '└' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘\n';
    out += '(' + rows.length + ' rows)';
    return out;
}
function formatError(e) {
    const msg = e.message || String(e);
    return 'Error: ' + msg.split('\n')[0];
}
function isSelectish(sql) {
    const trimmed = sql.trim().toUpperCase();
    const ok = ['SELECT', 'WITH', 'EXPLAIN', 'PRAGMA', 'SHOW', 'DESCRIBE', 'VALUES'];
    for (const kw of ok) {
        if (trimmed.startsWith(kw))
            return true;
    }
    return false;
}
function splitSQL(sql) {
    const result = [];
    let current = '';
    let inString = null;
    for (let i = 0; i < sql.length; i++) {
        const ch = sql[i];
        if (inString) {
            current += ch;
            if (ch === '\\') {
                i++;
                if (i < sql.length)
                    current += sql[i];
            }
            else if (ch === inString)
                inString = null;
        }
        else if (ch === "'" || ch === '"') {
            current += ch;
            inString = ch;
        }
        else if (ch === ';') {
            const trimmed = current.trim();
            if (trimmed)
                result.push(trimmed);
            current = '';
        }
        else {
            current += ch;
        }
    }
    const trimmed = current.trim();
    if (trimmed)
        result.push(trimmed);
    return result;
}
function executeSQLite(sql) {
    if (!db)
        return { output: 'SQLite not initialized', error: true };
    const statements = splitSQL(sql);
    if (statements.length === 0)
        return { output: '(no statements to execute)' };
    const outputs = [];
    for (const stmt of statements) {
        try {
            if (isSelectish(stmt)) {
                const rows = db.prepare(stmt).all();
                if (rows.length > 0) {
                    const cols = Object.keys(rows[0]);
                    outputs.push(formatQueryResult(rows, cols));
                }
                else {
                    outputs.push('(0 rows)');
                }
            }
            else {
                const info = db.prepare(stmt).run();
                if (info.changes !== undefined) {
                    outputs.push('Query OK, ' + info.changes + ' row(s) affected');
                }
            }
        }
        catch (e) {
            outputs.push(formatError(e));
        }
    }
    return { output: outputs.join('\n\n') };
}
let executingPG = false;
async function executePG(sql) {
    if (!pgPool)
        return { output: 'PostgreSQL not configured. Set PG_CONNECTION_STRING in .env', error: true };
    if (executingPG)
        return { output: 'Another PG query is already running. Wait and try again.', error: true };
    executingPG = true;
    try {
        const client = await pgPool.connect();
        try {
            const res = await client.query(sql);
            if (res.rows && res.rows.length > 0) {
                const cols = res.fields.map((f) => f.name);
                const formatted = formatQueryResult(res.rows, cols);
                return { output: formatted };
            }
            if (res.rowCount !== null && res.rowCount !== undefined) {
                return { output: 'Query OK, ' + res.rowCount + ' row(s) affected' };
            }
            return { output: '(0 rows)' };
        }
        finally {
            client.release();
        }
    }
    catch (e) {
        return { output: formatError(e), error: true };
    }
    finally {
        executingPG = false;
    }
}
let executingMySQL = false;
async function executeMySQL(sql) {
    if (!mysqlPool)
        return { output: 'MySQL not configured. Set MYSQL_CONNECTION_STRING in .env', error: true };
    if (executingMySQL)
        return { output: 'Another MySQL query is already running. Wait and try again.', error: true };
    executingMySQL = true;
    try {
        const conn = await mysqlPool.getConnection();
        try {
            const [rows, fields] = await conn.query(sql);
            if (Array.isArray(rows) && rows.length > 0) {
                const cols = fields ? fields.map(f => f.name) : Object.keys(rows[0]);
                const formatted = formatQueryResult(rows, cols);
                return { output: formatted };
            }
            const result = rows;
            if (result && result.affectedRows !== undefined) {
                return { output: 'Query OK, ' + result.affectedRows + ' row(s) affected' };
            }
            return { output: '(0 rows)' };
        }
        finally {
            conn.release();
        }
    }
    catch (e) {
        return { output: formatError(e), error: true };
    }
    finally {
        executingMySQL = false;
    }
}
const state = { sqlite: null, pg: null, mysql: null };
function initAll() {
    state.sqlite = initSQLite();
    state.pg = initPG();
    state.mysql = initMySQL();
    return state;
}
function getStatus() {
    return {
        sqlite: state.sqlite,
        pg: state.pg,
        mysql: state.mysql,
    };
}
//# sourceMappingURL=database.js.map