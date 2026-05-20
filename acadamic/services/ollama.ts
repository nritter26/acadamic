let ollamaAvailable = false;
let ollamaModels: { name: string; modified_at: string; size: number }[] = [];

export async function detectOllama(): Promise<void> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json() as { models?: { name: string; modified_at: string; size: number }[] };
      ollamaModels = data.models || [];
      ollamaAvailable = ollamaModels.length > 0;
      if (ollamaAvailable) {
        console.log(`[Ollama] Detected at http://localhost:11434`);
        console.log(`[Ollama] Available models: ${ollamaModels.map(m => m.name).join(', ')}`);
      }
    } else {
      console.log('[Ollama] API responded but with error — not available');
    }
  } catch {
    ollamaAvailable = false;
    console.log('[Ollama] Not found at http://localhost:11434');
  }
}

export function getOllamaStatus() {
  return { available: ollamaAvailable, models: ollamaModels.map(m => m.name) };
}
