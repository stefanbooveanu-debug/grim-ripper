import type { ApiErrorBody } from './types';

export function parseApiError(err: unknown, status?: number): string {
  if (status === 401) return 'Session expired. Please log in again.';
  if (status === 503 || status === 502) {
    return 'Python API not running. Start it on localhost:8080.';
  }

  if (err instanceof Error) {
    const msg = err.message.trim();
    if (msg.startsWith('{')) {
      try {
        const body = JSON.parse(msg) as ApiErrorBody;
        return body.detail ?? body.message ?? body.error ?? msg;
      } catch {
        return msg;
      }
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return 'Cannot reach Python API at localhost:8080.';
    }
    return msg || 'Request failed.';
  }

  return 'Request failed.';
}

export async function readErrorFromResponse(res: Response): Promise<string> {
  const text = await res.text().catch(() => res.statusText);
  if (!text) return parseApiError(new Error(res.statusText), res.status);
  try {
    const body = JSON.parse(text) as ApiErrorBody;
    return body.detail ?? body.message ?? body.error ?? text;
  } catch {
    return text;
  }
}
