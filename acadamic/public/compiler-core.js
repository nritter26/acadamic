// ──────────────────────────────────────────────────────────────
// Kodex's Lab — Multi-Language Compilation Pipeline Explorer
// Works for all languages in the app: JS, TS, PY, GO, RS, ZIG,
// C, CPP, CS, KT, SWIFT, PG, DK, GIT, MONGODB, GAMEDEV
// ──────────────────────────────────────────────────────────────

const COMPILER = (() => {
  'use strict';

  // ── Language Configuration ──
  const LANG_CONFIG = {
    js:   { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'", '`'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    ts:   { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'", '`'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    py:   { lineComment: '#',  blockComment: null,           strings: ['"', "'", '"""'], blockOpen: ':', blockClose: null, stmtTerm: '\n', indentBased: true, caseSensitive: true },
    go:   { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'", '`'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    rs:   { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    zig:  { lineComment: '//', blockComment: null,           strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    c:    { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    cpp:  { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    cs:   { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    kt:   { lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'", '"""'], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
    swift:{ lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: '\n', indentBased: false, caseSensitive: true },
    pg:   { lineComment: '--', blockComment: null,           strings: ["'"], blockOpen: null, blockClose: null, stmtTerm: ';', indentBased: false, caseSensitive: false },
    dk:   { lineComment: '#',  blockComment: null,           strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: '\n', indentBased: false, caseSensitive: false },
    git:  { lineComment: '#',  blockComment: null,           strings: ['"', "'"], blockOpen: null, blockClose: null, stmtTerm: '\n', indentBased: false, caseSensitive: true },
    mongodb:{ lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'"], blockOpen: null, blockClose: null, stmtTerm: '\n', indentBased: false, caseSensitive: true },
    gamedev:{ lineComment: '//', blockComment: ['/*', '*/'], strings: ['"', "'"], blockOpen: '{', blockClose: '}', stmtTerm: ';', indentBased: false, caseSensitive: true },
  };

  function _getKeywords(lang) {
    const kw = (typeof LANG_KEYWORDS !== 'undefined' ? LANG_KEYWORDS : {});
    return kw[lang] || [];
  }

  const TOKEN_TYPES = {
    KEYWORD: 'keyword', IDENTIFIER: 'identifier', NUMBER: 'number',
    STRING: 'string', OPERATOR: 'operator', PUNCTUATION: 'punctuation',
    COMMENT: 'comment', WHITESPACE: 'whitespace', UNKNOWN: 'unknown',
  };

  const TOKEN_COLORS = {
    keyword: '#c084fc', identifier: '#e2e8f0', number: '#34d399',
    string: '#fbbf24', operator: '#f472b6', punctuation: '#64748b',
    comment: '#64748b', whitespace: 'transparent', unknown: '#ef4444',
  };

  // ── Tokenizer ──
  function tokenize(code, lang) {
    const cfg = LANG_CONFIG[lang] || LANG_CONFIG.js;
    const keywords = _getKeywords(lang);
    const kwLower = keywords.map(k => k.toLowerCase());
    const tokens = [];
    let i = 0;

    while (i < code.length) {
      // Whitespace
      if (/^\s/.test(code[i])) {
        let start = i;
        while (i < code.length && /^\s/.test(code[i])) i++;
        tokens.push({ type: TOKEN_TYPES.WHITESPACE, value: code.slice(start, i), pos: start });
        continue;
      }

      // Line comment
      if (cfg.lineComment && code.slice(i, i + cfg.lineComment.length) === cfg.lineComment) {
        let start = i;
        while (i < code.length && code[i] !== '\n') i++;
        tokens.push({ type: TOKEN_TYPES.COMMENT, value: code.slice(start, i), pos: start });
        continue;
      }

      // Block comment
      if (cfg.blockComment && code.slice(i, i + cfg.blockComment[0].length) === cfg.blockComment[0]) {
        let start = i;
        i += cfg.blockComment[0].length;
        while (i < code.length && code.slice(i, i + cfg.blockComment[1].length) !== cfg.blockComment[1]) i++;
        if (i < code.length) i += cfg.blockComment[1].length;
        tokens.push({ type: TOKEN_TYPES.COMMENT, value: code.slice(start, i), pos: start });
        continue;
      }

      // Multi-char string delimiters (like """)
      if (cfg.strings) {
        for (const delim of cfg.strings) {
          if (delim.length > 1 && code.slice(i, i + delim.length) === delim) {
            let start = i;
            i += delim.length;
            while (i < code.length && code.slice(i, i + delim.length) !== delim) {
              if (code[i] === '\\') i++;
              i++;
            }
            if (i < code.length) i += delim.length;
            tokens.push({ type: TOKEN_TYPES.STRING, value: code.slice(start, i), pos: start });
            break;
          }
        }
        if (tokens.length > 0 && tokens[tokens.length - 1].pos >= i) continue;
      }

      // String
      if (cfg.strings && cfg.strings.some(s => s.length === 1 && code[i] === s)) {
        const quote = code[i];
        let start = i;
        i++;
        while (i < code.length && code[i] !== quote) {
          if (code[i] === '\\') i++;
          i++;
        }
        if (i < code.length) i++;
        tokens.push({ type: TOKEN_TYPES.STRING, value: code.slice(start, i), pos: start });
        continue;
      }

      // Number
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
        tokens.push({ type: TOKEN_TYPES.NUMBER, value: code.slice(start, i), pos: start });
        continue;
      }

      // Multi-char operators
      if (i + 1 < code.length) {
        const twoChar = code.slice(i, i + 2);
        if (/^(==|!=|<=|>=|&&|\|\||<<|>>|\+\+|--|=>|::|\+\=|-\=|\*\=|\/\=|\%\=|&\=|\|\=|\^\=|->|\.\.)/.test(twoChar)) {
          tokens.push({ type: TOKEN_TYPES.OPERATOR, value: twoChar, pos: i });
          i += 2;
          continue;
        }
      }

      // Single-char operators
      if (/[+\-*\/%=<>!&|^~?:.]/.test(code[i])) {
        tokens.push({ type: TOKEN_TYPES.OPERATOR, value: code[i], pos: i });
        i++;
        continue;
      }

      // Punctuation
      if (/[(){}\[\] ;,`]/.test(code[i])) {
        tokens.push({ type: TOKEN_TYPES.PUNCTUATION, value: code[i], pos: i });
        i++;
        continue;
      }

      // Identifier or keyword
      if (/[a-zA-Z_$@#]/.test(code[i]) || (code[i] === '.' && tokens.length > 0 && tokens[tokens.length - 1].type === 'identifier')) {
        let start = i;
        if (code[i] === '.') i++;
        while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
        const word = code.slice(start, i);
        const wordLower = word.toLowerCase();
        const isKeyword = cfg.caseSensitive ? keywords.includes(word) : kwLower.includes(wordLower);
        tokens.push({ type: isKeyword ? TOKEN_TYPES.KEYWORD : TOKEN_TYPES.IDENTIFIER, value: word, pos: start });
        continue;
      }

      // Fallback
      tokens.push({ type: TOKEN_TYPES.UNKNOWN, value: code[i], pos: i });
      i++;
    }

    return tokens;
  }

  // ── AST Builder ──
  function buildAST(code, lang, tokens) {
    const cfg = LANG_CONFIG[lang] || LANG_CONFIG.js;
    const cleanTokens = tokens.filter(t => t.type !== TOKEN_TYPES.WHITESPACE && t.type !== TOKEN_TYPES.COMMENT);

    const root = { type: 'Program', children: [], depth: 0, pos: 0, lang };
    const stack = [root];
    let depth = 0;
    let i = 0;

    while (i < cleanTokens.length) {
      const tok = cleanTokens[i];
      const next = i + 1 < cleanTokens.length ? cleanTokens[i + 1] : null;

      // Block open: { or : (Python)
      if ((cfg.blockOpen && tok.value === cfg.blockOpen) || (lang === 'py' && tok.value === ':' && next && next.type === 'identifier')) {
        depth++;
        const block = { type: 'Block', children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(block);
        stack.push(block);
        i++;
        continue;
      }

      // Block close: }
      if (cfg.blockClose && tok.value === cfg.blockClose) {
        if (stack.length > 1) stack.pop();
        depth = Math.max(0, depth - 1);
        i++;
        continue;
      }

      // Function declaration
      if ((tok.value === 'function' || tok.value === 'def' || tok.value === 'func' || tok.value === 'fn') &&
          next && next.type === 'identifier') {
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

      // Arrow function
      if (tok.type === 'identifier' && next && next.value === '=>') {
        const arrow = { type: 'ArrowFunction', name: tok.value, children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(arrow);
        stack.push(arrow);
        i += 2;
        continue;
      }

      // Class declaration
      if (tok.value === 'class' && next && next.type === 'identifier') {
        const cls = { type: 'ClassDeclaration', name: next.value, children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(cls);
        stack.push(cls);
        i += 2;
        continue;
      }

      // Variable declaration
      if ((tok.value === 'let' || tok.value === 'const' || tok.value === 'var' || tok.value === 'val' || tok.value === 'mut') &&
          next && next.type === 'identifier') {
        const varDecl = { type: 'VariableDeclaration', name: next.value, children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(varDecl);
        i += 2;
        continue;
      }

      // Control flow
      if (['if', 'elif', 'else if', 'else', 'for', 'while', 'do', 'switch', 'match'].includes(tok.value)) {
        const ctrl = { type: 'ControlFlow', label: tok.value, children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(ctrl);
        i++;
        continue;
      }

      // Return statement
      if (tok.value === 'return' || tok.value === 'yield') {
        const ret = { type: tok.value === 'return' ? 'ReturnStatement' : 'YieldStatement', children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(ret);
        i++;
        continue;
      }

      // Import/Export/Include
      if (['import', 'export', 'from', 'package', 'use', 'mod', '#include'].includes(tok.value)) {
        const imp = { type: 'ImportDeclaration', detail: tok.value, children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(imp);
        i++;
        continue;
      }

      // Try/Catch
      if (tok.value === 'try' || tok.value === 'catch' || tok.value === 'except' || tok.value === 'finally' || tok.value === 'defer') {
        const tc = { type: 'ErrorHandler', label: tok.value, children: [], depth, pos: tok.pos, lang };
        stack[stack.length - 1].children.push(tc);
        i++;
        continue;
      }

      // Generic expression statement
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

  // ── Pipeline Runner ──
  function runPipeline(code, lang) {
    const tokens = tokenize(code, lang);
    const ast = buildAST(code, lang, tokens);
    const stats = analyzeStats(code, lang, tokens, ast);
    const tokenHtml = renderTokens(tokens);
    const astHtml = renderAST(ast, 0);
    const statsHtml = renderStats(stats);

    return {
      tokens,
      ast,
      stats,
      html: { tokens: tokenHtml, ast: astHtml, stats: statsHtml },
      source: code,
      lang,
    };
  }

  // ── Structural Analysis ──
  function analyzeStats(code, lang, tokens, ast) {
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

    const langName = lang ? lang.toUpperCase() : 'Code';

    return { lines, chars, comments, strings, keywords, identifiers, operators, numbers, tokens: cleanTokens.length, maxDepth, avgDepth, funcCount, classCount, controlCount, langName };
  }

  // ── Token HTML Renderer ──
  function renderTokens(tokens) {
    const nonWs = tokens.filter(t => t.type !== 'whitespace');
    if (nonWs.length === 0) return '<div class="cp-empty">No tokens — code may be empty</div>';

    let html = `<div class="cp-token-summary">${nonWs.length} tokens</div><div class="cp-token-list">`;
    for (const tok of nonWs) {
      const color = TOKEN_COLORS[tok.type] || '#fff';
      const escaped = tok.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += `<span class="cp-token" style="color:${color}" data-type="${tok.type}" title="${tok.type} (pos ${tok.pos})">${escaped}</span> `;
    }
    html += '</div>';
    return html;
  }

  // ── AST HTML Renderer ──
  function renderAST(node, depth) {
    const indent = depth * 16;
    const hasChildren = node.children && node.children.length > 0;
    const label = node.name ? `${node.type}: <strong>${node.name}</strong>` : node.type;
    const value = node.value && !node.name ? ` <span class="cp-ast-val">${node.value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>` : '';
    const langBadge = node.lang ? ` <span class="cp-ast-lang">${node.lang.toUpperCase()}</span>` : '';

    let html = `<div class="cp-ast-node" style="padding-left:${indent}px">`;
    html += `<span class="cp-ast-label ${hasChildren ? 'cp-expandable' : ''}">${label}${value}${langBadge}</span>`;
    if (hasChildren) {
      html += `<div class="cp-ast-children">`;
      for (const child of node.children) {
        html += renderAST(child, depth + 1);
      }
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  // ── Stats HTML Renderer ──
  function renderStats(stats) {
    return `
      <div class="cp-stats-grid">
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

  // ── Syntax Highlight (for source pane) ──
  function highlightCode(code, lang) {
    const tokens = tokenize(code, lang);
    let html = '';
    for (const tok of tokens) {
      const escaped = tok.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (tok.type === 'whitespace') {
        html += tok.value.replace(/\n/g, '<span class="cp-newline">\\n</span>\n').replace(/ /g, '&nbsp;');
      } else {
        const color = TOKEN_COLORS[tok.type] || '#fff';
        html += `<span style="color:${color}">${escaped}</span>`;
      }
    }
    return html;
  }

  return { tokenize, buildAST, runPipeline, highlightCode, LANG_CONFIG, TOKEN_TYPES, TOKEN_COLORS };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPILER };
}
