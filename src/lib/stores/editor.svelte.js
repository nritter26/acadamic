let _code = $state('// Select a topic to begin');
let _lineNumbers = $state(1);
let _syntaxError = $state('');

function countLines(value) {
  return (value.match(/\n/g) || []).length + 1;
}

export function getEditorState() {
  return {
    get code() { return _code; },
    set code(value) {
      _code = value;
      _lineNumbers = countLines(value);
    },
    get lineNumbers() { return _lineNumbers; },
    get syntaxError() { return _syntaxError; },
    set syntaxError(v) { _syntaxError = v; },
  };
}
