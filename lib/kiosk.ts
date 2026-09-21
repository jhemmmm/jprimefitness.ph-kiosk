import { api } from './api';
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

export async function postAttendance(
  payload: AttendancePayload,
): Promise<AttendanceResponse> {
  // An online walk-in consumes the kiosk_payments row, which only exists (as
  // "paid") on the live backend — the LAN node's synced copy lags or is missing.
  // Everything else (members, counter walk-ins) stays on the LAN node.
  const online = payload.type === 'walk_in' && payload.payment_method === 'online';
  return api.post<AttendanceResponse>('/api/kiosk/attendance', payload, online ? paymentRequestOpts() : undefined);
}

export async function createPayment(args: {
  name: string;
  phone: string;
  method?: 'online' | 'cash';
  discount_type?: DiscountType | null;
}): Promise<PaymentIntent> {
  return api.post<PaymentIntent>('/api/kiosk/payments', args, paymentRequestOpts());
}

export async function pollPayment(reference: string): Promise<PaymentStatus> {
  const r = await api.get<{ status: PaymentStatus }>(
    `/api/kiosk/payments/${encodeURIComponent(reference)}`,
    paymentRequestOpts(),
  );
  return r.status;
}
