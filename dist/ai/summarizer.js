import { askLLM } from './provider';
export async function summarizeConversation(messages) {
    if (messages.length < 3)
        return '';
    const excerpt = messages.slice(-30, -10);
    if (excerpt.length < 3)
        return '';
    const text = excerpt.map(m => `[${m.role}]: ${m.content.slice(0, 200)}`).join('\n');
    try {
        let result = '';
        await askLLM([{ role: 'user', content: `Summarize this conversation excerpt in 2-3 sentences focusing on topics discussed and unresolved questions:\n\n${text}` }], (chunk) => { result += chunk; }, {});
        return result.trim() || '';
    }
    catch {
        return '';
    }
}
//# sourceMappingURL=summarizer.js.map