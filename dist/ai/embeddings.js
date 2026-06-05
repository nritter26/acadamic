"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hybridSearch = hybridSearch;
exports.search = search;
exports.searchWithSources = searchWithSources;
exports.getContext = getContext;
exports.getTopicContext = getTopicContext;
exports.getCurriculumContext = getCurriculumContext;
const path_1 = __importDefault(require("path"));
const url_1 = require("url"); // 1. Add this import
// 2. Recreate __dirname for ES Modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Your original line will now work perfectly:
const CONTENT_DIR = path_1.default.join(__dirname, '..', 'content');
const CACHE_FILE = path_1.default.join(__dirname, '..', 'data', 'embeddings-cache.json');
let curriculumDocs = [];
let tfidfIndex = null;
let embedCache = null;
let initPromise = null;
const LANG_CODE_WHITELIST = new Set(['js', 'ts', 'py', 'go', 'rs', 'c', 'kt', 'cs', 'sw', 'rb', 'sh', 'sql']);
function tokenize(text) {
    return (text || '')
        .toLowerCase()
        .replace(/<[^>]*>/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => (w.length > 2 || LANG_CODE_WHITELIST.has(w)) && w.length < 50);
}
async function buildCurriculumDocs() {
    curriculumDocs = [];
    try {
        if (!fs.existsSync(CONTENT_DIR)) {
            console.error('buildCurriculumDocs: content directory not found');
            return;
        }
        const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const lang = file.replace('.json', '');
            const raw = fs.readFileSync(path_1.default.join(CONTENT_DIR, file), 'utf-8');
            const data = JSON.parse(raw);
            for (const [phase, topics] of Object.entries(data)) {
                for (const [topic, val] of Object.entries(topics)) {
                    if (Array.isArray(val)) {
                        const exp = typeof val[0] === 'string' ? val[0] : '';
                        const code = typeof val[1] === 'string' ? val[1] : '';
                        curriculumDocs.push({ lang, phase, topic, exp, code, text: `${topic} ${exp} ${code}` });
                    }
                    else if (val && typeof val === 'object') {
                        const entry = val;
                        const exp = typeof entry.exp === 'string' ? entry.exp : '';
                        const code = typeof entry.code === 'string' ? entry.code : '';
                        if (exp || code) {
                            curriculumDocs.push({ lang, phase, topic, exp, code, text: `${topic} ${exp} ${code}` });
                        }
                    }
                }
            }
        }
        console.log(`Curriculum index: ${curriculumDocs.length} topics indexed`);
    }
    catch (e) {
        console.error('buildCurriculumDocs error:', e.message);
    }
}
function buildTFIDF() {
    if (curriculumDocs.length === 0)
        return;
    const docCount = curriculumDocs.length;
    const df = Object.create(null);
    const invertedIndex = Object.create(null);
    const tokenizedDocs = curriculumDocs.map((doc, di) => {
        const tokens = tokenize(doc.text);
        const unique = new Set(tokens);
        for (const t of unique)
            df[t] = (df[t] || 0) + 1;
        for (const t of unique) {
            if (!invertedIndex[t])
                invertedIndex[t] = [];
            invertedIndex[t].push(di);
        }
        return { docIndex: di, tokens };
    });
    const idf = {};
    for (const [term, freq] of Object.entries(df)) {
        idf[term] = Math.log((docCount + 1) / (freq + 1)) + 1;
    }
    const docVectors = tokenizedDocs.map(({ docIndex, tokens }) => {
        const tf = {};
        for (const t of tokens)
            tf[t] = (tf[t] || 0) + 1;
        const maxTf = Math.max(...Object.values(tf), 1);
        const vector = {};
        for (const [t, freq] of Object.entries(tf)) {
            vector[t] = (freq / maxTf) * (idf[t] || 1);
        }
        return {
            docIndex,
            vector,
            magnitude: Math.sqrt(Object.values(vector).reduce((s, v) => s + v * v, 0)),
        };
    });
    tfidfIndex = { docVectors, idf, docCount, invertedIndex };
}
function cosineSimilarity(vecA, vecB) {
    let dot = 0, magA = 0, magB = 0;
    for (const [t, v] of Object.entries(vecA)) {
        magA += v * v;
        if (vecB[t])
            dot += v * vecB[t];
    }
    for (const v of Object.values(vecB))
        magB += v * v;
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
}
function searchTFIDF(query, lang, topN = 5) {
    if (!tfidfIndex)
        buildTFIDF();
    if (!tfidfIndex || curriculumDocs.length === 0)
        return [];
    const qTokens = tokenize(query);
    if (qTokens.length === 0)
        return [];
    let candidateSet = new Set();
    for (const t of qTokens) {
        const docs = tfidfIndex.invertedIndex[t];
        if (!docs)
            continue;
        for (const d of docs)
            candidateSet.add(d);
    }
    if (!candidateSet)
        return [];
    const qTf = {};
    for (const t of qTokens)
        qTf[t] = (qTf[t] || 0) + 1;
    const qMax = Math.max(...Object.values(qTf), 1);
    const qVec = {};
    for (const [t, freq] of Object.entries(qTf)) {
        qVec[t] = (freq / qMax) * (tfidfIndex.idf[t] || 0);
    }
    const results = [];
    for (const di of candidateSet) {
        const dv = tfidfIndex.docVectors[di];
        if (lang && curriculumDocs[di].lang !== lang)
            continue;
        const score = cosineSimilarity(qVec, dv.vector);
        if (score > 0) {
            results.push({ ...curriculumDocs[di], score });
        }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, topN);
}
async function getEmbedding(text) {
    const key = text.toLowerCase().trim().slice(0, 100);
    if (embedCache?.[key])
        return embedCache[key];
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
                const data = (await response.json());
                const emb = data.data?.[0]?.embedding;
                if (emb && embedCache) {
                    embedCache[key] = emb;
                    return emb;
                }
            }
        }
        catch (e) {
            console.error('getEmbedding error:', e.message);
        }
    }
    return null;
}
function cosineSim(a, b) {
    if (a.length !== b.length)
        return 0;
    let dot = 0, ma = 0, mb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        ma += a[i] * a[i];
        mb += b[i] * b[i];
    }
    const d = Math.sqrt(ma) * Math.sqrt(mb);
    return d === 0 ? 0 : dot / d;
}
async function searchEmbedding(query, lang, topN = 5) {
    const qEmb = await getEmbedding(query);
    if (!qEmb)
        return null;
    let docs = curriculumDocs;
    if (lang)
        docs = docs.filter(d => d.lang === lang);
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
async function fetchEmbeddings(inputs) {
    try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openai.apiKey}`,
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: inputs,
            }),
        });
        if (!response.ok)
            return null;
        const data = (await response.json());
        return inputs.map((input, i) => ({
            key: input.toLowerCase().slice(0, 100),
            embedding: data.data.find(d => d.index === i)?.embedding || null,
        }));
    }
    catch (e) {
        console.error('fetchEmbeddings batch error:', e.message);
        return null;
    }
}
async function buildEmbeddingCache() {
    if (!config.openai.apiKey || config.provider === 'keyword')
        return;
    try {
        try {
            const raw = await fsp.readFile(CACHE_FILE, 'utf-8');
            embedCache = JSON.parse(raw);
        }
        catch {
            embedCache = {};
        }
        const batchSize = 20;
        for (let i = 0; i < curriculumDocs.length; i += batchSize) {
            const batch = curriculumDocs.slice(i, i + batchSize);
            const toEmbed = batch.filter(d => {
                const key = d.topic.toLowerCase().slice(0, 100);
                return !embedCache[key];
            });
            if (toEmbed.length === 0)
                continue;
            const inputs = toEmbed.map(d => `${d.topic}: ${d.exp}`.slice(0, 8191));
            const results = await fetchEmbeddings(inputs);
            if (!results)
                continue;
            for (let j = 0; j < results.length; j++) {
                const { key, embedding } = results[j];
                if (!embedding)
                    continue;
                embedCache[key] = embedding;
                toEmbed[j]._embedding = embedding;
            }
        }
        await fsp.writeFile(CACHE_FILE, JSON.stringify(embedCache));
    }
    catch (e) {
        console.error('buildEmbeddingCache error:', e.message);
    }
}
function rrfFusion(resultsA, resultsB, k = 60) {
    const rankMap = new Map();
    const docMap = new Map();
    const key = (r) => `${r.lang}:${r.phase}:${r.topic}`;
    resultsA.forEach((r, i) => rankMap.set(key(r), (rankMap.get(key(r)) || 0) + 1 / (k + i + 1)));
    resultsB.forEach((r, i) => rankMap.set(key(r), (rankMap.get(key(r)) || 0) + 1 / (k + i + 1)));
    for (const r of [...resultsA, ...resultsB]) {
        const k2 = key(r);
        if (!docMap.has(k2) || rankMap.get(k2) > (docMap.get(k2)?.score || 0)) {
            docMap.set(k2, { ...r, score: rankMap.get(k2) || 0 });
        }
    }
    return [...docMap.values()].sort((a, b) => b.score - a.score);
}
async function hybridSearch(query, lang, topN = 5) {
    if (curriculumDocs.length === 0 && !initPromise) {
        initPromise = init();
        await initPromise;
    }
    else if (initPromise) {
        await initPromise;
    }
    const tfidfResults = searchTFIDF(query, lang, topN * 2);
    const embResults = await searchEmbedding(query, lang, topN * 2);
    if (!embResults || embResults.length === 0)
        return tfidfResults;
    if (tfidfResults.length === 0)
        return embResults;
    return rrfFusion(tfidfResults, embResults, 60).slice(0, topN);
}
async function search(query, lang, topN = 5) {
    return hybridSearch(query, lang, topN);
}
async function searchWithSources(query, lang, topN = 3) {
    const results = await hybridSearch(query, lang, topN);
    let mode = 'tfidf';
    const embResults = await searchEmbedding(query, lang, 1);
    if (embResults && embResults.length > 0)
        mode = 'hybrid';
    return { results, mode };
}
async function getContext(query, lang, topN = 3) {
    const results = await search(query, lang, topN);
    if (results.length === 0)
        return '';
    let context = '\n\n**Relevant curriculum content (semantic match):**\n';
    for (const r of results) {
        context += `\n[${r.lang.toUpperCase()} - ${r.phase} - ${r.topic}] (relevance: ${(r.score * 100).toFixed(0)}%)\n`;
        if (r.exp)
            context += `${r.exp.slice(0, 300)}...\n`;
        if (r.code)
            context += `\`\`\`\n${r.code.slice(0, 200)}\n\`\`\`\n`;
    }
    return context;
}
function getTopicContext(topic, lang) {
    const results = searchTFIDF(topic, lang, 1);
    if (results.length === 0)
        return '';
    const r = results[0];
    let context = `The user is currently studying **${r.topic}** (${r.lang.toUpperCase()} - ${r.phase}).`;
    if (r.exp)
        context += `\n\nCurriculum content:\n${r.exp}`;
    if (r.code)
        context += `\n\nExample code:\n\`\`\`\n${r.code}\n\`\`\``;
    return context;
}
function getCurriculumContext(query, lang) {
    const results = searchTFIDF(query, lang, 3);
    if (results.length === 0)
        return '';
    let context = '\n\n**Relevant curriculum content (semantic match):**\n';
    for (const r of results) {
        context += `\n[${r.lang.toUpperCase()} - ${r.phase} - ${r.topic}] (relevance: ${(r.score * 100).toFixed(0)}%)\n`;
        if (r.exp)
            context += `${r.exp.slice(0, 300)}...\n`;
        if (r.code)
            context += `\`\`\`\n${r.code.slice(0, 200)}\n\`\`\`\n`;
    }
    return context;
}
async function init() {
    await buildCurriculumDocs();
    buildTFIDF();
    if (config.openai.apiKey) {
        try {
            await buildEmbeddingCache();
        }
        catch (e) {
            console.error('init: embedding cache build failed:', e.message);
        }
    }
}
initPromise = init().catch(e => {
    console.error('init failed:', e.message);
});
//# sourceMappingURL=embeddings.js.map