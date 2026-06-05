"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANG_TOPICS = exports.NAME_TO_LANG = exports.LANG_NAMES = void 0;
// LANG_NAMES extracted to content/app-data.json (browser) or content/app-data.json (Node)
// Fallback for Node.js server-side usage where LANG_NAMES isn't a global
if (typeof LANG_NAMES === 'undefined') {
    try {
        var fs = require('fs');
        var path = require('path');
        var appDataPath = path.join(__dirname, '..', 'content', 'app-data.json');
        var appData = JSON.parse(fs.readFileSync(appDataPath, 'utf-8'));
        var LANG_NAMES = appData.LANG_NAMES || {};
        exports.LANG_NAMES = LANG_NAMES;
    }
    catch (e) {
        var LANG_NAMES = {};
        exports.LANG_NAMES = LANG_NAMES;
    }
}
const NAME_TO_LANG = {};
exports.NAME_TO_LANG = NAME_TO_LANG;
for (const [code, name] of Object.entries(LANG_NAMES)) {
    NAME_TO_LANG[name] = code;
}
const LANG_TOPICS = {};
exports.LANG_TOPICS = LANG_TOPICS;
for (const code of Object.keys(LANG_NAMES)) {
    LANG_TOPICS[code] = {};
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANG_NAMES, NAME_TO_LANG, LANG_TOPICS };
}
//# sourceMappingURL=langConfig.js.map