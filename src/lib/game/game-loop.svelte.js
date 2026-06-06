import { getChallenges, isCorrectAnswer } from '$lib/lib/games.js';
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

  let challenges = $derived(getChallenges(gameId, langId) || []);
  let challenge = $derived(challenges[index % Math.max(1, challenges.length)] || {});
  let progress = $derived({
    current: index + 1,
    total: challenges.length,
    pct: challenges.length > 0 ? ((index + 1) / challenges.length) * 100 : 0
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
        streakPopupText = `🔥 ${streak} streak! +${bonus} XP`;
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
      feedback = `✗ ${challenge.answer || challenge.target}`;
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
    get challenges() { return challenges; },
    get progress() { return progress; },
    get transitioning() { return transitioning; },
    get showScorePopup() { return showScorePopup; },
    get showStreakPopup() { return showStreakPopup; },
    get streakPopupText() { return streakPopupText; },
    submit,
    next,
    reset,
    isCorrect(input) { return isCorrectAnswer(input, challenge.answer || challenge.target); },
  };
}
