import { search as semanticSearch } from '../../ai/embeddings';
import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';
import { detectLanguage } from './utils';

const TOPIC_NAMES: Record<string, string> = {
  variables: 'variable', functions: 'function', strings: 'string',
  arrays: 'array', objects: 'object', classes: 'class', loops: 'loop',
  promises: 'promise', recursion: 'recursion', closures: 'closure',
  generics: 'generics', pointers: 'pointer', modules: 'module',
  testing: 'testing', types: 'type', operators: 'operator',
  conditionals: 'conditional', booleans: 'boolean', numbers: 'number',
  'error handling': 'error_handling', concurrency: 'concurrency',
  'pattern matching': 'pattern_match', comments: 'comment', io: 'io',
};

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
    if (ctx.q.split(/\s+/).length <= 2 && (TOPIC_NAMES[ctx.q] || Object.keys(TOPIC_NAMES).some(k => ctx.q.includes(k)))) {
      return false;
    }

    const searchLang = detectLanguage(ctx.message) || ctx.lang;
    const semanticResults = await semanticSearch(ctx.q, searchLang, 1);
    if (semanticResults.length > 0 && semanticResults[0].score > 0.4) {
      const best = semanticResults[0];
      let reply = `Based on the curriculum, here's what I found about **${best.topic}** in ${best.lang.toUpperCase()}:\n\n`;
      const cleanExp = best.exp.replace(/<[^>]*>/g, '').slice(0, 600);
      if (cleanExp) reply += `${cleanExp}\n\n`;
      if (best.code) {
        reply += `**Example:**\n\`\`\`\n${best.code.slice(0, 300)}\n\`\`\`\n\n`;
      }
      reply += `Try this: open the **${best.topic}** topic in the ${best.lang.toUpperCase()} curriculum and experiment with the code example!`;
      await conv.addMessage(ctx.lid, 'assistant', reply).catch(() => {});
      sseSend(reply);
      sseDone();
      return true;
    }
    return false;
  }
}
