import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-sleepyhug-prod.b-cdn.net',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'iba-consulting-prod.b-cdn.net',
        pathname: '/gj-logos/**',
      },
    ],
  },
};

export default nextConfig;

