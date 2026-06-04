<script>
  import InlineMCQ from './InlineMCQ.svelte';
  import FillBlank from './FillBlank.svelte';
  import FixBug from './FixBug.svelte';
  import ReorderLines from './ReorderLines.svelte';

  let { exercises = [] } = $props();

  let completed = $state(new Set());

  function markDone(i) {
    completed = new Set([...completed, i]);
  }
</script>

<div class="exercise-group">
  <div class="eg-header">
    <span class="eg-title">Check Your Understanding</span>
    <span class="eg-count">{completed.size}/{exercises.length}</span>
  </div>
  <div class="eg-list">
    {#each exercises as exercise, i}
      <div class="eg-item" class:done={completed.has(i)}>
        <div class="eg-item-header">
          <span class="eg-item-num">{i + 1}</span>
          <span class="eg-item-label">{exercise.type.replace('-', ' ')}</span>
          {#if completed.has(i)}
            <span class="eg-item-check">&#10003;</span>
          {/if}
        </div>
        {#if exercise.type === 'mcq'}
          <InlineMCQ {exercise} oncomplete={() => markDone(i)} />
        {:else if exercise.type === 'fill-blank'}
          <FillBlank {exercise} oncomplete={() => markDone(i)} />
        {:else if exercise.type === 'fix-bug'}
          <FixBug {exercise} oncomplete={() => markDone(i)} />
        {:else if exercise.type === 'reorder'}
          <ReorderLines {exercise} oncomplete={() => markDone(i)} />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .exercise-group {
    border-top: 1px solid #334155;
    margin-top: 24px;
    padding-top: 24px;
  }
  .eg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .eg-title {
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
  }
  .eg-count {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
  }
  .eg-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .eg-item.done {
    opacity: 0.65;
  }
  .eg-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .eg-item-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
  }
  .eg-item-label {
    font-size: 13px;
    font-weight: 600;
    color: #cbd5e1;
    text-transform: capitalize;
  }
  .eg-item-check {
    margin-left: auto;
    font-size: 14px;
    color: #22c55e;
  }
</style>
