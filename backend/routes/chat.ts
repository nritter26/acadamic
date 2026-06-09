import { Router, Request, Response } from 'express';
import { handleTutorMessage } from '../services';
import { validate } from '../middleware';
import { ChatSchema } from '../types';

const router = Router();

router.post('/', validate(ChatSchema), async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { message, lang, topic, phase, code, output, hasError, history, learnerId, provider, model, apiKey, endpoint } = req.body;

  let aborted = false;
  let sseDoneCalled = false;
  res.on('close', () => { aborted = true; });

  const TIMEOUT_MS = 30000;
  const timeoutHandle = setTimeout(() => {
    if (!sseDoneCalled) {
      sseDoneCalled = true;
      res.write(`data: ${JSON.stringify({ content: "\n\n[TIMEOUT] The AI tutor took too long to respond. Please try again." })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }, TIMEOUT_MS);

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
    if (sseDoneCalled) return;
    sseDoneCalled = true;
    clearTimeout(timeoutHandle);
    res.write('data: [DONE]\n\n');
    res.end();
  };

  const providerConfig = (provider || model || apiKey || endpoint)
    ? { provider, model, apiKey, endpoint }
    : undefined;

  try {
    await handleTutorMessage(message, { lang, topic, phase, code, output, hasError, history, learnerId, providerConfig }, sseSend, sseDone);
  } catch (e) {
    if (!sseDoneCalled) {
      sseDoneCalled = true;
      clearTimeout(timeoutHandle);
      res.write(`data: ${JSON.stringify({ content: 'Error: ' + (e as Error).message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

export default router;
