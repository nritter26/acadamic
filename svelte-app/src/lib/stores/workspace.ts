import { writable, derived } from 'svelte/store';
import { api } from '../api';

interface WorkspaceState {
  code: string;
  stdin: string;
  output: string;
  error: string | null;
  executionTime: number | null;
  isRunning: boolean;
}

export const workspaceStore = writable<WorkspaceState>({
  code: '',
  stdin: '',
  output: '',
  error: null,
  executionTime: null,
  isRunning: false,
});

export const code = derived(workspaceStore, ($w) => $w.code);
export const output = derived(workspaceStore, ($w) => $w.output);
export const isRunning = derived(workspaceStore, ($w) => $w.isRunning);

export function setCode(newCode: string) {
  workspaceStore.update((s) => ({ ...s, code: newCode }));
}

export function setStdin(input: string) {
  workspaceStore.update((s) => ({ ...s, stdin: input }));
}

export async function executeCode(lang: string) {
  workspaceStore.update((s) => ({ ...s, isRunning: true, error: null, output: '' }));
  try {
    let current: WorkspaceState;
    const unsub = workspaceStore.subscribe((v) => { current = v; })();
    const result = await api.execute({ lang, code: current!.code, stdin: current!.stdin });
    workspaceStore.update((s) => ({
      ...s,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      isRunning: false,
    }));
  } catch (err) {
    workspaceStore.update((s) => ({
      ...s,
      error: err instanceof Error ? err.message : 'Execution failed',
      isRunning: false,
    }));
  }
}
