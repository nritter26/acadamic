import { describe, it, expect } from 'vitest';
import { TUTORIAL_COURSES, TUTORIAL_QUIZZES } from '../src/lib/lib/tutorial-content';

describe('Tutorial content integrity', () => {
  it('defines at least one course', () => {
    expect(TUTORIAL_COURSES.length).toBeGreaterThan(0);
  });

  it('course IDs are unique', () => {
    const ids = TUTORIAL_COURSES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('phase IDs are unique within each course', () => {
    for (const course of TUTORIAL_COURSES) {
      const phaseIds = course.phases.map(p => p.id);
      expect(new Set(phaseIds).size).toBe(phaseIds.length);
    }
  });

  it('each course has required fields', () => {
    for (const course of TUTORIAL_COURSES) {
      expect(course.id).toBeTruthy();
      expect(course.title).toBeTruthy();
      expect(course.summary).toBeTruthy();
      expect(course.lang).toBeTruthy();
      expect(course.icon).toBeTruthy();
      expect(Array.isArray(course.phases)).toBe(true);
      for (const phase of course.phases) {
        expect(phase.id).toBeTruthy();
        expect(phase.title).toBeTruthy();
        expect(Array.isArray(phase.topics)).toBe(true);
        expect(phase.topics.length).toBeGreaterThan(0);
      }
    }
  });

  it('quiz keys match course:phase format and reference valid entities', () => {
    for (const key of Object.keys(TUTORIAL_QUIZZES)) {
      expect(key).toMatch(/^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/);
      const [courseId, phaseId] = key.split(':');
      const course = TUTORIAL_COURSES.find(c => c.id === courseId);
      expect(course, `Quiz key "${key}" references unknown course "${courseId}"`).toBeDefined();
      const phase = course.phases.find(p => p.id === phaseId);
      expect(phase, `Quiz key "${key}" references unknown phase "${phaseId}" in course "${courseId}"`).toBeDefined();
    }
  });

  it('each quiz has valid questions', () => {
    for (const questions of Object.values(TUTORIAL_QUIZZES)) {
      expect(questions.length).toBeGreaterThan(0);
      for (const q of questions) {
        expect(q.question).toBeTruthy();
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBeGreaterThan(1);
        expect(typeof q.answer).toBe('number');
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        expect(q.explanation).toBeTruthy();
      }
    }
  });
});
