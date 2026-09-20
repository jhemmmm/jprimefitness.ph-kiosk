package expo.modules.kiosklocktask

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

// Maintenance exit. Device-Owner lock task can't be stopped from adb (am task lock stop /
// force-stop are refused), so adb sends this broadcast instead:
//   adb shell am broadcast -a ph.jprimefitness.kiosk.UNLOCK -n ph.jprimefitness.kiosk/expo.modules.kiosklocktask.KioskUnlockReceiver
// The manifest gates it behind WRITE_SECURE_SETTINGS, which only shell/system hold.
class KioskUnlockReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val activity = KioskLockTaskModule.activityRef?.get() ?: return
    activity.runOnUiThread { activity.stopLockTask() }
  }
}
