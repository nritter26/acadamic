import fs from 'fs';
import path from 'path';

const LEARNER_DIR = path.join(__dirname, '..', 'data', 'learners');

if (!fs.existsSync(LEARNER_DIR)) fs.mkdirSync(LEARNER_DIR, { recursive: true });

export interface LearnerTopic {
  completedAt: string | null;
  reviews: number;
  lastReviewed: string | null;
  nextReview: string | null;
  attempts: number;
  errors: number;
}

export interface LearnerPhase {
  completed: number;
  total: number;
  mastery: number;
}

export interface Learner {
  id: string;
  topics: Record<string, LearnerTopic>;
  phases: Record<string, LearnerPhase>;
  quizzes: { total: number; correct: number };
  challenges: { total: number; solved: number };
  sessions: number;
  firstSeen: string;
  lastSeen: string;
  masteryByConcept: Record<string, number>;
  reviewQueue: string[];
  aiInteractions: number;
}

interface PhaseTopics {
  [phaseName: string]: {
    [topicName: string]: unknown;
  };
}

const DEFAULT_LEARNER: Learner = {
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

const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

function getLearnerPath(learnerId: string): string {
  const safe = learnerId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(LEARNER_DIR, `${safe}.json`);
}

export function getLearner(learnerId: string): Learner {
  try {
    const fp = getLearnerPath(learnerId);
    if (fs.existsSync(fp)) {
      return JSON.parse(fs.readFileSync(fp, 'utf-8'));
    }
  } catch {}
  return { ...DEFAULT_LEARNER, id: learnerId };
}

export function saveLearner(learner: Learner): void {
  try {
    learner.lastSeen = new Date().toISOString();
    fs.writeFileSync(getLearnerPath(learner.id), JSON.stringify(learner, null, 2));
  } catch (e) {
    console.error('saveLearner error:', (e as Error).message);
  }
}

function updatePhaseMastery(learner: Learner, lang: string, phase: string): void {
  const phaseKey = `${lang}:${phase}`;
  const phaseTopics = Object.entries(learner.topics).filter(([k]) =>
    k.startsWith(`${lang}:`),
  );
  const completed = phaseTopics.filter(([, v]) => v.completedAt).length;
  const total = phaseTopics.length;
  learner.phases[phaseKey] = {
    completed,
    total,
    mastery: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function trackTopicCompletion(
  learnerId: string,
  lang: string,
  topic: string,
  phase?: string,
): Learner {
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
    learner.topics[key].nextReview = new Date(
      Date.now() + 86400000 * REVIEW_INTERVALS[0],
    ).toISOString();
  }

  learner.sessions = (learner.sessions || 0) + 1;
  updatePhaseMastery(learner, lang, phase || 'general');
  saveLearner(learner);
  return learner;
}

export function trackError(
  learnerId: string,
  lang: string,
  topic: string,
): void {
  const learner = getLearner(learnerId);
  const key = `${lang}:${topic}`;
  if (!learner.topics[key]) {
    learner.topics[key] = {
      attempts: 0, errors: 0, completedAt: null, reviews: 0,
      lastReviewed: null, nextReview: null,
    };
  }
  learner.topics[key].errors = (learner.topics[key].errors || 0) + 1;
  learner.topics[key].attempts = (learner.topics[key].attempts || 0) + 1;
  saveLearner(learner);
}

export function trackAttempt(
  learnerId: string,
  lang: string,
  topic: string,
): void {
  const learner = getLearner(learnerId);
  const key = `${lang}:${topic}`;
  if (!learner.topics[key]) {
    learner.topics[key] = {
      attempts: 0, errors: 0, completedAt: null, reviews: 0,
      lastReviewed: null, nextReview: null,
    };
  }
  learner.topics[key].attempts = (learner.topics[key].attempts || 0) + 1;
  saveLearner(learner);
}

export function trackQuiz(
  learnerId: string,
  correct: number,
  total: number,
): void {
  const learner = getLearner(learnerId);
  learner.quizzes.total += total;
  learner.quizzes.correct += correct;
  saveLearner(learner);
}

export function trackChallenge(learnerId: string, solved: boolean): void {
  const learner = getLearner(learnerId);
  learner.challenges.total += 1;
  if (solved) learner.challenges.solved += 1;
  saveLearner(learner);
}

export function trackAIInteraction(learnerId: string): void {
  const learner = getLearner(learnerId);
  learner.aiInteractions = (learner.aiInteractions || 0) + 1;
  saveLearner(learner);
}

export interface DueReview {
  key: string;
  completedAt: string | null;
  reviews: number;
  lastReviewed: string | null;
  nextReview: string | null;
  attempts: number;
  errors: number;
}

export function getDueReviews(learnerId: string): DueReview[] {
  const learner = getLearner(learnerId);
  const now = new Date();
  return Object.entries(learner.topics)
    .filter(([, v]) => v.completedAt && v.nextReview && new Date(v.nextReview) <= now)
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => new Date(a.nextReview!).getTime() - new Date(b.nextReview!).getTime());
}

export function scheduleReview(
  learnerId: string,
  lang: string,
  topic: string,
): void {
  const learner = getLearner(learnerId);
  const key = `${lang}:${topic}`;
  if (learner.topics[key]) {
    const current = learner.topics[key].reviews || 0;
    const interval =
      REVIEW_INTERVALS[Math.min(current, REVIEW_INTERVALS.length - 1)];
    learner.topics[key].nextReview = new Date(
      Date.now() + interval * 86400000,
    ).toISOString();
    learner.topics[key].lastReviewed = new Date().toISOString();
    learner.topics[key].reviews = current + 1;
  }
  saveLearner(learner);
}

export interface TopicMastery {
  topic: string;
  mastery: number;
  completed: boolean;
  errors: number;
  attempts: number;
  nextReview: string | null;
}

export interface ConceptMastery {
  topics: TopicMastery[];
  overall: number;
  lang: string;
}

export function getConceptMastery(
  learnerId: string,
  lang: string,
): ConceptMastery {
  const learner = getLearner(learnerId);
  const topics = Object.entries(learner.topics)
    .filter(([k]) => k.startsWith(`${lang}:`))
    .map(([k, v]): TopicMastery => {
      const topicName = k.split(':')[1];
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
  const overall =
    topics.length > 0
      ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
      : 0;
  return { topics, overall, lang };
}

export function getWeakestTopics(
  learnerId: string,
  lang: string,
  n = 3,
): TopicMastery[] {
  const { topics } = getConceptMastery(learnerId, lang);
  return topics
    .filter(t => t.completed)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, n);
}

export interface RecommendedTopic {
  topic: string;
  phase?: string;
  reason: 'review-due' | 'weak-concept' | 'next-in-sequence';
}

export function getNextRecommendedTopic(
  learnerId: string,
  lang: string,
  availablePhases: PhaseTopics,
): RecommendedTopic | null {
  const learner = getLearner(learnerId);
  const completedTopics = Object.entries(learner.topics)
    .filter(([k, v]) => k.startsWith(`${lang}:`) && v.completedAt)
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

  const allTopics: { phase: string; topic: string }[] = [];
  for (const [phaseName, phaseTopics] of Object.entries(availablePhases)) {
    for (const topicName of Object.keys(phaseTopics)) {
      allTopics.push({ phase: phaseName, topic: topicName });
    }
  }

  const nextUncompleted = allTopics.find(
    t => !completedTopics.includes(t.topic),
  );
  if (nextUncompleted) {
    return {
      topic: nextUncompleted.topic,
      phase: nextUncompleted.phase,
      reason: 'next-in-sequence',
    };
  }

  return null;
}
