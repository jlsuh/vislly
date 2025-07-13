import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/vislly',
  distDir: '/out/vislly',
  images: {
    unoptimized: true,
  },
  output: 'export',
  reactProductionProfiling: true,
  trailingSlash: true,
};

export default nextConfig;
