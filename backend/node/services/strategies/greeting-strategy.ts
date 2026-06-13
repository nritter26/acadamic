import { getActiveAIProvider } from '../../ai/config';
import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';

export class GreetingStrategy implements TutorStrategy {
  name = 'greeting';
  priority = 5;

  async canHandle(ctx: TutorContext): Promise<boolean> {
    if (getActiveAIProvider() !== 'keyword') return false;
    if (ctx.q.includes('thank')) {
      // FollowUpStrategy (higher priority) handles 'thank' when history >= 2
      if (ctx.history && ctx.history.length >= 2) return false;
      return true;
    }
    if (/hello|hi |^hey$|good/.test(ctx.q)) return true;
    return false;
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    if (ctx.q.includes('thank')) {
      const reply = "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step!";
      if (ctx.lid) {
        try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
      }
      sseSend(reply);
      sseDone();
      return true;
    }

    const langInfo = ctx.lang ? `I see you're studying **${ctx.lang.toUpperCase()}**. ` : '';
    const reply = `Hello! ${langInfo}Ask me anything about the topic you're working on!`;
    if (ctx.lid) {
      try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
    }
    sseSend(reply);
    sseDone();
    return true;
  }
}
