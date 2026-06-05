import { browser } from '$app/environment';

let _messages = $state([]);
let _streaming = $state(false);
let _panelOpen = $state(false);
let _provider = $state('hybrid');
let _model = $state('');
let _loaded = false;
let _idCounter = 0;

const STORAGE_KEY = 'kodex_ai_chat';
const CHANNEL_NAME = 'kodex_ai_sync';

let _channel;

function getChannel() {
  if (!browser || _channel) return _channel;
  try {
    _channel = new BroadcastChannel(CHANNEL_NAME);
    _channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'messages' && Array.isArray(data)) {
        _messages = data;
      } else if (type === 'streaming') {
        _streaming = data;
      } else if (type === 'panelOpen') {
        _panelOpen = data;
      }
    };
  } catch {
    _channel = null;
  }
  return _channel;
}

function broadcast(type, data) {
  const ch = getChannel();
  if (ch) {
    try { ch.postMessage({ type, data }); } catch {}
  }
}

function load() {
  if (!browser || _loaded) return;
  _loaded = true;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      _messages = JSON.parse(raw);
      const seen = new Set();
      let fixed = false;
      for (const m of _messages) {
        if (!m.id || seen.has(m.id)) {
          m.id = nextId();
          fixed = true;
        }
        seen.add(m.id);
      }
      if (fixed) save();
    }
  } catch {
    _messages = [];
  }

  if (browser) {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          _messages = JSON.parse(e.newValue);
        } catch {}
      }
    });
  }
}

function save() {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(_messages.slice(-100)));
}

function nextId() {
  _idCounter += 1;
  return Date.now().toString(36) + '-' + _idCounter;
}

export function getAIState() {
  load();
  getChannel();

  return {
    get messages() { return _messages; },
    get streaming() { return _streaming; },
    get panelOpen() { return _panelOpen; },
    set panelOpen(value) { _panelOpen = value; broadcast('panelOpen', value); },
    get provider() { return _provider; },
    set provider(value) { _provider = value; },
    get model() { return _model; },
    set model(value) { _model = value; },

    togglePanel() {
      _panelOpen = !_panelOpen;
      broadcast('panelOpen', _panelOpen);
    },

    addMessage(text, role = 'bot') {
      _messages = [..._messages, { text, role, id: nextId() }];
      save();
      broadcast('messages', _messages);
    },

    updateLastMessage(text) {
      if (_messages.length === 0) return;
      _messages = _messages.map((message, index) => (
        index === _messages.length - 1 ? { ...message, text } : message
      ));
      save();
      broadcast('messages', _messages);
    },

    setStreaming(value) {
      _streaming = value;
      broadcast('streaming', value);
    },

    clearHistory() {
      _messages = [];
      save();
      broadcast('messages', _messages);
    },
  };
}
