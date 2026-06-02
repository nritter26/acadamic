<script>
  let { open = false, onclose = () => {} } = $props();
</script>

{#if open}
  <div class="tutorial-quiz-overlay" onclick={onclose}>
    <div class="tutorial-quiz-paper" onclick={(e) => e.stopPropagation()}>
      <div class="tutorial-quiz-body">
        <h2>Quiz Time!</h2>
        <p>Interactive quiz content goes here when the tutorial engine is fully ported.</p>
        <button onclick={onclose}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .tutorial-quiz-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100; }
  .tutorial-quiz-paper { background: #0f172a; border: 1px solid #fb923c; border-radius: 16px; padding: 32px; width: min(500px, 90vw); max-height: 80vh; overflow: auto; }
  .tutorial-quiz-body { color: #e2e8f0; text-align: center; }
  .tutorial-quiz-body h2 { color: #fb923c; }
  .tutorial-quiz-body p { color: #cbd5e1; margin: 16px 0; }
  .tutorial-quiz-body button { padding: 8px 16px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
</style>
