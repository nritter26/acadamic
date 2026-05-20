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

  let aborted = false;
  req.on('close', () => { aborted = true; });

  if (!message) {
    res.write(`data: ${JSON.stringify({ content: "Ask me something about programming!" })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  const sseSend = (chunk: string) => {
    if (aborted) return;
    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
  };
  const sseDone = () => {
    if (aborted) return;
    res.write('data: [DONE]\n\n');
    res.end();
  };

  try {
    await handleTutorMessage(message, { lang, topic, phase, code, output, hasError, history, learnerId }, sseSend, sseDone);
  } catch (e) {
    if (!aborted) {
      res.write(`data: ${JSON.stringify({ content: 'Error: ' + (e as Error).message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

export default router;
