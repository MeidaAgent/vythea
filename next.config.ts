import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project (a lockfile higher up the tree would otherwise win).
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    // The app sends people to /dashboard/checkout to add credit; here that is the Billing page.
    return [{ source: "/dashboard/checkout", destination: "/dashboard/billing", permanent: false }];
  },
  async rewrites() {
    return {
      // api.vythea.com serves the whole API (/v1/..., /me, /devices/...), which lives under /api/ in this app.
      beforeFiles: [
        // cloud.vythea.com is the Cloud API the app talks to: /v1/runs ... lives under /api/cloud/v1/.
        {
          source: "/v1/:path*",
          has: [{ type: "host", value: "cloud.vythea.com" }],
          destination: "/api/cloud/v1/:path*",
        },
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
