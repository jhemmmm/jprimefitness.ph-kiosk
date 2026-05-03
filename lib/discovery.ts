import * as Network from "expo-network";

const PORT = 8000;
const PROBE_PATH = "/api/kiosk/discover";
const SERVICE_NAME = "jprimefitness-kiosk-api";
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

async function probe(ip: string, signal: AbortSignal): Promise<ProbeOk | ProbeFail> {
  const url = `http://${ip}:${PORT}`;
  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  signal.addEventListener("abort", onAbort);
  const timer = setTimeout(() => ctl.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}${PROBE_PATH}`, {
      method: "GET",
      signal: ctl.signal,
    });
    if (!res.ok) return { ok: false };
    const body = (await res.json()) as { service?: string; serverId?: string };
    if (body?.service !== SERVICE_NAME) return { ok: false };
    return { ok: true, url, serverId: body.serverId };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

function buildCandidates(deviceIp: string): string[] {
  const parts = deviceIp.split(".");
  if (parts.length !== 4) return [];
  const prefix = `${parts[0]}.${parts[1]}.${parts[2]}.`;
  const ownOctet = Number(parts[3]);
  const all = new Set<number>();
  for (const o of HOT_OCTETS) all.add(o);
  for (let o = 1; o <= 254; o++) all.add(o);
  all.delete(ownOctet);
  const ordered: string[] = [];
  for (const o of HOT_OCTETS) {
    if (all.has(o)) {
      ordered.push(prefix + o);
      all.delete(o);
    }
  }
  for (const o of all) ordered.push(prefix + o);
  return ordered;
}

export async function discoverBackend(log: (msg: string) => void = () => {}): Promise<DiscoverResult | null> {
  let deviceIp: string;
  try {
    deviceIp = await Network.getIpAddressAsync();
  } catch (e) {
    log(`getIpAddressAsync failed: ${String(e)}`);
    return null;
  }
  log(`device ip ${deviceIp}`);
  const candidates = buildCandidates(deviceIp);
  if (!candidates.length) {
    log("no candidates");
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
      log(`probe ${ip}`);
      const r = await probe(ip, ceiling.signal);
      if (r.ok && !found) {
        found = { url: r.url, serverId: r.serverId };
        ceiling.abort();
        log(`found ${r.url}`);
        return;
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, candidates.length) }, () => worker());
  await Promise.all(workers);
  clearTimeout(ceilingTimer);
  return found;
}

export async function probeUrl(url: string, timeoutMs = 1500): Promise<ProbeOk | ProbeFail> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}${PROBE_PATH}`, {
      method: "GET",
      signal: ctl.signal,
    });
    if (!res.ok) return { ok: false };
    const body = (await res.json()) as { service?: string; serverId?: string };
    if (body?.service !== SERVICE_NAME) return { ok: false };
    return { ok: true, url, serverId: body.serverId };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}
