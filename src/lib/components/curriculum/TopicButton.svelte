<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

  let { topic, phase, level = 'beginner', isCollapsed = false } = $props();
  let curr = $derived(getCurriculumState());
  let isActive = $derived(curr.topic === topic && curr.phase === phase);

  const levelColors = { beginner: '#22c55e', intermediate: '#f59e0b', expert: '#ef4444' };

  let btnId = $derived('btn-' + topic.replace(/\s/g, '').replace(/[&,]/g, ''));
</script>

<button
  id={btnId}
  class="topic-btn"
  class:active={isActive}
  class:hidden={isCollapsed}
  onclick={() => { curr.topic = topic; curr.phase = phase; }}
>
  <span class="dot" style="background: {levelColors[level] || '#64748b'}"></span>
  <span class="topic-name">{topic}</span>
</button>

<style>
  .topic-btn { display: flex; align-items: center; gap: 6px; width: 100%; background: transparent; border: none; color: #94a3b8; padding: 4px 8px 4px 20px; font-size: 11px; cursor: pointer; text-align: left; }
  .topic-btn:hover { background: #1e293b; color: #e2e8f0; }
  .topic-btn.active { background: #1e293b; color: #e2e8f0; border-left: 2px solid #6366f1; }
  .topic-btn.hidden { display: none; }
  .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .topic-name { flex: 1; }
</style>
