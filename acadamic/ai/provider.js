const config = require('./config');

async function askLLM(messages, onStream) {
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

async function askOpenAI(messages, onStream) {
    const { apiKey, model, endpoint, maxTokens } = config.openai;
    try {
        const body = {
            model,
            messages: [
                { role: 'system', content: config.systemPrompt },
                ...messages,
            ],
            max_tokens: maxTokens,
            stream: !!onStream,
        };

        if (onStream) {
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify(body),
            });
            if (!response.ok) return null;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let full = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
                for (const line of lines) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            full += content;
                            onStream(content);
                        }
                    } catch {}
                }
            }
            return full;
        }

        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify(body),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch {
        return null;
    }
}

async function askAnthropic(messages, onStream) {
    const { apiKey, model, maxTokens } = config.anthropic;
    try {
        const systemMsg = messages.filter(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const body = {
            model,
            max_tokens: maxTokens,
            system: config.systemPrompt,
            messages: chatMessages.map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            })),
            stream: !!onStream,
        };

        if (onStream) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify(body),
            });
            if (!response.ok) return null;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let full = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line.slice(6));
                        if (parsed.type === 'content_block_delta') {
                            const text = parsed.delta?.text || '';
                            if (text) { full += text; onStream(text); }
                        }
                    } catch {}
                }
            }
            return full;
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify(body),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.content?.[0]?.text || null;
    } catch {
        return null;
    }
}

async function askLocal(messages, onStream) {
    const { endpoint, model, maxTokens } = config.local;
    try {
        const body = {
            model,
            messages: [
                { role: 'system', content: config.systemPrompt },
                ...messages,
            ],
            max_tokens: maxTokens,
            stream: !!onStream,
        };

        if (onStream) {
            const response = await fetch(`${endpoint}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) return null;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let full = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
                for (const line of lines) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            full += content;
                            onStream(content);
                        }
                    } catch {}
                }
            }
            return full;
        }

        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch {
        return null;
    }
}

module.exports = { askLLM };
