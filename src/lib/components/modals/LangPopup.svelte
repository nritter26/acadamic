<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  import { getCurrentLang, setCurrentLang } from '$lib/lib/translate.js';

  let { open = false, onclose = () => {} } = $props();
  let currentLang = $state('en');

  $effect(() => {
    if (open) {
      currentLang = getCurrentLang();
    }
  });

  function handleLang(code) {
    setCurrentLang(code);
    currentLang = code;
    onclose();
  }
</script>

<Modal {open} {onclose}>
  <div class="lang-popup-header">🌐 เลือกภาษา / Select Language</div>
  <div class="lang-popup-body">
    <button
      class="gtranslate-option"
      class:active={currentLang === 'en'}
      onclick={() => handleLang('en')}
    >
      <span class="lang-flag">🇬🇧</span>
      <span class="lang-label">English</span>
      {#if currentLang === 'en'}
        <span class="lang-check">✓</span>
      {/if}
    </button>
    <button
      class="gtranslate-option"
      class:active={currentLang === 'th'}
      onclick={() => handleLang('th')}
    >
      <span class="lang-flag">🇹🇭</span>
      <span class="lang-label">ไทย (Thai)</span>
      {#if currentLang === 'th'}
        <span class="lang-check">✓</span>
      {/if}
    </button>
    <div class="lang-note">Switch between English and Thai curriculum content. Code blocks remain in English.</div>
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
