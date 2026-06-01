<script>
  import { onMount } from 'svelte';
  import { DEFAULT_TUTORIAL_LESSONS, getLessonById } from '$lib/lib/tutorial.js';
  import { getTutorialState } from '$lib/stores/tutorial.svelte.js';

  let tutorial = $derived(getTutorialState());
  let activeLesson = $derived(getLessonById(tutorial.state.currentLesson, DEFAULT_TUTORIAL_LESSONS));
  let activeStep = $derived(activeLesson.steps?.[tutorial.state.currentStep] || activeLesson.steps?.[0]);

  onMount(() => tutorial.load());
</script>

<div class="tutorial-player">
  <section>
    <div class="eyebrow">Guided Path</div>
    <h1>Learn Code</h1>
    <p>Resume focused lessons and checkpoints. This Svelte shell replaces the legacy tutorial entrypoint and keeps progress in local storage.</p>
  </section>
  <div class="lessons">
    {#each DEFAULT_TUTORIAL_LESSONS as lesson}
      <article class:complete={tutorial.state.completedLessons.includes(lesson.id)}>
        <h2>{lesson.title}</h2>
        <p>{lesson.summary}</p>
        <button onclick={() => tutorial.startLesson(lesson.id)}>
          {tutorial.state.currentLesson === lesson.id ? 'Resume' : 'Start'}
        </button>
        <button class="secondary" onclick={() => tutorial.completeLesson(lesson.id)}>Mark Complete</button>
      </article>
    {/each}
  </div>
  {#if activeLesson && activeStep}
    <section class="player">
      <div class="progress">Step {tutorial.state.currentStep + 1} / {activeLesson.steps.length}</div>
      <h2>{activeLesson.title}: {activeStep.title}</h2>
      <p>{activeStep.body}</p>
      <div class="player-actions">
        <button class="secondary" onclick={() => tutorial.previousStep()}>Previous</button>
        <button onclick={() => tutorial.nextStep(activeLesson.steps.length)}>Next</button>
        <button class="secondary" onclick={() => tutorial.completeLesson(activeLesson.id)}>Complete Lesson</button>
      </div>
    </section>
  {/if}
</div>

<style>
  .tutorial-player { min-height: 100%; overflow: auto; background: linear-gradient(135deg, #111827, #431407); color: #e2e8f0; padding: clamp(24px, 5vw, 56px); box-sizing: border-box; }
  .eyebrow { color: #fb923c; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
  h1 { margin: 8px 0; font-size: clamp(42px, 9vw, 96px); line-height: 0.9; }
  section p { max-width: 720px; color: #fed7aa; line-height: 1.6; }
  .lessons { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 28px; }
  article { padding: 20px; border: 1px solid rgba(251,146,60,0.35); border-radius: 18px; background: rgba(15,23,42,0.72); }
  article.complete { border-color: #22c55e; }
  article p { color: #cbd5e1; line-height: 1.55; }
  button { margin-right: 8px; padding: 8px 14px; background: #f97316; color: #fff; border: none; border-radius: 6px; font-weight: 800; cursor: pointer; }
  button.secondary { background: #1e293b; }
  .player { margin-top: 24px; padding: 24px; border: 1px solid rgba(251,146,60,0.45); border-radius: 20px; background: rgba(15,23,42,0.82); }
  .player h2 { margin-top: 8px; }
  .progress { color: #fb923c; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; }
  .player-actions { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
