<script>
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import CodeEditor from '$lib/components/workspace/CodeEditor.svelte';

  let { project = null, language = 'javascript' } = $props();
  let editor = $derived(getEditorState());
  let stepIndex = $state(0);
  let activeStep = $derived(project?.steps?.[stepIndex]);

  $effect(() => {
    const template = activeStep?.codeTemplate?.[language] || activeStep?.codeTemplate?.javascript;
    if (template) editor.code = template;
  });
</script>

{#if project}
  <div class="project-detail">
    <section class="guide">
      <div class="eyebrow">{project.difficulty} · {project.estimatedMinutes || '?'} min</div>
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <div class="steps">
        {#each project.steps || [] as step, index}
          <button class:active={index === stepIndex} onclick={() => stepIndex = index}>
            {index + 1}. {step.title}
          </button>
        {/each}
      </div>
      {#if activeStep}
        <h3>{activeStep.title}</h3>
        <p>{activeStep.description}</p>
        {#if activeStep.hints?.length}
          <details>
            <summary>Hints</summary>
            <ul>{#each activeStep.hints as hint}<li>{hint}</li>{/each}</ul>
          </details>
        {/if}
      {/if}
    </section>
    <section class="workspace">
      <CodeEditor />
    </section>
  </div>
{:else}
  <div class="empty-project">Select a project to begin.</div>
{/if}

<style>
  .project-detail { display: grid; grid-template-columns: 420px minmax(0, 1fr); height: 100%; min-height: 0; }
  .guide { padding: 20px; overflow: auto; border-right: 1px solid #1e293b; color: #cbd5e1; }
  .eyebrow { color: #38bdf8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
  h2, h3 { color: #e2e8f0; }
  p, li { color: #94a3b8; line-height: 1.55; }
  .steps { display: grid; gap: 6px; margin: 16px 0; }
  .steps button { text-align: left; padding: 8px; border-radius: 6px; border: 1px solid #334155; background: #111827; color: #cbd5e1; cursor: pointer; }
  .steps button.active { border-color: #6366f1; background: #172554; }
  .workspace { display: flex; min-width: 0; min-height: 0; }
  .empty-project { display: grid; place-items: center; height: 100%; color: #64748b; }
  @media (max-width: 980px) { .project-detail { grid-template-columns: 1fr; grid-template-rows: auto 360px; } }
</style>
