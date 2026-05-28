import { writable } from 'svelte/store';
import { api } from '../api';

interface LearnerState {
  profile: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
}

export const learnerStore = writable<LearnerState>({
  profile: null,
  loading: false,
  error: null,
});

export async function loadLearnerProfile() {
  learnerStore.update((s) => ({ ...s, loading: true, error: null }));
  try {
    const state = await api.learner.state();
    learnerStore.set({ profile: state, loading: false, error: null });
  } catch (err) {
    learnerStore.update((s) => ({
      ...s,
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to load profile',
    }));
  }
}
