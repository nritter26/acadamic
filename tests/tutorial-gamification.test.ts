import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.hoisted(() => {
  globalThis.$state = (v) => v;
});

const storage = {};
globalThis.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = val; },
  removeItem: (key) => { delete storage[key]; },
};

import { getGamificationState, awardXp, addBadge, checkStreak, awardTopicXp, awardPhaseXp, hasBadge, resetState } from '../src/lib/stores/tutorial-gamification.svelte.js';

describe('tutorial gamification', () => {
  beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k]);
    resetState();
  });

  it('starts with zero XP', () => {
    const state = getGamificationState();
    expect(state.xp).toBe(0);
    expect(state.badges).toEqual([]);
  });

  it('awardXp adds XP', () => {
    awardXp(10);
    expect(getGamificationState().xp).toBe(10);
  });

  it('awardXp accumulates', () => {
    awardXp(10);
    awardXp(20);
    expect(getGamificationState().xp).toBe(30);
  });

  it('addBadge adds unique badges', () => {
    addBadge('first-topic');
    addBadge('first-topic');
    expect(getGamificationState().badges).toEqual(['first-topic']);
  });

  it('hasBadge checks correctly', () => {
    addBadge('test-badge');
    expect(hasBadge('test-badge')).toBe(true);
    expect(hasBadge('missing')).toBe(false);
  });

  it('awardTopicXp gives 10 XP', () => {
    awardTopicXp('js', 'What is JavaScript');
    expect(getGamificationState().xp).toBe(10);
    expect(getGamificationState().topicXp['js:What is JavaScript']).toBe(true);
  });

  it('awardTopicXp only awards once', () => {
    awardTopicXp('js', 'test');
    awardTopicXp('js', 'test');
    expect(getGamificationState().xp).toBe(10);
  });

  it('awardTopicXp awards first-topic badge', () => {
    awardTopicXp('js', 'test');
    expect(hasBadge('first-topic')).toBe(true);
  });

  it('awardPhaseXp gives 50 XP and badge', () => {
    awardPhaseXp();
    expect(getGamificationState().xp).toBe(50);
    expect(hasBadge('phase-complete')).toBe(true);
  });

  it('persists to localStorage', () => {
    awardXp(25);
    const raw = localStorage.getItem('tutorial-gamification');
    const parsed = JSON.parse(raw);
    expect(parsed.xp).toBe(25);
  });

  it('loads persisted state', async () => {
    localStorage.setItem('tutorial-gamification', JSON.stringify({ xp: 99, streak: 0, lastActive: null, badges: [], topicXp: {} }));
    vi.resetModules();
    const mod = await import('../src/lib/stores/tutorial-gamification.svelte.js');
    expect(mod.getGamificationState().xp).toBe(99);
  });
});
