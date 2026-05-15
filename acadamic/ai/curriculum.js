const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

let curriculumIndex = [];

function buildCurriculumIndex() {
    curriculumIndex = [];
    try {
        const files = fs.readdirSync(DATA_DIR).filter(f =>
            f.endsWith('.js') && !['app.js', 'courseData.js', 'challenges.js', 'quiz.js', 'style.css'].includes(f)
        );
        for (const file of files) {
            const lang = file.replace('.js', '');
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const topics = extractTopics(content);
            for (const topic of topics) {
                curriculumIndex.push({ lang, ...topic });
            }
        }
    } catch (e) {
        console.error('Error building curriculum index:', e.message);
    }
}

function extractTopics(content) {
    const topics = [];
    const phaseRegex = /"([^"]+)":\s*\{/g;
    let phaseMatch;
    while ((phaseMatch = phaseRegex.exec(content)) !== null) {
        const phase = phaseMatch[1];
        const topicRegex = /"([^"]+)":\s*\{[^}]*exp:\s*`([^`]*)`[^}]*code:\s*`([^`]*)`/g;
        let topicMatch;
        while ((topicMatch = topicRegex.exec(content)) !== null) {
            topics.push({
                phase,
                topic: topicMatch[1],
                exp: topicMatch[2].replace(/<[^>]*>/g, '').trim(),
                code: topicMatch[3].trim(),
            });
        }
    }
    return topics;
}

function searchCurriculum(query, lang) {
    const q = query.toLowerCase();
    let results = curriculumIndex;

    if (lang) {
        results = results.filter(r => r.lang === lang);
    }

    const scored = results.map(r => {
        let score = 0;
        const topicLow = r.topic.toLowerCase();
        const expLow = (r.exp || '').toLowerCase();
        const combined = topicLow + ' ' + expLow;

        if (topicLow.includes(q)) score += 5;
        if (expLow.includes(q)) score += 2;

        const queryWords = q.split(/\s+/).filter(w => w.length > 2);
        for (const word of queryWords) {
            if (topicLow.includes(word)) score += 3;
            if (expLow.includes(word)) score += 1;
        }

        if (combined.includes(q)) score += 10;

        return { ...r, score };
    });

    return scored.filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
}

function getCurriculumContext(query, lang) {
    const results = searchCurriculum(query, lang);
    if (results.length === 0) return '';

    let context = '\n\n**Relevant curriculum content:**\n';
    for (const r of results) {
        context += `\n[${r.lang.toUpperCase()} - ${r.phase} - ${r.topic}]\n`;
        if (r.exp) context += `${r.exp}\n`;
        if (r.code) context += `Example code:\n\`\`\`\n${r.code}\n\`\`\`\n`;
    }
    return context;
}

function getTopicContext(topic, lang) {
    const q = topic.toLowerCase();
    let results = curriculumIndex.filter(r => r.lang === lang && r.topic.toLowerCase().includes(q));
    if (results.length === 0) {
        results = curriculumIndex.filter(r => r.topic.toLowerCase().includes(q));
    }

    if (results.length === 0) return '';

    const r = results[0];
    let context = `The user is currently studying **${r.topic}** (${r.lang.toUpperCase()} - ${r.phase}).`;
    if (r.exp) context += `\n\nCurriculum content for this topic:\n${r.exp}`;
    if (r.code) context += `\n\nExample code from curriculum:\n\`\`\`\n${r.code}\n\`\`\``;
    return context;
}

buildCurriculumIndex();

module.exports = { buildCurriculumIndex, searchCurriculum, getCurriculumContext, getTopicContext };
