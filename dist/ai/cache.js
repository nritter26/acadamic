export class LLMCache {
    cache = new Map();
    maxSize;
    ttlMs;
    constructor(maxSize = 100, ttlMs = 5 * 60 * 1000) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }
    makeKey(messages, lang, topic) {
        const lastMsg = messages[messages.length - 1]?.content || '';
        return `${lastMsg}|${lang || ''}|${topic || ''}`;
    }
    get(messages, lang, topic) {
        const key = this.makeKey(messages, lang, topic);
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.response;
    }
    set(messages, response, lang, topic) {
        const key = this.makeKey(messages, lang, topic);
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined)
                this.cache.delete(firstKey);
        }
        this.cache.set(key, { response, expiresAt: Date.now() + this.ttlMs });
    }
    clear() {
        this.cache.clear();
    }
}
export const llmCache = new LLMCache();
//# sourceMappingURL=cache.js.map