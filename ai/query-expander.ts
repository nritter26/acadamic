const SYNONYM_MAP: Record<string, string[]> = {
  function: ['function', 'method', 'def', 'func'],
  variable: ['variable', 'var', 'let', 'const', 'declare'],
  loop: ['loop', 'for', 'while', 'iterate', 'foreach'],
  array: ['array', 'list', 'vector', 'slice', 'collection'],
  object: ['object', 'dictionary', 'map', 'hash', 'record'],
  string: ['string', 'text', 'char', 'str'],
  error: ['error', 'exception', 'throw', 'panic', 'bug', 'crash'],
  class: ['class', 'struct', 'type', 'object', 'oop'],
  async: ['async', 'await', 'promise', 'future', 'concurrent'],
  import: ['import', 'require', 'module', 'export', 'include'],
  database: ['database', 'sql', 'query', 'table', 'db', 'mongodb'],
  html: ['html', 'dom', 'element', 'tag', 'markup'],
  css: ['css', 'style', 'stylesheet', 'layout', 'flexbox', 'grid'],
  json: ['json', 'serialize', 'parse', 'object'],
  api: ['api', 'rest', 'endpoint', 'fetch', 'http', 'request'],
  test: ['test', 'testing', 'unit', 'assert', 'spec', 'jest', 'pytest'],
  git: ['git', 'commit', 'push', 'pull', 'branch', 'merge'],
  regex: ['regex', 'regular expression', 'pattern', 'match', 'replace'],
  recursion: ['recursion', 'recursive', 'base case', 'stack overflow'],
  closure: ['closure', 'scope', 'lexical', 'hoist', 'tdz'],
  pointer: ['pointer', 'reference', 'memory', 'address', 'dereference'],
  ai: ['ai', 'ml', 'machine learning', 'neural', 'deep learning', 'model'],
  llm: ['llm', 'large language model', 'gpt', 'transformer', 'tokenizer'],
  python: ['python', 'py', 'python3', 'django', 'flask', 'pandas'],
  javascript: ['javascript', 'js', 'node', 'nodejs', 'ecmascript', 'typescript'],
  typescript: ['typescript', 'ts', 'type annotation', 'interface', 'generic'],
  go: ['go', 'golang', 'goroutine', 'go language'],
  rust: ['rust', 'rustlang', 'cargo', 'ownership', 'borrow'],
};

const ADDITIONAL_TERMS: Record<string, string[]> = {
  syntax: ['syntax', 'grammar', 'parse error', 'compiler error'],
  performance: ['performance', 'optimize', 'fast', 'slow', 'bottleneck', 'profiling'],
  security: ['security', 'auth', 'authentication', 'encryption', 'hash', 'xss', 'csrf'],
  debugging: ['debug', 'debugging', 'step through', 'breakpoint', 'watch'],
  sorting: ['sort', 'sorting', 'order', 'ascending', 'descending', 'bubble', 'quick sort'],
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'out', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because',
  'and', 'but', 'or', 'if', 'while', 'about', 'up', 'what',
  'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'it', 'its', 'me', 'my', 'we', 'our', 'you', 'your', 'they',
  'them', 'their', 'he', 'she', 'his', 'her', 'him',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

export function expandQuery(query: string): string[] {
  const tokens = tokenize(query);
  const expansions = new Set<string>();
  for (const t of tokens) {
    expansions.add(t);
    if (SYNONYM_MAP[t]) for (const s of SYNONYM_MAP[t]) expansions.add(s);
  }
  const queryLower = query.toLowerCase();
  for (const [, terms] of Object.entries(ADDITIONAL_TERMS)) {
    for (const term of terms) {
      if (queryLower.includes(term)) {
        for (const s of terms) expansions.add(s);
      }
    }
  }
  return [...expansions];
}

export async function expandQueryWithLLM(
  query: string,
  lang?: string,
): Promise<string[]> {
  const keywordExpansion = expandQuery(query);
  try {
    const { askLLM } = await import('./provider');
    let prompt = `Given this programming question, suggest 3-5 search terms to find relevant documentation. Return only terms comma-separated, no explanation.\n\nQuestion: ${query}`;
    if (lang) prompt += `\nLanguage: ${lang}`;

    let llmResult = '';
    await askLLM(
      [{ role: 'user', content: prompt }],
      (chunk: string) => { llmResult += chunk; },
      {},
    );
    const llmTerms = llmResult
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 1);
    return [...new Set([...keywordExpansion, ...llmTerms])];
  } catch {
    return keywordExpansion;
  }
}
