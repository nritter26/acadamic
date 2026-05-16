exports.handler = async (event) => {
    const count = parseInt(event.queryStringParameters?.n) || 10000;

    const start = Date.now();
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum += i * i;
    }
    const ms = Date.now() - start;

    return {
        statusCode: 200,
        body: JSON.stringify({
            backend: 'Node.js (Netlify)',
            version: process.version,
            iterations: count,
            result: sum,
            timeMs: ms,
            opsPerSec: Math.round(count / (ms / 1000)),
        })
    };
};
