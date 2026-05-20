"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKeywordTutorFn = runKeywordTutorFn;
exports.runHybridLLM = runHybridLLM;
exports.askLLM = askLLM;
const config_1 = __importDefault(require("./config"));
const tutor_keywords_1 = require("./tutor-keywords");
const tiny_llm_1 = require("./tiny-llm");
async function streamSSEResponse(response, onStream, parser) {
    if (!response.body) {
        throw new Error('Response body is null — streaming not supported');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: '))
                continue;
            const data = trimmed.slice(6).trim();
            if (data === '[DONE]')
                continue;
            const content = parser(data);
            if (content) {
                full += content;
                onStream(content);
            }
        }
    }
    return full;
}
function openAIParser(data) {
    try {
        const parsed = JSON.parse(data);
        return parsed.choices?.[0]?.delta?.content || null;
    }
    catch {
        return null;
    }
}
function anthropicParser(data) {
    try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta') {
            return parsed.delta?.text || null;
        }
        return null;
    }
    catch {
        return null;
    }
}
const PROVIDERS = {
    openai: {
        endpoint: config_1.default.openai.endpoint || 'https://api.openai.com/v1',
        path: '/chat/completions',
        buildBody(messages, stream) {
            return {
                model: this.model,
                messages: [{ role: 'system', content: config_1.default.systemPrompt }, ...messages],
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
            const d = data;
            return d.choices?.[0]?.message?.content || null;
        },
        get apiKey() { return config_1.default.openai.apiKey; },
        get model() { return config_1.default.openai.model; },
        get maxTokens() { return config_1.default.openai.maxTokens; },
    },
    anthropic: {
        endpoint: 'https://api.anthropic.com/v1',
        path: '/messages',
        buildBody(messages, stream) {
            const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));
            return {
                model: this.model,
                max_tokens: this.maxTokens,
                system: config_1.default.systemPrompt,
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
            const d = data;
            return d.content?.[0]?.text || null;
        },
        stripSystem: true,
        get apiKey() { return config_1.default.anthropic.apiKey; },
        get model() { return config_1.default.anthropic.model; },
        get maxTokens() { return config_1.default.anthropic.maxTokens; },
    },
    local: {
        endpoint: config_1.default.local.endpoint || 'http://localhost:11434/v1',
        path: '/chat/completions',
        buildBody(messages, stream) {
            return {
                model: this.model,
                messages: [{ role: 'system', content: config_1.default.systemPrompt }, ...messages],
                max_tokens: this.maxTokens,
                stream,
            };
        },
        buildHeaders() {
            return { 'Content-Type': 'application/json' };
        },
        parser: openAIParser,
        responseParser(data) {
            const d = data;
            return d.choices?.[0]?.message?.content || null;
        },
        get apiKey() { return ''; },
        get model() { return config_1.default.local.model; },
        get maxTokens() { return config_1.default.local.maxTokens; },
    },
};
async function fetchWithRetry(url, options, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeout);
            if (response.ok)
                return response;
            if (response.status === 429 && i < retries) {
                const retryAfter = parseInt(response.headers.get('Retry-After') || '', 10);
                const delay = retryAfter ? retryAfter * 1000 : 1000 * Math.pow(2, i) + Math.random() * 500;
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            if (response.status < 500)
                return null;
        }
        catch {
            if (i === retries)
                return null;
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i) + Math.random() * 500));
        }
    }
    return null;
}
async function callProvider(provider, messages, onStream) {
    const url = `${provider.endpoint}${provider.path}`;
    const body = provider.buildBody(messages, !!onStream);
    const headers = provider.buildHeaders();
    if (onStream) {
        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response)
            return null;
        return streamSSEResponse(response, onStream, provider.parser);
    }
    const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    if (!response)
        return null;
    const data = await response.json();
    return provider.responseParser(data);
}
async function runKeywordTutorFn(message, lang, topic, code, hasError) {
    const result = (0, tutor_keywords_1.runKeywordTutor)(message, lang, topic, code, hasError);
    return result ? result.response : null;
}
async function runHybridLLM(messages, onStream, lang, topic, code, hasError) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    const keywordResult = (0, tutor_keywords_1.runKeywordTutor)(lastMsg, lang, topic, code, hasError);
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
        const llmResponse = await (0, tiny_llm_1.getTinyLLMResponse)(messages, onStream);
        return llmResponse;
    }
    catch (e) {
        console.error('[hybrid] Tiny LLM fallback failed:', e);
        return null;
    }
}
async function askLLM(messages, onStream, options) {
    const { provider } = config_1.default;
    if (provider === 'hybrid') {
        return runHybridLLM(messages, onStream, options?.lang, options?.topic, options?.code, options?.hasError);
    }
    if (provider === 'openai' && config_1.default.openai.apiKey) {
        return callProvider(PROVIDERS.openai, messages, onStream);
    }
    if (provider === 'anthropic' && config_1.default.anthropic.apiKey) {
        return callProvider(PROVIDERS.anthropic, messages, onStream);
    }
    if (provider === 'local') {
        return callProvider(PROVIDERS.local, messages, onStream);
    }
    return null;
}
//# sourceMappingURL=provider.js.map