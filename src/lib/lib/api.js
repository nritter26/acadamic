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

export async function apiStream(path, body, onChunk, onDone, onError, onEvent, signal) {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const msg = response.status === 502
        ? 'Server unreachable (502). Make sure the backend is running.'
        : `HTTP ${response.status}`;
      onError?.(msg);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';

    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
          continue;
        }
        if (!line.startsWith('data: ')) {
          currentEvent = '';
          continue;
        }

        const data = line.slice(6);
        if (data === '[DONE]') {
          onDone?.();
          return;
        }

        if (currentEvent) {
          try {
            const parsed = JSON.parse(data);
            onEvent?.(currentEvent, parsed);
          } catch {
            onEvent?.(currentEvent, { raw: data });
          }
          currentEvent = '';
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'explanation_end') continue;
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
