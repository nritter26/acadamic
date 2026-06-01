<script>
  let method = $state('GET');
  let url = $state('/api/health');
  let body = $state('');
  let response = $state('');
  let loading = $state(false);

  async function send() {
    loading = true;
    response = '';
    try {
      const options = { method };
      if (method !== 'GET' && body.trim()) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = body;
      }
      const result = await fetch(url, options);
      const text = await result.text();
      response = `HTTP ${result.status}\n\n${text}`;
    } catch (error) {
      response = error.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="api-client">
  <div class="request-row">
    <select bind:value={method}>
      <option>GET</option>
      <option>POST</option>
      <option>PUT</option>
      <option>DELETE</option>
    </select>
    <input bind:value={url} placeholder="/api/health" />
    <button onclick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
  </div>
  <textarea bind:value={body} placeholder="JSON body" rows="6"></textarea>
  <pre>{response || 'Response appears here'}</pre>
</div>

<style>
  .api-client { display: grid; gap: 12px; padding: 16px; color: #e2e8f0; }
  .request-row { display: grid; grid-template-columns: 110px minmax(0, 1fr) auto; gap: 8px; }
  select, input, textarea { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 8px; }
  button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
  pre { min-height: 220px; margin: 0; padding: 12px; background: #0a0f1e; border: 1px solid #1e293b; border-radius: 8px; white-space: pre-wrap; }
</style>
