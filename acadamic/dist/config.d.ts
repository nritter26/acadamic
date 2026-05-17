export interface ProviderConfig {
    apiKey: string;
    model: string;
    endpoint: string;
    maxTokens: number;
}
export interface AppConfig {
    provider: 'keyword' | 'openai' | 'anthropic' | 'local';
    openai: ProviderConfig;
    anthropic: ProviderConfig;
    local: ProviderConfig;
    systemPrompt: string;
}
declare const config: AppConfig;
export default config;
//# sourceMappingURL=config.d.ts.map