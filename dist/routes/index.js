"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = __importDefault(require("./health"));
const progress_1 = __importDefault(require("./progress"));
const execute_1 = __importDefault(require("./execute"));
const chat_1 = __importDefault(require("./chat"));
const analyze_1 = __importDefault(require("./analyze"));
const review_1 = __importDefault(require("./review"));
const explain_1 = __importDefault(require("./explain"));
const exercise_1 = __importDefault(require("./exercise"));
const quiz_1 = __importDefault(require("./quiz"));
const learner_1 = __importDefault(require("./learner"));
const proxy_1 = __importDefault(require("./proxy"));
const benchmark_1 = __importDefault(require("./benchmark"));
const courses_1 = __importDefault(require("./courses"));
const auth_1 = __importDefault(require("./auth"));
const projects_1 = __importDefault(require("./projects"));
const content_1 = __importDefault(require("./content"));
const router = (0, express_1.Router)();
router.use(health_1.default); // GET /health, GET /ollama/status, GET /tutor/status
router.use('/progress', progress_1.default); // GET, POST /progress
router.use('/execute', execute_1.default); // POST /execute
router.use('/chat', chat_1.default); // POST /chat (SSE)
router.use('/analyze', analyze_1.default); // POST /analyze
router.use('/review', review_1.default); // POST /review
router.use('/explain', explain_1.default); // POST /explain
router.use('/exercise', exercise_1.default); // POST /exercise
router.use('/quiz', quiz_1.default); // POST /quiz/generate
router.use('/learner', learner_1.default); // GET,POST /learner/*
router.use('/proxy', proxy_1.default); // POST /proxy
router.use('/benchmark', benchmark_1.default); // GET /benchmark
router.use('/courses', courses_1.default); // GET /courses
router.use('/auth', auth_1.default); // POST /auth/register, POST /auth/login, GET /auth/me
router.use('/projects', projects_1.default); // CRUD /projects
router.use('/content', content_1.default); // CRUD /content/:lang
exports.default = router;
//# sourceMappingURL=index.js.map