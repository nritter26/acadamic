// ── Native Curriculum Language Toggle (replaces Google Translate) ──

let _currentLang = 'en'; // 'en' or 'th'

// ── Language cookie helpers ──

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value) {
  document.cookie = name + '=' + encodeURIComponent(value) + ';path=/';
}

function detectLangFromCookie() {
  const cookie = getCookie('kodex_lang');
  if (cookie === 'th' || cookie === 'en') {
    _currentLang = cookie;
  }
}

// ── Public API ──

export function getCurrentLang() {
  return _currentLang;
}

export function setCurrentLang(code) {
  if (code !== 'en' && code !== 'th') return;
  _currentLang = code;
  setCookie('kodex_lang', code);

  // Update header button text
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    langBtn.textContent = code.toUpperCase();
  }

  // Notify listeners
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: code } }));
}

export function toggleLanguage() {
  const next = _currentLang === 'en' ? 'th' : 'en';
  setCurrentLang(next);
  return next;
}

export function applySavedLanguage() {
  detectLangFromCookie();
  // Notify listeners so the curriculum store can load Thai content
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: _currentLang } }));
}

export function loadGoogleTranslate(callback) {
  // No-op: Google Translate removed. Native toggle used instead.
  callback?.();
}
