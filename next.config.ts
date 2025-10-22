import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/vislly',
  distDir: '/out/vislly',
  images: {
    unoptimized: true,
  },
  output: 'export',
  reactCompiler: true,
  reactProductionProfiling: true,
  trailingSlash: true,
};

export default nextConfig;
