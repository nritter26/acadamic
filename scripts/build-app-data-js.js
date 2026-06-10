import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const JSON_FILE = path.join(ROOT, 'backend', 'content', 'app-data.json');
const JS_FILE = path.join(ROOT, 'public', 'app-data.js');

const rawJson = fs.readFileSync(JSON_FILE, 'utf-8');
JSON.parse(rawJson);

const escaped = rawJson
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'")
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

const code = `// ── App Data — All non-logic data extracted from source files ──
// This file is AUTO-GENERATED from content/app-data.json
// Do not edit directly. Run: node scripts/extract-app-data.js && node scripts/build-app-data-js.js

(function() {
  "use strict";

  var DATA = JSON.parse('${escaped}');

  function recompile(value) {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(recompile);
    if (value.__regex) return new RegExp(value.source, value.flags);
    if (value.__fn) {
      var body = value.body;
      if (body.indexOf("function") === 0 || body.indexOf("(") === 0 || body.indexOf("=>") !== -1) {
        try { return eval("(" + body + ")"); } catch(e) { return body; }
      }
      return body;
    }
    var obj = {};
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        obj[key] = recompile(value[key]);
      }
    }
    return obj;
  }

  var appData = recompile(DATA);

  // Set standard globals as window properties (accessible as bare names)
  for (var key in appData) {
    if (appData.hasOwnProperty(key)) {
      window[key] = appData[key];
    }
  }

  // Special: courseData__compiler → courseData.compiler
  // courseData is a global const from courseData.js — not accessible as window.courseData.
  // We need to reach the global scope directly. Use indirect eval for this.
  if (window.courseData__compiler) {
    try {
      // Access the global courseData const via indirect eval
      (0, eval)('courseData').compiler = window.courseData__compiler;
    } catch(e) {
      // Fallback: courseData doesn't exist, define on window
      window.courseData = { compiler: window.courseData__compiler };
    }
    delete window.courseData__compiler;
  }
})();
`;

fs.writeFileSync(JS_FILE, code, 'utf-8');
console.log(`Written to ${JS_FILE} (${(code.length / 1024 / 1024).toFixed(1)} MB)`);
