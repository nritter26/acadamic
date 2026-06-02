<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let { open = false, onclose = () => {} } = $props();
  let curr = $derived(getCurriculumState());
  let content = $state('');
  let loading = $state(false);

  async function loadCheatsheet() {
    loading = true;
    content = '';
    try {
      if (typeof cheatsheetData !== 'undefined' && cheatsheetData[curr.lang]) {
        const langData = cheatsheetData[curr.lang];
        if (curr.topic && langData[curr.topic]) {
          content = '<pre>' + langData[curr.topic] + '</pre>';
        } else {
          content = Object.entries(langData).map(([topic, text]) =>
            `<h3>${topic}</h3><pre>${text}</pre>`
          ).join('\n');
        }
      } else {
        const r = await fetch('/cheatsheet-data.js');
        const text = await r.text();
        content = '<pre>' + text.slice(0, 2000) + '</pre>';
      }
    } catch (e) {
      content = 'Failed to load cheatsheet: ' + e.message;
    }
    loading = false;
  }

  $effect(() => { if (open) loadCheatsheet(); });
</script>

<Modal {open} {onclose}>
  <h2>Cheatsheet — {curr.topic || curr.lang}</h2>
  {#if loading}
    <p>Loading cheatsheet...</p>
  {:else if content}
    <div class="cheatsheet-body">{@html content}</div>
  {:else}
    <p>No cheatsheet available for this topic.</p>
  {/if}
</Modal>

<style>
  .cheatsheet-body { max-height: 60vh; overflow-y: auto; font-size: 13px; line-height: 1.6; color: #e2e8f0; }
  .cheatsheet-body :global(pre) { background: #0a0f1e; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e2e8f0; }
  .cheatsheet-body :global(h3) { color: #6366f1; margin: 16px 0 8px; }
</style>
