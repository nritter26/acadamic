"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyIntent = classifyIntent;
const provider_1 = require("./provider");
const GREETING_PATTERN = /^(hi|hello|hey|good morning|good evening|good afternoon|sup|yo)\b/i;
const THANKS_PATTERN = /^(thanks|thank you|thx|ty|appreciate it)\b/i;
const DEBUG_PATTERN = /\b(error|bug|fix|wrong|not working|broken|crash|issue|debug|fail|failed)\b/i;
const EXERCISE_PATTERN = /\b(exercise|practice|challenge|drill|quiz|test me|give me|problem)\b/i;
const INTENT_CLASSIFICATION_PROMPT = `Classify this programming tutoring message into one of: QUESTION, DEBUG, EXERCISE, GREETING, FOLLOWUP, OFF_TOPIC, THANKS. Return only the intent label.`;
async function classifyIntent(message, history) {
    const trimmed = message.trim().toLowerCase();
    if (GREETING_PATTERN.test(trimmed))
        return 'GREETING';
    if (THANKS_PATTERN.test(trimmed))
        return 'THANKS';
    const lastWasBot = history && history.length > 0 && history[history.length - 1]?.role === 'assistant';
    if (lastWasBot && /^(what|how|why|can|could|is|are|do|does|did)\b/.test(trimmed))
        return 'FOLLOWUP';
    if (DEBUG_PATTERN.test(trimmed))
        return 'DEBUG';
    if (EXERCISE_PATTERN.test(trimmed))
        return 'EXERCISE';
    try {
        let result = '';
        await (0, provider_1.askLLM)([{ role: 'system', content: INTENT_CLASSIFICATION_PROMPT }, { role: 'user', content: message }], (chunk) => { result += chunk; }, {});
        const cleaned = result.trim().toUpperCase();
        if (['QUESTION', 'DEBUG', 'EXERCISE', 'GREETING', 'FOLLOWUP', 'OFF_TOPIC', 'THANKS'].includes(cleaned)) {
            return cleaned;
        }
    }
    catch { }
    return 'QUESTION';
}
//# sourceMappingURL=intent.js.map