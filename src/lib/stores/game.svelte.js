import { browser } from '$app/environment';

const KEYS = {
  xp: 'dogeslab_game_xp',
  lb: 'dogeslab_lb',
  ach: 'dogeslab_ach',
  achExtra: 'dogeslab_ach_extra',
  best: 'dogeslab_game_best',
  sound: 'dogeslab_sound',
  theme: 'dogeslab_theme',
  daily: 'dogeslab_daily_',
};

let _xp = $state(0);
let _level = $state(1);
let _soundOn = $state(true);
let _theme = $state('default');
let _dailyDone = $state(false);
let _currentView = $state('hub');

function lsGet(key, fallback = null) {
  if (!browser) return fallback;
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return fallback; }
}

function lsSet(key, value) {
  if (!browser) return;
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* storage full */ }
}

function init() {
  if (!browser) return;
  const xd = lsGet(KEYS.xp) || {};
  _xp = xd.xp || 0;
  _level = xd.lvl || 1;
  _soundOn = localStorage.getItem(KEYS.sound) !== 'off';
  _theme = localStorage.getItem(KEYS.theme) || 'default';
  _dailyDone = !!localStorage.getItem(KEYS.daily + new Date().toDateString());
}

init();

export function getGameState() {
  return {
    get xp() { return _xp; },
    get level() { return _level; },
    get soundOn() { return _soundOn; },
    get theme() { return _theme; },
    get dailyDone() { return _dailyDone; },
    get currentView() { return _currentView; },
    set currentView(v) { _currentView = v; },

    earnXP(amount) {
      _xp += amount;
      const newLvl = Math.floor(_xp / 100) + 1;
      const leveledUp = newLvl > _level;
      if (leveledUp) {
        _level = newLvl;
        confetti(60);
        playSound('levelup');
      }
      lsSet(KEYS.xp, { xp: _xp, lvl: _level });
      return leveledUp;
    },

    toggleSound() {
      _soundOn = !_soundOn;
      localStorage.setItem(KEYS.sound, _soundOn ? 'on' : 'off');
    },

    recordPlay(gameId, score = 0) {
      const lb = lsGet(KEYS.lb) || {};
      if (!lb[gameId]) lb[gameId] = { plays: 0, best: 0 };
      lb[gameId].plays++;
      if (score > lb[gameId].best) lb[gameId].best = score;
      lsSet(KEYS.lb, lb);
    },

    getLeaderboard() {
      return Object.entries(lsGet(KEYS.lb) || {})
        .sort((a, b) => (b[1].best || 0) - (a[1].best || 0));
    },

    getLeaderboardStats(gameId) {
      const lb = lsGet(KEYS.lb) || {};
      return lb[gameId] || { plays: 0, best: 0 };
    },

    getAchievements() {
      return lsGet(KEYS.ach) || [];
    },

    recordAchievementStat(key, inc = 1) {
      const extra = lsGet(KEYS.achExtra) || {};
      extra[key] = (extra[key] || 0) + inc;
      lsSet(KEYS.achExtra, extra);
      return checkAchievements();
    },

    applyTheme(id) {
      _theme = id;
      localStorage.setItem(KEYS.theme, id);
      const themes = lsGet('dogeslab_themes_data');
      const t = themes?.find?.(x => x.id === id);
      if (t) {
        if (browser) {
          document.documentElement.style.setProperty('--bg', t.bg);
          document.documentElement.style.setProperty('--card', t.card);
          document.documentElement.style.setProperty('--accent', t.accent);
        }
      }
    },

    getDailyChallenge() {
      const dateStr = new Date().toDateString();
      const dayNum = dateStr.split('').reduce((a, s) => a + s.charCodeAt(0), 0);
      return dayNum;
    },

    completeDaily() {
      _dailyDone = true;
      localStorage.setItem(KEYS.daily + new Date().toDateString(), 'done');
    },

    resetGame() {
      if (!browser) return;
      Object.values(KEYS).forEach(k => { try { localStorage.removeItem(k); } catch {} });
      _xp = 0;
      _level = 1;
      _soundOn = true;
      _dailyDone = false;
    },
  };
}

export function playSound(type) {
  if (!browser) return;
  const soundOn = localStorage.getItem(KEYS.sound) !== 'off';
  if (!soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'correct') { osc.frequency.value = 880; osc.type = 'sine'; gain.gain.value = 0.15; osc.start(); osc.stop(ctx.currentTime + 0.1); }
    else if (type === 'wrong') { osc.frequency.value = 220; osc.type = 'sawtooth'; gain.gain.value = 0.1; osc.start(); osc.stop(ctx.currentTime + 0.15); }
    else if (type === 'levelup') { osc.frequency.value = 1200; osc.type = 'sine'; gain.gain.value = 0.15; osc.start(); osc.stop(ctx.currentTime + 0.2); }
    else if (type === 'click') { osc.frequency.value = 600; osc.type = 'sine'; gain.gain.value = 0.08; osc.start(); osc.stop(ctx.currentTime + 0.05); }
  } catch {}
}

