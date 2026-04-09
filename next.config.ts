import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error type missing in NextConfig
    turbopack: {
      root: "./",
    },
  },
};

export default nextConfig;
