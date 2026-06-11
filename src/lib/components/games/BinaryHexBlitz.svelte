<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);
  let input = $state('');

  $effect(() => { input = ''; });

  function submit() {
    ctrl.submit(input);
  }
</script>

<div class="game-bhb" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">binary-hex-blitz</span>
    <span class="g-progress">{ctrl.progress.current}{#if ctrl.progress.total}/{ctrl.progress.total}{:else} ∞{/if}</span>
  </div>
  <h1>💠 {game.title}</h1>
  <div class="g-prompt">{ctrl.challenge.prompt}</div>

  <div class="bhb-input-row">
    <input
      class="bhb-input"
      bind:value={input}
      onkeydown={(e) => e.key === 'Enter' && submit()}
      placeholder="Type conversion..."
      disabled={ctrl.feedbackType === 'ok'}
    />
    <button class="g-btn" onclick={submit} disabled={!input || ctrl.feedbackType === 'ok'}>Check</button>
  </div>

  <details class="bhb-ref">
    <summary class="bhb-ref-summary">Conversion Reference</summary>
    <div class="bhb-ref-grid">
      <div>Hex</div><div>Dec</div><div>Binary</div>
      <div>0x0</div><div>0</div><div>0000</div>
      <div>0x1</div><div>1</div><div>0001</div>
      <div>0x2</div><div>2</div><div>0010</div>
      <div>0x3</div><div>3</div><div>0011</div>
      <div>0x4</div><div>4</div><div>0100</div>
      <div>0x5</div><div>5</div><div>0101</div>
      <div>0x6</div><div>6</div><div>0110</div>
      <div>0x7</div><div>7</div><div>0111</div>
      <div>0x8</div><div>8</div><div>1000</div>
      <div>0x9</div><div>9</div><div>1001</div>
      <div>0xA</div><div>10</div><div>1010</div>
      <div>0xB</div><div>11</div><div>1011</div>
      <div>0xC</div><div>12</div><div>1100</div>
      <div>0xD</div><div>13</div><div>1101</div>
      <div>0xE</div><div>14</div><div>1110</div>
      <div>0xF</div><div>15</div><div>1111</div>
    </div>
  </details>

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
  .game-bhb { max-width: 700px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(59,130,246,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0; }
  .g-prompt { color: #cbd5e1; margin-bottom: 16px; font-size: 18px; font-weight: 700; }
  .bhb-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .bhb-input { flex: 1; padding: 12px; background: #0f172a; border: 2px solid #334155; border-radius: 8px; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 18px; }
  .bhb-input:focus { outline: none; border-color: #3b82f6; }
  .bhb-ref { margin-bottom: 12px; }
  .bhb-ref-summary { cursor: pointer; color: #64748b; font-size: 12px; font-weight: 700; }
  .bhb-ref-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 8px; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; margin-top: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
  .bhb-ref-grid div { padding: 2px 4px; color: #94a3b8; }
  .g-btn { padding: 10px 20px; background: #f59e0b; color: #111827; border: none; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; }
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
