const TOKEN_TYPES_DEFAULT = { WHITESPACE: 'whitespace', COMMENT: 'comment', STRING: 'string', NUMBER: 'number', KEYWORD: 'keyword', IDENTIFIER: 'identifier', OPERATOR: 'operator', PUNCTUATION: 'punctuation', UNKNOWN: 'unknown' };
const TOKEN_COLORS_DEFAULT = { keyword: '#c084fc', identifier: '#e2e8f0', number: '#34d399', string: '#fbbf24', operator: '#f472b6', punctuation: '#64748b', comment: '#64748b', whitespace: 'transparent', unknown: '#ef4444' };
const LANG_CONFIG_DEFAULT = {
  js: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'", '`'] },
  ts: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'", '`'] },
  py: { lineComment: '#', blockComment: null, blockOpen: ':', blockClose: null, stmtTerm: '\n', indentBased: true, caseSensitive: true, strings: ['"', "'", '"""', "'''"] },
  go: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'", '`'] },
  rs: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  c: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  cpp: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  cs: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  kt: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'", '"""'] },
  swift: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  java: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  zig: { lineComment: '//', blockComment: null, blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  asm: { lineComment: ';', blockComment: null, blockOpen: null, blockClose: null, stmtTerm: '\n', indentBased: false, caseSensitive: false, strings: ['"', "'"] },
  php: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  bash: { lineComment: '#', blockComment: null, blockOpen: null, blockClose: null, stmtTerm: '\n', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  rb: { lineComment: '#', blockComment: ['=begin', '=end'], blockOpen: '{', blockClose: '}', stmtTerm: '\n', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  lua: { lineComment: '--', blockComment: ['--[[', ']]'], blockOpen: null, blockClose: null, stmtTerm: '\n', indentBased: false, caseSensitive: true, strings: ['"', "'"] },
  scala: { lineComment: '//', blockComment: ['/*', '*/'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true, strings: ['"', "'", '"""'] },
  wasm: { lineComment: ';;', blockComment: ['(;', ';)'], blockOpen: null, blockClose: null, stmtTerm: '\n', indentBased: false, caseSensitive: false, strings: ['"'] },
};

export function tokenize(code, lang, configs) {
  const cfg = (configs?.LANG_CONFIG || LANG_CONFIG_DEFAULT)[lang] || LANG_CONFIG_DEFAULT.js;
  const TT = configs?.TOKEN_TYPES || TOKEN_TYPES_DEFAULT;
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    if (/^\s/.test(code[i])) {
      let start = i;
      while (i < code.length && /^\s/.test(code[i])) i++;
      tokens.push({ type: TT.WHITESPACE, value: code.slice(start, i), pos: start });
      continue;
    }

    if (cfg.lineComment && code.slice(i, i + cfg.lineComment.length) === cfg.lineComment) {
      let start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ type: TT.COMMENT, value: code.slice(start, i), pos: start });
      continue;
    }

    if (cfg.blockComment && code.slice(i, i + cfg.blockComment[0].length) === cfg.blockComment[0]) {
      let start = i;
      i += cfg.blockComment[0].length;
      while (i < code.length && code.slice(i, i + cfg.blockComment[1].length) !== cfg.blockComment[1]) i++;
      if (i < code.length) i += cfg.blockComment[1].length;
      tokens.push({ type: TT.COMMENT, value: code.slice(start, i), pos: start });
      continue;
    }

    if (cfg.strings) {
      let matchedMulti = false;
      for (const delim of cfg.strings) {
        if (delim.length > 1 && code.slice(i, i + delim.length) === delim) {
          let start = i;
          i += delim.length;
          while (i < code.length && code.slice(i, i + delim.length) !== delim) {
            if (code[i] === '\\') i++;
            i++;
          }
          if (i < code.length) i += delim.length;
          tokens.push({ type: TT.STRING, value: code.slice(start, i), pos: start });
          matchedMulti = true;
          break;
        }
      }
      if (matchedMulti) continue;
    }

    if (cfg.strings && cfg.strings.some(s => s.length === 1 && code[i] === s)) {
      const quote = code[i];
      let start = i;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') i++;
        i++;
      }
      if (i < code.length) i++;
      tokens.push({ type: TT.STRING, value: code.slice(start, i), pos: start });
      continue;
    }

    if (/[0-9]/.test(code[i]) || (code[i] === '.' && i + 1 < code.length && /[0-9]/.test(code[i + 1]))) {
      let start = i;
      if (code[i] === '0' && i + 1 < code.length && /[xXbBoO]/.test(code[i + 1])) {
        i += 2;
        while (i < code.length && /[0-9a-fA-F]/.test(code[i])) i++;
      } else {
        while (i < code.length && /[0-9.]/.test(code[i])) i++;
        if (i < code.length && /[eE]/.test(code[i])) {
          i++;
          if (i < code.length && /[+-]/.test(code[i])) i++;
          while (i < code.length && /[0-9]/.test(code[i])) i++;
        }
      }
      tokens.push({ type: TT.NUMBER, value: code.slice(start, i), pos: start });
      continue;
    }

    if (i + 1 < code.length) {
      const twoChar = code.slice(i, i + 2);
      if (/^(==|!=|<=|>=|&&|\|\||<<|>>|\+\+|--|=>|::|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|->|\.\.)/.test(twoChar)) {
        tokens.push({ type: TT.OPERATOR, value: twoChar, pos: i });
        i += 2;
        continue;
      }
    }

    if (/[+\-*\/%=<>!&|^~?:.]/.test(code[i])) {
      tokens.push({ type: TT.OPERATOR, value: code[i], pos: i });
      i++;
      continue;
    }

    if (/[(){}\[\] ;,`]/.test(code[i])) {
      tokens.push({ type: TT.PUNCTUATION, value: code[i], pos: i });
      i++;
      continue;
    }

    if (/[a-zA-Z_$@#]/.test(code[i])) {
      let start = i;
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
      const word = code.slice(start, i);
      tokens.push({ type: TT.IDENTIFIER, value: word, pos: start });
      continue;
    }

    tokens.push({ type: TT.UNKNOWN, value: code[i], pos: i });
    i++;
  }

  return tokens;
}

