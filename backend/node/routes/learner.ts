import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as learner from '../ai/learner';
import { validate } from '../middleware';
import { LearnerTrackSchema } from '../types';

const router = Router();

function getLearnerId(req: Request): string {
  return req.body?.learnerId || req.query?.learnerId as string || req.ip || 'default';
}

router.post('/track', validate(LearnerTrackSchema), async (req: Request, res: Response) => {
  const learnerId = getLearnerId(req);
  const { event, lang, topic, phase, data } = req.body;

  try {
    switch (event) {
      case 'complete-topic':
        await learner.trackTopicCompletion(learnerId, lang || 'unknown', topic || 'unknown', phase);
        break;
      case 'error':
        await learner.trackError(learnerId, lang || 'unknown', topic || 'unknown');
        break;
      case 'attempt':
        await learner.trackAttempt(learnerId, lang || 'unknown', topic || 'unknown');
        break;
      case 'quiz':
        await learner.trackQuiz(learnerId, data?.correct ?? 0, data?.total ?? 0);
        break;
      case 'challenge':
        await learner.trackChallenge(learnerId, data?.solved ?? false);
        break;
      case 'ai-interaction':
        await learner.trackAIInteraction(learnerId);
        break;
      default:
        res.status(400).json({ error: 'Unknown event type' });
        return;
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to track event' });
  }
});

router.get('/state', async (req: Request, res: Response) => {
  const learnerId = getLearnerId(req);
  const lang = req.query.lang as string | undefined;
  try {
    const learnerState = await learner.getLearner(learnerId);
    const mastery = lang ? await learner.getConceptMastery(learnerId, lang) : null;
    res.json({ learner: learnerState, mastery });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get learner state' });
  }
});

router.get('/reviews', async (req: Request, res: Response) => {
  const learnerId = getLearnerId(req);
  try {
    const due = await learner.getDueReviews(learnerId);
    res.json({ due });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

router.get('/recommend', async (req: Request, res: Response) => {
  const learnerId = getLearnerId(req);
  const lang = req.query.lang as string | undefined;
  try {
    const availablePhases = req.query.topics ? JSON.parse(req.query.topics as string) : {};
    const recommendation = await learner.getNextRecommendedTopic(learnerId, lang || 'js', availablePhases);
    res.json({ recommendation });
  } catch {
    res.json({ recommendation: null });
  }
});

router.get('/path', async (req: Request, res: Response) => {
  const learnerId = getLearnerId(req);
  const lang = (req.query.lang as string) || 'js';

  try {
    const learnerState = await learner.getLearner(learnerId);
    const mastery = await learner.getConceptMastery(learnerId, lang);
    const dueReviews = await learner.getDueReviews(learnerId);
    const availablePhases: Record<string, Record<string, boolean>> = {};

    try {
      const allowed = fs.readdirSync(path.join(__dirname, '..', 'content'))
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace(/\.json$/, ''));
      if (!allowed.includes(lang)) {
        res.status(400).json({ error: 'Invalid language' });
        return;
      }
      const langData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'content', `${lang}.json`), 'utf-8'),
      );
      for (const phase of Object.keys(langData)) {
        availablePhases[phase] = Object.keys(langData[phase]).reduce(
          (acc: Record<string, boolean>, t) => ({ ...acc, [t]: true }),
          {},
        );
      }
    } catch {}

    const recommendation = await learner.getNextRecommendedTopic(learnerId, lang, availablePhases);

    const allTopics: { phase: string; topic: string; reason: string; status: 'completed' | 'ready' | 'locked' }[] = [];

    for (const [phase, topics] of Object.entries(availablePhases)) {
      for (const topic of Object.keys(topics)) {
        const key = `${lang}:${phase}:${topic}`;
        const isCompleted = !!(learnerState.topics as Record<string, { completedAt?: string }>)[key]?.completedAt;
        const isDue = dueReviews.some(r => r.key === key);
        const status: 'completed' | 'ready' | 'locked' = isCompleted
          ? 'completed'
          : recommendation && (recommendation.topic === topic || allTopics.length === 0)
            ? 'ready'
            : 'locked';
        allTopics.push({ phase, topic, reason: isDue ? 'review-due' : 'next-in-sequence', status });
      }
    }

    const weakAreas = mastery.topics
      .filter(t => t.completed && t.mastery < 60)
      .map(t => ({ topic: t.topic, mastery: t.mastery }));

    const total = allTopics.length;
    const completed = allTopics.filter(t => t.status === 'completed').length;

    res.json({
      lang,
      progress: { completed, total, percent: total > 0 ? Math.round(completed / total * 100) : 0 },
      nextSteps: allTopics.filter(t => t.status !== 'locked').slice(0, 10),
      weakAreas: weakAreas.slice(0, 5),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
});

export default router;
