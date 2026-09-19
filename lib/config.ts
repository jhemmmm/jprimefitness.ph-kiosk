// All runtime settings come from .env (EXPO_PUBLIC_*, inlined by Expo at build
// time — EAS builds must set them as environment variables). Blank = default below.
type Config = {
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

function number(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) ? parsed : fallback;
}

export const config: Config = {
  kioskToken: process.env.EXPO_PUBLIC_KIOSK_TOKEN || 'dev-kiosk-token',
  idleTimeoutMs: number(process.env.EXPO_PUBLIC_IDLE_TIMEOUT_MS, 60_000),
  paymentTimeoutSec: number(process.env.EXPO_PUBLIC_PAYMENT_TIMEOUT_SEC, 120),
  resultDisplaySec: number(process.env.EXPO_PUBLIC_RESULT_DISPLAY_SEC, 8),
  liveApiUrl: (process.env.EXPO_PUBLIC_LIVE_API_URL || '').replace(/\/+$/, ''),
};
