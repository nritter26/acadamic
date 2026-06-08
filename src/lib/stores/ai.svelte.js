import { browser } from '$app/environment';
import { apiStream } from '$lib/lib/api.js';

let _messages = $state([]);
let _streaming = $state(false);
let _panelOpen = $state(false);
let _provider = $state('hybrid');
let _model = $state('');
let _loaded = false;
let _idCounter = 0;
let _editorCode = $state('');
let _exercise = $state(null);
let _sessionState = $state('idle');

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

function _addMessage(text, role = 'bot') {
  _messages = [..._messages, { text, role, id: nextId() }];
  save();
  broadcast('messages', _messages);
}

function _updateLastMessage(text) {
  if (_messages.length === 0) return;
  _messages = _messages.map((message, index) => (
    index === _messages.length - 1 ? { ...message, text } : message
  ));
  save();
  broadcast('messages', _messages);
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
    get editorCode() { return _editorCode; },
    set editorCode(value) { _editorCode = value; },
    get exercise() { return _exercise; },
    set exercise(value) { _exercise = value; },
    get sessionState() { return _sessionState; },
    set sessionState(value) { _sessionState = value; },

    togglePanel() {
      _panelOpen = !_panelOpen;
      broadcast('panelOpen', _panelOpen);
    },

    async exploreTopic(topic, lang, phase) {
      if (_streaming) return;
      _panelOpen = true;
      broadcast('panelOpen', true);
      _addMessage(`Explain "${topic}" in ${lang}`, 'user');
      _addMessage('', 'bot');
      _streaming = true;
      broadcast('streaming', true);
      let streamed = '';
      try {
        await apiStream('/api/tutor/explain-topic', { topic, lang, phase, learnerId: 'default' }, (chunk) => {
          streamed += chunk;
          _updateLastMessage(streamed);
        }, () => {
          _streaming = false;
          broadcast('streaming', false);
          _addMessage('Try writing some code or ask me a follow-up question!', 'bot');
        }, (error) => {
          _updateLastMessage(`Error: ${error}`);
          _streaming = false;
          broadcast('streaming', false);
        });
      } catch {
        _streaming = false;
        broadcast('streaming', false);
      }
    },

    addMessage(text, role = 'bot') {
      _addMessage(text, role);
    },

    updateLastMessage(text) {
      _updateLastMessage(text);
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
