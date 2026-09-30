import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiError } from './api';
import { config } from './config';

export type AttendanceResponse = {
  ok: boolean;
  attendance_id?: number;
  member_name?: string;
  message?: string;
};

export type WalkInPayload = {
  type: 'walk_in';
  status: 'success' | 'failed';
  name: string;
  phone: string;
  payment_method: 'counter' | 'online';
  payment_status: 'pending' | 'paid' | 'timeout' | 'cancelled';
  payment_reference: string | null;
  discount_type?: DiscountType | null;
  // Only set on an offline replay; live posts are stamped by the server.
  occurred_at?: string;
};

export type MemberPayload = {
  type: 'member';
  action: 'time_in' | 'time_out';
  qr_payload: string;
};

export type AttendancePayload = WalkInPayload | MemberPayload;

export type DiscountType = 'student' | 'senior' | 'pwd';

export const DISCOUNT_LABELS: Record<DiscountType, string> = { student: 'Student', senior: 'Senior citizen', pwd: 'PWD' };

// Route params arrive as strings; keep only the discounts the backend accepts.
export function parseDiscount(value: unknown): DiscountType | null {
  return typeof value === 'string' && value in DISCOUNT_LABELS ? (value as DiscountType) : null;
}

export type PaymentIntent = {
  reference: string;
  qr_data_url: string | null;
  qr_image_url: string | null;
  amount: number;
  base_amount?: number;
  discount_type?: DiscountType | null;
  discount_percent?: number;
  expires_at: string;
};

export type PaymentStatus = 'pending' | 'paid' | 'expired';

// Online-payment calls must round-trip through the same backend PayMongo's
// webhook can reach. If liveApiUrl is set, route there; otherwise fall back to
// the discovered LAN URL (e.g. when ngrok-tunneling a local backend in dev).
function paymentRequestOpts(): { baseUrl?: string } | undefined {
  return config.liveApiUrl ? { baseUrl: config.liveApiUrl } : undefined;
}

function sendAttendance(payload: AttendancePayload): Promise<AttendanceResponse> {
  // An online walk-in consumes the kiosk_payments row, which only exists (as
  // "paid") on the live backend — the LAN node's synced copy lags or is missing.
  // Everything else (members, counter walk-ins) stays on the LAN node.
  const online = payload.type === 'walk_in' && payload.payment_method === 'online';
  return api.post<AttendanceResponse>('/api/kiosk/attendance', payload, online ? paymentRequestOpts() : undefined);
}

// Offline outbox: a successful walk-in the server can't be reached for is saved
// on the device and replayed (with its original occurred_at) once a later post
// gets through. Member scans stay online-only — offline they're sent to the desk.
// ponytail: one AsyncStorage key per record (Android: SQLite-backed, 6MB default ≈ 20k walk-ins).
// ponytail: a replay whose response is lost is re-sent → duplicate walk-in; add a client uuid if that shows up.
const OUTBOX_PREFIX = '@jprime/outbox/';

export async function postAttendance(payload: AttendancePayload): Promise<AttendanceResponse> {
  try {
    const r = await sendAttendance(payload);
    void flushOutbox();
    return r;
  } catch (e) {
    // ApiError = the server answered and said no; only a transport failure means "offline".
    if (e instanceof ApiError || payload.type !== 'walk_in' || payload.status !== 'success') throw e;
    const record: WalkInPayload = { ...payload, occurred_at: new Date().toISOString() };
    await AsyncStorage.setItem(`${OUTBOX_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, JSON.stringify(record));
    return { ok: true, message: 'Saved offline.' };
  }
}

let flushing = false;

export async function flushOutbox(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    // Keys start with Date.now(), so a string sort replays them in order.
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(OUTBOX_PREFIX)).sort();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        try {
          await sendAttendance(JSON.parse(raw) as WalkInPayload);
        } catch (e) {
          // 422 = rejected for good (e.g. payment reference already used): drop it.
          // Anything else (offline, 401, 5xx): keep it and the rest for next time.
          if (!(e instanceof ApiError && e.status === 422)) return;
        }
      }
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // storage error: try again on the next flush
  } finally {
    flushing = false;
  }
}

export async function createPayment(args: {
  name: string;
  phone: string;
  method?: 'online' | 'cash';
  discount_type?: DiscountType | null;
}): Promise<PaymentIntent> {
  // Only an online intent needs the public host (PayMongo webhook + polling).
  // A cash intent is just amount + reference, so keep it on the LAN node —
  // same backend the counter attendance row goes to, and no internet round-trip.
  const opts = args.method === 'online' ? paymentRequestOpts() : undefined;
  return api.post<PaymentIntent>('/api/kiosk/payments', args, opts);
}

export async function pollPayment(reference: string): Promise<PaymentStatus> {
  const r = await api.get<{ status: PaymentStatus }>(
    `/api/kiosk/payments/${encodeURIComponent(reference)}`,
    paymentRequestOpts(),
  );
  return r.status;
}
