<script>
  let { size = 20, color = '#6366f1' } = $props();
</script>

<span class="spinner" style="width:{size}px;height:{size}px;border-color:{color}22;border-top-color:{color}"></span>

<style>
  .spinner { display: inline-block; border-width: 2px; border-style: solid; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
