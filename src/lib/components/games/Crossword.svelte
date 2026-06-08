<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);
  let cells = $state([]);
  let input = $state('');

  $effect(() => {
    const answer = ctrl.challenge.answer || '';
    cells = answer.split('').map(() => '');
    input = '';
  });

  $effect(() => {
    input = cells.join('').toLowerCase();
    const answer = ctrl.challenge.answer || '';
    if (input.length === answer.length && input === answer.toLowerCase()) {
      ctrl.submit(input);
    }
  });

  function handleInput(i, e) {
    if (ctrl.feedbackType === 'ok') return;
    cells[i] = e.target.value.toLowerCase().slice(0, 1);
  }

  function keydown(e) {
    if (ctrl.feedbackType === 'ok') return;
    if (e.key === 'Enter' && input) ctrl.submit(input);
  }
</script>

<div class="game-cw" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">crossword</span>
    <span class="g-progress">{ctrl.progress.current}/{ctrl.progress.total}</span>
  </div>
  <h1>📝 {game.title}</h1>

  <div class="cw-clue">{ctrl.challenge.prompt}</div>

  <div class="cw-grid">
    {#each cells as cell, i}
      <input
        class="cw-cell"
        class:cw-filled={cells[i]}
        class:cw-correct={ctrl.feedbackType === 'ok'}
        value={cells[i]}
        oninput={(e) => handleInput(i, e)}
        onkeydown={keydown}
        maxlength="1"
        disabled={ctrl.feedbackType === 'ok'}
      />
    {/each}
  </div>

  <button class="g-btn" onclick={() => ctrl.submit(input)} disabled={!input || ctrl.feedbackType === 'ok'}>Check</button>

  {#if ctrl.feedback}
    <div class="g-feedback" class:ok={ctrl.feedbackType === 'ok'} class:wrong={ctrl.feedbackType === 'wrong'}>{ctrl.feedback}</div>
  {/if}

  <div class="g-footer">
    {#if ctrl.streak > 0}<span class="g-streak">🔥 {ctrl.streak}</span>{/if}
    <span class="g-score">Score: {ctrl.score}</span>
    <button class="g-btn g-btn-sm" onclick={ctrl.reset}>↺ Restart</button>
  </div>
</div>

{#if ctrl.showScorePopup}<div class="xp-popup">+10 XP</div>{/if}
{#if ctrl.showStreakPopup}<div class="streak-popup">{ctrl.streakPopupText}</div>{/if}

<style>
  .game-cw { max-width: 700px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(139,92,246,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0; }
  .cw-clue { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; margin-bottom: 16px; color: #e2e8f0; font-size: 14px; }
  .cw-grid { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-bottom: 16px; padding: 16px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; }
  .cw-cell { width: 36px; height: 40px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; text-transform: uppercase; background: #1e293b; border: 2px solid #334155; border-radius: 4px; color: #e2e8f0; }
  .cw-cell:focus { outline: none; border-color: #8b5cf6; }
  .cw-filled { background: #2d2438; border-color: #6366f1; }
  .cw-correct { border-color: #10b981 !important; }
  .cw-wrong-cell { border-color: #ef4444 !important; }
  .g-btn { padding: 10px 20px; background: #f59e0b; color: #111827; border: none; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; }
  .g-btn:disabled { opacity: 0.5; cursor: default; }
  .g-btn-sm { padding: 6px 14px; font-size: 11px; }
  .g-feedback { text-align: center; font-weight: 800; font-size: 14px; margin-bottom: 8px; }
  .ok { color: #10b981; }
  .wrong { color: #ef4444; }
  .g-footer { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
  .g-streak { font-size: 14px; font-weight: 900; color: #f59e0b; }
  .g-score { flex: 1; font-weight: 800; color: #fef3c7; }
  .xp-popup { position: fixed; top: 40%; left: 50%; transform: translateX(-50%); font-size: 22px; font-weight: 900; color: #f59e0b; pointer-events: none; animation: float-up 0.8s ease forwards; z-index: 100; }
  .streak-popup { position: fixed; top: 46%; left: 50%; transform: translateX(-50%); font-size: 18px; font-weight: 900; color: #ec4899; pointer-events: none; animation: float-up 1s ease forwards; z-index: 100; }
</style>
