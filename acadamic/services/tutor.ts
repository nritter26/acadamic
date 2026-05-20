import aiResponses from '../public/ai-responses';
import { analyzeUserCode } from './analyzer';
import { getCurriculumContext, getTopicContext, search as semanticSearch } from '../ai/embeddings';
import { askLLM } from '../ai/provider';
import { getActiveAIProvider } from '../ai/config';
import * as learner from '../ai/learner';
import { LANG_NAMES } from '../public/langConfig';

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
  return subject ? `${subject} ${q}` : q;
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

  if (learnerId && lang) {
    try {
      const mastery = await learner.getConceptMastery(learnerId, lang);
      if (mastery?.topics?.length > 0) {
        const avgMastery = mastery.overall;
        const weakTopics = mastery.topics.filter(t => t.completed && t.mastery < 60).map(t => t.topic);
        let level = 'beginner';
        if (avgMastery > 70) level = 'intermediate';
        if (avgMastery > 85) level = 'expert';
        context.push(`[Learner Profile] Current level: ${level}. Overall mastery: ${avgMastery}%. Weak areas: ${weakTopics.join(', ') || 'none'}.`);
      }
    } catch {}
  }

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
    const curriculumCtx = getCurriculumContext(message, lang);
    if (curriculumCtx) context.push(curriculumCtx);
  }

  if (context.length > 0) {
    messages.push({ role: 'user', content: `Context:\n${context.join('\n\n')}\n\nUser question: ${message}` });
  } else if (history && history.length > 0) {
    for (const msg of history.slice(-10)) {
      messages.push({ role: (msg.role === 'bot' ? 'assistant' : 'user') as 'user' | 'assistant', content: msg.text || msg.content || '' });
    }
    messages.push({ role: 'user', content: message });
  } else {
    messages.push({ role: 'user', content: message });
  }

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
  try { await learner.trackAIInteraction(lid); } catch {}

  try {
    // 1. Try LLM first
    if (getActiveAIProvider() !== 'keyword') {
      const llmMessages = await buildLLMMessages(message, lang, topic, phase, code, output, hasError, history, learnerId);
      let gotChunk = false;
      await askLLM(llmMessages, (chunk: string) => {
        gotChunk = true;
        sseSend(chunk);
      }, { lang, topic, code, hasError });
      if (gotChunk) {
        if (topic && lang) await learner.trackAttempt(lid, lang, topic);
        sseDone();
        return;
      }
    }

    // 2. Code-aware, error-aware help
    if (hasError || /error|bug|fix|wrong|not working|issue/.test(q)) {
      let errorReply = '';
      if (code) {
        const analysis = analyzeUserCode(code, lang || 'js');
        if (analysis?.length) {
          errorReply = "I looked at your code and found some issues:\n\n" +
            analysis.map((h, i) => `${i + 1}. ${h}`).join('\n') + '\n\n';
        }
      }
      if (output && /Error|ReferenceError|TypeError|SyntaxError|FAIL/.test(output)) {
        errorReply += `**Your code produced this output:**\n\`\`\`\n${output.replace(/<[^>]*>/g, '').trim()}\n\`\`\`\n\n`;
      }
      if (code && topic) {
        errorReply += `Since you're working on **${topic}**, here's a hint:\n`;
        errorReply += `- Look at the example in the curriculum and compare it with your code line by line\n`;
        errorReply += `- Try simplifying: comment out parts until it works, then add them back one at a time\n`;
        errorReply += `- Check the most common mistake for this topic and see if it applies to you\n\n`;
      }
      if (!errorReply) {
        errorReply = "Let's debug this systematically:\n\n**1. What did you expect?**\n**2. What actually happened?**\n**3. What have you tried?**\n\nShare your code and the error message, and I'll help!";
      } else {
        errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step.";
      }
      if (topic && lang) await learner.trackError(lid, lang, topic);
      streamReply(sseSend, sseDone, errorReply);
      return;
    }

    // 3. Follow-up detection
    if (history && history.length >= 2) {
      const lastBotMsg = history.filter(h => h.role === 'bot').pop();
      if (lastBotMsg && /yes|ok|sure|tell me more|example|show me/.test(q)) {
        const followUps: Record<string, string> = {
          variable: "Let's practice! Try this in the editor:\n```\nlet name = 'Your Name';\nlet age = 25;\nconsole.log(name, age);\n```\nThen click Run!",
          function: "Here's a simple exercise: Write a function called `add` that takes two parameters and returns their sum.",
          loop: "Practice: Write a loop that prints the numbers 1 through 10. Then modify it to only print even numbers.",
          array: "Try this: Create an array of your 3 favorite foods. Write a loop that prints each one.",
          class: "Exercise: Create a `Person` class with `name` and `age` properties. Add a `greet()` method.",
        };
        for (const [key, reply] of Object.entries(followUps)) {
          if (lastBotMsg.text?.toLowerCase().includes(key)) {
            streamReply(sseSend, sseDone, reply);
            return;
          }
        }
      }
      if (q.includes('thank')) {
        streamReply(sseSend, sseDone, "You're welcome! Keep experimenting, keep breaking things, and keep asking questions. What would you like to explore next?");
        return;
      }
    }

    // 4. Semantic curriculum search
    const searchLang = detectLanguage(message) || lang;
    const semanticResults = await semanticSearch(q, searchLang, 1);
    if (semanticResults.length > 0 && semanticResults[0].score > 0.15) {
      const best = semanticResults[0];
      let reply = `I found relevant content in the curriculum related to your question.\n\n**${best.topic}** (${best.lang.toUpperCase()} - ${best.phase})\n\n`;
      reply += best.exp.slice(0, 500) + '...\n\n';
      if (best.code) reply += `**Example code:**\n\`\`\`\n${best.code}\n\`\`\`\n\n`;
      reply += `Would you like me to explain more about **${best.topic}** or help you practice it?`;
      streamReply(sseSend, sseDone, reply);
      return;
    }

    // 5. Context-aware topic matching
    if (topic && /what|how|explain|tell me|\?/.test(q)) {
      for (const entry of aiResponses) {
        if (entry.keywords.some(k => topic.toLowerCase().includes(k))) {
          let reply = entry.response;
          reply += `\n\n**You're currently studying:** ${topic} (${phase || ''})`;
          reply += `\nTry the code example in the editor and click Run!`;
          streamReply(sseSend, sseDone, reply);
          return;
        }
      }
    }

    // 6. Standard keyword matching
    for (const entry of aiResponses) {
      if (entry.keywords.some(k => q.includes(k))) {
        streamReply(sseSend, sseDone, entry.response);
        return;
      }
    }

    // 7. Secondary keyword matching
    for (const entry of aiResponses) {
      const combined = entry.keywords.join(' ');
      if (combined.includes(q.replace(/[^a-z\s]/g, '').trim())) {
        streamReply(sseSend, sseDone, entry.response);
        return;
      }
    }

    // 8. Greeting / thanks
    if (q.includes('thank')) {
      streamReply(sseSend, sseDone, "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step!");
      return;
    }

    if (/hello|hi |^hey$|good/.test(q)) {
      const langInfo = lang ? `I see you're studying **${lang.toUpperCase()}**. ` : '';
      streamReply(sseSend, sseDone, `Hello! ${langInfo}Ask me anything about the topic you're working on!`);
      return;
    }

    // 9. Socratic / generic fallback
    if (topic) {
      streamReply(sseSend, sseDone, `Great question about **${topic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far?`);
      return;
    }

    const fallbacks = [
      "That's an interesting question! To help you best, could you tell me: what language are you working with?",
      "I want to make sure I help you effectively. Could you tell me more about what you're working on?",
      "Let me help you learn! Try asking me about a specific topic you're studying, or share your code for debugging.",
    ];
    streamReply(sseSend, sseDone, fallbacks[Math.floor(Math.random() * fallbacks.length)]);
  } catch (e) {
    sseSend("Sorry, I encountered an error processing your request. Please try again.");
    sseDone();
  }
}

function streamReply(sseSend: (chunk: string) => void, sseDone: () => void, text: string): void {
  sseSend(text);
  sseDone();
}
