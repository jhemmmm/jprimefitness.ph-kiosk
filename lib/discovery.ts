import * as Network from 'expo-network';

const PORT = 8001;
const PROBE_PATH = '/api/kiosk/discover';
const SERVICE_NAME = 'jprimefitness-kiosk-api';
const PROBE_TIMEOUT_MS = 800;
const HARD_CEILING_MS = 10_000;
const CONCURRENCY = 32;
const HOT_OCTETS = [1, 2, 10, 100, 254];

type DiscoverResult = {
  url: string;
  serverId?: string;
};

type ProbeOk = {
  ok: true;
  url: string;
  serverId?: string;
};

type ProbeFail = { ok: false };

export async function probeUrl(
  url: string,
  timeoutMs = 1500,
  parentSignal?: AbortSignal,
): Promise<ProbeOk | ProbeFail> {
  if (parentSignal?.aborted) return { ok: false };
  const ctl = new AbortController();
  const onParentAbort = () => ctl.abort();
  parentSignal?.addEventListener('abort', onParentAbort);
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}${PROBE_PATH}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: ctl.signal,
    });
    if (!res.ok) return { ok: false };
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('json')) return { ok: false };
    const body = (await res.json()) as { service?: string; serverId?: string };
    if (body?.service !== SERVICE_NAME) return { ok: false };
    return { ok: true, url, serverId: body.serverId };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener('abort', onParentAbort);
  }
}

function buildCandidates(deviceIp: string, hintOctet?: number): string[] {
  const parts = deviceIp.split('.');
  if (parts.length !== 4) return [];
  const prefix = `${parts[0]}.${parts[1]}.${parts[2]}.`;
  const ownOctet = Number(parts[3]);
  const hot = new Set<number>();
  if (hintOctet != null && hintOctet !== ownOctet) hot.add(hintOctet);
  for (const o of HOT_OCTETS) if (o !== ownOctet) hot.add(o);
  const ordered = Array.from(hot, (o) => prefix + o);
  for (let o = 1; o <= 254; o++) {
    if (o === ownOctet || hot.has(o)) continue;
    ordered.push(prefix + o);
  }
  return ordered;
}

export async function discoverBackend(
  log: (msg: string) => void = () => {},
  hintUrl?: string,
): Promise<DiscoverResult | null> {
  let deviceIp: string;
  try {
    deviceIp = await Network.getIpAddressAsync();
  } catch (e) {
    log(`getIpAddressAsync failed: ${String(e)}`);
    return null;
  }
  log(`device ip ${deviceIp}`);
  const hintOctet = parseHintOctet(hintUrl, deviceIp);
  const candidates = buildCandidates(deviceIp, hintOctet);
  if (!candidates.length) {
    log('no candidates');
    return null;
  }

  const ceiling = new AbortController();
  const ceilingTimer = setTimeout(() => ceiling.abort(), HARD_CEILING_MS);

  let found: DiscoverResult | null = null;
  let cursor = 0;

  async function worker() {
    while (!found && !ceiling.signal.aborted) {
      const idx = cursor++;
      if (idx >= candidates.length) return;
      const ip = candidates[idx];
      const r = await probeUrl(
        `http://${ip}:${PORT}`,
        PROBE_TIMEOUT_MS,
        ceiling.signal,
      );
      if (r.ok && !found) {
        found = { url: r.url, serverId: r.serverId };
        ceiling.abort();
        log(`found ${r.url}`);
        return;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, candidates.length) },
    () => worker(),
  );
  await Promise.all(workers);
  clearTimeout(ceilingTimer);
  return found;
}

function parseHintOctet(
  url: string | undefined,
  deviceIp: string,
): number | undefined {
  if (!url) return undefined;
  const m = url.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
  if (!m) return undefined;
  const dParts = deviceIp.split('.');
  if (m[1] !== dParts[0] || m[2] !== dParts[1] || m[3] !== dParts[2]) {
    return undefined;
  }
  const o = Number(m[4]);
  if (o < 1 || o > 254) return undefined;
  return o;
}
