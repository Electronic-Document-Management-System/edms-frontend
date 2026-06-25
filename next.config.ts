import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://edms-backend-six.vercel.app/api/v1/tenant/:path*',
      },
    ];
  },
};

export default nextConfig;
