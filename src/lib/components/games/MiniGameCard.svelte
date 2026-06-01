<script>
  import { GAME_CHALLENGES, isCorrectAnswer } from '$lib/lib/games.js';

  let { game } = $props();
  let score = $state(0);
  let index = $state(0);
  let input = $state('');
  let feedback = $state('');
  let selectedPieces = $state([]);
  let challenges = $derived(GAME_CHALLENGES[game.id] || []);
  let challenge = $derived(challenges[index % Math.max(1, challenges.length)] || {});
  let mode = $derived(game.mode || 'choice');

  function resetForNext() {
    input = '';
    feedback = '';
    selectedPieces = [];
    index += 1;
  }

  function submit(value = input) {
    const answer = challenge.answer || challenge.target;
    if (isCorrectAnswer(value, answer)) {
      score += 10;
      feedback = 'Correct';
      setTimeout(resetForNext, 500);
    } else {
      feedback = `Try again. Expected: ${answer}`;
    }
  }

  function addPiece(piece) {
    selectedPieces = [...selectedPieces, piece];
    input = selectedPieces.join('');
  }
</script>

<div class="mini-game">
  <div class="badge">{game.id}</div>
  <h1>{game.title}</h1>
  <p>{game.description}</p>
  <div class="challenge">
    <strong>{challenge.prompt || 'Challenge'}</strong>
    {#if challenge.target}
      <pre>{challenge.target}</pre>
    {/if}
  </div>
  {#if mode === 'choice'}
    <div class="choices">
      {#each challenge.choices || [] as choice}
        <button onclick={() => submit(choice)}>{choice}</button>
      {/each}
    </div>
  {:else if mode === 'order'}
    <div class="pieces">
      {#each challenge.pieces || [] as piece}
        <button onclick={() => addPiece(piece)}>{piece}</button>
      {/each}
    </div>
    <input bind:value={input} aria-label="Ordered answer" />
    <button onclick={() => submit()}>Check</button>
  {:else}
    <input bind:value={input} aria-label="Game answer" onkeydown={(event) => event.key === 'Enter' && submit()} />
    <button onclick={() => submit()}>Check</button>
  {/if}
  {#if feedback}
    <div class:ok={feedback === 'Correct'} class="feedback">{feedback}</div>
  {/if}
  <div class="score">Score: {score}</div>
</div>

<style>
  .mini-game { max-width: 640px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(245,158,11,0.18), rgba(15,23,42,0.9)); }
  .badge { color: #fbbf24; text-transform: uppercase; font-size: 12px; font-weight: 900; letter-spacing: 0.12em; }
  h1 { font-size: clamp(42px, 8vw, 88px); line-height: 0.9; margin: 10px 0; }
  p { color: #cbd5e1; line-height: 1.6; }
  button { padding: 10px 16px; background: #f59e0b; color: #111827; border: none; border-radius: 8px; font-weight: 900; cursor: pointer; }
  .challenge { margin: 18px 0; padding: 14px; border: 1px solid #334155; border-radius: 14px; background: rgba(15, 23, 42, 0.8); color: #e2e8f0; }
  pre { white-space: pre-wrap; color: #fef3c7; }
  .choices, .pieces { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  input { width: 100%; box-sizing: border-box; margin: 0 0 10px; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0a0f1e; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; }
  .feedback { margin-top: 12px; color: #fecaca; font-weight: 800; }
  .feedback.ok { color: #bbf7d0; }
  .score { margin-top: 16px; color: #fef3c7; font-weight: 800; }
</style>
