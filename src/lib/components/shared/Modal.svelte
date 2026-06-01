<script>
  let { open = false, onclose = () => {} } = $props();

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onclose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && open) onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />
{#if open}
  <div class="modal-overlay" onclick={handleBackdrop} role="presentation">
    <div class="modal-paper" onclick={(e) => e.stopPropagation()}>
      <button class="modal-close" onclick={onclose}>✕</button>
      <slot />
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
  }
  .modal-paper {
    background: #1e293b; border: 1px solid #334155;
    border-radius: 12px; max-width: 90vw; max-height: 90vh;
    overflow-y: auto; position: relative; padding: 24px;
  }
  .modal-close {
    position: absolute; top: 8px; right: 8px;
    background: none; border: none; color: #94a3b8;
    cursor: pointer; font-size: 18px; padding: 4px 8px;
  }
</style>
