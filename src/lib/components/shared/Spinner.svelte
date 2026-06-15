<script>
  let { size = 20, color = '#6366f1' } = $props();
</script>

<span
  class="inline-block rounded-full animate-spin"
  style="width:{size}px;height:{size}px;border:2px solid {color}22;border-top-color:{color}"
></span>
