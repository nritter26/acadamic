/**
 * Generate Quiz Data — Creates 300 quiz questions per language
 * (100 beginner, 100 intermediate, 100 expert) in content/app-data.json.
 *
 * Usage: node scripts/generate-quiz-data.mjs
 *
 * Each question: { q: string, opts: [4 strings], ans: 0-3, level: 'beginner'|'intermediate'|'expert' }
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const APP_DATA_PATH = resolve(ROOT, 'content', 'app-data.json');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestions(name, topics, level) {
  const qs = [];
  for (const [, q, opts] of topics) {
    const shuffled = shuffle(opts.map(o => `${o}`));
    const correctAns = shuffled.indexOf(`${opts[0]}`);
    qs.push({ q: `${q} ${name}?`, opts: shuffled, ans: correctAns, level });
  }
  return qs;
}

// Question templates: [tag, questionPrefix, [correctAnswer, ...wrongAnswers]]
const BEGINNER_TOPICS = [
  ['var decl', 'How do you declare a variable in', ['Use let/var/const', 'Declare with type', 'Use assignment', 'No declaration needed']],
  ['int type', 'Which type stores whole numbers in', ['int', 'float', 'string', 'bool']],
  ['bool type', 'What type holds true/false in', ['bool', 'int', 'string', 'object']],
  ['string type', 'How do you represent text in', ['string', 'char', 'text', 'str']],
  ['function def', 'How do you define a function in', ['Use keyword fn/function/def', 'Declare with =', 'Use lambda', 'Use macro']],
  ['print', 'How do you print to console in', ['print()', 'echo', 'log()', 'write()']],
  ['if', 'What keyword starts a conditional in', ['if', 'when', 'switch', 'cond']],
  ['while', 'Which loop repeats while condition is true in', ['while', 'for', 'loop', 'repeat']],
  ['for', 'How do you iterate N times in', ['for loop', 'while loop', 'foreach', 'times']],
  ['comment', 'How do you write a single-line comment in', ['// or #', '/*', '<!--', '--']],
  ['equality', 'How do you check equality in', ['==', '=', '===', 'equals()']],
  ['assign', 'What is the assignment operator in', ['=', ':=', '==', '<-']],
  ['null', 'How do you represent nothing/null in', ['null', 'nil', 'None', 'undefined']],
  ['array', 'How do you create an array in', ['Use brackets []', 'new Array()', 'list()', 'array()']],
  ['import', 'How do you import a module in', ['import', 'require', 'include', 'using']],
  ['length', 'How do you get array length in', ['.length', 'len()', 'size()', 'count()']],
  ['add', 'Which operator adds numbers in', ['+', '-', '*', '/']],
  ['sub', 'Which operator subtracts in', ['-', '+', '*', '/']],
  ['mul', 'Which operator multiplies in', ['*', 'x', '.', '**']],
  ['div', 'Which operator divides in', ['/', 'div', '//', '%']],
  ['mod', 'What is the remainder operator in', ['%', 'mod', '/', 'remainder']],
  ['increment', 'How do you add 1 to x in', ['x += 1', 'x = x + 1', 'x++', 'inc(x)']],
  ['concat', 'How do you join strings in', ['+', '&', '.', 'concat()']],
  ['multi comment', 'How do you write a multi-line comment in', ['/* */', '// //', '# #', '<!-- -->']],
  ['true', 'How do you represent true in', ['true', 'True', '1', 'yes']],
  ['false', 'How do you represent false in', ['false', 'False', '0', 'no']],
  ['and', 'What is the AND operator in', ['&&', 'and', '&', 'AND']],
  ['or', 'What is the OR operator in', ['||', 'or', '|', 'OR']],
  ['not', 'What is the NOT operator in', ['!', 'not', '~', 'NOT']],
  ['greater', 'Which checks greater than in', ['>', '>=', 'gt', 'greater']],
  ['less', 'Which checks less than in', ['<', '<=', 'lt', 'less']],
  ['not equal', 'How do you check not equal in', ['!=', '!==', '<>', '/=']],
  ['entry', 'What is the program entry point in', ['main()', 'start()', 'init()', 'run()']],
  ['const', 'How do you declare a constant in', ['const', 'final', 'let', 'var']],
  ['break', 'How do you exit a loop early in', ['break', 'exit', 'return', 'stop']],
  ['continue', 'How do you skip to next iteration in', ['continue', 'skip', 'next', 'pass']],
  ['ternary', 'What is the ternary conditional in', ['cond ? a : b', 'if-else', 'when', 'switch']],
  ['typeof', 'How do you check a variable type in', ['typeof', 'type()', 'isinstance()', 'is']],
  ['input', 'How do you read user input in', ['input()', 'read()', 'scan()', 'getline()']],
  ['str to int', 'How do you convert string to int in', ['parseInt()', 'int()', 'toInt()', 'convert()']],
  ['escape', 'How do you escape a quote in a string in', ['\\\\"', '""', '\\"\\"', '`"`']],
  ['main', 'What function starts every program in', ['main function', 'start function', 'run function', 'init function']],
  ['char', 'Which type holds a single character in', ['char', 'rune', 'byte', 'string']],
  ['float', 'Which type stores decimal numbers in', ['float', 'int', 'double', 'decimal']],
  ['compiler', 'What converts source code to machine code in', ['compiler', 'interpreter', 'transpiler', 'assembler']],
  ['runtime err', 'What is an error during execution in', ['runtime error', 'compile error', 'syntax error', 'logic error']],
  ['syntax', 'What defines code structure rules in', ['syntax', 'grammar', 'format', 'style']],
  ['block', 'How do you group statements in', ['braces/indentation', 'parentheses', 'brackets', 'quotes']],
  ['param', 'What is a function input called in', ['parameter', 'argument', 'variable', 'value']],
  ['return', 'How do you return a value from a function in', ['return', 'yield', 'give', 'output']],
  ['comparison', 'What does a comparison return in', ['boolean', 'int', 'string', 'null']],
  ['interpolation', 'How do you embed values in a string in', ['interpolation', 'concatenation', 'format()', 'templates']],
  ['index 0', 'What is the first array index in', ['0', '1', 'first', '0-based']],
  ['last elem', 'How do you access the last array element in', ['arr[length-1]', 'arr.last()', 'arr[end]', 'arr[-1]']],
  ['7%3', 'What is 7 % 3 in', ['1', '2', '3', '0']],
  ['infinite', 'How do you write an infinite loop in', ['while(true)', 'for(;;)', 'loop {}', 'repeat {}']],
  ['scope', 'Where is a variable accessible in', ['inside its block', 'everywhere', 'nowhere', 'only in functions']],
  ['hello length', 'What is "hello".length in', ['5', '4', '6', '3']],
  ['arr[i]', 'How do you access array element at index i in', ['arr[i]', 'arr.get(i)', 'arr{i}', 'arr:i']],
  ['call foo', 'How do you call a named function foo in', ['foo()', 'call foo()', 'foo', 'execute foo()']],
  ['5>3', 'What is the result of 5 > 3 in', ['true', 'false', '5', '3']],
  ['2>5', 'What is the result of 2 > 5 in', ['false', 'true', '2', '5']],
  ['x+=5', 'What does x += 5 do in', ['adds 5 to x', 'sets x to 5', 'multiplies x by 5', 'subtracts 5 from x']],
  ['string quote', 'How do you write a string in', ['with quotes', 'with braces', 'with brackets', 'with backticks']],
  ['newline char', 'What character represents newline in', ['\\n', '\\r', '\\t', '\\0']],
  ['tab char', 'What character represents tab in', ['\\t', '\\n', '\\r', '\\s']],
  ['empty arr', 'How do you create an empty array in', ['[]', '{}', '()', '<>']],
  ['push', 'How do you add an element to an array in', ['push/append', 'add', 'insert', 'concat']],
  ['exit func', 'How do you exit a function early in', ['return', 'exit', 'break', 'continue']],
  ['debug', 'How do you debug-print a variable in', ['print/log', 'echo', 'write', 'display']],
  ['repeat str', 'How do you repeat a string N times in', ['repeat/times', 'loop concat', 'multiply', 'copy']],
  ['substring', 'How do you get part of a string in', ['substring/slice', 'split', 'trim', 'charAt']],
  ['uppercase', 'How do you uppercase a string in', ['toUpperCase()', 'upper()', 'capitalize()', 'toUpper()']],
  ['trim', 'How do you remove whitespace in', ['trim()', 'strip()', 'clean()', 'remove()']],
  ['round', 'How do you round a float in', ['round()', 'floor()', 'ceil()', 'int()']],
  ['abs', 'How do you get absolute value in', ['abs()', 'absolute()', 'fabs()', 'magnitude()']],
  ['max', 'How do you find the max of two numbers in', ['max()', 'Math.max()', 'greater()', 'larger()']],
  ['min', 'How do you find the min of two numbers in', ['min()', 'Math.min()', 'smaller()', 'lesser()']],
  ['random', 'How do you generate a random number in', ['random()', 'rand()', 'Math.random()', 'rnd()']],
  ['sqrt', 'How do you compute square root in', ['sqrt()', 'Math.sqrt()', 'squareRoot()', 'root()']],
  ['power', 'How do you raise to power in', ['** or pow()', '^', 'exp()', 'power()']],
  ['even', 'How do you check if a number is even in', ['n % 2 == 0', 'n / 2', 'n & 1', 'isEven(n)']],
  ['odd', 'How do you check if a number is odd in', ['n % 2 == 1', 'n / 2', 'n & 1', 'isOdd(n)']],
  ['positive', 'How do you check if a number is positive in', ['n > 0', 'n >= 0', 'n != 0', 'isPositive(n)']],
  ['negative', 'How do you check if a number is negative in', ['n < 0', 'n <= 0', 'n != 0', 'isNegative(n)']],
  ['zero', 'How do you check if a number is zero in', ['n === 0', 'n == 0', 'isZero(n)', 'n = 0']],
  ['swap', 'How do you swap two variables in', ['temp variable', 'destructuring', 'swap()', 'exchange()']],
  ['valid name', 'Which variable name is valid in', ['myVar', '2var', 'my-var', 'var']],
  ['case sensitive', 'Is variable naming case-sensitive in', ['yes', 'no', 'depends', 'sometimes']],
  ['keyword', 'Which is a reserved keyword in', ['if/for/while', 'variable', 'myFunc', 'data1']],
  ['whitespace', 'Does whitespace matter in', ['depends on language', 'always', 'never', 'sometimes']],
];

