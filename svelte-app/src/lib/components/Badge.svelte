<script lang="ts">
  let {
    variant = 'default' as 'default' | 'success' | 'warning' | 'error' | 'info',
    children,
  } = $props();

  const colors: Record<string, string> = {
    default: 'bg-gray-500/10 text-gray-400',
    success: 'bg-green-500/10 text-green-400',
    warning: 'bg-amber-500/10 text-amber-400',
    error: 'bg-red-500/10 text-red-400',
    info: 'bg-blue-500/10 text-blue-400',
  };
</script>

<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {colors[variant]}">
  {@render children()}
</span>
