import Constants from 'expo-constants';

type Extra = {
  kioskToken: string;
  mockApi: boolean;
  idleTimeoutMs: number;
  paymentTimeoutSec: number;
  resultDisplaySec: number;
};

const fallback: Extra = {
  kioskToken: 'dev-kiosk-token',
  mockApi: true,
  idleTimeoutMs: 60_000,
  paymentTimeoutSec: 60,
  resultDisplaySec: 8,
};

const raw = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const config: Extra = {
  kioskToken: raw.kioskToken ?? fallback.kioskToken,
  mockApi: raw.mockApi ?? fallback.mockApi,
  idleTimeoutMs: raw.idleTimeoutMs ?? fallback.idleTimeoutMs,
  paymentTimeoutSec: raw.paymentTimeoutSec ?? fallback.paymentTimeoutSec,
  resultDisplaySec: raw.resultDisplaySec ?? fallback.resultDisplaySec,
};
