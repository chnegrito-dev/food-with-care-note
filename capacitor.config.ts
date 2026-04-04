import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fmdesign.foodwithcare",
  appName: "Food With Care",

  // 🔥 IMPORTANTE:
  // Como quitamos "output: export" en Next,
  // NO debes usar "out"
  webDir: ".next",

  server: {
    androidScheme: "https",
    cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;