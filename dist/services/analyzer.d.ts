export interface AnalysisResult {
    hints: string[];
}
export declare function analyzeCode(code: string, lang?: string): AnalysisResult;
export declare function analyzeUserCode(code: string, lang: string): string[] | null;
//# sourceMappingURL=analyzer.d.ts.map