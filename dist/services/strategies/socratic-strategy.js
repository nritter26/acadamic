import * as conv from '../conversation';
import { matchTopic } from '../../ai/tutor-keywords';
export class SocraticStrategy {
    name = 'socratic';
    priority = 4;
    async canHandle(ctx) {
        if (ctx.topic)
            return true;
        const matchedTopics = matchTopic(ctx.message || ctx.q);
        if (matchedTopics.length > 0)
            return false;
        const words = ctx.q.split(/\s+/);
        if (words.length <= 3)
            return true;
        if (/help|confused|stuck|lost|where do I|how do I|what should/i.test(ctx.q))
            return true;
        return false;
    }
    async handle(ctx, sseSend, sseDone) {
        if (ctx.topic) {
            const reply = `Great question about **${ctx.topic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far?`;
            if (ctx.lid) {
                try {
                    await conv.addMessage(ctx.lid, 'assistant', reply);
                }
                catch { }
            }
            sseSend(reply);
            sseDone();
            return true;
        }
        const fallbacks = [
            "That's an interesting question! To help you best, could you tell me: what language are you working with?",
            "I want to make sure I help you effectively. Could you tell me more about what you're working on?",
            "Let me help you learn! Try asking me about a specific topic you're studying, or share your code for debugging.",
        ];
        const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        if (ctx.lid) {
            try {
                await conv.addMessage(ctx.lid, 'assistant', reply);
            }
            catch { }
        }
        sseSend(reply);
        sseDone();
        return true;
    }
}
//# sourceMappingURL=socratic-strategy.js.map