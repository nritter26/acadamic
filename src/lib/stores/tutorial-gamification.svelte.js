const STORAGE_KEY = 'tutorial-gamification';

function createDefaultState() {
  return { xp: 0, streak: 0, lastActive: null, badges: [], topicXp: {} };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...createDefaultState(), ...JSON.parse(raw) } : createDefaultState();
  } catch { return createDefaultState(); }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let _state = $state(loadState());

export function getGamificationState() {
  return _state;
}

export function awardXp(amount) {
  _state.xp += amount;
  saveState(_state);
}

export function addBadge(badgeId) {
  if (!_state.badges.includes(badgeId)) {
    _state.badges.push(badgeId);
    saveState(_state);
  }
}

export function checkStreak() {
  const today = new Date().toISOString().split('T')[0];
  if (_state.lastActive === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  _state.streak = _state.lastActive === yesterday ? _state.streak + 1 : 1;
  _state.lastActive = today;
  saveState(_state);
}

export function awardTopicXp(courseId, topicName) {
  const key = `${courseId}:${topicName}`;
  if (_state.topicXp[key]) return;
  _state.topicXp[key] = true;
  _state.xp += 10;
  if (!_state.badges.includes('first-topic')) _state.badges.push('first-topic');
  if (_state.streak >= 3 && !_state.badges.includes('streak-3')) _state.badges.push('streak-3');
  if (_state.streak >= 7 && !_state.badges.includes('streak-7')) _state.badges.push('streak-7');
  saveState(_state);
}

export function awardPhaseXp() {
  _state.xp += 50;
  if (!_state.badges.includes('phase-complete')) _state.badges.push('phase-complete');
  saveState(_state);
}

export function resetState() {
  _state = createDefaultState();
  saveState(_state);
}

export function hasBadge(badgeId) {
  return _state.badges.includes(badgeId);
}
