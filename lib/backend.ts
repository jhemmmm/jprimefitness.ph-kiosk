import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@jprime/backend-url-v1';

type CachedBackend = {
  url: string;
  serverId?: string;
  savedAt: number;
};

let currentBaseUrl: string | null = null;
let lastInvalidatedAt = 0;
const INVALIDATE_DEBOUNCE_MS = 30_000;

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getApiBaseUrl(): string {
  if (!currentBaseUrl) {
    throw new Error('Backend URL not set. Discovery must complete first.');
  }
  return currentBaseUrl;
}

export function getApiBaseUrlOrNull(): string | null {
  return currentBaseUrl;
}

export function setApiBaseUrl(url: string, serverId?: string): void {
  currentBaseUrl = normalizeUrl(url);
  void persist({ url: currentBaseUrl, serverId, savedAt: Date.now() });
  notify();
}

export function clearApiBaseUrl(): void {
  const now = Date.now();
  if (now - lastInvalidatedAt < INVALIDATE_DEBOUNCE_MS) return;
  lastInvalidatedAt = now;
  currentBaseUrl = null;
  void AsyncStorage.removeItem(STORAGE_KEY);
  notify();
}

export async function loadCached(): Promise<CachedBackend | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBackend;
    if (typeof parsed?.url !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

async function persist(entry: CachedBackend): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

function normalizeUrl(url: string): string {
  let trimmed = url.trim();
  if (trimmed.endsWith('/')) trimmed = trimmed.slice(0, -1);
  return trimmed;
}

export function buildUrlFromIpPort(ip: string, port: number | string): string {
  const rawHost = ip.trim();
  const rawPort = String(port).trim();
  const withScheme = /^https?:\/\//i.test(rawHost) ? rawHost : `http://${rawHost}`;

  try {
    const url = new URL(withScheme);
    if (!url.port && rawPort) url.port = rawPort;
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return normalizeUrl(url.toString());
  } catch {
    return normalizeUrl(`http://${rawHost}:${rawPort}`);
  }
}
