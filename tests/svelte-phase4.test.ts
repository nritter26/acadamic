import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

describe('editor store', () => {
  test('updates line count when code changes', async () => {
    const { getEditorState } = await import('../src/lib/stores/editor.svelte.js');
    const editor = getEditorState();

    editor.code = 'one\ntwo\nthree';

    expect(editor.code).toBe('one\ntwo\nthree');
    expect(editor.lineNumbers).toBe(3);
  });
});

describe('execution store', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('posts code to execute endpoint and stores output', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ output: 'hello\n' }),
    });
    const { getExecutionState } = await import('../src/lib/stores/execution.svelte.js');
    const exec = getExecutionState();

    await exec.runCode('js', 'console.log("hello")', '');

    expect(fetch).toHaveBeenCalledWith('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: 'js', code: 'console.log("hello")', stdin: '' }),
    });
    expect(exec.output).toBe('hello\n');
    expect(exec.error).toBe('');
    expect(exec.running).toBe(false);
  });

  test('stores execution errors without output', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ error: 'boom' }),
    });
    const { getExecutionState } = await import('../src/lib/stores/execution.svelte.js');
    const exec = getExecutionState();

    await exec.runCode('js', 'throw new Error("boom")');

    expect(exec.output).toBe('');
    expect(exec.error).toBe('boom');
    expect(exec.running).toBe(false);
  });
});

describe('api helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('apiPost returns parsed json for successful responses', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });
    const { apiPost } = await import('../src/lib/lib/api.js');

    await expect(apiPost('/api/example', { a: 1 })).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith('/api/example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 1 }),
    });
  });

  test('apiGet rejects failed responses with status details', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });
    const { apiGet } = await import('../src/lib/lib/api.js');

    await expect(apiGet('/api/fail')).rejects.toThrow('API 500: Server Error');
  });
});

describe('ai store', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      removeItem: vi.fn((key: string) => storage.delete(key)),
      clear: vi.fn(() => storage.clear()),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('adds messages and toggles panel state', async () => {
    const { getAIState } = await import('../src/lib/stores/ai.svelte.js');
    const ai = getAIState();

    ai.panelOpen = false;
    ai.togglePanel();
    ai.addMessage('hello', 'user');

    expect(ai.panelOpen).toBe(true);
    expect(ai.messages.at(-1)).toMatchObject({ text: 'hello', role: 'user' });
  });
});