export function buildAST(code, lang, tokens, configs) {
  const cfg = (configs?.LANG_CONFIG || LANG_CONFIG_DEFAULT)[lang] || LANG_CONFIG_DEFAULT.js;
  const cleanTokens = tokens.filter(t => t.type !== 'whitespace' && t.type !== 'comment');
  const root = { type: 'Program', children: [], depth: 0, pos: 0, lang };
  const stack = [root];
  let depth = 0;
  let i = 0;

  while (i < cleanTokens.length) {
    const tok = cleanTokens[i];
    const next = i + 1 < cleanTokens.length ? cleanTokens[i + 1] : null;

    if ((cfg.blockOpen && tok.value === cfg.blockOpen) || (lang === 'py' && tok.value === ':' && next && next.type === 'identifier')) {
      depth++;
      const block = { type: 'Block', children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(block);
      stack.push(block);
      i++;
      continue;
    }

    if (cfg.blockClose && tok.value === cfg.blockClose) {
      if (stack.length > 1) stack.pop();
      depth = Math.max(0, depth - 1);
      i++;
      continue;
    }

    if ((tok.value === 'function' || tok.value === 'def' || tok.value === 'func' || tok.value === 'fn') && next && next.type === 'identifier') {
      const funcNode = { type: 'FunctionDeclaration', name: next.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(funcNode);
      stack.push(funcNode);
      i += 2;
      continue;
    }
    if ((tok.value === 'function' || tok.value === 'def' || tok.value === 'func' || tok.value === 'fn') && next && next.value === '(') {
      const funcNode = { type: 'FunctionDeclaration', name: '(anonymous)', children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(funcNode);
      stack.push(funcNode);
      i++;
      continue;
    }

    if (tok.type === 'identifier' && next && next.value === '=>') {
      const arrow = { type: 'ArrowFunction', name: tok.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(arrow);
      stack.push(arrow);
      i += 2;
      continue;
    }

    if (tok.value === 'class' && next && next.type === 'identifier') {
      const cls = { type: 'ClassDeclaration', name: next.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(cls);
      stack.push(cls);
      i += 2;
      continue;
    }

    if ((tok.value === 'let' || tok.value === 'const' || tok.value === 'var' || tok.value === 'val' || tok.value === 'mut') && next && next.type === 'identifier') {
      const varDecl = { type: 'VariableDeclaration', name: next.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(varDecl);
      i += 2;
      continue;
    }

    if (['if', 'elif', 'else if', 'else', 'for', 'while', 'do', 'switch', 'match'].includes(tok.value)) {
      const ctrl = { type: 'ControlFlow', label: tok.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(ctrl);
      i++;
      continue;
    }

    if (tok.value === 'return' || tok.value === 'yield') {
      const ret = { type: tok.value === 'return' ? 'ReturnStatement' : 'YieldStatement', children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(ret);
      i++;
      continue;
    }

    if (['import', 'export', 'from', 'package', 'use', 'mod', '#include'].includes(tok.value)) {
      const imp = { type: 'ImportDeclaration', detail: tok.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(imp);
      i++;
      continue;
    }

    if (tok.value === 'try' || tok.value === 'catch' || tok.value === 'except' || tok.value === 'finally' || tok.value === 'defer') {
      const tc = { type: 'ErrorHandler', label: tok.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(tc);
      i++;
      continue;
    }

    if (tok.type === 'identifier' || tok.type === 'number' || tok.type === 'string') {
      const expr = { type: 'ExpressionStatement', value: tok.value, children: [], depth, pos: tok.pos, lang };
      stack[stack.length - 1].children.push(expr);
      i++;
      continue;
    }

    i++;
  }

  return root;
}

export function analyzeStats(code, lang, tokens, ast) {
  const cleanTokens = tokens.filter(t => t.type !== 'whitespace');
  const lines = code.split('\n').length;
  const chars = code.length;
  const comments = tokens.filter(t => t.type === 'comment').length;
  const strings = tokens.filter(t => t.type === 'string').length;
  const keywords = tokens.filter(t => t.type === 'keyword').length;
  const identifiers = tokens.filter(t => t.type === 'identifier').length;
  const operators = tokens.filter(t => t.type === 'operator').length;
  const numbers = tokens.filter(t => t.type === 'number').length;

  const depths = [];
  function walk(node, d) {
    depths.push(d);
    for (const child of (node.children || [])) walk(child, d + 1);
  }
  walk(ast, 0);
  const maxDepth = Math.max(...depths, 0);
  const avgDepth = depths.length > 0 ? (depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(1) : 0;

  let funcCount = 0, classCount = 0, controlCount = 0;
  function count(node) {
    if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunction') funcCount++;
    if (node.type === 'ClassDeclaration') classCount++;
    if (node.type === 'ControlFlow') controlCount++;
    for (const child of (node.children || [])) count(child);
  }
  count(ast);

  return { lines, chars, comments, strings, keywords, identifiers, operators, numbers, tokens: cleanTokens.length, maxDepth, avgDepth, funcCount, classCount, controlCount, langName: (lang || 'code').toUpperCase() };
}

export function runPipeline(code, lang, configs) {
  const tokens = tokenize(code, lang, configs);
  const ast = buildAST(code, lang, tokens, configs);
  const stats = analyzeStats(code, lang, tokens, ast);
  const tokenHtml = renderTokens(tokens, configs?.TOKEN_COLORS || TOKEN_COLORS_DEFAULT);
  const astHtml = renderAST(ast, 0);
  const statsHtml = renderStats(stats);

  return { tokens, ast, stats, html: { tokens: tokenHtml, ast: astHtml, stats: statsHtml }, source: code, lang };
}

export function renderTokens(tokens, colors) {
  const nonWs = tokens.filter(t => t.type !== 'whitespace');
  if (nonWs.length === 0) return '<div class="cp-empty">No tokens — code may be empty</div>';
  let html = `<div class="cp-token-summary">${nonWs.length} tokens</div><div class="cp-token-list">`;
  for (const tok of nonWs) {
    const color = colors[tok.type] || '#fff';
    const escaped = tok.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html += `<span class="cp-token" style="color:${color}" data-type="${tok.type}" title="${tok.type} (pos ${tok.pos})">${escaped}</span> `;
  }
  html += '</div>';
  return html;
}

export function renderAST(node, depth) {
  const indent = depth * 16;
  const hasChildren = node.children && node.children.length > 0;
  const label = node.name ? `${node.type}: <strong>${node.name}</strong>` : node.type;
  const value = node.value && !node.name ? ` <span class="cp-ast-val">${node.value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>` : '';
  const langBadge = node.lang ? ` <span class="cp-ast-lang">${node.lang.toUpperCase()}</span>` : '';
  let html = `<div class="cp-ast-node" style="padding-left:${indent}px">`;
  html += `<span class="cp-ast-label ${hasChildren ? 'cp-expandable' : ''}">${label}${value}${langBadge}</span>`;
  if (hasChildren) {
    html += `<div class="cp-ast-children">`;
    for (const child of node.children) html += renderAST(child, depth + 1);
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

export function renderStats(stats) {
  return `<div class="cp-stats-grid">
    <div class="cp-stat"><span class="cp-stat-label">Language</span><span class="cp-stat-val">${stats.langName}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Lines</span><span class="cp-stat-val">${stats.lines}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Chars</span><span class="cp-stat-val">${stats.chars}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Tokens</span><span class="cp-stat-val">${stats.tokens}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Keywords</span><span class="cp-stat-val">${stats.keywords}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Identifiers</span><span class="cp-stat-val">${stats.identifiers}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Operators</span><span class="cp-stat-val">${stats.operators}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Numbers</span><span class="cp-stat-val">${stats.numbers}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Strings</span><span class="cp-stat-val">${stats.strings}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Comments</span><span class="cp-stat-val">${stats.comments}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Functions</span><span class="cp-stat-val">${stats.funcCount}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Classes</span><span class="cp-stat-val">${stats.classCount}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Control Flow</span><span class="cp-stat-val">${stats.controlCount}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Max Depth</span><span class="cp-stat-val">${stats.maxDepth}</span></div>
    <div class="cp-stat"><span class="cp-stat-label">Avg Depth</span><span class="cp-stat-val">${stats.avgDepth}</span></div>
  </div>`;
}

export function highlightCode(code, lang, configs) {
  const tokens = tokenize(code, lang, configs);
  const colors = configs?.TOKEN_COLORS || TOKEN_COLORS_DEFAULT;
  let html = '';
  for (const tok of tokens) {
    const escaped = tok.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (tok.type === 'whitespace') {
      html += tok.value.replace(/\n/g, '<span class="cp-newline">\\n</span>\n').replace(/ /g, '&nbsp;');
    } else {
      const color = colors[tok.type] || '#fff';
      html += `<span style="color:${color}">${escaped}</span>`;
    }
  }
  return html;
}
