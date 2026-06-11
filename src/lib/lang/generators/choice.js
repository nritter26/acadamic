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
  // Alternate question types using index to multiply variety
  const qType = index % 4;
  if (qType === 0) return { prompt: `${target.term} means:`, choices: deterministicShuffle([target.definition, distractor.definition], langId + 'mm' + index), answer: target.definition };
  if (qType === 1) return { prompt: `Which term matches "${target.definition}"?`, choices: deterministicShuffle([target.term, distractor.term], langId + 'mmt' + index), answer: target.term };
  if (qType === 2) return { prompt: `"${target.term}" is an example of:`, choices: deterministicShuffle([target.definition, distractor.definition.substr(0, 30)], langId + 'mme' + index), answer: target.definition };
  // Cross-concept: pair two random concepts
  const second = pick(concepts.filter(c => c.term !== target.term), langId + 'mm2', index);
  return { prompt: `Which concept relates to ${target.term}?`, choices: deterministicShuffle([target.definition, second.definition], langId + 'mmc' + index), answer: target.definition };
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
    { error: 'NullReferenceError', desc: 'Accessing property on null value', fix: 'Check the value is not null before accessing properties' },
    { error: 'IndexError', desc: 'Accessing array index out of bounds', fix: 'Verify the index is within array length' },
    { error: 'KeyError', desc: 'Accessing dictionary key that does not exist', fix: 'Check if the key exists before accessing' },
    { error: 'ImportError', desc: 'Module or file could not be loaded', fix: 'Verify the module path and that it is installed' },
    { error: 'ValueError', desc: 'Function received an argument of correct type but invalid value', fix: 'Validate the value meets function requirements' },
    { error: 'AssertionError', desc: 'Assertion condition evaluated to false', fix: 'Check the assertion condition is correct' },
    { error: 'OverflowError', desc: 'Numeric result exceeds representable range', fix: 'Use a larger data type or reduce the value' },
    { error: 'RecursionError', desc: 'Maximum recursion depth exceeded', fix: 'Add a base case or convert to iteration' },
    { error: 'AttributeError', desc: 'Object does not have the requested attribute', fix: 'Check the attribute name and object type' },
    { error: 'IOError', desc: 'Input/output operation failed', fix: 'Check file permissions and path existence' },
    { error: 'ZeroDivisionError', desc: 'Division or modulo by zero', fix: 'Add a check for zero before division' },
    { error: 'MemoryError', desc: 'Operation ran out of memory', fix: 'Reduce memory usage or process in chunks' },
    { error: 'TimeoutError', desc: 'Operation exceeded time limit', fix: 'Optimize the operation or increase the timeout' },
  ];
  const e = pick(errors, langId, 'errorpedia', index);
  // Alternate between match-description and match-fix questions
  const qType = index % 3;
  if (qType === 0) return { prompt: `${e.error} in ${spec.name}:`, choices: deterministicShuffle([e.desc, errors[(errors.indexOf(e) + 1) % errors.length].desc], langId + 'err' + index), answer: e.desc };
  if (qType === 1) return { prompt: `Fix for ${e.error}:`, choices: deterministicShuffle([e.fix, errors[(errors.indexOf(e) + 3) % errors.length].fix], langId + 'errf' + index), answer: e.fix };
  return { prompt: `Which error matches "${e.desc}"?`, choices: deterministicShuffle([e.error, errors[(errors.indexOf(e) + 5) % errors.length].error], langId + 'erre' + index), answer: e.error };
}

