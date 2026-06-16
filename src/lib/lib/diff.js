export function computeDiff(original, transformed) {
  if (typeof original === 'string') original = original.split('\n');
  if (typeof transformed === 'string') transformed = transformed.split('\n');

  const result = [];
  const maxLen = Math.max(original.length, transformed.length);
  for (let i = 0; i < maxLen; i++) {
    const o = original[i];
    const t = transformed[i];
    if (o === undefined) {
      result.push({ type: 'add', line: t });
    } else if (t === undefined) {
      result.push({ type: 'remove', line: o });
    } else if (o !== t) {
      result.push({ type: 'remove', line: o });
      result.push({ type: 'add', line: t });
    } else {
      result.push({ type: 'keep', line: o });
    }
  }
  return result;
}
