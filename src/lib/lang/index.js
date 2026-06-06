const HASH_SEED = 42;

function hash(str) {
  let h = HASH_SEED;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function pick(arr, langId, gameId, index) {
  const idx = hash(langId + gameId + index) % arr.length;
  return arr[idx];
}

export function deterministicShuffle(arr, seed) {
  const a = [...arr];
  let s = hash(seed);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) | 0;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const GEN_LANG_IDS = {
  js: 'js', ts: 'ts', react: 'react', py: 'py', go: 'go', rs: 'rs',
  c: 'c', cs: 'cs', cpp: 'cpp', zig: 'zig',
  java: 'java', kt: 'kt', scala: 'scala',
  swift: 'swift', lua: 'lua',
  html: 'html', css: 'css', bash: 'bash', wasm: 'wasm',
  sql: 'sql', php: 'php', rb: 'rb',
  vue: 'vue', svelte: 'svelte',
  asm: 'asm',
};

export const LANG_NAMES = {
  asm: 'Assembly', html: 'HTML', css: 'CSS', bash: 'Bash',
  c: 'C', cs: 'C#', cpp: 'C++', sql: 'SQL', go: 'Go',
  java: 'Java', js: 'JavaScript', kt: 'Kotlin', lua: 'Lua',
  php: 'PHP', py: 'Python', rb: 'Ruby', rs: 'Rust',
  scala: 'Scala', swift: 'Swift', ts: 'TypeScript', wasm: 'WebAssembly',
  zig: 'Zig', react: 'React', vue: 'Vue', svelte: 'Svelte',
};
