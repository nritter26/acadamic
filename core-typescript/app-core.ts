// @ts-nocheck

// Import from langConfig for consistency
type TopicEntry = any;
type CourseData = Record<string, any>;
type TopicDepth = { icon: string; label: string };

declare const courseData: CourseData;
declare const google: any;
declare function hideCompletions(): void;
declare function updateHighlight(): void;
declare function suggestNextTopic(): void;
declare function updateAIContext(): void;
declare function filterTopics(query: string): void;
declare function getTopicDepth(exp: string): TopicDepth;
declare function escapeHtml(value: string): string;
declare function renderTopicList(lang: string, prefixHtml?: string): void;
declare function updateAISuggestions(): void;
declare function loadLangIntro(lang: string): void;
declare const challengeData: Record<string, any>;
declare let challengeLang: string;
declare let challengeIdx: number;
declare const cheatsheets: Record<string, any>;

var currentLang: string = 'js';
var currentPhase: string = '';
var currentTopic: string = '';
let currentLevel: string = 'all';
let currentCompletionFilter: string = 'all';
let currentEngineFilter: string = 'all';
let currentMobilePlatform: string = 'all';
let collapsedPhases: Set<string> = new Set();

const DEVIN_MAINTENANCE: boolean = false;

const LANG_KEYWORDS: Record<string, string[]> = {
    js: ['let', 'const', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'null', 'undefined', 'true', 'false', 'console.log', 'console.error', 'Array', 'Object', 'Promise', 'Map', 'Set', 'Number', 'String', 'Boolean', 'Symbol', 'Date', 'RegExp', 'JSON', 'Math', 'parseInt', 'parseFloat', 'setTimeout', 'setInterval', 'addEventListener', 'querySelector', 'document', 'window'],
    ts: ['let', 'const', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'interface', 'type', 'enum', 'class', 'extends', 'implements', 'abstract', 'private', 'protected', 'public', 'readonly', 'static', 'as', 'is', 'keyof', 'typeof', 'Record', 'Partial', 'Required', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'async', 'await', 'import', 'export', 'from', 'null', 'undefined', 'true', 'false', 'string', 'number', 'boolean', 'any', 'void', 'never', 'unknown'],
    py: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'try', 'except', 'finally', 'raise', 'import', 'from', 'as', 'class', 'with', 'open', 'pass', 'None', 'True', 'False', 'in', 'not', 'and', 'or', 'is', 'lambda', 'yield', 'async', 'await', 'self', 'print', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'reduce', 'any', 'all', 'sum', 'min', 'max', 'abs', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'super', 'property', 'staticmethod', 'classmethod'],
    go: ['func', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'go', 'defer', 'select', 'chan', 'map', 'struct', 'interface', 'type', 'package', 'import', 'var', 'const', 'nil', 'true', 'false', 'make', 'new', 'append', 'len', 'cap', 'error', 'string', 'int', 'bool', 'float64', 'float32', 'byte', 'rune', 'int64', 'int32', 'uint', 'uint64', 'slice', 'Println', 'Printf', 'Sprintf', 'Fprintf'],
    rs: ['fn', 'let', 'mut', 'const', 'if', 'else', 'for', 'while', 'loop', 'match', 'return', 'struct', 'enum', 'trait', 'impl', 'type', 'pub', 'use', 'mod', 'crate', 'self', 'super', 'where', 'as', 'in', 'ref', 'move', 'async', 'await', 'unsafe', 'Some', 'None', 'Ok', 'Err', 'Result', 'Option', 'true', 'false', 'String', 'Vec', 'println!', 'format!', 'print!', 'vec!', 'match', 'if let', 'while let', 'Box', 'Rc', 'Arc', 'Cell', 'RefCell', 'HashMap', 'HashSet', 'Iterator', 'Clone', 'Copy', 'Debug', 'Display', 'PartialEq', 'Eq', 'PartialOrd', 'Ord'],
    zig: ['fn', 'var', 'const', 'if', 'else', 'for', 'while', 'switch', 'return', 'struct', 'enum', 'union', 'comptime', 'pub', 'usingnamespace', 'test', 'defer', 'errdefer', 'try', 'catch', 'null', 'undefined', 'true', 'false', 'allocator', 'std', 'print', 'ArrayList', 'HashMap', 'AutoHashMap', 'StringHashMap', 'Arraylist', 'Allocator', 'arena', 'page_allocator', 'heap', 'fmt', 'log', 'debug', 'panic'],
    c: ['int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned', 'signed', 'struct', 'union', 'enum', 'typedef', 'const', 'static', 'extern', 'volatile', 'register', 'auto', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'goto', 'sizeof', 'NULL', 'printf', 'scanf', 'malloc', 'calloc', 'realloc', 'free', 'FILE', 'fopen', 'fclose', 'fread', 'fwrite', 'fprintf', 'fscanf', 'fgets', 'fputs', 'fgetc', 'fputc', 'feof', 'ferror', '#include', '#define', '#ifdef', '#ifndef', '#endif', '#pragma', 'main'],
    cpp: ['int', 'char', 'float', 'double', 'void', 'bool', 'long', 'short', 'unsigned', 'signed', 'struct', 'class', 'enum', 'typedef', 'const', 'static', 'extern', 'virtual', 'override', 'final', 'private', 'protected', 'public', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'new', 'delete', 'this', 'namespace', 'using', 'template', 'typename', '#include', '#define', '#ifdef', '#ifndef', '#endif', 'auto', 'nullptr', 'true', 'false', 'std', 'cout', 'cin', 'vector', 'string', 'map', 'set', 'shared_ptr', 'unique_ptr', 'make_shared', 'make_unique', 'pair', 'tuple', 'array', 'list', 'forward_list', 'deque', 'unordered_map', 'unordered_set', 'stack', 'queue', 'priority_queue', 'fstream', 'ifstream', 'ofstream', 'stringstream'],
    cs: ['class', 'struct', 'interface', 'enum', 'record', 'namespace', 'using', 'public', 'private', 'protected', 'internal', 'static', 'readonly', 'virtual', 'override', 'abstract', 'sealed', 'async', 'await', 'var', 'int', 'string', 'bool', 'float', 'double', 'void', 'char', 'object', 'null', 'true', 'false', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'base', 'is', 'as', 'typeof', 'sizeof', 'nameof', 'get', 'set', 'value', 'yield', 'Console.WriteLine', 'Console.Write', 'Console.ReadLine', 'Console.ReadKey', 'Console.Clear', 'var', 'List', 'Dictionary', 'HashSet', 'IEnumerable', 'IQueryable', 'Task', 'async', 'await', 'HttpClient', 'JsonSerializer', 'StringBuilder', 'Regex', 'DateTime', 'TimeSpan', 'Guid', 'Path', 'File', 'Directory', 'StreamReader', 'StreamWriter'],
    kt: ['fun', 'val', 'var', 'if', 'else', 'when', 'for', 'while', 'do', 'return', 'class', 'data', 'object', 'companion', 'interface', 'enum', 'sealed', 'open', 'abstract', 'override', 'private', 'protected', 'public', 'internal', 'inline', 'suspend', 'import', 'package', 'null', 'true', 'false', 'this', 'super', 'is', 'as', 'in', 'out', 'reified', 'crossinline', 'noinline', 'vararg', 'by', 'delegate', 'get', 'set', 'init', 'constructor', 'Unit', 'Any', 'Nothing', 'String', 'Int', 'Boolean', 'List', 'Map', 'Set', 'MutableList', 'arrayOf', 'listOf', 'mapOf', 'setOf', 'mutableListOf', 'println', 'print', 'readLine', 'filter', 'map', 'forEach', 'flatMap', 'groupBy', 'sortedBy', 'distinct', 'reduce', 'fold', 'let', 'apply', 'run', 'with', 'also', 'takeIf', 'takeUnless', 'repeat', 'require', 'check', 'error'],
    swift: ['var', 'let', 'func', 'return', 'if', 'else', 'guard', 'for', 'while', 'repeat', 'switch', 'case', 'default', 'break', 'continue', 'fallthrough', 'class', 'struct', 'enum', 'protocol', 'extension', 'init', 'deinit', 'subscript', 'mutating', 'nonmutating', 'static', 'class', 'override', 'convenience', 'required', 'public', 'private', 'internal', 'fileprivate', 'open', 'import', 'nil', 'true', 'false', 'self', 'super', 'in', 'is', 'as', 'try', 'catch', 'throw', 'throws', 'rethrows', 'async', 'await', 'actor', 'nonisolated', 'isolated', 'String', 'Int', 'Double', 'Bool', 'Array', 'Dictionary', 'Set', 'Optional', 'print', 'debugPrint', 'map', 'filter', 'reduce', 'compactMap', 'flatMap', 'forEach', 'sorted', 'first', 'last', 'count', 'isEmpty', 'append', 'remove', 'insert', 'contains'],
    pg: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'EXISTS', 'ANY', 'ALL', 'SOME', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'TRUE', 'FALSE', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'GREATEST', 'LEAST', 'NOW', 'CURRENT_DATE', 'EXTRACT', 'DATE_TRUNC', 'TO_CHAR', 'TO_DATE', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'OVER', 'PARTITION', 'WINDOW', 'WITH', 'RECURSIVE', 'RETURNING', 'SERIAL', 'BIGSERIAL', 'VARCHAR', 'TEXT', 'INTEGER', 'BIGINT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSONB', 'UUID', 'DECIMAL', 'FLOAT', 'ENUM', 'ARRAY', 'NUMERIC'],
    dk: ['FROM', 'RUN', 'CMD', 'ENTRYPOINT', 'WORKDIR', 'COPY', 'ADD', 'ENV', 'ARG', 'EXPOSE', 'VOLUME', 'LABEL', 'MAINTAINER', 'USER', 'SHELL', 'HEALTHCHECK', 'ONBUILD', 'STOPSIGNAL', 'docker', 'build', 'run', 'exec', 'ps', 'images', 'pull', 'push', 'login', 'logout', 'tag', 'rm', 'rmi', 'logs', 'inspect', 'network', 'volume', 'compose', 'docker-compose', 'up', 'down', 'start', 'stop', 'restart', 'kill', 'pause', 'unpause', 'commit', 'save', 'load', 'export', 'import', 'cp', 'diff', 'events', 'port', 'top', 'version', 'info', 'system', 'prune', 'container', 'image', 'service', 'stack', 'swarm', 'secret', 'config', 'node', 'plugin', 'trust'],
    git: ['git', 'init', 'clone', 'add', 'commit', 'push', 'pull', 'fetch', 'merge', 'rebase', 'branch', 'checkout', 'switch', 'restore', 'stash', 'log', 'diff', 'status', 'reset', 'revert', 'cherry-pick', 'tag', 'remote', 'config', 'help', 'rm', 'mv', 'clean', 'gc', 'fsck', 'bisect', 'blame', 'grep', 'show', 'shortlog', 'describe', 'archive', 'bundle', 'worktree', 'submodule', 'notes', 'reflog', 'format-patch', 'am', 'apply', 'range-diff', 'sparse-checkout', 'main', 'master', 'origin', 'HEAD', '--force', '--hard', '--soft', '--mixed', '--amend', '--no-ff', '--abort', '--continue', '--skip', '--all', '--oneline', '--graph', '--decorate', '--author', '--since', '--until', '--grep'],
    mongodb: ['db', 'use', 'show', 'createCollection', 'insertOne', 'insertMany', 'find', 'findOne', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'aggregate', 'countDocuments', 'estimatedDocumentCount', 'distinct', 'sort', 'limit', 'skip', 'project', 'lookup', 'group', 'match', 'project', 'unwind', 'addFields', 'bucket', 'replaceRoot', 'out', 'merge', 'collStats', 'indexStats', 'createIndex', 'dropIndex', 'getIndexes', 'drop', 'renameCollection', 'bulkWrite', 'watch', 'mapReduce', 'cloneCollection', 'copyTo', 'convertToCapped', 'ObjectId', 'ISODate', 'NumberInt', 'NumberLong', 'NumberDecimal', 'Timestamp', 'RegExp', 'MinKey', 'MaxKey', 'null', 'true', 'false', '$match', '$group', '$sort', '$project', '$lookup', '$unwind', '$addFields', '$bucket', '$replaceRoot', '$out', '$merge', '$count', '$limit', '$skip', '$sample'],
    gamedev: ['Vector2', 'Vector3', 'Transform', 'Quaternion', 'Matrix4x4', 'GameObject', 'Component', 'MonoBehaviour', 'Start', 'Update', 'FixedUpdate', 'LateUpdate', 'Awake', 'OnEnable', 'OnDisable', 'OnDestroy', 'Instantiate', 'Destroy', 'Find', 'GetComponent', 'AddComponent', 'transform', 'position', 'rotation', 'scale', 'Translate', 'Rotate', 'LookAt', 'Input', 'GetKey', 'GetKeyDown', 'GetKeyUp', 'GetAxis', 'GetButton', 'GetButtonDown', 'Rigidbody', 'Collider', 'Collision', 'Trigger', 'Raycast', 'Physics', 'OverlapSphere', 'SceneManager', 'LoadScene', 'Application', 'Quit', 'OpenURL', 'Time', 'deltaTime', 'time', 'timeScale', 'Mathf', 'Random', 'Range', 'Lerp', 'SmoothDamp', 'Color', 'Material', 'Mesh', 'Renderer', 'Animation', 'Animator', 'AudioSource', 'AudioClip', 'Play', 'Stop', 'ParticleSystem', 'Camera', 'Screen', 'Cursor', 'ScreenToWorldPoint', 'WorldToScreenPoint', 'Debug', 'Log', 'DrawRay', 'DrawLine', 'Gizmos', 'Physics2D', 'Collider2D', 'Rigidbody2D'],
    bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'in', 'case', 'esac', 'select', 'function', 'return', 'local', 'export', 'readonly', 'unset', 'exit', 'break', 'continue', 'declare', 'typeset', 'echo', 'printf', 'read', 'source', '.', 'exec', 'eval', 'set', 'unset', 'shift', 'trap', 'kill', 'test', '[', ']', '[[', ']]', 'true', 'false', 'cd', 'pwd', 'ls', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'cat', 'less', 'more', 'head', 'tail', 'grep', 'sed', 'awk', 'cut', 'sort', 'uniq', 'wc', 'find', 'xargs', 'tee', 'chmod', 'chown', 'chgrp', 'ps', 'top', 'kill', 'jobs', 'bg', 'fg', 'nohup', 'disown', 'crontab', 'at', 'curl', 'wget', 'ssh', 'scp', 'rsync'],
    php: ['echo', 'print', 'printf', 'var_dump', 'print_r', 'die', 'exit', 'return', 'include', 'include_once', 'require', 'require_once', 'if', 'else', 'elseif', 'endif', 'for', 'endforeach', 'while', 'endwhile', 'foreach', 'foreach', 'do', 'switch', 'endswitch', 'case', 'break', 'continue', 'match', 'default', 'function', 'fn', 'use', 'return', 'class', 'interface', 'trait', 'enum', 'abstract', 'final', 'extends', 'implements', 'new', 'clone', 'self', 'parent', 'static', 'public', 'private', 'protected', 'readonly', 'const', 'var', 'global', 'declare', 'strict_types', 'namespace', 'use', 'as', 'instanceof', 'throw', 'try', 'catch', 'finally', 'null', 'true', 'false', 'array', 'list', 'isset', 'unset', 'empty', 'count', 'implode', 'explode', 'array_map', 'array_filter', 'array_reduce', 'array_merge', 'array_keys', 'array_values', 'in_array', 'strlen', 'strpos', 'substr', 'str_replace', 'preg_match', 'preg_replace', 'htmlspecialchars', 'json_encode', 'json_decode', 'file_get_contents', 'file_put_contents', 'fopen', 'fclose', 'fgets', 'fwrite', 'mkdir', 'rmdir', 'unlink', 'copy', 'rename', 'move_uploaded_file', 'session_start', 'session_destroy', 'setcookie', 'filter_var', 'filter_input', 'header', 'mail', 'date', 'time', 'strtotime', 'define', 'defined'],
    rb: ['def', 'end', 'if', 'else', 'elsif', 'unless', 'case', 'when', 'while', 'until', 'for', 'in', 'do', 'begin', 'rescue', 'ensure', 'raise', 'throw', 'catch', 'return', 'yield', 'class', 'module', 'include', 'extend', 'prepend', 'attr_reader', 'attr_writer', 'attr_accessor', 'private', 'protected', 'public', 'self', 'super', 'true', 'false', 'nil', 'puts', 'print', 'gets', 'chomp', 'require', 'load', 'new', 'initialize', 'each', 'map', 'select', 'reject', 'reduce', 'inject', 'filter', 'times', 'upto', 'downto', 'step', 'lambda', 'proc', 'Proc', 'block_given?', 'defined?', 'alias', 'undef', 'BEGIN', 'END', '__FILE__', '__LINE__', 'Array', 'Hash', 'String', 'Integer', 'Float', 'Symbol', 'Range', 'Enumerable', 'Comparable', 'Object', 'Kernel', 'BasicObject', 'Numeric'],
    scala: ['def', 'val', 'var', 'lazy', 'if', 'else', 'match', 'case', 'for', 'yield', 'while', 'do', 'return', 'class', 'object', 'trait', 'extends', 'with', 'sealed', 'abstract', 'case', 'implicit', 'implicitly', 'override', 'private', 'protected', 'public', 'final', 'import', 'package', 'type', 'new', 'this', 'super', 'null', 'true', 'false', 'Unit', 'Int', 'Double', 'Float', 'Long', 'Boolean', 'Char', 'Short', 'Byte', 'String', 'Any', 'AnyVal', 'AnyRef', 'Nothing', 'Nil', 'None', 'Some', 'Option', 'Either', 'Try', 'Future', 'Promise', 'List', 'Map', 'Set', 'Seq', 'Array', 'Vector', 'Range', 'Tuple', 'println', 'print', 'printf', 'readLine', 'Map', 'flatMap', 'filter', 'foreach', 'fold', 'foldLeft', 'foldRight', 'reduce', 'collect', 'partition', 'groupBy', 'sortBy', 'sortWith', 'sorted', 'zip', 'mkString'],
};

