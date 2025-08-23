import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Experimental features
  experimental: {
    // Enable if you want to use the new app directory features
    // appDir: true,
  },
  
  // Webpack configuration for environment variables
  webpack: (config, { isServer }) => {
    // Add environment variable support
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        'process.env.NEXT_PUBLIC_API_BASE_URL': JSON.stringify(
          process.env.NEXT_PUBLIC_API_BASE_URL
        ),
        'process.env.NEXT_PUBLIC_ENVIRONMENT': JSON.stringify(
          process.env.NEXT_PUBLIC_ENVIRONMENT
        ),
      })
    );
    
    return config;
  },
};

export default nextConfig;
