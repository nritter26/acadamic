const BASE = '/api';

export interface ExecuteParams {
  lang: string;
  code: string;
  stdin?: string;
}

export interface ExecResult {
  output: string;
  error: string | null;
  executionTime: number;
}

export interface ReviewParams {
  code: string;
  lang: string;
  topic?: string;
  learnerId?: string;
}

export interface ChatParams {
  message: string;
  lang?: string;
  topic?: string;
  phase?: string;
  code?: string;
  output?: string;
  hasError?: boolean;
  history?: Array<{ role: string; content: string }>;
  learnerId?: string;
}

export interface LearnerEvent {
  type: string;
  lang?: string;
  topic?: string;
  [key: string]: unknown;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path}: ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  health: () => request<Record<string, unknown>>('GET', '/health'),

  execute: (params: ExecuteParams) =>
    request<ExecResult>('POST', '/execute', params),

  proxy: (url: string, method = 'GET', headers: Record<string, string> = {}, body?: string) =>
    request<{ status: number; headers: Record<string, string>; body: string }>('POST', '/proxy', {
      url, method, headers, body,
    }),

  analyze: (code: string, lang: string) =>
    request<{ issues: Array<{ line: number; message: string; severity: string }> }>(
      'POST', '/analyze', { code, lang }
    ),

  review: (params: ReviewParams) =>
    request<Record<string, unknown>>('POST', '/review', params),

  explain: (code: string, lang: string, topic?: string) =>
    request<{ explanation: string }>('POST', '/explain', { code, lang, topic }),

  chat: (params: ChatParams) =>
    request<{ reply: string }>('POST', '/chat', params),

  exercise: (topic: string, lang?: string, level?: string) =>
    request<{ exercise: string; solution?: string }>('POST', '/exercise', { topic, lang, level }),

  generateQuiz: (topic?: string, lang?: string, level?: string) =>
    request<{ questions: Array<{ question: string; options: string[]; answer: number }> }>(
      'POST', '/quiz/generate', { topic, lang, level }
    ),

  courses: () => request<string[]>('GET', '/courses'),

  progress: {
    get: () => request<Record<string, boolean>>('GET', '/progress'),
    save: (lang: string, topic: string, completed: boolean) =>
      request<void>('POST', '/progress', { lang, topic, completed }),
  },

  learner: {
    track: (event: LearnerEvent) => request<void>('POST', '/learner/track', event),
    path: () => request<Record<string, unknown>>('GET', '/learner/path'),
    state: (lang?: string) =>
      request<Record<string, unknown>>('GET', `/learner/state${lang ? `?lang=${lang}` : ''}`),
    reviews: () => request<Array<Record<string, unknown>>>('GET', '/learner/reviews'),
    recommend: (lang?: string, topics?: string) => {
      let path = '/learner/recommend';
      const params: string[] = [];
      if (lang) params.push(`lang=${lang}`);
      if (topics) params.push(`topics=${topics}`);
      if (params.length) path += '?' + params.join('&');
      return request<{ topic: string }>('GET', path);
    },
  },

  benchmark: (n = 1000) => request<Record<string, unknown>>('GET', `/benchmark?n=${n}`),
  metrics: () => request<Record<string, unknown>>('GET', '/metrics'),
};
