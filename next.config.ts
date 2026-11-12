import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project (a lockfile higher up the tree would otherwise win).
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
