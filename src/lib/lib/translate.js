let gtCurrentLang = 'en';
let translateWidgetLoaded = false;
let translateWidgetInitializing = false;
let notranslateObserver = null;

// ── Language cookie helpers ──

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function detectLangFromCookie() {
  // Google Translate sets cookie: googtrans=/en/th
  const gtCookie = getCookie('googtrans');
  if (gtCookie) {
    const parts = gtCookie.split('/');
    if (parts.length >= 3 && parts[2]) {
      gtCurrentLang = parts[2];
    }
  }
}

// ── Public API ──

export function getCurrentLang() {
  return gtCurrentLang;
}

export function setCurrentLang(code) {
  gtCurrentLang = code;
}

export function doGTranslate(langPair) {
  if (langPair.value) langPair = langPair.value;
  if (langPair === '') return;
  const lang = langPair.split('|')[1];
  if (lang === gtCurrentLang && lang !== 'en') return;
  // If switching back to English, we need to force the cookie + reload
  if (lang === 'en' && gtCurrentLang === 'en') return;

  const prevLang = gtCurrentLang;
  gtCurrentLang = lang;
  document.cookie = 'googtrans=/en/' + lang;

  const teCombo = document.querySelector('.goog-te-combo');
  if (teCombo) {
    teCombo.value = lang;
    teCombo.dispatchEvent(new Event('change'));
  } else {
    // Fallback: force reload with cookie set
    if (lang !== prevLang) {
      // Google Translate widget might not be ready, try re-initializing
      document.cookie = 'googtrans=/en/' + lang;
      window.location.reload();
    }
  }

  // Notify any listeners
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
}

export function markCodeAsNotranslate(root = document) {
  const selectors = 'code, pre, textarea, .cm-editor, .editor-wrapper, .monaco-editor, .code-input, .game-input, #editor, #projectsEditor, .styling-textarea, #dblabTerminalInput, #gitvizTerminalInput, .notranslate';
  root.querySelectorAll(selectors).forEach((node) => {
    if (!node.classList.contains('notranslate')) {
      node.classList.add('notranslate');
    }
  });
}

// ── Mutation Observer to protect dynamic code blocks ──

function startNotranslateObserver() {
  if (notranslateObserver) return;
  notranslateObserver = new MutationObserver((mutations) => {
    let needsProtection = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        needsProtection = true;
        break;
      }
    }
    if (needsProtection) {
      markCodeAsNotranslate(document);
    }
  });
  notranslateObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function stopNotranslateObserver() {
  if (notranslateObserver) {
    notranslateObserver.disconnect();
    notranslateObserver = null;
  }
}

// ── Load Google Translate ──

export function loadGoogleTranslate(callback) {
  detectLangFromCookie();

  if (translateWidgetLoaded) {
    markCodeAsNotranslate(document);
    startNotranslateObserver();
    callback?.();
    return;
  }

  if (translateWidgetInitializing) {
    // Wait for existing initialization
    const check = setInterval(() => {
      if (translateWidgetLoaded) {
        clearInterval(check);
        markCodeAsNotranslate(document);
        startNotranslateObserver();
        callback?.();
      }
    }, 200);
    return;
  }

  translateWidgetInitializing = true;

  // Check if Google Translate already exists on page
  if (typeof google !== 'undefined' && google.translate && google.translate.TranslateElement) {
    translateWidgetLoaded = true;
    translateWidgetInitializing = false;
    // Initialize the hidden element
    try {
      new google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element2'
      );
    } catch (e) {
      // Already initialized
    }
    markCodeAsNotranslate(document);
    startNotranslateObserver();
    callback?.();
    return;
  }

  // Ensure the target div exists
  let targetEl = document.getElementById('google_translate_element2');
  if (!targetEl) {
    targetEl = document.createElement('div');
    targetEl.id = 'google_translate_element2';
    targetEl.style.display = 'none';
    document.body.appendChild(targetEl);
  }

  // Define the callback
  window.googleTranslateElementInit2 = () => {
    try {
      new google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element2'
      );
    } catch (e) {
      console.warn('Google Translate init failed:', e);
    }
    translateWidgetLoaded = true;
    translateWidgetInitializing = false;
    markCodeAsNotranslate(document);
    startNotranslateObserver();
    callback?.();
  };

  // Add the script if not already present
  if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
    script.async = true;
    document.head.appendChild(script);
  } else {
    // Script exists but callback wasn't called yet — wait for it
    const checkExisting = setInterval(() => {
      if (translateWidgetLoaded) {
        clearInterval(checkExisting);
        callback?.();
      }
    }, 300);
    // Timeout after 10s
    setTimeout(() => clearInterval(checkExisting), 10000);
  }
}

// ── Apply saved language on page load ──

export function applySavedLanguage() {
  detectLangFromCookie();
  if (gtCurrentLang !== 'en') {
    // Trigger Google Translate to apply the saved language
    const teCombo = document.querySelector('.goog-te-combo');
    if (teCombo) {
      teCombo.value = gtCurrentLang;
      teCombo.dispatchEvent(new Event('change'));
    }
  }
}

// ── Cleanup ──

export function destroyTranslate() {
  stopNotranslateObserver();
}
