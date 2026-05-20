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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLLMMessages = buildLLMMessages;
exports.handleTutorMessage = handleTutorMessage;
const responses_data_1 = __importDefault(require("../ai/responses-data"));
const analyzer_1 = require("./analyzer");
const embeddings_1 = require("../ai/embeddings");
const provider_1 = require("../ai/provider");
const config_1 = require("../ai/config");
const learner = __importStar(require("../ai/learner"));
const conv = __importStar(require("./conversation"));
const langConfig_1 = require("../public/langConfig");
function detectLanguage(query) {
    const words = query.toLowerCase().split(/\s+/);
    for (const word of words) {
        for (const [code, name] of Object.entries(langConfig_1.LANG_NAMES)) {
            if (word === name || word === code)
                return code;
        }
        if (word === 'sql')
            return 'pg';
    }
    return null;
}
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
    const subject = extractSubject(lastBot.text);
    return subject ? `${subject} ${q}` : q;
}
async function buildLLMMessages(message, lang, topic, phase, code, output, hasError, history, learnerId) {
    const messages = [];
    const context = [];
    if (learnerId && lang) {
        try {
            const mastery = await learner.getConceptMastery(learnerId, lang);
            if (mastery?.topics?.length > 0) {
                const avgMastery = mastery.overall;
                const weakTopics = mastery.topics.filter(t => t.completed && t.mastery < 60).map(t => t.topic);
                let level = 'beginner';
                if (avgMastery > 70)
                    level = 'intermediate';
                if (avgMastery > 85)
                    level = 'expert';
                context.push(`[Learner Profile] Current level: ${level}. Overall mastery: ${avgMastery}%. Weak areas: ${weakTopics.join(', ') || 'none'}.`);
            }
        }
        catch { }
    }
    if (topic) {
        const topicCtx = (0, embeddings_1.getTopicContext)(topic, lang);
        if (topicCtx)
            context.push(topicCtx);
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
    if (!topic) {
        const curriculumCtx = (0, embeddings_1.getCurriculumContext)(message, lang);
        if (curriculumCtx)
            context.push(curriculumCtx);
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
    catch { }
    try {
        await conv.addMessage(lid, 'user', message);
    }
    catch { }
    try {
        // 1. Try LLM first
        if ((0, config_1.getActiveAIProvider)() !== 'keyword') {
            const llmMessages = await buildLLMMessages(message, lang, topic, phase, code, output, hasError, history, learnerId);
            let gotChunk = false;
            let fullResponse = '';
            await (0, provider_1.askLLM)(llmMessages, (chunk) => {
                gotChunk = true;
                fullResponse += chunk;
                sseSend(chunk);
            }, { lang, topic, code, hasError });
            if (gotChunk) {
                if (topic && lang)
                    await learner.trackAttempt(lid, lang, topic);
                try {
                    await conv.addMessage(lid, 'assistant', fullResponse);
                }
                catch { }
                sseDone();
                return;
            }
        }
        // 2. Code-aware, error-aware help
        if (hasError || /error|bug|fix|wrong|not working|issue/.test(q)) {
            let errorReply = '';
            if (code) {
                const analysis = (0, analyzer_1.analyzeUserCode)(code, lang || 'js');
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
            }
            else {
                errorReply += "**Need more help?** Describe what you expected to happen and I'll guide you to the fix step by step.";
            }
            if (topic && lang)
                await learner.trackError(lid, lang, topic);
            await streamReply(sseSend, sseDone, errorReply, lid);
            return;
        }
        // 3. Follow-up detection
        if (history && history.length >= 2) {
            const lastBotMsg = history.filter(h => h.role === 'bot').pop();
            if (lastBotMsg && /yes|ok|sure|tell me more|example|show me/.test(q)) {
                const followUps = {
                    variable: "Let's practice! Try this in the editor:\n```\nlet name = 'Your Name';\nlet age = 25;\nconsole.log(name, age);\n```\nThen click Run!",
                    function: "Here's a simple exercise: Write a function called `add` that takes two parameters and returns their sum.",
                    loop: "Practice: Write a loop that prints the numbers 1 through 10. Then modify it to only print even numbers.",
                    array: "Try this: Create an array of your 3 favorite foods. Write a loop that prints each one.",
                    class: "Exercise: Create a `Person` class with `name` and `age` properties. Add a `greet()` method.",
                };
                for (const [key, reply] of Object.entries(followUps)) {
                    if (lastBotMsg.text?.toLowerCase().includes(key)) {
                        await streamReply(sseSend, sseDone, reply, lid);
                        return;
                    }
                }
            }
            if (q.includes('thank')) {
                await streamReply(sseSend, sseDone, "You're welcome! Keep experimenting, keep breaking things, and keep asking questions. What would you like to explore next?", lid);
                return;
            }
        }
        // 4. Semantic curriculum search
        const searchLang = detectLanguage(message) || lang;
        const semanticResults = await (0, embeddings_1.search)(q, searchLang, 1);
        if (semanticResults.length > 0 && semanticResults[0].score > 0.15) {
            const best = semanticResults[0];
            let reply = `I found relevant content in the curriculum related to your question.\n\n**${best.topic}** (${best.lang.toUpperCase()} - ${best.phase})\n\n`;
            reply += best.exp.slice(0, 500) + '...\n\n';
            if (best.code)
                reply += `**Example code:**\n\`\`\`\n${best.code}\n\`\`\`\n\n`;
            reply += `Would you like me to explain more about **${best.topic}** or help you practice it?`;
            await streamReply(sseSend, sseDone, reply, lid);
            return;
        }
        // 5. Context-aware topic matching
        if (topic && /what|how|explain|tell me|\?/.test(q)) {
            for (const entry of responses_data_1.default) {
                if (entry.keywords.some(k => topic.toLowerCase().includes(k))) {
                    let reply = entry.response;
                    reply += `\n\n**You're currently studying:** ${topic} (${phase || ''})`;
                    reply += `\nTry the code example in the editor and click Run!`;
                    await streamReply(sseSend, sseDone, reply, lid);
                    return;
                }
            }
        }
        // 6. Standard keyword matching
        for (const entry of responses_data_1.default) {
            if (entry.keywords.some(k => q.includes(k))) {
                await streamReply(sseSend, sseDone, entry.response, lid);
                return;
            }
        }
        // 7. Secondary keyword matching
        for (const entry of responses_data_1.default) {
            const combined = entry.keywords.join(' ');
            if (combined.includes(q.replace(/[^a-z\s]/g, '').trim())) {
                await streamReply(sseSend, sseDone, entry.response, lid);
                return;
            }
        }
        // 8. Greeting / thanks
        if (q.includes('thank')) {
            await streamReply(sseSend, sseDone, "You're welcome! Keep up the great work. Learning programming is a journey — enjoy every step!", lid);
            return;
        }
        if (/hello|hi |^hey$|good/.test(q)) {
            const langInfo = lang ? `I see you're studying **${lang.toUpperCase()}**. ` : '';
            await streamReply(sseSend, sseDone, `Hello! ${langInfo}Ask me anything about the topic you're working on!`, lid);
            return;
        }
        // 9. Socratic / generic fallback
        if (topic) {
            await streamReply(sseSend, sseDone, `Great question about **${topic}**! Instead of giving you the answer directly, let me ask: what do you think the answer might be? What have you tried so far?`, lid);
            return;
        }
        const fallbacks = [
            "That's an interesting question! To help you best, could you tell me: what language are you working with?",
            "I want to make sure I help you effectively. Could you tell me more about what you're working on?",
            "Let me help you learn! Try asking me about a specific topic you're studying, or share your code for debugging.",
        ];
        await streamReply(sseSend, sseDone, fallbacks[Math.floor(Math.random() * fallbacks.length)], lid);
    }
    catch (e) {
        sseSend("Sorry, I encountered an error processing your request. Please try again.");
        sseDone();
    }
}
async function streamReply(sseSend, sseDone, text, lid) {
    if (lid) {
        try {
            await conv.addMessage(lid, 'assistant', text);
        }
        catch { }
    }
    sseSend(text);
    sseDone();
}
//# sourceMappingURL=tutor.js.map