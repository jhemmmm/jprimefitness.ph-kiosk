import { clearApiBaseUrl, getApiBaseUrl } from './backend';
import { config } from './config';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Method = 'GET' | 'POST';

type RequestOpts = {
  baseUrl?: string;
};

// A dead LAN host drops packets silently; without this a request hangs for minutes.
const TIMEOUT_MS = 12_000;

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  opts?: RequestOpts,
): Promise<T> {
  const baseUrl = opts?.baseUrl ?? getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Kiosk-Token': config.kioskToken,
      },
      body: body == null ? undefined : JSON.stringify(body),
      signal: ctl.signal,
    });
  } catch (e) {
    // Only invalidate the discovered LAN backend on transport failure — a live-URL
    // failure shouldn't kick the kiosk back into rediscovery.
    if (!opts?.baseUrl) clearApiBaseUrl();
    throw ctl.signal.aborted ? new Error('Server did not respond in time.') : e;
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  const parsed = text ? safeJson(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, serverMessage(parsed) ?? `HTTP ${res.status} ${res.statusText}`, parsed);
  }
  return parsed as T;
}

// Laravel: { message } or { errors: { field: [msg] } }. Surface it so the kiosk
// shows "Payment reference has already been used" instead of "HTTP 422".
function serverMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as { message?: unknown; errors?: Record<string, unknown> };
  const first = b.errors && Object.values(b.errors)[0];
  const fromErrors = Array.isArray(first) ? first[0] : first;
  const msg = typeof fromErrors === 'string' ? fromErrors : b.message;
  return typeof msg === 'string' && msg ? msg : null;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  get: <T>(path: string, opts?: RequestOpts) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOpts) =>
    request<T>('POST', path, body, opts),
};
