import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  serverExternalPackages: ['pg'],
};

export default nextConfig;
