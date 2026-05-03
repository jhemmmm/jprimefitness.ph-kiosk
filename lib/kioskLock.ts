import { Platform } from 'react-native';
import * as KioskLockTask from '../modules/kiosk-lock-task';

export async function startLockTask(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    return KioskLockTask.start();
  } catch {
    return false;
  }
}

export async function stopLockTask(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    return KioskLockTask.stop();
  } catch {
    return false;
  }
}

export function isDeviceOwner(): boolean {
  if (Platform.OS !== 'android') return false;
  try {
    return KioskLockTask.isDeviceOwner();
  } catch {
    return false;
  }
}

export function isInLockTaskMode(): boolean {
  if (Platform.OS !== 'android') return false;
  try {
    return KioskLockTask.isInLockTaskMode();
  } catch {
    return false;
  }
}
