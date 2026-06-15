import Fuse from 'fuse.js';
import { getCurriculumState } from '$lib/stores/curriculum.svelte.js';

let fuseInstance = null;
let searchIndexBuilt = false;

export function getSearchIndex() {
  return fuseInstance;
}

export function isSearchReady() {
  return searchIndexBuilt;
}

export async function buildSearchIndex() {
  const curr = getCurriculumState();
  const topicData = curr.topicData;
  if (!topicData) return false;

  const docs = [];
  for (const [lang, phases] of Object.entries(topicData)) {
    if (!phases || typeof phases !== 'object') continue;
    for (const [phaseName, topics] of Object.entries(phases)) {
      if (!topics || typeof topics !== 'object') continue;
      for (const [topicName, content] of Object.entries(topics)) {
        docs.push({
          lang,
          phase: phaseName,
          topic: topicName,
          description: content?.exp?.replace(/<[^>]*>/g, '') || '',
        });
      }
    }
  }

  fuseInstance = new Fuse(docs, {
    keys: [
      { name: 'topic', weight: 2 },
      { name: 'phase', weight: 1 },
      { name: 'description', weight: 0.5 },
    ],
    threshold: 0.4,
    includeScore: true,
  });

  searchIndexBuilt = true;
  return true;
}

export function search(query, limit = 10) {
  if (!fuseInstance || !query) return [];
  return fuseInstance.search(query, { limit }).map(r => r.item);
}
