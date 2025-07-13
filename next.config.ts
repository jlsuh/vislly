import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  reactProductionProfiling: true,
};

export default nextConfig;
