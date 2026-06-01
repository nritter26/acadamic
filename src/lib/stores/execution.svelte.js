let _running = $state(false);
let _output = $state('');
let _error = $state('');

export function getExecutionState() {
  return {
    get running() { return _running; },
    get output() { return _output; },
    get error() { return _error; },

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
          _error = data.error;
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
