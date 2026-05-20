import aiResponses from '../../ai/responses-data';
import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';

export class KeywordMatchStrategy implements TutorStrategy {
  name = 'keyword_match';
  priority = 6;

  async canHandle(_ctx: TutorContext): Promise<boolean> {
    return true;
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    // Step 5: Context-aware topic matching
    if (ctx.topic && /what|how|explain|tell me|\?/.test(ctx.q)) {
      for (const entry of aiResponses) {
        if (entry.keywords.some(k => ctx.topic!.toLowerCase().includes(k))) {
          let reply = entry.response;
          reply += `\n\n**You're currently studying:** ${ctx.topic} (${ctx.phase || ''})`;
          reply += `\nTry the code example in the editor and click Run!`;
          if (ctx.lid) {
            try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
          }
          sseSend(reply);
          sseDone();
          return true;
        }
      }
    }

    // Step 6: Standard keyword matching
    for (const entry of aiResponses) {
      if (entry.keywords.some(k => ctx.q.includes(k))) {
        if (ctx.lid) {
          try { await conv.addMessage(ctx.lid, 'assistant', entry.response); } catch {}
        }
        sseSend(entry.response);
        sseDone();
        return true;
      }
    }

    // Step 7: Secondary keyword matching
    const cleaned = ctx.q.replace(/[^a-z\s]/g, '').trim();
    for (const entry of aiResponses) {
      const combined = entry.keywords.join(' ');
      if (combined.includes(cleaned)) {
        if (ctx.lid) {
          try { await conv.addMessage(ctx.lid, 'assistant', entry.response); } catch {}
        }
        sseSend(entry.response);
        sseDone();
        return true;
      }
    }

    return false;
  }
}
