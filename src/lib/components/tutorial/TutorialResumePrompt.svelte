<script>
  let { lesson = null, onresume = () => {} } = $props();
</script>

{#if lesson}
  <div class="resume">
    <span>Resume {lesson}?</span>
    <button onclick={onresume}>Resume</button>
  </div>
{/if}

<style>
  .resume { display: flex; gap: 12px; align-items: center; padding: 12px; border: 1px solid #fb923c; border-radius: 12px; background: #431407; color: #fed7aa; }
  button { padding: 6px 12px; background: #f97316; color: white; border: none; border-radius: 6px; font-weight: 800; }
</style>
