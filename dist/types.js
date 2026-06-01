"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.LoginSchema = exports.RegisterSchema = exports.LearnerTrackSchema = exports.ProxySchema = exports.QuizGenerateSchema = exports.ExerciseSchema = exports.ReviewSchema = exports.ExplainSchema = exports.ChatSchema = exports.AnalyzeSchema = exports.ExecuteSchema = exports.ProgressSchema = void 0;
const zod_1 = require("zod");
// ── Zod Validation Schemas ──
exports.ProgressSchema = zod_1.z.object({
    lang: zod_1.z.string().min(1),
    topic: zod_1.z.string().min(1),
    completed: zod_1.z.boolean().optional(),
});
exports.ExecuteSchema = zod_1.z.object({
    lang: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1),
    stdin: zod_1.z.string().optional(),
});
exports.AnalyzeSchema = zod_1.z.object({
    code: zod_1.z.string().optional(),
    lang: zod_1.z.string().optional(),
});
exports.ChatSchema = zod_1.z.object({
    message: zod_1.z.string(),
    lang: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
    phase: zod_1.z.string().optional(),
    code: zod_1.z.string().optional(),
    output: zod_1.z.string().optional(),
    hasError: zod_1.z.boolean().optional(),
    history: zod_1.z.array(zod_1.z.object({ role: zod_1.z.string(), text: zod_1.z.string() })).optional(),
    learnerId: zod_1.z.string().optional(),
    provider: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    apiKey: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().optional(),
});
exports.ExplainSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    lang: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
});
exports.ReviewSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    lang: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
    learnerId: zod_1.z.string().optional(),
});
exports.ExerciseSchema = zod_1.z.object({
    topic: zod_1.z.string().min(1),
    lang: zod_1.z.string().optional(),
    level: zod_1.z.union([zod_1.z.literal('beginner'), zod_1.z.literal('intermediate'), zod_1.z.literal('expert')]).optional(),
});
exports.QuizGenerateSchema = zod_1.z.object({
    topic: zod_1.z.string().min(1),
    lang: zod_1.z.string().optional(),
    count: zod_1.z.number().int().min(1).max(10).optional(),
    level: zod_1.z.union([zod_1.z.literal('beginner'), zod_1.z.literal('intermediate'), zod_1.z.literal('expert')]).optional(),
});
exports.ProxySchema = zod_1.z.object({
    method: zod_1.z.string().optional(),
    url: zod_1.z.string().url(),
    headers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    body: zod_1.z.string().optional(),
});
exports.LearnerTrackSchema = zod_1.z.object({
    event: zod_1.z.union([zod_1.z.literal('complete-topic'), zod_1.z.literal('error'), zod_1.z.literal('attempt'), zod_1.z.literal('quiz'), zod_1.z.literal('challenge'), zod_1.z.literal('ai-interaction')]),
    lang: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
    phase: zod_1.z.string().optional(),
    data: zod_1.z.object({ correct: zod_1.z.number().optional(), total: zod_1.z.number().optional(), solved: zod_1.z.boolean().optional() }).optional(),
    learnerId: zod_1.z.string().optional(),
});
// Auth schemas
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(128),
    name: zod_1.z.string().min(1).max(100).optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
// Project schemas
exports.CreateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    language: zod_1.z.string().optional(),
    description: zod_1.z.string().max(1000).optional(),
});
exports.UpdateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    language: zod_1.z.string().optional(),
    description: zod_1.z.string().max(1000).optional(),
    files: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
//# sourceMappingURL=types.js.map