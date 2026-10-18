/* eslint-env node */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  
  // Use a custom build directory to avoid permission issues with .next
  distDir: '.next-build',

  // Turbopack is opt-in for development via `npm run dev:turbo`.
  // Production stays on Next.js 14's standard Webpack build via `next build`.

  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }

    const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:8001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: '/metrics-api/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
  
  // Image optimization
  // Per Section 8.14: no wildcarded image remote patterns
  // Add specific domains here if external images are needed
  images: {
    remotePatterns: [],
  },

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/dashboard',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },

  // Experimental features
  experimental: {
    scrollRestoration: true,
  },

  // Output configuration
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
