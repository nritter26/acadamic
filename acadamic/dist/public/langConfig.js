"use strict";
const LANG_NAMES = {
    js: 'javascript', ts: 'typescript', py: 'python', go: 'go', java: 'java',
    rs: 'rust', c: 'c', cpp: 'c++', cs: 'c#', kt: 'kotlin',
    swift: 'swift', zig: 'zig', dk: 'docker', pg: 'postgresql',
    mongodb: 'mongodb', git: 'git', gamedev: 'gamedev',
    mysql: 'mysql', sqlite: 'sqlite', firebase: 'firebase',
    aws: 'aws', azure: 'azure', gcp: 'gcp', cloud: 'cloud',
    react: 'react', vue: 'vue', angular: 'angular', node: 'nodejs',
    express: 'express', next: 'nextjs', svelte: 'svelte', tailwind: 'tailwindcss',
    redis: 'redis', nuxt: 'nuxt', sveltekit: 'sveltekit', remix: 'remix',
    vite: 'vite', webpack: 'webpack', graphql: 'graphql', prisma: 'prisma',
    rnative: 'reactnative', flutter: 'flutter', cypress: 'cypress',
    playwright: 'playwright', k8s: 'kubernetes', terraform: 'terraform',
    godot: 'godot', unity: 'unity', unreal: 'unreal',
    mobile: 'mobile game development',
};
const NAME_TO_LANG = {};
for (const [code, name] of Object.entries(LANG_NAMES)) {
    NAME_TO_LANG[name] = code;
}
const LANG_TOPICS = {};
for (const code of Object.keys(LANG_NAMES)) {
    LANG_TOPICS[code] = {};
}
// Export for server-side use and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANG_NAMES, NAME_TO_LANG, LANG_TOPICS };
}
//# sourceMappingURL=langConfig.js.map