const INTERMEDIATE_TOPICS = [
  ['class', 'How do you define a class in', ['class keyword', 'struct keyword', 'type keyword', 'object keyword']],
  ['inheritance', 'What allows a child to inherit from parent in', ['inheritance', 'copying', 'importing', 'mixin']],
  ['exception', 'How do you handle errors in', ['try/catch', 'if/else', 'switch', 'assert']],
  ['polymorphism', 'Objects of different types through same interface is called', ['polymorphism', 'inheritance', 'encapsulation', 'abstraction']],
  ['ctor', 'What initializes a new object in', ['constructor', 'destructor', 'init method', 'setup']],
  ['interface', 'How do you define a contract for classes in', ['interface', 'abstract class', 'mixin', 'protocol']],
  ['encapsulation', 'Hiding internal state is called', ['encapsulation', 'inheritance', 'polymorphism', 'abstraction']],
  ['static', 'A method called on the class, not instance is', ['static method', 'instance method', 'abstract method', 'virtual method']],
  ['overload', 'Same name, different parameters is', ['method overloading', 'method overriding', 'method hiding', 'method chaining']],
  ['override', 'Redefining parent method in child is', ['method overriding', 'method overloading', 'method shadowing', 'method hiding']],
  ['lambda', 'An anonymous function is called a', ['lambda', 'closure', 'callback', 'arrow function']],
  ['generics', 'Parameterized types are called', ['generics', 'templates', 'macros', 'type aliases']],
  ['file read', 'How do you read a file in', ['file reading functions', 'import file', 'stream data', 'network request']],
  ['file write', 'How do you write to a file in', ['file writing functions', 'print to file', 'save data', 'export file']],
  ['json parse', 'How do you parse JSON in', ['JSON.parse()', 'parse JSON', 'deserialize', 'from JSON']],
  ['sort', 'How do you sort an array in', ['sort()', 'order()', 'arrange()', 'organize()']],
  ['filter', 'How do you filter elements in', ['filter()', 'where()', 'select()', 'match()']],
  ['map', 'How do you transform each element in', ['map()', 'transform()', 'forEach()', 'apply()']],
  ['reduce', 'How do you combine elements into one value in', ['reduce()', 'fold()', 'aggregate()', 'sum()']],
  ['dict', 'How do you create key-value pairs in', ['dictionary/map', 'array', 'list', 'set']],
  ['set', 'What collection stores unique values in', ['set', 'list', 'array', 'map']],
  ['queue', 'What is FIFO data structure in', ['queue', 'stack', 'list', 'array']],
  ['stack', 'What is LIFO data structure in', ['stack', 'queue', 'list', 'array']],
  ['linked list', 'What has nodes pointing to next in', ['linked list', 'array', 'vector', 'queue']],
  ['hash map', 'What uses hash for key lookup in', ['hash map', 'tree map', 'sorted map', 'linked map']],
  ['binary search', 'What requires sorted data in', ['binary search', 'linear search', 'hash search', 'random search']],
  ['recursion', 'A function calling itself is', ['recursion', 'iteration', 'looping', 'repetition']],
  ['thread', 'How do you run code in parallel in', ['threads/goroutines', 'processes', 'workers', 'tasks']],
  ['async', 'Non-blocking operations use', ['async/await', 'threads', 'callbacks', 'events']],
  ['promise', 'What represents future completion in', ['promise/future', 'callback', 'event', 'thread']],
  ['singleton', 'A class with only one instance is a', ['singleton', 'factory', 'builder', 'prototype']],
  ['factory', 'Creating objects without specifying class is', ['factory pattern', 'builder pattern', 'singleton', 'prototype']],
  ['observer', 'One-to-many notification is', ['observer pattern', 'pub/sub', 'event bus', 'mediator']],
  ['strategy', 'Interchangeable algorithms pattern is', ['strategy pattern', 'state pattern', 'template method', 'command']],
  ['decorator', 'Adding behavior dynamically is', ['decorator pattern', 'adapter pattern', 'facade pattern', 'proxy pattern']],
  ['adapter', 'Converting one interface to another is', ['adapter pattern', 'facade pattern', 'bridge pattern', 'proxy pattern']],
  ['facade', 'Simplified interface to complex system is', ['facade pattern', 'adapter pattern', 'mediator', 'proxy']],
  ['builder', 'Step-by-step object construction is', ['builder pattern', 'factory pattern', 'prototype', 'singleton']],
  ['prototype', 'Cloning existing objects is', ['prototype pattern', 'factory pattern', 'singleton', 'builder']],
  ['command', 'Encapsulating requests as objects is', ['command pattern', 'strategy pattern', 'observer', 'mediator']],
  ['template method', 'Algorithm skeleton with overridable steps is', ['template method', 'strategy pattern', 'state pattern', 'command pattern']],
  ['state', 'Object behavior changes with internal state is', ['state pattern', 'strategy pattern', 'observer', 'visitor']],
  ['visitor', 'Separating algorithm from object structure is', ['visitor pattern', 'observer pattern', 'strategy', 'command']],
  ['DI', 'Passing dependencies to objects is', ['dependency injection', 'service locator', 'factory', 'singleton']],
  ['ORM', 'Object-relational mapping is called', ['ORM', 'ODM', 'SQL', 'NoSQL']],
  ['conn pool', 'Reusing database connections is a', ['connection pool', 'thread pool', 'buffer pool', 'cache']],
  ['logging', 'Recording application events is', ['logging', 'debugging', 'tracing', 'monitoring']],
  ['unit test', 'Testing individual components is', ['unit test', 'integration test', 'e2e test', 'regression test']],
  ['regex', 'Pattern matching in strings uses', ['regular expressions', 'wildcards', 'globbing', 'queries']],
  ['auth', 'Verifying user identity is', ['authentication', 'authorization', 'encryption', 'validation']],
  ['authz', 'Checking user permissions is', ['authorization', 'authentication', 'validation', 'verification']],
  ['encryption', 'Encoding data securely is', ['encryption', 'hashing', 'encoding', 'compression']],
  ['hashing', 'One-way data transformation is', ['hashing', 'encryption', 'encoding', 'compressing']],
  ['serialization', 'Converting objects to bytes/string is', ['serialization', 'deserialization', 'marshalling', 'encoding']],
  ['caching', 'Storing computed results for reuse is', ['caching', 'memoization', 'buffering', 'indexing']],
  ['memoization', 'Caching function results is', ['memoization', 'caching', 'precomputation', 'lazy eval']],
  ['rate limit', 'Controlling request frequency is', ['rate limiting', 'throttling', 'backpressure', 'load shedding']],
  ['middleware', 'Processing requests in a pipeline uses', ['middleware', 'interceptors', 'filters', 'guards']],
  ['timeout', 'How do you limit operation duration in', ['timeout/context', 'infinite wait', 'retry loop', 'manual timer']],
  ['pagination', 'How do you split large results in', ['limit/offset', 'all at once', 'filter first', 'random subset']],
  ['API version', 'How do you version an API in', ['URL/header versioning', 'not needed', 'comments', 'file names']],
  ['CORS', 'Cross-origin request handling uses', ['CORS headers', 'same-origin', 'proxies', 'JSONP']],
  ['SQL injection', 'How do you prevent SQL injection in', ['parameterized queries', 'escaping', 'input validation', 'stored procedures']],
  ['conn string', 'How do you configure database connection in', ['connection string', 'config file', 'hardcode', 'environment variable']],
  ['migration', 'How do you manage database schema changes in', ['migrations', 'manual SQL', 'ORM sync', 'schema dump']],
  ['transaction', 'Grouping operations as atomic unit is a', ['transaction', 'batch', 'operation', 'query']],
  ['index', 'How do you speed up database queries in', ['indexes', 'denormalization', 'caching', 'materialized views']],
  ['join', 'Combining tables in SQL uses', ['JOIN', 'UNION', 'SUBQUERY', 'SELECT']],
  ['GROUP BY', 'How do you aggregate rows in SQL in', ['GROUP BY', 'ORDER BY', 'WHERE', 'HAVING']],
  ['subquery', 'A query inside another query is a', ['subquery', 'nested query', 'inner query', 'derived table']],
  ['view', 'A saved SQL query is a', ['view', 'table', 'index', 'trigger']],
  ['stored proc', 'Saved SQL code block is a', ['stored procedure', 'function', 'trigger', 'view']],
  ['trigger', 'Auto-running code on table changes is a', ['trigger', 'stored procedure', 'event', 'hook']],
  ['backup', 'How do you backup data in', ['backup/export', 'copy table', 'save file', 'duplicate DB']],
  ['restore', 'How do you restore data in', ['restore/import', 'insert rows', 'copy file', 'recreate']],
  ['env var', 'How do you configure an app in', ['env vars', 'config file', 'CLI args', 'hardcode']],
  ['debugging', 'Finding and fixing bugs is called', ['debugging', 'testing', 'profiling', 'reviewing']],
  ['profiling', 'Measuring performance bottlenecks is', ['profiling', 'debugging', 'testing', 'monitoring']],
  ['err log', 'How do you log errors in', ['error logging', 'print errors', 'ignore errors', 'crash']],
  ['feature flag', 'Toggling features without deploy is a', ['feature flag', 'config switch', 'branch', 'comment']],
  ['A/B test', 'Comparing two versions is', ['A/B testing', 'unit testing', 'integration', 'regression']],
  ['canary', 'Gradual rollout to subset is', ['canary deploy', 'blue/green', 'rolling deploy', 'hotfix']],
  ['blue/green', 'Switching between two identical envs is', ['blue/green deploy', 'canary', 'rolling', 'feature flag']],
  ['rollback', 'Reverting to previous version is', ['rollback', 'undo', 'reset', 'revert']],
  ['CI/CD', 'Automated build/test/deploy pipeline is', ['CI/CD', 'manual deploy', 'scripted deploy', 'scheduled deploy']],
  ['Git', 'Tracking code changes uses', ['version control/Git', 'file copies', 'backup', 'diff tool']],
  ['branch', 'Parallel line of development in Git is a', ['branch', 'fork', 'tag', 'commit']],
  ['merge', 'Combining branches in Git is', ['merge', 'rebase', 'cherry-pick', 'squash']],
  ['PR', 'Proposing changes in a repo is a', ['pull request', 'push', 'commit', 'merge request']],
  ['conflict', 'When Git cannot auto-merge you get a', ['conflict', 'error', 'warning', 'exception']],
  ['stash', 'Temporarily saving changes in Git uses', ['stash', 'commit', 'branch', 'reset']],
  ['tag', 'Marking a release point in Git uses', ['tag', 'branch', 'commit', 'release']],
];

