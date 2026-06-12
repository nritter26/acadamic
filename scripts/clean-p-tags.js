/**
 * Scan all curriculum JSON files and remove <p> tags from exp fields.
 * The exp field content should not have wrapping <p> tags.
 * 
 * Usage: node scripts/clean-p-tags.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.resolve(__dirname, '..', 'backend', 'content');

function removePTags(str) {
  if (typeof str !== 'string') return str;
  // Replace </p> with newline to preserve paragraph breaks, remove <p>
  // <p>text</p> -> text
  // <p>First.</p><p>Second.</p> -> First.\nSecond.
  // CSS uses white-space: pre-wrap so \n renders as line breaks
  return str
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .trim();
}

function walkAndClean(obj, path_ = '') {
  if (typeof obj === 'string') {
    return obj; // We handle strings at the key level
  }
  if (Array.isArray(obj)) {
    return obj.map((item, i) => walkAndClean(item, `${path_}[${i}]`));
  }
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'exp' && typeof value === 'string') {
        const cleaned_val = removePTags(value);
        if (cleaned_val !== value) {
          console.log(`  [${path_}] exp: removed <p> tags`);
        }
        cleaned[key] = cleaned_val;
      } else if (key === 'code' && typeof value === 'string') {
        // Also clean code fields if they have <p> tags
        cleaned[key] = removePTags(value);
      } else {
        cleaned[key] = walkAndClean(value, `${path_}.${key}`);
      }
    }
    return cleaned;
  }
  return obj;
}

function main() {
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  let modifiedCount = 0;
  let totalFiles = 0;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const original = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
      data = JSON.parse(original);
    } catch (e) {
      console.error(`  SKIP ${file}: invalid JSON`);
      continue;
    }

    const cleaned = walkAndClean(data);
    const output = JSON.stringify(cleaned, null, 2) + '\n';

    if (output !== original) {
      fs.writeFileSync(filePath, output);
      modifiedCount++;
      console.log(`✓ ${file}: cleaned`);
    }
    totalFiles++;
  }

  console.log(`\nDone! Scanned ${totalFiles} files, cleaned ${modifiedCount} files.`);
}

main();
