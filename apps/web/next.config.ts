import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
  serverExternalPackages: ['pg'],
};

export default nextConfig;
