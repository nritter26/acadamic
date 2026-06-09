import { getActiveAIProvider } from '../../ai/config';
import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';

export class FollowUpStrategy implements TutorStrategy {
  name = 'follow_up';
  priority = 8;

  async canHandle(ctx: TutorContext): Promise<boolean> {
    if (getActiveAIProvider() !== 'keyword') return false;
    if (!ctx.history || ctx.history.length < 2) return false;
    if (ctx.q.includes('thank')) return true;
    const lastBotMsg = ctx.history.filter(h => h.role === 'bot').pop();
    if (!lastBotMsg) return false;
    return /yes|ok|sure|tell me more|example|show me/.test(ctx.q);
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    if (ctx.q.includes('thank')) {
      const reply = "You're welcome! Keep experimenting, keep breaking things, and keep asking questions. What would you like to explore next?";
      if (ctx.lid) {
        try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
      }
      sseSend(reply);
      sseDone();
      return true;
    }

    const lastBotMsg = ctx.history!.filter(h => h.role === 'bot').pop();
    const followUps: Record<string, string> = {
      variable: "Let's practice! Try this in the editor:\n```\nlet name = 'Your Name';\nlet age = 25;\nconsole.log(name, age);\n```\nThen click Run!",
      function: "Here's a simple exercise: Write a function called `add` that takes two parameters and returns their sum.",
      loop: "Practice: Write a loop that prints the numbers 1 through 10. Then modify it to only print even numbers.",
      array: "Try this: Create an array of your 3 favorite foods. Write a loop that prints each one.",
      class: "Exercise: Create a `Person` class with `name` and `age` properties. Add a `greet()` method.",
    };
    for (const [key, reply] of Object.entries(followUps)) {
      if (lastBotMsg?.text?.toLowerCase().includes(key)) {
        if (ctx.lid) {
          try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
        }
        sseSend(reply);
        sseDone();
        return true;
      }
    }
    return false;
  }
}
