import config from './config';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

type StreamCallback = (chunk: string) => void;

async function streamSSEResponse(
  response: Response,
  onStream: StreamCallback,
  parser: (line: string) => string | null,
): Promise<string> {
  const reader = response.body!.getReader();
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
    return parsed.choices?.[0]?.delta?.content || null;
  } catch {
    return null;
  }
}

function anthropicParser(data: string): string | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'content_block_delta') {
      return parsed.delta?.text || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
): Promise<Response | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status < 500 && response.status !== 429) return null;
    } catch {
      if (i === retries) return null;
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

async function askOpenAI(
  messages: LLMMessage[],
  onStream?: StreamCallback,
): Promise<string | null> {
  const { apiKey, model, endpoint, maxTokens } = config.openai;
  const body = {
    model,
    messages: [{ role: 'system', content: config.systemPrompt }, ...messages],
    max_tokens: maxTokens,
    stream: !!onStream,
  };
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (onStream) {
    const response = await fetchWithRetry(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response) return null;
    return streamSSEResponse(response, onStream, openAIParser);
  }

  const response = await fetchWithRetry(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response) return null;
  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

async function askAnthropic(
  messages: LLMMessage[],
  onStream?: StreamCallback,
): Promise<string | null> {
  const { apiKey, model, maxTokens } = config.anthropic;
  const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user' as const,
    content: m.content,
  }));
  const body = {
    model,
    max_tokens: maxTokens,
    system: config.systemPrompt,
    messages: chatMessages,
    stream: !!onStream,
  };
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  };

  if (onStream) {
    const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response) return null;
    return streamSSEResponse(response, onStream, anthropicParser);
  }

  const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response) return null;
  const data = await response.json();
  return data.content?.[0]?.text || null;
}

async function askLocal(
  messages: LLMMessage[],
  onStream?: StreamCallback,
): Promise<string | null> {
  const { endpoint, model, maxTokens } = config.local;
  const body = {
    model,
    messages: [{ role: 'system' as const, content: config.systemPrompt }, ...messages],
    max_tokens: maxTokens,
    stream: !!onStream,
  };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (onStream) {
    const response = await fetchWithRetry(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response) return null;
    return streamSSEResponse(response, onStream, openAIParser);
  }

  const response = await fetchWithRetry(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response) return null;
  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function askLLM(
  messages: LLMMessage[],
  onStream?: StreamCallback,
): Promise<string | null> {
  const { provider } = config;

  if (provider === 'openai' && config.openai.apiKey) {
    return askOpenAI(messages, onStream);
  }
  if (provider === 'anthropic' && config.anthropic.apiKey) {
    return askAnthropic(messages, onStream);
  }
  if (provider === 'local') {
    return askLocal(messages, onStream);
  }
  return null;
}
