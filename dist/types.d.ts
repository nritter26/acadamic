import { z } from 'zod';
export interface AIResponseEntry {
    keywords: string[];
    response: string;
}
export interface StreamChunk {
    content?: string;
    error?: string;
}
export interface RunnerConfig {
    cmd: string;
    ext: string;
    src?: string;
}
export interface CompilerEntry {
    available: boolean;
    version: string | null;
}
export interface DatabaseStatus {
    sqlite: {
        available: boolean;
        error?: string;
    };
    pg: {
        available: boolean;
        reason?: string;
        error?: string;
    };
    mysql: {
        available: boolean;
        reason?: string;
        error?: string;
    };
}
export interface ExecResult {
    output: string;
    error?: boolean;
}
export declare const ProgressSchema: z.ZodObject<{
    lang: z.ZodString;
    topic: z.ZodString;
    completed: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type ProgressInput = z.infer<typeof ProgressSchema>;
export declare const ExecuteSchema: z.ZodObject<{
    lang: z.ZodString;
    code: z.ZodString;
    stdin: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExecuteInput = z.infer<typeof ExecuteSchema>;
export declare const AnalyzeSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    lang: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AnalyzeInput = z.infer<typeof AnalyzeSchema>;
export declare const ChatSchema: z.ZodObject<{
    message: z.ZodString;
    lang: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
    phase: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    output: z.ZodOptional<z.ZodString>;
    hasError: z.ZodOptional<z.ZodBoolean>;
    history: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        text: z.ZodString;
    }, z.core.$strip>>>;
    learnerId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ChatInput = z.infer<typeof ChatSchema>;
export declare const ExplainSchema: z.ZodObject<{
    code: z.ZodString;
    lang: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExplainInput = z.infer<typeof ExplainSchema>;
export declare const ReviewSchema: z.ZodObject<{
    code: z.ZodString;
    lang: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
    learnerId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ReviewInput = z.infer<typeof ReviewSchema>;
export declare const ExerciseSchema: z.ZodObject<{
    topic: z.ZodString;
    lang: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"beginner">, z.ZodLiteral<"intermediate">, z.ZodLiteral<"expert">]>>;
}, z.core.$strip>;
export type ExerciseInput = z.infer<typeof ExerciseSchema>;
export declare const QuizGenerateSchema: z.ZodObject<{
    topic: z.ZodString;
    lang: z.ZodOptional<z.ZodString>;
    count: z.ZodOptional<z.ZodNumber>;
    level: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"beginner">, z.ZodLiteral<"intermediate">, z.ZodLiteral<"expert">]>>;
}, z.core.$strip>;
export type QuizGenerateInput = z.infer<typeof QuizGenerateSchema>;
export declare const ProxySchema: z.ZodObject<{
    method: z.ZodOptional<z.ZodString>;
    url: z.ZodString;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    body: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ProxyInput = z.infer<typeof ProxySchema>;
export declare const LearnerTrackSchema: z.ZodObject<{
    event: z.ZodUnion<readonly [z.ZodLiteral<"complete-topic">, z.ZodLiteral<"error">, z.ZodLiteral<"attempt">, z.ZodLiteral<"quiz">, z.ZodLiteral<"challenge">, z.ZodLiteral<"ai-interaction">]>;
    lang: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
    phase: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodObject<{
        correct: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        solved: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    learnerId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LearnerTrackInput = z.infer<typeof LearnerTrackSchema>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const CreateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    language: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export declare const UpdateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    files: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export interface ApiError {
    error: string;
    code?: string;
    details?: unknown;
}
export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}
export interface LearningPathStep {
    phase: string;
    topic: string;
    reason: string;
    status: 'completed' | 'ready' | 'locked';
}
export interface LearningPathResponse {
    lang: string;
    progress: {
        completed: number;
        total: number;
        percent: number;
    };
    nextSteps: LearningPathStep[];
    weakAreas: {
        topic: string;
        mastery: number;
    }[];
}
//# sourceMappingURL=types.d.ts.map