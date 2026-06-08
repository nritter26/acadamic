<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);
  let selected = $state(null);
  let revealed = $state(true);

  $effect(() => { selected = null; revealed = true; });

  function hideAndPick(choice) {
    if (ctrl.feedbackType === 'ok') return;
    selected = choice;
    ctrl.submit(choice);
  }
</script>

<div class="game-sr" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">speed-read</span>
    <span class="g-progress">{ctrl.progress.current}/{ctrl.progress.total}</span>
  </div>
  <h1>{game.title}</h1>

  {#if revealed}
    <div class="sr-passage"><pre>{ctrl.challenge.prompt}</pre></div>
    <button class="g-btn" onclick={() => { revealed = false; }}>I've read it →</button>
  {:else}
    <div class="sr-passage sr-hidden">Passage hidden</div>
    <div class="g-prompt">What did the code do?</div>
    <div class="sr-choices">
      {#each (ctrl.challenge.choices || []) as choice}
        <button
          class="sr-choice"
          class:sr-correct={ctrl.feedbackType === 'ok' && choice === ctrl.challenge.answer}
          class:sr-wrong={ctrl.feedbackType === 'wrong' && selected === choice}
          onclick={() => hideAndPick(choice)}
          disabled={ctrl.feedbackType === 'ok'}
        >{choice}</button>
      {/each}
    </div>
  {/if}

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
  .game-sr { max-width: 700px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(245,158,11,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0; }
  .sr-passage { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .sr-passage pre { white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #e2e8f0; margin: 0; }
  .sr-hidden { text-align: center; color: #475569; font-style: italic; padding: 40px 16px; }
  .g-prompt { color: #94a3b8; margin-bottom: 12px; font-size: 14px; }
  .sr-choices { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
  .sr-choice { padding: 12px; background: #1e293b; border: 2px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 13px; cursor: pointer; text-align: left; }
  .sr-choice:hover:not(:disabled) { border-color: #f59e0b; }
  .sr-choice:disabled { cursor: default; }
  .sr-correct { border-color: #10b981 !important; background: rgba(16,185,129,0.08); }
  .sr-wrong { border-color: #ef4444 !important; background: rgba(239,68,68,0.08); }
  .g-feedback { text-align: center; font-weight: 800; font-size: 14px; margin-bottom: 8px; }
  .ok { color: #10b981; }
  .wrong { color: #ef4444; }
  .g-footer { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
  .g-streak { font-size: 14px; font-weight: 900; color: #f59e0b; }
  .g-score { flex: 1; font-weight: 800; color: #fef3c7; }
  .g-btn { padding: 10px 20px; background: #f59e0b; color: #111827; border: none; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; }
  .g-btn-sm { padding: 6px 14px; font-size: 11px; }
  .xp-popup { position: fixed; top: 40%; left: 50%; transform: translateX(-50%); font-size: 22px; font-weight: 900; color: #f59e0b; pointer-events: none; animation: float-up 0.8s ease forwards; z-index: 100; }
  .streak-popup { position: fixed; top: 46%; left: 50%; transform: translateX(-50%); font-size: 18px; font-weight: 900; color: #ec4899; pointer-events: none; animation: float-up 1s ease forwards; z-index: 100; }
</style>
