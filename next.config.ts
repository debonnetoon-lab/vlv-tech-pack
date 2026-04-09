import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Re-enable linting checks for production
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Re-enable TypeScript checks for production
    ignoreBuildErrors: false,
  },
  experimental: {
    // Cleanup turbopack config to fix the unrecognized key warning
  },
};

export default nextConfig;
