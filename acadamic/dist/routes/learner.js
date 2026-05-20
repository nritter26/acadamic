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
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const learner = __importStar(require("../ai/learner"));
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
function getLearnerId(req) {
    return req.body?.learnerId || req.query?.learnerId || req.ip || 'default';
}
router.post('/track', (0, middleware_1.validate)(types_1.LearnerTrackSchema), async (req, res) => {
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
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to track event' });
    }
});
router.get('/state', async (req, res) => {
    const learnerId = getLearnerId(req);
    const lang = req.query.lang;
    try {
        const learnerState = await learner.getLearner(learnerId);
        const mastery = lang ? await learner.getConceptMastery(learnerId, lang) : null;
        res.json({ learner: learnerState, mastery });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to get learner state' });
    }
});
router.get('/reviews', async (req, res) => {
    const learnerId = getLearnerId(req);
    try {
        const due = await learner.getDueReviews(learnerId);
        res.json({ due });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});
router.get('/recommend', async (req, res) => {
    const learnerId = getLearnerId(req);
    const lang = req.query.lang;
    try {
        const availablePhases = req.query.topics ? JSON.parse(req.query.topics) : {};
        const recommendation = await learner.getNextRecommendedTopic(learnerId, lang || 'js', availablePhases);
        res.json({ recommendation });
    }
    catch {
        res.json({ recommendation: null });
    }
});
router.get('/path', async (req, res) => {
    const learnerId = getLearnerId(req);
    const lang = req.query.lang || 'js';
    try {
        const learnerState = await learner.getLearner(learnerId);
        const mastery = await learner.getConceptMastery(learnerId, lang);
        const dueReviews = await learner.getDueReviews(learnerId);
        const availablePhases = {};
        try {
            const langData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'content', `${lang}.json`), 'utf-8'));
            for (const phase of Object.keys(langData)) {
                availablePhases[phase] = Object.keys(langData[phase]).reduce((acc, t) => ({ ...acc, [t]: true }), {});
            }
        }
        catch { }
        const recommendation = await learner.getNextRecommendedTopic(learnerId, lang, availablePhases);
        const allTopics = [];
        for (const [phase, topics] of Object.entries(availablePhases)) {
            for (const topic of Object.keys(topics)) {
                const key = `${lang}:${phase}:${topic}`;
                const isCompleted = !!learnerState.topics[key]?.completedAt;
                const isDue = dueReviews.some(r => r.key === key);
                const status = isCompleted
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
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to generate learning path' });
    }
});
exports.default = router;
//# sourceMappingURL=learner.js.map