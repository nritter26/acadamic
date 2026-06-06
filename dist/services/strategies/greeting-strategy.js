import * as conv from '../conversation';
export class GreetingStrategy {
    name = 'greeting';
    priority = 5;
    async canHandle(ctx) {
        if (ctx.q.includes('thank')) {
            // FollowUpStrategy (higher priority) handles 'thank' when history >= 2
            if (ctx.history && ctx.history.length >= 2)
                return false;
            return true;
        }
        if (/hello|hi |^hey$|good/.test(ctx.q))
            return true;
        return false;
    }
    async handle(ctx, sseSend, sseDone) {
        if (ctx.q.includes('thank')) {
            const reply = "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step!";
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
        const langInfo = ctx.lang ? `I see you're studying **${ctx.lang.toUpperCase()}**. ` : '';
        const reply = `Hello! ${langInfo}Ask me anything about the topic you're working on!`;
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
//# sourceMappingURL=greeting-strategy.js.map