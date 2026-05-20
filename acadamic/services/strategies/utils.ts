const LANG_NAMES: Record<string, string> = {
  js: 'javascript', py: 'python', go: 'golang', rs: 'rust',
  java: 'java', ts: 'typescript', rb: 'ruby', php: 'php',
  cpp: 'cpp', c: 'c', sql: 'sql', html: 'html', css: 'css',
};

export function detectLanguage(query: string): string | null {
  const words = query.toLowerCase().split(/\s+/);
  for (const word of words) {
    for (const [code, name] of Object.entries(LANG_NAMES)) {
      if (word === name || word === code) return code;
    }
    if (word === 'sql') return 'pg';
  }
  return null;
}
