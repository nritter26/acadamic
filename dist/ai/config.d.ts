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
declare const config: AppConfig;
export declare function getSystemPrompt(level: 'beginner' | 'intermediate' | 'advanced'): string;
export declare function isHybrid(): boolean;
export declare function isKeyword(): boolean;
export declare function getActiveAIProvider(): string;
export default config;
//# sourceMappingURL=config.d.ts.map