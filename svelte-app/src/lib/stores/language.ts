import { writable, derived } from 'svelte/store';

export const LANGUAGES = [
  'javascript', 'typescript', 'python', 'go', 'rust', 'zig',
  'c', 'cpp', 'cs', 'kotlin', 'scala', 'swift',
  'bash', 'php', 'ruby', 'wasm', 'asm',
] as const;

export type Language = (typeof LANGUAGES)[number];

interface LanguageState {
  current: Language;
  available: readonly Language[];
}

export const languageStore = writable<LanguageState>({
  current: 'javascript',
  available: LANGUAGES,
});

export const currentLanguage = derived(languageStore, ($l) => $l.current);

export function setLanguage(lang: Language) {
  languageStore.update((s) => ({ ...s, current: lang }));
}
