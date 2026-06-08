<script>
  let { courseTitle = null, phaseTitle = null, topicName = null, onresume = () => {} } = $props();
</script>

{#if courseTitle}
  <div class="resume">
    <span>Resume {courseTitle}{phaseTitle ? ` — ${phaseTitle}` : ''}{topicName ? `: ${topicName}` : ''}?</span>
    <button onclick={onresume}>Resume</button>
  </div>
{/if}

<style>
  .resume { display: flex; gap: 12px; align-items: center; padding: 12px 16px; border: 1px solid #fb923c; border-radius: 12px; background: #431407; color: #fed7aa; font-size: 13px; }
  button { padding: 6px 14px; background: #f97316; color: white; border: none; border-radius: 6px; font-weight: 800; cursor: pointer; flex-shrink: 0; }
  button:hover { background: #ea580c; }
</style>
