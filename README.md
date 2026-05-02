# JPrime Fitness — Gym Kiosk (React Native / Expo)

A landscape-only Android tablet kiosk for the JPrime Fitness Gym entrance.

- **Walk-In** — collect name + PH phone, then pay over the counter or via GCash QR (60s timer).
- **Membership** — Time In / Time Out via member QR code scanned from the device camera.
- Every terminal screen posts a record to `POST /api/kiosk/attendance` on the gym's Laravel backend.

> The companion backend at `/home/user/jprimefitness.ph` does not yet expose `/api/kiosk/*` routes. The kiosk ships with `MOCK_API=true` so all flows work end-to-end against an in-process mock. Switch to the real backend by flipping the flag in [app.json](app.json) once endpoints are live.

## Stack

- Expo SDK 54 (React Native 0.81, React 19) + Expo Router 6
- `expo-camera` for QR scanning
- `expo-screen-orientation` to lock landscape
- `react-native-qrcode-svg` for the GCash payment QR placeholder
- `zod` for form validation
- TypeScript strict

## Getting started

```bash
npm install
npx expo start
```

Open in Expo Go on an Android tablet, or press `w` for the web preview (camera flow falls back to two simulate buttons on web).

### Scripts

- `npm start` — Expo dev server
- `npm run android` — launch on a connected Android device/emulator
- `npm run web` — web preview
- `npm run typecheck` — `tsc --noEmit`

## Configuration

All runtime configuration lives in [app.json](app.json) under `expo.extra`:

| key | default | purpose |
|---|---|---|
| `apiBaseUrl` | `http://localhost:8000` | Laravel base URL |
| `kioskToken` | `dev-kiosk-token` | sent as `X-Kiosk-Token` header |
| `mockApi` | `true` | when true, all API calls resolve in-process |
| `idleTimeoutMs` | `60000` | inactivity threshold before returning to Home |
| `paymentTimeoutSec` | `60` | GCash QR validity window |

Read at runtime in [lib/config.ts](lib/config.ts) via `expo-constants`.

## Project layout

```
app/                      # expo-router screens
├── _layout.tsx           # Stack, landscape lock, idle-reset shell
├── index.tsx             # Home (Walk-In / Membership)
├── walk-in/
│   ├── form.tsx          # name + phone (zod-validated)
│   ├── payment-method.tsx
│   ├── pay-online.tsx    # GCash QR + 60s countdown
│   └── success.tsx       # counter success
├── member/
│   ├── action.tsx        # Time In / Time Out
│   └── scan.tsx          # camera + QR scanner
└── result.tsx            # shared success / failed screen

components/               # BrandHeader, PrimaryCard, PrimaryButton, ScannerFrame, CountdownRing, icons
lib/                      # config, api, kiosk (single source of API contract), session (idle reset)
theme.ts                  # colors / spacing / typography tokens
```

## API contract (kiosk → Laravel)

**`POST /api/kiosk/attendance`** — fires on every terminal success/failed screen.

```jsonc
// Walk-in
{
  "type": "walk_in",
  "status": "success" | "failed",
  "name": "Juan Dela Cruz",
  "phone": "+639171234567",
  "payment_method": "counter" | "online",
  "payment_status": "pending" | "paid" | "timeout" | "cancelled",
  "payment_reference": "kio_2026_05_03_abc123",
  "occurred_at": "2026-05-03T14:22:10+08:00"
}

// Member
{
  "type": "member",
  "status": "success" | "failed",
  "action": "time_in" | "time_out",
  "qr_payload": "<raw QR string>",
  "reason": "unknown_qr" | "expired" | null,
  "occurred_at": "2026-05-03T14:22:10+08:00"
}
```

Expected response: `{ "ok": true, "attendance_id": 123, "member_name": "Jheamuel Panuelos" }` — the success screen renders `member_name` for the "Welcome back, …" line.

**`POST /api/kiosk/payments`** → `{ reference, qr_data_url, expires_at }` — kiosk requests a GCash payment intent.

**`GET /api/kiosk/payments/{reference}`** → `{ status: "pending" | "paid" | "expired" }` — polled every 2s.

All requests include `X-Kiosk-Token: <kioskToken>` so the backend can authenticate the device.

## Test the flows (with mocks)

- **Walk-In → Counter**: Walk-In → name `Juan Dela Cruz` + phone `09171234567` → Continue → Over the Counter → "PROCEED TO THE COUNTER" success.
- **Walk-In → Online**: same form → Pay Online → mock resolves to `paid` after ~5s → ACCESS GRANTED. Wait the full 60s → ACCESS DENIED with "Payment timed out".
- **Membership**: Membership → Time In → grant camera → scan a QR with payload `JPRIME:MEMBER:123` → "Welcome back, Jheamuel Panuelos". Any other QR → ACCESS DENIED.
- **Idle reset**: leave any inner screen untouched 60s → returns to Home.

On web, the scanner shows two buttons that simulate a known and an unknown QR.

## Build for Android (kiosk APK)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile production
```

For a true single-app kiosk, install the APK and enable Android lock-task mode (Device Owner) — outside the scope of this repo.
