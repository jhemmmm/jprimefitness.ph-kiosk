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

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  opts?: RequestOpts,
): Promise<T> {
  const baseUrl = opts?.baseUrl ?? getApiBaseUrl();
  const url = `${baseUrl}${path}`;
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
    });
  } catch (e) {
    // Only invalidate the discovered LAN backend on transport failure — a live-URL
    // failure shouldn't kick the kiosk back into rediscovery.
    if (!opts?.baseUrl) clearApiBaseUrl();
    throw e;
  }
  const text = await res.text();
  const parsed = text ? safeJson(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, `HTTP ${res.status} ${res.statusText}`, parsed);
  }
  return parsed as T;
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