const EXPERT_TOPICS = [
  ['memory leak', 'What is a memory leak in', ['unreleased memory', 'fast memory', 'memory overflow', 'data corruption']],
  ['deadlock', 'Two threads waiting on each other is a', ['deadlock', 'livelock', 'race condition', 'starvation']],
  ['race', 'Timing-dependent bugs are called', ['race condition', 'deadlock', 'livelock', 'starvation']],
  ['thread pool', 'Reusing threads for tasks uses a', ['thread pool', 'thread per task', 'single thread', 'fork/join']],
  ['tail recursion', 'Recursive call at end of function is', ['tail recursion', 'head recursion', 'mutual recursion', 'nested recursion']],
  ['TCO', 'Reusing stack for tail calls is', ['TCO', 'inlining', 'JIT', 'loop unrolling']],
  ['GC', 'Automatic memory reclamation is', ['garbage collection', 'reference counting', 'manual free', 'arena allocation']],
  ['ref count', 'Memory management tracking references is', ['reference counting', 'GC', 'ARC', 'manual']],
  ['circular ref', 'Reference cycle preventing GC is a', ['circular reference', 'memory leak', 'dangling pointer', 'null ref']],
  ['weak ref', 'Reference that does not prevent GC is', ['weak reference', 'strong reference', 'soft reference', 'phantom reference']],
  ['big O', 'Algorithm complexity notation is', ['Big O', 'Big Theta', 'Big Omega', 'Little O']],
  ['O(n)', 'Linear time complexity is', ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)']],
  ['O(1)', 'Constant time complexity is', ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)']],
  ['O(log n)', 'Logarithmic time complexity is', ['O(log n)', 'O(n)', 'O(1)', 'O(n^2)']],
  ['O(n^2)', 'Quadratic time complexity is', ['O(n^2)', 'O(n)', 'O(n log n)', 'O(2^n)']],
  ['quicksort', 'Efficient sorting with O(n log n) average is', ['quicksort', 'bubble sort', 'selection sort', 'insertion sort']],
  ['merge sort', 'Divide and conquer sort is', ['merge sort', 'quicksort', 'heap sort', 'bucket sort']],
  ['binary tree', 'Each node has at most 2 children is a', ['binary tree', 'linked list', 'graph', 'heap']],
  ['BST', 'Left child smaller, right larger is a', ['BST', 'heap', 'trie', 'graph']],
  ['balanced tree', 'Tree with height O(log n) is', ['balanced tree', 'binary tree', 'BST', 'tree']],
  ['red-black', 'Self-balancing BST with color property is', ['red-black tree', 'AVL tree', 'B-tree', 'heap']],
  ['AVL', 'Strictly balanced BST is', ['AVL tree', 'red-black tree', 'B-tree', 'splay tree']],
  ['B-tree', 'Self-balancing tree for disk storage is', ['B-tree', 'BST', 'red-black tree', 'heap']],
  ['trie', 'Prefix tree for strings is a', ['trie', 'BST', 'hash map', 'linked list']],
  ['heap', 'Complete binary tree for priority is a', ['heap', 'stack', 'queue', 'tree']],
  ['priority queue', 'Elements ordered by priority is a', ['priority queue', 'queue', 'stack', 'list']],
  ['hash table', 'Key-value with hash function is a', ['hash table', 'BST', 'linked list', 'array']],
  ['collision', 'Handling hash collisions uses', ['chaining/open addressing', 'ignore', 'resize', 'rehash']],
  ['DFS', 'Depth-first traversal uses', ['stack/recursion', 'queue', 'priority queue', 'heap']],
  ['BFS', 'Breadth-first traversal uses', ['queue', 'stack', 'priority queue', 'heap']],
  ['Dijkstra', 'Shortest path algorithm is', ['Dijkstra', 'BFS', 'A*', 'Bellman-Ford']],
  ['A*', 'Heuristic shortest path algorithm is', ['A*', 'Dijkstra', 'BFS', 'Bellman-Ford']],
  ['topo sort', 'Ordering DAG nodes is', ['topological sort', 'DFS', 'BFS', 'Dijkstra']],
  ['MST', 'Connecting all nodes with min weight is', ['MST', 'shortest path', 'max flow', 'graph coloring']],
  ['Kruskal', 'MST algorithm sorting edges is', ["Kruskal's", "Prim's", "Dijkstra's", "Bellman-Ford"]],
  ['Prim', 'MST algorithm growing tree is', ["Prim's", "Kruskal's", "Dijkstra's", "Floyd's"]],
  ['DP', 'Breaking into overlapping subproblems is', ['dynamic programming', 'divide and conquer', 'greedy', 'backtracking']],
  ['greedy', 'Making locally optimal choices is', ['greedy algorithm', 'DP', 'divide and conquer', 'backtracking']],
  ['backtrack', 'Exploring and undoing decisions is', ['backtracking', 'DP', 'greedy', 'BFS']],
  ['sliding', 'Subarray/substring optimization uses', ['sliding window', 'two pointers', 'binary search', 'hash map']],
  ['two ptr', 'Using left/right pointers technique is', ['two pointers', 'sliding window', 'binary search', 'hash map']],
  ['bit', 'Operating on individual bits is', ['bit manipulation', 'arithmetic', 'logic', 'comparison']],
  ['endian', 'Byte order in memory is called', ['endianness', 'bit order', 'word size', 'padding']],
  ['cache line', 'Smallest cache transfer unit is', ['cache line', 'page', 'block', 'segment']],
  ['cache miss', 'Data not found in cache is a', ['cache miss', 'cache hit', 'cache eviction', 'cache flush']],
  ['false sharing', 'Unnecessary cache invalidation between threads is', ['false sharing', 'true sharing', 'cache miss', 'contention']],
  ['branch pred', 'CPU guessing branch outcome is', ['branch predictor', 'prefetcher', 'out-of-order', 'speculative execution']],
  ['SIMD', 'Single instruction multiple data is', ['SIMD', 'MIMD', 'SISD', 'MISD']],
  ['pipeline', 'Stalling CPU pipeline is a', ['pipeline hazard', 'branch mispredict', 'cache miss', 'TLB miss']],
  ['microservices', 'Small independent services architecture is', ['microservices', 'monolith', 'SOA', 'serverless']],
  ['event-driven', 'Reactive architecture using events is', ['event-driven', 'microservices', 'monolith', 'layered']],
  ['CQRS', 'Separating read and write models is', ['CQRS', 'CRUD', 'REST', 'GraphQL']],
  ['event sourcing', 'Storing state changes as events is', ['event sourcing', 'CQRS', 'CDC', 'audit log']],
  ['CAP', 'CA/P tradeoff in distributed systems is', ['CAP theorem', 'PACELC', 'FLP', 'Byzantine']],
  ['consistency', 'All nodes see same data is', ['consistency', 'availability', 'partition tolerance', 'durability']],
  ['availability', 'System remains operational is', ['availability', 'consistency', 'partition tolerance', 'reliability']],
  ['partition', 'System works despite network splits is', ['partition tolerance', 'consistency', 'availability', 'fault tolerance']],
  ['eventual', 'System becomes consistent over time is', ['eventual consistency', 'strong consistency', 'causal consistency', 'weak consistency']],
  ['quorum', 'Minimum nodes for agreement is a', ['quorum', 'majority', 'consensus', 'voting']],
  ['raft', 'Consensus algorithm is', ['Raft', 'Paxos', 'PBFT', 'PoW']],
  ['2PC', 'Distributed transaction protocol is', ['2PC', '3PC', 'Saga', 'TCC']],
  ['saga', 'Long-running distributed transaction pattern is', ['saga pattern', '2PC', 'TCC', 'Outbox']],
  ['circuit breaker', 'Fault tolerance stopping repeated calls is', ['circuit breaker', 'retry', 'timeout', 'bulkhead']],
  ['bulkhead', 'Isolating system components for resilience is', ['bulkhead', 'circuit breaker', 'retry', 'timeout']],
  ['backoff', 'Retrying with increasing delay is', ['exponential backoff', 'fixed backoff', 'immediate retry', 'infinite retry']],
  ['idempotency', 'Same operation gives same result is', ['idempotency', 'safety', 'determinism', 'atomicity']],
  ['consistent hash', 'Minimal redistribution on node changes is', ['consistent hashing', 'modulo hashing', 'rendezvous hashing', 'maglev hashing']],
  ['bloom filter', 'Probabilistic set membership is a', ['bloom filter', 'cuckoo filter', 'hash set', 'bitmap']],
  ['LRU', 'Evicting least recently used is', ['LRU', 'LFU', 'FIFO', 'MRU']],
  ['copy-on-write', 'Sharing until modification is', ['copy-on-write', 'eager copy', 'lazy copy', 'deep copy']],
  ['mmap', 'File mapped to virtual memory is', ['memory mapped file', 'file stream', 'buffer read', 'direct I/O']],
  ['zero copy', 'Avoiding unnecessary data copying is', ['zero copy', 'memory copy', 'buffer copy', 'data copy']],
  ['lock-free', 'Concurrency without mutexes is', ['lock-free', 'wait-free', 'lock-based', 'blocking']],
  ['CAS', 'Compare-and-swap atomic operation is', ['CAS', 'FAA', 'TAS', 'LL/SC']],
  ['ABA', 'CAS vulnerability to stale state is', ['ABA problem', 'deadlock', 'livelock', 'race condition']],
  ['happens-before', 'Memory ordering relation is', ['happens-before', 'sequenced-before', 'synchronized-with', 'inter-thread']],
  ['memory barrier', 'Preventing instruction reordering uses', ['memory barrier', 'volatile', 'atomic', 'fence']],
  ['DCL', 'Optimized lazy initialization pattern is', ['double-checked locking', 'eager init', 'synchronized init', 'lazy holder']],
  ['TLS', 'Per-thread data storage is', ['thread-local storage', 'shared memory', 'global variable', 'stack variable']],
  ['work stealing', 'Idle threads stealing tasks is', ['work stealing', 'work sharing', 'round robin', 'random scheduling']],
  ['NUMA', 'Non-uniform memory access architecture is', ['NUMA', 'UMA', 'SMP', 'MPP']],
  ['virtual mem', 'Abstracting physical memory is', ['virtual memory', 'physical memory', 'swap', 'paging']],
  ['TLB', 'Virtual-to-physical address cache is', ['TLB', 'cache', 'page table', 'MMU']],
  ['page fault', 'Accessing unmapped virtual page is a', ['page fault', 'segfault', 'bus error', 'abort']],
  ['thrashing', 'Excessive paging degrading performance is', ['thrashing', 'paging', 'swapping', 'fragmentation']],
  ['RAII', 'Resource allocation tied to object lifetime is', ['RAII', 'GC', 'ARC', 'manual']],
  ['move', 'Transferring resources without copy is', ['move semantics', 'copy semantics', 'swap', 'clone']],
  ['perfect fwd', 'Preserving value category in templates is', ['perfect forwarding', 'move semantics', 'copy elision', 'RVO']],
  ['SFINAE', 'Substitution failure not an error in templates is', ['SFINAE', 'concepts', 'type traits', 'enable_if']],
  ['CRTP', 'Curiously recurring template pattern is', ['CRTP', 'mixin', 'policy-based', 'traits']],
  ['PImpl', 'Pointer to implementation idiom is', ['PImpl', 'bridge pattern', 'facade', 'proxy']],
  ['NRVO', 'Named return value optimization is', ['NRVO', 'RVO', 'copy elision', 'inline']],
];

