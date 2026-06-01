<script>
  let { onclick = null, variant = 'default', ...rest } = $props();
</script>

<button {onclick} class="btn btn-{variant}" {...rest}>
  <slot />
</button>

<style>
  .btn { padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; font-size: 12px; }
  .btn-default { background: #334155; color: #e2e8f0; }
  .btn-default:hover { background: #475569; }
  .btn-primary { background: #6366f1; color: #fff; }
  .btn-primary:hover { background: #4f46e5; }
  .btn-danger { background: #ef4444; color: #fff; }
  .btn-danger:hover { background: #dc2626; }
</style>
