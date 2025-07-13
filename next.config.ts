import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/vislly',
  images: {
    unoptimized: true,
  },
  output: 'export',
  reactProductionProfiling: true,
};

export default nextConfig;
