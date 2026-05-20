import { search as semanticSearch } from '../../ai/embeddings';
import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';
import { detectLanguage } from './utils';

export class SemanticSearchStrategy implements TutorStrategy {
  name = 'semantic-search';
  priority = 30;

  async canHandle(): Promise<boolean> {
    return true;
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    const searchLang = detectLanguage(ctx.message) || ctx.lang;
    const semanticResults = await semanticSearch(ctx.q, searchLang, 1);
    if (semanticResults.length > 0 && semanticResults[0].score > 0.15) {
      const best = semanticResults[0];
      let reply = `I found relevant content in the curriculum related to your question.\n\n**${best.topic}** (${best.lang.toUpperCase()} - ${best.phase})\n\n`;
      reply += best.exp.slice(0, 500) + '...\n\n';
      if (best.code) reply += `**Example code:**\n\`\`\`\n${best.code}\n\`\`\`\n\n`;
      reply += `Would you like me to explain more about **${best.topic}** or help you practice it?`;
      await conv.addMessage(ctx.lid, 'assistant', reply).catch(() => {});
      sseSend(reply);
      sseDone();
      return true;
    }
    return false;
  }
}
