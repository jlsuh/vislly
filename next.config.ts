import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/vislly',
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: false,
};

export default nextConfig;
