import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pdfkit'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // pdfkit is server-only — prevent webpack from trying to bundle it for the browser
      config.resolve.fallback = { ...config.resolve.fallback, pdfkit: false }
    }
    return config
  },
};

export default nextConfig;
