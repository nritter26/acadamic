import { getChallenges, isCorrectAnswer } from '$lib/lib/games.js';
import { getGameState } from '$lib/stores/game.svelte.js';

const POPUP_DURATION = 800;
const STREAK_POPUP_DURATION = 1200;
const ANSWER_DELAY = 500;
const TRANSITION_DURATION = 200;
const CORRECT_POINTS = 10;
const STREAK_INTERVAL = 5;
const STREAK_BONUS = 10;
const BIG_STREAK_BONUS = 15;

export function createGameController(gameId, langId) {
  let index = $state(0);
  let score = $state(0);
  let streak = $state(0);
  let feedback = $state('');
  let feedbackType = $state('');
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

  function recordSession() {
    if (score > 0) gameState.recordPlay(gameId, score);
  }

  function submit(answer) {
    if (feedbackType === 'ok') return;
    if (isCorrectAnswer(answer, challenge.answer || challenge.target)) {
      score += CORRECT_POINTS;
      streak++;
      gameState.earnXP(CORRECT_POINTS);
      gameState.recordAchievementStat(gameId + '_correct', 1);
      feedback = 'Correct!';
      feedbackType = 'ok';
      showScorePopup = true;
      setTimeout(() => { showScorePopup = false; }, POPUP_DURATION);

      if (streak > 0 && streak % STREAK_INTERVAL === 0) {
        const bonus = streak >= 10 ? BIG_STREAK_BONUS : STREAK_BONUS;
        gameState.earnXP(bonus);
        streakPopupText = `🔥 ${streak} streak! +${bonus} XP`;
        showStreakPopup = true;
        setTimeout(() => { showStreakPopup = false; }, STREAK_POPUP_DURATION);
      }

      setTimeout(() => {
        transitioning = true;
        setTimeout(() => {
          index++;
          feedback = '';
          feedbackType = '';
          transitioning = false;
        }, TRANSITION_DURATION);
      }, ANSWER_DELAY);
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
    recordSession();
    index = 0;
    score = 0;
    streak = 0;
    feedback = '';
    feedbackType = '';
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
