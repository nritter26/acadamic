import fs from 'fs';
import path from 'path';
import config from './config';

const DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(__dirname, '..', 'data', 'embeddings-cache.json');

export interface CurriculumDoc {
  lang: string;
  phase: string;
  topic: string;
  exp: string;
  code: string;
  text: string;
  _embedding?: number[];
}

interface DocVector {
  docIndex: number;
  vector: Record<string, number>;
  magnitude: number;
}

interface TFIDFIndex {
  docVectors: DocVector[];
  idf: Record<string, number>;
  docCount: number;
}

let curriculumDocs: CurriculumDoc[] = [];
let tfidfIndex: TFIDFIndex | null = null;
let embedCache: Record<string, number[]> | null = null;

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function extractTopicObjs(content: string): { topic: string; exp: string; code: string }[] {
  const results: { topic: string; exp: string; code: string }[] = [];
  const topicRe = /"([^"]+)":\s*\{/g;
  let m: RegExpExecArray | null;

  while ((m = topicRe.exec(content)) !== null) {
    const name = m[1];
    const start = m.index + m[0].length - 1;
    let depth = 1, i = start + 1;
    let inStr: string | null = null;
    let inTmpl = false;

    while (i < content.length && depth > 0) {
      const c = content[i];
      if (inStr) {
        if (c === '\\') i++;
        else if (c === inStr) inStr = null;
      } else if (c === '`') inTmpl = !inTmpl;
      else if (!inTmpl && (c === '"' || c === "'")) inStr = c;
      else if (!inTmpl) {
        if (c === '{') depth++;
        else if (c === '}') depth--;
      }
      i++;
    }

    const block = content.slice(start, i);
    if (!name || (!block.includes('exp:') && !block.includes('code:'))) continue;

    const expM = block.match(/exp:\s*`([^`]*)`/);
    const codeM = block.match(/code:\s*`([^`]*)`/);
    const exp = expM ? expM[1].replace(/<[^>]*>/g, '').trim() : '';
    const code = codeM ? codeM[1].trim() : '';

    if (exp || code) results.push({ topic: name, exp, code });
  }
  return results;
}

export function buildCurriculumDocs(): void {
  curriculumDocs = [];
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f =>
      f.endsWith('.js') &&
      !['app.js', 'courseData.js', 'challenges.js', 'quiz.js', 'style.css', 'game.js', 'db.js'].includes(f),
    );

    for (const file of files) {
      const lang = file.replace('.js', '');
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const phaseRe = /"([^"]+)":\s*\{/g;
      let pm: RegExpExecArray | null;

      while ((pm = phaseRe.exec(content)) !== null) {
        const phase = pm[1];
        const after = content.slice(pm.index + pm[0].length);
        const inner = extractTopicObjs(after);
        for (const t of inner) {
          curriculumDocs.push({ lang, phase, ...t, text: `${t.topic} ${t.exp} ${t.code}` });
        }
      }
    }
    console.log(`Curriculum index: ${curriculumDocs.length} topics indexed`);
  } catch (e) {
    console.error('buildCurriculumDocs error:', (e as Error).message);
  }
}

function buildTFIDF(): void {
  if (curriculumDocs.length === 0) buildCurriculumDocs();
  const docCount = curriculumDocs.length;
  const df: Record<string, number> = {};

  const tokenizedDocs = curriculumDocs.map((doc, di) => {
    const tokens = tokenize(doc.text);
    const unique = new Set(tokens);
    for (const t of unique) df[t] = (df[t] || 0) + 1;
    return { docIndex: di, tokens };
  });

  const idf: Record<string, number> = {};
  for (const [term, freq] of Object.entries(df)) {
    idf[term] = Math.log((docCount + 1) / (freq + 1)) + 1;
  }

  const docVectors: DocVector[] = tokenizedDocs.map(({ docIndex, tokens }) => {
    const tf: Record<string, number> = {};
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    const maxTf = Math.max(...Object.values(tf), 1);
    const vector: Record<string, number> = {};
    for (const [t, freq] of Object.entries(tf)) {
      vector[t] = (freq / maxTf) * (idf[t] || 1);
    }
    return {
      docIndex,
      vector,
      magnitude: Math.sqrt(Object.values(vector).reduce((s, v) => s + v * v, 0)),
    };
  });

  tfidfIndex = { docVectors, idf, docCount };
}

