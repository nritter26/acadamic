import { getActiveAIProvider } from '../../ai/config';
import aiResponses from '../../ai/responses-data';
import * as conv from '../conversation';
import type { TutorStrategy, TutorContext } from './types';
import { matchTopic } from '../../ai/tutor-keywords';

const SINGLE_TOPIC_ALIASES: Record<string, string[]> = {
  variable: ['variables', 'var', 'declare', 'declaration', 'let', 'const'],
  function: ['functions', 'func', 'method', 'methods', 'def', 'fn'],
  string: ['strings', 'str', 'text', 'char', 'characters'],
  array: ['arrays', 'list', 'lists', 'vector', 'slice', 'collection'],
  object: ['objects', 'dict', 'dictionary', 'hash', 'map', 'json'],
  class: ['classes', 'oop', 'constructor', 'inheritance', 'extends'],
  loop: ['loops', 'for loop', 'while loop', 'iteration', 'iterate'],
  promise: ['promises', 'async', 'await', 'future', 'callback'],
  error_handling: ['error handling', 'try catch', 'exception', 'exceptions', 'panic'],
  type: ['types', 'typeof', 'annotation', 'static type', 'typing'],
  recursion: ['recursive', 'stack overflow', 'base case', 'tail call'],
  closure: ['closures', 'lexical scope', 'scope chain', 'capture'],
  generics: ['generic', 'template', 'type parameter', 'trait bound'],
  pointer: ['pointers', 'reference', 'memory address', 'dereference', 'heap'],
  pattern_match: ['pattern matching', 'match', 'switch', 'destructure'],
  concurrency: ['concurrent', 'parallel', 'thread', 'goroutine', 'channel'],
  testing: ['test', 'tests', 'unit test', 'assertion', 'jest', 'mocha'],
  module: ['modules', 'import', 'export', 'require', 'package'],
  io: ['input output', 'console', 'stdin', 'stdout', 'readline', 'print'],
  boolean: ['booleans', 'bool', 'true', 'false', 'logical'],
  number: ['numbers', 'integer', 'float', 'numeric', 'math'],
  operator: ['operators', 'arithmetic', 'comparison', 'assignment'],
  null: ['nil', 'none', 'undefined', 'optional', 'maybe'],
  comment: ['comments', 'docstring', 'documentation', 'jsdoc'],
};

export class KeywordMatchStrategy implements TutorStrategy {
  name = 'keyword_match';
  priority = 6;

  async canHandle(_ctx: TutorContext): Promise<boolean> {
    return getActiveAIProvider() === 'keyword';
  }

  async handle(
    ctx: TutorContext,
    sseSend: (chunk: string) => void,
    sseDone: () => void,
  ): Promise<boolean> {
    // Step 1: Direct single-word topic name matching
    // When the user types a topic name like "variables" or "functions" directly
    const words = ctx.q.split(/\s+/).filter(w => w.length > 1);
    for (const word of words) {
      for (const [topicKey, aliases] of Object.entries(SINGLE_TOPIC_ALIASES)) {
        if (topicKey === word || aliases.includes(word)) {
          for (const entry of aiResponses) {
            if (entry.keywords.some(k => topicKey.includes(k) || k.includes(topicKey))) {
              let reply = entry.response;
              const normalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
              const langName = ctx.lang ? ctx.lang.toUpperCase() + ' ' : '';
              if (words.length === 1) {
                reply += `\n\n**Try this:** Open the **${normalizedWord}** topic in the ${langName}curriculum, read the explanation, then modify the code example and click **Run ▶**!`;
              }
              if (ctx.lid) {
                try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
              }
              sseSend(reply);
              sseDone();
              return true;
            }
          }
        }
      }
    }

    // Step 1c: Compound query handling — only "difference between X and Y" or "X vs Y" (NOT plain "X or Y")
    const isExplicitComparison = /diff(?:erence)?\s+between\b/i.test(ctx.q);
    const diffMatch = ctx.q.match(isExplicitComparison
      ? /diff(?:erence)?\s+between\s+(\w+(?:\s+\w+)?)\s+and\s+(\w+(?:\s+\w+)?)/i
      : /(\w+(?:\s+\w+)?)\s+(?:vs|vs\.|versus)\s+(\w+(?:\s+\w+)?)/i
    );
    if (diffMatch) {
      const left = matchTopic(diffMatch[1]);
      const right = matchTopic(diffMatch[2]);
      const allTopics = [...new Set([...left, ...right])];
      if (allTopics.length > 0) {
        for (const topicName of allTopics) {
          for (const entry of aiResponses) {
            if (entry.keywords.some(k => topicName.includes(k) || k.includes(topicName))) {
              let reply = entry.response;
              reply += `\n\n**Tip:** Try writing a small program that uses each approach and compare the results side by side.`;
              if (ctx.lid) {
                try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
              }
              sseSend(reply);
              sseDone();
              return true;
            }
          }
        }
      }
    }

    // Step 1b: Regex-based topic matching (uses server-side TOPIC_KEYWORDS patterns)
    // Handles queries like "variable scope", "let vs const", "how to use async await"
    const matchedTopics = matchTopic(ctx.message);
    if (matchedTopics.length > 0) {
      for (const entry of aiResponses) {
        if (entry.keywords.some(k => matchedTopics.some(t => t.includes(k) || k.includes(t)))) {
          let reply = entry.response;
          const langName = ctx.lang ? ctx.lang.toUpperCase() + ' ' : '';
          reply += `\n\n**In ${langName}curriculum:** Open the **${matchedTopics[0]}** topic and experiment with the code to make it stick.`;
          if (ctx.lid) {
            try { await conv.addMessage(ctx.lid, 'assistant', reply); } catch {}
          }
          sseSend(reply);
          sseDone();
          return true;
        }
      }
    }

    // Step 2: Context-aware topic matching (current topic + question)
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

    // Step 3: Standard keyword matching (must match at least 2 keywords to avoid false positives)
    const matchedEntries: { entry: typeof aiResponses[0]; count: number }[] = [];
    for (const entry of aiResponses) {
      const matchCount = entry.keywords.filter(k => ctx.q.includes(k)).length;
      if (matchCount > 0) {
        matchedEntries.push({ entry, count: matchCount });
      }
    }
    matchedEntries.sort((a, b) => b.count - a.count);
    const bestMatch = matchedEntries[0];
    if (bestMatch && bestMatch.count >= 2) {
      if (ctx.lid) {
        try { await conv.addMessage(ctx.lid, 'assistant', bestMatch.entry.response); } catch {}
      }
      sseSend(bestMatch.entry.response);
      sseDone();
      return true;
    }
    // Single keyword match — only respond if query is short (likely a direct topic query)
    if (bestMatch && ctx.q.split(/\s+/).length <= 4) {
      if (ctx.lid) {
        try { await conv.addMessage(ctx.lid, 'assistant', bestMatch.entry.response); } catch {}
      }
      sseSend(bestMatch.entry.response);
      sseDone();
      return true;
    }
    // Single keyword match with long query — let it fall through to LLM or general response

    return false;
  }
}
