interface Exercise {
    title: string;
    description: string;
    starterCode: string;
    solution: string;
    hint: string;
    test: string;
}
type Level = 'beginner' | 'intermediate' | 'expert';
export declare function generateExercise(topic: string, lang: string, level?: Level): Promise<Exercise>;
export {};
//# sourceMappingURL=exercises.d.ts.map