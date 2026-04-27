import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview domains
  allowedDevOrigins: [
    'localhost',
    '.space.z.ai',
    '.z.ai',
    '192.168.0.0',
    '192.168.0.0/16',
  ],
};

export default nextConfig;
