const { withAndroidManifest } = require('@expo/config-plugins');

// Adds HOME/DEFAULT to MainActivity's launcher intent filter so the app can be
// set as the device home (kiosk launcher). As Device Owner + home app, Android
// auto-starts it at boot — no BOOT_COMPLETED receiver needed.
module.exports = function withAndroidHome(config) {
  return withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application?.[0];
    const main = application?.activity?.find((a) => a.$['android:name'] === '.MainActivity');
    const launcher = main?.['intent-filter']?.find((f) =>
      f.category?.some((c) => c.$['android:name'] === 'android.intent.category.LAUNCHER'),
    );
    if (launcher) {
      for (const name of ['android.intent.category.HOME', 'android.intent.category.DEFAULT']) {
        if (!launcher.category.some((c) => c.$['android:name'] === name)) {
          launcher.category.push({ $: { 'android:name': name } });
        }
      }
    }
    return modConfig;
  });
};
