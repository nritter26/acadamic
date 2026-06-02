<script>
  import { getExecutionState } from '$lib/stores/execution.svelte.js';

  let exec = $derived(getExecutionState());
  let method = $state('GET');
  let url = $state('https://jsonplaceholder.typicode.com/todos/1');
  let body = $state('');
  let bodyType = $state('json');
  let activeTab = $state('headers');
  let loading = $state(false);

  let headers = $state([{ key: '', value: '' }]);
  let authType = $state('none');
  let authToken = $state('');
  let authUser = $state('');
  let authPass = $state('');
  const bodyPlaceholder = '{"key": "value"}';

  function addHeader() {
    headers = [...headers, { key: '', value: '' }];
  }

  function setHeader(i, field, val) {
    headers = headers.map((h, idx) => idx === i ? { ...h, [field]: val } : h);
  }

  function buildHeaders() {
    const h = {};
    headers.forEach(hh => { if (hh.key.trim()) h[hh.key.trim()] = hh.value; });
    if (authType === 'bearer' && authToken) h['Authorization'] = `Bearer ${authToken}`;
    if (authType === 'basic' && authUser && authPass) h['Authorization'] = 'Basic ' + btoa(`${authUser}:${authPass}`);
    if (method !== 'GET' && body.trim()) {
      if (bodyType === 'json') h['Content-Type'] = 'application/json';
      else if (bodyType === 'form') h['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return h;
  }

  function buildBody() {
    if (method === 'GET' || !body.trim()) return undefined;
    return body;
  }

  function formatHeaders(headers) {
    let out = '';
    headers.forEach((value, key) => { out += `${key}: ${value}\n`; });
    return out;
  }

  async function send() {
    loading = true;
    exec.apiResponse = '';
    exec.apiStatus = 'Sending...';
    exec.apiHeaders = '';
    try {
      const options = { method, headers: buildHeaders() };
      const reqBody = buildBody();
      if (reqBody) options.body = reqBody;
      const result = await fetch(url, options);
      const text = await result.text();
      const hdrs = formatHeaders(result.headers);
      exec.apiHeaders = hdrs;
      exec.apiStatus = `HTTP ${result.status} ${result.statusText}`;
      exec.apiResponse = text;
    } catch (error) {
      exec.apiStatus = 'Error';
      exec.apiResponse = error.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="api-client">
  <div class="api-toolbar">
    <select bind:value={method}>
      <option>GET</option>
      <option>POST</option>
      <option>PUT</option>
      <option>PATCH</option>
      <option>DELETE</option>
      <option>HEAD</option>
      <option>OPTIONS</option>
    </select>
    <input bind:value={url} type="text" class="api-url-input" placeholder="https://api.example.com/endpoint" />
    <button class="api-send-btn" onclick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
  </div>
  <div class="api-tabs">
    <button class="api-tab" class:active={activeTab === 'headers'} onclick={() => activeTab = 'headers'}>Headers</button>
    {#if method !== 'GET' && method !== 'HEAD'}
      <button class="api-tab" class:active={activeTab === 'body'} onclick={() => activeTab = 'body'}>Body</button>
    {/if}
    <button class="api-tab" class:active={activeTab === 'auth'} onclick={() => activeTab = 'auth'}>Auth</button>
  </div>
  {#if activeTab === 'headers'}
    <div class="api-tab-content">
      <div class="api-hint">Add headers as key-value pairs</div>
      {#each headers as h, i}
        <div class="api-header-row">
          <input bind:value={headers[i].key} placeholder="Key" />
          <input bind:value={headers[i].value} placeholder="Value" />
        </div>
      {/each}
      <button class="api-add-btn" onclick={addHeader}>+ Add Header</button>
    </div>
  {:else if activeTab === 'body'}
    <div class="api-tab-content" style="flex:1;">
      <div class="api-body-type-bar">
        <select bind:value={bodyType}>
          <option value="json">JSON</option>
          <option value="text">Text</option>
          <option value="form">Form URL-encoded</option>
        </select>
      </div>
      <textarea bind:value={body} class="api-body-input" spellcheck="false" placeholder={bodyPlaceholder}></textarea>
    </div>
  {:else if activeTab === 'auth'}
    <div class="api-tab-content">
      <div class="api-auth-type-bar">
        <select bind:value={authType}>
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
        </select>
      </div>
      {#if authType === 'bearer'}
        <input bind:value={authToken} type="text" class="api-auth-input" placeholder="Enter your token..." />
      {:else if authType === 'basic'}
        <div class="api-auth-basic">
          <input bind:value={authUser} type="text" class="api-auth-input" placeholder="Username" />
          <input bind:value={authPass} type="password" class="api-auth-input" placeholder="Password" />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .api-client { display: grid; gap: 8px; padding: 12px; color: #e2e8f0; height: 100%; grid-template-rows: auto auto 1fr; }
  .api-toolbar { display: flex; gap: 6px; }
  .api-toolbar select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 6px; font-size: 11px; }
  .api-url-input { flex: 1; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 6px 8px; font-size: 11px; }
  .api-send-btn { padding: 6px 14px; background: #6366f1; color: #fff; border: none; border-radius: 4px; font-weight: 700; font-size: 11px; cursor: pointer; }
  .api-send-btn:disabled { opacity: 0.5; }
  .api-tabs { display: flex; border-bottom: 1px solid #1e293b; }
  .api-tab { padding: 4px 12px; font-size: 10px; font-weight: 600; background: transparent; border: none; border-bottom: 2px solid transparent; color: #64748b; cursor: pointer; }
  .api-tab.active { color: #e2e8f0; border-bottom-color: #6366f1; }
  .api-tab-content { overflow: auto; padding: 8px 0; }
  .api-hint { color: #64748b; font-size: 10px; margin-bottom: 8px; }
  .api-header-row { display: flex; gap: 6px; margin-bottom: 4px; }
  .api-header-row input { flex: 1; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 4px 6px; font-size: 11px; }
  .api-add-btn { background: transparent; border: 1px dashed #334155; color: #64748b; padding: 4px 8px; font-size: 10px; border-radius: 4px; cursor: pointer; margin-top: 4px; }
  .api-add-btn:hover { color: #e2e8f0; border-color: #475569; }
  .api-body-type-bar { margin-bottom: 6px; }
  .api-body-type-bar select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px; font-size: 11px; }
  .api-body-input { width: 100%; min-height: 100px; box-sizing: border-box; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; resize: vertical; }
  .api-auth-type-bar { margin-bottom: 8px; }
  .api-auth-type-bar select { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px; font-size: 11px; }
  .api-auth-input { width: 100%; box-sizing: border-box; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 6px; font-size: 11px; margin-bottom: 6px; }
  .api-auth-basic { display: flex; flex-direction: column; gap: 6px; }
</style>
