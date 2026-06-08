import { pick, deterministicShuffle } from '../index.js';
import { JS_SPEC } from '../specs/js.js';
import { PY_SPEC } from '../specs/py.js';
import { GO_SPEC } from '../specs/go.js';
import { RS_SPEC } from '../specs/rs.js';
import { C_SPEC, CPP_SPEC, CS_SPEC, ZIG_SPEC } from '../specs/c-family.js';
import { JAVA_SPEC, KOTLIN_SPEC as KT_SPEC, SCALA_SPEC } from '../specs/jvm.js';
import { HTML_SPEC, CSS_SPEC, BASH_SPEC, WASM_SPEC } from '../specs/web.js';
import { SWIFT_SPEC, LUA_SPEC } from '../specs/mobile.js';
import { SQL_SPEC, PHP_SPEC, RB_SPEC } from '../specs/sql-rb.php.js';
import { ASM_SPEC } from '../specs/asm.js';
import { REACT_SPEC } from '../specs/react.js';
import { VUE_SPEC } from '../specs/vue.js';
import { SVELTE_SPEC } from '../specs/svelte.js';

const SPECS = [JS_SPEC, PY_SPEC, GO_SPEC, RS_SPEC, C_SPEC, CPP_SPEC, CS_SPEC, ZIG_SPEC, JAVA_SPEC, KT_SPEC, SCALA_SPEC, HTML_SPEC, CSS_SPEC, BASH_SPEC, WASM_SPEC, SWIFT_SPEC, LUA_SPEC, SQL_SPEC, PHP_SPEC, RB_SPEC, ASM_SPEC, REACT_SPEC, VUE_SPEC, SVELTE_SPEC];
const SPEC_MAP = {};
SPECS.forEach(s => SPEC_MAP[s.id] = s);

export function getSpec(langId) {
  return SPEC_MAP[langId] || JS_SPEC;
}

export { SPEC_MAP };

export function generateSyntaxSprint(langId, index) {
  const spec = getSpec(langId);
  const tests = spec.syntaxTests;
  if (!tests || tests.length === 0) return null;
  const test = pick(tests, langId, 'syntax-sprint', index);
  const isWhichInvalid = index % 2 === 0;
  const q = isWhichInvalid
    ? { prompt: `Which is the INVALID ${spec.name} syntax?`, choices: deterministicShuffle([test.valid, test.invalid], langId + 'sprint' + index + 'a'), answer: test.invalid }
    : { prompt: `Which is the VALID ${spec.name} syntax?`, choices: deterministicShuffle([test.valid, test.invalid], langId + 'sprint' + index + 'b'), answer: test.valid };
  return q;
}

export function generateSyntaxSwipe(langId, index) {
  const spec = getSpec(langId);
  const tests = spec.syntaxTests;
  if (!tests || tests.length === 0) return null;
  const test = pick(tests, langId, 'syntax-swipe', index);
  return { prompt: `\`${test.valid}\``, choices: ['Valid', 'Invalid'], answer: 'Valid' };
}

export function generateMemoryMatch(langId, index) {
  const spec = getSpec(langId);
  const concepts = spec.concepts;
  if (!concepts || concepts.length < 2) return null;
  const target = pick(concepts, langId, 'memory-match', index);
  const others = concepts.filter(c => c.term !== target.term);
  const distractor = pick(others, langId + 'dist', index);
  return { prompt: `${target.term} means:`, choices: deterministicShuffle([target.definition, distractor.definition], langId + 'mm' + index), answer: target.definition };
}

export function generateSpeedRead(langId, index) {
  const spec = getSpec(langId);
  const patterns = spec.patterns;
  if (!patterns || patterns.length === 0) return null;
  const p = pick(patterns, langId, 'speed-read', index);
  const code = p.lines.join('\n');
  const questions = [
    { q: `What does this ${spec.name} code do?`, a: `Defines a ${p.tags[0] || 'function'}` },
    { q: `How many lines does this ${spec.name} code have?`, a: String(p.lines.length) },
  ];
  const qi = index % questions.length;
  return { prompt: `${questions[qi].q}\n\`\`\`\n${code}\n\`\`\``, choices: deterministicShuffle([questions[qi].a, `${p.lines.length + 1}`, 'It throws an error'], langId + 'sr' + index), answer: questions[qi].a };
}

export function generateErrorpedia(langId, index) {
  const spec = getSpec(langId);
  const errors = [
    { error: 'SyntaxError', desc: 'Invalid language syntax', fix: 'Check for missing brackets, semicolons, or keywords' },
    { error: 'TypeError', desc: 'Operation on incompatible type', fix: 'Ensure the value is the expected type' },
    { error: 'ReferenceError', desc: 'Accessing undefined variable', fix: 'Check variable name spelling and scope' },
    { error: 'RangeError', desc: 'Value outside allowed range', fix: 'Validate the value is within bounds' },
  ];
  const e = pick(errors, langId, 'errorpedia', index);
  return { prompt: `${e.error} in ${spec.name}:`, choices: deterministicShuffle([e.desc, 'Network connection failed', 'File not found'], langId + 'err' + index), answer: e.desc };
}

