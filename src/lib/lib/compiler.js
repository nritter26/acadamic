export function tokenizeSource(source = '') {
  const matches = source.match(/[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|==={0,1}|!==?|=>|[{}()[\];,=+\-*/<>]/g) || [];
  return matches.map((value, index) => ({
    type: /^[A-Za-z_$]/.test(value) ? 'identifier' : /^\d/.test(value) ? 'number' : 'symbol',
    value,
    index,
  }));
}

export function summarizeTokens(tokens = []) {
  return tokens.reduce((summary, token) => {
    summary[token.type] = (summary[token.type] || 0) + 1;
    return summary;
  }, {});
}
