import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The services page became the prices page.
      { source: "/services", destination: "/prices", permanent: true },
    ];
  },
};

export default nextConfig;
