export async function apiPost(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function apiGet(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function apiStream(path, body, onChunk, onDone, onError) {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      onError?.(`HTTP ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6);
        if (data === '[DONE]') {
          onDone?.();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          onChunk?.(parsed.content ?? parsed.text ?? data);
        } catch {
          onChunk?.(data);
        }
      }
    }

    onDone?.();
  } catch (error) {
    onError?.(error.message);
  }
}
