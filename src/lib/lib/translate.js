let gtCurrentLang = 'en';
let translateWidgetLoaded = false;

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
  if (lang === gtCurrentLang) return;
  gtCurrentLang = lang;
  document.cookie = 'googtrans=/en/' + lang;
  const teCombo = document.querySelector('.goog-te-combo');
  if (teCombo) {
    teCombo.value = lang;
    teCombo.dispatchEvent(new Event('change'));
  }
}

export function markCodeAsNotranslate(root = document) {
  root.querySelectorAll('code, pre, textarea, .notranslate').forEach((node) => node.classList.add('notranslate'));
}

export function loadGoogleTranslate(callback) {
  if (translateWidgetLoaded) { callback?.(); return; }
  if (typeof google !== 'undefined' && google.translate) {
    translateWidgetLoaded = true;
    callback?.();
    return;
  }
  window.googleTranslateElementInit2 = () => {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element2');
    translateWidgetLoaded = true;
    callback?.();
  };
  if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
    script.async = true;
    document.head.appendChild(script);
  }
}
