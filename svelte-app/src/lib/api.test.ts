import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('health calls GET /api/health', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    });
    const result = await api.health();
    expect(result).toEqual({ status: 'ok' });
    expect(mockFetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({ method: 'GET' }));
  });

  it('execute calls POST /api/execute with params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ output: 'hello', error: null, executionTime: 0.1 }),
    });
    const result = await api.execute({ lang: 'py', code: 'print("hello")' });
    expect(result.output).toBe('hello');
    expect(mockFetch.mock.calls[0][1].body).toContain('"lang":"py"');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limited'),
    });
    await expect(api.health()).rejects.toThrow('429');
  });

  it('proxy sends url, method, headers, body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 200, headers: {}, body: 'ok' }),
    });
    await api.proxy('https://example.com', 'POST', { Authorization: 'Bearer x' }, '{"a":1}');
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.url).toBe('https://example.com');
    expect(callBody.headers.Authorization).toBe('Bearer x');
  });
});
