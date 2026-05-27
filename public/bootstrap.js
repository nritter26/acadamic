(function () {
    'use strict';

    function resolveBackendUrl() {
        const override = localStorage.getItem('kodex_backend_url');
        if (override) return override.replace(/\/$/, '');

        const { protocol, hostname, port, origin } = window.location;
        const staticDevPorts = new Set(['5500', '5501', '5502', '5173', '5174']);
        const isLocalStaticServer = (hostname === 'localhost' || hostname === '127.0.0.1') && staticDevPorts.has(port);
        if (isLocalStaticServer) {
            return `${protocol}//${hostname}:3000`;
        }

        return origin;
    }

    window.resolveBackendUrl = resolveBackendUrl;
    window.BACKEND_URL = resolveBackendUrl();

    let learnerId = localStorage.getItem('kodex_learner_id');
    if (!learnerId) {
        learnerId = 'learner_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        localStorage.setItem('kodex_learner_id', learnerId);
    }
    window.LEARNER_ID = learnerId;

    window.runBtn = document.querySelector('.run-btn[onclick="runCode()"]');
})();
