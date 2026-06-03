import { describe, it, expect } from 'vitest';
import {
  createTutorialCourseState,
  getCourseById,
  getPhaseById,
  getTopicIndex,
  getTotalProgress,
  getPhaseProgress,
} from '../src/lib/lib/tutorial';
import { TUTORIAL_COURSES } from '../src/lib/lib/tutorial-content';

describe('tutorial helpers', () => {
  it('createTutorialCourseState returns default state', () => {
    const state = createTutorialCourseState();
    expect(state.currentCourse).toBe(null);
    expect(state.currentPhase).toBe(null);
    expect(state.currentTopic).toBe(0);
    expect(state.completedTopics).toEqual([]);
    expect(state.completedPhases).toEqual([]);
    expect(state.quizScores).toEqual({});
  });

  it('getCourseById finds course', () => {
    const course = getCourseById('js');
    expect(course).toBeDefined();
    expect(course.id).toBe('js');
  });

  it('getCourseById returns null for missing course', () => {
    expect(getCourseById('nonexistent')).toBeNull();
  });

  it('getPhaseById finds phase in course', () => {
    const course = getCourseById('js');
    const phase = getPhaseById(course, 'fundamentals');
    expect(phase).toBeDefined();
    expect(phase.id).toBe('fundamentals');
  });

  it('getPhaseById returns null for missing phase', () => {
    const course = getCourseById('js');
    expect(getPhaseById(course, 'nonexistent')).toBeNull();
  });

  it('getTopicIndex finds topic position in phase', () => {
    const course = getCourseById('js');
    const idx = getTopicIndex(course, 'fundamentals', 'What is JavaScript');
    expect(idx).toBe(0);
  });

  it('getTopicIndex returns -1 for missing topic', () => {
    const course = getCourseById('js');
    expect(getTopicIndex(course, 'fundamentals', 'nonexistent')).toBe(-1);
  });

  it('getTotalProgress calculates percentage', () => {
    const course = getCourseById('js');
    const total = course.phases.reduce((sum, p) => sum + p.topics.length, 0);
    const completed = ['What is JavaScript', 'Syntax & Comments'];
    const progress = getTotalProgress(course, completed);
    expect(progress).toBe(Math.round((2 / total) * 100));
  });

  it('getPhaseProgress returns 0-100', () => {
    const course = getCourseById('js');
    const p = getPhaseProgress(course, 'fundamentals', ['What is JavaScript']);
    expect(p).toBe(25);
    const p2 = getPhaseProgress(course, 'fundamentals', [
      'What is JavaScript', 'Syntax & Comments', 'Strict Mode', 'Statements & Blocks',
    ]);
    expect(p2).toBe(100);
  });
});
