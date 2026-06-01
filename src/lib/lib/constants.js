export const BACKEND_URL = '';

export const LANG_NAMES = {
  js: 'JavaScript', ts: 'TypeScript', py: 'Python', go: 'Go',
  rs: 'Rust', zig: 'Zig', c: 'C', cpp: 'C++', cs: 'C#',
  kt: 'Kotlin', swift: 'Swift', bash: 'Bash', php: 'PHP',
  rb: 'Ruby', lua: 'Lua', scala: 'Scala', java: 'Java',
  html: 'HTML', css: 'CSS', htmlcss: 'HTML/CSS',
  sql: 'SQL', pg: 'PostgreSQL', mysql: 'MySQL', mongodb: 'MongoDB',
  db: 'Database', dblab: 'DB Lab',
  git: 'Git', docker: 'Docker', gamedev: 'GameDev',
  wasm: 'WebAssembly', asm: 'Assembly',
  compiler: 'Compiler', game: 'Gaming', quiz: 'Quiz',
  challenge: 'Challenge', projects: 'Projects',
  tutorial: 'Tutorial', techstack: 'Tech Stack',
  styling: 'Styling Grounds', schema: 'Schema Designer',
  backend: 'Backend', cicd: 'CI/CD', mobile: 'Mobile',
  api: 'API Client',
};

export const MODE_SPECIAL = new Set([
  'compiler','game','quiz','challenge','dblab','projects','git',
  'styling','schema','tutorial','techstack','backend','mobile',
  'api','cicd','gamedev',
]);
