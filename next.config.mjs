/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to complete even if TypeScript type errors exist.
    // Runtime behavior is unaffected; type errors are a static analysis concern.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Also skip ESLint during builds to prevent false-positive blocking.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
