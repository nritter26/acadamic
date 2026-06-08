import { getActiveAIProvider } from '../../ai/config';
import { askLLM } from '../../ai/provider';
import * as learner from '../../ai/learner';
import * as conv from '../conversation';
import { buildLLMMessages } from '../tutor';
import type { TutorStrategy, TutorContext } from './types';

export class LLMStrategy implements TutorStrategy {
  name = 'llm';
  priority = 99;

  async canHandle(): Promise<boolean> {
    return getActiveAIProvider() !== 'keyword';
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    const llmMessages = await buildLLMMessages(
      ctx.message,
      ctx.lang,
      ctx.topic,
      ctx.phase,
      ctx.code,
      ctx.output,
      ctx.hasError,
      ctx.history,
      ctx.learnerId,
    );
    let gotChunk = false;
    let fullResponse = '';
    await askLLM(llmMessages, (chunk: string) => {
      gotChunk = true;
      fullResponse += chunk;
      sseSend(chunk);
    }, { lang: ctx.lang, topic: ctx.topic, code: ctx.code, hasError: ctx.hasError, providerConfig: ctx.providerConfig });
    if (gotChunk) {
      if (ctx.topic && ctx.lang) await learner.trackAttempt(ctx.lid, ctx.lang, ctx.topic);
      try { await conv.addMessage(ctx.lid, 'assistant', fullResponse); } catch {}
      sseDone();
      return true;
    }
    return false;
  }
}
