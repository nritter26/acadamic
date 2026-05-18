interface CurriculumDoc {
    lang: string;
    phase: string;
    topic: string;
    exp: string;
    code: string;
    text: string;
    _embedding?: number[];
}
export declare function search(query: string, lang?: string, topN?: number): Promise<(CurriculumDoc & {
    score: number;
})[]>;
export declare function getContext(query: string, lang?: string, topN?: number): Promise<string>;
export declare function getTopicContext(topic: string, lang?: string): string;
export declare function getCurriculumContext(query: string, lang?: string): string;
export {};
//# sourceMappingURL=embeddings.d.ts.map