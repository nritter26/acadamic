<script>
  import { buildChallengeCode, parseTestResults } from '$lib/lib/challenge.js';

  let { code = '', tests = [], lang = 'js' } = $props();
  let results = $state([]);
  let running = $state(false);
  let error = $state('');

  async function runTests() {
    running = true;
    error = '';
    results = [];

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, code: buildChallengeCode(code, tests) }),
      });
      const data = await response.json();
      if (data.error) error = data.error;
      results = parseTestResults(data.output || '', tests);
    } catch (err) {
      error = err.message;
    } finally {
      running = false;
    }
  }
</script>

<div class="challenge-tests">
  <button onclick={runTests} disabled={running || tests.length === 0}>{running ? 'Running...' : 'Run Tests'}</button>
  {#if error}<pre class="error">{error}</pre>{/if}
  {#each results as result}
    <div class="test-result" class:passed={result.passed}>
      {result.passed ? 'PASS' : 'FAIL'} {result.test}
    </div>
  {/each}
</div>

<style>
  .challenge-tests { padding: 12px; border-left: 1px solid #1e293b; color: #cbd5e1; overflow: auto; }
  button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  .error { color: #ef4444; white-space: pre-wrap; }
  .test-result { margin-top: 8px; padding: 8px; border-radius: 6px; background: #7f1d1d; }
  .test-result.passed { background: #14532d; }
</style>
