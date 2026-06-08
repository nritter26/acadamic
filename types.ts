import { z } from 'zod';

// ── Existing Interfaces ──

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
  sqlite: { available: boolean; error?: string };
  pg: { available: boolean; reason?: string; error?: string };
  mysql: { available: boolean; reason?: string; error?: string };
}

export interface ExecResult {
  output: string;
  error?: boolean;
}

// ── Zod Validation Schemas ──

export const ProgressSchema = z.object({
  lang: z.string().min(1),
  topic: z.string().min(1),
  completed: z.boolean().optional(),
});
export type ProgressInput = z.infer<typeof ProgressSchema>;

export const ExecuteSchema = z.object({
  lang: z.string().min(1),
  code: z.string().min(1),
  stdin: z.string().optional(),
});
export type ExecuteInput = z.infer<typeof ExecuteSchema>;

export const AnalyzeSchema = z.object({
  code: z.string().optional(),
  lang: z.string().optional(),
});
export type AnalyzeInput = z.infer<typeof AnalyzeSchema>;

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
export type ChatInput = z.infer<typeof ChatSchema>;

export const ExplainSchema = z.object({
  code: z.string().min(1),
  lang: z.string().optional(),
  topic: z.string().optional(),
});
export type ExplainInput = z.infer<typeof ExplainSchema>;

export const ExplainTopicSchema = z.object({
  topic: z.string().min(1),
  lang: z.string().optional(),
  phase: z.string().optional(),
  learnerId: z.string().optional(),
  code: z.string().optional(),
});
export type ExplainTopicInput = z.infer<typeof ExplainTopicSchema>;

export const StartExerciseSchema = z.object({
  topic: z.string().min(1),
  lang: z.string().optional(),
  level: z.union([z.literal('beginner'), z.literal('intermediate'), z.literal('expert')]).optional(),
  learnerId: z.string().optional(),
});
export type StartExerciseInput = z.infer<typeof StartExerciseSchema>;

export const AttemptExerciseSchema = z.object({
  topic: z.string().min(1),
  lang: z.string().optional(),
  code: z.string().min(1),
  learnerId: z.string().optional(),
});
export type AttemptExerciseInput = z.infer<typeof AttemptExerciseSchema>;

export const RecommendSchema = z.object({
  lang: z.string().min(1),
  learnerId: z.string().optional(),
});
export type RecommendInput = z.infer<typeof RecommendSchema>;

export const ReviewSchema = z.object({
  code: z.string().min(1),
  lang: z.string().optional(),
  topic: z.string().optional(),
  learnerId: z.string().optional(),
});
export type ReviewInput = z.infer<typeof ReviewSchema>;

export const ExerciseSchema = z.object({
  topic: z.string().min(1),
  lang: z.string().optional(),
  level: z.union([z.literal('beginner'), z.literal('intermediate'), z.literal('expert')]).optional(),
});
export type ExerciseInput = z.infer<typeof ExerciseSchema>;

export const QuizGenerateSchema = z.object({
  topic: z.string().min(1),
  lang: z.string().optional(),
  count: z.number().int().min(1).max(10).optional(),
  level: z.union([z.literal('beginner'), z.literal('intermediate'), z.literal('expert')]).optional(),
});
export type QuizGenerateInput = z.infer<typeof QuizGenerateSchema>;

export const ProxySchema = z.object({
  method: z.string().optional(),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
});
export type ProxyInput = z.infer<typeof ProxySchema>;

export const LearnerTrackSchema = z.object({
  event: z.union([z.literal('complete-topic'), z.literal('error'), z.literal('attempt'), z.literal('quiz'), z.literal('challenge'), z.literal('ai-interaction')]),
  lang: z.string().optional(),
  topic: z.string().optional(),
  phase: z.string().optional(),
  data: z.object({ correct: z.number().optional(), total: z.number().optional(), solved: z.boolean().optional() }).optional(),
  learnerId: z.string().optional(),
});
export type LearnerTrackInput = z.infer<typeof LearnerTrackSchema>;

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  name: z.string().min(1).max(100).optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Project schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  language: z.string().optional(),
  description: z.string().max(1000).optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  language: z.string().optional(),
  description: z.string().max(1000).optional(),
  files: z.record(z.string(), z.string()).optional(),
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// ── Response Types ──

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
  progress: { completed: number; total: number; percent: number };
  nextSteps: LearningPathStep[];
  weakAreas: { topic: string; mastery: number }[];
}
