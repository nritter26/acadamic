"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exercises_1 = require("../ai/exercises");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post('/', (0, middleware_1.validate)(types_1.ExerciseSchema), async (req, res) => {
    const { topic, lang, level } = req.body;
    if (!topic) {
        res.status(400).json({ error: 'No topic provided' });
        return;
    }
    const exercise = await (0, exercises_1.generateExercise)(topic, lang || 'js', level || 'beginner');
    res.json(exercise);
});
exports.default = router;
//# sourceMappingURL=exercise.js.map