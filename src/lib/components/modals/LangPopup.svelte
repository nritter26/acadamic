<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  import { doGTranslate, loadGoogleTranslate, getCurrentLang } from '$lib/lib/translate.js';

  let { open = false, onclose = () => {} } = $props();
  let loaded = $state(false);
  let currentLang = $state('en');

  const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'th', label: 'ไทย (Thai)', flag: '🇹🇭' },
    { code: 'de', label: 'Deutsch (German)', flag: '🇩🇪' },
    { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'fr', label: 'Français (French)', flag: '🇫🇷' },
    { code: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵' },
    { code: 'ko', label: '한국어 (Korean)', flag: '🇰🇷' },
    { code: 'zh-CN', label: '中文 (Chinese Simplified)', flag: '🇨🇳' },
    { code: 'vi', label: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
    { code: 'pt', label: 'Português (Portuguese)', flag: '🇵🇹' },
    { code: 'ru', label: 'Русский (Russian)', flag: '🇷🇺' },
    { code: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦' },
  ];

  $effect(() => {
    if (open && !loaded) {
      loadGoogleTranslate(() => {
        loaded = true;
        currentLang = getCurrentLang();
      });
    }
    if (open) {
      currentLang = getCurrentLang();
    }
  });

  function handleLang(code) {
    doGTranslate('en|' + code);
    currentLang = code;
    onclose();
  }
</script>

<Modal {open} {onclose}>
  <div class="lang-popup-header">🌐 Select Language</div>
  <div class="lang-popup-body">
    {#each LANGUAGES as lang}
      <button
        class="gtranslate-option"
        class:active={currentLang === lang.code}
        onclick={() => handleLang(lang.code)}
      >
        <span class="lang-flag">{lang.flag}</span>
        <span class="lang-label">{lang.label}</span>
        {#if currentLang === lang.code}
          <span class="lang-check">✓</span>
        {/if}
      </button>
    {/each}
    <div class="lang-note">Translations are powered by Google Translate. Code blocks remain in English.</div>
  </div>
</Modal>

<style>
  .lang-popup-header { font-size: 14px; font-weight: 700; color: #e2e8f0; padding: 8px 12px 12px; border-bottom: 1px solid #1e293b; margin-bottom: 4px; }
  .lang-popup-body { display: flex; flex-direction: column; gap: 2px; min-width: 260px; }
  .gtranslate-option { display: flex; align-items: center; gap: 10px; background: transparent; border: none; color: #e2e8f0; padding: 10px 12px; text-align: left; font-size: 13px; cursor: pointer; border-radius: 6px; transition: background 0.15s; }
  .gtranslate-option:hover { background: #1e293b; }
  .gtranslate-option.active { background: rgba(99, 102, 241, 0.12); color: #a5b4fc; }
  .lang-flag { font-size: 18px; }
  .lang-label { flex: 1; }
  .lang-check { color: #6366f1; font-weight: 800; }
  .lang-note { font-size: 10px; color: #64748b; padding: 10px 12px 4px; border-top: 1px solid #1e293b; margin-top: 6px; font-style: italic; }
</style>
