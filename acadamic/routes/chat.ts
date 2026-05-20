import { Router, Request, Response } from 'express';
import { handleTutorMessage } from '../services';
import { validate } from '../middleware';
import { ChatSchema } from '../types';

const router = Router();

router.post('/', validate(ChatSchema), async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { message, lang, topic, phase, code, output, hasError, history, learnerId } = req.body;

  if (!message) {
    res.write(`data: ${JSON.stringify({ content: "Ask me something about programming!" })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  const sseSend = (chunk: string) => {
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  };
  const sseDone = () => {
    res.write('data: [DONE]\n\n');
    res.end();
  };

  await handleTutorMessage(message, { lang, topic, phase, code, output, hasError, history, learnerId }, sseSend, sseDone);
});

export default router;