export function confetti(count = 30) {
  if (!browser) return;
  const colors = ['#ff6b6b', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.animationDuration = (1 + Math.random()) + 's';
    el.style.width = (4 + Math.random() * 8) + 'px';
    el.style.height = (4 + Math.random() * 8) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

export function showToast(msg, type = '') {
  if (!browser) return;
  const existing = document.querySelector('.game-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'game-toast ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 2000);
}

export function showScorePopup(text, cls = '') {
  if (!browser) return;
  const el = document.createElement('div');
  el.className = 'game-score-popup ' + cls;
  el.textContent = text;
  el.style.left = (40 + Math.random() * 20) + '%';
  el.style.top = (30 + Math.random() * 20) + '%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

export const ACHIEVEMENT_DEFS = [
  { id: 'first_play', name: 'First Steps', icon: '🎮', desc: 'Play your first game', check: s => s.totalPlays >= 1 },
  { id: 'ten_plays', name: 'Getting Started', icon: '🎯', desc: 'Play 10 games', check: s => s.totalPlays >= 10 },
  { id: 'fifty_plays', name: 'Dedicated', icon: '🔥', desc: 'Play 50 games', check: s => s.totalPlays >= 50 },
  { id: 'level_5', name: 'Rising Star', icon: '⭐', desc: 'Reach level 5', check: s => s.level >= 5 },
  { id: 'level_10', name: 'Code Champion', icon: '🏆', desc: 'Reach level 10', check: s => s.level >= 10 },
  { id: 'typing_50', name: 'Fast Fingers', icon: '⌨️', desc: 'Type 50+ WPM', check: s => s.typingBest >= 50 },
  { id: 'typing_80', name: 'Speed Demon', icon: '⚡', desc: 'Type 80+ WPM', check: s => s.typingBest >= 80 },
  { id: 'scramble_5', name: 'Order Master', icon: '🧩', desc: 'Win 5 scramble rounds', check: s => s.scrambleWins >= 5 },
  { id: 'debug_10', name: 'Bug Hunter', icon: '🐛', desc: 'Fix 10 bugs', check: s => s.debugFixed >= 10 },
  { id: 'spot_bug_20', name: 'Bug Spotter', icon: '🔍', desc: 'Find 20 bugs', check: s => s.spotBugCorrect >= 20 },
  { id: 'flash_perfect', name: 'Photographic Memory', icon: '📸', desc: 'Perfect flash score', check: s => s.flashPerfect >= 1 },
  { id: 'swipe_30', name: 'Syntax Sensei', icon: '👆', desc: '30 correct swipes', check: s => s.swipeCorrect >= 30 },
  { id: 'daily_7', name: 'Daily Devotee', icon: '🗓️', desc: 'Complete 7 daily challenges', check: s => s.dailyDone >= 7 },
  { id: 'golf_par', name: 'Under Par', icon: '⛳', desc: 'Beat par in Code Golf', check: s => s.golfUnderPar >= 1 },
  { id: 'regex_5', name: 'Pattern Master', icon: '🔤', desc: 'Solve 5 regex puzzles', check: s => s.regexSolved >= 5 },
  { id: 'sql_10', name: 'Query Wizard', icon: '🗄️', desc: 'Answer 10 SQL questions', check: s => s.sqlCorrect >= 10 },
  { id: 'api_10', name: 'API Ace', icon: '📡', desc: 'Answer 10 API questions', check: s => s.apiCorrect >= 10 },
  { id: 'binary_10', name: 'Base Converter', icon: '💠', desc: '10 correct conversions', check: s => s.binaryCorrect >= 10 },
  { id: 'crossword_5', name: 'Word Wizard', icon: '📝', desc: 'Solve 5 crosswords', check: s => s.crosswordSolved >= 5 },
  { id: 'error_10', name: 'Error Expert', icon: '❌', desc: 'Identify 10 errors', check: s => s.errorCorrect >= 10 },
  { id: 'xp_500', name: 'XP Hunter', icon: '💎', desc: 'Earn 500 total XP', check: s => s.totalXP >= 500 },
  { id: 'xp_1000', name: 'XP Legend', icon: '👑', desc: 'Earn 1000 total XP', check: s => s.totalXP >= 1000 },
];

function checkAchievements() {
  const game = getGameState();
  const unlocked = game.getAchievements();
  const lb = lsGet(KEYS.lb) || {};
  const xpData = lsGet(KEYS.xp) || {};
  const extra = lsGet(KEYS.achExtra) || {};
  const wpm = lsGet(KEYS.best) || {};
  const typingBest = Math.max(...Object.values(wpm).filter(v => typeof v === 'number'), 0);
  let totalPlays = 0;
  for (const v of Object.values(lb)) totalPlays += (v.plays || 0);
  const state = {
    totalXP: xpData.xp || 0, level: xpData.lvl || 1, totalPlays,
    typingBest, scrambleWins: extra.scrambleWins || 0, debugFixed: extra.debugFixed || 0,
    spotBugCorrect: extra.spotBugCorrect || 0, flashPerfect: extra.flashPerfect || 0,
    swipeCorrect: extra.swipeCorrect || 0, dailyDone: extra.dailyDone || 0,
    golfUnderPar: extra.golfUnderPar || 0, regexSolved: extra.regexSolved || 0,
    sqlCorrect: extra.sqlCorrect || 0, apiCorrect: extra.apiCorrect || 0,
    binaryCorrect: extra.binaryCorrect || 0, crosswordSolved: extra.crosswordSolved || 0,
    errorCorrect: extra.errorCorrect || 0,
  };
  let changed = false;
  for (const def of ACHIEVEMENT_DEFS) {
    if (unlocked.find(a => a.id === def.id)) continue;
    if (def.check(state)) {
      unlocked.push({ id: def.id, unlockedAt: Date.now() });
      changed = true;
      playSound('levelup');
      setTimeout(() => showToast('Achievement: ' + def.name + '!', 'xp'), 400);
    }
  }
  if (changed) lsSet(KEYS.ach, unlocked);
  return changed;
}