function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  for (const [t, v] of Object.entries(vecA)) {
    magA += v * v;
    if (vecB[t]) dot += v * vecB[t];
  }
  for (const v of Object.values(vecB)) magB += v * v;
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function searchTFIDF(query: string, lang?: string, topN = 5): (CurriculumDoc & { score: number })[] {
  if (!tfidfIndex) buildTFIDF();
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const qTf: Record<string, number> = {};
  for (const t of qTokens) qTf[t] = (qTf[t] || 0) + 1;
  const qMax = Math.max(...Object.values(qTf), 1);
  const qVec: Record<string, number> = {};
  for (const [t, freq] of Object.entries(qTf)) {
    qVec[t] = (freq / qMax) * (tfidfIndex!.idf[t] || 0);
  }

  return tfidfIndex!.docVectors
    .filter(dv => !lang || curriculumDocs[dv.docIndex].lang === lang)
    .map(dv => ({
      ...curriculumDocs[dv.docIndex],
      score: cosineSimilarity(qVec, dv.vector),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

async function getEmbedding(text: string): Promise<number[] | null> {
  const key = text.toLowerCase().trim().slice(0, 100);
  if (embedCache?.[key]) return embedCache[key];
  if (config.openai.apiKey && config.provider !== 'keyword') {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`,
        },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8191) }),
      });
      if (response.ok) {
        const data = await response.json();
        const emb: number[] = data.data[0].embedding;
        if (embedCache) embedCache[key] = emb;
        return emb;
      }
    } catch {}
  }
  return null;
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  const d = Math.sqrt(ma) * Math.sqrt(mb);
  return d === 0 ? 0 : dot / d;
}

async function searchEmbedding(
  query: string,
  lang?: string,
  topN = 5,
): Promise<(CurriculumDoc & { score: number })[] | null> {
  const qEmb = await getEmbedding(query);
  if (!qEmb) return null;
  let docs = curriculumDocs;
  if (lang) docs = docs.filter(d => d.lang === lang);
  const withScores = docs
    .map(d => ({
      ...d,
      score: d._embedding ? cosineSim(qEmb, d._embedding) : 0,
    }))
    .filter(r => r.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
  return withScores.length > 0 ? withScores : null;
}

async function buildEmbeddingCache(): Promise<void> {
  if (!config.openai.apiKey || config.provider === 'keyword') return;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      embedCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } else {
      embedCache = {};
    }
    const batchSize = 20;
    for (let i = 0; i < curriculumDocs.length; i += batchSize) {
      const batch = curriculumDocs.slice(i, i + batchSize);
      const toEmbed = batch.filter(d => {
        const key = d.topic.toLowerCase().slice(0, 100);
        return !embedCache![key];
      });
      if (toEmbed.length === 0) continue;
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openai.apiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: toEmbed.map(d => `${d.topic}: ${d.exp}`.slice(0, 8191)),
          }),
        });
        if (response.ok) {
          const data = await response.json();
          for (let j = 0; j < data.data.length; j++) {
            const key = toEmbed[j].topic.toLowerCase().slice(0, 100);
            embedCache![key] = data.data[j].embedding;
            const doc = curriculumDocs.find(
              d => d.topic === toEmbed[j].topic && d.lang === toEmbed[j].lang,
            );
            if (doc) doc._embedding = data.data[j].embedding;
          }
        }
      } catch {}
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(embedCache));
  } catch (e) {
    console.error('buildEmbeddingCache error:', (e as Error).message);
  }
}

export async function search(
  query: string,
  lang?: string,
  topN = 5,
): Promise<(CurriculumDoc & { score: number })[]> {
  if (curriculumDocs.length === 0) buildCurriculumDocs();
  const embResults = await searchEmbedding(query, lang, topN);
  if (embResults) return embResults;
  return searchTFIDF(query, lang, topN);
}

export function getContext(query: string, lang?: string, topN = 3): string {
  const results = searchTFIDF(query, lang, topN);
  if (results.length === 0) return '';
  let context = '\n\n**Relevant curriculum content (semantic match):**\n';
  for (const r of results) {
    context += `\n[${r.lang.toUpperCase()} - ${r.phase} - ${r.topic}] (relevance: ${(r.score * 100).toFixed(0)}%)\n`;
    if (r.exp) context += `${r.exp.slice(0, 300)}...\n`;
    if (r.code) context += `\`\`\`\n${r.code.slice(0, 200)}\n\`\`\`\n`;
  }
  return context;
}

export function getTopicContext(topic: string, lang?: string): string {
  const results = searchTFIDF(topic, lang, 1);
  if (results.length === 0) return '';
  const r = results[0];
  let context = `The user is currently studying **${r.topic}** (${r.lang.toUpperCase()} - ${r.phase}).`;
  if (r.exp) context += `\n\nCurriculum content:\n${r.exp}`;
  if (r.code) context += `\n\nExample code:\n\`\`\`\n${r.code}\n\`\`\``;
  return context;
}

// ── Re-export from former curriculum.js ──

export interface ScoredCurriculumResult {
  lang: string;
  phase: string;
  topic: string;
  exp: string;
  code: string;
  score: number;
}

export function searchCurriculum(
  query: string,
  lang?: string,
): ScoredCurriculumResult[] {
  return searchTFIDF(query, lang, 5);
}

export function getCurriculumContext(query: string, lang?: string): string {
  return getContext(query, lang, 3);
}

// ── Init ──
buildCurriculumDocs();
buildTFIDF();
if (config.openai.apiKey) buildEmbeddingCache();
