import { Router } from 'express';
import healthRouter from './health';
import progressRouter from './progress';
import executeRouter from './execute';
import chatRouter from './chat';
import analyzeRouter from './analyze';
import reviewRouter from './review';
import explainRouter from './explain';
import exerciseRouter from './exercise';
import quizRouter from './quiz';
import learnerRouter from './learner';
import proxyRouter from './proxy';
import benchmarkRouter from './benchmark';
import coursesRouter from './courses';
import authRouter from './auth';
import projectsRouter from './projects';
import contentRouter from './content';
const router = Router();
router.use(healthRouter); // GET /health, GET /ollama/status, GET /tutor/status
router.use('/progress', progressRouter); // GET, POST /progress
router.use('/execute', executeRouter); // POST /execute
router.use('/chat', chatRouter); // POST /chat (SSE)
router.use('/analyze', analyzeRouter); // POST /analyze
router.use('/review', reviewRouter); // POST /review
router.use('/explain', explainRouter); // POST /explain
router.use('/exercise', exerciseRouter); // POST /exercise
router.use('/quiz', quizRouter); // POST /quiz/generate
router.use('/learner', learnerRouter); // GET,POST /learner/*
router.use('/proxy', proxyRouter); // POST /proxy
router.use('/benchmark', benchmarkRouter); // GET /benchmark
router.use('/courses', coursesRouter); // GET /courses
router.use('/auth', authRouter); // POST /auth/register, POST /auth/login, GET /auth/me
router.use('/projects', projectsRouter); // CRUD /projects
router.use('/content', contentRouter); // CRUD /content/:lang
export default router;
//# sourceMappingURL=index.js.map