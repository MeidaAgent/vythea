import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project (a lockfile higher up the tree would otherwise win).
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return {
      // api.vythea.com serves the whole API (/v1/..., /me, /devices/...), which lives under /api/ in this app.
      beforeFiles: [
        {
          source: "/:path((?!api/).*)",
          has: [{ type: "host", value: "api.vythea.com" }],
          destination: "/api/:path",
        },
      ],
    };
  },
};

export default nextConfig;
