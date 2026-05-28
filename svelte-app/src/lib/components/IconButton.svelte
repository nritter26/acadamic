<script lang="ts">
  let {
    onclick,
    label = '',
    children,
  } = $props();
</script>

<button
  onclick={onclick}
  title={label}
  class="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-light/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50"
>
  {@render children()}
</button>
