import { writable, derived } from 'svelte/store';

interface Breadcrumb {
  label: string;
  section?: string;
}

interface NavigationState {
  breadcrumbs: Breadcrumb[];
  history: string[];
}

export const navigationStore = writable<NavigationState>({
  breadcrumbs: [{ label: 'Learn', section: 'learn' }],
  history: [],
});

export const breadcrumbs = derived(navigationStore, ($n) => $n.breadcrumbs);

export function setBreadcrumbs(crumbs: Breadcrumb[]) {
  navigationStore.update((s) => ({ ...s, breadcrumbs: crumbs }));
}

export function pushHistory(path: string) {
  navigationStore.update((s) => ({
    ...s,
    history: [...s.history.slice(-49), path],
  }));
}
