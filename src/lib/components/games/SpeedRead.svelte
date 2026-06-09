<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);
  let selected = $state(null);
  let revealed = $state(true);
  let startTime = $state(0);
  let readTime = $state(0);

  $effect(() => {
    selected = null;
    revealed = true;
    startTime = 0;
    readTime = 0;
  });

  let elapsed = $derived(readTime > 0 ? readTime : (startTime > 0 ? Date.now() - startTime : 0));

  function reveal() {
    revealed = false;
    startTime = Date.now();
  }

  function pick(choice) {
    if (ctrl.feedbackType === 'ok') return;
    selected = choice;
  }

  function submit() {
    if (!selected || ctrl.feedbackType === 'ok') return;
    readTime = Date.now() - startTime;
    ctrl.submit(selected);
  }

  let choices = $derived(ctrl.challenge.choices || []);
</script>

<div class="game-sr" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">speed-read</span>
    <span class="g-progress">{ctrl.progress.current}{#if ctrl.progress.total}/{ctrl.progress.total}{:else} ∞{/if}</span>
  </div>
  <h1>{game.title}</h1>

  {#if revealed}
    <div class="sr-passage">
      <div class="sr-passage-head">📖 Read carefully — it will hide when you continue</div>
      <pre>{ctrl.challenge.prompt}</pre>
    </div>
    <button class="g-btn" onclick={reveal}>I've read it →</button>
  {:else}
    <div class="sr-hidden-box">
      <span class="sr-hidden-icon">🫣</span>
      <span class="sr-hidden-text">Passage hidden</span>
    </div>
    <div class="sr-timer">
      <span class="sr-timer-icon">⏱️</span>
      <span class="sr-timer-val">{(elapsed / 1000).toFixed(1)}s</span>
    </div>
    <div class="g-prompt">What did the code do?</div>
    <div class="sr-choices">
      {#each choices as choice, i}
        <button
          class="sr-choice"
          class:sr-selected={selected === choice}
          class:sr-correct={ctrl.feedbackType === 'ok' && choice === ctrl.challenge.answer}
          class:sr-wrong={ctrl.feedbackType === 'wrong' && selected === choice}
          class:sr-dim={ctrl.feedbackType === 'ok' && choice !== ctrl.challenge.answer}
          onclick={() => pick(choice)}
          disabled={ctrl.feedbackType === 'ok'}
        >
          <span class="sr-radio">
            {#if selected === choice}
              <span class="sr-dot"></span>
            {/if}
          </span>
          <span class="sr-label">{choice}</span>
        </button>
      {/each}
    </div>
    {#if !ctrl.feedbackType}
      <button class="g-btn" class:sr-btn-disabled={!selected} onclick={submit} disabled={!selected}>
        Confirm Answer
      </button>
    {/if}
  {/if}

  {#if ctrl.feedbackType === 'ok' && readTime > 0}
    <div class="sr-speed">{Math.round(ctrl.challenge.prompt.split(/\s+/).length / (readTime / 1000) * 60)} wpm</div>
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
  .sr-passage-head { font-size: 12px; color: #f59e0b; font-weight: 700; margin-bottom: 8px; }
  .sr-passage pre { white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #e2e8f0; margin: 0; }

  .sr-hidden-box { display: flex; align-items: center; justify-content: center; gap: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 32px; margin-bottom: 8px; }
  .sr-hidden-icon { font-size: 28px; }
  .sr-hidden-text { color: #475569; font-size: 14px; font-style: italic; }

  .sr-timer { text-align: center; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .sr-timer-icon { font-size: 16px; }
  .sr-timer-val { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 900; color: #fbbf24; }

  .g-prompt { color: #94a3b8; margin-bottom: 12px; font-size: 14px; }

  .sr-choices { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
  .sr-choice {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px; background: #1e293b; border: 2px solid #334155;
    border-radius: 10px; color: #e2e8f0; font-size: 13px;
    cursor: pointer; text-align: left; transition: border-color 0.15s, background 0.15s, opacity 0.15s;
    font-family: inherit;
  }
  .sr-choice:hover:not(:disabled) { border-color: #f59e0b; }
  .sr-choice:disabled { cursor: default; }
  .sr-radio {
    width: 18px; height: 18px; border-radius: 50%; border: 2px solid #475569;
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: border-color 0.15s;
  }
  .sr-selected .sr-radio { border-color: #f59e0b; }
  .sr-dot { width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; }
  .sr-label { font-weight: 700; }
  .sr-correct { border-color: #10b981 !important; background: rgba(16,185,129,0.08) !important; }
  .sr-correct .sr-radio { border-color: #10b981 !important; }
  .sr-correct .sr-dot { background: #10b981 !important; }
  .sr-wrong { border-color: #ef4444 !important; background: rgba(239,68,68,0.08) !important; }
  .sr-wrong .sr-radio { border-color: #ef4444 !important; }
  .sr-wrong .sr-dot { background: #ef4444 !important; }
  .sr-dim { opacity: 0.4; }

  .sr-btn-disabled { opacity: 0.5; }

  .sr-speed { text-align: center; font-size: 13px; font-weight: 700; color: #f59e0b; margin-bottom: 8px; }

  .g-feedback { text-align: center; font-weight: 800; font-size: 14px; margin-bottom: 8px; }
  .ok { color: #10b981; }
  .wrong { color: #ef4444; }
  .g-footer { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
  .g-streak { font-size: 14px; font-weight: 900; color: #f59e0b; }
  .g-score { flex: 1; font-weight: 800; color: #fef3c7; }
  .g-btn { padding: 10px 20px; background: #f59e0b; color: #111827; border: none; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; font-family: inherit; }
  .g-btn:hover:not(:disabled) { background: #d97706; }
  .g-btn:disabled { cursor: default; opacity: 0.5; }
  .g-btn-sm { padding: 6px 14px; font-size: 11px; }
  .xp-popup { position: fixed; top: 40%; left: 50%; transform: translateX(-50%); font-size: 22px; font-weight: 900; color: #f59e0b; pointer-events: none; animation: float-up 0.8s ease forwards; z-index: 100; }
  .streak-popup { position: fixed; top: 46%; left: 50%; transform: translateX(-50%); font-size: 18px; font-weight: 900; color: #ec4899; pointer-events: none; animation: float-up 1s ease forwards; z-index: 100; }
</style>
