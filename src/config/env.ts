// Environment configuration
export const env = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  },
  
  // Chat API Configuration
  chat: {
    baseUrl: process.env.NEXT_PUBLIC_CHAT_API_BASE_URL || 'http://localhost:8001',
  },
  
  // User Configuration
  user: {
    id: process.env.NEXT_PUBLIC_USER_ID || 'f00dc8bd-eabc-4143-b1f0-fbcb9715a02e',
  },
  
  // Environment
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  
  // Feature flags
  features: {
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  
  // App configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Porta App',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  },
} as const;

// Debug logging
console.log('Environment configuration loaded:', {
  apiBaseUrl: env.api.baseUrl,
  userId: env.user.id,
  environment: env.environment,
  debugMode: env.features.debugMode
});

// Type-safe environment access
export type Env = typeof env;

// Validation function to ensure required environment variables are set
export const validateEnvironment = (): void => {
  const required = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_USER_ID',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Using defaults.`
    );
  }
};

// Get environment-specific configuration
export const getEnvironmentConfig = () => {
  const isDev = env.environment === 'development';
  const isProd = env.environment === 'production';
  
  return {
    isDev,
    isProd,
    apiUrl: env.api.baseUrl,
    userId: env.user.id,
    debugMode: isDev || env.features.debugMode,
  };
};
