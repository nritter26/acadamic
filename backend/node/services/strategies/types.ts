export interface ProviderConfig {
  provider?: string;
  model?: string;
  apiKey?: string;
  endpoint?: string;
}

export interface TutorContext {
  message: string;
  q: string;
  lang?: string;
  topic?: string;
  phase?: string;
  code?: string;
  output?: string;
  hasError?: boolean;
  history?: { role: string; text: string; content?: string }[];
  learnerId?: string;
  lid: string;
  providerConfig?: ProviderConfig;
}

export interface TutorStrategy {
  name: string;
  priority: number;
  canHandle(ctx: TutorContext): Promise<boolean>;
  handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean>;
}
