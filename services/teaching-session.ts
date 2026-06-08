export type SessionState = 'idle' | 'explaining' | 'exercising' | 'reviewing' | 'done';

export interface TeachingSession {
  learnerId: string;
  state: SessionState;
  currentTopic: string;
  currentLang: string;
  currentPhase: string;
  explanation: string | null;
  exercise: Record<string, unknown> | null;
  codeAttempts: number;
  startedAt: number;
}

const sessions = new Map<string, TeachingSession>();
const SESSION_TTL = 60 * 60 * 1000; // 1 hour
const MAX_SESSIONS = 1000;

function sessionKey(learnerId: string, lang: string, topic: string): string {
  return `${learnerId}:${lang}:${topic}`;
}

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    try {
      const now = Date.now();
      for (const [key, session] of sessions) {
        if (now - session.startedAt > SESSION_TTL) {
          sessions.delete(key);
        }
      }
    } catch {
      // Silently handle interval errors
    }
  }, 300_000);
  cleanupTimer.unref();
}

export function stopCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

export function getSession(learnerId: string, lang: string, topic: string): TeachingSession | undefined {
  const key = sessionKey(learnerId, lang, topic);
  const session = sessions.get(key);
  if (!session) return undefined;
  if (Date.now() - session.startedAt > SESSION_TTL) {
    sessions.delete(key);
    return undefined;
  }
  return session;
}

export function createSession(learnerId: string, lang: string, topic: string, phase: string): TeachingSession {
  startCleanup();
  if (sessions.size >= MAX_SESSIONS) {
    const oldest = [...sessions.entries()].sort((a, b) => a[1].startedAt - b[1].startedAt)[0];
    if (oldest) sessions.delete(oldest[0]);
  }
  const key = sessionKey(learnerId, lang, topic);
  const session: TeachingSession = {
    learnerId,
    state: 'idle',
    currentTopic: topic,
    currentLang: lang,
    currentPhase: phase,
    explanation: null,
    exercise: null,
    codeAttempts: 0,
    startedAt: Date.now(),
  };
  sessions.set(key, session);
  return session;
}

export function transitionState(learnerId: string, lang: string, topic: string, to: SessionState): TeachingSession | null {
  const key = sessionKey(learnerId, lang, topic);
  const session = sessions.get(key);
  if (!session) return null;
  session.state = to;
  return session;
}

export function deleteSession(learnerId: string, lang: string, topic: string): void {
  const key = sessionKey(learnerId, lang, topic);
  sessions.delete(key);
}
