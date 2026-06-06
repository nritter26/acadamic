const DEFAULT_CONFIG = { chunkSize: 500, overlap: 50 };
export function chunkDocument(exp, code, lang, phase, topic, config = DEFAULT_CONFIG) {
    const fullText = `${topic} ${exp}`;
    if (!fullText)
        return [];
    const chunks = [];
    const step = config.chunkSize - config.overlap;
    if (step <= 0)
        return [];
    for (let i = 0, idx = 0; i < fullText.length; i += step, idx++) {
        const end = Math.min(i + config.chunkSize, fullText.length);
        let text = fullText.slice(i, end);
        if (code && idx === 0)
            text += `\n\n${code}`;
        chunks.push({ text, lang, phase, topic, chunkIndex: idx });
        if (end >= fullText.length)
            break;
    }
    return chunks;
}
export function chunkAllCurriculum(docs, config) {
    const all = [];
    for (const doc of docs) {
        all.push(...chunkDocument(doc.exp, doc.code, doc.lang, doc.phase, doc.topic, config));
    }
    return all;
}
export function formatChunksAsContext(chunks, maxChars = 2000) {
    let result = '';
    for (const c of chunks) {
        const header = `[${c.lang.toUpperCase()} - ${c.phase} - ${c.topic} (chunk ${c.chunkIndex})]`;
        const entry = `\n${header}\n${c.text.slice(0, maxChars / chunks.length)}\n`;
        if (result.length + entry.length > maxChars)
            break;
        result += entry;
    }
    return result;
}
//# sourceMappingURL=chunker.js.map