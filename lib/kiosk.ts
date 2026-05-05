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

export type DiscountType = 'student' | 'senior';

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

export async function postAttendance(
  payload: AttendancePayload,
): Promise<AttendanceResponse> {
  return api.post<AttendanceResponse>('/api/kiosk/attendance', payload);
}

// Online-payment calls must round-trip through the same backend PayMongo's
// webhook can reach. If liveApiUrl is set, route there; otherwise fall back to
// the discovered LAN URL (e.g. when ngrok-tunneling a local backend in dev).
function paymentRequestOpts(): { baseUrl?: string } | undefined {
  return config.liveApiUrl ? { baseUrl: config.liveApiUrl } : undefined;
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