// LANG_NAMES defined here for browser use (langConfig.js loaded separately for Node.js exports)


function normalizeCourseData() {
    for (const lang of Object.keys(courseData)) {
        const langData = courseData[lang];
        if (!langData || typeof langData !== 'object') continue;
        for (const phase of Object.keys(langData)) {
            const phaseData = langData[phase];
            if (!phaseData || typeof phaseData !== 'object') continue;
            for (const topic of Object.keys(phaseData)) {
                const item = phaseData[topic];
                if (Array.isArray(item)) {
                    phaseData[topic] = {
                        exp: item[0],
                        code: item[1],
                        ...(item.length > 2 && { prereq: item[2] }),
                    };
                }
            }
        }
    }
}
normalizeCourseData();

const LANG_TO_FILE = {
    rs: 'rust',
    wasm: 'wasm',
    asm: 'asm',
};
const LOADING_LANGS: Set<string> = new Set();

let _curriculumData: CourseData | null = null;
let _curriculumLoading: boolean = false;
const _curriculumLoaders: Array<() => void> = [];

function loadLangData(lang: string, callback?: () => void): boolean {
    if (courseData[lang]) {
        if (callback) callback();
        return true;
    }
    var filename = (LANG_TO_FILE[lang] || lang) + '.json';
    fetch('content/' + filename)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
            courseData[lang] = data;
            normalizeCourseData();
            if (callback) callback();
        })
        .catch(function (err) {
            console.error('Failed to load data for', lang + ':', err);
            if (callback) callback();
        });
    return false;
}





