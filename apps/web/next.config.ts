import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
  serverExternalPackages: ['pg'],
};

export default nextConfig;
