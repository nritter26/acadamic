import { writable, derived } from 'svelte/store';

interface TopicState {
  currentTopic: string | null;
  currentPhase: string | null;
  curriculum: Record<string, unknown> | null;
}

export const topicStore = writable<TopicState>({
  currentTopic: null,
  currentPhase: null,
  curriculum: null,
});

export const currentTopic = derived(topicStore, ($t) => $t.currentTopic);

export function setCurrentTopic(topic: string, phase: string) {
  topicStore.update((s) => ({ ...s, currentTopic: topic, currentPhase: phase }));
}

export function setCurriculum(data: Record<string, unknown>) {
  topicStore.set({ currentTopic: null, currentPhase: null, curriculum: data });
}
