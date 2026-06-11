<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);

  let pool = $state([]);
  let placed = $state([]);

  $effect(() => {
    const p = ctrl.challenge.pieces;
    if (p) {
      pool = [...p].sort(() => Math.random() - 0.5);
      placed = [];
    }
  });

  function placePiece(piece) {
    pool = pool.filter(p => p !== piece);
    placed = [...placed, piece];
  }

  function removePiece(idx) {
    const piece = placed[idx];
    placed = placed.filter((_, i) => i !== idx);
    pool = [...pool, piece];
  }

  function handleSubmit() {
    ctrl.submit(placed.join('\n'));
  }

  function clearAll() {
    pool = [...pool, ...placed];
    placed = [];
  }
</script>

<div class="game-cs" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">code-scramble</span>
    <span class="g-progress">{ctrl.progress.current}{#if ctrl.progress.total}/{ctrl.progress.total}{:else} ∞{/if}</span>
  </div>
  <h1>{game.title}</h1>
  <div class="g-prompt">{ctrl.challenge.prompt}</div>

  <div class="cs-zone cs-answer">
    <div class="cs-label">Your solution:</div>
    <div class="cs-slots">
      {#each placed as piece, i}
        <button class="cs-slot" onclick={() => removePiece(i)}>{piece}</button>
      {/each}
      {#if placed.length === 0}
        <span class="cs-placeholder">Click pieces below to place them here</span>
      {/if}
    </div>
  </div>

  {#if pool.length > 0}
    <div class="cs-zone cs-pool">
      <div class="cs-label">Available pieces:</div>
      <div class="cs-chips">
        {#each pool as piece}
          <button class="cs-chip" onclick={() => placePiece(piece)}>{piece}</button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="cs-actions">
    <button class="g-btn" onclick={handleSubmit} disabled={placed.length === 0}>Check</button>
    <button class="g-btn g-btn-ghost" onclick={clearAll} disabled={placed.length === 0}>Clear</button>
  </div>

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
  .game-cs { max-width: 700px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(245,158,11,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0; }
  .g-prompt { color: #cbd5e1; margin-bottom: 16px; font-size: 14px; }

  .cs-zone { margin-bottom: 12px; }
  .cs-label { font-size: 11px; font-weight: 700; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .cs-answer { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; min-height: 60px; }
  .cs-slots { display: flex; flex-direction: column; gap: 4px; font-family: 'JetBrains Mono', monospace; }
  .cs-slot { text-align: left; padding: 6px 10px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #f59e0b; font-size: 13px; cursor: pointer; }
  .cs-slot:hover { background: #334155; }
  .cs-placeholder { color: #475569; font-style: italic; font-size: 12px; }
  .cs-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .cs-chip { padding: 6px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 13px; cursor: pointer; }
  .cs-chip:hover { border-color: #f59e0b; background: #2d2438; }
  .cs-actions { display: flex; gap: 8px; margin-bottom: 12px; }

  .g-btn { padding: 10px 20px; background: #f59e0b; color: #111827; border: none; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; }
  .g-btn:hover { transform: scale(1.03); }
  .g-btn:disabled { opacity: 0.5; cursor: default; }
  .g-btn-ghost { background: transparent; border: 1px solid #334155; color: #94a3b8; }
  .g-btn-ghost:hover { border-color: #f59e0b; color: #e2e8f0; }
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
