import { browser } from '$app/environment';

let _messages = $state([]);
let _streaming = $state(false);
let _panelOpen = $state(false);
let _provider = $state('hybrid');
let _model = $state('');
let _loaded = false;

const STORAGE_KEY = 'kodex_ai_chat';

function load() {
  if (!browser || _loaded) return;
  _loaded = true;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) _messages = JSON.parse(raw);
  } catch {
    _messages = [];
  }
}

function save() {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(_messages.slice(-100)));
}

export function getAIState() {
  load();

  return {
    get messages() { return _messages; },
    get streaming() { return _streaming; },
    get panelOpen() { return _panelOpen; },
    set panelOpen(value) { _panelOpen = value; },
    get provider() { return _provider; },
    set provider(value) { _provider = value; },
    get model() { return _model; },
    set model(value) { _model = value; },

    togglePanel() {
      _panelOpen = !_panelOpen;
    },

    addMessage(text, role = 'bot') {
      _messages = [..._messages, { text, role, id: Date.now() }];
      save();
    },

    updateLastMessage(text) {
      if (_messages.length === 0) return;
      _messages = _messages.map((message, index) => (
        index === _messages.length - 1 ? { ...message, text } : message
      ));
      save();
    },

    setStreaming(value) {
      _streaming = value;
    },

    clearHistory() {
      _messages = [];
      save();
    },
  };
}
