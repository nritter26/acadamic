import fsp from 'fs/promises';
import path from 'path';

const CONV_DIR = path.join(__dirname, '..', 'data', 'conversations');

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  learnerId: string;
  messages: ConversationEntry[];
  updatedAt: number;
}

const cache = new Map<string, Conversation>();
const MAX_CACHE_SIZE = 100;
const TTL_MS = 24 * 60 * 60 * 1000;

function getPath(learnerId: string): string {
  const safe = learnerId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(CONV_DIR, `${safe}.json`);
}

async function ensureDir(): Promise<void> {
  await fsp.mkdir(CONV_DIR, { recursive: true });
}

async function load(learnerId: string): Promise<Conversation> {
  const cached = cache.get(learnerId);
  if (cached) return cached;

  try {
    await ensureDir();
    const fp = getPath(learnerId);
    const raw = await fsp.readFile(fp, 'utf-8');
    const conv: Conversation = JSON.parse(raw);
    const cutoff = Date.now() - TTL_MS;
    conv.messages = conv.messages.filter(m => m.timestamp > cutoff);
    conv.updatedAt = Date.now();
    cache.set(learnerId, conv);
    return conv;
  } catch {
    const conv: Conversation = { learnerId, messages: [], updatedAt: Date.now() };
    cache.set(learnerId, conv);
    return conv;
  }
}

async function save(conv: Conversation): Promise<void> {
  await ensureDir();
  conv.updatedAt = Date.now();
  const fp = getPath(conv.learnerId);
  const tmp = fp + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(conv));
  await fsp.rename(tmp, fp);
}

export async function addMessage(
  learnerId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  const conv = await load(learnerId);
  conv.messages.push({ role, content, timestamp: Date.now() });
  if (conv.messages.length > 100) {
    conv.messages = conv.messages.slice(-100);
  }
  await save(conv);
  if (cache.size > MAX_CACHE_SIZE) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

export async function getHistory(
  learnerId: string,
  n = 20,
): Promise<ConversationEntry[]> {
  const conv = await load(learnerId);
  return conv.messages.slice(-n);
}

export async function clearConversation(learnerId: string): Promise<void> {
  cache.delete(learnerId);
  try {
    await fsp.unlink(getPath(learnerId));
  } catch {}
}

export async function pruneOldConversations(): Promise<void> {
  try {
    await ensureDir();
    const files = await fsp.readdir(CONV_DIR);
    const cutoff = Date.now() - TTL_MS;
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const fp = path.join(CONV_DIR, file);
      try {
        const stat = await fsp.stat(fp);
        if (stat.mtimeMs < cutoff) {
          await fsp.unlink(fp);
          const id = file.replace('.json', '');
          cache.delete(id);
        }
      } catch {}
    }
  } catch {}
}
