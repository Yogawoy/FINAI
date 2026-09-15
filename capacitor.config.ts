import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finai.app',
  appName: 'FINAI',
  webDir: 'public',
  server: {
    // Menghubungkan APK langsung ke server Next.js di laptop
    url: 'http://192.168.100.12:3000/app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    appendUserAgent: 'FinAI-Android-App',
  },
};

export default config;
