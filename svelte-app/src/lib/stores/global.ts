import { writable, derived } from 'svelte/store';

export type Theme = 'dark' | 'light';
export type Section =
  | 'learn' | 'workspace' | 'compiler' | 'database' | 'designer'
  | 'quiz' | 'games' | 'gaming' | 'mobile' | 'cicd'
  | 'roadmap' | 'api-client' | 'git-viz' | 'settings';

interface GlobalState {
  theme: Theme;
  sidebarOpen: boolean;
  activeSection: Section;
}

const stored = localStorage.getItem('kodex-global');
const initial: GlobalState = stored
  ? JSON.parse(stored)
  : { theme: 'dark', sidebarOpen: true, activeSection: 'learn' };

export const globalStore = writable<GlobalState>(initial);

export const theme = derived(globalStore, ($g) => $g.theme);
export const sidebarOpen = derived(globalStore, ($g) => $g.sidebarOpen);
export const activeSection = derived(globalStore, ($g) => $g.activeSection);

globalStore.subscribe(($g) => {
  localStorage.setItem('kodex-global', JSON.stringify($g));
  document.documentElement.classList.toggle('dark', $g.theme === 'dark');
  document.documentElement.classList.toggle('light', $g.theme === 'light');
});

export function setTheme(t: Theme) {
  globalStore.update((s) => ({ ...s, theme: t }));
}

export function toggleSidebar() {
  globalStore.update((s) => ({ ...s, sidebarOpen: !s.sidebarOpen }));
}

export function navigateTo(section: Section) {
  globalStore.update((s) => ({ ...s, activeSection: section }));
}
