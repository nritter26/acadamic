import { Router, Request, Response } from 'express';
import { proxyRequest, isValidProxyUrl } from '../services';
import { validate } from '../middleware';
import { ProxySchema } from '../types';

const router = Router();

router.post('/', validate(ProxySchema), async (req: Request, res: Response) => {
  const { method = 'GET', url, headers: reqHeaders = {}, body } = req.body;

  if (!url) {
    res.status(400).json({ error: 'No URL provided' });
    return;
  }
  if (!isValidProxyUrl(url)) {
    res.status(400).json({ error: 'Invalid or forbidden URL' });
    return;
  }

  try {
    const result = await proxyRequest(method, url, reqHeaders, body);
    res.json(result);
  } catch (e) {
    res.json({
      error: (e as Error).message,
      status: 0,
      statusText: '',
      headers: {},
      body: '',
      displayBody: '',
      time: 0,
      size: 0,
    });
  }
});

export default router;