export function generateApiArcade(langId, index) {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const statusCodes = [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 405, 409, 422, 429, 500, 502, 503];
  const qs = [
    { prompt: 'Which HTTP method creates a resource?', choices: ['POST', 'GET', 'PUT', 'DELETE'], answer: 'POST' },
    { prompt: 'Which HTTP method retrieves a resource?', choices: ['GET', 'POST', 'PUT', 'DELETE'], answer: 'GET' },
    { prompt: 'Which status code means "Not Found"?', choices: ['404', '200', '500', '301'], answer: '404' },
    { prompt: 'Which status code means "OK"?', choices: ['200', '404', '500', '301'], answer: '200' },
    { prompt: 'What format do most modern APIs use?', choices: ['JSON', 'XML', 'CSV', 'YAML'], answer: 'JSON' },
    { prompt: 'Which HTTP method updates a resource?', choices: ['PUT', 'GET', 'POST', 'DELETE'], answer: 'PUT' },
    { prompt: 'Which HTTP header carries auth credentials?', choices: ['Authorization', 'Accept', 'Content-Type', 'Cookie'], answer: 'Authorization' },
    { prompt: 'What does CORS stand for?', choices: ['Cross-Origin Resource Sharing', 'Console Output Response System', 'Common Object Runtime Standard', 'Code Optimization Resource Set'], answer: 'Cross-Origin Resource Sharing' },
    { prompt: 'Which status code means "Created"?', choices: ['201', '200', '202', '204'], answer: '201' },
    { prompt: 'Which status code means "No Content"?', choices: ['204', '200', '404', '304'], answer: '204' },
    { prompt: 'What is the correct Content-Type for a JSON API?', choices: ['application/json', 'text/json', 'application/javascript', 'text/plain'], answer: 'application/json' },
    { prompt: 'Which HTTP method is idempotent?', choices: ['PUT', 'POST', 'PATCH', 'all of them'], answer: 'PUT' },
    { prompt: 'What status code means "Unauthorized"?', choices: ['401', '403', '400', '402'], answer: '401' },
    { prompt: 'What status code means "Forbidden"?', choices: ['403', '401', '400', '404'], answer: '403' },
    { prompt: 'What does REST stand for?', choices: ['Representational State Transfer', 'Remote Execution Service Tool', 'Request-Enabled System Technology', 'Reliable Endpoint State Transfer'], answer: 'Representational State Transfer' },
    { prompt: 'Which header specifies the response format expected?', choices: ['Accept', 'Content-Type', 'Authorization', 'Cache-Control'], answer: 'Accept' },
  ];
  return qs[index % qs.length];
}

