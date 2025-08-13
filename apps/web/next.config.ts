import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@survey-platform/shared'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
