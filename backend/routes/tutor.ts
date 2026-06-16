import { Router, Request, Response } from 'express';
import { askLLM, LLMMessage } from '../ai/provider';
import { createSession, transitionState, getSession } from '../services/teaching-session';
import { searchWithSources } from '../ai/embeddings';
import { getConceptMastery } from '../ai/learner';
import { validate } from '../middleware';
import { ExplainTopicSchema, StartExerciseSchema, AttemptExerciseSchema } from '../types';
import { generateExercise } from '../ai/exercises';
import { review as codeReview } from '../ai/reviewer';
import { getNextRecommendedTopic, trackAttempt, trackError } from '../ai/learner';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prereqPath = path.join(__dirname, '..', 'data', 'prerequisites.json');
let prereqData: Record<string, Record<string, { prerequisites: string[]; phase: string }>> = {};
try {
  if (fs.existsSync(prereqPath)) {
    prereqData = JSON.parse(fs.readFileSync(prereqPath, 'utf-8'));
  }
} catch (e) {
  console.error('Failed to load prerequisites.json:', e);
}

router.post('/explain-topic', validate(ExplainTopicSchema), async (req: Request, res: Response) => {
  const { topic, lang, phase, learnerId, code, useAI } = req.body;
  const lid = learnerId || 'default';
  const useLang = lang || 'js';
  const usePhase = phase || 'general';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let aborted = false;
  let sseDoneCalled = false;
  res.on('close', () => { aborted = true; });

  const TIMEOUT_MS = 30000;
  const timeoutHandle = setTimeout(() => {
    if (!sseDoneCalled) {
      sseDoneCalled = true;
      res.write(`data: ${JSON.stringify({ content: "\n\n[TIMEOUT] The AI tutor took too long to respond. Please try again." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }, TIMEOUT_MS);

  const session = createSession(lid, useLang, topic, usePhase);
  transitionState(lid, useLang, topic, 'explaining');

  let mastery: { topics: Array<{ topic: string; completed: boolean; mastery: number }>; overall: number } | null = null;
  try {
    const result = await getConceptMastery(lid, useLang);
    if (result?.topics) mastery = result;
  } catch {}

  let prereqNote = '';
  const langPrereqs = prereqData[useLang];
  if (langPrereqs && langPrereqs[topic] && mastery && mastery.topics.length > 0) {
    const needed = langPrereqs[topic].prerequisites;
    const missingPrereqs = needed.filter(p => {
      const t = mastery.topics.find((mt: { topic: string }) => mt.topic.toLowerCase() === p.toLowerCase());
      return !t || !t.completed || t.mastery < 50;
    });
    if (missingPrereqs.length > 0) {
      prereqNote = `NOTE: This topic requires understanding of: ${missingPrereqs.join(', ')}. If something is unclear, ask about those topics first.`;
    }
  }

  const { results } = await searchWithSources(topic, useLang, 3);
  let learnerLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  let weakAreas = '';
  if (mastery && mastery.topics.length > 0) {
    const avg = mastery.overall;
    if (avg > 85) learnerLevel = 'advanced';
    else if (avg > 70) learnerLevel = 'intermediate';
    const weak = mastery.topics.filter(t => t.completed && t.mastery < 60).map(t => t.topic);
    if (weak.length > 0) weakAreas = `The learner struggles with: ${weak.join(', ')}. Focus extra attention here.`;
  }

  let ragContext = '';
  if (results.length > 0) {
    ragContext = results.map(r => `[${r.phase}] ${r.topic}: ${r.exp?.slice(0, 300) || ''}`).join('\n');
  }

  let fullResponse = '';

  if (useAI === false) {
    fullResponse = `**${topic}**\n\nThis is a key concept in ${useLang}. Try exploring it through the curriculum and writing code. You can enable the AI tutor in settings for personalized explanations.\n\n---\n\n*AI-assisted explanations are currently disabled.*`;
    res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'explanation_end', topic, lang: useLang, phase: usePhase })}\n\n`);
    res.write('data: [DONE]\n\n');
    clearTimeout(timeoutHandle);
    sseDoneCalled = true;
    res.end();
    return;
  }

  const systemPrompt = `You are a programming tutor teaching a ${learnerLevel} student about "${topic}" in ${useLang}.
${weakAreas}
${ragContext ? `Use this curriculum context:\n${ragContext}` : ''}

Structure your explanation:
1. What is ${topic}? (simple definition)
2. Why is it useful?
3. Code example
4. Common pitfalls
5. End with a question to check understanding

Keep it conversational and encourage the student to try it themselves.`;

  const fullSystemPrompt = prereqNote ? `${systemPrompt}\n\n${prereqNote}` : systemPrompt;

  const sseSend = (chunk: string) => {
    if (aborted || sseDoneCalled) return;
    fullResponse += chunk;
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  };

  try {
    const messages: LLMMessage[] = [
      { role: 'system', content: fullSystemPrompt },
      ...(code ? [{ role: 'user' as const, content: `I have this code:\n\`\`\`\n${code}\n\`\`\`` }] : []),
      { role: 'user', content: `Explain "${topic}" in ${useLang} and help me understand it.` },
    ];
    await askLLM(messages, sseSend, { lang: useLang, topic });
  } catch (e) {
    console.error('[tutor] explain-topic LLM error:', (e as Error).message);
    if (!sseDoneCalled) {
      sseDoneCalled = true;
      clearTimeout(timeoutHandle);
      res.write(`data: ${JSON.stringify({ content: "Sorry, I couldn't generate an explanation right now." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  if (sseDoneCalled || aborted) return;
  sseDoneCalled = true;
  clearTimeout(timeoutHandle);

  const s = getSession(lid, useLang, topic);
  if (s) s.explanation = fullResponse;

  if (req.body.include_checkin) {
    const checkinMessages: LLMMessage[] = [
      { role: 'system', content: `Generate one multiple-choice check-in question about "${topic}" in ${useLang} to test understanding. Respond with valid JSON: { "question": "...", "options": ["...","...","..."], "answerIndex": 0, "explanation": "..." }` },
    ];
    let checkinJson = '';
    try {
      await askLLM(checkinMessages, (chunk: string) => { checkinJson += chunk; }, { lang: useLang, topic });
      const jsonStr = checkinJson.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.write(`data: ${JSON.stringify({ type: 'checkin', question: parsed.question, options: parsed.options, answerIndex: parsed.answerIndex, explanation: parsed.explanation })}\n\n`);
    } catch (e2) {
      console.error('[tutor] check-in generation failed:', (e2 as Error).message);
    }
  }

  if (aborted) return;
  res.write(`data: ${JSON.stringify({ type: 'explanation_end', topic, lang: useLang, phase: usePhase })}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
});

router.post('/start-exercise', validate(StartExerciseSchema), async (req: Request, res: Response) => {
  const { topic, lang, level, learnerId } = req.body;
  const lid = learnerId || 'default';
  const useLang = lang || 'js';

  const session = getSession(lid, useLang, topic);
  if (!session) {
    res.status(400).json({ error: 'No active session. Start with explain-topic first.' });
    return;
  }

  try {
    transitionState(lid, useLang, topic, 'exercising');

    const exercise = await generateExercise(topic, useLang, level || 'beginner');
    session.exercise = exercise as unknown as Record<string, unknown>;
    session.codeAttempts = 0;

    res.json({ exercise, sessionState: 'exercising' });
  } catch {
    res.status(500).json({ error: 'Failed to generate exercise' });
  }
});

router.post('/attempt-exercise', validate(AttemptExerciseSchema), async (req: Request, res: Response) => {
  const { topic, lang, code, learnerId } = req.body;
  const lid = learnerId || 'default';
  const useLang = lang || 'js';

  const session = getSession(lid, useLang, topic);
  if (!session) {
    res.status(400).json({ error: 'No active session.' });
    return;
  }

  session.codeAttempts += 1;
  trackAttempt(lid, useLang, topic).catch(() => {});

  const reviewResult = await codeReview(code, useLang, topic);
  const hasErrors = reviewResult.issues?.some((i: { severity: string }) => i.severity === 'error') ?? false;
  if (hasErrors) {
    trackError(lid, useLang, topic).catch(() => {});
  }

  const remaining = 3 - session.codeAttempts;
  const hint = remaining <= 0 && session.exercise
    ? (session.exercise as Record<string, unknown>).hint || ''
    : '';

  res.json({
    review: reviewResult.review,
    score: reviewResult.score,
    issues: reviewResult.issues,
    attempts: session.codeAttempts,
    hint: hint || undefined,
    passed: !hasErrors && session.codeAttempts >= 1,
  });
});

router.post('/hint', async (req: Request, res: Response) => {
  const { topic, lang, code, learnerId, promptContext } = req.body;
  const useLang = lang || 'js';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let aborted = false;
  let sseDoneCalled = false;
  res.on('close', () => { aborted = true; });

  const TIMEOUT_MS = 15000;
  const timeoutHandle = setTimeout(() => {
    if (!sseDoneCalled) {
      sseDoneCalled = true;
      res.write(`data: ${JSON.stringify({ content: "\n\n[HINT TIMEOUT] Try again." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }, TIMEOUT_MS);

  const systemMessage = promptContext
    ? promptContext
    : 'You are a helpful tutor. Give a short, specific hint to help the student fix their code. Do not give the full answer.';

  const messages: LLMMessage[] = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: `The student is working on "${topic}" in ${useLang}.\nTheir code:\n\`\`\`${useLang}\n${code || ''}\n\`\`\`\nGive them a helpful hint.` },
  ];

  const sseSend = (chunk: string) => {
    if (aborted || sseDoneCalled) return;
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  };

  try {
    await askLLM(messages, sseSend, { lang: useLang, topic });
  } catch (e) {
    console.error('[tutor] hint error:', (e as Error).message);
    if (!sseDoneCalled) {
      sseDoneCalled = true;
      clearTimeout(timeoutHandle);
      res.write(`data: ${JSON.stringify({ content: "Sorry, I couldn't generate a hint." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  if (!sseDoneCalled && !aborted) {
    sseDoneCalled = true;
    clearTimeout(timeoutHandle);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

router.get('/recommend', async (req: Request, res: Response) => {
  const lang = req.query.lang as string;
  const learnerId = (req.query.learnerId as string) || 'default';
  if (!lang) {
    res.status(400).json({ error: 'lang query parameter required' });
    return;
  }

  try {
    const contentDir = path.join(__dirname, '..', 'content');
    const filePath = path.join(contentDir, `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const recommended = await getNextRecommendedTopic(learnerId, lang, data);
    res.json(recommended || { topic: null, reason: 'all-complete' });
  } catch {
    res.json({ topic: null, reason: 'unavailable' });
  }
});

export default router;