export function generateLogicLadder(langId, index) {
  const t = index * 2 + 3;
  const qs = [
    { prompt: 'If `x = 3`, what is `x > 2 && x < 5`?', choices: ['true', 'false', 'undefined'], answer: 'true' },
    { prompt: 'If first branch matches, else-if branches:', choices: ['are skipped', 'all run', 'throw an error'], answer: 'are skipped' },
    { prompt: 'What does `!true` evaluate to?', choices: ['false', 'true', 'undefined'], answer: 'false' },
    { prompt: 'What does `false || true` evaluate to?', choices: ['true', 'false', 'undefined'], answer: 'true' },
    { prompt: 'What does `true && false` evaluate to?', choices: ['false', 'true', 'undefined'], answer: 'false' },
    { prompt: 'Which operator has the highest precedence?', choices: ['!', '&&', '||'], answer: '!' },
    { prompt: 'What does `0 || 42` evaluate to?', choices: ['42', '0', 'false', 'true'], answer: '42' },
    { prompt: 'If `a = 5`, `b = 10`, is `a < b && b < 20`?', choices: ['true', 'false', 'NaN'], answer: 'true' },
    { prompt: 'What does `null ?? \"default\"` return?', choices: ['default', 'null', 'undefined', 'Error'], answer: 'default' },
    { prompt: 'A switch statement matches by:', choices: ['strict equality', 'loose equality', 'type coercion', 'reference'], answer: 'strict equality' },
    { prompt: 'What does `3 === \"3\"` return?', choices: ['false', 'true', 'undefined', 'Error'], answer: 'false' },
    { prompt: 'What does `3 == \"3\"` return in JS?', choices: ['true', 'false', 'undefined', 'Error'], answer: 'true' },
    { prompt: 'What does `!(x > 0)` mean?', choices: ['x <= 0', 'x < 0', 'x > 0', 'x >= 0'], answer: 'x <= 0' },
    { prompt: 'What is short-circuit evaluation?', choices: ['Stops evaluating when result is determined', 'Runs all conditions in parallel', 'Throws on first error', 'Evaluates all branches always'], answer: 'Stops evaluating when result is determined' },
    { prompt: `If x = ${t}, is x % 2 === 0?`, choices: [String(t % 2 === 0), String(t % 2 !== 0), 'undefined'], answer: String(t % 2 === 0) },
    { prompt: 'Which loop runs at least once?', choices: ['do-while', 'while', 'for', 'for-of'], answer: 'do-while' },
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
  {
    prompt: 'Which JOIN shows unmatched left rows as null?',
    choices: ['LEFT JOIN', 'INNER JOIN', 'CROSS JOIN'],
    answer: 'LEFT JOIN',
    tableA: { name: 'Products', columns: [{ name: 'ProductID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }, { name: 'Price', type: 'DECIMAL(10,2)' }] },
    tableB: { name: 'OrderItems', columns: [{ name: 'OrderItemID', type: 'INT', pk: true }, { name: 'OrderID', type: 'INT' }, { name: 'ProductID', type: 'INT', fk: true, ref: 'Products.ProductID' }, { name: 'Quantity', type: 'INT' }] },
  },
  {
    prompt: 'Which JOIN returns every combination of rows?',
    choices: ['CROSS JOIN', 'INNER JOIN', 'FULL JOIN'],
    answer: 'CROSS JOIN',
    tableA: { name: 'Colors', columns: [{ name: 'ColorID', type: 'INT', pk: true }, { name: 'ColorName', type: 'VARCHAR(50)' }] },
    tableB: { name: 'Sizes', columns: [{ name: 'SizeID', type: 'INT', pk: true }, { name: 'SizeName', type: 'VARCHAR(50)' }] },
  },
  {
    prompt: 'Which JOIN requires a matching condition?',
    choices: ['INNER JOIN', 'CROSS JOIN', 'FULL JOIN'],
    answer: 'INNER JOIN',
    tableA: { name: 'Users', columns: [{ name: 'UserID', type: 'INT', pk: true }, { name: 'Username', type: 'VARCHAR(50)' }, { name: 'Email', type: 'VARCHAR(255)' }] },
    tableB: { name: 'Posts', columns: [{ name: 'PostID', type: 'INT', pk: true }, { name: 'UserID', type: 'INT', fk: true, ref: 'Users.UserID' }, { name: 'Title', type: 'VARCHAR(200)' }, { name: 'Body', type: 'TEXT' }] },
  },
  {
    prompt: 'Which JOIN type preserves all rows from the second table?',
    choices: ['RIGHT JOIN', 'LEFT JOIN', 'INNER JOIN'],
    answer: 'RIGHT JOIN',
    tableA: { name: 'Departments', columns: [{ name: 'DeptID', type: 'INT', pk: true }, { name: 'DeptName', type: 'VARCHAR(100)' }] },
    tableB: { name: 'Employees', columns: [{ name: 'EmployeeID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }, { name: 'DeptID', type: 'INT', fk: true, ref: 'Departments.DeptID' }, { name: 'Salary', type: 'DECIMAL(10,2)' }] },
  },
  {
    prompt: 'A self-join connects a table to:',
    choices: ['itself', 'another table', 'a view', 'a subquery'],
    answer: 'itself',
    tableA: { name: 'Employees', columns: [{ name: 'EmployeeID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }, { name: 'ManagerID', type: 'INT', fk: true, ref: 'Employees.EmployeeID' }] },
    tableB: null,
  },
  {
    prompt: 'Which JOIN needs no ON clause?',
    choices: ['CROSS JOIN', 'INNER JOIN', 'LEFT JOIN', 'FULL JOIN'],
    answer: 'CROSS JOIN',
    tableA: { name: 'Suppliers', columns: [{ name: 'SupplierID', type: 'INT', pk: true }, { name: 'Name', type: 'VARCHAR(100)' }, { name: 'Country', type: 'VARCHAR(50)' }] },
    tableB: { name: 'Products', columns: [{ name: 'ProductID', type: 'INT', pk: true }, { name: 'ProductName', type: 'VARCHAR(200)' }, { name: 'Price', type: 'DECIMAL(10,2)' }] },
  },
];

export function generateSqlJoinMatch(langId, index) {
  const base = DB_TABLES[index % DB_TABLES.length];
  // Alternate question types for more variety
  if (index >= DB_TABLES.length * 2) {
    return { prompt: `When joining, what does ON do?`, choices: ['Specifies the join condition', 'Names the tables', 'Filters the result', 'Orders the output'], answer: 'Specifies the join condition' };
  }
  return { ...base };
}

export function generateRaceCompiler(langId, index) {
  const qs = [
    { prompt: 'First stage in a typical compiler pipeline?', choices: ['Lexing/Tokenizing', 'Code generation', 'Optimization'], answer: 'Lexing/Tokenizing' },
    { prompt: 'AST stands for:', choices: ['Abstract Syntax Tree', 'Applied Style Token', 'Async Stack Trace'], answer: 'Abstract Syntax Tree' },
    { prompt: 'What does a lexer produce?', choices: ['Tokens', 'Machine code', 'AST nodes'], answer: 'Tokens' },
    { prompt: 'What does the parser produce from tokens?', choices: ['AST', 'Machine code', 'Bytecode'], answer: 'AST' },
    { prompt: 'What is the last stage of compilation?', choices: ['Code generation', 'Lexing', 'Optimization'], answer: 'Code generation' },
    { prompt: 'Which phase checks type correctness?', choices: ['Semantic analysis', 'Lexing', 'Parsing', 'Code gen'], answer: 'Semantic analysis' },
    { prompt: 'What does JIT stand for?', choices: ['Just-In-Time compilation', 'Java Internal Tool', 'Jump Instruction Table', 'JSON Integration Test'], answer: 'Just-In-Time compilation' },
    { prompt: 'What is an intermediate representation (IR)?', choices: ['Middle stage between AST and machine code', 'The source code', 'The final binary', 'A debugging format'], answer: 'Middle stage between AST and machine code' },
    { prompt: 'What does an optimizer do?', choices: ['Improves code performance', 'Fixes syntax errors', 'Generates tokens', 'Creates the AST'], answer: 'Improves code performance' },
    { prompt: 'What is instruction selection?', choices: ['Mapping IR to target CPU instructions', 'Choosing which language to compile', 'Selecting variable names', 'Picking error messages'], answer: 'Mapping IR to target CPU instructions' },
    { prompt: 'What does AOT compilation mean?', choices: ['Ahead-Of-Time', 'Abstract Object Tree', 'Assembly Output Tool', 'Automatic Optimization Tuning'], answer: 'Ahead-Of-Time' },
    { prompt: 'Which is a compiled language?', choices: ['Go', 'Python', 'JavaScript', 'Ruby'], answer: 'Go' },
    { prompt: 'Which is an interpreted language?', choices: ['Python', 'C', 'Rust', 'Go'], answer: 'Python' },
    { prompt: 'What does register allocation do?', choices: ['Assigns variables to CPU registers', 'Allocates memory on the heap', 'Creates symbol tables', 'Generates tokens'], answer: 'Assigns variables to CPU registers' },
    { prompt: 'What does a symbol table track?', choices: ['Variable names, types, and scopes', 'The CPU instructions', 'Syntax errors', 'Optimization passes'], answer: 'Variable names, types, and scopes' },
  ];
  return qs[index % qs.length];
}
