import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project (a lockfile higher up the tree would otherwise win).
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return {
      // api.vythea.com serves the gateway at /v1/..., which lives under /api/v1/ in this app.
      beforeFiles: [
        {
          source: "/v1/:path*",
          has: [{ type: "host", value: "api.vythea.com" }],
          destination: "/api/v1/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
