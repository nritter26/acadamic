import { browser } from '$app/environment';
import { createTutorialCourseState } from '$lib/lib/tutorial.js';

let _state = $state(createTutorialCourseState());
const STORAGE_KEY = 'kodex_tutorial_v2';

export function getTutorialState() {
  return {
    get state() { return _state; },

    setCourse(courseId) {
      _state = { ..._state, currentCourse: courseId, currentPhase: null, currentTopic: 0 };
      this.persist();
    },

    setPhase(phaseId) {
      _state = { ..._state, currentPhase: phaseId, currentTopic: 0 };
      this.persist();
    },

    setTopic(index) {
      _state = { ..._state, currentTopic: Math.max(0, index) };
      this.persist();
    },

    nextTopic(totalTopics) {
      _state = { ..._state, currentTopic: Math.min(totalTopics - 1, _state.currentTopic + 1) };
      this.persist();
    },

    previousTopic() {
      _state = { ..._state, currentTopic: Math.max(0, _state.currentTopic - 1) };
      this.persist();
    },

    completeTopic(courseId, topicName) {
      const key = `${courseId}:${topicName}`;
      if (_state.completedTopics.includes(key)) return;
      _state = {
        ..._state,
        completedTopics: [..._state.completedTopics, key],
      };
      this.persist();
    },

    completePhase(phaseId) {
      const key = `${_state.currentCourse}:${phaseId}`;
      if (_state.completedPhases.includes(key)) return;
      _state = {
        ..._state,
        completedPhases: [..._state.completedPhases, key],
      };
      this.persist();
    },

    saveQuizScore(phaseId, score) {
      const key = `${_state.currentCourse}:${phaseId}`;
      _state = {
        ..._state,
        quizScores: { ..._state.quizScores, [key]: score },
      };
      this.persist();
    },

    isTopicCompleted(courseId, topicName) {
      return _state.completedTopics.includes(`${courseId}:${topicName}`);
    },

    isPhaseCompleted(phaseId) {
      return _state.completedPhases.includes(`${_state.currentCourse}:${phaseId}`);
    },

    getQuizScore(phaseId) {
      return _state.quizScores[`${_state.currentCourse}:${phaseId}`] ?? null;
    },

    persist() {
      if (!browser) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ..._state, lastActivity: Date.now() }));
    },

    load() {
      if (!browser) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          _state = { ...createTutorialCourseState(), ...parsed };
        }
      } catch {
        _state = createTutorialCourseState();
      }
    },

    reset() {
      _state = createTutorialCourseState();
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}
