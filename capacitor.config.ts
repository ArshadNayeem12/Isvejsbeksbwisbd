import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.codeforge.studio',
  appName: 'FX Studio',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
