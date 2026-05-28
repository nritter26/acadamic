import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { workspaceStore, setCode, setStdin } from './workspace';

describe('workspaceStore', () => {
  beforeEach(() => {
    workspaceStore.set({ code: '', stdin: '', output: '', error: null, executionTime: null, isRunning: false });
  });

  it('setCode updates code', () => {
    setCode('console.log("hi")');
    expect(get(workspaceStore).code).toBe('console.log("hi")');
  });

  it('setStdin updates stdin', () => {
    setStdin('hello');
    expect(get(workspaceStore).stdin).toBe('hello');
  });

  it('starts with empty state', () => {
    const state = get(workspaceStore);
    expect(state.code).toBe('');
    expect(state.isRunning).toBe(false);
    expect(state.error).toBeNull();
  });
});