export function generateApiArcade(langId, index) {
  const qs = [
    { prompt: 'Which HTTP method creates a resource?', choices: ['POST', 'GET', 'PUT', 'DELETE'], answer: 'POST' },
    { prompt: 'Which HTTP method retrieves a resource?', choices: ['GET', 'POST', 'PUT', 'DELETE'], answer: 'GET' },
    { prompt: 'Which status code means "Not Found"?', choices: ['404', '200', '500', '301'], answer: '404' },
    { prompt: 'Which status code means "OK"?', choices: ['200', '404', '500', '301'], answer: '200' },
    { prompt: 'What format do most modern APIs use?', choices: ['JSON', 'XML', 'CSV', 'YAML'], answer: 'JSON' },
    { prompt: 'Which HTTP method updates a resource?', choices: ['PUT', 'GET', 'POST', 'DELETE'], answer: 'PUT' },
  ];
  return qs[index % qs.length];
}

export function generateLogicLadder(langId, index) {
  const qs = [
    { prompt: 'If `x = 3`, what is `x > 2 && x < 5`?', choices: ['true', 'false'], answer: 'true' },
    { prompt: 'If first branch matches, else-if branches:', choices: ['are skipped', 'all run', 'throw an error'], answer: 'are skipped' },
    { prompt: 'What does `!true` evaluate to?', choices: ['false', 'true', 'undefined'], answer: 'false' },
    { prompt: 'What does `false || true` evaluate to?', choices: ['true', 'false', 'undefined'], answer: 'true' },
    { prompt: 'What does `true && false` evaluate to?', choices: ['false', 'true', 'undefined'], answer: 'false' },
    { prompt: 'Which operator has the highest precedence?', choices: ['!', '&&', '||'], answer: '!' },
  ];
  return qs[index % qs.length];
}

const DB_TABLES = [
  {
    prompt: 'Keep all left rows and matching right rows.',
    choices: ['LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN'],
    answer: 'LEFT JOIN',
    tableA: { name: 'Customers', columns: [{ name: 'CustomerID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }, { name: 'Email', type: 'VARCHAR(255)' }] },
    tableB: { name: 'Orders', columns: [{ name: 'OrderID', type: 'INT', pk: true }, { name: 'CustomerID', type: 'INT', fk: true, ref: 'Customers.CustomerID' }, { name: 'Total', type: 'DECIMAL(10,2)' }, { name: 'OrderDate', type: 'DATE' }] },
  },
  {
    prompt: 'Only rows matching both tables.',
    choices: ['INNER JOIN', 'LEFT JOIN', 'FULL JOIN'],
    answer: 'INNER JOIN',
    tableA: { name: 'Students', columns: [{ name: 'StudentID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }, { name: 'Major', type: 'VARCHAR(50)' }] },
    tableB: { name: 'Enrollments', columns: [{ name: 'EnrollID', type: 'INT', pk: true }, { name: 'StudentID', type: 'INT', fk: true, ref: 'Students.StudentID' }, { name: 'Course', type: 'VARCHAR(100)' }, { name: 'Grade', type: 'CHAR(2)' }] },
  },
  {
    prompt: 'All rows from both tables, nulls where no match.',
    choices: ['FULL JOIN', 'INNER JOIN', 'LEFT JOIN'],
    answer: 'FULL JOIN',
    tableA: { name: 'Employees', columns: [{ name: 'EmployeeID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }, { name: 'Department', type: 'VARCHAR(50)' }] },
    tableB: { name: 'Projects', columns: [{ name: 'ProjectID', type: 'INT', pk: true }, { name: 'ProjectName', type: 'VARCHAR(100)' }, { name: 'LeadID', type: 'INT', fk: true, ref: 'Employees.EmployeeID' }, { name: 'Budget', type: 'DECIMAL(12,2)' }] },
  },
  {
    prompt: 'Keep all right rows and matching left rows.',
    choices: ['RIGHT JOIN', 'LEFT JOIN', 'INNER JOIN'],
    answer: 'RIGHT JOIN',
    tableA: { name: 'Authors', columns: [{ name: 'AuthorID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }] },
    tableB: { name: 'Books', columns: [{ name: 'BookID', type: 'INT', pk: true }, { name: 'Title', type: 'VARCHAR(200)' }, { name: 'AuthorID', type: 'INT', fk: true, ref: 'Authors.AuthorID' }, { name: 'Year', type: 'INT' }] },
  },
];

export function generateSqlJoinMatch(langId, index) {
  return { ...DB_TABLES[index % DB_TABLES.length] };
}

export function generateRaceCompiler(langId, index) {
  const qs = [
    { prompt: 'First stage in a typical compiler pipeline?', choices: ['Lexing/Tokenizing', 'Code generation', 'Optimization'], answer: 'Lexing/Tokenizing' },
    { prompt: 'AST stands for:', choices: ['Abstract Syntax Tree', 'Applied Style Token', 'Async Stack Trace'], answer: 'Abstract Syntax Tree' },
    { prompt: 'What does a lexer produce?', choices: ['Tokens', 'Machine code', 'AST nodes'], answer: 'Tokens' },
    { prompt: 'What does the parser produce from tokens?', choices: ['AST', 'Machine code', 'Bytecode'], answer: 'AST' },
    { prompt: 'What is the last stage of compilation?', choices: ['Code generation', 'Lexing', 'Optimization'], answer: 'Code generation' },
  ];
  return qs[index % qs.length];
}
