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
    archivedTopics: Record<string, LearnerTopic>;
    phases: Record<string, LearnerPhase>;
    quizzes: {
        total: number;
        correct: number;
    };
    challenges: {
        total: number;
        solved: number;
    };
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
export declare function getLearner(learnerId: string): Promise<Learner>;
export declare function trackTopicCompletion(learnerId: string, lang: string, topic: string, phase?: string): Promise<Learner>;
export declare function trackError(learnerId: string, lang: string, topic: string, phase?: string): Promise<void>;
export declare function trackAttempt(learnerId: string, lang: string, topic: string, phase?: string): Promise<void>;
export declare function trackQuiz(learnerId: string, correct: number, total: number): Promise<void>;
export declare function trackChallenge(learnerId: string, solved: boolean): Promise<void>;
export declare function trackAIInteraction(learnerId: string): Promise<void>;
export declare function getDueReviews(learnerId: string): Promise<DueReview[]>;
export declare function getConceptMastery(learnerId: string, lang: string): Promise<ConceptMastery>;
export declare function getNextRecommendedTopic(learnerId: string, lang: string, availablePhases: PhaseTopics): Promise<RecommendedTopic | null>;
export {};
//# sourceMappingURL=learner.d.ts.map