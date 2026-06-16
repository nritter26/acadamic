let _running = $state(false);
let _output = $state('');
let _error = $state('');
let _apiResponse = $state('');
let _apiStatus = $state('');
let _apiHeaders = $state('');
let _compilerOutput = $state('');
let _compilerStage = $state('');

export function getExecutionState() {
  return {
    get running() { return _running; },
    set running(v) { _running = v; },
    get output() { return _output; },
    set output(v) { _output = v; },
    get error() { return _error; },
    set error(v) { _error = v; },
    get apiResponse() { return _apiResponse; },
    set apiResponse(v) { _apiResponse = v; },
    get apiStatus() { return _apiStatus; },
    set apiStatus(v) { _apiStatus = v; },
    get apiHeaders() { return _apiHeaders; },
    set apiHeaders(v) { _apiHeaders = v; },
    get compilerOutput() { return _compilerOutput; },
    set compilerOutput(v) { _compilerOutput = v; },
    get compilerStage() { return _compilerStage; },
    set compilerStage(v) { _compilerStage = v; },

    async runCode(lang, code, stdin = '') {
      _running = true;
      _output = '';
      _error = '';

      try {
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang, code, stdin }),
        });
        const data = await response.json();
        if (data.error) {
          _error = typeof data.error === 'string' ? data.error : (data.output || 'Execution failed');
        } else {
          _output = data.output || '(no output)';
        }
      } catch (error) {
        _error = `Failed to reach server: ${error.message}`;
      } finally {
        _running = false;
      }
    },

    clear() {
      _output = '';
      _error = '';
    },
  };
}
