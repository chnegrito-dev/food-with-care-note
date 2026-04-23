import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodwithcare.app',
  appName: 'Food With Care',
  webDir: '.next',
  server: {
    url: 'https://food-care-clean.vercel.app',
    cleartext: false,
  },
};

export default config;
