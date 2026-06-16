<script>
  let { code = '', lines = [], onClose, onHighlightLine } = $props();

  let currentIndex = $state(0);
  let autoPlay = $state(false);
  let autoInterval;

  let codeLines = $derived(code.split('\n'));

  $effect(() => {
    onHighlightLine?.(currentIndex);
  });

  $effect(() => {
    if (autoPlay) {
      autoInterval = setInterval(() => {
        if (currentIndex < codeLines.length - 1) {
          currentIndex++;
        } else {
          autoPlay = false;
        }
      }, 3000);
    } else {
      clearInterval(autoInterval);
    }
    return () => clearInterval(autoInterval);
  });

  function goNext() {
    if (currentIndex < codeLines.length - 1) currentIndex++;
  }

  function goPrev() {
    if (currentIndex > 0) currentIndex--;
  }

  function toggleAutoPlay() {
    autoPlay = !autoPlay;
  }
</script>

<div class="step-through">
  <div class="st-header">
    <span class="st-title">Step-through ({currentIndex + 1}/{codeLines.length})</span>
    <button class="st-close" onclick={onClose}>✕</button>
  </div>
  <div class="st-code">
    {#each codeLines as line, i}
      <div class="st-line" class:st-line-active={i === currentIndex}>
        <span class="st-line-num">{i + 1}</span>
        <code>{line}</code>
      </div>
    {/each}
  </div>
  <div class="st-explanation">
    <strong>Line {currentIndex + 1}:</strong> {lines[currentIndex]?.explanation || 'Select a line to see its explanation.'}
  </div>
  {#if lines.length > 0}
    <div class="st-controls">
      <button class="st-btn" onclick={goPrev} disabled={currentIndex === 0}>Previous</button>
      <button class="st-btn" onclick={toggleAutoPlay}>{autoPlay ? 'Pause' : 'Auto-play'}</button>
      <button class="st-btn" onclick={goNext} disabled={currentIndex === codeLines.length - 1}>Next</button>
    </div>
  {/if}
</div>

<style>
  .step-through { border: 1px solid #334155; border-radius: 6px; margin: 8px 12px; overflow: hidden; }
  .st-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #1e293b; font-size: 11px; font-weight: 700; color: #94a3b8; }
  .st-close { background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; }
  .st-code { max-height: 200px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.6; padding: 4px 0; background: #0a0f1e; }
  .st-line { display: flex; align-items: flex-start; padding: 1px 8px; }
  .st-line-active { background: rgba(99, 102, 241, 0.15); border-left: 2px solid #6366f1; }
  .st-line-num { width: 24px; flex-shrink: 0; color: #64748b; text-align: right; margin-right: 8px; font-size: 10px; }
  .st-line code { color: #e2e8f0; white-space: pre; }
  .st-explanation { padding: 8px 10px; font-size: 11px; color: #cbd5e1; background: #0f172a; border-top: 1px solid #1e293b; min-height: 32px; }
  .st-controls { display: flex; gap: 6px; padding: 6px 10px; border-top: 1px solid #1e293b; background: #0f172a; }
  .st-btn { padding: 4px 10px; font-size: 10px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; cursor: pointer; }
  .st-btn:hover:not(:disabled) { background: #334155; }
  .st-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
