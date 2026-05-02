import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl: string;
  kioskToken: string;
  mockApi: boolean;
  idleTimeoutMs: number;
  paymentTimeoutSec: number;
};

const fallback: Extra = {
  apiBaseUrl: 'http://localhost:8000',
  kioskToken: 'dev-kiosk-token',
  mockApi: true,
  idleTimeoutMs: 60_000,
  paymentTimeoutSec: 60,
};

const raw = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const config: Extra = {
  apiBaseUrl: raw.apiBaseUrl ?? fallback.apiBaseUrl,
  kioskToken: raw.kioskToken ?? fallback.kioskToken,
  mockApi: raw.mockApi ?? fallback.mockApi,
  idleTimeoutMs: raw.idleTimeoutMs ?? fallback.idleTimeoutMs,
  paymentTimeoutSec: raw.paymentTimeoutSec ?? fallback.paymentTimeoutSec,
};
