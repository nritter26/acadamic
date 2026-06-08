<script>
  let { course = null, state = null, ontopicclick = () => {} } = $props();
</script>

<div class="phase-nav">
  {#if course}
    {#each course.phases as phase}
      <div class="phase-group" class:phase-complete={state?.completedPhases?.includes(`${course.id}:${phase.id}`)}>
        <div class="phase-header">
          <span class="phase-title">{phase.title}</span>
          {#if state}
            <span class="phase-progress">
              {phase.topics.filter(t => state.completedTopics?.includes(`${course.id}:${t}`)).length}/{phase.topics.length}
            </span>
          {/if}
        </div>
        <div class="phase-topics">
          {#each phase.topics as topic, i}
            {@const isCompleted = state?.completedTopics?.includes(`${course.id}:${topic}`)}
            <button
              class="topic-btn"
              class:active={state?.currentPhase === phase.id && state?.currentTopic === i}
              class:topic-done={isCompleted}
              onclick={() => ontopicclick(phase.id, i)}
            >
              <span class="topic-status">{isCompleted ? '✅' : state?.currentPhase === phase.id && state?.currentTopic === i ? '▶' : '○'}</span>
              <span class="topic-name">{topic}</span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <div class="phase-empty">Select a course to begin</div>
  {/if}
</div>

<style>
  .phase-nav { padding: 8px 0; }
  .phase-group { margin-bottom: 4px; }
  .phase-complete .phase-title { color: #22c55e; }
  .phase-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e293b; }
  .phase-progress { font-size: 9px; color: #64748b; }
  .phase-topics { padding: 2px 0; }
  .topic-btn { display: flex; align-items: center; gap: 6px; width: 100%; text-align: left; background: transparent; border: none; padding: 5px 12px 5px 20px; font-size: 11px; color: #94a3b8; cursor: pointer; }
  .topic-btn:hover { background: #1e293b; color: #e2e8f0; }
  .topic-btn.active { color: #f97316; background: rgba(249,115,22,0.06); font-weight: 600; }
  .topic-done { color: #22c55e; }
  .topic-status { font-size: 9px; width: 16px; text-align: center; flex-shrink: 0; }
  .topic-name { line-height: 1.3; }
  .phase-empty { padding: 20px; color: #64748b; font-size: 12px; text-align: center; }
</style>
