<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  let { open = false, onclose = () => {} } = $props();
</script>

<Modal {open} {onclose}>
  <div class="kodex-paper-body">
    <div class="kodex-desc">
      <h2>Kodex's Lab</h2>
      <p>An interactive multi-language programming textbook and code playground. Learn 20+ programming languages with hands-on exercises, real-time code execution, interactive quizzes, and an AI-powered tutor.</p>
      <div class="kodex-features">
        <span>20+ Languages</span>
        <span>Real-time Code Execution</span>
        <span>AI Tutor</span>
        <span>Interactive Quizzes</span>
        <span>Schema Designer</span>
        <span>Code Challenges</span>
      </div>
    </div>
  </div>
</Modal>

<style>
  .kodex-paper-body { text-align: center; }
  .kodex-desc { margin-top: 16px; }
  .kodex-desc h2 { color: #e2e8f0; font-size: 18px; margin: 0 0 8px; }
  .kodex-desc p { color: #94a3b8; font-size: 13px; line-height: 1.5; max-width: 500px; margin: 0 auto 16px; }
  .kodex-features { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .kodex-features span { background: #1e293b; padding: 4px 10px; border-radius: 6px; font-size: 12px; color: #e2e8f0; }
</style>
