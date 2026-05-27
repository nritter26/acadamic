import * as learner from '../../ai/learner';
import { analyzeUserCode } from '../analyzer';
import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';

export class ErrorHelpStrategy implements TutorStrategy {
  name = 'error_help';
  priority = 9;

  async canHandle(ctx: TutorContext): Promise<boolean> {
    return !!(ctx.hasError || /error|bug|fix|wrong|not working|issue/.test(ctx.q));
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    let errorReply = '';
    if (ctx.code) {
      const analysis = analyzeUserCode(ctx.code, ctx.lang || 'js');
      if (analysis?.length) {
        errorReply = "I looked at your code and found some issues:\n\n" +
          analysis.map((h, i) => `${i + 1}. ${h}`).join('\n') + '\n\n';
      }
    }
    if (ctx.output && /Error|ReferenceError|TypeError|SyntaxError|FAIL/.test(ctx.output)) {
      errorReply += `**Your code produced this output:**\n\`\`\`\n${ctx.output.replace(/<[^>]*>/g, '').trim()}\n\`\`\`\n\n`;
    }
    if (ctx.code && ctx.topic) {
      errorReply += `Since you're working on **${ctx.topic}**, here's a hint:\n`;
      errorReply += `- Look at the example in the curriculum and compare it with your code line by line\n`;
      errorReply += `- Try simplifying: comment out parts until it works, then add them back one at a time\n`;
      errorReply += `- Check the most common mistake for this topic and see if it applies to you\n\n`;
    }
    if (!errorReply) {
      errorReply = "Let's debug this systematically:\n\n**1. What did you expect?**\n**2. What actually happened?**\n**3. What have you tried?**\n\nShare your code and the error message, and I'll help!";
    } else {
      errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step.";
    }
    if (ctx.topic && ctx.lang) await learner.trackError(ctx.lid, ctx.lang, ctx.topic);
    if (ctx.lid) {
      try { await conv.addMessage(ctx.lid, 'assistant', errorReply); } catch {}
    }
    sseSend(errorReply);
    sseDone();
    return true;
  }
}
