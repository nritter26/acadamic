const config = {
    provider: process.env.AI_PROVIDER || 'hybrid',
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
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        endpoint: process.env.GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta',
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
const TIERED_PROMPTS = {
    beginner: "You are tutoring a programming beginner. Use simple analogies. Avoid jargon. Give step-by-step instructions. Praise effort. Break down concepts into smallest possible pieces.",
    intermediate: "You are tutoring an intermediate programmer. Discuss tradeoffs between approaches. Introduce design patterns. Challenge assumptions. Reference common pitfalls.",
    advanced: "You are tutoring an advanced programmer. Discuss performance implications, architecture patterns, and edge cases. Recommend further reading and advanced techniques.",
};
export function getSystemPrompt(level) {
    const base = config.systemPrompt;
    const tiered = TIERED_PROMPTS[level];
    return `${base}\n\n${tiered}`;
}
export function isHybrid() {
    return config.provider === 'hybrid';
}
export function isKeyword() {
    return config.provider === 'keyword';
}
export function getActiveAIProvider() {
    return config.provider;
}
export default config;
//# sourceMappingURL=config.js.map