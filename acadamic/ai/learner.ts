import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';

const LEARNER_DIR = path.join(__dirname, '..', 'data', 'learners');
const FALLBACK_DIR = path.join(os.tmpdir(), 'koded-learners');

let activeLearnerDir = LEARNER_DIR;

const REVIEW_INTERVALS = [1, 3, 7, 14, 30] as const;

interface LearnerTopic {
  completedAt: string | null;
  reviews: number;
  lastReviewed: string | null;
  nextReview: string | null;
  attempts: number;
  errors: number;
  phase?: string;
}

interface LearnerPhase {
  completed: number;
  total: number;
  mastery: number;
}

interface Learner {
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
  schemaVersion?: number;
}

interface PhaseTopics {
  [phaseName: string]: {
    [topicName: string]: unknown;
  };
}

interface DueReview {
  key: string;
  completedAt: string | null;
  reviews: number;
  lastReviewed: string | null;
  nextReview: string | null;
  attempts: number;
  errors: number;
  phase?: string;
}

interface TopicMastery {
  topic: string;
  mastery: number;
  completed: boolean;
  errors: number;
  attempts: number;
  nextReview: string | null;
}

interface ConceptMastery {
  topics: TopicMastery[];
  overall: number;
  lang: string;
}

interface RecommendedTopic {
  topic: string;
  phase?: string;
  reason: 'review-due' | 'weak-concept' | 'next-in-sequence';
}

const DEFAULT_LEARNER: Learner = {
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

function getLearnerPath(learnerId: string): string {
  const safe = learnerId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(activeLearnerDir, `${safe}.json`);
}

async function ensureDir(): Promise<void> {
  try {
    await fsp.mkdir(LEARNER_DIR, { recursive: true });
    await fsp.access(LEARNER_DIR, fs.constants.W_OK);
    activeLearnerDir = LEARNER_DIR;
  } catch {
    try {
      await fsp.mkdir(FALLBACK_DIR, { recursive: true });
      activeLearnerDir = FALLBACK_DIR;
      console.log('[Learner] Using fallback directory:', FALLBACK_DIR);
    } catch (e) {
      console.error('[Learner] Could not create learner directory:', e);
    }
  }
}

function topicKey(lang: string, phase: string | undefined, topic: string): string {
  return `${lang}:${phase || 'general'}:${topic}`;
}

function parseTopicKey(key: string): { lang: string; phase: string; topic: string } {
  const parts = key.split(':');
  if (parts.length >= 3) {
    return { lang: parts[0], phase: parts[1], topic: parts.slice(2).join(':') };
  }
  return { lang: parts[0], phase: 'general', topic: parts[1] || '' };
}

function validateLearner(data: unknown): data is Learner {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d.id === 'string' && typeof d.topics === 'object' && d.topics !== null;
}

function migrateLearner(data: Record<string, unknown>): Learner {
  const topics = data.topics as Record<string, LearnerTopic> | undefined;
  if (topics) {
    const migrated: Record<string, LearnerTopic> = {};
    for (const [key, val] of Object.entries(topics)) {
      const parts = key.split(':');
      if (parts.length === 2) {
        const newKey = `${parts[0]}:${val.phase || 'general'}:${parts[1]}`;
        migrated[newKey] = { ...val, phase: undefined };
      } else {
        migrated[key] = val;
      }
    }
    data.topics = migrated;
  }
  return { ...DEFAULT_LEARNER, ...data, schemaVersion: SCHEMA_VERSION } as Learner;
}

export async function getLearner(learnerId: string): Promise<Learner> {
  try {
    const fp = getLearnerPath(learnerId);
    const raw = await fsp.readFile(fp, 'utf-8');
    const data = JSON.parse(raw);
    if (!validateLearner(data)) {
      console.error(`getLearner: invalid schema for ${learnerId}, resetting`);
      return { ...DEFAULT_LEARNER, id: learnerId };
    }
    if (data.schemaVersion !== SCHEMA_VERSION) {
      return migrateLearner(data as unknown as Record<string, unknown>);
    }
    return data;
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return { ...DEFAULT_LEARNER, id: learnerId };
    }
    console.error(`getLearner error for ${learnerId}:`, (e as Error).message);
    return { ...DEFAULT_LEARNER, id: learnerId };
  }
}

