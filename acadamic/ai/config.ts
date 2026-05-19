export interface ProviderConfig {
  apiKey: string;
  model: string;
  endpoint: string;
  maxTokens: number;
}

export interface AppConfig {
  provider: 'keyword' | 'openai' | 'anthropic' | 'local' | 'hybrid';
  openai: ProviderConfig;
  anthropic: ProviderConfig;
  local: ProviderConfig;
  systemPrompt: string;
}

const config: AppConfig = {
  provider: (process.env.AI_PROVIDER as AppConfig['provider']) || 'keyword',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    endpoint: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024'),
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    endpoint: process.env.ANTHROPIC_ENDPOINT || 'https://api.anthropic.com/v1',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024'),
  },
  local: {
    endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434/v1',
    model: process.env.LOCAL_LLM_MODEL || 'llama3.2',
    apiKey: 'local',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024'),
  },
  systemPrompt: process.env.AI_SYSTEM_PROMPT || `You are an expert programming tutor helping a student learn. Your role is to:
1. Explain programming concepts clearly with examples
2. Guide students to discover answers themselves (Socratic method)
3. Debug code when asked — explain what's wrong and why
4. Suggest practice exercises appropriate to their level
5. Be encouraging and patient — mistakes are learning opportunities

Keep explanations concise but thorough. Include code examples when relevant.
The user is working through an interactive programming curriculum.`,
};

export function isHybrid(): boolean {
  return config.provider === 'hybrid';
}

export function isKeyword(): boolean {
  return config.provider === 'keyword';
}

export default config;
