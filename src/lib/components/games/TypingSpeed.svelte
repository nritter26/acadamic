<script>
  import { onDestroy } from 'svelte';
  import { getGameState } from '$lib/stores/game.svelte.js';
  import { generateChallenges } from '$lib/lang/index.js';

  let { game = { id: 'typing-speed', title: 'Typing Speed' }, lang = 'js' } = $props();
  let gameState = $derived(getGameState());

  let challenges = $derived(generateChallenges(game.id, lang) || []);
  let challengeIndex = $state(0);
  let currentChallenge = $derived(challenges[challengeIndex % Math.max(1, challenges.length)] || {});
  let target = $derived(currentChallenge.answer || currentChallenge.target || '');
  let chars = $derived(target.split(''));
  let currentPos = $state(0);
  let typedChars = $state([]);
  let wrongFlash = $state(-1);
  let score = $state(0);
  let streak = $state(0);
  let startTime = $state(null);
  let elapsed = $state(0);
  let done = $state(false);
  let totalKeystrokes = $state(0);
  let correctKeystrokes = $state(0);
  let showXpPopup = $state(false);
  let xpPopupText = $state('');
  let timerInterval = $state(null);
  let xpPopupTimeout = $state(null);

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (xpPopupTimeout) clearTimeout(xpPopupTimeout);
  });

  let wpm = $derived(startTime ? Math.round((correctKeystrokes / 5) / (elapsed / 60)) : 0);
  let accuracy = $derived(totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100);

  function handleKeydown(e) {
    if (done) return;
    const key = e.key;
    if (key.length !== 1) return;
    e.preventDefault();

    if (!startTime) {
      startTime = Date.now();
      timerInterval = setInterval(() => {
        elapsed = Math.floor((Date.now() - startTime) / 1000);
      }, 200);
    }

    totalKeystrokes++;

    if (key === chars[currentPos]) {
      correctKeystrokes++;
      typedChars = [...typedChars, { char: key, correct: true }];
      streak++;
      score += 10;
      gameState.earnXP(10);
      showXpPopup = true;
      xpPopupText = '+10 XP';
      if (xpPopupTimeout) clearTimeout(xpPopupTimeout);
      xpPopupTimeout = setTimeout(() => { showXpPopup = false; }, 800);
      currentPos++;
      wrongFlash = -1;

      if (currentPos >= chars.length) {
        finishGame();
      }
    } else {
      typedChars = [...typedChars, { char: key, correct: false }];
      streak = 0;
      wrongFlash = currentPos;
      setTimeout(() => { wrongFlash = -1; }, 300);
    }
  }

  function finishGame() {
    done = true;
    if (timerInterval) clearInterval(timerInterval);
    const finalScore = Math.round(score * (accuracy / 100));
    gameState.recordPlay(game.id, finalScore);
    gameState.recordAchievementStat(game.id + '_correct', Math.floor(correctKeystrokes / 5));
    if (accuracy >= 95) gameState.earnXP(50);
    else if (accuracy >= 80) gameState.earnXP(25);
  }

  function restart() {
    currentPos = 0;
    typedChars = [];
    wrongFlash = -1;
    score = 0;
    streak = 0;
    startTime = null;
    elapsed = 0;
    done = false;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    showXpPopup = false;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function nextChallenge() {
    challengeIndex++;
    restart();
  }

  let progressPct = $derived(chars.length > 0 ? (currentPos / chars.length) * 100 : 0);
  let seconds = $derived(elapsed % 60);
  let minutes = $derived(Math.floor(elapsed / 60));
  let timeStr = $derived(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="typing-game">
  <div class="typing-header">
    <div class="typing-title">⌨️ {game.title}</div>
    <div class="typing-stats">
      <span class="stat">WPM: <strong>{wpm}</strong></span>
      <span class="stat">Acc: <strong>{accuracy}%</strong></span>
      <span class="stat">⏱ {timeStr}</span>
    </div>
  </div>

  {#if done}
    <div class="typing-results">
      <div class="results-title">Complete!</div>
      <div class="results-grid">
        <div class="result-item"><span class="result-label">WPM</span><span class="result-value">{wpm}</span></div>
        <div class="result-item"><span class="result-label">Accuracy</span><span class="result-value">{accuracy}%</span></div>
        <div class="result-item"><span class="result-label">Best Streak</span><span class="result-value">{streak}</span></div>
        <div class="result-item"><span class="result-label">Score</span><span class="result-value">{Math.round(score * (accuracy / 100))}</span></div>
      </div>
      <button class="typing-btn" onclick={nextChallenge}>Next Challenge →</button>
      <button class="typing-btn typing-btn-secondary" onclick={restart}>Try Again</button>
    </div>
  {:else}
    <div class="typing-display">
      <div class="char-row">
        {#each chars as ch, i}
          <span
            class="char-box"
            class:char-current={i === currentPos}
            class:char-correct={i < currentPos && typedChars[i]?.correct}
            class:char-wrong={i < currentPos && !typedChars[i]?.correct}
            class:char-flash={i === wrongFlash}
          >{ch}</span>
        {/each}
      </div>
    </div>

    <div class="typing-progress">
      <div class="progress-track">
        <div class="progress-fill" style="width: {progressPct}%"></div>
      </div>
      <span class="progress-label">{currentPos}/{chars.length}</span>
    </div>

    <div class="typing-footer">
      <div class="streak-display">
        {#if streak > 2}
          <span class="streak-fire">🔥</span>
          <span class="streak-count">{streak}</span>
        {/if}
      </div>
      <div class="score-display">Score: {score}</div>
      <button class="typing-btn typing-btn-small" onclick={restart}>↺ Restart</button>
    </div>
  {/if}

  {#if showXpPopup}
    <div class="xp-popup">{xpPopupText}</div>
  {/if}
</div>

<style>
  .typing-game {
    max-width: 800px; margin: 0 auto; padding: 24px;
    background: linear-gradient(145deg, rgba(245,158,11,0.18), rgba(15,23,42,0.9));
    border: 1px solid #334155; border-radius: 24px; position: relative;
  }
  .typing-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .typing-title { font-size: 18px; font-weight: 900; color: #e2e8f0; }
  .typing-stats { display: flex; gap: 16px; }
  .stat { font-size: 12px; color: #94a3b8; }
  .stat strong { color: #f59e0b; }

  .typing-display {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 16px;
    padding: 32px 24px; margin-bottom: 16px; min-height: 80px;
    display: flex; align-items: center; justify-content: center;
  }
  .char-row { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
  .char-box {
    font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700;
    width: 34px; height: 42px; display: flex; align-items: center; justify-content: center;
    border-radius: 6px; background: #1e293b; color: #475569;
    transition: all 0.15s ease; position: relative;
  }
  .char-current {
    color: #e2e8f0; background: #334155;
    animation: pulse-glow 1s ease-in-out infinite;
  }
  .char-current::after {
    content: ''; position: absolute; bottom: 3px; left: 5px; right: 5px;
    height: 2px; background: #f59e0b; animation: blink-cursor 0.8s step-end infinite; border-radius: 1px;
  }
  .char-correct { color: #10b981; background: rgba(16,185,129,0.15); animation: scale-pop 0.15s ease; }
  .char-wrong { color: #ef4444; background: rgba(239,68,68,0.15); }
  .char-flash { animation: shake 0.2s ease; }

  .typing-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .progress-track { flex: 1; height: 6px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #f97316); border-radius: 999px; transition: width 0.2s ease; }
  .progress-label { font-size: 11px; font-weight: 700; color: #64748b; min-width: 60px; text-align: right; }

  .typing-footer { display: flex; justify-content: space-between; align-items: center; }
  .streak-display { display: flex; align-items: center; gap: 4px; min-width: 80px; }
  .streak-fire { font-size: 18px; animation: scale-pop 0.3s ease; }
  .streak-count { font-size: 16px; font-weight: 900; color: #f59e0b; }
  .score-display { font-size: 14px; font-weight: 800; color: #fef3c7; }

  .typing-btn {
    padding: 10px 24px; font-size: 13px; font-weight: 800;
    background: #f59e0b; color: #111827; border: none; border-radius: 8px; cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .typing-btn:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
  .typing-btn:active { transform: scale(0.97); }
  .typing-btn-secondary { background: transparent; border: 1px solid #334155; color: #94a3b8; margin-left: 8px; }
  .typing-btn-secondary:hover { border-color: #f59e0b; color: #e2e8f0; }
  .typing-btn-small { padding: 6px 16px; font-size: 11px; }

  .typing-results { text-align: center; padding: 40px 24px; animation: fade-in 0.3s ease; }
  .results-title { font-size: 32px; font-weight: 900; color: #e2e8f0; margin-bottom: 24px; }
  .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 320px; margin: 0 auto 24px; }
  .result-item { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; }
  .result-label { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }
  .result-value { font-size: 28px; font-weight: 900; color: #f59e0b; }

  .xp-popup {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-size: 24px; font-weight: 900; color: #f59e0b;
    pointer-events: none; animation: float-up 0.8s ease forwards;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5); z-index: 10;
  }
</style>