async function saveLearner(learner: Learner): Promise<void> {
  try {
    await ensureDir();
    learner.lastSeen = new Date().toISOString();
    const fp = getLearnerPath(learner.id);
    const tmp = fp + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(learner, null, 2));
    await fsp.rename(tmp, fp);
  } catch (e: unknown) {
    console.error('saveLearner error:', (e as Error).message);
  }
}

function updatePhaseMastery(learner: Learner, lang: string, phase: string): void {
  const phaseKey = `${lang}:${phase}`;
  const prefix = `${lang}:${phase}:`;
  const phaseTopics = Object.entries(learner.topics).filter(([k]) =>
    k.startsWith(prefix),
  );
  const completed = phaseTopics.filter(([, v]) => v.completedAt).length;
  const total = phaseTopics.length;
  learner.phases[phaseKey] = {
    completed,
    total,
    mastery: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function trackTopicCompletion(
  learnerId: string,
  lang: string,
  topic: string,
  phase?: string,
): Promise<Learner> {
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
  } else {
    learner.topics[key].completedAt = new Date().toISOString();
    learner.topics[key].reviews += 1;
    learner.topics[key].nextReview = new Date(
      Date.now() + 86400000 * REVIEW_INTERVALS[0],
    ).toISOString();
  }

  learner.sessions += 1;
  updatePhaseMastery(learner, lang, phase || 'general');
  await saveLearner(learner);
  return learner;
}

export async function trackError(
  learnerId: string,
  lang: string,
  topic: string,
  phase?: string,
): Promise<void> {
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

export async function trackAttempt(
  learnerId: string,
  lang: string,
  topic: string,
  phase?: string,
): Promise<void> {
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

export async function trackQuiz(
  learnerId: string,
  correct: number,
  total: number,
): Promise<void> {
  const learner = await getLearner(learnerId);
  learner.quizzes.total += total;
  learner.quizzes.correct += correct;
  await saveLearner(learner);
}

export async function trackChallenge(learnerId: string, solved: boolean): Promise<void> {
  const learner = await getLearner(learnerId);
  learner.challenges.total += 1;
  if (solved) learner.challenges.solved += 1;
  await saveLearner(learner);
}

export async function trackAIInteraction(learnerId: string): Promise<void> {
  const learner = await getLearner(learnerId);
  learner.aiInteractions += 1;
  await saveLearner(learner);
}

export async function getDueReviews(learnerId: string): Promise<DueReview[]> {
  const learner = await getLearner(learnerId);
  const now = new Date();
  return Object.entries(learner.topics)
    .filter(([, v]) => v.completedAt && v.nextReview && new Date(v.nextReview) <= now)
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => new Date(a.nextReview!).getTime() - new Date(b.nextReview!).getTime());
}

export async function getConceptMastery(
  learnerId: string,
  lang: string,
): Promise<ConceptMastery> {
  const learner = await getLearner(learnerId);
  const topics = Object.entries(learner.topics)
    .filter(([k]) => k.startsWith(`${lang}:`))
    .map(([k, v]): TopicMastery => {
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
  const overall =
    topics.length > 0
      ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
      : 0;
  return { topics, overall, lang };
}

async function getWeakestTopics(
  learnerId: string,
  lang: string,
  n = 3,
): Promise<TopicMastery[]> {
  const { topics } = await getConceptMastery(learnerId, lang);
  return topics
    .filter(t => t.completed)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, n);
}

export async function getNextRecommendedTopic(
  learnerId: string,
  lang: string,
  availablePhases: PhaseTopics,
): Promise<RecommendedTopic | null> {
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


