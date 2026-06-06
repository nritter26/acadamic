<script>
  import { generateChallenges } from '$lib/lang/index.js';
  import { isCorrectAnswer } from '$lib/lib/games.js';
  import { getGameState } from '$lib/stores/game.svelte.js';

  let { game, lang = 'js' } = $props();
  let gameState = $derived(getGameState());
  let score = $state(0);
  let index = $state(0);
  let input = $state('');
  let feedback = $state('');
  let feedbackType = $state('');
  let selectedPieces = $state([]);
  let challenges = $derived(generateChallenges(game.id, lang) || []);
  let challenge = $derived(challenges[index % Math.max(1, challenges.length)] || {});
  let mode = $derived(game.mode || 'choice');
  let playRecorded = $state(false);
  let streak = $state(0);
  let showStreakPopup = $state(false);
  let streakPopupText = $state('');
  let transitioning = $state(false);
  let showScorePopup = $state(false);
  let selectedChoice = $state(null);
  let shuffledPieces = $state([]);

  $effect(() => {
    const pieces = challenge.pieces;
    shuffledPieces = pieces ? [...pieces].sort(() => Math.random() - 0.5) : [];
  });

  function recordPlayIfNeeded() {
    if (!playRecorded) {
      playRecorded = true;
      gameState.recordPlay(game.id, score);
    }
  }

  function resetForNext() {
    input = '';
    feedback = '';
    feedbackType = '';
    selectedPieces = [];
    selectedChoice = null;
    index += 1;
  }

  function transitionToNext() {
    transitioning = true;
    setTimeout(() => {
      resetForNext();
      setTimeout(() => { transitioning = false; }, 50);
    }, 200);
  }

  function submit(value = input) {
    selectedChoice = value;
    const answer = challenge.answer || challenge.target;
    if (isCorrectAnswer(value, answer)) {
      score += 10;
      streak++;
      gameState.earnXP(10);
      gameState.recordAchievementStat(game.id + '_correct', 1);
      recordPlayIfNeeded();
      feedback = 'Correct!';
      feedbackType = 'ok';
      showScorePopup = true;
      setTimeout(() => { showScorePopup = false; }, 800);

      if (streak > 0 && streak % 5 === 0) {
        const bonus = streak >= 10 ? 15 : 10;
        gameState.earnXP(bonus);
        streakPopupText = `🔥 ${streak} streak! +${bonus} XP`;
        showStreakPopup = true;
        setTimeout(() => { showStreakPopup = false; }, 1200);
      }

      setTimeout(transitionToNext, 500);
    } else {
      streak = 0;
      feedback = 'Try again';
      feedbackType = 'wrong';
      showScorePopup = false;
    }
  }

  function addPiece(piece) {
    selectedPieces = [...selectedPieces, piece];
    input = selectedPieces.join('');
  }

  function removePieceAt(idx) {
    selectedPieces = selectedPieces.filter((_, i) => i !== idx);
    input = selectedPieces.join('');
  }

  let progressDots = $derived(challenges.length);
  let maxDots = $derived(Math.min(progressDots, 20));
  let showCompactProgress = $derived(progressDots > 20);
</script>

