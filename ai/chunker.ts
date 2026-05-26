export interface Chunk {
  text: string;
  lang: string;
  phase: string;
  topic: string;
  chunkIndex: number;
}

export interface ChunkConfig {
  chunkSize: number;
  overlap: number;
}

const DEFAULT_CONFIG: ChunkConfig = { chunkSize: 500, overlap: 50 };

export function chunkDocument(
  exp: string,
  code: string,
  lang: string,
  phase: string,
  topic: string,
  config: ChunkConfig = DEFAULT_CONFIG,
): Chunk[] {
  const fullText = `${topic} ${exp}`;
  if (!fullText) return [];

  const chunks: Chunk[] = [];
  const step = config.chunkSize - config.overlap;
  if (step <= 0) return [];

  for (let i = 0, idx = 0; i < fullText.length; i += step, idx++) {
    const end = Math.min(i + config.chunkSize, fullText.length);
    let text = fullText.slice(i, end);
    if (code && idx === 0) text += `\n\n${code}`;
    chunks.push({ text, lang, phase, topic, chunkIndex: idx });
    if (end >= fullText.length) break;
  }
  return chunks;
}

export function chunkAllCurriculum(
  docs: { lang: string; phase: string; topic: string; exp: string; code: string }[],
  config?: ChunkConfig,
): Chunk[] {
  const all: Chunk[] = [];
  for (const doc of docs) {
    all.push(...chunkDocument(doc.exp, doc.code, doc.lang, doc.phase, doc.topic, config));
  }
  return all;
}

export function formatChunksAsContext(chunks: Chunk[], maxChars = 2000): string {
  let result = '';
  for (const c of chunks) {
    const header = `[${c.lang.toUpperCase()} - ${c.phase} - ${c.topic} (chunk ${c.chunkIndex})]`;
    const entry = `\n${header}\n${c.text.slice(0, maxChars / chunks.length)}\n`;
    if (result.length + entry.length > maxChars) break;
    result += entry;
  }
  return result;
}