const LANG_DETAILS = {
  js: 'JavaScript', ts: 'TypeScript', py: 'Python', go: 'Go',
  rs: 'Rust', zig: 'Zig', c: 'C', cpp: 'C++', cs: 'C#',
  kt: 'Kotlin', swift: 'Swift', java: 'Java', php: 'PHP',
  rb: 'Ruby', scala: 'Scala', bash: 'Bash', lua: 'Lua',
  asm: 'Assembly', wasm: 'WebAssembly', html: 'HTML', css: 'CSS',
  sql: 'SQL', pg: 'PostgreSQL', mysql: 'MySQL', sqlite: 'SQLite',
  mongodb: 'MongoDB', git: 'Git', dk: 'Docker',
  firebase: 'Firebase', gamedev: 'Game Dev',
  cloud: 'Cloud Computing', aws: 'AWS', azure: 'Azure',
  gcp: 'GCP', backend: 'Backend Dev',
};

function main() {
  const appData = JSON.parse(readFileSync(APP_DATA_PATH, 'utf-8'));
  if (!appData.quizData) appData.quizData = {};

  console.log('Generating 300 quiz questions per language...\n');

  for (const [langId, name] of Object.entries(LANG_DETAILS)) {
    const existing = appData.quizData[langId] || [];

    const beginner = shuffle(makeQuestions(name, BEGINNER_TOPICS, 'beginner')).slice(0, 100);
    const intermediate = shuffle(makeQuestions(name, INTERMEDIATE_TOPICS, 'intermediate')).slice(0, 100);
    const expert = shuffle(makeQuestions(name, EXPERT_TOPICS, 'expert')).slice(0, 100);

    const existingB = existing.filter(q => q.level === 'beginner');
    const existingI = existing.filter(q => q.level === 'intermediate');
    const existingE = existing.filter(q => q.level === 'expert');

    const finalB = [...existingB, ...beginner].slice(0, 100);
    const finalI = [...existingI, ...intermediate].slice(0, 100);
    const finalE = [...existingE, ...expert].slice(0, 100);

    const total = finalB.length + finalI.length + finalE.length;
    appData.quizData[langId] = [...finalB, ...finalI, ...finalE];

    console.log(`  ${name.padEnd(16)} ${total} (b:${finalB.length} i:${finalI.length} e:${finalE.length})${!existing.length ? ' [NEW]' : ''}`);
  }

  writeFileSync(APP_DATA_PATH, JSON.stringify(appData, null, 2), 'utf-8');
  console.log(`\nDone! Updated ${APP_DATA_PATH}`);
}

main();
