"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLLMMessages = buildLLMMessages;
exports.handleTutorMessage = handleTutorMessage;
const analyzer_1 = require("./analyzer");
const embeddings_1 = require("../ai/embeddings");
const learner = __importStar(require("../ai/learner"));
const conv = __importStar(require("./conversation"));
const middleware_1 = require("../middleware");
const strategies_1 = require("./strategies");
const utils_1 = require("./strategies/utils");
const langConfig_1 = require("../public/langConfig");
const query_expander_1 = require("../ai/query-expander");
const config_1 = require("../ai/config");
const tutor_keywords_1 = require("../ai/tutor-keywords");
function extractSubject(text) {
    if (!text)
        return '';
    const m = text.match(/\*\*([A-Z][a-z+#]+)\*\*/);
    return m ? m[1] : '';
}
function resolveFollowUp(q, history) {
    if (!history || history.length < 2)
        return q;
    const trimmed = q.trim().toLowerCase();
    const pronounPattern = /^(what|how|why|where|when|which|can|could|would|will|do|does|did|is|are)\s+(is|are|was|were|does|do|did|can|could|about|the|a|an|it|this|that|they|these|those|its|their)\b/i;
    const pronounWords = /\b(it|this|that|they|them|these|those|its|their)\b/i;
    if (!pronounPattern.test(trimmed) && !pronounWords.test(trimmed))
        return q;
    const lastBot = [...history].reverse().find(m => m.role === 'bot');
    if (!lastBot || !lastBot.text)
        return q;
    const topics = (0, tutor_keywords_1.matchTopic)(q);
    const subject = extractSubject(lastBot.text);
    const subjectLower = subject.toLowerCase();
    if (topics.length > 0 && !topics.some(t => subjectLower.startsWith(t)))
        return q;
    const lang = (0, utils_1.detectLanguage)(lastBot.text);
    let result = subject ? `${subject} ${q}` : q;
    if (lang) {
        const rawName = langConfig_1.LANG_NAMES[lang] || lang;
        const alreadyMentions = trimmed.includes(lang) || trimmed.includes(rawName);
        if (!alreadyMentions) {
            const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            result = `in ${displayName}, ${result.toLowerCase()}`;
        }
    }
    return result;
}
async function buildLLMMessages(message, lang, topic, phase, code, output, hasError, history, learnerId) {
    const messages = [];
    const context = [];
    let learnerLevel = 'beginner';
    if (learnerId && lang) {
        try {
            const mastery = await learner.getConceptMastery(learnerId, lang);
            if (mastery?.topics?.length > 0) {
                const avgMastery = mastery.overall;
                const weakTopics = mastery.topics.filter(t => t.completed && t.mastery < 60).map(t => t.topic);
                if (avgMastery > 85)
                    learnerLevel = 'advanced';
                else if (avgMastery > 70)
                    learnerLevel = 'intermediate';
                else
                    learnerLevel = 'beginner';
                context.push(`[Learner Profile] Current level: ${learnerLevel}. Overall mastery: ${avgMastery}%. Weak areas: ${weakTopics.join(', ') || 'none'}.`);
            }
        }
        catch (e) {
            middleware_1.logger.debug({ error: String(e) }, 'Learner profile failed');
        }
    }
    messages.push({ role: 'system', content: (0, config_1.getSystemPrompt)(learnerLevel) });
    if (topic) {
        const topicCtx = (0, embeddings_1.getTopicContext)(topic, lang);
        if (topicCtx)
            context.push(topicCtx);
        context.push(`The user is asking specifically about the topic "${topic}". Focus your response on this topic.`);
    }
    if (code) {
        const analysis = (0, analyzer_1.analyzeUserCode)(code, lang || 'js');
        if (analysis?.length) {
            context.push(`The user has written this code:\n\`\`\`\n${code}\n\`\`\`\n\nCode analysis findings:\n${analysis.map((h, i) => `${i + 1}. ${h}`).join('\n')}`);
        }
        else {
            context.push(`The user has written this code:\n\`\`\`\n${code}\n\`\`\``);
        }
    }
    if (hasError && output) {
        context.push(`The code produced this output/error:\n\`\`\`\n${output.replace(/<[^>]*>/g, '').trim()}\n\`\`\``);
    }
    try {
        const expanded = (0, query_expander_1.expandQuery)(message + (topic ? ' ' + topic : ''));
        const queryStr = expanded.join(' ');
        const { results, mode } = await (0, embeddings_1.searchWithSources)(queryStr, lang, 3);
        if (results.length > 0) {
            const sourceLines = results.map((r, i) => `[${i + 1}] ${r.lang.toUpperCase()} / ${r.phase} / ${r.topic} (score: ${(r.score * 100).toFixed(0)}%)`);
            let ragCtx = `\n**Relevant curriculum content (${mode} search):**\n${sourceLines.join('\n')}\n\n`;
            for (const r of results) {
                if (r.exp)
                    ragCtx += `[${r.topic}] ${r.exp.slice(0, 400)}\n`;
                if (r.code)
                    ragCtx += `\`\`\`\n${r.code.slice(0, 200)}\n\`\`\`\n`;
            }
            context.push(ragCtx);
        }
    }
    catch (e) {
        middleware_1.logger.debug({ err: e }, 'RAG search failed, skipping');
    }
    if (context.length > 0) {
        messages.push({ role: 'system', content: context.join('\n\n') });
    }
    if (history && history.length > 0) {
        for (const msg of history.slice(-10)) {
            messages.push({ role: (msg.role === 'bot' ? 'assistant' : 'user'), content: msg.text || msg.content || '' });
        }
    }
    messages.push({ role: 'user', content: message });
    return messages;
}
async function handleTutorMessage(message, options, sseSend, sseDone) {
    const { lang, topic, phase, code, output, hasError, history, learnerId } = options;
    const q = resolveFollowUp(message, history).toLowerCase().trim();
    const lid = learnerId || 'default';
    try {
        await learner.trackAIInteraction(lid);
    }
    catch (err) {
        middleware_1.logger.warn({ err }, 'tutor: failed to track AI interaction');
    }
    try {
        await conv.addMessage(lid, 'user', message);
    }
    catch (err) {
        middleware_1.logger.warn({ err }, 'tutor: failed to add user message');
    }
    try {
        const ctx = {
            message, q, lang, topic, phase, code, output,
            hasError, history, learnerId, lid,
        };
        const handled = await (0, strategies_1.executeStrategies)(ctx, sseSend, sseDone);
        if (!handled) {
            const fallback = "Sorry, I couldn't process your request. Please try asking in a different way or mention a specific topic.";
            try {
                await conv.addMessage(lid, 'assistant', fallback);
            }
            catch { }
            sseSend(fallback);
            sseDone();
        }
    }
    catch (e) {
        sseSend("Sorry, I encountered an error processing your request. Please try again.");
        sseDone();
    }
}
//# sourceMappingURL=tutor.js.map