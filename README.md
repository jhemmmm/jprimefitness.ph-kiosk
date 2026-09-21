# JPrime Fitness — Gym Kiosk (React Native / Expo)

A landscape-only Android tablet kiosk for the JPrime Fitness Gym entrance.

- **Walk-In** — collect name + PH phone, then pay over the counter or via GCash QR (120s timer).
- **Membership** — Time In / Time Out via member QR code scanned from the device camera.
- Every terminal screen posts a record to `POST /api/kiosk/attendance` on the gym's Laravel backend.
- Backend host is **auto-discovered** on the same Wi-Fi at boot. No hardcoded IP.

> Discovery scans the local `/24` for `GET /api/kiosk/discover` returning `{ "service": "jprimefitness-kiosk-api", ... }`. Result cached in AsyncStorage. Manual IP entry shown if discovery fails.

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

Runtime settings come from `.env` (Expo inlines `EXPO_PUBLIC_*` at build time; copy [.env.example](.env.example)). EAS builds don't see `.env`, so push it to the EAS environment first — a build without these gets `dev-kiosk-token` and every QR scan fails with `401 Invalid kiosk token`:

```bash
eas env:push --environment production --path .env
```

| key | default | purpose |
|---|---|---|
| `EXPO_PUBLIC_KIOSK_TOKEN` | `dev-kiosk-token` | sent as `X-Kiosk-Token`; must match `KIOSK_TOKEN` in the backend `.env` |
| `EXPO_PUBLIC_IDLE_TIMEOUT_MS` | `60000` | inactivity threshold before returning to Home |
| `EXPO_PUBLIC_PAYMENT_TIMEOUT_SEC` | `120` | online-payment QR validity window |
| `EXPO_PUBLIC_RESULT_DISPLAY_SEC` | `8` | result screen auto-redirect countdown |
| `EXPO_PUBLIC_LIVE_API_URL` | *(blank)* | public backend URL for online payments and the attendance POST of an online walk-in (the paid `kiosk_payments` row lives there); blank = discovered LAN URL |

Read at build time in [lib/config.ts](lib/config.ts).

**Backend URL is NOT in config.** It is discovered at boot by [lib/discovery.ts](lib/discovery.ts) (subnet `/24` HTTP probe at port 8001), cached in AsyncStorage by [lib/backend.ts](lib/backend.ts), and gated by [lib/BackendProvider.tsx](lib/BackendProvider.tsx). Discovery probe targets `GET /api/kiosk/discover`, which must return `{ "service": "jprimefitness-kiosk-api", "version": "1", "serverId": "<uuid>" }`. Manual IP entry screen appears if discovery fails.

## Project layout

```
app/                      # expo-router screens
├── _layout.tsx           # Stack, landscape lock, kiosk lockdown, BackendProvider gate
├── index.tsx             # Home (Walk-In / Membership)
├── walk-in/
│   ├── form.tsx          # name + phone (zod-validated)
│   ├── payment-method.tsx
│   ├── pay-online.tsx    # GCash QR + 120s countdown
│   └── success.tsx       # counter success
├── member/
│   ├── action.tsx        # Time In / Time Out
│   └── scan.tsx          # camera + QR scanner
└── result.tsx            # shared success / failed screen

components/               # BrandHeader, PrimaryCard, PrimaryButton, ScannerFrame, CountdownRing, icons
lib/
├── config.ts             # runtime settings from .env
├── api.ts                # fetch wrapper + token header
├── kiosk.ts              # API contract types + calls
├── session.ts            # idle reset + goHome
├── discovery.ts          # LAN /24 subnet scan
├── backend.ts            # runtime URL holder + AsyncStorage cache
├── BackendProvider.tsx   # boot gate: scanning / ready / needs-manual
└── kioskLock.ts          # Android Lock Task wrapper
modules/kiosk-lock-task/  # local Expo module: DeviceAdmin + startLockTask
theme.ts                  # colors / spacing / typography tokens
```

## API contract (kiosk → Laravel)

Server stamps `occurred_at` itself. Kiosk does not send timestamps.

**`GET /api/kiosk/discover`** — unauthenticated, used by LAN auto-discovery.