function loadTopic(phase: string, topic: string): void {
    currentPhase = phase;
    currentTopic = topic;
    hideCompletions();
    const langData = courseData[currentLang];
    if (!langData || !langData[phase] || !langData[phase][topic]) {
        document.getElementById('output').innerText = "// Topic not found: " + topic;
        return;
    }
    const item = langData[phase][topic];
    document.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active-topic'));
    const btnId = 'btn-' + topic.replace(/\s/g, '').replace(/[&,]/g, '');
    const btn = document.getElementById(btnId) as HTMLElement | null;
    if (btn) {
        btn.classList.add('active-topic');
        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const expEl = document.getElementById('explanation') as HTMLElement;
    const depth = getTopicDepth(item.exp);
    const safeTopic = escapeHtml(topic);
    const safePhase = escapeHtml(phase);
    expEl.innerHTML = `<h3 style="margin:0; color:#fff">${safeTopic}</h3><p style="color:#94a3b8; font-size:11px; margin-bottom:10px;">${safePhase} <span style="font-size:9px;color:#64748b;margin-left:8px;">${depth.icon} ${depth.label}</span></p>${protectCode(item.exp)}`;
    if (item.prereq) {
        const parts = item.prereq.split('::');
        if (parts.length === 2) {
            const [prereqPhase, prereqTopic] = parts;
            const prereqData = langData[prereqPhase] && langData[prereqPhase][prereqTopic];
            if (prereqData) {
                const safePP = escapeHtml(prereqPhase).replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const safePT = escapeHtml(prereqTopic).replace(/'/g, "\\'").replace(/"/g, '&quot;');
                expEl.innerHTML = `<div class="prereq-banner">📚 Prerequisite: <a href="#" onclick="loadTopic('${safePP}', '${safePT}'); return false;">${escapeHtml(prereqTopic)}</a></div>` + expEl.innerHTML;
            }
        }
    }
    expEl.classList.remove('fade-in');
    void expEl.offsetWidth;
    expEl.classList.add('fade-in');
    
    (document.getElementById('editor') as HTMLTextAreaElement).value = item.code;
    updateHighlight();
    (document.getElementById('output') as HTMLElement).innerText = "// Ready to practice: " + topic + " — click the cheatsheet button for reference";
    setTimeout(suggestNextTopic, 100);
    updateAIContext();
    setTimeout(triggerGTranslate, 50);
}

let filterDebounceTimer: ReturnType<typeof setTimeout> | undefined;
function debounceFilterTopics(query: string): void {
    clearTimeout(filterDebounceTimer);
    filterDebounceTimer = setTimeout(() => filterTopics(query), 200);
}

function protectCode(html: string): string {
    return html.replace(/`([^`]+)`/g, '<code class="notranslate">$1</code>');
}

function triggerGTranslate(): void {
    try {
        if (typeof google !== 'undefined' && google.translate && google.translate.TranslateElement) {
            var teCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
            if (teCombo && teCombo.value && teCombo.value !== 'en') {
                teCombo.dispatchEvent(new Event('change'));
            }
        }
    } catch(e) {}
}

function renderLevelBar(): void {
    const levelBarEl = document.getElementById('level-bar') as HTMLElement;
    const levels = [
        { id: 'all', label: 'All' },
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'expert', label: 'Expert' },
    ];
    let html = '';
    for (const l of levels) {
        const active = l.id === currentLevel ? ' active' : '';
        html += `<button class="level-btn${active}" onclick="setLevel('${l.id}')">${l.label}</button>`;
    }
    html += `<span style="flex:1"></span>`;
    html += `<button class="level-btn${currentCompletionFilter === 'all' ? ' active' : ''}" onclick="setCompletionFilter('all')">All</button>`;
    html += `<button class="level-btn${currentCompletionFilter === 'uncompleted' ? ' active' : ''}" onclick="setCompletionFilter('uncompleted')">Todo</button>`;
    html += `<button class="level-btn${currentCompletionFilter === 'completed' ? ' active' : ''}" onclick="setCompletionFilter('completed')">Done</button>`;
    levelBarEl.innerHTML = html;
    levelBarEl.style.display = 'flex';
}

function setLevel(level: string): void {
    currentLevel = level;
    renderLevelBar();
    const searchInput = document.getElementById('topic-search') as HTMLInputElement | null;
    filterTopics(searchInput ? searchInput.value : '');
}

function renderEngineBar(): void {
    const engineBarEl = document.getElementById('engine-bar') as HTMLElement;
    const engines = [
        { id: 'all', label: 'Game Development' },
        { id: 'godot', label: 'Godot' },
        { id: 'unity', label: 'Unity' },
        { id: 'unreal', label: 'Unreal' },
    ];
    let html = '';
    for (const e of engines) {
        const active = e.id === currentEngineFilter ? ' active' : '';
        html += `<button class="engine-btn${active}" onclick="setEngineFilter('${e.id}')">${e.label}</button>`;
    }
    engineBarEl.innerHTML = html;
    engineBarEl.style.display = 'flex';
}

function setEngineFilter(engine: string): void {
    currentEngineFilter = engine;
    renderEngineBar();
    const searchInput = document.getElementById('topic-search') as HTMLInputElement | null;
    if (searchInput) searchInput.value = '';
    
    const appEl = document.getElementById('app') as HTMLElement;
    const platformBar = document.getElementById('platform-bar') as HTMLElement | null;

    if (engine === 'all') {
        currentLang = 'gamedev';
        appEl.className = 'gamedev-mode';
        if (platformBar) platformBar.style.display = 'none';
        renderTopicList('gamedev');
        updateAISuggestions();
        loadLangIntro('gamedev');
    } else {
        currentLang = engine;
        appEl.className = engine + '-mode';
        if (platformBar) platformBar.style.display = 'none';
        if (!courseData[engine]) {
            loadLangData(engine, function () {
                renderTopicList(engine);
                updateAISuggestions();
                loadLangIntro(engine);
            });
        } else {
            renderTopicList(engine);
            updateAISuggestions();
            loadLangIntro(engine);
        }
    }
}

function renderPlatformBar() {
    const bar = document.getElementById('platform-bar') as HTMLElement;
    const platforms = [
        { id: 'android', label: 'Android' },
        { id: 'ios', label: 'iOS' },
    ];
    let html = '';
    for (const p of platforms) {
        const active = p.id === currentMobilePlatform ? ' active' : '';
        html += `<button class="platform-btn${active}" data-platform="${p.id}" onclick="setPlatform('${p.id}')">${p.label}</button>`;
    }
    bar.innerHTML = html;
    bar.style.display = 'flex';
}

function setPlatform(platform) {
    currentMobilePlatform = platform;
    renderPlatformBar();
    if (currentLang === 'mobile') {
        renderTopicList('mobile');
        var data = courseData['mobile'];
        if (data) {
            var phases = Object.keys(data);
            if (phases.length > 0) {
                var phase = phases[0];
                var topics = Object.keys(data[phase]);
                if (topics.length > 0) loadTopic(phase, topics[0]);
            }
        }
        var searchInput = document.getElementById('topic-search') as HTMLInputElement | null;
        filterTopics(searchInput ? searchInput.value : '');
    } else {
        loadLangIntro(platform);
        var searchInput = document.getElementById('topic-search') as HTMLInputElement | null;
        filterTopics(searchInput ? searchInput.value : '');
    }
}

function toggleCheatsheet() {
    const overlay = document.getElementById('cheatsheetOverlay');
    const wasOpen = overlay.classList.contains('open');
    overlay.classList.toggle('open');
    if (wasOpen) setTimeout(() => document.getElementById('editor').focus(), 50);
}

function loadCheatsheet() {
    if (currentLang === 'challenge') {
        const challenges = challengeData[challengeLang] || [];
        const ch = challenges[challengeIdx];
        if (ch && ch.solution) {
            (document.getElementById('editor') as HTMLTextAreaElement).value = ch.solution;
            updateHighlight();
            (document.getElementById('output') as HTMLElement).innerText = '// Answer revealed for: ' + ch.title;
            return;
        }
    }

    const csData = cheatsheets && cheatsheets[currentLang];
    if (csData && Object.keys(csData).length > 0) {
        let html = '';
        let idx = 0;
        for (const section of Object.keys(csData)) {
            const snippets = csData[section];
            html += `<div class="cs-section">`;
            html += `<div class="cs-section-title">${section}</div>`;
            for (const code of snippets) {
                const codeHtml = code
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
                    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await|new|this|typeof|throw|try|catch|switch|case|break|continue|true|false|null|undefined)\b/g, '<span class="keyword">$1</span>');
                html += `<div class="cs-code notranslate">${codeHtml}</div>`;
                idx++;
            }
            html += `</div>`;
        }
        document.getElementById('cheatsheetTitle').textContent = `${currentLang.toUpperCase()} Cheatsheet (${idx} snippets)`;
        document.getElementById('cheatsheetBody').innerHTML = html;
        toggleCheatsheet();
        setTimeout(triggerGTranslate, 50);
        return;
    }

    const langData = courseData[currentLang];
    if (!langData || Object.keys(langData).length === 0) {
        document.getElementById('output').innerText = "// Cheatsheet unavailable for " + currentLang.toUpperCase();
        return;
    }

    let html = '';
    let idx = 0;
    for (const phase of Object.keys(langData)) {
        const topics = langData[phase];
        const isActivePhase = phase === currentPhase;
        html += `<div class="cs-section">`;
        html += `<div class="cs-section-title">${phase}</div>`;
        for (const name of Object.keys(topics)) {
            const t = topics[name];
            const isActive = name === currentTopic && isActivePhase;
            const codeHtml = t.code
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
                .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await|new|this|typeof|throw|try|catch|switch|case|break|continue|true|false|null|undefined)\b/g, '<span class="keyword">$1</span>');
            html += `<div class="cs-code notranslate">${codeHtml}</div>`;
            idx++;
        }
        html += `</div>`;
    }

    document.getElementById('cheatsheetTitle').textContent = `${currentLang.toUpperCase()} Cheatsheet (${idx} snippets)`;
    document.getElementById('cheatsheetBody').innerHTML = html;
    toggleCheatsheet();
    setTimeout(triggerGTranslate, 50);
}
