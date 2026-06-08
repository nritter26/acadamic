import { Router, Request, Response } from 'express';
import { askLLM } from '../ai/provider';
import { createSession, transitionState, getSession } from '../services/teaching-session';
import { searchWithSources } from '../ai/embeddings';
import { getConceptMastery } from '../ai/learner';
import { validate } from '../middleware';
import { ExplainTopicSchema } from '../types';

const router = Router();

router.post('/explain-topic', validate(ExplainTopicSchema), async (req: Request, res: Response) => {
  const { topic, lang, phase, learnerId, code } = req.body;
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

  const { results } = await searchWithSources(topic, useLang, 3);
  let learnerLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  let weakAreas = '';
  try {
    const mastery = await getConceptMastery(lid, useLang);
    if (mastery?.topics?.length > 0) {
      const avg = mastery.overall;
      if (avg > 85) learnerLevel = 'advanced';
      else if (avg > 70) learnerLevel = 'intermediate';
      const weak = mastery.topics.filter(t => t.completed && t.mastery < 60).map(t => t.topic);
      if (weak.length > 0) weakAreas = `The learner struggles with: ${weak.join(', ')}. Focus extra attention here.`;
    }
  } catch {}

  let ragContext = '';
  if (results.length > 0) {
    ragContext = results.map(r => `[${r.phase}] ${r.topic}: ${r.exp?.slice(0, 300) || ''}`).join('\n');
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

  let fullResponse = '';
  const sseSend = (chunk: string) => {
    if (aborted) return;
    fullResponse += chunk;
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  };

  try {
    await askLLM(
      [
        { role: 'system', content: systemPrompt },
        ...(code ? [{ role: 'user', content: `I have this code:\n\`\`\`\n${code}\n\`\`\`` }] : []),
        { role: 'user', content: `Explain "${topic}" in ${useLang} and help me understand it.` },
      ],
      sseSend,
      { lang: useLang, topic },
    );
  } catch (e) {
    if (!sseDoneCalled) {
      sseDoneCalled = true;
      clearTimeout(timeoutHandle);
      res.write(`data: ${JSON.stringify({ content: "Sorry, I couldn't generate an explanation right now." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  if (sseDoneCalled) return;
  sseDoneCalled = true;
  clearTimeout(timeoutHandle);

  const s = getSession(lid, useLang, topic);
  if (s) s.explanation = fullResponse;

  res.write(`data: ${JSON.stringify({ type: 'explanation_end', topic, lang: useLang, phase: usePhase })}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
});

export default router;
