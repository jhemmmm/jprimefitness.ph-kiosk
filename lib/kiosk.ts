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
  occurred_at: string;
};

export type MemberPayload = {
  type: 'member';
  status: 'success' | 'failed';
  action: 'time_in' | 'time_out';
  qr_payload: string;
  reason: 'unknown_qr' | 'expired' | null;
  occurred_at: string;
};

export type AttendancePayload = WalkInPayload | MemberPayload;

export type PaymentIntent = {
  reference: string;
  qr_data_url: string;
  expires_at: string;
};

export type PaymentStatus = 'pending' | 'paid' | 'expired';

export async function postAttendance(
  payload: AttendancePayload,
): Promise<AttendanceResponse> {
  if (config.mockApi) return mockAttendance(payload);
  return api.post<AttendanceResponse>('/api/kiosk/attendance', payload);
}

export async function createPayment(args: {
  name: string;
  phone: string;
  amount: number;
}): Promise<PaymentIntent> {
  if (config.mockApi) return mockCreatePayment();
  return api.post<PaymentIntent>('/api/kiosk/payments', args);
}

export async function pollPayment(reference: string): Promise<PaymentStatus> {
  if (config.mockApi) return mockPollPayment(reference);
  const r = await api.get<{ status: PaymentStatus }>(
    `/api/kiosk/payments/${encodeURIComponent(reference)}`,
  );
  return r.status;
}

// ---------------- mocks ----------------

function mockAttendance(p: AttendancePayload): Promise<AttendanceResponse> {
  return delay(200).then(() => {
    if (p.type === 'member') {
      const known = /JPRIME:MEMBER:(\w+)/.exec(p.qr_payload);
      if (p.status === 'success' && known) {
        return {
          ok: true,
          attendance_id: Math.floor(Math.random() * 100000),
          member_name: 'Jheamuel Panuelos',
        };
      }
      return { ok: false, message: 'Unknown QR code' };
    }
    return {
      ok: p.status === 'success',
      attendance_id: Math.floor(Math.random() * 100000),
    };
  });
}

const mockPaymentStarts = new Map<string, number>();

function mockCreatePayment(): Promise<PaymentIntent> {
  const reference = `kio_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  mockPaymentStarts.set(reference, Date.now());
  return delay(150).then(() => ({
    reference,
    qr_data_url: 'gcash://demo/' + reference,
    expires_at: new Date(Date.now() + config.paymentTimeoutSec * 1000).toISOString(),
  }));
}

function mockPollPayment(reference: string): Promise<PaymentStatus> {
  const startedAt = mockPaymentStarts.get(reference);
  return delay(120).then(() => {
    if (!startedAt) return 'expired';
    const elapsed = Date.now() - startedAt;
    if (elapsed > config.paymentTimeoutSec * 1000) return 'expired';
    if (elapsed > 5_000) return 'paid';
    return 'pending';
  });
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
