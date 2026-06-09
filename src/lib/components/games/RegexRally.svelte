<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'js' } = $props();
  let ctrl = createGameController(game.id, lang);
  let input = $state('');

  $effect(() => { input = ''; });

  function submit() {
    ctrl.submit(input);
  }

  let testStrings = $derived([
    'hello 123 world',
    'no digits here',
    '42 is the answer',
    'abc',
  ]);
</script>

<div class="game-rr" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">regex-rally</span>
    <span class="g-progress">{ctrl.progress.current}{#if ctrl.progress.total}/{ctrl.progress.total}{:else} ∞{/if}</span>
  </div>
  <h1>🔤 {game.title}</h1>
  <div class="g-prompt">{ctrl.challenge.prompt}</div>

  <input
    class="rr-input"
    bind:value={input}
    onkeydown={(e) => e.key === 'Enter' && submit()}
    placeholder="Enter regex pattern..."
    disabled={ctrl.feedbackType === 'ok'}
  />

  <div class="rr-tests">
    {#each testStrings as s}
      {@const re = (() => { try { return new RegExp(input, 'g'); } catch { return null; } })()}
      {@const match = re ? s.match(re) : null}
      <div class="rr-test-row">
        {#if match}
          {@const parts = s.split(re)}
          {#each parts as part, i}
            <span>{part}</span>
            {#if i < parts.length - 1}
              <span class="rr-match">{match[i] || ''}</span>
            {/if}
          {/each}
        {:else}
          <span>{s}</span>
        {/if}
      </div>
    {/each}
  </div>

  <button class="g-btn" onclick={submit} disabled={!input || ctrl.feedbackType === 'ok'}>Check</button>

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
  .game-rr { max-width: 700px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(34,211,238,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0; }
  .g-prompt { color: #cbd5e1; margin-bottom: 16px; font-size: 14px; }
  .rr-input { width: 100%; padding: 12px; background: #0f172a; border: 2px solid #334155; border-radius: 8px; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 18px; margin-bottom: 12px; box-sizing: border-box; }
  .rr-input:focus { outline: none; border-color: #22d3ee; }
  .rr-tests { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
  .rr-test-row { padding: 4px 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #94a3b8; }
  .rr-match { background: rgba(16,185,129,0.2); color: #10b981; border-radius: 2px; font-weight: 700; }
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
