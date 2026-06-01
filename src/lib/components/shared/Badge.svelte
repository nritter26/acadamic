<script>
  let { level = 'beginner' } = $props();
  const colors = { beginner: '#22c55e', intermediate: '#f59e0b', expert: '#ef4444' };
</script>

<span class="badge" style="background: {colors[level] || '#64748b'}">{level}</span>

<style>
  .badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 8px; font-weight: 700; color: #fff; text-transform: uppercase; }
</style>
