<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  import { doGTranslate, loadGoogleTranslate } from '$lib/lib/translate.js';

  let { open = false, onclose = () => {} } = $props();
  let loaded = $state(false);

  $effect(() => {
    if (open && !loaded) {
      loadGoogleTranslate(() => { loaded = true; });
    }
  });

  function handleLang(code) {
    doGTranslate('en|' + code);
    onclose();
  }
</script>

<Modal {open} {onclose}>
  <div class="lang-popup-body">
    <button class="gtranslate-option" onclick={() => handleLang('en')}>English</button>
    <button class="gtranslate-option" onclick={() => handleLang('th')}>Thai</button>
    <button class="gtranslate-option" onclick={() => handleLang('de')}>German</button>
    <button class="gtranslate-option" onclick={() => handleLang('es')}>Spanish</button>
    <div id="google_translate_element2" style="display:none;"></div>
  </div>
</Modal>

<style>
  .lang-popup-body { display: flex; flex-direction: column; gap: 4px; min-width: 200px; }
  .gtranslate-option { background: transparent; border: none; color: #e2e8f0; padding: 8px 12px; text-align: left; font-size: 14px; cursor: pointer; border-radius: 4px; }
  .gtranslate-option:hover { background: #1e293b; }
</style>
