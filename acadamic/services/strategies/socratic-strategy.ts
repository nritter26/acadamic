import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';

export class SocraticStrategy implements TutorStrategy {
  name = 'socratic';
  priority = 4;

  async canHandle(_ctx: TutorContext): Promise<boolean> {
    return true;
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    if (ctx.topic) {
      const reply = `Great question about **${ctx.topic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far?`;
      if (ctx.lid) {
        try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
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
      try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
    }
    sseSend(reply);
    sseDone();
    return true;
  }
}
