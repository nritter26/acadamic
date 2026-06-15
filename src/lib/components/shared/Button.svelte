<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';

  let {
    onclick = undefined,
    variant = 'default' as 'default' | 'primary' | 'danger',
    size = 'sm' as 'sm' | 'default' | 'lg',
    ...rest
  }: {
    onclick?: () => void;
    variant?: 'default' | 'primary' | 'danger';
    size?: 'sm' | 'default' | 'lg';
    [key: string]: unknown;
  } = $props();

  const variantMap: Record<string, string> = {
    default: 'secondary',
    primary: 'default',
    danger: 'destructive',
  };
</script>

<Button {onclick} variant={variantMap[variant] || 'secondary'} {size} {...rest}>
  <slot />
</Button>
