import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    agentUpgrade: "security",
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
