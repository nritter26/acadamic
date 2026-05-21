import { analyzeUserCode } from './analyzer';
import { getTopicContext, searchWithSources } from '../ai/embeddings';
import * as learner from '../ai/learner';
import * as conv from './conversation';
import { LANG_NAMES } from '../public/langConfig';
import { logger } from '../middleware';
import { executeStrategies } from './strategies';
import type { TutorContext } from './strategies';
import { expandQuery } from '../ai/query-expander';
import { getSystemPrompt } from '../ai/config';

interface HistoryEntry {
  role: string;
  text: string;
  content?: string;
}

interface LLMMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function detectLanguage(query: string): string | null {
  const words = query.toLowerCase().split(/\s+/);
  for (const word of words) {
    for (const [code, name] of Object.entries(LANG_NAMES)) {
      if (word === name || word === code) return code;
    }
    if (word === 'sql') return 'pg';
  }
  return null;
}

function extractSubject(text: string): string {
  if (!text) return '';
  const m = text.match(/\*\*([A-Z][a-z+#]+)\*\*/);
  return m ? m[1] : '';
}

function resolveFollowUp(q: string, history?: HistoryEntry[]): string {
  if (!history || history.length < 2) return q;

  const trimmed = q.trim().toLowerCase();
  const pronounPattern = /^(what|how|why|where|when|which|can|could|would|will|do|does|did|is|are)\s+(is|are|was|were|does|do|did|can|could|about|the|a|an|it|this|that|they|these|those|its|their)\b/i;
  const pronounWords = /\b(it|this|that|they|them|these|those|its|their)\b/i;

  if (!pronounPattern.test(trimmed) && !pronounWords.test(trimmed)) return q;

  const lastBot = [...history].reverse().find(m => m.role === 'bot');
  if (!lastBot || !lastBot.text) return q;

  const subject = extractSubject(lastBot.text);
  const lang = detectLanguage(lastBot.text);
  let result = subject ? `${subject} ${q}` : q;
  if (lang) {
    const rawName = LANG_NAMES[lang as keyof typeof LANG_NAMES] || lang;
    const alreadyMentions = trimmed.includes(lang) || trimmed.includes(rawName);
    if (!alreadyMentions) {
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      result = `in ${displayName}, ${result.toLowerCase()}`;
    }
  }
  return result;
}

export async function buildLLMMessages(
  message: string,
  lang?: string,
  topic?: string,
  phase?: string,
  code?: string,
  output?: string,
  hasError?: boolean,
  history?: HistoryEntry[],
  learnerId?: string,
): Promise<LLMMsg[]> {
  const messages: LLMMsg[] = [];
  const context: string[] = [];
  let learnerLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

  if (learnerId && lang) {
    try {
      const mastery = await learner.getConceptMastery(learnerId, lang);
      if (mastery?.topics?.length > 0) {
        const avgMastery = mastery.overall;
        const weakTopics = mastery.topics.filter(t => t.completed && t.mastery < 60).map(t => t.topic);
        if (avgMastery > 85) learnerLevel = 'advanced';
        else if (avgMastery > 70) learnerLevel = 'intermediate';
        else learnerLevel = 'beginner';
        context.push(`[Learner Profile] Current level: ${learnerLevel}. Overall mastery: ${avgMastery}%. Weak areas: ${weakTopics.join(', ') || 'none'}.`);
      }
    } catch (e) { logger.debug({ error: String(e) }, 'Learner profile failed'); }
  }

  messages.push({ role: 'system', content: getSystemPrompt(learnerLevel) });

  if (topic) {
    const topicCtx = getTopicContext(topic, lang);
    if (topicCtx) context.push(topicCtx);
  }

  if (code) {
    const analysis = analyzeUserCode(code, lang || 'js');
    if (analysis?.length) {
      context.push(`The user has written this code:\n\`\`\`\n${code}\n\`\`\`\n\nCode analysis findings:\n${analysis.map((h, i) => `${i + 1}. ${h}`).join('\n')}`);
    } else {
      context.push(`The user has written this code:\n\`\`\`\n${code}\n\`\`\``);
    }
  }

  if (hasError && output) {
    context.push(`The code produced this output/error:\n\`\`\`\n${output.replace(/<[^>]*>/g, '').trim()}\n\`\`\``);
  }

  if (!topic) {
    try {
      const expanded = expandQuery(message);
      const queryStr = expanded.join(' ');
      const { results, mode } = await searchWithSources(queryStr, lang, 3);
      if (results.length > 0) {
        const sourceLines = results.map((r, i) =>
          `[${i + 1}] ${r.lang.toUpperCase()} / ${r.phase} / ${r.topic} (score: ${(r.score * 100).toFixed(0)}%)`
        );
        let ragCtx = `\n**Relevant curriculum content (${mode} search):**\n${sourceLines.join('\n')}\n\n`;
        for (const r of results) {
          if (r.exp) ragCtx += `[${r.topic}] ${r.exp.slice(0, 400)}\n`;
          if (r.code) ragCtx += `\`\`\`\n${r.code.slice(0, 200)}\n\`\`\`\n`;
        }
        context.push(ragCtx);
      }
    } catch (e: unknown) {
      logger.debug({ err: e }, 'RAG search failed, skipping');
    }
  }

  if (context.length > 0) {
    messages.push({ role: 'system', content: context.join('\n\n') });
  }

  if (history && history.length > 0) {
    for (const msg of history.slice(-10)) {
      messages.push({ role: (msg.role === 'bot' ? 'assistant' : 'user') as 'user' | 'assistant', content: msg.text || msg.content || '' });
    }
  }

  messages.push({ role: 'user', content: message });

  return messages;
}

export async function handleTutorMessage(
  message: string,
  options: {
    lang?: string;
    topic?: string;
    phase?: string;
    code?: string;
    output?: string;
    hasError?: boolean;
    history?: HistoryEntry[];
    learnerId?: string;
  },
  sseSend: (chunk: string) => void,
  sseDone: () => void,
): Promise<void> {
  const { lang, topic, phase, code, output, hasError, history, learnerId } = options;
  const q = resolveFollowUp(message, history).toLowerCase().trim();

  const lid = learnerId || 'default';
  try { await learner.trackAIInteraction(lid); } catch (err: unknown) {
    logger.warn({ err }, 'tutor: failed to track AI interaction');
  }
  try { await conv.addMessage(lid, 'user', message); } catch (err: unknown) {
    logger.warn({ err }, 'tutor: failed to add user message');
  }

  try {
    const ctx: TutorContext = {
      message, q, lang, topic, phase, code, output,
      hasError, history, learnerId, lid,
    };
    const handled = await executeStrategies(ctx, sseSend, sseDone);
    if (!handled) {
      sseSend("Sorry, I couldn't process your request. Please try again.");
      sseDone();
    }
  } catch (e) {
    sseSend("Sorry, I encountered an error processing your request. Please try again.");
    sseDone();
  }
}

async function streamReply(sseSend: (chunk: string) => void, sseDone: () => void, text: string, lid?: string): Promise<void> {
  if (lid) {
    try { await conv.addMessage(lid, 'assistant', text); } catch (err: unknown) {
      logger.warn({ err }, 'tutor: failed to add streamed message');
    }
  }
  sseSend(text);
  sseDone();
}