```jsonc
{ "service": "jprimefitness-kiosk-api", "version": "1", "serverId": "<uuid>" }
```

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
  "payment_reference": "kio_2026_05_03_abc123"
}

// Member — backend validates qr_payload and returns ok=true/false
{
  "type": "member",
  "action": "time_in" | "time_out",
  "qr_payload": "JPRIME:<encrypted_data>"
}
```

Response: `{ "ok": true, "attendance_id": 123, "member_name": "Jheamuel Panuelos" }`.
Failure: `{ "ok": false, "message": "Unknown QR code" }`. Result screen branches on `ok`.

**`POST /api/kiosk/payments`** → `{ reference, qr_data_url, expires_at }` — kiosk requests a GCash payment intent.

**`GET /api/kiosk/payments/{reference}`** → `{ status: "pending" | "paid" | "expired" }` — polled every 2s.

All requests except `/discover` include `X-Kiosk-Token: <kioskToken>`.

## Test the flows

- **Walk-In → Counter**: name `Juan Dela Cruz` + phone `09171234567` → Continue → Over the Counter → "PROCEED TO THE COUNTER" success.
- **Walk-In → Online**: same form → Pay Online → pay the QR → ACCESS GRANTED. Let the 120s timer run out → ACCESS DENIED.
- **Membership**: Membership → Time In → grant camera → scan a QR with payload `JPRIME:<anything>` → "Welcome back, …". Any other QR → ACCESS DENIED.
- **Idle reset**: leave any inner screen untouched 60s → returns to Home.
- **Result screen auto-redirect**: result/success screens count down `resultDisplaySec` then return to Home.

On web, the scanner shows two buttons that simulate a known and an unknown QR.

## Build for Android (kiosk APK)

```bash
npm install -g eas-cli
eas login
eas env:push --environment production --path .env   # re-run whenever .env changes
eas build -p android --profile production
```

Download the APK from the build page and `adb install -r` it. The tablet is locked to the EAS keystore once a Device-Owner build is installed — local Gradle builds (debug keystore) can't replace it.

### Lock-task / kiosk mode

Local Expo module [modules/kiosk-lock-task](modules/kiosk-lock-task) provides `startLockTask()` via a `DeviceAdminReceiver`. Full home/recents/notification-shade block requires Android **Device Owner** mode, which can only be granted on a freshly provisioned device (no Google account, no other Device Admin apps).

#### Full kiosk lockdown — ADB step-by-step

Tested on Android 11+. Older versions may need different `dpm` syntax.

##### Pre-reqs

- Windows / macOS / Linux machine with [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools) (`adb` on PATH).
- USB cable.
- Target Android tablet/phone you control end-to-end. **Not the user's personal device.**

##### 1. Factory reset the device

- Settings → System → Reset → Erase all data (factory reset). OR boot to recovery and wipe.
- During first-boot setup wizard:
  - **Skip Wi-Fi / Google account.** If asked, tap "Set up offline" / "Skip".
  - Skip fingerprint/PIN prompts where possible (or set a known PIN; you'll need it to disable lock screen later).
  - Decline all Google services prompts.
- Reach the home screen with **zero Google accounts** and **no other Device Admin apps** installed. If a Google account exists, `set-device-owner` will fail with `java.lang.IllegalStateException: Not allowed to set the device owner because there are already several users on the device`.

##### 2. Enable USB debugging

- Settings → About phone → tap "Build number" 7× to unlock Developer options.
- Settings → System → Developer options → enable **USB debugging**.
- Plug device into computer. Accept the RSA fingerprint dialog. Confirm:

  ```bash
  adb devices
  ```

  Should list your device with status `device` (not `unauthorized`).

##### 3. Build + install the kiosk APK

```bash
npx expo prebuild --clean
npx expo run:android
```

Or sideload a release APK:

```bash
adb install -r app-release.apk
```

Confirm installed:

```bash
adb shell pm list packages | findstr jprimefitness
# → package:ph.jprimefitness.kiosk
```

##### 4. Set the app as Device Owner

```bash
adb shell dpm set-device-owner ph.jprimefitness.kiosk/expo.modules.kiosklocktask.KioskAdminReceiver
```

Expected output:

```text
Success: Device owner set to package ComponentInfo{ph.jprimefitness.kiosk/expo.modules.kiosklocktask.KioskAdminReceiver}
Active admin set to component {ph.jprimefitness.kiosk/expo.modules.kiosklocktask.KioskAdminReceiver}
```

If you see `Not allowed to set the device owner because there are already several users on the device` → there's a residual Google account. Re-do factory reset and skip account setup.

##### 5. Reboot + verify

```bash
adb reboot
```

After boot, launch the kiosk app (it should be the only icon, or set as launcher — see step 6). On mount, [app/_layout.tsx](app/_layout.tsx) calls `startLockTask()` → home, recents, notification shade, and status-bar pull are all blocked.

Verify Device Owner:

```bash
adb shell dpm list-owners
# → Device Owner: ph.jprimefitness.kiosk/...
```

##### 6. Set kiosk as the home app (also auto-starts on boot)

`MainActivity` claims `CATEGORY_HOME` via [plugins/with-android-home.js](plugins/with-android-home.js). Make it the default:

```bash
adb shell cmd package set-home-activity ph.jprimefitness.kiosk/.MainActivity
```

Home button → kiosk, and Android launches the home app on boot, so no boot receiver is needed. Verify with `adb reboot`.

##### 7. (Optional) Disable lock screen

```bash
adb shell locksettings set-disabled true
```

Or via Settings → Security → Screen lock → None (only available because Device Owner unlocks the option). Required for auto-start to land in the app instead of on a PIN screen.

##### 8. (Optional) Debloat + tune

[scripts/kiosk-device.sh](scripts/kiosk-device.sh) — `debloat` disables ~80 stock apps (YouTube, Bixby, Galaxy Store, Play Store, Samsung account, FOTA updater…); `tune` sets screen-always-on while plugged, manual brightness, locked landscape, faster animations, Doze exemption and Samsung's 85% charge cap. Both are reversible (`restore`, or `pm enable <pkg>`).

```bash
scripts/kiosk-device.sh debloat
scripts/kiosk-device.sh tune
```

> Samsung tablets ship with `ignoreOrientationRequest=true`, which makes Android ignore the app's landscape lock (app renders portrait and letterboxed). `tune` turns it off with `wm set-ignore-orientation-request false` and pins system rotation to landscape (`user_rotation 1`; use `3` if the mount is the other way round).

#### Temporarily exit kiosk mode (maintenance)

Device-Owner lock task can't be broken from adb (`am task lock stop` and `force-stop` are refused), so the app exposes an unlock broadcast, gated to a shell-only permission ([KioskUnlockReceiver.kt](modules/kiosk-lock-task/android/src/main/java/expo/modules/kiosklocktask/KioskUnlockReceiver.kt)):

```bash
# unlock: leave lock task, hand Home back to the stock launcher
adb shell am broadcast -a ph.jprimefitness.kiosk.UNLOCK -n ph.jprimefitness.kiosk/expo.modules.kiosklocktask.KioskUnlockReceiver
adb shell cmd package set-home-activity com.sec.android.app.launcher/.activities.LauncherActivity

# ...do your thing (Settings, Wi-Fi, install APK, etc.)...

# relock: kiosk is Home again, restart it so startLockTask() runs on mount
adb shell cmd package set-home-activity ph.jprimefitness.kiosk/.MainActivity
adb shell am force-stop ph.jprimefitness.kiosk
adb shell am start -n ph.jprimefitness.kiosk/.MainActivity
```

#### Removing kiosk mode

Device Owner cannot be removed by the user via Settings (by design). To clear:

```bash
adb shell dpm remove-active-admin ph.jprimefitness.kiosk/expo.modules.kiosklocktask.KioskAdminReceiver
```

If that fails (it usually does once Device Owner is set), the only path is another **factory reset**.

#### Fallback: no factory reset available

Without Device Owner, [app/_layout.tsx](app/_layout.tsx) still does:

- Hide nav bar (immersive sticky) via `expo-navigation-bar`.
- Block hardware back via `BackHandler`.
- Keep screen awake via `expo-keep-awake`.
- Lock landscape via `expo-screen-orientation`.

Home and recents stay reachable. Use **Settings → Security → App pinning** (long-press recents → pin) for a manual lockdown that survives until the user holds back+recents+PIN.
