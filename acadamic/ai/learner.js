const fs = require('fs');
const path = require('path');

const LEARNER_DIR = path.join(__dirname, '..', 'data', 'learners');

if (!fs.existsSync(LEARNER_DIR)) fs.mkdirSync(LEARNER_DIR, { recursive: true });

const DEFAULT_LEARNER = {
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
};

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'expert'];
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

function getLearnerPath(learnerId) {
  const safe = learnerId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(LEARNER_DIR, `${safe}.json`);
}

function getLearner(learnerId) {
  try {
    const fp = getLearnerPath(learnerId);
    if (fs.existsSync(fp)) {
      return JSON.parse(fs.readFileSync(fp, 'utf-8'));
    }
  } catch {}
  return { ...DEFAULT_LEARNER, id: learnerId };
}

function saveLearner(learner) {
  try {
    learner.lastSeen = new Date().toISOString();
    fs.writeFileSync(getLearnerPath(learner.id), JSON.stringify(learner, null, 2));
  } catch (e) {
    console.error('saveLearner error:', e.message);
  }
}

function trackTopicCompletion(learnerId, lang, topic, phase) {
  const learner = getLearner(learnerId);
  const key = `${lang}:${topic}`;
  if (!learner.topics[key]) {
    learner.topics[key] = {
      completedAt: new Date().toISOString(),
      reviews: 0,
      lastReviewed: null,
      nextReview: new Date(Date.now() + 86400000).toISOString(),
      attempts: 0,
      errors: 0,
    };
  } else {
    learner.topics[key].completedAt = new Date().toISOString();
    learner.topics[key].reviews = (learner.topics[key].reviews || 0) + 1;
    learner.topics[key].nextReview = new Date(Date.now() + 86400000 * (REVIEW_INTERVALS[0] || 1)).toISOString();
  }
  learner.sessions = (learner.sessions || 0) + 1;
  updatePhaseMastery(learner, lang, phase);
  saveLearner(learner);
  return learner;
}

function trackError(learnerId, lang, topic) {
  const learner = getLearner(learnerId);
  const key = `${lang}:${topic}`;
  if (!learner.topics[key]) {
    learner.topics[key] = { attempts: 0, errors: 0, completedAt: null, reviews: 0, lastReviewed: null, nextReview: null };
  }
  learner.topics[key].errors = (learner.topics[key].errors || 0) + 1;
  learner.topics[key].attempts = (learner.topics[key].attempts || 0) + 1;
  saveLearner(learner);
}

function trackAttempt(learnerId, lang, topic) {
  const learner = getLearner(learnerId);
  const key = `${lang}:${topic}`;
  if (!learner.topics[key]) {
    learner.topics[key] = { attempts: 0, errors: 0, completedAt: null, reviews: 0, lastReviewed: null, nextReview: null };
  }
  learner.topics[key].attempts = (learner.topics[key].attempts || 0) + 1;
  saveLearner(learner);
}

function trackQuiz(learnerId, correct, total) {
  const learner = getLearner(learnerId);
  learner.quizzes.total += total;
  learner.quizzes.correct += correct ? 1 : 0;
  saveLearner(learner);
}

function trackChallenge(learnerId, solved) {
  const learner = getLearner(learnerId);
  learner.challenges.total += 1;
  if (solved) learner.challenges.solved += 1;
  saveLearner(learner);
}

function trackAIInteraction(learnerId) {
  const learner = getLearner(learnerId);
  learner.aiInteractions = (learner.aiInteractions || 0) + 1;
  saveLearner(learner);
}

function updatePhaseMastery(learner, lang, phase) {
  const phaseKey = `${lang}:${phase}`;
  const phaseTopics = Object.entries(learner.topics)
    .filter(([k]) => k.startsWith(`${lang}:`));
  const completed = phaseTopics.filter(([k, v]) => v.completedAt).length;
  const total = phaseTopics.length;
  learner.phases[phaseKey] = {
    completed,
    total,
    mastery: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

function getDueReviews(learnerId) {
  const learner = getLearner(learnerId);
  const now = new Date();
  return Object.entries(learner.topics)
    .filter(([k, v]) => v.completedAt && v.nextReview && new Date(v.nextReview) <= now)
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
}

function scheduleReview(learnerId, lang, topic) {
  const learner = getLearner(learnerId);
  const key = `${lang}:${topic}`;
  if (learner.topics[key]) {
    const current = learner.topics[key].reviews || 0;
    const interval = REVIEW_INTERVALS[Math.min(current, REVIEW_INTERVALS.length - 1)];
    learner.topics[key].nextReview = new Date(Date.now() + interval * 86400000).toISOString();
    learner.topics[key].lastReviewed = new Date().toISOString();
    learner.topics[key].reviews = current + 1;
  }
  saveLearner(learner);
}

function getConceptMastery(learnerId, lang) {
  const learner = getLearner(learnerId);
  const topics = Object.entries(learner.topics)
    .filter(([k]) => k.startsWith(`${lang}:`))
    .map(([k, v]) => {
      const topicName = k.split(':')[1];
      const errorRate = v.attempts > 0 ? v.errors / v.attempts : 0;
      const mastery = v.completedAt ? Math.max(0, Math.min(100, 100 - errorRate * 100)) : 0;
      return { topic: topicName, mastery, completed: !!v.completedAt, errors: v.errors, attempts: v.attempts, nextReview: v.nextReview };
    });
  const overall = topics.length > 0 ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length) : 0;
  return { topics, overall, lang };
}

function getWeakestTopics(learnerId, lang, n = 3) {
  const { topics } = getConceptMastery(learnerId, lang);
  return topics.filter(t => t.completed).sort((a, b) => a.mastery - b.mastery).slice(0, n);
}

function getNextRecommendedTopic(learnerId, lang, availablePhases) {
  const learner = getLearner(learnerId);
  const completedTopics = Object.entries(learner.topics)
    .filter(([k]) => k.startsWith(`${lang}:`) && k.endsWith(':completed'))
    .map(([k]) => k.split(':')[1]);
  const due = getDueReviews(learnerId).filter(r => r.key.startsWith(`${lang}:`));
  if (due.length > 0) {
    const topicName = due[0].key.split(':')[1];
    return { topic: topicName, reason: 'review-due' };
  }
  const weakest = getWeakestTopics(learnerId, lang, 1);
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
  if (nextUncompleted) return { topic: nextUncompleted.topic, phase: nextUncompleted.phase, reason: 'next-in-sequence' };
  return null;
}

module.exports = {
  getLearner,
  saveLearner,
  trackTopicCompletion,
  trackError,
  trackAttempt,
  trackQuiz,
  trackChallenge,
  trackAIInteraction,
  getDueReviews,
  scheduleReview,
  getConceptMastery,
  getWeakestTopics,
  getNextRecommendedTopic,
};
