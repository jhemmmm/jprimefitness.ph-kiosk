import { requireOptionalNativeModule } from 'expo';

type KioskLockTaskNative = {
  start(): boolean;
  stop(): boolean;
  isDeviceOwner(): boolean;
  isInLockTaskMode(): boolean;
};

const native = requireOptionalNativeModule<KioskLockTaskNative>('KioskLockTask');

export function start(): boolean {
  return native?.start() ?? false;
}

export function stop(): boolean {
  return native?.stop() ?? false;
}

export function isDeviceOwner(): boolean {
  return native?.isDeviceOwner() ?? false;
}

export function isInLockTaskMode(): boolean {
  return native?.isInLockTaskMode() ?? false;
}
