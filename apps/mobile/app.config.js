module.exports = {
  expo: {
    name: 'Thrive',
    slug: 'thrive',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.thrive.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#ffffff',
      },
      package: 'com.thrive.app',
    },
    scheme: 'thrive',
    plugins: ['expo-router', 'expo-secure-store'],
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: 'https://cgiwigkiomaufahlwnvj.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaXdpZ2tpb21hdWZhaGx3bnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODk2OTYsImV4cCI6MjA4MDg2NTY5Nn0.Dk-tbG8v5dgNEr7GXc22_9wkkVXCCw-5ruttFIxGgQc',
    },
  },
};
