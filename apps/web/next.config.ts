import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
  serverExternalPackages: ['pg'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ]
  },
};

if (process.env.BUGSINK_SOURCEMAPS === "true") {
  nextConfig = withSentryConfig(nextConfig, {
    org: "bugsinkhasnoorgs",
    project: "ignoredfornow",
    sentryUrl: process.env.BUGSINK_URL,
    authToken: process.env.BUGSINK_AUTH_TOKEN,
    silent: process.env.BUGSINK_SOURCEMAPS_SILENT === "true",
    reactComponentAnnotation: {
      enabled: true,
    },
    tunnelRoute: "/error-monitor", //doesn't work; ublock origin lite still blocks bugsink
  });
}

export default nextConfig;
