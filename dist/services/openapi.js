"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapiHandler = openapiHandler;
exports.swaggerUIHandler = swaggerUIHandler;
const API_BASE = '/api';
const spec = {
    openapi: '3.0.3',
    info: {
        title: "Kodex's Lab API",
        version: '1.0.0',
        description: 'Interactive multi-language programming textbook API — code execution, AI tutor, learner profiles, projects, and more.',
    },
    servers: [{ url: '', description: 'Same origin' }],
    paths: {
        [`${API_BASE}/health`]: {
            get: {
                summary: 'Health check',
                tags: ['System'],
                responses: {
                    '200': {
                        description: 'Server health status with compiler availability',
                        content: { 'application/json': { schema: { type: 'object' } } },
                    },
                },
            },
        },
        [`${API_BASE}/ollama/status`]: {
            get: {
                summary: 'Ollama availability',
                tags: ['System'],
                responses: { '200': { description: 'Ollama detection status' } },
            },
        },
        [`${API_BASE}/tutor/status`]: {
            get: {
                summary: 'AI tutor status',
                tags: ['AI'],
                responses: { '200': { description: 'Current AI provider and model info' } },
            },
        },
        [`${API_BASE}/metrics`]: {
            get: {
                summary: 'Prometheus metrics',
                tags: ['System'],
                responses: { '200': { description: 'Prometheus-formatted metrics' } },
            },
        },
        [`${API_BASE}/ws/stats`]: {
            get: {
                summary: 'WebSocket connection stats',
                tags: ['System'],
                responses: { '200': { description: 'WebSocket connection counts' } },
            },
        },
        [`${API_BASE}/progress`]: {
            get: {
                summary: 'Get all progress',
                tags: ['Progress'],
                responses: { '200': { description: 'Topic completion progress' } },
            },
            post: {
                summary: 'Save progress',
                tags: ['Progress'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    lang: { type: 'string' },
                                    topic: { type: 'string' },
                                    completed: { type: 'boolean' },
                                },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Progress saved' } },
            },
        },
        [`${API_BASE}/execute`]: {
            post: {
                summary: 'Execute code',
                tags: ['Execution'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    lang: { type: 'string', description: 'py, js, ts, go, rs, c, cpp, cs, kt, swift, zig, sqlite, pg, mysql' },
                                    code: { type: 'string' },
                                    stdin: { type: 'string' },
                                },
                                required: ['lang', 'code'],
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Execution output' },
                    '400': { description: 'Validation error' },
                },
            },
        },
        [`${API_BASE}/chat`]: {
            post: {
                summary: 'AI tutor chat (SSE streaming)',
                tags: ['AI'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string' },
                                    lang: { type: 'string' },
                                    topic: { type: 'string' },
                                    phase: { type: 'string' },
                                    code: { type: 'string' },
                                    output: { type: 'string' },
                                    hasError: { type: 'boolean' },
                                    learnerId: { type: 'string' },
                                    history: { type: 'array', items: { type: 'object' } },
                                },
                                required: ['message'],
                            },
                        },
                    },
                },
                responses: { '200': { description: 'SSE stream of tutor response' } },
            },
        },
        [`${API_BASE}/analyze`]: {
            post: {
                summary: 'Static code analysis',
                tags: ['Analysis'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    code: { type: 'string' },
                                    lang: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Analysis hints' } },
            },
        },
        [`${API_BASE}/review`]: {
            post: {
                summary: 'Full code review (static + optional LLM)',
                tags: ['Analysis'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    code: { type: 'string' },
                                    lang: { type: 'string' },
                                    topic: { type: 'string' },
                                    learnerId: { type: 'string' },
                                },
                                required: ['code'],
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Review with issues and score' } },
            },
        },
        [`${API_BASE}/explain`]: {
            post: {
                summary: 'Code explanation',
                tags: ['Analysis'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    code: { type: 'string' },
                                    lang: { type: 'string' },
                                    topic: { type: 'string' },
                                },
                                required: ['code'],
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Code explanation' } },
            },
        },
        [`${API_BASE}/exercise`]: {
            post: {
                summary: 'Generate practice exercise',
                tags: ['AI'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    topic: { type: 'string' },
                                    lang: { type: 'string' },
                                    level: { type: 'string', enum: ['beginner', 'intermediate', 'expert'] },
                                },
                                required: ['topic'],
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Generated exercise' } },
            },
        },
        [`${API_BASE}/quiz/generate`]: {
            post: {
                summary: 'Generate quiz questions',
                tags: ['AI'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    topic: { type: 'string' },
                                    lang: { type: 'string' },
                                    count: { type: 'integer', minimum: 1, maximum: 10 },
                                    level: { type: 'string' },
                                },
                                required: ['topic'],
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Quiz questions array' } },
            },
        },
        [`${API_BASE}/learner/state`]: {
            get: {
                summary: 'Get learner state',
                tags: ['Learner'],
                parameters: [
                    { name: 'lang', in: 'query', schema: { type: 'string' } },
                    { name: 'learnerId', in: 'query', schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Learner profile and mastery' } },
            },
        },
        [`${API_BASE}/learner/track`]: {
            post: {
                summary: 'Track learner event',
                tags: ['Learner'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    event: { type: 'string', enum: ['complete-topic', 'error', 'attempt', 'quiz', 'challenge', 'ai-interaction'] },
                                    lang: { type: 'string' },
                                    topic: { type: 'string' },
                                    phase: { type: 'string' },
                                    data: { type: 'object' },
                                    learnerId: { type: 'string' },
                                },
                                required: ['event'],
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Event tracked' } },
            },
        },
        [`${API_BASE}/learner/reviews`]: {
            get: {
                summary: 'Get due spaced-repetition reviews',
                tags: ['Learner'],
                parameters: [
                    { name: 'learnerId', in: 'query', schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Due reviews list' } },
            },
        },
        [`${API_BASE}/learner/recommend`]: {
            get: {
                summary: 'Get next recommended topic',
                tags: ['Learner'],
                parameters: [
                    { name: 'lang', in: 'query', schema: { type: 'string' } },
                    { name: 'topics', in: 'query', schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Recommended topic' } },
            },
        },
        [`${API_BASE}/learner/path`]: {
            get: {
                summary: 'Get personalized learning path',
                tags: ['Learner'],
                parameters: [
                    { name: 'lang', in: 'query', schema: { type: 'string' } },
                    { name: 'learnerId', in: 'query', schema: { type: 'string' } },
                ],
                responses: { '200': { description: 'Learning path with progress' } },
            },
        },
        [`${API_BASE}/proxy`]: {
            post: {
                summary: 'Proxy HTTP requests (SSRF-safe)',
                tags: ['Tools'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    method: { type: 'string', default: 'GET' },
                                    url: { type: 'string', format: 'uri' },
                                    headers: { type: 'object' },
                                    body: { type: 'string' },
                                },
                                required: ['url'],
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Proxy response' } },
            },
        },
        [`${API_BASE}/benchmark`]: {
            get: {
                summary: 'Performance benchmark',
                tags: ['System'],
                parameters: [
                    { name: 'n', in: 'query', schema: { type: 'integer', default: 10000 } },
                ],
                responses: { '200': { description: 'Benchmark results' } },
            },
        },
        [`${API_BASE}/courses`]: {
            get: {
                summary: 'List available courses',
                tags: ['Content'],
                responses: { '200': { description: 'Course file names' } },
            },
        },
        [`${API_BASE}/auth/register`]: {
            post: {
                summary: 'Register new user',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    name: { type: 'string' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'User created with JWT token' },
                    '409': { description: 'Email already exists' },
                },
            },
        },
        [`${API_BASE}/auth/login`]: {
            post: {
                summary: 'Login',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'JWT token and user info' },
                    '401': { description: 'Invalid credentials' },
                },
            },
        },
        [`${API_BASE}/auth/me`]: {
            get: {
                summary: 'Get current user',
                tags: ['Auth'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'User profile' },
                    '401': { description: 'Not authenticated' },
                },
            },
        },
        [`${API_BASE}/projects`]: {
            get: {
                summary: 'List user projects',
                tags: ['Projects'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Project list' } },
            },
            post: {
                summary: 'Create project',
                tags: ['Projects'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    language: { type: 'string' },
                                    description: { type: 'string' },
                                },
                                required: ['name'],
                            },
                        },
                    },
                },
                responses: { '201': { description: 'Created project' } },
            },
        },
        [`${API_BASE}/projects/{id}`]: {
            get: {
                summary: 'Get project',
                tags: ['Projects'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Project with files' } },
            },
            put: {
                summary: 'Update project',
                tags: ['Projects'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    language: { type: 'string' },
                                    description: { type: 'string' },
                                    files: { type: 'object' },
                                },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Updated project' } },
            },
            delete: {
                summary: 'Delete project',
                tags: ['Projects'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Project deleted' } },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};
function openapiHandler(_req, res) {
    res.json(spec);
}
function swaggerUIHandler(_req, res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Kodex's Lab API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' });
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}
//# sourceMappingURL=openapi.js.map