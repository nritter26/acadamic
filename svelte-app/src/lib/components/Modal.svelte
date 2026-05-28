<script lang="ts">
  let {
    open = false,
    title = '',
    onclose,
    children,
  } = $props();

  let dialogEl: HTMLDialogElement;

  $effect(() => {
    if (open && dialogEl && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl && dialogEl.open) {
      dialogEl.close();
    }
  });

  function handleClose() {
    onclose?.();
  }
</script>

{#if open}
  <dialog
    bind:this={dialogEl}
    onclose={handleClose}
    class="bg-surface-dark text-gray-100 rounded-xl border border-surface-light/30 shadow-2xl backdrop:bg-black/60 max-w-lg w-full p-0"
  >
    <div class="flex items-center justify-between px-5 py-4 border-b border-surface-light/30">
      <h2 class="text-base font-semibold">{title}</h2>
      <button
        onclick={() => onclose?.()}
        class="text-gray-400 hover:text-white p-1 rounded hover:bg-surface-light/30 transition"
      >
        ✕
      </button>
    </div>
    <div class="p-5">
      {@render children()}
    </div>
  </dialog>
{/if}
