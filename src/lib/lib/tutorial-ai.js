import { apiStream } from './api.js';

export function requestHint(topic, lang, code, promptContext, onHint, onDone, onError, signal) {
  let hint = '';
  apiStream('/api/tutor/hint', {
    topic,
    lang,
    code,
    learnerId: 'default',
    promptContext,
  }, (chunk) => {
    if (signal?.aborted) return;
    hint += chunk;
    onHint?.(hint);
  }, () => {
    if (signal?.aborted) return;
    onDone?.();
  }, (error) => {
    onError?.(error);
  }, signal);
}
