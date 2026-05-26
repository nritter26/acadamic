interface KeywordResult {
    response: string;
    source: string;
}
export declare function getSocratic(): string;
export declare function getGreet(): string;
export declare function getThank(): string;
export declare function detectLangFromMsg(msg: string): string | null;
export declare function getCurrContext(message: string, topic?: string): {
    type: string;
    topic?: string | null;
};
export declare function runKeywordTutor(message: string, lang?: string, topic?: string, code?: string, hasError?: boolean): KeywordResult | null;
export {};
//# sourceMappingURL=tutor-keywords.d.ts.map