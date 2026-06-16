<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getExecutionState } from '$lib/stores/execution.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';

  let ai = $derived(getAIState());
  let curr = $derived(getCurriculumState());
  let exec = $derived(getExecutionState());
  let editor = $derived(getEditorState());

  let visible = $state(false);
  let message = $state('');
  let inactivityTimer;
  let consecutiveFails = $state(0);
  let editsWithoutRun = $state(0);
  let lastCode = $state('');
  let hasRun = $state(false);

  const DISMISS_KEY = 'kodex_hint_dismissed';

  function isDismissed() {
    try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
  }

  function dismiss() {
    visible = false;
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch {}
  }

  function startInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (isDismissed()) return;
    if (!ai.editorCode || !ai.editorCode.trim()) return;
    inactivityTimer = setTimeout(() => {
      if (!isDismissed() && ai.editorCode?.trim()) {
        message = 'Devin: need a hint?';
        visible = true;
      }
    }, 30000);
  }

  function clearAllTimers() {
    clearTimeout(inactivityTimer);
  }

  $effect(() => {
    const code = editor.code || '';
    const prevCode = lastCode;

    if (code !== prevCode) {
      lastCode = code;
      if (!exec.running) {
        editsWithoutRun++;
        clearAllTimers();
        if (editsWithoutRun >= 3 && !hasRun) {
          message = 'Ready to test your code?';
          visible = true;
        }
      }
    }

    if (exec.running) {
      hasRun = true;
      clearAllTimers();
      visible = false;
    }

    if (exec.error) {
      consecutiveFails++;
      if (consecutiveFails >= 2 && ai.useAI) {
        message = 'Want me to explain the error?';
        visible = true;
      }
    } else if (exec.output && !exec.error) {
      consecutiveFails = 0;
      if (!visible) startInactivityTimer();
    }

    if (!exec.running && code.trim() && consecutiveFails === 0) {
      startInactivityTimer();
    }

    return () => clearAllTimers();
  });

  function askHint() {
    if (!ai.useAI) {
      ai.toggleAI();
      return;
    }
    visible = false;
    ai.addMessage(message, 'user');
    ai.panelOpen = true;
  }
</script>

{#if visible}
  <div class="hint-indicator-wrapper">
    <button class="hint-indicator" onclick={askHint}>
      {message}
    </button>
    <button class="hint-dismiss" onclick={dismiss} title="Dismiss">✕</button>
  </div>
{/if}

<style>
  .hint-indicator-wrapper { position: fixed; bottom: 60px; right: 16px; z-index: 499; display: flex; align-items: center; gap: 4px; }
  .hint-indicator { background: #f59e0b; color: #0b1120; border: none; border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .hint-indicator:hover { background: #fbbf24; }
  .hint-dismiss { background: #1e293b; color: #94a3b8; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .hint-dismiss:hover { background: #334155; }
</style>
