import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure fast build and optimal image handling
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

