<script lang="ts">
  let {
    tabs = [] as Array<{ id: string; label: string }>,
    active = '',
    onchange,
  } = $props();
</script>

<div class="flex border-b border-surface-light/30 gap-0">
  {#each tabs as tab}
    <button
      onclick={() => onchange?.(tab.id)}
      class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
        {active === tab.id
          ? 'border-blue-400 text-blue-400'
          : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}"
    >
      {tab.label}
    </button>
  {/each}
</div>
