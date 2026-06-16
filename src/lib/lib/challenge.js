export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function loadChallengeProgress() {
  try { return JSON.parse(localStorage.getItem('challenge_progress')) || {}; } catch { return {}; }
}

export function saveChallengeSolved(lang, idx) {
  const prog = loadChallengeProgress();
  prog[lang + '_' + idx] = true;
  localStorage.setItem('challenge_progress', JSON.stringify(prog));
}

export function isChallengeSolved(lang, idx) {
  return !!loadChallengeProgress()[lang + '_' + idx];
}

export function buildChallengeCode(userCode, tests) {
  return userCode + '\n' + tests.join('\n');
}

export function computeDiff(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const result = [];
  const maxLen = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= linesA.length) {
      result.push({ status: 'added', lineA: null, lineB: i, text: linesB[i] });
    } else if (i >= linesB.length) {
      result.push({ status: 'removed', lineA: i, lineB: null, text: linesA[i] });
    } else if (linesA[i] !== linesB[i]) {
      result.push({ status: 'removed', lineA: i, lineB: null, text: linesA[i] });
      result.push({ status: 'added', lineA: null, lineB: i, text: linesB[i] });
    }
  }
  return result;
}

export function formatDiff(diff) {
  let html = '<div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:4px;">Changes:</div>';
  for (const d of diff) {
    if (d.status === 'same') continue;
    const cls = d.status === 'added' ? 'diff-added' : 'diff-removed';
    const prefix = d.status === 'added' ? '+ ' : '- ';
    const num = d.status === 'added' ? d.lineB + 1 : d.lineA + 1;
    html += `<div class="diff-line ${cls}"><span class="diff-line-num">${num}</span>${prefix}${escapeHtml(d.text)}</div>`;
  }
  return html || '<div style="color:#64748b;font-size:10px;">No differences found</div>';
}

export const CHALLENGE_LANGS = ['js','py','go','ts','rs','swift','java','backend','c','cpp','cs','kt','zig','php','bash','rb','scala','html','css','lua','sql','wasm','asm'];

export const CHALLENGE_LANG_NAMES = {
  js:'JavaScript', py:'Python', go:'Go', ts:'TypeScript', rs:'Rust', swift:'Swift',
  java:'Java', backend:'Backend', c:'C', cpp:'C++', cs:'C#', kt:'Kotlin',
  zig:'Zig', php:'PHP', bash:'Bash', rb:'Ruby', scala:'Scala', html:'HTML', css:'CSS',
  lua:'Lua', sql:'SQL', wasm:'WebAssembly', asm:'Assembly'
};
