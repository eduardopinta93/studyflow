import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.bu.edu' },
      { protocol: 'https', hostname: 'majorsdata.arizona.edu' },
    ],
  },
};

export default nextConfig;
