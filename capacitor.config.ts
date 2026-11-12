import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.correria.app',
  appName: 'Correria',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_correria',
      iconColor: '#FF6B00',
    },
  },
};

export default config;
