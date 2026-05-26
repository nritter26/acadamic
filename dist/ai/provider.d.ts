interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
type StreamCallback = (chunk: string) => void;
export declare function runKeywordTutorFn(message: string, lang?: string, topic?: string, code?: string, hasError?: boolean): Promise<string | null>;
export declare function runHybridLLM(messages: LLMMessage[], onStream?: StreamCallback, lang?: string, topic?: string, code?: string, hasError?: boolean): Promise<string | null>;
export declare function askLLM(messages: LLMMessage[], onStream?: StreamCallback, options?: {
    lang?: string;
    topic?: string;
    code?: string;
    hasError?: boolean;
}): Promise<string | null>;
export {};
//# sourceMappingURL=provider.d.ts.map