<script>
  import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';
  import { getEditorState } from '$lib/stores/editor.svelte.js';
  import CodeEditor from '$lib/components/workspace/CodeEditor.svelte';
  import ChallengeTestRunner from './ChallengeTestRunner.svelte';

  let curr = $derived(getCurriculumState());
  let editor = $derived(getEditorState());
  let challenge = $state(null);
  let loading = $state(false);
  let error = $state('');

  async function loadChallenge() {
    loading = true;
    error = '';
    try {
      const response = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: curr.lang, topic: curr.topic, level: curr.level }),
      });
      challenge = await response.json();
      if (challenge?.code) editor.code = challenge.code;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="challenge-layout">
  <section class="challenge-panel">
    <h2>Code Lab</h2>
    <p>Generate a challenge for the current language and run its tests against your solution.</p>
    <button onclick={loadChallenge} disabled={loading}>{loading ? 'Loading...' : 'New Challenge'}</button>
    {#if error}<p class="error">{error}</p>{/if}
    {#if challenge}
      <h3>{challenge.title || 'Challenge'}</h3>
      <p>{challenge.description || challenge.prompt}</p>
    {/if}
  </section>
  <section class="challenge-editor">
    <CodeEditor />
  </section>
  <ChallengeTestRunner code={editor.code} tests={challenge?.tests || []} lang={curr.lang} />
</div>

<style>
  .challenge-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr) 360px; height: 100%; background: #0f172a; }
  .challenge-panel { padding: 18px; border-right: 1px solid #1e293b; color: #cbd5e1; overflow: auto; }
  .challenge-panel h2, .challenge-panel h3 { color: #e2e8f0; }
  .challenge-panel p { color: #94a3b8; line-height: 1.55; }
  .challenge-editor { display: flex; min-width: 0; min-height: 0; }
  button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  .error { color: #ef4444; }
  @media (max-width: 980px) { .challenge-layout { grid-template-columns: 1fr; grid-template-rows: auto 320px auto; } }
</style>
