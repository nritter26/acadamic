<script lang="ts">
  let {
    variant = 'primary' as 'primary' | 'secondary' | 'ghost' | 'danger',
    size = 'md' as 'sm' | 'md' | 'lg',
    disabled = false,
    onclick,
    children,
    ...rest
  } = $props();

  const variants: Record<string, string> = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-surface-light hover:bg-surface-light/70 text-gray-200 border border-surface-light/50',
    ghost: 'hover:bg-surface-light/30 text-gray-300 hover:text-white',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
</script>

<button
  onclick={onclick}
  disabled={disabled}
  class="inline-flex items-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed {variants[variant]} {sizes[size]}"
  {...rest}
>
  {@render children()}
</button>
