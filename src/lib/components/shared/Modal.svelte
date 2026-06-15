<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';

  let {
    open = false,
    onclose = () => {},
    title = '',
  }: {
    open?: boolean;
    onclose?: () => void;
    title?: string;
  } = $props();
</script>

<Dialog.Root bind:open onOpenChange={(val) => { if (!val) onclose(); }}>
  <Dialog.Content>
    {#if title}
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
    {/if}
    <slot />
  </Dialog.Content>
</Dialog.Root>
