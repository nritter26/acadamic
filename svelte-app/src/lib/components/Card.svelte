<script lang="ts">
  let {
    padding = true,
    class: className = '',
    children,
    ...rest
  } = $props();
</script>

<div
  class="bg-surface rounded-lg border border-surface-light/30 {padding ? 'p-4' : ''} {className}"
  {...rest}
>
  {@render children()}
</div>
