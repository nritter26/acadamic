let rustAvailable = true;
let checking = false;

export async function checkBackendHealth() {
  if (checking) return rustAvailable;
  checking = true;
  try {
    const r = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
    rustAvailable = r.ok;
  } catch {
    rustAvailable = false;
  }
  checking = false;
  return rustAvailable;
}

export function isRustAvailable() {
  return rustAvailable;
}
