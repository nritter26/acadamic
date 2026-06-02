<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  let { open = false, onclose = () => {} } = $props();
</script>

<Modal {open} {onclose}>
  <div class="kodex-paper-body">
    <pre class="kodex-ascii" aria-label="Kodex ASCII art">              ▄              ▄
              ▐█▌            ▐█▌
              ▐█▌            ▐█▌
               █▌    ▄▄▄▄    ▐█
              ▐██   ██████   ██▌
            ▄███▌  ██▄▄▄▄██  ▐███▄
           ▐████   ████████   ████▌
           █████▌  ▀██████▀  ▐█████
          ███████▄  ▀████▀  ▄██████
         ▐██████████▄▄▄▄▄▄█████████▌
         ███████████████████████████
         ███████████████████████████
         ▐████████▀      ▀████████▌
          ███████   ▄▄▄▄   ███████
          ▐██████  ██████  ██████▌
           ███████ ██████ ███████
            ████████████████████
            ▐██████████████████▌
             ██████████████████
              ▀██████████████▀
               ▄█████▄▄▄█████▄
              ▐███████████████▌
              █████████████████
              █████████████████
              ██████▀    ▀██████
             ▐█████      ██████▌
             █████▌      ▐██████
            ██████        ███████
           ▐█████▌        ▐██████▌
           ██████          ███████
           ██████          ███████</pre>
    <div class="kodex-desc">
      <h2>Welcome to Kodex's Lab!</h2>
      <p>An interactive multi-language programming textbook and code playground. Learn 15+ programming languages with built-in code execution, quizzes, challenges, an AI assistant, and a PostgreSQL schema designer.</p>
      <div class="kodex-features">
        <span>15+ Languages</span>
        <span>Live Code Execution</span>
        <span>Devin AI</span>
        <span>Code Challenges</span>
        <span>Schema Designer</span>
        <span>Quiz Mode</span>
      </div>
    </div>
  </div>
</Modal>

<style>
  .kodex-paper-body { text-align: center; }
  .kodex-ascii { font-size: 7px; line-height: 1.1; color: var(--accent, #6366f1); user-select: none; white-space: pre; overflow-x: auto; }
  .kodex-desc { margin-top: 16px; }
  .kodex-desc h2 { color: #e2e8f0; font-size: 18px; margin: 0 0 8px; }
  .kodex-desc p { color: #94a3b8; font-size: 13px; line-height: 1.5; max-width: 500px; margin: 0 auto 16px; }
  .kodex-features { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .kodex-features span { background: #1e293b; padding: 4px 10px; border-radius: 6px; font-size: 12px; color: #e2e8f0; }
</style>
