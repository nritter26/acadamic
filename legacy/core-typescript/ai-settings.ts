// @ts-nocheck

const STORAGE_KEY = 'devin_provider_config';

const defaults = {
  provider: 'hybrid',
  model: '',
  apiKey: '',
  endpoint: '',
};

const providerDefaults: Record<string, { model: string; endpoint: string }> = {
  local: { model: 'qwen2.5-coder:7b', endpoint: 'http://localhost:11434/v1' },
  openai: { model: 'gpt-4o-mini', endpoint: 'https://api.openai.com/v1' },
  anthropic: { model: 'claude-3-haiku-20240307', endpoint: 'https://api.anthropic.com/v1' },
  gemini: { model: 'gemini-2.0-flash', endpoint: 'https://generativelanguage.googleapis.com/v1beta' },
  hybrid: { model: '', endpoint: '' },
  keyword: { model: '', endpoint: '' },
};

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed };
    }
  } catch {}
  return { ...defaults };
}

function saveConfig(cfg) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
}

function switchConfigForProvider(provider: string): ProviderConfig {
  const current = loadConfig();
  const pd = providerDefaults[provider] || { model: '', endpoint: '' };
  return {
    ...current,
    provider,
    model: pd.model,
    endpoint: pd.endpoint,
    apiKey: provider === 'local' || provider === 'hybrid' || provider === 'keyword' ? '' : current.apiKey,
  };
}

function renderSettings(container) {
  const cfg = loadConfig();
  const needsKey = !['local', 'hybrid', 'keyword'].includes(cfg.provider);

  container.innerHTML = `
    <div class="ai-settings">
      <div class="ai-settings-row">
        <label>Provider</label>
        <select id="aiProviderSelect">
          <option value="hybrid" ${cfg.provider === 'hybrid' ? 'selected' : ''}>Hybrid (cascade)</option>
          <option value="local" ${cfg.provider === 'local' ? 'selected' : ''}>Local (Ollama)</option>
          <option value="openai" ${cfg.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
          <option value="anthropic" ${cfg.provider === 'anthropic' ? 'selected' : ''}>Anthropic</option>
          <option value="gemini" ${cfg.provider === 'gemini' ? 'selected' : ''}>Gemini</option>
          <option value="keyword" ${cfg.provider === 'keyword' ? 'selected' : ''}>Keyword (offline)</option>
        </select>
      </div>
      <div class="ai-settings-row" id="aiModelRow">
        <label>Model</label>
        <div class="ai-model-input-row">
          <input type="text" id="aiModelInput" value="${cfg.model}" placeholder="${providerDefaults[cfg.provider]?.model || ''}">
          <button id="aiRefreshModels" class="ai-settings-btn" ${cfg.provider === 'local' ? '' : 'style="display:none"'}>⟳</button>
        </div>
      </div>
      <div class="ai-settings-row" id="aiEndpointRow" ${cfg.provider === 'local' ? '' : 'style="display:none"'}>
        <label>Endpoint</label>
        <input type="text" id="aiEndpointInput" value="${cfg.endpoint}" placeholder="http://localhost:11434/v1">
      </div>
      <div class="ai-settings-row" id="aiKeyRow" ${needsKey ? '' : 'style="display:none"'}>
        <label>API Key</label>
        <input type="password" id="aiKeyInput" value="${cfg.apiKey}" placeholder="sk-...">
      </div>
      <div class="ai-settings-row" id="aiOllamaModelsRow" style="display:none">
        <label>Available Models</label>
        <div id="aiOllamaModelsList" class="ai-ollama-models"></div>
      </div>
    </div>
  `;

  const select = container.querySelector('#aiProviderSelect') as HTMLSelectElement;
  const modelInput = container.querySelector('#aiModelInput') as HTMLInputElement;
  const endpointInput = container.querySelector('#aiEndpointInput') as HTMLInputElement;
  const keyInput = container.querySelector('#aiKeyInput') as HTMLInputElement;
  const modelRow = container.querySelector('#aiModelRow') as HTMLElement;
  const endpointRow = container.querySelector('#aiEndpointRow') as HTMLElement;
  const keyRow = container.querySelector('#aiKeyRow') as HTMLElement;
  const refreshBtn = container.querySelector('#aiRefreshModels') as HTMLElement;
  const ollamaRow = container.querySelector('#aiOllamaModelsRow') as HTMLElement;
  const ollamaList = container.querySelector('#aiOllamaModelsList') as HTMLElement;

  const updateRows = () => {
    const p = select.value;
    const pd = providerDefaults[p] || { model: '', endpoint: '' };
    const needsApiKey = !['local', 'hybrid', 'keyword'].includes(p);
    const showEndpoint = p === 'local';

    if (!modelInput.value || modelInput.value === providerDefaults[cfg.provider]?.model) {
      modelInput.value = pd.model;
    }
    if (p === 'local' && (!endpointInput.value || endpointInput.value === providerDefaults[cfg.provider]?.endpoint)) {
      endpointInput.value = pd.endpoint;
    }

    modelRow.style.display = p === 'keyword' || p === 'hybrid' ? 'none' : '';
    endpointRow.style.display = showEndpoint ? '' : 'none';
    keyRow.style.display = needsApiKey ? '' : 'none';
    refreshBtn.style.display = p === 'local' ? '' : 'none';
    ollamaRow.style.display = 'none';
  };

  const saveCurrent = () => {
    saveConfig({
      provider: select.value,
      model: modelInput.value,
      apiKey: keyInput.value,
      endpoint: endpointInput.value,
    });
  };

  select.addEventListener('change', () => {
    const p = select.value;
    const newCfg = switchConfigForProvider(p);
    modelInput.value = newCfg.model;
    endpointInput.value = newCfg.endpoint;
    keyInput.value = newCfg.apiKey;
    updateRows();
    if (p === 'local') fetchOllamaModels();
    saveCurrent();
  });

  modelInput.addEventListener('change', saveCurrent);
  endpointInput.addEventListener('change', saveCurrent);
  keyInput.addEventListener('change', saveCurrent);

  refreshBtn.addEventListener('click', () => fetchOllamaModels());

  updateRows();

  if (cfg.provider === 'local') {
    fetchOllamaModels();
  }

  async function fetchOllamaModels() {
    ollamaRow.style.display = '';
    ollamaList.innerHTML = '<span class="ai-ollama-loading">Loading...</span>';
    try {
      const res = await fetch('/api/ollama/status');
      const data = await res.json();
      const models: string[] = data.models || [];
      if (models.length === 0) {
        ollamaList.innerHTML = '<span class="ai-ollama-empty">No models found</span>';
        return;
      }
      ollamaList.innerHTML = models.map(m =>
        `<button class="ai-ollama-model-btn" data-model="${m}">${m}</button>`
      ).join('');
      ollamaList.querySelectorAll('.ai-ollama-model-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modelInput.value = (btn as HTMLElement).dataset.model || '';
          saveCurrent();
        });
      });
    } catch {
      ollamaList.innerHTML = '<span class="ai-ollama-error">Could not reach Ollama</span>';
    }
  }
}
