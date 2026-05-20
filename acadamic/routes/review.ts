import { Router, Request, Response } from 'express';
import { review as codeReview } from '../ai/reviewer';
import * as learner from '../ai/learner';
import { validate } from '../middleware';
import { ReviewSchema } from '../types';

const router = Router();

router.post('/', validate(ReviewSchema), async (req: Request, res: Response) => {
  try {
    const { code, lang, topic, learnerId } = req.body;
    if (!code) {
      res.json({ review: 'No code provided.', issues: [], score: 0 });
      return;
    }

    const result = await codeReview(code, lang || 'js', topic || 'general');

    if (learnerId && result.issues) {
      const errorCount = result.issues.filter(i => i.severity === 'error' || i.severity === 'warning').length;
      if (errorCount > 0) {
        await learner.trackError(learnerId, lang || 'js', topic || 'general');
      }
      await learner.trackAttempt(learnerId, lang || 'js', topic || 'general');
    }

    res.json(result);
  } catch (e) {
    res.status(500).json({ review: 'Error: ' + (e as Error).message, issues: [], score: 0 });
  }
});

export default router;
