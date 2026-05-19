import config from './config';
import { runKeywordTutor } from './tutor-keywords';
import { getTinyLLMResponse } from './tiny-llm';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

type StreamCallback = (chunk: string) => void;

interface ProviderConfig {
  apiKey?: string;
  model: string;
  endpoint?: string;
  maxTokens: number;
}

interface ProviderHandler {
  buildBody(messages: LLMMessage[], stream: boolean): Record<string, unknown>;
  buildHeaders(): Record<string, string>;
  endpoint: string;
  path: string;
  parser(line: string): string | null;
  responseParser(data: Record<string, unknown>): string | null;
  stripSystem?: boolean;
  apiKey: string;
  model: string;
  maxTokens: number;
}

async function streamSSEResponse(
  response: Response,
  onStream: StreamCallback,
  parser: (line: string) => string | null,
): Promise<string> {
  if (!response.body) {
    throw new Error('Response body is null — streaming not supported');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6).trim();
      if (data === '[DONE]') continue;
      const content = parser(data);
      if (content) {
        full += content;
        onStream(content);
      }
    }
  }
  return full;
}

function openAIParser(data: string): string | null {
  try {
    const parsed = JSON.parse(data);
    return (parsed.choices?.[0]?.delta?.content as string) || null;
  } catch {
    return null;
  }
}

function anthropicParser(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { type?: string; delta?: { text?: string } };
    if (parsed.type === 'content_block_delta') {
      return parsed.delta?.text || null;
    }
    return null;
  } catch {
    return null;
  }
}

const PROVIDERS: Record<string, ProviderHandler> = {
  openai: {
    endpoint: config.openai.endpoint || 'https://api.openai.com/v1',
    path: '/chat/completions',
    buildBody(messages, stream) {
      return {
        model: this.model,
        messages: [{ role: 'system', content: config.systemPrompt }, ...messages],
        max_tokens: this.maxTokens,
        stream,
      };
    },
    buildHeaders() {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };
    },
    parser: openAIParser,
    responseParser(data) {
      const d = data as { choices?: { message?: { content?: string } }[] };
      return d.choices?.[0]?.message?.content || null;
    },
    get apiKey() { return config.openai.apiKey; },
    get model() { return config.openai.model; },
    get maxTokens() { return config.openai.maxTokens; },
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1',
    path: '/messages',
    buildBody(messages, stream) {
      const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      }));
      return {
        model: this.model,
        max_tokens: this.maxTokens,
        system: config.systemPrompt,
        messages: chatMessages,
        stream,
      };
    },
    buildHeaders() {
      return {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      };
    },
    parser: anthropicParser,
    responseParser(data) {
      const d = data as { content?: { text?: string }[] };
      return d.content?.[0]?.text || null;
    },
    stripSystem: true,
    get apiKey() { return config.anthropic.apiKey; },
    get model() { return config.anthropic.model; },
    get maxTokens() { return config.anthropic.maxTokens; },
  },
  local: {
    endpoint: config.local.endpoint || 'http://localhost:11434/v1',
    path: '/chat/completions',
    buildBody(messages, stream) {
      return {
        model: this.model,
        messages: [{ role: 'system' as const, content: config.systemPrompt }, ...messages],
        max_tokens: this.maxTokens,
        stream,
      };
    },
    buildHeaders() {
      return { 'Content-Type': 'application/json' };
    },
    parser: openAIParser,
    responseParser(data) {
      const d = data as { choices?: { message?: { content?: string } }[] };
      return d.choices?.[0]?.message?.content || null;
    },
    get apiKey() { return ''; },
    get model() { return config.local.model; },
    get maxTokens() { return config.local.maxTokens; },
  },
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
): Promise<Response | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) return response;
      if (response.status === 429 && i < retries) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '', 10);
        const delay = retryAfter ? retryAfter * 1000 : 1000 * Math.pow(2, i) + Math.random() * 500;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (response.status < 500) return null;
    } catch {
      if (i === retries) return null;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i) + Math.random() * 500));
    }
  }
  return null;
}

async function callProvider(
  provider: ProviderHandler,
  messages: LLMMessage[],
  onStream?: StreamCallback,
): Promise<string | null> {
  const url = `${provider.endpoint}${provider.path}`;
  const body = provider.buildBody(messages, !!onStream);
  const headers = provider.buildHeaders();

  if (onStream) {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response) return null;
    return streamSSEResponse(response, onStream, provider.parser);
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response) return null;
  const data = await response.json();
  return provider.responseParser(data);
}

export async function runKeywordTutorFn(
  message: string,
  lang?: string,
  topic?: string,
  code?: string,
  hasError?: boolean,
): Promise<string | null> {
  const result = runKeywordTutor(message, lang, topic, code, hasError);
  return result ? result.response : null;
}

export async function runHybridLLM(
  messages: LLMMessage[],
  onStream?: StreamCallback,
  lang?: string,
  topic?: string,
  code?: string,
  hasError?: boolean,
): Promise<string | null> {
  const lastMsg = messages[messages.length - 1]?.content || '';

  const keywordResult = runKeywordTutor(lastMsg, lang, topic, code, hasError);
  if (keywordResult) {
    if (onStream) {
      const words = keywordResult.response.split(/(\s+)/);
      for (const word of words) {
        onStream(word);
        await new Promise(r => setTimeout(r, 10));
      }
    }
    return keywordResult.response;
  }

  try {
    const llmResponse = await getTinyLLMResponse(messages, onStream);
    return llmResponse;
  } catch (e) {
    console.error('[hybrid] Tiny LLM fallback failed:', e);
    return null;
  }
}

export async function askLLM(
  messages: LLMMessage[],
  onStream?: StreamCallback,
  options?: { lang?: string; topic?: string; code?: string; hasError?: boolean },
): Promise<string | null> {
  const { provider } = config;

  if (provider === 'hybrid') {
    return runHybridLLM(
      messages,
      onStream,
      options?.lang,
      options?.topic,
      options?.code,
      options?.hasError,
    );
  }

  if (provider === 'openai' && config.openai.apiKey) {
    return callProvider(PROVIDERS.openai, messages, onStream);
  }
  if (provider === 'anthropic' && config.anthropic.apiKey) {
    return callProvider(PROVIDERS.anthropic, messages, onStream);
  }
  if (provider === 'local') {
    return callProvider(PROVIDERS.local, messages, onStream);
  }
  return null;
}


