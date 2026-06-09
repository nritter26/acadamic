<script>
  import { createGameController } from '$lib/game/game-loop.svelte.js';
  let { game, lang = 'sql' } = $props();
  let ctrl = createGameController(game.id, lang);
  let selected = $state(null);
  let answerCorrect = $state(false);

  $effect(() => { if (ctrl.transitioning) return; selected = null; answerCorrect = false; });

  let prompt = $derived(ctrl.challenge.prompt || '');
  let choices = $derived(ctrl.challenge.choices || []);
  let answer = $derived(ctrl.challenge.answer || '');
  let tableA = $derived(ctrl.challenge.tableA);
  let tableB = $derived(ctrl.challenge.tableB);

  let pkCol = $derived(tableA?.columns?.find(c => c.pk));
  let fkCol = $derived(tableB?.columns?.find(c => c.fk));
  let pkIndex = $derived(tableA?.columns?.findIndex(c => c.pk) ?? -1);
  let fkIndex = $derived(tableB?.columns?.findIndex(c => c.fk) ?? -1);
  let linkY = $derived(
    answerCorrect && pkIndex >= 0 && fkIndex >= 0
      ? 42 + ((pkIndex + fkIndex) / 2) * 35 + 17
      : -100
  );

  function pick(choice) {
    if (ctrl.feedbackType === 'ok') return;
    selected = choice;
    if (choice === ctrl.challenge.answer) answerCorrect = true;
    ctrl.submit(choice);
  }
</script>

<div class="game-db" class:transitioning={ctrl.transitioning}>
  <div class="g-top">
    <span class="g-badge">db-lab</span>
    <span class="g-progress">{ctrl.progress.current}{#if ctrl.progress.total}/{ctrl.progress.total}{:else} ∞{/if}</span>
  </div>
  <h1>🗄️ {game.title}</h1>

  <div class="db-prompt">{prompt}</div>

  {#if tableA && tableB}
    <div class="db-tables">
      <div class="db-table-wrap">
        <div class="db-table-name">{tableA.name}</div>
        <div class="db-columns">
          {#each tableA.columns as col}
            <div class="db-col" class:db-col-pk={col.pk} class:db-col-fk={col.fk}>
              <span class="db-col-name">{col.name}</span>
              <span class="db-col-type">{col.type}</span>
              {#if col.pk}
                <span class="db-badge db-badge-pk">PK</span>
              {/if}
              {#if col.fk}
                <span class="db-badge db-badge-fk">FK</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div class="db-mid">
        <div class="db-mid-line" style="top: {linkY}px;"></div>
        <div class="db-mid-arrow" style="top: {linkY}px;">▶</div>
        {#if answerCorrect}
          <div class="db-mid-ref">{fkCol?.ref}</div>
        {/if}
      </div>

      <div class="db-table-wrap">
        <div class="db-table-name">{tableB.name}</div>
        <div class="db-columns">
          {#each tableB.columns as col}
            <div class="db-col" class:db-col-pk={col.pk} class:db-col-fk={col.fk}>
              <span class="db-col-name">{col.name}</span>
              <span class="db-col-type">{col.type}</span>
              {#if col.pk}
                <span class="db-badge db-badge-pk">PK</span>
              {/if}
              {#if col.fk}
                <span class="db-badge db-badge-fk">FK</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <div class="db-choices">
    {#each choices as choice}
      <button
        class="db-choice"
        class:db-correct={answerCorrect && choice === answer}
        class:db-wrong={ctrl.feedbackType === 'wrong' && selected === choice}
        onclick={() => pick(choice)}
        disabled={answerCorrect}
      >{choice}</button>
    {/each}
  </div>

  {#if ctrl.feedback}
    <div class="g-feedback" class:ok={answerCorrect} class:wrong={ctrl.feedbackType === 'wrong'}>{ctrl.feedback}</div>
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
  .game-db { max-width: 800px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(59,130,246,0.18), rgba(15,23,42,0.9)); position: relative; transition: opacity 0.15s; }
  .transitioning { opacity: 0; }
  .g-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .g-badge { color: #fbbf24; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; }
  .g-progress { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0; }
  .db-prompt { color: #cbd5e1; margin-bottom: 20px; font-size: 15px; font-weight: 600; text-align: center; }

  .db-tables { display: flex; align-items: stretch; margin-bottom: 16px; position: relative; }
  .db-table-wrap { flex: 1; min-width: 0; }
  .db-table-name {
    font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900;
    color: #fbbf24; padding: 10px 14px; background: #0f172a;
    border: 1px solid #334155; border-radius: 10px 10px 0 0; border-bottom: none;
    text-align: center; letter-spacing: 0.05em;
  }
  .db-columns { border: 1px solid #334155; border-radius: 0 0 10px 10px; overflow: hidden; }
  .db-col {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1;
    border-bottom: 1px solid #1e293b; background: #0f172a;
  }
  .db-col:last-child { border-bottom: none; }
  .db-col-pk { background: rgba(245,158,11,0.08); border-left: 3px solid #f59e0b; }
  .db-col-fk { background: rgba(59,130,246,0.08); border-left: 3px solid #3b82f6; }
  .db-col-name { color: #e2e8f0; font-weight: 700; }
  .db-col-type { color: #64748b; font-size: 10px; }
  .db-badge {
    font-size: 9px; font-weight: 900; padding: 1px 6px; border-radius: 4px;
    margin-left: auto; letter-spacing: 0.05em;
  }
  .db-badge-pk { background: rgba(245,158,11,0.2); color: #f59e0b; }
  .db-badge-fk { background: rgba(59,130,246,0.2); color: #3b82f6; }

  .db-mid {
    width: 36px; flex-shrink: 0; position: relative;
  }
  .db-mid-line {
    position: absolute; left: 0; right: 4px; height: 2px;
    background: #f59e0b; transform: translateY(-1px);
    transition: top 0.2s ease;
  }
  .db-mid-arrow {
    position: absolute; right: 0; font-size: 12px; color: #f59e0b;
    transform: translate(2px, -7px);
    transition: top 0.2s ease;
  }
  .db-mid-ref {
    position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);
    font-size: 9px; font-weight: 700; color: #94a3b8;
    font-family: 'JetBrains Mono', monospace; white-space: nowrap;
    background: rgba(15,23,42,0.85); padding: 1px 6px; border-radius: 4px;
  }

  .db-choices { display: flex; gap: 8px; margin-bottom: 12px; }
  .db-choice {
    flex: 1; padding: 14px; background: #0f172a; border: 2px solid #1e293b;
    border-radius: 10px; color: #e2e8f0; font-size: 14px; font-weight: 700;
    cursor: pointer; text-align: center; font-family: 'JetBrains Mono', monospace;
    transition: border-color 0.15s, background 0.15s;
  }
  .db-choice:hover:not(:disabled) { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
  .db-choice:disabled { cursor: default; opacity: 0.7; }
  .db-correct { border-color: #10b981 !important; background: rgba(16,185,129,0.12) !important; opacity: 1 !important; }
  .db-wrong { border-color: #ef4444 !important; background: rgba(239,68,68,0.12) !important; }

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
