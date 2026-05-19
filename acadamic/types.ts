export interface AIResponseEntry {
  keywords: string[];
  response: string;
}

export interface ChatRequest {
  message: string;
  lang?: string;
  topic?: string;
  phase?: string;
  code?: string;
  output?: string;
  hasError?: boolean;
  history?: { role: string; text: string }[];
  learnerId?: string;
}

export interface StreamChunk {
  content?: string;
  error?: string;
}

export interface ExplainRequest {
  code: string;
  lang?: string;
  topic?: string;
}

export interface ReviewRequest {
  code: string;
  lang?: string;
  topic?: string;
  learnerId?: string;
}

export interface ExecuteRequest {
  lang: string;
  code: string;
  stdin?: string;
}

export interface ExecuteResponse {
  output: string;
  error?: boolean;
}

export interface AnalyzeRequest {
  code?: string;
  lang?: string;
}

export interface LearnerTrackEvent {
  event: 'complete-topic' | 'error' | 'attempt' | 'quiz' | 'challenge' | 'ai-interaction';
  lang?: string;
  topic?: string;
  phase?: string;
  data?: { correct?: number; total?: number; solved?: boolean };
  learnerId?: string;
}

export interface ProgressData {
  lang?: string;
  topic?: string;
  completed?: boolean;
}

export interface ProxyRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ExerciseRequest {
  topic?: string;
  lang?: string;
  level?: 'beginner' | 'intermediate' | 'expert';
}

export interface RunnerConfig {
  cmd: string;
  ext: string;
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
