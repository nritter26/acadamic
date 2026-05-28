export type Intent = 'QUESTION' | 'DEBUG' | 'EXERCISE' | 'GREETING' | 'FOLLOWUP' | 'OFF_TOPIC' | 'THANKS';
export declare function classifyIntent(message: string, history?: {
    role: string;
    content: string;
}[]): Promise<Intent>;
//# sourceMappingURL=intent.d.ts.map