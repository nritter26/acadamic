import { browser } from '$app/environment';
import { createTutorialState } from '$lib/lib/tutorial.js';

let _state = $state(createTutorialState());
const STORAGE_KEY = 'kodex_tutorial_state';

export function getTutorialState() {
  return {
    get state() { return _state; },

    startLesson(id) {
      _state = { ..._state, currentLesson: id, currentStep: 0 };
      this.persist();
    },

    setStep(step) {
      _state = { ..._state, currentStep: Math.max(0, step) };
      this.persist();
    },

    nextStep(totalSteps) {
      _state = { ..._state, currentStep: Math.min(totalSteps - 1, _state.currentStep + 1) };
      this.persist();
    },

    previousStep() {
      _state = { ..._state, currentStep: Math.max(0, _state.currentStep - 1) };
      this.persist();
    },

    completeLesson(id) {
      _state = {
        ..._state,
        completedLessons: [...new Set([..._state.completedLessons, id])],
      };
      this.persist();
    },

    persist() {
      if (!browser) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    },

    load() {
      if (!browser) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) _state = JSON.parse(raw);
      } catch {
        _state = createTutorialState();
      }
    },
  };
}
