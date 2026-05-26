interface ReviewIssue {
    line: number;
    message: string;
    severity: 'error' | 'warning' | 'style' | 'info';
    category?: 'syntax' | 'style' | 'logic';
}
interface ReviewResult {
    review: string;
    issues: ReviewIssue[];
    score: number | null;
    source?: 'llm' | 'static';
}
export declare function review(code: string, lang: string, topic?: string): Promise<ReviewResult>;
export {};
//# sourceMappingURL=reviewer.d.ts.map