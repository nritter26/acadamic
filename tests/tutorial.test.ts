import { describe, it, expect } from 'vitest';
import {
  createTutorialCourseState,
  createTutorialState,
  getCourseById,
  getPhaseById,
  getTopicIndex,
  getTotalProgress,
  getPhaseProgress,
  getLessonById,
  DEFAULT_TUTORIAL_LESSONS,
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
    expect(state.lastActivity).toBe(null);
  });

  it('createTutorialState returns default lesson state', () => {
    const state = createTutorialState();
    expect(state.currentLesson).toBe(null);
    expect(state.currentStep).toBe(0);
    expect(state.completedLessons).toEqual([]);
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

  it('getPhaseById returns null for null course', () => {
    expect(getPhaseById(null, 'fundamentals')).toBeNull();
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

  it('getTopicIndex returns -1 for missing phase', () => {
    const course = getCourseById('js');
    expect(getTopicIndex(course, 'nonexistent', 'anything')).toBe(-1);
  });

  it('getTotalProgress calculates percentage', () => {
    const course = getCourseById('js');
    const total = course.phases.reduce((sum, p) => sum + p.topics.length, 0);
    const completed = ['What is JavaScript', 'Syntax & Comments'];
    const progress = getTotalProgress(course, completed);
    expect(progress).toBe(Math.round((2 / total) * 100));
  });

  it('getTotalProgress returns 0 for null course', () => {
    expect(getTotalProgress(null, [])).toBe(0);
  });

  it('getPhaseProgress returns 0-100', () => {
    const course = getCourseById('js');
    const phase = getPhaseById(course, 'fundamentals');
    const total = phase.topics.length;
    const completed = ['What is JavaScript'];
    const progress = getPhaseProgress(course, 'fundamentals', completed);
    expect(progress).toBe(Math.round((1 / total) * 100));
  });

  it('getPhaseProgress returns 100 when all topics complete', () => {
    const course = getCourseById('js');
    const phase = getPhaseById(course, 'fundamentals');
    const progress = getPhaseProgress(course, 'fundamentals', [...phase.topics]);
    expect(progress).toBe(100);
  });

  it('getPhaseProgress returns 0 for missing phase', () => {
    const course = getCourseById('js');
    expect(getPhaseProgress(course, 'nonexistent', [])).toBe(0);
  });

  it('getLessonById finds lesson', () => {
    const lesson = getLessonById('orientation', DEFAULT_TUTORIAL_LESSONS);
    expect(lesson).toBeDefined();
    expect(lesson.id).toBe('orientation');
  });

  it('getLessonById returns first lesson for unknown id', () => {
    const lesson = getLessonById('nonexistent', DEFAULT_TUTORIAL_LESSONS);
    expect(lesson).toBeDefined();
    expect(lesson.id).toBe(DEFAULT_TUTORIAL_LESSONS[0].id);
  });
});
