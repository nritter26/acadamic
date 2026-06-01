import { analyzeUserCode } from './analyzer';
import { getTopicContext, searchWithSources } from '../ai/embeddings';
import * as learner from '../ai/learner';
import * as conv from './conversation';
import { logger } from '../middleware';
import { executeStrategies } from './strategies';
import { detectLanguage as detectLang } from './strategies/utils';
import { LANG_NAMES } from '../public/langConfig';
import type { TutorContext } from './strategies';
import { expandQuery } from '../ai/query-expander';
import { getSystemPrompt } from '../ai/config';
import { matchTopic } from '../ai/tutor-keywords';

interface HistoryEntry {
  role: string;
  text: string;
  content?: string;
}

interface LLMMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
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

  const topics = matchTopic(q);
  const subject = extractSubject(lastBot.text);
  const subjectLower = subject.toLowerCase();
  if (topics.length > 0 && !topics.some(t => subjectLower.startsWith(t))) return q;

  const lang = detectLang(lastBot.text);
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
    context.push(`The user is asking specifically about the topic "${topic}". Focus your response on this topic.`);
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

  try {
    const expanded = expandQuery(message + (topic ? ' ' + topic : ''));
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
    logger.warn({ err: e }, 'RAG search failed');
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
    providerConfig?: { provider?: string; model?: string; apiKey?: string; endpoint?: string };
  },
  sseSend: (chunk: string) => void,
  sseDone: () => void,
): Promise<void> {
  const { lang, topic, phase, code, output, hasError, history, learnerId, providerConfig } = options;
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
      providerConfig,
    };
    const handled = await executeStrategies(ctx, sseSend, sseDone);
    if (!handled) {
      const fallback = "Sorry, I couldn't process your request. Please try asking in a different way or mention a specific topic.";
      try { await conv.addMessage(lid, 'assistant', fallback); } catch {}
      sseSend(fallback);
      sseDone();
    }
  } catch (e) {
    sseSend("Sorry, I encountered an error processing your request. Please try again.");
    sseDone();
  }
}


