interface CacheEntry {
  response: string;
  expiresAt: number;
}

export class LLMCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize = 100, ttlMs = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  private makeKey(messages: { role: string; content: string }[], lang?: string, topic?: string): string {
    const lastMsg = messages[messages.length - 1]?.content || '';
    return `${lastMsg}|${lang || ''}|${topic || ''}`;
  }

  get(messages: { role: string; content: string }[], lang?: string, topic?: string): string | null {
    const key = this.makeKey(messages, lang, topic);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.response;
  }

  set(messages: { role: string; content: string }[], response: string, lang?: string, topic?: string): void {
    const key = this.makeKey(messages, lang, topic);
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { response, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const llmCache = new LLMCache();
