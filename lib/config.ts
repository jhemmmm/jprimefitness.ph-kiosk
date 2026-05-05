import Constants from 'expo-constants';

type Extra = {
  kioskToken: string;
  idleTimeoutMs: number;
  paymentTimeoutSec: number;
  resultDisplaySec: number;
  // Public base URL of the production backend. Online-payment calls go here so
  // PayMongo's webhook (which can only reach a public host) and the kiosk's
  // status polling hit the same database. Empty string = fall back to the
  // discovered LAN URL (useful for ngrok-on-local dev).
  liveApiUrl: string;
};

const fallback: Extra = {
  kioskToken: 'dev-kiosk-token',
  idleTimeoutMs: 60_000,
  paymentTimeoutSec: 120,
  resultDisplaySec: 8,
  liveApiUrl: '',
};

const raw = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const config: Extra = {
  kioskToken: raw.kioskToken ?? fallback.kioskToken,
  idleTimeoutMs: raw.idleTimeoutMs ?? fallback.idleTimeoutMs,
  paymentTimeoutSec: raw.paymentTimeoutSec ?? fallback.paymentTimeoutSec,
  resultDisplaySec: raw.resultDisplaySec ?? fallback.resultDisplaySec,
  liveApiUrl: (raw.liveApiUrl ?? fallback.liveApiUrl).replace(/\/+$/, ''),
};
