import { Router } from 'express';
import { generateExercise } from '../ai/exercises';
import { validate } from '../middleware';
import { ExerciseSchema } from '../types';
const router = Router();
router.post('/', validate(ExerciseSchema), async (req, res) => {
    const { topic, lang, level } = req.body;
    if (!topic) {
        res.status(400).json({ error: 'No topic provided' });
        return;
    }
    const exercise = await generateExercise(topic, lang || 'js', level || 'beginner');
    res.json(exercise);
});
export default router;
//# sourceMappingURL=exercise.js.map