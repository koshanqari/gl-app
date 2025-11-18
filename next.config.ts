import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-sleepyhug-prod.b-cdn.net',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;

