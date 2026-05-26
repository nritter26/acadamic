const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const files = [
  'public/game.js',
  'public/techstack.js',
  'public/git-visualize.js',
  'public/schema-tutorial.js',
  'public/schema.js',
  'public/db.js',
  'public/langConfig.js',
  'public/compiler-core.js',
  'public/ai/core.js',
];

for (const file of files) {
  const fp = path.join(ROOT, file);
  let src = fs.readFileSync(fp, 'utf-8');

  // Fix: "} }// comment" → "}\n}// comment"
  // This happens when a const declaration ends with `}` and our
  // comment was placed right after the previous line's content.
  src = src.replace(/(\})\/\//g, '}\n//');
  src = src.replace(/(\w)\/\//g, '$1\n//');
  src = src.replace(/(\n\/\/.*?)(\n\/\/ \w)/g, '$1$2');
  // Remove duplicate blank lines
  src = src.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(fp, src, 'utf-8');
  console.log(`Fixed: ${file}`);
}
console.log('Done.');
