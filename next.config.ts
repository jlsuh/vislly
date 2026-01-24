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
  env: {
    NEXT_PUBLIC_LAST_DEPLOY_DATE: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }),
  },
};

export default nextConfig;
