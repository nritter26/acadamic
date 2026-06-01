<script>
  import { formatRowsAsTable } from '$lib/lib/db.js';

  let query = $state('SELECT 1 AS id, "Ada" AS name;');
  let output = $state('');
  let loading = $state(false);

  async function runQuery() {
    loading = true;
    output = '';
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: 'sqlite', code: query }),
      });
      const data = await response.json();
      output = Array.isArray(data.rows) ? formatRowsAsTable(data.rows) : data.output || data.error || '(no output)';
    } catch (error) {
      output = error.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="dblab">
  <section>
    <h2>DB Lab</h2>
    <textarea bind:value={query}></textarea>
    <button onclick={runQuery} disabled={loading}>{loading ? 'Running...' : 'Run SQL'}</button>
  </section>
  <pre>{output || 'Query results appear here'}</pre>
</div>

<style>
  .dblab { display: grid; grid-template-columns: 1fr 1fr; height: 100%; background: #0f172a; color: #e2e8f0; }
  section { padding: 18px; border-right: 1px solid #1e293b; }
  textarea { width: 100%; min-height: 260px; box-sizing: border-box; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; }
  button { margin-top: 10px; padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
  pre { margin: 0; padding: 18px; overflow: auto; white-space: pre-wrap; }
</style>
