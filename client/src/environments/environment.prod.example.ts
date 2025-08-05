export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  googleClientId: 'YOUR_PRODUCTION_GOOGLE_CLIENT_ID_HERE', // Google Cloud Console'dan alınacak
  
  // API Configuration
  apiConfig: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  // Feature flags
  features: {
    enableGoogleAuth: true,
    enableQRCode: true,
    enableAnalytics: true,
    enableFolders: true
  },

  // Theme Configuration
  theme: {
    primaryColor: '#ff6b35',
    secondaryColor: '#ffa726'
  },

  // App Configuration
  appConfig: {
    appName: 'URL Shortener',
    version: '1.0.0'
  }
};
