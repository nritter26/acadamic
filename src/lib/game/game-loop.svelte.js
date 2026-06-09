import { getChallenge, isCorrectAnswer } from '$lib/lib/games.js';
import { getGameState } from '$lib/stores/game.svelte.js';

export function createGameController(gameId, langId) {
  let index = $state(0);
  let score = $state(0);
  let streak = $state(0);
  let feedback = $state('');
  let feedbackType = $state('');
  let playRecorded = $state(false);
  let transitioning = $state(false);
  let showScorePopup = $state(false);
  let showStreakPopup = $state(false);
  let streakPopupText = $state('');

  // On-demand challenge: generate one at a time based on current index
  let challenge = $derived(getChallenge(gameId, langId, index));
  let progress = $derived({
    current: index + 1,
    total: null, // infinite — no total
    pct: 0
  });

  let gameState = $derived(getGameState());

  function submit(answer) {
    if (feedbackType === 'ok') return;
    if (isCorrectAnswer(answer, challenge.answer || challenge.target)) {
      score += 10;
      streak++;
      gameState.earnXP(10);
      if (!playRecorded) {
        playRecorded = true;
        gameState.recordPlay(gameId, score);
      }
      gameState.recordAchievementStat(gameId + '_correct', 1);
      feedback = 'Correct!';
      feedbackType = 'ok';
      showScorePopup = true;
      setTimeout(() => { showScorePopup = false; }, 800);

      if (streak > 0 && streak % 5 === 0) {
        const bonus = streak >= 10 ? 15 : 10;
        gameState.earnXP(bonus);
        streakPopupText = `\u{1F525} ${streak} streak! +${bonus} XP`;
        showStreakPopup = true;
        setTimeout(() => { showStreakPopup = false; }, 1200);
      }

      setTimeout(() => {
        transitioning = true;
        setTimeout(() => {
          index++;
          feedback = '';
          feedbackType = '';
          transitioning = false;
        }, 200);
      }, 500);
    } else {
      streak = 0;
      feedback = `\u2717 ${challenge.answer || challenge.target}`;
      feedbackType = 'wrong';
      showScorePopup = false;
    }
  }

  function next() {
    index++;
    feedback = '';
    feedbackType = '';
  }

  function reset() {
    index = 0;
    score = 0;
    streak = 0;
    feedback = '';
    feedbackType = '';
    playRecorded = false;
    transitioning = false;
    showScorePopup = false;
    showStreakPopup = false;
  }

  return {
    get score() { return score; },
    get streak() { return streak; },
    get index() { return index; },
    get feedback() { return feedback; },
    get feedbackType() { return feedbackType; },
    get challenge() { return challenge; },
    get progress() { return progress; },
    get transitioning() { return transitioning; },
    get showScorePopup() { return showScorePopup; },
    get showStreakPopup() { return showStreakPopup; },
    get streakPopupText() { return streakPopupText; },
    submit,
    next,
    reset,
    isCorrect: isCorrectAnswer,
  };
}
