<script>
  let { selectedText = '', x = 0, y = 0, visible = false, onexplain, onreview, onfix } = $props();

  function handleAction(action) {
    if (action === 'explain') onexplain?.(selectedText);
    else if (action === 'review') onreview?.(selectedText);
    else if (action === 'fix') onfix?.(selectedText);
  }
</script>

{#if visible && selectedText}
  <div
    class="code-action-toolbar"
    style="left: {x}px; top: {y}px;"
    role="toolbar"
    aria-label="Code actions"
  >
    <button class="action-btn" onclick={() => handleAction('explain')} title="Explain selected code">
      Explain
    </button>
    <button class="action-btn" onclick={() => handleAction('review')} title="Review selected code">
      Review
    </button>
    <button class="action-btn" onclick={() => handleAction('fix')} title="Fix selected code">
      Fix
    </button>
  </div>
{/if}

<style>
  .code-action-toolbar {
    position: fixed;
    z-index: 1000;
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transform: translateY(-100%);
    margin-top: -8px;
  }
  .action-btn {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    background: #334155;
    border: 1px solid #475569;
    border-radius: 4px;
    color: #e2e8f0;
    cursor: pointer;
    white-space: nowrap;
  }
  .action-btn:hover {
    background: #475569;
  }
</style>
