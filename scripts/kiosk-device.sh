#!/usr/bin/env bash
# One-time tablet setup over adb (tested on Galaxy Tab A9+ / Android 16).
#   scripts/kiosk-device.sh debloat   # disable unneeded stock apps (reversible)
#   scripts/kiosk-device.sh restore   # re-enable them
#   scripts/kiosk-device.sh tune      # screen/battery/animation settings for a plugged-in kiosk
set -u
ADB=${ADB:-adb}
PKG=ph.jprimefitness.kiosk

# ponytail: disabled, not uninstalled — `restore` brings them back. Missing packages are skipped.
# Kept on purpose: Play Services, WebView, Samsung Keyboard (manual IP entry), Settings, stock launcher (fallback).
BLOAT=(
  # Google
  com.android.vending                 # Play Store — stops background auto-updates on the kiosk
  com.google.android.youtube com.google.android.gm com.google.android.apps.maps
  com.google.android.apps.messaging com.google.android.apps.tachyon com.google.android.apps.bard
  com.google.android.googlequicksearchbox com.google.android.apps.turbo com.google.android.tts
  com.google.ar.core com.google.android.gms.location.history com.google.android.apps.restore
  com.google.android.syncadapters.calendar com.google.android.feedback
  com.google.android.printservice.recommendation
  # Samsung account / store / updates
  com.osp.app.signin com.sec.android.app.samsungapps com.sec.spp.push com.samsung.android.scloud
  com.samsung.android.app.updatecenter com.wssyncmldm com.samsung.android.rubin.app
  com.samsung.android.app.omcagent com.mygalaxy.service com.sec.android.diagmonagent
  # Samsung apps
  com.sec.android.app.sbrowser com.sec.android.app.myfiles com.sec.android.app.popupcalculator
  com.sec.android.app.clockpackage com.sec.android.gallery3d com.sec.android.mimage.photoretouching
  com.samsung.android.calendar com.samsung.android.messaging com.samsung.android.app.contacts
  com.samsung.android.forest com.samsung.android.app.routines com.samsung.android.app.sharelive
  com.samsung.android.app.smartcapture com.samsung.android.app.taskedge com.samsung.android.app.clipboardedge
  com.samsung.android.app.dressroom com.samsung.android.app.parentalcare com.samsung.android.stickercenter
  com.samsung.android.mapsagent com.samsung.android.homemode com.samsung.android.aware.service
  com.samsung.android.callassistant com.samsung.android.smartcallprovider com.hiya.star
  com.samsung.android.intellivoiceservice com.samsung.android.visual.cloudcore com.samsung.storyservice
  com.samsung.android.sdk.handwriting com.samsung.app.newtrim com.samsung.knox.securefolder
  com.sec.android.easyMover com.sec.android.easyMover.Agent com.sec.android.app.soundalive
  com.sec.android.app.ve.vebgm com.sec.android.autodoodle.service com.sec.android.app.quicktool
  com.sec.android.app.chromecustomizations
  # Games / Bixby / AR / TV / Kids / Pay
  com.samsung.android.game.gos com.samsung.android.game.gametools
  com.samsung.android.bixby.agent com.samsung.android.bixby.wakeup com.samsung.android.bixbyvision.framework
  com.samsung.android.visionintelligence com.samsung.android.app.spage com.samsung.android.arzone
  com.samsung.android.aremoji com.samsung.android.tvplus com.samsung.android.kidsinstaller
  com.samsung.android.app.tips com.samsung.android.spay com.samsung.android.samsungpass
  # Accessories / cross-device
  com.samsung.android.app.watchmanagerstub com.samsung.accessory.budsunitemgr
  com.samsung.android.audiomirroring com.samsung.android.secondconnection com.samsung.android.mcfds
  com.samsung.SMT
)

case "${1:-}" in
  debloat)
    for p in "${BLOAT[@]}"; do
      $ADB shell pm disable-user --user 0 "$p" 2>/dev/null | grep -q 'disabled' && echo "disabled  $p"
    done ;;
  restore)
    for p in "${BLOAT[@]}"; do
      $ADB shell pm enable "$p" 2>/dev/null | grep -q 'enabled' && echo "enabled   $p"
    done ;;
  tune)
    $ADB shell "
      settings put global stay_on_while_plugged_in 7
      settings put system screen_off_timeout 2147483647
      settings put system screen_brightness_mode 0
      settings put system accelerometer_rotation 0
      settings put system user_rotation 1
      wm set-ignore-orientation-request false
      settings put global window_animation_scale 0.5
      settings put global transition_animation_scale 0.5
      settings put global animator_duration_scale 0.5
      settings put global adaptive_battery_management_enabled 0
      settings put global app_standby_enabled 0
      settings put global protect_battery 1
      settings put global heads_up_notifications_enabled 0
      settings put global wifi_sleep_policy 2
      cmd deviceidle whitelist +$PKG
    " && echo "tuned: screen always on while plugged, manual brightness, locked landscape, faster animations, Doze-exempt, charge capped at 85%" ;;
  *) sed -n 2,5p "$0"; exit 1 ;;
esac
