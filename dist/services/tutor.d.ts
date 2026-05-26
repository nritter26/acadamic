interface HistoryEntry {
    role: string;
    text: string;
    content?: string;
}
interface LLMMsg {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare function buildLLMMessages(message: string, lang?: string, topic?: string, phase?: string, code?: string, output?: string, hasError?: boolean, history?: HistoryEntry[], learnerId?: string): Promise<LLMMsg[]>;
export declare function handleTutorMessage(message: string, options: {
    lang?: string;
    topic?: string;
    phase?: string;
    code?: string;
    output?: string;
    hasError?: boolean;
    history?: HistoryEntry[];
    learnerId?: string;
}, sseSend: (chunk: string) => void, sseDone: () => void): Promise<void>;
export {};
//# sourceMappingURL=tutor.d.ts.map