export declare class LLMCache {
    private cache;
    private maxSize;
    private ttlMs;
    constructor(maxSize?: number, ttlMs?: number);
    private makeKey;
    get(messages: {
        role: string;
        content: string;
    }[], lang?: string, topic?: string): string | null;
    set(messages: {
        role: string;
        content: string;
    }[], response: string, lang?: string, topic?: string): void;
    clear(): void;
}
export declare const llmCache: LLMCache;
//# sourceMappingURL=cache.d.ts.map