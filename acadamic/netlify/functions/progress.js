const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

function ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROGRESS_FILE)) {
        fs.writeFileSync(PROGRESS_FILE, '{}');
    }
}

exports.handler = async (event) => {
    ensureFile();

    if (event.httpMethod === 'GET') {
        try {
            const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
            return { statusCode: 200, body: JSON.stringify(data) };
        } catch {
            return { statusCode: 200, body: '{}' };
        }
    }

    if (event.httpMethod === 'POST') {
        try {
            const { lang, topic, completed } = JSON.parse(event.body);
            const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
            if (!data[lang]) data[lang] = {};
            data[lang][topic] = completed;
            fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
            return { statusCode: 200, body: JSON.stringify({ ok: true }) };
        } catch (e) {
            return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
        }
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
};
