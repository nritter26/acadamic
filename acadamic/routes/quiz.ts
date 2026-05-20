import { Router, Request, Response } from 'express';
import { askLLM } from '../ai/provider';
import { getCurriculumContext } from '../ai/embeddings';
import { validate } from '../middleware';
import { QuizGenerateSchema, type QuizQuestion } from '../types';

const router = Router();

router.post('/generate', validate(QuizGenerateSchema), async (req: Request, res: Response) => {
  const { topic, lang, count, level } = req.body;
  if (!topic) {
    res.status(400).json({ error: 'No topic provided' });
    return;
  }

  const quizLang = lang || 'js';
  const quizCount = Math.min(count || 3, 10);

  try {
    const context = await getCurriculumContext(topic, quizLang);
    const prompt = `You are a programming quiz generator. Create ${quizCount} multiple-choice questions about "${topic}" in ${quizLang}.

${context ? `Context from curriculum:\n${context}\n\n` : ''}
Format your response as a JSON array of objects, each with:
- "question": the question text
- "options": array of 4 answer choices (strings)
- "correctIndex": the 0-based index of the correct answer in options
- "explanation": brief explanation of why the correct answer is right

Make questions educational and appropriate for ${level || 'beginner'} level. Return ONLY valid JSON.`;

    const reply = await askLLM([{ role: 'user', content: prompt }]);
    if (reply) {
      const jsonMatch = reply.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]) as QuizQuestion[];
        res.json({ questions: questions.slice(0, quizCount) });
        return;
      }
    }

    const staticQuiz: QuizQuestion[] = [
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
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
