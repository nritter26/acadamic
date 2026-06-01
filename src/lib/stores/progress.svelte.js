import { browser } from '$app/environment';

let _completedTopics = $state(new Set());
let _dueReviewCount = $state(0);

const STORAGE_KEY = 'kodex_progress';

function loadFromStorage() {
  if (!browser) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      _completedTopics = new Set(data.completedTopics || []);
      _dueReviewCount = data.dueReviewCount || 0;
    }
  } catch (e) {
    console.error('Failed to load progress', e);
  }
}

function saveToStorage() {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completedTopics: [..._completedTopics],
      dueReviewCount: _dueReviewCount,
    }));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

loadFromStorage();

export function getProgressState() {
  return {
    get completedTopics() { return _completedTopics; },
    get dueReviewCount() { return _dueReviewCount; },
    set dueReviewCount(v) { _dueReviewCount = v; saveToStorage(); },

    isCompleted(lang, topic) {
      return _completedTopics.has(`${lang}:${topic}`);
    },

    toggleComplete(lang, topic) {
      const key = `${lang}:${topic}`;
      const next = new Set(_completedTopics);
      if (next.has(key)) next.delete(key); else next.add(key);
      _completedTopics = next;
      saveToStorage();
    },

    async fetchFromServer() {
      try {
        const r = await fetch('/api/progress');
        const data = await r.json();
        _completedTopics = new Set(data.completedTopics || []);
        _dueReviewCount = data.dueReviewCount || 0;
        saveToStorage();
      } catch (e) {
        console.error('Failed to fetch progress from server', e);
      }
    },
  };
}
