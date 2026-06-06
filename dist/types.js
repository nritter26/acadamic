import { z } from 'zod';
// ── Zod Validation Schemas ──
export const ProgressSchema = z.object({
    lang: z.string().min(1),
    topic: z.string().min(1),
    completed: z.boolean().optional(),
});
export const ExecuteSchema = z.object({
    lang: z.string().min(1),
    code: z.string().min(1),
    stdin: z.string().optional(),
});
export const AnalyzeSchema = z.object({
    code: z.string().optional(),
    lang: z.string().optional(),
});
export const ChatSchema = z.object({
    message: z.string(),
    lang: z.string().optional(),
    topic: z.string().optional(),
    phase: z.string().optional(),
    code: z.string().optional(),
    output: z.string().optional(),
    hasError: z.boolean().optional(),
    history: z.array(z.object({ role: z.string(), text: z.string() })).optional(),
    learnerId: z.string().optional(),
    provider: z.string().optional(),
    model: z.string().optional(),
    apiKey: z.string().optional(),
    endpoint: z.string().optional(),
});
export const ExplainSchema = z.object({
    code: z.string().min(1),
    lang: z.string().optional(),
    topic: z.string().optional(),
});
export const ReviewSchema = z.object({
    code: z.string().min(1),
    lang: z.string().optional(),
    topic: z.string().optional(),
    learnerId: z.string().optional(),
});
export const ExerciseSchema = z.object({
    topic: z.string().min(1),
    lang: z.string().optional(),
    level: z.union([z.literal('beginner'), z.literal('intermediate'), z.literal('expert')]).optional(),
});
export const QuizGenerateSchema = z.object({
    topic: z.string().min(1),
    lang: z.string().optional(),
    count: z.number().int().min(1).max(10).optional(),
    level: z.union([z.literal('beginner'), z.literal('intermediate'), z.literal('expert')]).optional(),
});
export const ProxySchema = z.object({
    method: z.string().optional(),
    url: z.string().url(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
});
export const LearnerTrackSchema = z.object({
    event: z.union([z.literal('complete-topic'), z.literal('error'), z.literal('attempt'), z.literal('quiz'), z.literal('challenge'), z.literal('ai-interaction')]),
    lang: z.string().optional(),
    topic: z.string().optional(),
    phase: z.string().optional(),
    data: z.object({ correct: z.number().optional(), total: z.number().optional(), solved: z.boolean().optional() }).optional(),
    learnerId: z.string().optional(),
});
// Auth schemas
export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(128),
    name: z.string().min(1).max(100).optional(),
});
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
// Project schemas
export const CreateProjectSchema = z.object({
    name: z.string().min(1).max(200),
    language: z.string().optional(),
    description: z.string().max(1000).optional(),
});
export const UpdateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    language: z.string().optional(),
    description: z.string().max(1000).optional(),
    files: z.record(z.string(), z.string()).optional(),
});
//# sourceMappingURL=types.js.map