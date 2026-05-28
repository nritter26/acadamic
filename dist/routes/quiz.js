"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const provider_1 = require("../ai/provider");
const embeddings_1 = require("../ai/embeddings");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post('/generate', (0, middleware_1.validate)(types_1.QuizGenerateSchema), async (req, res) => {
    const { topic, lang, count, level } = req.body;
    if (!topic) {
        res.status(400).json({ error: 'No topic provided' });
        return;
    }
    const quizLang = lang || 'js';
    const quizCount = Math.min(count || 3, 10);
    try {
        const context = await (0, embeddings_1.getCurriculumContext)(topic, quizLang);
        const prompt = `You are a programming quiz generator. Create ${quizCount} multiple-choice questions about "${topic}" in ${quizLang}.

${context ? `Context from curriculum:\n${context}\n\n` : ''}
Format your response as a JSON array of objects, each with:
- "question": the question text
- "options": array of 4 answer choices (strings)
- "correctIndex": the 0-based index of the correct answer in options
- "explanation": brief explanation of why the correct answer is right

Make questions educational and appropriate for ${level || 'beginner'} level. Return ONLY valid JSON.`;
        const reply = await (0, provider_1.askLLM)([{ role: 'user', content: prompt }]);
        if (typeof reply === 'string' && reply) {
            const jsonMatch = reply.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const questions = JSON.parse(jsonMatch[0]);
                res.json({ questions: questions.slice(0, quizCount) });
                return;
            }
        }
        const staticQuiz = [
            {
                question: `What is the best way to declare a variable in ${quizLang}?`,
                options: ['Using the correct keyword', 'Without any keyword', 'With a type annotation', 'In a separate file'],
                correctIndex: 0,
                explanation: 'Always use the appropriate declaration keyword for the language.',
            },
            {
                question: `How do you write a function in ${quizLang}?`,
                options: ['Using the function keyword or syntax', 'With a class', 'In a separate module', 'Using a macro'],
                correctIndex: 0,
                explanation: 'Functions are defined using the language-specific function syntax.',
            },
        ];
        res.json({ questions: staticQuiz, source: 'static' });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});
exports.default = router;
//# sourceMappingURL=quiz.js.map