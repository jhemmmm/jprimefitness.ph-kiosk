package expo.modules.kiosklocktask

import android.app.Activity
import android.app.ActivityManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.lang.ref.WeakReference

class KioskLockTaskModule : Module() {
  companion object {
    // Last activity that entered lock task; used by KioskUnlockReceiver.
    var activityRef: WeakReference<Activity>? = null
  }

  override fun definition() = ModuleDefinition {
    Name("KioskLockTask")

    Function("start") {
      val activity = appContext.currentActivity ?: return@Function false
      val dpm = activity.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
      val admin = ComponentName(activity, KioskAdminReceiver::class.java)
      if (dpm.isDeviceOwnerApp(activity.packageName)) {
        dpm.setLockTaskPackages(admin, arrayOf(activity.packageName))
      }
      activityRef = WeakReference(activity)
      activity.runOnUiThread { activity.startLockTask() }
      true
    }

    Function("stop") {
      val activity = appContext.currentActivity ?: return@Function false
      activity.runOnUiThread { activity.stopLockTask() }
      true
    }

    Function("isDeviceOwner") {
      val activity = appContext.currentActivity ?: return@Function false
      val dpm = activity.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
      dpm.isDeviceOwnerApp(activity.packageName)
    }

    Function("isInLockTaskMode") {
      val activity = appContext.currentActivity ?: return@Function false
      val am = activity.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        am.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE
      } else {
        @Suppress("DEPRECATION")
        am.isInLockTaskMode
      }
    }
  }
}
