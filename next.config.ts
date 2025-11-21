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
      {
        protocol: 'https',
        hostname: 'iba-consulting-prod.b-cdn.net',
        pathname: '/Logos/**',
      },
    ],
  },
  // Increase body size limit for file uploads (helps with AWS Lambda/API Gateway)
  // Note: For large files (>2MB), presigned URLs are used which bypass this limit
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

