(function () {
    'use strict';

    const API_STORAGE_KEY = 'dogeslab_api_headers';
    let _prevModeForApi = null;

    function initAPI() {
        currentLang = 'api';
        document.getElementById('app').className = 'api-mode';
        document.getElementById('header-title').innerHTML = 'API';
        document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));

        document.getElementById('schemaDesigner').classList.remove('open');
        document.getElementById('editor').style.display = 'none';
        document.getElementById('output').style.display = 'none';
        document.getElementById('level-bar').style.display = 'none';
        document.getElementById('topic-list').innerHTML = '';
        document.getElementById('explanation').innerHTML = '<div style="color:#64748b;font-size:11px;padding:10px;">Send HTTP requests to test REST APIs. Enter a URL, add headers/body, and click Send.</div>';

        document.getElementById('apiResBody').textContent = 'Send a request to see the response';
        document.getElementById('apiResStatus').textContent = '—';
        document.getElementById('apiResStatus').className = 'api-res-status';
        document.getElementById('apiResMeta').textContent = '';
        document.getElementById('apiResHeaders').style.display = 'none';
        apiSwitchTab('headers');
        loadSavedHeaders();
    }

    function loadSavedHeaders() {
        try {
            const saved = localStorage.getItem(API_STORAGE_KEY);
            if (saved) {
                const headers = JSON.parse(saved);
                if (Array.isArray(headers) && headers.length > 0) {
                    document.getElementById('apiHeadersList').innerHTML = '';
                    headers.forEach(h => apiRenderHeader(h.key, h.value));
                    return;
                }
            }
        } catch {}
        apiAddHeader();
    }

    function saveHeaders() {
        try {
            const rows = document.querySelectorAll('#apiHeadersList .api-header-row');
            const headers = [];
            rows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                if (inputs.length >= 2) {
                    headers.push({ key: inputs[0].value, value: inputs[1].value });
                }
            });
            localStorage.setItem(API_STORAGE_KEY, JSON.stringify(headers));
        } catch {}
    }

    function apiRenderHeader(key, value) {
        const list = document.getElementById('apiHeadersList');
        const row = document.createElement('div');
        row.className = 'api-header-row';
        row.innerHTML = `<input type="text" class="api-header-key" placeholder="Header name" value="${key || ''}" oninput="saveHeaders()">
            <input type="text" class="api-header-val" placeholder="Value" value="${value || ''}" oninput="saveHeaders()">
            <button class="api-header-del" onclick="apiRemoveHeader(this)">✕</button>`;
        list.appendChild(row);
    }

    function apiAddHeader() {
        apiRenderHeader('', '');
    }

    function apiRemoveHeader(btn) {
        const row = btn.closest('.api-header-row');
        if (row) row.remove();
        saveHeaders();
        const remaining = document.querySelectorAll('#apiHeadersList .api-header-row');
        if (remaining.length === 0) apiAddHeader();
    }

    function apiSwitchTab(tab) {
        document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.api-tab-content').forEach(c => c.style.display = 'none');
        document.getElementById('apiTab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
        document.getElementById('apiContent' + tab.charAt(0).toUpperCase() + tab.slice(1)).style.display = 'flex';
    }

    function apiUpdateBodyType() {
        const type = document.getElementById('apiBodyType').value;
        const el = document.getElementById('apiBody');
        if (type === 'json') {
            el.placeholder = '{"key": "value"}';
            try { const parsed = JSON.parse(el.value); el.value = JSON.stringify(parsed, null, 2); } catch {}
        } else if (type === 'form') {
            el.placeholder = 'key1=value1&key2=value2';
        } else {
            el.placeholder = 'Raw text body...';
        }
    }

    function apiUpdateAuth() {
        const type = document.getElementById('apiAuthType').value;
        document.getElementById('apiAuthToken').style.display = type === 'bearer' ? 'block' : 'none';
        document.getElementById('apiAuthBasic').style.display = type === 'basic' ? 'flex' : 'none';
    }

    async function sendAPIRequest() {
        const method = document.getElementById('apiMethod').value;
        const url = document.getElementById('apiUrl').value.trim();
        if (!url) { document.getElementById('apiResBody').textContent = 'Please enter a URL'; return; }

        const btn = document.querySelector('.api-send-btn');
        btn.disabled = true;
        btn.textContent = 'Sending...';
        document.getElementById('apiResBody').textContent = 'Sending request...';
        document.getElementById('apiResStatus').textContent = '—';
        document.getElementById('apiResStatus').className = 'api-res-status';
        document.getElementById('apiResMeta').textContent = '';
        document.getElementById('apiResHeaders').style.display = 'none';

        const headers = {};
        document.querySelectorAll('#apiHeadersList .api-header-row').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                const k = inputs[0].value.trim();
                const v = inputs[1].value.trim();
                if (k) headers[k] = v;
            }
        });

        const authType = document.getElementById('apiAuthType').value;
        if (authType === 'bearer') {
            const token = document.getElementById('apiAuthToken').value.trim();
            if (token) headers['Authorization'] = 'Bearer ' + token;
        } else if (authType === 'basic') {
            const user = document.getElementById('apiAuthUser').value.trim();
            const pass = document.getElementById('apiAuthPass').value.trim();
            if (user || pass) {
                headers['Authorization'] = 'Basic ' + btoa(user + ':' + pass);
            }
        }

        let body = document.getElementById('apiBody').value.trim();
        const bodyType = document.getElementById('apiBodyType').value;
        if (body && ['GET', 'HEAD'].includes(method.toUpperCase())) {
            document.getElementById('apiResBody').textContent = method + ' requests cannot have a body';
            btn.disabled = false; btn.textContent = 'Send';
            return;
        }
        if (body && bodyType === 'json' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
            try { JSON.parse(body); } catch {
                document.getElementById('apiResBody').textContent = 'Invalid JSON body';
                btn.disabled = false; btn.textContent = 'Send';
                return;
            }
        }
        if (body && bodyType === 'form' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        if (!body) body = undefined;

        try {
            const response = await fetch(BACKEND_URL + '/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, url, headers, body })
            });
            const data = await response.json();

            if (data.error) {
                document.getElementById('apiResBody').textContent = 'Error: ' + data.error;
                document.getElementById('apiResStatus').textContent = 'ERR';
                document.getElementById('apiResStatus').className = 'api-res-status status-error';
                return;
            }

            const statusEl = document.getElementById('apiResStatus');
            const code = data.status;
            statusEl.textContent = code + ' ' + (data.statusText || '');
            if (code >= 200 && code < 300) statusEl.className = 'api-res-status status-2xx';
            else if (code >= 300 && code < 400) statusEl.className = 'api-res-status status-3xx';
            else if (code >= 400 && code < 500) statusEl.className = 'api-res-status status-4xx';
            else if (code >= 500) statusEl.className = 'api-res-status status-5xx';
            else statusEl.className = 'api-res-status status-error';

            document.getElementById('apiResMeta').textContent = data.time + 'ms · ' + formatSize(data.size);

            const headersContent = document.getElementById('apiResHeadersContent');
            if (data.headers && Object.keys(data.headers).length > 0) {
                document.getElementById('apiResHeaders').style.display = 'block';
                headersContent.textContent = Object.entries(data.headers)
                    .map(([k, v]) => k + ': ' + v).join('\n');
            } else {
                document.getElementById('apiResHeaders').style.display = 'none';
            }

            const bodyEl = document.getElementById('apiResBody');
            const displayBody = data.displayBody || data.body || '(empty response)';
            bodyEl.textContent = displayBody;
        } catch (e) {
            document.getElementById('apiResBody').textContent = 'Request failed: ' + e.message;
            document.getElementById('apiResStatus').textContent = 'ERR';
            document.getElementById('apiResStatus').className = 'api-res-status status-error';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send';
        }
    }

    function apiToggleHeaders() {
        const content = document.getElementById('apiResHeadersContent');
        const toggle = document.querySelector('.api-res-headers-toggle');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '▲ Response Headers';
        } else {
            content.style.display = 'none';
            toggle.textContent = '▼ Response Headers';
        }
    }

    function apiCopyResponse() {
        const body = document.getElementById('apiResBody').textContent;
        navigator.clipboard.writeText(body).catch(() => {});
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }

    window._prevModeForApi = _prevModeForApi;
    window.initAPI = initAPI;
    window.loadSavedHeaders = loadSavedHeaders;
    window.saveHeaders = saveHeaders;
    window.apiRenderHeader = apiRenderHeader;
    window.apiAddHeader = apiAddHeader;
    window.apiRemoveHeader = apiRemoveHeader;
    window.apiSwitchTab = apiSwitchTab;
    window.apiUpdateBodyType = apiUpdateBodyType;
    window.apiUpdateAuth = apiUpdateAuth;
    window.sendAPIRequest = sendAPIRequest;
    window.apiToggleHeaders = apiToggleHeaders;
    window.apiCopyResponse = apiCopyResponse;
    window.formatSize = formatSize;
    window.toggleAPIClient = function toggleAPIClient() {
        const btn = document.getElementById('api-toggle-btn');
        if (currentLang === 'api') {
            const prev = window._prevModeForApi || 'backend';
            window._prevModeForApi = null;
            setMode(prev);
            if (btn) btn.textContent = 'API ▸';
        } else {
            window._prevModeForApi = currentLang;
            setMode('api');
        }
    };
})();
