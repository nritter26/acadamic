interface LLMMsg {
    role: string;
    content: string;
}
export declare function getTinyLLMResponse(messages: LLMMsg[], onStream?: (chunk: string) => void): Promise<string | null>;
export {};
//# sourceMappingURL=template-matcher.d.ts.map