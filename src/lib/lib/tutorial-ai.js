import { apiStream } from './api.js';

export function requestHint(topic, lang, code, prompt, onHint, onDone, onError) {
  let hint = '';
  apiStream('/api/tutor/explain-topic', {
    topic,
    lang,
    code,
    learnerId: 'default',
    phase: 'exercise-hint',
  }, (chunk) => {
    hint += chunk;
    onHint?.(hint);
  }, () => {
    onDone?.(hint);
  }, (error) => {
    onError?.(error);
  });
}