<div class="mini-game">
  <div class="mg-top-bar">
    <div class="badge">{game.id}</div>
    <div class="mg-progress-dots">
      {#if showCompactProgress}
        <span class="mg-progress-text">{index + 1}/{progressDots}</span>
      {:else}
        {#each Array(maxDots) as _, i}
          <span
            class="mg-dot"
            class:mg-dot-done={i < index}
            class:mg-dot-current={i === index}
          ></span>
        {/each}
      {/if}
    </div>
  </div>

  <h1>{game.title}</h1>
  <p>{game.description}</p>

  <div class="challenge" class:challenge-transition={transitioning}>
    <strong>{challenge.prompt || 'Challenge'}</strong>
    {#if challenge.target}
      <pre>{challenge.target}</pre>
    {/if}
  </div>

  {#if mode === 'choice'}
    <div class="choices">
      {#each challenge.choices || [] as choice}
        <button
          class="choice-btn"
          class:choice-correct={feedbackType === 'ok' && isCorrectAnswer(choice, challenge.answer || challenge.target)}
          class:choice-wrong={feedbackType === 'wrong' && choice === selectedChoice}
          onclick={() => submit(choice)}
          disabled={feedbackType === 'ok'}
        >{choice}</button>
      {/each}
    </div>
  {:else if mode === 'order'}
    <div class="order-area">
      <div class="pieces">
        {#each shuffledPieces as piece}
          <button class="piece-btn" onclick={() => addPiece(piece)}>{piece}</button>
        {/each}
      </div>
      <div class="order-builder">
        <div class="order-slots">
          {#each selectedPieces as piece, i}
            <span class="order-slot" onclick={() => removePieceAt(i)}>{piece}</span>
          {/each}
          <span class="order-cursor">|</span>
        </div>
      </div>
      <div class="order-actions">
        <button class="mg-btn" onclick={() => submit()} disabled={!input}>Check</button>
        <button class="mg-btn mg-btn-secondary" onclick={() => { selectedPieces = []; input = ''; }}>Clear</button>
      </div>
    </div>
  {:else}
    <div class="text-mode">
      <input bind:value={input} aria-label="Game answer"
        onkeydown={(event) => event.key === 'Enter' && submit()}
        class:input-correct={feedbackType === 'ok'}
        class:input-wrong={feedbackType === 'wrong'} />
      <button class="mg-btn" onclick={() => submit()}>Check</button>
    </div>
  {/if}

  {#if feedback}
    <div class="feedback" class:feedback-ok={feedbackType === 'ok'} class:feedback-wrong={feedbackType === 'wrong'}>
      {feedbackType === 'ok' ? '✓' : '✗'} {feedback}
    </div>
  {/if}

  <div class="mg-footer">
    <div class="streak-area">
      {#if streak > 0}
        <span class="streak-badge">🔥 {streak}</span>
      {/if}
    </div>
    <div class="score">Score: {score}</div>
  </div>
</div>

{#if showScorePopup}
  <div class="score-popup">+10 XP</div>
{/if}

{#if showStreakPopup}
  <div class="streak-popup">{streakPopupText}</div>
{/if}

{#if feedbackType === 'wrong' && challenge.answer}
  <div class="correct-reveal">
    Correct: {challenge.answer || challenge.target}
  </div>
{/if}

<style>
  .mini-game { max-width: 640px; padding: 32px; border: 1px solid #334155; border-radius: 24px; background: linear-gradient(145deg, rgba(245,158,11,0.18), rgba(15,23,42,0.9)); position: relative; }
  .mg-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .badge { color: #fbbf24; text-transform: uppercase; font-size: 12px; font-weight: 900; letter-spacing: 0.12em; }
  .mg-progress-dots { display: flex; gap: 4px; align-items: center; }
  .mg-progress-text { font-size: 11px; font-weight: 700; color: #64748b; }
  .mg-dot { width: 8px; height: 8px; border-radius: 50%; background: #1e293b; transition: all 0.2s; }
  .mg-dot-done { background: #10b981; }
  .mg-dot-current { background: #f59e0b; box-shadow: 0 0 4px rgba(245,158,11,0.5); transform: scale(1.3); }

  h1 { font-size: clamp(42px, 8vw, 88px); line-height: 0.9; margin: 10px 0; }
  p { color: #cbd5e1; line-height: 1.6; }

  .challenge { margin: 18px 0; padding: 14px; border: 1px solid #334155; border-radius: 14px; background: rgba(15, 23, 42, 0.8); color: #e2e8f0; transition: opacity 0.15s; }
  .challenge-transition { opacity: 0; }
  pre { white-space: pre-wrap; color: #fef3c7; }

  .choice-btn {
    padding: 10px 20px; background: #111827; border: 2px solid #334155; border-radius: 10px;
    color: #e2e8f0; font-weight: 700; cursor: pointer;
    transition: all 0.15s; font-size: 13px;
  }
  .choice-btn:hover:not(:disabled) { transform: scale(1.03); border-color: #f59e0b; background: #1c1917; }
  .choice-btn:active:not(:disabled) { transform: scale(0.97); }
  .choice-btn:disabled { opacity: 0.6; cursor: default; }
  .choice-correct { border-color: #10b981 !important; background: rgba(16,185,129,0.1) !important; animation: pulse-glow 0.3s ease; }
  .choice-wrong { border-color: #ef4444 !important; background: rgba(239,68,68,0.1) !important; animation: shake 0.2s ease; }

  .choices { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }

  .order-area { margin-bottom: 12px; }
  .pieces { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .piece-btn { padding: 8px 14px; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #e2e8f0; cursor: pointer; font-weight: 600; transition: all 0.1s; }
  .piece-btn:hover { border-color: #f59e0b; transform: scale(1.05); }
  .order-builder { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px; margin-bottom: 8px; min-height: 40px; }
  .order-slots { display: flex; gap: 4px; flex-wrap: wrap; font-family: 'JetBrains Mono', monospace; font-size: 16px; align-items: center; }
  .order-slot { padding: 4px 8px; background: #1e293b; border-radius: 4px; color: #f59e0b; font-weight: 700; cursor: pointer; transition: all 0.1s; }
  .order-slot:hover { background: #334155; }
  .order-cursor { color: #f59e0b; animation: blink-cursor 0.8s step-end infinite; font-weight: 700; }
  .order-actions { display: flex; gap: 8px; }

  .text-mode { display: flex; gap: 8px; margin-bottom: 12px; }
  .text-mode input {
    flex: 1; padding: 10px; border-radius: 8px; border: 2px solid #334155; background: #0a0f1e;
    color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 14px;
    transition: border-color 0.2s;
  }
  .text-mode input:focus { outline: none; border-color: #f59e0b; }
  .input-correct { border-color: #10b981 !important; animation: pulse-glow 0.3s ease; }
  .input-wrong { border-color: #ef4444 !important; animation: shake 0.2s ease; }

  .mg-btn { padding: 10px 20px; background: #f59e0b; color: #111827; border: none; border-radius: 8px; font-weight: 900; cursor: pointer; font-size: 13px; transition: transform 0.1s, box-shadow 0.1s; }
  .mg-btn:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
  .mg-btn:active { transform: scale(0.97); }
  .mg-btn:disabled { opacity: 0.5; cursor: default; transform: none; box-shadow: none; }
  .mg-btn-secondary { background: transparent; border: 1px solid #334155; color: #94a3b8; }
  .mg-btn-secondary:hover { border-color: #f59e0b; color: #e2e8f0; }

  .feedback { margin-top: 12px; font-weight: 800; font-size: 14px; text-align: center; animation: slide-in 0.2s ease; }
  .feedback-ok { color: #10b981; }
  .feedback-wrong { color: #ef4444; animation: shake 0.2s ease; }

  .mg-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
  .streak-area { min-height: 24px; }
  .streak-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 900; color: #f59e0b; animation: scale-pop 0.3s ease; }
  .score { color: #fef3c7; font-weight: 800; font-size: 16px; }

  .score-popup {
    position: fixed; top: 40%; left: 50%; transform: translateX(-50%);
    font-size: 22px; font-weight: 900; color: #f59e0b;
    pointer-events: none; animation: float-up 0.8s ease forwards; z-index: 100;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }
  .streak-popup {
    position: fixed; top: 46%; left: 50%; transform: translateX(-50%);
    font-size: 18px; font-weight: 900; color: #ec4899;
    pointer-events: none; animation: float-up 1s ease forwards; z-index: 100;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }
  .correct-reveal {
    margin-top: 8px; padding: 8px 12px; background: rgba(16,185,129,0.06);
    border: 1px solid rgba(16,185,129,0.2); border-radius: 6px;
    font-size: 12px; color: #10b981; font-weight: 600;
    animation: fade-in 0.2s ease;
  }
</style>
