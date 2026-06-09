import { apiStream } from './api.js';

export function requestHint(topic, lang, code, prompt, onHint, onDone, onError, signal) {
  let hint = '';
  apiStream('/api/tutor/explain-topic', {
    topic,
    lang,
    code,
    learnerId: 'default',
    phase: 'exercise-hint',
  }, (chunk) => {
    if (signal?.aborted) return;
    hint += chunk;
    onHint?.(hint);
  }, () => {
    if (signal?.aborted) return;
    onDone?.(hint);
  }, (error) => {
    onError?.(error);
  }, signal);
}
