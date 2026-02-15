import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/vislly',
  distDir: '/out/vislly',
  env: {
    NEXT_PUBLIC_LAST_DEPLOY_DATE: new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      month: 'long',
      timeZoneName: 'short',
      year: 'numeric',
    }),
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  reactCompiler: true,
  reactProductionProfiling: true,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
