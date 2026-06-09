<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);
  let input = $state('');

  $effect(() => { input = ''; });

  function submit() {
    ctrl.submit(input);
  }

  let charCount = $derived(input.length);
  let targetLen = $derived(ctrl.challenge.answer ? ctrl.challenge.answer.length : 0);
  let underTarget = $derived(charCount <= targetLen);
</script>

<div class="game-cg" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">code-golf</span>
    <span class="g-progress">{ctrl.progress.current}{#if ctrl.progress.total}/{ctrl.progress.total}{:else} ∞{/if}</span>
  </div>
  <h1>⛳ {game.title}</h1>
  <div class="g-prompt">{ctrl.challenge.prompt}</div>

  <div class="cg-counter">
    <div class="cg-count" class:cg-under={underTarget} class:cg-over={!underTarget}>{charCount}</div>
    <div class="cg-target">target ≤ {targetLen}</div>
  </div>

  <div class="cg-input-area">
    <input
      class="cg-input"
      bind:value={input}
      onkeydown={(e) => e.key === 'Enter' && submit()}
      placeholder="Type your solution..."
      disabled={ctrl.feedbackType === 'ok'}
    />
  </div>

  <button class="g-btn" onclick={submit} disabled={!input || ctrl.feedbackType === 'ok'}>Submit</button>

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
  .game-cg { max-width: 700px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(245,158,11,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0; }
  .g-prompt { color: #cbd5e1; margin-bottom: 16px; font-size: 14px; }
  .cg-counter { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; }
  .cg-count { font-size: 48px; font-weight: 900; font-family: 'JetBrains Mono', monospace; }
  .cg-under { color: #10b981; }
  .cg-over { color: #ef4444; animation: shake 0.3s ease; }
  .cg-target { font-size: 14px; color: #64748b; }
  .cg-input-area { margin-bottom: 12px; }
  .cg-input { width: 100%; padding: 12px; background: #0f172a; border: 2px solid #334155; border-radius: 8px; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 14px; box-sizing: border-box; }
  .cg-input:focus { outline: none; border-color: #f59e0b; }
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
