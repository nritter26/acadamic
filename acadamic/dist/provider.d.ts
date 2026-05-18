interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
type StreamCallback = (chunk: string) => void;
export declare function askLLM(messages: LLMMessage[], onStream?: StreamCallback): Promise<string | null>;
export {};
//# sourceMappingURL=provider.d.ts.map