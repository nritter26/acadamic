export function runKeywordTutor(message: any, lang: any, topic: any, code: any, hasError: any): {
    response: any;
    source: string;
} | null;
export function detectLangFromMsg(msg: any): "py" | "js" | "ts" | "go" | "rs" | "cpp" | "cs" | "kt" | "swift" | "zig" | "c" | null;
export function getCurrContext(message: any, topic: any): {
    type: string;
    topic: any;
} | {
    type: string;
    topic?: undefined;
};
export function getThank(): string;
export function getGreet(): string;
export function getSocratic(): string;
//# sourceMappingURL=tutor-keywords.d.ts.map