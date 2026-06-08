<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);
  let selected = $state(null);
  let timeLeft = $state(15);
  let timerId = $state(null);
  let timeUp = $state(false);

  $effect(() => {
    ctrl.challenge;
    selected = null;
    timeLeft = 15;
    timeUp = false;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      timeLeft = Math.max(0, timeLeft - 1);
      if (timeLeft === 0) timeUp = true;
    }, 1000);
    return () => { if (timerId) clearInterval(timerId); };
  });

  function pick(choice) {
    if (ctrl.feedbackType === 'ok') return;
    selected = choice;
    if (timerId) clearInterval(timerId);
    ctrl.submit(choice);
  }

  let timerPct = $derived((timeLeft / 15) * 100);
  let timerColor = $derived(timeLeft > 8 ? '#10b981' : timeLeft > 4 ? '#f59e0b' : '#ef4444');
  let isCorrectSyntax = $derived(ctrl.challenge.prompt?.toLowerCase().includes('valid'));
</script>

<div class="game-ss" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">syntax-sprint</span>
    <span class="g-progress">{ctrl.progress.current}/{ctrl.progress.total}</span>
  </div>
  <div class="ss-timer" class:ss-danger={timeLeft <= 4}>
    <div class="ss-timer-track"><div class="ss-timer-fill" style="width:{timerPct}%; background:{timerColor}"></div></div>
    <span class="ss-timer-label" style="color:{timerColor}">{timeUp ? 'TIME!' : timeLeft + 's'}</span>
  </div>
  <h1>{game.title}</h1>
  <div class="ss-q">{ctrl.challenge.prompt}</div>

  <div class="ss-cards">
    {#each (ctrl.challenge.choices || []) as choice}
      <button
        class="ss-card"
        class:ss-card-correct={ctrl.feedbackType === 'ok' && choice === ctrl.challenge.answer}
        class:ss-card-wrong={ctrl.feedbackType === 'wrong' && selected === choice}
        class:ss-card-reveal={ctrl.feedbackType === 'wrong' && choice === ctrl.challenge.answer}
        onclick={() => pick(choice)}
        disabled={ctrl.feedbackType === 'ok'}
      >
        <div class="ss-card-label">{isCorrectSyntax ? 'Valid' : 'Invalid'}?</div>
        <pre class="ss-card-code"><code>{choice}</code></pre>
        {#if ctrl.feedbackType === 'ok' && choice === ctrl.challenge.answer}
          <div class="ss-card-badge ss-badge-correct">✓ Correct</div>
        {/if}
        {#if ctrl.feedbackType === 'wrong' && choice === ctrl.challenge.answer}
          <div class="ss-card-badge ss-badge-reveal">← Correct answer</div>
        {/if}
      </button>
    {/each}
  </div>

  {#if timeUp && !ctrl.feedbackType}
    <div class="ss-timeout">⏰ Time's up! Keep going.</div>
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
  .game-ss { max-width: 700px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(245,158,11,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  .ss-timer { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .ss-timer-track { flex: 1; height: 8px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .ss-timer-fill { height: 100%; border-radius: 999px; transition: width 0.3s, background 0.3s; }
  .ss-danger .ss-timer-fill { animation: pulse-bar 0.6s ease infinite; }
  .ss-timer-label { font-size: 16px; font-weight: 900; min-width: 50px; text-align: right; }
  h1 { font-size: 28px; margin: 8px 0; }
  .ss-q { color: #cbd5e1; margin-bottom: 16px; font-size: 14px; font-weight: 600; }

  .ss-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .ss-card { display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #0f172a; border: 2px solid #1e293b; border-radius: 12px; color: #e2e8f0; cursor: pointer; text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 13px; transition: all 0.15s; position: relative; }
  .ss-card:hover:not(:disabled) { border-color: #f59e0b; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.1); }
  .ss-card:disabled { cursor: default; }
  .ss-card-correct { border-color: #10b981 !important; background: rgba(16,185,129,0.08) !important; box-shadow: 0 0 16px rgba(16,185,129,0.2); }
  .ss-card-wrong { border-color: #ef4444 !important; background: rgba(239,68,68,0.08) !important; animation: shake 0.3s ease; }
  .ss-card-reveal { border-color: #10b981 !important; background: rgba(16,185,129,0.05) !important; }
  .ss-card-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
  .ss-card-code { margin: 0; white-space: pre-wrap; word-break: break-all; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #e2e8f0; }
  .ss-card-code code { font-family: 'JetBrains Mono', monospace; }
  .ss-card-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; align-self: flex-start; }
  .ss-badge-correct { background: rgba(16,185,129,0.2); color: #10b981; }
  .ss-badge-reveal { background: rgba(16,185,129,0.15); color: #10b981; }

  .ss-timeout { text-align: center; font-size: 13px; font-weight: 700; color: #ef4444; margin-bottom: 8px; animation: pulse-text 0.8s ease infinite; }

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

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @keyframes pulse-bar {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes pulse-text {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
