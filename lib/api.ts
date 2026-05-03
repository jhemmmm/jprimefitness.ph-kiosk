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

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const startedAt = Date.now();
  if (__DEV__) {
    console.log(`[api] -> ${method} ${url}`, body ?? '');
  }
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
    if (__DEV__) {
      console.log(`[api] !! ${method} ${url} network error`, e);
    }
    clearApiBaseUrl();
    throw e;
  }
  const text = await res.text();
  const parsed = text ? safeJson(text) : null;
  if (__DEV__) {
    const ms = Date.now() - startedAt;
    console.log(
      `[api] <- ${res.status} ${method} ${url} (${ms}ms)`,
      parsed ?? text,
    );
  }
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
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
};
