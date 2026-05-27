"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLanguage = detectLanguage;
const LANG_NAMES = {
    js: 'javascript', py: 'python', go: 'golang', rs: 'rust',
    java: 'java', ts: 'typescript', rb: 'ruby', php: 'php',
    cpp: 'cpp', c: 'c', sql: 'sql', html: 'html', css: 'css',
};
function detectLanguage(query) {
    const words = query.toLowerCase().split(/\s+/);
    for (const word of words) {
        for (const [code, name] of Object.entries(LANG_NAMES)) {
            if (word === name || word === code)
                return code;
        }
        if (word === 'sql')
            return 'pg';
    }
    return null;
}
//# sourceMappingURL=utils.js.map