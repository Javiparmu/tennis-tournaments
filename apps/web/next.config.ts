import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shared @courtrank/core package ships raw TypeScript source (consumed via
  // workspace symlink), so Next must transpile it like first-party code.
  transpilePackages: ["@courtrank/core"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
