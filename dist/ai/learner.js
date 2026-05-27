"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLearner = getLearner;
exports.trackTopicCompletion = trackTopicCompletion;
exports.trackError = trackError;
exports.trackAttempt = trackAttempt;
exports.trackQuiz = trackQuiz;
exports.trackChallenge = trackChallenge;
exports.trackAIInteraction = trackAIInteraction;
exports.getDueReviews = getDueReviews;
exports.getConceptMastery = getConceptMastery;
exports.getNextRecommendedTopic = getNextRecommendedTopic;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const LEARNER_DIR = path_1.default.join(__dirname, '..', 'data', 'learners');
const FALLBACK_DIR = path_1.default.join(os_1.default.tmpdir(), 'koded-learners');
let activeLearnerDir = LEARNER_DIR;
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
const DEFAULT_LEARNER = {
    id: '',
    topics: {},
    phases: {},
    quizzes: { total: 0, correct: 0 },
    challenges: { total: 0, solved: 0 },
    sessions: 0,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    masteryByConcept: {},
    reviewQueue: [],
    aiInteractions: 0,
    schemaVersion: 2,
};
const SCHEMA_VERSION = 2;
function getLearnerPath(learnerId) {
    const safe = learnerId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path_1.default.join(activeLearnerDir, `${safe}.json`);
}
async function ensureDir() {
    try {
        await promises_1.default.mkdir(LEARNER_DIR, { recursive: true });
        await promises_1.default.access(LEARNER_DIR, fs_1.default.constants.W_OK);
        activeLearnerDir = LEARNER_DIR;
    }
    catch {
        try {
            await promises_1.default.mkdir(FALLBACK_DIR, { recursive: true });
            activeLearnerDir = FALLBACK_DIR;
            console.log('[Learner] Using fallback directory:', FALLBACK_DIR);
        }
        catch (e) {
            console.error('[Learner] Could not create learner directory:', e);
        }
    }
}
function topicKey(lang, phase, topic) {
    return `${lang}:${phase || 'general'}:${topic}`;
}
function parseTopicKey(key) {
    const parts = key.split(':');
    if (parts.length >= 3) {
        return { lang: parts[0], phase: parts[1], topic: parts.slice(2).join(':') };
    }
    return { lang: parts[0], phase: 'general', topic: parts[1] || '' };
}
function validateLearner(data) {
    if (!data || typeof data !== 'object')
        return false;
    const d = data;
    return typeof d.id === 'string' && typeof d.topics === 'object' && d.topics !== null;
}
function migrateLearner(data) {
    const topics = data.topics;
    if (topics) {
        const migrated = {};
        for (const [key, val] of Object.entries(topics)) {
            const parts = key.split(':');
            if (parts.length === 2) {
                const newKey = `${parts[0]}:${val.phase || 'general'}:${parts[1]}`;
                migrated[newKey] = { ...val, phase: undefined };
            }
            else {
                migrated[key] = val;
            }
        }
        data.topics = migrated;
    }
    return { ...DEFAULT_LEARNER, ...data, schemaVersion: SCHEMA_VERSION };
}
async function getLearner(learnerId) {
    try {
        const fp = getLearnerPath(learnerId);
        const raw = await promises_1.default.readFile(fp, 'utf-8');
        const data = JSON.parse(raw);
        if (!validateLearner(data)) {
            console.error(`getLearner: invalid schema for ${learnerId}, resetting`);
            return { ...DEFAULT_LEARNER, id: learnerId };
        }
        if (data.schemaVersion !== SCHEMA_VERSION) {
            return migrateLearner(data);
        }
        return data;
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            return { ...DEFAULT_LEARNER, id: learnerId };
        }
        console.error(`getLearner error for ${learnerId}:`, e.message);
        return { ...DEFAULT_LEARNER, id: learnerId };
    }
}
const writeQueue = new Map();
async function doSaveLearner(learner) {
    try {
        await ensureDir();
        learner.lastSeen = new Date().toISOString();
        const fp = getLearnerPath(learner.id);
        const tmp = fp + '.tmp';
        await promises_1.default.writeFile(tmp, JSON.stringify(learner, null, 2));
        await promises_1.default.rename(tmp, fp);
    }
    catch (e) {
        console.error('saveLearner error:', e.message);
    }
}
async function saveLearner(learner) {
    const existing = writeQueue.get(learner.id);
    if (existing) {
        clearTimeout(existing.timeout);
    }
    writeQueue.set(learner.id, {
        learner,
        timeout: setTimeout(() => {
            doSaveLearner(learner);
            writeQueue.delete(learner.id);
        }, 2000),
    });
}
function flushAll() {
    for (const [id, entry] of writeQueue) {
        clearTimeout(entry.timeout);
        const learner = entry.learner;
        try {
            const fp = getLearnerPath(learner.id);
            const dir = path_1.default.dirname(fp);
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            const tmp = fp + '.tmp';
            fs_1.default.writeFileSync(tmp, JSON.stringify(learner, null, 2));
            fs_1.default.renameSync(tmp, fp);
        }
        catch (e) {
            console.error('flushAll error for', id, ':', e.message);
        }
        writeQueue.delete(id);
    }
}
process.on('beforeExit', flushAll);
function updatePhaseMastery(learner, lang, phase) {
    const phaseKey = `${lang}:${phase}`;
    const prefix = `${lang}:${phase}:`;
    const phaseTopics = Object.entries(learner.topics).filter(([k]) => k.startsWith(prefix));
    const completed = phaseTopics.filter(([, v]) => v.completedAt).length;
    const total = phaseTopics.length;
    learner.phases[phaseKey] = {
        completed,
        total,
        mastery: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
}
async function trackTopicCompletion(learnerId, lang, topic, phase) {
    const learner = await getLearner(learnerId);
    const key = topicKey(lang, phase, topic);
    if (!learner.topics[key]) {
        learner.topics[key] = {
            completedAt: new Date().toISOString(),
            reviews: 0,
            lastReviewed: null,
            nextReview: new Date(Date.now() + 86400000).toISOString(),
            attempts: 0,
            errors: 0,
        };
    }
    else {
        learner.topics[key].completedAt = new Date().toISOString();
        learner.topics[key].reviews += 1;
        const intervalIdx = Math.min(learner.topics[key].reviews, REVIEW_INTERVALS.length - 1);
        learner.topics[key].nextReview = new Date(Date.now() + 86400000 * REVIEW_INTERVALS[intervalIdx]).toISOString();
    }
    learner.sessions += 1;
    updatePhaseMastery(learner, lang, phase || 'general');
    await saveLearner(learner);
    return learner;
}
async function trackError(learnerId, lang, topic, phase) {
    const learner = await getLearner(learnerId);
    const key = topicKey(lang, phase, topic);
    if (!learner.topics[key]) {
        learner.topics[key] = {
            attempts: 0, errors: 0, completedAt: null, reviews: 0,
            lastReviewed: null, nextReview: null,
        };
    }
    learner.topics[key].errors += 1;
    learner.topics[key].attempts += 1;
    await saveLearner(learner);
}
async function trackAttempt(learnerId, lang, topic, phase) {
    const learner = await getLearner(learnerId);
    const key = topicKey(lang, phase, topic);
    if (!learner.topics[key]) {
        learner.topics[key] = {
            attempts: 0, errors: 0, completedAt: null, reviews: 0,
            lastReviewed: null, nextReview: null,
        };
    }
    learner.topics[key].attempts += 1;
    await saveLearner(learner);
}
async function trackQuiz(learnerId, correct, total) {
    const learner = await getLearner(learnerId);
    learner.quizzes.total += total;
    learner.quizzes.correct += correct;
    await saveLearner(learner);
}
async function trackChallenge(learnerId, solved) {
    const learner = await getLearner(learnerId);
    learner.challenges.total += 1;
    if (solved)
        learner.challenges.solved += 1;
    await saveLearner(learner);
}
async function trackAIInteraction(learnerId) {
    const learner = await getLearner(learnerId);
    learner.aiInteractions += 1;
    await saveLearner(learner);
}
async function getDueReviews(learnerId) {
    const learner = await getLearner(learnerId);
    const now = new Date();
    return Object.entries(learner.topics)
        .filter(([, v]) => v.completedAt && v.nextReview && new Date(v.nextReview) <= now)
        .map(([k, v]) => ({ key: k, ...v }))
        .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
}
async function getConceptMastery(learnerId, lang) {
    const learner = await getLearner(learnerId);
    const topics = Object.entries(learner.topics)
        .filter(([k]) => k.startsWith(`${lang}:`))
        .map(([k, v]) => {
        const { topic: topicName } = parseTopicKey(k);
        const errorRate = v.attempts > 0 ? v.errors / v.attempts : 0;
        const mastery = v.completedAt
            ? Math.max(5, Math.min(100, 100 - errorRate * 100 - (v.reviews === 0 ? 10 : 0)))
            : 0;
        return {
            topic: topicName,
            mastery,
            completed: !!v.completedAt,
            errors: v.errors,
            attempts: v.attempts,
            nextReview: v.nextReview,
        };
    });
    const overall = topics.length > 0
        ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
        : 0;
    return { topics, overall, lang };
}
async function getWeakestTopics(learnerId, lang, n = 3) {
    const { topics } = await getConceptMastery(learnerId, lang);
    return topics
        .filter(t => t.completed)
        .sort((a, b) => a.mastery - b.mastery)
        .slice(0, n);
}
async function getNextRecommendedTopic(learnerId, lang, availablePhases) {
    const learner = await getLearner(learnerId);
    const completedTopics = Object.entries(learner.topics)
        .filter(([k, v]) => k.startsWith(`${lang}:`) && v.completedAt)
        .map(([k]) => parseTopicKey(k).topic);
    const due = (await getDueReviews(learnerId)).filter(r => r.key.startsWith(`${lang}:`));
    if (due.length > 0) {
        const { topic: topicName } = parseTopicKey(due[0].key);
        return { topic: topicName, reason: 'review-due' };
    }
    const weakest = await getWeakestTopics(learnerId, lang, 1);
    if (weakest.length > 0 && weakest[0].mastery < 60) {
        return { topic: weakest[0].topic, reason: 'weak-concept' };
    }
    const allTopics = [];
    for (const [phaseName, phaseTopics] of Object.entries(availablePhases)) {
        for (const topicName of Object.keys(phaseTopics)) {
            allTopics.push({ phase: phaseName, topic: topicName });
        }
    }
    const nextUncompleted = allTopics.find(t => !completedTopics.includes(t.topic));
    if (nextUncompleted) {
        return {
            topic: nextUncompleted.topic,
            phase: nextUncompleted.phase,
            reason: 'next-in-sequence',
        };
    }
    return null;
}
//# sourceMappingURL=learner.js.map